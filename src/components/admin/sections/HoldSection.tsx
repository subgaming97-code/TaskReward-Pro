import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Submission } from '../../../types';
import { Clock, AlertTriangle, CheckCircle, XCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export const HoldSection: React.FC = () => {
  const { submissions, reviewSubmission } = useApp();

  const [selectedHoldId, setSelectedHoldId] = useState<string | null>(null);

  const heldSubmissions = submissions.filter((s: Submission) => s.status === 'on_hold');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-purple-600 uppercase">
            Suspension &amp; Quality Audit
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Hold Queue Management</h1>
          <p className="text-sm text-zinc-500">
            Investigate submissions flagged for blurred proof, duplicate identifiers, or requiring supervisor second opinion.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl px-3.5 py-2 text-center">
          <span className="text-[11px] font-bold text-purple-700 uppercase block">Total On Hold</span>
          <span className="text-xl font-extrabold text-purple-900">{heldSubmissions.length}</span>
        </div>
      </div>

      {/* Held items list */}
      <div className="space-y-4">
        {heldSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-400">
            No submissions currently held in escrow.
          </div>
        ) : (
          heldSubmissions.map((sub: Submission) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-purple-200/80 p-5 space-y-4 shadow-2xs hover:border-purple-300 transition-colors"
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
                    Worker: <strong className="text-zinc-800">{sub.workerName}</strong> ({sub.workerEmail}) • Assigned Partner: {sub.assignedPartnerName}
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  <Clock className="w-3.5 h-3.5" /> Placed On Hold
                </span>
              </div>

              {/* Hold reason highlight */}
              <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-100 space-y-1">
                <span className="font-bold text-purple-900 block text-[11px] uppercase tracking-wider">
                  Hold Justification
                </span>
                <p className="text-purple-900 text-xs font-medium">
                  {sub.holdReason || sub.reviewNotes || 'Pending secondary compliance audit.'}
                </p>
                <span className="text-[10px] text-purple-600 block">Reviewer: {sub.reviewerName || 'Partner'}</span>
              </div>

              {/* Submitted proof */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs space-y-1">
                <span className="font-semibold text-zinc-600 block text-[11px]">Submitted Proof:</span>
                <p className="text-zinc-800">{sub.proofText}</p>
                {sub.proofUrl && (
                  <a
                    href={sub.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-mono mt-1"
                  >
                    View External URL <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {sub.proofFileName && (
                  <span className="inline-block bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-sm font-mono text-[11px] mt-1">
                    📎 {sub.proofFileName}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  onClick={() => {
                    const note = prompt('Enter rejection feedback:', 'Defects found during hold audit.');
                    if (note !== null) {
                      reviewSubmission(sub.id, 'rejected', 'Admin Hold Audit', 'admin', note);
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  Reject Submission
                </button>
                <button
                  onClick={() => {
                    reviewSubmission(sub.id, 'approved', 'Admin Hold Audit', 'admin', 'Released from hold and approved.');
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                >
                  Release &amp; Credit ₹{sub.rewardINR}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
