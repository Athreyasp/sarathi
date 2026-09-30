import hashlib
import json
from app.models.schemas import ActionPlan

RISK_POLICY = {
    "collect_logs": {"risk": "low", "approval": False},
    "restart_dev_service": {"risk": "medium", "approval": True},
    "scale_within_limit": {"risk": "medium", "approval": True},
    "rollback_deployment": {"risk": "high", "approval": True},
    "delete_database_data": {"risk": "critical", "approval": False} # blocked
}

def generate_action_hash(action_payload: dict) -> str:
    """Creates a canonical SHA-256 hash of the proposed action."""
    canonical = json.dumps(action_payload, sort_keys=True)
    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()

def validate_action_against_policy(action: ActionPlan) -> bool:
    """Validates if the action is allowed by policy."""
    policy = RISK_POLICY.get(action.action_type)
    if not policy:
        return False
    
    if policy["risk"] == "critical":
        # We strictly disallow critical risks like deleting database data
        return False
        
    return True

def verify_approval(approved_hash: str, current_action_payload: dict) -> bool:
    """Checks if the executed action matches the approved action."""
    current_hash = generate_action_hash(current_action_payload)
    return current_hash == approved_hash
