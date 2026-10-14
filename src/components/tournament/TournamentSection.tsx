import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Tournament, TournamentGameMode, TournamentMatchResult } from '../../types';
import { TournamentCard } from './TournamentCard';
import { ModeratorPinModal } from './ModeratorPinModal';
import { ModeratorPanel } from './ModeratorPanel';
import { TournamentJoinModal } from './TournamentJoinModal';
import { TournamentDetailsModal } from './TournamentDetailsModal';
import { PlayerSupportTicketModal } from './PlayerSupportTicketModal';
import { PublicLeaderboardView } from './PublicLeaderboardView';
import { AddDepositForm } from './AddDepositForm';
import { AddDepositModal } from './AddDepositModal';
import { TournamentProfileSetupModal } from './TournamentProfileSetupModal';
import {
  Trophy,
  Swords,
  Shield,
  Search,
  PlusCircle,
  Sparkles,
  Lock,
  Unlock,
  Flame,
  Gamepad2,
  CheckCircle2,
  Filter,
  Medal,
  Award,
  Crown,
  LifeBuoy,
  Clock,
  Coins,
  Wallet,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Share2,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

const MODES: { id: string; label: string }[] = [
  { id: 'All', label: 'All Modes' },
  { id: 'Solo', label: 'Solo' },
  { id: 'Battle Royale', label: 'Battle Royale' },
  { id: 'Squad', label: 'Squad' },
  { id: 'Lone Wolf', label: 'Lone Wolf' },
  { id: 'Craftland', label: 'Craftland' },
  { id: '1v1', label: '1v1' },
  { id: '2v2', label: '2v2' },
  { id: '3v3', label: '3v3' },
];

export const TournamentSection: React.FC = () => {
  const {
    tournaments,
    tournamentParticipants,
    matchResults,
    supportTickets,
    currentWorker,
    isModeratorUnlocked,
    setIsModeratorUnlocked,
    notify,
  } = useApp();

  // Primary view: tournaments, match_results, leaderboard, or deposit
  const [sectionView, setSectionView] = useState<'tournaments' | 'match_results' | 'leaderboard' | 'deposit'>('tournaments');

  // Navigation & Search State
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [moderatorPanelOpen, setModeratorPanelOpen] = useState(false);
  const [joiningTournament, setJoiningTournament] = useState<Tournament | null>(null);
  const [detailsTournament, setDetailsTournament] = useState<Tournament | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(
    !currentWorker.hasTournamentProfile || !currentWorker.esportsTournamentUid
  );
  const [copiedPlayerUid, setCopiedPlayerUid] = useState(false);

  // Match results expanded cards state
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [copiedResultId, setCopiedResultId] = useState<string | null>(null);

  // Hidden 3-tap counter on the 'Welcome Player' header
  const tapStateRef = useRef<{ count: number; timer: NodeJS.Timeout | null }>({
    count: 0,
    timer: null,
  });
  const [tapFeedbackCount, setTapFeedbackCount] = useState<number>(0);

  const handleWelcomeHeaderTap = () => {
    if (tapStateRef.current.timer) {
      clearTimeout(tapStateRef.current.timer);
      tapStateRef.current.timer = null;
    }

    tapStateRef.current.count += 1;
    const currentCount = tapStateRef.current.count;
    setTapFeedbackCount(currentCount);

    if (currentCount >= 3) {
      tapStateRef.current.count = 0;
      setTapFeedbackCount(0);
      // Trigger Moderator PIN verification modal
      setPinModalOpen(true);
      return;
    }

    // Reset tap counter after 2.5 seconds if inactive
    tapStateRef.current.timer = setTimeout(() => {
      tapStateRef.current.count = 0;
      setTapFeedbackCount(0);
      tapStateRef.current.timer = null;
    }, 2500);
  };

  const handlePinSuccess = () => {
    setIsModeratorUnlocked(true);
    setModeratorPanelOpen(true);
    notify('Moderator Console unlocked successfully!');
  };

  const handleLockModerator = () => {
    setIsModeratorUnlocked(false);
    setModeratorPanelOpen(false);
    notify('Moderator Console locked.');
  };

  const copyResultSummary = (result: TournamentMatchResult) => {
    const text = `🏆 ${result.tournamentTitle} - Match Results\nMode: ${result.gameMode} | Map: ${result.map}\nWinner MVP: ${result.mvpPlayerName || 'N/A'}\nTotal Prize Distributed: ₹${result.totalPrizeDistributedINR}\nVerified by: ${result.verifiedBy}`;
    navigator.clipboard.writeText(text);
    setCopiedResultId(result.id);
    notify('Match scorecard summary copied to clipboard!');
    setTimeout(() => setCopiedResultId(null), 2000);
  };

  // Filtered Tournaments
  const filteredTournaments = tournaments.filter((t) => {
    const matchesMode = selectedMode === 'All' || t.gameMode === selectedMode;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Open' && t.status === 'Registration Open') ||
      (selectedStatus === 'Upcoming' && t.status === 'Upcoming') ||
      (selectedStatus === 'Live' && t.status === 'In Progress') ||
      (selectedStatus === 'Completed' && t.status === 'Completed');

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.gameMode.toLowerCase().includes(q) ||
      t.map.toLowerCase().includes(q);

    return matchesMode && matchesStatus && matchesSearch;
  });

  // Filtered Match Results
  const filteredMatchResults = matchResults.filter((m) => {
    const matchesMode = selectedMode === 'All' || m.gameMode === selectedMode;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.tournamentTitle.toLowerCase().includes(q) ||
      m.gameMode.toLowerCase().includes(q) ||
      m.map.toLowerCase().includes(q) ||
      (m.mvpPlayerName && m.mvpPlayerName.toLowerCase().includes(q));

    return matchesMode && matchesSearch;
  });

  // Player's personal tickets count
  const myTicketsCount = supportTickets.filter(
    (t) =>
      t.workerId === currentWorker.id ||
      t.workerUid === currentWorker.uniqueUserId ||
      t.workerUid === currentWorker.eid
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ease-out">
      {/* ======================================================== */}
      {/* 1. LARGE 'WELCOME PLAYER' HERO HEADER                     */}
      {/* Hidden 3-tap action to unlock Moderator Panel            */}
      {/* ======================================================== */}
      <div className="bg-[#111726] rounded-3xl border border-white/[0.08] p-6 sm:p-8 md:p-10 shadow-2xl shadow-black/60 relative overflow-hidden">
        {/* Glow aesthetics */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Esports badge & Tap indicator */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/25 flex items-center gap-1.5 shadow-sm">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Task and Esports Arena</span>
              </span>

              {isModeratorUnlocked && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Moderator Access Active</span>
                </span>
              )}
            </div>

            {/* THE PROMINENT 'WELCOME PLAYER' HEADER */}
            {/* Hidden triple-tap triggers the Moderator PIN modal */}
            <button
              id="tournament-welcome-player-btn"
              type="button"
              onClick={handleWelcomeHeaderTap}
              className="text-left select-none focus:outline-hidden cursor-pointer active:scale-98 transition-transform group block"
              title="Welcome Player"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors drop-shadow-md">
                Welcome Player
              </h1>
            </button>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Compete in official Free Fire &amp; esports custom tournaments. Play across Solo, Battle Royale,
              Squad, Lone Wolf, Craftland, 1v1, 2v2, and 3v3 modes for real INR rewards.
            </p>
          </div>

          {/* Quick Metrics / Moderator Shortcut / Add Deposit Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-[#0b101c]/90 border border-white/[0.08] p-4 rounded-2xl flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Active Tournaments
                </span>
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {tournaments.length}
                </span>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Total Prize Escrow
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{tournaments.reduce((sum, t) => sum + (t.prizePoolINR || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Prominent 'Add Deposit' Button */}
            <button
              type="button"
              id="tournament-hero-add-deposit-btn"
              onClick={() => setSectionView('deposit')}
              className="px-4 py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Coins className="w-4 h-4 text-cyan-200" />
              <span>Add Deposit</span>
            </button>

            {isModeratorUnlocked && (
              <button
                type="button"
                onClick={() => setModeratorPanelOpen(true)}
                className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Shield className="w-4 h-4" />
                <span>Open Moderator Console</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOURNAMENT PROFILE & ESPORTS TOURNAMENT UID PASS BANNER */}
      {/* ======================================================== */}
      {!currentWorker.hasTournamentProfile || !currentWorker.esportsTournamentUid ? (
        <div className="bg-gradient-to-r from-amber-950/40 via-[#1a1622] to-[#12192a] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Gamepad2 className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  Action Required • Arena Entry Gate
                </span>
                <span className="text-[10px] font-bold text-zinc-400 font-mono">
                  E-sports UID Generation Pending
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Setup Tournament Profile to Enter Arena
              </h3>
              <p className="text-xs text-zinc-300 max-w-xl">
                Please set up your player in-game name and gaming preferences before entering the Arena. Once complete, your unique, non-duplicate <strong>E-sports Tournament UID</strong> will be generated automatically.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-setup-tournament-profile-gate"
            onClick={() => setProfileModalOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs sm:text-sm rounded-2xl transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Setup Tournament Profile Now</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#0d182e] via-[#0f172a] to-[#0a1220] border-2 border-cyan-500/30 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-emerald-600 text-white flex items-center justify-center font-black text-base shadow-[0_0_20px_rgba(6,182,212,0.35)] border border-cyan-400/40 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Official Esports Player Identity</span>
                </span>
                {currentWorker.gamingPreferences?.playstyle && (
                  <span className="text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                    {currentWorker.gamingPreferences.playstyle}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-white truncate">
                  {currentWorker.inGameName || currentWorker.name}
                </span>
                {currentWorker.inGameUid && (
                  <span className="text-xs text-zinc-400 font-mono">
                    (Game ID: {currentWorker.inGameUid})
                  </span>
                )}
              </div>

              {/* Preferences Chips */}
              {currentWorker.gamingPreferences && (
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 flex-wrap pt-0.5">
                  <span className="text-zinc-300">
                    Mode: <strong className="text-cyan-300">{currentWorker.gamingPreferences.preferredMode}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-zinc-300">
                    Map: <strong className="text-emerald-300">{currentWorker.gamingPreferences.preferredMap}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-zinc-300">
                    Device: <strong>{currentWorker.gamingPreferences.device}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-zinc-300">
                    Slot: <strong>{currentWorker.gamingPreferences.preferredTime}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* UID Card & Edit Button */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 bg-black/40 border border-cyan-500/40 px-3.5 py-2 rounded-2xl font-mono shadow-inner">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-wider">
                  E-sports Tournament UID
                </span>
                <span className="text-sm font-black text-cyan-400 tracking-wider">
                  {currentWorker.esportsTournamentUid}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(currentWorker.esportsTournamentUid || '');
                  setCopiedPlayerUid(true);
                  notify(`Copied E-sports Tournament UID: ${currentWorker.esportsTournamentUid}`);
                  setTimeout(() => setCopiedPlayerUid(false), 2000);
                }}
                className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer ml-1"
                title="Copy E-sports Tournament UID"
              >
                {copiedPlayerUid ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. ARENA ACCESS LOCK / GATE FOR UNREGISTERED PLAYERS */}
      {!currentWorker.hasTournamentProfile || !currentWorker.esportsTournamentUid ? (
        <div className="bg-[#111726] border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xl shadow-black/80">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.25)]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-black text-white">Arena Access Gated</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To browse live tournaments, join custom rooms, and earn INR rewards, you must complete your Tournament Profile setup and generate your official E-sports Tournament UID.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs rounded-2xl shadow-lg shadow-amber-500/30 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Complete Setup to Enter Arena</span>
          </button>
        </div>
      ) : (
        <>
          {/* Sub-view Switcher: Tournaments vs Match Results vs Leaderboard vs Helpdesk */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setSectionView('tournaments')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  sectionView === 'tournaments'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Tournaments ({tournaments.length})</span>
              </button>

          <button
            type="button"
            onClick={() => setSectionView('match_results')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              sectionView === 'match_results'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Match Results ({matchResults.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSectionView('leaderboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              sectionView === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Medal className="w-4 h-4" />
            <span>Public Leaderboard</span>
          </button>

          <button
            type="button"
            id="tournament-add-deposit-tab-btn"
            onClick={() => setSectionView('deposit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              sectionView === 'deposit'
                ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25'
            }`}
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span>Add Deposit (UPI ₹)</span>
          </button>

          <button
            type="button"
            onClick={() => setTicketModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 hover:text-white"
          >
            <LifeBuoy className="w-4 h-4 text-purple-400" />
            <span>Player Helpdesk</span>
            {myTicketsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500 text-white text-[10px] font-mono font-bold">
                {myTicketsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW A: TOURNAMENTS ARENA                                */}
      {/* ======================================================== */}
      {sectionView === 'tournaments' && (
        <div className="space-y-4">
          {/* Search & Status Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search tournaments by title, mode, or map..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#111726]/90 border border-white/[0.08] rounded-2xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-zinc-400 font-bold uppercase text-[10px] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Status:</span>
              </span>
              {['All', 'Open', 'Upcoming', 'Live', 'Completed'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                    selectedStatus === s
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs no-scrollbar">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedMode(mode.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  selectedMode === mode.id
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-[#111726] text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.06]'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Tournaments Grid */}
          {filteredTournaments.length === 0 ? (
            <div className="bg-[#111726] rounded-3xl border border-white/[0.08] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-zinc-500 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Tournaments Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No tournaments match the chosen mode or status filter. Try clearing filters or wait for moderators to post new custom lobbies.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('All');
                  setSelectedStatus('All');
                  setSearch('');
                }}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold text-zinc-300 rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  isRegistered={
                    tournament.registeredPlayerIds?.includes(currentWorker.id) || false
                  }
                  onJoinClick={(t) => {
                    if (!currentWorker.inGameName && !currentWorker.hasTournamentProfile) {
                      notify('Please set up your player IGN in Tournament Profile before registering!');
                      setProfileModalOpen(true);
                    } else {
                      setJoiningTournament(t);
                    }
                  }}
                  onDetailsClick={(t) => setDetailsTournament(t)}
                />
              ))}
            </div>
          )}

          {/* Player Support Desk Banner */}
          <div className="bg-gradient-to-r from-purple-950/30 via-[#101426] to-[#0d1222] border border-purple-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white">Tournament Player Helpdesk &amp; Score Dispute</h4>
                <p className="text-zinc-400 text-[11px]">
                  Have a question about room credentials, prize money escrow, or match score accuracy?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTicketModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer"
            >
              Open Support Ticket
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW B: MATCH RESULTS SYSTEM                             */}
      {/* Official verified match scorecards, MVP & frags          */}
      {/* ======================================================== */}
      {sectionView === 'match_results' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-[#111728] border border-white/[0.08] p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Swords className="w-4 h-4" />
                <span>Official Tournament Match Results &amp; Verified Scorecards</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Match Records &amp; Score Verification
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Official scores audited and confirmed by tournament moderators.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#0b101c] border border-white/[0.06] px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Matches Verified</span>
                <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{matchResults.length}</span>
              </div>
              <div className="bg-[#0b101c] border border-white/[0.06] px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Cash Distributed</span>
                <span className="text-lg font-bold text-cyan-400 font-mono mt-0.5 block">
                  ₹{matchResults.reduce((sum, m) => sum + (m.totalPrizeDistributedINR || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Mode Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search match results by tournament, mode, or MVP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#111728] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {['All', 'Solo', 'Battle Royale', 'Squad', 'Lone Wolf'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMode(m)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedMode === m
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Match Results List */}
          {filteredMatchResults.length === 0 ? (
            <div className="bg-[#111728] rounded-3xl border border-white/[0.08] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-zinc-500 flex items-center justify-center mx-auto">
                <Swords className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Match Results Yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No completed matches recorded under this filter. As tournaments conclude, moderators audit score recordings and publish final placements here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatchResults.map((result) => {
                const isExpanded = expandedResultId === result.id;
                return (
                  <div
                    key={result.id}
                    className="bg-[#111728] border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl p-5 space-y-4 transition-all shadow-xl"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {result.gameMode}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>{result.matchDate} • {result.matchTime}</span>
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Map: <strong className="text-zinc-200">{result.map}</strong>
                          </span>
                          {result.roomId && (
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              Lobby: {result.roomId}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {result.tournamentTitle}
                        </h3>

                        {result.notes && (
                          <p className="text-xs text-zinc-400 italic">
                            &quot;{result.notes}&quot;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {result.mvpPlayerName && (
                          <div className="bg-[#0b101c] border border-amber-500/30 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-amber-400 block tracking-wider">
                                Match MVP
                              </span>
                              <span className="text-xs font-black text-white font-mono">
                                {result.mvpPlayerName}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="bg-[#0b101c] border border-white/[0.08] px-3.5 py-2 rounded-2xl">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 block">
                            Prize Escrow Distributed
                          </span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            ₹{result.totalPrizeDistributedINR.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyResultSummary(result)}
                            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 rounded-xl transition-colors cursor-pointer"
                            title="Copy Match Summary"
                          >
                            {copiedResultId === result.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setExpandedResultId(isExpanded ? null : result.id)}
                            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide Scorecard' : 'View Full Scorecard'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Scorecard Table */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-white/[0.08] space-y-3 animate-in fade-in-50 duration-200">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Official Player Score Verification ({result.scores.length} Players)</span>
                          </span>
                          <span className="font-mono text-[11px] text-zinc-500">
                            Audited by {result.verifiedBy}
                          </span>
                        </div>

                        <div className="bg-[#0b101c] border border-white/[0.06] rounded-2xl overflow-hidden shadow-inner">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-white/[0.02] border-b border-white/[0.08] text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                  <th className="py-2.5 px-3">Rank</th>
                                  <th className="py-2.5 px-3">Player (IGN)</th>
                                  <th className="py-2.5 px-3">In-Game UID</th>
                                  <th className="py-2.5 px-3">Kills</th>
                                  <th className="py-2.5 px-3">Damage</th>
                                  <th className="py-2.5 px-3">Placement Pts</th>
                                  <th className="py-2.5 px-3">Total Pts</th>
                                  <th className="py-2.5 px-4 text-right">Prize Awarded</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/[0.05]">
                                {result.scores.map((s) => (
                                  <tr key={s.participantId} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-2.5 px-3">
                                      <span
                                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                          s.rank === 1
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                            : s.rank === 2
                                            ? 'bg-zinc-300/20 text-zinc-200 border border-zinc-400/40'
                                            : s.rank === 3
                                            ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                                            : 'bg-white/[0.04] text-zinc-400'
                                        }`}
                                      >
                                        #{s.rank}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-bold text-white">
                                      <div className="flex items-center gap-1.5">
                                        <span>{s.inGameName}</span>
                                        {s.isMvp && (
                                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">
                                            ⭐ MVP
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-zinc-500 font-normal">
                                        User: {s.workerName}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-300">
                                      {s.inGameUid}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-zinc-200 font-bold">
                                      {s.kills}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-zinc-400">
                                      {s.damage || '—'}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-zinc-300">
                                      {s.placementPoints}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-black text-cyan-300">
                                      {s.totalPoints}
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">
                                      {s.prizeWonINR && s.prizeWonINR > 0 ? `₹${s.prizeWonINR.toLocaleString('en-IN')}` : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Dispute Callout */}
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                          <span className="flex items-center gap-1 text-zinc-500">
                            <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Scores disputed? Submit spectator recording ticket within 24 hours.</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setTicketModalOpen(true)}
                            className="text-purple-400 hover:text-purple-300 font-bold hover:underline cursor-pointer"
                          >
                            Dispute Score in Helpdesk →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW C: PUBLIC LEADERBOARD (HALL OF FAME)                 */}
      {/* Real-time aggregate rankings & frag counts               */}
      {/* ======================================================== */}
      {sectionView === 'leaderboard' && (
        <PublicLeaderboardView isModerator={false} />
      )}

      {/* ======================================================== */}
      {/* VIEW D: ADD DEPOSIT SECTION                             */}
      {/* ======================================================== */}
      {sectionView === 'deposit' && (
        <AddDepositForm />
      )}
        </>
      )}

      {/* ======================================================== */}
      {/* 4. MODALS & PANELS                                       */}
      {/* ======================================================== */}

      {/* Hidden Moderator PIN Modal */}
      <ModeratorPinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />

      {/* Add Deposit Modal */}
      <AddDepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />

      {/* Moderator Management Panel */}
      <ModeratorPanel
        isOpen={moderatorPanelOpen}
        onClose={() => setModeratorPanelOpen(false)}
        onLockModerator={handleLockModerator}
      />

      {/* Join / Registration Modal */}
      <TournamentJoinModal
        tournament={joiningTournament}
        onClose={() => setJoiningTournament(null)}
        onSuccess={() => {
          setJoiningTournament(null);
        }}
      />

      {/* Details & Rules Modal */}
      <TournamentDetailsModal
        tournament={detailsTournament}
        onClose={() => setDetailsTournament(null)}
        isRegistered={
          detailsTournament
            ? detailsTournament.registeredPlayerIds?.includes(currentWorker.id) || false
            : false
        }
        onJoinClick={() => {
          const target = detailsTournament;
          setDetailsTournament(null);
          if (target) setJoiningTournament(target);
        }}
      />

      {/* Customer Support Ticket Modal for Players */}
      <PlayerSupportTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
      />

      {/* Tournament Profile Setup Gate Modal */}
      <TournamentProfileSetupModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        isMandatory={!currentWorker.hasTournamentProfile || !currentWorker.esportsTournamentUid}
        onProfileActivated={() => {
          // Keep celebration view open until user clicks 'Enter Task and Esports Arena Now'
        }}
      />
    </div>
  );
};
