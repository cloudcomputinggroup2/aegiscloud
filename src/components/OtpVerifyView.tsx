import React, { useEffect, useRef, useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, Loader2, ArrowLeft, Shield } from 'lucide-react';

const API = '/api/v1';

interface Props {
  sessionId: string;
  email: string;
  onSuccess: (jwt: string, email: string) => void;
  onBack: () => void;
}

export const OtpVerifyView: React.FC<Props> = ({ sessionId, email, onSuccess, onBack }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCd, setResendCd] = useState(60); // seconds cooldown
  const [trustDevice, setTrustDevice] = useState(false);
  const [success, setSuccess]   = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setTimeout(() => setResendCd(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCd]);

  // Auto-focus first input
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleDigit = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    setError('');
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d) && val) submitOtp(next.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft'  && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split('');
      setDigits(next);
      inputRefs.current[5]?.focus();
      submitOtp(pasted);
    }
  };

  const submitOtp = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const deviceId = localStorage.getItem('aegis_device_id') || (() => {
        const id = crypto.randomUUID();
        localStorage.setItem('aegis_device_id', id);
        return id;
      })();
      const res  = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, otp: code, trustDevice, deviceId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid code.'); setDigits(['','','','','','']); inputRefs.current[0]?.focus(); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => onSuccess(data.jwt, data.email), 700);
    } catch {
      setError('Server error. Try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCd > 0) return;
    setResending(true);
    try {
      const res = await fetch(`${API}/auth/resend-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId }) });
      if (res.ok) { setResendCd(60); setDigits(['','','','','','']); setError(''); inputRefs.current[0]?.focus(); }
      else { const d = await res.json(); setError(d.error || 'Could not resend.'); }
    } catch { setError('Server error.'); }
    setResending(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-full bg-[#f38020]/15 border border-[#f38020]/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#f38020]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Two-Factor Verification</h2>
          <p className="text-xs text-[#7d8fa8] mt-0.5 font-mono">Enter the 6-digit code sent to <span className="text-white">{email}</span></p>
        </div>
      </div>

      {/* Error / success banners */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Verified — loading dashboard…
        </div>
      )}

      {/* 6-digit input boxes */}
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            disabled={loading || success}
            className={`w-12 h-14 text-center text-2xl font-black rounded-lg border-2 bg-[#0d1017] text-white transition-all outline-none font-mono
              ${d ? 'border-[#f38020] shadow-lg shadow-[#f38020]/20' : 'border-[#1e2a3a] focus:border-[#f38020]'}
              ${loading || success ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        ))}
      </div>

      {/* Trust device */}
      <div className="flex items-center gap-2.5">
        <input type="checkbox" id="trust-device" checked={trustDevice} onChange={e => setTrustDevice(e.target.checked)} className="accent-[#f38020] w-3.5 h-3.5" />
        <label htmlFor="trust-device" className="text-xs text-[#7d8fa8] cursor-pointer">Trust this device for 30 days</label>
      </div>

      {/* Resend + back */}
      <div className="flex items-center justify-between pt-1">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#7d8fa8] hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </button>
        <button onClick={handleResend} disabled={resendCd > 0 || resending}
          className="flex items-center gap-1.5 text-xs text-[#f38020] hover:underline disabled:text-[#4a5568] disabled:no-underline transition-colors">
          {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
          {resendCd > 0 ? `Resend in ${resendCd}s` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
};
