from fastapi import APIRouter, HTTPException
from app.services.diagnosis import run_llm_diagnosis, propose_remediation
from app.models.enums import IncidentStatus
from typing import Dict
from datetime import datetime

router = APIRouter()

incidents_db: Dict[str, dict] = {}
evidence_db: Dict[str, list] = {}
diagnosis_db: Dict[str, dict] = {}
actions_db: Dict[str, dict] = {}

def add_audit_entry(id: str, message: str):
    if id in incidents_db:
        timestamp = datetime.utcnow().strftime("%H:%M:%S.%f")[:-3]
        incidents_db[id]["audit_trail"].append(f"[{timestamp}] {message}")

@router.post("/")
def create_incident():
    incident_id = "INC-2026-001"
    incidents_db[incident_id] = {
        "incident_id": incident_id,
        "title": "ANOMALY DETECTED: Payment API Service Disruption",
        "service": "payment-api",
        "status": IncidentStatus.DETECTED,
        "audit_trail": [],
        "report": None
    }
    add_audit_entry(incident_id, "SYSTEM: Alert triggered. Severity: CRITICAL. Routing to Autonomous Agent.")
    return incidents_db[incident_id]

@router.get("/{id}")
def get_incident(id: str):
    if id not in incidents_db:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incidents_db[id]

@router.post("/{id}/investigate")
def investigate(id: str):
    if id not in incidents_db:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    incidents_db[id]["status"] = IncidentStatus.INVESTIGATING
    add_audit_entry(id, "AGENT: Commencing SIEM data correlation. Ingesting distributed logs, telemetry, and change registries.")
    
    # Highly detailed synthetic SOC/SIEM logs
    evidence = [
        {
            "id": "EVT-8831-LOG", 
            "source": "Application Logs (ElasticSearch)", 
            "summary": "Multiple fatal DB connection rejections",
            "content": "[10:42:01.001] FATAL [payment-api] - Error 1045 (28000): Access denied for user 'pay_svc'@'db-master'\n[10:42:01.045] WARN  [payment-api] - Retry payload injected. Attempt 1/3 failed.\n[10:42:01.102] FATAL [payment-api] - Connection pool exhausted. Circuit breaker OPEN.\n[10:42:01.105] ERROR [payment-api] - HTTP 500 Internal Server Error returned to downstream gateway."
        },
        {
            "id": "EVT-8832-MET", 
            "source": "Telemetry (Prometheus)", 
            "summary": "Latencies exceeded 2000ms, Error rate > 40%",
            "content": "QUERY: rate(http_requests_total{status=\"5xx\"}[1m])\nRESULT: 47.2% (+4700% delta)\nQUERY: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[1m]))\nRESULT: 2480ms (Baseline: 280ms)"
        },
        {
            "id": "EVT-8833-CFG", 
            "source": "CI/CD Pipeline (GitLab/ArgoCD)", 
            "summary": "Unauthorized/Unsafe configuration mutation in v1.1",
            "content": "COMMIT: 8f9a2b4 (Deploy payment-api v1.1)\nAUTHOR: auto-deploy-bot\nDIFF: \n- DB_SSL_MODE=require\n+ DB_SSL_MODE=disable\n- DB_TIMEOUT=5000\n+ DB_TIMEOUT=500\nSTATUS: Sync Successful. Drift detected 12 seconds prior to first anomaly."
        },
        {
            "id": "EVT-8834-HIS", 
            "source": "Threat Intel & Past Incidents", 
            "summary": "Match found with historical incident INC-2025-084",
            "content": "VECTOR: Configuration Drift leading to SSL rejection.\nSIMILARITY SCORE: 98.4%\nRESOLUTION: Automated rollback restored service. Time to mitigate: 4m."
        }
    ]
    evidence_db[id] = evidence
    add_audit_entry(id, "AGENT: Multi-vector correlation complete. 4 key evidence artifacts extracted.")
    add_audit_entry(id, "AGENT: Initializing LLM Diagnosis Engine to synthesize root cause.")
    
    diag = run_llm_diagnosis(evidence)
    diagnosis_db[id] = diag.dict()
    add_audit_entry(id, f"AGENT: Root Cause Isolated. Confidence: {diag.primary_hypothesis.score * 100}%.")
    
    incidents_db[id]["status"] = IncidentStatus.ACTION_PROPOSED
    action = propose_remediation(diag)
    actions_db[id] = action.dict()
    add_audit_entry(id, f"AGENT: Proposing countermeasure: {action.action_type}. AWAITING AUTHORIZATION.")
    
    return {"evidence": evidence, "diagnosis": diagnosis_db[id], "action_proposed": actions_db[id]}

@router.get("/{id}/evidence")
def get_evidence(id: str):
    return evidence_db.get(id, [])

@router.get("/{id}/hypotheses")
def get_hypotheses(id: str):
    return diagnosis_db.get(id, {})

@router.get("/{id}/actions")
def get_actions(id: str):
    return actions_db.get(id, {})
