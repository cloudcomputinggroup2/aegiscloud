import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, ShieldCheck, Trash2, HardDrive, FileCode, Image as ImageIcon } from 'lucide-react';
import { EvidenceFile } from '../lib/types';

interface S3UploaderProps {
  evidenceFiles: EvidenceFile[];
  onUploadSuccess: (file: EvidenceFile) => void;
  onRemoveFile: (id: string) => void;
}

export const S3Uploader: React.FC<S3UploaderProps> = ({ evidenceFiles, onUploadSuccess, onRemoveFile }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const simulateUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // 1. Get pre-signed URL from backend
      const res = await fetch('/api/v1/evidence/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get signed URL');
      
      setUploadProgress(40);
      
      // 2. Upload file directly to S3
      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      });
      
      if (!uploadRes.ok) throw new Error('Upload to S3 failed');
      
      setUploadProgress(100);
      
      setTimeout(() => {
        let previewUrl = undefined;
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        }

        const newEvidence: EvidenceFile = {
          id: 'ev-' + Date.now(),
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          s3Bucket: data.url.split('.')[0].replace('https://', ''),
          s3Key: data.key,
          uploadedAt: new Date().toISOString(),
          hash: data.key,
          sha256: data.key,
          storageClass: 'S3 Standard',
          encrypted: true,
          fileDataUrl: previewUrl,
        };

        onUploadSuccess(newEvidence);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Upload failed: ' + err.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3 font-sans">
      
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border border-dashed rounded-md p-5 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-[#f38020] bg-[#f38020]/10'
            : 'border-[#272f45] hover:border-[#3b4666] bg-[#0d1017]'
        }`}
      >
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
          <UploadCloud className="w-6 h-6 text-[#f38020]" />
          <p className="text-xs font-semibold text-slate-200">
            Drag & drop evidence files, or <span className="text-[#f38020] underline">browse</span>
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Encrypted file storage • Supports screenshots, logs, PCAPs, and EML files
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="p-2.5 rounded-md bg-[#1b202e] border border-[#272f45] space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-300">
            <span>Uploading object to encrypted vault...</span>
            <span className="text-[#f38020] font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-[#0d1017] h-1.5 rounded-full overflow-hidden border border-[#272f45]">
            <div
              className="bg-[#f38020] h-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {evidenceFiles.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
            Attached Files ({evidenceFiles.length})
          </p>

          <div className="space-y-1">
            {evidenceFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded-md bg-[#0d1017] border border-[#272f45] text-xs font-mono"
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileCode className="w-4 h-4 text-[#f38020] shrink-0" />
                  <span className="font-semibold text-slate-200 truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-400">({formatBytes(file.size)})</span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] text-emerald-400 font-semibold">Encrypted</span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
