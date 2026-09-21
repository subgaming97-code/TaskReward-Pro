import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Submission } from '../../../types';
import { AlertCircle, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';

export const AppealsSection: React.FC = () => {
  const { submissions, resolveAppeal } = useApp();

  const [activeAppealId, setActiveAppealId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  // Appeals are submissions with appealStatus set
  const appealSubmissions = submissions.filter((s: Submission) => s.appealStatus && s.appealStatus !== 'none');

  const activeSub = submissions.find((s: Submission) => s.id === activeAppealId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">
            Dispute Resolution Desk
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Appeals &amp; Second Review</h1>
          <p className="text-sm text-zinc-500">
            Audit contested rejections filed by workers. Overturn false negatives or confirm final rejection.
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2 text-center">
          <span className="text-[11px] font-bold text-rose-700 uppercase block">Pending Appeals</span>
          <span className="text-xl font-extrabold text-rose-900">
            {appealSubmissions.filter((s: Submission) => s.appealStatus === 'pending').length}
          </span>
        </div>
      </div>

      {/* Appeals List */}
      <div className="space-y-4">
        {appealSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-400">
            No active appeals filed. All submission reviews are currently uncontested.
          </div>
        ) : (
          appealSubmissions.map((sub: Submission) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-2xs hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-zinc-900">{sub.taskTitle}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ₹{sub.rewardINR}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Appellant: <strong className="text-zinc-800">{sub.workerName}</strong> ({sub.workerEmail}) • Assigned Partner: {sub.assignedPartnerName}
                  </div>
                </div>

                <div>
                  {sub.appealStatus === 'pending' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5" /> Appeal Pending
                    </span>
                  ) : sub.appealStatus === 'resolved' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Overturned &amp; Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" /> Appeal Denied
                    </span>
                  )}
                </div>
              </div>

              {/* Contested details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 space-y-1.5">
                  <span className="font-bold text-rose-900 block text-[11px] uppercase tracking-wider">
                    Original Rejection Reason
                  </span>
                  <p className="text-rose-800 text-xs">{sub.reviewNotes || 'Task criteria not satisfied.'}</p>
                  <span className="text-[10px] text-rose-600 block">Reviewed by: {sub.reviewerName || 'Partner Reviewer'}</span>
                </div>

                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-1.5">
                  <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">
                    Worker's Appeal Justification
                  </span>
                  <p className="text-blue-800 text-xs">{sub.appealText || 'No statement provided.'}</p>
                  <span className="text-[10px] text-blue-600 block">Filed: {sub.appealSubmittedAt || 'Recent'}</span>
                </div>
              </div>

              {/* Submitted proof snapshot */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs space-y-1">
                <span className="font-semibold text-zinc-600 block text-[11px]">Original Proof Submitted:</span>
                <p className="text-zinc-800">{sub.proofText}</p>
                {sub.proofUrl && (
                  <a
                    href={sub.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-mono mt-1"
                  >
                    View Proof Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {sub.proofFileName && (
                  <span className="inline-block bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-sm font-mono text-[11px] mt-1">
                    📎 {sub.proofFileName}
                  </span>
                )}
              </div>

              {/* Action Buttons if Pending */}
              {sub.appealStatus === 'pending' && (
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                  <button
                    onClick={() => {
                      const note = prompt('Enter appeal rejection justification:', 'Evidence remains insufficient.');
                      if (note !== null) {
                        resolveAppeal(sub.id, false, note);
                      }
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    Maintain Rejection
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt('Enter overturn approval note:', 'Appeal verified by Admin Review Desk.');
                      if (note !== null) {
                        resolveAppeal(sub.id, true, note);
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                  >
                    Overturn &amp; Credit ₹{sub.rewardINR}
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
