import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TournamentMatchResult,
  TournamentPlayerScore,
  Tournament,
} from '../../types';
import {
  Trophy,
  Swords,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Download,
  Share2,
  Search,
  Filter,
  Medal,
  Star,
  Users,
  Coins,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  Flame,
  AlertCircle,
} from 'lucide-react';

export const MatchResultsModule: React.FC = () => {
  const {
    matchResults,
    tournaments,
    tournamentParticipants,
    addMatchResult,
    updateMatchResult,
    deleteMatchResult,
    updateWorkerBalance,
    notify,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<TournamentMatchResult | null>(null);
  const [viewingResult, setViewingResult] = useState<TournamentMatchResult | null>(null);

  // New Match Form State
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchTime, setMatchTime] = useState('20:00 IST');
  const [map, setMap] = useState('Bermuda');
  const [scores, setScores] = useState<TournamentPlayerScore[]>([]);
  const [matchStatus, setMatchStatus] = useState<'draft' | 'verified' | 'published'>('published');
  const [matchNotes, setMatchNotes] = useState('');

  // When tournament is selected in create form, auto-populate participants
  const handleSelectTournament = (tournId: string) => {
    setSelectedTournamentId(tournId);
    const tourn = tournaments.find((t) => t.id === tournId);
    if (!tourn) return;

    setMap(tourn.map);
    const participants = tournamentParticipants.filter((p) => p.tournamentId === tournId);

    const initialScores: TournamentPlayerScore[] = participants.map((p, idx) => ({
      participantId: p.id,
      inGameName: p.inGameName,
      inGameUid: p.inGameUid,
      workerId: p.workerId,
      workerName: p.workerName,
      rank: p.rank || idx + 1,
      kills: p.kills || 0,
      damage: (p.kills || 0) * 350 + 200,
      placementPoints: idx === 0 ? 12 : idx === 1 ? 9 : idx === 2 ? 8 : Math.max(1, 7 - idx),
      killPoints: p.kills || 0,
      totalPoints: (idx === 0 ? 12 : idx === 1 ? 9 : idx === 2 ? 8 : Math.max(1, 7 - idx)) + (p.kills || 0),
      prizeWonINR:
        idx === 0
          ? tourn.firstPrizeINR
          : idx === 1
          ? tourn.secondPrizeINR
          : idx === 2
          ? tourn.thirdPrizeINR
          : 0,
      isMvp: idx === 0,
    }));

    setScores(initialScores);
  };

  const handleScoreChange = (
    index: number,
    field: keyof TournamentPlayerScore,
    value: any
  ) => {
    setScores((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };

      // Auto compute placement pts and total points when rank or kills change
      if (field === 'rank' || field === 'kills') {
        const r = field === 'rank' ? Number(value) : target.rank;
        const k = field === 'kills' ? Number(value) : target.kills;
        let placement = 0;
        if (r === 1) placement = 12;
        else if (r === 2) placement = 9;
        else if (r === 3) placement = 8;
        else if (r === 4) placement = 7;
        else if (r === 5) placement = 6;
        else if (r === 6) placement = 5;
        else if (r === 7) placement = 4;
        else if (r === 8) placement = 3;
        else if (r === 9) placement = 2;
        else if (r === 10) placement = 1;

        target.placementPoints = placement;
        target.killPoints = k;
        target.totalPoints = placement + k;
      }

      updated[index] = target;
      return updated;
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tourn = tournaments.find((t) => t.id === selectedTournamentId);
    if (!tourn) {
      notify('Please select an associated tournament.');
      return;
    }

    const totalKills = scores.reduce((sum, s) => sum + (s.kills || 0), 0);
    const totalPrize = scores.reduce((sum, s) => sum + (s.prizeWonINR || 0), 0);
    const mvp = scores.find((s) => s.isMvp)?.inGameName || scores[0]?.inGameName;

    // Credit prizes to players if published
    if (matchStatus === 'published') {
      scores.forEach((s) => {
        if (s.prizeWonINR > 0 && s.workerId) {
          updateWorkerBalance(
            s.workerId,
            s.prizeWonINR,
            `Match Scorecard Prize (Rank #${s.rank}, ${s.kills} Kills): ${tourn.title}`,
            'Tournament Moderator'
          );
        }
      });
    }

    addMatchResult({
      tournamentId: tourn.id,
      tournamentTitle: tourn.title,
      game: tourn.game,
      gameMode: tourn.gameMode,
      matchDate,
      matchTime,
      map: map || tourn.map,
      roomId: tourn.roomId,
      scores,
      status: matchStatus,
      mvpPlayerName: mvp,
      totalKills,
      totalPrizeDistributedINR: totalPrize,
      verifiedBy: 'Tournament Moderator Console (Security Verified)',
      notes: matchNotes.trim() || undefined,
    });

    setIsCreateOpen(false);
    setSelectedTournamentId('');
    setScores([]);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    const totalKills = editingResult.scores.reduce((sum, s) => sum + (s.kills || 0), 0);
    const totalPrize = editingResult.scores.reduce((sum, s) => sum + (s.prizeWonINR || 0), 0);
    const mvp =
      editingResult.scores.find((s) => s.isMvp)?.inGameName || editingResult.scores[0]?.inGameName;

    updateMatchResult(editingResult.id, {
      matchDate: editingResult.matchDate,
      matchTime: editingResult.matchTime,
      map: editingResult.map,
      status: editingResult.status,
      scores: editingResult.scores,
      notes: editingResult.notes,
      totalKills,
      totalPrizeDistributedINR: totalPrize,
      mvpPlayerName: mvp,
    });

    setEditingResult(null);
  };

  const exportCSV = (result: TournamentMatchResult) => {
    const headers = [
      'Tournament',
      'MatchDate',
      'Mode',
      'Rank',
      'IGN',
      'PlayerUID',
      'Kills',
      'PlacementPoints',
      'KillPoints',
      'TotalPoints',
      'PrizeWonINR',
      'MVP',
    ];
    const rows = result.scores.map((s) => [
      `"${result.tournamentTitle.replace(/"/g, '""')}"`,
      `"${result.matchDate}"`,
      `"${result.gameMode}"`,
      s.rank,
      `"${s.inGameName.replace(/"/g, '""')}"`,
      `"${s.inGameUid}"`,
      s.kills,
      s.placementPoints,
      s.killPoints,
      s.totalPoints,
      s.prizeWonINR,
      s.isMvp ? 'YES' : 'NO',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `${result.tournamentTitle.replace(/[^a-zA-Z0-9]/g, '_')}_scorecard.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify('Scorecard CSV exported successfully!');
  };

  const exportJSON = (result: TournamentMatchResult) => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const a = document.createElement('a');
    a.href = jsonStr;
    a.download = `${result.tournamentTitle.replace(/[^a-zA-Z0-9]/g, '_')}_scores.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify('Scorecard JSON exported successfully!');
  };

  const copyScoreboardText = (result: TournamentMatchResult) => {
    const sorted = [...result.scores].sort((a, b) => a.rank - b.rank);
    const lines = [
      `🏆 *OFFICIAL MATCH RESULT: ${result.tournamentTitle.toUpperCase()}*`,
      `🎮 Game: ${result.game} | Mode: ${result.gameMode} | Map: ${result.map}`,
      `📅 Date: ${result.matchDate} ${result.matchTime} | Status: ${result.status.toUpperCase()}`,
      `⭐ MVP: ${result.mvpPlayerName || 'N/A'} | Total Kills: ${result.totalKills}`,
      `💰 Prize Distributed: ₹${result.totalPrizeDistributedINR.toLocaleString('en-IN')}`,
      `----------------------------------------`,
      ...sorted.map((s) => {
        const medal = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : `#${s.rank}`;
        return `${medal} ${s.inGameName} | Kills: ${s.kills} | Pts: ${s.totalPoints} | Won: ₹${s.prizeWonINR}${s.isMvp ? ' ⭐MVP' : ''}`;
      }),
      `----------------------------------------`,
      `⚡ Verified by TaskReward Pro Moderator Console (Audited & Confirmed)`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    notify('Scorecard copied to clipboard for Discord/WhatsApp sharing!');
  };

  // Filtered list
  const filteredResults = matchResults.filter((m) => {
    const matchesMode = filterMode === 'All' || m.gameMode === filterMode;
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.tournamentTitle.toLowerCase().includes(q) ||
      m.gameMode.toLowerCase().includes(q) ||
      (m.mvpPlayerName && m.mvpPlayerName.toLowerCase().includes(q));
    return matchesMode && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111728] border border-white/[0.08] p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-0.5">
            <Swords className="w-4 h-4" />
            <span>Match Results &amp; Tournament Scorecards</span>
          </div>
          <p className="text-xs text-zinc-400">
            Audit player kills, placement points, MVPs, and disburse verified ₹ prize escrow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreateOpen(true);
            if (tournaments.length > 0) {
              handleSelectTournament(tournaments[0].id);
            }
          }}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Record Match Scores</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, mode, or MVP player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#111728] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-bold uppercase text-[10px]">Status:</span>
          {['All', 'published', 'verified', 'draft'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Match Results Table */}
      <div className="bg-[#111728] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Tournament Match</th>
                <th className="py-3 px-3">Mode &amp; Map</th>
                <th className="py-3 px-3">Match Date</th>
                <th className="py-3 px-3">MVP Player ⭐</th>
                <th className="py-3 px-3">Total Kills</th>
                <th className="py-3 px-3">Prize Escrow Won</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No match result scorecards recorded yet. Click &quot;+ Record Match Scores&quot; to publish scores!
                  </td>
                </tr>
              ) : (
                filteredResults.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{m.tournamentTitle}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {m.scores.length} Players Ranked • Room: {m.roomId || 'Custom Lobby'}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {m.gameMode}
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{m.map}</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-300">
                      <div>{m.matchDate}</div>
                      <div className="text-[10px] text-zinc-500">{m.matchTime}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-amber-300 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{m.mvpPlayerName || 'TBD'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-zinc-200">
                      {m.totalKills}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      ₹{m.totalPrizeDistributedINR.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          m.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : m.status === 'verified'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingResult(m)}
                          className="p-1.5 bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 rounded-lg"
                          title="View Full Scoreboard"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        </button>

                        <button
                          type="button"
                          onClick={() => copyScoreboardText(m)}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg"
                          title="Copy Scorecard Text for Discord/WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => exportCSV(m)}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg"
                          title="Download CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingResult(m)}
                          className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-lg"
                          title="Edit Scores & Points"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete match result for "${m.tournamentTitle}"?`)) {
                              deleteMatchResult(m.id);
                            }
                          }}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg"
                          title="Delete Scorecard"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: CREATE MATCH RESULTS & SCORES                     */}
      {/* ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-[#0e1424] border border-cyan-500/40 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[92vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Swords className="w-4 h-4 text-cyan-400" />
                  <span>Record Tournament Match Scores &amp; Points</span>
                </h3>
                <span className="text-[11px] text-zinc-400">
                  Enter ranks, kills, and awards. Points automatically compute (1st=12, 2nd=9, 3rd=8, etc. + 1pt/kill).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#111728] p-3.5 rounded-2xl border border-white/[0.08]">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Select Tournament *</label>
                <select
                  required
                  value={selectedTournamentId}
                  onChange={(e) => handleSelectTournament(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090d16] border border-white/[0.1] rounded-xl text-white text-xs"
                >
                  <option value="">-- Choose Tournament --</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.gameMode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Match Date</label>
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Match Time</label>
                <input
                  type="text"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  placeholder="20:00 IST"
                  className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Publish Status</label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-[#090d16] border border-white/[0.1] rounded-xl text-white text-xs"
                >
                  <option value="published">Published (Auto Credit ₹)</option>
                  <option value="verified">Verified (Pending Payout)</option>
                  <option value="draft">Draft Scorecard</option>
                </select>
              </div>
            </div>

            {/* Scores Table */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 px-2">
                <span>Player Standings ({scores.length} Participants)</span>
                <span className="text-emerald-400 font-mono">
                  Total Prize Escrow: ₹{scores.reduce((sum, s) => sum + (s.prizeWonINR || 0), 0)}
                </span>
              </div>

              {scores.length === 0 ? (
                <div className="py-10 text-center text-zinc-500 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                  Select a tournament above to auto-populate registered players, or manually add players.
                </div>
              ) : (
                scores.map((s, idx) => (
                  <div
                    key={s.participantId || idx}
                    className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl grid grid-cols-2 sm:grid-cols-6 items-center gap-2 text-xs"
                  >
                    <div className="col-span-2">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{s.inGameName}</span>
                        {s.isMvp && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">
                            ⭐ MVP
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">UID: {s.inGameUid}</span>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">Rank #</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={s.rank}
                        onChange={(e) => handleScoreChange(idx, 'rank', Number(e.target.value) || 1)}
                        className="w-full px-2 py-1 bg-white/[0.04] border border-white/[0.1] rounded-lg font-mono text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">Kills</label>
                      <input
                        type="number"
                        min={0}
                        value={s.kills}
                        onChange={(e) => handleScoreChange(idx, 'kills', Number(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-white/[0.04] border border-white/[0.1] rounded-lg font-mono text-amber-300 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-cyan-400 block mb-0.5">Total Points</label>
                      <span className="font-mono font-black text-cyan-300 text-sm block">
                        {s.totalPoints} pts
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] text-emerald-400 block mb-0.5">Prize Won (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={s.prizeWonINR}
                        onChange={(e) =>
                          handleScoreChange(idx, 'prizeWonINR', Number(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 bg-white/[0.04] border border-emerald-500/30 rounded-lg font-mono text-emerald-400 text-xs font-bold"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">
                {matchStatus === 'published' && '⚡ Publishing will automatically credit ₹ prizes to player wallets.'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scores.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save &amp; Publish Scorecard
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT PUBLISHED SCORES                             */}
      {/* ======================================================== */}
      {editingResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleEditSave}
            className="bg-[#0e1424] border border-cyan-500/40 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[92vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Edit Match Scorecard: {editingResult.tournamentTitle}</span>
                </h3>
                <span className="text-[11px] text-zinc-400">
                  Update scores, placement adjustments, or correct kill points.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingResult(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#111728] p-3 rounded-2xl border border-white/[0.08]">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Status</label>
                <select
                  value={editingResult.status}
                  onChange={(e) =>
                    setEditingResult({ ...editingResult, status: e.target.value as any })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090d16] border border-white/[0.1] rounded-xl text-white text-xs"
                >
                  <option value="published">Published</option>
                  <option value="verified">Verified</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Match Date</label>
                <input
                  type="date"
                  value={editingResult.matchDate}
                  onChange={(e) =>
                    setEditingResult({ ...editingResult, matchDate: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">MVP Player</label>
                <input
                  type="text"
                  value={editingResult.mvpPlayerName || ''}
                  onChange={(e) =>
                    setEditingResult({ ...editingResult, mvpPlayerName: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-amber-300 text-xs font-bold"
                />
              </div>
            </div>

            {/* Scorecard editing rows */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {editingResult.scores.map((s, idx) => (
                <div
                  key={s.participantId || idx}
                  className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl grid grid-cols-2 sm:grid-cols-6 items-center gap-2"
                >
                  <div className="col-span-2">
                    <span className="font-bold text-white block">{s.inGameName}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">UID: {s.inGameUid}</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Rank #</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={s.rank}
                      onChange={(e) => {
                        const newRank = Number(e.target.value) || 1;
                        const updated = [...editingResult.scores];
                        let placement = 0;
                        if (newRank === 1) placement = 12;
                        else if (newRank === 2) placement = 9;
                        else if (newRank === 3) placement = 8;
                        else placement = Math.max(1, 10 - newRank);
                        updated[idx] = {
                          ...updated[idx],
                          rank: newRank,
                          placementPoints: placement,
                          totalPoints: placement + (updated[idx].kills || 0),
                        };
                        setEditingResult({ ...editingResult, scores: updated });
                      }}
                      className="w-full px-2 py-1 bg-white/[0.04] border border-white/[0.1] rounded-lg font-mono text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Kills</label>
                    <input
                      type="number"
                      min={0}
                      value={s.kills}
                      onChange={(e) => {
                        const newKills = Number(e.target.value) || 0;
                        const updated = [...editingResult.scores];
                        updated[idx] = {
                          ...updated[idx],
                          kills: newKills,
                          killPoints: newKills,
                          totalPoints: (updated[idx].placementPoints || 0) + newKills,
                        };
                        setEditingResult({ ...editingResult, scores: updated });
                      }}
                      className="w-full px-2 py-1 bg-white/[0.04] border border-white/[0.1] rounded-lg font-mono text-amber-300 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-cyan-400 block mb-0.5">Total Points</label>
                    <span className="font-mono font-black text-cyan-300 text-sm">
                      {s.totalPoints} pts
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] text-emerald-400 block mb-0.5">Prize Won (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={s.prizeWonINR}
                      onChange={(e) => {
                        const newPrize = Number(e.target.value) || 0;
                        const updated = [...editingResult.scores];
                        updated[idx] = { ...updated[idx], prizeWonINR: newPrize };
                        setEditingResult({ ...editingResult, scores: updated });
                      }}
                      className="w-full px-2 py-1 bg-white/[0.04] border border-emerald-500/30 rounded-lg font-mono text-emerald-400 text-xs font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingResult(null)}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Update Scorecard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW FULL DETAILED SCORECARD                      */}
      {/* ======================================================== */}
      {viewingResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1424] border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Official Scoreboard: {viewingResult.tournamentTitle}</span>
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {viewingResult.gameMode} • Map: {viewingResult.map} • {viewingResult.matchDate}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingResult(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Summary Pill Banner */}
            <div className="grid grid-cols-3 gap-3 text-center bg-white/[0.02] border border-white/[0.06] p-3 rounded-2xl">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">MVP Player</span>
                <span className="text-sm font-bold text-amber-300 font-mono mt-0.5 block">
                  ⭐ {viewingResult.mvpPlayerName || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Kills</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                  {viewingResult.totalKills}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Prize Distributed</span>
                <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                  ₹{viewingResult.totalPrizeDistributedINR.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Player Rankings List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {viewingResult.scores.map((s) => (
                <div
                  key={s.inGameUid}
                  className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black font-mono text-xs ${
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
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{s.inGameName}</span>
                        {s.isMvp && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">
                            MVP
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>UID: {s.inGameUid}</span>
                        <span>•</span>
                        <span>Kills: {s.kills}</span>
                        <span>•</span>
                        <span>Points: {s.totalPoints}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    ₹{s.prizeWonINR}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-mono">
                Verified: {viewingResult.verifiedBy}
              </span>
              <button
                type="button"
                onClick={() => setViewingResult(null)}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
