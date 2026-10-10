import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { DepositRequest, DepositRequestStatus } from '../../../types';
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Filter,
  Eye,
  IndianRupee,
  ShieldCheck,
  User,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  RotateCcw,
  CheckCheck,
  Ban,
  Wallet,
} from 'lucide-react';

export const DepositRequestsSection: React.FC = () => {
  const {
    depositRequests,
    approveDepositRequest,
    rejectDepositRequest,
    workers,
    notify,
  } = useApp();

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);

  // Modal actions
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Copy helper
  const handleCopyUtr = (utr: string, id: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtrId(id);
    notify(`UTR "${utr}" copied to clipboard!`);
    setTimeout(() => setCopiedUtrId(null), 2000);
  };

  // Metrics calculation
  const totalRequests = depositRequests.length;
  const pendingRequests = depositRequests.filter((d) => d.status === 'Pending');
  const approvedRequests = depositRequests.filter((d) => d.status === 'Approved');
  const rejectedRequests = depositRequests.filter((d) => d.status === 'Rejected');
  const totalApprovedAmountINR = approvedRequests.reduce((sum, d) => sum + (d.amountINR || 0), 0);
  const pendingTotalAmountINR = pendingRequests.reduce((sum, d) => sum + (d.amountINR || 0), 0);

  // Filtered requests list
  const filteredRequests = depositRequests.filter((d) => {
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.senderName.toLowerCase().includes(q) ||
      d.utr.toLowerCase().includes(q) ||
      d.userName.toLowerCase().includes(q) ||
      (d.userEmail && d.userEmail.toLowerCase().includes(q)) ||
      d.id.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleOpenApproveModal = (req: DepositRequest) => {
    setSelectedRequest(req);
    setApprovalNotes(`Verified with UPI banking statement for UTR ${req.utr}. Credit ₹${req.amountINR}.`);
    setIsApproveModalOpen(true);
  };

  const handleOpenRejectModal = (req: DepositRequest) => {
    setSelectedRequest(req);
    setRejectionReason('UTR transaction reference not matched in banking statement.');
    setIsRejectModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedRequest) return;
    approveDepositRequest(selectedRequest.id, approvalNotes);
    setIsApproveModalOpen(false);
    setSelectedRequest(null);
  };

  const handleConfirmReject = () => {
    if (!selectedRequest) return;
    rejectDepositRequest(selectedRequest.id, rejectionReason);
    setIsRejectModalOpen(false);
    setSelectedRequest(null);
  };

  // SLA time calculation helper
  const getSlaRemainingText = (submittedAt: string) => {
    const submittedTime = new Date(submittedAt).getTime();
    const deadline = submittedTime + 8 * 3600 * 1000;
    const now = Date.now();
    const remainingMs = deadline - now;

    if (remainingMs <= 0) {
      return 'SLA Overdue (> 8 hrs)';
    }
    const hours = Math.floor(remainingMs / (3600 * 1000));
    const mins = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
    return `${hours}h ${mins}m left in 8h SLA`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1629] via-[#101b33] to-[#0d1629] border border-blue-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Financial Escrow Operations</span>
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>8-Hour Approval Policy</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Tournament Deposit Requests</span>
            </h1>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Review and audit incoming player UPI payments to <strong>soumodipbera@fam</strong>. Match the Payment Sender Name
              and 12-digit UTR against banking records to credit tournament wallet balances within the 8-hour SLA.
            </p>
          </div>

          <div className="bg-[#080d19] border border-white/[0.08] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Official Gateway UPI ID
              </span>
              <span className="font-mono text-sm font-black text-cyan-300 select-all">
                soumodipbera@fam
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Requests */}
        <div className="bg-[#111728] border border-amber-500/30 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              Pending Review
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {pendingRequests.length}
              </span>
              <span className="text-xs text-amber-300/80 font-mono">
                (₹{pendingTotalAmountINR.toLocaleString('en-IN')})
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              Subject to 8-hour verification window
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Approved INR */}
        <div className="bg-[#111728] border border-emerald-500/30 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              Total Approved Volume
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ₹{totalApprovedAmountINR.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                ({approvedRequests.length})
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              Credited directly to player balances
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Rejected Requests */}
        <div className="bg-[#111728] border border-rose-500/30 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              Rejected / Invalid
            </span>
            <span className="text-2xl font-black text-rose-400 font-mono block mt-1">
              {rejectedRequests.length}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              Failed bank match or duplicate UTR
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Total All-Time Requests */}
        <div className="bg-[#111728] border border-blue-500/30 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              All Submissions
            </span>
            <span className="text-2xl font-black text-blue-400 font-mono block mt-1">
              {totalRequests}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              Logged in audit database
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#111728] border border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            id="admin-search-deposit-requests"
            placeholder="Search by Payment Sender Name, UTR, or User..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-400"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-zinc-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Status:</span>
          </span>
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((s) => (
            <button
              key={s}
              type="button"
              id={`filter-deposit-status-${s.toLowerCase()}`}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === s
                  ? s === 'Pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : s === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : s === 'Rejected'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              {s}
              {s === 'Pending' && pendingRequests.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 font-mono text-[10px] font-black">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Deposit Requests Table */}
      <div className="bg-[#111728] border border-white/[0.08] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Deposit Transactions
            </span>
            <span className="text-[10px] font-mono bg-white/[0.05] text-zinc-400 px-2 py-0.5 rounded-full">
              {filteredRequests.length} results
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            SLA Standard: Verification within 8 hours
          </span>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] text-zinc-500 flex items-center justify-center mx-auto border border-white/[0.05]">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Deposit Requests Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              No deposit submissions match the current status filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                  <th className="py-3 px-4">Sender &amp; Account</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">UTR Number</th>
                  <th className="py-3 px-4">Submission &amp; SLA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {filteredRequests.map((req) => {
                  const isCopied = copiedUtrId === req.id;
                  const isPending = req.status === 'Pending';
                  const isApproved = req.status === 'Approved';
                  const isRejected = req.status === 'Rejected';

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Sender & Account */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block text-sm">
                            {req.senderName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                            <User className="w-3 h-3 text-zinc-500" />
                            <span>{req.userName}</span>
                          </div>
                          {req.userEmail && (
                            <span className="text-[10px] text-zinc-500 block">
                              {req.userEmail}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount in INR */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-base font-black text-emerald-400">
                          ₹{req.amountINR.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                          INR Payout
                        </span>
                      </td>

                      {/* UTR */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/25 tracking-wider select-all">
                            {req.utr}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyUtr(req.utr, req.id)}
                            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="Copy UTR"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-0.5 block">
                          To: soumodipbera@fam
                        </span>
                      </td>

                      {/* Submission & 8h SLA */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-zinc-300 text-[11px] font-medium block">
                            {new Date(req.submittedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}{' '}
                            {new Date(req.submittedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isPending ? (
                            <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>{getSlaRemainingText(req.submittedAt)}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-500">
                              Reviewed: {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Done'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isApproved
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : isRejected
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {isRejected && <XCircle className="w-3 h-3 text-rose-400" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-400" />}
                          <span>{req.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                id={`approve-deposit-btn-${req.id}`}
                                onClick={() => handleOpenApproveModal(req)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                title="Verify and credit user balance"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                id={`reject-deposit-btn-${req.id}`}
                                onClick={() => handleOpenRejectModal(req)}
                                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                title="Reject invalid deposit"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(req)}
                              className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Approve Deposit &amp; Credit Wallet</h3>
              <p className="text-xs text-zinc-400">
                You are approving ₹{selectedRequest.amountINR} for <strong>{selectedRequest.senderName}</strong>.
              </p>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/[0.06] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment Sender:</span>
                <span className="font-bold text-white">{selectedRequest.senderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Deposit Amount:</span>
                <span className="font-mono font-bold text-emerald-400">₹{selectedRequest.amountINR}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">UTR Reference:</span>
                <span className="font-mono font-bold text-cyan-300">{selectedRequest.utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Credited To User:</span>
                <span className="font-medium text-white">{selectedRequest.userName}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="approve-deposit-notes" className="text-xs font-semibold text-zinc-300 block">
                Verification / Audit Notes:
              </label>
              <textarea
                id="approve-deposit-notes"
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Optional banking audit remarks..."
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsApproveModalOpen(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-approve-deposit-btn"
                onClick={handleConfirmApprove}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                Confirm &amp; Credit ₹{selectedRequest.amountINR}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Reject Deposit Request</h3>
              <p className="text-xs text-zinc-400">
                Rejecting deposit request from <strong>{selectedRequest.senderName}</strong> (UTR: {selectedRequest.utr}).
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reject-deposit-reason" className="text-xs font-semibold text-zinc-300 block">
                Reason for Rejection:
              </label>
              <textarea
                id="reject-deposit-reason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this deposit is being rejected..."
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-hidden focus:border-rose-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-reject-deposit-btn"
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT DETAILS MODAL */}
      {!isApproveModalOpen && !isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/[0.1] rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Deposit Audit Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Request ID:</span>
                  <span className="font-mono text-white">{selectedRequest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Payment Sender Name:</span>
                  <span className="font-bold text-white">{selectedRequest.senderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Deposit Amount:</span>
                  <span className="font-mono text-base font-black text-emerald-400">
                    ₹{selectedRequest.amountINR}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">UTR / Ref Number:</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedRequest.utr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Gateway UPI:</span>
                  <span className="font-mono text-zinc-300">{selectedRequest.upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Approval Policy:</span>
                  <span className="text-amber-300">{selectedRequest.approvalWindowMessage || '8 hours'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status:</span>
                  <span
                    className={`font-bold ${
                      selectedRequest.status === 'Approved'
                        ? 'text-emerald-400'
                        : selectedRequest.status === 'Rejected'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              {selectedRequest.reviewedBy && (
                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Reviewed By:</span>
                    <span className="font-medium text-white">{selectedRequest.reviewedBy}</span>
                  </div>
                  {selectedRequest.reviewedAt && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Reviewed At:</span>
                      <span className="text-zinc-300 font-mono">
                        {new Date(selectedRequest.reviewedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedRequest.reviewNotes && (
                    <div className="pt-1">
                      <span className="text-zinc-400 block mb-0.5">Audit Notes:</span>
                      <p className="text-zinc-200 italic bg-black/30 p-2 rounded-lg">
                        {selectedRequest.reviewNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="w-full py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Audit Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
