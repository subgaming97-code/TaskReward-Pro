import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Copy,
  Check,
  Clock,
  ShieldCheck,
  IndianRupee,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Sparkles,
  ExternalLink,
  Info,
  CreditCard,
  Send,
} from 'lucide-react';

interface AddDepositFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export const AddDepositForm: React.FC<AddDepositFormProps> = ({ onSuccess, isModal = false }) => {
  const { createDepositRequest, depositRequests, currentWorker, notify } = useApp();

  // Form Fields
  const [senderName, setSenderName] = useState('');
  const [amountINR, setAmountINR] = useState<string>('');
  const [utr, setUtr] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const ADMIN_UPI_ID = 'soumodipbera@fam';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(ADMIN_UPI_ID);
    setCopiedUpi(true);
    notify(`UPI ID "${ADMIN_UPI_ID}" copied to clipboard!`);
    setTimeout(() => setCopiedUpi(false), 2200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanSender = senderName.trim();
    const cleanUtr = utr.trim().replace(/\s+/g, '');
    const numAmount = Number(amountINR);

    if (!cleanSender) {
      setFormError('Please enter the Payment Sender Name (name on your UPI/bank account).');
      return;
    }

    if (!amountINR.trim() || isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid deposit amount in INR.');
      return;
    }

    if (!cleanUtr || cleanUtr.length < 8) {
      setFormError('Please enter a valid UTR / UPI Reference Number (typically 12 digits).');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await createDepositRequest({
        senderName: cleanSender,
        amountINR: numAmount,
        utr: cleanUtr,
      });

      if (ok) {
        setFormSuccess(true);
        setSenderName('');
        setAmountINR('');
        setUtr('');
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1800);
        }
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit deposit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recent deposits submitted by the current worker
  const myRecentDeposits = depositRequests.filter(
    (d) =>
      d.userId === currentWorker.id ||
      d.userId === currentWorker.uniqueUserId ||
      d.userId === currentWorker.eid
  );

  return (
    <div className={`space-y-6 ${isModal ? '' : 'max-w-5xl mx-auto'}`}>
      {/* 8-Hour SLA Header Banner */}
      <div className="bg-gradient-to-r from-[#0d172c] via-[#10203f] to-[#0d172c] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/15 px-3 py-1 rounded-xl border border-cyan-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Instant UPI Gateway &amp; Escrow</span>
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>8-Hour Approval Window</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Add Deposit for Esports Tournaments</span>
            </h2>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Transfer directly to the official administrator UPI ID <strong>soumodipbera@fam</strong>.
              Deposits are verified manually against banking statements and approved within 8 hours.
            </p>
          </div>

          <div className="bg-[#080d1a]/80 border border-white/[0.08] p-3.5 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Current Wallet Balance
              </span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                ₹{Number(currentWorker.availableBalanceINR || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side Payment Gateway Info / Right Side Deposit Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ======================================================== */}
        {/* LEFT COLUMN: ADMINISTRATOR UPI PAYMENT DETAILS (5 cols)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-[#111726] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span>Administrator Payment Gateway</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20 font-bold">
                UPI Official
              </span>
            </div>

            {/* Prominent UPI ID Card */}
            <div className="bg-gradient-to-br from-[#0c162d] via-[#101e3b] to-[#0c162d] border border-cyan-500/30 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Money via UPI</span>
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Verified Gateway
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Administrator UPI ID
                </span>
                <div className="flex items-center gap-2 bg-[#060b17] border border-cyan-500/40 rounded-xl p-3 shadow-inner">
                  <span className="font-mono text-base sm:text-lg font-black text-cyan-300 tracking-wide select-all flex-1 truncate">
                    {ADMIN_UPI_ID}
                  </span>
                  <button
                    type="button"
                    id="copy-administrator-upi-id-btn"
                    onClick={handleCopyUpi}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      copiedUpi
                        ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30 font-black'
                        : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 hover:text-white'
                    }`}
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
                <span>Account Holder:</span>
                <span className="text-white font-bold font-mono">Soumodip Bera</span>
              </div>
            </div>

            {/* Supported Payment Apps */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Supported UPI Applications:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: 'Google Pay', badge: 'GPay' },
                  { name: 'PhonePe', badge: 'PhonePe' },
                  { name: 'Paytm UPI', badge: 'Paytm' },
                  { name: 'BHIM UPI', badge: 'BHIM' },
                  { name: 'FamPay', badge: 'FamPay' },
                  { name: 'Any Bank App', badge: 'NetBanking' },
                ].map((app) => (
                  <div
                    key={app.name}
                    className="p-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center"
                  >
                    <span className="text-[11px] font-bold text-white block truncate">
                      {app.badge}
                    </span>
                    <span className="text-[9px] text-zinc-500 block truncate">
                      {app.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prominent 8-Hour Approval SLA Alert */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Approval Policy: Within 8 Hours</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Deposits are verified manually and approved within <strong>8 hours</strong>. Once confirmed by the administrator against banking statements, funds are credited immediately to your tournament balance.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.05] space-y-1.5">
            <span className="text-zinc-300 font-bold block flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Step-by-Step Payment Instructions:</span>
            </span>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400">
              <li>Open your UPI app (GPay, PhonePe, Paytm, or FamPay).</li>
              <li>Pay directly to UPI ID: <strong className="text-cyan-300 select-all font-mono">{ADMIN_UPI_ID}</strong></li>
              <li>Copy the 12-digit UTR from your completed transaction receipt.</li>
              <li>Enter your Payment Sender Name, Amount &amp; UTR in the form to submit.</li>
            </ol>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: ADD DEPOSIT SUBMISSION FORM (7 cols)       */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-[#111726] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Submit Deposit Details</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Step 2
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Provide your payment details to initiate administrator verification.
              </p>
            </div>
          </div>

          {formSuccess ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Deposit Request Submitted!</h4>
                <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Your deposit request has been routed to the administrator. Verification is processed manually within the <strong>8-hour approval window</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormSuccess(false)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                Submit Another Deposit
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Field 1: Payment Sender Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="deposit-payment-sender-name"
                  className="block text-xs font-bold text-zinc-200"
                >
                  Payment Sender Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="deposit-payment-sender-name"
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => {
                    setSenderName(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="e.g. Soumodip Bera / Rajesh Kumar"
                  className="w-full px-4 py-3 bg-[#0a0f1d] border border-white/[0.1] rounded-2xl text-xs font-medium text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-400 transition-colors"
                />
                <p className="text-[11px] text-zinc-400">
                  The exact name appearing on your bank account or UPI application.
                </p>
              </div>

              {/* Field 2: Deposit Amount in INR */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="deposit-amount-inr"
                    className="block text-xs font-bold text-zinc-200"
                  >
                    Deposit Amount in INR <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-emerald-400 font-semibold">Custom Amount (No minimum limit)</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-zinc-400 text-sm">
                    ₹
                  </span>
                  <input
                    id="deposit-amount-inr"
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={amountINR}
                    onChange={(e) => {
                      setAmountINR(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="Enter any custom deposit amount in INR"
                    className="w-full pl-9 pr-4 py-3 bg-[#0a0f1d] border border-white/[0.1] rounded-2xl text-sm font-mono font-bold text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-400 transition-colors"
                  />
                </div>

                {/* Optional Quick Preset Amount Chips */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">Quick Suggestions:</span>
                  {['50', '100', '250', '500', '1000', '2000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmountINR(val)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        amountINR === val
                          ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/30'
                          : 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] border border-white/[0.08]'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                  {amountINR && (
                    <button
                      type="button"
                      onClick={() => setAmountINR('')}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Field 3: UTR (Unique Transaction Reference) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="deposit-utr"
                  className="block text-xs font-bold text-zinc-200"
                >
                  UTR (Unique Transaction Reference / Ref No.) <span className="text-rose-400">*</span>
                </label>
                <input
                  id="deposit-utr"
                  type="text"
                  required
                  maxLength={24}
                  value={utr}
                  onChange={(e) => {
                    setUtr(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="e.g. 428190382910"
                  className="w-full px-4 py-3 bg-[#0a0f1d] border border-white/[0.1] rounded-2xl text-xs font-mono font-bold tracking-wider text-white placeholder:text-zinc-500 placeholder:tracking-normal focus:outline-hidden focus:border-cyan-400 transition-colors"
                />
                <p className="text-[11px] text-zinc-400">
                  Found on your transaction details screen as "UTR", "UPI Ref ID", or "Bank Reference No."
                </p>
              </div>

              {/* Error Notice */}
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-deposit-request-btn"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <IndianRupee className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Submitting Deposit...'
                    : amountINR && Number(amountINR) > 0
                    ? `Confirm & Submit Deposit (₹${amountINR})`
                    : 'Confirm & Submit Deposit'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-[11px] text-zinc-500 font-medium">
                  🔒 Bank transfers are audited for security. Administrator reviews requests within 8 hours.
                </span>
              </div>
            </form>
          )}

          {/* User's recent deposits list */}
          {myRecentDeposits.length > 0 && (
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Your Deposit History</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {myRecentDeposits.length} recorded
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {myRecentDeposits.slice(0, 5).map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3 bg-[#0a0f1d] border border-white/[0.05] rounded-xl flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">₹{dep.amountINR}</span>
                        <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                          Sender: {dep.senderName}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        UTR: {dep.utr} • {new Date(dep.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 border ${
                        dep.status === 'Approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : dep.status === 'Rejected'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
