import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tournament, Worker, TournamentParticipant } from '../../types';
import {
  Shield,
  Search,
  X,
  Trophy,
  User,
  Gamepad2,
  Calendar,
  Clock,
  MapPin,
  Key,
  Copy,
  Check,
  ExternalLink,
  Coins,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
  Flame,
  Award,
  Sparkles,
} from 'lucide-react';

interface EsportsUidInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onEditTournament?: (t: Tournament) => void;
}

export const EsportsUidInspectorModal: React.FC<EsportsUidInspectorModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onEditTournament,
}) => {
  const { tournaments, workers, tournamentParticipants, updateTournament, notify } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealPassword, setRevealPassword] = useState(false);

  if (!isOpen) return null;

  const trimmedQuery = query.trim().toUpperCase();

  // 1. Search for matching tournament(s) by esportsTournamentUid or id
  const matchingTournaments = tournaments.filter((t) => {
    if (!trimmedQuery) return false;
    const tUid = (t.esportsTournamentUid || '').toUpperCase();
    const id = t.id.toUpperCase();
    return tUid.includes(trimmedQuery) || id.includes(trimmedQuery) || t.title.toUpperCase().includes(trimmedQuery);
  });

  // 2. Search for matching player(s) by esportsTournamentUid or uniqueUserId or eid
  const matchingWorkers = workers.filter((w) => {
    if (!trimmedQuery) return false;
    const wUid = (w.esportsTournamentUid || '').toUpperCase();
    const uId = (w.uniqueUserId || '').toUpperCase();
    const eId = (w.eid || '').toUpperCase();
    const ign = (w.inGameName || '').toUpperCase();
    return wUid.includes(trimmedQuery) || uId.includes(trimmedQuery) || eId.includes(trimmedQuery) || ign.includes(trimmedQuery);
  });

  // 3. Search for matching participants
  const matchingParticipants = tournamentParticipants.filter((tp) => {
    if (!trimmedQuery) return false;
    const tpUid = (tp.esportsTournamentUid || '').toUpperCase();
    const ign = tp.inGameName.toUpperCase();
    return tpUid.includes(trimmedQuery) || ign.includes(trimmedQuery);
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    notify(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Sample quick UIDs for moderator reference
  const sampleTournamentUids = tournaments
    .filter((t) => t.esportsTournamentUid)
    .slice(0, 4)
    .map((t) => t.esportsTournamentUid!);

  const samplePlayerUids = workers
    .filter((w) => w.esportsTournamentUid)
    .slice(0, 4)
    .map((w) => w.esportsTournamentUid!);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b101c] border border-cyan-500/40 w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-6 text-zinc-200 relative my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
          title="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 border-b border-white/[0.08] pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/40 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/25">
                Moderator Audit Console
              </span>
              <span className="text-[10px] font-bold text-zinc-400 font-mono">
                Real-Time Firestore Index
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              E-sports Tournament UID Inspector
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Search by E-sports Tournament UID to audit match settings, room credentials, host accounts, and registered player profiles.
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
            <input
              type="text"
              autoFocus
              placeholder="Enter E-sports Tournament UID (e.g. ETUID-TRN-88210 or ETUID-928410)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#12192a] border border-cyan-500/40 focus:border-cyan-400 rounded-2xl text-xs sm:text-sm text-white placeholder:text-zinc-500 outline-none font-mono tracking-wider shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
            <span className="text-zinc-500 font-bold uppercase text-[9px]">Quick UIDs:</span>
            {sampleTournamentUids.map((uid) => (
              <button
                key={uid}
                type="button"
                onClick={() => setQuery(uid)}
                className="px-2 py-0.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 font-mono text-[10px] transition-colors cursor-pointer"
              >
                🏆 {uid}
              </button>
            ))}
            {samplePlayerUids.map((uid) => (
              <button
                key={uid}
                type="button"
                onClick={() => setQuery(uid)}
                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 font-mono text-[10px] transition-colors cursor-pointer"
              >
                👤 {uid}
              </button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {!trimmedQuery ? (
            <div className="py-12 text-center space-y-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Enter an E-sports Tournament UID</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Type an official UID above (like <code className="text-cyan-300">ETUID-TRN-88210</code> or <code className="text-emerald-300">ETUID-928410</code>) or click one of the quick suggestions to inspect tournament settings and account profiles.
              </p>
            </div>
          ) : matchingTournaments.length === 0 && matchingWorkers.length === 0 && matchingParticipants.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
              <span className="text-sm font-bold text-zinc-400 block">No matching record found</span>
              <p className="text-xs text-zinc-500">
                No tournament, player account, or participant matched the query <strong className="text-cyan-400">{trimmedQuery}</strong>.
              </p>
            </div>
          ) : (
            <>
              {/* 1. MATCHING TOURNAMENTS SECTION */}
              {matchingTournaments.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
                    <Trophy className="w-4 h-4" />
                    <span>Associated Tournaments &amp; Settings ({matchingTournaments.length})</span>
                  </div>

                  {matchingTournaments.map((t) => {
                    const participants = tournamentParticipants.filter((p) => p.tournamentId === t.id);

                    return (
                      <div
                        key={t.id}
                        className="bg-[#101728] border-2 border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4"
                      >
                        {/* Tournament Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                {t.gameMode}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/[0.05] text-zinc-300">
                                {t.game}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                  t.status === 'Registration Open'
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : t.status === 'Upcoming'
                                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                    : 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30'
                                }`}
                              >
                                {t.status}
                              </span>
                            </div>
                            <h3 className="text-base font-black text-white">{t.title}</h3>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* UID Badge */}
                            <div className="flex items-center gap-1.5 bg-black/40 border border-cyan-500/40 px-3 py-1.5 rounded-xl font-mono text-xs">
                              <span className="text-[10px] text-zinc-500 uppercase font-bold">UID:</span>
                              <span className="font-bold text-cyan-400">{t.esportsTournamentUid || t.id}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(t.esportsTournamentUid || t.id, `trn-${t.id}`)}
                                className="text-zinc-400 hover:text-white p-0.5 cursor-pointer ml-1"
                                title="Copy Tournament UID"
                              >
                                {copiedKey === `trn-${t.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            {onEditTournament && (
                              <button
                                type="button"
                                onClick={() => {
                                  onEditTournament(t);
                                  onClose();
                                }}
                                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-colors cursor-pointer"
                              >
                                Edit Settings
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Tournament Settings Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Schedule</span>
                            <span className="font-bold text-white mt-0.5 block">{t.scheduleDate}</span>
                            <span className="text-[10px] text-zinc-400 font-mono block">{t.scheduleTime}</span>
                          </div>

                          <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Map &amp; Arena</span>
                            <span className="font-bold text-white mt-0.5 block">{t.map}</span>
                            {t.customMapCode && (
                              <span className="text-[10px] text-cyan-400 font-mono block">Code: {t.customMapCode}</span>
                            )}
                          </div>

                          <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Prize Pool</span>
                            <span className="font-bold text-emerald-400 mt-0.5 block">₹{t.prizePoolINR.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-zinc-400 block">
                              Fee: {t.entryFeeINR > 0 ? `₹${t.entryFeeINR}` : 'FREE'}
                            </span>
                          </div>

                          <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Slots Filled</span>
                            <span className="font-bold text-cyan-400 mt-0.5 block">
                              {t.registeredSlots || 0} / {t.maxSlots}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              {participants.length} registered
                            </span>
                          </div>
                        </div>

                        {/* Room Credentials Settings */}
                        <div className="bg-black/40 border border-white/[0.08] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Key className="w-4 h-4 text-cyan-400" />
                              <span className="text-zinc-400">Room ID:</span>
                              <span className="font-mono font-bold text-white">
                                {t.roomId || <em className="text-zinc-600">Not set</em>}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-zinc-400">Password:</span>
                              <span className="font-mono font-bold text-white">
                                {t.roomPassword ? (
                                  revealPassword ? t.roomPassword : '••••••'
                                ) : (
                                  <em className="text-zinc-600">Not set</em>
                                )}
                              </span>
                              {t.roomPassword && (
                                <button
                                  type="button"
                                  onClick={() => setRevealPassword(!revealPassword)}
                                  className="text-zinc-400 hover:text-white p-0.5 cursor-pointer ml-1"
                                >
                                  {revealPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400">Host Account:</span>
                            <span className="text-[10px] font-bold text-zinc-300 font-mono">{t.createdBy || 'Moderator'}</span>
                          </div>
                        </div>

                        {/* Registered Players List */}
                        {participants.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                            <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                              <span>Registered Players ({participants.length}):</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {participants.map((p) => (
                                <div
                                  key={p.id}
                                  className="bg-black/20 border border-white/[0.05] p-2.5 rounded-xl flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <div className="font-bold text-white">{p.inGameName}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono">
                                      UID: {p.esportsTournamentUid || p.workerUid}
                                    </div>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {p.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. MATCHING PLAYER ACCOUNTS SECTION */}
              {matchingWorkers.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                    <User className="w-4 h-4" />
                    <span>Associated Player Account Details &amp; Settings ({matchingWorkers.length})</span>
                  </div>

                  {matchingWorkers.map((w) => {
                    const playerTournaments = tournamentParticipants.filter((tp) => tp.workerId === w.id);
                    const prefs = w.gamingPreferences;

                    return (
                      <div
                        key={w.id}
                        className="bg-[#101728] border-2 border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-4"
                      >
                        {/* Player Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                              {w.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-black text-white">{w.name}</h3>
                                {w.hasTournamentProfile && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Verified Player</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-zinc-400">{w.email}</span>
                            </div>
                          </div>

                          {/* Player E-sports Tournament UID */}
                          <div className="flex items-center gap-1.5 bg-black/40 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-mono text-xs">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Player UID:</span>
                            <span className="font-bold text-emerald-400">{w.esportsTournamentUid || w.uniqueUserId}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(w.esportsTournamentUid || w.uniqueUserId, `usr-${w.id}`)}
                              className="text-zinc-400 hover:text-white p-0.5 cursor-pointer ml-1"
                              title="Copy Player UID"
                            >
                              {copiedKey === `usr-${w.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Player Account Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">In-Game Name</span>
                            <span className="font-bold text-white mt-0.5 block truncate">
                              {w.inGameName || <em className="text-zinc-500">Not set</em>}
                            </span>
                            {w.inGameUid && (
                              <span className="text-[10px] text-cyan-400 font-mono block">Game ID: {w.inGameUid}</span>
                            )}
                          </div>

                          <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Account IDs</span>
                            <span className="text-[11px] font-mono text-zinc-300 block">{w.uniqueUserId}</span>
                            <span className="text-[10px] font-mono text-zinc-500 block">{w.eid}</span>
                          </div>

                          <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Balance &amp; Payouts</span>
                            <span className="font-bold text-emerald-400 block">
                              ₹{(w.availableBalanceINR || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              UPI: {w.upiId || 'Not set'}
                            </span>
                          </div>

                          <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Arena Matches</span>
                            <span className="font-bold text-cyan-400 block">
                              {playerTournaments.length} Joined
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              Status: {w.status}
                            </span>
                          </div>
                        </div>

                        {/* Gaming Preferences & Settings */}
                        {prefs && (
                          <div className="bg-black/40 border border-white/[0.06] p-3.5 rounded-xl space-y-2 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                              Gaming Preferences &amp; Combat Profile
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                              <div>
                                <span className="text-[9px] text-zinc-500 block uppercase">Role</span>
                                <span className="font-bold text-emerald-300 block">{prefs.playstyle}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-zinc-500 block uppercase">Mode</span>
                                <span className="font-bold text-cyan-300 block">{prefs.preferredMode}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-zinc-500 block uppercase">Map</span>
                                <span className="font-semibold text-zinc-300 block">{prefs.preferredMap}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-zinc-500 block uppercase">Device</span>
                                <span className="font-semibold text-zinc-300 block">{prefs.device}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Associated Tournaments for this player */}
                        {playerTournaments.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                            <span className="text-xs font-bold text-zinc-400 block">
                              Registered Tournaments ({playerTournaments.length}):
                            </span>
                            <div className="space-y-1.5">
                              {playerTournaments.map((tp) => {
                                const tourn = tournaments.find((t) => t.id === tp.tournamentId);
                                return (
                                  <div
                                    key={tp.id}
                                    className="bg-black/20 border border-white/[0.05] p-2.5 rounded-xl flex items-center justify-between text-xs"
                                  >
                                    <div>
                                      <span className="font-bold text-white block">
                                        {tourn?.title || tp.tournamentId}
                                      </span>
                                      <span className="text-[10px] text-zinc-400 font-mono block">
                                        Mode: {tourn?.gameMode} • Registered: {tp.registeredAt}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 block">
                                        {tp.status}
                                      </span>
                                      {tp.prizeWonINR ? (
                                        <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">
                                          Won: ₹{tp.prizeWonINR}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
