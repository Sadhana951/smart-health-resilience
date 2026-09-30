import {
  PHC,
  InventoryItem,
  Alert,
  RedistributionRecommendation,
  DashboardMetrics,
  SimulationState,
  ActionBrief,
  FederatedNode
} from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Falling back for endpoint ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboardMetrics: async (): Promise<{ metrics: DashboardMetrics; critical_actions: any[]; simulation: SimulationState }> => {
    return fetchJson('/api/dashboard/metrics');
  },

  // PHCs
  getPHCs: async (params?: { district?: string; state?: string; risk?: string }): Promise<PHC[]> => {
    const query = new URLSearchParams();
    if (params?.district) query.set('district', params.district);
    if (params?.state) query.set('state', params.state);
    if (params?.risk) query.set('risk', params.risk);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`/api/phcs${qs}`);
  },

  getPHCById: async (id: string): Promise<{ phc: PHC; inventory: InventoryItem[]; alerts: Alert[]; ai_summary: string }> => {
    return fetchJson(`/api/phcs/${id}`);
  },

  // Inventory
  getInventory: async (params?: { medicine_id?: string; phc_id?: string; risk?: string; district?: string }): Promise<InventoryItem[]> => {
    const query = new URLSearchParams();
    if (params?.medicine_id) query.set('medicine_id', params.medicine_id);
    if (params?.phc_id) query.set('phc_id', params.phc_id);
    if (params?.risk) query.set('risk', params.risk);
    if (params?.district) query.set('district', params.district);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`/api/inventory${qs}`);
  },

  getMedicines: async (): Promise<any[]> => {
    return fetchJson('/api/inventory/medicines');
  },

  // Forecasts
  getForecastSummary: async (): Promise<any> => {
    return fetchJson('/api/forecasts');
  },

  getPHCForecast: async (phcId: string, medicineId: string = 'med-1', days: number = 14): Promise<any> => {
    return fetchJson(`/api/forecasts/${phcId}?medicine_id=${medicineId}&days=${days}`);
  },

  // Alerts
  getAlerts: async (severity?: string, status?: string): Promise<Alert[]> => {
    const query = new URLSearchParams();
    if (severity) query.set('severity', severity);
    if (status) query.set('status', status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`/api/alerts${qs}`);
  },

  createAlert: async (data: Partial<Alert>): Promise<Alert> => {
    return fetchJson('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  resolveAlert: async (alertId: string): Promise<Alert> => {
    return fetchJson(`/api/alerts/${alertId}/resolve`, {
      method: 'PUT'
    });
  },

  // Redistribution
  getRedistributions: async (status?: string): Promise<RedistributionRecommendation[]> => {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`/api/redistribution${qs}`);
  },

  recommendRedistribution: async (toPhcId: string, medicineId: string): Promise<RedistributionRecommendation> => {
    return fetchJson('/api/redistribution/recommend', {
      method: 'POST',
      body: JSON.stringify({ to_phc_id: toPhcId, medicine_id: medicineId })
    });
  },

  acceptRedistribution: async (recId: string): Promise<any> => {
    return fetchJson(`/api/redistribution/${recId}/accept`, {
      method: 'POST'
    });
  },

  rejectRedistribution: async (recId: string): Promise<any> => {
    return fetchJson(`/api/redistribution/${recId}/reject`, {
      method: 'POST'
    });
  },

  // Action Brief
  generateActionBrief: async (phcId?: string, medicineId?: string): Promise<ActionBrief> => {
    return fetchJson('/api/action-brief', {
      method: 'POST',
      body: JSON.stringify({ phc_id: phcId, medicine_id: medicineId })
    });
  },

  // Assistant & Voice
  chatAssistant: async (message: string, language: string = 'en'): Promise<{ reply: string; tool_executed?: string; structured_data?: any }> => {
    return fetchJson('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language })
    });
  },

  // Simulation
  getSimulationStatus: async (): Promise<SimulationState> => {
    return fetchJson('/api/simulation/status');
  },

  startSimulation: async (scenario: string, intensity: number = 1.0, targetDistrict: string = 'Cuttack'): Promise<any> => {
    return fetchJson('/api/simulation/start', {
      method: 'POST',
      body: JSON.stringify({ scenario, intensity, target_district: targetDistrict })
    });
  },

  stopSimulation: async (): Promise<any> => {
    return fetchJson('/api/simulation/stop', {
      method: 'POST'
    });
  },

  // Federated Learning
  getFederatedStatus: async (): Promise<{ nodes: FederatedNode[]; global_round: number; global_loss: number; global_accuracy: number }> => {
    return fetchJson('/api/federated/status');
  },

  runFederatedRound: async (): Promise<any> => {
    return fetchJson('/api/federated/train-round', {
      method: 'POST'
    });
  }
};
