<div align="center">

# 🛡️ SARATHI (सारथी)
### Autonomous SIEM & SRE Incident Response Copilot
**Engineered by Team Hashiras**

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite-00f0ff?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-00ff9d?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Security](https://img.shields.io/badge/Policy-SHA--256%20Cryptographic%20Gating-ff2a5f?style=for-the-badge&logo=security)](https://github.com/Athreyasp/sarathi)
[![UI Style](https://img.shields.io/badge/Theme-Google%20Sec--Ops%20%7C%20SentinelOne-b052ff?style=for-the-badge)](https://github.com/Athreyasp/sarathi)
[![License](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Sarathi</b> (Sanskrit for <i>The Charioteer / Trusted Guide</i>) is a safety-first autonomous AI incident response platform built for modern <b>Site Reliability Engineering (SRE)</b> and <b>Security Operations Center (SOC)</b> teams.
</p>

[Key Features](#-key-features) • [Architecture](#-system-architecture) • [UI Overview](#-console-views) • [Quick Start](#-getting-started) • [API & Playbooks](#-api--integration-specifications) • [Safety Guarantee](#-safety-first-philosophy)

---

</div>


## 🛑 The Core Problem

When critical microservices or payment gateways degrade in production:
* **Manual Triage Latency:** Engineers lose critical minutes manually correlating telemetry across fragmented dashboards (Grafana, ElasticSearch, ArgoCD).
* **High-Risk Remediation:** Blind rollbacks often trigger cascading failures or corrupt database migration schemas.
* **Unconstrained AI Risks:** Granting raw LLM agents direct shell/bash execution permissions in production environments introduces severe security and operational hazards.

---

## ⚡ The Sarathi Solution

**Sarathi** resolves this crisis by establishing a strict boundary between **AI Reasoning** and **Deterministic Execution**:

1. **Ingest & Correlate:** Autonomously streams and aggregates distributed logs, Prometheus metrics, and deployment revisions in real-time.
2. **Diagnose with Confidence:** Leverages fine-tuned LLM heuristics to isolate the exact root cause (e.g., config drift, SSL handshake errors) and outputs a quantitative confidence score.
3. **Formulate Cryptographic Runbooks:** Maps identified anomalies to pre-compiled deterministic runbooks, generating a strict **SHA-256 hash payload**.
4. **Human-in-the-Loop Gating:** Halts execution for critical mutations and demands explicit authorization from a human SOC commander.
5. **Execute & 3-Pass Verify:** Applies the countermeasure through deterministic APIs, continuously monitors telemetry recovery for 3 consecutive intervals, and generates an automated Post-Mortem report.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Ingestion ["1. Multi-Modal Ingestion Layer"]
        A[Prometheus Metrics] --> D[Sarathi Telemetry Stream]
        B[ElasticSearch Logs] --> D
        C[ArgoCD GitOps Drift] --> D
    end

    subgraph Reasoning ["2. Autonomous AI Reasoning Engine"]
        D --> E[LLM Anomaly Heuristics]
        E --> F[Root Cause Hypothesis Matrix]
        F --> G[Runbook Selection & SHA-256 Hash]
    end

    subgraph SecurityGate ["3. Cryptographic Safety Gate"]
        G --> H{Risk Vector Check}
        H -->|High / Critical| I[Human SOC Commander Approval]
        H -->|Low Risk| J[Autonomous Fast-Track]
        I -->|Authorized Signature| K[Deterministic Policy Engine]
        J --> K
    end

    subgraph Execution ["4. Execution & Verification Loop"]
        K --> L[Target Microservice Action]
        L --> M[3-Pass Telemetry Verification]
        M -->|Nominal SLA Restored| N[Automated Post-Mortem Report]
    end
```

---

## 🌟 Key Features

* 🚀 **Fast Cyber Preloader:** Cinematic startup sequence powered by **Team Hashiras** with instant system health checks.
* 🧭 **Google Cloud / Material 3 Navigation:** Collapsible navigation drawer with active rounded pill states and status indicators.
* 📊 **Live Telemetry & Anomaly Matrix:** Real-time error rate tracking, P95 latency monitoring, and interactive Area charts.
* 📜 **Full-Screen SIEM Log Terminal:** Searchable event stream with level filtering (`CRITICAL`, `WARN`, `INFO`) and stream pause/resume.
* 🤖 **Autonomous SOC Copilot Console:** Interactive reasoning graph displaying ingestion, hypothesis scoring, and post-mortem generation.
* 🔐 **SHA-256 Runbook Registry:** Library of pre-compiled safety runbooks with a live JSON schema inspector.
* 🌐 **Fleet Infrastructure Topology:** Service node health inspection, container specifications, and microservice dependency mesh.

---

## 🖥️ Console Views

| View | Purpose | Key Capabilities |
| :--- | :--- | :--- |
| **SOC Overview** | Main Triage Hub | 3-panel split view with live stream, error telemetry, and the AI investigator widget. |
| **Telemetry Matrix** | Deep Health Analytics | P95 latency distributions, HTTP 500 spike graphs, and PostgreSQL connection pool gauges. |
| **Live Log Stream** | Log Exploration | Real-time log streamer with sub-second event rendering and keyword search. |
| **AI Investigator** | Copilot Command Center | Full hypothesis breakdown, multi-modal ingestion status, and approval gating. |
| **Security Runbooks** | Cryptographic Library | Inspect JSON schemas for `RB-01` (Rollback), `RB-02` (DB SSL Sync), `RB-03` (Circuit Breaker), and `RB-04` (Vault Secrets). |
| **Fleet Topology** | Microservice Mesh | Live Pod specifications, TLS status, CPU/Memory telemetry, and downstream dependency maps. |

---

## 🏃‍♂️ Getting Started

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & **npm**
* **PowerShell** (Windows) or **Bash** (Linux/macOS)

---

### Option 1: Automated 1-Click Startup (Recommended)

Run the automated boot sequence from the root directory:

```powershell
.\start.ps1
```

> **Note:** If PowerShell blocks script execution, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first.

The script automatically sets up virtual environments, installs dependencies, and launches all 3 services:
* 🌐 **Frontend UI:** `http://localhost:5173`
* ⚙️ **Backend SIEM API:** `http://localhost:8000/docs`
* 🧪 **Simulator Microservice:** `http://localhost:8001/docs`

---

### Option 2: Manual Step-by-Step Launch

<details>
<summary><b>Click to expand manual setup instructions</b></summary>

#### 1. Start the Microservice Simulator
```bash
cd simulator
python -m venv venv
.\venv\Scripts\activate      # On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
```

#### 2. Start the Sarathi Backend API
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

#### 3. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```

</details>

---

## 🔌 API & Integration Specifications

Sarathi exposes a REST API for SIEM event ingestion, automated AI triage, and cryptographic countermeasure authorization.

### Key REST Endpoints

| Endpoint | Method | Description | Payload / Response |
| :--- | :--- | :--- | :--- |
| `/api/simulator/state` | `GET` | Retrieves real-time microservice health, P95 latency, and active payload version. | `{ "error_rate": 0.002, "p95_latency_ms": 68, "active_version": "v1.0" }` |
| `/api/simulator/inject-outage` | `POST` | Triggers a simulated production anomaly (DB SSL handshake mismatch, HTTP 500 spike). | `{ "status": "outage_injected", "active_version": "v1.1" }` |
| `/api/incidents/` | `POST` | Autonomously creates an incident ticket upon telemetry SLA breach. | `{ "incident_id": "INC-2026-001", "severity": "CRITICAL" }` |
| `/api/incidents/{id}/investigate` | `POST` | Triggers the LLM heuristics engine to ingest logs and generate a root cause hypothesis. | `{ "diagnosis": { "primary_hypothesis": { "score": 0.94 } } }` |
| `/api/actions/{id}/approve` | `POST` | Validates human commander signature and verifies SHA-256 payload hash. | `{ "status": "approved", "action_hash": "8f9a2b4_sha256" }` |
| `/api/actions/{id}/execute` | `POST` | Executes deterministic runbook and initiates 3-pass telemetry verification. | `{ "status": "mitigated", "verification": "3_pass_passed" }` |

---

## 📜 Automated Incident Response Playbooks

Sarathi maintains a repository of pre-compiled, deterministic runbooks. Each runbook is cryptographically signed with a SHA-256 hash to prevent unauthorized payload tampering.

```json
{
  "runbook_id": "RB-01",
  "action_type": "rollback_deployment",
  "target_service": "payment-api",
  "parameters": {
    "from_revision": "v1.1",
    "to_revision": "v1.0",
    "graceful_shutdown_seconds": 15
  },
  "safety_policy": {
    "require_human_auth": true,
    "sha256_hash": "8f9a2b47c0e12d8a9f3b890a8e7f12a34b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e",
    "verification_strategy": "3_pass_telemetry_probe"
  }
}
```


---

## 🔒 Safety-First Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                   SARATHI SAFETY GUARANTEE                  │
├─────────────────────────────────────────────────────────────┤
│  1. NO RAW SHELL EXECUTION (Zero LLM subprocess spawn)      │
│  2. CRYPTOGRAPHIC SIGNATURES (SHA-256 payload validation)   │
│  3. MANDATORY HUMAN GATING (Explicit operator authorization)│
│  4. DETERMINISTIC 3-PASS VERIFICATION (Automated SLA proof) │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Built by Team Hashiras

* **Team Hashiras** — *Autonomous SRE & AI Cyber-Defense Innovations*

---

<div align="center">
  <sub>Built for Google Cloud Hackathon 2026 // Domain: Technology & Cybersecurity</sub>
</div>
