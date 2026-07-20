import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  ShieldAlert, 
  Check, 
  AlertTriangle, 
  FileText, 
  Lock,
  FilePlus2,
  Bell
} from 'lucide-react';
import { useCSIMP } from '../lib/store';
import { IncidentSeverity, EvidenceFile } from '../lib/types';
import { sanitizeHTML, validateIoC, checkFileSecurity } from '../lib/security';

export const ReportIncidentModal: React.FC = () => {
  const { 
    isReportModalOpen, 
    setIsReportModalOpen, 
    createIncident, 
    currentUser, 
    currentOrg,
    addCloudWatchLog 
  } = useCSIMP();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Phishing');
  const [severity, setSeverity] = useState<IncidentSeverity>('MEDIUM');
  const [description, setDescription] = useState('');
  const [iocIps, setIocIps] = useState('');
  const [iocUrls, setIocUrls] = useState('');
  const [escalateToAdmin, setEscalateToAdmin] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  if (!isReportModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    for (const f of newFiles) {
      const securityCheck = checkFileSecurity(f);
      if (!securityCheck.safe) {
        setFileError(securityCheck.warning || 'File rejected by Security Policy.');
        return;
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Layer 4 Input Sanitization
    const sanitizedTitle = sanitizeHTML(title);
    const sanitizedDesc = sanitizeHTML(description);

    const parsedIps = iocIps.split(',').map(s => s.trim()).filter(Boolean);
    const parsedUrls = iocUrls.split(',').map(s => s.trim()).filter(Boolean);

    // Build evidence objects
    const evidenceFiles: EvidenceFile[] = files.map((f, i) => ({
      id: 'ev-' + Date.now() + '-' + i,
      name: f.name,
      size: f.size,
      uploadedAt: new Date().toISOString(),
      hash: 'sha256_' + Math.random().toString(36).substring(2, 12),
      s3Key: `evidence/${currentOrg.slug}/${Date.now()}/${f.name}`,
    }));

    const newInc = createIncident({
      title: sanitizedTitle,
      category,
      severity: escalateToAdmin ? 'CRITICAL' : severity,
      description: sanitizedDesc + (escalateToAdmin ? '\n\n[ESCALATED DIRECTLY TO SYSTEM ADMINISTRATOR / CISO]' : ''),
      affectedSystems: ['Corporate Workspace'],
      iocs: {
        ips: parsedIps,
        urls: parsedUrls,
      },
    }, evidenceFiles);

    addCloudWatchLog({
      service: 'GuardDuty',
      level: escalateToAdmin ? 'CRITICAL' : 'INFO',
      message: `${currentUser.role === 'ANALYST' ? 'Investigation Ticket Created' : 'Incident Reported'}: '${newInc.title}' by ${currentUser.name}`,
    });

    // Reset & close
    setTitle('');
    setDescription('');
    setIocIps('');
    setIocUrls('');
    setFiles([]);
    setEscalateToAdmin(false);
    setIsReportModalOpen(false);
  };

  const isAnalyst = currentUser.role === 'ANALYST';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans">
      <div className="w-full max-w-xl bg-[#151924] border border-[#272f45] rounded-md p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#272f45]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-[#f38020]/15 text-[#f38020]">
              {isAnalyst ? <FilePlus2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isAnalyst ? 'Create Investigation Ticket / Elevate Telemetry' : 'Report Security Incident'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isAnalyst ? 'Log an investigation ticket from telemetry or escalate a critical threat to System Admin' : 'Submit a security report directly to the Security Operations Center'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReportModalOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#272f45] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Analyst Escalation Banner */}
          {isAnalyst && (
            <div className="p-3 rounded bg-[#0d1017] border border-[#f38020]/30 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-300">
                <Bell className="w-4 h-4" />
                <div>
                  <p className="font-bold text-slate-200">Escalate Directly to System Administrator (CISO)</p>
                  <p className="text-[10px] text-slate-400 font-mono">Flag critical infrastructure vulnerabilities or compromised IAM accounts</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={escalateToAdmin}
                onChange={e => setEscalateToAdmin(e.target.checked)}
                className="w-4 h-4 accent-[#f38020] cursor-pointer"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              {isAnalyst ? 'Investigation Ticket Title *' : 'Incident Title *'}
            </label>
            <input
              type="text"
              required
              placeholder={isAnalyst ? "e.g. Telemetry Anomaly: Unauthorized S3 API Token Exfiltration" : "e.g. Received Phishing Email impersonating IT Support"}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0d1017] border border-[#272f45] text-slate-200 font-semibold focus:outline-none focus:border-[#f38020]"
              >
                <option value="Phishing">Phishing / Credential Theft</option>
                <option value="Unauthorized Access">Unauthorized Access / IAM</option>
                <option value="Malware / Ransomware">Malware / Ransomware</option>
                <option value="Data Exfiltration">Data Exfiltration</option>
                <option value="DDoS / Network">DDoS / Network Anomaly</option>
                <option value="Other">Other Security Event</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Severity Assessment</label>
              <select
                disabled={escalateToAdmin}
                value={escalateToAdmin ? 'CRITICAL' : severity}
                onChange={e => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full px-3 py-2 rounded bg-[#0d1017] border border-[#272f45] text-slate-200 font-semibold focus:outline-none focus:border-[#f38020]"
              >
                <option value="LOW">LOW (Informational)</option>
                <option value="MEDIUM">MEDIUM (Moderate Risk)</option>
                <option value="HIGH">HIGH (Elevated Threat)</option>
                <option value="CRITICAL">CRITICAL (System Breach)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Detailed Description *</label>
            <textarea
              required
              rows={3}
              placeholder={isAnalyst ? "Describe raw log evidence, affected IAM users, and investigation steps..." : "Describe what happened, when it occurred, and any suspicious links clicked..."}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020]"
            />
          </div>

          {/* IoC Extraction Fields */}
          <div className="p-3 rounded bg-[#0d1017] border border-[#272f45] space-y-2">
            <span className="font-mono text-[10px] uppercase text-[#f38020] font-bold block">
              Indicators of Compromise (IoCs) — Optional
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Suspicious IPs (e.g. 185.220.101.5)"
                value={iocIps}
                onChange={e => setIocIps(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#151924] border border-[#272f45] text-slate-200 font-mono text-[11px]"
              />
              <input
                type="text"
                placeholder="Phishing URLs / Domains"
                value={iocUrls}
                onChange={e => setIocUrls(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#151924] border border-[#272f45] text-slate-200 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Evidence File Attachment */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Attach Evidence Files (Screenshots, Logs, EML Emails)
            </label>
            <div className="p-3 rounded bg-[#0d1017] border border-dashed border-[#272f45] text-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer text-[#f38020] hover:text-[#e56f10] font-semibold flex items-center justify-center gap-1">
                <Upload className="w-4 h-4" /> Click to attach evidence files
              </label>
            </div>

            {fileError && (
              <p className="text-[11px] text-rose-400 font-mono mt-1">{fileError}</p>
            )}

            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 bg-[#0d1017] rounded text-slate-200 font-mono text-[11px]">
                    <span className="truncate">{f.name} ({(f.size / 1024).toFixed(1)} KB)</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-rose-400">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-[#272f45]">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#272f45] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#f38020] hover:bg-[#e56f10] text-black font-bold rounded text-xs"
            >
              {isAnalyst ? (escalateToAdmin ? 'Escalate to System Admin' : 'Create Investigation Ticket') : 'Submit Security Report'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
