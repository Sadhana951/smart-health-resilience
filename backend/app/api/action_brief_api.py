from fastapi import APIRouter
from typing import Dict, Any
from ..models.schemas import ActionBriefRequest, ActionBrief
from ..ai.action_brief import generate_action_brief_content
from ..database.state import state_manager

router = APIRouter(tags=["Action Brief"])

@router.post("/action-brief", response_model=ActionBrief)
def get_action_brief(req: ActionBriefRequest) -> ActionBrief:
    # Resolve target PHC and medicine
    phc_id = req.phc_id or "phc-od-01"
    medicine_id = req.medicine_id or "med-1"

    phc = state_manager.get_phc_by_id(phc_id) or state_manager.get_phc_by_id("phc-od-01")
    med = state_manager.medicines.get(medicine_id) or state_manager.medicines.get("med-1")

    inv_id = f"inv-{phc['id']}-{med['id']}"
    item = state_manager.inventory.get(inv_id) or {
        "current_stock": 1240,
        "daily_usage": 310,
        "days_remaining": 4
    }

    content = generate_action_brief_content(
        phc_name=phc["name"],
        district=phc["district"],
        medicine_name=med["name"],
        days_remaining=item["days_remaining"],
        current_stock=item["current_stock"],
        daily_usage=item["daily_usage"],
        weather_signal=phc["weather_signal"],
        disease_signal=phc["disease_signal"],
        donor_name="PHC Bhubaneswar North (Chandaka)",
        recommended_transfer_qty=1500
    )

    return ActionBrief(**content)
