import React, { useState } from 'react';
import { 
  Folder, 
  HardDrive, 
  ShieldCheck, 
  FileCode, 
  Download, 
  Eye, 
  Search, 
  Lock, 
  Database,
  Info
} from 'lucide-react';
import { useCSIMP } from '../lib/store';
import { EvidenceFile } from '../lib/types';

export const S3VaultView: React.FC = () => {
  const { incidents } = useCSIMP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);

  const allEvidenceFiles: (EvidenceFile & { incidentId: string; incidentTitle: string })[] = [];
  incidents.forEach(inc => {
    inc.evidenceFiles.forEach(file => {
      allEvidenceFiles.push({
        ...file,
        incidentId: inc.id,
        incidentTitle: inc.title,
      });
    });
  });

  const filteredFiles = allEvidenceFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.incidentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = allEvidenceFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-5">
      
      {/* Cloudflare Style Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#272f45]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Evidence Repository</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Encrypted security evidence storage, cryptographic checksum verification, and audit artifacts.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1 rounded bg-[#151924] border border-[#272f45] text-slate-300">
            <span className="text-slate-400">Total Files: </span>
            <span className="font-bold text-[#f38020]">{allEvidenceFiles.length}</span>
          </div>
          <div className="px-3 py-1 rounded bg-[#151924] border border-[#272f45] text-slate-300">
            <span className="text-slate-400">Storage Used: </span>
            <span className="font-bold text-emerald-400">{(totalSize / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        </div>
      </div>

      {/* Security Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-md bg-[#151924] border border-[#272f45] flex items-center space-x-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[10px] block">Encryption at Rest</span>
            <span className="font-semibold text-slate-200">AES-256 Envelope Encryption</span>
          </div>
        </div>

        <div className="p-3 rounded-md bg-[#151924] border border-[#272f45] flex items-center space-x-3">
          <Lock className="w-4 h-4 text-[#f38020] shrink-0" />
          <div>
            <span className="text-slate-400 text-[10px] block">Access Control Policy</span>
            <span className="font-semibold text-emerald-400">Restricted Least-Privilege</span>
          </div>
        </div>

        <div className="p-3 rounded-md bg-[#151924] border border-[#272f45] flex items-center space-x-3">
          <HardDrive className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[10px] block">Integrity Verification</span>
            <span className="font-semibold text-slate-200">SHA-256 Cryptographic Digest</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#151924] p-3 rounded-md border border-[#272f45] flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter files by name or incident ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020]"
          />
        </div>

        <span className="text-xs text-slate-400 hidden sm:block font-mono">
          Showing {filteredFiles.length} object(s)
        </span>
      </div>

      {/* Repository Data Table */}
      <div className="bg-[#151924] rounded-md border border-[#272f45] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#272f45] bg-[#1b202e] font-mono text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-3.5">File Name</th>
                <th className="py-2.5 px-3.5">Associated Incident</th>
                <th className="py-2.5 px-3.5">File Size</th>
                <th className="py-2.5 px-3.5">Uploaded Date</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272f45]">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No evidence objects stored.
                  </td>
                </tr>
              ) : (
                filteredFiles.map(file => (
                  <tr
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className="hover:bg-[#1b202e] transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3.5 font-semibold text-slate-200 group-hover:text-white truncate max-w-xs">
                      <div className="flex items-center space-x-2">
                        <FileCode className="w-4 h-4 text-[#f38020] shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 font-mono font-bold text-[#f38020]">
                      {file.incidentId}
                    </td>

                    <td className="py-2.5 px-3.5 text-slate-400 font-mono">
                      {(file.size / 1024).toFixed(1)} KB
                    </td>

                    <td className="py-2.5 px-3.5 text-slate-400 font-mono">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#272f45] transition-colors"
                        title="Inspect File Metadata"
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
      </div>

      {/* File Metadata Inspector Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#151924] border border-[#272f45] rounded-md p-5 space-y-4 shadow-2xl font-sans text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#272f45]">
              <span className="font-bold text-white flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-[#f38020]" /> File Metadata
              </span>
              <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 bg-[#0d1017] p-3 rounded border border-[#272f45] font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Name</span>
                <span className="text-slate-100 font-bold">{selectedFile.name}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase">SHA-256 Digest</span>
                <span className="text-purple-300 text-[10px] break-all">{selectedFile.sha256}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                <div>
                  <span className="text-slate-400 block">Encryption</span>
                  <span className="text-emerald-400 font-bold">AES-256</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span className="text-slate-200">Verified Intact</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => alert(`Downloading file: ${selectedFile.name}`)}
                className="px-3 py-1.5 bg-[#f38020] hover:bg-[#e56f10] text-black font-semibold rounded text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
