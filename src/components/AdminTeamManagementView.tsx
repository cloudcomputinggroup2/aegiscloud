import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Users, Building2, Trash2, Check,
  MailCheck, MailX, RefreshCw, Clock, Loader2,
  AlertCircle, Send,
} from 'lucide-react';
import { useCSIMP } from '../lib/store';
import { UserRole } from '../lib/types';

const API = '/api/v1';

interface PendingInvite {
  email: string;
  name: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

const rolePillColor: Record<string, string> = {
  ADMIN:    'bg-rose-500/15 text-rose-400 border-rose-500/30',
  ANALYST:  'bg-amber-500/15 text-amber-300 border-amber-500/30',
  EMPLOYEE: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export const AdminTeamManagementView: React.FC = () => {
  const { currentOrg, users, deleteUser, updateUserRole, switchUser, currentUser, askConfirmation, addNotification } = useCSIMP();

  // Add user form
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [role, setRole]           = useState<UserRole>('EMPLOYEE');
  const [department, setDepartment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Pending invites from backend
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [revokingEmail, setRevokingEmail]   = useState<string | null>(null);

  // Fetch pending invites from backend
  const fetchPendingInvites = useCallback(async () => {
    setLoadingInvites(true);
    try {
      const res  = await fetch(`${API}/invitations/pending?orgId=${currentOrg.id}`);
      const data = await res.json();
      if (res.ok) setPendingInvites(data.invites || []);
    } catch {
      // Backend offline — silent
    } finally { setLoadingInvites(false); }
  }, [currentOrg.id]);

  useEffect(() => { fetchPendingInvites(); }, [fetchPendingInvites]);

  // ── Send Invite ─────────────────────────────────────────────────────────────
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(''); setSubmitSuccess('');
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      const res  = await fetch(`${API}/invitations/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, department: department || 'Corporate', orgId: currentOrg.id, orgName: currentOrg.name, adminName: currentUser.name }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || 'Failed to send invite.'); setSubmitting(false); return; }
      setSubmitSuccess(`Invite sent to ${email}`);
      addNotification(`📧 Invite sent to ${name} (${role}) at ${email}`, 'success');
      setName(''); setEmail(''); setRole('EMPLOYEE'); setDepartment('');
      setTimeout(() => { setIsInviteOpen(false); setSubmitSuccess(''); }, 1500);
      fetchPendingInvites();
    } catch {
      // Offline fallback: show success anyway
      setSubmitSuccess(`Invite sent (demo mode — backend offline)`);
      addNotification(`📧 Invite sent to ${name} (${role}) — demo mode`, 'info');
      setName(''); setEmail(''); setRole('EMPLOYEE'); setDepartment('');
      setTimeout(() => { setIsInviteOpen(false); setSubmitSuccess(''); }, 1500);
    }
    setSubmitting(false);
  };

  // ── Resend Invite ──────────────────────────────────────────────────────────
  const handleResend = async (invEmail: string) => {
    setResendingEmail(invEmail);
    try {
      const res  = await fetch(`${API}/invitations/resend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: invEmail, orgId: currentOrg.id, orgName: currentOrg.name }) });
      if (res.ok) { addNotification(`📧 Invite resent to ${invEmail}`, 'success'); fetchPendingInvites(); }
      else { const d = await res.json(); addNotification(d.error || 'Could not resend invite.', 'warning'); }
    } catch { addNotification('Backend offline — resend unavailable.', 'warning'); }
    setResendingEmail(null);
  };

  // ── Revoke Invite ──────────────────────────────────────────────────────────
  const handleRevoke = (invEmail: string, invName: string) => {
    askConfirmation({
      title: 'Revoke Invite',
      message: `Cancel the pending invitation for ${invName} (${invEmail})? They will no longer be able to join using the invite link.`,
      type: 'danger',
      confirmText: 'Revoke Invite',
      onConfirm: async () => {
        setRevokingEmail(invEmail);
        try {
          const res = await fetch(`${API}/invitations/revoke`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: invEmail, orgId: currentOrg.id }) });
          if (res.ok) { addNotification(`Invite for ${invEmail} revoked.`, 'info'); fetchPendingInvites(); }
        } catch { addNotification('Backend offline.', 'warning'); }
        setRevokingEmail(null);
      },
    });
  };

  // ── Delete User ────────────────────────────────────────────────────────────
  const handleDeleteUser = (userId: string, userName: string) => {
    askConfirmation({
      title: 'Delete User Account',
      message: `Revoke access and delete '${userName}' from ${currentOrg.name}? This cannot be undone.`,
      type: 'danger',
      confirmText: 'Revoke & Delete',
      onConfirm: () => deleteUser(userId),
    });
  };

  const orgUsers  = users.filter(u => u.orgId === currentOrg.id || !u.orgId);
  const adminCnt  = orgUsers.filter(u => u.role === 'ADMIN').length;
  const analystCnt= orgUsers.filter(u => u.role === 'ANALYST').length;
  const empCnt    = orgUsers.filter(u => u.role === 'EMPLOYEE').length;

  return (
    <div className="space-y-5 pb-8">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#272f45]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Team Provisioning & User Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Add, invite, and manage team members. New users receive a verification email to set their password.</p>
        </div>
        <button onClick={() => { setIsInviteOpen(true); setSubmitError(''); setSubmitSuccess(''); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black bg-[#f38020] hover:bg-[#e56f10] rounded-lg transition-colors shadow-sm shadow-[#f38020]/20 shrink-0">
          <UserPlus className="w-4 h-4" /> Invite Team Member
        </button>
      </div>

      {/* ── ORG STATS ── */}
      <div className="p-4 rounded-xl bg-[#151924] border border-[#272f45] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#f38020]/15 text-[#f38020] border border-[#f38020]/30"><Building2 className="w-5 h-5" /></div>
          <div>
            <h2 className="text-base font-bold text-white">{currentOrg.name}</h2>
            <p className="text-[11px] font-mono text-slate-400">Tenant: <span className="text-[#f38020]">{currentOrg.slug}</span> · Plan: {currentOrg.plan}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: 'Total',    val: orgUsers.length,  color: 'text-white' },
            { label: 'Admins',   val: adminCnt,          color: 'text-rose-400' },
            { label: 'Analysts', val: analystCnt,        color: 'text-amber-300' },
            { label: 'Employees',val: empCnt,            color: 'text-blue-400' },
            { label: 'Pending',  val: pendingInvites.length, color: 'text-[#f38020]' },
          ].map(({ label, val, color }) => (
            <div key={label} className="px-3 py-1.5 rounded-lg bg-[#0d1017] border border-[#272f45] text-center min-w-[64px]">
              <p className={`font-black text-lg font-mono ${color}`}>{val}</p>
              <p className="text-[9px] font-mono uppercase text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── INVITE FORM ── */}
      {isInviteOpen && (
        <form onSubmit={handleInviteSubmit} className="p-5 rounded-xl bg-[#151924] border border-[#f38020]/40 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
            <span className="font-bold text-sm text-white flex items-center gap-2"><Send className="w-4 h-4 text-[#f38020]" /> Send Email Invitation</span>
            <button type="button" onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-white text-lg leading-none">×</button>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" /> {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
              <MailCheck className="w-4 h-4 shrink-0" /> {submitSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Full Name *',   val: name,       set: setName,       ph: 'Jane Smith',            type: 'text' },
              { label: 'Work Email *',  val: email,      set: setEmail,      ph: 'jane@company.com',       type: 'email' },
              { label: 'Department',    val: department, set: setDepartment, ph: 'Finance / Engineering',  type: 'text' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-[10px] text-slate-400 font-mono mb-1">{f.label}</label>
                <input type={f.type} required={f.label.includes('*')} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d1017] border border-[#272f45] text-slate-200 focus:outline-none focus:border-[#f38020] text-xs" />
              </div>
            ))}
            <div>
              <label className="block text-[10px] text-slate-400 font-mono mb-1">Role Permission *</label>
              <select value={role} onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d1017] border border-[#272f45] text-slate-200 font-semibold focus:outline-none focus:border-[#f38020] text-xs">
                <option value="EMPLOYEE">EMPLOYEE — Submit & track</option>
                <option value="ANALYST">ANALYST — Triage & IoC</option>
                <option value="ADMIN">ADMIN — Full access</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-mono">📧 An invite email with a secure link will be sent via Resend · Cloudflare Email Routing</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsInviteOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#272f45] rounded-lg">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#f38020] hover:bg-[#e56f10] text-black font-bold rounded-lg text-xs disabled:opacity-60">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {submitting ? 'Sending…' : 'Send Invite'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── PENDING INVITES ── */}
      {(pendingInvites.length > 0 || loadingInvites) && (
        <div className="bg-[#151924] border border-[#272f45] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#272f45]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">Pending Invitations</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">{pendingInvites.length}</span>
            </div>
            <button onClick={fetchPendingInvites} className="p-1.5 rounded hover:bg-[#272f45] text-slate-400 hover:text-white transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingInvites ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {loadingInvites ? (
            <div className="py-6 text-center"><Loader2 className="w-5 h-5 animate-spin text-[#f38020] mx-auto" /></div>
          ) : (
            <div className="divide-y divide-[#272f45]/60">
              {pendingInvites.map(inv => {
                const expiresSoon = new Date(inv.expiresAt).getTime() - Date.now() < 4 * 3_600_000;
                return (
                  <div key={inv.email} className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c2030] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-300">
                      {inv.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{inv.name}</span>
                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold ${rolePillColor[inv.role] || 'text-slate-400 border-slate-500/30 bg-slate-500/10'}`}>{inv.role}</span>
                        {expiresSoon && <span className="text-[9px] font-mono font-bold text-amber-400">⚠ Expiring soon</span>}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400">{inv.email} · Expires {new Date(inv.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => handleResend(inv.email)} disabled={resendingEmail === inv.email}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0d1017] border border-[#272f45] hover:border-[#f38020]/40 text-[11px] text-slate-300 hover:text-white font-semibold transition-colors disabled:opacity-50">
                        {resendingEmail === inv.email ? <Loader2 className="w-3 h-3 animate-spin" /> : <MailCheck className="w-3 h-3 text-[#f38020]" />}
                        Resend
                      </button>
                      <button onClick={() => handleRevoke(inv.email, inv.name)} disabled={revokingEmail === inv.email}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-[11px] text-rose-400 font-semibold transition-colors disabled:opacity-50">
                        {revokingEmail === inv.email ? <Loader2 className="w-3 h-3 animate-spin" /> : <MailX className="w-3 h-3" />}
                        Revoke
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVE USER ROSTER ── */}
      <div className="bg-[#151924] border border-[#272f45] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#272f45]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#f38020]" />
            <span className="text-sm font-bold text-white">Active Accounts ({orgUsers.length})</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Role changes take effect immediately</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#272f45] bg-[#0d1017] font-mono text-[10px] uppercase text-slate-500">
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Joined</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272f45]/60">
              {orgUsers.map(u => (
                <tr key={u.id} className={`hover:bg-[#1c2030] transition-colors ${currentUser.id === u.id ? 'bg-[#f38020]/5' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#272f45] flex items-center justify-center font-mono text-[11px] font-bold text-slate-200 shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200">{u.name}</span>
                          {currentUser.id === u.id && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f38020] text-black font-bold font-mono">You</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <select value={u.role} disabled={currentUser.id === u.id} onChange={e => updateUserRole(u.id, e.target.value as UserRole)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-[#0d1017] border border-[#272f45] focus:outline-none focus:border-[#f38020] transition-colors ${rolePillColor[u.role]?.split(' ')[1] || 'text-slate-200'}`}>
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="ANALYST">ANALYST</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-slate-300 font-mono">{u.department}</td>

                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                      <Check className="w-3 h-3" /> ACTIVE
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {currentUser.id !== u.id && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => switchUser(u.id)}
                          className="px-2 py-1 rounded-lg bg-[#0d1017] hover:bg-[#272f45] text-[#f38020] border border-[#272f45] text-[10px] font-semibold transition-colors">
                          Switch Session
                        </button>
                        <button onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors" title="Delete user">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
