import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TournamentSupportTicket,
  TicketCategory,
  TicketPriority,
} from '../../types';
import {
  LifeBuoy,
  X,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Shield,
  Coins,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface PlayerSupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerSupportTicketModal: React.FC<PlayerSupportTicketModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentWorker,
    tournaments,
    supportTickets,
    createSupportTicket,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'my_tickets' | 'new_ticket'>('my_tickets');

  // New Ticket Form State
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [inGameName, setInGameName] = useState<string>('');
  const [inGameUid, setInGameUid] = useState<string>('');
  const [category, setCategory] = useState<TicketCategory>('score_dispute');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<TournamentSupportTicket | null>(null);

  if (!isOpen) return null;

  // Filter player's own tickets (matched by workerId or uniqueUserId)
  const myTickets = supportTickets.filter(
    (t) =>
      t.workerId === currentWorker.id ||
      t.workerUid === currentWorker.uniqueUserId ||
      t.workerUid === currentWorker.eid
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const matchedTournament = tournaments.find((t) => t.id === selectedTournamentId);

    createSupportTicket({
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      workerUid: currentWorker.uniqueUserId || currentWorker.eid,
      inGameName: inGameName.trim() || currentWorker.name,
      inGameUid: inGameUid.trim() || currentWorker.eid,
      tournamentId: selectedTournamentId || undefined,
      tournamentTitle: matchedTournament ? matchedTournament.title : 'General Tournament Query',
      category,
      priority,
      subject: subject.trim(),
      description: description.trim(),
    });

    // Reset Form & Switch to tickets tab
    setSubject('');
    setDescription('');
    setActiveTab('my_tickets');
  };

  const getCategoryBadge = (cat: TicketCategory) => {
    switch (cat) {
      case 'score_dispute':
        return { label: 'Score Dispute', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'room_issue':
        return { label: 'Room ID / Pass Issue', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
      case 'prize_payout':
        return { label: 'Prize Payout', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'cheating_report':
        return { label: 'Cheating / Hacker', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
      case 'rule_clarification':
        return { label: 'Rule Clarification', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'Other', color: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'in_progress':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse';
      case 'resolved':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'closed':
        return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
      default:
        return 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b101c] border border-cyan-500/40 w-full max-w-2xl rounded-3xl shadow-2xl shadow-cyan-950/60 flex flex-col max-h-[90vh] overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-gradient-to-r from-cyan-950/40 via-[#10182c] to-[#0b101c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Player Tournament Support Desk
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  24/7 Moderator Helpdesk
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Dispute match scores, report room issues, track prize payouts, and contact tournament officials.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-white/[0.06] flex items-center justify-between gap-3 bg-[#0e1424]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('my_tickets');
                setSelectedTicketDetail(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'my_tickets' && !selectedTicketDetail
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>My Support Tickets ({myTickets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('new_ticket');
                setSelectedTicketDetail(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'new_ticket'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Raise New Ticket</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: MY TICKETS LIST */}
          {activeTab === 'my_tickets' && !selectedTicketDetail && (
            <div className="space-y-3">
              {myTickets.length === 0 ? (
                <div className="bg-[#111728]/60 border border-white/[0.08] rounded-2xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-zinc-500 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Tickets Found</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    You have not submitted any tournament support tickets. If you encounter score disputes, room issues, or payout queries, click &quot;+ Raise New Ticket&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new_ticket')}
                    className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl"
                  >
                    + Open Support Ticket
                  </button>
                </div>
              ) : (
                myTickets.map((t) => {
                  const catBadge = getCategoryBadge(t.category);
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketDetail(t)}
                      className="p-4 bg-[#111728] border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl space-y-2 cursor-pointer transition-all hover:bg-[#131b2e] group"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold text-xs">
                            {t.ticketNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catBadge.color}`}>
                            {catBadge.label}
                          </span>
                          {t.priority === 'urgent' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Urgent
                            </span>
                          )}
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(t.status)}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {t.subject}
                      </h4>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>

                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
                        <div className="flex items-center gap-2">
                          <span>{t.tournamentTitle || 'Tournament'}</span>
                          <span>•</span>
                          <span>{t.createdAt}</span>
                        </div>

                        {t.moderatorReply && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Moderator Replied</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* DETAIL VIEW OF A SELECTED TICKET */}
          {selectedTicketDetail && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedTicketDetail(null)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                ← Back to All Tickets
              </button>

              <div className="bg-[#111728] border border-white/[0.08] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold text-sm">
                        {selectedTicketDetail.ticketNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(selectedTicketDetail.category).color}`}>
                        {getCategoryBadge(selectedTicketDetail.category).label}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {selectedTicketDetail.subject}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(selectedTicketDetail.status)}`}>
                    {selectedTicketDetail.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 text-zinc-300 text-xs leading-relaxed bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    Your Submitted Description:
                  </span>
                  <p>{selectedTicketDetail.description}</p>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                    <span>Player IGN: {selectedTicketDetail.inGameName}</span>
                    <span>•</span>
                    <span>UID: {selectedTicketDetail.inGameUid}</span>
                    <span>•</span>
                    <span>Submitted: {selectedTicketDetail.createdAt}</span>
                  </div>
                </div>

                {/* Moderator Official Response */}
                {selectedTicketDetail.moderatorReply ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2 text-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Official Moderator Resolution</span>
                      </span>
                      {selectedTicketDetail.resolvedAt && (
                        <span className="text-[10px] font-mono text-zinc-400">
                          Resolved: {selectedTicketDetail.resolvedAt}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-100">
                      {selectedTicketDetail.moderatorReply}
                    </p>

                    {selectedTicketDetail.compensationINR !== undefined &&
                      selectedTicketDetail.compensationINR > 0 && (
                        <div className="pt-2 border-t border-emerald-500/20 flex items-center gap-2 text-xs font-bold text-emerald-300 font-mono">
                          <Coins className="w-4 h-4 text-emerald-400" />
                          <span>Goodwill Compensation Credited: ₹{selectedTicketDetail.compensationINR}</span>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3.5 flex items-center gap-2.5 text-blue-300">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>This ticket is under active review by tournament moderators. Official resolution will appear here once audited.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RAISE NEW TICKET FORM */}
          {activeTab === 'new_ticket' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-[#111728] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Related Tournament
                  </label>
                  <select
                    value={selectedTournamentId}
                    onChange={(e) => setSelectedTournamentId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-white/[0.1] rounded-xl text-xs text-white"
                  >
                    <option value="">General Tournament Support (Not specific)</option>
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.gameMode}) - {t.scheduleDate}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      In-Game Player Name (IGN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={inGameName}
                      onChange={(e) => setInGameName(e.target.value)}
                      placeholder="e.g. Arati_SniperX"
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      In-Game UID *
                    </label>
                    <input
                      type="text"
                      required
                      value={inGameUid}
                      onChange={(e) => setInGameUid(e.target.value)}
                      placeholder="e.g. FF-7829104"
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl font-mono text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Issue Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TicketCategory)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-white/[0.1] rounded-xl text-xs text-white"
                    >
                      <option value="score_dispute">Score / Kill Count Dispute</option>
                      <option value="room_issue">Room ID &amp; Password Issues</option>
                      <option value="prize_payout">Prize Money Payout Query</option>
                      <option value="cheating_report">Report Cheater / Unfair Play</option>
                      <option value="rule_clarification">Rules &amp; Eligibility Clarification</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Urgency / Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TicketPriority)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-white/[0.1] rounded-xl text-xs text-white"
                    >
                      <option value="low">Low (General Query)</option>
                      <option value="medium">Medium (Standard Issue)</option>
                      <option value="high">High (Match In Progress)</option>
                      <option value="urgent">Urgent (Payout / False Ban)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Subject / Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Missing 2 kills in Match #1 interim scorecard"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide exact details, round number, location, opponent names or timestamps to assist the moderator review..."
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('my_tickets')}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket to Moderators</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
