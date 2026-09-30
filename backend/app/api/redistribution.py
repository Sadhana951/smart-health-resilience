from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
import math
from ..database.state import state_manager

router = APIRouter(prefix="/redistribution", tags=["Redistribution"])

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

@router.get("")
def list_redistributions(status: Optional[str] = Query(None)) -> List[Dict[str, Any]]:
    return state_manager.get_redistributions(status=status)

@router.post("/recommend")
def generate_recommendation(payload: Dict[str, Any]) -> Dict[str, Any]:
    to_phc_id = payload.get("to_phc_id", "phc-od-01")
    medicine_id = payload.get("medicine_id", "med-1")

    to_phc = state_manager.get_phc_by_id(to_phc_id)
    if not to_phc:
        raise HTTPException(status_code=404, detail="Target PHC not found")

    target_inv_id = f"inv-{to_phc_id}-{medicine_id}"
    target_inv = state_manager.inventory.get(target_inv_id)
    if not target_inv:
        raise HTTPException(status_code=404, detail="Target inventory record not found")

    # Find candidate surplus facilities with >20 days buffer
    candidates = []
    for inv in state_manager.inventory.values():
        if inv["medicine_id"] == medicine_id and inv["phc_id"] != to_phc_id and inv["days_remaining"] >= 20:
            donor_phc = state_manager.get_phc_by_id(inv["phc_id"])
            if donor_phc:
                dist = haversine(to_phc["lat"], to_phc["lng"], donor_phc["lat"], donor_phc["lng"])
                candidates.append({
                    "phc": donor_phc,
                    "inv": inv,
                    "distance_km": dist
                })

    if not candidates:
        raise HTTPException(status_code=400, detail="No surplus donor facilities currently available within regional threshold")

    # Sort by closest distance
    candidates.sort(key=lambda x: x["distance_km"])
    best = candidates[0]
    donor_phc = best["phc"]
    donor_inv = best["inv"]

    # Recommended quantity is roughly 10-14 days of target daily usage, capped at 40% of donor stock
    daily = max(1, target_inv["daily_usage"])
    needed_qty = daily * 12
    transfer_qty = min(needed_qty, int(donor_inv["current_stock"] * 0.40))
    transfer_qty = max(50, (transfer_qty // 50) * 50) # round to nearest 50

    new_id = f"rec-{int(datetime.now().timestamp())}"
    rec_obj = {
        "id": new_id,
        "from_phc_id": donor_phc["id"],
        "from_phc_name": donor_phc["name"],
        "from_district": donor_phc["district"],
        "from_current_stock": donor_inv["current_stock"],
        "to_phc_id": to_phc["id"],
        "to_phc_name": to_phc["name"],
        "to_district": to_phc["district"],
        "to_current_stock": target_inv["current_stock"],
        "medicine_id": medicine_id,
        "medicine_name": target_inv["medicine_name"],
        "quantity": transfer_qty,
        "distance_km": best["distance_km"],
        "priority": "HIGH",
        "status": "PENDING",
        "reason": f"Projected shortage at {to_phc['name']}. Donor maintains safe {donor_inv['days_remaining']} days operational buffer.",
        "eta_hours": round(best["distance_km"] / 35.0, 1), # assuming 35km/h road speed
        "route_coordinates": [
            [donor_phc["lat"], donor_phc["lng"]],
            [(donor_phc["lat"] + to_phc["lat"]) / 2, (donor_phc["lng"] + to_phc["lng"]) / 2],
            [to_phc["lat"], to_phc["lng"]]
        ],
        "created_at": datetime.now().isoformat()
    }

    state_manager.redistributions[new_id] = rec_obj
    state_manager.broadcast_event("NEW_REDISTRIBUTION", rec_obj)
    return rec_obj

@router.post("/{rec_id}/accept")
def accept_transfer(rec_id: str) -> Dict[str, Any]:
    rec = state_manager.accept_redistribution(rec_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    return {
        "status": "ACCEPTED",
        "recommendation": rec,
        "timeline": [
            {"step": "DISPATCH_AUTHORIZED", "status": "COMPLETED", "timestamp": datetime.now().isoformat(), "note": "District medical officer digital authorization confirmed."},
            {"step": "VEHICLE_ASSIGNED", "status": "IN_PROGRESS", "timestamp": datetime.now().isoformat(), "note": "Cold-chain transit vehicle OD-05-M-4821 dispatched."},
            {"step": "BUFFER_STABILIZATION", "status": "PENDING", "timestamp": None, "note": "Estimated target replenishment completion in 1.5 hours."}
        ]
    }

@router.post("/{rec_id}/reject")
def reject_transfer(rec_id: str) -> Dict[str, Any]:
    rec = state_manager.reject_redistribution(rec_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return {"status": "REJECTED", "recommendation": rec}
