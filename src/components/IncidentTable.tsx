import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  Paperclip, 
  ChevronRight, 
  Plus, 
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Download
} from 'lucide-react';
import { useCSIMP } from '../lib/store';
import { IncidentStatus, IncidentSeverity } from '../lib/types';

export const IncidentTable: React.FC = () => {
  const { incidents, setSelectedIncident, setIsReportModalOpen } = useCSIMP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        inc.id.toLowerCase().includes(query) ||
        inc.title.toLowerCase().includes(query) ||
        inc.description.toLowerCase().includes(query) ||
        inc.reporter.name.toLowerCase().includes(query) ||
        inc.affectedSystems.some(s => s.toLowerCase().includes(query)) ||
        inc.iocs.ips?.some(ip => ip.includes(query)) ||
        inc.iocs.urls?.some(u => u.toLowerCase().includes(query));

      const matchesCategory = selectedCategory === 'ALL' || inc.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'ALL' || inc.severity === selectedSeverity;
      const matchesStatus = selectedStatus === 'ALL' || inc.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
    });
  }, [incidents, searchQuery, selectedCategory, selectedSeverity, selectedStatus]);

  const categories = [
    'ALL',
    'Phishing Email',
    'Malware / Ransomware',
    'Suspicious Web Activity',
    'Unauthorized Access',
    'Cloud Misconfiguration'
  ];

  const severityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f38020]/15 text-[#f38020] border border-[#f38020]/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">LOW</span>;
    }
  };

  const statusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">OPEN</span>;
      case 'INVESTIGATING':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">INVESTIGATING</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">RESOLVED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">CLOSED</span>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Cloudflare Style Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#272f45]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Security Incidents</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time incident log, threat triage, and indicators of compromise (IoC) registry.
          </p>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#f38020] hover:bg-[#e56f10] rounded-md transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#151924] p-3 rounded-md border border-[#272f45] space-y-3">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents, IPs, URLs, hosts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
            
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md bg-[#0d1017] border border-[#272f45] text-slate-300 focus:outline-none focus:border-[#f38020]"
            >
              <option value="ALL">Severity: All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md bg-[#0d1017] border border-[#272f45] text-slate-300 focus:outline-none focus:border-[#f38020]"
            >
              <option value="ALL">Status: All</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedSeverity('ALL'); setSelectedStatus('ALL'); }}
              className="p-1.5 text-slate-400 hover:text-white rounded-md bg-[#0d1017] border border-[#272f45]"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pt-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 mr-1 shrink-0 font-semibold">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#f38020]/20 text-[#f38020] border border-[#f38020]/40 font-semibold'
                  : 'bg-[#0d1017] text-slate-400 border border-[#272f45] hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Cloudflare Style Data Table */}
      <div className="bg-[#151924] rounded-md border border-[#272f45] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#272f45] bg-[#1b202e] font-mono text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-3.5">ID</th>
                <th className="py-2.5 px-3.5">Incident Title & Category</th>
                <th className="py-2.5 px-3.5">Severity</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Reporter</th>
                <th className="py-2.5 px-3.5">Assigned Analyst</th>
                <th className="py-2.5 px-3.5 text-center">Docs</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272f45]">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No security incidents match the filter parameters.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map(inc => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="hover:bg-[#1b202e] transition-colors cursor-pointer group"
                  >
                    
                    <td className="py-3 px-3.5 font-mono font-bold text-[#f38020] group-hover:underline">
                      {inc.id}
                    </td>

                    <td className="py-3 px-3.5 max-w-xs">
                      <p className="font-semibold text-slate-100 truncate group-hover:text-white">
                        {inc.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {inc.category} • <span className="text-slate-400 font-mono">{inc.affectedSystems[0] || 'System'}</span>
                      </p>
                    </td>

                    <td className="py-3 px-3.5">
                      {severityBadge(inc.severity)}
                    </td>

                    <td className="py-3 px-3.5">
                      {statusBadge(inc.status)}
                    </td>

                    <td className="py-3 px-3.5">
                      <p className="font-medium text-slate-200">{inc.reporter.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{inc.reporter.department}</p>
                    </td>

                    <td className="py-3 px-3.5">
                      {inc.assignee ? (
                        <span className="text-slate-300 font-medium text-xs">
                          {inc.assignee.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic font-mono">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      {inc.evidenceFiles.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-300 text-[10px] font-mono">
                          <Paperclip className="w-3 h-3 text-[#f38020]" /> {inc.evidenceFiles.length}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncident(inc);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#272f45] transition-colors"
                        title="View Incident Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-3.5 py-2 border-t border-[#272f45] bg-[#151924] flex items-center justify-between text-[11px] text-slate-400">
          <span>Showing {filteredIncidents.length} of {incidents.length} total incidents</span>
          <span>Acme Enterprise Security Log</span>
        </div>
      </div>

    </div>
  );
};
