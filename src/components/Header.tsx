import React from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
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
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    requestRoleChange,
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
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs">
      {/* Top Promotional Banner if enabled */}
      {settings.showBanner && settings.bannerBrandingText && (
        <div className="bg-gradient-to-r from-zinc-900 via-slate-800 to-zinc-900 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>{settings.bannerBrandingText}</span>
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
        <div className="bg-amber-500 text-zinc-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Platform is currently under Maintenance Mode. Only administrators can publish edits.</span>
        </div>
      )}

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <span className="tracking-tight">TF</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-zinc-900">TaskFlow</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">English Task &amp; Rewards Management Portal</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => requestRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'admin'
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => requestRoleChange('partner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'partner'
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>Partner</span>
            </button>

            <button
              onClick={() => requestRoleChange('worker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'worker'
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Worker / User</span>
            </button>
          </div>

          {/* Role-Specific Metric Header / Actions */}
          <div className="flex items-center gap-3">
            {currentRole === 'worker' && (
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                    Available Balance
                  </span>
                  <span className="text-base font-extrabold text-emerald-900">
                    ₹{currentWorker.availableBalanceINR.toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  onClick={() => setWorkerTab('Withdraw')}
                  className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-xs"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Withdraw</span>
                </button>
              </div>
            )}

            {currentRole === 'partner' && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-xl text-xs">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                    <select
                      value={selectedPartnerName}
                      onChange={(e) => setSelectedPartnerName(e.target.value)}
                      className="bg-transparent font-semibold text-zinc-800 focus:outline-hidden cursor-pointer"
                    >
                      {partners.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                    Partner Commission
                  </span>
                  <span className="text-base font-extrabold text-emerald-900">
                    ₹{currentPartner.earnedBalanceINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            {currentRole === 'admin' && (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-800">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin Master Terminal</span>
                </div>
                <button
                  onClick={resetToDefaultData}
                  title="Reset demo data to default test dataset"
                  className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded-lg transition-colors border border-zinc-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Reset Demo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pop-up feedback notification toast */}
      {notificationMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 max-w-md animate-in slide-in-from-bottom-2 duration-200">
          <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs sm:text-sm font-medium flex-1">{notificationMessage}</p>
          <button
            onClick={clearNotification}
            className="text-slate-400 hover:text-white p-1 rounded-sm transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
