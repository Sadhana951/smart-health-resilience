# Deployment & Production Setup Guide

## Smart Health & Supply Chain Resilience Platform

---

## 1. Prerequisites

- **Node.js:** v18.0.0 or higher (v22+ recommended)
- **Python:** 3.10 to 3.14
- **Google Cloud / Firebase Project** (Optional, fallback enabled)
- **Google Gemini API Key** (Optional, fallback enabled)

---

## 2. Quick Local Start (Zero Setup Dependencies)

### Step 1: Clone & Navigate
```bash
cd smart-health-resilience
```

### Step 2: Configure Environment
Copy `.env.example` to root and frontend:
```bash
cp .env.example .env
cp .env.example frontend/.env
```

### Step 3: Run Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python -m uvicorn app.main:app --port 8000 --host 0.0.0.0 --reload
# Linux / macOS:
./venv/bin/pip install -r requirements.txt
./venv/bin/uvicorn app.main:app --port 8000 --host 0.0.0.0 --reload
```
*Backend runs on:* `http://localhost:8000`  
*Interactive Swagger docs:* `http://localhost:8000/docs`

### Step 4: Run Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 3. Production Deployment

### Docker Deployment
Create a `Dockerfile` or deploy backend on Cloud Run:
```bash
gcloud run deploy smart-health-backend \
  --source ./backend \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key
```

### Frontend Static Build
```bash
cd frontend
npm run build
# The dist/ directory is optimized and ready for Firebase Hosting or Cloudflare Pages:
npx firebase-tools deploy --only hosting
```

---

## 4. Google Maps & Gemini Activation

- **Google Gemini API:** Add `GEMINI_API_KEY=AIzaSy...` in `backend/.env`.
- **Google Maps Platform:** Add `VITE_GOOGLE_MAPS_API_KEY=AIzaSy...` in `frontend/.env`.
- **Firebase Authentication:** Add Firebase client credentials to `frontend/.env`.
