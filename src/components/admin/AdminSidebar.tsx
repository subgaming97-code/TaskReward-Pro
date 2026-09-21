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
} from 'lucide-react';

interface SidebarItem {
  id: AdminSidebarOption;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    adminSidebarOption,
    setAdminSidebarOption,
    submissions,
    withdrawals,
    systemRequests,
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
    { id: 'Maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'Partners', label: 'Partners', icon: Building },
    { id: 'Assign', label: 'Assign', icon: UserCheck },
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
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Admin Master Menu
            </span>
            <h2 className="text-sm font-semibold text-white">System Controls</h2>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-300 border border-blue-500/30">
            16 Tools
          </span>
        </div>

        {/* Scrollable Nav list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminSidebarOption === item.id;
            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id.toLowerCase()}`}
                onClick={() => {
                  setAdminSidebarOption(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-blue-700'
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
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Role: Root Admin</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
        </div>
      </aside>
    </>
  );
};
