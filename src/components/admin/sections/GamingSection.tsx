import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { GamingOffer } from '../../../types';
import { Gamepad2, Trophy, Flame, Sparkles, Plus, Check } from 'lucide-react';

export const GamingSection: React.FC = () => {
  const { gamingOffers } = useApp();
  const [offers, setOffers] = useState(gamingOffers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newReward, setNewReward] = useState(35);
  const [newType, setNewType] = useState<'Daily Spin' | 'Trivia Quiz' | 'App Quest'>('App Quest');

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newOffer = {
      id: `game-${Date.now()}`,
      title: newTitle,
      description: newDescription || 'Complete interactive challenge for instant INR rewards.',
      gameType: newType,
      rewardINR: Number(newReward),
      cooldownHours: 24,
      badge: 'New Bonus',
      active: true,
    };
    setOffers([newOffer, ...offers]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const toggleStatus = (id: string) => {
    setOffers(offers.map((o: GamingOffer) => (o.id === id ? { ...o, active: !o.active } : o)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            Gamification Engine
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Gaming &amp; Offerwall Modules</h1>
          <p className="text-sm text-zinc-500">
            Interactive daily retention micro-tasks, lucky wheel spins, and knowledge quests rewarding INR.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Game Challenge</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Active Game Modules</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 mt-1">{offers.length}</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Daily Engaged Workers</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 mt-1">1,420+</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Total INR Paid Via Games</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹48,250</div>
        </div>
      </div>

      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer: GamingOffer) => (
          <div
            key={offer.id}
            className={`bg-white rounded-2xl border p-5 space-y-3 shadow-2xs transition-all ${
              offer.active ? 'border-zinc-200' : 'border-zinc-200 opacity-60 bg-zinc-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {offer.gameType}
              </span>
              <span className="font-extrabold text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                ₹{offer.rewardINR} Max
              </span>
            </div>

            <div>
              <h3 className="font-bold text-zinc-900 text-sm">{offer.title}</h3>
              <p className="text-xs text-zinc-500 mt-1">{offer.description}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100">
              <span>Cooldown: {offer.cooldownHours} hours</span>
              <span className="font-medium text-zinc-600">Badge: {offer.badge}</span>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  offer.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {offer.active ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => toggleStatus(offer.id)}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 underline"
              >
                {offer.active ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Game Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleAddGame}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Add Gaming Module</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Challenge Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Speed Math Sprint"
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Game Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                >
                  <option value="Daily Spin">Daily Spin</option>
                  <option value="Trivia Quiz">Trivia Quiz</option>
                  <option value="App Quest">App Quest</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Max Reward (₹)</label>
                <input
                  type="number"
                  min="5"
                  required
                  value={newReward}
                  onChange={(e) => setNewReward(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Instructions / Description</label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Rules and guidelines for claiming the game reward..."
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
              >
                Publish Challenge
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
