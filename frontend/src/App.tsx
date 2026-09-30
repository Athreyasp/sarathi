import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Activity, Terminal, AlertTriangle, 
  Cpu, Lock, CheckCircle, Search, Crosshair 
} from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import './index.css';

const API_BASE = 'http://localhost:8000/api';

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
    'FATAL Error 1045 (28000): Access denied for user',
    'Connection pool exhausted. Circuit breaker OPEN.',
    'HTTP 500 Internal Server Error returned to downstream gateway.',
    'DB_SSL_MODE mismatch. Rejecting connection.'
  ];
  return errors[Math.floor(Math.random() * errors.length)];
};

function App() {
  const [incident, setIncident] = useState<any>(null);
  const [simState, setSimState] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // AI Agent States: IDLE -> GATHERING -> DIAGNOSING -> APPROVAL -> EXECUTING -> RESOLVED
  const [agentState, setAgentState] = useState('IDLE');
  const [actionData, setActionData] = useState<any>(null);
  const [diagData, setDiagData] = useState<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Poll Simulator
  useEffect(() => {
    const fetchSim = async () => {
      try {
        const res = await fetch(`${API_BASE}/simulator/state`);
        const data = await res.json();
        setSimState(data);
        
        setChartData(prev => {
          const newData = [...prev, { time: Date.now(), err: data.error_rate * 100 }];
          if (newData.length > 30) newData.shift();
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
        if (next.length > 100) next.shift(); // keep last 100
        return next;
      });
      
      // Auto-scroll
      if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView();
      }
    }, 400); // Fast log scrolling
    return () => clearInterval(interval);
  }, [simState]);

  const triggerThreat = async () => {
    await fetch(`${API_BASE}/simulator/inject-outage`, { method: 'POST' });
    const res = await fetch(`${API_BASE}/incidents/`, { method: 'POST' });
    setIncident(await res.json());
    setAgentState('IDLE');
  };

  const deployAgent = async () => {
    setAgentState('GATHERING');
    
    // Simulate AI thinking time for the judges
    setTimeout(async () => {
      setAgentState('DIAGNOSING');
      
      const res = await fetch(`${API_BASE}/incidents/${incident.incident_id}/investigate`, { method: 'POST' });
      const data = await res.json();
      
      setTimeout(() => {
        setDiagData(data.diagnosis);
        setActionData(data.action_proposed);
        setAgentState('APPROVAL');
      }, 2000); // 2 seconds diagnosing
      
    }, 2000); // 2 seconds gathering
  };

  const authorizeAction = async () => {
    setAgentState('EXECUTING');
    await fetch(`${API_BASE}/actions/${incident.incident_id}/approve`, { method: 'POST' });
    await fetch(`${API_BASE}/actions/${incident.incident_id}/execute`, { method: 'POST' });
    
    setTimeout(() => {
      setAgentState('RESOLVED');
    }, 2500); // Simulate verification time
  };

  const isOutage = simState?.active_version === 'v1.1';

  return (
    <div className="siem-wrapper">
      {isOutage && <div className="threat-banner">CRITICAL ANOMALY DETECTED IN PRODUCTION ENVIRONMENT</div>}
      
      {/* Sidebar */}
      <div className="siem-sidebar">
        <div className="sidebar-icon active"><Shield size={20} /></div>
        <div className="sidebar-icon"><Activity size={20} /></div>
        <div className="sidebar-icon"><Terminal size={20} /></div>
      </div>

      {/* Main Area */}
      <div className="siem-main">
        {/* Top Header */}
        <div className="siem-header">
          <div className="header-brand">
            <div className="dot"></div> OPSPILOT SIEM CONSOLE
          </div>
          <div className="header-controls">
            <button className="btn-control btn-threat" onClick={triggerThreat}>
              <Crosshair size={14} /> Simulate Threat
            </button>
            <div className="btn-control" style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-green)'}}>
              <CheckCircle size={14} /> System {isOutage ? 'Compromised' : 'Secured'}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="siem-grid">
          
          {/* Top Left: Log Stream */}
          <div className="panel">
            <div className="panel-title">
              <span><Terminal size={12} style={{marginRight: '6px', verticalAlign: 'middle'}}/> Network / App Log Stream</span>
              <span className={isOutage ? 'text-red' : 'text-green'}>● LIVE</span>
            </div>
            <div className="log-stream">
              {logs.map(log => (
                <div key={log.id} className="log-entry">
                  <span className="log-time">[{log.time}]</span>
                  <span className={`log-level-${log.level}`}>{log.level}</span>
                  <span className={`log-msg ${log.isError ? 'error' : ''}`}>{log.msg}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Bottom Left: Telemetry */}
          <div className="panel">
            <div className="panel-title">
              <span><Activity size={12} style={{marginRight: '6px', verticalAlign: 'middle'}}/> Real-Time Telemetry Matrix</span>
              <span>PAYMENT-API</span>
            </div>
            <div className="telemetry-container">
              <div className="kpi-row">
                <div className="kpi-box">
                  <div className={`kpi-val ${isOutage ? 'text-red' : 'text-green'}`}>{(simState?.error_rate * 100)?.toFixed(1)}%</div>
                  <div className="kpi-lbl">HTTP 500 Errors</div>
                </div>
                <div className="kpi-box">
                  <div className={`kpi-val ${isOutage ? 'text-orange' : 'text-green'}`}>{simState?.p95_latency_ms}ms</div>
                  <div className="kpi-lbl">P95 Latency</div>
                </div>
                <div className="kpi-box">
                  <div className="kpi-val text-cyan">{simState?.active_version}</div>
                  <div className="kpi-lbl">Active Payload</div>
                </div>
              </div>
              <div style={{ flex: 1, padding: '10px 0' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <YAxis domain={[0, 100]} hide />
                    <Line type="stepAfter" dataKey="err" stroke={isOutage ? "#ff2a4d" : "#00ff88"} strokeWidth={2} dot={false} isAnimationActive={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: AI Agent Copilot */}
          <div className="panel agent-panel">
            <div className="panel-title" style={{ background: 'transparent' }}>
              <span><Cpu size={12} style={{marginRight: '6px', verticalAlign: 'middle'}}/> Autonomous SOC Copilot</span>
            </div>
            
            {agentState === 'IDLE' ? (
              <div className="agent-empty">
                {isOutage ? (
                  <>
                    <AlertTriangle size={48} className="text-red" style={{ marginBottom: '20px' }} />
                    <div style={{ fontSize: '18px', color: '#fff', marginBottom: '10px' }}>THREAT DETECTED</div>
                    <div style={{ fontSize: '12px', width: '60%', textAlign: 'center' }}>Automated telemetry indicates massive anomaly. Manual investigation recommended or deploy AI Copilot.</div>
                    <button className="btn-deploy" onClick={deployAgent}>Deploy AI Investigator</button>
                  </>
                ) : (
                  <>
                    <Shield size={48} className="text-muted" style={{ opacity: 0.3, marginBottom: '20px' }} />
                    <div style={{ fontSize: '12px' }}>Awaiting Anomaly Detection...</div>
                  </>
                )}
              </div>
            ) : (
              <div className="ai-steps">
                {/* Step 1: Gathering */}
                <div className="ai-step">
                  <div className={`step-icon ${agentState !== 'IDLE' ? 'done' : 'active'}`}>
                    {agentState === 'GATHERING' ? <div className="spinner" /> : <CheckCircle size={14} />}
                  </div>
                  <div className="step-content">
                    <div className="step-title">Ingesting Telemetry & Logs</div>
                    <div className="step-desc">Correlating data from ElasticSearch, Prometheus, and ArgoCD pipelines.</div>
                  </div>
                </div>

                {/* Step 2: Diagnosing */}
                {(agentState === 'DIAGNOSING' || agentState === 'APPROVAL' || agentState === 'EXECUTING' || agentState === 'RESOLVED') && (
                  <div className="ai-step">
                    <div className={`step-icon ${['APPROVAL', 'EXECUTING', 'RESOLVED'].includes(agentState) ? 'done' : 'active'}`}>
                      {agentState === 'DIAGNOSING' ? <div className="spinner" /> : <CheckCircle size={14} />}
                    </div>
                    <div className="step-content">
                      <div className="step-title">Executing LLM Root Cause Heuristics</div>
                      {diagData && (
                        <div className="step-desc" style={{ marginTop: '8px', color: 'var(--accent-cyan)' }}>
                          &gt; {diagData.primary_hypothesis.title} (Confidence: {diagData.primary_hypothesis.score * 100}%)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Approval */}
                {(agentState === 'APPROVAL' || agentState === 'EXECUTING' || agentState === 'RESOLVED') && (
                  <div className="ai-step" style={{ flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
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
                          <Lock size={16} /> HUMAN AUTHORIZATION REQUIRED
                        </div>
                        <div className="approval-body">
                          <div className="auth-data-grid">
                            <div className="auth-lbl">RUNBOOK:</div>
                            <div className="auth-val hl">{actionData.action_type.toUpperCase()}</div>
                            <div className="auth-lbl">TARGET ENV:</div>
                            <div className="auth-val">{actionData.target.deployment}:{actionData.target.desired_revision}</div>
                            <div className="auth-lbl">HASH SIG:</div>
                            <div className="auth-val">8f9a2b4_sha256_verified</div>
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

                {/* Step 4: Verification & Report */}
                {(agentState === 'EXECUTING' || agentState === 'RESOLVED') && (
                  <div className="ai-step" style={{ flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className={`step-icon ${agentState === 'RESOLVED' ? 'done' : 'active'}`}>
                        {agentState === 'EXECUTING' ? <div className="spinner" /> : <CheckCircle size={14} />}
                      </div>
                      <div className="step-content">
                        <div className="step-title">Executing & Verifying</div>
                        <div className="step-desc">Deploying rollback and running 3-pass telemetry verification.</div>
                      </div>
                    </div>
                    
                    {agentState === 'RESOLVED' && (
                      <div className="report-card">
                        <div className="report-header">
                          <CheckCircle size={16} /> INCIDENT MITIGATED - POST MORTEM
                        </div>
                        <div className="report-body">
                          <strong>Incident:</strong> Payment API Service Disruption<br/>
                          <strong>Time to Mitigate:</strong> &lt; 1 min (Autonomous)<br/>
                          <strong>Root Cause:</strong> DB_SSL_MODE configuration drift.<br/>
                          <strong>Resolution:</strong> Reverted payload to v1.0.<br/>
                          <br/>
                          <span className="text-cyan">&gt; System is secure. Returning to monitoring protocol.</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
