import React, { useState, useEffect } from 'react';
import {
  Shield, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, ArrowRight, Loader2, XCircle
} from 'lucide-react';
import { useCSIMP } from '../lib/store';

const API = '/api/v1';

interface InviteData {
  name: string;
  email: string;
  role: string;
  department: string;
  orgId: string;
  orgName: string;
}

const strengthScore = (pw: string) => {
  let s = 0;
  if (pw.length >= 12)         s++;
  if (pw.length >= 16)         s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[a-z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const strengthLabel = (s: number) => ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][s] || '';
const strengthColor = (s: number) => ['', '#ef4444','#f97316','#eab308','#3b82f6','#22c55e','#10b981'][s] || '#1e2a3a';

export const AcceptInviteView: React.FC<{ token: string }> = ({ token }) => {
  const { login, setActiveTab } = useCSIMP();

  const [phase, setPhase] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [errMsg, setErrMsg]   = useState('');
  const [pw, setPw]           = useState('');
  const [pw2, setPw2]         = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/invitations/verify?token=${token}`);
        const data = await res.json();
        if (!res.ok) { setErrMsg(data.error || 'Invalid or expired invite link.'); setPhase('error'); return; }
        setInvite(data.invite);
        setPhase('form');
      } catch {
        setErrMsg('Could not reach the server. Please try again later.');
        setPhase('error');
      }
    })();
  }, [token]);

  const score = strengthScore(pw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || pw.length < 12) { setErrMsg('Password must be at least 12 characters.'); return; }
    if (pw !== pw2)             { setErrMsg('Passwords do not match.'); return; }
    if (score < 3)              { setErrMsg('Please choose a stronger password.'); return; }
    setErrMsg('');
    setSubmitting(true);
    try {
      const res  = await fetch(`${API}/invitations/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: pw }) });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error || 'Failed to accept invitation.'); setSubmitting(false); return; }
      setPhase('success');
      setTimeout(() => {
        if (invite) login(invite.email, 'Invite Acceptance');
        setActiveTab('dashboard');
      }, 1800);
    } catch {
      setErrMsg('Server error. Please try again.');
    }
    setSubmitting(false);
  };

  const roleColor: Record<string, string> = {
    ADMIN:    'bg-rose-500/15 text-rose-400 border-rose-500/30',
    ANALYST:  'bg-amber-500/15 text-amber-300 border-amber-500/30',
    EMPLOYEE: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="min-h-screen bg-[#0d1017] flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-md space-y-5">

        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="w-9 h-9 rounded-lg bg-[#f38020] flex items-center justify-center shadow-lg shadow-[#f38020]/30">
            <Shield className="w-5 h-5 fill-black text-[#f38020]" />
          </div>
          <span className="font-black text-xl tracking-tight text-white uppercase">Aegis<span className="text-[#f38020]">Cloud</span></span>
        </div>

        <div className="bg-[#111722] border border-[#1e2a3a] rounded-xl p-8 shadow-2xl">

          {/* LOADING */}
          {phase === 'loading' && (
            <div className="text-center py-8 space-y-3">
              <Loader2 className="w-10 h-10 text-[#f38020] animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Verifying your invitation…</p>
            </div>
          )}

          {/* ERROR */}
          {phase === 'error' && (
            <div className="text-center py-6 space-y-4">
              <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Invite Invalid</h2>
              <p className="text-sm text-slate-400">{errMsg}</p>
              <p className="text-xs text-slate-500">Contact your system administrator to request a new invitation.</p>
            </div>
          )}

          {/* SUCCESS */}
          {phase === 'success' && (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Welcome aboard!</h2>
              <p className="text-sm text-slate-400">Your account is active. Redirecting to your dashboard…</p>
            </div>
          )}

          {/* FORM */}
          {phase === 'form' && invite && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Accept your invitation</h2>
                <p className="text-xs text-[#7d8fa8] mt-1">Set a password to activate your AegisCloud account.</p>
              </div>

              {/* Invite summary */}
              <div className="p-4 rounded-lg bg-[#0d1017] border border-[#1e2a3a] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#7d8fa8]">Name</span>
                  <span className="font-bold text-white">{invite.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7d8fa8]">Email</span>
                  <span className="font-mono text-slate-300">{invite.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7d8fa8]">Organization</span>
                  <span className="font-bold text-white">{invite.orgName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7d8fa8]">Role</span>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${roleColor[invite.role] || 'text-slate-400 border-slate-500/30'}`}>{invite.role}</span>
                </div>
              </div>

              {errMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#4a5568] mb-1.5">Create Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#4a5568] absolute left-3 top-3" />
                    <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Min 12 characters" required
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-sm text-slate-100 placeholder:text-[#4a5568] focus:outline-none focus:border-[#f38020] transition-colors" />
                    <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-2.5 text-[#4a5568] hover:text-white">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {pw && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{ background: i <= score ? strengthColor(score) : '#1e2a3a' }} />
                        ))}
                      </div>
                      <p className="text-[10px] font-mono" style={{ color: strengthColor(score) }}>{strengthLabel(score)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#4a5568] mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#4a5568] absolute left-3 top-3" />
                    <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Repeat password" required
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0d1017] border text-sm text-slate-100 placeholder:text-[#4a5568] focus:outline-none transition-colors ${pw2 && pw !== pw2 ? 'border-rose-500/60' : pw2 && pw === pw2 ? 'border-emerald-500/60' : 'border-[#1e2a3a] focus:border-[#f38020]'}`} />
                  </div>
                </div>

                <ul className="text-[10px] text-[#4a5568] font-mono space-y-1">
                  {[['12+ characters', pw.length >= 12], ['Uppercase letter', /[A-Z]/.test(pw)], ['Number', /[0-9]/.test(pw)], ['Special character', /[^A-Za-z0-9]/.test(pw)]].map(([label, ok]) => (
                    <li key={label as string} className="flex items-center gap-1.5">
                      <span className={ok ? 'text-emerald-400' : ''}>{ ok ? '✓' : '○'}</span> {label}
                    </li>
                  ))}
                </ul>

                <button type="submit" disabled={submitting}
                  className="w-full py-2.5 bg-[#f38020] hover:bg-[#d96c10] text-black font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#f38020]/20 disabled:opacity-60">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Activate Account</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] font-mono text-[#4a5568]">Protected by Cloudflare Zero Trust · SOC 2 Type II</p>
      </div>
    </div>
  );
};
