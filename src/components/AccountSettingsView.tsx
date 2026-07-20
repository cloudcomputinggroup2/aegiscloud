import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Smartphone, 
  Laptop, 
  LogOut, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  QrCode,
  Bell,
  Sliders,
  Webhook
} from 'lucide-react';
import { useCSIMP } from '../lib/store';
import { evaluatePasswordStrength } from '../lib/security';

interface ApiToken {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
  scope: 'Read Only' | 'Full Control';
}

export const AccountSettingsView: React.FC = () => {
  const { currentUser, currentOrg, askConfirmation, addCloudWatchLog } = useCSIMP();

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2FA State
  const [showQrModal, setShowQrModal] = useState(false);

  // Employee Notification Preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Active Sessions State
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'Linux / Chrome 124.0',
      ip: '192.168.1.104',
      location: 'San Francisco, US',
      lastActive: 'Current Session',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      device: 'iOS 17.4 / Safari Mobile',
      ip: '172.56.21.90',
      location: 'Oakland, US',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
  ]);

  // API Tokens State (Analyst & Admin only)
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([
    {
      id: 'tok-101',
      name: `${currentUser.role === 'ADMIN' ? 'Admin Master SIEM Key' : 'Analyst Log Export Token'}`,
      prefix: 'aegis_live_9a7b...',
      createdAt: '2026-06-01',
      lastUsed: '10 minutes ago',
      scope: currentUser.role === 'ADMIN' ? 'Full Control' : 'Read Only',
    },
  ]);

  const [newTokenName, setNewTokenName] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const passwordEval = evaluatePasswordStrength(newPassword);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      askConfirmation({
        title: 'Password Mismatch',
        message: 'New password and confirmation password do not match.',
        type: 'warning',
        confirmText: 'OK',
        onConfirm: () => {},
      });
      return;
    }

    askConfirmation({
      title: 'Update Account Password',
      message: 'Are you sure you want to update your password? All secondary active sessions will be terminated.',
      type: 'warning',
      confirmText: 'Update Password',
      onConfirm: () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        addCloudWatchLog({
          service: 'IAM',
          level: 'INFO',
          message: `User '${currentUser.name}' [${currentUser.role}] updated password.`,
        });
        askConfirmation({
          title: 'Password Updated',
          message: 'Your account password has been updated successfully.',
          type: 'success',
          confirmText: 'OK',
          onConfirm: () => {},
        });
      },
    });
  };

  const handleRevokeOtherSessions = () => {
    askConfirmation({
      title: 'Revoke All Other Sessions',
      message: 'Are you sure you want to terminate all remote active sessions on all devices?',
      type: 'danger',
      confirmText: 'Revoke All Sessions',
      onConfirm: () => {
        setSessions(prev => prev.filter(s => s.isCurrent));
        addCloudWatchLog({
          service: 'IAM',
          level: 'WARN',
          message: `User '${currentUser.name}' revoked secondary active sessions.`,
        });
      },
    });
  };

  const handleCreateApiToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;

    const newToken: ApiToken = {
      id: 'tok-' + Date.now(),
      name: newTokenName,
      prefix: 'aegis_token_' + Math.random().toString(36).substring(2, 8) + '...',
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      scope: currentUser.role === 'ADMIN' ? 'Full Control' : 'Read Only',
    };

    setApiTokens(prev => [newToken, ...prev]);
    setNewTokenName('');
    setShowTokenModal(false);
  };

  const handleDeleteToken = (tokenId: string, tokenName: string) => {
    askConfirmation({
      title: 'Revoke API Token',
      message: `Are you sure you want to revoke API Token '${tokenName}'?`,
      type: 'danger',
      confirmText: 'Revoke Token',
      onConfirm: () => setApiTokens(prev => prev.filter(t => t.id !== tokenId)),
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#272f45]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {currentUser.role === 'EMPLOYEE' ? 'Employee Account & Security Settings' : currentUser.role === 'ANALYST' ? 'SOC Analyst Account & Telemetry Settings' : 'System Administrator Master Security Settings'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-tailored credentials, authentication policies, active session containment, and API keys.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-slate-300 bg-[#151924] px-3 py-1.5 rounded border border-[#272f45]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Account Tier: <strong className="text-emerald-400">{currentUser.role}</strong></span>
        </div>
      </div>

      {/* User Overview Card */}
      <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-[#f38020] text-black font-extrabold text-lg flex items-center justify-center border-2 border-white/20">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{currentUser.name}</h2>
            <p className="text-xs font-mono text-slate-400">{currentUser.email}</p>
            <p className="text-[10px] font-mono text-[#f38020] font-semibold mt-0.5">
              {currentOrg.name} • Dept: {currentUser.department}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded bg-[#0d1017] border border-[#272f45]">
            <span className="text-slate-400 text-[10px] block">2FA Protection</span>
            <span className="font-bold text-emerald-400">Hardware TOTP Active</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-[#0d1017] border border-[#272f45]">
            <span className="text-slate-400 text-[10px] block">Role Permissions</span>
            <span className="font-bold text-white">{currentUser.role} Scope</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 🔐 Password Update Card */}
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#f38020]" /> Change Password
            </span>
            <span className="text-[10px] font-mono text-slate-400">Min 12 characters & symbols</span>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">Current Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#f38020]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">New Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#f38020]"
              />

              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Entropy Strength:</span>
                    <span className={`font-bold ${passwordEval.color}`}>{passwordEval.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0d1017] rounded-full overflow-hidden border border-[#272f45]">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordEval.score >= 80 ? 'bg-emerald-400' : passwordEval.score >= 60 ? 'bg-[#f38020]' : 'bg-rose-500'
                      }`}
                      style={{ width: `${passwordEval.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#f38020]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#f38020] hover:bg-[#e56f10] text-black font-bold rounded text-xs transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* 📱 2FA / Multi-Factor Authentication Card */}
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" /> Multi-Factor Authentication (2FA)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">ENFORCED</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded bg-[#0d1017] border border-[#272f45] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <QrCode className="w-5 h-5 text-[#f38020]" />
                <div>
                  <p className="font-semibold text-slate-200">TOTP Authenticator App</p>
                  <p className="text-[10px] text-slate-400">Google Authenticator, Authy, 1Password</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(true)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-[#1b202e] hover:bg-[#272f45] text-slate-200 rounded border border-[#272f45]"
              >
                Manage 2FA
              </button>
            </div>

            {/* Hardware Keys for Analysts & Admins */}
            {currentUser.role !== 'EMPLOYEE' && (
              <div className="p-3 rounded bg-[#0d1017] border border-[#272f45] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-semibold text-slate-200">Hardware Security Key (FIDO2 / WebAuthn)</p>
                    <p className="text-[10px] text-slate-400">YubiKey, Apple TouchID, Windows Hello</p>
                  </div>
                </div>
                <button
                  onClick={() => alert('FIDO2 WebAuthn Key registration initiated.')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#1b202e] hover:bg-[#272f45] text-slate-200 rounded border border-[#272f45]"
                >
                  Add Key
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ROLE-SPECIFIC SETTINGS SECTION */}

      {/* 1. EMPLOYEE SPECIFIC: Security Notifications & Workstation Alert Preferences */}
      {currentUser.role === 'EMPLOYEE' && (
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#f38020]" /> Employee Incident & Security Advisory Notifications
            </span>
            <span className="text-[10px] font-mono text-slate-400">Personal Notification Rules</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1017] border border-[#272f45]">
              <div>
                <p className="font-semibold text-slate-200">My Incident Resolution Status Updates (Email)</p>
                <p className="text-[10px] text-slate-400">Receive email alerts when SOC Analysts update or resolve your reported incidents.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={e => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 accent-[#f38020] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1017] border border-[#272f45]">
              <div>
                <p className="font-semibold text-slate-200">🚨 Emergency Attack Broadcast SMS Alerts</p>
                <p className="text-[10px] text-slate-400">Receive urgent SMS alerts when an active cyber attack broadcast is issued by the SOC.</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={e => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#f38020] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. ANALYST & ADMIN SPECIFIC: API Tokens & SIEM Keys (Hidden from Employees) */}
      {currentUser.role !== 'EMPLOYEE' && (
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
            <div>
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#f38020]" /> Personal API Tokens & SIEM Integration Keys ({apiTokens.length})
              </span>
              <p className="text-[10px] font-mono text-slate-400">Scoped keys for Splunk, Datadog, log exports, and API access</p>
            </div>

            <button
              onClick={() => setShowTokenModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1 bg-[#f38020] hover:bg-[#e56f10] text-black font-bold text-xs rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create API Token</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#272f45] bg-[#0d1017] font-mono text-[10px] uppercase text-slate-400">
                  <th className="py-2.5 px-3.5">Token Name</th>
                  <th className="py-2.5 px-3.5">Key Prefix</th>
                  <th className="py-2.5 px-3.5">Permissions</th>
                  <th className="py-2.5 px-3.5">Created Date</th>
                  <th className="py-2.5 px-3.5">Last Used</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272f45]">
                {apiTokens.map(tok => (
                  <tr key={tok.id} className="hover:bg-[#1b202e] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-200">{tok.name}</td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-amber-300">{tok.prefix}</td>
                    <td className="py-3 px-3.5 font-mono text-[10px]">{tok.scope}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-400">{tok.createdAt}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-400">{tok.lastUsed}</td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => handleDeleteToken(tok.id, tok.name)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Revoke Token"
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
      )}

      {/* 3. ADMIN SPECIFIC: Master Webhook Dispatcher & Emergency Recovery Keys */}
      {currentUser.role === 'ADMIN' && (
        <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Webhook className="w-4 h-4 text-purple-400" /> Admin Global Security Webhooks & Emergency Keys
            </span>
            <span className="text-[10px] font-mono text-slate-400">Administrator Exclusive</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Global Audit SIEM Webhook URL</label>
              <input
                type="text"
                readOnly
                value="https://api.aegiscloud.corp/v1/webhooks/audit-stream"
                className="w-full px-3 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-amber-300 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* 💻 Active Sessions & Remote Revocation (All Roles) */}
      <div className="p-4 rounded-md bg-[#151924] border border-[#272f45] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
          <div>
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-purple-400" /> Active Login Sessions ({sessions.length})
            </span>
            <p className="text-[10px] font-mono text-slate-400">Manage and terminate remote active device sessions</p>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleRevokeOtherSessions}
              className="flex items-center space-x-1 px-3 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Revoke All Other Sessions</span>
            </button>
          )}
        </div>

        <div className="space-y-2 text-xs">
          {sessions.map(sess => (
            <div key={sess.id} className="p-3 rounded bg-[#0d1017] border border-[#272f45] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-[#1b202e] text-[#f38020]">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-200">{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-black font-mono">Current Session</span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">IP: {sess.ip} • {sess.location} • Last Active: {sess.lastActive}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#151924] border border-[#272f45] rounded-md p-5 space-y-4 shadow-2xl font-sans text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
              <span className="font-bold text-white">Create API Token</span>
              <button onClick={() => setShowTokenModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateApiToken} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">Token Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Datadog Log Forwarder"
                  value={newTokenName}
                  onChange={e => setNewTokenName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#272f45]">
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#272f45] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#f38020] hover:bg-[#e56f10] text-black font-bold rounded text-xs"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#151924] border border-[#272f45] rounded-md p-5 space-y-4 shadow-2xl text-center font-sans text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
              <span className="font-bold text-white">Manage 2FA Authenticator</span>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 bg-white rounded-md w-36 h-36 mx-auto flex items-center justify-center">
              <QrCode className="w-28 h-28 text-black" />
            </div>

            <div className="text-left font-mono space-y-1">
              <span className="text-[10px] text-slate-400 block">Secret Key:</span>
              <div className="p-2 rounded bg-[#0d1017] border border-[#272f45] text-[#f38020] flex items-center justify-between text-[11px]">
                <span>AEGIS-2FA-77AB-99CD</span>
                <button onClick={() => handleCopy('AEGIS-2FA-77AB-99CD')} className="text-slate-400 hover:text-white">
                  {copiedToken === 'AEGIS-2FA-77AB-99CD' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-1.5 bg-[#272f45] hover:bg-[#323a52] text-slate-200 font-semibold rounded"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
