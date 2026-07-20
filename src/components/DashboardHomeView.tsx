import React, { useMemo } from 'react';
import {
  ShieldAlert,
  Zap,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Server,
  Sliders,
  FileText,
  Radio,
  BarChart2,
} from 'lucide-react';
import { useCSIMP } from '../lib/store';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const severityColor = (s: string) => ({
  CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  HIGH:     'text-amber-300 bg-amber-500/10 border-amber-500/30',
  MEDIUM:   'text-blue-400 bg-blue-500/10 border-blue-500/30',
  LOW:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
}[s] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30');

const statusColor = (s: string) => ({
  OPEN:          'text-rose-400',
  INVESTIGATING: 'text-amber-300',
  RESOLVED:      'text-emerald-400',
  CLOSED:        'text-slate-400',
}[s] ?? 'text-slate-400');

export const DashboardHomeView: React.FC = () => {
  const {
    currentUser,
    incidents,
    broadcasts,
    setActiveTab,
    setIsReportModalOpen,
  } = useCSIMP();

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isAdmin    = currentUser.role === 'ADMIN';
  const isAnalyst  = currentUser.role === 'ANALYST';

  // Filter incidents for this org
  const orgIncidents = incidents.filter(i => i.orgId === currentUser.orgId || !currentUser.orgId);

  // Filter incidents reported by this specific employee
  const myIncidents = useMemo(() => {
    return orgIncidents.filter(i => i.reporter?.userId === currentUser.id);
  }, [orgIncidents, currentUser.id]);

  const kpis = useMemo(() => {
    if (isEmployee) {
      const open = myIncidents.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length;
      const resolved = myIncidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
      return { open, resolved };
    } else {
      const open = orgIncidents.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length;
      const resolved = orgIncidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
      const critical = orgIncidents.filter(i => i.severity === 'CRITICAL').length;
      return { open, resolved, critical };
    }
  }, [isEmployee, myIncidents, orgIncidents]);

  const recentIncidents = useMemo(() => {
    const list = isEmployee ? myIncidents : orgIncidents;
    return [...list]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [isEmployee, myIncidents, orgIncidents]);

  const recentBroadcasts = useMemo(() => {
    return [...broadcasts]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3);
  }, [broadcasts]);

  // ── RENDER EMPLOYEE DASHBOARD ──
  if (isEmployee) {
    return (
      <div className="space-y-6 pb-8">
        {/* Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {greeting()}, <span className="text-[#f38020]">{currentUser.name.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Employee Security Console · {currentUser.department}
            </p>
          </div>
          <button onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#f38020] hover:bg-[#d96c10] text-black font-extrabold rounded-lg text-xs transition-colors shadow-md shadow-[#f38020]/20 self-start sm:self-auto">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Report Security Incident
          </button>
        </div>

        {/* Employee Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#151924] border border-[#272f45] space-y-2 hover:border-[#f38020]/30 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase text-slate-400">My Open Reports</p>
              <ShieldAlert className="w-4 h-4 text-[#f38020]" />
            </div>
            <p className="text-3xl font-black text-white">{kpis.open}</p>
            <p className="text-[10px] text-slate-500 font-mono">Awaiting SOC review</p>
          </div>

          <div className="p-4 rounded-xl bg-[#151924] border border-[#272f45] space-y-2 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase text-slate-400">Security Health</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">SECURE</p>
            <p className="text-[10px] text-slate-500 font-mono">MFA & SSO active</p>
          </div>

          <div className="p-4 rounded-xl bg-[#151924] border border-[#272f45] space-y-2 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase text-slate-400">Device Trust</p>
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-blue-400">TRUSTED</p>
            <p className="text-[10px] text-slate-500 font-mono">30-day bypass active</p>
          </div>

          <div className="p-4 rounded-xl bg-[#151924] border border-[#272f45] space-y-2 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase text-slate-400">Training Status</p>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black text-purple-400">100%</p>
            <p className="text-[10px] text-slate-500 font-mono">Up-to-date compliance</p>
          </div>
        </div>

        {/* Main Grid: Threats Banner + Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active threat alert banner */}
          <div className="lg:col-span-2 space-y-4">
            {recentBroadcasts.length > 0 ? (
              <div className="bg-[#1c1214] border-2 border-rose-500/60 rounded-xl p-5 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                    <Radio className="w-4 h-4 text-rose-500 animate-pulse" /> Active Org Threat Warning
                  </span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500 text-black uppercase">
                    {recentBroadcasts[0].threatLevel.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{recentBroadcasts[0].title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{recentBroadcasts[0].message}</p>
                <div className="p-3 bg-[#0d1017] border border-rose-500/30 rounded-lg text-xs font-mono text-amber-300 space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Instruction:</span>
                  <p className="font-semibold">{recentBroadcasts[0].actionRequired}</p>
                </div>
              </div>
            ) : (
              <div className="bg-[#151924] border border-emerald-500/30 rounded-xl p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">System Security Defense Status: NORMAL</h4>
                  <p className="text-xs text-slate-400 mt-0.5">No active organization-wide cyber attacks reported.</p>
                </div>
              </div>
            )}

            {/* Quick reported incidents status summary */}
            <div className="bg-[#151924] border border-[#272f45] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#272f45] flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono uppercase">My Recent Incident Reports</span>
                <button onClick={() => setActiveTab('incidents')} className="text-[10px] text-[#f38020] hover:underline font-mono">View History →</button>
              </div>
              <div className="divide-y divide-[#272f45]/50">
                {recentIncidents.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono">No incidents reported by you.</div>
                ) : (
                  recentIncidents.slice(0, 2).map(inc => (
                    <div key={inc.id} onClick={() => setActiveTab('incidents')} className="px-5 py-3 hover:bg-[#1c2030] cursor-pointer transition-colors flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-[#f38020] font-bold mr-2">{inc.id}</span>
                        <span className="text-xs text-slate-300 font-semibold">{inc.title}</span>
                      </div>
                      <span className={`text-[10px] font-bold font-mono ${statusColor(inc.status)}`}>{inc.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Side Panel: Security tips & emergency hotline */}
          <div className="bg-[#151924] border border-[#272f45] rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-[#272f45] pb-2">Emergency Protocols</h4>
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-200">1. Isolate Suspicious Workstations</p>
                <p className="text-[11px] text-slate-400">Disconnect Ethernet or turn off Wi-Fi immediately if you notice anomalous behavior or unauthorized access prompts.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-200">2. Deny Unexpected Push Notifications</p>
                <p className="text-[11px] text-slate-400">If you receive an MFA push request you didn't initiate, select "Deny" and immediately report it as a potential fatigue attack.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-200">3. Emergency Call-In hotline</p>
                <p className="text-[11px] text-slate-400">Contact the SOC dispatcher direct line at: <strong className="text-white font-mono">+1 (800) 555-SOC1</strong>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links grid */}
        <div className="bg-[#151924] border border-[#272f45] rounded-xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase font-mono mb-4">Quick Links</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button onClick={() => setIsReportModalOpen(true)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0d1017] hover:bg-[#1c2030] border border-[#272f45] hover:border-[#f38020]/30 text-xs text-slate-300 hover:text-white font-semibold transition-all">
              <Plus className="w-4 h-4 text-[#f38020]" /> Report Incident
            </button>
            <button onClick={() => setActiveTab('incidents')} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0d1017] hover:bg-[#1c2030] border border-[#272f45] hover:border-[#f38020]/30 text-xs text-slate-300 hover:text-white font-semibold transition-all">
              <ShieldAlert className="w-4 h-4 text-blue-400" /> Incident History
            </button>
            <button onClick={() => setActiveTab('notifications')} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0d1017] hover:bg-[#1c2030] border border-[#272f45] hover:border-[#f38020]/30 text-xs text-slate-300 hover:text-white font-semibold transition-all">
              <Clock className="w-4 h-4 text-amber-400" /> Inbox & Alerts
            </button>
            <button onClick={() => setActiveTab('account-settings')} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0d1017] hover:bg-[#1c2030] border border-[#272f45] hover:border-[#f38020]/30 text-xs text-slate-300 hover:text-white font-semibold transition-all">
              <Server className="w-4 h-4 text-purple-400" /> Account Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER ADMIN / ANALYST DASHBOARD ──
  return (
    <div className="space-y-6 pb-8">

      {/* ── GREETING HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {greeting()}, <span className="text-[#f38020]">{currentUser.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {currentUser.role} · {currentUser.department} · {currentUser.email}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(isAdmin || isAnalyst) && (
            <button onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#f38020] hover:bg-[#d96c10] text-black font-bold rounded-lg text-xs transition-colors shadow-md shadow-[#f38020]/20">
              <Plus className="w-3.5 h-3.5" />
              {isAnalyst ? 'Investigation Ticket' : 'Report Incident'}
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setActiveTab('playbooks')}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#151924] hover:bg-[#1c2030] border border-[#272f45] text-slate-200 font-semibold rounded-lg text-xs transition-colors">
              <Zap className="w-3.5 h-3.5 text-[#f38020]" />
              Run Playbook
            </button>
          )}
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <div className="p-4 rounded-xl bg-[#151924] border border-[#272f45] space-y-2 hover:border-rose-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase text-slate-400">Open Incidents</p>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-white">{kpis.open}</p>
          <p className="text-[10px] text-rose-400 font-mono">{kpis.critical || 0} critical</p>
        </div>

        <div className="p-4 rounded-xl bg-[#151924] border border-[#272f45] space-y-2 hover:border-[#f38020]/30 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase text-slate-400">WAF Blocked Today</p>
            <Sliders className="w-4 h-4 text-[#f38020]" />
          </div>
          <p className="text-3xl font-black text-[#f38020]">23,441</p>
          <p className="text-[10px] text-slate-500 font-mono">↑ 12% from yesterday</p>
        </div>

        <div className="p-4 rounded-xl bg-[#151924] border border-[#272f45] space-y-2 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase text-slate-400">SOAR Auto-Response</p>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">99.8%</p>
          <p className="text-[10px] text-emerald-500/70 font-mono">{kpis.resolved} resolved this week</p>
        </div>

        <div className="p-4 rounded-xl bg-[#151924] border border-[#272f45] space-y-2 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase text-slate-400">ALB Cluster Health</p>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-400">100%</p>
          <p className="text-[10px] text-blue-500/70 font-mono">Multi-AZ · us-east-1a/1b</p>
        </div>

      </div>

      {/* ── MAIN GRID: Recent Incidents + Broadcasts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Incidents (2/3 width) */}
        <div className="lg:col-span-2 bg-[#151924] border border-[#272f45] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#272f45]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#f38020]" />
              <span className="text-sm font-bold text-white">Recent Incidents</span>
            </div>
            <button onClick={() => setActiveTab('incidents')}
              className="text-[11px] text-[#f38020] hover:underline flex items-center gap-1 font-mono">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#272f45]/50">
            {recentIncidents.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400/50" />
                No incidents found. Great job!
              </div>
            ) : recentIncidents.map(inc => (
              <div key={inc.id} className="px-5 py-3 flex items-start gap-3 hover:bg-[#1c2030] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono text-[#f38020] font-bold">{inc.id.toUpperCase()}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono ${severityColor(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{inc.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {inc.category} · {new Date(inc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] font-bold font-mono shrink-0 ${statusColor(inc.status)}`}>
                  {inc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Threat Broadcasts (1/3 width) */}
        <div className="bg-[#151924] border border-[#272f45] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#272f45]">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-sm font-bold text-white">Live Threat Broadcast</span>
          </div>
          <div className="divide-y divide-[#272f45]/50">
            {recentBroadcasts.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-slate-500">No active broadcasts.</div>
            ) : recentBroadcasts.map(b => (
              <div key={b.id} className="px-4 py-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${b.threatLevel === 'DEFCON_1_CRITICAL' ? 'bg-rose-500 animate-pulse' : b.threatLevel === 'DEFCON_2_ELEVATED' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className={`text-[10px] font-mono font-bold ${b.threatLevel === 'DEFCON_1_CRITICAL' ? 'text-rose-400' : b.threatLevel === 'DEFCON_2_ELEVATED' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {b.threatLevel.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-200">{b.title}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2">{b.message}</p>
                <p className="text-[10px] text-slate-600 font-mono">{new Date(b.publishedAt).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="bg-[#151924] border border-[#272f45] rounded-xl p-5">
        <p className="text-xs font-bold text-slate-400 uppercase font-mono mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: ShieldAlert, label: 'Triage Queue',      tab: 'incidents',         color: 'text-rose-400',    show: isAdmin || isAnalyst },
            { icon: Zap,         label: 'SOAR Playbooks',    tab: 'playbooks',          color: 'text-emerald-400', show: isAdmin || isAnalyst },
            { icon: Sliders,     label: 'WAF Rules',         tab: 'waf',                color: 'text-[#f38020]',   show: isAdmin || isAnalyst },
            { icon: BarChart2,   label: 'Analytics',         tab: 'analytics',          color: 'text-blue-400',    show: isAdmin || isAnalyst },
            { icon: FileText,    label: 'Evidence Vault',    tab: 's3vault',            color: 'text-purple-400',  show: isAdmin || isAnalyst },
            { icon: Activity,    label: 'Audit Logs',        tab: 'audit',              color: 'text-slate-400',   show: isAdmin },
            { icon: Server,      label: 'AWS Architecture',  tab: 'aws-architecture',   color: 'text-blue-300',    show: isAdmin },
            { icon: Clock,       label: 'Notifications',     tab: 'notifications',      color: 'text-amber-400',   show: true },
          ].filter(a => a.show).map(a => (
            <button key={a.tab} onClick={() => setActiveTab(a.tab)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0d1017] hover:bg-[#1c2030] border border-[#272f45] hover:border-[#f38020]/30 text-xs text-slate-300 hover:text-white font-semibold transition-all">
              <a.icon className={`w-4 h-4 ${a.color}`} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
