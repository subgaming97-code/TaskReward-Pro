import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Settings, Save, CheckCircle, Shield, Bell, DollarSign, Megaphone } from 'lucide-react';

export const SetupSection: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [minWithdrawalINR, setMinWithdrawalINR] = useState(settings.minWithdrawalINR);
  const [partnerCommissionRatePercent, setPartnerCommissionRatePercent] = useState(
    settings.partnerCommissionRatePercent
  );
  const [autoApproveSurveys, setAutoApproveSurveys] = useState(settings.autoApproveSurveys);
  const [emailNotifications, setEmailNotifications] = useState(settings.emailNotifications);
  const [bannerBrandingText, setBannerBrandingText] = useState(settings.bannerBrandingText);
  const [showBanner, setShowBanner] = useState(settings.showBanner);
  const [emergencyLock, setEmergencyLock] = useState(settings.emergencyLock);

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      minWithdrawalINR: Number(minWithdrawalINR),
      partnerCommissionRatePercent: Number(partnerCommissionRatePercent),
      autoApproveSurveys,
      emailNotifications,
      bannerBrandingText,
      showBanner,
      emergencyLock,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
          Global Configurations
        </span>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Platform Setup &amp; Rules</h1>
        <p className="text-sm text-zinc-500">
          Configure monetary withdrawal rules, agency partner commission splits, notification switches, and banner announcements.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Financial Policy */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-zinc-900">Financial &amp; Payout Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">
                Minimum Worker Withdrawal Limit (INR ₹)
              </label>
              <input
                type="number"
                min="10"
                value={minWithdrawalINR}
                onChange={(e) => setMinWithdrawalINR(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-zinc-900"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Workers must reach this threshold before requesting payouts.
              </span>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">
                Default Partner Commission Rate (%)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={partnerCommissionRatePercent}
                onChange={(e) => setPartnerCommissionRatePercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-zinc-900"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Default percentage credited to partners upon task review.
              </span>
            </div>
          </div>
        </div>

        {/* Branding & Top Announcement */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Megaphone className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-zinc-900">Top Promotional Banner Branding</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-900 block">Show Header Promotional Banner</span>
                <span className="text-zinc-500 text-[11px]">Display active campaign notice across all views.</span>
              </div>
              <input
                type="checkbox"
                checked={showBanner}
                onChange={(e) => setShowBanner(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Banner Announcement Text</label>
              <input
                type="text"
                value={bannerBrandingText}
                onChange={(e) => setBannerBrandingText(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Automation & Security Policy */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Shield className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900">Automation &amp; Security Controls</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
              <div>
                <span className="font-semibold text-zinc-900 block">Auto-Approve Secret Survey Codes</span>
                <span className="text-zinc-500 text-[11px]">
                  Automatically credit reward when user enters matching secret verification key.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoApproveSurveys}
                onChange={(e) => setAutoApproveSurveys(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
              <div>
                <span className="font-semibold text-zinc-900 block">System Email &amp; Webhook Alerts</span>
                <span className="text-zinc-500 text-[11px]">Dispatch notification events for high-value payouts.</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-rose-50 rounded-lg border border-rose-100">
              <div>
                <span className="font-semibold text-rose-900 block">Emergency Withdrawal Freeze</span>
                <span className="text-rose-700 text-[11px]">
                  Temporarily lock outgoing bank and UPI payouts during security audit.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emergencyLock}
                onChange={(e) => setEmergencyLock(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Changes saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Platform Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
