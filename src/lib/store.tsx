import React, { createContext, useContext, useState, useEffect } from 'react';
import { Incident, User, UserRole, Organization, CloudWatchLog, IncidentStatus, IncidentSeverity, EvidenceFile, AuditLog, ThreatBroadcast } from './types';
import { INITIAL_ORGS, MOCK_USERS, INITIAL_INCIDENTS, INITIAL_CLOUDWATCH_LOGS, INITIAL_BROADCASTS } from './mockData';

interface ConfirmConfig {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  onConfirm: () => void;
}

interface CSIMPContextType {
  currentOrg: Organization;
  organizations: Organization[];
  currentUser: User;
  users: User[];
  incidents: Incident[];
  broadcasts: ThreatBroadcast[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isOrgModalOpen: boolean;
  setIsOrgModalOpen: (open: boolean) => void;
  cloudWatchLogs: CloudWatchLog[];
  notifications: { id: string; message: string; timestamp: string; type: 'info' | 'success' | 'warning' | 'alert' }[];
  
  // Auth State
  isAuthenticated: boolean;
  login: (email: string, method?: string) => boolean;
  logout: () => void;

  // Custom Confirmation Modal Dialog State
  confirmConfig: ConfirmConfig | null;
  askConfirmation: (config: ConfirmConfig) => void;
  closeConfirmation: () => void;

  // Actions
  createOrganization: (name: string, slug: string, adminName: string, adminEmail: string) => void;
  inviteUser: (name: string, email: string, role: UserRole, department: string) => void;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  switchOrganization: (orgId: string) => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  
  createIncident: (data: Partial<Incident>, evidenceFiles?: EvidenceFile[]) => Incident;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  updateIncidentSeverity: (id: string, severity: IncidentSeverity) => void;
  assignAnalyst: (id: string, analystId: string | null) => void;
  addNote: (incidentId: string, noteText: string) => void;
  deleteIncident: (id: string) => void;
  addCloudWatchLog: (log: Omit<CloudWatchLog, 'id' | 'timestamp' | 'orgId'>) => void;
  addBroadcast: (b: Omit<ThreatBroadcast, 'id' | 'publishedAt' | 'orgId'>) => void;
  clearNotifications: () => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
}

const CSIMPContext = createContext<CSIMPContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_ORGS = 'csimp_orgs_v2';
const LOCAL_STORAGE_KEY_USERS = 'csimp_users_v2';
const LOCAL_STORAGE_KEY_INCIDENTS = 'csimp_incidents_v2';
const LOCAL_STORAGE_KEY_BROADCASTS = 'csimp_broadcasts_v2';
const LOCAL_STORAGE_KEY_AUTH = 'csimp_auth_active';

export const CSIMPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ORGS);
    return saved ? JSON.parse(saved) : INITIAL_ORGS;
  });

  const [currentOrg, setCurrentOrg] = useState<Organization>(organizations[0]);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
    return saved ? JSON.parse(saved) : false;
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_INCIDENTS);
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [broadcasts, setBroadcasts] = useState<ThreatBroadcast[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BROADCASTS);
    return saved ? JSON.parse(saved) : INITIAL_BROADCASTS;
  });

  // URL Hash Router initialization
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    return hash || 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<string>(getTabFromHash);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.location.hash = `#/${tab}`;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setActiveTabState(tab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);
  const [cloudWatchLogs, setCloudWatchLogs] = useState<CloudWatchLog[]>(INITIAL_CLOUDWATCH_LOGS);

  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  const [notifications, setNotifications] = useState<{ id: string; message: string; timestamp: string; type: 'info' | 'success' | 'warning' | 'alert' }[]>([]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ORGS, JSON.stringify(organizations));
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(users));
    localStorage.setItem(LOCAL_STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
    localStorage.setItem(LOCAL_STORAGE_KEY_BROADCASTS, JSON.stringify(broadcasts));
    localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(isAuthenticated));
  }, [organizations, users, incidents, broadcasts, isAuthenticated]);

  useEffect(() => {
    if (currentUser.role === 'EMPLOYEE' && activeTab !== 'incidents' && activeTab !== 'my-reports') {
      setActiveTab('incidents');
    }
  }, [currentUser]);

  const login = (email: string, method: string = 'Password'): boolean => {
    const target = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (target) {
      setCurrentUser(target);
      const org = organizations.find(o => o.id === target.orgId);
      if (org) setCurrentOrg(org);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      addNotification(`Logged in via ${method} as ${target.name} (${target.role})`, 'success');
      return true;
    } else {
      // Create new employee user if domain matches org whitelist
      const domain = email.split('@')[1] || '';
      const org = organizations.find(o => o.domainWhitelist.includes(domain)) || currentOrg;
      const newUser: User = {
        id: 'usr-' + Date.now(),
        orgId: org.id,
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: 'EMPLOYEE',
        department: 'Corporate',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      setUsers(prev => [...prev, newUser]);
      setCurrentOrg(org);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      addNotification(`Authenticated via ${method} as ${newUser.name}`, 'success');
      return true;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    addNotification('Logged out of session context.', 'info');
  };

  const askConfirmation = (config: ConfirmConfig) => {
    setConfirmConfig(config);
  };

  const closeConfirmation = () => {
    setConfirmConfig(null);
  };

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'alert') => {
    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        message,
        timestamp: new Date().toLocaleTimeString(),
        type,
      },
      ...prev,
    ]);
  };

  const createOrganization = (name: string, slug: string, adminName: string, adminEmail: string) => {
    const newOrgId = 'org-' + Date.now();
    const newOrg: Organization = {
      id: newOrgId,
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      plan: 'Enterprise',
      createdAt: new Date().toISOString(),
      adminEmail,
      mfaEnforced: true,
      domainWhitelist: [adminEmail.split('@')[1] || 'corp.com'],
    };

    const newAdminUser: User = {
      id: 'usr-' + Date.now(),
      orgId: newOrgId,
      name: adminName,
      email: adminEmail,
      role: 'ADMIN',
      department: 'Executive / Security Admin',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    setOrganizations(prev => [...prev, newOrg]);
    setUsers(prev => [...prev, newAdminUser]);
    setCurrentOrg(newOrg);
    setCurrentUser(newAdminUser);
    setIsAuthenticated(true);

    addNotification(`Organization '${name}' created! Logged in as Administrator.`, 'success');
  };

  const inviteUser = (name: string, email: string, role: UserRole, department: string) => {
    const newUser: User = {
      id: 'usr-' + Date.now(),
      orgId: currentOrg.id,
      name,
      email,
      role,
      department: department || 'General',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    addNotification(`User '${name}' (${role}) added to ${currentOrg.name}.`, 'success');
  };

  const deleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    if (target.id === currentUser.id) {
      addNotification('Cannot delete your own active administrator account.', 'alert');
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    addNotification(`User '${target.name}' deleted from organization roster.`, 'warning');
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    }));
    addNotification(`User role updated to ${newRole}`, 'info');
  };

  const switchOrganization = (orgId: string) => {
    const foundOrg = organizations.find(o => o.id === orgId);
    if (!foundOrg) return;
    setCurrentOrg(foundOrg);
    
    const orgUser = users.find(u => u.orgId === orgId && u.role === 'ADMIN') || users.find(u => u.orgId === orgId) || {
      id: 'usr-guest-' + Date.now(),
      orgId: foundOrg.id,
      name: 'Admin User',
      email: foundOrg.adminEmail,
      role: 'ADMIN' as UserRole,
      department: 'Security',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(orgUser);
    addNotification(`Switched organization context to ${foundOrg.name}`, 'info');
  };

  const switchUser = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      setCurrentUser(foundUser);
      addNotification(`Switched active session to ${foundUser.name} (${foundUser.role})`, 'info');
    }
  };

  const switchRole = (role: UserRole) => {
    if (currentUser.role !== 'ADMIN') {
      addNotification('Only System Administrators can use the Demo Role Switcher.', 'alert');
      return;
    }

    const orgUsers = users.filter(u => u.orgId === currentOrg.id);
    let targetUser = orgUsers.find(u => u.role === role);

    if (!targetUser) {
      targetUser = {
        id: 'usr-demo-' + role.toLowerCase(),
        orgId: currentOrg.id,
        name: role === 'EMPLOYEE' ? 'Jane Doe (Employee)' : role === 'ANALYST' ? 'Sarah Chen (Analyst)' : 'Marcus Brody (Admin)',
        email: `${role.toLowerCase()}@${currentOrg.slug}.com`,
        role,
        department: role === 'EMPLOYEE' ? 'Finance' : 'Cybersecurity',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, targetUser!]);
    }

    setCurrentUser(targetUser);
    addNotification(`Session switched to ${targetUser.name} [${role}]`, 'info');
  };

  const createIncident = (data: Partial<Incident>, evidenceFiles: EvidenceFile[] = []): Incident => {
    const incNumber = Math.floor(Math.random() * 900 + 100);
    const newId = `INC-2026-0${incNumber}`;
    const now = new Date().toISOString();

    const newAudit: AuditLog = {
      id: 'aud-' + Date.now(),
      orgId: currentOrg.id,
      incidentId: newId,
      timestamp: now,
      author: currentUser.name,
      authorRole: currentUser.role,
      action: 'INCIDENT_CREATED',
      details: `Incident reported by ${currentUser.name} (${currentUser.department}) with ${evidenceFiles.length} attachments.`,
    };

    const newIncident: Incident = {
      id: newId,
      orgId: currentOrg.id,
      title: data.title || 'Untitled Security Incident',
      description: data.description || 'No description provided.',
      category: data.category || 'Other',
      severity: data.severity || 'MEDIUM',
      status: 'OPEN',
      reporter: {
        userId: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department,
      },
      assignee: null,
      createdAt: now,
      updatedAt: now,
      affectedSystems: data.affectedSystems || ['Corporate Network'],
      iocs: data.iocs || {},
      evidenceFiles,
      notes: [],
      auditTrail: [newAudit],
    };

    setIncidents(prev => [newIncident, ...prev]);
    addNotification(`Security Incident ${newId} created! Assigned to triage queue.`, 'success');
    return newIncident;
  };

  const updateIncidentStatus = (id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        const now = new Date().toISOString();
        const audit: AuditLog = {
          id: 'aud-' + Date.now(),
          orgId: currentOrg.id,
          incidentId: id,
          timestamp: now,
          author: currentUser.name,
          authorRole: currentUser.role,
          action: 'STATUS_CHANGED',
          details: `Status updated from ${inc.status} to ${status}.`,
        };
        const updated = {
          ...inc,
          status,
          updatedAt: now,
          auditTrail: [audit, ...inc.auditTrail],
        };
        if (selectedIncident?.id === id) setSelectedIncident(updated);
        return updated;
      }
      return inc;
    }));

    addNotification(`Incident ${id} status set to ${status}`, 'info');
  };

  const updateIncidentSeverity = (id: string, severity: IncidentSeverity) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        const now = new Date().toISOString();
        const audit: AuditLog = {
          id: 'aud-' + Date.now(),
          orgId: currentOrg.id,
          incidentId: id,
          timestamp: now,
          author: currentUser.name,
          authorRole: currentUser.role,
          action: 'SEVERITY_CHANGED',
          details: `Threat level updated from ${inc.severity} to ${severity}.`,
        };
        const updated = {
          ...inc,
          severity,
          updatedAt: now,
          auditTrail: [audit, ...inc.auditTrail],
        };
        if (selectedIncident?.id === id) setSelectedIncident(updated);
        return updated;
      }
      return inc;
    }));

    addNotification(`Incident ${id} severity changed to ${severity}`, 'warning');
  };

  const assignAnalyst = (id: string, analystId: string | null) => {
    const analystUser = users.find(u => u.id === analystId) || null;
    const assigneeData = analystUser ? { id: analystUser.id, name: analystUser.name, email: analystUser.email } : null;

    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        const now = new Date().toISOString();
        const audit: AuditLog = {
          id: 'aud-' + Date.now(),
          orgId: currentOrg.id,
          incidentId: id,
          timestamp: now,
          author: currentUser.name,
          authorRole: currentUser.role,
          action: 'ASSIGNED_ANALYST',
          details: assigneeData ? `Assigned to ${assigneeData.name}` : 'Unassigned analyst',
        };
        const updated = {
          ...inc,
          assignee: assigneeData,
          updatedAt: now,
          auditTrail: [audit, ...inc.auditTrail],
        };
        if (selectedIncident?.id === id) setSelectedIncident(updated);
        return updated;
      }
      return inc;
    }));

    addNotification(`Incident ${id} assigned to ${assigneeData?.name || 'Unassigned'}`, 'info');
  };

  const addNote = (incidentId: string, noteText: string) => {
    if (!noteText.trim()) return;

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const now = new Date().toISOString();
        const newNote = {
          id: 'note-' + Date.now(),
          author: currentUser.name,
          timestamp: now,
          text: noteText,
        };
        const audit: AuditLog = {
          id: 'aud-' + Date.now(),
          orgId: currentOrg.id,
          incidentId,
          timestamp: now,
          author: currentUser.name,
          authorRole: currentUser.role,
          action: 'NOTE_ADDED',
          details: `Analyst note added by ${currentUser.name}.`,
        };
        const updated = {
          ...inc,
          notes: [...inc.notes, newNote],
          updatedAt: now,
          auditTrail: [audit, ...inc.auditTrail],
        };
        if (selectedIncident?.id === incidentId) setSelectedIncident(updated);
        return updated;
      }
      return inc;
    }));

    addNotification(`Note saved for ${incidentId}`, 'success');
  };

  const deleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(inc => inc.id !== id));
    if (selectedIncident?.id === id) setSelectedIncident(null);
    addNotification(`Incident ${id} deleted by Administrator.`, 'alert');
  };

  const addCloudWatchLog = (log: Omit<CloudWatchLog, 'id' | 'timestamp' | 'orgId'>) => {
    const newLog: CloudWatchLog = {
      id: 'cw-' + Date.now(),
      orgId: currentOrg.id,
      timestamp: new Date().toISOString(),
      ...log,
    };
    setCloudWatchLogs(prev => [newLog, ...prev]);
  };

  const addBroadcast = (b: Omit<ThreatBroadcast, 'id' | 'publishedAt' | 'orgId'>) => {
    const newBrd: ThreatBroadcast = {
      id: 'brd-' + Date.now(),
      orgId: currentOrg.id,
      publishedAt: new Date().toISOString(),
      ...b,
    };
    setBroadcasts(prev => [newBrd, ...prev]);
    addNotification(`🚨 Emergency Security Threat Broadcast published to all ${currentOrg.name} employees!`, 'alert');
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const orgIncidents = incidents.filter(i => i.orgId === currentOrg.id);
  const orgBroadcasts = broadcasts.filter(b => b.orgId === currentOrg.id);

  return (
    <CSIMPContext.Provider
      value={{
        currentOrg,
        organizations,
        currentUser,
        users: users.filter(u => u.orgId === currentOrg.id),
        incidents: orgIncidents,
        broadcasts: orgBroadcasts,
        activeTab,
        setActiveTab,
        selectedIncident,
        setSelectedIncident,
        isReportModalOpen,
        setIsReportModalOpen,
        isOrgModalOpen,
        setIsOrgModalOpen,
        cloudWatchLogs: cloudWatchLogs.filter(l => l.orgId === currentOrg.id),
        notifications,
        isAuthenticated,
        login,
        logout,
        confirmConfig,
        askConfirmation,
        closeConfirmation,
        createOrganization,
        inviteUser,
        deleteUser,
        updateUserRole,
        switchOrganization,
        switchUser,
        switchRole,
        createIncident,
        updateIncidentStatus,
        updateIncidentSeverity,
        assignAnalyst,
        addNote,
        deleteIncident,
        addCloudWatchLog,
        addBroadcast,
        clearNotifications,
        addNotification,
      }}
    >
      {children}
    </CSIMPContext.Provider>
  );
};

export const useCSIMP = () => {
  const context = useContext(CSIMPContext);
  if (!context) {
    throw new Error('useCSIMP must be used within a CSIMPProvider');
  }
  return context;
};
