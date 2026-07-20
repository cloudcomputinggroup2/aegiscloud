require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const APP_BASE_URL   = process.env.APP_BASE_URL   || 'http://localhost:5173';
const FROM_INVITE    = process.env.RESEND_FROM_INVITE   || 'invite@aegiscloud.corp';
const FROM_VERIFY    = process.env.RESEND_FROM_VERIFY   || 'verify@aegiscloud.corp';
const FROM_NOREPLY   = process.env.RESEND_FROM_NOREPLY  || 'noreply@aegiscloud.corp';
const JWT_SECRET     = process.env.JWT_SECRET || 'aegis-dev-secret-change-in-prod';
const INVITE_EXPIRY_H  = Number(process.env.INVITE_TOKEN_EXPIRY_HOURS  || 24);
const ORG_EXPIRY_H     = Number(process.env.ORG_VERIFY_TOKEN_EXPIRY_HOURS || 48);
const OTP_EXPIRY_MIN   = Number(process.env.OTP_EXPIRY_MINUTES || 10);
const BUCKET_NAME      = process.env.AWS_S3_EVIDENCE_BUCKET;
const s3 = new S3Client(db.clientParams);

// ── Helpers ───────────────────────────────────────────────────────────────────
const genToken  = () => crypto.randomBytes(32).toString('hex');
const genId     = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const genOtp    = () => String(Math.floor(100000 + Math.random() * 900000));
const nowMs     = () => Date.now();
const addHours  = (h) => new Date(Date.now() + h * 3_600_000).toISOString();
const addMins   = (m) => new Date(Date.now() + m * 60_000).toISOString();
const isExpired = (isoStr) => new Date(isoStr).getTime() < Date.now();
const hashPassword = (pw) => crypto.createHash('sha256').update(pw + JWT_SECRET).digest('hex');
const simpleJwt    = (payload) => Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64');

// ── Resend Email Sender ───────────────────────────────────────────────────────
async function sendEmail({ from, to, subject, html }) {
  if (!RESEND_API_KEY || RESEND_API_KEY.includes('PLACEHOLDER')) {
    console.log(`\n📧 [EMAIL SIMULATED - no RESEND_API_KEY set]`);
    console.log(`   From: ${from}\n   To: ${to}\n   Subject: ${subject}\n`);
    return { id: 'simulated-' + Date.now() };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error ${res.status}: ${err}`);
  }
  return res.json();
}

// ── Email Templates ───────────────────────────────────────────────────────────
const emailShell = (content) => `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#0d1017;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e8edf5}
  .wrap{max-width:560px;margin:40px auto;background:#111722;border:1px solid #1e2a3a;border-radius:12px;overflow:hidden}
  .head{background:#0d1017;padding:28px 36px;border-bottom:1px solid #1e2a3a;display:flex;align-items:center;gap:12px}
  .logo-box{width:36px;height:36px;background:#f38020;border-radius:8px;display:flex;align-items:center;justify-content:center}
  .logo-text{font-size:18px;font-weight:900;color:#fff;letter-spacing:-.5px}
  .logo-text span{color:#f38020}
  .body{padding:36px}
  .cta{display:inline-block;padding:14px 32px;background:#f38020;color:#000;text-decoration:none;border-radius:8px;font-weight:800;font-size:15px;margin:24px 0}
  .pill{display:inline-block;padding:3px 10px;border-radius:4px;font-size:11px;font-family:monospace;font-weight:700}
  .pill-orange{background:rgba(243,128,32,.15);color:#f38020;border:1px solid rgba(243,128,32,.3)}
  .pill-green{background:rgba(34,197,94,.12);color:#22c55e;border:1px solid rgba(34,197,94,.25)}
  .pill-blue{background:rgba(59,130,246,.12);color:#60a5fa;border:1px solid rgba(59,130,246,.25)}
  .otp{font-size:48px;font-weight:900;letter-spacing:12px;color:#f38020;font-family:monospace;text-align:center;padding:24px;background:#0d1017;border-radius:8px;border:1px solid #1e2a3a;margin:20px 0}
  .muted{color:#7d8fa8;font-size:13px;line-height:1.7}
  .warn{color:#f59e0b;font-size:12px;font-family:monospace}
  .foot{padding:20px 36px;border-top:1px solid #1e2a3a;font-size:11px;color:#4a5568;font-family:monospace}
  hr{border:none;border-top:1px solid #1e2a3a;margin:20px 0}
</style></head><body>
<div class="wrap">
  <div class="head">
    <div class="logo-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="black"><path d="M12 2L4 5v6c0 5.25 3.4 10.15 8 11.35C16.6 21.15 20 16.25 20 11V5l-8-3z"/></svg></div>
    <div class="logo-text">AEGIS<span>CLOUD</span></div>
  </div>
  <div class="body">${content}</div>
  <div class="foot">AegisCloud Security Operations Platform &bull; SOC 2 Type II &bull; Cloudflare Zero Trust<br>This email was sent automatically. Do not reply.</div>
</div>
</body></html>`;

const inviteEmail = ({ name, orgName, role, inviteUrl, expiresIn }) => emailShell(`
  <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff">You've been invited to join <span style="color:#f38020">${orgName}</span></h2>
  <p class="muted">Hi ${name},</p>
  <p class="muted">A System Administrator has added you to the <strong style="color:#e8edf5">${orgName}</strong> organization on AegisCloud with the following access level:</p>
  <p><span class="pill pill-orange">${role}</span></p>
  <p class="muted">Click the button below to accept your invitation and set up your password. This link expires in <strong style="color:#f38020">${expiresIn} hours</strong>.</p>
  <a href="${inviteUrl}" class="cta">Accept Invitation &amp; Set Password →</a>
  <hr>
  <p class="muted" style="font-size:12px">If this link doesn't work, copy and paste:<br><span style="color:#60a5fa;font-family:monospace;word-break:break-all">${inviteUrl}</span></p>
  <p class="warn">⚠ This invitation expires in ${expiresIn} hours. Contact your admin if it expires.</p>`);

const orgVerifyEmail = ({ adminName, orgName, verifyUrl, expiresIn }) => emailShell(`
  <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff">Verify your organization</h2>
  <p class="muted">Hi ${adminName},</p>
  <p class="muted">Thank you for registering <strong style="color:#e8edf5">${orgName}</strong> on AegisCloud. Please verify your administrator email to activate your organization tenant.</p>
  <p class="muted">Your organization will remain in <span class="pill pill-blue">PENDING</span> status until verified.</p>
  <a href="${verifyUrl}" class="cta">Verify Organization →</a>
  <hr>
  <p class="muted" style="font-size:12px">Verify link:<br><span style="color:#60a5fa;font-family:monospace;word-break:break-all">${verifyUrl}</span></p>
  <p class="warn">⚠ This link expires in ${expiresIn} hours.</p>`);

const otpEmail = ({ name, otp, ip, browser, timestamp }) => emailShell(`
  <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff">Your sign-in verification code</h2>
  <p class="muted">Hi ${name}, someone is signing in to your AegisCloud account. Use the code below to complete authentication.</p>
  <div class="otp">${otp}</div>
  <p class="muted" style="text-align:center;font-size:12px">This code expires in <strong style="color:#f38020">10 minutes</strong>. Do not share it with anyone.</p>
  <hr>
  <p class="muted" style="font-size:12px"><strong style="color:#e8edf5">Sign-in details:</strong><br>
    Time: ${timestamp}<br>
    IP: ${ip}<br>
    Browser: ${browser}
  </p>
  <p class="warn" style="margin-top:16px">🚨 If you did not attempt to sign in, <strong>immediately</strong> change your password and contact your system administrator.</p>`);

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/v1/health', (_, res) => res.json({ status: 'HEALTHY', service: 'AegisCloud API (AWS Backed)', ts: new Date().toISOString() }));

// ── INCIDENTS ─────────────────────────────────────────────────────────────────
app.get('/api/v1/incidents', async (req, res) => {
  try {
    const incidents = await db.scan('AegisCloud_Incidents');
    res.json({ status: 'SUCCESS', count: incidents.length, incidents: incidents.sort((a,b) => b.createdAt.localeCompare(a.createdAt)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incidents', detail: err.message });
  }
});

app.post('/api/v1/incidents', async (req, res) => {
  const { title, category, severity, description } = req.body;
  const inc = { 
    id: `INC-2026-${Math.floor(Math.random()*9000+1000)}`, 
    title: title||'Untitled', 
    category: category||'Other', 
    severity: severity||'MEDIUM', 
    description: description||'', 
    status: 'OPEN', 
    createdAt: new Date().toISOString() 
  };
  try {
    await db.put('AegisCloud_Incidents', inc);
    res.status(201).json({ status: 'SUCCESS', incidentId: inc.id, data: inc });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create incident', detail: err.message });
  }
});

app.post('/api/v1/webhooks/audit-stream', (req, res) => {
  console.log('⚡ [SOAR WEBHOOK]:', req.body);
  res.json({ status: 'RECEIVED', webhookId: `wh-${Date.now()}` });
});

// ── EVIDENCE S3 INTEGRATION ───────────────────────────────────────────────────
app.post('/api/v1/evidence/upload', async (req, res) => {
  const { filename, contentType } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename required' });

  const key = `evidence/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType || 'application/octet-stream'
  });

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.json({ uploadUrl, key, url: `https://${BUCKET_NAME}.s3.${db.clientParams.region}.amazonaws.com/${key}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate signed URL', detail: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FLOW 1 — USER INVITATIONS
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/v1/invitations/send', async (req, res) => {
  const { name, email, role, department, orgName, orgId, adminName } = req.body;
  if (!name || !email || !role || !orgId) return res.status(400).json({ error: 'name, email, role, orgId required' });

  const token     = genToken();
  const expiresAt = addHours(INVITE_EXPIRY_H);
  const inviteUrl = `${APP_BASE_URL}?invite=${token}`;

  const inv = {
    token, name, email, role: role || 'EMPLOYEE',
    department: department || 'Corporate',
    orgId, orgName: orgName || 'Your Organization',
    status: 'PENDING', createdAt: new Date().toISOString(), expiresAt,
  };

  try {
    await db.put('AegisCloud_Invites', inv);
    await sendEmail({
      from: `AegisCloud Security <${FROM_INVITE}>`,
      to: email,
      subject: `You've been invited to join ${orgName || 'AegisCloud'}`,
      html: inviteEmail({ name, orgName: orgName || 'AegisCloud', role, inviteUrl, expiresIn: INVITE_EXPIRY_H }),
    });
    console.log(`📨 Invite sent → ${email}`);
    res.json({ status: 'SENT', token, inviteUrl, expiresAt });
  } catch (err) {
    await db.remove('AegisCloud_Invites', { token });
    res.status(500).json({ error: 'Failed to send invite email', detail: err.message });
  }
});

app.get('/api/v1/invitations/verify', async (req, res) => {
  const { token } = req.query;
  try {
    const inv = await db.get('AegisCloud_Invites', { token });
    if (!inv)                            return res.status(404).json({ error: 'Invite not found' });
    if (inv.status !== 'PENDING')        return res.status(410).json({ error: 'Invite already used or revoked' });
    if (isExpired(inv.expiresAt))        return res.status(410).json({ error: 'Invite link has expired. Request a new one.' });
    res.json({ status: 'VALID', invite: { name: inv.name, email: inv.email, role: inv.role, department: inv.department, orgId: inv.orgId, orgName: inv.orgName } });
  } catch(err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

app.post('/api/v1/invitations/accept', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'token and password required' });
  if (password.length < 12) return res.status(400).json({ error: 'Password must be at least 12 characters' });

  try {
    const inv = await db.get('AegisCloud_Invites', { token });
    if (!inv)                     return res.status(404).json({ error: 'Invite not found' });
    if (inv.status !== 'PENDING') return res.status(410).json({ error: 'Invite already used' });
    if (isExpired(inv.expiresAt)) return res.status(410).json({ error: 'Invite expired' });

    const userId = genId('usr');
    const user   = { id: userId, orgId: inv.orgId, name: inv.name, email: inv.email, role: inv.role, department: inv.department, status: 'ACTIVE', passwordHash: hashPassword(password), createdAt: new Date().toISOString() };
    await db.put('AegisCloud_Users', user);

    inv.status = 'ACCEPTED';
    inv.acceptedAt = new Date().toISOString();
    await db.put('AegisCloud_Invites', inv);

    const jwt = simpleJwt({ userId, email: inv.email, role: inv.role, orgId: inv.orgId });
    console.log(`✅ Invite accepted by ${inv.email} (${inv.role})`);
    res.json({ status: 'ACCEPTED', jwt, user: { id: userId, name: inv.name, email: inv.email, role: inv.role, orgId: inv.orgId, department: inv.department } });
  } catch(err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

app.post('/api/v1/invitations/resend', async (req, res) => {
  const { email, orgId, orgName, adminName } = req.body;
  try {
    const invites = await db.scan('AegisCloud_Invites');
    const existing = invites.find(i => i.email === email && i.orgId === orgId && i.status === 'PENDING');
    if (!existing) return res.status(404).json({ error: 'No pending invite for this email in this org' });

    existing.expiresAt = addHours(INVITE_EXPIRY_H);
    await db.put('AegisCloud_Invites', existing);
    const inviteUrl = `${APP_BASE_URL}?invite=${existing.token}`;

    await sendEmail({
      from: `AegisCloud Security <${FROM_INVITE}>`,
      to: email,
      subject: `Reminder: Your AegisCloud invitation to ${orgName}`,
      html: inviteEmail({ name: existing.name, orgName, role: existing.role, inviteUrl, expiresIn: INVITE_EXPIRY_H }),
    });
    res.json({ status: 'RESENT', inviteUrl });
  } catch(err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

app.delete('/api/v1/invitations/revoke', async (req, res) => {
  const { email, orgId } = req.body;
  try {
    const invites = await db.scan('AegisCloud_Invites');
    let revoked = 0;
    for (const inv of invites) {
      if (inv.email === email && inv.orgId === orgId && inv.status === 'PENDING') {
        inv.status = 'REVOKED'; 
        await db.put('AegisCloud_Invites', inv);
        revoked++;
      }
    }
    res.json({ status: revoked > 0 ? 'REVOKED' : 'NOT_FOUND', count: revoked });
  } catch(err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

app.get('/api/v1/invitations/pending', async (req, res) => {
  const { orgId } = req.query;
  try {
    const invites = await db.scan('AegisCloud_Invites');
    const pending = invites.filter(i => i.orgId === orgId && i.status === 'PENDING');
    res.json({ status: 'OK', count: pending.length, invites: pending.map(i => ({ email: i.email, name: i.name, role: i.role, createdAt: i.createdAt, expiresAt: i.expiresAt })) });
  } catch(err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FLOW 2 — TENANT / ORGANIZATION VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/v1/organizations/register', async (req, res) => {
  const { orgName, adminName, adminEmail, slug } = req.body;
  if (!orgName || !adminName || !adminEmail) return res.status(400).json({ error: 'orgName, adminName, adminEmail required' });

  const orgId  = genId('org');
  const token  = genToken();
  const expiresAt = addHours(ORG_EXPIRY_H);
  const verifyUrl = `${APP_BASE_URL}?verify-org=${token}`;

  const org = { id: orgId, name: orgName, slug: slug || orgName.toLowerCase().replace(/\s+/g,'-'), adminEmail, adminName, status: 'PENDING_VERIFICATION', plan: 'Starter', createdAt: new Date().toISOString(), mfaEnforced: false, domainWhitelist: [adminEmail.split('@')[1]||''] };
  
  try {
    await db.put('AegisCloud_Orgs', org);
    await db.put('AegisCloud_Tokens', { token, orgId, adminEmail, adminName, orgName, expiresAt, status: 'PENDING' });

    await sendEmail({
      from: `AegisCloud <${FROM_VERIFY}>`,
      to: adminEmail,
      subject: `Verify your AegisCloud organization: ${orgName}`,
      html: orgVerifyEmail({ adminName, orgName, verifyUrl, expiresIn: ORG_EXPIRY_H }),
    });
    console.log(`📨 Org verify sent → ${adminEmail}`);
    res.status(201).json({ status: 'PENDING_VERIFICATION', orgId, message: 'Verification email sent. Check your inbox.', verifyUrl });
  } catch (err) {
    await db.remove('AegisCloud_Orgs', { id: orgId });
    await db.remove('AegisCloud_Tokens', { token });
    res.status(500).json({ error: 'Failed to send verification email', detail: err.message });
  }
});

app.get('/api/v1/organizations/verify', async (req, res) => {
  const { token } = req.query;
  try {
    const record = await db.get('AegisCloud_Tokens', { token });
    if (!record)                       return res.status(404).json({ error: 'Verification token not found' });
    if (record.status !== 'PENDING')   return res.status(410).json({ error: 'Token already used' });
    if (isExpired(record.expiresAt))   return res.status(410).json({ error: 'Verification link expired. Register again.' });

    const org = await db.get('AegisCloud_Orgs', { id: record.orgId });
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    org.status = 'ACTIVE';
    await db.put('AegisCloud_Orgs', org);
    record.status = 'USED';
    await db.put('AegisCloud_Tokens', record);

    console.log(`✅ Org verified: ${org.name} (${org.id})`);
    res.json({ status: 'VERIFIED', org: { id: org.id, name: org.name, slug: org.slug, adminEmail: org.adminEmail } });
  } catch(err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FLOW 3 — SIGN-IN WITH EMAIL OTP
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password, deviceId } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  const DEMO_PW_HASH = hashPassword(process.env.DEFAULT_DEMO_PASSWORD || 'Demo@Aegis2026!');
  const pwHash = password ? hashPassword(password) : null;

  if (password && pwHash !== DEMO_PW_HASH) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const otp = genOtp();
  const sessionId = genToken();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const browser = req.headers['user-agent'] ? req.headers['user-agent'].slice(0, 60) : 'Unknown Browser';
  const userName = email.split('@')[0].replace('.', ' ');

  const sessionData = {
    sessionId, email, otp, ip, browser,
    expiresAt: addMins(OTP_EXPIRY_MIN),
    resendAt: addMins(1),
    used: false,
  };

  try {
    await db.put('AegisCloud_OtpSessions', sessionData);
    await sendEmail({
      from: `AegisCloud <${FROM_NOREPLY}>`,
      to: email,
      subject: `${otp} — Your AegisCloud sign-in code`,
      html: otpEmail({ name: userName, otp, ip, browser, timestamp: new Date().toLocaleString() }),
    });
    console.log(`📨 OTP sent → ${email} (${otp})`);
    res.json({ status: 'OTP_SENT', session_id: sessionId, message: `Verification code sent to ${email}` });
  } catch (err) {
    await db.remove('AegisCloud_OtpSessions', { sessionId });
    res.status(500).json({ error: 'Failed to send OTP email', detail: err.message });
  }
});

app.post('/api/v1/auth/verify-otp', async (req, res) => {
  const { session_id, otp, trustDevice, deviceId } = req.body;
  if (!session_id || !otp) return res.status(400).json({ error: 'session_id and otp required' });

  try {
    const session = await db.get('AegisCloud_OtpSessions', { sessionId: session_id });
    if (!session)           return res.status(404).json({ error: 'Session not found or expired' });
    if (session.used)       return res.status(410).json({ error: 'OTP already used' });
    if (isExpired(session.expiresAt)) return res.status(410).json({ error: 'OTP expired. Request a new sign-in.' });
    if (session.otp !== String(otp).trim()) return res.status(401).json({ error: 'Invalid verification code' });

    session.used = true;
    await db.put('AegisCloud_OtpSessions', session);

    const jwt = simpleJwt({ email: session.email });
    console.log(`✅ OTP verified for ${session.email}`);
    res.json({ status: 'AUTHENTICATED', jwt, email: session.email });
  } catch (err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 AegisCloud API Server running on port ${PORT}\n   APP_BASE_URL=${APP_BASE_URL}\n   AWS DB Region=${db.clientParams.region}\n   S3 Evidence=${BUCKET_NAME}`));
