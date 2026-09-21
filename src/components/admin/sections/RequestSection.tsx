import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { SystemRequest } from '../../../types';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

export const RequestSection: React.FC = () => {
  const { systemRequests, handleSystemRequest } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = systemRequests.filter((req: SystemRequest) => {
    if (filterType === 'all') return true;
    if (filterType === 'pending') return req.status === 'pending';
    if (filterType === 'resolved') return req.status !== 'pending';
    return req.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            Inbound Operations
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">System &amp; User Requests</h1>
          <p className="text-sm text-zinc-500">
            Manage worker verification documents, withdrawal limit upgrades, and agency partner requests.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === 'all' ? 'bg-white text-zinc-900 shadow-2xs font-semibold' : 'text-zinc-600'
            }`}
          >
            All Requests ({systemRequests.length})
          </button>
          <button
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === 'pending' ? 'bg-white text-zinc-900 shadow-2xs font-semibold' : 'text-zinc-600'
            }`}
          >
            Pending ({systemRequests.filter((r: SystemRequest) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterType('resolved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === 'resolved' ? 'bg-white text-zinc-900 shadow-2xs font-semibold' : 'text-zinc-600'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-zinc-400 bg-white rounded-xl border border-zinc-200">
            No requests matching the selected filter.
          </div>
        ) : (
          filtered.map((req: SystemRequest) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4 shadow-2xs hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    {req.type === 'limit_increase' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : req.type === 'partner_application' ? (
                      <UserPlus className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">{req.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <span>Requester: <strong className="text-zinc-700">{req.requesterName}</strong></span>
                      <span>•</span>
                      <span className="capitalize">{req.requesterRole}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {req.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  ) : req.status === 'approved' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      <XCircle className="w-3 h-3" /> Rejected
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100 leading-relaxed">
                {req.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100">
                <span>Requested: {req.requestedAt}</span>
                {req.requestedAmountINR && (
                  <span className="font-bold text-zinc-700">Requested Limit: ₹{req.requestedAmountINR}</span>
                )}
              </div>

              {/* Action Buttons if Pending */}
              {req.status === 'pending' && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleSystemRequest(req.id, false)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleSystemRequest(req.id, true)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Approve Request
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
