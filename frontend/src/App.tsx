import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Activity, Terminal, AlertTriangle, 
  Cpu, Lock, CheckCircle, Search, Crosshair,
  Server, Database, GitBranch, Radio, Zap,
  Layers, ArrowUpRight, BarChart3, RefreshCw,
  FileText, ShieldCheck, HardDrive, Sliders,
  ChevronLeft, ChevronRight, LayoutDashboard
} from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SarathiLogo } from './SarathiLogo';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Generates fake live background logs
const generateNormalLog = () => {
  const endpoints = ['/api/v1/checkout', '/api/v1/auth', '/api/v1/validate', '/health'];
  const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
  const ms = Math.floor(Math.random() * 150 + 50);
  return `[payment-api] HTTP 200 OK - ${ep} - ${ms}ms`;
};

// Generates fake threat logs
const generateThreatLog = () => {
  const errors = [
    'FATAL Error 1045 (28000): Access denied for user postgres',
    'Connection pool exhausted (500/500). Circuit breaker OPEN.',
    'HTTP 500 Internal Server Error returned to downstream gateway.',
    'DB_SSL_MODE mismatch (require vs disable). Rejecting handshake.'
  ];
  return errors[Math.floor(Math.random() * errors.length)];
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [bootProgress, setBootProgress] = useState(18);
  const [bootStatus, setBootStatus] = useState('INITIALIZING SENTINEL KERNEL...');

  const [incident, setIncident] = useState<any>(null);
  const [simState, setSimState] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Navigation State: 'dashboard' | 'telemetry' | 'logs' | 'copilot' | 'runbooks' | 'infrastructure'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'telemetry' | 'logs' | 'copilot' | 'runbooks' | 'infrastructure'>('dashboard');
  const [selectedService, setSelectedService] = useState<string>('payment-api');
  const [selectedRunbook, setSelectedRunbook] = useState<string>('RB-01');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [logSearch, setLogSearch] = useState('');

  const [logLevelFilter, setLogLevelFilter] = useState('ALL');
  const [isLogPaused, setIsLogPaused] = useState(false);

  // AI Agent States: IDLE -> GATHERING -> DIAGNOSING -> APPROVAL -> EXECUTING -> RESOLVED
  const [agentState, setAgentState] = useState('IDLE');
  const [actionData, setActionData] = useState<any>(null);
  const [diagData, setDiagData] = useState<any>(null);
  const logStreamRef = useRef<HTMLDivElement>(null);

  // Fast preloader sequence for Team Hashiras
  useEffect(() => {
    const t1 = setTimeout(() => {
      setBootProgress(45);
      setBootStatus('AUTHENTICATING TEAM HASHIRAS SOC ACCESS...');
    }, 300);

    const t2 = setTimeout(() => {
      setBootProgress(78);
      setBootStatus('SYNCHRONIZING TELEMETRY & SHA-256 RUNBOOKS...');
    }, 700);

    const t3 = setTimeout(() => {
      setBootProgress(100);
      setBootStatus('WELCOME TO SARATHI // SOC SYSTEMS ONLINE');
    }, 1100);

    const t4 = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);


  // Poll Simulator
  useEffect(() => {
    const fetchSim = async () => {
      try {
        const res = await fetch(`${API_BASE}/simulator/state`);
        const data = await res.json();
        setSimState(data);
        
        setChartData(prev => {
          const formattedTime = new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' });
          const newData = [...prev, { 
            time: formattedTime, 
            err: parseFloat((data.error_rate * 100).toFixed(1)),
            latency: data.p95_latency_ms
          }];
          if (newData.length > 25) newData.shift();
          return newData;
        });
      } catch (e) {}
    };
    fetchSim();
    const int = setInterval(fetchSim, 1000);
    return () => clearInterval(int);
  }, []);

  // Live Log Streamer
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLogPaused) return;

      const isOutage = simState?.active_version === 'v1.1';
      const isThreatLog = isOutage && Math.random() > 0.3;
      
      const newLog = {
        id: Math.random().toString(),
        time: new Date().toISOString().substring(11, 23),
        level: isThreatLog ? 'CRITICAL' : 'INFO',
        msg: isThreatLog ? generateThreatLog() : generateNormalLog(),
        isError: isThreatLog
      };
      
      setLogs(prev => {
        const next = [...prev, newLog];
        if (next.length > 150) next.shift();
        return next;
      });
      
      if (logStreamRef.current) {
        logStreamRef.current.scrollTop = logStreamRef.current.scrollHeight;
      }
    }, 400);
    return () => clearInterval(interval);
  }, [simState, isLogPaused]);

  const triggerThreat = async () => {
    try {
      await fetch(`${API_BASE}/simulator/inject-outage`, { method: 'POST' });
      const res = await fetch(`${API_BASE}/incidents/`, { method: 'POST' });
      const data = await res.json();
      setIncident(data);
      setAgentState('IDLE');
    } catch (e) {
      console.error("Error triggering threat:", e);
    }
  };

  const deployAgent = async () => {
    setAgentState('GATHERING');
    
    let currentIncident = incident;
    if (!currentIncident || !currentIncident.incident_id) {
      try {
        const res = await fetch(`${API_BASE}/incidents/`, { method: 'POST' });
        currentIncident = await res.json();
        setIncident(currentIncident);
      } catch (e) {
        console.error("Failed to auto-create incident:", e);
      }
    }
    
    const incId = currentIncident?.incident_id || "INC-2026-001";
    
    setTimeout(async () => {
      setAgentState('DIAGNOSING');
      
      try {
        const res = await fetch(`${API_BASE}/incidents/${incId}/investigate`, { method: 'POST' });
        const data = await res.json();
        
        setTimeout(() => {
          setDiagData(data.diagnosis);
          setActionData(data.action_proposed);
          setAgentState('APPROVAL');
        }, 2000);
      } catch (err) {
        console.error("Investigation error:", err);
        setAgentState('IDLE');
      }
      
    }, 2000);
  };

  const authorizeAction = async () => {
    setAgentState('EXECUTING');
    const incId = incident?.incident_id || "INC-2026-001";
    try {
      await fetch(`${API_BASE}/actions/${incId}/approve`, { method: 'POST' });
      await fetch(`${API_BASE}/actions/${incId}/execute`, { method: 'POST' });
      
      setTimeout(() => {
        setAgentState('RESOLVED');
      }, 2500);
    } catch (err) {
      console.error("Authorization error:", err);
    }
  };

  const isOutage = simState?.active_version === 'v1.1';

  return (
    <div className="siem-wrapper">
      {/* Fast Team Hashiras Cyber Preloader */}
      {isLoading && (
        <div className={`preloader-overlay ${bootProgress === 100 ? 'fade-out' : ''}`}>
          <div className="preloader-card">
            <div className="preloader-team-badge">
              <span className="badge-glow-dot" /> TEAM HASHIRAS PRESENTS
            </div>
            
            <div className="preloader-logo-ring">
              <SarathiLogo size={60} />
            </div>

            <h1 className="preloader-brand-title">SARATHI</h1>
            <div className="preloader-brand-subtitle">AUTONOMOUS SIEM & SRE INCIDENT RESPONSE COPILOT</div>
            
            <div className="preloader-welcome-banner">
              <span>WELCOME TO SARATHI</span>
            </div>

            <div className="preloader-progress-box">
              <div className="preloader-track">
                <div className="preloader-fill" style={{ width: `${bootProgress}%` }} />
              </div>
              <div className="preloader-status-row">
                <span className="preloader-status-text">{bootStatus}</span>
                <span className="preloader-status-pct">{bootProgress}%</span>
              </div>
            </div>

            <div className="preloader-footer-tag">
              <span>TEAM HASHIRAS // ENTERPRISE SOC DEFENSE PROTOCOL</span>
            </div>
          </div>
        </div>
      )}

      {/* Google-Style Navigation Drawer / Rail */}
      <aside className={`siem-sidebar ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>

        <div className="sidebar-header">
          <div 
            className="sidebar-brand-group" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            title="Sarathi Autonomous SOC Core"
          >
            <div className="logo-box">
              <SarathiLogo size={22} />
            </div>
            {!isSidebarCollapsed && (
              <div className="brand-text-container">
                <span className="brand-name">SARATHI</span>
                <span className="brand-sub">AUTONOMOUS SIEM</span>
              </div>
            )}
          </div>
          <button 
            className="sidebar-toggle-btn" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <div className="sidebar-scroll-area">
          {/* Section 1: Core Operations */}
          <div className="nav-section">
            {!isSidebarCollapsed && <div className="nav-section-title">CORE OPERATIONS</div>}
            
            <div 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              title="SOC Overview Dashboard"
            >
              <div className="nav-item-icon">
                <LayoutDashboard size={18} />
              </div>
              {!isSidebarCollapsed && (
                <div className="nav-item-label">
                  <span>SOC Overview</span>
                </div>
              )}
              {isOutage && activeTab !== 'dashboard' && <span className="nav-badge alert">!</span>}
            </div>

            <div 
              className={`nav-item ${activeTab === 'telemetry' ? 'active' : ''}`}
              onClick={() => setActiveTab('telemetry')}
              title="Real-Time Telemetry Matrix"
            >
              <div className="nav-item-icon">
                <Activity size={18} />
              </div>
              {!isSidebarCollapsed && (
                <div className="nav-item-label">
                  <span>Telemetry Matrix</span>
                  <span className={`nav-pill-badge ${isOutage ? 'red' : ''}`}>{simState?.p95_latency_ms || 0}ms</span>
                </div>
              )}
            </div>

            <div 
              className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
              title="Live Log Stream Terminal"
            >
              <div className="nav-item-icon">
                <Terminal size={18} />
              </div>
              {!isSidebarCollapsed && (
                <div className="nav-item-label">
                  <span>Live Log Stream</span>
                  <span className={`nav-pill-badge ${isOutage ? 'red' : 'green'}`}>
                    {isOutage ? 'CRITICAL' : 'LIVE'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: AI Automation */}
          <div className="nav-section">
            {!isSidebarCollapsed && <div className="nav-section-title">AI CO-PILOT</div>}
            
            <div 
              className={`nav-item ${activeTab === 'copilot' ? 'active' : (agentState !== 'IDLE' ? 'active-copilot' : '')}`}
              onClick={() => setActiveTab('copilot')}
              title="Autonomous SOC Sentinel"
            >
              <div className="nav-item-icon text-cyan">
                <Cpu size={18} />
              </div>
              {!isSidebarCollapsed && (
                <div className="nav-item-label">
                  <span>AI Investigator</span>
                  <span className="nav-pill-badge cyan">{agentState}</span>
                </div>
              )}
            </div>

            <div 
              className={`nav-item ${activeTab === 'runbooks' ? 'active' : ''}`}
              onClick={() => setActiveTab('runbooks')}
              title="SHA-256 Runbook Policy Engine"
            >
              <div className="nav-item-icon">
                <ShieldCheck size={18} />
              </div>
              {!isSidebarCollapsed && (
                <div className="nav-item-label">
                  <span>Security Runbooks</span>
                  <span className="nav-pill-badge">4 Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Fleet Infrastructure */}
          <div className="nav-section">
            {!isSidebarCollapsed && <div className="nav-section-title">INFRASTRUCTURE</div>}
            
            <div 
              className={`nav-item ${activeTab === 'infrastructure' && selectedService === 'payment-api' ? 'active' : ''}`} 
              onClick={() => { setSelectedService('payment-api'); setActiveTab('infrastructure'); }} 
              title="payment-api Microservice Node"
            >
              <div className="nav-item-icon">
                <Server size={18} />
              </div>
              {!isSidebarCollapsed && (
                <div className="nav-item-label">
                  <span>payment-api</span>
                  <span className={`nav-pill-badge ${isOutage ? 'red' : 'green'}`}>{simState?.active_version || 'v1.0'}</span>
                </div>
              )}
            </div>

            <div 
              className={`nav-item ${activeTab === 'infrastructure' && selectedService === 'db-master' ? 'active' : ''}`} 
              onClick={() => { setSelectedService('db-master'); setActiveTab('infrastructure'); }} 
              title="PostgreSQL Database Cluster"
            >
              <div className="nav-item-icon">
                <Database size={18} />
              </div>
              {!isSidebarCollapsed && (
                <div className="nav-item-label">
                  <span>db-master</span>
                  <span className="nav-pill-badge">5432</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="status-card" title="Backend & Telemetry Online">
            <div className="status-indicator-dot online" />
            {!isSidebarCollapsed && (
              <div className="status-info">
                <span className="status-title">Sarathi SOC Core</span>
                <span className="status-desc">Telemetry Online</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="siem-main">
        {/* Banner positioned cleanly above header bar without floating overlap */}
        {isOutage && (
          <div className="threat-banner">
            <AlertTriangle size={14} className="banner-icon" />
            <span>CRITICAL ANOMALY DETECTED IN PRODUCTION ENVIRONMENT</span>
          </div>
        )}
        
        {/* Top Header Bar (Height: 54px matching sidebar header) */}
        <header className="siem-header">
          <div className="header-brand">
            <div className="brand-badge">
              <SarathiLogo size={20} />
              <span className="brand-title">SARATHI SIEM</span>
            </div>
            <div className="tab-pill">
              {activeTab === 'dashboard' && 'SOC OVERVIEW'}
              {activeTab === 'telemetry' && 'TELEMETRY MATRIX'}
              {activeTab === 'logs' && 'LIVE LOG STREAM'}
              {activeTab === 'copilot' && 'AI INVESTIGATOR & COPILOT'}
              {activeTab === 'runbooks' && 'SECURITY RUNBOOKS (SHA-256)'}
              {activeTab === 'infrastructure' && `FLEET TOPOLOGY // ${selectedService.toUpperCase()}`}
            </div>
          </div>



          <div className="header-controls">
            <button className="btn-control btn-threat" onClick={triggerThreat}>
              <Crosshair size={14} /> <span>Simulate Threat</span>
            </button>
            
            <div className={`system-status-pill ${isOutage ? 'compromised' : 'secured'}`}>
              <div className="status-dot" />
              <span>{isOutage ? 'System Compromised' : 'System Secured'}</span>
            </div>
          </div>
        </header>

        {/* View 1: Main SOC Overview Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="siem-grid">
            
            {/* Top Left: Log Stream Panel */}
            <section className="panel panel-logs">
              <div className="panel-title">
                <div className="title-left">
                  <Terminal size={14} className="title-icon" />
                  <span>Network / App Log Stream</span>
                </div>
                <div className="title-right">
                  <span className={`live-badge ${isOutage ? 'pulse-red' : 'pulse-green'}`}>
                    <span className="badge-dot" /> LIVE
                  </span>
                </div>
              </div>
              <div className="log-stream" ref={logStreamRef}>
                {logs.map(log => (
                  <div key={log.id} className="log-entry">
                    <span className="log-time">[{log.time}]</span>
                    <span className={`log-level-badge level-${log.level}`}>{log.level}</span>
                    <span className={`log-msg ${log.isError ? 'error' : ''}`}>{log.msg}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom Left: Telemetry Matrix Panel */}
            <section className="panel panel-telemetry">
              <div className="panel-title">
                <div className="title-left">
                  <Activity size={14} className="title-icon" />
                  <span>Real-Time Telemetry Matrix</span>
                </div>
                <div className="title-right">
                  <span className="service-tag">PAYMENT-API</span>
                </div>
              </div>
              
              <div className="telemetry-container">
                <div className="kpi-row">
                  <div className="kpi-box">
                    <div className="kpi-lbl">HTTP 500 Errors</div>
                    <div className={`kpi-val ${isOutage ? 'text-red' : 'text-green'}`}>
                      {(simState?.error_rate * 100)?.toFixed(1)}%
                    </div>
                    <div className="kpi-sub">
                      {isOutage ? <span className="trend-up"><ArrowUpRight size={12}/> +47.0% spike</span> : <span className="trend-normal">● Nominal</span>}
                    </div>
                  </div>
                  
                  <div className="kpi-box">
                    <div className="kpi-lbl">P95 Latency</div>
                    <div className={`kpi-val ${isOutage ? 'text-orange' : 'text-green'}`}>
                      {simState?.p95_latency_ms} <span className="kpi-unit">ms</span>
                    </div>
                    <div className="kpi-sub">
                      {isOutage ? <span className="trend-up"><ArrowUpRight size={12}/> Degraded</span> : <span className="trend-normal">● &lt; 100ms Target</span>}
                    </div>
                  </div>
                  
                  <div className="kpi-box">
                    <div className="kpi-lbl">Active Payload</div>
                    <div className="kpi-val text-cyan">{simState?.active_version || 'v1.0'}</div>
                    <div className="kpi-sub">
                      <span className="trend-normal">Canary Release</span>
                    </div>
                  </div>
                </div>

                <div className="chart-area">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isOutage ? "#ff2a4d" : "#00ff88"} stopOpacity={0.35}/>
                          <stop offset="95%" stopColor={isOutage ? "#ff2a4d" : "#00ff88"} stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} tickFormatter={(val) => `${val}%`} />
                      <Tooltip 
                        contentStyle={{ background: '#0a0d14', borderColor: '#1e293b', borderRadius: '6px', fontSize: '11px', color: '#fff' }} 
                        formatter={(value: any) => [`${value}%`, 'Error Rate']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="err" 
                        stroke={isOutage ? "#ff2a4d" : "#00ff88"} 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#chartGrad)" 
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Right Column: Autonomous SOC Copilot Panel */}
            <section className="panel agent-panel panel-copilot">
              <div className="panel-title agent-header">
                <div className="title-left">
                  <Cpu size={14} className="title-icon text-cyan" />
                  <span>Autonomous SOC Copilot</span>
                </div>
                <div className="copilot-badge">AI AGENT ONLINE</div>
              </div>
              
              {agentState === 'IDLE' ? (
                <div className="copilot-idle-container">
                  {isOutage ? (
                    <div className="agent-alert-card">
                      <div className="alert-icon-ring">
                        <AlertTriangle size={32} className="text-red" />
                      </div>
                      <h3 className="alert-title">CRITICAL THREAT DETECTED</h3>
                      <p className="alert-desc">Automated telemetry detected DB_SSL_MODE config drift in payment-api payload v1.1. Deploy Copilot for immediate root-cause mitigation.</p>
                      <button className="btn-deploy" onClick={deployAgent}>
                        <Zap size={15} /> Deploy AI Investigator
                      </button>
                    </div>
                  ) : (
                    <div className="copilot-dashboard-idle">
                      {/* Security Engine Overview */}
                      <div className="copilot-card">
                        <div className="card-header-sm">
                          <ShieldCheck size={14} className="text-cyan" />
                          <span>AI Sentinel Engine Status</span>
                        </div>
                        <div className="copilot-stat-grid">
                          <div className="stat-item">
                            <span className="stat-lbl">Integrity Score</span>
                            <span className="stat-val text-green">99.8%</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-lbl">Active Policy</span>
                            <span className="stat-val text-cyan">8f9a2b4</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-lbl">Runbooks</span>
                            <span className="stat-val text-main">4 Loaded</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-lbl">LLM Heuristics</span>
                            <span className="stat-val text-green">Active</span>
                          </div>
                        </div>
                      </div>

                      {/* Microservice Watch Matrix */}
                      <div className="copilot-card">
                        <div className="card-header-sm">
                          <Sliders size={14} className="text-cyan" />
                          <span>Active Monitor Sensor Grid</span>
                        </div>
                        <div className="sensor-list">
                          <div className="sensor-row">
                            <span className="sensor-name">payment-api</span>
                            <span className="sensor-status good">Nominal (v1.0)</span>
                          </div>
                          <div className="sensor-row">
                            <span className="sensor-name">db-master</span>
                            <span className="sensor-status good">5432 / SSL OK</span>
                          </div>
                          <div className="sensor-row">
                            <span className="sensor-name">argocd-sync</span>
                            <span className="sensor-status good">In Sync</span>
                          </div>
                        </div>
                      </div>

                      {/* Standby Banner */}
                      <div className="standby-card">
                        <div className="standby-text">
                          <strong>System Baseline Secured</strong>
                          <span>Continuous anomaly detection active.</span>
                        </div>
                        <button className="btn-control btn-threat" onClick={triggerThreat} style={{ alignSelf: 'center' }}>
                          <Crosshair size={13} /> Simulate Threat
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              ) : (
                <div className="ai-steps">
                  {/* Step 1: Ingestion */}
                  <div className="ai-step">
                    <div className={`step-icon ${agentState !== 'IDLE' ? 'done' : 'active'}`}>
                      {agentState === 'GATHERING' ? <div className="spinner" /> : <CheckCircle size={14} />}
                    </div>
                    <div className="step-content">
                      <div className="step-title">Ingesting Telemetry & Logs</div>
                      <div className="step-desc">Correlating logs from ElasticSearch, Prometheus, and ArgoCD.</div>
                    </div>
                  </div>

                  {/* Step 2: Diagnosis */}
                  {(agentState === 'DIAGNOSING' || agentState === 'APPROVAL' || agentState === 'EXECUTING' || agentState === 'RESOLVED') && (
                    <div className="ai-step">
                      <div className={`step-icon ${['APPROVAL', 'EXECUTING', 'RESOLVED'].includes(agentState) ? 'done' : 'active'}`}>
                        {agentState === 'DIAGNOSING' ? <div className="spinner" /> : <CheckCircle size={14} />}
                      </div>
                      <div className="step-content">
                        <div className="step-title">Executing LLM Root Cause Heuristics</div>
                        {diagData && (
                          <div className="step-desc-box">
                            <span className="hypothesis-tag">&gt; {diagData.primary_hypothesis.title}</span>
                            <span className="confidence-pill">Confidence: {(diagData.primary_hypothesis.score * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Authorization */}
                  {(agentState === 'APPROVAL' || agentState === 'EXECUTING' || agentState === 'RESOLVED') && (
                    <div className="ai-step vertical">
                      <div className="step-header-row">
                        <div className={`step-icon ${agentState !== 'APPROVAL' ? 'done' : 'active'}`}>
                          {agentState === 'APPROVAL' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                        </div>
                        <div className="step-content">
                          <div className="step-title">Formulating Countermeasure</div>
                          <div className="step-desc">Deterministically matching anomaly to authorized runbooks.</div>
                        </div>
                      </div>
                      
                      {agentState === 'APPROVAL' && actionData && (
                        <div className="approval-card">
                          <div className="approval-header">
                            <Lock size={15} /> <span>HUMAN AUTHORIZATION REQUIRED</span>
                          </div>
                          <div className="approval-body">
                            <div className="auth-data-grid">
                              <div className="auth-lbl">RUNBOOK:</div>
                              <div className="auth-val hl">{actionData.action_type.toUpperCase()}</div>
                              <div className="auth-lbl">TARGET ENV:</div>
                              <div className="auth-val">{actionData.target.deployment}:{actionData.target.desired_revision}</div>
                              <div className="auth-lbl">HASH SIG:</div>
                              <div className="auth-val hash-sig">8f9a2b4_sha256_verified</div>
                              <div className="auth-lbl">RISK VECTOR:</div>
                              <div className="auth-val text-red">CRITICAL SYSTEM MUTATION</div>
                            </div>
                            <button className="btn-authorize" onClick={authorizeAction}>
                              AUTHORIZE PROTOCOL
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Resolution */}
                  {(agentState === 'EXECUTING' || agentState === 'RESOLVED') && (
                    <div className="ai-step vertical">
                      <div className="step-header-row">
                        <div className={`step-icon ${agentState === 'RESOLVED' ? 'done' : 'active'}`}>
                          {agentState === 'EXECUTING' ? <div className="spinner" /> : <CheckCircle size={14} />}
                        </div>
                        <div className="step-content">
                          <div className="step-title">Executing & Verifying</div>
                          <div className="step-desc">Deploying rollback and running telemetry verification.</div>
                        </div>
                      </div>
                      
                      {agentState === 'RESOLVED' && (
                        <div className="report-card">
                          <div className="report-header">
                            <CheckCircle size={15} /> <span>INCIDENT MITIGATED - POST MORTEM</span>
                          </div>
                          <div className="report-body">
                            <div><strong>Incident:</strong> Payment API Service Disruption</div>
                            <div><strong>Time to Mitigate:</strong> &lt; 1 min (Autonomous)</div>
                            <div><strong>Root Cause:</strong> DB_SSL_MODE configuration drift in v1.1.</div>
                            <div><strong>Resolution:</strong> Rollback active payload to v1.0.</div>
                            <div className="report-footer text-cyan">&gt; System healthy. Monitoring protocols restored.</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </section>

          </div>
        )}

        {/* View 2: Telemetry Matrix Tab */}
        {activeTab === 'telemetry' && (
          <div className="tab-view-container">
            <div className="panel flex-1">
              <div className="panel-title">
                <div className="title-left">
                  <Activity size={14} className="title-icon" />
                  <span>Telemetry & Health Analytics Matrix</span>
                </div>
                <div className="title-right">
                  <span className={`live-badge ${isOutage ? 'pulse-red' : 'pulse-green'}`}>
                    <span className="badge-dot" /> LIVE SENSOR STREAM
                  </span>
                </div>
              </div>

              <div className="telemetry-expanded">
                {/* Metric Summary Bar */}
                <div className="kpi-row grid-4">
                  <div className="kpi-box">
                    <div className="kpi-lbl">HTTP 500 ERROR RATE</div>
                    <div className={`kpi-val ${isOutage ? 'text-red' : 'text-green'}`}>
                      {(simState?.error_rate * 100)?.toFixed(1)}%
                    </div>
                    <div className="kpi-sub">
                      {isOutage ? <span className="trend-up"><ArrowUpRight size={12}/> Critical Anomaly</span> : <span className="trend-normal">● Baseline Normal</span>}
                    </div>
                  </div>

                  <div className="kpi-box">
                    <div className="kpi-lbl">P95 RESPONSE LATENCY</div>
                    <div className={`kpi-val ${isOutage ? 'text-orange' : 'text-green'}`}>
                      {simState?.p95_latency_ms} <span className="kpi-unit">ms</span>
                    </div>
                    <div className="kpi-sub">
                      {isOutage ? <span className="trend-up"><ArrowUpRight size={12}/> Degraded (Target &lt;100ms)</span> : <span className="trend-normal">● Nominal Response</span>}
                    </div>
                  </div>

                  <div className="kpi-box">
                    <div className="kpi-lbl">ACTIVE SERVICE PAYLOAD</div>
                    <div className="kpi-val text-cyan">{simState?.active_version || 'v1.0'}</div>
                    <div className="kpi-sub"><span className="trend-normal">ArgoCD Production Payload</span></div>
                  </div>

                  <div className="kpi-box">
                    <div className="kpi-lbl">DB CONNECTION FAILURES</div>
                    <div className={`kpi-val ${isOutage ? 'text-red' : 'text-green'}`}>
                      {(simState?.db_error_rate * 100)?.toFixed(1)}%
                    </div>
                    <div className="kpi-sub">
                      {isOutage ? <span className="trend-up"><ArrowUpRight size={12}/> SSL Handshake Refused</span> : <span className="trend-normal">● 100% Pool Healthy</span>}
                    </div>
                  </div>
                </div>

                {/* Expanded High-Impact Chart */}
                <div className="chart-wrapper-expanded">
                  <div className="chart-header-bar">
                    <div className="chart-title"><BarChart3 size={14} /> Real-Time Error Spike Analytics (%)</div>
                    <div className="chart-legend">
                      <span className="legend-dot" style={{ background: isOutage ? '#ff2a4d' : '#00ff88' }} /> Error Rate (%)
                    </div>
                  </div>

                  <div className="expanded-chart-body">
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="expandedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isOutage ? "#ff2a4d" : "#00ff88"} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={isOutage ? "#ff2a4d" : "#00ff88"} stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                        <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} />
                        <Tooltip 
                          contentStyle={{ background: '#0a0d14', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="err" 
                          stroke={isOutage ? "#ff2a4d" : "#00ff88"} 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#expandedGrad)"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Service Health Cards Grid */}
                <div className="service-health-section">
                  <div className="section-title">Microservice Node Status Matrix</div>
                  <div className="service-health-grid">
                    <div className="health-card">
                      <div className="card-top">
                        <Server size={18} className="card-icon" />
                        <span className={`health-badge ${isOutage ? 'bad' : 'good'}`}>
                          {isOutage ? 'Degraded (v1.1)' : 'Healthy (v1.0)'}
                        </span>
                      </div>
                      <div className="health-name">payment-api</div>
                      <div className="health-detail">
                        <span>Latency: {simState?.p95_latency_ms}ms</span>
                        <span>Uptime: 99.94%</span>
                      </div>
                    </div>

                    <div className="health-card">
                      <div className="card-top">
                        <Database size={18} className="card-icon" />
                        <span className={`health-badge ${isOutage ? 'bad' : 'good'}`}>
                          {isOutage ? 'Auth Failed (SSL)' : 'Connected'}
                        </span>
                      </div>
                      <div className="health-name">db-master (PostgreSQL)</div>
                      <div className="health-detail">
                        <span>Pool: {isOutage ? '0/500 Active' : '42/500 Active'}</span>
                        <span>Port: 5432</span>
                      </div>
                    </div>

                    <div className="health-card">
                      <div className="card-top">
                        <GitBranch size={18} className="card-icon" />
                        <span className="health-badge good">Sync OK</span>
                      </div>
                      <div className="health-name">argocd-pipeline</div>
                      <div className="health-detail">
                        <span>Branch: main</span>
                        <span>Revision: 8f9a2b4</span>
                      </div>
                    </div>

                    <div className="health-card">
                      <div className="card-top">
                        <Radio size={18} className="card-icon" />
                        <span className="health-badge good">Scraping (1s)</span>
                      </div>
                      <div className="health-name">prometheus-exporter</div>
                      <div className="health-detail">
                        <span>Metrics: 1,420/s</span>
                        <span>Status: 200 OK</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* View 3: Log Explorer Terminal Tab */}
        {activeTab === 'logs' && (
          <div className="tab-view-container">
            <div className="panel flex-1">
              <div className="panel-title">
                <div className="title-left">
                  <Terminal size={14} className="title-icon" />
                  <span>SIEM Live Event Log Explorer</span>
                </div>
                <div className="title-right">
                  <button className="btn-control" onClick={() => setIsLogPaused(!isLogPaused)}>
                    {isLogPaused ? <><RefreshCw size={12}/> Resume Stream</> : '❚❚ Pause Stream'}
                  </button>
                  <span className={`live-badge ${isLogPaused ? 'orange' : (isOutage ? 'pulse-red' : 'pulse-green')}`}>
                    <span className="badge-dot" /> {isLogPaused ? 'PAUSED' : 'LIVE STREAM'}
                  </span>
                </div>
              </div>

              {/* Toolbar */}
              <div className="log-toolbar">
                <div className="search-box">
                  <Search size={14} />
                  <input 
                    type="text" 
                    placeholder="Search logs by keyword, endpoint, or error code..." 
                    value={logSearch} 
                    onChange={e => setLogSearch(e.target.value)} 
                  />
                </div>
                
                <div className="filter-buttons">
                  {['ALL', 'CRITICAL', 'WARN', 'INFO'].map(lvl => (
                    <button 
                      key={lvl} 
                      className={`filter-btn ${logLevelFilter === lvl ? 'active' : ''}`}
                      onClick={() => setLogLevelFilter(lvl)}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal Output */}
              <div className="log-stream-expanded" ref={logStreamRef}>
                {logs
                  .filter(l => logLevelFilter === 'ALL' || l.level === logLevelFilter)
                  .filter(l => !logSearch || l.msg.toLowerCase().includes(logSearch.toLowerCase()) || l.level.toLowerCase().includes(logSearch.toLowerCase()))
                  .map((log, idx) => (
                    <div key={log.id} className="log-entry expanded">
                      <span className="log-line-num">{idx + 1}</span>
                      <span className="log-time">[{log.time}]</span>
                      <span className={`log-level-badge level-${log.level}`}>{log.level}</span>
                      <span className={`log-msg ${log.isError ? 'error' : ''}`}>{log.msg}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* View 4: AI Investigator & Copilot Console */}
        {activeTab === 'copilot' && (
          <div className="tab-view-container">
            <div className="panel flex-1">
              <div className="panel-title">
                <div className="title-left">
                  <Cpu size={14} className="title-icon text-cyan" />
                  <span>Autonomous AI Investigator & SOC Sentinel Console</span>
                </div>
                <div className="title-right">
                  <span className={`live-badge ${agentState !== 'IDLE' ? 'pulse-cyan' : 'pulse-green'}`}>
                    <span className="badge-dot" /> AGENT STATUS: {agentState}
                  </span>
                </div>
              </div>

              <div className="copilot-full-view">
                {/* Top Metrics Row */}
                <div className="kpi-row grid-4">
                  <div className="kpi-box">
                    <div className="kpi-lbl">LLM REASONING ENGINE</div>
                    <div className="kpi-val text-cyan">Active</div>
                    <div className="kpi-sub"><span className="trend-normal">Gemini Heuristics Model</span></div>
                  </div>
                  <div className="kpi-box">
                    <div className="kpi-lbl">INTEGRITY & TRUST SCORE</div>
                    <div className="kpi-val text-green">99.8%</div>
                    <div className="kpi-sub"><span className="trend-normal">● Deterministic Guardrails</span></div>
                  </div>
                  <div className="kpi-box">
                    <div className="kpi-lbl">ACTIVE INCIDENTS</div>
                    <div className={`kpi-val ${isOutage ? 'text-red' : 'text-green'}`}>{isOutage ? '1 Critical' : '0 Active'}</div>
                    <div className="kpi-sub">{isOutage ? <span className="trend-up">PAYMENT-API DB DRIFT</span> : <span className="trend-normal">● Nominal Monitoring</span>}</div>
                  </div>
                  <div className="kpi-box">
                    <div className="kpi-lbl">RUNBOOK HASH VERIFIER</div>
                    <div className="kpi-val text-cyan">SHA-256</div>
                    <div className="kpi-sub"><span className="trend-normal">Zero-Shell Direct Execution</span></div>
                  </div>
                </div>

                {/* AI Investigation Timeline & Control */}
                <div className="copilot-body-grid">
                  <div className="copilot-action-card">
                    <div className="card-header-sm">
                      <Zap size={14} className="text-cyan" />
                      <span>Autonomous Investigation Workflow</span>
                    </div>

                    {isOutage && agentState === 'IDLE' && (
                      <div className="agent-alert-card" style={{ marginTop: '10px' }}>
                        <div className="alert-icon-ring">
                          <AlertTriangle size={32} className="text-red" />
                        </div>
                        <h3 className="alert-title">CRITICAL PRODUCTION ANOMALY</h3>
                        <p className="alert-desc">Anomalous spike in HTTP 500 error rate (47.0%) detected following payment-api v1.1 canary rollout. Deploy the AI investigator to correlate logs and isolate root cause.</p>
                        <button className="btn-deploy" onClick={deployAgent}>
                          <Zap size={15} /> Launch Autonomous Investigation
                        </button>
                      </div>
                    )}

                    {agentState !== 'IDLE' && (
                      <div className="ai-steps" style={{ padding: '0.5rem 0' }}>
                        <div className="ai-step">
                          <div className={`step-icon ${agentState !== 'IDLE' ? 'done' : 'active'}`}>
                            {agentState === 'GATHERING' ? <div className="spinner" /> : <CheckCircle size={14} />}
                          </div>
                          <div className="step-content">
                            <div className="step-title">Ingesting Telemetry & Multi-Modal Logs</div>
                            <div className="step-desc">Correlated 1,420 events from ElasticSearch, Prometheus, and ArgoCD deployment logs.</div>
                          </div>
                        </div>

                        {['DIAGNOSING', 'APPROVAL', 'EXECUTING', 'RESOLVED'].includes(agentState) && (
                          <div className="ai-step">
                            <div className={`step-icon ${['APPROVAL', 'EXECUTING', 'RESOLVED'].includes(agentState) ? 'done' : 'active'}`}>
                              {agentState === 'DIAGNOSING' ? <div className="spinner" /> : <CheckCircle size={14} />}
                            </div>
                            <div className="step-content">
                              <div className="step-title">Root Cause Diagnosis via LLM Heuristics</div>
                              {diagData && (
                                <div className="step-desc-box">
                                  <span className="hypothesis-tag">&gt; {diagData.primary_hypothesis.title}</span>
                                  <span className="confidence-pill">Confidence Score: {(diagData.primary_hypothesis.score * 100).toFixed(0)}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {['APPROVAL', 'EXECUTING', 'RESOLVED'].includes(agentState) && (
                          <div className="ai-step vertical">
                            <div className="step-header-row">
                              <div className={`step-icon ${agentState !== 'APPROVAL' ? 'done' : 'active'}`}>
                                {agentState === 'APPROVAL' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                              </div>
                              <div className="step-content">
                                <div className="step-title">Formulating Cryptographic Countermeasure</div>
                                <div className="step-desc">Mapped anomaly to authorized Runbook RB-01 (Rollback Deployment).</div>
                              </div>
                            </div>

                            {agentState === 'APPROVAL' && actionData && (
                              <div className="approval-card">
                                <div className="approval-header">
                                  <Lock size={15} /> <span>HUMAN COMMANDER AUTHORIZATION REQUIRED</span>
                                </div>
                                <div className="approval-body">
                                  <div className="auth-data-grid">
                                    <div className="auth-lbl">TARGET ENV:</div>
                                    <div className="auth-val">{actionData.target.deployment}:{actionData.target.desired_revision}</div>
                                    <div className="auth-lbl">HASH SIG:</div>
                                    <div className="auth-val hash-sig">8f9a2b4_sha256_verified</div>
                                    <div className="auth-lbl">RISK VECTOR:</div>
                                    <div className="auth-val text-red">CRITICAL SYSTEM MUTATION</div>
                                  </div>
                                  <button className="btn-authorize" onClick={authorizeAction}>
                                    AUTHORIZE EXACT COUNTERMEASURE
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {['EXECUTING', 'RESOLVED'].includes(agentState) && (
                          <div className="ai-step vertical">
                            <div className="step-header-row">
                              <div className={`step-icon ${agentState === 'RESOLVED' ? 'done' : 'active'}`}>
                                {agentState === 'EXECUTING' ? <div className="spinner" /> : <CheckCircle size={14} />}
                              </div>
                              <div className="step-content">
                                <div className="step-title">Deterministic Execution & 3-Pass Telemetry Verification</div>
                                <div className="step-desc">Applying version rollback to v1.0 and validating latency recovery.</div>
                              </div>
                            </div>

                            {agentState === 'RESOLVED' && (
                              <div className="report-card">
                                <div className="report-header">
                                  <CheckCircle size={15} /> <span>INCIDENT RESOLVED — POST MORTEM GENERATED</span>
                                </div>
                                <div className="report-body">
                                  <div><strong>Incident:</strong> Payment API DB Handshake Failure</div>
                                  <div><strong>Mitigation Time:</strong> 12.4s (Autonomous Loop)</div>
                                  <div><strong>Root Cause:</strong> DB_SSL_MODE config drift in canary v1.1.</div>
                                  <div><strong>Resolution:</strong> Rollback active payload to v1.0.</div>
                                  <div className="report-footer text-cyan">&gt; System baseline restored. All health checks nominal.</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {!isOutage && agentState === 'IDLE' && (
                      <div className="standby-card" style={{ marginTop: '10px' }}>
                        <div className="standby-text">
                          <strong>Sentinel Active & Monitoring</strong>
                          <span>Continuous anomaly heuristic stream engaged across payment-api, postgres, and envoy-gateway.</span>
                        </div>
                        <button className="btn-control btn-threat" onClick={triggerThreat} style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
                          <Crosshair size={13} /> Simulate Outage Anomaly
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Security Policy Engine Specs */}
                  <div className="copilot-policy-card">
                    <div className="card-header-sm">
                      <ShieldCheck size={14} className="text-cyan" />
                      <span>Autonomous Safety Boundary Engine</span>
                    </div>

                    <div className="policy-item-box">
                      <div className="policy-title">No-Raw-Shell Enforcement</div>
                      <div className="policy-desc">LLM agents are cryptographically forbidden from issuing ad-hoc bash or kubectl commands. All actions map to pre-compiled deterministic code.</div>
                    </div>

                    <div className="policy-item-box">
                      <div className="policy-title">Human-in-the-Loop Gating</div>
                      <div className="policy-desc">High and Critical risk vectors pause execution and require explicit cryptographic authorization signature from an authenticated operator.</div>
                    </div>

                    <div className="policy-item-box">
                      <div className="policy-title">3-Pass Verification Loop</div>
                      <div className="policy-desc">Post-action execution automatically monitors telemetry for 3 consecutive nominal intervals before marking incident as resolved.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 5: Security Runbooks Hub (SHA-256) */}
        {activeTab === 'runbooks' && (
          <div className="tab-view-container">
            <div className="panel flex-1">
              <div className="panel-title">
                <div className="title-left">
                  <ShieldCheck size={14} className="title-icon text-cyan" />
                  <span>Deterministic Security Runbooks Registry (SHA-256 Verified)</span>
                </div>
                <div className="title-right">
                  <span className="live-badge pulse-green">
                    <span className="badge-dot" /> 4 RUNBOOKS COMPILED
                  </span>
                </div>
              </div>

              <div className="runbooks-container">
                <div className="runbooks-grid">
                  {[
                    { id: 'RB-01', title: 'ROLLBACK_DEPLOYMENT', target: 'payment-api (Canary v1.1 -> v1.0)', risk: 'MEDIUM', hash: '8f9a2b47c0e12d8a9f3b_sha256', desc: 'Safely rolls back production workload to previously verified container revision without state corruption.', passes: '3-Pass Health' },
                    { id: 'RB-02', title: 'DB_SSL_PARAM_SYNC', target: 'db-master (PostgreSQL 16)', risk: 'HIGH', hash: '4e2c91a0b3f8e5c7a1d2_sha256', desc: 'Re-synchronizes DB_SSL_MODE credentials and forces TLS 1.3 handshake negotiation.', passes: 'Connection Pool Audit' },
                    { id: 'RB-03', title: 'CIRCUIT_BREAKER_ISOLATION', target: 'envoy-gateway:443', risk: 'LOW', hash: '1b98f23c4a7e9d0b8f1c_sha256', desc: 'Engages upstream circuit breaker shedding degraded endpoints and routes traffic to warm fallback.', passes: 'Latency SLA Verification' },
                    { id: 'RB-04', title: 'ROTATE_SECRET_CREDENTIALS', target: 'vault-cluster:8200', risk: 'CRITICAL', hash: '6d38e01f9a2c4b5e7d8a_sha256', desc: 'Automates zero-downtime secret lease rotation and updates microservice runtime environment variables.', passes: 'Zero-Downtime Lease Check' }
                  ].map(rb => (
                    <div 
                      key={rb.id} 
                      className={`runbook-card ${selectedRunbook === rb.id ? 'selected' : ''}`}
                      onClick={() => setSelectedRunbook(rb.id)}
                    >
                      <div className="rb-card-top">
                        <span className="rb-id">{rb.id}</span>
                        <span className={`rb-risk ${rb.risk.toLowerCase()}`}>{rb.risk} RISK</span>
                      </div>
                      <div className="rb-name">{rb.title}</div>
                      <div className="rb-target"><strong>Target:</strong> {rb.target}</div>
                      <div className="rb-desc">{rb.desc}</div>
                      <div className="rb-hash-row">
                        <Lock size={12} /> <span>{rb.hash}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Runbook Detailed Inspector */}
                <div className="runbook-inspector">
                  <div className="inspector-header">
                    <FileText size={14} className="text-cyan" />
                    <span>Runbook Execution Schema Inspector: <strong>{selectedRunbook}</strong></span>
                  </div>
                  <div className="inspector-content">
                    <div className="schema-json">
                      {selectedRunbook === 'RB-01' && (
                        <pre>{`{
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
}`}</pre>
                      )}
                      {selectedRunbook === 'RB-02' && (
                        <pre>{`{
  "runbook_id": "RB-02",
  "action_type": "db_ssl_sync",
  "target_service": "postgresql-master",
  "parameters": {
    "ssl_mode": "require",
    "tls_min_version": "TLSv1.3",
    "max_pool_connections": 500
  },
  "safety_policy": {
    "require_human_auth": true,
    "sha256_hash": "4e2c91a0b3f8e5c7a1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
    "verification_strategy": "handshake_probe_pool"
  }
}`}</pre>
                      )}
                      {selectedRunbook === 'RB-03' && (
                        <pre>{`{
  "runbook_id": "RB-03",
  "action_type": "circuit_breaker_isolation",
  "target_service": "envoy-gateway",
  "parameters": {
    "trip_error_threshold_pct": 25,
    "timeout_ms": 200,
    "recovery_seconds": 60
  },
  "safety_policy": {
    "require_human_auth": false,
    "sha256_hash": "1b98f23c4a7e9d0b8f1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a",
    "verification_strategy": "upstream_http_probe"
  }
}`}</pre>
                      )}
                      {selectedRunbook === 'RB-04' && (
                        <pre>{`{
  "runbook_id": "RB-04",
  "action_type": "rotate_secret_credentials",
  "target_service": "vault-cluster",
  "parameters": {
    "lease_ttl_hours": 24,
    "grace_period_minutes": 10,
    "restart_policy": "rolling"
  },
  "safety_policy": {
    "require_human_auth": true,
    "sha256_hash": "6d38e01f9a2c4b5e7d8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e",
    "verification_strategy": "dual_lease_handshake"
  }
}`}</pre>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 6: Infrastructure & Fleet Topology */}
        {activeTab === 'infrastructure' && (
          <div className="tab-view-container">
            <div className="panel flex-1">
              <div className="panel-title">
                <div className="title-left">
                  <Server size={14} className="title-icon text-cyan" />
                  <span>Infrastructure Node Matrix & Fleet Topology: <strong>{selectedService.toUpperCase()}</strong></span>
                </div>
                <div className="title-right">
                  <span className={`live-badge ${isOutage && selectedService === 'payment-api' ? 'pulse-red' : 'pulse-green'}`}>
                    <span className="badge-dot" /> {isOutage && selectedService === 'payment-api' ? 'DEGRADED' : 'HEALTHY'}
                  </span>
                </div>
              </div>

              <div className="infra-view-container">
                {/* Node Selector Pills */}
                <div className="service-tab-selector">
                  {['payment-api', 'db-master', 'argocd-pipeline', 'prometheus-exporter', 'envoy-gateway'].map(srv => (
                    <button
                      key={srv}
                      className={`service-select-btn ${selectedService === srv ? 'active' : ''}`}
                      onClick={() => setSelectedService(srv)}
                    >
                      <span className="service-dot" style={{ background: (isOutage && srv === 'payment-api') || (isOutage && srv === 'db-master') ? '#ff2a5f' : '#00ff9d' }} />
                      {srv}
                    </button>
                  ))}
                </div>

                {/* Node Detail Cards */}
                <div className="infra-grid">
                  <div className="infra-card">
                    <div className="infra-card-title">Runtime & Pod Specifications</div>
                    <div className="infra-spec-grid">
                      <div className="spec-item"><span className="spec-lbl">SERVICE NAME:</span><span className="spec-val">{selectedService}</span></div>
                      <div className="spec-item"><span className="spec-lbl">ENVIRONMENT:</span><span className="spec-val">production-gcp-east4</span></div>
                      <div className="spec-item"><span className="spec-lbl">ACTIVE PAYLOAD:</span><span className="spec-val text-cyan">{selectedService === 'payment-api' ? (simState?.active_version || 'v1.0') : 'v2.4.1'}</span></div>
                      <div className="spec-item"><span className="spec-lbl">REPLICAS:</span><span className="spec-val">8/8 Pods Ready</span></div>
                      <div className="spec-item"><span className="spec-lbl">UPTIME:</span><span className="spec-val text-green">99.94% (42d 18h)</span></div>
                      <div className="spec-item"><span className="spec-lbl">TLS STATUS:</span><span className="spec-val text-green">TLS 1.3 Active</span></div>
                    </div>
                  </div>

                  <div className="infra-card">
                    <div className="infra-card-title">Real-Time Performance Metrics</div>
                    <div className="infra-spec-grid">
                      <div className="spec-item"><span className="spec-lbl">P95 LATENCY:</span><span className="spec-val">{simState?.p95_latency_ms || 68} ms</span></div>
                      <div className="spec-item"><span className="spec-lbl">HTTP ERROR RATE:</span><span className={`spec-val ${isOutage ? 'text-red' : 'text-green'}`}>{(simState?.error_rate * 100)?.toFixed(1)}%</span></div>
                      <div className="spec-item"><span className="spec-lbl">CPU ALLOCATION:</span><span className="spec-val">1.2 / 4.0 Cores (30%)</span></div>
                      <div className="spec-item"><span className="spec-lbl">MEMORY USAGE:</span><span className="spec-val">480 MB / 2.0 GB</span></div>
                    </div>
                  </div>
                </div>

                {/* Microservice Dependency Topology */}
                <div className="topology-card">
                  <div className="infra-card-title">Downstream Dependency Mesh Map</div>
                  <div className="dependency-chain">
                    <div className="dep-node gateway">
                      <span className="dep-type">INGRESS</span>
                      <span className="dep-name">envoy-gateway:443</span>
                      <span className="dep-status good">Healthy</span>
                    </div>
                    <div className="dep-arrow">⟶</div>
                    <div className={`dep-node target ${isOutage ? 'degraded' : ''}`}>
                      <span className="dep-type">CORE WORKLOAD</span>
                      <span className="dep-name">{selectedService}</span>
                      <span className={`dep-status ${isOutage ? 'bad' : 'good'}`}>{isOutage ? 'Degraded v1.1' : 'Active v1.0'}</span>
                    </div>
                    <div className="dep-arrow">⟶</div>
                    <div className={`dep-node db ${isOutage ? 'degraded' : ''}`}>
                      <span className="dep-type">PERSISTENCE</span>
                      <span className="dep-name">db-master (PostgreSQL:5432)</span>
                      <span className={`dep-status ${isOutage ? 'bad' : 'good'}`}>{isOutage ? 'Handshake Error' : 'Pool OK (42/500)'}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;

