import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AdminPanel } from './components/admin/AdminPanel';
import { PartnerPanel } from './components/partner/PartnerPanel';
import { WorkerDashboard } from './components/worker/WorkerDashboard';
import { PinModal } from './components/PinModal';
import { Wrench, Shield, CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRole, requestRoleChange, settings } = useApp();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <PinModal />

      {/* Maintenance Mode Screen for non-admins if active */}
      {settings.maintenanceMode && currentRole !== 'admin' ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 p-8 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Wrench className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Scheduled Maintenance</h2>
            <p className="text-sm text-zinc-600 leading-relaxed">{settings.maintenanceMessage}</p>
            <div className="pt-2 border-t border-zinc-100">
              <button
                onClick={() => requestRoleChange('admin')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                Administrator Login Bypass
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {currentRole === 'admin' && <AdminPanel />}
          {currentRole === 'partner' && <PartnerPanel />}
          {currentRole === 'worker' && <WorkerDashboard />}
        </div>
      )}

      {/* Professional Global Footer */}
      <footer className="bg-white border-t border-zinc-200 py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
              TF
            </div>
            <span className="font-bold text-zinc-800">TaskFlow Rewards &amp; Management Platform</span>
            <span className="text-zinc-300">•</span>
            <span>English Only Standard</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Role Security Enabled</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-zinc-700">
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
