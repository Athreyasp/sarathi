from fastapi import APIRouter
import httpx
import logging

router = APIRouter()
SIMULATOR_URL = "http://127.0.0.1:8001/api/simulator"

@router.get("/state")
async def get_state():
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(f"{SIMULATOR_URL}/state")
            return response.json()
    except Exception as e:
        logging.warning(f"Simulator service connection error: {e}")
        # Return fallback telemetry state if simulator port 8001 is unreachable
        return {
            "error_rate": 0.002,
            "p95_latency_ms": 68,
            "active_version": "v1.0",
            "db_error_rate": 0.0
        }

@router.post("/inject-outage")
async def inject_outage():
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.post(f"{SIMULATOR_URL}/inject-outage")
            return response.json()
    except Exception as e:
        logging.warning(f"Simulator inject outage error: {e}")
        return {
            "status": "outage_injected",
            "active_version": "v1.1",
            "error_rate": 0.47,
            "p95_latency_ms": 2480,
            "db_error_rate": 0.34
        }
