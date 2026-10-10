import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Briefcase, Lock, AlertCircle, X, Eye, EyeOff, ArrowRight, UserCheck, ChevronRight } from 'lucide-react';
import { PartnerPanelCode } from '../types';

export const PinModal: React.FC = () => {
  const {
    pinModalOpen,
    pendingRole,
    pendingPartnerPanel,
    partnerStep,
    enteredPartnerName,
    setEnteredPartnerName,
    partnerPanels,
    selectPartnerPanelToVerify,
    submitPartnerName,
    verifyPin,
    closePinModal,
    pinError,
    roleSecurityPins,
    updateRolePin,
    setCurrentRole,
    notify,
  } = useApp();

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [partnerNameInput, setPartnerNameInput] = useState('');
  const [adminSetupStep, setAdminSetupStep] = useState<'create' | 'confirm'>('create');
  const [adminPinConfirmInput, setAdminPinConfirmInput] = useState('');
  const [adminSetupError, setAdminSetupError] = useState<string | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const targetPanel = partnerPanels.find((p) => p.code === pendingPartnerPanel);

  // Sync inputs when modal opens or step changes
  useEffect(() => {
    if (pinModalOpen) {
      setPin('');
      setShowPin(false);
      if (partnerStep === 'name') {
        setPartnerNameInput(enteredPartnerName || (targetPanel ? targetPanel.uniquePartnerName : ''));
        setTimeout(() => {
          nameInputRef.current?.focus();
          nameInputRef.current?.select();
        }, 60);
      } else if (partnerStep === 'pin') {
        setTimeout(() => {
          pinInputRef.current?.focus();
        }, 60);
      }
    }
  }, [pinModalOpen, pendingRole, partnerStep, pendingPartnerPanel]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pinModalOpen) {
        closePinModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinModalOpen, closePinModal]);

  if (!pinModalOpen || !pendingRole) return null;

  const isAdmin = pendingRole === 'admin';
  const isCustomAdminPinConfigured = Boolean(
    roleSecurityPins?.adminPin && roleSecurityPins.adminPin.trim().length === 4
  );

  // Handle Step 1: Submit Partner Name
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = submitPartnerName(partnerNameInput);
    if (success) {
      setPin('');
    }
  };

  // Handle Step 2: Submit PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin && !isCustomAdminPinConfigured) {
      if (adminSetupStep === 'create') {
        if (!/^\d{4}$/.test(pin.trim())) {
          setAdminSetupError('Please enter a 4-digit numeric custom PIN.');
          return;
        }
        if (pin.trim() === '1115') {
          setAdminSetupError('Default PIN "1115" is eliminated. Choose a unique custom PIN.');
          setPin('');
          return;
        }
        setAdminSetupStep('confirm');
        setAdminPinConfirmInput('');
        setAdminSetupError(null);
        return;
      } else {
        if (adminPinConfirmInput.trim() !== pin.trim()) {
          setAdminSetupError('PINs do not match. Please re-enter custom PIN.');
          setAdminSetupStep('create');
          setPin('');
          setAdminPinConfirmInput('');
          return;
        }
        updateRolePin('admin', pin.trim());
        setCurrentRole('admin');
        closePinModal();
        notify('Unique custom Admin PIN set! Terminal unlocked.');
        return;
      }
    }

    if (!pin.trim()) return;
    if (isAdmin && pin.trim() === '1115') {
      setAdminSetupError('Default PIN "1115" is eliminated. Enter your custom Administrator PIN.');
      setPin('');
      return;
    }
    const success = verifyPin(pin.trim());
    if (!success) {
      pinInputRef.current?.focus();
      pinInputRef.current?.select();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closePinModal();
        }
      }}
    >
      <div
        id="pin-security-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pin-modal-title"
        className="bg-[#111726] text-zinc-100 rounded-3xl border border-white/[0.1] shadow-2xl shadow-black/90 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${
                isAdmin
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isAdmin ? <Shield className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
            </div>
            <div>
              <h2 id="pin-modal-title" className="text-base font-extrabold text-white tracking-tight">
                {isAdmin
                  ? 'Admin Security Verification'
                  : targetPanel
                  ? `${targetPanel.label} Security Verification`
                  : 'Partner Security Verification'}
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                {isAdmin
                  ? 'Enter security PIN to access the Admin Panel.'
                  : targetPanel
                  ? `${targetPanel.uniquePartnerName}`
                  : 'Select a partner panel to verify security credentials.'}
              </p>
            </div>
          </div>
          <button
            id="pin-modal-close-btn"
            type="button"
            onClick={closePinModal}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
            title="Cancel and close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ADMIN PIN FLOW */}
        {isAdmin && (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            {!isCustomAdminPinConfigured ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-0.5">
                    Security Setup Required
                  </span>
                  <p className="text-xs text-zinc-300">
                    Default PINs have been eliminated. You must set a unique, custom 4-digit Administrator PIN before accessing the panel.
                  </p>
                </div>

                {adminSetupStep === 'create' ? (
                  <div className="space-y-1.5">
                    <label htmlFor="admin-security-pin-input" className="block text-xs font-bold text-zinc-300">
                      Create Custom 4-Digit Admin PIN
                    </label>
                    <div className="relative">
                      <input
                        id="admin-security-pin-input"
                        ref={pinInputRef}
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        autoComplete="off"
                        value={pin}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setPin(digits);
                          setAdminSetupError(null);
                        }}
                        placeholder="Enter 4-digit custom PIN"
                        maxLength={4}
                        className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:outline-hidden focus:border-blue-400 text-white transition-all font-bold placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-zinc-500"
                      />
                      <button
                        id="pin-toggle-visibility-btn"
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
                        title={showPin ? 'Hide PIN' : 'Show PIN'}
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label htmlFor="admin-confirm-pin-input" className="block text-xs font-bold text-zinc-300">
                      Confirm Custom 4-Digit Admin PIN
                    </label>
                    <div className="relative">
                      <input
                        id="admin-confirm-pin-input"
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        autoComplete="off"
                        value={adminPinConfirmInput}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setAdminPinConfirmInput(digits);
                          setAdminSetupError(null);
                        }}
                        placeholder="Re-enter 4-digit custom PIN"
                        maxLength={4}
                        className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:outline-hidden focus:border-blue-400 text-white transition-all font-bold placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="admin-security-pin-input" className="block text-xs font-bold text-zinc-300">
                  Custom Administrator PIN
                </label>
                <div className="relative">
                  <input
                    id="admin-security-pin-input"
                    ref={pinInputRef}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    autoComplete="off"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setAdminSetupError(null);
                    }}
                    placeholder="Enter 4-digit custom PIN"
                    maxLength={10}
                    className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:outline-hidden focus:border-cyan-400 text-white transition-all font-bold placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-zinc-500"
                  />
                  <button
                    id="pin-toggle-visibility-btn"
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
                    title={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {(adminSetupError || pinError) && (
              <div
                id="admin-pin-error-notice"
                className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{adminSetupError || pinError}</span>
              </div>
            )}

            <button
              id="admin-pin-submit-btn"
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>
                {!isCustomAdminPinConfigured
                  ? adminSetupStep === 'create'
                    ? 'Continue to Confirmation'
                    : 'Save Custom PIN & Unlock'
                  : 'Verify Custom PIN & Unlock'}
              </span>
            </button>
          </form>
        )}

        {/* PARTNER FLOW */}
        {!isAdmin && (
          <div className="space-y-4">
            {/* Step 0: Panel Selection (if user tapped generic Partner button) */}
            {partnerStep === 'select' && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-zinc-400">
                  Select your assigned Partner Panel to proceed with authentication:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {partnerPanels.map((panel) => (
                    <button
                      key={panel.code}
                      id={`select-partner-panel-${panel.code.toLowerCase()}-btn`}
                      type="button"
                      onClick={() => selectPartnerPanelToVerify(panel.code)}
                      className="p-3.5 text-left rounded-2xl border border-white/[0.08] hover:border-emerald-500/50 bg-white/[0.03] hover:bg-emerald-500/10 transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-black text-white group-hover:text-emerald-400">
                          {panel.label}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
                      </div>
                      <div className="text-[11px] font-bold text-zinc-300 truncate">
                        {panel.uniquePartnerName}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {panel.agencyType}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Prompt for "Your Partner Name" */}
            {partnerStep === 'name' && targetPanel && (
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Target Panel
                    </span>
                    <span className="text-xs font-bold text-white">
                      {targetPanel.label} ({targetPanel.agencyType})
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl">
                    Step 1 of 2
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="partner-name-input" className="block text-xs font-bold text-zinc-300">
                    Your Partner Name
                  </label>
                  <div className="relative">
                    <input
                      id="partner-name-input"
                      ref={nameInputRef}
                      type="text"
                      value={partnerNameInput}
                      onChange={(e) => setPartnerNameInput(e.target.value)}
                      placeholder="Your Partner Name"
                      className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:outline-hidden focus:border-emerald-400 text-white text-sm font-semibold transition-all placeholder:text-zinc-500"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Enter the authorized partner name registered for {targetPanel.label}.
                  </p>
                </div>

                {/* Error Display */}
                {pinError && (
                  <div
                    id="partner-name-error-notice"
                    className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in duration-150"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{pinError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    id="partner-name-cancel-btn"
                    type="button"
                    onClick={closePinModal}
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-white/[0.1] text-xs font-bold text-zinc-300 hover:bg-white/[0.05] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="partner-name-continue-btn"
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-2xl text-zinc-950 text-xs font-bold shadow-lg transition-colors flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 cursor-pointer"
                  >
                    <span>Continue to PIN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Partner PIN Form */}
            {partnerStep === 'pin' && (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="partner-panel-pin-input" className="block text-xs font-bold text-zinc-300">
                    {targetPanel ? `${targetPanel.label} Security PIN` : 'Partner Security PIN'}
                  </label>
                  <div className="relative">
                    <input
                      id="partner-panel-pin-input"
                      ref={pinInputRef}
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      autoComplete="off"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter Partner PIN"
                      maxLength={10}
                      className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:outline-hidden focus:border-emerald-400 text-white transition-all font-bold placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-zinc-500"
                    />
                    <button
                      id="partner-pin-toggle-btn"
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
                      title={showPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Display */}
                {pinError && (
                  <div
                    id="partner-pin-error-notice"
                    className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in duration-150"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{pinError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    id="partner-pin-modal-back-btn"
                    type="button"
                    onClick={closePinModal}
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-white/[0.1] text-xs font-bold text-zinc-300 hover:bg-white/[0.05] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="partner-pin-modal-submit-btn"
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-2xl text-zinc-950 text-xs font-bold shadow-lg transition-colors flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Verify &amp; Unlock</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
