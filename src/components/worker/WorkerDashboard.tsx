import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkerTab, Task } from '../../types';
import {
  Home,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Wallet,
  CreditCard,
  Send,
  ExternalLink,
  ShieldCheck,
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Copy,
  LogOut,
  User,
  Users,
  Mail,
  Smartphone,
  Share2,
  ClipboardList,
  Gamepad2,
  Coins,
  TrendingUp,
  Award,
  Zap,
  ChevronRight,
  FileCheck,
  History,
  Lock,
  Search,
  Key,
  ShieldAlert,
  ArrowUpRight,
  Tag,
  Gift,
  HelpCircle,
  Trophy,
  Swords,
} from 'lucide-react';
import { GoogleLogo } from '../GoogleSignInModal';
import { TournamentSection } from '../tournament/TournamentSection';

export const WorkerDashboard: React.FC = () => {
  const {
    workerTab,
    setWorkerTab,
    currentWorker,
    tasks,
    tournaments,
    submissions,
    submitTaskProof,
    withdrawals,
    requestWithdrawal,
    submitAppeal,
    settings,
    setGoogleAuthModalOpen,
    logoutGoogle,
    logout,
    redeemVoucher,
    requestRoleChange,
    isFirestoreConnected,
  } = useApp();

  const [copiedUserId, setCopiedUserId] = useState(false);

  // Hidden tap handler: 5 taps for Partner PIN prompt, 8 taps for Admin PIN prompt
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

  const handleCopyUserId = () => {
    if (!currentWorker?.uniqueUserId) return;
    navigator.clipboard.writeText(currentWorker.uniqueUserId);
    setCopiedUserId(true);
    setTimeout(() => setCopiedUserId(false), 2500);
  };

  // Determine active primary section based on workerTab
  const activeSection: 'Home' | 'Tasks' | 'Tournament' | 'Earnings' | 'Profile' = (() => {
    if (workerTab === 'Home') return 'Home';
    if (
      workerTab === 'Tasks' ||
      workerTab === 'Available Tasks' ||
      workerTab === 'My Submissions' ||
      workerTab === 'Submission Status'
    ) {
      return 'Tasks';
    }
    if (workerTab === 'Tournament') return 'Tournament';
    if (
      workerTab === 'Earnings' ||
      workerTab === 'Withdraw' ||
      workerTab === 'Withdrawal History' ||
      workerTab === 'Income in INR' ||
      workerTab === 'Available Balance'
    ) {
      return 'Earnings';
    }
    if (workerTab === 'Profile') return 'Profile';
    return 'Home';
  })();

  // Tasks Sub-tab: Available vs Submissions
  const [tasksSubView, setTasksSubView] = useState<'available' | 'submissions'>(
    workerTab === 'My Submissions' ? 'submissions' : 'available'
  );

  // Earnings Sub-tab: Request Payout vs History
  const [earningsSubView, setEarningsSubView] = useState<'payout' | 'history'>(
    workerTab === 'Withdrawal History' ? 'history' : 'payout'
  );

  // Task Submission Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  const handleProofImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image or screenshot file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('The uploaded image exceeds 4MB. Please select a smaller screenshot.');
      return;
    }

    setProofFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProofImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Category and Search filter
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState<number>(250);
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'Bank Transfer' | 'Paytm'>('UPI');
  const [withdrawDetails, setWithdrawDetails] = useState('worker@okhdfcbank');
  const [withdrawFeedback, setWithdrawFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Appeal Modal
  const [appealingSubId, setAppealingSubId] = useState<string | null>(null);
  const [appealNotes, setAppealNotes] = useState('');

  // Voucher redemption
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherFeedback, setVoucherFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleRedeemVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCodeInput.trim()) return;
    const res = redeemVoucher(voucherCodeInput.trim());
    setVoucherFeedback(res);
    if (res.success) {
      setVoucherCodeInput('');
    }
    setTimeout(() => setVoucherFeedback(null), 4000);
  };

  // Submissions and Withdrawals for this worker
  const mySubmissions = submissions.filter(
    (s) =>
      s.workerId === currentWorker.id ||
      (currentWorker.email && s.workerEmail?.toLowerCase() === currentWorker.email.toLowerCase())
  );
  const myWithdrawals = withdrawals.filter(
    (w) =>
      w.role === 'worker' &&
      (w.userId === currentWorker.id ||
        (currentWorker.name && w.userName.toLowerCase() === currentWorker.name.toLowerCase()))
  );

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesCategory =
      categoryFilter === 'All' || t.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Top featured tasks for Home tab
  const featuredTasks = tasks.slice(0, 3);

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !proofText.trim()) return;

    const res = submitTaskProof(
      selectedTask.id,
      proofText,
      undefined,
      proofFileName || (proofImage ? 'screenshot.png' : undefined),
      secretCode || undefined,
      proofImage || undefined
    );

    if (res.success) {
      setSubmissionSuccess(res.message);
      setSelectedTask(null);
      setProofText('');
      setProofImage(null);
      setProofFileName('');
      setSecretCode('');
      setTimeout(() => setSubmissionSuccess(null), 4000);
    } else {
      alert(res.message);
    }
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestWithdrawal(Number(withdrawAmount), withdrawMethod, withdrawDetails, 'worker');
    setWithdrawFeedback(res);
    setTimeout(() => setWithdrawFeedback(null), 4000);
  };

  const handleFileAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealingSubId || !appealNotes.trim()) return;
    submitAppeal(appealingSubId, appealNotes);
    setAppealingSubId(null);
    setAppealNotes('');
    alert('Appeal filed successfully and routed to Admin Disputes Review Desk.');
  };

  // Helper for Category Icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Social Media':
        return <Share2 className="w-4 h-4 text-violet-400" />;
      case 'App Testing':
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'Survey & Research':
      case 'Surveys':
        return <ClipboardList className="w-4 h-4 text-amber-400" />;
      case 'Content Creation':
        return <Sparkles className="w-4 h-4 text-fuchsia-400" />;
      case 'Data Verification':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'Gaming & Offers':
        return <Gamepad2 className="w-4 h-4 text-rose-400" />;
      default:
        return <Briefcase className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-20 md:pb-6">
      {/* Top Floating App Bar / Navigation Switcher (Desktop Only - Mobile uses BottomNav) */}
      <div className="hidden md:flex bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] p-1.5 rounded-2xl items-center justify-between gap-2 shadow-xl shadow-black/40">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {/* Home Tab Button */}
          <button
            id="tab-btn-home"
            type="button"
            onClick={() => setWorkerTab('Home')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'Home'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 scale-102'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          {/* Tasks Tab Button */}
          <button
            id="tab-btn-tasks"
            type="button"
            onClick={() => {
              setWorkerTab('Tasks');
              setTasksSubView('available');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer relative ${
              activeSection === 'Tasks'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 scale-102'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Tasks</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSection === 'Tasks'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/[0.08] text-zinc-300'
              }`}
            >
              {tasks.length}
            </span>
          </button>

          {/* Tournament Tab Button */}
          <button
            id="tab-btn-tournament"
            type="button"
            onClick={() => setWorkerTab('Tournament')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer relative ${
              activeSection === 'Tournament'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-md shadow-orange-600/30 scale-102'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tournament</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSection === 'Tournament'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {tournaments.length}
            </span>
          </button>

          {/* Earnings Tab Button */}
          <button
            id="tab-btn-earnings"
            type="button"
            onClick={() => {
              setWorkerTab('Earnings');
              setEarningsSubView('payout');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'Earnings'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Earnings</span>
            <span className="text-[10px] font-mono text-emerald-300 font-bold hidden sm:inline">
              ₹{currentWorker.availableBalanceINR}
            </span>
          </button>

          {/* Profile Tab Button */}
          <button
            id="tab-btn-profile"
            type="button"
            onClick={() => setWorkerTab('Profile')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'Profile'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 scale-102'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>

        {/* Quick Balance Pill */}
        <div className="hidden sm:flex items-center gap-2 pr-2">
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl text-right flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-black text-emerald-400 font-mono">
              ₹{(Number(currentWorker?.availableBalanceINR ?? 0)).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {submissionSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-emerald-500/10 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{submissionSuccess}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 1: HOME TAB                                      */}
      {/* ======================================================== */}
      {activeSection === 'Home' && (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ease-out">
          {/* Hero Welcome Card */}
          <div className="bg-[#111726] rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div>
                  {/* Platform Badge */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                      TaskReward Pro
                    </span>
                  </div>

                  {/* Prominent Welcome User Header (Displays only 'Welcome User') */}
                  <button
                    id="welcome-user-heading-btn"
                    type="button"
                    onClick={handleWelcomeTap}
                    className="text-left select-none focus:outline-hidden cursor-pointer active:scale-98 transition-transform group"
                    title="Welcome User"
                  >
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                      Welcome User
                    </h1>
                  </button>

                  <p className="text-xs text-zinc-400 mt-1">
                    Complete tasks, verify submissions, and earn daily rewards directly in INR ₹.
                  </p>
                </div>

                {/* Quick Action Navigation Pills */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkerTab('Tasks');
                      setTasksSubView('available');
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2 hover:scale-102 cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Browse All Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWorkerTab('Earnings');
                      setEarningsSubView('payout');
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 font-black text-xs rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-2 hover:scale-102 cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Withdraw (₹)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkerTab('Tournament')}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-2 hover:scale-102 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Tournament Arena</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Three Metric Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Card 1: Available Balance */}
                <div className="bg-gradient-to-br from-emerald-950/70 via-[#102422] to-[#0e1724] border border-emerald-500/30 rounded-2xl p-5 shadow-xl shadow-emerald-950/30 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Coins className="w-4 h-4" />
                      <span>Available Balance</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                  <div className="text-3xl font-black text-emerald-300 font-mono tabular-nums mt-2">
                    ₹{(Number(currentWorker?.availableBalanceINR ?? 0)).toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-400/80 mt-2">
                    <span>Instant UPI / Bank settlement</span>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkerTab('Earnings');
                        setEarningsSubView('payout');
                      }}
                      className="text-xs font-bold text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
                    >
                      Withdraw →
                    </button>
                  </div>
                </div>

                {/* Card 2: Lifetime Income */}
                <div className="bg-[#141d30] border border-white/[0.08] rounded-2xl p-5 shadow-xl shadow-black/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span>Lifetime Earnings</span>
                    </span>
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      Disbursed
                    </span>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tabular-nums mt-2">
                    ₹{(Number(currentWorker?.totalEarnedINR ?? 0)).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-2 block">
                    Cumulative verified reward credits
                  </span>
                </div>

                {/* Card 3: Completed Tasks */}
                <div className="bg-[#141d30] border border-white/[0.08] rounded-2xl p-5 shadow-xl shadow-black/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Tasks Completed</span>
                    </span>
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Tier 1
                    </span>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tabular-nums mt-2">
                    {currentWorker.completedTasksCount}
                  </div>
                  <span className="text-[11px] text-cyan-400 mt-2 block font-medium">
                    Verified Contributor Status
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured & High-Priority Tasks Showcase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white tracking-tight">Featured Opportunities</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWorkerTab('Tasks');
                  setTasksSubView('available');
                }}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View All ({tasks.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-5 shadow-xl shadow-black/30 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                        {getCategoryIcon(task.category)}
                        <span>{task.category}</span>
                      </span>
                      <span className="text-sm font-black text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                        ₹{task.rewardINR}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {task.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      Slots: <strong className="text-zinc-200">{task.completedSlots}</strong>/{task.totalSlots}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTask(task);
                        setProofText('');
                        setProofImage(null);
                        setProofFileName('');
                        setSecretCode('');
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                    >
                      <span>Start Task</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Secret Voucher Redemption & Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Voucher Card */}
            <div className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl shadow-black/20 space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Redeem Secret Voucher</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Got a promotional code from a partner or campaign? Enter it below to claim instant INR ₹ rewards.
              </p>

              {voucherFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    voucherFeedback.success
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {voucherFeedback.message}
                </div>
              )}

              <form onSubmit={handleRedeemVoucher} className="space-y-3">
                <div className="relative">
                  <Tag className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (e.g. WELCOME100)"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] text-zinc-100 rounded-xl font-mono text-xs uppercase placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  Claim Reward
                </button>
              </form>
            </div>

            {/* Recent Submissions Snapshot */}
            <div className="lg:col-span-2 bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl shadow-black/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Recent Task Submissions</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWorkerTab('Tasks');
                    setTasksSubView('submissions');
                  }}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  View All ({mySubmissions.length}) →
                </button>
              </div>

              <div className="space-y-2.5">
                {mySubmissions.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    You haven't submitted any tasks yet. Head over to the Tasks tab to complete your first task!
                  </div>
                ) : (
                  mySubmissions.slice(0, 3).map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-200 line-clamp-1">{sub.taskTitle}</div>
                          <span className="text-[10px] text-zinc-500 font-mono">{sub.submittedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400 font-mono">₹{sub.rewardINR}</span>
                        {sub.status === 'submitted' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            Submitted
                          </span>
                        )}
                        {sub.status === 'under_review' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            In Review
                          </span>
                        )}
                        {sub.status === 'approved' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Approved
                          </span>
                        )}
                        {sub.status === 'rejected' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            Rejected
                          </span>
                        )}
                        {sub.status === 'on_hold' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            On Hold
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: TOURNAMENT TAB                                */}
      {/* ======================================================== */}
      {activeSection === 'Tournament' && <TournamentSection />}

      {/* ======================================================== */}
      {/* SECTION 3: TASKS TAB                                     */}
      {/* ======================================================== */}
      {activeSection === 'Tasks' && (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ease-out">
          {/* Header & Sub-Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Tasks &amp; Verification Hub</h2>
              <p className="text-xs text-zinc-400">
                Explore available tasks, verify completion criteria, and track your ongoing reviews.
              </p>
            </div>

            {/* Sub-view switcher */}
            <div className="flex items-center gap-1.5 bg-[#111726] border border-white/[0.08] p-1 rounded-xl self-start sm:self-auto shadow-md">
              <button
                type="button"
                onClick={() => setTasksSubView('available')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tasksSubView === 'available'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Available Tasks ({filteredTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTasksSubView('submissions')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tasksSubView === 'submissions'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                My Submissions ({mySubmissions.length})
              </button>
            </div>
          </div>

          {/* Sub-View 1: Available Tasks */}
          {tasksSubView === 'available' && (
            <div className="space-y-5">
              {/* Search & Category Filter Pills */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks by title, keywords, or requirements..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#111726]/80 border border-white/[0.08] text-zinc-100 rounded-xl text-xs placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-500 shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x select-none">
                  {[
                    'All',
                    'Social Media',
                    'App Testing',
                    'Survey & Research',
                    'Content Creation',
                    'Data Verification',
                    'Gaming & Offers',
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border active:scale-95 touch-manipulation select-none cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm scale-102'
                          : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTasks.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-zinc-500 bg-[#111726]/40 border border-white/[0.06] rounded-2xl">
                    <Briefcase className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-zinc-400">No tasks found matching your filter.</p>
                    <p className="text-xs text-zinc-500 mt-1">Try resetting the category or search query.</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-5 shadow-xl shadow-black/25 flex flex-col justify-between transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                            {getCategoryIcon(task.category)}
                            <span>{task.category}</span>
                          </span>
                          <span className="text-sm font-black text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                            ₹{task.rewardINR}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors">
                            {task.title}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Task Link external access if present */}
                        {task.taskLink && (
                          <a
                            href={task.taskLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <span>Open Task Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-[11px] space-y-1.5">
                          <div className="flex items-center justify-between text-zinc-400">
                            <span>Proof Required:</span>
                            <strong className="text-zinc-200">{task.proofType}</strong>
                          </div>
                          <div className="flex items-center justify-between text-zinc-400">
                            <span>Est. Time:</span>
                            <strong className="text-zinc-200">~{task.estimatedMinutes || 5} mins</strong>
                          </div>
                          {task.secretKey && (
                            <div className="flex items-center gap-1 text-amber-400 font-medium">
                              <Key className="w-3 h-3" />
                              <span>Secret code verification enabled</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between">
                        <div className="text-[11px] text-zinc-400">
                          Slots: <strong className="text-zinc-200">{task.completedSlots}</strong>/{task.totalSlots}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTask(task);
                            setProofText('');
                            setProofImage(null);
                            setProofFileName('');
                            setSecretCode('');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-cyan-600/20 active:scale-95 cursor-pointer"
                        >
                          Start Task &amp; Submit
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Sub-View 2: My Submissions */}
          {tasksSubView === 'submissions' && (
            <div className="space-y-4">
              <div className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.03] border-b border-white/[0.08] text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Task</th>
                        <th className="py-3 px-4">Proof Snapshot</th>
                        <th className="py-3 px-4">Reward</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Submitted At</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {mySubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-zinc-500">
                            No submission history found for this worker account.
                          </td>
                        </tr>
                      ) : (
                        mySubmissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-zinc-100 max-w-xs">
                              <div>{sub.taskTitle}</div>
                              {sub.assignedPartnerName && (
                                <span className="text-[10px] text-zinc-400 block font-normal">
                                  Reviewer: {sub.assignedPartnerName}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 max-w-sm">
                              <p className="text-zinc-300 line-clamp-1 text-[11px]">{sub.proofText}</p>
                              {sub.proofImage && (
                                <div className="mt-1 flex items-center gap-2">
                                  <a
                                    href={sub.proofImage}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group relative inline-block border border-white/[0.1] rounded-lg overflow-hidden bg-black/40 shrink-0"
                                    title="Click to view full screenshot"
                                  >
                                    <img
                                      src={sub.proofImage}
                                      alt="Proof thumbnail"
                                      className="w-10 h-10 object-cover hover:opacity-80 transition-opacity"
                                    />
                                  </a>
                                  <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]">
                                    {sub.proofFileName || 'screenshot.png'}
                                  </span>
                                </div>
                              )}
                              {!sub.proofImage && sub.proofFileName && (
                                <span className="text-[10px] text-cyan-400 font-mono block">📎 {sub.proofFileName}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                                ₹{sub.rewardINR}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {sub.status === 'submitted' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                  <Clock className="w-3 h-3" /> Submitted
                                </span>
                              )}
                              {sub.status === 'under_review' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  <Clock className="w-3 h-3" /> In Review
                                </span>
                              )}
                              {sub.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Approved
                                </span>
                              )}
                              {sub.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                  <XCircle className="w-3 h-3" /> Rejected
                                </span>
                              )}
                              {sub.status === 'on_hold' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                  <AlertTriangle className="w-3 h-3" /> On Hold
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                              {sub.submittedAt}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              {sub.status === 'rejected' && !sub.appealStatus && (
                                <button
                                  type="button"
                                  onClick={() => setAppealingSubId(sub.id)}
                                  className="px-3 py-1 text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg transition-colors"
                                >
                                  File Appeal
                                </button>
                              )}
                              {sub.appealStatus && (
                                <span className="text-[10px] text-amber-400 font-mono">
                                  Appeal: {sub.appealStatus}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: EARNINGS TAB                                  */}
      {/* ======================================================== */}
      {activeSection === 'Earnings' && (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ease-out">
          {/* Header & Sub-Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Earnings &amp; Payouts Console</h2>
              <p className="text-xs text-zinc-400">
                Manage your available balance, request instant INR withdrawals, and view financial history.
              </p>
            </div>

            {/* Sub-view switcher */}
            <div className="flex items-center gap-1.5 bg-[#111726] border border-white/[0.08] p-1 rounded-xl self-start sm:self-auto shadow-md">
              <button
                type="button"
                onClick={() => setEarningsSubView('payout')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  earningsSubView === 'payout'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Request Payout
              </button>
              <button
                type="button"
                onClick={() => setEarningsSubView('history')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  earningsSubView === 'history'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Withdrawal History ({myWithdrawals.length})
              </button>
            </div>
          </div>

          {/* Balance Hero Card */}
          <div className="bg-gradient-to-br from-emerald-950/70 via-[#102422] to-[#0e1724] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  Ready to Withdraw
                </span>
                <div className="text-4xl sm:text-5xl font-black text-emerald-300 font-mono tabular-nums tracking-tight">
                  ₹{(Number(currentWorker?.availableBalanceINR ?? 0)).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-emerald-400/80 mt-2">
                  Minimum withdrawal threshold: <strong>₹100</strong> • 0% platform processing fees.
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="bg-black/30 border border-white/[0.08] rounded-2xl p-4 text-left">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Lifetime Income</span>
                  <span className="text-xl font-bold text-white font-mono">
                    ₹{(Number(currentWorker?.totalEarnedINR ?? 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-black/30 border border-white/[0.08] rounded-2xl p-4 text-left">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Settled Requests</span>
                  <span className="text-xl font-bold text-white font-mono">
                    {myWithdrawals.filter((w) => w.status === 'completed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-View 1: Request Payout Form */}
          {earningsSubView === 'payout' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Container */}
              <div className="lg:col-span-2 bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl shadow-black/20 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Initiate Withdrawal Request</h3>
                    <p className="text-[11px] text-zinc-400">Withdraw your earned INR directly to UPI, Bank, or Paytm.</p>
                  </div>
                </div>

                {withdrawFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold ${
                      withdrawFeedback.success
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {withdrawFeedback.message}
                  </div>
                )}

                <form onSubmit={handleWithdrawal} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-zinc-300 block mb-1">
                      Withdrawal Amount (INR ₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-zinc-500">₹</span>
                      <input
                        type="number"
                        min="100"
                        required
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl font-bold text-zinc-100 font-mono text-sm focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    {/* Quick Amount Preset Chips */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">Quick Set:</span>
                      {[100, 250, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setWithdrawAmount(amt)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                        >
                          ₹{amt}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(Math.max(100, currentWorker.availableBalanceINR))}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 hover:bg-emerald-500/20 transition-colors font-bold"
                      >
                        Max (₹{currentWorker.availableBalanceINR})
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-300 block mb-1">Select Payout Method *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['UPI', 'Bank Transfer', 'Paytm'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setWithdrawMethod(method);
                            if (method === 'UPI') setWithdrawDetails('worker@okhdfcbank');
                            if (method === 'Bank Transfer') setWithdrawDetails('A/C: 123456789012, IFSC: HDFC0001234');
                            if (method === 'Paytm') setWithdrawDetails('Paytm Mobile: 9876543210');
                          }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            withdrawMethod === method
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold shadow-md shadow-emerald-500/10'
                              : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          <span className="block text-xs">{method}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-300 block mb-1">
                      Account / UPI Destination Details *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={withdrawDetails}
                      onChange={(e) => setWithdrawDetails(e.target.value)}
                      placeholder="e.g. UPI ID (username@upi) or Bank Account Number + IFSC Code..."
                      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] text-zinc-100 rounded-xl font-mono text-xs focus:outline-hidden focus:border-emerald-500 placeholder:text-zinc-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={currentWorker.availableBalanceINR < withdrawAmount || withdrawAmount < 100}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Payout Request (₹{withdrawAmount})</span>
                  </button>
                </form>
              </div>

              {/* Policy & FAQ Widget */}
              <div className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl shadow-black/20 space-y-4 text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Payout Guidelines &amp; SLAs</span>
                </div>

                <div className="space-y-3 text-zinc-400 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>Minimum threshold is strictly ₹100 for all payment channels.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>UPI settlements process within 1-2 hours upon verification.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>NEFT / IMPS transfers process during standard banking hours.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>Rejected payouts are 100% refunded back to your Available Balance.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-View 2: Withdrawal History */}
          {earningsSubView === 'history' && (
            <div className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] border-b border-white/[0.08] text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Destination Details</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Requested At</th>
                      <th className="py-3 px-4 text-right">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {myWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-zinc-500">
                          No previous payout requests recorded.
                        </td>
                      </tr>
                    ) : (
                      myWithdrawals.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                              ₹{(Number(item?.amountINR ?? 0)).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-200">{item.method}</td>
                          <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px] max-w-xs truncate">
                            {item.payoutDetails}
                          </td>
                          <td className="py-3.5 px-4">
                            {item.status === 'pending' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Pending Approval
                              </span>
                            )}
                            {item.status === 'approved' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                Approved &amp; Queued
                              </span>
                            )}
                            {item.status === 'completed' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                Settled
                              </span>
                            )}
                            {item.status === 'rejected' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                Refunded
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                            {item.requestedAt}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[11px] text-zinc-400">
                            {item.transactionRef || 'Processing'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: PROFILE TAB                                   */}
      {/* ======================================================== */}
      {activeSection === 'Profile' && (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ease-out">
          {/* Header */}
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Account &amp; Security Profile</h2>
            <p className="text-xs text-zinc-400">
              Manage your personal identity, linked Google account credentials, and platform security.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Card */}
            <div className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/30 space-y-6 text-center flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/25 flex items-center justify-center">
                  <div className="w-full h-full bg-[#0d1322] rounded-[22px] flex items-center justify-center text-white text-2xl font-black">
                    {currentWorker.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                {currentWorker.googleAccount && (
                  <div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white p-1 shadow-md flex items-center justify-center"
                    title="Google Account Linked"
                  >
                    <GoogleLogo className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{currentWorker.name}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {currentWorker.googleAccount?.email || currentWorker.email}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Verified Contributor
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    Tier 1
                  </span>
                </div>
              </div>

              {/* Permanent Unique User ID (UID) */}
              <div className="w-full bg-white/[0.04] border border-cyan-500/20 rounded-2xl p-4.5 text-left space-y-2.5 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Permanent User ID (UID)</span>
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Firestore ID
                  </span>
                </div>
                <div className="flex items-center justify-between bg-black/50 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-cyan-300">
                  <span id="profile-unique-user-id">{currentWorker.uniqueUserId}</span>
                  <button
                    id="profile-copy-uid-btn"
                    type="button"
                    onClick={handleCopyUserId}
                    className="text-zinc-400 hover:text-cyan-400 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-sans font-semibold"
                    title="Copy Unique User ID"
                  >
                    {copiedUserId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy UID</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  This permanent UID authoritatively links your balance, submissions, and cloud database profile.
                </p>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={logout}
                className="w-full py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of TaskReward Pro</span>
              </button>
            </div>

            {/* Right Column: Google Account, Security, & Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Google Sync Management Card */}
              <div className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl shadow-black/20 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                    <GoogleLogo className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Google Identity Synchronization</h3>
                    <p className="text-[11px] text-zinc-400">Secure single sign-on backed by Firebase Authentication.</p>
                  </div>
                </div>

                {currentWorker.googleAccount ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">Synchronized Account</span>
                      <span className="font-mono text-xs font-bold text-zinc-100">{currentWorker.googleAccount.email}</span>
                      <span className="text-[11px] text-zinc-500 block mt-0.5">
                        Firebase Auth UID: {currentWorker.googleAccount.googleId.slice(0, 12)}...
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGoogleAuthModalOpen(true)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-colors cursor-pointer"
                      >
                        Switch Account
                      </button>
                      <button
                        type="button"
                        onClick={logoutGoogle}
                        className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] border border-white/[0.08] rounded-xl transition-colors cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <span className="text-xs font-semibold text-white">No Google account linked yet.</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Connect with Google to persist your balance across devices and browsers.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGoogleAuthModalOpen(true)}
                      className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs rounded-xl border border-white/[0.15] transition-all flex items-center gap-2 shrink-0 active:scale-98 cursor-pointer"
                    >
                      <GoogleLogo className="w-4 h-4" />
                      <span>Link Google Account</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Performance Statistics Grid */}
              <div className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl shadow-black/20 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-white/[0.08] pb-3">
                  Account Statistics &amp; Metrics
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tasks Done</span>
                    <span className="text-xl font-bold text-white font-mono mt-1 block">
                      {currentWorker.completedTasksCount}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Earned INR</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
                      ₹{currentWorker.totalEarnedINR}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Submissions</span>
                    <span className="text-xl font-bold text-cyan-400 font-mono mt-1 block">
                      {mySubmissions.length}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Approval Rate</span>
                    <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
                      {mySubmissions.length > 0
                        ? `${Math.round(
                            (mySubmissions.filter((s) => s.status === 'approved').length / mySubmissions.length) * 100
                          )}%`
                        : '100%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* App & Security Status */}
              <div className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl shadow-black/20 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>App Security &amp; Protocol</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">App Client</span>
                    <span className="text-xs font-semibold text-zinc-200 mt-0.5 block">Mobile APK Ready</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Cloud Database</span>
                    <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">Firestore 256-bit</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                  Your rewards ledger, submissions, and identity verification keys are securely managed with real-time cloud synchronization.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SUBMIT TASK PROOF                                 */}
      {/* ======================================================== */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#111726] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white/[0.12] text-xs text-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">
                  Task Submission Terminal
                </span>
                <h3 className="text-base font-bold text-white">{selectedTask.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Reward for Completion:</span>
                <span className="font-extrabold text-emerald-400 font-mono text-sm">
                  ₹{selectedTask.rewardINR}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Proof Category:</span>
                <span className="font-semibold text-zinc-200">{selectedTask.proofType}</span>
              </div>
              <div className="text-[11px] text-zinc-400 pt-1 border-t border-white/[0.06]">
                <strong>Instructions:</strong> {selectedTask.proofInstructions}
              </div>
            </div>

            {selectedTask.taskLink && (
              <a
                href={selectedTask.taskLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              >
                <span className="font-semibold text-xs">Open External Task / Campaign URL</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">
                  Proof Description &amp; Verification Details *
                </label>
                <textarea
                  rows={3}
                  required
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Describe your completion (e.g. username used, confirmation ID, survey completion code)..."
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] text-zinc-100 rounded-xl text-xs placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Proof Image Upload File Input */}
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">
                  Upload Screenshot / Image Proof (Recommended)
                </label>
                <div className="relative border-2 border-dashed border-white/[0.12] rounded-xl p-4 text-center bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {proofImage ? (
                    <div className="space-y-2">
                      <img
                        src={proofImage}
                        alt="Proof Preview"
                        className="max-h-36 mx-auto rounded-lg object-contain border border-white/[0.1]"
                      />
                      <span className="text-[11px] text-emerald-400 font-mono block">
                        ✓ {proofFileName} selected
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-zinc-400 mx-auto" />
                      <span className="text-xs text-zinc-200 font-semibold block">
                        Click or drag screenshot here
                      </span>
                      <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP up to 4MB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Secret Code Verification if required */}
              {selectedTask.secretKey && (
                <div>
                  <label className="font-semibold text-amber-300 block mb-1">
                    Campaign Secret Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="Enter secret code provided upon completing the task..."
                    className="w-full px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-200 font-mono text-xs rounded-xl focus:outline-hidden focus:border-amber-400 placeholder:text-amber-500/60"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/25 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Verification Proof</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: FILE APPEAL FOR REJECTED SUBMISSION               */}
      {/* ======================================================== */}
      {appealingSubId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#111726] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-white/[0.12] text-xs text-zinc-100">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-white">File Submission Appeal</h3>
              <button
                type="button"
                onClick={() => setAppealingSubId(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Explain why this submission was mistakenly rejected. An Admin will manually re-audit your proof.
            </p>

            <form onSubmit={handleFileAppealSubmit} className="space-y-4">
              <textarea
                rows={4}
                required
                value={appealNotes}
                onChange={(e) => setAppealNotes(e.target.value)}
                placeholder="Clarification or additional proof context..."
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] text-zinc-100 rounded-xl text-xs placeholder:text-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
              >
                Submit Appeal to Admin Desk
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
