import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';

export const PartnerPanel: React.FC = () => {
  const {
    partnerTab,
    setPartnerTab,
    selectedPartnerName,
    setSelectedPartnerName,
    partners,
    currentPartner,
    tasks,
    submissions,
    reviewSubmission,
    partnerUploads,
    addPartnerUpload,
    withdrawals,
    requestWithdrawal,
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
  const assignedSubmissions = submissions.filter(
    (s) => s.assignedPartnerName.toLowerCase() === selectedPartnerName.toLowerCase()
  );

  // Tasks assigned to current partner
  const assignedTasks = tasks.filter(
    (t) => t.assignedPartnerName.toLowerCase() === selectedPartnerName.toLowerCase()
  );

  // Uploads by current partner
  const currentUploads = partnerUploads.filter(
    (u) => u.partnerName.toLowerCase() === selectedPartnerName.toLowerCase()
  );

  // Withdrawals for this partner
  const partnerWithdrawals = withdrawals.filter(
    (w) => w.role === 'partner' && w.userName.toLowerCase() === selectedPartnerName.toLowerCase()
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
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{currentPartner.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                {currentPartner.status} Partner
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              {currentPartner.agencyType} • Commission Split:{' '}
              <strong className="text-zinc-800">{currentPartner.commissionRatePercent}%</strong>
            </p>
          </div>
        </div>

        {/* Financial Escrow Balance & Switcher */}
        <div className="flex items-center gap-4">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              Earned Commission
            </span>
            <span className="text-2xl font-black text-emerald-800">
              ₹{currentPartner.earnedBalanceINR.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="hidden sm:block text-xs">
            <span className="text-zinc-400 block text-[10px] uppercase font-bold mb-1">Switch Partner</span>
            <select
              value={selectedPartnerName}
              onChange={(e) => setSelectedPartnerName(e.target.value)}
              className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-hidden"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs: Assign Requests, Upload, Withdrawal Request */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <button
          onClick={() => setPartnerTab('Assign Requests')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            partnerTab === 'Assign Requests'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/30'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Assign Requests</span>
          {assignedSubmissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {assignedSubmissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setPartnerTab('Upload')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            partnerTab === 'Upload'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/30'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload</span>
        </button>

        <button
          onClick={() => setPartnerTab('Withdrawal Request')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            partnerTab === 'Withdrawal Request'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/30'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Withdrawal Request</span>
        </button>
      </div>

      {/* Tab 1: Assign Requests */}
      {partnerTab === 'Assign Requests' && (
        <div className="space-y-6">
          {/* Submissions to Review */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Assigned Verification Reviews</h2>
                <p className="text-xs text-zinc-500">
                  Submissions routed to {currentPartner.name} by Admin for compliance checking.
                </p>
              </div>
              <span className="text-xs font-medium text-zinc-500">
                Total Submissions: <strong className="text-zinc-900">{assignedSubmissions.length}</strong>
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Task &amp; Worker</th>
                      <th className="py-3 px-4">Proof Snapshot</th>
                      <th className="py-3 px-4">Reward</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {assignedSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-zinc-400">
                          No pending submission requests assigned to {currentPartner.name} at this time.
                        </td>
                      </tr>
                    ) : (
                      assignedSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-zinc-900">{sub.taskTitle}</div>
                            <div className="text-[11px] text-zinc-500">
                              By: <span className="text-zinc-800 font-medium">{sub.workerName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="text-zinc-700 line-clamp-1 text-[11px]">{sub.proofText}</p>
                            {sub.proofFileName && (
                              <span className="text-[10px] text-blue-600 font-mono block">📎 {sub.proofFileName}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                              ₹{sub.rewardINR}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {sub.status === 'submitted' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                <Clock className="w-3 h-3" /> Ready for Review
                              </span>
                            )}
                            {sub.status === 'under_review' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" /> In Progress
                              </span>
                            )}
                            {sub.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3" /> Approved
                              </span>
                            )}
                            {sub.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3 h-3" /> Rejected
                              </span>
                            )}
                            {sub.status === 'on_hold' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                <AlertTriangle className="w-3 h-3" /> On Hold
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">{sub.submittedAt}</td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setActiveReviewSubId(sub.id);
                                setReviewNotes('');
                                setHoldReason('');
                              }}
                              className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-2xs"
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
          <div className="space-y-3 pt-4 border-t border-zinc-200">
            <h2 className="text-base font-bold text-zinc-900">Campaigns Assigned to {currentPartner.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                    {task.category}
                  </span>
                  <h3 className="font-bold text-sm text-zinc-900">{task.title}</h3>
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                    <span>Reward: <strong className="text-emerald-700">₹{task.rewardINR}</strong></span>
                    <span>Slots: <strong>{task.completedSlots}</strong>/{task.totalSlots}</span>
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
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <UploadCloud className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Upload Task Assets</h2>
                <p className="text-[11px] text-zinc-500">Upload guidelines, test criteria, or campaign files.</p>
              </div>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">File Name *</label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="e.g. Campaign_QA_Checklist_2026.pdf"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">File Type</label>
                <select
                  value={uploadFileType}
                  onChange={(e) => setUploadFileType(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg"
                >
                  <option value="application/pdf">PDF Document (.pdf)</option>
                  <option value="text/csv">CSV Data Sheet (.csv)</option>
                  <option value="application/msword">Word Document (.docx)</option>
                  <option value="image/png">Verification Image (.png / .jpg)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Associated Task (Optional)</label>
                <select
                  value={uploadRelatedTaskId}
                  onChange={(e) => setUploadRelatedTaskId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg"
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
                <label className="font-semibold text-zinc-700 block mb-1">Asset Description</label>
                <textarea
                  rows={3}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief note on what this file contains..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>

              {/* Drag and Drop Zone Simulator */}
              <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors cursor-pointer">
                <FileUp className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                <span className="text-xs text-zinc-700 font-semibold block">Choose file or drag &amp; drop</span>
                <span className="text-[10px] text-zinc-400">Supported: PDF, DOCX, CSV, PNG up to 10MB</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Publish File to System</span>
              </button>
            </form>
          </div>

          {/* Uploaded Files Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Campaign Files Repository</h2>
              <span className="text-xs text-zinc-500 font-medium">Files: {currentUploads.length}</span>
            </div>

            <div className="space-y-3">
              {currentUploads.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  No files uploaded yet by {currentPartner.name}.
                </div>
              ) : (
                currentUploads.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900">{file.fileName}</div>
                        <div className="text-[11px] text-zinc-500">
                          {file.fileSize} • {file.description}
                          {file.relatedTaskTitle && (
                            <span className="text-blue-600 font-medium block">Task: {file.relatedTaskTitle}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">{file.uploadedAt}</span>
                      <button
                        onClick={() => alert(`Simulating download of ${file.fileName}`)}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1 mt-1 justify-end"
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
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Request Commission Payout</h2>
                <p className="text-[11px] text-zinc-500">Withdraw agency earnings to your verified bank account.</p>
              </div>
            </div>

            {withdrawFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  withdrawFeedback.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {withdrawFeedback.message}
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Available Commission</span>
              <span className="text-2xl font-black text-emerald-900">
                ₹{currentPartner.earnedBalanceINR.toLocaleString('en-IN')}
              </span>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Withdrawal Amount (INR ₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-400">₹</span>
                  <input
                    type="number"
                    min="100"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Payout Method *</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg font-medium"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="Paytm">Paytm Merchant Wallet</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Account &amp; Bank / UPI Details *</label>
                <textarea
                  rows={3}
                  required
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  placeholder="e.g. Account Number, IFSC Code, Account Name..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={currentPartner.earnedBalanceINR < withdrawAmount}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit Withdrawal Request</span>
              </button>
            </form>
          </div>

          {/* Partner Withdrawal History */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Partner Withdrawal History</h2>
              <span className="text-xs text-zinc-500 font-medium">Requests: {partnerWithdrawals.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Requested At</th>
                    <th className="py-2.5 px-3 text-right">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {partnerWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-zinc-400">
                        No previous withdrawal requests for this partner agency.
                      </td>
                    </tr>
                  ) : (
                    partnerWithdrawals.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                            ₹{item.amountINR.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-zinc-800">{item.method}</td>
                        <td className="py-3 px-3">
                          {item.status === 'pending' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Admin Approval
                            </span>
                          )}
                          {item.status === 'approved' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              Approved &amp; Queued
                            </span>
                          )}
                          {item.status === 'completed' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Settled
                            </span>
                          )}
                          {item.status === 'rejected' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              Refunded
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-zinc-500 whitespace-nowrap">{item.requestedAt}</td>
                        <td className="py-3 px-3 text-right font-mono text-[11px] text-zinc-500">
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

      {/* Review Submission Modal for Partner */}
      {activeSub && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                  Partner Review Terminal
                </span>
                <h3 className="text-lg font-bold text-zinc-900">{activeSub.taskTitle}</h3>
              </div>
              <button
                onClick={() => setActiveReviewSubId(null)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <div>
                <span className="text-zinc-500 block">Worker:</span>
                <span className="font-bold text-zinc-900">{activeSub.workerName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Reward to Worker:</span>
                <span className="font-bold text-emerald-700">₹{activeSub.rewardINR}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Your Commission:</span>
                <span className="font-bold text-blue-700">
                  +₹{Math.max(10, Math.round((activeSub.rewardINR * currentPartner.commissionRatePercent) / 100))}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Status:</span>
                <span className="capitalize font-bold text-zinc-900">{activeSub.status}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-800 block mb-1">Submitted Proof of Completion:</label>
              <div className="p-3 bg-zinc-100 rounded-lg text-zinc-800 text-[11px] leading-relaxed">
                {activeSub.proofText || 'No text explanation submitted.'}
              </div>
            </div>

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

            {activeSub.proofFileName && (
              <div>
                <label className="font-semibold text-zinc-800 block mb-1">Proof Attachment:</label>
                <span className="inline-block bg-zinc-200 text-zinc-800 px-2 py-1 rounded-sm font-mono text-[11px]">
                  📎 {activeSub.proofFileName}
                </span>
              </div>
            )}

            <div>
              <label className="font-semibold text-zinc-800 block mb-1">Feedback / Rejection Reason</label>
              <input
                type="text"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional notes to worker..."
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>

            {/* Decision Buttons */}
            <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const hold = prompt('Reason for putting on hold:', 'Blurred screenshot; secondary inspection required.');
                  if (hold) {
                    setHoldReason(hold);
                    handleReviewAction('on_hold');
                  }
                }}
                className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold rounded-lg transition-colors"
              >
                Put on Hold
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction('rejected')}
                  className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction('approved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-xs"
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
