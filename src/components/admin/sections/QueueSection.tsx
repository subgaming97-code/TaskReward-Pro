import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Submission, Partner } from '../../../types';
import {
  ListOrdered,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Search,
  ExternalLink,
} from 'lucide-react';

export const QueueSection: React.FC = () => {
  const {
    submissions,
    partners,
    reviewSubmission,
    assignTaskToPartner,
  } = useApp();

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // Queue items are submissions waiting for review or on hold
  const queueSubmissions = submissions.filter(
    (s: Submission) => s.status === 'submitted' || s.status === 'under_review' || s.status === 'on_hold'
  );

  const filteredQueue = queueSubmissions.filter((item: Submission) => {
    const matchesSearch =
      item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedPartnerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const selectedSub = submissions.find((s: Submission) => s.id === selectedSubmissionId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
              Pipeline Processing
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Q-U-U-E-U-E Management</h1>
          <p className="text-sm text-zinc-500">
            Real-time verification queue of worker submissions pending assignment or approval.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 text-center">
            <span className="text-[11px] font-bold text-blue-700 uppercase block">In Queue</span>
            <span className="text-xl font-extrabold text-blue-900">{queueSubmissions.length}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 text-center">
            <span className="text-[11px] font-bold text-amber-700 uppercase block">Under Review</span>
            <span className="text-xl font-extrabold text-amber-900">
              {queueSubmissions.filter((s: Submission) => s.status === 'under_review').length}
            </span>
          </div>
          <div className="bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2 text-center">
            <span className="text-[11px] font-bold text-zinc-600 uppercase block">Avg SLA</span>
            <span className="text-xl font-extrabold text-zinc-800">42m</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search queue by task, worker, partner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-500 font-medium">Quick Assign Partner:</span>
          <span className="text-xs text-zinc-400">Select an item below to re-assign or review directly</span>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Queue Item</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4">Reward</th>
                <th className="py-3 px-4">Assigned Partner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400 text-sm">
                    No submissions currently waiting in the processing queue.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item: Submission) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-zinc-900 max-w-xs truncate">
                      <div className="font-semibold text-zinc-900">{item.taskTitle}</div>
                      <span className="text-[10px] font-mono text-zinc-400">ID: {item.id}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700">
                      <div className="font-medium text-zinc-800">{item.workerName}</div>
                      <div className="text-[11px] text-zinc-400">{item.workerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-xs">
                        ₹{item.rewardINR}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-800 font-medium">{item.assignedPartnerName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'submitted' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" /> Submitted
                        </span>
                      )}
                      {item.status === 'under_review' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Under Review
                        </span>
                      )}
                      {item.status === 'on_hold' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          <AlertTriangle className="w-3 h-3" /> On Hold
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">{item.submittedAt}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedSubmissionId(item.id)}
                        className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        Inspect &amp; Act
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                  Queue Item Verification
                </span>
                <h3 className="text-lg font-bold text-zinc-900">{selectedSub.taskTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedSubmissionId(null)}
                className="text-zinc-400 hover:text-zinc-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div>
                  <span className="text-zinc-500 font-medium block">Worker:</span>
                  <span className="font-bold text-zinc-900">{selectedSub.workerName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium block">Reward Amount:</span>
                  <span className="font-bold text-emerald-700">₹{selectedSub.rewardINR}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium block">Currently Assigned To:</span>
                  <span className="font-bold text-zinc-900">{selectedSub.assignedPartnerName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium block">Status:</span>
                  <span className="capitalize font-semibold text-blue-700">{selectedSub.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">Submitted Proof Notes:</label>
                <div className="p-3 bg-zinc-100 rounded-lg text-zinc-800 font-mono text-[11px] whitespace-pre-wrap">
                  {selectedSub.proofText || 'No text note provided.'}
                </div>
              </div>

              {selectedSub.proofUrl && (
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">External Proof Link:</label>
                  <a
                    href={selectedSub.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    {selectedSub.proofUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {selectedSub.proofFileName && (
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">Attached File / Screenshot:</label>
                  <span className="inline-block bg-zinc-200 text-zinc-800 px-2 py-1 rounded-sm text-[11px] font-mono">
                    📎 {selectedSub.proofFileName}
                  </span>
                </div>
              )}

              {/* Re-assign partner directly from modal */}
              <div>
                <label className="font-semibold text-zinc-800 block mb-1">Transfer to Partner:</label>
                <div className="flex gap-2">
                  <select
                    id="queue-transfer-partner"
                    defaultValue={selectedSub.assignedPartnerName}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800"
                    onChange={(e) => {
                      assignTaskToPartner(selectedSub.taskId, e.target.value);
                      setSelectedSubmissionId(null);
                    }}
                  >
                    {partners.map((p: Partner) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Admin Actions */}
            <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  reviewSubmission(selectedSub.id, 'on_hold', 'Admin Queue Officer', 'admin', 'Held for deep verification');
                  setSelectedSubmissionId(null);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
              >
                Put on Hold
              </button>
              <button
                onClick={() => {
                  reviewSubmission(selectedSub.id, 'rejected', 'Admin Queue Officer', 'admin', 'Rejected from Admin queue audit');
                  setSelectedSubmissionId(null);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors"
              >
                Direct Reject
              </button>
              <button
                onClick={() => {
                  reviewSubmission(selectedSub.id, 'approved', 'Admin Queue Officer', 'admin', 'Approved from Admin queue audit');
                  setSelectedSubmissionId(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Direct Approve (Credit ₹{selectedSub.rewardINR})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
