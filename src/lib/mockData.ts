import { Organization, User, Incident, CloudWatchLog, ThreatBroadcast } from './types';

export const INITIAL_ORGS: Organization[] = [
  {
    id: 'org-acme',
    name: 'Acme Enterprise Security',
    slug: 'acme-corp',
    plan: 'Enterprise',
    createdAt: '2026-01-15T08:00:00Z',
    adminEmail: 'secops@acme.com',
    mfaEnforced: true,
    domainWhitelist: ['acme.com', 'acme-corp.com'],
  },
  {
    id: 'org-apex',
    name: 'Apex Global Logistics',
    slug: 'apex-global',
    plan: 'Pro',
    createdAt: '2026-03-01T10:00:00Z',
    adminEmail: 'admin@apex-global.com',
    mfaEnforced: true,
    domainWhitelist: ['apex-global.com'],
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'usr-employee-1',
    orgId: 'org-acme',
    name: 'Jane Doe',
    email: 'jane.doe@acme.com',
    role: 'EMPLOYEE',
    department: 'Finance & Operations',
    status: 'ACTIVE',
    createdAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'usr-analyst-1',
    orgId: 'org-acme',
    name: 'Sarah Chen',
    email: 'sarah.c@acme.com',
    role: 'ANALYST',
    department: 'Cybersecurity Operations Center',
    status: 'ACTIVE',
    createdAt: '2026-01-16T10:00:00Z',
  },
  {
    id: 'usr-admin-1',
    orgId: 'org-acme',
    name: 'Marcus Brody',
    email: 'marcus.b@acme.com',
    role: 'ADMIN',
    department: 'Global Information Security (CISO)',
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:30:00Z',
  },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-0841',
    orgId: 'org-acme',
    title: 'Suspicious Credential Harvesting Phishing Campaign Targeting Finance',
    description: 'Multiple employees in Finance received suspicious emails with links pointing to fake Microsoft 365 login page (login-acme-sec.top).',
    category: 'Phishing',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    reporter: {
      userId: 'usr-employee-1',
      name: 'Jane Doe',
      email: 'jane.doe@acme.com',
      department: 'Finance & Operations',
    },
    assignee: {
      id: 'usr-analyst-1',
      name: 'Sarah Chen',
      email: 'sarah.c@acme.com',
    },
    createdAt: '2026-07-18T14:32:00Z',
    updatedAt: '2026-07-18T16:45:00Z',
    affectedSystems: ['Exchange Online', 'Finance Workstations'],
    iocs: {
      ips: ['185.220.101.5', '192.42.116.16'],
      urls: ['https://login-acme-sec.top/auth/login'],
      fileHashes: ['a3f89012bce718d94e21a78921234567890abcdef1234567890abcdef1234567'],
    },
    evidenceFiles: [
      {
        id: 'ev-1',
        name: 'phishing_payload_email.eml',
        size: 142000,
        uploadedAt: '2026-07-18T14:35:00Z',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        s3Key: 'evidence/acme/INC-2026-0841/phishing_payload.eml',
      },
    ],
    notes: [
      {
        id: 'n-1',
        author: 'Sarah Chen',
        timestamp: '2026-07-18T15:10:00Z',
        text: 'WAF rules deployed to block source IP range 185.220.101.0/24.',
      },
    ],
    auditTrail: [
      {
        id: 'aud-1',
        orgId: 'org-acme',
        incidentId: 'INC-2026-0841',
        timestamp: '2026-07-18T14:32:00Z',
        author: 'Jane Doe',
        authorRole: 'EMPLOYEE',
        action: 'INCIDENT_CREATED',
        details: 'Incident created via Employee Intake Portal.',
      },
    ],
  },
  {
    id: 'INC-2026-0839',
    orgId: 'org-acme',
    title: 'Unauthorized API Token Activity Detected on S3 Production Bucket',
    description: 'Anomalous AWS CloudTrail logs indicated API call GetObject executed from unapproved external IP address.',
    category: 'Unauthorized Access',
    severity: 'CRITICAL',
    status: 'OPEN',
    reporter: {
      userId: 'usr-analyst-1',
      name: 'Sarah Chen',
      email: 'sarah.c@acme.com',
      department: 'Cybersecurity Operations Center',
    },
    assignee: null,
    createdAt: '2026-07-18T11:15:00Z',
    updatedAt: '2026-07-18T11:15:00Z',
    affectedSystems: ['AWS S3 Vault', 'Prod Datastore'],
    iocs: {
      ips: ['45.154.255.88'],
    },
    evidenceFiles: [],
    notes: [],
    auditTrail: [
      {
        id: 'aud-2',
        orgId: 'org-acme',
        incidentId: 'INC-2026-0839',
        timestamp: '2026-07-18T11:15:00Z',
        author: 'Sarah Chen',
        authorRole: 'ANALYST',
        action: 'INCIDENT_CREATED',
        details: 'Automated GuardDuty alert converted into incident.',
      },
    ],
  },
];

export const INITIAL_CLOUDWATCH_LOGS: CloudWatchLog[] = [
  {
    id: 'cw-1',
    orgId: 'org-acme',
    timestamp: '2026-07-18T16:50:12Z',
    service: 'WAF',
    level: 'WARN',
    message: 'WAF Rate Limit Rule hit by 185.220.101.5 on endpoint /api/v1/auth',
  },
  {
    id: 'cw-2',
    orgId: 'org-acme',
    timestamp: '2026-07-18T16:48:05Z',
    service: 'GuardDuty',
    level: 'CRITICAL',
    message: 'UnauthorizedAccess:IAMUser/AnomalousBehavior from IP 45.154.255.88',
  },
];

export const INITIAL_BROADCASTS: ThreatBroadcast[] = [
  {
    id: 'brd-101',
    orgId: 'org-acme',
    threatLevel: 'DEFCON_1_CRITICAL',
    title: '🚨 ACTIVE ATTACK ALERT: Phishing & Credential Harvester Campaign Targeting Corporate Email',
    message: 'SOC Analysts have detected an ongoing credential harvesting campaign impersonating the corporate SSO login portal. Do NOT enter credentials on non-corp domains.',
    actionRequired: 'Inspect sender domain on suspicious emails. Report any unexpected MFA push notifications immediately.',
    publishedAt: '2026-07-18T14:35:00Z',
    author: 'SOC Operations Center',
  },
];
