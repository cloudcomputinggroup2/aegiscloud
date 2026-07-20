import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Filter,
} from 'lucide-react';
import { useCSIMP } from '../lib/store';

type NotifType = 'info' | 'success' | 'warning' | 'alert';

const typeConfig: Record<NotifType, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  info:    { icon: Info,         color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    label: 'Info' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Success' },
  warning: { icon: AlertTriangle,color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   label: 'Warning' },
  alert:   { icon: ShieldAlert,  color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    label: 'Alert' },
};

export const NotificationsView: React.FC = () => {
  const { notifications, clearNotifications } = useCSIMP();
  const [filter, setFilter] = useState<'all' | NotifType>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)));
  const markRead = (id: string) => setReadIds(prev => new Set([...prev, id]));

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#f38020]" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#f38020]/20 text-[#f38020] border border-[#f38020]/30 text-xs font-mono font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">System events, security alerts, and SOAR actions</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151924] border border-[#272f45] text-xs text-slate-300 hover:text-white font-semibold transition-colors">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Mark all read
          </button>
          <button onClick={clearNotifications}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151924] border border-[#272f45] text-xs text-slate-300 hover:text-rose-400 font-semibold transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-500" />
        {(['all', 'alert', 'warning', 'success', 'info'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all border ${
              filter === f
                ? 'bg-[#f38020]/20 text-[#f38020] border-[#f38020]/30'
                : 'bg-[#151924] text-slate-400 border-[#272f45] hover:text-white'
            }`}>
            {f === 'all' ? `All (${notifications.length})` : typeConfig[f].label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="bg-[#151924] border border-[#272f45] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm text-slate-500 font-semibold">No notifications</p>
            <p className="text-xs text-slate-600 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#272f45]/60">
            {filtered.map((n, i) => {
              const cfg = typeConfig[n.type as NotifType] ?? typeConfig.info;
              const Icon = cfg.icon;
              const isUnread = !readIds.has(n.id);

              return (
                <div key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-[#1c2030] ${isUnread ? 'bg-[#151924]' : 'bg-[#111722]/50'}`}>

                  {/* Unread dot */}
                  <div className="mt-1 shrink-0 w-2 h-2 rounded-full transition-all" style={{ background: isUnread ? '#f38020' : 'transparent', border: isUnread ? 'none' : '1px solid transparent' }} />

                  {/* Icon */}
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${isUnread ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono mt-1">{n.timestamp}</p>
                  </div>

                  {/* Type badge */}
                  <span className={`shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    {cfg.label.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
