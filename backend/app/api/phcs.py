from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from ..database.state import state_manager

router = APIRouter(prefix="/phcs", tags=["PHCs"])

@router.get("")
def list_phcs(
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    risk: Optional[str] = Query(None)
) -> List[Dict[str, Any]]:
    return state_manager.get_all_phcs(district=district, state=state, risk=risk)

@router.get("/{phc_id}")
def get_phc_detail(phc_id: str) -> Dict[str, Any]:
    phc = state_manager.get_phc_by_id(phc_id)
    if not phc:
        raise HTTPException(status_code=404, detail="PHC not found")
    
    # Attach phc specific inventory
    inventory = [i for i in state_manager.inventory.values() if i["phc_id"] == phc_id]
    alerts = [a for a in state_manager.alerts.values() if a["phc_id"] == phc_id and a["status"] == "ACTIVE"]

    # Generate quick AI summary for this specific PHC
    critical_meds = [i["medicine_name"] for i in inventory if i["risk_level"] == "CRITICAL"]
    watch_meds = [i["medicine_name"] for i in inventory if i["risk_level"] == "WATCH"]

    if critical_meds:
        ai_summary = (
            f"HIGH OPERATIONAL RISK: Immediate stock-out vulnerability detected in {', '.join(critical_meds[:2])}. "
            f"Bed occupancy is at {round(phc['beds_occupied']/phc['bed_capacity']*100)}%. "
            f"Weather advisory: {phc['weather_signal']}. Inter-facility redistribution is actively recommended."
        )
    elif watch_meds:
        ai_summary = (
            f"MODERATE SURVEILLANCE: Inventory buffer healthy for most categories, but {', '.join(watch_meds[:2])} "
            f"require replenishment within 6-8 days. Staff attendance is stable at {phc['staff_present']}/{phc['staff_total']} personnel."
        )
    else:
        ai_summary = (
            f"OPTIMAL STABILITY: All 12 essential medicines maintain >15 days operational reserve. "
            f"Facility is qualified as a regional donor hub for mutual-aid assistance if neighboring clusters surge."
        )

    return {
        "phc": phc,
        "inventory": inventory,
        "alerts": alerts,
        "ai_summary": ai_summary,
        "is_synthetic_demo": True
    }
