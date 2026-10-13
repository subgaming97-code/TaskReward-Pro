import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, PartnerPanelCode } from '../types';
import {
  Shield,
  Briefcase,
  User,
  Wallet,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Building2,
  ChevronDown,
  Bell,
  X,
  Lock,
  Mail,
  LogOut,
  Trophy,
  Menu,
} from 'lucide-react';
import { GoogleLogo } from './GoogleSignInModal';

export const Header: React.FC = () => {
  const {
    currentRole,
    requestRoleChange,
    selectPartnerPanelToVerify,
    partnerPanels,
    selectedPartnerName,
    setSelectedPartnerName,
    partners,
    currentWorker,
    currentPartner,
    settings,
    updateSettings,
    setWorkerTab,
    resetToDefaultData,
    notificationMessage,
    clearNotification,
    setGoogleAuthModalOpen,
    logout,
    isFirestoreConnected,
    setIsAppSidebarOpen,
  } = useApp();

  const [partnerDropdownOpen, setPartnerDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/40">
      {/* Top Promotional Banner if enabled */}
      {settings.showBanner && settings.bannerBrandingText && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-500/20 text-cyan-200 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="tracking-wide">{settings.bannerBrandingText}</span>
          </div>
          <button
            onClick={() => updateSettings({ showBanner: false })}
            className="text-zinc-400 hover:text-white p-0.5 rounded-sm transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Maintenance alert warning if active */}
      {settings.maintenanceMode && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-300 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Platform is currently under Maintenance Mode. Only administrators can publish edits.</span>
        </div>
      )}

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            {/* Sidebar Navigation Drawer Trigger */}
            <button
              id="header-open-sidebar-btn"
              type="button"
              onClick={() => setIsAppSidebarOpen(true)}
              className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] transition-colors cursor-pointer shrink-0"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs tracking-tight shadow-[0_0_20px_rgba(6,182,212,0.35)] border border-cyan-400/30 shrink-0">
              <span className="tracking-tight text-white font-black">TEA</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Task and Esports <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Arena</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isFirestoreConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                  title={isFirestoreConnected ? 'Firebase Firestore Database Connected' : 'Connecting to Firestore...'}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isFirestoreConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
                    }`}
                  />
                  <span>{isFirestoreConnected ? 'DB Online' : 'Syncing'}</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">Rewards &amp; Verification Platform</p>
            </div>
          </div>

          {/* Admin / Partner Active Mode Banner */}
          {currentRole === 'admin' && (
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 p-1.5 rounded-2xl">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-blue-300">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin Terminal</span>
              </span>
              <button
                type="button"
                onClick={() => requestRoleChange('worker')}
                className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-colors"
                title="Exit Admin Panel and return to User View"
              >
                Exit to User View
              </button>
            </div>
          )}

          {currentRole === 'partner' && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded-2xl">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-300">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Partner Portal</span>
              </span>
              <button
                type="button"
                onClick={() => requestRoleChange('worker')}
                className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-colors"
                title="Exit Partner Panel and return to User View"
              >
                Exit to User View
              </button>
            </div>
          )}

          {/* Role-Specific Metric Header / Actions */}
          <div className="flex items-center gap-3">
            {currentRole === 'worker' && (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Profile Navigation Button - Hides all user data & email from header across all devices */}
                <button
                  type="button"
                  onClick={() => setWorkerTab('Profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-white/[0.05] border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.1] active:scale-95 touch-manipulation cursor-pointer"
                  title="View Profile"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Profile</span>
                </button>

                {/* Tournament Navigation Button */}
                <button
                  type="button"
                  onClick={() => setWorkerTab('Tournament')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300 hover:from-amber-500/20 hover:to-orange-500/20 active:scale-95 touch-manipulation cursor-pointer"
                  title="Esports Tournaments"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tournaments</span>
                </button>

                <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-right shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Available Balance
                  </span>
                  <span className="text-base font-black text-emerald-300 font-mono tabular-nums">
                    ₹{(Number(currentWorker?.availableBalanceINR ?? 0)).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => setWorkerTab('Withdraw')}
                  className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-102 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Withdraw</span>
                </button>

                {/* Sign Out Button (Desktop only - mobile has sign out in Profile tab) */}
                <button
                  type="button"
                  onClick={logout}
                  className="hidden sm:flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors border border-white/[0.08] active:scale-95 touch-manipulation cursor-pointer"
                  title="Sign out from Task and Esports Arena"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {currentRole === 'partner' && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] px-2.5 py-1.5 rounded-xl text-xs">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <select
                      value={selectedPartnerName}
                      onChange={(e) => {
                        const target = partnerPanels.find(
                          (p) => p.uniquePartnerName === e.target.value || p.label === e.target.value
                        );
                        if (target) {
                          selectPartnerPanelToVerify(target.code);
                        } else {
                          setSelectedPartnerName(e.target.value);
                        }
                      }}
                      className="bg-transparent font-semibold text-zinc-200 focus:outline-hidden cursor-pointer"
                    >
                      {partnerPanels.map((p) => (
                        <option key={p.code} value={p.uniquePartnerName} className="bg-zinc-900 text-white">
                          {p.label}: {p.uniquePartnerName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Commission
                  </span>
                  <span className="text-base font-black text-emerald-300 font-mono tabular-nums">
                    ₹{(Number(currentPartner?.earnedBalanceINR ?? 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            {currentRole === 'admin' && (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-300">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Admin Terminal</span>
                </div>
                <button
                  onClick={resetToDefaultData}
                  title="Reset demo data to default test dataset"
                  className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-1.5 rounded-xl transition-colors border border-white/[0.08]"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Partner Panels Navigation Sub-bar (Only shown when currentRole is partner) */}
      {currentRole === 'partner' && (
        <div className="bg-[#0b0f19] border-t border-white/[0.06] px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                Partner Panels:
              </span>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <span className="hidden sm:inline text-zinc-400 text-[11px]">
                Active partner dashboard
              </span>
            </div>

            {/* Four Separate Partner Panels: Partner A, Partner B, Partner C, Partner D */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {partnerPanels.map((panel) => {
                const isCurrentActive =
                  currentRole === 'partner' && selectedPartnerName.includes(panel.label);

                return (
                  <button
                    key={panel.code}
                    id={`header-partner-panel-${panel.code.toLowerCase()}-btn`}
                    type="button"
                    onClick={() => requestRoleChange('partner', panel.code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      isCurrentActive
                        ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                    title={`Open ${panel.label} (${panel.uniquePartnerName})`}
                  >
                    <Briefcase className={`w-3.5 h-3.5 ${isCurrentActive ? 'text-zinc-950' : 'text-emerald-400'}`} />
                    <span>{panel.label}</span>
                    <span
                      className={`hidden md:inline text-[10px] ml-0.5 px-1 py-0.2 rounded font-normal ${
                        isCurrentActive ? 'bg-emerald-600/30 text-zinc-950 font-semibold' : 'text-zinc-500'
                      }`}
                    >
                      {panel.agencyType.split('&')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pop-up feedback notification toast */}
      {notificationMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-[#111726] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/[0.1] flex items-center gap-3 max-w-md animate-in slide-in-from-bottom-2 duration-200">
          <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs sm:text-sm font-medium flex-1">{notificationMessage}</p>
          <button
            onClick={clearNotification}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};

