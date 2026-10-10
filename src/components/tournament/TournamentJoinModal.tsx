import React, { useState } from 'react';
import { Tournament } from '../../types';
import { useApp } from '../../context/AppContext';
import { Trophy, Gamepad2, X, AlertTriangle, CheckCircle2, UserCheck, Shield } from 'lucide-react';

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

  const [inGameName, setInGameName] = useState('');
  const [inGameUid, setInGameUid] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!tournament) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inGameName.trim()) {
      setError('Please provide your Free Fire / in-game player name.');
      return;
    }
    if (!inGameUid.trim()) {
      setError('Please provide your in-game player UID.');
      return;
    }

    const res = registerForTournament(tournament.id, inGameName, inGameUid);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.message);
    }
  };

  const isFree = tournament.entryFeeINR === 0;
  const workerBal = currentWorker.availableBalanceINR || 0;
  const canAfford = isFree || workerBal >= tournament.entryFeeINR;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e1424] border border-cyan-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-xs relative">
        <button
          type="button"
          onClick={onClose}
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

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Your In-Game Name (IGN) *
            </label>
            <input
              type="text"
              required
              value={inGameName}
              onChange={(e) => setInGameName(e.target.value)}
              placeholder="e.g. ShadowHunter_99"
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white font-medium focus:outline-hidden focus:border-cyan-400 placeholder:text-zinc-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              In-Game Player UID (Numeric ID) *
            </label>
            <input
              type="text"
              required
              value={inGameUid}
              onChange={(e) => setInGameUid(e.target.value)}
              placeholder="e.g. 782910482"
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white font-mono focus:outline-hidden focus:border-cyan-400 placeholder:text-zinc-500 text-xs"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Used by moderators to invite you or verify match results.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canAfford}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Confirm &amp; Join Tournament</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
