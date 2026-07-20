export type UserRole = 'EMPLOYEE' | 'ANALYST' | 'ADMIN';

export interface User {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  createdAt: string;
  adminEmail: string;
  logoUrl?: string;
  mfaEnforced: boolean;
  domainWhitelist: string[];
}

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  hash: string;
  s3Key: string;
  // Extended fields used by S3Uploader
  type?: string;
  s3Bucket?: string;
  sha256?: string;
  storageClass?: string;
  encrypted?: boolean;
  fileDataUrl?: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  incidentId: string;
  timestamp: string;
  author: string;
  authorRole: UserRole;
  action: string;
  details: string;
}

export interface Incident {
  id: string;
  orgId: string;
  title: string;
  description: string;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reporter: {
    userId: string;
    name: string;
    email: string;
    department: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  affectedSystems: string[];
  iocs: {
    ips?: string[];
    urls?: string[];
    fileHashes?: string[];
  };
  evidenceFiles: EvidenceFile[];
  notes: {
    id: string;
    author: string;
    timestamp: string;
    text: string;
  }[];
  auditTrail: AuditLog[];
}

export interface CloudWatchLog {
  id: string;
  orgId: string;
  timestamp: string;
  service: 'ALB' | 'GuardDuty' | 'WAF' | 'IAM' | 'S3';
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  message: string;
}

export interface ThreatBroadcast {
  id: string;
  orgId: string;
  threatLevel: 'DEFCON_1_CRITICAL' | 'DEFCON_2_ELEVATED' | 'NORMAL';
  title: string;
  message: string;
  actionRequired: string;
  publishedAt: string;
  author: string;
}
