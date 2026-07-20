import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react';

const API = '/api/v1';

export const VerifyOrgView: React.FC<{ token: string }> = ({ token }) => {
  const [phase, setPhase] = useState<'loading' | 'success' | 'error'>('loading');
  const [org, setOrg]     = useState<{ name: string; adminEmail: string } | null>(null);
  const [errMsg, setErrMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent]       = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/organizations/verify?token=${token}`);
        const data = await res.json();
        if (!res.ok) { setErrMsg(data.error || 'Verification failed.'); setPhase('error'); return; }
        setOrg(data.org);
        setPhase('success');
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch {
        setErrMsg('Could not reach the server. Please try again.');
        setPhase('error');
      }
    })();
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch(`${API}/organizations/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: org?.adminEmail || '' }),
      });
      if (res.ok) setResent(true);
    } finally { setResending(false); }
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

        <div className="bg-[#111722] border border-[#1e2a3a] rounded-xl p-8 shadow-2xl text-center space-y-5">

          {/* LOADING */}
          {phase === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-[#f38020] animate-spin mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-white">Verifying your organization…</h2>
                <p className="text-sm text-[#7d8fa8] mt-1">Just a moment</p>
              </div>
            </>
          )}

          {/* SUCCESS */}
          {phase === 'success' && org && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Organization Verified!</h2>
                <p className="text-sm text-[#7d8fa8] mt-2">
                  <span className="text-white font-semibold">{org.name}</span> is now active on AegisCloud.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-xs font-mono text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#4a5568]">Organization</span>
                  <span className="text-white font-bold">{org.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4a5568]">Admin Email</span>
                  <span className="text-[#7d8fa8]">{org.adminEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4a5568]">Status</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
              </div>

              <a href={window.location.origin}
                className="w-full py-2.5 bg-[#f38020] hover:bg-[#d96c10] text-black font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#f38020]/20">
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </a>
            </>
          )}

          {/* ERROR */}
          {phase === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Verification Failed</h2>
                <p className="text-sm text-[#7d8fa8] mt-2">{errMsg}</p>
              </div>
              <div className="space-y-2">
                <button onClick={handleResend} disabled={resending || resent}
                  className="w-full py-2.5 bg-[#1e2a3a] hover:bg-[#253044] text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors border border-[#253044] disabled:opacity-50">
                  {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {resent ? 'Verification Email Resent!' : 'Resend Verification Email'}
                </button>
                <a href={window.location.origin} className="block text-xs text-[#7d8fa8] hover:text-white transition-colors">
                  ← Back to Sign In
                </a>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[11px] font-mono text-[#4a5568]">Protected by Cloudflare Zero Trust · SOC 2 Type II</p>
      </div>
    </div>
  );
};
