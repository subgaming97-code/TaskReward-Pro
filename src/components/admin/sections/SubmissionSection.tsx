import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Submission, SubmissionStatus, Partner } from '../../../types';
import {
  CheckSquare,
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const SubmissionSection: React.FC = () => {
  const { submissions, reviewSubmission, partners } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  // Rejection modal note state
  const [rejectNotes, setRejectNotes] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

  const filtered = submissions.filter((sub: Submission) => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesPartner = partnerFilter === 'all' || sub.assignedPartnerName === partnerFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (sub.taskTitle && sub.taskTitle.toLowerCase().includes(q)) ||
      (sub.workerName && sub.workerName.toLowerCase().includes(q)) ||
      (sub.workerEmail && sub.workerEmail.toLowerCase().includes(q)) ||
      (sub.proofText && sub.proofText.toLowerCase().includes(q));
    return matchesStatus && matchesPartner && matchesSearch;
  });

  const activeSub = submissions.find((s: Submission) => s.id === activeSubId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            Master Audit Terminal
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Worker Submissions</h1>
          <p className="text-sm text-zinc-500">
            Inspect proof of work, verify compliance, credit rewards, or issue feedback.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-600 font-medium">
            Total Submissions: <strong className="text-zinc-900">{submissions.length}</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-emerald-800 font-medium">
            Approved: <strong className="text-emerald-900">{submissions.filter((s: Submission) => s.status === 'approved').length}</strong>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by worker, task, proof content..."
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
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted (Pending)</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        <div>
          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-800"
          >
            <option value="all">All Assigned Partners</option>
            {partners.map((p: Partner) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Task &amp; Worker</th>
                <th className="py-3 px-4">Proof Snapshot</th>
                <th className="py-3 px-4">Reward</th>
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">
                    No submissions found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((sub: Submission) => (
                  <tr key={sub.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-zinc-900 truncate">{sub.taskTitle}</div>
                      <div className="text-[11px] text-zinc-500">
                        Worker: <span className="font-medium text-zinc-800">{sub.workerName}</span> ({sub.workerEmail})
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-zinc-700 line-clamp-2 text-[11px]">{sub.proofText}</p>
                      {sub.proofImage && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <a
                            href={sub.proofImage}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative inline-block border border-zinc-200 rounded-lg overflow-hidden bg-zinc-100 shrink-0"
                            title="Click to view uploaded proof"
                          >
                            <img
                              src={sub.proofImage}
                              alt="Proof Screenshot"
                              className="w-10 h-10 object-cover hover:opacity-80 transition-opacity"
                            />
                          </a>
                          <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">
                            {sub.proofFileName || 'screenshot.png'}
                          </span>
                        </div>
                      )}
                      {!sub.proofImage && sub.proofFileName && (
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">📎 {sub.proofFileName}</span>
                      )}
                      {sub.proofUrl && (
                        <a
                          href={sub.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          Link Proof <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                        ₹{sub.rewardINR}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-700">{sub.assignedPartnerName}</td>
                    <td className="py-3 px-4">
                      {sub.status === 'submitted' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" /> Submitted
                        </span>
                      )}
                      {sub.status === 'under_review' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Under Review
                        </span>
                      )}
                      {sub.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                      {sub.status === 'on_hold' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          <AlertTriangle className="w-3 h-3" /> On Hold
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">{sub.submittedAt}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setActiveSubId(sub.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inspector */}
      {activeSub && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                  Submission Details #{activeSub.id}
                </span>
                <h3 className="text-lg font-bold text-zinc-900">{activeSub.taskTitle}</h3>
              </div>
              <button
                onClick={() => setActiveSubId(null)}
                className="text-zinc-400 hover:text-zinc-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div>
                  <span className="text-zinc-500 block">Worker Name:</span>
                  <span className="font-bold text-zinc-900">{activeSub.workerName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Payout Reward:</span>
                  <span className="font-bold text-emerald-700">₹{activeSub.rewardINR}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Assigned Partner:</span>
                  <span className="font-bold text-zinc-900">{activeSub.assignedPartnerName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Current Status:</span>
                  <span className="font-bold capitalize text-zinc-900">{activeSub.status}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">Worker's Proof Submission:</label>
                <div className="p-3 bg-zinc-100 rounded-lg text-zinc-800 text-[11px] leading-relaxed">
                  {activeSub.proofText || 'No text note entered.'}
                </div>
              </div>

              {activeSub.secretCodeProvided && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-blue-800">Verification Secret Code:</span>
                  <span className="ml-2 font-mono font-bold text-blue-900">{activeSub.secretCodeProvided}</span>
                </div>
              )}

              {/* Uploaded Proof Screenshot / Image */}
              {activeSub.proofImage ? (
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Uploaded Proof Screenshot / Image:
                  </label>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-100 p-2 inline-block max-w-full">
                    <a
                      href={activeSub.proofImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Click to view full size image in new tab"
                      className="block group relative"
                    >
                      <img
                        src={activeSub.proofImage}
                        alt="Uploaded Proof Screenshot"
                        className="max-h-64 rounded-lg object-contain max-w-full hover:opacity-95 transition-opacity bg-white"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold rounded-lg transition-opacity gap-1.5">
                        <span>Open Full Size</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                    {activeSub.proofFileName && (
                      <span className="text-[11px] text-zinc-600 block mt-1 font-mono">
                        📎 {activeSub.proofFileName}
                      </span>
                    )}
                  </div>
                </div>
              ) : activeSub.proofFileName ? (
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">Proof Attachment:</label>
                  <span className="inline-block bg-zinc-200 text-zinc-800 px-2 py-1 rounded-sm font-mono text-[11px]">
                    📎 {activeSub.proofFileName}
                  </span>
                </div>
              ) : null}

              {activeSub.proofUrl && (
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">Proof URL:</label>
                  <a
                    href={activeSub.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    {activeSub.proofUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {activeSub.reviewNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="font-semibold text-amber-900 block text-[11px]">Audit / Review Notes:</span>
                  <p className="text-[11px] text-amber-800">{activeSub.reviewNotes}</p>
                </div>
              )}
            </div>

            {/* Decision Controls */}
            <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
              <button
                onClick={() => {
                  reviewSubmission(activeSub.id, 'on_hold', 'Admin Officer', 'admin', 'Placed on hold by admin audit');
                  setActiveSubId(null);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
              >
                Put on Hold
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    reviewSubmission(activeSub.id, 'rejected', 'Admin Officer', 'admin', 'Quality requirements not satisfied');
                    setActiveSubId(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    reviewSubmission(activeSub.id, 'approved', 'Admin Officer', 'admin', 'Verified and approved by administrator');
                    setActiveSubId(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  Approve (Credit ₹{activeSub.rewardINR})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
