import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleLogo } from './GoogleSignInModal';
import { ShieldCheck, UserCheck, Shield } from 'lucide-react';
import { PinModal } from './PinModal';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, requestRoleChange } = useApp();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hidden tap handler for Admin / Partner on Welcome User title (5 taps: Partner, 8 taps: Admin)
  const welcomeTapRef = useRef<{ count: number; timer: NodeJS.Timeout | null }>({ count: 0, timer: null });

  const handleWelcomeTap = () => {
    if (welcomeTapRef.current.timer) {
      clearTimeout(welcomeTapRef.current.timer);
      welcomeTapRef.current.timer = null;
    }

    welcomeTapRef.current.count += 1;
    const currentCount = welcomeTapRef.current.count;

    if (currentCount === 8) {
      welcomeTapRef.current.count = 0;
      requestRoleChange('admin');
      return;
    }

    welcomeTapRef.current.timer = setTimeout(() => {
      if (welcomeTapRef.current.count === 5) {
        requestRoleChange('partner');
      }
      welcomeTapRef.current.count = 0;
      welcomeTapRef.current.timer = null;
    }, 450);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google authentication notice:', err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('cancelled')) {
        setError('Google sign-in was cancelled.');
      } else if (err?.code === 'auth/popup-blocked') {
        const promptEmail = window.prompt('Enter your Google Account email address:', 'aratibera754@gmail.com');
        if (promptEmail && promptEmail.includes('@')) {
          await loginWithGoogle({
            email: promptEmail.trim().toLowerCase(),
            name: promptEmail.split('@')[0],
          });
        }
      } else {
        setError(err?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-zinc-100 flex flex-col justify-between font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      <PinModal />

      {/* Top Simple Bar */}
      <header className="border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs tracking-tight shadow-[0_0_20px_rgba(6,182,212,0.35)] border border-cyan-400/30">
              TEA
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">Task and Esports <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Arena</span></span>
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Protected Authentication • Persistent Session</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full bg-[#111726] text-zinc-100 rounded-3xl shadow-2xl shadow-black/80 border border-white/[0.08] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header with Prominent Welcome User Text */}
          <div className="bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-8 text-center border-b border-white/[0.06]">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <UserCheck className="w-7 h-7" />
            </div>

            {/* Prominent 'Welcome User' Header with hidden 5-tap/8-tap access */}
            <button
              id="welcome-user-heading-btn"
              type="button"
              onClick={handleWelcomeTap}
              className="select-none focus:outline-hidden cursor-pointer group text-center block w-full"
              title="Welcome User"
            >
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                Welcome User
              </h1>
            </button>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Sign in with your Google account to access your dashboard, tasks, and INR rewards
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-2xl">
                <p>{error}</p>
              </div>
            )}

            {/* Google Authentication - Single Option */}
            <button
              type="button"
              id="google-quick-auth-btn"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl border border-white/[0.12] hover:border-cyan-500/50 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <GoogleLogo className="w-5 h-5" />
              <span>{isSubmitting ? 'Authenticating with Google...' : 'Continue with Google'}</span>
            </button>

            {/* Security Guarantee Notice */}
            <div className="p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.06] flex items-start gap-2.5 text-[11px] text-zinc-400">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Your session is automatically saved across browser sessions until explicit logout. Each user is assigned a permanent <strong className="text-zinc-200">Unique User ID</strong> with zero duplicate accounts.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-4 px-6 text-center text-xs text-zinc-500">
        <p>Task and Esports Arena • Rewards &amp; Esports Platform</p>
      </footer>
    </div>
  );
};
