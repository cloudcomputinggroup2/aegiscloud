import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCSIMP } from '../lib/store';

interface SessionLockModalProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const SessionLockModal: React.FC<SessionLockModalProps> = ({ isLocked, onUnlock }) => {
  const { currentUser, currentOrg } = useCSIMP();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setError(false);
    onUnlock();
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-sans">
      <div className="w-full max-w-sm bg-[#151924] border border-[#272f45] rounded-md p-6 space-y-4 shadow-2xl text-center">
        
        <div className="mx-auto w-12 h-12 rounded-full bg-[#f38020]/15 text-[#f38020] border border-[#f38020]/30 flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white">Session Locked</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentOrg.name} Zero-Trust Inactivity Policy
          </p>
        </div>

        <div className="p-3 rounded bg-[#0d1017] border border-[#272f45] text-left text-xs font-mono">
          <p className="text-slate-200 font-semibold">{currentUser.name}</p>
          <p className="text-[10px] text-slate-400">{currentUser.email} • [{currentUser.role}]</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3 text-left">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">
              Enter Password to Unlock Session
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#f38020] hover:bg-[#e56f10] text-black font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Unlock Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-mono pt-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Layer 1 Defense-in-Depth Session Guard</span>
        </div>

      </div>
    </div>
  );
};
