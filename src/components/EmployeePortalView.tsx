import React from 'react';
import { 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  Radio, 
  Shield, 
  PhoneCall, 
  WifiOff, 
  KeyRound, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useCSIMP } from '../lib/store';

export const EmployeePortalView: React.FC = () => {
  const { currentOrg, currentUser, incidents, setSelectedIncident } = useCSIMP();

  const myIncidents = incidents.filter(i => i.reporter?.userId === currentUser.id);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Employee Incidents Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#272f45]">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span>{currentOrg.name}</span>
            <span>•</span>
            <span className="text-[#f38020]">Incident Tracker</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
            My Reported Incidents
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track real-time SOC resolution progress, view investigation logs, and submit additional evidence for your security tickets.
          </p>
        </div>
      </div>

      {/* My Reported Incidents Roster */}
      <div className="bg-[#151924] rounded-xl border border-[#272f45] overflow-hidden shadow-sm">
        <div className="p-4 bg-[#1b202e] border-b border-[#272f45] flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#f38020]" /> My Incident Reports ({myIncidents.length})
          </span>
          <span className="text-[10px] font-mono text-slate-500">Click any ticket to view notes, history, or upload attachments</span>
        </div>

        {myIncidents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">You haven't reported any security incidents yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">If you receive phishing emails, detect unauthorized access, or notice system anomalies, report them using the top button.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#272f45]/50">
            {myIncidents.map(inc => (
              <div 
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className="p-4 hover:bg-[#1b202e] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-[#f38020] font-bold px-1.5 py-0.2 rounded bg-[#0d1017] border border-[#272f45]">
                      {inc.id}
                    </span>
                    <span className="font-bold text-slate-200">{inc.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{inc.description}</p>
                  <p className="text-[10px] font-mono text-slate-500">
                    Reported on {new Date(inc.createdAt).toLocaleString()} • {inc.evidenceFiles?.length || 0} file attachments
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    inc.status === 'RESOLVED' || inc.status === 'CLOSED'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#f38020]/15 text-[#f38020] border border-[#f38020]/30'
                  }`}>
                    {inc.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
