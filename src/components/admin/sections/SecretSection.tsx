import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { SecretVoucher, Task } from '../../../types';
import { Key, Plus, ShieldCheck, Ticket, Check, Copy } from 'lucide-react';

export const SecretSection: React.FC = () => {
  const { secretVouchers, createVoucher, toggleVoucherStatus, tasks } = useApp();

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [rewardINR, setRewardINR] = useState(50);
  const [maxRedemptions, setMaxRedemptions] = useState(250);
  const [expiresAt, setExpiresAt] = useState('2026-06-30');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    createVoucher({
      code,
      description: description || 'Exclusive secret promo reward voucher.',
      rewardINR: Number(rewardINR),
      maxRedemptions: Number(maxRedemptions),
      expiresAt,
      active: true,
    });
    setCode('');
    setDescription('');
  };

  const handleCopy = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Find secret tasks with verification keys
  const secretTasks = tasks.filter((t: Task) => t.secretKey);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
          Confidential Operations
        </span>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Secret Vouchers &amp; Keys</h1>
        <p className="text-sm text-zinc-500">
          Manage promotional secret vouchers, survey completion keys, and anti-fraud verification tokens.
        </p>
      </div>

      {/* Grid: Create Voucher + Task Secret Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Voucher Form */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900">Generate Secret Voucher</h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Voucher Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. FLASH75"
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg uppercase font-mono font-bold tracking-wider"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Reward (INR ₹) *</label>
              <input
                type="number"
                min="5"
                required
                value={rewardINR}
                onChange={(e) => setRewardINR(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-emerald-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Max Uses</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={maxRedemptions}
                  onChange={(e) => setMaxRedemptions(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional purpose note..."
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Secret Voucher</span>
            </button>
          </form>
        </div>

        {/* Existing Vouchers List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900">Active Secret Vouchers ({secretVouchers.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secretVouchers.map((voucher: SecretVoucher) => (
              <div
                key={voucher.id}
                className={`bg-white rounded-xl border p-4 space-y-2.5 shadow-2xs transition-all ${
                  voucher.active ? 'border-zinc-200' : 'border-zinc-200 opacity-60 bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-sm text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 tracking-wider">
                      {voucher.code}
                    </span>
                    <button
                      onClick={() => handleCopy(voucher.code)}
                      title="Copy code"
                      className="text-zinc-400 hover:text-zinc-700 p-1"
                    >
                      {copiedCode === voucher.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <span className="font-bold text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    +₹{voucher.rewardINR}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 line-clamp-1">{voucher.description}</p>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-100">
                  <span>
                    Redeemed: <strong>{voucher.redeemedCount}</strong> / {voucher.maxRedemptions}
                  </span>
                  <span>Expires: {voucher.expiresAt}</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      voucher.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {voucher.active ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => toggleVoucherStatus(voucher.id)}
                    className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 underline"
                  >
                    {voucher.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Task Verification Keys */}
          <div className="mt-6 bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Task Secret Verification Passkeys
              </h3>
            </div>
            <p className="text-xs text-zinc-500">
              Tasks that require entering an end-of-survey or secret token to unlock submission verification.
            </p>

            <div className="space-y-2">
              {secretTasks.length === 0 ? (
                <div className="text-xs text-zinc-400 py-3 text-center">No tasks currently require secret passkeys.</div>
              ) : (
                secretTasks.map((t: Task) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-zinc-900">{t.title}</span>
                      <span className="text-[11px] text-zinc-400 block">Category: {t.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-[11px]">Passkey:</span>
                      <span className="font-mono font-bold bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                        {t.secretKey}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
