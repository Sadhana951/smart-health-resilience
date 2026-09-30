from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

from .config import settings
from .database.state import state_manager
from .api import (
    dashboard,
    phcs,
    inventory,
    forecasts,
    alerts,
    redistribution,
    assistant,
    voice,
    simulation,
    federated,
    action_brief_api
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Healthcare Supply-Chain Command Platform for India's Primary Health Centres (PHCs)",
    version=settings.VERSION
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with API prefix
api_prefix = settings.API_PREFIX

app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(phcs.router, prefix=api_prefix)
app.include_router(inventory.router, prefix=api_prefix)
app.include_router(forecasts.router, prefix=api_prefix)
app.include_router(alerts.router, prefix=api_prefix)
app.include_router(redistribution.router, prefix=api_prefix)
app.include_router(assistant.router, prefix=api_prefix)
app.include_router(voice.router, prefix=api_prefix)
app.include_router(simulation.router, prefix=api_prefix)
app.include_router(federated.router, prefix=api_prefix)
app.include_router(action_brief_api.router, prefix=api_prefix)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "notice": "SYNTHETIC DEMONSTRATION PLATFORM — BUILT FOR INDIA-SCALE HEALTH RESILIENCE"
    }

@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    q = asyncio.Queue()
    state_manager.subscribers.append(q)
    try:
        # Send initial connection handshake
        await websocket.send_text(json.dumps({
            "event": "CONNECTED",
            "message": "Connected to Smart Health Command Center Real-time Stream",
            "simulation": state_manager.simulation_state
        }))
        while True:
            # Wait for either broadcast event or client ping
            send_task = asyncio.create_task(q.get())
            recv_task = asyncio.create_task(websocket.receive_text())
            done, pending = await asyncio.wait(
                [send_task, recv_task],
                return_when=asyncio.FIRST_COMPLETED
            )
            for task in pending:
                task.cancel()

            if send_task in done:
                msg = send_task.result()
                await websocket.send_text(msg)
            if recv_task in done:
                client_msg = recv_task.result()
                # Optional client ping response
                if client_msg == "ping":
                    await websocket.send_text(json.dumps({"event": "PONG"}))
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        if q in state_manager.subscribers:
            state_manager.subscribers.remove(q)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
