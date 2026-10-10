import React, { useState } from 'react';
import { useApp, isPartnerMatch } from '../../context/AppContext';
import { PartnerTab } from '../../types';
import {
  Inbox,
  UploadCloud,
  CreditCard,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  FileText,
  DollarSign,
  Send,
  Download,
  Trash2,
  FileUp,
  History,
} from 'lucide-react';

export const PartnerPanel: React.FC = () => {
  const {
    partnerTab,
    setPartnerTab,
    selectedPartnerName,
    setSelectedPartnerName,
    selectPartnerPanelToVerify,
    partnerPanels,
    partners,
    currentPartner,
    tasks,
    submissions,
    reviewSubmission,
    partnerUploads,
    addPartnerUpload,
    withdrawals,
    requestWithdrawal,
    partnerActivityLogs,
  } = useApp();

  // Review Modal State
  const [activeReviewSubId, setActiveReviewSubId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [holdReason, setHoldReason] = useState('');

  // Upload State
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('application/pdf');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadRelatedTaskId, setUploadRelatedTaskId] = useState('');

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [withdrawMethod, setWithdrawMethod] = useState<'Bank Transfer' | 'UPI' | 'Paytm'>('Bank Transfer');
  const [withdrawDetails, setWithdrawDetails] = useState(
    'A/C: 987654321098, IFSC: HDFC0001234, Apex Media LLP'
  );
  const [withdrawFeedback, setWithdrawFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Submissions assigned to current partner
  const assignedSubmissions = submissions.filter((s) =>
    isPartnerMatch(s.assignedPartnerName, selectedPartnerName)
  );

  // Tasks assigned to current partner
  const assignedTasks = tasks.filter((t) =>
    isPartnerMatch(t.assignedPartnerName, selectedPartnerName)
  );

  // Uploads by current partner
  const currentUploads = partnerUploads.filter((u) =>
    isPartnerMatch(u.partnerName, selectedPartnerName)
  );

  // Withdrawals for this partner
  const partnerWithdrawals = withdrawals.filter(
    (w) => w.role === 'partner' && isPartnerMatch(w.userName, selectedPartnerName)
  );

  const activeSub = submissions.find((s) => s.id === activeReviewSubId);

  const handleReviewAction = (decision: 'approved' | 'rejected' | 'on_hold') => {
    if (!activeSub) return;
    reviewSubmission(
      activeSub.id,
      decision,
      `${currentPartner.name} Reviewer`,
      'partner',
      reviewNotes || undefined,
      holdReason || undefined
    );
    setActiveReviewSubId(null);
    setReviewNotes('');
    setHoldReason('');
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    const matchedTask = tasks.find((t) => t.id === uploadRelatedTaskId);

    addPartnerUpload({
      partnerName: currentPartner.name,
      fileName: uploadFileName,
      fileType: uploadFileType,
      fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      relatedTaskId: uploadRelatedTaskId || undefined,
      relatedTaskTitle: matchedTask ? matchedTask.title : undefined,
      description: uploadDescription || 'Task verification guidelines and compliance assets.',
    });

    setUploadFileName('');
    setUploadDescription('');
    alert('File uploaded to campaign repository successfully!');
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestWithdrawal(Number(withdrawAmount), withdrawMethod, withdrawDetails, 'partner');
    setWithdrawFeedback(res);
    setTimeout(() => setWithdrawFeedback(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Partner Identity Bar */}
      <div className="bg-[#111726]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 shadow-xl shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{currentPartner.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                {currentPartner.status} Partner
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {currentPartner.agencyType} • Commission Split:{' '}
              <strong className="text-zinc-200">{currentPartner.commissionRatePercent}%</strong>
            </p>
          </div>
        </div>

        {/* Financial Escrow Balance & Switcher */}
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-2.5 text-right shadow-sm">
            <span className="text-[10px] uppercase font-bold text-emerald-400/80 block tracking-wider">
              Earned Commission
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              ₹{(Number(currentPartner?.earnedBalanceINR ?? 0)).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="hidden sm:block text-xs">
            <span className="text-zinc-400 block text-[10px] uppercase font-bold mb-1">Switch Partner</span>
            <select
              value={selectedPartnerName}
              onChange={(e) => {
                const target = partnerPanels.find(
                  (p) => p.uniquePartnerName === e.target.value || p.label === e.target.value
                );
                if (target) {
                  selectPartnerPanelToVerify(target.code);
                } else {
                  setSelectedPartnerName(e.target.value);
                }
              }}
              className="px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs font-semibold text-zinc-200 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {partnerPanels.map((p) => (
                <option key={p.code} value={p.uniquePartnerName} className="bg-[#111726] text-zinc-100">
                  {p.label}: {p.uniquePartnerName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs: Assign Requests, Upload, Withdrawal Request */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] overflow-x-auto pb-1">
        <button
          onClick={() => setPartnerTab('Assign Requests')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all rounded-xl border -mb-px ${
            partnerTab === 'Assign Requests'
              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 shadow-sm'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Assign Requests</span>
          {assignedSubmissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {assignedSubmissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setPartnerTab('Upload')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all rounded-xl border -mb-px ${
            partnerTab === 'Upload'
              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 shadow-sm'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload</span>
        </button>

        <button
          onClick={() => setPartnerTab('Withdrawal Request')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all rounded-xl border -mb-px ${
            partnerTab === 'Withdrawal Request'
              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 shadow-sm'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Withdrawal Request</span>
        </button>

        <button
          onClick={() => setPartnerTab('Activity Log')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all rounded-xl border -mb-px ${
            partnerTab === 'Activity Log'
              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 shadow-sm'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Activity Log</span>
        </button>
      </div>

      {/* Tab 1: Assign Requests */}
      {partnerTab === 'Assign Requests' && (
        <div className="space-y-6">
          {/* Submissions to Review */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Assigned Verification Reviews</h2>
                <p className="text-xs text-zinc-400">
                  Submissions routed to {currentPartner.name} by Admin for compliance checking.
                </p>
              </div>
              <span className="text-xs font-medium text-zinc-400">
                Total Submissions: <strong className="text-emerald-400 font-mono">{assignedSubmissions.length}</strong>
              </span>
            </div>

            <div className="bg-[#111726]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] border-b border-white/[0.08] text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Task &amp; Worker</th>
                      <th className="py-3 px-4">Proof Snapshot</th>
                      <th className="py-3 px-4">Reward</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {assignedSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-500">
                          No pending submission requests assigned to {currentPartner.name} at this time.
                        </td>
                      </tr>
                    ) : (
                      assignedSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-zinc-100">{sub.taskTitle}</div>
                            <div className="text-[11px] text-zinc-400">
                              By: <span className="text-cyan-400 font-medium">{sub.workerName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="text-zinc-300 line-clamp-1 text-[11px]">{sub.proofText}</p>
                            {sub.proofImage && (
                              <div className="mt-1 flex items-center gap-2">
                                <a
                                  href={sub.proofImage}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group relative inline-block border border-white/[0.1] rounded-lg overflow-hidden bg-black/40 shrink-0"
                                  title="Click to view proof"
                                >
                                  <img
                                    src={sub.proofImage}
                                    alt="Proof"
                                    className="w-10 h-10 object-cover hover:opacity-80 transition-opacity"
                                  />
                                </a>
                                <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]">
                                  {sub.proofFileName || 'screenshot.png'}
                                </span>
                              </div>
                            )}
                            {!sub.proofImage && sub.proofFileName && (
                              <span className="text-[10px] text-cyan-400 font-mono block">📎 {sub.proofFileName}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-mono">
                              ₹{sub.rewardINR}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {sub.status === 'submitted' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                <Clock className="w-3 h-3" /> Ready for Review
                              </span>
                            )}
                            {sub.status === 'under_review' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <Clock className="w-3 h-3" /> In Progress
                              </span>
                            )}
                            {sub.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle className="w-3 h-3" /> Approved
                              </span>
                            )}
                            {sub.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <XCircle className="w-3 h-3" /> Rejected
                              </span>
                            )}
                            {sub.status === 'on_hold' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                <AlertTriangle className="w-3 h-3" /> On Hold
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap font-mono text-[11px]">{sub.submittedAt}</td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setActiveReviewSubId(sub.id);
                                setReviewNotes('');
                                setHoldReason('');
                              }}
                              className="px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                            >
                              Review Proof
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Assigned Campaigns Portfolio */}
          <div className="space-y-3 pt-4 border-t border-white/[0.08]">
            <h2 className="text-base font-bold text-white tracking-tight">Campaigns Assigned to {currentPartner.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedTasks.map((task) => (
                <div key={task.id} className="bg-[#111726]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 space-y-3 shadow-xl shadow-black/20 hover:border-emerald-500/40 transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                    {task.category}
                  </span>
                  <h3 className="font-bold text-sm text-zinc-100">{task.title}</h3>
                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-white/[0.06]">
                    <span>Reward: <strong className="text-emerald-400 font-mono">₹{task.rewardINR}</strong></span>
                    <span>Slots: <strong className="text-zinc-200">{task.completedSlots}</strong>/{task.totalSlots}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Upload */}
      {partnerTab === 'Upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="bg-[#111726]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Upload Task Assets</h2>
                <p className="text-[11px] text-zinc-400">Upload guidelines, test criteria, or campaign files.</p>
              </div>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">File Name *</label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="e.g. Campaign_QA_Checklist_2026.pdf"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] text-zinc-100 rounded-xl placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">File Type</label>
                <select
                  value={uploadFileType}
                  onChange={(e) => setUploadFileType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-white/[0.1] text-zinc-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="application/pdf">PDF Document (.pdf)</option>
                  <option value="text/csv">CSV Data Sheet (.csv)</option>
                  <option value="application/msword">Word Document (.docx)</option>
                  <option value="image/png">Verification Image (.png / .jpg)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Associated Task (Optional)</label>
                <select
                  value={uploadRelatedTaskId}
                  onChange={(e) => setUploadRelatedTaskId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-white/[0.1] text-zinc-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="">General Agency Resource</option>
                  {assignedTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Asset Description</label>
                <textarea
                  rows={3}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief note on what this file contains..."
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] text-zinc-100 rounded-xl placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Drag and Drop Zone Simulator */}
              <div className="border-2 border-dashed border-white/[0.12] rounded-xl p-4 text-center bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer">
                <FileUp className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                <span className="text-xs text-zinc-200 font-semibold block">Choose file or drag &amp; drop</span>
                <span className="text-[10px] text-zinc-500">Supported: PDF, DOCX, CSV, PNG up to 10MB</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Publish File to System</span>
              </button>
            </form>
          </div>

          {/* Uploaded Files Table */}
          <div className="lg:col-span-2 bg-[#111726]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-sm font-bold text-white">Campaign Files Repository</h2>
              <span className="text-xs text-zinc-400 font-medium">Files: <strong className="text-emerald-400 font-mono">{currentUploads.length}</strong></span>
            </div>

            <div className="space-y-3">
              {currentUploads.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No files uploaded yet by {currentPartner.name}.
                </div>
              ) : (
                currentUploads.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-100">{file.fileName}</div>
                        <div className="text-[11px] text-zinc-400">
                          {file.fileSize} • {file.description}
                          {file.relatedTaskTitle && (
                            <span className="text-cyan-400 font-medium block">Task: {file.relatedTaskTitle}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 font-mono block">{file.uploadedAt}</span>
                      <button
                        onClick={() => alert(`Simulating download of ${file.fileName}`)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center gap-1 mt-1 justify-end"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Withdrawal Request */}
      {partnerTab === 'Withdrawal Request' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Withdrawal Request Form */}
          <div className="bg-[#111726]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Request Commission Payout</h2>
                <p className="text-[11px] text-zinc-400">Withdraw agency earnings to your verified bank account.</p>
              </div>
            </div>

            {withdrawFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  withdrawFeedback.success
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                {withdrawFeedback.message}
              </div>
            )}

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Available Commission</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ₹{(Number(currentPartner?.earnedBalanceINR ?? 0)).toLocaleString('en-IN')}
              </span>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Withdrawal Amount (INR ₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-zinc-500">₹</span>
                  <input
                    type="number"
                    min="100"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl font-bold text-zinc-100 font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Payout Method *</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-white/[0.1] rounded-xl font-medium text-zinc-200 focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="Paytm">Paytm Merchant Wallet</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Account &amp; Bank / UPI Details *</label>
                <textarea
                  rows={3}
                  required
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  placeholder="e.g. Account Number, IFSC Code, Account Name..."
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-[11px] text-zinc-100 focus:outline-hidden focus:border-emerald-500 placeholder:text-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={currentPartner.earnedBalanceINR < withdrawAmount}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Withdrawal Request</span>
              </button>
            </form>
          </div>

          {/* Partner Withdrawal History */}
          <div className="lg:col-span-2 bg-[#111726]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-sm font-bold text-white">Partner Withdrawal History</h2>
              <span className="text-xs text-zinc-400 font-medium">Requests: <strong className="text-emerald-400 font-mono">{partnerWithdrawals.length}</strong></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] border-b border-white/[0.08] text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Requested At</th>
                    <th className="py-2.5 px-3 text-right">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {partnerWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500">
                        No previous withdrawal requests for this partner agency.
                      </td>
                    </tr>
                  ) : (
                    partnerWithdrawals.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-mono">
                            ₹{(Number(item?.amountINR ?? 0)).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-zinc-200">{item.method}</td>
                        <td className="py-3 px-3">
                          {item.status === 'pending' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Pending Admin Approval
                            </span>
                          )}
                          {item.status === 'approved' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              Approved &amp; Queued
                            </span>
                          )}
                          {item.status === 'completed' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Settled
                            </span>
                          )}
                          {item.status === 'rejected' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Refunded
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-zinc-400 whitespace-nowrap font-mono text-[11px]">{item.requestedAt}</td>
                        <td className="py-3 px-3 text-right font-mono text-[11px] text-zinc-400">
                          {item.transactionRef || 'Processing'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Activity Log */}
      {partnerTab === 'Activity Log' && (
        <div className="bg-[#111726]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl shadow-black/20 space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                <span>Partner Activity &amp; Audit Log</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Transparent chronological log of reviews, approvals, rejections, holds, and file uploads performed by {currentPartner.name}.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
              {partnerActivityLogs.filter((l) => isPartnerMatch(l.partnerName, selectedPartnerName)).length} Logs Recorded
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] border-b border-white/[0.08] text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target User / Task</th>
                  <th className="py-3 px-4">Activity Details</th>
                  <th className="py-3 px-4">Partner Operator</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {partnerActivityLogs.filter((l) => isPartnerMatch(l.partnerName, selectedPartnerName)).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      No activity logs recorded yet for {currentPartner.name}.
                    </td>
                  </tr>
                ) : (
                  partnerActivityLogs
                    .filter((l) => isPartnerMatch(l.partnerName, selectedPartnerName))
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {log.targetUserEid ? (
                            <span className="font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded text-[11px]">
                              {log.targetUserEid}
                            </span>
                          ) : (
                            <span className="text-zinc-500 italic text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-zinc-200 max-w-md">{log.details}</td>
                        <td className="py-3.5 px-4 text-zinc-400 font-medium">{log.partnerName}</td>
                        <td className="py-3.5 px-4 text-right text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                          {log.timestamp}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Submission Modal for Partner */}
      {activeSub && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#111726] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-white/[0.12] text-xs text-zinc-100">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                  Partner Review Terminal
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">{activeSub.taskTitle}</h3>
              </div>
              <button
                onClick={() => setActiveReviewSubId(null)}
                className="text-zinc-400 hover:text-white font-bold p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.08]">
              <div>
                <span className="text-zinc-400 block text-[11px]">Worker:</span>
                <span className="font-bold text-white">{activeSub.workerName}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Reward to Worker:</span>
                <span className="font-bold text-emerald-400 font-mono">₹{activeSub.rewardINR}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Your Commission:</span>
                <span className="font-bold text-blue-400 font-mono">
                  +₹{Math.max(10, Math.round((activeSub.rewardINR * currentPartner.commissionRatePercent) / 100))}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Status:</span>
                <span className="capitalize font-bold text-zinc-200">{activeSub.status}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-300 block mb-1">Submitted Proof of Completion:</label>
              <div className="p-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-zinc-200 text-[11px] leading-relaxed">
                {activeSub.proofText || 'No text explanation submitted.'}
              </div>
            </div>

            {/* Uploaded Proof Screenshot / Image */}
            {activeSub.proofImage ? (
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">
                  Uploaded Proof Screenshot / Image:
                </label>
                <div className="border border-white/[0.1] rounded-xl overflow-hidden bg-black/40 p-2 inline-block max-w-full">
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
                      className="max-h-64 rounded-lg object-contain max-w-full hover:opacity-95 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold rounded-lg transition-opacity gap-1.5">
                      <span>Open Full Size</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </a>
                  {activeSub.proofFileName && (
                    <span className="text-[11px] text-zinc-400 block mt-1 font-mono">
                      📎 {activeSub.proofFileName}
                    </span>
                  )}
                </div>
              </div>
            ) : activeSub.proofFileName ? (
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Proof Attachment:</label>
                <span className="inline-block bg-white/[0.08] text-cyan-300 border border-white/[0.1] px-2.5 py-1 rounded-lg font-mono text-[11px]">
                  📎 {activeSub.proofFileName}
                </span>
              </div>
            ) : null}

            {activeSub.proofUrl && (
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Proof URL:</label>
                <a
                  href={activeSub.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  {activeSub.proofUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div>
              <label className="font-semibold text-zinc-300 block mb-1">Feedback / Rejection Reason</label>
              <input
                type="text"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional notes to worker..."
                className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/[0.1] text-zinc-100 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder:text-zinc-500"
              />
            </div>

            {/* Decision Buttons */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const hold = prompt('Reason for putting on hold:', 'Blurred screenshot; secondary inspection required.');
                  if (hold) {
                    setHoldReason(hold);
                    handleReviewAction('on_hold');
                  }
                }}
                className="px-3.5 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-semibold rounded-xl transition-colors"
              >
                Put on Hold
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction('rejected')}
                  className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold rounded-xl transition-colors"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction('approved')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
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
