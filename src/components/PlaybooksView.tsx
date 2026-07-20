import React, { useState } from 'react';
import { 
  Zap, 
  Play, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Lock, 
  Sliders, 
  UserX, 
  Clock, 
  History,
  Activity,
  Plus,
  Eye,
  X,
  Copy,
  Terminal,
  Globe,
  FileText
} from 'lucide-react';
import { useCSIMP } from '../lib/store';

export interface Playbook {
  id: string;
  name: string;
  triggerCondition: string;
  category: string;
  status: 'ENABLED' | 'DISABLED';
  actionsCount: number;
  lastExecuted: string;
  description: string;
  steps: string[];
}

export interface PlaybookExecutionLog {
  id: string;
  playbookName: string;
  incidentId: string;
  executedAt: string;
  status: 'SUCCESS' | 'FAILED';
  actionsCompleted: string;
  extractedIoCs: {
    ips: string[];
    urls: string[];
    fileHashes: string[];
  };
  deployedWafRuleId: string;
  revokedSessionsCount: number;
}

export const PlaybooksView: React.FC = () => {
  const { askConfirmation, addCloudWatchLog } = useCSIMP();

  const [playbooks, setPlaybooks] = useState<Playbook[]>([
    {
      id: 'pb-101',
      name: 'Phishing Containment & WAF IP Quarantine',
      triggerCondition: 'Category eq "Phishing" and Severity >= HIGH',
      category: 'Phishing',
      status: 'ENABLED',
      actionsCount: 4,
      lastExecuted: '2 hours ago',
      description: 'Auto-deploys Cloudflare WAF block rules on malicious sender IPs, revokes compromised user SSO session, and notifies SOC.',
      steps: [
        'Extract Malicious IP & URL IoCs from Incident Payload',
        'Deploy Cloudflare WAF Edge Block Rule',
        'Revoke Reporter SSO Session & Issue Password Reset',
        'Publish Emergency Threat Advisory to Organization',
      ],
    },
    {
      id: 'pb-102',
      name: 'Ransomware Host Isolation & S3 WORM Lock',
      triggerCondition: 'Category eq "Malware" and Severity eq "CRITICAL"',
      category: 'Malware',
      status: 'ENABLED',
      actionsCount: 5,
      lastExecuted: 'Yesterday',
      description: 'Immediately isolates compromised AWS EC2 instance, locks S3 object vault with WORM policy, and alerts CISO.',
      steps: [
        'Isolate AWS EC2 Instance Security Group',
        'Enforce Write-Once-Read-Many (WORM) Policy on Evidence S3 Bucket',
        'Terminate All Active User Sessions across All Devices',
        'Dispatch High-Priority PagerDuty Alert to CISO',
        'Log Immutable Incident Hash in Audit Ledger',
      ],
    },
    {
      id: 'pb-103',
      name: 'Brute Force Authentication Throttler',
      triggerCondition: 'Failed Auth Attempts > 100 in 1 minute',
      category: 'Unauthorized Access',
      status: 'ENABLED',
      actionsCount: 3,
      lastExecuted: '3 days ago',
      description: 'Deploys Cloudflare Turnstile Managed Challenge and throttles IP range for 24 hours.',
      steps: [
        'Identify Source IP Range of Failed Auth Spikes',
        'Deploy Managed Challenge (Turnstile) Rule on /api/v1/auth',
        'Lock Target User Account for 30 minutes',
      ],
    },
  ]);

  const [executionLogs, setExecutionLogs] = useState<PlaybookExecutionLog[]>([
    {
      id: 'exec-1',
      playbookName: 'Phishing Containment & WAF IP Quarantine',
      incidentId: 'INC-2026-0841',
      executedAt: new Date().toLocaleTimeString(),
      status: 'SUCCESS',
      actionsCompleted: '4 / 4 Actions Completed',
      extractedIoCs: {
        ips: ['185.220.101.5', '192.42.116.16'],
        urls: ['https://login-acme-sec.top/auth/login'],
        fileHashes: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
      },
      deployedWafRuleId: 'waf-rule-9901-ip-block',
      revokedSessionsCount: 2,
    },
  ]);

  const [runningPlaybook, setRunningPlaybook] = useState<Playbook | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedLog, setSelectedLog] = useState<PlaybookExecutionLog | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const togglePlaybook = (id: string) => {
    setPlaybooks(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'ENABLED' ? 'DISABLED' : 'ENABLED' } : p));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRunPlaybook = (pb: Playbook) => {
    askConfirmation({
      title: `Execute SOAR Playbook: ${pb.name}`,
      message: `Are you sure you want to trigger automated mitigation workflow '${pb.name}'? This will deploy live WAF rules and isolate compromised assets.`,
      type: 'warning',
      confirmText: 'Execute Automated Playbook',
      onConfirm: () => {
        setRunningPlaybook(pb);
        setCurrentStepIndex(0);

        let step = 0;
        const interval = setInterval(() => {
          step++;
          if (step < pb.steps.length) {
            setCurrentStepIndex(step);
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setRunningPlaybook(null);
              const newLog: PlaybookExecutionLog = {
                id: 'exec-' + Date.now(),
                playbookName: pb.name,
                incidentId: 'INC-2026-0841',
                executedAt: new Date().toLocaleTimeString(),
                status: 'SUCCESS',
                actionsCompleted: `${pb.steps.length} / ${pb.steps.length} Actions Completed`,
                extractedIoCs: {
                  ips: ['185.220.101.' + Math.floor(Math.random() * 200 + 10)],
                  urls: ['https://phish-login-domain-' + Math.floor(Math.random() * 90 + 10) + '.com'],
                  fileHashes: ['a3f89012bce718d94e21a78921234567890abcdef1234567890abcdef1234567'],
                },
                deployedWafRuleId: 'waf-rule-' + Math.floor(Math.random() * 9000 + 1000),
                revokedSessionsCount: 1,
              };

              setExecutionLogs(prev => [newLog, ...prev]);

              addCloudWatchLog({
                service: 'GuardDuty',
                level: 'INFO',
                message: `SOAR Playbook Executed: '${pb.name}' [Status: SUCCESS]`,
              });

              askConfirmation({
                title: 'Playbook Execution Complete',
                message: `SOAR Playbook '${pb.name}' successfully executed! Click 'Inspect Extracted Info' in the audit table to review extracted IoCs.`,
                type: 'success',
                confirmText: 'Inspect Extracted Info',
                onConfirm: () => setSelectedLog(newLog),
              });
            }, 500);
          }
        }, 800);
      },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#272f45]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#f38020]" /> SOAR Automated Response Playbooks Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Security Orchestration, Automation, & Response (SOAR): Automated threat containment, WAF rules deployment, and IoC intelligence extraction.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-slate-300 bg-[#151924] px-3 py-1.5 rounded border border-[#272f45]">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>SOAR Engine Status: <strong className="text-emerald-400">ACTIVE & MONITORING</strong></span>
        </div>
      </div>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {playbooks.map(pb => (
          <div key={pb.id} className="p-4 rounded-md bg-[#151924] border border-[#272f45] flex flex-col justify-between space-y-4 shadow-sm hover:border-[#3b4666] transition-all">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0d1017] border border-[#272f45] text-[#f38020]">
                  {pb.category}
                </span>
                <button
                  onClick={() => togglePlaybook(pb.id)}
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    pb.status === 'ENABLED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {pb.status}
                </button>
              </div>

              <h2 className="text-sm font-bold text-white leading-tight">{pb.name}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{pb.description}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#272f45] text-xs">
              <div className="font-mono text-[10px] text-slate-400">
                <span>Trigger: </span>
                <code className="text-amber-300 block truncate font-bold mt-0.5">{pb.triggerCondition}</code>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block">Automated Steps ({pb.steps.length}):</span>
                {pb.steps.slice(0, 2).map((st, i) => (
                  <div key={i} className="text-[10px] text-slate-300 flex items-center gap-1 font-mono truncate">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{st}</span>
                  </div>
                ))}
                {pb.steps.length > 2 && (
                  <p className="text-[9px] text-slate-500 font-mono">+ {pb.steps.length - 2} more actions</p>
                )}
              </div>

              <button
                onClick={() => handleRunPlaybook(pb)}
                className="w-full py-1.5 bg-[#f38020] hover:bg-[#e56f10] text-black font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors mt-2"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Execute Playbook</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* SOAR Automated Execution Audit Table */}
      <div className="bg-[#151924] rounded-md border border-[#272f45] overflow-hidden shadow-sm">
        <div className="p-3 bg-[#1b202e] border-b border-[#272f45] flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#f38020]" /> SOAR Playbook Execution Audit History ({executionLogs.length})
          </span>
          <span className="text-[10px] font-mono text-slate-400">Click any row to inspect extracted intelligence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#272f45] bg-[#0d1017] font-mono text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-3.5">Playbook Name</th>
                <th className="py-2.5 px-3.5">Target Incident</th>
                <th className="py-2.5 px-3.5">Executed At</th>
                <th className="py-2.5 px-3.5">Actions Result</th>
                <th className="py-2.5 px-3.5 text-right">Inspect Intelligence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272f45]">
              {executionLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#1b202e] transition-colors font-mono cursor-pointer" onClick={() => setSelectedLog(log)}>
                  <td className="py-3 px-3.5 font-semibold text-slate-200">{log.playbookName}</td>
                  <td className="py-3 px-3.5 text-[#f38020] font-bold">{log.incidentId}</td>
                  <td className="py-3 px-3.5 text-slate-400">{log.executedAt}</td>
                  <td className="py-3 px-3.5 text-slate-300">{log.actionsCompleted}</td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                      className="flex items-center space-x-1 ml-auto px-2 py-1 rounded bg-[#0d1017] hover:bg-[#272f45] text-[#f38020] border border-[#272f45] text-[10px] font-semibold transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect Extracted Info</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔍 Extracted Playbook Intelligence Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg bg-[#151924] border border-[#272f45] rounded-md p-5 space-y-4 shadow-2xl text-xs">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded bg-[#f38020]/15 text-[#f38020]">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Extracted Playbook Intelligence & Action Summary</h2>
                  <p className="text-[10px] font-mono text-slate-400">Incident: {selectedLog.incidentId} • Executed at {selectedLog.executedAt}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Extracted IoCs */}
              <div className="p-3 rounded bg-[#0d1017] border border-[#272f45] space-y-2 font-mono">
                <span className="text-[10px] text-[#f38020] font-bold uppercase block">
                  1. Extracted Indicators of Compromise (IoCs)
                </span>
                
                {selectedLog.extractedIoCs.ips.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Malicious Source IPs:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLog.extractedIoCs.ips.map(ip => (
                        <div key={ip} className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#1b202e] border border-[#272f45] text-slate-200">
                          <span>{ip}</span>
                          <button onClick={() => handleCopy(ip)} className="text-slate-400 hover:text-white">
                            {copiedText === ip ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.extractedIoCs.urls.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Phishing Domains / Links:</span>
                    <div className="space-y-1">
                      {selectedLog.extractedIoCs.urls.map(url => (
                        <div key={url} className="flex items-center justify-between px-2 py-0.5 rounded bg-[#1b202e] border border-[#272f45] text-amber-300 truncate">
                          <span className="truncate">{url}</span>
                          <button onClick={() => handleCopy(url)} className="text-slate-400 hover:text-white ml-1">
                            {copiedText === url ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Deployed Security Actions */}
              <div className="p-3 rounded bg-[#0d1017] border border-[#272f45] space-y-2 font-mono">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                  2. Automated Containment Actions Executed
                </span>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-1.5 rounded bg-[#1b202e] border border-[#272f45]">
                    <span className="text-slate-300">Cloudflare WAF Rule Deployed:</span>
                    <span className="text-[#f38020] font-bold">{selectedLog.deployedWafRuleId}</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-[#1b202e] border border-[#272f45]">
                    <span className="text-slate-300">User Sessions Revoked:</span>
                    <span className="text-emerald-400 font-bold">{selectedLog.revokedSessionsCount} Active Session Terminated</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-[#1b202e] border border-[#272f45]">
                    <span className="text-slate-300">S3 Evidence Bucket Status:</span>
                    <span className="text-blue-400 font-bold">WORM Object Lock Active</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-1.5 bg-[#272f45] hover:bg-[#323a52] text-slate-200 font-semibold rounded"
            >
              Close Intelligence Summary
            </button>

          </div>
        </div>
      )}

      {/* Execution Pipeline Animation Modal */}
      {runningPlaybook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
          <div className="w-full max-w-md bg-[#151924] border border-[#f38020]/40 rounded-md p-6 space-y-4 shadow-2xl text-center">
            
            <div className="mx-auto w-12 h-12 rounded-full bg-[#f38020]/15 text-[#f38020] border border-[#f38020]/30 flex items-center justify-center animate-bounce">
              <Zap className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-base font-bold text-white">Executing SOAR Response Playbook</h2>
              <p className="text-xs text-[#f38020] font-mono mt-0.5">{runningPlaybook.name}</p>
            </div>

            <div className="p-4 rounded bg-[#0d1017] border border-[#272f45] text-left space-y-2 font-mono text-xs">
              {runningPlaybook.steps.map((st, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center space-x-2.5 transition-all duration-300 ${
                    idx < currentStepIndex 
                      ? 'text-emerald-400 font-semibold' 
                      : idx === currentStepIndex 
                      ? 'text-[#f38020] font-bold animate-pulse' 
                      : 'text-slate-600'
                  }`}
                >
                  {idx < currentStepIndex ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : idx === currentStepIndex ? (
                    <Activity className="w-4 h-4 text-[#f38020] shrink-0 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className="truncate">[{idx + 1}/{runningPlaybook.steps.length}] {st}</span>
                </div>
              ))}
            </div>

            <div className="w-full h-1.5 bg-[#0d1017] rounded-full overflow-hidden border border-[#272f45]">
              <div 
                className="h-full bg-[#f38020] transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / runningPlaybook.steps.length) * 100}%` }}
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
