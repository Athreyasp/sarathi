from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Hypothesis(BaseModel):
    hypothesis_id: str
    title: str
    score: float
    supporting_evidence_ids: List[str]
    contradicting_evidence_ids: List[str]
    reasoning: str

class DiagnosisOutput(BaseModel):
    primary_hypothesis: Hypothesis
    alternatives: List[Hypothesis]
    next_check: str

class TargetSchema(BaseModel):
    environment: str
    namespace: str
    deployment: str
    current_revision: int
    desired_revision: int

class ActionPlan(BaseModel):
    action_id: str
    runbook_id: str
    action_type: str
    target: TargetSchema
    reason: str
    risk_level: str
    approval_required: bool
    expected_result: Dict[str, Any]
    rollback_plan: str
    evidence_ids: List[str]
