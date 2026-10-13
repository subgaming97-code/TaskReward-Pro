import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Briefcase,
  Trophy,
  Wallet,
  User,
  LifeBuoy,
  Shield,
  Lock,
  X,
  ChevronRight,
  Sparkles,
  KeyRound,
  AlertTriangle,
  Building2,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    workerTab,
    setWorkerTab,
    currentWorker,
    tasks,
    tournaments,
    roleSecurityPins,
    updateRolePin,
    isAppSidebarOpen,
    setIsAppSidebarOpen,
    logout,
    notify,
  } = useApp();

  // Admin PIN Unlock Dialog State
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinConfirmInput, setAdminPinConfirmInput] = useState('');
  const [adminSetupStep, setAdminSetupStep] = useState<'create' | 'confirm'>('create');
  const [adminSetupPinToConfirm, setAdminSetupPinToConfirm] = useState('');
  const [adminPinError, setAdminPinError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const isCustomAdminPinConfigured = Boolean(
    roleSecurityPins?.adminPin && roleSecurityPins.adminPin.trim().length === 4
  );

  const currentDisplayPin = isCustomAdminPinConfigured
    ? adminPinInput
    : adminSetupStep === 'create'
    ? adminPinInput
    : adminPinConfirmInput;

  useEffect(() => {
    if (isAdminPinModalOpen) {
      setAdminPinInput('');
      setAdminPinConfirmInput('');
      setAdminSetupStep('create');
      setAdminSetupPinToConfirm('');
      setAdminPinError(null);
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
    }
  }, [isAdminPinModalOpen]);

  if (!isAppSidebarOpen) return null;

  const handleAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCustomAdminPinConfigured) {
      if (adminSetupStep === 'create') {
        if (adminPinInput.length !== 4) {
          setAdminPinError('Please enter a 4-digit custom PIN.');
          return;
        }
        if (adminPinInput === '1115') {
          setAdminPinError('Default PIN "1115" is eliminated. Choose a unique custom PIN.');
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setAdminPinInput('');
          return;
        }
        setAdminSetupPinToConfirm(adminPinInput);
        setAdminSetupStep('confirm');
        setAdminPinConfirmInput('');
        setAdminPinError(null);
      } else {
        if (adminPinConfirmInput !== adminSetupPinToConfirm) {
          setAdminPinError('PINs do not match. Please re-enter custom PIN.');
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setAdminSetupStep('create');
          setAdminPinInput('');
          setAdminPinConfirmInput('');
          return;
        }
        updateRolePin('admin', adminSetupPinToConfirm);
        setCurrentRole('admin');
        setIsAdminPinModalOpen(false);
        setIsAppSidebarOpen(false);
        notify('Unique custom Admin PIN set! Terminal unlocked.');
      }
      return;
    }

    if (adminPinInput === '1115') {
      setAdminPinError('Default PIN "1115" is eliminated. Enter your custom Administrator PIN.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setAdminPinInput('');
      return;
    }

    if (adminPinInput.trim() === roleSecurityPins.adminPin) {
      setAdminPinError(null);
      setCurrentRole('admin');
      setIsAdminPinModalOpen(false);
      setIsAppSidebarOpen(false);
      notify('Administrator access granted! Admin Panel unlocked.');
    } else {
      setAdminPinError('Invalid custom security PIN code. Access denied.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setAdminPinInput('');
    }
  };

  const handleDigitClick = (digit: string) => {
    if (!isCustomAdminPinConfigured) {
      if (adminSetupStep === 'create') {
        if (adminPinInput.length < 4) {
          const next = adminPinInput + digit;
          setAdminPinInput(next);
          setAdminPinError(null);
          if (next.length === 4) {
            if (next === '1115') {
              setAdminPinError('Default PIN "1115" is eliminated. Choose a unique custom PIN.');
              setShake(true);
              setTimeout(() => setShake(false), 500);
              setAdminPinInput('');
              return;
            }
            setTimeout(() => {
              setAdminSetupPinToConfirm(next);
              setAdminSetupStep('confirm');
              setAdminPinConfirmInput('');
            }, 120);
          }
        }
      } else {
        if (adminPinConfirmInput.length < 4) {
          const next = adminPinConfirmInput + digit;
          setAdminPinConfirmInput(next);
          setAdminPinError(null);
          if (next.length === 4) {
            if (next === adminSetupPinToConfirm) {
              setTimeout(() => {
                updateRolePin('admin', next);
                setCurrentRole('admin');
                setIsAdminPinModalOpen(false);
                setIsAppSidebarOpen(false);
                notify('Unique custom Admin PIN set! Terminal unlocked.');
              }, 150);
            } else {
              setAdminPinError('PINs do not match. Please re-enter custom PIN.');
              setShake(true);
              setTimeout(() => setShake(false), 500);
              setTimeout(() => {
                setAdminSetupStep('create');
                setAdminPinInput('');
                setAdminPinConfirmInput('');
              }, 400);
            }
          }
        }
      }
      return;
    }

    if (adminPinInput.length < 4) {
      const next = adminPinInput + digit;
      setAdminPinInput(next);
      setAdminPinError(null);
      if (next === '1115') {
        setAdminPinError('Default PIN "1115" is eliminated. Enter your custom Administrator PIN.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setAdminPinInput('');
      } else if (next === roleSecurityPins?.adminPin) {
        setTimeout(() => {
          setCurrentRole('admin');
          setIsAdminPinModalOpen(false);
          setIsAppSidebarOpen(false);
          notify('Administrator access granted! Admin Panel unlocked.');
        }, 150);
      } else if (next.length === 4) {
        setAdminPinError('Invalid custom security PIN code. Access denied.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setAdminPinInput('');
      }
    }
  };

  const handleBackspace = () => {
    if (!isCustomAdminPinConfigured && adminSetupStep === 'confirm') {
      setAdminPinConfirmInput((prev) => prev.slice(0, -1));
    } else {
      setAdminPinInput((prev) => prev.slice(0, -1));
    }
    setAdminPinError(null);
  };

  const navItems = [
    {
      id: 'Home',
      label: 'Home Dashboard',
      icon: Home,
      onClick: () => {
        setWorkerTab('Home');
        setIsAppSidebarOpen(false);
      },
      active: workerTab === 'Home',
    },
    {
      id: 'Tasks',
      label: 'Available Tasks',
      icon: Briefcase,
      badge: tasks.length,
      onClick: () => {
        setWorkerTab('Tasks');
        setIsAppSidebarOpen(false);
      },
      active: workerTab === 'Tasks',
    },
    {
      id: 'Tournament',
      label: 'Esports Tournaments',
      icon: Trophy,
      badge: tournaments.length,
      onClick: () => {
        setWorkerTab('Tournament');
        setIsAppSidebarOpen(false);
      },
      active: workerTab === 'Tournament',
    },
    {
      id: 'Earnings',
      label: 'Earnings & Payouts',
      icon: Wallet,
      extraText: `₹${currentWorker?.availableBalanceINR || 0}`,
      onClick: () => {
        setWorkerTab('Earnings');
        setIsAppSidebarOpen(false);
      },
      active: workerTab === 'Earnings' || workerTab === 'Withdraw',
    },
    {
      id: 'Profile',
      label: 'User Profile & KYC',
      icon: User,
      onClick: () => {
        setWorkerTab('Profile');
        setIsAppSidebarOpen(false);
      },
      active: workerTab === 'Profile',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsAppSidebarOpen(false)}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Sidebar Drawer */}
      <aside
        id="app-navigation-sidebar"
        className="fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-[#0b101c] border-r border-white/[0.08] text-zinc-100 flex flex-col shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-250 ease-out"
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-[#10182c] to-[#0b101c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs tracking-tight shadow-[0_0_15px_rgba(6,182,212,0.35)] border border-cyan-400/30">
              TEA
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">
                Task and Esports <span className="text-cyan-400">Arena</span>
              </h2>
              <span className="text-[10px] text-zinc-400 font-mono">Platform Navigation</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAppSidebarOpen(false)}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
            title="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        {currentWorker && (
          <div className="p-4 mx-3 my-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
              {currentWorker.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white text-xs truncate">{currentWorker.name}</div>
              <div className="text-[10px] text-zinc-400 font-mono truncate">
                E-ID: {currentWorker.eid || currentWorker.uniqueUserId}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Balance</span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                ₹{Number(currentWorker.availableBalanceINR || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Main Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 text-xs">
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Menu Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  item.active
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                        item.active
                          ? 'bg-white/20 text-white'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.extraText && (
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      {item.extraText}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer with HIDDEN ADMIN PANEL LINK */}
        <div className="p-4 border-t border-white/[0.08] bg-[#070b14] space-y-3">
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Task and Esports Arena v2.4</span>
            <button
              type="button"
              onClick={logout}
              className="text-zinc-400 hover:text-rose-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* THE HIDDEN ADMIN PANEL LINK                              */}
          {/* Requires unique custom PIN set by administrator         */}
          {/* ======================================================== */}
          <div className="pt-2 border-t border-white/[0.05]">
            <button
              id="sidebar-hidden-admin-panel-link"
              type="button"
              onClick={() => setIsAdminPinModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-semibold text-zinc-400 hover:text-blue-300 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/25 transition-all cursor-pointer group"
              title="Restricted Administrative Console (Security PIN Required)"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                <span className="tracking-tight text-zinc-400 group-hover:text-zinc-200">
                  Administrative Terminal
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500 group-hover:text-blue-400">
                <Lock className="w-3 h-3" />
                <span>{isCustomAdminPinConfigured ? 'Custom PIN' : 'Set PIN'}</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* CUSTOM SECURITY PIN MODAL FOR ADMIN ACCESS               */}
      {/* ======================================================== */}
      {isAdminPinModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`bg-[#0d1322] border border-blue-500/40 w-full max-w-sm rounded-3xl p-6 shadow-2xl shadow-blue-950/60 space-y-5 text-center relative ${
              shake ? 'animate-bounce' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setIsAdminPinModalOpen(false);
                setAdminPinInput('');
                setAdminPinConfirmInput('');
                setAdminPinError(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Admin Shield Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Shield className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                {isCustomAdminPinConfigured ? 'Admin Authentication' : 'Initial Admin PIN Setup'}
              </span>
              <h3 className="text-lg font-black text-white pt-1">
                {isCustomAdminPinConfigured
                  ? 'Admin Security PIN'
                  : adminSetupStep === 'create'
                  ? 'Set Custom Admin PIN'
                  : 'Confirm Custom Admin PIN'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isCustomAdminPinConfigured
                  ? 'Enter your unique custom 4-digit Administrator PIN to unlock the Admin Panel.'
                  : adminSetupStep === 'create'
                  ? 'No default PINs exist. Create your private, unique 4-digit PIN for Administrator access:'
                  : 'Please re-enter the 4 digits to confirm your custom Administrator PIN:'}
              </p>
            </div>

            {/* PIN Code Dots Display */}
            <div className="flex items-center justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = currentDisplayPin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl border flex items-center justify-center font-mono text-2xl font-black transition-all ${
                      isFilled
                        ? 'border-blue-400 bg-blue-500/20 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.4)] scale-105'
                        : 'border-white/[0.1] bg-white/[0.02] text-zinc-600'
                    }`}
                  >
                    {isFilled ? '●' : '—'}
                  </div>
                );
              })}
            </div>

            {adminPinError && (
              <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-2.5 text-xs text-rose-300 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{adminPinError}</span>
              </div>
            )}

            {/* Hidden Input for Keyboard Typing */}
            <form onSubmit={handleAdminPinSubmit}>
              <input
                ref={pinInputRef}
                type="password"
                maxLength={4}
                inputMode="numeric"
                value={currentDisplayPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (!isCustomAdminPinConfigured) {
                    if (adminSetupStep === 'create') {
                      setAdminPinInput(val);
                      setAdminPinError(null);
                      if (val.length === 4) {
                        if (val === '1115') {
                          setAdminPinError('Default PIN "1115" is eliminated. Choose a unique custom PIN.');
                          setShake(true);
                          setTimeout(() => setShake(false), 500);
                          setAdminPinInput('');
                          return;
                        }
                        setTimeout(() => {
                          setAdminSetupPinToConfirm(val);
                          setAdminSetupStep('confirm');
                          setAdminPinConfirmInput('');
                        }, 120);
                      }
                    } else {
                      setAdminPinConfirmInput(val);
                      setAdminPinError(null);
                      if (val.length === 4) {
                        if (val === adminSetupPinToConfirm) {
                          setTimeout(() => {
                            updateRolePin('admin', val);
                            setCurrentRole('admin');
                            setIsAdminPinModalOpen(false);
                            setIsAppSidebarOpen(false);
                            notify('Unique custom Admin PIN set! Terminal unlocked.');
                          }, 150);
                        } else {
                          setAdminPinError('PINs do not match. Please re-enter custom PIN.');
                          setShake(true);
                          setTimeout(() => setShake(false), 500);
                          setTimeout(() => {
                            setAdminSetupStep('create');
                            setAdminPinInput('');
                            setAdminPinConfirmInput('');
                          }, 400);
                        }
                      }
                    }
                    return;
                  }

                  setAdminPinInput(val);
                  setAdminPinError(null);
                  if (val === '1115') {
                    setAdminPinError('Default PIN "1115" is eliminated. Enter your custom Administrator PIN.');
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                    setAdminPinInput('');
                  } else if (val === roleSecurityPins?.adminPin) {
                    setTimeout(() => {
                      setCurrentRole('admin');
                      setIsAdminPinModalOpen(false);
                      setIsAppSidebarOpen(false);
                      notify('Administrator access granted! Admin Panel unlocked.');
                    }, 150);
                  } else if (val.length === 4) {
                    setAdminPinError('Invalid custom security PIN code. Access denied.');
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                    setAdminPinInput('');
                  }
                }}
                className="opacity-0 absolute -z-10 w-0 h-0"
                autoComplete="off"
              />
            </form>

            {/* 0-9 On-Screen Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-2 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitClick(digit)}
                  className="h-12 rounded-2xl bg-white/[0.04] hover:bg-blue-500/20 active:bg-blue-500/30 border border-white/[0.08] hover:border-blue-500/40 text-white font-mono text-lg font-bold transition-all active:scale-95 cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (!isCustomAdminPinConfigured && adminSetupStep === 'confirm') {
                    setAdminPinConfirmInput('');
                  } else {
                    setAdminPinInput('');
                  }
                  setAdminPinError(null);
                }}
                className="h-12 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] text-zinc-400 text-xs font-bold transition-all cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleDigitClick('0')}
                className="h-12 rounded-2xl bg-white/[0.04] hover:bg-blue-500/20 border border-white/[0.08] text-white font-mono text-lg font-bold transition-all active:scale-95 cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] text-zinc-400 text-xs font-bold transition-all cursor-pointer"
              >
                ⌫
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
