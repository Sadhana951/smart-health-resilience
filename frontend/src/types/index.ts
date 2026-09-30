export type RiskLevel = 'SAFE' | 'WATCH' | 'CRITICAL';
export type SeverityLevel = 'CRITICAL' | 'WARNING' | 'INFO';
export type UserRole = 'ADMIN' | 'STATE_OFFICER' | 'DISTRICT_OFFICER' | 'PHC_WORKER';
export type Language = 'en' | 'hi' | 'or';

export interface Medicine {
  id: string;
  name: string;
  category: string;
  unit: string;
  unit_cost_inr: number;
  critical_threshold_days: number;
  description: string;
}

export interface PHC {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  population_served: number;
  bed_capacity: number;
  beds_occupied: number;
  staff_total: number;
  staff_present: number;
  risk_level: RiskLevel;
  predicted_shortage_days: number | null;
  weather_signal: string;
  disease_signal: string;
  last_updated: string;
  contact_phone: string;
}

export interface InventoryItem {
  id: string;
  phc_id: string;
  phc_name: string;
  district: string;
  state: string;
  medicine_id: string;
  medicine_name: string;
  current_stock: number;
  daily_usage: number;
  predicted_demand_7d: number;
  days_remaining: number;
  risk_level: RiskLevel;
  expiry_date: string;
  batch_no: string;
  reorder_quantity: number;
}

export interface Alert {
  id: string;
  phc_id: string;
  phc_name: string;
  district: string;
  state: string;
  medicine_id?: string;
  medicine_name?: string;
  severity: SeverityLevel;
  alert_type: string;
  message: string;
  days_remaining?: number;
  recommended_action: string;
  timestamp: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface RedistributionRecommendation {
  id: string;
  from_phc_id: string;
  from_phc_name: string;
  from_district: string;
  from_current_stock: number;
  to_phc_id: string;
  to_phc_name: string;
  to_district: string;
  to_current_stock: number;
  medicine_id: string;
  medicine_name: string;
  quantity: number;
  distance_km: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'REJECTED';
  reason: string;
  eta_hours: number;
  route_coordinates: [number, number][];
  created_at: string;
}

export interface ForecastPoint {
  day: number;
  date: string;
  demand: number;
  lower_ci: number;
  upper_ci: number;
  simulated_stock: number;
  is_forecast: boolean;
}

export interface ActionBrief {
  situation: string;
  risk: string;
  recommended_action: string;
  resource_impact: string;
  rationale: string;
  disclaimer: string;
  generated_at: string;
}

export interface SimulationState {
  is_active: boolean;
  scenario: string;
  intensity: number;
  elapsed_seconds: number;
  affected_phcs_count: number;
  demand_multiplier: number;
  weather_anomaly: string;
  timeline_step: string;
  last_updated: string;
}

export interface FederatedNode {
  node_id: string;
  name: string;
  region: string;
  samples_count: number;
  current_round: number;
  local_loss: number;
  accuracy_score: number;
  status: 'IDLE' | 'TRAINING' | 'AGGREGATING' | 'SYNCHRONIZED';
  last_sync: string;
}

export interface DashboardMetrics {
  total_phcs: number;
  critical_phcs: number;
  watch_phcs: number;
  safe_phcs: number;
  active_alerts: number;
  critical_alerts: number;
  medicines_at_risk: number;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  bed_occupancy_pct: number;
  total_staff: number;
  present_staff: number;
  staff_attendance_pct: number;
  stock_visibility_pct: number;
  demand_forecast_window_days: number;
}
