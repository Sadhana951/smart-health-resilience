from fastapi import APIRouter, Query
from typing import List, Optional, Dict, Any
from ..database.state import state_manager

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("")
def list_inventory(
    medicine_id: Optional[str] = Query(None),
    phc_id: Optional[str] = Query(None),
    risk: Optional[str] = Query(None),
    district: Optional[str] = Query(None)
) -> List[Dict[str, Any]]:
    items = state_manager.get_all_inventory(medicine_id=medicine_id, phc_id=phc_id, risk=risk)
    if district:
        items = [i for i in items if i["district"].lower() == district.lower()]
    return items

@router.get("/medicines")
def get_medicines_catalog() -> List[Dict[str, Any]]:
    return list(state_manager.medicines.values())

@router.get("/{medicine_id}")
def get_medicine_inventory_breakdown(medicine_id: str) -> Dict[str, Any]:
    med = state_manager.medicines.get(medicine_id)
    items = [i for i in state_manager.inventory.values() if i["medicine_id"] == medicine_id]
    total_stock = sum(i["current_stock"] for i in items)
    critical_phcs = [i["phc_name"] for i in items if i["risk_level"] == "CRITICAL"]
    surplus_phcs = [i["phc_name"] for i in items if i["days_remaining"] > 25]

    return {
        "medicine": med,
        "total_stock": total_stock,
        "critical_facilities_count": len(critical_phcs),
        "critical_facilities": critical_phcs,
        "surplus_facilities": surplus_phcs,
        "items": items
    }
