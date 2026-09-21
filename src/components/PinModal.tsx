import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Briefcase, Lock, AlertCircle, X, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const PinModal: React.FC = () => {
  const { pinModalOpen, pendingRole, pinError, verifyPin, closePinModal } = useApp();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pinModalOpen) {
      setPin('');
      setShowPin(false);
      // Autofocus the input field
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [pinModalOpen, pendingRole]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    const success = verifyPin(pin.trim());
    if (!success) {
      // Focus and select input for fast retry
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
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
        className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${
                isAdmin
                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}
            >
              {isAdmin ? <Shield className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
            </div>
            <div>
              <h2 id="pin-modal-title" className="text-base font-black text-zinc-900 tracking-tight">
                {isAdmin ? 'Admin Security Verification' : 'Partner Security Verification'}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {isAdmin
                  ? 'Enter security PIN to access the Admin Panel.'
                  : 'Enter security PIN to access the Partner Agency Panel.'}
              </p>
            </div>
          </div>
          <button
            id="pin-modal-close-btn"
            type="button"
            onClick={closePinModal}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            title="Cancel and close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="security-pin-input" className="block text-xs font-bold text-zinc-700">
              Security PIN
            </label>
            <div className="relative">
              <input
                id="security-pin-input"
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                maxLength={10}
                className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-zinc-900 transition-all font-bold placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-zinc-400"
              />
              <button
                id="pin-toggle-visibility-btn"
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition-colors"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message Display */}
          {pinError && (
            <div
              id="pin-error-notice"
              className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{pinError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              id="pin-modal-cancel-btn"
              type="button"
              onClick={closePinModal}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="pin-modal-submit-btn"
              type="submit"
              className={`flex-1 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                isAdmin
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verify &amp; Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
