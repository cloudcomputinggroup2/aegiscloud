import React, { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { useCSIMP } from '../lib/store';
import { AuditLog } from '../lib/types';

export const AuditTrailView: React.FC = () => {
  const { incidents } = useCSIMP();
  const [searchQuery, setSearchQuery] = useState('');

  const allAuditLogs: AuditLog[] = [];
  incidents.forEach(inc => {
    inc.auditTrail.forEach(log => {
      allAuditLogs.push(log);
    });
  });

  allAuditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = allAuditLogs.filter(log => 
    log.incidentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#272f45]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Audit Log</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable audit record of all incident reports, analyst status updates, and system mutations.
          </p>
        </div>
      </div>

      <div className="bg-[#151924] p-3 rounded-md border border-[#272f45] flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter audit log by ID, author, action..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020] font-mono"
          />
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:block">
          {filteredLogs.length} Event(s) Recorded
        </span>
      </div>

      <div className="bg-[#151924] rounded-md border border-[#272f45] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#272f45] bg-[#1b202e] text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-3.5">Timestamp</th>
                <th className="py-2.5 px-3.5">Incident ID</th>
                <th className="py-2.5 px-3.5">User & Role</th>
                <th className="py-2.5 px-3.5">Action</th>
                <th className="py-2.5 px-3.5">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272f45]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No matching audit log entries.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#1b202e] transition-colors">
                    <td className="py-2.5 px-3.5 text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-[#f38020]">
                      {log.incidentId}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="text-slate-200 font-semibold">{log.author}</span>
                      <span className="text-slate-400 text-[10px] block">({log.authorRole})</span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="px-2 py-0.5 rounded bg-[#0d1017] text-slate-200 border border-[#272f45] text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-300">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
