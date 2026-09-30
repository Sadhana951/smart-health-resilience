# API Reference Specification

## Smart Health & Supply Chain Resilience Platform

**Base URL:** `http://localhost:8000/api`

---

## 1. Overview Endpoints

### `GET /dashboard/metrics`
Returns aggregate network metrics, top critical actions, and simulation state.

**Response:**
```json
{
  "status": "success",
  "is_synthetic_demo": true,
  "metrics": {
    "total_phcs": 35,
    "critical_phcs": 2,
    "watch_phcs": 18,
    "safe_phcs": 15,
    "active_alerts": 5,
    "critical_alerts": 2,
    "medicines_at_risk": 2,
    "total_beds": 753,
    "occupied_beds": 414,
    "available_beds": 339,
    "bed_occupancy_pct": 55.0,
    "total_staff": 392,
    "present_staff": 336,
    "staff_attendance_pct": 85.7,
    "stock_visibility_pct": 94.6,
    "demand_forecast_window_days": 7
  },
  "critical_actions": [...],
  "simulation": {...}
}
```

---

## 2. PHC Geospatial Endpoints

### `GET /phcs`
Lists monitored Primary Health Centres with optional filters.
- `state` (optional string): e.g. "Odisha"
- `district` (optional string): e.g. "Cuttack"
- `risk` (optional string): "CRITICAL" | "WATCH" | "SAFE"

### `GET /phcs/{id}`
Returns detailed profile for a specific PHC including full 12-medicine inventory, bed occupancy, staff roster, and AI summary.

---

## 3. Inventory Endpoints

### `GET /inventory`
Returns inventory items across facilities with filter parameters:
- `medicine_id` (optional string): e.g. "med-1"
- `phc_id` (optional string): e.g. "phc-od-01"
- `risk` (optional string): "CRITICAL" | "WATCH" | "SAFE"

### `GET /inventory/medicines`
Returns the 12-medicine formulary catalog.

---

## 4. Forecasting Endpoints

### `GET /forecasts`
Returns network-wide aggregate 14-day demand forecast.

### `GET /forecasts/{phc_id}?medicine_id={med}&days={7|14|30}`
Returns facility and medicine-specific forecast data points with 95% confidence intervals and simulated stock depletion curve.

---

## 5. Alert Endpoints

### `GET /alerts`
Returns real-time triage alerts filtered by `severity` and `status`.

### `PUT /alerts/{id}/resolve`
Marks an alert as resolved.

---

## 6. Redistribution Endpoints

### `GET /redistribution`
Lists inter-facility mutual-aid recommendations.

### `POST /redistribution/recommend`
Computes optimal nearest surplus facility for a given shortage node using Haversine formula and minimum reserve thresholds.
**Body:**
```json
{
  "to_phc_id": "phc-od-01",
  "medicine_id": "med-1"
}
```

### `POST /redistribution/{id}/accept`
Approves and commits a redistribution recommendation, adjusts stock levels in donor and recipient facilities, resolves linked alerts, and returns dispatch tracking timeline.

### `POST /redistribution/{id}/reject`
Rejects a recommendation.

---

## 7. AI & Voice Endpoints

### `POST /assistant/chat`
Invokes the tool-assisted HealthResilience AI conversational engine.
**Body:**
```json
{
  "message": "What medicines are at risk this week?",
  "language": "en"
}
```

### `POST /action-brief`
Generates a structured 5-point Gemini Action Brief.
**Body:**
```json
{
  "phc_id": "phc-od-01",
  "medicine_id": "med-1"
}
```

### `POST /voice/transcribe`
Speech-to-Text validation and language identification.

### `POST /voice/speak`
Text-to-Speech synthesis parameters.

---

## 8. Emergency Simulation Endpoints

### `GET /simulation/status`
Returns live simulation status and cascade progress.

### `POST /simulation/start`
Triggers simulated disaster or disease spike scenario.
**Body:**
```json
{
  "scenario": "Flood",
  "intensity": 1.2,
  "target_district": "Cuttack"
}
```

### `POST /simulation/stop`
Restores network to baseline operational state.

---

## 9. Federated Learning Endpoints

### `GET /federated/status`
Returns status of 3 consortium nodes, global loss, and accuracy metrics.

### `POST /federated/train-round`
Simulates a distributed training round with local gradient calculation and central FedAvg aggregation.
