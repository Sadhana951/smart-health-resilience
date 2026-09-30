from fastapi import APIRouter
from typing import Dict, Any
from ..database.state import state_manager

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics")
def get_dashboard_metrics() -> Dict[str, Any]:
    phcs = list(state_manager.phcs.values())
    inventory = list(state_manager.inventory.values())
    alerts = list(state_manager.alerts.values())

    total_phcs = len(phcs)
    critical_phcs = len([p for p in phcs if p["risk_level"] == "CRITICAL"])
    watch_phcs = len([p for p in phcs if p["risk_level"] == "WATCH"])
    safe_phcs = len([p for p in phcs if p["risk_level"] == "SAFE"])

    active_alerts = len([a for a in alerts if a["status"] == "ACTIVE"])
    critical_alerts = len([a for a in alerts if a["status"] == "ACTIVE" and a["severity"] == "CRITICAL"])

    medicines_at_risk = len(set(i["medicine_id"] for i in inventory if i["risk_level"] == "CRITICAL"))

    total_beds = sum(p["bed_capacity"] for p in phcs)
    occupied_beds = sum(p["beds_occupied"] for p in phcs)
    available_beds = max(0, total_beds - occupied_beds)

    total_staff = sum(p["staff_total"] for p in phcs)
    present_staff = sum(p["staff_present"] for p in phcs)
    staff_attendance_pct = round((present_staff / total_staff * 100) if total_staff else 0, 1)

    # Top critical actions list
    critical_actions = []
    # 1. Critical shortage at Cuttack Rural
    critical_actions.append({
        "type": "CRITICAL",
        "medicine": "Paracetamol 500mg",
        "phc": "PHC Cuttack Rural (Salipur)",
        "message": "Runs out in 4 days (Surge in febrile caseload)",
        "action": "Redistribute 1,500 units from Bhubaneswar North",
        "link": "/redistribution"
    })
    # 2. Warning at Banki Flood-Prone
    critical_actions.append({
        "type": "WARNING",
        "medicine": "IV Normal Saline 500ml",
        "phc": "PHC Banki Flood-Prone",
        "message": "Demand +45% (High river catchment level)",
        "action": "Dispatch 250 bottles from Choudwar Industrial",
        "link": "/redistribution"
    })
    # 3. Info surplus at Bhubaneswar North
    critical_actions.append({
        "type": "INFO",
        "medicine": "Multiple Reserves",
        "phc": "PHC Bhubaneswar North (Chandaka)",
        "message": "3,500 surplus units available for mutual aid",
        "action": "Designated primary regional response buffer",
        "link": "/inventory"
    })

    return {
        "status": "success",
        "is_synthetic_demo": True,
        "metrics": {
            "total_phcs": total_phcs,
            "critical_phcs": critical_phcs,
            "watch_phcs": watch_phcs,
            "safe_phcs": safe_phcs,
            "active_alerts": active_alerts,
            "critical_alerts": critical_alerts,
            "medicines_at_risk": medicines_at_risk,
            "total_beds": total_beds,
            "occupied_beds": occupied_beds,
            "available_beds": available_beds,
            "bed_occupancy_pct": round((occupied_beds / total_beds * 100) if total_beds else 0, 1),
            "total_staff": total_staff,
            "present_staff": present_staff,
            "staff_attendance_pct": staff_attendance_pct,
            "stock_visibility_pct": 94.6,
            "demand_forecast_window_days": 7
        },
        "critical_actions": critical_actions,
        "simulation": state_manager.simulation_state
    }
