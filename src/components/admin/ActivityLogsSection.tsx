import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminActivityLog, PartnerActivityLog } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MinusCircle,
  Trash2,
  Calendar,
  Clock,
  User,
  Building2,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
} from 'lucide-react';

interface ActivityLogsSectionProps {
  initialTab?: 'admin' | 'partner';
  filterUserEid?: string;
}

export const ActivityLogsSection: React.FC<ActivityLogsSectionProps> = ({
  initialTab = 'admin',
  filterUserEid,
}) => {
  const { adminActivityLogs, partnerActivityLogs } = useApp();

  const [activeLogTab, setActiveLogTab] = useState<'admin' | 'partner'>(initialTab);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminActionFilter, setAdminActionFilter] = useState<string>('all');

  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<string>('all');

  // Filter Admin Logs
  const filteredAdminLogs = adminActivityLogs.filter((log: AdminActivityLog) => {
    if (filterUserEid) {
      const matchEid =
        log.targetUserEid?.toLowerCase() === filterUserEid.toLowerCase() ||
        log.targetUserId?.toLowerCase() === filterUserEid.toLowerCase();
      if (!matchEid) return false;
    }

    if (adminActionFilter !== 'all' && log.action !== adminActionFilter) {
      return false;
    }

    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase().trim();
      const match =
        (log.title && log.title.toLowerCase().includes(q)) ||
        (log.targetUserName && log.targetUserName.toLowerCase().includes(q)) ||
        (log.targetUserEid && log.targetUserEid.toLowerCase().includes(q)) ||
        (log.performedByAdmin && log.performedByAdmin.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Filter Partner Logs
  const filteredPartnerLogs = partnerActivityLogs.filter((log: PartnerActivityLog) => {
    if (filterUserEid) {
      const matchEid =
        log.targetUserEid?.toLowerCase() === filterUserEid.toLowerCase() ||
        log.targetUserId?.toLowerCase() === filterUserEid.toLowerCase();
      if (!matchEid) return false;
    }

    if (partnerStatusFilter !== 'all' && log.paymentStatus !== partnerStatusFilter) {
      return false;
    }

    if (partnerSearch.trim()) {
      const q = partnerSearch.toLowerCase().trim();
      const match =
        (log.partnerName && log.partnerName.toLowerCase().includes(q)) ||
        (log.targetUserName && log.targetUserName.toLowerCase().includes(q)) ||
        (log.targetUserEid && log.targetUserEid.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Summary Metrics
  const totalAddedINR = adminActivityLogs
    .filter((l) => l.action === 'add_balance')
    .reduce((sum, l) => sum + (l.amountINR || 0), 0);

  const totalDeductedINR = adminActivityLogs
    .filter((l) => l.action === 'deduct_balance')
    .reduce((sum, l) => sum + (l.amountINR || 0), 0);

  const totalApprovedWithdrawals = adminActivityLogs.filter(
    (l) => l.action === 'withdrawal_approved'
  ).length;

  const totalDeletedUsers = adminActivityLogs.filter(
    (l) => l.action === 'user_deleted'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header and Log Type Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            Security &amp; Audit Trail
          </span>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Activity Logs</h2>
          <p className="text-sm text-zinc-500">
            Real-time auditable logs for administrative balance adjustments, withdrawals, user deletions, and partner actions.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveLogTab('admin')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeLogTab === 'admin'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin Activity Log</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700">
              {filteredAdminLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLogTab('partner')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeLogTab === 'partner'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Partner Activity Log</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
              {filteredPartnerLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Total Added INR
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-emerald-950 mt-1 block">
            +₹{(totalAddedINR ?? 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">Recorded Credits</span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Total Deducted INR
            </span>
            <ArrowDownRight className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-black text-amber-950 mt-1 block">
            -₹{(totalDeductedINR ?? 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-amber-700 font-medium">Recorded Deductions</span>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
              Withdrawals Settled
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xl font-black text-blue-950 mt-1 block">
            {totalApprovedWithdrawals}
          </span>
          <span className="text-[10px] text-blue-700 font-medium">Approved Payouts</span>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/80 p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Users Deleted
            </span>
            <Trash2 className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-xl font-black text-rose-950 mt-1 block">
            {totalDeletedUsers}
          </span>
          <span className="text-[10px] text-rose-700 font-medium">Account Removals</span>
        </div>
      </div>

      {/* ADMIN LOGS VIEW */}
      {activeLogTab === 'admin' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden space-y-4 p-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search admin logs by action, user name, E-ID, or admin..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={adminActionFilter}
                onChange={(e) => setAdminActionFilter(e.target.value)}
                className="py-1.5 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-800 font-medium cursor-pointer"
              >
                <option value="all">All Actions ({adminActivityLogs.length})</option>
                <option value="add_balance">Add INR (+₹)</option>
                <option value="deduct_balance">Deduct INR (-₹)</option>
                <option value="withdrawal_approved">Approve Withdrawal</option>
                <option value="withdrawal_rejected">Reject Withdrawal</option>
                <option value="user_deleted">Delete User</option>
              </select>
            </div>
          </div>

          {/* Admin Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Action &amp; Target User</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Log Details</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredAdminLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                      No admin activity logs matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAdminLogs.map((log: AdminActivityLog) => {
                    const isAdd = log.action === 'add_balance';
                    const isDeduct = log.action === 'deduct_balance';
                    const isWithdrawalApproved = log.action === 'withdrawal_approved';
                    const isWithdrawalRejected = log.action === 'withdrawal_rejected';
                    const isDelete = log.action === 'user_deleted';

                    return (
                      <tr key={log.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`p-1.5 rounded-lg shrink-0 ${
                                isAdd
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : isDeduct
                                  ? 'bg-amber-100 text-amber-700'
                                  : isWithdrawalApproved
                                  ? 'bg-blue-100 text-blue-700'
                                  : isWithdrawalRejected
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-zinc-800 text-white'
                              }`}
                            >
                              {isAdd && <PlusCircle className="w-4 h-4" />}
                              {isDeduct && <MinusCircle className="w-4 h-4" />}
                              {isWithdrawalApproved && <CheckCircle2 className="w-4 h-4" />}
                              {isWithdrawalRejected && <XCircle className="w-4 h-4" />}
                              {isDelete && <Trash2 className="w-4 h-4" />}
                            </span>
                            <div>
                              <div className="font-bold text-zinc-900 flex items-center gap-1.5 flex-wrap">
                                <span>{log.title}</span>
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                                <span className="text-zinc-700 font-medium">User: {log.targetUserName}</span>
                                {log.targetUserEid && (
                                  <span className="bg-zinc-100 text-zinc-800 px-1.5 py-0.2 rounded font-bold border border-zinc-200">
                                    {log.targetUserEid}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          {log.amountINR !== undefined ? (
                            <span
                              className={`font-black px-2 py-0.5 rounded text-xs ${
                                isAdd
                                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                  : isDeduct
                                  ? 'text-amber-800 bg-amber-50 border border-amber-200'
                                  : 'text-zinc-900 bg-zinc-100'
                              }`}
                            >
                              {isAdd ? '+' : isDeduct ? '-' : ''}₹{(log.amountINR ?? 0).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-zinc-600 max-w-md">
                          <p className="line-clamp-2 leading-relaxed text-[11px]">{log.details}</p>
                        </td>

                        <td className="py-3.5 px-4 text-zinc-700">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-md">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            {log.performedByAdmin}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PARTNER LOGS VIEW */}
      {activeLogTab === 'partner' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden space-y-4 p-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search partner logs by partner, user name, E-ID, action..."
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={partnerStatusFilter}
                onChange={(e) => setPartnerStatusFilter(e.target.value)}
                className="py-1.5 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-800 font-medium cursor-pointer"
              >
                <option value="all">All Payment Statuses ({partnerActivityLogs.length})</option>
                <option value="Approved">Approved</option>
                <option value="Credited">Credited</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Partner Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Partner</th>
                  <th className="py-3 px-4">Action on User</th>
                  <th className="py-3 px-4">Target User</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Amount (INR)</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPartnerLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 italic">
                      No partner activity logs matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPartnerLogs.map((log: PartnerActivityLog) => (
                    <tr key={log.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-bold text-zinc-900">{log.partnerName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-800">{log.action}</div>
                        <div className="text-[11px] text-zinc-500 line-clamp-1">{log.details}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900">{log.targetUserName}</div>
                        <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                          <span className="bg-zinc-100 px-1.5 py-0.2 rounded font-bold text-zinc-700 border border-zinc-200">
                            {log.targetUserEid}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            log.paymentStatus === 'Approved' || log.paymentStatus === 'Credited'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : log.paymentStatus === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {log.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-emerald-900">
                        ₹{(log.amountINR ?? 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{log.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-0.5">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{log.time}</span>
                        </div>
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
  );
};
