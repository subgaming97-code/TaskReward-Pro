import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AdminPanel } from './components/admin/AdminPanel';
import { PartnerPanel } from './components/partner/PartnerPanel';
import { WorkerDashboard } from './components/worker/WorkerDashboard';
import { PinModal } from './components/PinModal';
import { GoogleSignInModal } from './components/GoogleSignInModal';
import { LoginPage } from './components/LoginPage';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AppSidebar } from './components/AppSidebar';
import { Wrench, Shield, Zap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRole, requestRoleChange, settings, isAuthenticated } = useApp();

  // 1. Require successful login before accessing the main app
  if (!isAuthenticated && currentRole !== 'admin') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-zinc-100 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      <Header />
      <AppSidebar />
      <PinModal />
      <GoogleSignInModal />

      {/* Maintenance Mode Screen for non-admins if active */}
      {settings.maintenanceMode && currentRole !== 'admin' ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#111726] rounded-3xl border border-amber-500/30 p-8 text-center space-y-4 shadow-2xl shadow-black/80">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Wrench className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Scheduled Maintenance</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{settings.maintenanceMessage}</p>
            <div className="pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => requestRoleChange('admin')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
              >
                Administrator Login Bypass
              </button>
            </div>
          </div>
        </div>
      ) : (
        <main className="flex-1 flex flex-col pb-20 md:pb-0">
          {currentRole === 'admin' && <AdminPanel />}
          {currentRole === 'partner' && <PartnerPanel />}
          {currentRole === 'worker' && <WorkerDashboard />}
        </main>
      )}

      {/* App-like Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Modern Global Dark Footer */}
      <footer className="bg-[#0b0f19] border-t border-white/[0.08] py-6 text-xs text-zinc-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
              TEA
            </div>
            <span className="font-bold text-zinc-300">Task and Esports Arena</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-400">Enterprise INR Reward System</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Role Verification Protected</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
              <span>All Payouts in INR (₹)</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
