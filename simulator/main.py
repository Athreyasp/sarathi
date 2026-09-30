from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Payment API Simulator")

class SimulatorState(BaseModel):
    active_version: str
    error_rate: float
    success_rate: float
    p95_latency_ms: int
    db_error_rate: float
    healthy: bool
    verification_failure_mode: bool = False

# Default healthy state
DEFAULT_STATE = SimulatorState(
    active_version="v1.0",
    error_rate=0.002,
    success_rate=0.998,
    p95_latency_ms=280,
    db_error_rate=0.001,
    healthy=True
)

# Outage state
OUTAGE_STATE = SimulatorState(
    active_version="v1.1",
    error_rate=0.47,
    success_rate=0.52,
    p95_latency_ms=2480,
    db_error_rate=0.34,
    healthy=False
)

# Current state
current_state = DEFAULT_STATE.copy()

@app.get("/api/simulator/state", response_model=SimulatorState)
def get_state():
    return current_state

@app.post("/api/simulator/inject-outage")
def inject_outage():
    global current_state
    current_state = OUTAGE_STATE.copy()
    return {"message": "Outage injected. Service is now degrading."}

@app.post("/api/simulator/reset")
def reset():
    global current_state
    current_state = DEFAULT_STATE.copy()
    return {"message": "Simulator reset to healthy state."}

@app.post("/api/simulator/set-verification-failure")
def set_verification_failure():
    global current_state
    current_state.verification_failure_mode = True
    return {"message": "Verification failure mode enabled."}

class ActionRequest(BaseModel):
    action_type: str
    target_version: str = "v1.0"

@app.post("/api/simulator/action")
def perform_action(req: ActionRequest):
    global current_state
    if req.action_type == "rollback_deployment":
        if req.target_version == "v1.0":
            if current_state.verification_failure_mode:
                # Simulates partial recovery but still failing verification thresholds
                current_state.active_version = "v1.0"
                current_state.error_rate = 0.05
                current_state.success_rate = 0.95
                current_state.p95_latency_ms = 800
                current_state.db_error_rate = 0.001
                current_state.healthy = True
            else:
                current_state = DEFAULT_STATE.copy()
            return {"message": "Rollback completed"}
    raise HTTPException(status_code=400, detail="Action not supported or invalid target")
