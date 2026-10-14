import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Worker } from '../../types';
import { AdminSidebar } from './AdminSidebar';
import { QueueSection } from './sections/QueueSection';
import { RequestSection } from './sections/RequestSection';
import { SubmissionSection } from './sections/SubmissionSection';
import { CreateTaskSection } from './sections/CreateTaskSection';
import { ActiveTasksSection } from './sections/ActiveTasksSection';
import { SecretSection } from './sections/SecretSection';
import { UserSection } from './sections/UserSection';
import { SetupSection } from './sections/SetupSection';
import { GamingSection } from './sections/GamingSection';
import { AppealsSection } from './sections/AppealsSection';
import { HoldSection } from './sections/HoldSection';
import { StatesSection } from './sections/StatesSection';
import { WithdrawalSection } from './sections/WithdrawalSection';
import { MaintenanceSection } from './sections/MaintenanceSection';
import { PartnersSection } from './sections/PartnersSection';
import { AssignSection } from './sections/AssignSection';
import { ActivityLogsSection } from './ActivityLogsSection';
import { AdministrationSection } from './sections/AdministrationSection';
import { DepositRequestsSection } from './sections/DepositRequestsSection';
import { UserAccountPage } from './UserAccountPage';
import { RewardsDistributionChart } from './RewardsDistributionChart';
import { Menu, Search, Shield, X, AlertCircle, UserCheck, BarChart3, ChevronDown, ChevronUp, AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AdminErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin Panel Module Caught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#111726] border border-rose-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl max-w-lg mx-auto my-8 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Admin Module Recovered</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {this.state.error?.message || 'An error occurred while loading this section. Tapping the button below will restore the active view.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset();
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 mx-auto active:scale-95 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Active Tasks</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AdminPanel: React.FC = () => {
  const { adminSidebarOption, setAdminSidebarOption, workers } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWorkerEid, setSelectedWorkerEid] = useState<string | null>(null);
  const [showRewardsDrawer, setShowRewardsDrawer] = useState(false);

  // Automatically clear worker account view whenever sidebar option changes
  useEffect(() => {
    setSelectedWorkerEid(null);
  }, [adminSidebarOption]);

  // Search User by E-ID state
  const [searchEId, setSearchEId] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Lookup helper to match by User ID (UID), E-ID, numeric digits, email, or worker ref ID
  const findWorkerByEId = (query: string): Worker | undefined => {
    const raw = query.trim();
    if (!raw) return undefined;
    const clean = raw.toUpperCase();
    const cleanDigits = clean.replace(/\D/g, '');
    const cleanNoPrefix = clean.replace(/^(EID-|UID-|ID-|USER-|REF:)/i, '').trim();

    // 1. Direct exact matches
    const exact = workers.find((w) => {
      const eid = (w.eid || '').toUpperCase();
      const uid = (w.uniqueUserId || '').toUpperCase();
      const id = (w.id || '').toUpperCase();
      const email = (w.email || '').toUpperCase();
      const googleEmail = (w.googleAccount?.email || '').toUpperCase();
      const name = (w.name || '').toUpperCase();

      if (
        eid === clean ||
        uid === clean ||
        id === clean ||
        email === clean ||
        googleEmail === clean ||
        name === clean
      ) {
        return true;
      }
      if (cleanNoPrefix && (eid === `EID-${cleanNoPrefix}` || uid === `UID-${cleanNoPrefix}`)) {
        return true;
      }
      if (cleanDigits && cleanDigits.length >= 4) {
        const eidDigits = eid.replace(/\D/g, '');
        const uidDigits = uid.replace(/\D/g, '');
        if (eidDigits === cleanDigits || uidDigits === cleanDigits) {
          return true;
        }
      }
      return false;
    });

    if (exact) return exact;

    // 2. Partial / substring matches
    return workers.find((w) => {
      const eid = (w.eid || '').toUpperCase();
      const uid = (w.uniqueUserId || '').toUpperCase();
      const id = (w.id || '').toUpperCase();
      const email = (w.email || '').toUpperCase();
      const googleEmail = (w.googleAccount?.email || '').toUpperCase();
      const name = (w.name || '').toUpperCase();

      return (
        eid.includes(clean) ||
        uid.includes(clean) ||
        id.includes(clean) ||
        email.includes(clean) ||
        googleEmail.includes(clean) ||
        name.includes(clean) ||
        (cleanNoPrefix && (eid.includes(cleanNoPrefix) || uid.includes(cleanNoPrefix)))
      );
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEId.trim()) return;
    const matched = findWorkerByEId(searchEId);
    if (matched) {
      setSelectedWorkerEid(matched.eid || matched.uniqueUserId || matched.id);
      setSearchError(null);
      setShowSuggestions(false);
    } else {
      setSearchError(
        `No registered user found with ID "${searchEId}". Check user list below or enter a valid ID.`
      );
    }
  };

  const handleSelectSuggestion = (worker: Worker) => {
    setSelectedWorkerEid(worker.eid || worker.uniqueUserId || worker.id);
    setSearchEId(worker.eid || worker.uniqueUserId);
    setSearchError(null);
    setShowSuggestions(false);
  };

  // Filter suggestions when typing
  const matchingSuggestions = searchEId.trim()
    ? workers.filter((w) => {
        const query = searchEId.toLowerCase().trim();
        const queryDigits = query.replace(/\D/g, '');
        const queryNoPrefix = query.replace(/^(eid-|uid-|id-|user-)/i, '').trim();
        return (
          (w.eid && w.eid.toLowerCase().includes(query)) ||
          (w.name && w.name.toLowerCase().includes(query)) ||
          (w.email && w.email.toLowerCase().includes(query)) ||
          (w.googleAccount?.email && w.googleAccount.email.toLowerCase().includes(query)) ||
          (w.uniqueUserId && w.uniqueUserId.toLowerCase().includes(query)) ||
          (w.id && w.id.toLowerCase().includes(query)) ||
          (queryNoPrefix && (
            (w.eid && w.eid.toLowerCase().includes(queryNoPrefix)) ||
            (w.uniqueUserId && w.uniqueUserId.toLowerCase().includes(queryNoPrefix))
          )) ||
          (queryDigits.length >= 4 && (
            (w.eid && w.eid.replace(/\D/g, '').includes(queryDigits)) ||
            (w.uniqueUserId && w.uniqueUserId.replace(/\D/g, '').includes(queryDigits))
          ))
        );
      })
    : [];

  // When a specific worker is selected by E-ID
  const activeWorkerAccount = selectedWorkerEid
    ? workers.find((w) => {
        const sel = selectedWorkerEid.toUpperCase();
        const selDigits = sel.replace(/\D/g, '');
        return (
          w.id.toUpperCase() === sel ||
          w.eid?.toUpperCase() === sel ||
          w.uniqueUserId?.toUpperCase() === sel ||
          (selDigits.length >= 4 && (
            (w.eid && w.eid.replace(/\D/g, '') === selDigits) ||
            (w.uniqueUserId && w.uniqueUserId.replace(/\D/g, '') === selDigits)
          ))
        );
      })
    : null;

  const renderActiveSection = () => {
    if (activeWorkerAccount) {
      return (
        <UserAccountPage
          worker={activeWorkerAccount}
          onBack={() => setSelectedWorkerEid(null)}
          onSearchEId={(eid) => {
            const matched = findWorkerByEId(eid);
            if (matched) {
              setSelectedWorkerEid(matched.eid || matched.uniqueUserId);
              setSearchError(null);
            } else {
              setSearchError(`No user found with E-ID "${eid}".`);
            }
          }}
        />
      );
    }

    switch (adminSidebarOption) {
      case 'Q-U-U-E-U-E':
        return <QueueSection />;
      case 'Request':
        return <RequestSection />;
      case 'Submission':
        return <SubmissionSection />;
      case 'Create':
        return <CreateTaskSection />;
      case 'Active':
        return <ActiveTasksSection />;
      case 'Secret':
        return <SecretSection />;
      case 'User':
        return <UserSection onSelectWorkerEid={(eid) => setSelectedWorkerEid(eid)} />;
      case 'Setup':
        return <SetupSection />;
      case 'Gaming':
        return <GamingSection />;
      case 'Appeals':
        return <AppealsSection />;
      case 'Hold':
        return <HoldSection />;
      case 'States':
        return <StatesSection />;
      case 'Withdrawal':
        return <WithdrawalSection />;
      case 'Deposit Requests':
        return <DepositRequestsSection />;
      case 'Maintenance':
        return <MaintenanceSection />;
      case 'Partners':
        return <PartnersSection />;
      case 'Assign':
        return <AssignSection />;
      case 'Activity Logs':
        return <ActivityLogsSection />;
      case 'Administration':
        return <AdministrationSection />;
      default:
        return <ActiveTasksSection />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#090d16] text-zinc-100 flex">
      {/* Sidebar with exact options */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectOption={(opt) => {
          setSelectedWorkerEid(null);
          setAdminSidebarOption(opt);
          setSidebarOpen(false);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Mobile menu trigger bar */}
        <div className="lg:hidden bg-[#111726] border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-200 bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 rounded-xl border border-white/[0.08] transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
            <span>Admin Menu ({adminSidebarOption})</span>
          </button>
          <span className="text-xs font-mono text-zinc-400">19 Tools</span>
        </div>

        {/* Top Header Bar with 'Search User by E-ID' */}
        <div className="bg-[#111726]/90 border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-3.5 shadow-lg shadow-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Task and Esports Arena Admin Hub</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-cyan-400 font-medium">Tool: {adminSidebarOption}</span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {workers.length} registered accounts with verified unique E-IDs
                </div>
              </div>
            </div>

            {/* Search Box labeled 'Search User by E-ID' */}
            <div className="relative w-full md:w-auto">
              <form onSubmit={handleSearchSubmit} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <label
                  htmlFor="admin-search-user-by-eid"
                  className="text-xs font-bold text-zinc-300 whitespace-nowrap flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="hidden xs:inline sm:inline">Search User by E-ID:</span>
                  <span className="xs:hidden sm:hidden">E-ID:</span>
                </label>
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    id="admin-search-user-by-eid"
                    type="text"
                    value={searchEId}
                    onChange={(e) => {
                      setSearchEId(e.target.value);
                      setSearchError(null);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="e.g. EID-928410"
                    className="w-full sm:w-52 pl-3 pr-7 py-1.5 text-xs font-mono bg-white/[0.04] border border-white/[0.1] rounded-xl focus:outline-hidden focus:border-cyan-400 text-white placeholder:text-zinc-500"
                  />
                  {searchEId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchEId('');
                        setSearchError(null);
                        setShowSuggestions(false);
                      }}
                      className="absolute right-2 top-2 text-zinc-400 hover:text-white"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 text-xs font-bold rounded-xl transition-colors shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    Open Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRewardsDrawer(!showRewardsDrawer)}
                    className={`px-3 py-1.5 border text-xs font-bold rounded-xl transition-colors shadow-xs whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      showRewardsDrawer
                        ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border-white/[0.08]'
                    }`}
                    title="Toggle 30-day INR rewards distribution bar chart"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">30D Rewards Chart</span>
                    <span className="sm:hidden">Chart</span>
                    {showRewardsDrawer ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && matchingSuggestions.length > 0 && (
                <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-[#141d30] rounded-2xl shadow-2xl border border-white/[0.1] p-2 z-50 animate-in fade-in duration-100 max-h-60 overflow-y-auto">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                    Matching Registered Users
                  </div>
                  {matchingSuggestions.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(w)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors flex items-center justify-between gap-2 text-xs cursor-pointer"
                    >
                      <div className="truncate">
                        <div className="font-semibold text-white truncate">{w.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{w.email}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[10px] font-bold bg-white/[0.1] text-zinc-200 px-1.5 py-0.5 rounded-lg block">
                          {w.eid}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 block mt-0.5 font-mono">
                          ₹{Number(w?.availableBalanceINR || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search feedback notice if E-ID not found */}
          {searchError && (
            <div className="max-w-7xl mx-auto mt-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{searchError}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase text-amber-400">Quick E-IDs:</span>
                {workers.slice(0, 4).map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setSelectedWorkerEid(w.eid);
                      setSearchEId(w.eid);
                      setSearchError(null);
                    }}
                    className="font-mono text-[10px] bg-white/[0.05] border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    {w.eid}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {showRewardsDrawer && (
            <div className="relative animate-in fade-in slide-in-from-top-3 duration-200 bg-[#111726] border border-white/[0.08] p-5 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>30-Day Rewards Telemetry</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowRewardsDrawer(false)}
                  className="text-xs text-zinc-400 hover:text-white font-medium px-2 py-1 rounded-lg hover:bg-white/[0.05] cursor-pointer"
                >
                  Close Chart ✕
                </button>
              </div>
              <RewardsDistributionChart />
            </div>
          )}
          <AdminErrorBoundary
            onReset={() => {
              setSelectedWorkerEid(null);
              setAdminSidebarOption('Active');
            }}
          >
            {renderActiveSection()}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
};
