from fastapi import APIRouter
from typing import Dict, Any, List
from datetime import datetime
import random
from ..database.state import state_manager

router = APIRouter(prefix="/federated", tags=["Federated Learning"])

@router.get("/status")
def get_federated_status() -> Dict[str, Any]:
    nodes = list(state_manager.federated_nodes.values())
    avg_loss = round(sum(n["local_loss"] for n in nodes) / len(nodes), 4)
    avg_accuracy = round(sum(n["accuracy_score"] for n in nodes) / len(nodes), 3)

    return {
        "status": "success",
        "demonstration_notice": "FEDERATED LEARNING DEMONSTRATION — PRIVACY PRESERVING MODEL COOPERATION",
        "privacy_guarantee": "RAW PHC RECORDS NEVER LEAVE LOCAL PREMISES. ONLY DIFFERENTIAL GRADIENT WEIGHTS ARE EXCHANGED.",
        "global_round": nodes[0]["current_round"],
        "global_loss": avg_loss,
        "global_accuracy": avg_accuracy,
        "aggregation_algorithm": "Federated Averaging (FedAvg) with Differential Privacy (ε=1.2)",
        "nodes": nodes
    }

@router.post("/train-round")
def run_training_round() -> Dict[str, Any]:
    now_str = datetime.now().isoformat()
    for node in state_manager.federated_nodes.values():
        node["current_round"] += 1
        # Loss decreases as rounds progress
        node["local_loss"] = max(0.015, round(node["local_loss"] * random.uniform(0.92, 0.97), 4))
        node["accuracy_score"] = min(0.985, round(node["accuracy_score"] + random.uniform(0.003, 0.008), 3))
        node["status"] = "SYNCHRONIZED"
        node["last_sync"] = now_str

    state_manager.broadcast_event("FEDERATED_ROUND_COMPLETED", {
        "round": state_manager.federated_nodes["node-odisha"]["current_round"]
    })

    return get_federated_status()
