# CropResQ Inference Engine

CropResQ is a full-stack, containerized web application designed for multi-modal crop disease detection. Built as an engineering capstone deployment, this application utilizes a **3-model deep learning ensemble** to classify rice leaf diseases and provides an interactive, dark-mode user interface for real-time agricultural diagnostics.

## 🚀 Key Features

- **Ensemble Soft-Voting Architecture:** Combines predictions from three distinct neural networks (MobileNetV2, MaxViT, Swin Transformer) to maximize classification accuracy across six classes: Healthy, Bacterial Leaf Blight, Brown Spot, Leaf Blast, Leaf Scald, and Sheath Blight.

- **Modern React UI:** A sleek, responsive frontend built with React, Vite, and Tailwind CSS, featuring drag-and-drop image uploads and dynamic confidence visualization.

- **High-Performance Backend:** Asynchronous image processing and inference routing handled by FastAPI and Uvicorn.

- **LLM Advisory Integration:** Designed to interface with the Google Gemini API to generate real-time, context-aware agricultural remedies (configurable offline fallback included).

- **Frictionless Deployment:** Fully orchestrated with Docker Compose, isolating complex ML dependencies (TensorFlow/Keras vs. PyTorch) into a unified, reproducible environment.

## 🛠️ Technology Stack

### Frontend

- React 18 + Vite
- Tailwind CSS
- Axios
- Lucide React (Icons)

### Backend

- Python 3.11-slim
- FastAPI
- Uvicorn
- TensorFlow / Keras (MobileNetV2)
- PyTorch / Timm (MaxViT, Swin Transformer)
- Google Generative AI SDK (Gemini)

### Deployment & Infrastructure

- Docker
- Docker Compose
- Git

## 📁 Repository Structure

```text
cropresq-webapp/
├── frontend/                 # React UI application
│   ├── src/                  # React components and Tailwind styling
│   ├── Dockerfile            # Node.js container configuration
│   └── package.json          # Frontend dependencies
├── models/                   # ML Weights directory (Excluded via .gitignore)
├── app.py                    # FastAPI server and inference logic
├── docker-compose.yml        # Multi-container orchestration
├── Dockerfile                # Python 3.11 backend container configuration
└── requirements.txt          # Python dependencies
```

## ⚙️ Local Setup & Deployment

### 1. Prerequisites

Ensure the following tools are installed on your machine:

- [Docker](https://www.docker.com/products/docker-desktop/)
- Docker Compose
- Git

### 2. Clone the Repository

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/CrropResQ/cropresq-webapp.git
cd cropresq-webapp
```

### 3. Provision the Machine Learning Weights

Because standard Git repositories cannot host large binary files, the model weights are excluded via `.gitignore`.

Before running the application, you must manually place your trained weights into a `models/` directory in the project root.

**Steps:**

1. Create a folder named `models` in the root directory.
2. Add the following weight files exactly as named:

   - `best_mobilenetv2.keras`
   - `best_maxvit_rice_model.pth`
   - `best_swin_transformer.pth`

The resulting directory structure should look like this:

```text
cropresq-webapp/
└── models/
    ├── best_mobilenetv2.keras
    ├── best_maxvit_rice_model.pth
    └── best_swin_transformer.pth
```

### 4. Configure LLM API (Optional)

To enable the Gemini AI advisory feature:

1. Open `app.py`.
2. Locate the Gemini configuration block at the top of the file.
3. Uncomment the Gemini configuration code.
4. Insert your valid Google AI Studio API key (`AIza...` or `AQ...`).
5. Ensure the LLM logic in the `/api/predict` endpoint is also uncommented.

**Note:** The application includes a configurable offline fallback when the Gemini API is not enabled.

### 5. Boot the Application

Deploy the entire application stack (backend and frontend) using a single command:

```bash
docker compose up --build
```

This command builds the required Docker images and starts the application services.

### 6. Access the System

Once the containers are running, access the application through the following endpoints:

| Component | URL |
|---|---|
| Web Interface | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Documentation (Swagger UI) | http://localhost:8000/docs |

### 7. Shut Down the Application

To gracefully shut down the application, press:

```bash
Ctrl + C
```

in the terminal where Docker Compose is running.

---

**CropResQ Inference Engine**  
*An AI-powered approach to intelligent crop disease detection.*
