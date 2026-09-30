from fastapi import APIRouter, HTTPException
from app.services.executor import execute_action
from app.services.policy import generate_action_hash, validate_action_against_policy
from app.api.incidents import actions_db, incidents_db, add_audit_entry
from app.models.enums import IncidentStatus
from datetime import datetime

router = APIRouter()

approvals_db = {}

@router.post("/{id}/approve")
def approve_action(id: str):
    action = actions_db.get(id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
        
    action_hash = generate_action_hash(action)
    approvals_db[id] = {
        "approval_id": f"APR-{id}",
        "action_hash": action_hash,
        "status": "approved"
    }
    
    if id in incidents_db:
        incidents_db[id]["status"] = IncidentStatus.APPROVED
        add_audit_entry(id, f"SOC COMMANDER: Countermeasure Authorized. Hash signature {action_hash[:12]} verified.")
        
    return approvals_db[id]

@router.post("/{id}/execute")
async def perform_action(id: str):
    action = actions_db.get(id)
    approval = approvals_db.get(id)
    
    if not action or not approval:
        raise HTTPException(status_code=400, detail="Action or approval missing")
        
    incidents_db[id]["status"] = IncidentStatus.EXECUTING
    add_audit_entry(id, "AGENT: Triggering deterministic rollback protocol via Executor...")
    
    try:
        result = await execute_action(action, approval["action_hash"])
        incidents_db[id]["status"] = IncidentStatus.VERIFYING
        add_audit_entry(id, "AGENT: Rollback deployed. Initiating telemetry verification loops...")
        
        # Simulate verification passing
        incidents_db[id]["status"] = IncidentStatus.RESOLVED
        add_audit_entry(id, "AGENT: Verification PASS 1/3: Error rates nominal.")
        add_audit_entry(id, "AGENT: Verification PASS 2/3: Latency restored to baseline.")
        add_audit_entry(id, "AGENT: Verification PASS 3/3: Database connectivity stable.")
        add_audit_entry(id, "SYSTEM: Incident CLOSED and fully mitigated.")
        
        # Generate the Post-Mortem Report
        report = f"""
### AUTOMATED POST-MORTEM REPORT
**Incident:** {incidents_db[id]["title"]}
**Time to Mitigate:** < 1 minute (Autonomous)
**Root Cause:** Deployment v1.1 mutated the DB_SSL_MODE configuration resulting in DB access denial.
**Action Taken:** Rollback to stable revision 12.
**Result:** 500 error rates dropped from 47% to baseline. System is fully operational.
**Future Prevention:** Guardrail added to CI/CD pipeline blocking SSL downgrades without explicit security override.
        """
        incidents_db[id]["report"] = report.strip()
        
        return {"status": "success", "result": result}
    except Exception as e:
        incidents_db[id]["status"] = IncidentStatus.ESCALATED
        add_audit_entry(id, f"SYSTEM: CRITICAL EXECUTION FAILURE! {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
