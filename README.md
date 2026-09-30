# OpsPilot // Autonomous SIEM & Incident Response Agent

**OpsPilot** (formerly *Sarathi*) is a safety-first AI incident-response platform built for modern Site Reliability Engineering (SRE) and Security Operations Center (SOC) teams. 

It autonomously correlates telemetry, investigates root causes, and proposes cryptographic-hashed countermeasure runbooks—**never executing risky actions without explicit human authorization.**

![OpsPilot Console UI](https://img.shields.io/badge/UI-SentinelOne_Inspired-00e5ff?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_FastAPI_|_Python-3B82F6?style=for-the-badge)

## 🛑 The Problem
When a software application or payment service suddenly degrades, engineers manually hunt through distributed logs, metrics, and deployment pipelines.
* **Slow Diagnosis:** Investigating across scattered tools wastes critical outage time.
* **Risky Fixes:** Blindly rolling back a deployment might corrupt an incompatible database migration.
* **Unsafe AI:** Allowing a raw LLM to execute shell commands during an outage is a massive security risk.

## 🚀 The OpsPilot Solution
OpsPilot solves this by separating **AI Reasoning** from **Deterministic Execution**. 

1. **Investigates:** The AI agent autonomously ingests distributed data (ElasticSearch logs, Prometheus metrics, ArgoCD pipeline drift, past incidents).
2. **Diagnoses:** Utilizes LLM heuristics to isolate the root cause and output a confidence score.
3. **Proposes:** Maps the anomaly to a pre-authorized runbook, generating a strict SHA-256 hash of the target payload.
4. **Authorizes:** Halts and demands a human SOC Commander to authorize the exact action.
5. **Executes & Verifies:** A deterministic execution engine applies the fix, runs a 3-pass verification loop, and generates a post-mortem report.

## 🛠 Tech Stack
* **Frontend:** React 18, Vite, TypeScript, Recharts, Lucide-React (SentinelOne Dark Theme)
* **Backend:** Python 3.11, FastAPI, Pydantic, SQLAlchemy
* **Execution Layer:** Policy Engine with SHA-256 validation (No LLM shell access)

## 🏃‍♂️ How to Run Locally (No Docker Required)

This project is built to run natively. You can start the entire stack using the provided PowerShell automation script.

1. Clone the repository and navigate into the folder:
```bash
cd opspilot
```

2. Run the automated boot sequence:
```powershell
.\start.ps1
```
*(If PowerShell blocks the script, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

The script will automatically provision Python virtual environments, install dependencies, and launch:
* **Frontend UI:** `http://localhost:5173`
* **Backend API:** `http://localhost:8000/docs`
* **Simulator API:** `http://localhost:8001/docs`

## 🎬 Hackathon Demo Script
1. Navigate to the frontend UI at `http://localhost:5173`.
2. Click **Simulate Threat** to trigger the anomaly (watch the telemetry chart spike and error logs flood the terminal).
3. Click **Deploy AI Investigator** to trigger the autonomous correlation engine.
4. Review the AI's 94% confidence diagnosis and the proposed rollback strategy.
5. Click **Authorize Exact Countermeasure** to execute the fix.
6. Watch the telemetry stabilize and the **Post-Mortem Report** generate automatically.

---
*Built for Hackathon 2026 - Domain 2 (Technology & Cybersecurity)*
