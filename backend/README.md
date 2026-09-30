# Smart Health Resilience - Backend API & AI Engine

High-performance Python FastAPI service providing real-time data streaming, AI demand forecasting, Gemini action brief synthesis, and emergency simulation.

## Core Services
- **REST APIs (`app/api/`):** Dashboard metrics, PHC geospatial telemetry, inventory registry, demand forecasting, alert triage, inter-facility redistribution, conversational assistant, and disaster simulation.
- **WebSocket Gateway (`app/main.py`):** Real-time broadcast channel (`/api/ws`) for instant alert and simulation dispatches.
- **AI Forecasting Engine (`app/ai/forecasting.py`):** Bayesian ARIMA with weather/disease covariates and 95% confidence intervals.
- **Gemini Action Briefs (`app/ai/action_brief.py`):** Generates structured 5-point operational plans for medical officers.
- **State Container (`app/database/state.py`):** Thread-safe reactive state manager with 35+ realistic PHCs and 12 essential medicines.

## Running Locally
```bash
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python -m uvicorn app.main:app --port 8000 --reload
```
Runs at `http://localhost:8000`. API documentation at `http://localhost:8000/docs`.
