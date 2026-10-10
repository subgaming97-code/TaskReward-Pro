import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Worker } from '../../../types';
import { Users, Search, Wallet, ShieldAlert, PlusCircle, MinusCircle, UserCheck, Mail, ExternalLink, Eye } from 'lucide-react';
import { GoogleLogo } from '../../GoogleSignInModal';

interface UserSectionProps {
  onSelectWorkerEid?: (eid: string) => void;
}

export const UserSection: React.FC<UserSectionProps> = ({ onSelectWorkerEid }) => {
  const { workers, updateWorkerBalance } = useApp();

  const [search, setSearch] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number | ''>('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState<string>('Performance bonus');

  const cleanSearch = search.toLowerCase().trim();
  const searchDigits = cleanSearch.replace(/\D/g, '');
  const filtered = (workers || []).filter((w: Worker) => {
    if (!w) return false;
    if (!cleanSearch) return true;
    const matchesStandard =
      (w.eid && w.eid.toLowerCase().includes(cleanSearch)) ||
      (w.name && w.name.toLowerCase().includes(cleanSearch)) ||
      (w.email && w.email.toLowerCase().includes(cleanSearch)) ||
      (w.id && w.id.toLowerCase().includes(cleanSearch)) ||
      (w.uniqueUserId && w.uniqueUserId.toLowerCase().includes(cleanSearch)) ||
      (w.googleAccount?.email && w.googleAccount.email.toLowerCase().includes(cleanSearch));
    if (matchesStandard) return true;
    if (searchDigits.length >= 4) {
      const eidDigits = (w.eid || '').replace(/\D/g, '');
      const uidDigits = (w.uniqueUserId || '').replace(/\D/g, '');
      if (eidDigits.includes(searchDigits) || uidDigits.includes(searchDigits)) {
        return true;
      }
    }
    return false;
  });

  const googleLinkedCount = (workers || []).filter((w) => !!w?.googleAccount).length;

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker || adjustAmount === '' || Number(adjustAmount) <= 0) return;
    const numAmount = Number(adjustAmount);
    const delta = adjustType === 'credit' ? numAmount : -numAmount;
    updateWorkerBalance(selectedWorker.id, delta, adjustReason);
    setSelectedWorker(null);
    setAdjustAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            Account Management
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Worker &amp; User Directory</h1>
          <p className="text-sm text-zinc-500">
            Audit registered task performers, manage INR balances, and oversee compliance statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-600">
            Total Users: <strong className="text-zinc-900 font-bold">{(workers || []).length}</strong>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-800 flex items-center gap-1.5 font-medium">
            <GoogleLogo className="w-3.5 h-3.5" />
            <span>Google Linked:</span>
            <strong className="text-blue-950 font-bold">{googleLinkedCount}</strong>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name, email, Unique ID (e.g. UID-849201), or Google account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
          />
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">User &amp; Unique ID</th>
                <th className="py-3 px-4">Google Sign-In Mapping</th>
                <th className="py-3 px-4">Available Balance</th>
                <th className="py-3 px-4">Total Earned</th>
                <th className="py-3 px-4">Completed Tasks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((worker: Worker) => {
                if (!worker) return null;
                const availBal = Number(worker.availableBalanceINR ?? 0);
                const totEarned = Number(worker.totalEarnedINR ?? 0);
                const completedTasks = Number(worker.completedTasksCount ?? 0);

                return (
                  <tr key={worker.id || Math.random().toString()} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-zinc-900">{worker.name || 'Anonymous User'}</span>
                        <span className="font-mono text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded shadow-2xs" title="User E-ID">
                          {worker.eid || worker.uniqueUserId || 'EID-PENDING'}
                        </span>
                        {worker.uniqueUserId && (
                          <span className="font-mono text-[10px] text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200" title="User ID">
                            {worker.uniqueUserId}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-600 font-mono mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="font-semibold text-zinc-900">{worker.email || 'No email registered'}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-zinc-400">Ref: {worker.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {worker.googleAccount ? (
                        <div className="inline-flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 text-blue-900 px-2.5 py-1 rounded-lg text-[11px]">
                          <GoogleLogo className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-semibold">{worker.googleAccount.email}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic text-[11px]">
                          Not linked with Google
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                        ₹{availBal.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-700">
                      ₹{totEarned.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-zinc-800">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        {completedTasks}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          worker.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {worker.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500">{worker.joinedDate || 'Recent'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onSelectWorkerEid && (
                          <button
                            type="button"
                            onClick={() => onSelectWorkerEid(worker.eid || worker.uniqueUserId || worker.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors inline-flex items-center gap-1"
                            title={`Open ${worker.name}'s Account Page`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Account</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedWorker(worker)}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Wallet className="w-3 h-3" />
                          <span>Adjust Balance</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleAdjustSubmit}
            className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Adjust Balance</h3>
              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <div className="font-bold text-zinc-900">{selectedWorker.name}</div>
              <div className="text-[11px] text-zinc-500">
                Current Balance: ₹{(Number(selectedWorker.availableBalanceINR ?? 0)).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('credit')}
                className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 border transition-all ${
                  adjustType === 'credit'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Credit (+ ₹)
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('debit')}
                className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 border transition-all ${
                  adjustType === 'debit'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                }`}
              >
                <MinusCircle className="w-3.5 h-3.5" /> Debit (- ₹)
              </button>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Amount (INR ₹)</label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                placeholder="Enter amount (e.g. 250)"
                value={adjustAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setAdjustAmount('');
                  } else {
                    const n = Number(val);
                    if (!isNaN(n)) setAdjustAmount(n);
                  }
                }}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Audit Reason</label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Campaign reward bonus, QA incentive..."
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
              >
                Apply Adjustment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
