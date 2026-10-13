import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Medal,
  Crown,
  Search,
  Filter,
  Flame,
  Star,
  Coins,
  ShieldAlert,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';

interface PublicLeaderboardViewProps {
  isModerator?: boolean;
}

export const PublicLeaderboardView: React.FC<PublicLeaderboardViewProps> = ({
  isModerator = false,
}) => {
  const { tournamentParticipants, matchResults, notify } = useApp();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [pointAdjustments, setPointAdjustments] = useState<Record<string, number>>({});

  // Compute aggregated player stats from both participants & matchResults
  const playerMap: Record<
    string,
    {
      inGameName: string;
      inGameUid: string;
      workerName: string;
      workerUid: string;
      matchesPlayed: number;
      booyahWins: number;
      totalKills: number;
      totalPoints: number;
      totalPrizeWonINR: number;
      preferredMode: string;
      mvpCount: number;
    }
  > = {};

  // First aggregate from matchResults scores
  matchResults.forEach((m) => {
    m.scores.forEach((s) => {
      const key = s.inGameUid || s.inGameName;
      if (!playerMap[key]) {
        playerMap[key] = {
          inGameName: s.inGameName,
          inGameUid: s.inGameUid,
          workerName: s.workerName,
          workerUid: s.workerId,
          matchesPlayed: 0,
          booyahWins: 0,
          totalKills: 0,
          totalPoints: 0,
          totalPrizeWonINR: 0,
          preferredMode: m.gameMode,
          mvpCount: 0,
        };
      }
      playerMap[key].matchesPlayed += 1;
      if (s.rank === 1) playerMap[key].booyahWins += 1;
      playerMap[key].totalKills += s.kills || 0;
      playerMap[key].totalPoints += s.totalPoints || 0;
      playerMap[key].totalPrizeWonINR += s.prizeWonINR || 0;
      if (s.isMvp) playerMap[key].mvpCount += 1;
    });
  });

  // Also include any tournament participants that may not have completed matches yet
  tournamentParticipants.forEach((p) => {
    const key = p.inGameUid || p.inGameName;
    if (!playerMap[key]) {
      playerMap[key] = {
        inGameName: p.inGameName,
        inGameUid: p.inGameUid,
        workerName: p.workerName,
        workerUid: p.workerUid,
        matchesPlayed: 1,
        booyahWins: p.rank === 1 ? 1 : 0,
        totalKills: p.kills || 0,
        totalPoints: p.points || 0,
        totalPrizeWonINR: p.prizeWonINR || 0,
        preferredMode: 'Solo',
        mvpCount: 0,
      };
    }
  });

  // Apply moderator live adjustments
  const list = Object.values(playerMap).map((item) => {
    const adj = pointAdjustments[item.inGameUid] || 0;
    return {
      ...item,
      totalPoints: item.totalPoints + adj,
    };
  });

  // Filter and sort
  const filteredList = list
    .filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.inGameName.toLowerCase().includes(q) ||
        item.inGameUid.toLowerCase().includes(q) ||
        item.workerName.toLowerCase().includes(q);

      if (filterCategory === 'All') return matchesSearch;
      if (filterCategory === 'Solo') return matchesSearch && item.preferredMode === 'Solo';
      if (filterCategory === 'Squad') return matchesSearch && item.preferredMode === 'Squad';
      if (filterCategory === 'Lone Wolf') return matchesSearch && item.preferredMode === 'Lone Wolf';
      if (filterCategory === 'Top Killers') return matchesSearch && item.totalKills > 0;
      if (filterCategory === 'Prize Earners') return matchesSearch && item.totalPrizeWonINR > 0;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (filterCategory === 'Top Killers') return b.totalKills - a.totalKills;
      if (filterCategory === 'Prize Earners') return b.totalPrizeWonINR - a.totalPrizeWonINR;
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.totalPrizeWonINR - a.totalPrizeWonINR;
    });

  const handleAdjustPoints = (uid: string, delta: number, name: string) => {
    setPointAdjustments((prev) => ({
      ...prev,
      [uid]: (prev[uid] || 0) + delta,
    }));
    notify(
      delta > 0
        ? `Awarded +${delta} bonus points to ${name}.`
        : `Deducted ${Math.abs(delta)} penalty points from ${name}.`
    );
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header Banner */}
      <div className="bg-[#111728] border border-white/[0.08] p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Task and Esports Arena Official Public Leaderboard</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            Hall of Fame &amp; Player Standings
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time ranking of official esports custom matches, Booyahs, frag leaderboards, and prize escrow earnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0b101c] border border-white/[0.06] px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Ranked Players</span>
            <span className="text-lg font-bold text-cyan-400 font-mono mt-0.5 block">{list.length}</span>
          </div>
          <div className="bg-[#0b101c] border border-white/[0.06] px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Prize Escrow Distributed</span>
            <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
              ₹{list.reduce((sum, p) => sum + p.totalPrizeWonINR, 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by player IGN or UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#111728] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-zinc-400 font-bold uppercase text-[10px] mr-1">Category:</span>
          {['All', 'Top Killers', 'Prize Earners', 'Solo', 'Squad', 'Lone Wolf'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#111728] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-3">Player (IGN)</th>
                <th className="py-3 px-3">In-Game UID</th>
                <th className="py-3 px-3">Matches</th>
                <th className="py-3 px-3">Booyahs 🥇</th>
                <th className="py-3 px-3">Total Kills</th>
                <th className="py-3 px-3">Points</th>
                <th className="py-3 px-3">Cash Escrow Won</th>
                {isModerator && <th className="py-3 px-4 text-right">Points Audit</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={isModerator ? 9 : 8} className="py-12 text-center text-zinc-500">
                    No players found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((p, idx) => (
                  <tr key={p.inGameUid || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black font-mono text-xs ${
                          idx === 0
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                            : idx === 1
                            ? 'bg-zinc-300/20 text-zinc-200 border border-zinc-400/40'
                            : idx === 2
                            ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                            : 'bg-white/[0.04] text-zinc-400'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{p.inGameName}</span>
                        {p.mvpCount > 0 && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">
                            ⭐ {p.mvpCount}x MVP
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-normal">
                        User: {p.workerName}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-cyan-300">
                      {p.inGameUid}
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-300">{p.matchesPlayed}</td>

                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {p.booyahWins}
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-200 font-bold">
                      {p.totalKills}
                    </td>

                    <td className="py-3 px-3 font-mono font-black text-cyan-300 text-sm">
                      {p.totalPoints}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      ₹{p.totalPrizeWonINR.toLocaleString('en-IN')}
                    </td>

                    {isModerator && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustPoints(p.inGameUid, 2, p.inGameName)}
                            className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30"
                            title="Award +2 Fair Play Bonus Points"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustPoints(p.inGameUid, -2, p.inGameName)}
                            className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded border border-rose-500/30"
                            title="Apply -2 Penalty Points"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
