import io
import os
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import torch
import timm
from torchvision import transforms
import torch.nn.functional as F
import google.generativeai as genai

# --- 1. Configurations ---
# GEMINI_API_KEY = "AQ.Ab8RN6LMC6jKGoDC3gltAnk7dpgPnQf_4KBqsKDLg_pegwFopA"

# genai.configure(api_key=GEMINI_API_KEY)

# llm = genai.GenerativeModel('gemini-2.5-flash')

CLASSES = ["Bacterial Leaf Blight", "Brown Spot", "Healthy", "Leaf Blast", "Leaf Scald", "Sheath Blight"]
device = torch.device("cpu") 

# --- 2. Initialize FastAPI ---
app = FastAPI(title="CropResQ Inference Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. Load Models ---
print("Loading Models into Memory (This takes a few seconds)...")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

mobilenet_path = os.path.join(MODELS_DIR, "best_mobilenetv2.keras")
maxvit_path = os.path.join(MODELS_DIR, "best_maxvit_rice_model.pth")
swin_path = os.path.join(MODELS_DIR, "best_swin_transformer.pth")

if not os.path.exists(mobilenet_path):
    raise FileNotFoundError(f"Model file not found at: {mobilenet_path}")

mobilenet = tf.keras.models.load_model(mobilenet_path)

# Load MaxViT
maxvit = timm.create_model("maxvit_tiny_tf_224.in1k", pretrained=False, num_classes=6)
maxvit_ckpt = torch.load(maxvit_path, map_location=device, weights_only=False)
maxvit.load_state_dict(maxvit_ckpt["model_state_dict"] if "model_state_dict" in maxvit_ckpt else maxvit_ckpt)
maxvit.to(device).eval()

# Load Swin
swin = timm.create_model("swin_tiny_patch4_window7_224", pretrained=False, num_classes=6)
swin_ckpt = torch.load(swin_path, map_location=device, weights_only=False)
swin.load_state_dict(swin_ckpt["model_state_dict"] if "model_state_dict" in swin_ckpt else swin_ckpt)
swin.to(device).eval()

print("All models loaded successfully!")



# --- 4. Preprocessing Pipelines ---
pytorch_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def preprocess_for_keras(image: Image.Image):
    img = image.resize((224, 224))
    img_array = tf.keras.utils.img_to_array(img)
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    return np.expand_dims(img_array, axis=0)

def preprocess_for_pytorch(image: Image.Image):
    tensor = pytorch_transform(image)
    return tensor.unsqueeze(0).to(device)

# --- 5. Inference API Endpoint ---
@app.post("/api/predict")
async def predict_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # 1. Keras Inference
        keras_tensor = preprocess_for_keras(image)
        p_mobile = mobilenet.predict(keras_tensor, verbose=0)[0]


        # 2. PyTorch Inference
        pt_tensor = preprocess_for_pytorch(image)
        with torch.no_grad():
            p_maxvit = F.softmax(maxvit(pt_tensor), dim=1).cpu().numpy()[0]
            p_swin = F.softmax(swin(pt_tensor), dim=1).cpu().numpy()[0]

        # 3. Soft Voting Ensemble
        p_ensemble = (p_mobile + p_maxvit + p_swin) / 3.0
        predicted_idx = np.argmax(p_ensemble)
        predicted_class = CLASSES[predicted_idx]
        confidence = float(p_ensemble[predicted_idx] * 100)

        # 4. Generate LLM Advice (Temporarily Disabled)
        llm_advice = f"The ensemble model has detected {predicted_class} with {confidence:.2f}% confidence. (LLM advisory offline)."
        
        # if predicted_class != "Healthy":
        #     prompt = f"You are an agricultural expert. A farmer's rice crop has been diagnosed with {predicted_class}. In exactly two short sentences, explain what this is and suggest one immediate chemical or organic remedy."
        #     response = llm.generate_content(prompt)
        #     llm_advice = response.text.strip()

        return {
            "disease": predicted_class,
            "confidence": f"{confidence:.2f}%",
            "advice": llm_advice
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))