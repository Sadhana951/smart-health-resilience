from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List
from ..database.state import state_manager
from ..ai.forecasting import generate_demand_forecast

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])

@router.get("")
def get_forecast_summary() -> Dict[str, Any]:
    # Aggregated 14-day network forecast
    phcs = list(state_manager.phcs.values())
    inventory = list(state_manager.inventory.values())
    
    # Top at-risk medicine for highlight: Paracetamol
    paracetamol_items = [i for i in inventory if i["medicine_id"] == "med-1"]
    total_paracetamol_stock = sum(i["current_stock"] for i in paracetamol_items)
    total_paracetamol_daily = sum(i["daily_usage"] for i in paracetamol_items)

    chart_points = generate_demand_forecast(
        phc_id="network-agg",
        medicine_id="med-1",
        days_ahead=14,
        current_stock=total_paracetamol_stock,
        daily_usage=total_paracetamol_daily,
        demand_multiplier=state_manager.simulation_state["demand_multiplier"],
        weather_impact_factor=1.12
    )

    return {
        "status": "success",
        "highlight_medicine": "Paracetamol 500mg Tablets",
        "current_network_stock": total_paracetamol_stock,
        "daily_network_demand": total_paracetamol_daily,
        "days_ahead": 14,
        "methodology": "Ensemble Seasonal ARIMA + Bayesian Weather Covariate Model",
        "confidence_level": "95%",
        "explanation": "Forecast influenced by recent consumption trends, seasonal monsoon waterlogging signals, and simulated fever cluster activity.",
        "chart_data": chart_points,
        "is_synthetic_demo": True
    }

@router.get("/{phc_id}")
def get_phc_forecast(
    phc_id: str,
    medicine_id: str = Query("med-1"),
    days: int = Query(14)
) -> Dict[str, Any]:
    phc = state_manager.get_phc_by_id(phc_id)
    if not phc:
        raise HTTPException(status_code=404, detail="PHC not found")

    inv_id = f"inv-{phc_id}-{medicine_id}"
    item = state_manager.inventory.get(inv_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory record not found")

    chart_points = generate_demand_forecast(
        phc_id=phc_id,
        medicine_id=medicine_id,
        days_ahead=days,
        current_stock=item["current_stock"],
        daily_usage=item["daily_usage"],
        demand_multiplier=state_manager.simulation_state["demand_multiplier"],
        weather_impact_factor=1.18 if "Flood" in phc["weather_signal"] or "Rain" in phc["weather_signal"] else 1.05
    )

    return {
        "phc_id": phc_id,
        "phc_name": phc["name"],
        "medicine_id": medicine_id,
        "medicine_name": item["medicine_name"],
        "current_stock": item["current_stock"],
        "daily_usage": item["daily_usage"],
        "days_remaining": item["days_remaining"],
        "risk_level": item["risk_level"],
        "chart_data": chart_points,
        "days_ahead": days,
        "is_synthetic_demo": True
    }
