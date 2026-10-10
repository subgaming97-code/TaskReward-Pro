import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Worker, Submission, WithdrawalRequest, UserTransaction, AdminActivityLog, PartnerActivityLog } from '../../types';
import {
  ArrowLeft,
  Search,
  Wallet,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  Mail,
  Calendar,
  CreditCard,
  Copy,
  Check,
  Eye,
  Trash2,
  History,
  Building2,
} from 'lucide-react';
import { GoogleLogo } from '../GoogleSignInModal';

interface UserAccountPageProps {
  worker: Worker;
  onBack: () => void;
  onSearchEId?: (eid: string) => void;
}

export const UserAccountPage: React.FC<UserAccountPageProps> = ({
  worker,
  onBack,
  onSearchEId,
}) => {
  const {
    workers,
    submissions,
    withdrawals,
    updateWorkerBalance,
    deleteWorker,
    userTransactions,
    adminActivityLogs,
    partnerActivityLogs,
    reviewSubmission,
    resolveAppeal,
    processWithdrawal,
  } = useApp();

  // Find the latest worker state in context
  const currentWorkerState = workers.find((w) => w.id === worker.id) || worker;

  // Local state for E-ID search bar on this page
  const [searchEIdInput, setSearchEIdInput] = useState('');
  const [copiedEid, setCopiedEid] = useState(false);

  // Add INR State & Confirmation Modal
  const [addInrAmount, setAddInrAmount] = useState<number | ''>('');
  const [addInrReason, setAddInrReason] = useState<string>('Admin balance credit');
  const [showConfirmAddModal, setShowConfirmAddModal] = useState<boolean>(false);

  // Deduct INR State & Confirmation Modal
  const [deductInrAmount, setDeductInrAmount] = useState<number | ''>('');
  const [deductInrReason, setDeductInrReason] = useState<string>('Admin balance deduction');
  const [showConfirmDeductModal, setShowConfirmDeductModal] = useState<boolean>(false);

  // Delete User Confirmation Modal
  const [showDeleteUserModal, setShowDeleteUserModal] = useState<boolean>(false);

  const [inrFeedback, setInrFeedback] = useState<string | null>(null);

  // Submissions filter & inspect modal state
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>('all');
  const [inspectingSub, setInspectingSub] = useState<Submission | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState<string>('');
  const [holdReasonInput, setHoldReasonInput] = useState<string>('');
  const [showRejectNoteModal, setShowRejectNoteModal] = useState<boolean>(false);
  const [showHoldModal, setShowHoldModal] = useState<boolean>(false);

  // Withdrawals filter & confirmation modal state
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<string>('all');
  const [approveConfirmWithdrawal, setApproveConfirmWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [rejectConfirmWithdrawal, setRejectConfirmWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [approvalTransactionRef, setApprovalTransactionRef] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState<string>('Settled via IMPS / UPI payout gateway.');
  const [rejectionReason, setRejectionReason] = useState<string>('Invalid UPI ID or KYC issue');

  // Filter submissions for this specific user
  const userSubmissions = submissions.filter(
    (s: Submission) =>
      s.workerId === currentWorkerState.id ||
      (s.workerEmail && currentWorkerState.email && s.workerEmail.toLowerCase() === currentWorkerState.email.toLowerCase())
  );

  const filteredSubmissions = userSubmissions.filter((s: Submission) => {
    if (submissionStatusFilter === 'all') return true;
    return s.status === submissionStatusFilter;
  });

  // Filter withdrawals for this specific user
  const userWithdrawals = withdrawals.filter(
    (w: WithdrawalRequest) =>
      w.userId === currentWorkerState.id ||
      (w.role === 'worker' && w.userName && currentWorkerState.name && w.userName.toLowerCase() === currentWorkerState.name.toLowerCase())
  );

  const filteredWithdrawals = userWithdrawals.filter((w: WithdrawalRequest) => {
    if (withdrawalStatusFilter === 'all') return true;
    return w.status === withdrawalStatusFilter;
  });

  const handleCopyEid = () => {
    navigator.clipboard.writeText(currentWorkerState.eid);
    setCopiedEid(true);
    setTimeout(() => setCopiedEid(false), 2000);
  };

  // Add INR confirmation flow
  const handleOpenAddInrModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (addInrAmount === '' || Number(addInrAmount) <= 0) return;
    setShowConfirmAddModal(true);
  };

  const handleConfirmAddInr = () => {
    if (addInrAmount === '' || Number(addInrAmount) <= 0) return;
    updateWorkerBalance(currentWorkerState.id, Number(addInrAmount), addInrReason);
    setShowConfirmAddModal(false);
    setInrFeedback(`Successfully added ₹${Number(addInrAmount).toLocaleString('en-IN')} to ${currentWorkerState.name}'s balance.`);
    setAddInrAmount('');
    setTimeout(() => setInrFeedback(null), 4000);
  };

  // Deduct INR confirmation flow
  const handleOpenDeductInrModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (deductInrAmount === '' || Number(deductInrAmount) <= 0) return;
    setShowConfirmDeductModal(true);
  };

  const handleConfirmDeductInr = () => {
    if (deductInrAmount === '' || Number(deductInrAmount) <= 0) return;
    updateWorkerBalance(currentWorkerState.id, -Number(deductInrAmount), deductInrReason);
    setShowConfirmDeductModal(false);
    setInrFeedback(`Successfully deducted ₹${Number(deductInrAmount).toLocaleString('en-IN')} from ${currentWorkerState.name}'s balance.`);
    setDeductInrAmount('');
    setTimeout(() => setInrFeedback(null), 4000);
  };

  // Delete User confirmation flow
  const handleConfirmDeleteUser = () => {
    deleteWorker(currentWorkerState.id, 'Platform Admin');
    setShowDeleteUserModal(false);
    onBack();
  };

  // Transactions & logs specific to this user
  const userTxList = userTransactions.filter(
    (t: UserTransaction) =>
      t.workerId === currentWorkerState.id ||
      t.workerEid?.toUpperCase() === currentWorkerState.eid.toUpperCase()
  );

  const userAdminLogs = adminActivityLogs.filter(
    (l: AdminActivityLog) =>
      l.targetUserId === currentWorkerState.id ||
      l.targetUserEid?.toUpperCase() === currentWorkerState.eid.toUpperCase()
  );

  const userPartnerLogs = partnerActivityLogs.filter(
    (l: PartnerActivityLog) =>
      l.targetUserId === currentWorkerState.id ||
      l.targetUserEid?.toUpperCase() === currentWorkerState.eid.toUpperCase()
  );

  // Withdrawal confirmation handlers
  const handleOpenApproveModal = (req: WithdrawalRequest) => {
    setApproveConfirmWithdrawal(req);
    setApprovalTransactionRef(`UPI/${Date.now().toString().slice(-8)}/SUCCESS`);
    setApprovalNotes('Settled via IMPS / UPI payout gateway.');
  };

  const handleConfirmApprove = () => {
    if (!approveConfirmWithdrawal) return;
    processWithdrawal(
      approveConfirmWithdrawal.id,
      'completed',
      approvalTransactionRef,
      approvalNotes
    );
    setApproveConfirmWithdrawal(null);
  };

  const handleOpenRejectModal = (req: WithdrawalRequest) => {
    setRejectConfirmWithdrawal(req);
    setRejectionReason('Invalid UPI ID or KYC verification required.');
  };

  const handleConfirmReject = () => {
    if (!rejectConfirmWithdrawal) return;
    processWithdrawal(
      rejectConfirmWithdrawal.id,
      'rejected',
      undefined,
      rejectionReason
    );
    setRejectConfirmWithdrawal(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchEId && searchEIdInput.trim()) {
      onSearchEId(searchEIdInput.trim());
      setSearchEIdInput('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb, Back Button, Delete User, and E-ID Quick Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Directory</span>
          </button>
          <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">User Account Page</span>
            <span className="text-zinc-300">•</span>
            <span className="font-mono text-xs font-bold bg-zinc-900 text-white px-2 py-0.5 rounded shadow-2xs">
              {currentWorkerState.eid}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteUserModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors ml-auto sm:ml-2"
            title="Permanently Delete This User Account"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete User</span>
          </button>
        </div>

        {/* Quick Search Another User by E-ID */}
        {onSearchEId && (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <label htmlFor="account-page-eid-search" className="text-xs font-semibold text-zinc-600 whitespace-nowrap">
              Search User by E-ID:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                id="account-page-eid-search"
                type="text"
                value={searchEIdInput}
                onChange={(e) => setSearchEIdInput(e.target.value)}
                placeholder="e.g. EID-849201"
                className="pl-8 pr-3 py-1.5 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white w-40 sm:w-48"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Open
            </button>
          </form>
        )}
      </div>

      {/* User Information Profile & Financial Summary Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-zinc-200">
          {/* Avatar & Key Profile Details */}
          <div className="flex items-start gap-4">
            <img
              src={
                currentWorkerState.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                  currentWorkerState.email
                )}`
              }
              alt={currentWorkerState.name}
              className="w-16 h-16 rounded-2xl border border-zinc-200 bg-zinc-50 object-cover shadow-2xs"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900">{currentWorkerState.name}</h1>
                <div className="flex items-center gap-1 bg-zinc-900 text-white px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold shadow-2xs">
                  <span>E-ID: {currentWorkerState.eid}</span>
                  <button
                    type="button"
                    onClick={handleCopyEid}
                    className="ml-1 text-zinc-400 hover:text-white p-0.5 transition-colors"
                    title="Copy E-ID"
                  >
                    {copiedEid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[11px] font-mono font-medium border border-zinc-200">
                  {currentWorkerState.uniqueUserId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentWorkerState.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {currentWorkerState.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-semibold text-zinc-800">{currentWorkerState.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Joined: {currentWorkerState.joinedDate}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                {currentWorkerState.upiId && (
                  <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-lg font-mono text-[11px] text-zinc-700">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                    <span>UPI: {currentWorkerState.upiId}</span>
                  </div>
                )}
                {currentWorkerState.googleAccount ? (
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-900 px-2.5 py-1 rounded-lg text-[11px]">
                    <GoogleLogo className="w-3.5 h-3.5 shrink-0" />
                    <span>Google Linked: <strong>{currentWorkerState.googleAccount.email}</strong></span>
                  </div>
                ) : (
                  <span className="text-zinc-400 italic text-[11px]">No Google account linked</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Overview */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl min-w-[130px] text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Available Balance
              </span>
              <span className="text-2xl font-black text-emerald-950">
                ₹{(currentWorkerState.availableBalanceINR ?? 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl min-w-[110px] text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                Total Earned
              </span>
              <span className="text-lg font-bold text-zinc-900">
                ₹{(currentWorkerState.totalEarnedINR ?? 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl min-w-[100px] text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Completed
              </span>
              <span className="text-lg font-bold text-blue-950 flex items-center justify-end gap-1">
                <UserCheck className="w-4 h-4 text-blue-600" />
                {currentWorkerState.completedTasksCount}
              </span>
            </div>
          </div>
        </div>

        {/* Balance Management: Add INR & Deduct INR Options (No Limits, Requires Confirmation) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Add INR Card */}
          <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-zinc-50 border border-emerald-200/80 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Add INR to {currentWorkerState.name}&apos;s Balance
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Directly credits any entered amount exclusively to this user ({currentWorkerState.eid}).
                  </p>
                </div>
              </div>

              {/* Quick preset amount chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[100, 250, 500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddInrAmount(amt)}
                    className={`px-2 py-0.5 text-xs font-semibold rounded-lg border transition-all ${
                      addInrAmount === amt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-emerald-300'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleOpenAddInrModal} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
              <div className="sm:col-span-4">
                <label htmlFor="add-inr-amount" className="text-[11px] font-semibold text-zinc-700 block mb-1">
                  Amount to Add (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-zinc-500 text-xs">₹</span>
                  <input
                    id="add-inr-amount"
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    placeholder="Enter amount (e.g. 250)"
                    value={addInrAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setAddInrAmount('');
                      } else {
                        const num = Number(val);
                        if (!isNaN(num)) setAddInrAmount(num);
                      }
                    }}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-5">
                <label htmlFor="add-inr-reason" className="text-[11px] font-semibold text-zinc-700 block mb-1">
                  Audit Reason / Note
                </label>
                <input
                  id="add-inr-reason"
                  type="text"
                  required
                  value={addInrReason}
                  onChange={(e) => setAddInrReason(e.target.value)}
                  placeholder="e.g. Campaign incentive, QA bonus, Support adjustment"
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add INR</span>
                </button>
              </div>
            </form>
          </div>

          {/* Deduct INR Card */}
          <div className="bg-gradient-to-r from-amber-50/70 via-rose-50/40 to-zinc-50 border border-amber-200/80 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  <MinusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Deduct INR from {currentWorkerState.name}&apos;s Balance
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Deducts any valid entered amount from this user ({currentWorkerState.eid}) after confirmation.
                  </p>
                </div>
              </div>

              {/* Quick preset amount chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[50, 100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDeductInrAmount(amt)}
                    className={`px-2 py-0.5 text-xs font-semibold rounded-lg border transition-all ${
                      deductInrAmount === amt
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-amber-300'
                    }`}
                  >
                    -₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleOpenDeductInrModal} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
              <div className="sm:col-span-4">
                <label htmlFor="deduct-inr-amount" className="text-[11px] font-semibold text-zinc-700 block mb-1">
                  Amount to Deduct (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-zinc-500 text-xs">₹</span>
                  <input
                    id="deduct-inr-amount"
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    placeholder="Enter amount (e.g. 100)"
                    value={deductInrAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setDeductInrAmount('');
                      } else {
                        const num = Number(val);
                        if (!isNaN(num)) setDeductInrAmount(num);
                      }
                    }}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-5">
                <label htmlFor="deduct-inr-reason" className="text-[11px] font-semibold text-zinc-700 block mb-1">
                  Audit Reason / Note
                </label>
                <input
                  id="deduct-inr-reason"
                  type="text"
                  required
                  value={deductInrReason}
                  onChange={(e) => setDeductInrReason(e.target.value)}
                  placeholder="e.g. Duplicate payout recovery, Chargeback adjustment"
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>Deduct INR</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {inrFeedback && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs px-3 py-2 rounded-lg flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{inrFeedback}</span>
          </div>
        )}
      </div>

      {/* Work Submissions for This User (Without Changing Existing Workflow) */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-zinc-900">Work Submissions</h2>
              <span className="text-xs font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
                {userSubmissions.length} Total
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Review completed task proofs, verify compliance, or credit rewards for this user.
            </p>
          </div>

          {/* Submissions Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={submissionStatusFilter}
              onChange={(e) => setSubmissionStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-800 font-medium cursor-pointer"
            >
              <option value="all">All Submissions ({userSubmissions.length})</option>
              <option value="submitted">Submitted (Pending)</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Task Details</th>
                <th className="py-3 px-4">Reward (INR)</th>
                <th className="py-3 px-4">Assigned Partner</th>
                <th className="py-3 px-4">Proof of Work</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">
                    No work submissions found for this user under the selected filter.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub: Submission) => (
                  <tr key={sub.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold text-zinc-900 block truncate">{sub.taskTitle}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">ID: {sub.taskId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                        ₹{sub.rewardINR}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-zinc-700">{sub.assignedPartnerName || 'Direct Platform'}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="truncate text-zinc-700 font-mono text-[11px]" title={sub.proofText}>
                        {sub.proofText}
                      </div>
                      {sub.proofUrl && (
                        <a
                          href={sub.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-0.5"
                        >
                          <span>View Link</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {sub.proofFileName && (
                        <span className="inline-block text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-mono mt-0.5">
                          📎 {sub.proofFileName}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {sub.status === 'submitted' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Submitted
                        </span>
                      )}
                      {sub.status === 'under_review' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" /> Under Review
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                      {sub.status === 'on_hold' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          <AlertTriangle className="w-3 h-3" /> On Hold
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">{sub.submittedAt}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectingSub(sub);
                          setReviewNoteInput(sub.reviewNotes || '');
                          setHoldReasonInput(sub.holdReason || '');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect / Audit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Requests for This User (With Approve/Reject Confirmation Step) */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-zinc-900">Withdrawal Requests (INR)</h2>
              <span className="text-xs font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
                {userWithdrawals.length} Total
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Disburse payouts via UPI, Bank Transfer, or Paytm. Approve and reject actions include confirmation steps.
            </p>
          </div>

          {/* Withdrawals Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={withdrawalStatusFilter}
              onChange={(e) => setWithdrawalStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-800 font-medium cursor-pointer"
            >
              <option value="all">All Withdrawals ({userWithdrawals.length})</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved (In Transit)</option>
              <option value="completed">Completed (Settled)</option>
              <option value="rejected">Rejected (Refunded)</option>
            </select>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Payout Method</th>
                <th className="py-3 px-4">Destination Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4">Transaction Ref / Notes</th>
                <th className="py-3 px-4 text-right">Disbursement Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">
                    No withdrawal requests recorded for this user under the selected filter.
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((item: WithdrawalRequest) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded text-sm">
                        ₹{(Number(item.amountINR ?? 0)).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-800">{item.method}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-700 max-w-xs truncate">
                      {item.payoutDetails}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {item.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" /> In Transit
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">{item.requestedAt}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {item.transactionRef ? (
                        <span className="text-[11px] font-mono text-zinc-700 block truncate">
                          Ref: {item.transactionRef}
                        </span>
                      ) : null}
                      {item.adminNotes && (
                        <span className="text-[10px] text-zinc-500 block truncate">
                          {item.adminNotes}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {item.status === 'pending' || item.status === 'approved' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Button -> Triggers Confirmation Step */}
                          <button
                            type="button"
                            onClick={() => handleOpenApproveModal(item)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve</span>
                          </button>

                          {/* Reject Button -> Triggers Confirmation Step */}
                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(item)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {item.status === 'completed' ? 'Settled' : 'Refunded'}
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

      {/* User Balance History & Activity Audit Log */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs space-y-4 p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                User Balance History &amp; Activity Log
              </h2>
              <p className="text-xs text-zinc-500">
                Full chronological ledger of credits, debits, adjustments, and review activity for {currentWorkerState.name} ({currentWorkerState.eid}).
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-lg">
            {userTxList.length} Transactions Recorded
          </span>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Balance Before</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {userTxList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-400">
                    No balance adjustments recorded yet for this account.
                  </td>
                </tr>
              ) : (
                userTxList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">{tx.id}</td>
                    <td className="py-3 px-4">
                      {tx.type === 'add' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          + ADD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          - DEDUCT
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-sm">
                      <span className={tx.type === 'add' ? 'text-emerald-700' : 'text-amber-800'}>
                        {tx.type === 'add' ? '+' : '-'}₹{(Math.abs(Number(tx.amountINR ?? 0))).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-800 max-w-xs">{tx.reason}</td>
                    <td className="py-3 px-4 font-mono text-zinc-500">₹{(Number(tx.balanceBeforeINR ?? 0)).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">₹{(Number(tx.balanceAfterINR ?? 0)).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-zinc-600">
                      <span className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded text-[11px] font-medium">
                        {tx.performedByAdmin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500 whitespace-nowrap">{tx.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* User Related Audit Logs */}
        {(userAdminLogs.length > 0 || userPartnerLogs.length > 0) && (
          <div className="pt-4 border-t border-zinc-200 space-y-3">
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Administrative &amp; Partner Review Trail
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userAdminLogs.map((log) => (
                <div key={log.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      {log.action}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-zinc-600 text-[11px]">{log.details}</p>
                  <div className="text-[10px] text-zinc-500 pt-0.5">By: <strong className="text-zinc-700">{log.performedByAdmin}</strong></div>
                </div>
              ))}
              {userPartnerLogs.map((log) => (
                <div key={log.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      {log.action}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-zinc-600 text-[11px]">{log.details}</p>
                  <div className="text-[10px] text-zinc-500 pt-0.5">Partner: <strong className="text-zinc-700">{log.partnerName}</strong></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Approve Withdrawal Confirmation Step */}
      {approveConfirmWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-zinc-900">Confirm Withdrawal Approval</h3>
              </div>
              <button
                type="button"
                onClick={() => setApproveConfirmWithdrawal(null)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Payout Confirmation
              </div>
              <div className="text-2xl font-black text-emerald-950">
                ₹{(Number(approveConfirmWithdrawal.amountINR ?? 0)).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-900 font-medium">
                Beneficiary: <strong>{approveConfirmWithdrawal.userName}</strong> (E-ID: {currentWorkerState.eid})
              </div>
              <div className="text-xs text-emerald-800 font-mono">
                {approveConfirmWithdrawal.method}: {approveConfirmWithdrawal.payoutDetails}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  Bank Reference / UPI UTR Transaction Number:
                </label>
                <input
                  type="text"
                  required
                  value={approvalTransactionRef}
                  onChange={(e) => setApprovalTransactionRef(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-xs font-bold"
                  placeholder="e.g. UPI/1234567890/SUCCESS"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  Settlement Audit Note:
                </label>
                <input
                  type="text"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                  placeholder="Notes for disbursement log"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setApproveConfirmWithdrawal(null)}
                className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Settle Payout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reject Withdrawal Confirmation Step */}
      {rejectConfirmWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-zinc-900">Confirm Withdrawal Rejection</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectConfirmWithdrawal(null)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                Notice: Automatic Refund
              </div>
              <div className="text-lg font-bold text-rose-950">
                Refund ₹{(Number(rejectConfirmWithdrawal.amountINR ?? 0)).toLocaleString('en-IN')} to {rejectConfirmWithdrawal.userName}&apos;s balance
              </div>
              <p className="text-xs text-rose-800">
                Are you sure you want to reject this request? The amount will be immediately refunded back to {currentWorkerState.name}&apos;s available balance.
              </p>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">
                Rejection Reason (will be logged &amp; notified):
              </label>
              <input
                type="text"
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Invalid UPI ID, Bank details mismatch, or KYC issue"
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium"
              />
            </div>

            <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectConfirmWithdrawal(null)}
                className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm Rejection &amp; Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Inspect & Review Submission (Existing Workflow Preserved) */}
      {inspectingSub && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Submission Review</span>
                <h3 className="text-base font-bold text-zinc-900">{inspectingSub.taskTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSub(null)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Worker:</span>
                <span className="font-semibold text-zinc-900">{inspectingSub.workerName} ({currentWorkerState.eid})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Reward:</span>
                <span className="font-bold text-emerald-700">₹{inspectingSub.rewardINR}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Current Status:</span>
                <span className="font-bold uppercase text-[10px]">{inspectingSub.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Submitted:</span>
                <span>{inspectingSub.submittedAt}</span>
              </div>
            </div>

            {/* Proof Details */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 block">Submitted Proof of Work:</label>
              <div className="p-3 bg-zinc-100 rounded-lg text-zinc-800 whitespace-pre-wrap font-mono text-[11px]">
                {inspectingSub.proofText || 'No textual proof submitted.'}
              </div>
              {inspectingSub.proofUrl && (
                <div className="pt-1">
                  <span className="text-zinc-500 font-medium">Link: </span>
                  <a
                    href={inspectingSub.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>{inspectingSub.proofUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {inspectingSub.proofFileName && (
                <div className="pt-1">
                  <span className="text-zinc-500 font-medium">Attachment: </span>
                  <span className="font-mono text-zinc-800">📎 {inspectingSub.proofFileName}</span>
                </div>
              )}
            </div>

            {/* If appeal exists */}
            {inspectingSub.appealStatus === 'pending' && inspectingSub.appealText && (
              <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
                  <span>Pending Appeal from User</span>
                </div>
                <p className="text-xs text-purple-950 font-medium">{inspectingSub.appealText}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      resolveAppeal(inspectingSub.id, true, 'Appeal granted and approved.');
                      setInspectingSub(null);
                    }}
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold"
                  >
                    Grant Appeal &amp; Credit ₹{inspectingSub.rewardINR}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resolveAppeal(inspectingSub.id, false, 'Appeal rejected upon second review.');
                      setInspectingSub(null);
                    }}
                    className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg font-semibold"
                  >
                    Deny Appeal
                  </button>
                </div>
              </div>
            )}

            {/* Rejection / Hold inline input sub-panels if triggered */}
            {showHoldModal && (
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl space-y-2">
                <label className="text-[11px] font-bold text-purple-900 block">
                  Specify reason to place submission on hold:
                </label>
                <input
                  type="text"
                  value={holdReasonInput}
                  onChange={(e) => setHoldReasonInput(e.target.value)}
                  placeholder="e.g. Needs higher resolution screenshot or verification"
                  className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowHoldModal(false)}
                    className="px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      reviewSubmission(
                        inspectingSub.id,
                        'on_hold',
                        'Platform Admin',
                        'admin',
                        undefined,
                        holdReasonInput || 'Pending additional proof verification'
                      );
                      setShowHoldModal(false);
                      setInspectingSub(null);
                    }}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold"
                  >
                    Confirm Put On Hold
                  </button>
                </div>
              </div>
            )}

            {showRejectNoteModal && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-2">
                <label className="text-[11px] font-bold text-rose-900 block">
                  Specify rejection reason (visible to user):
                </label>
                <input
                  type="text"
                  value={reviewNoteInput}
                  onChange={(e) => setReviewNoteInput(e.target.value)}
                  placeholder="e.g. Proof does not fulfill task requirements."
                  className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRejectNoteModal(false)}
                    className="px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      reviewSubmission(
                        inspectingSub.id,
                        'rejected',
                        'Platform Admin',
                        'admin',
                        reviewNoteInput || 'Proof does not fulfill task requirements.'
                      );
                      setShowRejectNoteModal(false);
                      setInspectingSub(null);
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            {/* Workflow Review Actions */}
            <div className="pt-3 border-t border-zinc-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    reviewSubmission(
                      inspectingSub.id,
                      'approved',
                      'Platform Admin',
                      'admin',
                      reviewNoteInput || 'Verified and approved by admin.'
                    );
                    setInspectingSub(null);
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve &amp; Credit ₹{inspectingSub.rewardINR}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowHoldModal(true);
                    setShowRejectNoteModal(false);
                  }}
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-semibold"
                >
                  Place On Hold
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRejectNoteModal(true);
                    setShowHoldModal(false);
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Add INR Balance */}
      {showConfirmAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-zinc-900">Confirm Add INR</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmAddModal(false)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-zinc-600 text-xs">
              You are about to credit and increase the INR balance exclusively for this user. Please confirm the details:
            </p>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-zinc-700">
                <span>Target User:</span>
                <span className="font-bold text-zinc-900">{currentWorkerState.name} ({currentWorkerState.eid})</span>
              </div>
              <div className="flex items-center justify-between text-zinc-700">
                <span>Current Balance:</span>
                <span className="font-mono font-semibold">₹{(currentWorkerState.availableBalanceINR ?? 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-800 font-bold text-sm pt-1 border-t border-emerald-200">
                <span>Amount to Add:</span>
                <span>+₹{Number(addInrAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-900 font-bold pt-1 border-t border-emerald-200">
                <span>New Available Balance:</span>
                <span className="font-mono text-base text-emerald-950">
                  ₹{((currentWorkerState.availableBalanceINR ?? 0) + Number(addInrAmount)).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-1 text-[11px] text-zinc-500">
                <strong>Reason:</strong> {addInrReason}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmAddModal(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddInr}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
              >
                Confirm &amp; Add ₹{Number(addInrAmount).toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Deduct INR Balance */}
      {showConfirmDeductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <MinusCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-zinc-900">Confirm Deduct INR</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmDeductModal(false)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-zinc-600 text-xs">
              You are about to deduct INR from this user&apos;s available balance. Please review the details carefully:
            </p>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-zinc-700">
                <span>Target User:</span>
                <span className="font-bold text-zinc-900">{currentWorkerState.name} ({currentWorkerState.eid})</span>
              </div>
              <div className="flex items-center justify-between text-zinc-700">
                <span>Current Balance:</span>
                <span className="font-mono font-semibold">₹{(currentWorkerState.availableBalanceINR ?? 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-amber-800 font-bold text-sm pt-1 border-t border-amber-200">
                <span>Amount to Deduct:</span>
                <span>-₹{Number(deductInrAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-900 font-bold pt-1 border-t border-amber-200">
                <span>New Available Balance:</span>
                <span className="font-mono text-base text-zinc-900">
                  ₹{Math.max(0, (currentWorkerState.availableBalanceINR ?? 0) - Number(deductInrAmount)).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-1 text-[11px] text-zinc-500">
                <strong>Reason:</strong> {deductInrReason}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDeductModal(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeductInr}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
              >
                Confirm &amp; Deduct ₹{Number(deductInrAmount).toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete User Account */}
      {showDeleteUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200 text-xs">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-950">Delete User Account</h3>
                  <p className="text-[11px] text-rose-600">Irreversible user account removal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteUserModal(false)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Confirmation Required</span>
              </div>
              <p className="text-rose-800 text-[11px] leading-relaxed">
                Are you sure you want to permanently delete <strong>{currentWorkerState.name}</strong> ({currentWorkerState.eid})?
              </p>
              <div className="pt-2 border-t border-rose-200/80 text-[11px] text-zinc-700 space-y-1">
                <div>• Email: <strong>{currentWorkerState.email}</strong></div>
                <div>• E-ID: <strong>{currentWorkerState.eid}</strong></div>
                <div>• Remaining Balance: <strong>₹{(currentWorkerState.availableBalanceINR ?? 0).toLocaleString('en-IN')}</strong></div>
              </div>
              <p className="text-[10px] text-zinc-500 pt-1">
                Note: Only this specific user record is removed. All other users, data, partner accounts, and platform workflows remain completely unaffected.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteUserModal(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
              >
                Yes, Delete User Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
