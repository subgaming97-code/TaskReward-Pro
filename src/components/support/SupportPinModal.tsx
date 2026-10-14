import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Headphones,
  Lock,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Delete,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export const SupportPinModal: React.FC = () => {
  const {
    supportPinModalOpen,
    setSupportPinModalOpen,
    verifySupportPin,
    setIsSupportPanelOpen,
    roleSecurityPins,
    notify,
  } = useApp();

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (supportPinModalOpen) {
      setPin('');
      setError(null);
      setShowPin(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [supportPinModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && supportPinModalOpen) {
        setSupportPinModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [supportPinModalOpen, setSupportPinModalOpen]);

  if (!supportPinModalOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pin.trim();
    if (clean.length !== 4) {
      setError('Please enter a 4-digit numeric PIN.');
      return;
    }

    const isValid = verifySupportPin(clean);
    if (isValid) {
      setError(null);
      setSupportPinModalOpen(false);
      setIsSupportPanelOpen(true);
      notify('24/7 Customer Support Desk unlocked. Welcome on duty!');
    } else {
      setError('Incorrect Support Staff PIN. Access denied.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setError(null);
      if (next.length === 4) {
        // Auto submit when 4th digit entered
        setTimeout(() => {
          const isValid = verifySupportPin(next);
          if (isValid) {
            setError(null);
            setSupportPinModalOpen(false);
            setIsSupportPanelOpen(true);
            notify('24/7 Customer Support Desk unlocked. Welcome on duty!');
          } else {
            setError('Incorrect Support Staff PIN. Access denied.');
            setPin('');
          }
        }, 120);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-pin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0f1523] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 space-y-6 overflow-hidden">
        {/* Subtle Decorative Backdrops */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={() => setSupportPinModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer"
          title="Close PIN Prompt"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-lg shadow-cyan-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1424] rounded-[14px] flex items-center justify-center text-cyan-400">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                Security Access
              </span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                24/7 SLA Monitored
              </span>
            </div>
            <h2 id="support-pin-modal-title" className="text-lg font-extrabold text-white tracking-tight mt-0.5">
              Support Staff Verification
            </h2>
            <p className="text-xs text-zinc-400">
              Triggered via 5-tap gesture on &apos;Welcome User&apos;
            </p>
          </div>
        </div>

        {/* PIN Entry Prompt */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-center space-y-3">
          <p className="text-xs text-zinc-300">
            Enter the 4-digit Support Staff PIN to unlock the 24/7 Customer Support Operations Panel:
          </p>

          {/* 4-Digit Display Boxes */}
          <div className="flex items-center justify-center gap-3 py-1">
            {[0, 1, 2, 3].map((idx) => {
              const char = pin[idx];
              const isFilled = Boolean(char);
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-2xl border flex items-center justify-center font-mono text-xl font-black transition-all ${
                    isFilled
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-105'
                      : 'border-white/[0.1] bg-black/40 text-zinc-600'
                  }`}
                >
                  {isFilled ? (showPin ? char : '•') : ''}
                </div>
              );
            })}
          </div>

          {/* Hidden/Direct Input for keyboard users */}
          <form onSubmit={handleSubmit} className="relative pt-1">
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(digits);
                  setError(null);
                  if (digits.length === 4) {
                    setTimeout(() => {
                      if (verifySupportPin(digits)) {
                        setError(null);
                        setSupportPinModalOpen(false);
                        setIsSupportPanelOpen(true);
                        notify('24/7 Customer Support Desk unlocked!');
                      } else {
                        setError('Incorrect Support Staff PIN. Access denied.');
                        setPin('');
                      }
                    }, 100);
                  }
                }}
                placeholder="Or type 4-digit PIN"
                className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl font-mono text-center text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-cyan-400 tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {error && (
            <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-medium animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Touch Number Pad for Mobile & Tablet */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="py-3 bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/[0.06] rounded-2xl font-mono text-lg font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border border-rose-500/20 rounded-2xl text-xs font-bold text-rose-300 transition-all cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="py-3 bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/[0.06] rounded-2xl font-mono text-lg font-bold text-white transition-all cursor-pointer shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/[0.06] rounded-2xl flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={pin.length !== 4}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock 24/7 Support Desk</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Configurable note */}
          <div className="text-center">
            <p className="text-[11px] text-zinc-500">
              PIN is configurable by Administrators in{' '}
              <span className="text-zinc-400 font-medium">Admin Panel &gt; Administration</span>.
              <br />
              <span className="text-cyan-400/80 font-mono text-[10px]">
                Active PIN: {roleSecurityPins.supportPin || '2470'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
