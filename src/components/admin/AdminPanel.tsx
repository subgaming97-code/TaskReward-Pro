import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from './AdminSidebar';
import { QueueSection } from './sections/QueueSection';
import { RequestSection } from './sections/RequestSection';
import { SubmissionSection } from './sections/SubmissionSection';
import { CreateTaskSection } from './sections/CreateTaskSection';
import { ActiveTasksSection } from './sections/ActiveTasksSection';
import { SecretSection } from './sections/SecretSection';
import { UserSection } from './sections/UserSection';
import { SetupSection } from './sections/SetupSection';
import { GamingSection } from './sections/GamingSection';
import { AppealsSection } from './sections/AppealsSection';
import { HoldSection } from './sections/HoldSection';
import { StatesSection } from './sections/StatesSection';
import { WithdrawalSection } from './sections/WithdrawalSection';
import { MaintenanceSection } from './sections/MaintenanceSection';
import { PartnersSection } from './sections/PartnersSection';
import { AssignSection } from './sections/AssignSection';
import { Menu } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { adminSidebarOption } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveSection = () => {
    switch (adminSidebarOption) {
      case 'Q-U-U-E-U-E':
        return <QueueSection />;
      case 'Request':
        return <RequestSection />;
      case 'Submission':
        return <SubmissionSection />;
      case 'Create':
        return <CreateTaskSection />;
      case 'Active':
        return <ActiveTasksSection />;
      case 'Secret':
        return <SecretSection />;
      case 'User':
        return <UserSection />;
      case 'Setup':
        return <SetupSection />;
      case 'Gaming':
        return <GamingSection />;
      case 'Appeals':
        return <AppealsSection />;
      case 'Hold':
        return <HoldSection />;
      case 'States':
        return <StatesSection />;
      case 'Withdrawal':
        return <WithdrawalSection />;
      case 'Maintenance':
        return <MaintenanceSection />;
      case 'Partners':
        return <PartnersSection />;
      case 'Assign':
        return <AssignSection />;
      default:
        return <ActiveTasksSection />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 flex">
      {/* Sidebar with exact 16 options */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Mobile menu trigger bar */}
        <div className="lg:hidden bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Menu className="w-4 h-4" />
            <span>Admin Menu ({adminSidebarOption})</span>
          </button>
          <span className="text-xs font-mono text-zinc-400">16 Tools</span>
        </div>

        {/* Section View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};
