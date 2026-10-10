import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Partner } from '../../../types';
import { Building, Plus, Mail, Phone, Percent, DollarSign, CheckCircle2, Shield } from 'lucide-react';

export const PartnersSection: React.FC = () => {
  const { partners, addPartner } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [agencyType, setAgencyType] = useState('Digital Marketing & Social');
  const [commissionRatePercent, setCommissionRatePercent] = useState(12);

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addPartner({
      name,
      email,
      contactNumber: contactNumber || '+91 98000 00000',
      agencyType,
      commissionRatePercent: Number(commissionRatePercent),
      status: 'Active',
    });

    setShowAddModal(false);
    setName('');
    setEmail('');
    setContactNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">
            B2B Partner Ecosystem
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Partner Agency Directory</h1>
          <p className="text-sm text-zinc-500">
            Authorized external partner firms assigned to oversee campaign verification and earn commissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Partner</span>
        </button>
      </div>

      {/* Partners List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {partners.map((partner: Partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-2xs hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">{partner.name}</h3>
                  <span className="text-[11px] text-zinc-500">{partner.agencyType}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {partner.status}
              </span>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-center text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-medium">Assigned</span>
                <span className="font-extrabold text-zinc-800">{partner.assignedTaskCount} Tasks</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-medium">Reviewed</span>
                <span className="font-extrabold text-zinc-800">{partner.completedReviewsCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-medium">Rate</span>
                <span className="font-extrabold text-blue-700">{partner.commissionRatePercent}%</span>
              </div>
            </div>

            {/* Earned Escrow Balance */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-xs">
              <span className="text-zinc-500">Unwithdrawn Balance:</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                ₹{(partner.earnedBalanceINR ?? 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Contact details */}
            <div className="space-y-1 text-[11px] text-zinc-500 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>{partner.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>{partner.contactNumber}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Register Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreatePartner}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Register Partner Agency</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Agency Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Media Global"
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@agency.com"
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Specialization Type</label>
                <select
                  value={agencyType}
                  onChange={(e) => setAgencyType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                >
                  <option value="Digital Marketing &amp; Social">Digital Marketing &amp; Social</option>
                  <option value="App Quality &amp; QA Testing">App Quality &amp; QA Testing</option>
                  <option value="Content &amp; Survey Verification">Content &amp; Survey Verification</option>
                  <option value="Gaming &amp; Influencer Outreach">Gaming &amp; Influencer Outreach</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={commissionRatePercent}
                  onChange={(e) => setCommissionRatePercent(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-zinc-900"
                />
              </div>
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
                Register Partner
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
