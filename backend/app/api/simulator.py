from fastapi import APIRouter
import httpx

router = APIRouter()
SIMULATOR_URL = "http://localhost:8001/api/simulator"

@router.get("/state")
async def get_state():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SIMULATOR_URL}/state")
        return response.json()

@router.post("/inject-outage")
async def inject_outage():
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{SIMULATOR_URL}/inject-outage")
        return response.json()
