import React from 'react';
import { Tournament } from '../../types';
import { useApp } from '../../context/AppContext';
import { TournamentCountdown } from './TournamentCountdown';
import {
  Trophy,
  X,
  MapPin,
  Calendar,
  Clock,
  Key,
  Users,
  Shield,
  Award,
  CheckCircle2,
  Copy,
} from 'lucide-react';

interface TournamentDetailsModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onJoinClick: () => void;
  isRegistered: boolean;
}

export const TournamentDetailsModal: React.FC<TournamentDetailsModalProps> = ({
  tournament,
  onClose,
  onJoinClick,
  isRegistered,
}) => {
  const { tournamentParticipants, notify } = useApp();

  if (!tournament) return null;

  const participants = tournamentParticipants.filter((p) => p.tournamentId === tournament.id);

  const handleCopyCredentials = () => {
    if (!tournament.roomId) return;
    const text = `Room ID: ${tournament.roomId} | Password: ${tournament.roomPassword || 'None'}`;
    navigator.clipboard.writeText(text);
    notify('Room credentials copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e1424] border border-cyan-500/40 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 text-xs max-h-[90vh] overflow-y-auto relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {tournament.gameMode}
              </span>
              <span className="text-[10px] font-bold text-zinc-400">{tournament.game}</span>
            </div>
            <h2 className="text-lg font-black text-white mt-0.5">{tournament.title}</h2>
          </div>
        </div>

        {/* Prize Pool Breakdown Card */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-[#102028] to-[#0d1624] border border-emerald-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Prize Pool Breakdown
            </span>
            <span className="text-lg font-black text-emerald-300 font-mono">
              Total: ₹{tournament.prizePoolINR.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div className="bg-black/30 border border-white/[0.06] p-2.5 rounded-xl">
              <span className="text-[10px] text-amber-300 font-bold block">🥇 1st Place</span>
              <span className="text-sm font-black text-white font-mono">
                ₹{tournament.firstPrizeINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-black/30 border border-white/[0.06] p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-300 font-bold block">🥈 2nd Place</span>
              <span className="text-sm font-black text-white font-mono">
                ₹{tournament.secondPrizeINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-black/30 border border-white/[0.06] p-2.5 rounded-xl">
              <span className="text-[10px] text-amber-500 font-bold block">🥉 3rd Place</span>
              <span className="text-sm font-black text-white font-mono">
                ₹{tournament.thirdPrizeINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-black/30 border border-white/[0.06] p-2.5 rounded-xl">
              <span className="text-[10px] text-cyan-300 font-bold block">🎯 Per Kill</span>
              <span className="text-sm font-black text-white font-mono">
                ₹{tournament.perKillINR || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule & Room Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.08] p-3.5 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Match Schedule
            </span>
            <div className="flex items-center gap-2 text-zinc-200">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{tournament.scheduleDate}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-200">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-mono">{tournament.scheduleTime}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-200">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Map: {tournament.map}</span>
            </div>
          </div>

          {/* Room credentials box */}
          <div className="bg-white/[0.03] border border-white/[0.08] p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Key className="w-3.5 h-3.5" />
                <span>Room Credentials</span>
              </span>
              {tournament.roomId && isRegistered && (
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              )}
            </div>

            {tournament.roomId ? (
              isRegistered ? (
                <div className="bg-black/40 border border-amber-500/30 p-2 rounded-xl font-mono text-xs space-y-1">
                  <div>
                    <span className="text-zinc-400 text-[10px]">Room ID:</span>{' '}
                    <strong className="text-amber-300 font-bold">{tournament.roomId}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px]">Password:</span>{' '}
                    <strong className="text-white">{tournament.roomPassword || 'None'}</strong>
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-black/20 rounded-xl text-zinc-400 text-[11px] italic">
                  Room credentials will be revealed to registered players.
                </div>
              )
            ) : (
              <div className="p-2 bg-black/20 rounded-xl text-zinc-400 text-[11px] italic">
                Moderator will release Room ID &amp; Password 15 minutes prior to match start.
              </div>
            )}
          </div>
        </div>

        {/* Live Kickoff Countdown Display (Days, Hours, Minutes, Seconds) */}
        <div className="bg-[#0b101c] border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
          <TournamentCountdown
            scheduleDate={tournament.scheduleDate}
            scheduleTime={tournament.scheduleTime}
            startTimeISO={tournament.startTimeISO}
            variant="cards"
          />
        </div>

        {/* Rules */}
        <div className="bg-white/[0.03] border border-white/[0.08] p-3.5 rounded-2xl space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Rules &amp; Match Format
          </span>
          <p className="text-zinc-300 text-xs leading-relaxed">
            {tournament.rules || 'Standard tournament competitive settings. No cheats or third party tools.'}
          </p>
        </div>

        {/* Registered roster summary */}
        <div className="bg-white/[0.03] border border-white/[0.08] p-3.5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Registered Players ({participants.length})</span>
            </span>
            <span className="font-mono text-xs text-zinc-300">
              {tournament.registeredSlots} / {tournament.maxSlots} Slots
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap max-h-24 overflow-y-auto">
            {participants.length === 0 ? (
              <span className="text-zinc-500 italic text-[11px]">No players registered yet. Be the first!</span>
            ) : (
              participants.map((p) => (
                <span
                  key={p.id}
                  className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] font-medium text-zinc-300 font-mono"
                >
                  {p.inGameName}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-zinc-400">Entry: </span>
            <strong className="text-emerald-400 font-mono">
              {tournament.entryFeeINR === 0 ? 'FREE' : `₹${tournament.entryFeeINR}`}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl font-medium"
            >
              Close
            </button>
            {!isRegistered ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onJoinClick();
                }}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 active:scale-95 transition-all"
              >
                Join Tournament
              </button>
            ) : (
              <span className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are Registered</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
