import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Sliders, 
  Globe, 
  Lock, 
  Zap, 
  AlertTriangle, 
  Check, 
  Trash2,
  Filter,
  Activity
} from 'lucide-react';
import { useCSIMP } from '../lib/store';

interface WafRule {
  id: string;
  name: string;
  expression: string;
  action: 'BLOCK' | 'MANAGED_CHALLENGE' | 'JS_CHALLENGE' | 'LOG';
  status: 'ACTIVE' | 'DISABLED';
  hits24h: number;
}

export const WafRulesView: React.FC = () => {
  const { addCloudWatchLog } = useCSIMP();
  const [rules, setRules] = useState<WafRule[]>([
    {
      id: 'waf-101',
      name: 'OWASP Top 10 Core Injection Ruleset',
      expression: '(http.request.uri.query contains "union select" or http.request.body contains "exec")',
      action: 'BLOCK',
      status: 'ACTIVE',
      hits24h: 1420,
    },
    {
      id: 'waf-102',
      name: 'Rate Limiting — API Intake Throttling',
      expression: '(http.request.uri.path eq "/api/incidents" and rate(ip.src) > 100/1m)',
      action: 'MANAGED_CHALLENGE',
      status: 'ACTIVE',
      hits24h: 384,
    },
    {
      id: 'waf-[#103]',
      name: 'High-Risk Geo-IP Access Filtering',
      expression: '(ip.geoip.country in {"X1", "X2", "X3"})',
      action: 'JS_CHALLENGE',
      status: 'ACTIVE',
      hits24h: 89,
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleExpression, setRuleExpression] = useState('');
  const [ruleAction, setRuleAction] = useState<WafRule['action']>('BLOCK');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !ruleExpression.trim()) return;

    const newRule: WafRule = {
      id: 'waf-' + Date.now(),
      name: ruleName,
      expression: ruleExpression,
      action: ruleAction,
      status: 'ACTIVE',
      hits24h: 0,
    };

    setRules(prev => [newRule, ...prev]);
    setIsAddModalOpen(false);
    setRuleName('');
    setRuleExpression('');
    setRuleAction('BLOCK');

    addCloudWatchLog({
      service: 'ALB',
      level: 'INFO',
      message: `WAF Rule Created: '${newRule.name}' [Action: ${newRule.action}]`,
    });
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : r));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#272f45]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">WAF & Security Rules Manager</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Layer 2 Edge Protection: Rate limiting, OWASP rulesets, bot management, and custom access rules.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#f38020] hover:bg-[#e56f10] rounded transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Custom Security Rule</span>
        </button>
      </div>

      {/* Stats Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3 rounded-md bg-[#151924] border border-[#272f45] flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[10px] block">Active Edge Rules</span>
            <span className="font-bold text-white">{rules.filter(r => r.status === 'ACTIVE').length} Rules Enabled</span>
          </div>
        </div>

        <div className="p-3 rounded-md bg-[#151924] border border-[#272f45] flex items-center space-x-3">
          <Activity className="w-5 h-5 text-[#f38020] shrink-0" />
          <div>
            <span className="text-slate-400 text-[10px] block">24h Blocked Threat Requests</span>
            <span className="font-bold text-[#f38020]">1,893 Threats Mitigated</span>
          </div>
        </div>

        <div className="p-3 rounded-md bg-[#151924] border border-[#272f45] flex items-center space-x-3">
          <Lock className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[10px] block">OWASP Core Protection</span>
            <span className="font-bold text-emerald-400">Strict Standard</span>
          </div>
        </div>
      </div>

      {/* Rules Roster Table */}
      <div className="bg-[#151924] rounded-md border border-[#272f45] overflow-hidden shadow-sm">
        <div className="p-3 bg-[#1b202e] border-b border-[#272f45] flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#f38020]" /> Deployed Web Application Firewall (WAF) Rules
          </span>
          <span className="text-[10px] font-mono text-slate-400">Edge Rules Evaluation Order</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#272f45] bg-[#0d1017] font-mono text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-3.5">Rule Name</th>
                <th className="py-2.5 px-3.5">Matching Expression</th>
                <th className="py-2.5 px-3.5">Action Taken</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">24h Mitigations</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272f45]">
              {rules.map(r => (
                <tr key={r.id} className="hover:bg-[#1b202e] transition-colors">
                  
                  <td className="py-3 px-3.5 font-semibold text-slate-200">
                    {r.name}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-amber-300 max-w-xs truncate">
                    {r.expression}
                  </td>

                  <td className="py-3 px-3.5 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.action === 'BLOCK' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {r.action}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[10px]">
                    <button
                      onClick={() => toggleRule(r.id)}
                      className={`px-2 py-0.5 rounded font-bold transition-colors ${
                        r.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {r.status}
                    </button>
                  </td>

                  <td className="py-3 px-3.5 font-mono text-slate-300 font-bold">
                    {r.hits24h.toLocaleString()}
                  </td>

                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => deleteRule(r.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#151924] border border-[#272f45] rounded-md p-5 space-y-4 shadow-2xl font-sans text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
              <span className="font-bold text-white">Create Custom WAF Security Rule</span>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block SQL Injection payloads on /api/incidents"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">Matching Expression *</label>
                <input
                  type="text"
                  required
                  placeholder="(http.request.uri.path contains '/admin' and not ip.src in $whitelist)"
                  value={ruleExpression}
                  onChange={e => setRuleExpression(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">Action to Take *</label>
                <select
                  value={ruleAction}
                  onChange={e => setRuleAction(e.target.value as WafRule['action'])}
                  className="w-full px-3 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-200 font-semibold"
                >
                  <option value="BLOCK">BLOCK (Drop HTTP Connection)</option>
                  <option value="MANAGED_CHALLENGE">MANAGED CHALLENGE (Cloudflare Turnstile)</option>
                  <option value="JS_CHALLENGE">JS CHALLENGE (Browser Computation)</option>
                  <option value="LOG">LOG ONLY (Passive Telemetry)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#272f45]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#272f45] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#f38020] hover:bg-[#e56f10] text-black font-bold rounded text-xs"
                >
                  Deploy WAF Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
