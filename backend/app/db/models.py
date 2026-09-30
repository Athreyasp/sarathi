from sqlalchemy import create_engine, Column, String, DateTime, Enum as SQLEnum, Float, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime
import os
from app.models.enums import IncidentStatus

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./opspilot.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    service = Column(String)
    environment = Column(String)
    severity = Column(String)
    status = Column(SQLEnum(IncidentStatus), default=IncidentStatus.DETECTED)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    investigation_start = Column(DateTime, nullable=True)
    investigation_end = Column(DateTime, nullable=True)

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(String, primary_key=True)
    incident_id = Column(String, ForeignKey("incidents.id"))
    source_type = Column(String)
    source_name = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    summary = Column(String)
    content = Column(String)
    trust_level = Column(String, default="untrusted_external_data")

class ActionProposal(Base):
    __tablename__ = "action_proposals"
    id = Column(String, primary_key=True)
    incident_id = Column(String, ForeignKey("incidents.id"))
    runbook_id = Column(String)
    action_type = Column(String)
    target_payload = Column(JSON)
    risk_level = Column(String)
    action_hash = Column(String)
    status = Column(String, default="pending") # pending, approved, rejected
