import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Shield,
  ShieldAlert,
  KeyRound,
  Lock,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Building2,
  Gamepad2,
  CheckCircle2,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PinEditState {
  [key: string]: string;
}

export const AdministrationSection: React.FC = () => {
  const { roleSecurityPins, updateRolePin, resetRolePins, partnerPanels, notify } = useApp();

  // Visibility states for PINs
  const [showPins, setShowPins] = useState<Record<string, boolean>>({
    admin: false,
    moderator: false,
    partner: false,
    A: false,
    B: false,
    C: false,
    D: false,
  });

  // Edit input states - all custom, no default/placeholder PINs
  const [pinInputs, setPinInputs] = useState<PinEditState>({
    admin: roleSecurityPins.adminPin || '',
    moderator: roleSecurityPins.moderatorPin || '',
    partner: roleSecurityPins.partnerPin || '',
    A: roleSecurityPins.partnerPanelPins?.['A'] || '',
    B: roleSecurityPins.partnerPanelPins?.['B'] || '',
    C: roleSecurityPins.partnerPanelPins?.['C'] || '',
    D: roleSecurityPins.partnerPanelPins?.['D'] || '',
  });

  // Errors per role
  const [pinErrors, setPinErrors] = useState<Record<string, string | null>>({});

  // Copied state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Success message toast
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset confirmation modal state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Audit history log of recent PIN changes in current session
  const [changeHistory, setChangeHistory] = useState<
    Array<{ id: string; role: string; previousPin: string; newPin: string; timestamp: string }>
  >([]);

  const toggleVisibility = (key: string) => {
    setShowPins((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (key: string, pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSavePin = (roleKey: string, roleDisplayName: string, currentSavedPin: string) => {
    const val = (pinInputs[roleKey] || '').trim();
    if (!/^\d{4}$/.test(val)) {
      setPinErrors((prev) => ({
        ...prev,
        [roleKey]: 'PIN must be exactly 4 numeric digits (0000 - 9999).',
      }));
      return;
    }

    const LEGACY_DEFAULT_PINS = new Set([
      '1115', '2244', '8899', '0099', '0088', '0077', '0066',
      '1001', '2002', '3003', '4004', '1122', '3344', '5566'
    ]);
    if (LEGACY_DEFAULT_PINS.has(val)) {
      setPinErrors((prev) => ({
        ...prev,
        [roleKey]: `Legacy default PIN "${val}" has been eliminated. Choose a unique custom 4-digit PIN.`,
      }));
      return;
    }

    setPinErrors((prev) => ({ ...prev, [roleKey]: null }));
    updateRolePin(roleKey, val);

    // Record in local session history
    setChangeHistory((prev) => [
      {
        id: `audit-${Date.now()}`,
        role: roleDisplayName,
        previousPin: currentSavedPin || 'Not Set',
        newPin: val,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      ...prev.slice(0, 7),
    ]);

    setSuccessMsg(`Successfully updated PIN for ${roleDisplayName} to ${val}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleConfirmResetAll = () => {
    resetRolePins();
    setPinInputs((prev) => ({
      ...prev,
      admin: roleSecurityPins.adminPin || '',
      moderator: '',
      partner: '',
      A: '',
      B: '',
      C: '',
      D: '',
    }));
    setPinErrors({});
    setShowResetConfirm(false);
    setSuccessMsg('Role PINs cleared. No default PINs exist; set unique custom PINs as required.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1629] via-[#101b33] to-[#0d1629] border border-blue-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Security Administration</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                RBAC Active
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Administration &amp; User PIN Management
            </h1>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Configure and reset 4-digit security PIN access codes for all administrative levels, tournament
              moderators, and business partner agency panels. Changes apply instantly across the platform.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 border border-white/[0.1] hover:border-rose-500/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Clear non-admin security PINs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Non-Admin PINs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Clear Non-Admin Security PINs?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                All default or placeholder PINs have been permanently eliminated. Clearing these PINs will require you to set new unique custom PINs for Moderator and Partner Agency panels. Your custom Administrator PIN is <strong>strictly preserved</strong>.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetAll}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Yes, Clear PINs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY ROLES PIN MANAGEMENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. ADMINISTRATOR ROLE PIN */}
        <div className="bg-[#111728] border border-blue-500/30 rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Administrator Role PIN</span>
                  <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                    Highest Level
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Unlocks sidebar hidden Admin link, terminal bypass &amp; system parameters
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                  Current Active Custom PIN
                </span>
                <span className="font-mono text-2xl font-black text-blue-400 tracking-widest">
                  {showPins.admin
                    ? (roleSecurityPins.adminPin || 'NOT SET')
                    : (roleSecurityPins.adminPin ? '••••' : 'NOT SET')}
                </span>
                <span className="text-[10px] text-cyan-400/80 block mt-0.5 font-medium">
                  {roleSecurityPins.adminPin ? 'Unique custom PIN active (no defaults)' : 'No custom PIN set — setup required'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleVisibility('admin')}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={showPins.admin ? 'Hide PIN' : 'Reveal PIN'}
                >
                  {showPins.admin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy('admin', roleSecurityPins.adminPin)}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy PIN"
                >
                  {copiedKey === 'admin' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Change Admin PIN Form */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Update Administrator Security PIN:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength={4}
                    inputMode="numeric"
                    value={pinInputs.admin}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPinInputs((prev) => ({ ...prev, admin: digits }));
                      setPinErrors((prev) => ({ ...prev, admin: null }));
                    }}
                    placeholder="Enter 4-digit custom PIN"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-base font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-blue-400 tracking-wider"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleSavePin('admin', 'Administrator Role', roleSecurityPins.adminPin)
                  }
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update PIN</span>
                </button>
              </div>
              {pinErrors.admin && (
                <p className="text-[11px] text-rose-400 font-medium">{pinErrors.admin}</p>
              )}
            </div>
          </div>
        </div>

        {/* 2. TOURNAMENT MODERATOR ROLE PIN */}
        <div className="bg-[#111728] border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-sm">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Tournament Moderator PIN</span>
                  <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Esports Ops
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Controls Tournament matches, match scorecards, player disputes &amp; support desk
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                  Current Active Custom PIN
                </span>
                <span className="font-mono text-2xl font-black text-amber-400 tracking-widest">
                  {showPins.moderator
                    ? (roleSecurityPins.moderatorPin || 'NOT SET')
                    : (roleSecurityPins.moderatorPin ? '••••' : 'NOT SET')}
                </span>
                <span className="text-[10px] text-amber-400/80 block mt-0.5 font-medium">
                  {roleSecurityPins.moderatorPin ? 'Unique custom PIN active (no defaults)' : 'No custom PIN set — Setup required'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleVisibility('moderator')}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={showPins.moderator ? 'Hide PIN' : 'Reveal PIN'}
                >
                  {showPins.moderator ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy('moderator', roleSecurityPins.moderatorPin)}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy PIN"
                >
                  {copiedKey === 'moderator' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Change Moderator PIN Form */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Update Moderator Security PIN:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength={4}
                    inputMode="numeric"
                    value={pinInputs.moderator}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPinInputs((prev) => ({ ...prev, moderator: digits }));
                      setPinErrors((prev) => ({ ...prev, moderator: null }));
                    }}
                    placeholder="Enter 4-digit custom PIN"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-base font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-400 tracking-wider"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleSavePin(
                      'moderator',
                      'Tournament Moderator Role',
                      roleSecurityPins.moderatorPin
                    )
                  }
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update PIN</span>
                </button>
              </div>
              {pinErrors.moderator && (
                <p className="text-[11px] text-rose-400 font-medium">{pinErrors.moderator}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BUSINESS PARTNERS & AGENCY PANELS PIN SECTION */}
      <div className="bg-[#111728] border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Partner Agency Panels (Panels A, B, C, D)</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Agency Tier
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Individual PIN passwords for each partner agency to access task reviews &amp; campaign analytics
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">General Partner PIN</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {roleSecurityPins.partnerPin || 'NOT SET'}
            </span>
          </div>
        </div>

        {/* Update General Partner PIN Form */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-white block">General Partner Access PIN</span>
            <span className="text-[11px] text-zinc-400">Master PIN for partner portals. No default PIN exists.</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={4}
              inputMode="numeric"
              value={pinInputs.partner}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPinInputs((prev) => ({ ...prev, partner: digits }));
                setPinErrors((prev) => ({ ...prev, partner: null }));
              }}
              placeholder="Enter 4-digit custom PIN"
              className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-400 w-48 text-center"
            />
            <button
              type="button"
              onClick={() => handleSavePin('partner', 'General Partner Role', roleSecurityPins.partnerPin)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              Update
            </button>
          </div>
        </div>
        {pinErrors.partner && (
          <p className="text-[11px] text-rose-400 font-medium">{pinErrors.partner}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerPanels.map((panel) => {
            const currentPin = roleSecurityPins.partnerPanelPins?.[panel.code] || '';
            const isVisible = showPins[panel.code];
            const isCopied = copiedKey === panel.code;

            return (
              <div
                key={panel.code}
                className="bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 rounded-2xl p-4 space-y-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[11px] font-black">
                      {panel.code}
                    </span>
                    <span>{panel.label}</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[100px]">
                    {panel.agencyType.split('&')[0]}
                  </span>
                </div>

                <div className="p-3 bg-black/30 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 block">Security PIN</span>
                    <span className="font-mono text-base font-black text-emerald-400 tracking-wider">
                      {isVisible
                        ? (currentPin || 'NOT SET')
                        : (currentPin ? '••••' : 'NOT SET')}
                    </span>
                    {!currentPin && (
                      <span className="text-[9px] text-amber-400/90 block font-semibold">Not Set — Required</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleVisibility(panel.code)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
                      title="Toggle Visibility"
                    >
                      {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(panel.code, currentPin)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
                      title="Copy PIN"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Edit inline */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={4}
                      inputMode="numeric"
                      value={pinInputs[panel.code] || ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPinInputs((prev) => ({ ...prev, [panel.code]: digits }));
                        setPinErrors((prev) => ({ ...prev, [panel.code]: null }));
                      }}
                      placeholder="Custom PIN"
                      className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-xs text-white placeholder:text-zinc-600 text-center"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleSavePin(panel.code, `${panel.label} (${panel.uniquePartnerName})`, currentPin)
                      }
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                      title={`Save PIN for ${panel.label}`}
                    >
                      Save
                    </button>
                  </div>
                  {pinErrors[panel.code] && (
                    <p className="text-[10px] text-rose-400">{pinErrors[panel.code]}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AUDIT & ACCESS LOGS SNAPSHOT */}
      <div className="bg-[#111728] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live PIN Audit History (Current Session)</h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {changeHistory.length} Recorded Modifications
          </span>
        </div>

        {changeHistory.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            No PIN changes have been submitted during this administrative session.
          </div>
        ) : (
          <div className="space-y-2">
            {changeHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono text-[10px] font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-semibold text-white">{item.role}</span>
                    <span className="text-[10px] text-zinc-500 font-mono ml-2">
                      Old: {item.previousPin} → New: {item.newPin}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{item.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
