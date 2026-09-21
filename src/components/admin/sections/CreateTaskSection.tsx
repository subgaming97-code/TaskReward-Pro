import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { TaskPriority, Partner } from '../../../types';
import { PlusCircle, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export const CreateTaskSection: React.FC = () => {
  const { createTask, partners, setAdminSidebarOption } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<
    'Social Media' | 'App Testing' | 'Survey & Research' | 'Content Creation' | 'Data Verification' | 'Gaming & Offers'
  >('App Testing');
  const [rewardINR, setRewardINR] = useState<number>(100);
  const [proofType, setProofType] = useState<'Screenshot' | 'Text & Link' | 'Document' | 'Code Verification'>('Screenshot');
  const [proofInstructions, setProofInstructions] = useState('');
  const [totalSlots, setTotalSlots] = useState<number>(50);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(10);
  const [priority, setPriority] = useState<TaskPriority>('Normal');
  const [assignedPartnerName, setAssignedPartnerName] = useState<string>('Apex Media');
  const [deadline, setDeadline] = useState<string>('2026-05-30');
  const [secretKey, setSecretKey] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>(
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'
  );

  const [createdSuccess, setCreatedSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide a task title and description.');
      return;
    }

    createTask({
      title,
      description,
      category,
      rewardINR: Number(rewardINR),
      proofType,
      proofInstructions: proofInstructions || 'Submit proof demonstrating completion according to instructions.',
      totalSlots: Number(totalSlots),
      estimatedMinutes: Number(estimatedMinutes),
      priority,
      assignedPartnerName,
      deadline,
      status: 'active',
      secretKey: secretKey.trim() ? secretKey.trim().toUpperCase() : undefined,
      bannerUrl: bannerUrl.trim() || undefined,
    });

    setCreatedSuccess(true);
  };

  const handleCreateAnother = () => {
    setTitle('');
    setDescription('');
    setProofInstructions('');
    setSecretKey('');
    setCreatedSuccess(false);
  };

  if (createdSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center max-w-xl mx-auto space-y-4 shadow-2xs">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Task Published Successfully!</h2>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          The task is now live in the Worker Catalog and assigned to{' '}
          <strong className="text-zinc-800">{assignedPartnerName}</strong> for proof verification.
        </p>
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={handleCreateAnother}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors"
          >
            Create Another Task
          </button>
          <button
            onClick={() => setAdminSidebarOption('Active')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5"
          >
            <span>View Active Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
          New Campaign Provisioning
        </span>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Create New Task</h1>
        <p className="text-sm text-zinc-500">
          Publish tasks with custom reward payouts in INR, slot limits, proof requirements, and partner assignment.
        </p>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Install &amp; Rate FinTech App"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
              >
                <option value="App Testing">App Testing</option>
                <option value="Social Media">Social Media</option>
                <option value="Survey &amp; Research">Survey &amp; Research</option>
                <option value="Content Creation">Content Creation</option>
                <option value="Data Verification">Data Verification</option>
                <option value="Gaming &amp; Offers">Gaming &amp; Offers</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Reward (INR ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-zinc-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rewardINR}
                    onChange={(e) => setRewardINR(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Total Slots *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Est. Completion (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Assign to Partner by Name *
              </label>
              <select
                value={assignedPartnerName}
                onChange={(e) => setAssignedPartnerName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white font-semibold text-zinc-900"
              >
                {partners.map((p: Partner) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.agencyType})
                  </option>
                ))}
                <option value="Unassigned">Unassigned (Direct Admin Queue)</option>
              </select>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Assigned partner will review submitted proofs and receive commission.
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Task Description &amp; Instructions *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the step-by-step instructions for the worker to complete this task successfully..."
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Proof Type Required *
                </label>
                <select
                  value={proofType}
                  onChange={(e) => setProofType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
                >
                  <option value="Screenshot">Screenshot</option>
                  <option value="Text &amp; Link">Text &amp; Link</option>
                  <option value="Document">Document</option>
                  <option value="Code Verification">Code Verification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Deadline Date
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Proof Submission Instructions
              </label>
              <input
                type="text"
                value={proofInstructions}
                onChange={(e) => setProofInstructions(e.target.value)}
                placeholder="e.g., Upload a clear screenshot of order confirmation page."
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Secret Verification Key (Optional)
                </label>
                <input
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="e.g. SRV928"
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create &amp; Publish Task</span>
          </button>
        </div>
      </form>
    </div>
  );
};
