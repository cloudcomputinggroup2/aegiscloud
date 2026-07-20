import React, { useState } from 'react';
import { X, Building2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useCSIMP } from '../lib/store';

export const OrgRegisterModal: React.FC = () => {
  const { isOrgModalOpen, setIsOrgModalOpen, createOrganization } = useCSIMP();

  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOrgModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !adminEmail.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      createOrganization(
        orgName,
        slug || orgName.toLowerCase().replace(/\s+/g, '-'),
        adminName || 'System Administrator',
        adminEmail
      );
      setIsSubmitting(false);
      setIsOrgModalOpen(false);
      setOrgName('');
      setSlug('');
      setAdminName('');
      setAdminEmail('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#151924] border border-[#272f45] rounded-md shadow-2xl p-6 space-y-5 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#272f45]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-[#f38020]/15 text-[#f38020] border border-[#f38020]/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Organization</h2>
              <p className="text-xs text-slate-400">Setup enterprise incident management tenant</p>
            </div>
          </div>

          <button
            onClick={() => setIsOrgModalOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#272f45] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Organization Legal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CyberGuard Financial Systems"
              value={orgName}
              onChange={e => {
                setOrgName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
              }}
              className="w-full px-3 py-2 text-xs rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Organization Domain Slug
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 text-xs bg-[#1b202e] border border-r-0 border-[#272f45] rounded-l text-slate-400 font-mono">
                csimp.corp/
              </span>
              <input
                type="text"
                placeholder="cyberguard"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-r bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#272f45]">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                System Administrator Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Marcus Brody"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Work Email *
              </label>
              <input
                type="email"
                required
                placeholder="marcus@cyberguard.io"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-[#0d1017] border border-[#272f45] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#f38020]"
              />
            </div>
          </div>

          <div className="p-3 rounded bg-[#0d1017] border border-[#272f45] text-[11px] text-slate-400 space-y-1">
            <span className="text-[#f38020] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Initial Provisioning Details
            </span>
            <p>Creating this organization will grant you full System Administrator permissions to onboard employees and analysts.</p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#272f45]">
            <button
              type="button"
              onClick={() => setIsOrgModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#272f45] hover:bg-[#323a52] rounded transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-black bg-[#f38020] hover:bg-[#e56f10] rounded transition-colors"
            >
              <span>{isSubmitting ? 'Provisioning Tenant...' : 'Create Organization'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
