import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, KeyRound, X, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

interface ModeratorPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModeratorPinModal: React.FC<ModeratorPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { roleSecurityPins } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const currentModPin = roleSecurityPins?.moderatorPin?.trim();
  const isCustomConfigured = Boolean(currentModPin && currentModPin.length === 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCustomConfigured) {
      setError('No custom PIN configured. Administrator must set a unique Moderator PIN first.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
      return;
    }

    if (pin.trim() === '2244') {
      setError('Default PIN "2244" has been eliminated. Enter the custom PIN set by the administrator.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
      return;
    }

    if (pin.trim() === currentModPin) {
      setError(null);
      onSuccess();
      onClose();
      setPin('');
    } else {
      setError('Invalid custom PIN code. Access to Moderator Panel denied.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
    }
  };

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === 4) {
        if (!isCustomConfigured) {
          setError('No custom PIN set by administrator. Setup required in Admin Console.');
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setPin('');
          return;
        }
        if (nextPin === '2244') {
          setError('Default PIN "2244" has been eliminated. Enter your custom Moderator PIN.');
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setPin('');
          return;
        }
        if (nextPin === currentModPin) {
          setTimeout(() => {
            onSuccess();
            onClose();
            setPin('');
          }, 150);
        } else {
          setError('Invalid custom PIN code. Access denied.');
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`bg-[#0d1322] border border-cyan-500/30 w-full max-w-sm rounded-3xl p-6 shadow-2xl shadow-cyan-950/50 space-y-5 text-center relative transition-transform ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setPin('');
            setError(null);
            onClose();
          }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <Shield className="w-8 h-8" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Moderator Authentication</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Security PIN Required</h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            {isCustomConfigured
              ? 'Enter the unique custom 4-digit PIN configured by the administrator.'
              : 'No custom PIN set. The administrator must configure a unique PIN in Admin Console > Administration.'}
          </p>
        </div>

        {/* 4-Pin Bubble Dots Display */}
        <div className="flex justify-center gap-3.5 py-2">
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = index < pin.length;
            return (
              <div
                key={index}
                className={`w-11 h-12 rounded-2xl flex items-center justify-center text-lg font-mono font-bold transition-all border ${
                  hasDigit
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105'
                    : 'bg-white/[0.04] border-white/[0.1] text-zinc-600'
                }`}
              >
                {hasDigit ? '•' : ''}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl px-3 py-2 text-rose-300 text-xs flex items-center justify-center gap-1.5 animate-in fade-in duration-150">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="py-3 bg-white/[0.04] hover:bg-cyan-500/15 border border-white/[0.08] hover:border-cyan-500/30 rounded-2xl text-base font-bold text-white transition-all active:scale-95 cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPin('');
              setError(null);
            }}
            className="py-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] rounded-2xl text-xs font-semibold text-zinc-400 transition-all active:scale-95 cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="py-3 bg-white/[0.04] hover:bg-cyan-500/15 border border-white/[0.08] hover:border-cyan-500/30 rounded-2xl text-base font-bold text-white transition-all active:scale-95 cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] rounded-2xl text-xs font-semibold text-zinc-400 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-1">
          <button
            type="submit"
            disabled={pin.length < 4}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-2xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Verify &amp; Open Moderator Panel</span>
          </button>
        </form>
      </div>
    </div>
  );
};
