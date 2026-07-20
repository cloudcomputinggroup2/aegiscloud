import React, { useState } from 'react';
import { 
  BarChart2, 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Sliders, 
  TrendingUp, 
  Zap, 
  Lock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useCSIMP } from '../lib/store';

export const AnalyticsDashboard: React.FC = () => {
  const { incidents, cloudWatchLogs, currentOrg } = useCSIMP();

  // Internal vs External Telemetry View Switcher
  const [telemetryScope, setTelemetryScope] = useState<'ALL' | 'EXTERNAL' | 'INTERNAL'>('ALL');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // External Edge WAF Data (24h)
  const externalData = [
    { time: '00:00', requests: 1200, blocked: 45, challenged: 12 },
    { time: '04:00', requests: 1800, blocked: 89, challenged: 28 },
    { time: '08:00', requests: 4200, blocked: 310, challenged: 94 },
    { time: '12:00', requests: 6800, blocked: 520, challenged: 180 },
    { time: '16:00', requests: 5400, blocked: 240, challenged: 65 },
    { time: '20:00', requests: 3100, blocked: 110, challenged: 32 },
  ];

  // Internal Security Telemetry Data (24h)
  const internalData = [
    { time: '00:00', iamCalls: 450, guardDutyAlerts: 2, endpointEvents: 12 },
    { time: '04:00', iamCalls: 380, guardDutyAlerts: 1, endpointEvents: 8 },
    { time: '08:00', iamCalls: 2100, guardDutyAlerts: 8, endpointEvents: 45 },
    { time: '12:00', iamCalls: 3400, guardDutyAlerts: 14, endpointEvents: 89 },
    { time: '16:00', iamCalls: 2800, guardDutyAlerts: 6, endpointEvents: 62 },
    { time: '20:00', iamCalls: 1200, guardDutyAlerts: 3, endpointEvents: 24 },
  ];

  // Threat Category Breakdown
  const categoryData = [
    { name: 'Phishing', value: 45, color: '#f38020' },
    { name: 'WAF Injection', value: 30, color: '#ef4444' },
    { name: 'Unauthorized IAM', value: 15, color: '#3b82f6' },
    { name: 'DDoS Spikes', value: 10, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Cloudflare Header & Telemetry Scope Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#272f45]">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span>{currentOrg.name}</span>
            <span>•</span>
            <span className="text-[#f38020]">Security Analytics Engine</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Cloud Security & Threat Intelligence
          </h1>
        </div>

        {/* Telemetry Scope Filter Pills (Cloudflare Style) */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center bg-[#151924] p-1 rounded-md border border-[#272f45] text-xs">
            <button
              onClick={() => setTelemetryScope('ALL')}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                telemetryScope === 'ALL' ? 'bg-[#f38020] text-black shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Hybrid (All)
            </button>
            <button
              onClick={() => setTelemetryScope('EXTERNAL')}
              className={`px-3 py-1 rounded font-semibold transition-all flex items-center gap-1.5 ${
                telemetryScope === 'EXTERNAL' ? 'bg-[#f38020] text-black shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>External WAF</span>
            </button>
            <button
              onClick={() => setTelemetryScope('INTERNAL')}
              className={`px-3 py-1 rounded font-semibold transition-all flex items-center gap-1.5 ${
                telemetryScope === 'INTERNAL' ? 'bg-[#f38020] text-black shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Internal Cloud & IAM</span>
            </button>
          </div>

          <div className="h-5 w-px bg-[#272f45] hidden sm:block" />

          {/* Time Range Selector */}
          <div className="flex items-center bg-[#151924] p-1 rounded-md border border-[#272f45] text-xs font-mono">
            {(['24h', '7d', '30d'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                  timeRange === tr ? 'bg-[#1c2030] text-[#f38020] border border-[#f38020]/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Cloudflare Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>External Edge Requests</span>
            <Globe className="w-4 h-4 text-[#f38020]" />
          </div>
          <p className="text-2xl font-bold text-white">21,900</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12.4% vs previous {timeRange}
          </p>
        </div>

        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>WAF Threats Blocked</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-400">1,318</p>
          <p className="text-[10px] text-slate-400">Edge Mitigations Applied</p>
        </div>

        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Internal GuardDuty Alerts</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">34</p>
          <p className="text-[10px] text-emerald-400 font-semibold">100% Contained by SOC</p>
        </div>

        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Mitigation Efficiency</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">99.8%</p>
          <p className="text-[10px] text-slate-400">SOAR Auto-Response Rate</p>
        </div>

      </div>

      {/* Main Telemetry Graph (Cloudflare Style) */}
      <div className="p-5 rounded-md bg-[#151924] border border-[#272f45] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#272f45]">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#f38020]" />
              {telemetryScope === 'EXTERNAL' 
                ? 'External Edge WAF Traffic & Threat Mitigations' 
                : telemetryScope === 'INTERNAL' 
                ? 'Internal AWS GuardDuty Alerts & Workstation Telemetry' 
                : 'Hybrid Security Telemetry (External Edge vs Internal Cloud)'}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Real-time threat evaluation graph over time
            </p>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f38020]" /> Edge Traffic
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Blocked Threats
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryScope === 'INTERNAL' ? internalData : externalData}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f38020" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f38020" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#272f45" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1b202e', borderColor: '#272f45', borderRadius: '6px', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey={telemetryScope === 'INTERNAL' ? "iamCalls" : "requests"} stroke="#f38020" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={2} />
              <Area type="monotone" dataKey={telemetryScope === 'INTERNAL' ? "guardDutyAlerts" : "blocked"} stroke="#ef4444" fillOpacity={1} fill="url(#colorBlocked)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threat Category & Top Threat Origins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Threat Distribution Pie Chart */}
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-3">
          <div className="pb-2 border-b border-[#272f45]">
            <h3 className="text-xs font-bold text-white">Threat Category Distribution</h3>
            <p className="text-[10px] font-mono text-slate-400">Classified incident vectors</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {categoryData.map(cat => (
                <div key={cat.name} className="flex items-center justify-between space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-300">{cat.name}</span>
                  </div>
                  <span className="font-bold text-white">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Threat Origin ASNs & IPs */}
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-3">
          <div className="pb-2 border-b border-[#272f45] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white">Top Blocked Threat Origins</h3>
              <p className="text-[10px] font-mono text-slate-400">Cloudflare Edge & WAF Mitigations</p>
            </div>
            <span className="text-[10px] font-mono text-[#f38020]">Live Feed</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { origin: '185.220.101.5 (Tor Exit Node)', count: 420, country: 'DE', action: 'BLOCK' },
              { origin: '45.154.255.88 (Hosting Provider)', count: 289, country: 'NL', action: 'BLOCK' },
              { origin: '192.42.116.16 (Suspicious Range)', count: 184, country: 'US', action: 'MANAGED_CHALLENGE' },
              { origin: '103.251.170.9 (Botnet Probe)', count: 122, country: 'SG', action: 'BLOCK' },
            ].map(item => (
              <div key={item.origin} className="p-2 rounded bg-[#0d1017] border border-[#272f45] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">{item.origin}</p>
                  <p className="text-[10px] text-slate-400">Geo: {item.country} • {item.count} hits</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  {item.action}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
