from fastapi import APIRouter
from typing import Dict, Any
from ..database.state import state_manager
from ..models.schemas import SimulationTrigger

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.get("/status")
def get_simulation_status() -> Dict[str, Any]:
    return state_manager.simulation_state

@router.post("/start")
def start_simulation(payload: SimulationTrigger) -> Dict[str, Any]:
    state = state_manager.trigger_emergency_simulation(
        scenario=payload.scenario,
        intensity=payload.intensity,
        target_district=payload.target_district or "Cuttack"
    )
    return {
        "status": "started",
        "simulation": state,
        "message": f"Simulated {payload.scenario} activated. Demand multiplier set to {state['demand_multiplier']}x. Critical alerts and mutual-aid transfers generated."
    }

@router.post("/stop")
def stop_simulation() -> Dict[str, Any]:
    state_manager.reset_state()
    return {
        "status": "stopped",
        "simulation": state_manager.simulation_state,
        "message": "Emergency simulation terminated. Network restored to baseline operational state."
    }
