import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebarOption } from '../../types';
import {
  ListOrdered,
  Inbox,
  CheckSquare,
  PlusCircle,
  PlayCircle,
  Key,
  Users,
  Settings,
  Gamepad2,
  AlertCircle,
  Clock,
  BarChart3,
  CreditCard,
  Wrench,
  Building,
  UserCheck,
  History,
  ShieldAlert,
  Wallet,
} from 'lucide-react';

interface SidebarItem {
  id: AdminSidebarOption;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const AdminSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectOption?: (option: AdminSidebarOption) => void;
}> = ({ isOpen, onClose, onSelectOption }) => {
  const {
    adminSidebarOption,
    setAdminSidebarOption,
    submissions,
    withdrawals,
    systemRequests,
    adminActivityLogs,
    depositRequests,
  } = useApp();

  // Calculate live badge counts
  const pendingQueueCount = submissions.filter(
    (s) => s.status === 'submitted' || s.status === 'under_review'
  ).length;
  const pendingRequestsCount = systemRequests.filter((r) => r.status === 'pending').length;
  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'submitted').length;
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;
  const pendingAppealsCount = submissions.filter((s) => s.appealStatus === 'pending').length;
  const holdCount = submissions.filter((s) => s.status === 'on_hold').length;
  const pendingDepositsCount = depositRequests.filter((d) => d.status === 'Pending').length;

  const sidebarItems: SidebarItem[] = [
    { id: 'Q-U-U-E-U-E', label: 'Q-U-U-E-U-E', icon: ListOrdered, badge: pendingQueueCount },
    { id: 'Request', label: 'Request', icon: Inbox, badge: pendingRequestsCount },
    { id: 'Submission', label: 'Submission', icon: CheckSquare, badge: pendingSubmissionsCount },
    { id: 'Create', label: 'Create', icon: PlusCircle },
    { id: 'Active', label: 'Active', icon: PlayCircle },
    { id: 'Secret', label: 'Secret', icon: Key },
    { id: 'User', label: 'User', icon: Users },
    { id: 'Setup', label: 'Setup', icon: Settings },
    { id: 'Gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'Appeals', label: 'Appeals', icon: AlertCircle, badge: pendingAppealsCount },
    { id: 'Hold', label: 'Hold', icon: Clock, badge: holdCount },
    { id: 'States', label: 'States', icon: BarChart3 },
    { id: 'Withdrawal', label: 'Withdrawal', icon: CreditCard, badge: pendingWithdrawalsCount },
    { id: 'Deposit Requests', label: 'Deposit Requests', icon: Wallet, badge: pendingDepositsCount },
    { id: 'Maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'Partners', label: 'Partners', icon: Building },
    { id: 'Assign', label: 'Assign', icon: UserCheck },
    { id: 'Activity Logs', label: 'Activity Logs', icon: History },
    { id: 'Administration', label: 'Administration', icon: ShieldAlert },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-[#0d1322]/95 backdrop-blur-xl text-zinc-100 flex flex-col border-r border-white/[0.08] shadow-2xl shadow-black/40 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Admin Master Menu
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight">System Controls</h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
            {sidebarItems.length} Tools
          </span>
        </div>

        {/* Scrollable Nav list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminSidebarOption === item.id;
            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id.toLowerCase()}`}
                onClick={() => {
                  if (onSelectOption) {
                    onSelectOption(item.id);
                  } else {
                    setAdminSidebarOption(item.id);
                    onClose();
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 scale-[1.01]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white/[0.04] text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-white/[0.08] text-[11px] text-zinc-400 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
            <span className="font-medium text-zinc-300">Root Admin</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">v2.4.0</span>
        </div>
      </aside>
    </>
  );
};
