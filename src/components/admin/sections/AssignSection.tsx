import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Partner, Task, Submission } from '../../../types';
import { UserCheck, Building2, CheckCircle2, ArrowRight, Clock, ExternalLink } from 'lucide-react';

export const AssignSection: React.FC = () => {
  const { tasks, partners, assignTaskToPartner, updateTask, submissions } = useApp();

  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const [targetPartnerName, setTargetPartnerName] = useState<string>(partners[0]?.name || 'Apex Media');
  const [taskLink, setTaskLink] = useState<string>('');
  const [assignmentNote, setAssignmentNote] = useState<string>('High-priority review routing.');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const selectedTask = tasks.find((t: Task) => t.id === selectedTaskId);

  useEffect(() => {
    const t = tasks.find((item) => item.id === selectedTaskId);
    setTaskLink(t?.taskLink || '');
  }, [selectedTaskId, tasks]);

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !targetPartnerName) return;

    assignTaskToPartner(selectedTaskId, targetPartnerName);
    updateTask(selectedTaskId, { taskLink: taskLink.trim() || undefined });
    setSuccessNotice(`Task successfully assigned to ${targetPartnerName}. Reviews will route to their dashboard.`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
          Delegation Center
        </span>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Assign Tasks to Partners</h1>
        <p className="text-sm text-zinc-500">
          Route task verification workflows to specific registered agency partners by name.
        </p>
      </div>

      {successNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Assignment Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Action Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900">Task Allocation Form</h2>
          </div>

          <form onSubmit={handleAssign} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Select Task to Assign *</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-medium"
              >
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title} (₹{task.rewardINR} - Currently: {task.assignedPartnerName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Target Partner Agency Name *</label>
              <select
                value={targetPartnerName}
                onChange={(e) => setTargetPartnerName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-zinc-900"
              >
                {partners.map((partner: Partner) => (
                  <option key={partner.id} value={partner.name}>
                    {partner.name} ({partner.commissionRatePercent}% Commission)
                  </option>
                ))}
                <option value="Unassigned">Unassigned (Keep in Root Admin Queue)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Task Link</label>
              <input
                type="url"
                value={taskLink}
                onChange={(e) => setTaskLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-xs text-zinc-900"
              />
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                The actual task or work URL that will open when the worker clicks it.
              </span>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Routing &amp; QA Directives</label>
              <textarea
                rows={3}
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                placeholder="Instructions for partner reviewers..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Confirm &amp; Route to Partner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Current Allocation Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-900">Current Task Allocation Matrix</h2>
            <span className="text-xs text-zinc-500 font-medium">Total: {tasks.length} Campaigns</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task: Task) => {
              const pendingSubmissionsForTask = submissions.filter(
                (s: Submission) => s.taskId === task.id && (s.status === 'submitted' || s.status === 'under_review')
              ).length;

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-zinc-50/50 text-xs transition-colors"
                >
                  <div className="max-w-md">
                    <span className="font-bold text-zinc-900 block">{task.title}</span>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                      <span>Category: {task.category}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-700">₹{task.rewardINR} per completion</span>
                    </div>
                    {task.taskLink && (
                      <a
                        href={task.taskLink.startsWith('http') ? task.taskLink : `https://${task.taskLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-1 font-mono break-all"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{task.taskLink}</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    {pendingSubmissionsForTask > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {pendingSubmissionsForTask} to review
                      </span>
                    )}
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Assigned To</span>
                      <span className="font-bold text-zinc-900 flex items-center gap-1 justify-end">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                        {task.assignedPartnerName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
