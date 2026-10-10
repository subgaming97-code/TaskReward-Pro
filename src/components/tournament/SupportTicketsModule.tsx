import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TournamentSupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../types';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Shield,
  Coins,
  Send,
  User,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
} from 'lucide-react';

export const SupportTicketsModule: React.FC = () => {
  const {
    supportTickets,
    updateSupportTicket,
    resolveSupportTicket,
    notify,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');

  // Selected Ticket for Review & Resolution
  const [resolvingTicket, setResolvingTicket] = useState<TournamentSupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [compensationAmount, setCompensationAmount] = useState<number | ''>('');
  const [newStatus, setNewStatus] = useState<TicketStatus>('resolved');

  const openResolutionModal = (ticket: TournamentSupportTicket) => {
    setResolvingTicket(ticket);
    setReplyText(ticket.moderatorReply || '');
    setInternalNotes(ticket.moderatorNotes || '');
    setCompensationAmount(ticket.compensationINR || '');
    setNewStatus(ticket.status === 'open' ? 'resolved' : ticket.status);
  };

  const handleResolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    if (newStatus === 'resolved') {
      resolveSupportTicket(
        resolvingTicket.id,
        replyText.trim() || 'Reviewed and resolved by tournament moderator.',
        Number(compensationAmount) || 0
      );
    } else {
      updateSupportTicket(resolvingTicket.id, {
        status: newStatus,
        moderatorReply: replyText.trim() || undefined,
        moderatorNotes: internalNotes.trim() || undefined,
        compensationINR: Number(compensationAmount) || undefined,
      });
      notify(`Ticket ${resolvingTicket.ticketNumber} updated to ${newStatus}.`);
    }

    setResolvingTicket(null);
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
        return { label: 'Other Inquiry', color: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' };
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'in_progress':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse';
      case 'resolved':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'closed':
        return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
    }
  };

  // Metrics
  const openCount = supportTickets.filter((t) => t.status === 'open').length;
  const inProgressCount = supportTickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = supportTickets.filter((t) => t.status === 'resolved').length;
  const totalComp = supportTickets.reduce((sum, t) => sum + (t.compensationINR || 0), 0);

  // Filtered Tickets
  const filteredTickets = supportTickets.filter((t) => {
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.ticketNumber.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.inGameName.toLowerCase().includes(q) ||
      t.workerName.toLowerCase().includes(q) ||
      (t.tournamentTitle && t.tournamentTitle.toLowerCase().includes(q));
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111728] border border-white/[0.08] p-3.5 rounded-2xl">
          <span className="text-[10px] text-zinc-400 uppercase font-bold block">Open Tickets</span>
          <span className="text-2xl font-black text-blue-400 font-mono mt-0.5 block">{openCount}</span>
        </div>
        <div className="bg-[#111728] border border-white/[0.08] p-3.5 rounded-2xl">
          <span className="text-[10px] text-zinc-400 uppercase font-bold block">Under Review</span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">{inProgressCount}</span>
        </div>
        <div className="bg-[#111728] border border-white/[0.08] p-3.5 rounded-2xl">
          <span className="text-[10px] text-zinc-400 uppercase font-bold block">Resolved Tickets</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">{resolvedCount}</span>
        </div>
        <div className="bg-[#111728] border border-white/[0.08] p-3.5 rounded-2xl">
          <span className="text-[10px] text-zinc-400 uppercase font-bold block">Compensations Credited</span>
          <span className="text-2xl font-black text-emerald-300 font-mono mt-0.5 block">₹{totalComp}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ticket #, subject, IGN, or player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#111728] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-zinc-400 font-bold uppercase text-[10px]">Status:</span>
          {['All', 'open', 'in_progress', 'resolved', 'closed'].map((st) => (
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
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-[#111728] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-3">Player / Contributor</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Subject &amp; Tournament</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No support tickets match the current filter.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const cat = getCategoryBadge(t.category);
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                        {t.ticketNumber}
                        <div className="text-[10px] text-zinc-500 font-normal">{t.createdAt}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{t.inGameName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {t.workerName} ({t.workerUid})
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-white text-xs truncate">{t.subject}</div>
                        <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {t.tournamentTitle || 'General Query'}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.priority === 'urgent'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : t.priority === 'high'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-white/[0.04] text-zinc-400'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(t.status)}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openResolutionModal(t)}
                          className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Review &amp; Reply
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: MODERATOR REVIEW & RESOLUTION DIALOG              */}
      {/* ======================================================== */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 text-xs">
          <form
            onSubmit={handleResolutionSubmit}
            className="bg-[#0e1424] border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold text-sm">
                    {resolvingTicket.ticketNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(resolvingTicket.category).color}`}>
                    {getCategoryBadge(resolvingTicket.category).label}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {resolvingTicket.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResolvingTicket(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Ticket Info & Player Query */}
            <div className="bg-[#111728] p-4 rounded-2xl border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-white/[0.06] pb-2 font-mono">
                <div>
                  Player: <strong className="text-white">{resolvingTicket.inGameName}</strong> (UID: {resolvingTicket.inGameUid})
                </div>
                <div>User: {resolvingTicket.workerName}</div>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed pt-1">
                {resolvingTicket.description}
              </p>
            </div>

            {/* Moderator Reply & Compensation Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Official Moderator Resolution Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Explain resolution, score audit outcome, or lobby confirmation to the player..."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Ticket Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-white/[0.1] rounded-xl text-white text-xs"
                  >
                    <option value="resolved">Resolved (Close Issue)</option>
                    <option value="in_progress">Under Active Review</option>
                    <option value="open">Re-open Ticket</option>
                    <option value="closed">Closed (No Action Required)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-emerald-400 font-semibold mb-1">
                    Goodwill Compensation (₹ INR, Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={compensationAmount}
                    onChange={(e) => setCompensationAmount(Number(e.target.value) || '')}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-emerald-500/30 rounded-xl font-mono text-emerald-400 font-bold text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Internal Moderator Notes</label>
                <input
                  type="text"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Private audit notes for moderator team..."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-zinc-300"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                {Number(compensationAmount) > 0 &&
                  `⚡ Will immediately credit ₹${compensationAmount} to ${resolvingTicket.workerName}'s wallet.`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Submit Resolution
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
