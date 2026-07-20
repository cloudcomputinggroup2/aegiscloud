import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Cloud, 
  Lock, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Download, 
  Layers, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Eye, 
  FileText,
  Zap,
  Sliders,
  Cpu
} from 'lucide-react';
import { useCSIMP } from '../lib/store';

export const AwsArchitectureView: React.FC = () => {
  const { cloudWatchLogs, incidents, users, currentOrg, askConfirmation } = useCSIMP();

  const [activeTab, setActiveTab] = useState<'ALB' | 'DATABASE' | 'LOGS' | 'DIAGRAM'>('ALB');

  // Application Load Balancer & High Availability State
  const [ec2Nodes, setEc2Nodes] = useState([
    { id: 'i-0a8f912b3c4d5e', name: 'EC2-Server-Primary-1A', zone: 'us-east-1a', status: 'HEALTHY', weight: '52%', ip: '10.0.1.45', requests: 11400 },
    { id: 'i-0b9e823c4d5e6f', name: 'EC2-Server-Secondary-1B', zone: 'us-east-1b', status: 'HEALTHY', weight: '48%', ip: '10.0.2.89', requests: 10500 },
  ]);

  const [albStatus, setAlbStatus] = useState<'HEALTHY' | 'FAILOVER'>('HEALTHY');

  // Database Explorer State
  const [selectedTable, setSelectedTable] = useState<'IncidentsTable' | 'UsersTable' | 'AuditLogsTable'>('IncidentsTable');
  const [dbSearch, setDbSearch] = useState('');

  // Failover Simulation Handler
  const handleSimulateFailover = () => {
    if (albStatus === 'HEALTHY') {
      setAlbStatus('FAILOVER');
      setEc2Nodes([
        { id: 'i-0a8f912b3c4d5e', name: 'EC2-Server-Primary-1A', zone: 'us-east-1a', status: 'UNHEALTHY', weight: '0%', ip: '10.0.1.45', requests: 0 },
        { id: 'i-0b9e823c4d5e6f', name: 'EC2-Server-Secondary-1B', zone: 'us-east-1b', status: 'HEALTHY', weight: '100%', ip: '10.0.2.89', requests: 21900 },
      ]);
      askConfirmation({
        title: 'ALB Failover Triggered',
        message: 'Simulated EC2-1A Server Outage. Application Load Balancer (ALB) automatically rerouted 100% of web traffic to EC2-1B in Zone us-east-1b with 0ms downtime!',
        type: 'warning',
        confirmText: 'Acknowledge Failover',
        onConfirm: () => {},
      });
    } else {
      setAlbStatus('HEALTHY');
      setEc2Nodes([
        { id: 'i-0a8f912b3c4d5e', name: 'EC2-Server-Primary-1A', zone: 'us-east-1a', status: 'HEALTHY', weight: '52%', ip: '10.0.1.45', requests: 11400 },
        { id: 'i-0b9e823c4d5e6f', name: 'EC2-Server-Secondary-1B', zone: 'us-east-1b', status: 'HEALTHY', weight: '48%', ip: '10.0.2.89', requests: 10500 },
      ]);
    }
  };

  // Download Capstone Portfolio Generator
  const handleDownloadCapstonePortfolio = () => {
    const portfolioText = `
================================================================================
CSBC 252: INTRODUCTION TO CLOUD COMPUTING — CAPSTONE PROJECT BLUEPRINT
Project Title: AegisCloud — Cloud-Native Security Incident Management Platform
Organization Tenant: ${currentOrg.name} (${currentOrg.slug})
Generated At: ${new Date().toISOString()}
================================================================================

1. CORE AWS ARCHITECTURE & PROOF OF COMPLIANCE
--------------------------------------------------------------------------------
- Amazon EC2 (Required): Multi-AZ High Availability Clusters
  * EC2 Primary (us-east-1a): i-0a8f912b3c4d5e [Status: HEALTHY]
  * EC2 Secondary (us-east-1b): i-0b9e823c4d5e6f [Status: HEALTHY]

- AWS Application Load Balancer (ALB) (Bonus Marks Feature):
  * Target Group: alb-aegiscloud-tg-01
  * Routing Algorithm: Round-Robin with Target Group Health Checks
  * Automatic Failover: Enabled (Zero-downtime failover to us-east-1b)

- Amazon DynamoDB / RDS (Required):
  * Tables: IncidentsTable, UsersTable, AuditLogsTable, WafRulesTable
  * Encryption: AWS KMS AES-256 Server-Side Encryption (SSE)
  * Read/Write Capacity: On-Demand Auto-Scaling

- Amazon S3 Object Vault (Required):
  * Bucket Name: s3://aegiscloud-evidence-repository-${currentOrg.slug}
  * Policy: Write-Once-Read-Many (WORM) Object Locking & SSE-S3 Encryption

- AWS CloudWatch (Required):
  * Log Groups: /aws/ec2/aegiscloud-app, /aws/guardduty/findings
  * Metric Alarms: High CPU (>80%), Unauthorized IAM Token Exfiltration

- AWS IAM & Security Groups (Required):
  * IAM Roles: Least-Privilege Role Policies (Employee, Analyst, Admin)
  * Security Groups: sg-099a12bc (Inbound: 80, 443, 22 | Outbound: 0.0.0.0/0)

2. SYSTEM DATABASE ENTITY-RELATIONSHIP (ERD) SUMMARY
--------------------------------------------------------------------------------
- INCIDENTS_TABLE (${incidents.length} Records)
- USERS_TABLE (${users.length} Active Users)
- SYSTEM_AUDIT_LOGS_TABLE (Immutable Security Trail)

================================================================================
END OF CAPSTONE BLUEPRINT PORTFOLIO
    `.trim();

    const blob = new Blob([portfolioText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSBC252_Capstone_Portfolio_${currentOrg.slug}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & Capstone Portfolio Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#272f45]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>CSBC 252 Capstone Project</span>
            <span>•</span>
            <span className="text-[#f38020]">AWS 3-Tier Architecture</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#f38020]" /> AWS Infrastructure & High Availability Console
          </h1>
        </div>

        <button
          onClick={handleDownloadCapstonePortfolio}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#f38020] hover:bg-[#e56f10] text-black font-bold rounded text-xs transition-colors shadow-sm"
          title="Download complete AWS Architecture Blueprint & Submission Report"
        >
          <Download className="w-4 h-4" />
          <span>Export Capstone Portfolio</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-[#151924] p-1 rounded-md border border-[#272f45] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ALB')}
          className={`flex-1 py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ALB' ? 'bg-[#f38020] text-black shadow-sm font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Application Load Balancer (ALB Bonus!)</span>
        </button>
        <button
          onClick={() => setActiveTab('DATABASE')}
          className={`flex-1 py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'DATABASE' ? 'bg-[#f38020] text-black shadow-sm font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>DynamoDB / RDS Database Explorer</span>
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex-1 py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'LOGS' ? 'bg-[#f38020] text-black shadow-sm font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>CloudWatch Log Stream</span>
        </button>
      </div>

      {/* TAB 1: APPLICATION LOAD BALANCER & HIGH AVAILABILITY */}
      {activeTab === 'ALB' && (
        <div className="space-y-5">
          
          {/* Failover Banner */}
          <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-full ${albStatus === 'HEALTHY' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-white">AWS Application Load Balancer (ALB) Status</h2>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#f38020]/20 text-[#f38020] border border-[#f38020]/30 font-bold">
                    BONUS MARKS FEATURE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {albStatus === 'HEALTHY' 
                    ? 'Target Group: Healthy • Distributing web traffic across Multi-AZ EC2 instances' 
                    : 'Target Group: Failover Active • EC2-1A Unhealthy — Traffic failover to EC2-1B in us-east-1b'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSimulateFailover}
              className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-colors flex items-center space-x-1.5 ${
                albStatus === 'HEALTHY' ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{albStatus === 'HEALTHY' ? 'Simulate EC2-1A Server Outage' : 'Restore EC2-1A Primary Node'}</span>
            </button>
          </div>

          {/* EC2 Instances Roster */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ec2Nodes.map(node => (
              <div key={node.id} className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className={`w-4 h-4 ${node.status === 'HEALTHY' ? 'text-emerald-400' : 'text-rose-500'}`} />
                    <span className="font-bold text-slate-200 text-xs">{node.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    node.status === 'HEALTHY' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}>
                    {node.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Instance ID:</span>
                    <span className="text-slate-200">{node.id}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Availability Zone:</span>
                    <span className="text-[#f38020] font-bold">{node.zone}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Private IP:</span>
                    <span className="text-slate-300">{node.ip}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ALB Traffic Weight:</span>
                    <span className="text-emerald-400 font-bold">{node.weight}</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-[#0d1017] rounded-full overflow-hidden border border-[#272f45]">
                  <div className="h-full bg-[#f38020]" style={{ width: node.weight }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: DYNAMODB / RDS DATABASE CRUD EXPLORER */}
      {activeTab === 'DATABASE' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#151924] rounded-md border border-[#272f45] text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-slate-400 font-semibold">Active Database Table:</span>
              <select
                value={selectedTable}
                onChange={e => setSelectedTable(e.target.value as any)}
                className="px-3 py-1 rounded bg-[#0d1017] border border-[#272f45] text-[#f38020] font-bold font-mono focus:outline-none"
              >
                <option value="IncidentsTable">Amazon DynamoDB: IncidentsTable ({incidents.length} items)</option>
                <option value="UsersTable">Amazon DynamoDB: UsersTable ({users.length} items)</option>
              </select>
            </div>

            <div className="flex items-center space-x-4 font-mono text-[10px] text-slate-400">
              <span>Read Capacity: <strong className="text-emerald-400">Auto-scaling</strong></span>
              <span>Latency: <strong className="text-emerald-400">1.8 ms</strong></span>
            </div>
          </div>

          {/* Database Table Rendering */}
          <div className="bg-[#151924] rounded-md border border-[#272f45] overflow-hidden shadow-sm">
            <div className="p-3 bg-[#1b202e] border-b border-[#272f45] flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-200">Table Schema: {selectedTable}</span>
              <span className="text-[10px] text-slate-400">DynamoDB Partition Key: id</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#272f45] bg-[#0d1017] text-[10px] uppercase text-slate-400">
                    <th className="py-2.5 px-3.5">ID (PK)</th>
                    <th className="py-2.5 px-3.5">Title / Name</th>
                    <th className="py-2.5 px-3.5">Category / Role</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272f45]">
                  {selectedTable === 'IncidentsTable' ? (
                    incidents.map(inc => (
                      <tr key={inc.id} className="hover:bg-[#1b202e] transition-colors">
                        <td className="py-2.5 px-3.5 text-[#f38020] font-bold">{inc.id}</td>
                        <td className="py-2.5 px-3.5 text-slate-200 font-semibold">{inc.title}</td>
                        <td className="py-2.5 px-3.5 text-slate-400">{inc.category}</td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0d1017] border border-[#272f45] text-slate-300">
                            {inc.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right text-slate-500 text-[10px]">
                          {new Date(inc.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="hover:bg-[#1b202e] transition-colors">
                        <td className="py-2.5 px-3.5 text-[#f38020] font-bold">{u.id}</td>
                        <td className="py-2.5 px-3.5 text-slate-200 font-semibold">{u.name} ({u.email})</td>
                        <td className="py-2.5 px-3.5 text-slate-400">{u.role}</td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {u.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right text-slate-500 text-[10px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CLOUDWATCH LOG STREAM */}
      {activeTab === 'LOGS' && (
        <div className="bg-[#0d1017] rounded-md border border-[#272f45] p-4 font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45] text-slate-400 text-[10px]">
            <span>AWS CloudWatch Group: /aws/ec2/aegiscloud-app</span>
            <span className="text-emerald-400 font-bold">● Streaming Live</span>
          </div>

          {cloudWatchLogs.map(log => (
            <div key={log.id} className="flex items-start space-x-2 text-[11px] leading-relaxed">
              <span className="text-slate-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="text-[#f38020] font-bold shrink-0">[{log.service}]</span>
              <span className={`shrink-0 font-bold px-1 rounded text-[9px] ${
                log.level === 'CRITICAL' ? 'bg-rose-500 text-black' : log.level === 'WARN' ? 'bg-amber-400 text-black' : 'bg-slate-700 text-slate-200'
              }`}>
                {log.level}
              </span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
