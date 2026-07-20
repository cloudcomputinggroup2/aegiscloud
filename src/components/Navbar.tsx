import React, { useState } from 'react';
import { 
  Shield, 
  Bell, 
  Plus, 
  ChevronDown, 
  Building2, 
  Check, 
  Sliders,
  FilePlus2,
  AlertTriangle,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useCSIMP } from '../lib/store';
import { UserRole } from '../lib/types';
import { CONFIG } from '../lib/config';

export const Navbar: React.FC = () => {
  const { 
    currentOrg, 
    organizations, 
    switchOrganization, 
    currentUser, 
    switchRole, 
    setActiveTab,
    setIsReportModalOpen, 
    setIsOrgModalOpen,
    notifications, 
    clearNotifications,
    logout 
  } = useCSIMP();

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const roleTitle: Record<UserRole, string> = {
    EMPLOYEE: 'Employee View',
    ANALYST: 'Security Analyst',
    ADMIN: 'System Admin',
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#151924] border-b border-[#272f45] font-sans">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        
        {/* Left: Brand Logo & Organization Context Dropdown */}
        <div className="flex items-center space-x-3">
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#f38020] text-black">
              <Shield className="w-5 h-5 fill-black text-[#f38020]" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white uppercase">
              {CONFIG.APP_SHORT_NAME || 'AEGIS'}
            </span>
          </div>

          <div className="h-5 w-px bg-[#272f45] hidden sm:block" />

          {/* Organization Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center space-x-2 text-xs font-semibold text-slate-200 hover:text-white px-2.5 py-1.5 rounded bg-[#0d1017] border border-[#272f45] hover:border-[#3b4666] transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-[#f38020]" />
              <span className="truncate max-w-[160px]">{currentOrg.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 rounded bg-[#1b202e] border border-[#272f45] shadow-2xl p-2 z-50 text-xs">
                <p className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-semibold border-b border-[#272f45] mb-1">
                  Active Organization Tenant
                </p>

                {organizations.map(org => (
                  <button
                    key={org.id}
                    onClick={() => { switchOrganization(org.id); setIsOrgDropdownOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded text-slate-200 hover:bg-[#272f45] flex items-center justify-between mt-0.5"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{org.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Plan: {org.plan}</p>
                    </div>
                    {currentOrg.id === org.id && <Check className="w-3.5 h-3.5 text-[#f38020]" />}
                  </button>
                ))}

                <div className="pt-2 mt-1 border-t border-[#272f45]">
                  <button
                    onClick={() => { setIsOrgModalOpen(true); setIsOrgDropdownOpen(false); }}
                    className="w-full flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded bg-[#f38020]/15 hover:bg-[#f38020]/25 text-[#f38020] border border-[#f38020]/30 font-semibold text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Organization</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right: Actions, Notifications, Admin Role Switcher & Profile Avatar */}
        <div className="flex items-center space-x-3">
          
          {/* Action button tailored by role */}
          {currentUser.role === 'EMPLOYEE' && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#f38020] hover:bg-[#e56f10] rounded transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Report Incident</span>
            </button>
          )}

          {currentUser.role === 'ANALYST' && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#f38020] hover:bg-[#e56f10] rounded transition-colors shadow-sm"
              title="Elevate telemetry log or escalate critical vulnerability to System Admin"
            >
              <FilePlus2 className="w-4 h-4 stroke-[2.5]" />
              <span>Create Investigation Ticket</span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#1b202e] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#f38020]" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded bg-[#1b202e] border border-[#272f45] shadow-2xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
                  <span className="font-semibold text-slate-200">Alert Notifications</span>
                  <button onClick={clearNotifications} className="text-[10px] text-slate-400 hover:text-[#f38020]">Clear</button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 mt-2">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 py-3 text-center text-xs">No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2 rounded bg-[#0d1017] border border-[#272f45] text-xs">
                        <p className="text-slate-200 text-[11px] leading-snug">{n.message}</p>
                        <span className="text-[9px] font-mono text-slate-400 mt-1 block">{n.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-[#272f45]" />

          {/* ADMIN-ONLY DEMO ROLE SWITCHER */}
          {currentUser.role === 'ADMIN' && (
            <div className="relative">
              <button
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded bg-[#1b202e] border border-[#272f45] text-xs font-medium text-slate-200 hover:border-[#3b4666] transition-all"
                title="System Admin Demo Role Switcher"
              >
                <Sliders className="w-3.5 h-3.5 text-[#f38020]" />
                <div className="text-left hidden md:block">
                  <span className="text-slate-200 font-semibold block text-[11px] leading-tight">
                    {roleTitle[currentUser.role]}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded bg-[#1b202e] border border-[#272f45] shadow-2xl p-2 z-50 text-xs">
                  <p className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-semibold border-b border-[#272f45] mb-1">
                    Admin Session Evaluator Switcher
                  </p>

                  <button
                    onClick={() => { switchRole('EMPLOYEE'); setIsRoleOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded text-slate-200 hover:bg-[#272f45] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">Test Employee View</p>
                      <p className="text-[10px] text-slate-400">Intake & own reports only</p>
                    </div>
                    {(currentUser.role as string) === 'EMPLOYEE' && <Check className="w-3.5 h-3.5 text-[#f38020]" />}
                  </button>

                  <button
                    onClick={() => { switchRole('ANALYST'); setIsRoleOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded text-slate-200 hover:bg-[#272f45] flex items-center justify-between mt-0.5"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">Test Analyst View</p>
                      <p className="text-[10px] text-slate-400">Triage queue, IoC & telemetry</p>
                    </div>
                    {(currentUser.role as string) === 'ANALYST' && <Check className="w-3.5 h-3.5 text-[#f38020]" />}
                  </button>

                  <button
                    onClick={() => { switchRole('ADMIN'); setIsRoleOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded text-slate-200 hover:bg-[#272f45] flex items-center justify-between mt-0.5"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">System Admin View</p>
                      <p className="text-[10px] text-slate-400">Onboarding, Audit & Full Control</p>
                    </div>
                    {currentUser.role === 'ADMIN' && <Check className="w-3.5 h-3.5 text-[#f38020]" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-8 h-8 rounded-full bg-[#272f45] text-slate-200 flex items-center justify-center text-xs font-bold border border-[#3b4666] hover:border-[#f38020] transition-colors"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              {currentUser.name.charAt(0)}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded bg-[#1b202e] border border-[#272f45] shadow-2xl p-2 z-50 text-xs font-sans">
                <div className="px-2 py-1.5 border-b border-[#272f45]">
                  <p className="font-bold text-slate-200 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#f38020]/20 text-[#f38020] border border-[#f38020]/30 mt-1 inline-block">
                    {currentUser.role}
                  </span>
                </div>

                <button
                  onClick={() => { setActiveTab('account-settings'); setIsProfileMenuOpen(false); }}
                  className="w-full text-left px-2 py-2 rounded text-slate-200 hover:bg-[#272f45] flex items-center space-x-2 mt-1 font-semibold"
                >
                  <Shield className="w-3.5 h-3.5 text-[#f38020]" />
                  <span>Account & Profile Security</span>
                </button>

                <div className="pt-1 mt-1 border-t border-[#272f45]">
                  <button
                    onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                    className="w-full text-left px-2 py-2 rounded text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
