# System Architecture & Technical Specification

## Smart Health & Supply Chain Resilience Platform

**Tagline:** *"Predict shortages. Move resources faster. Strengthen healthcare resilience."*

---

## 1. Executive Architecture Overview

The Smart Health & Supply Chain Resilience Platform is an end-to-end operational intelligence system designed for India's Primary Health Centres (PHCs). It bridges the operational divide between localized healthcare facilities and district/state medical operations headquarters.

```
PHC DATA (Stock, Beds, Staff, Weather, Disease)
              ↓
      AI FORECASTING (Bayesian ARIMA)
              ↓
      STOCK-OUT RISK DETECTION
              ↓
      MAP ALERT & HEATMAP TRIAGE
              ↓
  REDISTRIBUTION RECOMMENDATION (Haversine Pairing)
              ↓
  GEMINI 5-POINT ACTION BRIEF
              ↓
      OFFICER DECISION & DISPATCH
              ↓
  FEDERATED MODEL SYNCHRONIZATION (FedAvg)
```

---

## 2. Component Architecture

### 2.1 Frontend Tier (`frontend/`)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS with custom cyber tokens (`#030712` deep navy, `#00F2FE` cyan, `#10B981` emerald, `#F59E0B` amber, `#EF4444` rose)
- **Geospatial Visualization:** Leaflet & CartoDB Dark Matter with vector SVG glowing markers, route polylines, and weather risk radiuses
- **3D Network Visualization:** HTML5 Canvas interactive matrix with glowing nodes, particle flow, and real-time telemetry pulses
- **Charts:** Recharts (historical consumption, forecast trajectories, 95% confidence intervals)
- **Voice Interface:** Web Speech API (STT & TTS) supporting English, Hindi (`hi-IN`), and Odia (`or-IN`)
- **Real-Time Layer:** WebSocket client connected to `/api/ws` with live cascade event listeners

### 2.2 Backend Tier (`backend/`)
- **Framework:** Python FastAPI with asynchronous request pipelines
- **WebSocket Gateway:** Real-time event broadcasting for alerts, simulation steps, and mutual-aid actions
- **AI / Forecasting Engine:**
  - Ensemble Seasonal ARIMA with environmental covariates (relative humidity, temperature anomalies, rainfall catchment indices)
  - Demand elasticity multipliers up to 1.8x during emergency simulations
- **Action Brief Generator:** Google Gemini 1.5 Flash API integration with structured 5-point operational schema and deterministic fallback
- **Conversational Assistant:** Tool-calling architecture (`get_phc_status`, `get_inventory`, `get_forecast`, `get_alerts`, `find_surplus_stock`, `generate_action_brief`) supporting Hindi, Odia, and English

### 2.3 Database & State Tier (`database/`)
- **Schema & Persistence:** Firebase Admin SDK / Firestore compatible data model with in-memory thread-safe state container
- **Synthetic Registry:** 35+ realistic Primary Health Centres across 4 states (Odisha, West Bengal, Jharkhand, Andhra Pradesh) with realistic latitude/longitude, populations, beds, and staff
- **Formulary:** 12 essential medicines cataloged under the National List of Essential Medicines (NLEM)

### 2.4 Federated Learning Tier (`ai/federated_learning/`)
- **Protocol:** Federated Averaging (FedAvg) with differential privacy noise ($\epsilon=1.2$)
- **Privacy Guarantee:** "RAW DATA STAYS LOCAL, ONLY MODEL UPDATES ARE SHARED"
- **Nodes:**
  1. Odisha State Health Node
  2. West Bengal & Eastern Corridor Node
  3. BRICS Resilient Health Framework Node

---

## 3. Data Models & Schemas

### 3.1 Primary Collections
- `phcs`: Geospatial identity, bed capacity, beds occupied, staff present, risk level, predicted shortage days, weather signal, disease signal
- `medicines`: Formulary definitions, unit costs, critical threshold days
- `inventory`: Stock level per PHC/medicine pair, daily usage velocity, days remaining, expiry date, batch number
- `alerts`: Severity (`CRITICAL`, `WARNING`, `INFO`), message, days remaining, recommended action, status
- `redistribution_recommendations`: Origin donor, destination target, quantity, distance (km), ETA (hrs), highway coordinates, approval state
- `simulation_state`: Active status, scenario, intensity, affected facilities, demand multiplier, timeline phase
- `federated_nodes`: Local sample sizes, current round, local loss, local accuracy, synchronization state
