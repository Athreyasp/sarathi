import os
import httpx
from app.services.policy import verify_approval

SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://localhost:8001")

class ActionExecutor:
    async def rollback_deployment(self, target: dict):
        # We never use subprocess for arbitrary shell commands.
        # This is a typed deterministic execution.
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SIMULATOR_URL}/api/simulator/action",
                json={"action_type": "rollback_deployment", "target_version": "v1.0"}
            )
            return response.json()
            
    async def restart_service(self, target: dict):
        pass
        
    async def scale_service(self, target: dict):
        pass

async def execute_action(action_payload: dict, approved_hash: str):
    # 1. Check kill switch
    if os.getenv("EXECUTION_ENABLED", "true").lower() != "true":
        raise Exception("Execution is globally disabled.")

    # 2. Hash check protection
    if not verify_approval(approved_hash, action_payload):
        raise Exception("ACTION_REJECTED: Approved action does not match execution request.")
        
    # 3. Deterministic execution
    executor = ActionExecutor()
    action_type = action_payload.get("action_type")
    
    if action_type == "rollback_deployment":
        return await executor.rollback_deployment(action_payload.get("target"))
    else:
        raise Exception(f"Action {action_type} is not supported by executor.")
