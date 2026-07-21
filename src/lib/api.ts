import { CONFIG } from './config';
import { Incident, User, Organization, CloudWatchLog } from './types';

/**
 * CSIMP Production REST API Service Layer
 * Interacts with backend API endpoints configured in VITE_API_BASE_URL
 */

export const ApiService = {
  // Base URLs
  baseUrl: CONFIG.API_BASE_URL,
  cloudflareUrl: CONFIG.CLOUDFLARE_API_URL,
  awsHubUrl: CONFIG.AWS_SECURITY_HUB_URL,

  /**
   * Helper to construct API Headers with JWT / Bearer Token & Org Tenant ID
   */
  getHeaders: (orgId?: string) => ({
    'Content-Type': 'application/json',
    'X-Aegis-Org-Id': orgId || '',
    'Authorization': `Bearer ${localStorage.getItem('aegis_jwt_token') || ''}`,
  }),

  // Endpoints Mapping Table
  endpoints: {
    incidents: `${CONFIG.API_BASE_URL}/incidents`,
    users: `${CONFIG.API_BASE_URL}/users`,
    organizations: `${CONFIG.API_BASE_URL}/organizations`,
    wafRules: `${CONFIG.CLOUDFLARE_API_URL}/zones/${CONFIG.CLOUDFLARE_ZONE_ID}/firewall/rules`,
    telemetryLogs: `${CONFIG.AWS_SECURITY_HUB_URL}/findings`,
    auditLogs: `${CONFIG.API_BASE_URL}/audit-trail`,
  },
};
