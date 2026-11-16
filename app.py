import io
import os
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import torch
from torchvision import transforms
import torch.nn.functional as F
import requests

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

CLASSES = ["Bacterial Leaf Blight", "Brown Spot", "Healthy", "Leaf Blast", "Leaf Scald", "Sheath Blight"]
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

LLM_ADVICE_CACHE = {}

app = FastAPI(title="CropResQ Inference Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mobilenet = tf.keras.models.load_model("weights/MN.keras")
vision_transformer = torch.load("weights/vit_rice_model.pth", map_location=device)
vision_transformer.eval()

pytorch_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def check_leaf_chromaticity(image: Image.Image, threshold=0.08):
    hsv_array = np.array(image.convert('HSV'))
    h, s, v = hsv_array[:,:,0], hsv_array[:,:,1], hsv_array[:,:,2]
    chlorophyll_mask = (h >= 35) & (h <= 110) & (s >= 45) & (v >= 40)
    return np.mean(chlorophyll_mask) >= threshold

@app.post("/api/predict")
async def predict_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type.")

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    if not check_leaf_chromaticity(image):
        raise HTTPException(
            status_code=400,
            detail="Spectral Chromaticity Analysis failed. No organic leaf signature detected."
        )

    keras_tensor = np.expand_dims(np.array(image.resize((224, 224)), dtype=np.float32), axis=0)
    p_mobile = mobilenet.predict(keras_tensor, verbose=0)[0]

    pt_tensor = pytorch_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        p_vit = F.softmax(vision_transformer(pt_tensor), dim=1).cpu().numpy()[0]

    combined_probs = (p_mobile + p_vit) / 2.0
    pred_idx = np.argmax(combined_probs)
    
    final_disease = CLASSES[pred_idx]
    final_conf = float(combined_probs[pred_idx] * 100)

    if final_conf < 60.0:
        raise HTTPException(status_code=400, detail="Confidence below valid classification threshold.")

    if final_disease in LLM_ADVICE_CACHE:
        advice = LLM_ADVICE_CACHE[final_disease]
    else:
        prompt = f"An AI diagnosed a rice leaf with {final_disease} ({final_conf:.1f}% confidence). Provide a concise, 3-sentence practical treatment plan."
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        response = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        
        advice = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        LLM_ADVICE_CACHE[final_disease] = advice

    return {
        "disease": final_disease,
        "confidence": final_conf,
        "advice": advice
    }