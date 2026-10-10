import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, ShieldCheck, User, Plus, ArrowRight } from 'lucide-react';

export const GoogleLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const GoogleSignInModal: React.FC = () => {
  const {
    googleAuthModalOpen,
    setGoogleAuthModalOpen,
    loginWithGoogle,
    workers,
    currentWorker,
  } = useApp();

  const [customEmail, setCustomEmail] = useState(currentWorker?.email || '');
  const [customName, setCustomName] = useState(currentWorker?.name || '');
  const [customError, setCustomError] = useState<string | null>(null);

  if (!googleAuthModalOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setCustomError('Please enter a valid Google email address.');
      return;
    }

    loginWithGoogle({
      email: cleanEmail,
      name: customName.trim() || cleanEmail.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        cleanEmail
      )}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#111726] rounded-3xl max-w-md w-full shadow-2xl shadow-black/90 border border-white/[0.1] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center shadow-xs">
              <GoogleLogo className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                to continue to TaskReward Pro
              </p>
            </div>
          </div>

          <button
            onClick={() => setGoogleAuthModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Unique ID Mapping Pill */}
        <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-6 py-2.5 flex items-center gap-2 text-xs text-cyan-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <p className="leading-snug">
            Each Google account is mapped directly to a <strong className="text-white">unique, non-duplicated User ID</strong>.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">
                Google Account Credentials
              </span>
            </div>

            {customError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-semibold">
                {customError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Google Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. aratibera754@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:outline-hidden focus:border-cyan-400 text-white font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Arati Bera"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:outline-hidden focus:border-cyan-400 text-white font-medium"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setGoogleAuthModalOpen(false)}
                className="px-4 py-2 text-xs text-zinc-400 font-semibold hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-600/30 flex items-center gap-2 cursor-pointer"
              >
                <GoogleLogo className="w-4 h-4 bg-white rounded-full p-0.5" />
                <span>Sign In &amp; Map User ID</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-white/[0.02] px-6 py-3 border-t border-white/[0.06] text-[11px] text-zinc-500 text-center">
          Secured by Google Identity Services • All task data &amp; balances preserved
        </div>
      </div>
    </div>
  );
};
