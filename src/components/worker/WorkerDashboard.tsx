import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkerTab, Task } from '../../types';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Wallet,
  CreditCard,
  Send,
  ExternalLink,
  ShieldCheck,
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const {
    workerTab,
    setWorkerTab,
    currentWorker,
    tasks,
    submissions,
    submitTaskProof,
    withdrawals,
    requestWithdrawal,
    submitAppeal,
    settings,
  } = useApp();

  // Task Submission Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofText, setProofText] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState<number>(250);
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'Bank Transfer' | 'Paytm'>('UPI');
  const [withdrawDetails, setWithdrawDetails] = useState('worker@okhdfcbank');
  const [withdrawFeedback, setWithdrawFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Appeal Modal
  const [appealingSubId, setAppealingSubId] = useState<string | null>(null);
  const [appealNotes, setAppealNotes] = useState('');

  // Submissions for this worker
  const mySubmissions = submissions.filter((s) => s.workerId === currentWorker.id);
  const myWithdrawals = withdrawals.filter((w) => w.role === 'worker' && w.userId === currentWorker.id);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter === 'All') return true;
    return t.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !proofText.trim()) return;

    const res = submitTaskProof(
      selectedTask.id,
      proofText,
      proofUrl || undefined,
      proofFileName || undefined,
      secretCode || undefined
    );

    if (res.success) {
      setSubmissionSuccess(res.message);
      setSelectedTask(null);
      setProofText('');
      setProofUrl('');
      setProofFileName('');
      setSecretCode('');
      setTimeout(() => setSubmissionSuccess(null), 4000);
    } else {
      alert(res.message);
    }
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestWithdrawal(Number(withdrawAmount), withdrawMethod, withdrawDetails, 'worker');
    setWithdrawFeedback(res);
    setTimeout(() => setWithdrawFeedback(null), 4000);
  };

  const handleFileAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealingSubId || !appealNotes.trim()) return;
    submitAppeal(appealingSubId, appealNotes);
    setAppealingSubId(null);
    setAppealNotes('');
    alert('Appeal filed successfully and routed to Admin Disputes Review Desk.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Worker Hero Profile & Income Metrics in INR */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Worker Workspace
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Welcome, {currentWorker.name}</h1>
            <p className="text-xs text-zinc-500">
              Earn reliable daily income in INR by completing verified campaigns, tests, and reviews.
            </p>
          </div>

          <button
            onClick={() => setWorkerTab('Withdraw')}
            className="self-start md:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            <span>Withdraw Earnings (₹)</span>
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Available Balance */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
            <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider block">
              Available Balance
            </span>
            <div className="text-3xl font-black text-emerald-950 mt-1">
              ₹{currentWorker.availableBalanceINR.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 block">
              Ready for immediate UPI / Bank withdrawal
            </span>
          </div>

          {/* Income in INR */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider block">
              Lifetime Income in INR
            </span>
            <div className="text-3xl font-black text-zinc-900 mt-1">
              ₹{currentWorker.totalEarnedINR.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">Cumulative verified task payouts</span>
          </div>

          {/* Completed Tasks */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider block">
              Completed Tasks
            </span>
            <div className="text-3xl font-black text-zinc-900 mt-1">
              {currentWorker.completedTasksCount}
            </div>
            <span className="text-[11px] text-blue-600 mt-1 block font-medium">
              Rank: Verified Contributor
            </span>
          </div>
        </div>
      </div>

      {submissionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{submissionSuccess}</span>
        </div>
      )}

      {/* Worker Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <button
          onClick={() => setWorkerTab('Available Tasks')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            workerTab === 'Available Tasks'
              ? 'border-blue-600 text-blue-800 bg-blue-50/40'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Available Tasks ({filteredTasks.length})</span>
        </button>

        <button
          onClick={() => setWorkerTab('My Submissions')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            workerTab === 'My Submissions'
              ? 'border-blue-600 text-blue-800 bg-blue-50/40'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Submissions &amp; Status ({mySubmissions.length})</span>
        </button>

        <button
          onClick={() => setWorkerTab('Withdraw')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            workerTab === 'Withdraw'
              ? 'border-blue-600 text-blue-800 bg-blue-50/40'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Withdraw &amp; History</span>
        </button>
      </div>

      {/* Tab 1: Available Tasks */}
      {workerTab === 'Available Tasks' && (
        <div className="space-y-6">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Social Media', 'App Testing', 'Surveys', 'Content Review', 'Referral'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => {
              const alreadySubmitted = mySubmissions.some((s) => s.taskId === task.id);
              const slotsLeft = task.totalSlots - task.completedSlots;

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-2xs hover:border-zinc-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {task.category}
                      </span>
                      <span className="text-base font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        ₹{task.rewardINR}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-zinc-900 leading-snug">{task.title}</h3>
                    <p className="text-xs text-zinc-500 line-clamp-2">{task.description}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-zinc-100">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Time: {task.estimatedMinutes} mins</span>
                      <span>Reviewer: {task.assignedPartnerName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">
                        Slots: <strong className="text-zinc-800">{slotsLeft}</strong> remaining
                      </span>
                      <span className="text-[10px] font-medium text-zinc-400">ID: {task.id}</span>
                    </div>

                    <button
                      onClick={() => setSelectedTask(task)}
                      disabled={task.status !== 'active' || slotsLeft <= 0}
                      className={`w-full py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs ${
                        alreadySubmitted
                          ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>{alreadySubmitted ? 'Submit Additional Proof' : 'Start / Submit Task'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: My Submissions & Status */}
      {workerTab === 'My Submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">My Task Submissions &amp; Audits</h2>
              <p className="text-xs text-zinc-500">
                Track status updates from partner reviewers or file appeals if an entry was rejected.
              </p>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              Submissions: <strong>{mySubmissions.length}</strong>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Task Details</th>
                    <th className="py-3 px-4">Reward (INR)</th>
                    <th className="py-3 px-4">Submitted Proof</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4">Feedback &amp; Reviewer</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {mySubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-zinc-400">
                        You have not submitted any task proofs yet. Browse Available Tasks to start earning.
                      </td>
                    </tr>
                  ) : (
                    mySubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-zinc-900">{sub.taskTitle}</div>
                          <div className="text-[11px] text-zinc-500">
                            Partner: <strong className="text-zinc-700">{sub.assignedPartnerName}</strong> • {sub.submittedAt}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                            ₹{sub.rewardINR}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-zinc-700 line-clamp-2 text-[11px]">{sub.proofText}</p>
                          {sub.proofUrl && (
                            <a
                              href={sub.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline text-[11px] flex items-center gap-1 mt-0.5"
                            >
                              URL link <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {sub.proofFileName && (
                            <span className="text-[10px] text-zinc-500 font-mono block">📎 {sub.proofFileName}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {sub.status === 'submitted' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              <Clock className="w-3 h-3" /> Submitted
                            </span>
                          )}
                          {sub.status === 'under_review' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> Under Review
                            </span>
                          )}
                          {sub.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Approved &amp; Paid
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

                        <td className="py-3.5 px-4 max-w-xs">
                          {sub.reviewNotes ? (
                            <div className="text-[11px] text-zinc-700">
                              <span>"{sub.reviewNotes}"</span>
                              <span className="text-[10px] text-zinc-400 block mt-0.5">By {sub.reviewerName}</span>
                            </div>
                          ) : sub.holdReason ? (
                            <div className="text-[11px] text-purple-800">
                              <span>Hold reason: "{sub.holdReason}"</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-[11px] italic">In review queue</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {sub.status === 'rejected' && (!sub.appealStatus || sub.appealStatus === 'none') && (
                            <button
                              onClick={() => setAppealingSubId(sub.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                            >
                              File Appeal
                            </button>
                          )}
                          {sub.appealStatus === 'pending' && (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              Appeal Pending
                            </span>
                          )}
                          {sub.appealStatus === 'resolved' && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Appeal Granted
                            </span>
                          )}
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

      {/* Tab 3: Withdraw & History */}
      {workerTab === 'Withdraw' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Withdrawal Form */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Request Payout (INR ₹)</h2>
                <p className="text-[11px] text-zinc-500">Instant validation against available balance.</p>
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
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Available Balance</span>
              <span className="text-2xl font-black text-emerald-950">
                ₹{currentWorker.availableBalanceINR.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-800 block mt-0.5">
                Minimum Withdrawal: ₹{settings.minWithdrawalINR}
              </span>
            </div>

            <form onSubmit={handleWithdrawal} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Amount to Withdraw (INR ₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-400">₹</span>
                  <input
                    type="number"
                    min={settings.minWithdrawalINR}
                    max={currentWorker.availableBalanceINR}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Payout Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Bank Transfer', 'Paytm'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setWithdrawMethod(m)}
                      className={`py-2 px-1 text-center font-bold text-xs rounded-lg border transition-all ${
                        withdrawMethod === m
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  {withdrawMethod === 'UPI'
                    ? 'UPI ID (e.g. name@okhdfcbank) *'
                    : withdrawMethod === 'Bank Transfer'
                    ? 'Bank Account & IFSC *'
                    : 'Paytm Mobile Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={currentWorker.availableBalanceINR < Number(withdrawAmount) || Number(withdrawAmount) < settings.minWithdrawalINR}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit Withdrawal Request</span>
              </button>
            </form>
          </div>

          {/* Worker Withdrawal History */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Withdrawal History (INR)</h2>
              <span className="text-xs text-zinc-500 font-medium">Requests: {myWithdrawals.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Destination Details</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Requested At</th>
                    <th className="py-2.5 px-3 text-right">UTR / Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {myWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-zinc-400">
                        No withdrawal requests yet. Your payout transactions will appear here.
                      </td>
                    </tr>
                  ) : (
                    myWithdrawals.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                            ₹{item.amountINR.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-zinc-800">{item.method}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-zinc-600 max-w-xs truncate">
                          {item.payoutDetails}
                        </td>
                        <td className="py-3 px-3">
                          {item.status === 'pending' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Review
                            </span>
                          )}
                          {item.status === 'approved' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              In Transit
                            </span>
                          )}
                          {item.status === 'completed' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Paid
                            </span>
                          )}
                          {item.status === 'rejected' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              Declined &amp; Refunded
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-zinc-500 whitespace-nowrap">{item.requestedAt}</td>
                        <td className="py-3 px-3 text-right font-mono text-[11px] text-zinc-500">
                          {item.transactionRef || 'Pending Settlement'}
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

      {/* Task Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleTaskSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                  Campaign Verification
                </span>
                <h3 className="text-base font-bold text-zinc-900">{selectedTask.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Task Info Snapshot */}
            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700">Completion Reward:</span>
                <span className="font-extrabold text-emerald-800 text-sm bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ₹{selectedTask.rewardINR}
                </span>
              </div>
              <p className="text-zinc-600 text-[11px]">{selectedTask.proofInstructions}</p>
            </div>

            {/* If secret survey code required */}
            {selectedTask.secretKey && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <label className="font-bold text-amber-900 block">
                  Secret Verification Passkey / Voucher Code *
                </label>
                <input
                  type="text"
                  required
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  placeholder="Enter secret passkey (e.g. SURV-9941)"
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono font-bold text-amber-950"
                />
                <span className="text-[10px] text-amber-700 block">
                  This code matches the survey end-card or voucher key.
                </span>
              </div>
            )}

            {/* Proof Explanation */}
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">
                Proof of Completion / Summary *
              </label>
              <textarea
                rows={3}
                required
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                placeholder="Describe how you completed the task, account username used, survey completion timestamp..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>

            {/* Proof URL */}
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Proof URL / Post Link (Optional)</label>
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://example.com/proof/link..."
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-xs"
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">
                Screenshot / Document Proof (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={proofFileName}
                  onChange={(e) => setProofFileName(e.target.value)}
                  placeholder="e.g. payment_confirmation_screenshot.png"
                  className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setProofFileName(`proof_${Date.now()}.png`)}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium"
                >
                  Simulate Attach
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
              >
                Submit for ₹{selectedTask.rewardINR}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* File Appeal Modal */}
      {appealingSubId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleFileAppealSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-base font-bold text-zinc-900">File Submission Appeal</h3>
              <button
                type="button"
                onClick={() => setAppealingSubId(null)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-zinc-600 text-xs">
              If you believe your submission met all guidelines or the rejection was mistaken, provide your clarification below for Admin review.
            </p>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Appeal Justification *</label>
              <textarea
                rows={4}
                required
                value={appealNotes}
                onChange={(e) => setAppealNotes(e.target.value)}
                placeholder="Explain why the task requirements were satisfied and provide additional details..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setAppealingSubId(null)}
                className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Submit Appeal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
