import React, { useState, useEffect } from 'react';
import { CSIMPProvider, useCSIMP } from './lib/store';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { IncidentTable } from './components/IncidentTable';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { S3VaultView } from './components/S3VaultView';
import { AwsArchitectureView } from './components/AwsArchitectureView';
import { AuditTrailView } from './components/AuditTrailView';
import { EmployeePortalView } from './components/EmployeePortalView';
import { AdminTeamManagementView } from './components/AdminTeamManagementView';
import { WafRulesView } from './components/WafRulesView';
import { SecurityConsoleView } from './components/SecurityConsoleView';
import { AccountSettingsView } from './components/AccountSettingsView';
import { PlaybooksView } from './components/PlaybooksView';
import { DashboardHomeView } from './components/DashboardHomeView';
import { NotificationsView } from './components/NotificationsView';
import { AuthScreen } from './components/AuthScreen';
import { AcceptInviteView } from './components/AcceptInviteView';
import { VerifyOrgView } from './components/VerifyOrgView';
import { ReportIncidentModal } from './components/ReportIncidentModal';
import { OrgRegisterModal } from './components/OrgRegisterModal';
import { IncidentDetailDrawer } from './components/IncidentDetailDrawer';
import { SessionLockModal } from './components/SessionLockModal';
import { ConfirmModal } from './components/ConfirmModal';

// ── Detect URL tokens before rendering anything ──────────────────────────────
function getUrlToken(): { type: 'invite' | 'verify-org'; token: string } | null {
  const params = new URLSearchParams(window.location.search);
  const invite    = params.get('invite');
  const verifyOrg = params.get('verify-org');
  if (invite)    return { type: 'invite',     token: invite };
  if (verifyOrg) return { type: 'verify-org', token: verifyOrg };
  return null;
}

// ── Main content router ──────────────────────────────────────────────────────
const MainContent: React.FC = () => {
  const { activeTab, currentUser } = useCSIMP();

  if (activeTab === 'account-settings') return <AccountSettingsView />;

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isAdmin    = currentUser.role === 'ADMIN';

  switch (activeTab) {
    case 'dashboard':
      return <DashboardHomeView />;

    case 'incidents':
      // Employees see their own personal incident portal; analysts/admins see full triage table
      return isEmployee ? <EmployeePortalView /> : <IncidentTable />;

    case 'analytics':
      return isEmployee ? <DashboardHomeView /> : <AnalyticsDashboard />;

    case 'playbooks':
      return isEmployee ? <DashboardHomeView /> : <PlaybooksView />;

    case 's3vault':
      return isEmployee ? <DashboardHomeView /> : <S3VaultView />;

    case 'waf':
      return isEmployee ? <DashboardHomeView /> : <WafRulesView />;

    case 'aws-architecture':
      return isEmployee ? <DashboardHomeView /> : <AwsArchitectureView />;

    case 'notifications':
      return <NotificationsView />;

    case 'team':
      return isAdmin ? <AdminTeamManagementView /> : <DashboardHomeView />;

    case 'defense-console':
      return isAdmin ? <SecurityConsoleView /> : <DashboardHomeView />;

    case 'audit':
      return isAdmin ? <AuditTrailView /> : <DashboardHomeView />;

    default:
      return <DashboardHomeView />;
  }
};

// ── App shell (post-auth layout) ─────────────────────────────────────────────
function AppShell() {
  const { isAuthenticated, confirmConfig, closeConfirmation } = useCSIMP();
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  // Check URL for invite / org-verify tokens FIRST, before auth guard
  const [urlToken] = useState(getUrlToken);

  // Clean token from URL once detected (so refresh doesn't re-trigger)
  useEffect(() => {
    if (urlToken) {
      const clean = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', clean);
    }
  }, [urlToken]);

  // Render token-based screens regardless of auth state
  if (urlToken?.type === 'invite')     return <AcceptInviteView token={urlToken.token} />;
  if (urlToken?.type === 'verify-org') return <VerifyOrgView    token={urlToken.token} />;

  if (!isAuthenticated) return <AuthScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1017] text-slate-100 font-sans antialiased selection:bg-[#f38020] selection:text-black">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar onLockSession={() => setIsSessionLocked(true)} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <MainContent />
        </main>
      </div>

      {/* Global modals & overlays */}
      <ReportIncidentModal />
      <OrgRegisterModal />
      <IncidentDetailDrawer />
      <SessionLockModal isLocked={isSessionLocked} onUnlock={() => setIsSessionLocked(false)} />

      {confirmConfig && (
        <ConfirmModal
          isOpen={true}
          title={confirmConfig.title}
          message={confirmConfig.message}
          type={confirmConfig.type || 'danger'}
          confirmText={confirmConfig.confirmText || 'Confirm'}
          onConfirm={confirmConfig.onConfirm}
          onClose={closeConfirmation}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CSIMPProvider>
      <AppShell />
    </CSIMPProvider>
  );
}
