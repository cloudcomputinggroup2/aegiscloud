import { UserRole } from './types';

/**
 * Layer 4: XSS & HTML Input Sanitizer
 */
export function sanitizeHTML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Layer 4: IoC Regex Format Validator
 */
export function validateIoC(type: 'ip' | 'url' | 'domain' | 'hash', value: string): { valid: boolean; message?: string } {
  const val = value.trim();
  if (!val) return { valid: false, message: 'Value cannot be empty' };

  if (type === 'ip') {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv4Regex.test(val) || ipv6Regex.test(val)) return { valid: true };
    return { valid: false, message: 'Invalid IPv4 or IPv6 address format' };
  }

  if (type === 'url') {
    try {
      new URL(val);
      return { valid: true };
    } catch {
      return { valid: false, message: 'Invalid URL string (must include http:// or https://)' };
    }
  }

  if (type === 'domain') {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (domainRegex.test(val)) return { valid: true };
    return { valid: false, message: 'Invalid domain name' };
  }

  if (type === 'hash') {
    const sha256Regex = /^[a-fA-F0-9]{64}$/;
    const md5Regex = /^[a-fA-F0-9]{32}$/;
    if (sha256Regex.test(val) || md5Regex.test(val)) return { valid: true };
    return { valid: false, message: 'Hash must be a valid 32-char MD5 or 64-char SHA-256 string' };
  }

  return { valid: true };
}

/**
 * Layer 3: File Type & Executable Mime-Type Inspection
 */
export function checkFileSecurity(file: File): { safe: boolean; warning?: string } {
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.vbs', '.ps1', '.sh', '.dll', '.so', '.iso', '.scr'];
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();

  if (dangerousExtensions.includes(ext)) {
    return {
      safe: false,
      warning: `Executable file type (${ext}) blocked by client-side File Integrity Policy.`,
    };
  }

  if (file.size > 50 * 1024 * 1024) {
    return {
      safe: false,
      warning: 'File size exceeds maximum allowed upload threshold (50 MB).',
    };
  }

  return { safe: true };
}

/**
 * Layer 1: Password Strength Evaluator
 */
export function evaluatePasswordStrength(password: string): { score: number; label: string; color: string; checks: Record<string, boolean> } {
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const scoreCount = Object.values(checks).filter(Boolean).length;
  let score = (scoreCount / 5) * 100;
  let label = 'Weak';
  let color = 'text-rose-500';

  if (score >= 80) {
    label = 'Strong (Enterprise Compliant)';
    color = 'text-emerald-400';
  } else if (score >= 60) {
    label = 'Moderate';
    color = 'text-[#f38020]';
  }

  return { score, label, color, checks };
}

/**
 * Layer 5: Role Least-Privilege Authorization Guard
 */
export function hasPermission(role: UserRole, action: 'CREATE_INCIDENT' | 'VIEW_ALL_INCIDENTS' | 'TRIAGE_INCIDENT' | 'VIEW_ANALYTICS' | 'VIEW_VAULT' | 'VIEW_LOGS' | 'MANAGE_TEAM' | 'VIEW_AUDIT' | 'DELETE_INCIDENT'): boolean {
  switch (action) {
    case 'CREATE_INCIDENT':
      return true; // All roles
    case 'VIEW_ALL_INCIDENTS':
    case 'TRIAGE_INCIDENT':
    case 'VIEW_ANALYTICS':
    case 'VIEW_VAULT':
    case 'VIEW_LOGS':
      return role === 'ANALYST' || role === 'ADMIN';
    case 'MANAGE_TEAM':
    case 'VIEW_AUDIT':
    case 'DELETE_INCIDENT':
      return role === 'ADMIN';
    default:
      return false;
  }
}
