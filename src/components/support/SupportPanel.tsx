import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CustomerSupportQuery,
  SupportQueryCategory,
  SupportQueryPriority,
  SupportQueryStatus,
  SupportChatMessage,
} from '../../types';
import {
  Headphones,
  LifeBuoy,
  X,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  MessageSquare,
  Send,
  User,
  Shield,
  Coins,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  UserCheck,
  RotateCcw,
  Zap,
  ExternalLink,
  Wallet,
  Phone,
  Mail,
  FileText,
  BadgeAlert,
  SlidersHorizontal,
} from 'lucide-react';

export const SupportPanel: React.FC = () => {
  const {
    customerQueries,
    createCustomerQuery,
    addCustomerQueryMessage,
    updateCustomerQueryStatus,
    resolveCustomerQuery,
    isSupportPanelOpen,
    setIsSupportPanelOpen,
    workers,
    roleSecurityPins,
    setAdminSidebarOption,
    setCurrentRole,
    notify,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupportQueryStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | SupportQueryPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SupportQueryCategory>('all');

  // Selected query for inspector
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(() => {
    return customerQueries.length > 0 ? customerQueries[0].id : null;
  });

  // Reply message composer state
  const [replyText, setReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('Agent Maya (Senior Ops)');

  // Compensation credit modal/input state
  const [compAmount, setCompAmount] = useState('');
  const [compReason, setCompReason] = useState('');
  const [showCompForm, setShowCompForm] = useState(false);

  // New ticket modal state
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketWorkerId, setNewTicketWorkerId] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<SupportQueryCategory>('earnings_withdrawals');
  const [newTicketPriority, setNewTicketPriority] = useState<SupportQueryPriority>('urgent');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');


  // Selected query object with robust safety checks
  const activeQuery = useMemo(() => {
    if (!customerQueries || customerQueries.length === 0) return null;
    return customerQueries.find((q) => q.id === selectedQueryId) || customerQueries[0] || null;
  }, [customerQueries, selectedQueryId]);

  // Matched customer profile for active query
  const activeCustomer = useMemo(() => {
    if (!activeQuery || !workers) return null;
    return workers.find(
      (w) =>
        w.id === activeQuery.userId ||
        w.uniqueUserId === activeQuery.userId ||
        w.eid === activeQuery.userEid
    ) || null;
  }, [activeQuery, workers]);

  // Filtered queries list
  const filteredQueries = useMemo(() => {
    return customerQueries.filter((q) => {
      const matchesSearch =
        q.queryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.userEid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || q.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [customerQueries, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Telemetry KPIs
  const totalQueriesCount = customerQueries.length;
  const openQueriesCount = customerQueries.filter((q) => q.status === 'open').length;
  const inProgressCount = customerQueries.filter((q) => q.status === 'in_progress').length;
  const resolvedCount = customerQueries.filter((q) => q.status === 'resolved' || q.status === 'closed').length;
  const urgentCount = customerQueries.filter((q) => q.priority === 'urgent' && q.status !== 'resolved').length;
  const totalCompensationSum = customerQueries.reduce((acc, q) => acc + (q.compensationINR || 0), 0);

  // Canned quick replies
  const CANNED_REPLIES = [
    {
      title: 'UPI Payout Cleared',
      text: 'Your UPI payout request has been verified and settled via our instant IMPS banking gateway. Funds will reflect in your account immediately.',
    },
    {
      title: 'Task Approved',
      text: 'Our verification team has audited your submission proof. The task has been approved and the full INR reward has been credited to your balance.',
    },
    {
      title: 'Tournament Credentials',
      text: 'Custom room credentials have been updated and synced. Please check your tournament card for the latest Room ID and access password.',
    },
    {
      title: 'Deposit UTR Confirmed',
      text: 'Your payment deposit UTR has been matched against our banking statement. Your wallet balance has been credited with the deposit amount.',
    },
  ];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuery || !replyText.trim()) return;
    addCustomerQueryMessage(activeQuery.id, replyText.trim(), 'support_agent', selectedAgent);
    setReplyText('');
  };

  const handleApplyCannedReply = (text: string) => {
    setReplyText(text);
  };

  const handleSaveInternalNote = () => {
    if (!activeQuery || !internalNoteText.trim()) return;
    updateCustomerQueryStatus(
      activeQuery.id,
      activeQuery.status,
      selectedAgent,
      internalNoteText.trim()
    );
    notify('Internal staff note saved to ticket.');
    setInternalNoteText('');
  };

  const handleIssueCompensation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuery) return;
    const amount = Number(compAmount);
    if (isNaN(amount) || amount <= 0) {
      notify('Please enter a valid compensation amount in INR.');
      return;
    }

    resolveCustomerQuery(
      activeQuery.id,
      compReason.trim() || 'Goodwill resolution compensation approved by 24/7 support',
      amount,
      selectedAgent
    );
    setShowCompForm(false);
    setCompAmount('');
    setCompReason('');
  };

  const handleCreateNewTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketDesc.trim()) {
      notify('Please enter both subject and description.');
      return;
    }

    const targetWorker = workers.find((w) => w.id === newTicketWorkerId) || workers[0];

    const created = createCustomerQuery({
      userId: targetWorker.id,
      userEid: targetWorker.eid || 'EID-1001',
      userName: targetWorker.name,
      userEmail: targetWorker.email,
      userPhone: targetWorker.phone,
      category: newTicketCategory,
      priority: newTicketPriority,
      subject: newTicketSubject.trim(),
      description: newTicketDesc.trim(),
      slaDeadlineMinutes: 1440,
      assignedAgent: selectedAgent,
    });

    setSelectedQueryId(created.id);
    setShowNewTicketModal(false);
    setNewTicketSubject('');
    setNewTicketDesc('');
  };

  const handleSimulateIncomingQuery = () => {
    const randomWorker = workers[Math.floor(Math.random() * workers.length)] || workers[0];
    const scenarios = [
      {
        cat: 'earnings_withdrawals' as SupportQueryCategory,
        prio: 'urgent' as SupportQueryPriority,
        sub: 'Pending withdrawal ₹650 to UPI ID',
        desc: 'Hello 24/7 desk! Payout of ₹650 requested 20 minutes ago. Balance deducted but pending status.',
      },
      {
        cat: 'tasks_submissions' as SupportQueryCategory,
        prio: 'high' as SupportQueryPriority,
        sub: 'Video upload verification query',
        desc: 'Submitted task #102 yesterday. Requesting review status so I can take on new available slots.',
      },
      {
        cat: 'deposits_payments' as SupportQueryCategory,
        prio: 'urgent' as SupportQueryPriority,
        sub: 'Deposit verification UTR 99182319028',
        desc: 'Deposit of ₹150 for tournament entry pass completed via PhonePe. Please verify UTR.',
      },
    ];

    const pick = scenarios[Math.floor(Math.random() * scenarios.length)];

    const created = createCustomerQuery({
      userId: randomWorker.id,
      userEid: randomWorker.eid || 'EID-1001',
      userName: randomWorker.name,
      userEmail: randomWorker.email,
      userPhone: randomWorker.phone,
      category: pick.cat,
      priority: pick.prio,
      subject: pick.sub,
      description: pick.desc,
      slaDeadlineMinutes: 1440,
      assignedAgent: selectedAgent,
    });

    setSelectedQueryId(created.id);
    notify(`Simulated incoming 24/7 user query generated: ${created.queryNumber}`);
  };

  const getPriorityBadge = (prio: SupportQueryPriority) => {
    switch (prio) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
            <span>Urgent</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>High</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Medium</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
            <span>Low</span>
          </span>
        );
    }
  };

  const getStatusBadge = (st: SupportQueryStatus) => {
    switch (st) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>Open</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>In Progress</span>
          </span>
        );
      case 'waiting_user':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">
            <span>Awaiting User</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Resolved</span>
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 font-mono">
            <span>Closed</span>
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: SupportQueryCategory) => {
    switch (cat) {
      case 'earnings_withdrawals':
        return 'Earnings & Withdrawals';
      case 'tasks_submissions':
        return 'Tasks & Submissions';
      case 'esports_tournaments':
        return 'Esports & Tournaments';
      case 'account_verification':
        return 'Account & Verification';
      case 'deposits_payments':
        return 'Deposits & Payments';
      case 'technical_bug':
        return 'Technical Bug';
      default:
        return 'General Query';
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#090d16] text-zinc-100 flex flex-col font-sans overflow-hidden animate-in fade-in duration-200">
      {/* 24/7 Top Ops Header Bar */}
      <header className="bg-[#0e1422] border-b border-white/[0.08] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-md shadow-cyan-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1424] rounded-[14px] flex items-center justify-center text-cyan-400">
              <Headphones className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>24/7 Customer Support Operations Desk</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live 24/7 SLA Active</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Hidden 5-tap access point verified • PIN managed in Admin Panel
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Support Staff Badge */}
          <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs text-zinc-300 font-medium">On Duty:</span>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-transparent text-xs font-bold text-cyan-300 focus:outline-hidden cursor-pointer"
            >
              <option value="Agent Maya (Senior Ops)" className="bg-[#111726] text-white">Agent Maya (Senior Ops)</option>
              <option value="Agent Rahul (QA Desk)" className="bg-[#111726] text-white">Agent Rahul (QA Desk)</option>
              <option value="Agent Priya (Finance)" className="bg-[#111726] text-white">Agent Priya (Finance)</option>
              <option value="Staff Lead (Super Admin)" className="bg-[#111726] text-white">Staff Lead (Super Admin)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSimulateIncomingQuery}
            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Simulate incoming customer query"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Simulate Incoming Query</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewTicketModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/30"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </button>

          {/* Close Panel Button */}
          <button
            type="button"
            onClick={() => setIsSupportPanelOpen(false)}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 hover:text-rose-300 text-zinc-400 transition-colors cursor-pointer border border-white/[0.08]"
            title="Exit Support Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* KPI Stats Ribbon */}
      <div className="bg-[#0b101c] border-b border-white/[0.06] px-4 sm:px-6 py-3 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Total Queries</span>
            <span className="text-lg font-black text-white font-mono">{totalQueriesCount}</span>
          </div>
          <div className="bg-rose-500/[0.06] border border-rose-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-rose-300 uppercase font-bold tracking-wider block">Open / Action Req.</span>
            <span className="text-lg font-black text-rose-400 font-mono">{openQueriesCount}</span>
          </div>
          <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider block">In Progress</span>
            <span className="text-lg font-black text-amber-400 font-mono">{inProgressCount}</span>
          </div>
          <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block">Resolved</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{resolvedCount}</span>
          </div>
          <div className="bg-rose-500/[0.06] border border-rose-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-rose-300 uppercase font-bold tracking-wider block">Urgent SLA Queue</span>
            <span className="text-lg font-black text-rose-400 font-mono flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-rose-400" />
              {urgentCount}
            </span>
          </div>
          <div className="bg-cyan-500/[0.06] border border-cyan-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-cyan-300 uppercase font-bold tracking-wider block">Goodwill Paid</span>
            <span className="text-lg font-black text-cyan-300 font-mono">₹{totalCompensationSum}</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column: Tickets Queue & Filters */}
        <div className="w-full md:w-96 lg:w-[420px] bg-[#0c121f] border-r border-white/[0.08] flex flex-col shrink-0 overflow-hidden">
          {/* Search & Filter Toolbar */}
          <div className="p-3.5 border-b border-white/[0.08] space-y-2.5 bg-[#0f1524]">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket #, user, email, keywords..."
                className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold no-scrollbar">
              {[
                { id: 'all', label: 'All Queries', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
                { id: 'open', label: 'New Queries', count: openQueriesCount, color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
                { id: 'in_progress', label: 'Pending', count: inProgressCount, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                { id: 'resolved', label: 'Resolved', count: resolvedCount, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-cyan-500 text-zinc-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/30'
                        : 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] border-white/[0.08]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-zinc-950 animate-pulse' : tab.id === 'open' ? 'bg-rose-400' : tab.id === 'in_progress' ? 'bg-amber-400' : tab.id === 'resolved' ? 'bg-emerald-400' : 'bg-zinc-400'}`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-white/[0.08] text-zinc-300'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Secondary Priority and Category dropdowns */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1 text-[11px] text-zinc-300 focus:outline-hidden focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1 text-[11px] text-zinc-300 focus:outline-hidden focus:border-cyan-400 cursor-pointer truncate"
              >
                <option value="all">All Categories</option>
                <option value="earnings_withdrawals">Earnings & Payouts</option>
                <option value="tasks_submissions">Tasks & Proofs</option>
                <option value="esports_tournaments">Esports & Gaming</option>
                <option value="deposits_payments">Deposits & UPI</option>
                <option value="account_verification">Account Verify</option>
                <option value="technical_bug">Technical Bug</option>
              </select>
            </div>
          </div>

          {/* Ticket Queue List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-2 space-y-1.5">
            {filteredQueries.length === 0 ? (
              <div className="p-8 text-center space-y-2 text-zinc-500">
                <LifeBuoy className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="text-xs">No support queries match the filters.</p>
              </div>
            ) : (
              filteredQueries.map((query) => {
                const isSelected = activeQuery?.id === query.id;
                return (
                  <div
                    key={query.id}
                    onClick={() => setSelectedQueryId(query.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-md shadow-cyan-950/40'
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-cyan-300">{query.queryNumber}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">({query.userEid})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getPriorityBadge(query.priority)}
                        {getStatusBadge(query.status)}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1 mb-1">
                      {query.subject}
                    </h4>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {query.description}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/[0.04] text-[10px] text-zinc-400 font-mono">
                      <span>{query.userName}</span>
                      <span className="flex items-center gap-1 text-cyan-400/80">
                        <Clock className="w-3 h-3" />
                        {query.updatedAt}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Management Inspector & Live Conversation Thread */}
        {activeQuery ? (
          <div className="flex-1 flex flex-col bg-[#0a0f1b] overflow-hidden">
            {/* Active Ticket Top Bar */}
            <div className="bg-[#0e1526] border-b border-white/[0.08] px-5 py-4 shrink-0 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-sm font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-lg">
                    {activeQuery.queryNumber}
                  </span>
                  <span className="text-xs text-zinc-400">•</span>
                  <span className="text-xs font-semibold text-zinc-300 bg-white/[0.05] px-2.5 py-0.5 rounded-lg">
                    {getCategoryLabel(activeQuery.category)}
                  </span>
                  {getPriorityBadge(activeQuery.priority)}
                  {getStatusBadge(activeQuery.status)}
                </div>
                <h2 className="text-lg font-black text-white tracking-tight mt-1">
                  {activeQuery.subject}
                </h2>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {activeQuery.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => setShowCompForm(!showCompForm)}
                    className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Issue Goodwill (₹)</span>
                  </button>
                )}

                <select
                  value={activeQuery.status}
                  onChange={(e) =>
                    updateCustomerQueryStatus(
                      activeQuery.id,
                      e.target.value as SupportQueryStatus,
                      selectedAgent
                    )
                  }
                  className="bg-black/50 border border-white/[0.15] text-xs font-bold text-white rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-cyan-400 cursor-pointer"
                >
                  <option value="open">Status: Open</option>
                  <option value="in_progress">Status: In Progress</option>
                  <option value="waiting_user">Status: Waiting for User</option>
                  <option value="resolved">Status: Resolved</option>
                  <option value="closed">Status: Closed</option>
                </select>

                {activeQuery.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() =>
                      resolveCustomerQuery(
                        activeQuery.id,
                        'Ticket resolved by 24/7 Operations Desk.',
                        undefined,
                        selectedAgent
                      )
                    }
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
            </div>

            {/* Compensation Credit Popover Banner */}
            {showCompForm && (
              <div className="bg-emerald-950/40 border-b border-emerald-500/30 p-4 shrink-0 animate-in fade-in duration-150">
                <form onSubmit={handleIssueCompensation} className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-300">Award Goodwill Payout:</span>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-zinc-400">₹</span>
                      <input
                        type="number"
                        min="1"
                        max="5000"
                        value={compAmount}
                        onChange={(e) => setCompAmount(e.target.value)}
                        placeholder="Amount (e.g. 100)"
                        className="pl-7 pr-3 py-1.5 bg-black/60 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold text-emerald-300 w-32 focus:outline-hidden focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={compReason}
                    onChange={(e) => setCompReason(e.target.value)}
                    placeholder="Reason (e.g. Payout delay gesture / Task appeal approved)"
                    className="flex-1 min-w-[200px] px-3 py-1.5 bg-black/60 border border-emerald-500/40 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-400"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Credit Wallet &amp; Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCompForm(false)}
                      className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Customer Snapshot Strip */}
            <div className="bg-[#0d1322] border-b border-white/[0.06] px-5 py-2.5 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeQuery.userName}</span>
                </span>
                <span className="text-zinc-400 font-mono">
                  UID: <span className="text-cyan-300 font-bold">{activeCustomer?.uniqueUserId || activeQuery.userId}</span>
                </span>
                <span className="text-zinc-400 font-mono">
                  E-ID: <span className="text-amber-300 font-bold">{activeQuery.userEid}</span>
                </span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Mail className="w-3 h-3" />
                  <span>{activeQuery.userEmail}</span>
                </span>
                {activeCustomer && (
                  <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    <Wallet className="w-3 h-3" />
                    <span>Balance: ₹{activeCustomer.availableBalanceINR}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <span className="text-zinc-500">Global 24/7 SLA Target:</span>
                <span className="text-cyan-300 font-bold">24 Hours Guaranteed (1440 mins)</span>
              </div>
            </div>

            {/* Middle: Conversation Thread Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Prominent Status Update Banner for Resolved Queries */}
              {(activeQuery.status === 'resolved' || activeQuery.status === 'closed') && (
                <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs shadow-lg shadow-emerald-950/40 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Your new query is resolved</h4>
                      <p className="text-[11px] text-emerald-300 mt-0.5">
                        {activeQuery.resolvedBy ? `Resolved by ${activeQuery.resolvedBy}` : 'Resolved by 24/7 Operations Support Desk'}
                        {activeQuery.compensationINR ? ` • Goodwill Payout Credited: ₹${activeQuery.compensationINR}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Query Resolved
                  </span>
                </div>
              )}

              {(activeQuery.messages || []).map((msg) => {
                const isUser = msg.sender === 'user';
                const isBot = msg.sender === 'system_bot';
                const isStaff = msg.sender === 'support_agent';

                if (isBot) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="max-w-lg bg-cyan-950/30 border border-cyan-500/20 rounded-2xl p-3 text-center space-y-1 shadow-sm">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-cyan-400 font-mono">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>{msg.senderName}</span>
                          <span className="text-zinc-500">• {msg.timestamp}</span>
                        </div>
                        <p className="text-xs text-cyan-200/90 leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-mono">
                      <span className={`font-bold ${isUser ? 'text-zinc-300' : 'text-emerald-400'}`}>
                        {msg.senderName}
                      </span>
                      {msg.senderRole && (
                        <span className="text-[10px] text-zinc-500">({msg.senderRole})</span>
                      )}
                      <span className="text-[10px] text-zinc-500">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-xl rounded-2xl p-4 shadow-md text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#141b2d] border border-white/[0.08] text-zinc-200 rounded-tl-xs'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-emerald-950/40'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom: Staff Reply Composer & Canned Templates */}
            <div className="bg-[#0e1526] border-t border-white/[0.08] p-4 shrink-0 space-y-3">
              {/* 1-Click Canned Quick Replies */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[10px] uppercase font-bold text-zinc-400 shrink-0 font-mono">
                  Quick Canned:
                </span>
                {CANNED_REPLIES.map((canned, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyCannedReply(canned.text)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-500/15 hover:border-cyan-500/30 border border-white/[0.06] text-[11px] text-zinc-300 hover:text-cyan-300 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {canned.title}
                  </button>
                ))}
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="flex gap-2">
                <div className="relative flex-1">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official 24/7 support response..."
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-400 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send Reply</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-zinc-500 text-center">
            <p className="text-sm">Select a ticket from the left queue to view details.</p>
          </div>
        )}
      </div>

      {/* Modal: Create Ticket On Behalf of User */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#111726] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Headphones className="w-4 h-4 text-cyan-400" />
                <span>Open Support Ticket on Behalf of User</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Select User / Player:</label>
                <select
                  value={newTicketWorkerId}
                  onChange={(e) => setNewTicketWorkerId(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/[0.1] rounded-xl text-white focus:outline-hidden focus:border-cyan-400"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id} className="bg-[#111726]">
                      {w.name} ({w.eid || w.uniqueUserId}) - {w.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Category:</label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/[0.1] rounded-xl text-white focus:outline-hidden focus:border-cyan-400"
                  >
                    <option value="earnings_withdrawals">Earnings &amp; Payouts</option>
                    <option value="tasks_submissions">Tasks &amp; Submissions</option>
                    <option value="esports_tournaments">Esports &amp; Tournaments</option>
                    <option value="deposits_payments">Deposits &amp; UPI</option>
                    <option value="account_verification">Account &amp; Security</option>
                    <option value="technical_bug">Technical Bug</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Priority:</label>
                  <select
                    value={newTicketPriority}
                    onChange={(e) => setNewTicketPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/[0.1] rounded-xl text-white focus:outline-hidden focus:border-cyan-400"
                  >
                    <option value="urgent">Urgent (24h Guaranteed SLA)</option>
                    <option value="high">High (24h Guaranteed SLA)</option>
                    <option value="medium">Medium (24h Guaranteed SLA)</option>
                    <option value="low">Low (24h Guaranteed SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Subject Title:</label>
                <input
                  type="text"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="e.g. UPI Payout verification delay"
                  className="w-full px-3 py-2 bg-black/50 border border-white/[0.1] rounded-xl text-white focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Detailed Description:</label>
                <textarea
                  rows={3}
                  value={newTicketDesc}
                  onChange={(e) => setNewTicketDesc(e.target.value)}
                  placeholder="Describe the issue reported by the user..."
                  className="w-full px-3 py-2 bg-black/50 border border-white/[0.1] rounded-xl text-white focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md shadow-cyan-600/30"
                >
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
