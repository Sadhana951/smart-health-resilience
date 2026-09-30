from typing import Dict, List, Any, Optional
import json
import asyncio
from datetime import datetime, timedelta
import copy
from .seed_data import generate_initial_state

class SystemStateManager:
    """
    Central thread-safe state container for PHCs, Inventory, Alerts,
    Redistribution, and Emergency Simulation. Supports real-time WebSocket dispatches.
    """
    def __init__(self):
        self._initial = generate_initial_state()
        self.phcs: Dict[str, Dict[str, Any]] = {p["id"]: p for p in self._initial["phcs"]}
        self.medicines: Dict[str, Dict[str, Any]] = {m["id"]: m for m in self._initial["medicines"]}
        self.inventory: Dict[str, Dict[str, Any]] = {i["id"]: i for i in self._initial["inventory"]}
        self.alerts: Dict[str, Dict[str, Any]] = {a["id"]: a for a in self._initial["alerts"]}
        self.redistributions: Dict[str, Dict[str, Any]] = {r["id"]: r for r in self._initial["redistributions"]}
        
        self.simulation_state: Dict[str, Any] = {
            "is_active": False,
            "scenario": "None",
            "intensity": 1.0,
            "elapsed_seconds": 0,
            "affected_phcs_count": 0,
            "demand_multiplier": 1.0,
            "weather_anomaly": "Seasonal baseline",
            "timeline_step": "OFFICER ACTION",
            "last_updated": datetime.now().isoformat()
        }

        self.federated_nodes: Dict[str, Dict[str, Any]] = {
            "node-odisha": {
                "node_id": "node-odisha",
                "name": "Odisha State Health Node",
                "region": "Eastern India",
                "samples_count": 142800,
                "current_round": 12,
                "local_loss": 0.0412,
                "accuracy_score": 0.948,
                "status": "SYNCHRONIZED",
                "last_sync": datetime.now().isoformat()
            },
            "node-state-b": {
                "node_id": "node-state-b",
                "name": "West Bengal & Eastern Corridor Node",
                "region": "Delta & Estuary",
                "samples_count": 198400,
                "current_round": 12,
                "local_loss": 0.0489,
                "accuracy_score": 0.932,
                "status": "SYNCHRONIZED",
                "last_sync": datetime.now().isoformat()
            },
            "node-brics": {
                "node_id": "node-brics",
                "name": "BRICS Resilient Health Framework Node",
                "region": "Global South Partner",
                "samples_count": 310500,
                "current_round": 12,
                "local_loss": 0.0521,
                "accuracy_score": 0.925,
                "status": "SYNCHRONIZED",
                "last_sync": datetime.now().isoformat()
            }
        }

        self.subscribers: List[asyncio.Queue] = []

    def get_all_phcs(self, district: Optional[str] = None, state: Optional[str] = None, risk: Optional[str] = None) -> List[Dict[str, Any]]:
        results = list(self.phcs.values())
        if district:
            results = [p for p in results if p["district"].lower() == district.lower()]
        if state:
            results = [p for p in results if p["state"].lower() == state.lower()]
        if risk:
            results = [p for p in results if p["risk_level"].upper() == risk.upper()]
        return results

    def get_phc_by_id(self, phc_id: str) -> Optional[Dict[str, Any]]:
        return self.phcs.get(phc_id)

    def get_all_inventory(self, medicine_id: Optional[str] = None, phc_id: Optional[str] = None, risk: Optional[str] = None) -> List[Dict[str, Any]]:
        results = list(self.inventory.values())
        if medicine_id:
            results = [i for i in results if i["medicine_id"] == medicine_id]
        if phc_id:
            results = [i for i in results if i["phc_id"] == phc_id]
        if risk:
            results = [i for i in results if i["risk_level"].upper() == risk.upper()]
        return results

    def get_alerts(self, severity: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        results = sorted(list(self.alerts.values()), key=lambda x: x["timestamp"], reverse=True)
        if severity:
            results = [a for a in results if a["severity"].upper() == severity.upper()]
        if status:
            results = [a for a in results if a["status"].upper() == status.upper()]
        return results

    def get_redistributions(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        results = sorted(list(self.redistributions.values()), key=lambda x: x["created_at"], reverse=True)
        if status:
            results = [r for r in results if r["status"].upper() == status.upper()]
        return results

    def accept_redistribution(self, rec_id: str) -> Optional[Dict[str, Any]]:
        rec = self.redistributions.get(rec_id)
        if not rec:
            return None
        rec["status"] = "ACCEPTED"

        # Apply inventory movement
        from_inv_id = f"inv-{rec['from_phc_id']}-{rec['medicine_id']}"
        to_inv_id = f"inv-{rec['to_phc_id']}-{rec['medicine_id']}"

        qty = rec["quantity"]

        if from_inv_id in self.inventory:
            self.inventory[from_inv_id]["current_stock"] = max(0, self.inventory[from_inv_id]["current_stock"] - qty)
            daily = max(1, self.inventory[from_inv_id]["daily_usage"])
            self.inventory[from_inv_id]["days_remaining"] = self.inventory[from_inv_id]["current_stock"] // daily

        if to_inv_id in self.inventory:
            self.inventory[to_inv_id]["current_stock"] += qty
            daily = max(1, self.inventory[to_inv_id]["daily_usage"])
            self.inventory[to_inv_id]["days_remaining"] = self.inventory[to_inv_id]["current_stock"] // daily
            if self.inventory[to_inv_id]["days_remaining"] > 5:
                self.inventory[to_inv_id]["risk_level"] = "SAFE"
            elif self.inventory[to_inv_id]["days_remaining"] > 3:
                self.inventory[to_inv_id]["risk_level"] = "WATCH"

        # Recalculate target PHC overall risk
        target_phc = self.phcs.get(rec["to_phc_id"])
        if target_phc:
            phc_items = [i for i in self.inventory.values() if i["phc_id"] == rec["to_phc_id"]]
            min_days = min((i["days_remaining"] for i in phc_items), default=15)
            target_phc["predicted_shortage_days"] = min_days
            target_phc["risk_level"] = "CRITICAL" if min_days <= 5 else ("WATCH" if min_days <= 10 else "SAFE")

        # Resolve related active alerts
        for a in self.alerts.values():
            if a["phc_id"] == rec["to_phc_id"] and a.get("medicine_id") == rec["medicine_id"]:
                a["status"] = "RESOLVED"

        self.broadcast_event("REDISTRIBUTION_ACCEPTED", rec)
        return rec

    def reject_redistribution(self, rec_id: str) -> Optional[Dict[str, Any]]:
        rec = self.redistributions.get(rec_id)
        if not rec:
            return None
        rec["status"] = "REJECTED"
        self.broadcast_event("REDISTRIBUTION_REJECTED", rec)
        return rec

    def reset_state(self):
        """Resets to initial seed data state."""
        self._initial = generate_initial_state()
        self.phcs = {p["id"]: p for p in self._initial["phcs"]}
        self.inventory = {i["id"]: i for i in self._initial["inventory"]}
        self.alerts = {a["id"]: a for a in self._initial["alerts"]}
        self.redistributions = {r["id"]: r for r in self._initial["redistributions"]}
        self.simulation_state["is_active"] = False
        self.simulation_state["scenario"] = "None"
        self.simulation_state["intensity"] = 1.0
        self.simulation_state["timeline_step"] = "OFFICER ACTION"
        self.broadcast_event("STATE_RESET", {})

    def trigger_emergency_simulation(self, scenario: str, intensity: float = 1.0, target_district: str = "Cuttack") -> Dict[str, Any]:
        """
        Executes a synchronized emergency cascade across the network.
        Affects target cluster PHCs, multiplies demand, generates critical alerts,
        and computes AI redistribution recommendations.
        """
        self.simulation_state["is_active"] = True
        self.simulation_state["scenario"] = scenario
        self.simulation_state["intensity"] = intensity
        self.simulation_state["timeline_step"] = "EVENT DETECTED"
        self.simulation_state["last_updated"] = datetime.now().isoformat()

        multiplier = 1.0 + (0.8 * intensity)
        self.simulation_state["demand_multiplier"] = round(multiplier, 2)

        if scenario == "Flood":
            self.simulation_state["weather_anomaly"] = "Mahanadi Basin Inundation & Severe Waterlogging (Category 4 Flood Alert)"
            target_medicines = ["med-2", "med-8", "med-1", "med-3"] # ORS, Saline, Paracetamol, Amoxicillin
        elif scenario == "Dengue spike":
            self.simulation_state["weather_anomaly"] = "High Vector Proliferation Conditions (34°C, 88% Humidity)"
            target_medicines = ["med-1", "med-8", "med-9"] # Paracetamol, IV Fluids, Zinc
        elif scenario == "Heatwave":
            self.simulation_state["weather_anomaly"] = "Severe Heatwave Warning (44.8°C Extreme Ambient)"
            target_medicines = ["med-2", "med-8", "med-6"] # ORS, Saline, Insulin stability
        elif scenario == "Disease outbreak":
            self.simulation_state["weather_anomaly"] = "Acute Enteric Cluster Outbreak in Riparian Zone"
            target_medicines = ["med-2", "med-3", "med-11", "med-9"]
        else: # Medicine shortage
            self.simulation_state["weather_anomaly"] = "National Supply Route Interruption / Bulk Drug Hold"
            target_medicines = ["med-1", "med-5", "med-6", "med-10"]

        affected_count = 0
        now = datetime.now()

        # Update PHCs in target district & coastal cluster
        for phc in self.phcs.values():
            if phc["district"].lower() == target_district.lower() or phc["state"] == "Odisha":
                affected_count += 1
                phc["beds_occupied"] = min(phc["bed_capacity"], int(phc["beds_occupied"] * 1.35))
                phc["weather_signal"] = self.simulation_state["weather_anomaly"]
                phc["disease_signal"] = f"Emergency {scenario} protocol active. Case load surge."
                phc["last_updated"] = now.isoformat()

                # Scale inventory consumption for target medicines
                for mid in target_medicines:
                    inv_id = f"inv-{phc['id']}-{mid}"
                    if inv_id in self.inventory:
                        item = self.inventory[inv_id]
                        item["daily_usage"] = int(item["daily_usage"] * multiplier)
                        item["current_stock"] = max(10, int(item["current_stock"] * 0.75))
                        item["days_remaining"] = max(1, item["current_stock"] // max(1, item["daily_usage"]))
                        item["predicted_demand_7d"] = item["daily_usage"] * 7
                        
                        if item["days_remaining"] <= 4:
                            item["risk_level"] = "CRITICAL"
                        elif item["days_remaining"] <= 8:
                            item["risk_level"] = "WATCH"

                # Recompute PHC risk level
                phc_items = [i for i in self.inventory.values() if i["phc_id"] == phc["id"]]
                min_days = min((i["days_remaining"] for i in phc_items), default=15)
                phc["predicted_shortage_days"] = min_days
                if min_days <= 4:
                    phc["risk_level"] = "CRITICAL"
                elif min_days <= 8:
                    phc["risk_level"] = "WATCH"

        self.simulation_state["affected_phcs_count"] = affected_count

        # Create immediate Emergency Alert
        emergency_alert_id = f"sim-alt-{int(now.timestamp())}"
        self.alerts[emergency_alert_id] = {
            "id": emergency_alert_id,
            "phc_id": "phc-od-01",
            "phc_name": "PHC Cuttack Rural (Salipur)",
            "district": target_district,
            "state": "Odisha",
            "medicine_id": target_medicines[0],
            "medicine_name": self.medicines[target_medicines[0]]["name"],
            "severity": "CRITICAL",
            "alert_type": "WEATHER_SURGE",
            "message": f"EMERGENCY SIMULATION ({scenario.upper()}): Demand spiked +{int((multiplier-1)*100)}%. Critical supplies will deplete within 48-72h.",
            "days_remaining": 2,
            "recommended_action": f"Mobilize emergency mutual-aid reserves immediately from Bhubaneswar North & Choudwar.",
            "timestamp": now.isoformat(),
            "status": "ACTIVE"
        }

        # Create targeted emergency redistribution recommendation
        sim_rec_id = f"sim-rec-{int(now.timestamp())}"
        self.redistributions[sim_rec_id] = {
            "id": sim_rec_id,
            "from_phc_id": "phc-od-02",
            "from_phc_name": "PHC Bhubaneswar North (Chandaka)",
            "from_district": "Khordha",
            "from_current_stock": 5500,
            "to_phc_id": "phc-od-01",
            "to_phc_name": "PHC Cuttack Rural (Salipur)",
            "to_district": target_district,
            "to_current_stock": 420,
            "medicine_id": target_medicines[0],
            "medicine_name": self.medicines[target_medicines[0]]["name"],
            "quantity": 2000,
            "distance_km": 34.2,
            "priority": "HIGH",
            "status": "PENDING",
            "reason": f"Simulated {scenario} surge: Target depleted to 2 days stock. Source facility has 28 days surplus.",
            "eta_hours": 1.2,
            "route_coordinates": [
                [20.3588, 85.7622],
                [20.4000, 85.8400],
                [20.4820, 85.9230]
            ],
            "created_at": now.isoformat()
        }

        self.simulation_state["timeline_step"] = "TRANSFER RECOMMENDED"
        self.broadcast_event("SIMULATION_STARTED", self.simulation_state)
        return self.simulation_state

    def broadcast_event(self, event_type: str, data: Any):
        """Queues events to active WebSocket connections."""
        payload = json.dumps({"event": event_type, "data": data, "timestamp": datetime.now().isoformat()})
        for q in list(self.subscribers):
            try:
                q.put_nowait(payload)
            except Exception:
                pass

state_manager = SystemStateManager()
