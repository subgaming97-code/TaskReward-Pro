import React, { useState } from 'react';
import { Tournament } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  X,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Shield,
  Sparkles,
  Loader2,
  Edit3,
  Link,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TournamentJoinModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TournamentJoinModal: React.FC<TournamentJoinModalProps> = ({
  tournament,
  onClose,
  onSuccess,
}) => {
  const { currentWorker, registerForTournament } = useApp();

  // Automatically fetch player IGN and UID linked via User ID
  const linkedIgn = (currentWorker.inGameName || currentWorker.name || '').trim();
  const linkedUid = (
    currentWorker.inGameUid ||
    currentWorker.esportsTournamentUid ||
    currentWorker.uniqueUserId ||
    currentWorker.eid ||
    ''
  ).trim();

  const [showOverride, setShowOverride] = useState(false);
  const [customIgn, setCustomIgn] = useState(currentWorker.inGameName || '');
  const [customUid, setCustomUid] = useState(currentWorker.inGameUid || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tournament) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // If the user expanded and typed a custom override, pass it; otherwise automatically use profile linked data
      const ignToUse = showOverride && customIgn.trim() ? customIgn.trim() : linkedIgn;
      const uidToUse = showOverride && customUid.trim() ? customUid.trim() : linkedUid;

      if (!ignToUse) {
        setError('No In-Game Name (IGN) found in your profile. Please configure your profile or enter your IGN.');
        setIsSubmitting(false);
        return;
      }
      if (!uidToUse) {
        setError('No Game UID found in your profile. Please configure your profile or enter your UID.');
        setIsSubmitting(false);
        return;
      }

      const res = await registerForTournament(tournament.id, ignToUse, uidToUse);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFree = tournament.entryFeeINR === 0;
  const workerBal = currentWorker.availableBalanceINR || 0;
  const canAfford = isFree || workerBal >= tournament.entryFeeINR;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e1424] border border-cyan-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-xs relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
              Player Entry Portal
            </span>
            <h3 className="text-base font-black text-white">{tournament.title}</h3>
            <span className="text-[11px] text-zinc-400">
              Mode: <strong className="text-cyan-300">{tournament.gameMode}</strong> • Map: {tournament.map}
            </span>
          </div>
        </div>

        {/* Prize & Entry Fee Notice */}
        <div className="bg-white/[0.03] border border-white/[0.08] p-3.5 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Prize Pool</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              ₹{tournament.prizePoolINR.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Entry Fee</span>
            <span className={`text-base font-black font-mono ${isFree ? 'text-cyan-300' : 'text-amber-400'}`}>
              {isFree ? 'FREE' : `₹${tournament.entryFeeINR}`}
            </span>
          </div>
        </div>

        {!isFree && (
          <div className="text-[11px] bg-zinc-900/60 p-2.5 rounded-xl border border-white/[0.06] flex items-center justify-between text-zinc-300">
            <span>Your Available Balance:</span>
            <strong className="font-mono text-emerald-400">₹{workerBal.toLocaleString('en-IN')}</strong>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auto-Linked Profile Card */}
        <div className="bg-gradient-to-br from-cyan-950/30 to-blue-950/20 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Link className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-white block">
                  Profile Credentials Linked
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  User ID: {currentWorker.uniqueUserId || currentWorker.eid || currentWorker.id}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Auto-Fetched
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-2.5">
              <span className="text-[10px] text-zinc-400 block font-medium">In-Game Name (IGN)</span>
              <span className="text-xs font-black text-cyan-300 truncate block mt-0.5">
                {linkedIgn || <em className="text-zinc-500 font-normal">Not configured</em>}
              </span>
            </div>

            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-2.5">
              <span className="text-[10px] text-zinc-400 block font-medium">Game Player UID</span>
              <span className="text-xs font-black text-cyan-300 font-mono truncate block mt-0.5">
                {linkedUid || <em className="text-zinc-500 font-normal">Not configured</em>}
              </span>
            </div>
          </div>

          {currentWorker.esportsTournamentUid && (
            <div className="flex items-center justify-between text-[10px] bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1.5 rounded-xl">
              <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>E-sports Tournament UID:</span>
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {currentWorker.esportsTournamentUid}
              </span>
            </div>
          )}

          <p className="text-[10px] text-zinc-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Fetched automatically from your profile table. No manual input needed.</span>
          </p>
        </div>

        {/* Optional Custom Credential Override Toggle */}
        <div className="border border-white/[0.06] rounded-xl p-2.5 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => setShowOverride(!showOverride)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Modify credentials for this match (Optional)</span>
            </span>
            {showOverride ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showOverride && (
            <div className="space-y-2.5 pt-3 mt-2 border-t border-white/[0.06] animate-in fade-in duration-150">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                  Custom In-Game Name (IGN)
                </label>
                <input
                  type="text"
                  value={customIgn}
                  onChange={(e) => setCustomIgn(e.target.value)}
                  placeholder="e.g. ShadowHunter_99"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white font-medium focus:outline-hidden focus:border-cyan-400 placeholder:text-zinc-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                  Custom In-Game Player UID
                </label>
                <input
                  type="text"
                  value={customUid}
                  onChange={(e) => setCustomUid(e.target.value)}
                  placeholder="e.g. 782910482"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white font-mono focus:outline-hidden focus:border-cyan-400 placeholder:text-zinc-500 text-xs"
                />
              </div>
              <span className="text-[10px] text-zinc-500 block">
                Any changes here will automatically update and sync your profile table.
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="pt-1">
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canAfford || isSubmitting || (!linkedIgn && !customIgn)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Joining Tournament...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Confirm &amp; Join Tournament</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
