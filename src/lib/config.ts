/**
 * Centralized Configuration Loader for AegisCloud Platform
 * Uses relative paths throughout — works on any domain or IP address.
 * Override any value at build time via VITE_* environment variables.
 */

export const CONFIG = {
  // Application Branding
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AegisCloud Security Incident Management Platform',
  APP_SHORT_NAME: import.meta.env.VITE_APP_SHORT_NAME || 'AegisCloud',
  ENABLE_DEMO_MODE: import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false',
  DEFAULT_DEMO_PASSWORD: import.meta.env.VITE_DEFAULT_DEMO_PASSWORD || 'Demo@Aegis2026!',

  // REST API Endpoints — relative paths, no hardcoded domain or IP
  // Nginx proxies /api/* → Node.js backend on port 8080
  API_BASE_URL: '/api/v1',

  // SSO / Auth — served from /sso on the same domain
  // Nginx proxies /sso/* → your SAML handler if needed
  SAML_SSO_PROVIDER_URL: import.meta.env.VITE_SAML_SSO_PROVIDER_URL || '/sso/saml2',

  // Cloudflare & AWS — these are external services, must stay absolute
  CLOUDFLARE_API_URL: import.meta.env.VITE_CLOUDFLARE_API_URL || 'https://api.cloudflare.com/client/v4',
  AWS_SECURITY_HUB_URL: import.meta.env.VITE_AWS_SECURITY_HUB_URL || 'https://securityhub.eu-north-1.amazonaws.com',

  // Monitored Perimeter & Domains — display-only, not used for requests
  PRIMARY_DOMAIN: import.meta.env.VITE_PRIMARY_DOMAIN || 'aegiscloud.corp',
  MONITORED_DOMAINS: (import.meta.env.VITE_MONITORED_DOMAINS || 'aegiscloud.corp').split(','),
  MONITORED_SUBNETS: (import.meta.env.VITE_MONITORED_SUBNETS || '172.67.0.0/16,10.0.0.0/16,198.51.100.0/24').split(','),

  // SOAR Webhooks — relative path, served from the same backend
  SOAR_AUDIT_WEBHOOK_URL: '/api/v1/webhooks/audit-stream',
  PAGERDUTY_ALERT_KEY: import.meta.env.VITE_PAGERDUTY_ALERT_KEY || 'pd_live_key_aegis_8902',

  // AWS Infrastructure Identifiers (display/reference only)
  AWS_REGION: import.meta.env.VITE_AWS_REGION || 'eu-north-1',
  AWS_DYNAMODB_TABLE: import.meta.env.VITE_AWS_DYNAMODB_TABLE || 'AegisCloud_Incidents',
  AWS_S3_EVIDENCE_BUCKET: import.meta.env.VITE_AWS_S3_EVIDENCE_BUCKET || 'aegiscloud-evidence-vault-eu-990a3a63',
  AWS_ALB_TARGET_GROUP: import.meta.env.VITE_AWS_ALB_TARGET_GROUP || 'alb-aegiscloud-tg-01',
  AWS_CLOUDWATCH_LOG_GROUP: import.meta.env.VITE_AWS_CLOUDWATCH_LOG_GROUP || '/aws/ec2/aegiscloud-app',

  // Authentication — no external SSO subdomain needed
  COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  CLOUDFLARE_ZONE_ID: import.meta.env.VITE_CLOUDFLARE_ZONE_ID || 'demo-zone-id-aegiscloud',

  // Security Policies
  DEFENSE_IN_DEPTH_LAYERS: Number(import.meta.env.VITE_DEFENSE_IN_DEPTH_LAYERS || 7),
  MAX_LOGIN_ATTEMPTS: Number(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || 5),
  MAX_FILE_SIZE_MB: Number(import.meta.env.VITE_MAX_FILE_SIZE_MB || 25),
} as const;
