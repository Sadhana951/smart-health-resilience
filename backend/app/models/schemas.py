from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class MedicineItem(BaseModel):
    id: str
    name: str
    category: str
    unit: str
    unit_cost_inr: float
    critical_threshold_days: int = 5
    description: str

class PHC(BaseModel):
    id: str
    name: str
    state: str
    district: str
    lat: float
    lng: float
    population_served: int
    bed_capacity: int
    beds_occupied: int
    staff_total: int
    staff_present: int
    risk_level: str = "SAFE" # "SAFE", "WATCH", "CRITICAL"
    predicted_shortage_days: Optional[int] = None
    weather_signal: str = "Normal (31°C, 65% RH)"
    disease_signal: str = "Baseline seasonal activity"
    last_updated: str
    contact_phone: str = "+91 674 2390111"

class InventoryRecord(BaseModel):
    id: str
    phc_id: str
    phc_name: str
    district: str
    state: str
    medicine_id: str
    medicine_name: str
    current_stock: int
    daily_usage: int
    predicted_demand_7d: int
    days_remaining: int
    risk_level: str # "SAFE", "WATCH", "CRITICAL"
    expiry_date: str
    batch_no: str
    reorder_quantity: int

class Alert(BaseModel):
    id: str
    phc_id: str
    phc_name: str
    district: str
    state: str
    medicine_id: Optional[str] = None
    medicine_name: Optional[str] = None
    severity: str # "CRITICAL", "WARNING", "INFO"
    alert_type: str # "STOCKOUT_RISK", "BED_CAPACITY", "WEATHER_SURGE", "SURPLUS_STOCK"
    message: str
    days_remaining: Optional[int] = None
    recommended_action: str
    timestamp: str
    status: str = "ACTIVE" # "ACTIVE", "ACKNOWLEDGED", "RESOLVED"

class RedistributionRecommendation(BaseModel):
    id: str
    from_phc_id: str
    from_phc_name: str
    from_district: str
    from_current_stock: int
    to_phc_id: str
    to_phc_name: str
    to_district: str
    to_current_stock: int
    medicine_id: str
    medicine_name: str
    quantity: int
    distance_km: float
    priority: str # "HIGH", "MEDIUM", "LOW"
    status: str = "PENDING" # "PENDING", "ACCEPTED", "IN_TRANSIT", "COMPLETED", "REJECTED"
    reason: str
    eta_hours: float
    route_coordinates: List[List[float]] = []
    created_at: str

class ForecastPoint(BaseModel):
    day: int
    date: str
    demand: float
    lower_ci: float
    upper_ci: float
    simulated_stock: float
    is_forecast: bool

class ActionBriefRequest(BaseModel):
    phc_id: Optional[str] = None
    medicine_id: Optional[str] = None
    alert_id: Optional[str] = None
    scenario_context: Optional[str] = None

class ActionBrief(BaseModel):
    situation: str
    risk: str
    recommended_action: str
    resource_impact: str
    rationale: str
    disclaimer: str = "AI-GENERATED OPERATIONAL BRIEF — VERIFY BEFORE OPERATIONAL ACTION"
    generated_at: str

class SimulationTrigger(BaseModel):
    scenario: str = "Flood" # "Flood", "Dengue spike", "Heatwave", "Disease outbreak", "Medicine shortage"
    intensity: float = 1.0 # 0.5 to 2.0
    target_district: Optional[str] = "Cuttack"

class SimulationState(BaseModel):
    is_active: bool
    scenario: str
    intensity: float
    elapsed_seconds: int
    affected_phcs_count: int
    demand_multiplier: float
    weather_anomaly: str
    timeline_step: str # "EVENT DETECTED", "DEMAND SPIKE", "PHCs AT RISK", "SHORTAGE FORECAST", "TRANSFER RECOMMENDED", "OFFICER ACTION"
    last_updated: str

class FederatedNodeStatus(BaseModel):
    node_id: str
    name: str
    region: str
    samples_count: int
    current_round: int
    local_loss: float
    accuracy_score: float
    status: str # "IDLE", "TRAINING", "AGGREGATING", "SYNCHRONIZED"
    last_sync: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []
    language: str = "en" # "en", "hi", "or"

class ChatResponse(BaseModel):
    reply: str
    tool_executed: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    language: str = "en"
