import React, { useState } from 'react';
import { Tournament, TournamentGameMode } from '../../types';
import { TournamentCountdown } from './TournamentCountdown';
import {
  Trophy,
  Users,
  MapPin,
  Calendar,
  Clock,
  Key,
  CheckCircle2,
  ChevronRight,
  Shield,
  Zap,
  Copy,
  Check,
} from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  isRegistered: boolean;
  onJoinClick: (tournament: Tournament) => void;
  onDetailsClick: (tournament: Tournament) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  isRegistered,
  onJoinClick,
  onDetailsClick,
}) => {
  const [copied, setCopied] = useState(false);
  const isFree = tournament.entryFeeINR === 0;
  const isFull = tournament.registeredSlots >= tournament.maxSlots;

  const handleCopyRoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tournament.roomId) return;
    const text = `Room ID: ${tournament.roomId} | Pass: ${tournament.roomPassword || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getModeBadgeColor = (mode: TournamentGameMode) => {
    switch (mode) {
      case 'Solo':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Battle Royale':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Squad':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Lone Wolf':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
      case 'Craftland':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case '1v1':
        return 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30';
      case '2v2':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case '3v3':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Registration Open':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Upcoming':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'In Progress':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse';
      default:
        return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
    }
  };

  const slotPercent = Math.min(
    100,
    Math.round(((tournament.registeredSlots || 0) / tournament.maxSlots) * 100)
  );

  return (
    <div className="bg-[#111726]/90 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 rounded-3xl p-5 shadow-xl shadow-black/40 hover:shadow-cyan-950/20 transition-all flex flex-col justify-between gap-4 group relative overflow-hidden">
      {/* Glow on hover */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-cyan-500/5 group-hover:bg-cyan-500/15 blur-2xl pointer-events-none transition-all" />

      {/* Top Meta: Mode, Game & Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${getModeBadgeColor(
              tournament.gameMode
            )}`}
          >
            {tournament.gameMode}
          </span>
          <span className="text-[11px] font-bold text-zinc-400">{tournament.game}</span>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
            tournament.status
          )}`}
        >
          {tournament.status}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
          {tournament.title}
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1 flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{tournament.map}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">{tournament.scheduleTime}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{tournament.scheduleDate}</span>
          </span>
          <TournamentCountdown
            scheduleDate={tournament.scheduleDate}
            scheduleTime={tournament.scheduleTime}
            startTimeISO={tournament.startTimeISO}
            variant="compact"
          />
        </div>
      </div>

      {/* Prize & Financial Highlight */}
      <div className="bg-[#0b101c] border border-white/[0.06] rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Prize Pool
          </span>
          <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">
            ₹{tournament.prizePoolINR.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Entry Fee
          </span>
          <span
            className={`text-sm font-black font-mono px-2 py-0.5 rounded-lg border ${
              isFree
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {isFree ? 'FREE' : `₹${tournament.entryFeeINR}`}
          </span>
        </div>
      </div>

      {/* Slots Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Registration Slots</span>
          </span>
          <span className="font-mono font-bold text-zinc-200">
            {tournament.registeredSlots} / {tournament.maxSlots} Joined
          </span>
        </div>
        <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              slotPercent >= 90
                ? 'bg-rose-500'
                : slotPercent >= 70
                ? 'bg-amber-400'
                : 'bg-cyan-500'
            }`}
            style={{ width: `${slotPercent}%` }}
          />
        </div>
      </div>

      {/* Room ID notice if registered */}
      {isRegistered && (
        tournament.roomId && tournament.isRoomCredentialsPublished !== false ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-[11px] flex items-center justify-between text-amber-300 font-mono">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Room: <strong>{tournament.roomId}</strong></span>
              <span className="text-zinc-500">/</span>
              <span>Pass: <strong>{tournament.roomPassword || 'None'}</strong></span>
            </div>
            <button
              type="button"
              onClick={handleCopyRoom}
              className="text-amber-400 hover:text-white p-1 rounded-lg hover:bg-amber-500/20 transition-colors flex items-center gap-1 text-[10px] font-sans"
              title="Copy Room ID & Password"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-1.5 text-[10px] text-zinc-400 italic flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Room ID &amp; Password will be revealed 15m before match start.</span>
          </div>
        )
      )}

      {/* Action Footer */}
      <div className="pt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDetailsClick(tournament)}
          className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          View Rules &amp; Info
        </button>

        {!isRegistered ? (
          <button
            type="button"
            disabled={isFull || tournament.status !== 'Registration Open'}
            onClick={() => onJoinClick(tournament)}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span>{isFull ? 'Slots Full' : 'Join Tournament'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="flex-1 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Registered</span>
          </span>
        )}
      </div>
    </div>
  );
};
