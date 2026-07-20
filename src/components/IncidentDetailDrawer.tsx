import React, { useState } from 'react';
import { 
  X, 
  Paperclip, 
  MessageSquare, 
  Send, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  Tag, 
  AlertOctagon,
  Zap,
  Play
} from 'lucide-react';
import { useCSIMP } from '../lib/store';
import { IncidentStatus, IncidentSeverity } from '../lib/types';
import { MOCK_USERS } from '../lib/mockData';

export const IncidentDetailDrawer: React.FC = () => {
  const { 
    selectedIncident, 
    setSelectedIncident, 
    updateIncidentStatus, 
    updateIncidentSeverity, 
    assignAnalyst, 
    addNote, 
    deleteIncident,
    askConfirmation,
    addCloudWatchLog,
    currentUser 
  } = useCSIMP();

  const [newNote, setNewNote] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!selectedIncident) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addNote(selectedIncident.id, newNote);
    setNewNote('');
  };

  const handleDelete = () => {
    askConfirmation({
      title: 'Delete Security Incident',
      message: `Are you sure you want to permanently delete incident ${selectedIncident.id} from the repository? This action is irreversible.`,
      type: 'danger',
      confirmText: 'Permanently Delete',
      onConfirm: () => deleteIncident(selectedIncident.id),
    });
  };

  const handleRunSoarPlaybook = () => {
    askConfirmation({
      title: `Execute SOAR Automated Playbook on ${selectedIncident.id}`,
      message: `Trigger automated response playbook for category '${selectedIncident.category}'. This will deploy WAF block rules, revoke compromised SSO sessions, and lock evidence vaults.`,
      type: 'warning',
      confirmText: 'Execute Automated Playbook',
      onConfirm: () => {
        addNote(selectedIncident.id, `⚡ [SOAR AUTOMATED RESPONSE]: Executed Phishing & WAF Quarantine Playbook. Deployed edge block rule for extracted IoCs.`);
        updateIncidentStatus(selectedIncident.id, 'INVESTIGATING');
        addCloudWatchLog({
          service: 'WAF',
          level: 'WARN',
          message: `SOAR Triggered on ${selectedIncident.id}: Deployed WAF block rules on extracted IoC IP range.`,
        });
        askConfirmation({
          title: 'SOAR Containment Complete',
          message: `SOAR Automated Mitigation Workflow completed for incident ${selectedIncident.id}! WAF block rules deployed & investigation note appended.`,
          type: 'success',
          confirmText: 'OK',
          onConfirm: () => {},
        });
      },
    });
  };

  const handleDownloadUrl = (fileName: string) => {
    askConfirmation({
      title: 'Generate Secure Presigned URL',
      message: `Generated encrypted temporary access URL for object '${fileName}'. Link expires in 15 minutes.`,
      type: 'info',
      confirmText: 'Download File',
      onConfirm: () => console.log('Downloading file...'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl h-full bg-[#151924] border-l border-[#272f45] shadow-2xl flex flex-col justify-between overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 bg-[#1b202e] border-b border-[#272f45] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-[#f38020] px-2 py-0.5 rounded bg-[#0d1017] border border-[#272f45]">
              {selectedIncident.id}
            </span>
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-400 font-semibold">{selectedIncident.category}</p>
              <h2 className="text-sm font-bold text-white leading-tight">{selectedIncident.title}</h2>
            </div>
          </div>

          <button
            onClick={() => setSelectedIncident(null)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#272f45] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 space-y-5 flex-1">
          
          {/* Triage Controls Bar */}
          <div className="p-3.5 rounded-md bg-[#1b202e] border border-[#272f45] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Analyst Triage & Automated Response</p>
              {currentUser.role !== 'EMPLOYEE' && (
                <button
                  onClick={handleRunSoarPlaybook}
                  className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold text-black bg-[#f38020] hover:bg-[#e56f10] rounded transition-colors shadow-sm"
                >
                  <Zap className="w-3 h-3 fill-black" />
                  <span>Run SOAR Playbook</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Workflow Status</label>
                <select
                  value={selectedIncident.status}
                  onChange={(e) => updateIncidentStatus(selectedIncident.id, e.target.value as IncidentStatus)}
                  className="w-full px-2 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-200 font-semibold focus:outline-none focus:border-[#f38020]"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Threat Severity</label>
                <select
                  value={selectedIncident.severity}
                  onChange={(e) => updateIncidentSeverity(selectedIncident.id, e.target.value as IncidentSeverity)}
                  className="w-full px-2 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-200 font-semibold focus:outline-none focus:border-[#f38020]"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Assigned Analyst</label>
                <select
                  value={selectedIncident.assignee?.id || ''}
                  onChange={(e) => assignAnalyst(selectedIncident.id, e.target.value || null)}
                  className="w-full px-2 py-1.5 rounded bg-[#0d1017] border border-[#272f45] text-slate-200 font-semibold focus:outline-none focus:border-[#f38020]"
                >
                  <option value="">-- Unassigned --</option>
                  {MOCK_USERS.filter(u => u.role === 'ANALYST' || u.role === 'ADMIN').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#f38020]" /> Description & Timeline
            </h3>
            <div className="p-3 rounded-md bg-[#0d1017] border border-[#272f45] text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {selectedIncident.description}
            </div>
          </div>

          {/* IoC Registry Panel */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-[#f38020] flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" /> Indicators of Compromise (IoCs)
            </h3>
            <div className="p-3 rounded-md bg-[#0d1017] border border-[#272f45] space-y-2.5 text-xs font-mono">
              {selectedIncident.iocs.ips && selectedIncident.iocs.ips.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Suspicious IPs:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIncident.iocs.ips.map(ip => (
                      <div key={ip} className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#1b202e] border border-[#272f45] text-slate-200">
                        <span>{ip}</span>
                        <button onClick={() => handleCopy(ip)} className="text-slate-400 hover:text-white">
                          {copiedText === ip ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedIncident.iocs.urls && selectedIncident.iocs.urls.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Phishing Links / Domains:</span>
                  <div className="flex flex-col gap-1">
                    {selectedIncident.iocs.urls.map(url => (
                      <div key={url} className="flex items-center justify-between px-2 py-0.5 rounded bg-[#1b202e] border border-[#272f45] text-amber-300 truncate">
                        <span className="truncate">{url}</span>
                        <button onClick={() => handleCopy(url)} className="text-slate-400 hover:text-white shrink-0 ml-1">
                          {copiedText === url ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedIncident.iocs.ips?.length && !selectedIncident.iocs.urls?.length) && (
                <p className="text-slate-500 text-center py-1 text-xs">No explicit IoC indicators extracted.</p>
              )}
            </div>
          </div>

          {/* Evidence Attachments */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-[#f38020]" /> Evidence Attachments ({selectedIncident.evidenceFiles.length})
            </h3>
            {selectedIncident.evidenceFiles.length === 0 ? (
              <div className="p-3 rounded-md bg-[#0d1017] border border-[#272f45] text-center text-xs text-slate-500">
                No file attachments uploaded.
              </div>
            ) : (
              <div className="space-y-1.5">
                {selectedIncident.evidenceFiles.map(file => (
                  <div key={file.id} className="p-2.5 rounded-md bg-[#0d1017] border border-[#272f45] flex items-center justify-between text-xs font-mono">
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB • Encrypted</p>
                    </div>
                    <button
                      onClick={() => handleDownloadUrl(file.name)}
                      className="px-2 py-1 bg-[#1b202e] hover:bg-[#272f45] text-[#f38020] rounded border border-[#272f45] text-[10px] font-semibold flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Investigation Notes Thread */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#f38020]" /> Investigation Notes ({selectedIncident.notes.length})
            </h3>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {selectedIncident.notes.length === 0 ? (
                <p className="text-xs text-slate-500 p-2.5 bg-[#0d1017] rounded-md text-center">No notes added.</p>
              ) : (
                selectedIncident.notes.map(note => (
                  <div key={note.id} className="p-2.5 rounded-md bg-[#0d1017] border border-[#272f45] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-[#f38020] font-semibold">{note.author}</span>
                      <span>{new Date(note.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-200">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add investigation note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-md bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#f38020] hover:bg-[#e56f10] text-black font-semibold rounded-md text-xs flex items-center gap-1 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1b202e] border-t border-[#272f45] flex items-center justify-between">
          {currentUser.role === 'ADMIN' ? (
            <button
              onClick={handleDelete}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Incident
            </button>
          ) : (
            <span className="text-[10px] font-mono text-slate-500">Read & Edit Mode</span>
          )}

          <button
            onClick={() => setSelectedIncident(null)}
            className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-[#272f45] hover:bg-[#323a52] rounded-md transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
