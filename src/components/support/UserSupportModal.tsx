import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CustomerSupportQuery,
  SupportQueryCategory,
  SupportQueryPriority,
} from '../../types';
import {
  Headphones,
  LifeBuoy,
  X,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Shield,
  Coins,
  ArrowRight,
  User,
} from 'lucide-react';

export const UserSupportModal: React.FC = () => {
  const {
    userSupportModalOpen,
    setUserSupportModalOpen,
    currentWorker,
    customerQueries,
    createCustomerQuery,
    addCustomerQueryMessage,
    notify,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'my_tickets' | 'new_ticket'>('my_tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // New ticket state
  const [category, setCategory] = useState<SupportQueryCategory>('earnings_withdrawals');
  const [priority, setPriority] = useState<SupportQueryPriority>('urgent');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  // Reply message on selected ticket
  const [userReplyText, setUserReplyText] = useState('');

  if (!userSupportModalOpen) return null;

  // Filter player's own queries (matched by workerId or uniqueUserId or eid)
  const myQueries = customerQueries.filter(
    (q) =>
      q.userId === currentWorker.id ||
      q.userId === currentWorker.uniqueUserId ||
      q.userEid === currentWorker.eid
  );

  const selectedQuery = customerQueries.find((q) => q.id === selectedTicketId) || null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      notify('Please enter both subject and description.');
      return;
    }

    const created = createCustomerQuery({
      userId: currentWorker.id,
      userEid: currentWorker.eid || 'EID-1001',
      userName: currentWorker.name,
      userEmail: currentWorker.email,
      userPhone: currentWorker.phone,
      category,
      priority,
      subject: subject.trim(),
      description: description.trim(),
      slaDeadlineMinutes: 1440,
    });

    setSubject('');
    setDescription('');
    setSelectedTicketId(created.id);
    setActiveTab('my_tickets');
  };

  const handleSendUserReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery || !userReplyText.trim()) return;
    addCustomerQueryMessage(
      selectedQuery.id,
      userReplyText.trim(),
      'user',
      currentWorker.name
    );
    setUserReplyText('');
  };

  const getPriorityBadge = (prio: SupportQueryPriority) => {
    switch (prio) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            High
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Standard
          </span>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#0f1523] border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#121929] border-b border-white/[0.08] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  24/7 Customer Support Desk
                </h3>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live 24/7 SLA
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Guaranteed resolution within 24 hours (Global 24/7 SLA for all tickets)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setUserSupportModalOpen(false);
              setSelectedTicketId(null);
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-[#0b101c] border-b border-white/[0.06] px-6 pt-3 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('my_tickets');
              setSelectedTicketId(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'my_tickets' && !selectedTicketId
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            My Queries ({myQueries.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('new_ticket');
              setSelectedTicketId(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'new_ticket'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Open New Query</span>
          </button>
          {selectedQuery && (
            <button
              type="button"
              className="pb-3 px-3 text-xs font-bold border-b-2 border-emerald-400 text-emerald-300 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Query {selectedQuery.queryNumber}</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* View 1: Detailed Thread for Selected Query */}
          {selectedQuery ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedTicketId(null)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold"
              >
                ← Back to all queries
              </button>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {selectedQuery.queryNumber}
                    </span>
                    {getPriorityBadge(selectedQuery.priority)}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    SLA: 24h Guaranteed (1440 mins)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{selectedQuery.subject}</h4>
                <p className="text-xs text-zinc-400">{selectedQuery.description}</p>
                {selectedQuery.compensationINR && selectedQuery.compensationINR > 0 && (
                  <div className="mt-2 p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-medium">
                    <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Goodwill credit of ₹{selectedQuery.compensationINR} added to your wallet!</span>
                  </div>
                )}
              </div>

              {/* Message List */}
              <div className="space-y-3 pt-2">
                {selectedQuery.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isBot = msg.sender === 'system_bot';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isBot ? 'items-center' : isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      {isBot ? (
                        <div className="my-1 px-4 py-2 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-center text-xs text-cyan-200">
                          <span className="font-bold text-[10px] text-cyan-400 font-mono block">
                            24/7 AI Desk
                          </span>
                          {msg.message}
                        </div>
                      ) : (
                        <div
                          className={`max-w-md rounded-2xl p-3.5 text-xs sm:text-sm ${
                            isUser
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs'
                              : 'bg-[#151c2d] border border-white/[0.08] text-zinc-200 rounded-tl-xs'
                          }`}
                        >
                          <div className="text-[10px] font-mono opacity-80 mb-1">
                            {msg.senderName} • {msg.timestamp}
                          </div>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* User Reply Input */}
              <form onSubmit={handleSendUserReply} className="flex gap-2 pt-3 border-t border-white/[0.08]">
                <input
                  type="text"
                  value={userReplyText}
                  onChange={(e) => setUserReplyText(e.target.value)}
                  placeholder="Type a follow-up message..."
                  className="flex-1 px-4 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!userReplyText.trim()}
                  className="px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : activeTab === 'my_tickets' ? (
            /* View 2: List of My Queries */
            <div className="space-y-3">
              {myQueries.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-zinc-500 flex items-center justify-center mx-auto">
                    <LifeBuoy className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Support Queries Yet</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Have an issue with payouts, tasks, or tournament scoring? Our 24/7 support team is here to help.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new_ticket')}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Open a Query
                  </button>
                </div>
              ) : (
                myQueries.map((query) => (
                  <div
                    key={query.id}
                    onClick={() => setSelectedTicketId(query.id)}
                    className="p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-cyan-500/30 rounded-2xl cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{query.queryNumber}</span>
                        {getPriorityBadge(query.priority)}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 group-hover:text-cyan-300 flex items-center gap-1">
                        View Chat →
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {query.subject}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-1">{query.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 font-mono">
                      <span>{query.createdAt}</span>
                      <span className="capitalize text-cyan-400 font-bold">{query.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* View 3: Open New Query Form */
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Issue Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-white focus:outline-hidden focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="earnings_withdrawals">Earnings &amp; UPI Withdrawals</option>
                    <option value="tasks_submissions">Tasks &amp; Proof Verification</option>
                    <option value="esports_tournaments">Esports Tournaments &amp; Room</option>
                    <option value="deposits_payments">Deposits &amp; Entry Pass Payment</option>
                    <option value="account_verification">Account Identity &amp; Google Sync</option>
                    <option value="technical_bug">Technical Bug or Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Priority / Urgency:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-white focus:outline-hidden focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="urgent">Urgent (24h Guaranteed SLA)</option>
                    <option value="high">High (24h Guaranteed SLA)</option>
                    <option value="medium">Medium (24h Guaranteed SLA)</option>
                    <option value="low">Standard (24h Guaranteed SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Subject Title:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. UPI withdrawal pending for ₹700"
                  className="w-full px-3 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Detailed Description:</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe your query in detail, including any relevant UTRs, transaction times, or task IDs..."
                  className="w-full px-3 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center gap-2.5 text-cyan-300 text-[11px]">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Our 24/7 Operations Desk monitors queries round the clock with live SLA tracking.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-600/30 cursor-pointer active:scale-98"
              >
                Submit 24/7 Support Query
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
