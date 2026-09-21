import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Task, Partner } from '../../../types';
import {
  PlayCircle,
  PauseCircle,
  Search,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Building2,
  DollarSign,
  Plus,
} from 'lucide-react';

export const ActiveTasksSection: React.FC = () => {
  const { tasks, updateTask, deleteTask, partners, setAdminSidebarOption } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Editing state
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((t: Task) => {
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedPartnerName.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    updateTask(editingTask.id, {
      title: editingTask.title,
      rewardINR: Number(editingTask.rewardINR),
      totalSlots: Number(editingTask.totalSlots),
      assignedPartnerName: editingTask.assignedPartnerName,
      status: editingTask.status,
      priority: editingTask.priority,
    });
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            Live Campaign Monitor
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Active Tasks Overview</h1>
          <p className="text-sm text-zinc-500">
            Monitor slot progress, pause or resume live tasks, and manage reward settings.
          </p>
        </div>

        <button
          onClick={() => setAdminSidebarOption('Create')}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by task title or partner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:bg-white"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-800"
          >
            <option value="all">All Categories</option>
            <option value="App Testing">App Testing</option>
            <option value="Social Media">Social Media</option>
            <option value="Survey &amp; Research">Survey &amp; Research</option>
            <option value="Content Creation">Content Creation</option>
            <option value="Data Verification">Data Verification</option>
            <option value="Gaming &amp; Offers">Gaming &amp; Offers</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-800"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused Only</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-zinc-400 bg-white rounded-xl border border-zinc-200">
            No tasks found matching your filter criteria.
          </div>
        ) : (
          filteredTasks.map((task: Task) => {
            const percentFilled = Math.min(100, Math.round((task.completedSlots / task.totalSlots) * 100));
            const isPaused = task.status === 'paused';

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border p-5 space-y-3.5 shadow-2xs transition-all ${
                  isPaused ? 'border-amber-200 bg-amber-50/20 opacity-80' : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {/* Category & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {task.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isPaused ? (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <PauseCircle className="w-3 h-3" /> Paused
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 leading-snug line-clamp-1">{task.title}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{task.description}</p>
                </div>

                {/* Reward & Partner */}
                <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-xs">
                  <div>
                    <span className="text-[10px] font-medium text-zinc-400 block uppercase">Reward</span>
                    <span className="font-extrabold text-emerald-700 text-sm">₹{task.rewardINR}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-zinc-400 block uppercase">Assigned Partner</span>
                    <span className="font-semibold text-zinc-800 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-zinc-400" />
                      {task.assignedPartnerName}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>
                      Slots: <strong className="text-zinc-800">{task.completedSlots}</strong> / {task.totalSlots}
                    </span>
                    <span>{percentFilled}% Filled</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentFilled >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    onClick={() =>
                      updateTask(task.id, {
                        status: isPaused ? 'active' : 'paused',
                      })
                    }
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                      isPaused
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    {isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTask(task)}
                      title="Edit task parameters"
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
                          deleteTask(task.id);
                        }
                      }}
                      title="Delete task"
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Edit Task</h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-zinc-400 hover:text-zinc-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Title</label>
              <input
                type="text"
                required
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Reward (INR ₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingTask.rewardINR}
                  onChange={(e) => setEditingTask({ ...editingTask, rewardINR: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Total Slots</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingTask.totalSlots}
                  onChange={(e) => setEditingTask({ ...editingTask, totalSlots: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Assigned Partner</label>
              <select
                value={editingTask.assignedPartnerName}
                onChange={(e) => setEditingTask({ ...editingTask, assignedPartnerName: e.target.value })}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                {partners.map((p: Partner) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Status</label>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Priority</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
