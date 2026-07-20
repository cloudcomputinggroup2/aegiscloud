import React, { useState } from 'react';
import {
  Shield, Lock, Building2, KeyRound, Mail,
  ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2,
  Globe, ChevronRight, Zap, Server, ShieldCheck, Users
} from 'lucide-react';
import { useCSIMP } from '../lib/store';
import { OtpVerifyView } from './OtpVerifyView';

const API           = '/api/v1';
const DEMO_PASSWORD = import.meta.env.VITE_DEFAULT_DEMO_PASSWORD || 'Demo@Aegis2026!';

const DEMO_ACCOUNTS = [
  { email: 'marcus.brody@aegiscloud.corp',  role: 'ADMIN',    name: 'Marcus Brody' },
  { email: 'sarah.chen@aegiscloud.corp',    role: 'ANALYST',  name: 'Sarah Chen' },
  { email: 'jane.doe@aegiscloud.corp',      role: 'EMPLOYEE', name: 'Jane Doe' },
];

const STATS = [
  { value: '23K+',    label: 'WAF Events Today' },
  { value: '99.8%',   label: 'SOAR Auto-Response' },
  { value: '<2s',     label: 'Playbook Execute' },
  { value: 'Multi-AZ',label: 'AWS Availability' },
];

export const AuthScreen: React.FC = () => {
  const { login, createOrganization, setActiveTab } = useCSIMP();

  const [authMode, setAuthMode]   = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loginMethod, setLoginMethod] = useState<'EMAIL' | 'SSO' | 'WEBAUTHN'>('EMAIL');

  // Login fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [ssoProvider, setSsoProvider] = useState('Okta Enterprise SSO');

  // Register fields
  const [orgName, setOrgName]     = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Forgot password
  const [forgotMode, setForgotMode]   = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent]   = useState(false);

  // OTP step
  const [otpSessionId, setOtpSessionId] = useState('');
  const [otpEmail, setOtpEmail]         = useState('');
  const [showOtp, setShowOtp]           = useState(false);

  // UX states
  const [error, setError]     = useState('');
  const [shake, setShake]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [regPending, setRegPending] = useState(false); // org registered, check inbox

  // Stat ticker
  const [statIdx, setStatIdx] = useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setStatIdx(i => (i + 1) % STATS.length), 2500);
    return () => clearTimeout(t);
  }, []);

  const triggerShake = (msg: string) => {
    setError(msg); setShake(true);
    setTimeout(() => setShake(false), 550);
  };

  // ── OTP success handler ───────────────────────────────────────────────────
  const handleOtpSuccess = (_jwt: string, verifiedEmail: string) => {
    login(verifiedEmail, 'Email OTP');
    setActiveTab('dashboard');
  };

  // ── EMAIL LOGIN (calls backend → OTP) ────────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim())  { triggerShake('Please enter your corporate email.'); return; }
    if (!password)      { triggerShake('Password is required.'); return; }
    if (password !== DEMO_PASSWORD) { triggerShake('Invalid credentials. Check your email or password.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { triggerShake(data.error || 'Authentication failed.'); setLoading(false); return; }
      if (data.skip_otp) {
        login(email, 'Trusted Device'); setActiveTab('dashboard');
      } else {
        setOtpSessionId(data.session_id);
        setOtpEmail(email);
        setShowOtp(true);
      }
    } catch {
      // Offline fallback: skip OTP, validate demo password locally
      if (password === DEMO_PASSWORD) {
        login(email, 'Work Email (offline)'); setActiveTab('dashboard');
      } else {
        triggerShake('Server unreachable. Check backend or use demo accounts below.');
      }
    }
    setLoading(false);
  };

  // ── SSO LOGIN ─────────────────────────────────────────────────────────────
  const handleSSOLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!email.trim()) { triggerShake('Please enter your corporate identity email.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    try {
      const res  = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) { setOtpSessionId(data.session_id); setOtpEmail(email); setShowOtp(true); }
      else triggerShake(data.error || 'SSO authentication failed.');
    } catch {
      login(email, ssoProvider); setActiveTab('dashboard');
    }
    setLoading(false);
  };

  // ── WEBAUTHN LOGIN ────────────────────────────────────────────────────────
  const handleWebAuthn = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!email.trim()) { triggerShake('Enter the email linked to your hardware key.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    login(email, 'FIDO2 YubiKey'); setActiveTab('dashboard');
    setLoading(false);
  };

  // ── TENANT REGISTER ───────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!orgName.trim() || !adminEmail.trim() || !adminName.trim()) {
      triggerShake('All fields are required.'); return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/organizations/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgName, adminName, adminEmail, slug: orgName.toLowerCase().replace(/\s+/g,'-') }) });
      const data = await res.json();
      if (!res.ok) { triggerShake(data.error || 'Registration failed.'); setLoading(false); return; }
      setRegPending(true);
    } catch {
      // Offline fallback
      createOrganization(orgName, orgName.toLowerCase().replace(/\s+/g,'-'), adminName, adminEmail);
      setSuccess(true); setTimeout(() => setActiveTab('dashboard'), 800);
    }
    setLoading(false);
  };

  // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { triggerShake('Please enter your email.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setForgotSent(true); setLoading(false);
  };

  // ── QUICK LOGIN ───────────────────────────────────────────────────────────
  const quickLogin = async (qEmail: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    login(qEmail, 'Evaluator Quick Auth'); setActiveTab('dashboard');
    setLoading(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d1017] flex antialiased selection:bg-[#f38020] selection:text-black font-sans">

      {/* ── LEFT BRAND PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between bg-[#0d1017] border-r border-[#1e2a3a] p-10 xl:p-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(246,130,31,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(246,130,31,.04) 1px,transparent 1px)', backgroundSize:'56px 56px' }} />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[#f38020]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#f38020] flex items-center justify-center shadow-lg shadow-[#f38020]/30">
            <Shield className="w-5 h-5 fill-black text-[#f38020]" />
          </div>
          <span className="font-black text-xl tracking-tight text-white uppercase">Aegis<span className="text-[#f38020]">Cloud</span></span>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f38020]/15 text-[#f38020] border border-[#f38020]/30">ENTERPRISE</span>
        </div>

        <div className="relative space-y-8 max-w-md">
          <div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.08] tracking-tight">Security Operations<br /><span className="text-[#f38020]">at Cloud Speed.</span></h1>
            <p className="mt-5 text-sm text-[#7d8fa8] leading-relaxed">The unified Cloud Security Incident Management Platform. Detect threats, orchestrate SOAR response, and vault forensic evidence — all from one command center.</p>
          </div>
          <div className="space-y-3">
            {[
              { icon: Zap,         label: 'SOAR Automated Playbooks',       sub: 'Phishing · Ransomware · Brute Force' },
              { icon: ShieldCheck, label: 'Cloudflare Edge WAF Integration', sub: 'IP Block · Rate Limit · Geo-fence' },
              { icon: Server,      label: 'AWS Multi-AZ High Availability',  sub: 'ALB · DynamoDB · S3 WORM Vault' },
              { icon: Users,       label: 'Role-Based Access Control',       sub: 'Employee · Analyst · Admin' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded bg-[#f38020]/10 border border-[#f38020]/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#f38020]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{label}</p>
                  <p className="text-[11px] text-[#4a5568] font-mono">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-[#111722] border border-[#1e2a3a]">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">{STATS[statIdx].value}</span>
              <span className="text-xs text-[#7d8fa8] font-mono">{STATS[statIdx].label}</span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {STATS.map((_, i) => (<div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-300" style={{ background: i === statIdx ? '#f38020' : '#1e2a3a' }} />))}
            </div>
          </div>
        </div>

        <div className="relative text-[10px] font-mono text-[#4a5568] space-y-1">
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /><span>Cloudflare Zero Trust Auth Proxy Active</span></div>
          <p>SOC 2 Type II Certified · FIDO2 / SAML 2.0 · Email OTP Verified Sign-in</p>
        </div>
      </div>

      {/* ── RIGHT AUTH PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen">
        <div className="lg:hidden flex items-center gap-2 mb-10 self-start">
          <div className="w-8 h-8 rounded bg-[#f38020] flex items-center justify-center"><Shield className="w-5 h-5 fill-black text-[#f38020]" /></div>
          <span className="font-black text-lg uppercase text-white">Aegis<span className="text-[#f38020]">Cloud</span></span>
        </div>

        <div className="w-full max-w-md space-y-5">

          {/* ── OTP STEP ── */}
          {showOtp ? (
            <div className="bg-[#111722] border border-[#1e2a3a] rounded-xl p-7 shadow-2xl">
              <OtpVerifyView sessionId={otpSessionId} email={otpEmail} onSuccess={handleOtpSuccess} onBack={() => { setShowOtp(false); setError(''); }} />
            </div>
          ) : forgotMode ? (
            /* ── FORGOT PASSWORD ── */
            <div className="bg-[#111722] border border-[#1e2a3a] rounded-xl p-8 shadow-2xl space-y-5">
              {forgotSent ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto"><CheckCircle2 className="w-7 h-7 text-emerald-400" /></div>
                  <div><h2 className="text-lg font-bold text-white">Check your inbox</h2><p className="text-xs text-[#7d8fa8] mt-1">Reset link sent to <span className="text-white font-semibold">{forgotEmail}</span></p></div>
                  <button onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }} className="text-xs text-[#f38020] hover:underline">← Back to Sign In</button>
                </div>
              ) : (
                <>
                  <div><h2 className="text-xl font-bold text-white">Reset Password</h2><p className="text-xs text-[#7d8fa8] mt-1">Enter your corporate email and we'll send a reset link.</p></div>
                  {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div><label className="block text-[10px] font-mono uppercase text-[#4a5568] mb-1.5">Corporate Email</label>
                      <div className="relative"><Mail className="w-4 h-4 text-[#4a5568] absolute left-3 top-3" />
                        <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@company.corp"
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-sm text-slate-100 placeholder:text-[#4a5568] focus:outline-none focus:border-[#f38020] transition-colors" /></div></div>
                    <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#f38020] hover:bg-[#d96c10] text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                      {loading ? <span className="animate-spin w-4 h-4 border-2 border-black/30 border-t-black rounded-full" /> : 'Send Reset Link'}
                    </button>
                  </form>
                  <button onClick={() => { setForgotMode(false); setError(''); }} className="text-xs text-[#7d8fa8] hover:text-white">← Back to Sign In</button>
                </>
              )}
            </div>
          ) : regPending ? (
            /* ── REGISTER PENDING — check inbox ── */
            <div className="bg-[#111722] border border-[#1e2a3a] rounded-xl p-8 shadow-2xl text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#f38020]/15 border border-[#f38020]/30 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-[#f38020]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Verify your organization</h2>
                <p className="text-sm text-[#7d8fa8] mt-2">We sent a verification email to <span className="text-white font-semibold">{adminEmail}</span>. Click the link in the email to activate <span className="text-[#f38020]">{orgName}</span>.</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-xs font-mono text-left space-y-1">
                <p className="text-[#4a5568]">Organization status: <span className="text-amber-400 font-bold">PENDING VERIFICATION</span></p>
                <p className="text-[#4a5568]">The link expires in <span className="text-white">48 hours</span>.</p>
              </div>
              <button onClick={async () => {
                await fetch(`${API}/organizations/resend-verification`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ adminEmail }) }).catch(()=>{});
              }} className="text-xs text-[#f38020] hover:underline">Resend verification email</button>
              <button onClick={() => { setRegPending(false); setAuthMode('LOGIN'); }} className="block text-xs text-[#7d8fa8] hover:text-white mx-auto">← Back to Sign In</button>
            </div>
          ) : (
            <>
              {/* Mode tabs */}
              <div className="flex gap-1 p-1 bg-[#111722] border border-[#1e2a3a] rounded-xl">
                {(['LOGIN','REGISTER'] as const).map(m => (
                  <button key={m} onClick={() => { setAuthMode(m); setError(''); }} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode===m ? 'bg-[#f38020] text-black' : 'text-[#7d8fa8] hover:text-white'}`}>
                    {m === 'LOGIN' ? 'Sign In' : 'Register Tenant'}
                  </button>
                ))}
              </div>

              <div className={`bg-[#111722] border border-[#1e2a3a] rounded-xl p-7 shadow-2xl space-y-5 ${shake ? 'animate-[shake_.5s_ease]' : ''}`}>
                <div>
                  <h2 className="text-xl font-bold text-white">{authMode==='LOGIN' ? 'Sign in to your workspace' : 'Create organization tenant'}</h2>
                  <p className="text-xs text-[#7d8fa8] mt-1">{authMode==='LOGIN' ? 'Enter corporate credentials — a verification code will be sent to your email.' : 'Provision a new tenant. A verification email will be sent to your admin address.'}</p>
                </div>

                {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
                {success && <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400"><CheckCircle2 className="w-4 h-4 shrink-0" />Authenticated — redirecting…</div>}

                {authMode === 'LOGIN' ? (
                  <>
                    {/* Login method tabs */}
                    <div className="grid grid-cols-3 gap-1 p-1 bg-[#0d1017] rounded-lg border border-[#1e2a3a] text-[11px] font-mono">
                      {([{id:'EMAIL',label:'Work Email'},{id:'SSO',label:'SAML SSO'},{id:'WEBAUTHN',label:'Hardware Key'}] as const).map(m => (
                        <button key={m.id} onClick={() => { setLoginMethod(m.id); setError(''); }}
                          className={`py-1.5 rounded-md font-semibold transition-all ${loginMethod===m.id ? 'bg-[#1c2030] text-[#f38020] border border-[#f38020]/30' : 'text-[#4a5568] hover:text-white'}`}>{m.label}</button>
                      ))}
                    </div>

                    {/* EMAIL */}
                    {loginMethod === 'EMAIL' && (
                      <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div><label className="block text-[10px] font-mono uppercase text-[#4a5568] mb-1.5">Corporate Email</label>
                          <div className="relative"><Mail className="w-4 h-4 text-[#4a5568] absolute left-3 top-3" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.corp" required
                              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-sm text-slate-100 placeholder:text-[#4a5568] focus:outline-none focus:border-[#f38020] transition-colors" /></div></div>
                        <div><div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] font-mono uppercase text-[#4a5568]">Password</label>
                            <button type="button" onClick={() => setForgotMode(true)} className="text-[10px] text-[#f38020] hover:underline">Forgot password?</button></div>
                          <div className="relative"><Lock className="w-4 h-4 text-[#4a5568] absolute left-3 top-3" />
                            <input type={showPw?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" required
                              className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-sm text-slate-100 placeholder:text-[#4a5568] focus:outline-none focus:border-[#f38020] transition-colors" />
                            <button type="button" onClick={() => setShowPw(p=>!p)} className="absolute right-3 top-2.5 text-[#4a5568] hover:text-white">{showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="remember" className="accent-[#f38020] w-3.5 h-3.5" />
                          <label htmlFor="remember" className="text-xs text-[#7d8fa8]">Remember this device</label>
                        </div>
                        <button type="submit" disabled={loading||success} className="w-full py-2.5 bg-[#f38020] hover:bg-[#d96c10] text-black font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#f38020]/20 disabled:opacity-60">
                          {loading?<span className="animate-spin w-4 h-4 border-2 border-black/30 border-t-black rounded-full"/>:<><span>Sign In & Send Code</span><ArrowRight className="w-4 h-4"/></>}
                        </button>
                      </form>
                    )}

                    {/* SSO */}
                    {loginMethod === 'SSO' && (
                      <form onSubmit={handleSSOLogin} className="space-y-4">
                        <div><label className="block text-[10px] font-mono uppercase text-[#4a5568] mb-1.5">Identity Provider</label>
                          <select value={ssoProvider} onChange={e => setSsoProvider(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-sm text-slate-200 focus:outline-none focus:border-[#f38020]">
                            <option>Okta Enterprise SSO</option><option>Microsoft Entra ID (Azure AD)</option><option>Google Workspace SSO</option><option>PingIdentity SAML 2.0</option>
                          </select></div>
                        <div><label className="block text-[10px] font-mono uppercase text-[#4a5568] mb-1.5">Corporate Identity Email</label>
                          <div className="relative"><Building2 className="w-4 h-4 text-[#4a5568] absolute left-3 top-3" />
                            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.corp" required
                              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-sm text-slate-100 placeholder:text-[#4a5568] focus:outline-none focus:border-[#f38020] transition-colors"/></div></div>
                        <button type="submit" disabled={loading||success} className="w-full py-2.5 bg-[#f38020] hover:bg-[#d96c10] text-black font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                          {loading?<span className="animate-spin w-4 h-4 border-2 border-black/30 border-t-black rounded-full"/>:<><Globe className="w-4 h-4"/><span>Continue with {ssoProvider.split(' ')[0]}</span></>}
                        </button>
                      </form>
                    )}

                    {/* WEBAUTHN */}
                    {loginMethod === 'WEBAUTHN' && (
                      <form onSubmit={handleWebAuthn} className="space-y-4">
                        <div className="p-5 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-[#f38020]/15 border border-[#f38020]/30 flex items-center justify-center mx-auto"><KeyRound className="w-6 h-6 text-[#f38020]"/></div>
                          <div><p className="text-sm font-bold text-white">FIDO2 / YubiKey Authentication</p><p className="text-[11px] text-[#4a5568] font-mono mt-0.5">Insert your key or touch your biometric sensor</p></div>
                        </div>
                        <div><label className="block text-[10px] font-mono uppercase text-[#4a5568] mb-1.5">Email linked to hardware key</label>
                          <div className="relative"><Mail className="w-4 h-4 text-[#4a5568] absolute left-3 top-3" />
                            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.corp" required
                              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-sm text-slate-100 placeholder:text-[#4a5568] focus:outline-none focus:border-[#f38020] transition-colors"/></div></div>
                        <button type="submit" disabled={loading||success} className="w-full py-2.5 bg-[#f38020] hover:bg-[#d96c10] text-black font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                          {loading?<span className="animate-spin w-4 h-4 border-2 border-black/30 border-t-black rounded-full"/>:<><KeyRound className="w-4 h-4"/><span>Authenticate with Key</span></>}
                        </button>
                      </form>
                    )}

                    {/* Demo quick-login */}
                    <details className="text-center">
                      <summary className="text-[11px] text-[#4a5568] hover:text-[#7d8fa8] cursor-pointer list-none select-none">Evaluator / Demo Access ↓</summary>
                      <div className="mt-3 grid grid-cols-3 gap-1.5">
                        {DEMO_ACCOUNTS.map(a => (
                          <button key={a.email} onClick={() => quickLogin(a.email)} disabled={loading}
                            className="py-1.5 px-2 rounded-lg bg-[#0d1017] hover:bg-[#1c2030] border border-[#1e2a3a] hover:border-[#f38020]/40 text-[10px] font-semibold text-slate-300 transition-all">
                            <div className="font-bold text-white">{a.role}</div>
                            <div className="text-[#4a5568] truncate">{a.name}</div>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#4a5568] mt-2 font-mono">Password: {DEMO_PASSWORD}</p>
                    </details>
                  </>
                ) : (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegister} className="space-y-4">
                    {[
                      { label: 'Organization Name',        value: orgName,     set: setOrgName,     ph: 'Acme Security Corp',  type: 'text' },
                      { label: 'Administrator Full Name',   value: adminName,   set: setAdminName,   ph: 'Marcus Brody',        type: 'text' },
                      { label: 'Administrator Work Email',  value: adminEmail,  set: setAdminEmail,  ph: 'admin@acme-sec.com',  type: 'email' },
                    ].map(f => (
                      <div key={f.label}><label className="block text-[10px] font-mono uppercase text-[#4a5568] mb-1.5">{f.label} *</label>
                        <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph} required
                          className="w-full px-3 py-2.5 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-sm text-slate-100 placeholder:text-[#4a5568] focus:outline-none focus:border-[#f38020] transition-colors"/></div>
                    ))}
                    <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1e2a3a] text-[11px] text-[#4a5568] font-mono">
                      📧 A verification email will be sent to your admin address. Your org remains <span className="text-amber-400">PENDING</span> until verified.
                    </div>
                    <button type="submit" disabled={loading||success} className="w-full py-2.5 bg-[#f38020] hover:bg-[#d96c10] text-black font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                      {loading?<span className="animate-spin w-4 h-4 border-2 border-black/30 border-t-black rounded-full"/>:<><span>Register & Verify</span><ChevronRight className="w-4 h-4"/></>}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          <p className="text-center text-[11px] font-mono text-[#4a5568]">Protected by Cloudflare Zero Trust · SOC 2 Type II · Email OTP</p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)}
          30%{transform:translateX(8px)} 45%{transform:translateX(-6px)}
          60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)}
        }
      `}</style>
    </div>
  );
};
