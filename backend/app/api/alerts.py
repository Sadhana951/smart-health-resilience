from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..database.state import state_manager
from ..models.schemas import Alert

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
def list_alerts(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
) -> List[Dict[str, Any]]:
    return state_manager.get_alerts(severity=severity, status=status)

@router.post("")
def create_custom_alert(alert_data: Dict[str, Any]) -> Dict[str, Any]:
    new_id = f"alt-{int(datetime.now().timestamp())}"
    alert_obj = {
        "id": new_id,
        "phc_id": alert_data.get("phc_id", "phc-od-01"),
        "phc_name": alert_data.get("phc_name", "PHC Cuttack Rural (Salipur)"),
        "district": alert_data.get("district", "Cuttack"),
        "state": alert_data.get("state", "Odisha"),
        "medicine_id": alert_data.get("medicine_id"),
        "medicine_name": alert_data.get("medicine_name"),
        "severity": alert_data.get("severity", "WARNING"),
        "alert_type": alert_data.get("alert_type", "STOCKOUT_RISK"),
        "message": alert_data.get("message", "Operational notification"),
        "days_remaining": alert_data.get("days_remaining", 5),
        "recommended_action": alert_data.get("recommended_action", "Review facility buffer"),
        "timestamp": datetime.now().isoformat(),
        "status": "ACTIVE"
    }
    state_manager.alerts[new_id] = alert_obj
    state_manager.broadcast_event("NEW_ALERT", alert_obj)
    return alert_obj

@router.put("/{alert_id}/resolve")
def resolve_alert(alert_id: str) -> Dict[str, Any]:
    alert = state_manager.alerts.get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert["status"] = "RESOLVED"
    state_manager.broadcast_event("ALERT_RESOLVED", alert)
    return alert
