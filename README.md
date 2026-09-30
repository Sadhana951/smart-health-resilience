# SMART HEALTH & SUPPLY CHAIN RESILIENCE PLATFORM

> **Tagline:** *"Predict shortages. Move resources faster. Strengthen healthcare resilience."*

An AI-powered healthcare supply-chain command platform designed for India's Primary Health Centres (PHCs).

Built for district and state medical officers to provide end-to-end operational visibility over **medicines**, **bed capacity**, **staff attendance**, **demand forecasting**, **stock-out risk**, **disaster simulations**, and **inter-facility redistribution corridors**.

---

## 🌟 Key Capabilities & Architectural Highlights

1. **Futuristic Command Center (`/dashboard`)**:
   - Live telemetry counters with animated numbers and real-time status pulses.
   - Interactive geospatial map preview and prioritized critical action feed.
2. **3D India Healthcare Network Hero**:
   - Stylized HTML5 Canvas 3D network with glowing PHC nodes, flowing data packets, and ambient telemetry.
3. **Geospatial PHC Network (`/phc-network` & `/phc/:id`)**:
   - 35+ Primary Health Centres across Odisha, West Bengal, Jharkhand, and Andhra Pradesh.
   - Multi-layer filters: Risk Heatmap, Transit Corridors, Weather Signals.
   - Facility deep-dive with bed occupancy, staff roster, 12 essential medicines, and demand forecasts.
4. **Demand Forecasting Engine (`/forecasts`)**:
   - Bayesian Seasonal ARIMA models projecting 7, 14, and 30-day consumption with 95% confidence intervals.
   - Incorporates live weather anomalies (monsoon rainfall, humidity) and outbreak signals.
5. **Early Warning Alert Center (`/alerts`)**:
   - Triage grouping: Critical, Warning, Strategic Surplus.
   - 1-click execution: [VIEW PHC], [VIEW TRANSFER], [GENERATE GEMINI ACTION BRIEF].
6. **Inter-Facility Redistribution Engine (`/redistribution`)**:
   - Algorithmic matching between shortage nodes and nearest surplus hubs using Haversine formulas.
   - Route plotting, unit volume recommendations, and live dispatch timeline with celebratory confetti confirmation.
7. **Gemini 5-Point Action Briefs**:
   - Structured operational intelligence: Situation, Risk, Recommended Action, Resource Impact, Rationale.
   - Embedded clinical safety guardrails.
8. **HealthResilience AI & Multilingual Voice (`/assistant` & Voice Modal)**:
   - Tool-assisted conversational assistant querying real synthetic state.
   - Native voice interaction supporting **English**, **हिन्दी (Hindi)**, and **ଓଡ଼ିଆ (Odia)**.
9. **Emergency Simulation Laboratory (`/simulation`)**:
   - Stress-test network resilience under Flood, Dengue Spike, Heatwave, Outbreak, and Medicine Embargoes.
   - Cascading 6-step interactive timeline with live casualty and demand multiplier mutations.
10. **Federated Learning Demonstration (`/federated-learning`)**:
    - Multi-node privacy-preserving architecture across Odisha, State B, and BRICS nodes.
    - Demonstrates: *"RAW DATA STAYS LOCAL, ONLY MODEL UPDATES ARE SHARED"*.

---

## 📁 Repository Structure

```
smart-health-resilience/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── animations/           # 3D Canvas India Healthcare Network
│   │   ├── components/           # GlassCard, MetricCard, RiskBadge, CommandPalette, Modals
│   │   ├── contexts/             # LanguageContext (EN/HI/OR), AuthContext, WebSocketContext
│   │   ├── maps/                 # Ola Krutrim Vector Maps & Leaflet resilient geospatial network
│   │   ├── pages/                # Landing, Dashboard, PHC Network, Inventory, Forecasts, etc.
│   │   ├── services/             # API client & WebSocket connector
│   │   ├── types/                # TypeScript models and schemas
│   │   └── voice/                # Multilingual Speech-to-Speech interface
│   ├── package.json
│   └── README.md
│
├── backend/                      # Python FastAPI server
│   ├── app/
│   │   ├── api/                  # REST endpoints (dashboard, phcs, inventory, simulation, etc.)
│   │   ├── ai/                   # Demand forecasting, Gemini integration, Action Brief generator
│   │   ├── database/             # State container & 35-PHC realistic synthetic seed data
│   │   ├── models/               # Pydantic data schemas
│   │   ├── config.py             # App settings & environment loader
│   │   └── main.py               # FastAPI entrypoint with WebSocket gateway
│   ├── requirements.txt
│   └── README.md
│
├── database/                     # Schemas and seed specifications
│   ├── seed/
│   └── README.md
│
├── ai/                           # AI models and federated learning
│   ├── forecasting/
│   ├── federated_learning/
│   └── datasets/
│
├── docs/                         # Technical documentation
│   ├── architecture.md           # System architecture & data flow
│   ├── api.md                    # REST & WebSocket API specification
│   └── deployment.md             # Production & Docker deployment guide
│
├── .env.example                  # Environment configuration template
└── README.md
```

---

## 🚀 Quick Start Instructions

### 1. Start Backend Server
```bash
cd smart-health-resilience/backend
python -m venv venv
# Windows:
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python -m uvicorn app.main:app --port 8000 --reload
# Linux / macOS:
./venv/bin/pip install -r requirements.txt
./venv/bin/uvicorn app.main:app --port 8000 --reload
```
API runs on `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 2. Start Frontend App
```bash
cd smart-health-resilience/frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔒 Security & AI Safety Note

- **AI Safety:** The operational intelligence assistant does **not** provide patient diagnoses or clinical prescriptions. It strictly assists in logistics, inventory levels, and resource planning.
- **Privacy:** In the federated learning framework, patient-level records never leave local PHC premises; only differential weight gradients are shared.
- **Data Notice:** All data utilized in the initial demo mode is **synthetic demonstration data** reflecting real-world geographical coordinates in India.
