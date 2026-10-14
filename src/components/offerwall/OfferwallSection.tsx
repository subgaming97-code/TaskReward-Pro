import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, ExternalLink, Sparkles, ShieldCheck, Gift } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OfferwallSection: React.FC = () => {
  const { currentWorker, setWorkerTab } = useApp();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedApp, setCopiedApp] = useState(false);

  const userEmail = currentWorker?.googleAccount?.email || currentWorker?.email || 'user@taskarena.com';
  const userUid = currentWorker?.uniqueUserId || currentWorker?.eid || 'TEA-983274';
  const connectedApp = 'Task&Esports ARENA';

  const handleCopy = (text: string, type: 'email' | 'uid' | 'app') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else if (type === 'uid') {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    } else if (type === 'app') {
      setCopiedApp(true);
      setTimeout(() => setCopiedApp(false), 2000);
    }
  };

  const handleOpenOfferwall = () => {
    window.open('https://official.mkofferwall.online/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ease-out max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Clean Header with Back Arrow and Title */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
        <button
          type="button"
          onClick={() => setWorkerTab('Home')}
          className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center border border-white/[0.08]"
          title="Back to Home"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Offerwall</span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              Partner Rewards
            </span>
          </h1>
          <p className="text-xs text-zinc-400">
            Access partner offers, complete tasks, and instantly boost your earnings.
          </p>
        </div>
      </div>

      {/* SECTION 1: "SIGNUP DETAILS" Card */}
      <div 
        className="rounded-[16px] p-6 sm:p-7 shadow-xl backdrop-blur-xl relative overflow-hidden"
        style={{
          backgroundColor: '#161f30',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 
            className="text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-2"
            style={{ color: '#00d2ff', letterSpacing: '0.08em' }}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>SIGNUP DETAILS</span>
          </h2>
          <span className="text-[10px] text-zinc-400 font-mono bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
            Ready to Copy
          </span>
        </div>

        {/* Data Fields */}
        <div className="space-y-4">
          {/* Row 1: Email */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-white/[0.06]">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>Email</span>
              <p className="text-sm sm:text-base font-bold text-white truncate font-mono">
                {userEmail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(userEmail, 'email')}
              className="self-start sm:self-auto px-4 py-2 text-xs font-bold rounded-[8px] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
              style={{
                backgroundColor: '#122b3d',
                color: '#00d2ff',
                border: '1px solid rgba(0, 210, 255, 0.3)'
              }}
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          {/* Row 2: UID */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-white/[0.06]">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>UID</span>
              <p className="text-sm sm:text-base font-bold text-white truncate font-mono max-w-xs sm:max-w-md" title={userUid}>
                {userUid}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(userUid, 'uid')}
              className="self-start sm:self-auto px-4 py-2 text-xs font-bold rounded-[8px] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
              style={{
                backgroundColor: '#122b3d',
                color: '#00d2ff',
                border: '1px solid rgba(0, 210, 255, 0.3)'
              }}
            >
              {copiedUid ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          {/* Row 3: Connected App */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>Connected App</span>
              <p className="text-sm sm:text-base font-bold text-white font-sans">
                {connectedApp}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(connectedApp, 'app')}
              className="self-start sm:self-auto px-4 py-2 text-xs font-bold rounded-[8px] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
              style={{
                backgroundColor: '#122b3d',
                color: '#00d2ff',
                border: '1px solid rgba(0, 210, 255, 0.3)'
              }}
            >
              {copiedApp ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: "Open Offerwall" Call-To-Action Card */}
      <div 
        className="rounded-[16px] p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center space-y-6"
        style={{
          backgroundColor: '#161f30',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20 relative z-10 animate-pulse">
          <Gift className="w-8 h-8" />
        </div>

        <div className="space-y-2 relative z-10 max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Open Offerwall
          </h2>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Complete tasks, games and activities to earn rewards.
          </p>
        </div>

        {/* Primary Action Button ("OPEN OFFERWALL") */}
        <div className="w-full pt-2 relative z-10">
          <button
            type="button"
            onClick={handleOpenOfferwall}
            className="w-full py-4 px-6 text-sm sm:text-base font-extrabold uppercase tracking-wider text-white rounded-[12px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
            style={{
              background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)',
              boxShadow: '0 8px 25px rgba(0, 114, 255, 0.4)'
            }}
          >
            <span>OPEN OFFERWALL</span>
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-1 relative z-10">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Secure external offerwall portal • Instant crediting</span>
        </div>
      </div>
    </div>
  );
};
