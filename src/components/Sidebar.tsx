import React from 'react';
import { 
  ShieldAlert, 
  Plus, 
  BarChart2, 
  Folder, 
  Terminal, 
  FileText, 
  Users,
  Sliders,
  ShieldCheck,
  Lock,
  FilePlus2,
  Zap,
  LayoutDashboard,
  Bell
} from 'lucide-react';
import { useCSIMP } from '../lib/store';

interface SidebarProps {
  onLockSession?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLockSession }) => {
  const { activeTab, setActiveTab, incidents, currentUser, setIsReportModalOpen } = useCSIMP();

  const openCount = incidents.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length;

  const roleNavItems = () => {
    if (currentUser.role === 'EMPLOYEE') {
      return [
        {
          title: 'Employee Portal',
          items: [
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'incidents', label: 'My Reported Incidents', icon: ShieldAlert },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ]
        }
      ];
    }

    if (currentUser.role === 'ANALYST') {
      return [
        {
          title: 'Security Operations',
          items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            {
              id: 'incidents',
              label: 'Incident Triage Queue',
              icon: ShieldAlert,
              badge: openCount > 0 ? openCount : null,
              badgeColor: 'bg-[#f38020]/20 text-[#f38020] border border-[#f38020]/30',
            },
            { id: 'analytics', label: 'Threat Analytics', icon: BarChart2 },
            { id: 'playbooks', label: 'SOAR Playbooks', icon: Zap },
            { id: 's3vault', label: 'Evidence Repository', icon: Folder },
            { id: 'waf', label: 'WAF & Edge Rules', icon: Sliders },
          ]
        },
        {
          title: 'Telemetry Stream',
          items: [
            { id: 'aws-architecture', label: 'Security Log Stream', icon: Terminal },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ]
        }
      ];
    }

    // ADMIN
    return [
      {
        title: 'Security Operations',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          {
            id: 'incidents',
            label: 'Incident Management',
            icon: ShieldAlert,
            badge: openCount > 0 ? openCount : null,
            badgeColor: 'bg-[#f38020]/20 text-[#f38020] border border-[#f38020]/30',
          },
          { id: 'analytics', label: 'Security Analytics', icon: BarChart2 },
          { id: 'playbooks', label: 'SOAR Playbooks', icon: Zap },
          { id: 's3vault', label: 'Evidence Repository', icon: Folder },
          { id: 'waf', label: 'WAF & Edge Rules', icon: Sliders },
        ]
      },
      {
        title: 'Organization & Administration',
        items: [
          { id: 'team', label: 'Team & Onboarding', icon: Users },
          { id: 'defense-console', label: 'Defense-in-Depth Settings', icon: ShieldCheck },
          { id: 'aws-architecture', label: 'Security Log Stream', icon: Terminal },
          { id: 'audit', label: 'System Audit Logs', icon: FileText },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ]
      }
    ];
  };

  return (
    <aside className="w-60 shrink-0 bg-[#151924] border-r border-[#272f45] hidden md:flex flex-col justify-between p-3 min-h-[calc(100vh-3.5rem)] font-sans">
      <div className="space-y-4">
        
        {/* Action button tailored by role */}
        {currentUser.role === 'EMPLOYEE' && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-black bg-[#f38020] hover:bg-[#e56f10] rounded transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Report Security Incident</span>
          </button>
        )}

        {currentUser.role === 'ANALYST' && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-black bg-[#f38020] hover:bg-[#e56f10] rounded transition-colors shadow-sm"
            title="Elevate telemetry log or escalate critical vulnerability to System Admin"
          >
            <FilePlus2 className="w-4 h-4 stroke-[2.5]" />
            <span>Create Investigation Ticket</span>
          </button>
        )}

        {roleNavItems().map(section => (
          <div key={section.title} className="space-y-1">
            <p className="text-[10px] font-mono uppercase text-slate-400 font-semibold px-2.5 mb-1">
              {section.title}
            </p>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1c2030] text-[#f38020] font-semibold border-l-2 border-[#f38020]'
                      : 'text-slate-300 hover:text-white hover:bg-[#1b202e]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#f38020]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

      </div>

      <div className="pt-2 border-t border-[#272f45] space-y-1.5">
        {onLockSession && (
          <button
            onClick={onLockSession}
            className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded bg-[#0d1017] hover:bg-[#1b202e] border border-[#272f45] text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-[#f38020]" />
            <span>Lock Session</span>
          </button>
        )}
      </div>

    </aside>
  );
};
