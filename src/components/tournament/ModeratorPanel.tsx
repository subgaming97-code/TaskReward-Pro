import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Tournament,
  TournamentGameMode,
  TournamentStatus,
  TournamentParticipant,
} from '../../types';
import { MatchResultsModule } from './MatchResultsModule';
import { SupportTicketsModule } from './SupportTicketsModule';
import { PublicLeaderboardView } from './PublicLeaderboardView';
import { TournamentCountdown, parseTournamentStartTime } from './TournamentCountdown';
import { EsportsUidInspectorModal } from './EsportsUidInspectorModal';
import {
  Shield,
  PlusCircle,
  X,
  Edit3,
  Trash2,
  Users,
  Key,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Gamepad2,
  Search,
  Lock,
  Download,
  Share2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Medal,
  Coins,
  FileSpreadsheet,
  FileCode,
  UserPlus,
  Sparkles,
  ShieldAlert,
  Swords,
  LifeBuoy,
  Timer,
  Wallet,
  CheckCircle2,
  Flame,
} from 'lucide-react';

const GAME_MODES: {
  mode: TournamentGameMode;
  label: string;
  desc: string;
  defaultSlots: number;
  defaultMap: string;
}[] = [
  { mode: 'Solo', label: 'Solo', desc: '1-Player Individual Battle', defaultSlots: 48, defaultMap: 'Bermuda' },
  { mode: 'Battle Royale', label: 'Battle Royale', desc: 'Full Map 48-Player Survival', defaultSlots: 48, defaultMap: 'Bermuda' },
  { mode: 'Squad', label: 'Squad', desc: '4-Player Team Warfare', defaultSlots: 48, defaultMap: 'Purgatory' },
  { mode: 'Lone Wolf', label: 'Lone Wolf', desc: '1v1 / 2v2 Iron Cage Duel', defaultSlots: 16, defaultMap: 'Iron Cage' },
  { mode: 'Craftland', label: 'Craftland', desc: 'Custom Creator Maps & Arenas', defaultSlots: 24, defaultMap: 'Custom Craftland Arena' },
  { mode: '1v1', label: '1v1', desc: 'Single Combat Deathmatch', defaultSlots: 8, defaultMap: 'Desert Duel' },
  { mode: '3v3', label: '3v3', desc: 'Trios Tactical Firefight', defaultSlots: 24, defaultMap: 'Bermuda Mini' },
  { mode: '2v2', label: '2v2', desc: 'Duo Tag Team Showdown', defaultSlots: 16, defaultMap: 'Iron Cage' },
];

const PRESET_MAPS = [
  'Bermuda',
  'Purgatory',
  'Kalahari',
  'Alpine',
  'Iron Cage',
  'Desert Duel',
  'Bermuda Mini',
  'Custom Craftland Arena',
];

const STATUS_OPTIONS: TournamentStatus[] = [
  'Registration Open',
  'Upcoming',
  'Registration Closed',
  'In Progress',
  'Score Verification',
  'Completed',
  'Cancelled',
];

interface ModeratorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLockModerator: () => void;
}

export const ModeratorPanel: React.FC<ModeratorPanelProps> = ({
  isOpen,
  onClose,
  onLockModerator,
}) => {
  const {
    tournaments,
    tournamentParticipants,
    workers,
    matchResults,
    supportTickets,
    addTournament,
    updateTournament,
    deleteTournament,
    updateParticipant,
    removeParticipant,
    notify,
  } = useApp();

  // Navigation Tabs: manage, scheduler, match_results, leaderboard, tickets, create, security
  const [activeTab, setActiveTab] = useState<
    'manage' | 'scheduler' | 'match_results' | 'leaderboard' | 'tickets' | 'create' | 'security'
  >('manage');

  const [filterMode, setFilterMode] = useState<string>('All');
  const [filterFee, setFilterFee] = useState<'All' | 'Free' | 'Paid'>('All');
  const [search, setSearch] = useState<string>('');

  // Modals & Panels
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [reschedulingTournament, setReschedulingTournament] = useState<Tournament | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('2026-10-07');
  const [rescheduleTime, setRescheduleTime] = useState<string>('20:00 IST');
  const [viewingParticipantsFor, setViewingParticipantsFor] = useState<Tournament | null>(null);
  const [roomManagerTournament, setRoomManagerTournament] = useState<Tournament | null>(null);
  const [esportsUidQuery, setEsportsUidQuery] = useState<string>('');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [inspectorInitialUid, setInspectorInitialUid] = useState<string>('');

  // Screen Security State
  const [isPrivacyShieldActive, setIsPrivacyShieldActive] = useState<boolean>(false);
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(5);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showRoomPasswords, setShowRoomPasswords] = useState<boolean>(false);

  // Clipboard Copied feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Tournament Form State
  const [newTitle, setNewTitle] = useState('');
  const [newGame, setNewGame] = useState('Free Fire MAX');
  const [newGameMode, setNewGameMode] = useState<TournamentGameMode>('Solo');
  const [newPrizePool, setNewPrizePool] = useState<number | ''>(5000);
  const [newFirstPrize, setNewFirstPrize] = useState<number | ''>(2500);
  const [newSecondPrize, setNewSecondPrize] = useState<number | ''>(1500);
  const [newThirdPrize, setNewThirdPrize] = useState<number | ''>(700);
  const [newPerKill, setNewPerKill] = useState<number | ''>(50);
  const [newEntryFeeType, setNewEntryFeeType] = useState<'Free' | 'Paid'>('Free');
  const [newEntryFee, setNewEntryFee] = useState<number | ''>(0);
  const [newMap, setNewMap] = useState('Bermuda');
  const [newCustomMap, setNewCustomMap] = useState('');
  const [newCustomMapCode, setNewCustomMapCode] = useState('');
  const [newMaxSlots, setNewMaxSlots] = useState<number | ''>(48);
  const [newScheduleDate, setNewScheduleDate] = useState('2026-10-07');
  const [newScheduleTime, setNewScheduleTime] = useState('20:00 IST');
  const [newStatus, setNewStatus] = useState<TournamentStatus>('Registration Open');
  const [newRoomId, setNewRoomId] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [newPublishCredentials, setNewPublishCredentials] = useState<boolean>(true);
  const [newRules, setNewRules] = useState(
    'Standard official rules. Gun attributes ON. Teaming with opponents results in immediate disqualification.'
  );

  // Manual Player Add form in Roster Modal
  const [manualIgn, setManualIgn] = useState('');
  const [manualUid, setManualUid] = useState('');
  const [manualWorkerId, setManualWorkerId] = useState('');
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusFilter, setRosterStatusFilter] = useState<string>('All');

  // Auto-lock inactivity detection
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isOpen) return;

    lastActivityRef.current = Date.now();
    setSecondsRemaining(autoLockMinutes * 60);

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
      setSecondsRemaining(autoLockMinutes * 60);
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, autoLockMinutes * 60 - elapsed);
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        notify('Moderator Console auto-locked due to inactivity.');
        onLockModerator();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [isOpen, autoLockMinutes, onLockModerator, notify]);

  const nextUpcoming = useMemo(() => {
    const candidates = [...tournaments].filter(
      (t) => t.status === 'Registration Open' || t.status === 'Upcoming'
    );
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => {
      const dateA = parseTournamentStartTime(a.scheduleDate, a.scheduleTime, a.startTimeISO).getTime();
      const dateB = parseTournamentStartTime(b.scheduleDate, b.scheduleTime, b.startTimeISO).getTime();
      return dateA - dateB;
    })[0];
  }, [tournaments]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    notify('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generateRandomCredentials = () => {
    const randomRoom = `ROOM-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomPass = `PRO${Math.floor(100 + Math.random() * 900)}`;
    return { roomId: randomRoom, roomPassword: randomPass };
  };

  const handleGameModeSelect = (mode: TournamentGameMode) => {
    setNewGameMode(mode);
    const found = GAME_MODES.find((m) => m.mode === mode);
    if (found) {
      setNewMaxSlots(found.defaultSlots);
      setNewMap(found.defaultMap);
    }
  };

  const applyStartTimePreset = (preset: {
    label: string;
    dateOffsetMins?: number;
    timeStr?: string;
    isTomorrow?: boolean;
  }) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    if (preset.dateOffsetMins) {
      const target = new Date(now.getTime() + preset.dateOffsetMins * 60 * 1000);
      setNewScheduleDate(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`);
      setNewScheduleTime(`${pad(target.getHours())}:${pad(target.getMinutes())} IST`);
      notify(`Kickoff time scheduled for ${preset.label}!`);
      return;
    }

    if (preset.isTomorrow) {
      const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
      setNewScheduleDate(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`);
    } else {
      setNewScheduleDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    }

    if (preset.timeStr) {
      setNewScheduleTime(preset.timeStr);
    }
    notify(`Kickoff preset applied: ${preset.label}`);
  };

  const openRescheduleModal = (t: Tournament) => {
    setReschedulingTournament(t);
    setRescheduleDate(t.scheduleDate || '2026-10-07');
    setRescheduleTime(t.scheduleTime || '20:00 IST');
  };

  const applyReschedulePreset = (preset: {
    label: string;
    dateOffsetMins?: number;
    timeStr?: string;
    isTomorrow?: boolean;
  }) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    if (preset.dateOffsetMins) {
      const target = new Date(now.getTime() + preset.dateOffsetMins * 60 * 1000);
      setRescheduleDate(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`);
      setRescheduleTime(`${pad(target.getHours())}:${pad(target.getMinutes())} IST`);
      notify(`Kickoff rescheduled to ${preset.label}!`);
      return;
    }

    if (preset.isTomorrow) {
      const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
      setRescheduleDate(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`);
    } else {
      setRescheduleDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    }

    if (preset.timeStr) {
      setRescheduleTime(preset.timeStr);
    }
    notify(`Kickoff preset applied: ${preset.label}`);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingTournament) return;
    const target = parseTournamentStartTime(rescheduleDate, rescheduleTime);
    updateTournament(reschedulingTournament.id, {
      scheduleDate: rescheduleDate,
      scheduleTime: rescheduleTime.trim().endsWith('IST') ? rescheduleTime.trim() : `${rescheduleTime.trim()} IST`,
      startTimeISO: target.toISOString(),
    });
    notify(`Tournament "${reschedulingTournament.title}" rescheduled successfully to ${rescheduleDate} at ${rescheduleTime}!`);
    setReschedulingTournament(null);
  };

  const handleQuickPresetForTournament = (
    tournament: Tournament,
    preset: { label: string; dateOffsetMins?: number; timeStr?: string; isTomorrow?: boolean }
  ) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    let targetDateStr = '';
    let targetTimeStr = '';

    if (preset.dateOffsetMins) {
      const target = new Date(now.getTime() + preset.dateOffsetMins * 60 * 1000);
      targetDateStr = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
      targetTimeStr = `${pad(target.getHours())}:${pad(target.getMinutes())} IST`;
    } else if (preset.isTomorrow) {
      const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
      targetDateStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
      targetTimeStr = preset.timeStr || '20:00 IST';
    } else {
      targetDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      targetTimeStr = preset.timeStr || '20:00 IST';
    }

    const targetDate = parseTournamentStartTime(targetDateStr, targetTimeStr);
    updateTournament(tournament.id, {
      scheduleDate: targetDateStr,
      scheduleTime: targetTimeStr,
      startTimeISO: targetDate.toISOString(),
    });
    notify(`"${tournament.title}" rescheduled to ${preset.label} (${targetDateStr} at ${targetTimeStr})!`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      notify('Please enter a tournament title.');
      return;
    }

    const finalMap = newCustomMap.trim() || newMap;
    const finalEntryFee = newEntryFeeType === 'Free' ? 0 : Number(newEntryFee) || 0;
    const targetStartTime = parseTournamentStartTime(newScheduleDate, newScheduleTime);

    addTournament({
      title: newTitle.trim(),
      game: newGame.trim() || 'Free Fire MAX',
      gameMode: newGameMode,
      prizePoolINR: Number(newPrizePool) || 0,
      firstPrizeINR: Number(newFirstPrize) || 0,
      secondPrizeINR: Number(newSecondPrize) || 0,
      thirdPrizeINR: Number(newThirdPrize) || 0,
      perKillINR: Number(newPerKill) || 0,
      entryFeeINR: finalEntryFee,
      map: finalMap,
      customMapCode: newCustomMapCode.trim() || undefined,
      maxSlots: Number(newMaxSlots) || 48,
      registeredPlayerIds: [],
      scheduleDate: newScheduleDate,
      scheduleTime: newScheduleTime,
      startTimeISO: targetStartTime.toISOString(),
      status: newStatus,
      roomId: newRoomId.trim(),
      roomPassword: newRoomPassword.trim(),
      isRoomCredentialsPublished: newPublishCredentials,
      rules: newRules.trim(),
    });

    setNewTitle('');
    setNewEntryFeeType('Free');
    setNewEntryFee(0);
    setNewRoomId('');
    setNewRoomPassword('');
    setActiveTab('manage');
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTournament) return;

    const targetStartTime = parseTournamentStartTime(
      editingTournament.scheduleDate,
      editingTournament.scheduleTime
    );

    updateTournament(editingTournament.id, {
      title: editingTournament.title,
      gameMode: editingTournament.gameMode,
      prizePoolINR: Number(editingTournament.prizePoolINR) || 0,
      firstPrizeINR: Number(editingTournament.firstPrizeINR) || 0,
      secondPrizeINR: Number(editingTournament.secondPrizeINR) || 0,
      thirdPrizeINR: Number(editingTournament.thirdPrizeINR) || 0,
      perKillINR: Number(editingTournament.perKillINR) || 0,
      entryFeeINR: Number(editingTournament.entryFeeINR) || 0,
      map: editingTournament.map,
      maxSlots: Number(editingTournament.maxSlots) || 48,
      scheduleDate: editingTournament.scheduleDate,
      scheduleTime: editingTournament.scheduleTime,
      startTimeISO: targetStartTime.toISOString(),
      status: editingTournament.status,
      roomId: editingTournament.roomId || '',
      roomPassword: editingTournament.roomPassword || '',
      isRoomCredentialsPublished: editingTournament.isRoomCredentialsPublished,
      rules: editingTournament.rules || '',
    });

    setEditingTournament(null);
  };

  const handleSetLifecycleStatus = (tournamentId: string, status: TournamentStatus) => {
    updateTournament(tournamentId, { status });
    notify(`Status transitioned to: ${status}`);
  };

  const handleToggleRoomPublish = (t: Tournament) => {
    const nextState = !t.isRoomCredentialsPublished;
    updateTournament(t.id, { isRoomCredentialsPublished: nextState });
    notify(nextState ? `Credentials published for "${t.title}".` : `Credentials hidden for "${t.title}".`);
  };

  const exportResultsCSV = (tournament: Tournament) => {
    const participants = tournamentParticipants.filter((p) => p.tournamentId === tournament.id);
    const headers = [
      'Tournament',
      'Game',
      'Mode',
      'Date',
      'RoomID',
      'IGN',
      'PlayerUID',
      'WorkerName',
      'Status',
      'Rank',
      'Kills',
      'Points',
      'PrizeWonINR',
    ];
    const rows = participants.map((p) => [
      `"${tournament.title.replace(/"/g, '""')}"`,
      `"${tournament.game.replace(/"/g, '""')}"`,
      `"${tournament.gameMode}"`,
      `"${tournament.scheduleDate}"`,
      `"${tournament.roomId || 'N/A'}"`,
      `"${p.inGameName.replace(/"/g, '""')}"`,
      `"${p.inGameUid}"`,
      `"${p.workerName.replace(/"/g, '""')}"`,
      `"${p.status}"`,
      p.rank ?? 'N/A',
      p.kills ?? 0,
      p.points ?? 0,
      p.prizeWonINR ?? 0,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `${tournament.title.replace(/[^a-zA-Z0-9]/g, '_')}_results.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Exported results CSV successfully!');
  };

  const handleAddManualPlayer = (tournament: Tournament) => {
    if (!manualIgn.trim() || !manualUid.trim()) {
      notify('Please provide IGN and UID.');
      return;
    }

    const matchedWorker = workers.find((w) => w.id === manualWorkerId) || workers[0];
    const newParticipant: TournamentParticipant = {
      id: `tp-manual-${Date.now()}`,
      tournamentId: tournament.id,
      workerId: matchedWorker ? matchedWorker.id : 'w-guest',
      workerName: matchedWorker ? matchedWorker.name : 'Guest Player',
      workerUid: matchedWorker ? matchedWorker.uniqueUserId || matchedWorker.eid : 'UID-MANUAL',
      inGameName: manualIgn.trim(),
      inGameUid: manualUid.trim(),
      registeredAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'checked_in',
    };

    updateTournament(tournament.id, {
      registeredSlots: Math.min(tournament.maxSlots, (tournament.registeredSlots || 0) + 1),
      registeredPlayerIds: [...(tournament.registeredPlayerIds || []), newParticipant.workerId],
    });

    notify(`Player "${manualIgn}" added to tournament roster.`);
    setManualIgn('');
    setManualUid('');
  };

  const filteredTournaments = tournaments.filter((t) => {
    const matchesMode = filterMode === 'All' || t.gameMode === filterMode;
    const matchesFee =
      filterFee === 'All' ||
      (filterFee === 'Free' && (t.entryFeeINR === 0 || !t.entryFeeINR)) ||
      (filterFee === 'Paid' && (t.entryFeeINR || 0) > 0);
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.gameMode.toLowerCase().includes(q) ||
      t.map.toLowerCase().includes(q) ||
      (t.roomId && t.roomId.toLowerCase().includes(q)) ||
      (t.esportsTournamentUid && t.esportsTournamentUid.toLowerCase().includes(q));
    return matchesMode && matchesFee && matchesSearch;
  });

  const minutesRemaining = Math.floor(secondsRemaining / 60);
  const secRemainder = secondsRemaining % 60;
  const openTicketsCount = supportTickets.filter((t) => t.status === 'open').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b101c] border border-cyan-500/40 w-full max-w-6xl rounded-3xl shadow-2xl shadow-cyan-950/70 flex flex-col max-h-[94vh] overflow-hidden relative">
        {/* Security Watermark Banner */}
        {showWatermark && (
          <div className="bg-[#070b14] border-b border-cyan-500/20 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-cyan-400 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MOD-SECURITY • CUSTOM PIN VERIFIED • ID: #MOD-754-LIVE</span>
              <span className="text-zinc-500 hidden md:inline">|</span>
              <span className="text-zinc-400 hidden md:inline">aratibera754@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              {isPrivacyShieldActive && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span>Stream Privacy Shield ACTIVE</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-zinc-400">
                <Timer className="w-3 h-3 text-cyan-400" />
                <span>
                  Auto-Lock: {minutesRemaining}:{secRemainder < 10 ? `0${secRemainder}` : secRemainder}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-gradient-to-r from-cyan-950/40 via-[#10182c] to-[#0b101c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Tournament Moderator Console
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Custom PIN Authorized</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Manage tournaments, publish match results, audit public leaderboard, and resolve customer support tickets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsPrivacyShieldActive(!isPrivacyShieldActive);
                notify(!isPrivacyShieldActive ? 'Privacy Shield Activated.' : 'Privacy Shield Deactivated.');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isPrivacyShieldActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border-white/[0.08]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isPrivacyShieldActive ? 'Privacy ON' : 'Privacy Shield'}</span>
            </button>

            <button
              type="button"
              onClick={onLockModerator}
              className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock &amp; Exit</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls: Manage, Match Results, Leaderboard, Support Tickets, Create, Security */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-white/[0.06] flex items-center gap-2 bg-[#0e1424] overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tournaments ({tournaments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scheduler')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'scheduler'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Start Time Scheduler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('match_results')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'match_results'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Match Results ({matchResults.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Medal className="w-4 h-4" />
            <span>Public Leaderboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer relative ${
              activeTab === 'tickets'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support Tickets</span>
            {openTicketsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {openTicketsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Tournament</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Screen Security</span>
          </button>
        </div>

        {/* E-sports Tournament UID Global Inspector Input Bar */}
        <div className="bg-[#0e1628] border-b border-cyan-500/30 px-4 sm:px-6 py-2.5 space-y-2 shadow-inner">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Search by E-sports Tournament UID:</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (esportsUidQuery.trim()) {
                  setInspectorInitialUid(esportsUidQuery.trim());
                  setIsInspectorOpen(true);
                }
              }}
              className="flex items-center gap-2 flex-1 max-w-xl"
            >
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-2.5" />
                <input
                  id="moderator-esports-uid-search-input"
                  type="text"
                  placeholder="Enter E-sports Tournament UID (e.g. ETUID-TRN-88210, ETUID-928410)..."
                  value={esportsUidQuery}
                  onChange={(e) => setEsportsUidQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-[#080d1a] border border-cyan-500/40 focus:border-cyan-400 rounded-xl text-xs text-white placeholder:text-zinc-500 font-mono outline-none shadow-inner"
                />
                {esportsUidQuery && (
                  <button
                    type="button"
                    onClick={() => setEsportsUidQuery('')}
                    className="absolute right-2 top-2 text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-cyan-600/30 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Account &amp; Settings</span>
              </button>
            </form>
          </div>

          {/* Quick Clickable Suggestions for Tournament UIDs */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="text-zinc-500 font-bold uppercase text-[9px] mr-1">Quick Tournament UIDs:</span>
            {tournaments
              .filter((t) => t.esportsTournamentUid)
              .slice(0, 5)
              .map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setEsportsUidQuery(t.esportsTournamentUid || t.id);
                    setInspectorInitialUid(t.esportsTournamentUid || t.id);
                    setIsInspectorOpen(true);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 font-mono text-[10px] transition-colors cursor-pointer"
                  title={`Inspect ${t.title} settings`}
                >
                  🏆 {t.esportsTournamentUid}
                </button>
              ))}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 ${isPrivacyShieldActive ? 'select-none' : ''}`}>
          {/* TAB 1: MANAGE TOURNAMENTS */}
          {activeTab === 'manage' && (
            <div className="space-y-4 text-xs">
              {/* UPCOMING KICKOFF HIGHLIGHT BANNER */}
              {nextUpcoming && (
                <div className="bg-gradient-to-r from-[#0d1c33] via-[#0e1628] to-[#121124] border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-xl shadow-cyan-950/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>Next Scheduled Kickoff</span>
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 font-mono">
                          {nextUpcoming.gameMode} • {nextUpcoming.map}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white line-clamp-1">
                        {nextUpcoming.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{nextUpcoming.scheduleDate}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{nextUpcoming.scheduleTime}</span>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">
                          ₹{nextUpcoming.prizePoolINR.toLocaleString('en-IN')} Prize Pool
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="min-w-[270px]">
                        <TournamentCountdown
                          scheduleDate={nextUpcoming.scheduleDate}
                          scheduleTime={nextUpcoming.scheduleTime}
                          startTimeISO={nextUpcoming.startTimeISO}
                          variant="cards"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => openRescheduleModal(nextUpcoming)}
                        className="px-3.5 py-2.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/50 hover:border-cyan-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-center whitespace-nowrap shadow-sm"
                        title="Adjust Kickoff Start Time"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>Schedule Start Time</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by title, mode, map, or Room ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#111728] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-zinc-400 font-bold uppercase text-[10px] mr-1">Mode:</span>
                  {['All', 'Solo', 'Battle Royale', 'Squad', 'Lone Wolf', 'Craftland', '1v1', '2v2', '3v3'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFilterMode(m)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                        filterMode === m
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#111728] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.02] border-b border-white/[0.08] text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Tournament</th>
                        <th className="py-3 px-3">Mode &amp; Map</th>
                        <th className="py-3 px-3">Prize Pool</th>
                        <th className="py-3 px-3">Slots (Filled)</th>
                        <th className="py-3 px-3">Room ID &amp; Pass</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {filteredTournaments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-zinc-500">
                            No tournaments match filter.
                          </td>
                        </tr>
                      ) : (
                        filteredTournaments.map((t) => {
                          const participants = tournamentParticipants.filter((p) => p.tournamentId === t.id);
                          const slotPercent = Math.min(100, Math.round(((t.registeredSlots || 0) / t.maxSlots) * 100));

                          return (
                            <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-white text-xs">{t.title}</div>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInspectorInitialUid(t.esportsTournamentUid || t.id);
                                      setIsInspectorOpen(true);
                                    }}
                                    className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                    title="Audit account details and settings for this UID"
                                  >
                                    UID: {t.esportsTournamentUid || t.id}
                                  </button>
                                  <span className="text-[11px] text-zinc-400 font-mono">
                                    {t.scheduleDate} {t.scheduleTime}
                                  </span>
                                  <TournamentCountdown
                                    scheduleDate={t.scheduleDate}
                                    scheduleTime={t.scheduleTime}
                                    startTimeISO={t.startTimeISO}
                                    variant="compact"
                                  />
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                  {t.gameMode}
                                </span>
                                <span className="text-[10px] text-zinc-400 block mt-0.5">{t.map}</span>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-mono font-bold text-emerald-400">
                                  ₹{t.prizePoolINR.toLocaleString('en-IN')}
                                </div>
                                <div className="mt-0.5">
                                  {Number(t.entryFeeINR || 0) === 0 ? (
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 inline-block">
                                      Free Entry
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 inline-block">
                                      ₹{t.entryFeeINR} Fee
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-mono text-zinc-200">
                                  {t.registeredSlots} / {t.maxSlots}
                                </div>
                                <div className="w-20 bg-white/[0.1] h-1.5 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={`h-full rounded-full ${slotPercent >= 90 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                                    style={{ width: `${slotPercent}%` }}
                                  />
                                </div>
                              </td>

                              <td className="py-3 px-3 font-mono text-[11px]">
                                {t.roomId ? (
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-amber-400 font-bold ${isPrivacyShieldActive ? 'blur-[3px]' : ''}`}>
                                        {t.roomId}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(t.roomId || '', `room-${t.id}`)}
                                        className="text-zinc-400 hover:text-cyan-400"
                                      >
                                        {copiedKey === `room-${t.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                    <div className="text-[10px] text-zinc-400">
                                      Pass:{' '}
                                      <span className={isPrivacyShieldActive || !showRoomPasswords ? 'blur-[3px]' : ''}>
                                        {t.roomPassword || 'None'}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleRoomPublish(t)}
                                      className="text-[9px] font-bold text-cyan-400 hover:underline"
                                    >
                                      {t.isRoomCredentialsPublished ? '● Published' : '○ Hidden'}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setRoomManagerTournament(t)}
                                    className="px-2 py-1 bg-amber-500/10 text-amber-300 rounded-lg text-[10px] font-semibold"
                                  >
                                    Set Room ID
                                  </button>
                                )}
                              </td>

                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    t.status === 'Registration Open'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : t.status === 'In Progress'
                                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                                      : t.status === 'Completed'
                                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                      : 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'
                                  }`}
                                >
                                  {t.status}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openRescheduleModal(t)}
                                    className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer"
                                    title="Schedule Start Time & Countdown"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setViewingParticipantsFor(t)}
                                    className="p-1.5 bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 rounded-lg"
                                    title="View Roster"
                                  >
                                    <Users className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRoomManagerTournament(t)}
                                    className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg"
                                    title="Manage Room ID"
                                  >
                                    <Key className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingTournament(t)}
                                    className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-lg"
                                    title="Edit Tournament"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Delete "${t.title}"?`)) deleteTournament(t.id);
                                    }}
                                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg"
                                    title="Delete Tournament"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: START TIME SCHEDULER & COUNTDOWN MONITOR */}
          {activeTab === 'scheduler' && (
            <div className="space-y-5 text-xs">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#0b162c] via-[#0d1f3d] to-[#121630] border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <Timer className="w-5 h-5 text-cyan-400" />
                      </span>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-white">
                          Tournament Start Time Scheduler
                        </h2>
                        <p className="text-zinc-400 text-xs">
                          Schedule tournament kickoffs, configure quick start presets, and monitor real-time countdowns down to the exact days, hours, minutes, and seconds.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab('create')}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap text-xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Schedule New Tournament</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Kickoff Spotlight Card */}
              {nextUpcoming && (
                <div className="bg-[#0b1426] border border-cyan-400/40 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                        Next Upcoming Kickoff Spotlight
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <span>Scheduled:</span>
                      <strong className="text-cyan-300">{nextUpcoming.scheduleDate} at {nextUpcoming.scheduleTime}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                    <div className="lg:col-span-5 space-y-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {nextUpcoming.gameMode} • {nextUpcoming.map}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {nextUpcoming.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono">
                        <span className="text-emerald-400 font-bold">
                          ₹{nextUpcoming.prizePoolINR.toLocaleString('en-IN')} Prize Pool
                        </span>
                        <span>•</span>
                        <span>{nextUpcoming.registeredSlots}/{nextUpcoming.maxSlots} Players</span>
                      </div>
                    </div>

                    <div className="lg:col-span-7">
                      <TournamentCountdown
                        scheduleDate={nextUpcoming.scheduleDate}
                        scheduleTime={nextUpcoming.scheduleTime}
                        startTimeISO={nextUpcoming.startTimeISO}
                        variant="cards"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
                        Quick Adjust:
                      </span>
                      {[
                        { label: '+15m Kickoff', dateOffsetMins: 15 },
                        { label: '+30m', dateOffsetMins: 30 },
                        { label: '+1 Hour', dateOffsetMins: 60 },
                        { label: 'Tonight 8 PM', timeStr: '20:00 IST' },
                        { label: 'Tomorrow 8 PM', isTomorrow: true, timeStr: '20:00 IST' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleQuickPresetForTournament(nextUpcoming, preset)}
                          className="px-2.5 py-1 bg-white/[0.04] hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-200 border border-white/[0.08] hover:border-cyan-500/30 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => openRescheduleModal(nextUpcoming)}
                      className="px-4 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/50 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>Custom Start Time Picker</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tournament Schedule Grid */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>All Tournaments &amp; Live Countdown Timers ({tournaments.length})</span>
                  </h3>
                  <div className="relative max-w-xs">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search tournaments to schedule..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTournaments.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
                      <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p className="text-zinc-400 font-semibold">No tournaments found for current search.</p>
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        Clear search filter
                      </button>
                    </div>
                  ) : (
                    filteredTournaments.map((t) => (
                      <div
                        key={t.id}
                        className="bg-[#101726] border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-4 space-y-3 transition-colors shadow-lg flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              {t.gameMode} • {t.map}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.status === 'Registration Open'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : t.status === 'In Progress'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                                  : t.status === 'Completed'
                                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                  : 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white line-clamp-1">{t.title}</h4>

                          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                            <span className="flex items-center gap-1 text-cyan-300 font-bold">
                              <Calendar className="w-3 h-3 text-cyan-400" />
                              <span>{t.scheduleDate}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-cyan-300 font-bold">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              <span>{t.scheduleTime}</span>
                            </span>
                          </div>

                          {/* Live 4-Segment Countdown Cards (Days, Hours, Minutes, Seconds) */}
                          <div className="pt-1">
                            <TournamentCountdown
                              scheduleDate={t.scheduleDate}
                              scheduleTime={t.scheduleTime}
                              startTimeISO={t.startTimeISO}
                              variant="cards"
                            />
                          </div>
                        </div>

                        {/* Quick Presets & Reschedule Action */}
                        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            <span>Quick Kickoff Presets:</span>
                            <span className="text-cyan-400">Instant Update</span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { label: '+15m Fast', dateOffsetMins: 15 },
                              { label: '+1 Hour', dateOffsetMins: 60 },
                              { label: '+2 Hours', dateOffsetMins: 120 },
                              { label: 'Tonight 8 PM', timeStr: '20:00 IST' },
                              { label: 'Tonight 9:30', timeStr: '21:30 IST' },
                              { label: 'Tomorrow 8 PM', isTomorrow: true, timeStr: '20:00 IST' },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => handleQuickPresetForTournament(t, preset)}
                                className="px-2 py-1.5 bg-white/[0.03] hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-200 border border-white/[0.06] hover:border-cyan-500/30 rounded-lg text-[10px] font-semibold text-center transition-colors cursor-pointer"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => openRescheduleModal(t)}
                            className="w-full py-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 text-cyan-200 border border-cyan-400/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
                          >
                            <Timer className="w-3.5 h-3.5" />
                            <span>Custom Date &amp; Time Scheduler</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATCH RESULTS SYSTEM & SCORE UPDATES */}
          {activeTab === 'match_results' && <MatchResultsModule />}

          {/* TAB 3: PUBLIC LEADERBOARD */}
          {activeTab === 'leaderboard' && <PublicLeaderboardView isModerator={true} />}

          {/* TAB 4: CUSTOMER SUPPORT TICKETS MODULE */}
          {activeTab === 'tickets' && <SupportTicketsModule />}

          {/* TAB 5: CREATE NEW TOURNAMENT */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-6 max-w-4xl mx-auto text-xs">
              <div className="bg-[#111728] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider border-b border-white/[0.08] pb-3">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Tournament Identification &amp; 8 Official Game Modes</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Tournament Title *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Free Fire MAX Pro Solo Blitz"
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Game Platform</label>
                    <input
                      type="text"
                      required
                      value={newGame}
                      onChange={(e) => setNewGame(e.target.value)}
                      placeholder="e.g. Free Fire MAX"
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">Select Game Mode *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {GAME_MODES.map((item) => (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() => handleGameModeSelect(item.mode)}
                        className={`p-3 rounded-xl border text-left cursor-pointer flex flex-col justify-between ${
                          newGameMode === item.mode
                            ? 'bg-cyan-500/15 border-cyan-400 text-white'
                            : 'bg-white/[0.02] border-white/[0.08] text-zinc-400'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white text-xs">{item.label}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</div>
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-cyan-400">
                          Slots: {item.defaultSlots}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Preset Map</label>
                    <select
                      value={newMap}
                      onChange={(e) => setNewMap(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-white/[0.1] rounded-xl text-white"
                    >
                      {PRESET_MAPS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Max Participant Slots</label>
                    <input
                      type="number"
                      value={newMaxSlots}
                      onChange={(e) => setNewMaxSlots(Number(e.target.value) || '')}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tournament Start Time & Kickoff Scheduler with Live Countdown Timer */}
              <div className="bg-[#111728] border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Timer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-cyan-400 font-bold uppercase tracking-wider text-xs block">
                        Start Time Scheduler
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Schedule tournament kickoff and monitor exact countdown remaining
                      </span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold">Scheduled Kickoff</span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {newScheduleDate} • {newScheduleTime}
                    </span>
                  </div>
                </div>

                {/* Date & Time Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 text-xs">
                      Kickoff Date (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      required
                      value={newScheduleDate}
                      onChange={(e) => setNewScheduleDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] focus:border-cyan-400 rounded-xl text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1 text-xs">
                      Start Time (IST / 24-hr)
                    </label>
                    <input
                      type="text"
                      required
                      value={newScheduleTime}
                      onChange={(e) => setNewScheduleTime(e.target.value)}
                      placeholder="e.g. 20:00 IST or 08:30 PM"
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] focus:border-cyan-400 rounded-xl font-mono text-cyan-300 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Quick Kickoff Presets:</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { label: '+15m (Fast Kickoff)', dateOffsetMins: 15 },
                      { label: '+30 Mins', dateOffsetMins: 30 },
                      { label: '+1 Hour', dateOffsetMins: 60 },
                      { label: '+2 Hours', dateOffsetMins: 120 },
                      { label: 'Tonight 8:00 PM', timeStr: '20:00 IST' },
                      { label: 'Tonight 9:30 PM', timeStr: '21:30 IST' },
                      { label: 'Tomorrow 8:00 PM', isTomorrow: true, timeStr: '20:00 IST' },
                      { label: 'Tomorrow 9:00 PM', isTomorrow: true, timeStr: '21:00 IST' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyStartTimePreset(preset)}
                        className="px-2 py-1.5 bg-white/[0.04] hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-200 border border-white/[0.08] hover:border-cyan-500/40 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer text-center"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Countdown Timer Section */}
                <div className="p-3.5 bg-[#090d18] border border-cyan-500/30 rounded-2xl space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                    <span className="flex items-center gap-1.5 text-cyan-400 uppercase tracking-wider">
                      <Timer className="w-3.5 h-3.5" />
                      <span>Countdown Until Tournament Begins</span>
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px]">
                      Displays exact Days, Hours, Minutes, and Seconds
                    </span>
                  </div>

                  <TournamentCountdown
                    scheduleDate={newScheduleDate}
                    scheduleTime={newScheduleTime}
                    variant="cards"
                  />
                </div>
              </div>

              {/* Tournament Entry Fee & Registration Mode (Free vs Paid Toggle) */}
              <div className="bg-[#111728] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Tournament Registration &amp; Entry Fee</span>
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      newEntryFeeType === 'Free'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {newEntryFeeType === 'Free' ? 'FREE REGISTRATION (₹0)' : `PAID ENTRY (₹${newEntryFee || 0})`}
                  </span>
                </div>

                {/* Entry Fee Toggle Buttons */}
                <div className="space-y-2">
                  <label className="block text-zinc-300 font-semibold text-xs">
                    Entry Fee Model:
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/30 rounded-2xl border border-white/[0.06]">
                    <button
                      id="create-tournament-entry-fee-free-btn"
                      type="button"
                      onClick={() => {
                        setNewEntryFeeType('Free');
                        setNewEntryFee(0);
                      }}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                        newEntryFeeType === 'Free'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 border-emerald-400 scale-[1.01]'
                          : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border-transparent'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <div className="text-left">
                        <div className="font-extrabold text-sm leading-none">Free</div>
                        <div className="text-[10px] opacity-80 mt-0.5">₹0 Fee • Open to all players</div>
                      </div>
                    </button>

                    <button
                      id="create-tournament-entry-fee-paid-btn"
                      type="button"
                      onClick={() => {
                        setNewEntryFeeType('Paid');
                        if (!newEntryFee || newEntryFee === 0) {
                          setNewEntryFee(50);
                        }
                      }}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                        newEntryFeeType === 'Paid'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30 border-amber-400 scale-[1.01]'
                          : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border-transparent'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-amber-300" />
                      <div className="text-left">
                        <div className="font-extrabold text-sm leading-none">Paid</div>
                        <div className="text-[10px] opacity-80 mt-0.5">Prompt entry amount in INR</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Free Mode vs Paid Mode Prompt */}
                {newEntryFeeType === 'Free' ? (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="leading-relaxed">
                      <strong>Free Tournament Mode:</strong> Entry fee is automatically set to <strong>₹0</strong>. Players can register instantly without any wallet fee deduction.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <label className="block text-zinc-200 font-bold text-xs mb-1">
                          Specify Entry Fee Amount (INR ₹) *
                        </label>
                        <p className="text-[11px] text-zinc-400">
                          Players must pay this entry fee from their available wallet balance to confirm registration.
                        </p>
                      </div>

                      <div className="relative w-full sm:w-48">
                        <span className="absolute left-3.5 top-2 font-mono font-bold text-amber-400 text-base">₹</span>
                        <input
                          id="tournament-entry-fee-amount-input"
                          type="number"
                          min={1}
                          required
                          value={newEntryFee === 0 ? '' : newEntryFee}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(1, Number(e.target.value));
                            setNewEntryFee(val);
                          }}
                          placeholder="e.g. 50"
                          className="w-full pl-8 pr-3 py-2 bg-white/[0.08] border border-amber-500/40 focus:border-amber-400 rounded-xl font-mono text-base font-bold text-amber-300 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/[0.08]">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Fee Presets:</span>
                      {[10, 20, 50, 100, 200].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setNewEntryFee(preset)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer border ${
                            newEntryFee === preset
                              ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                              : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border-white/[0.1]'
                          }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                      {newMaxSlots && Number(newMaxSlots) > 0 && newEntryFee && Number(newEntryFee) > 0 && (
                        <span className="ml-auto text-[11px] font-mono text-amber-400 font-semibold">
                          Total Slot Value: ₹{(Number(newEntryFee) * Number(newMaxSlots)).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Prize Pool Edition */}
              <div className="bg-[#111728] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
                    Prize Pool Edition (INR ₹)
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">
                    Total: ₹{Number(newPrizePool || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Total Prize Pool (₹)</label>
                    <input
                      type="number"
                      required
                      value={newPrizePool}
                      onChange={(e) => setNewPrizePool(Number(e.target.value) || '')}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-emerald-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">1st Place (₹)</label>
                    <input
                      type="number"
                      value={newFirstPrize}
                      onChange={(e) => setNewFirstPrize(Number(e.target.value) || '')}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">2nd Place (₹)</label>
                    <input
                      type="number"
                      value={newSecondPrize}
                      onChange={(e) => setNewSecondPrize(Number(e.target.value) || '')}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Per Kill Bounty (₹)</label>
                    <input
                      type="number"
                      value={newPerKill}
                      onChange={(e) => setNewPerKill(Number(e.target.value) || '')}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('manage')}
                  className="px-4 py-2 bg-white/[0.05] text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Publish Tournament
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: SCREEN SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="bg-[#111728] border border-white/[0.08] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div>
                    <span className="font-bold text-white block">Stream Privacy Shield</span>
                    <span className="text-[11px] text-zinc-400">
                      Blurs room credentials &amp; player UIDs on screen
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivacyShieldActive(!isPrivacyShieldActive)}
                    className={`px-4 py-1.5 rounded-xl font-bold ${
                      isPrivacyShieldActive ? 'bg-amber-500 text-black' : 'bg-white/[0.08] text-white'
                    }`}
                  >
                    {isPrivacyShieldActive ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Auto-Lock Inactivity Interval</span>
                    <span className="font-mono text-cyan-400">{autoLockMinutes} Mins</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 5, 10].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setAutoLockMinutes(mins);
                          setSecondsRemaining(mins * 60);
                          notify(`Auto-lock set to ${mins} mins.`);
                        }}
                        className={`py-1.5 rounded-lg font-bold border ${
                          autoLockMinutes === mins
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-white/[0.03] text-zinc-400 border-white/[0.06]'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                  <span className="font-bold text-rose-300">Emergency Lock Console</span>
                  <button
                    type="button"
                    onClick={onLockModerator}
                    className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl"
                  >
                    Lock Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: EDIT TOURNAMENT */}
      {editingTournament && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSave}
            className="bg-[#0e1424] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Edit: {editingTournament.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingTournament(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Status</label>
                <select
                  value={editingTournament.status}
                  onChange={(e) =>
                    setEditingTournament({ ...editingTournament, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-[#090d16] border border-white/[0.1] rounded-xl text-white"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Room ID</label>
                  <input
                    type="text"
                    value={editingTournament.roomId || ''}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, roomId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-amber-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Password</label>
                  <input
                    type="text"
                    value={editingTournament.roomPassword || ''}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, roomPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-amber-300"
                  />
                </div>
              </div>

              {/* Start Time Scheduler in Edit Tournament */}
              <div className="p-3 bg-white/[0.02] border border-cyan-500/30 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Start Time Scheduler</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-cyan-300">
                    {editingTournament.scheduleDate} • {editingTournament.scheduleTime}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={editingTournament.scheduleDate || ''}
                      onChange={(e) =>
                        setEditingTournament({ ...editingTournament, scheduleDate: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] focus:border-cyan-400 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Start Time (IST)</label>
                    <input
                      type="text"
                      value={editingTournament.scheduleTime || ''}
                      onChange={(e) =>
                        setEditingTournament({ ...editingTournament, scheduleTime: e.target.value })
                      }
                      placeholder="e.g. 20:00 IST"
                      className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] focus:border-cyan-400 rounded-xl font-mono text-cyan-300 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Quick Presets for Edit Modal */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
                  {[
                    { label: '+15m Kickoff', dateOffsetMins: 15 },
                    { label: '+30m', dateOffsetMins: 30 },
                    { label: '+1 Hour', dateOffsetMins: 60 },
                    { label: 'Tonight 8 PM', timeStr: '20:00 IST' },
                    { label: 'Tomorrow 8 PM', isTomorrow: true, timeStr: '20:00 IST' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const pad = (n: number) => String(n).padStart(2, '0');
                        let newD = editingTournament.scheduleDate;
                        let newT = editingTournament.scheduleTime;
                        if (preset.dateOffsetMins) {
                          const target = new Date(now.getTime() + preset.dateOffsetMins * 60 * 1000);
                          newD = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
                          newT = `${pad(target.getHours())}:${pad(target.getMinutes())} IST`;
                        } else if (preset.isTomorrow) {
                          const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
                          newD = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
                          if (preset.timeStr) newT = preset.timeStr;
                        } else if (preset.timeStr) {
                          newT = preset.timeStr;
                        }
                        setEditingTournament({
                          ...editingTournament,
                          scheduleDate: newD,
                          scheduleTime: newT,
                        });
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] bg-white/[0.04] hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-200 border border-white/[0.08] whitespace-nowrap cursor-pointer transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Live Countdown in Edit Modal */}
                <div className="pt-1">
                  <TournamentCountdown
                    scheduleDate={editingTournament.scheduleDate || ''}
                    scheduleTime={editingTournament.scheduleTime || ''}
                    variant="cards"
                  />
                </div>
              </div>

              {/* Entry Fee Model (Free vs Paid) */}
              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-300">Entry Fee Model</label>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">
                    {Number(editingTournament.entryFeeINR || 0) === 0 ? 'FREE (₹0)' : `PAID (₹${editingTournament.entryFeeINR})`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTournament({ ...editingTournament, entryFeeINR: 0 })}
                    className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-colors border cursor-pointer ${
                      Number(editingTournament.entryFeeINR || 0) === 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                        : 'bg-white/[0.03] text-zinc-400 border-white/[0.08]'
                    }`}
                  >
                    Free (₹0)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingTournament.entryFeeINR || editingTournament.entryFeeINR === 0) {
                        setEditingTournament({ ...editingTournament, entryFeeINR: 50 });
                      }
                    }}
                    className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-colors border cursor-pointer ${
                      Number(editingTournament.entryFeeINR || 0) > 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                        : 'bg-white/[0.03] text-zinc-400 border-white/[0.08]'
                    }`}
                  >
                    Paid
                  </button>
                </div>

                {Number(editingTournament.entryFeeINR || 0) > 0 && (
                  <div className="pt-1">
                    <label className="text-[11px] text-zinc-400 block mb-1">Set Entry Fee Amount (₹)</label>
                    <input
                      type="number"
                      min={1}
                      value={editingTournament.entryFeeINR || ''}
                      onChange={(e) =>
                        setEditingTournament({
                          ...editingTournament,
                          entryFeeINR: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white/[0.04] border border-amber-500/40 rounded-xl font-mono text-amber-300 font-bold"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTournament(null)}
                className="px-4 py-2 bg-white/[0.05] text-zinc-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 text-white font-bold rounded-xl shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ROSTER & PLAYERS */}
      {viewingParticipantsFor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1424] border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Roster: {viewingParticipantsFor.title}</span>
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {viewingParticipantsFor.registeredSlots} / {viewingParticipantsFor.maxSlots} Players
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportResultsCSV(viewingParticipantsFor)}
                  className="px-3 py-1 bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-xl font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingParticipantsFor(null)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {tournamentParticipants
                .filter((p) => p.tournamentId === viewingParticipantsFor.id)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">{p.inGameName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        UID: {p.inGameUid} • User: {p.workerName}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove ${p.inGameName}?`)) removeParticipant(p.id);
                      }}
                      className="p-1 text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setViewingParticipantsFor(null)}
                className="px-4 py-2 bg-white/[0.05] text-zinc-300 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ROOM MANAGER */}
      {roomManagerTournament && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-white">Room ID &amp; Password Console</h3>
              <button
                type="button"
                onClick={() => setRoomManagerTournament(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-zinc-300 mb-1 block">Room ID</label>
                <input
                  type="text"
                  value={roomManagerTournament.roomId || ''}
                  onChange={(e) =>
                    setRoomManagerTournament({ ...roomManagerTournament, roomId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-amber-300"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 mb-1 block">Room Password</label>
                <input
                  type="text"
                  value={roomManagerTournament.roomPassword || ''}
                  onChange={(e) =>
                    setRoomManagerTournament({ ...roomManagerTournament, roomPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-amber-300"
                />
              </div>

              <div className="p-3 bg-white/[0.03] rounded-xl flex items-center justify-between">
                <span className="font-bold text-zinc-200">Publish to Registered Players</span>
                <input
                  type="checkbox"
                  checked={roomManagerTournament.isRoomCredentialsPublished || false}
                  onChange={(e) =>
                    setRoomManagerTournament({
                      ...roomManagerTournament,
                      isRoomCredentialsPublished: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRoomManagerTournament(null)}
                className="px-4 py-2 bg-white/[0.05] text-zinc-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateTournament(roomManagerTournament.id, {
                    roomId: roomManagerTournament.roomId,
                    roomPassword: roomManagerTournament.roomPassword,
                    isRoomCredentialsPublished: roomManagerTournament.isRoomCredentialsPublished,
                  });
                  notify('Room credentials saved.');
                  setRoomManagerTournament(null);
                }}
                className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl shadow-md"
              >
                Save &amp; Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TOURNAMENT START TIME SCHEDULER & COUNTDOWN */}
      {reschedulingTournament && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleRescheduleSubmit}
            className="bg-[#0e1424] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl text-xs relative max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Schedule Tournament Start Time</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                    {reschedulingTournament.title} • {reschedulingTournament.gameMode} ({reschedulingTournament.map})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReschedulingTournament(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Schedule Summary Badge */}
            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between text-xs">
              <span className="text-zinc-400">Current Kickoff:</span>
              <div className="flex items-center gap-2 font-mono font-bold text-cyan-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{reschedulingTournament.scheduleDate}</span>
                <span>•</span>
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{reschedulingTournament.scheduleTime}</span>
              </div>
            </div>

            {/* Start Time Inputs */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Start Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] focus:border-cyan-400 rounded-xl text-white text-xs font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Start Time (IST / 24-hr)
                  </label>
                  <input
                    type="text"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    placeholder="e.g. 20:00 IST or 08:30 PM"
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] focus:border-cyan-400 rounded-xl font-mono text-cyan-300 text-xs font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Quick Kickoff Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Quick Kickoff Presets</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { label: '+15m Fast Kickoff', dateOffsetMins: 15 },
                    { label: '+30 Mins', dateOffsetMins: 30 },
                    { label: '+1 Hour', dateOffsetMins: 60 },
                    { label: '+2 Hours', dateOffsetMins: 120 },
                    { label: 'Tonight 8:00 PM', timeStr: '20:00 IST' },
                    { label: 'Tonight 9:30 PM', timeStr: '21:30 IST' },
                    { label: 'Tomorrow 8:00 PM', isTomorrow: true, timeStr: '20:00 IST' },
                    { label: 'Tomorrow 9:00 PM', isTomorrow: true, timeStr: '21:00 IST' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyReschedulePreset(preset)}
                      className="px-2 py-1.5 bg-white/[0.04] hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-200 border border-white/[0.08] hover:border-cyan-500/40 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer text-center"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* LIVE COUNTDOWN TIMER DISPLAY */}
            <div className="bg-[#080d1a] border border-cyan-500/30 rounded-2xl p-4 shadow-inner space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Countdown Until Tournament Begins</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Exact Days, Hours, Minutes, Seconds
                </span>
              </div>

              {/* The Live 4-Segment Countdown Cards */}
              <TournamentCountdown
                scheduleDate={rescheduleDate}
                scheduleTime={rescheduleTime}
                variant="cards"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReschedulingTournament(null)}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Start Time</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* E-sports Tournament UID Inspector Modal */}
      <EsportsUidInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        initialQuery={inspectorInitialUid}
        onEditTournament={(t) => setEditingTournament(t)}
      />
    </div>
  );
};
