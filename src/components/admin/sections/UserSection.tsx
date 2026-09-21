import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Worker } from '../../../types';
import { Users, Search, Wallet, ShieldAlert, PlusCircle, MinusCircle, UserCheck } from 'lucide-react';

export const UserSection: React.FC = () => {
  const { workers, updateWorkerBalance } = useApp();

  const [search, setSearch] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState<string>('Performance bonus');

  const filtered = workers.filter(
    (w: Worker) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;
    const delta = adjustType === 'credit' ? Number(adjustAmount) : -Number(adjustAmount);
    updateWorkerBalance(selectedWorker.id, delta, adjustReason);
    setSelectedWorker(null);
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

        <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs text-zinc-600">
          Total Workers: <strong className="text-zinc-900 text-sm font-bold">{workers.length}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search workers by name, email, or user ID..."
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
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Available Balance</th>
                <th className="py-3 px-4">Total Earned</th>
                <th className="py-3 px-4">Completed Tasks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((worker: Worker) => (
                <tr key={worker.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-900">{worker.name}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      {worker.email} • {worker.id}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                      ₹{worker.availableBalanceINR.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-zinc-700">
                    ₹{worker.totalEarnedINR.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-zinc-800">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      {worker.completedTasksCount}
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
                      {worker.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-500">{worker.joinedDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedWorker(worker)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Wallet className="w-3 h-3" />
                      <span>Adjust Balance</span>
                    </button>
                  </td>
                </tr>
              ))}
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
              <div className="text-[11px] text-zinc-500">Current Balance: ₹{selectedWorker.availableBalanceINR}</div>
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
                min="1"
                required
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
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
