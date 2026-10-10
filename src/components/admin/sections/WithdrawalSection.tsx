import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { WithdrawalRequest } from '../../../types';
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ArrowDownRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const WithdrawalSection: React.FC = () => {
  const { withdrawals, processWithdrawal } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const [activeProcessId, setActiveProcessId] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const filtered = withdrawals.filter((w: WithdrawalRequest) => {
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    const matchesRole = roleFilter === 'all' || w.role === roleFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (w.userName && w.userName.toLowerCase().includes(q)) ||
      (w.payoutDetails && w.payoutDetails.toLowerCase().includes(q)) ||
      (w.transactionRef && w.transactionRef.toLowerCase().includes(q));
    return matchesStatus && matchesRole && matchesSearch;
  });

  const [confirmMode, setConfirmMode] = useState<'none' | 'approve' | 'reject'>('none');
  const [rejectReasonInput, setRejectReasonInput] = useState('Invalid UPI ID or KYC issue');

  const activeWithdrawal = withdrawals.find((w: WithdrawalRequest) => w.id === activeProcessId);

  const handleOpenProcess = (id: string) => {
    setActiveProcessId(id);
    setTransactionRef(`UPI/${Date.now().toString().slice(-8)}/SUCCESS`);
    setAdminNotes('Settled via IMPS payout gateway.');
    setConfirmMode('none');
    setRejectReasonInput('Invalid UPI ID or KYC issue');
  };

  const handleApprove = () => {
    if (!activeWithdrawal) return;
    processWithdrawal(activeWithdrawal.id, 'completed', transactionRef, adminNotes);
    setActiveProcessId(null);
    setConfirmMode('none');
  };

  const handleReject = () => {
    if (!activeWithdrawal) return;
    processWithdrawal(activeWithdrawal.id, 'rejected', undefined, rejectReasonInput || 'Invalid UPI ID or KYC issue');
    setActiveProcessId(null);
    setConfirmMode('none');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">
            Disbursement Desk
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Withdrawal Requests (INR)</h1>
          <p className="text-sm text-zinc-500">
            Process worker earnings and partner commission payouts via UPI, Bank Transfer, or Paytm.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 text-center">
            <span className="text-[11px] font-bold text-amber-700 uppercase block">Pending Release</span>
            <span className="text-xl font-extrabold text-amber-900">
              {withdrawals.filter((w: WithdrawalRequest) => w.status === 'pending').length}
            </span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-center">
            <span className="text-[11px] font-bold text-emerald-700 uppercase block">Settled</span>
            <span className="text-xl font-extrabold text-emerald-900">
              {withdrawals.filter((w: WithdrawalRequest) => w.status === 'completed' || w.status === 'approved').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, UPI ID, Bank details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-800"
          >
            <option value="all">All Payout Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved (In Transit)</option>
            <option value="completed">Completed (Settled)</option>
            <option value="rejected">Rejected (Refunded)</option>
          </select>
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-800"
          >
            <option value="all">All Roles (Workers &amp; Partners)</option>
            <option value="worker">Workers Only</option>
            <option value="partner">Partners Only</option>
          </select>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Payout Method</th>
                <th className="py-3 px-4">Account / UPI Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4 text-right">Process</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">
                    No withdrawal requests found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item: WithdrawalRequest) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900">{item.userName}</div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        {item.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm text-xs">
                        ₹{(Number(item.amountINR ?? 0)).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-zinc-800">{item.method}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-mono text-[11px] text-zinc-700">
                      {item.payoutDetails}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {item.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">{item.requestedAt}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {item.status === 'pending' || item.status === 'approved' ? (
                        <button
                          onClick={() => handleOpenProcess(item.id)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Disburse
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {item.transactionRef || 'Settled'}
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

      {/* Disburse Modal */}
      {activeWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Disburse Withdrawal Payout</h3>
              <button
                onClick={() => setActiveProcessId(null)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                Payout Amount
              </span>
              <div className="text-2xl font-black text-emerald-900">
                ₹{(Number(activeWithdrawal.amountINR ?? 0)).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-800 font-medium">
                To: {activeWithdrawal.userName} ({activeWithdrawal.role})
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Destination Details</label>
              <div className="p-3 bg-zinc-100 rounded-lg font-mono text-[11px] text-zinc-800">
                {activeWithdrawal.method}: {activeWithdrawal.payoutDetails}
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Bank Reference / UPI UTR ID</label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. UPI/409281729182/SUCCESS"
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Settlement Notes</label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
              />
            </div>

            {/* Confirmation step banner if approve or reject clicked */}
            {confirmMode === 'approve' && (
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl space-y-2">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Confirm Withdrawal Approval</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Are you sure you want to mark this payout of <strong>₹{(Number(activeWithdrawal.amountINR ?? 0)).toLocaleString('en-IN')}</strong> to <strong>{activeWithdrawal.userName}</strong> as paid and settled?
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmMode('none')}
                    className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Confirm Approval
                  </button>
                </div>
              </div>
            )}

            {confirmMode === 'reject' && (
              <div className="bg-rose-50 border border-rose-300 p-3.5 rounded-xl space-y-2">
                <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Confirm Withdrawal Rejection &amp; Refund</span>
                </div>
                <p className="text-xs text-rose-800">
                  Are you sure you want to reject this withdrawal? <strong>₹{(Number(activeWithdrawal.amountINR ?? 0)).toLocaleString('en-IN')}</strong> will be immediately refunded to <strong>{activeWithdrawal.userName}</strong>&apos;s available balance.
                </p>
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">Rejection Reason:</label>
                  <input
                    type="text"
                    value={rejectReasonInput}
                    onChange={(e) => setRejectReasonInput(e.target.value)}
                    placeholder="Enter reason for rejection"
                    className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmMode('none')}
                    className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Confirm Rejection &amp; Refund
                  </button>
                </div>
              </div>
            )}

            {confirmMode === 'none' && (
              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setConfirmMode('reject')}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg transition-colors"
                >
                  Reject &amp; Refund
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveProcessId(null)}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmMode('approve')}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Approve Payout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
