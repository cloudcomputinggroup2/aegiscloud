import React, { useState } from 'react';
import { 
  Key, 
  FileCode, 
  Bell, 
  Database, 
} from 'lucide-react';
import { useCSIMP } from '../lib/store';

export const SecurityConsoleView: React.FC = () => {
  const { addCloudWatchLog, askConfirmation } = useCSIMP();

  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [wormPolicy, setWormPolicy] = useState(true);
  const [xssSanitizer, setXssSanitizer] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('15');
  const [execFilter, setExecFilter] = useState(true);
  const [siemWebhooks, setSiemWebhooks] = useState(true);

  const handleSavePolicy = () => {
    askConfirmation({
      title: 'Enforce Security Policy Updates',
      message: `Are you sure you want to enforce Defense-in-Depth security updates across all active tenant accounts? [MFA=${mfaEnforced ? 'ON' : 'OFF'}, WORM=${wormPolicy ? 'ON' : 'OFF'}]`,
      type: 'warning',
      confirmText: 'Save & Enforce Policy',
      onConfirm: () => {
        addCloudWatchLog({
          service: 'IAM',
          level: 'INFO',
          message: `Defense-in-Depth Security Policy Updated by Admin. [MFA=${mfaEnforced}, WORM=${wormPolicy}, XSS=${xssSanitizer}]`,
        });
        askConfirmation({
          title: 'Policies Enforced',
          message: 'Defense-in-Depth security policies have been successfully saved & updated across the organization tenant!',
          type: 'success',
          confirmText: 'OK',
          onConfirm: () => {},
        });
      },
    });
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#272f45]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Defense-in-Depth Security Console</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-layered security policy configuration across Identity, Storage, Application, and SIEM Telemetry.
          </p>
        </div>

        <button
          onClick={handleSavePolicy}
          className="px-4 py-1.5 bg-[#f38020] hover:bg-[#e56f10] text-black font-bold text-xs rounded transition-colors shadow-sm shrink-0"
        >
          Save & Enforce Policies
        </button>
      </div>

      {/* Layer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Layer 1: Identity & Authentication */}
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#f38020]" /> Layer 1: Identity & Authentication Hardening
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Active</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1017] border border-[#272f45]">
              <div>
                <p className="font-semibold text-slate-200">Enforce TOTP / WebAuthn Hardware MFA</p>
                <p className="text-[10px] text-slate-400">Require multi-factor authentication for Analyst & Admin logins.</p>
              </div>
              <input
                type="checkbox"
                checked={mfaEnforced}
                onChange={e => setMfaEnforced(e.target.checked)}
                className="w-4 h-4 accent-[#f38020] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1017] border border-[#272f45]">
              <div>
                <p className="font-semibold text-slate-200">Session Inactivity Lock Timeout</p>
                <p className="text-[10px] text-slate-400">Automatically lock active session after inactivity.</p>
              </div>
              <select
                value={sessionTimeout}
                onChange={e => setSessionTimeout(e.target.value)}
                className="px-2 py-1 text-xs rounded bg-[#151924] border border-[#272f45] text-slate-200 font-mono"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layer 3: Data Integrity & WORM Storage */}
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-400" /> Layer 3: Data Integrity & Storage Immutability
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Active</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1017] border border-[#272f45]">
              <div>
                <p className="font-semibold text-slate-200">Evidence S3 Object Lock (WORM Policy)</p>
                <p className="text-[10px] text-slate-400">Write-Once-Read-Many policy prevents ransomware or accidental file deletion.</p>
              </div>
              <input
                type="checkbox"
                checked={wormPolicy}
                onChange={e => setWormPolicy(e.target.checked)}
                className="w-4 h-4 accent-[#f38020] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1017] border border-[#272f45]">
              <div>
                <p className="font-semibold text-slate-200">Executable Binary Upload Filter</p>
                <p className="text-[10px] text-slate-400">Block dangerous file extensions (.exe, .bat, .ps1, .sh, .dll) pre-upload.</p>
              </div>
              <input
                type="checkbox"
                checked={execFilter}
                onChange={e => setExecFilter(e.target.checked)}
                className="w-4 h-4 accent-[#f38020] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Layer 4: Anti-XSS & Input Validation */}
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-purple-400" /> Layer 4: Application Input Sanitization
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Active</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1017] border border-[#272f45]">
              <div>
                <p className="font-semibold text-slate-200">HTML Entity & XSS Sanitizer Middleware</p>
                <p className="text-[10px] text-slate-400">Escapes script tags and dangerous HTML payload attributes.</p>
              </div>
              <input
                type="checkbox"
                checked={xssSanitizer}
                onChange={e => setXssSanitizer(e.target.checked)}
                className="w-4 h-4 accent-[#f38020] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Layer 6: SIEM & Real-time Alerting */}
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#f38020]" /> Layer 6: SIEM & Automated Incident Dispatch
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Active</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1017] border border-[#272f45]">
              <div>
                <p className="font-semibold text-slate-200">Critical Threat Alert Webhook Dispatch</p>
                <p className="text-[10px] text-slate-400">Dispatches real-time alerts on Critical/High severity reports.</p>
              </div>
              <input
                type="checkbox"
                checked={siemWebhooks}
                onChange={e => setSiemWebhooks(e.target.checked)}
                className="w-4 h-4 accent-[#f38020] cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
