import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Briefcase,
  Wallet,
  User,
  LayoutGrid,
  ListTodo,
  PlusCircle,
  Users,
  Inbox,
  UploadCloud,
  CreditCard,
  FileCheck,
  History,
  CheckCircle2,
  Trophy,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    currentRole,
    workerTab,
    setWorkerTab,
    adminSidebarOption,
    setAdminSidebarOption,
    partnerTab,
    setPartnerTab,
    submissions,
    currentWorker,
    tournaments,
  } = useApp();

  const pendingSubmissionsCount = submissions.filter(
    (s) =>
      (s.workerId === currentWorker?.id ||
        (currentWorker?.email && s.workerEmail?.toLowerCase() === currentWorker.email.toLowerCase())) &&
      (s.status === 'submitted' || s.status === 'under_review')
  ).length;

  const isHome = workerTab === 'Home';
  const isTasks =
    workerTab === 'Tasks' ||
    workerTab === 'Available Tasks' ||
    workerTab === 'My Submissions' ||
    workerTab === 'Submission Status';
  const isTournament = workerTab === 'Tournament';
  const isEarnings =
    workerTab === 'Earnings' ||
    workerTab === 'Withdraw' ||
    workerTab === 'Withdrawal History' ||
    workerTab === 'Income in INR' ||
    workerTab === 'Available Balance';
  const isProfile = workerTab === 'Profile';

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-10px_35px_rgba(0,0,0,0.7)] px-2 pt-1.5 safe-pb"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {currentRole === 'worker' && (
          <>
            {/* Tab 1: Home */}
            <button
              id="mobile-tab-home"
              type="button"
              onClick={() => setWorkerTab('Home')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 min-h-[48px] rounded-2xl transition-all duration-200 relative select-none active:scale-95 touch-manipulation cursor-pointer ${
                isHome ? 'text-cyan-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isHome
                    ? 'bg-cyan-500/15 shadow-[0_0_14px_rgba(6,182,212,0.4)] text-cyan-400 scale-105'
                    : 'text-zinc-400'
                }`}
              >
                <Home className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
              {isHome && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse" />
              )}
            </button>

            {/* Tab 2: Tasks */}
            <button
              id="mobile-tab-tasks"
              type="button"
              onClick={() => setWorkerTab('Tasks')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 min-h-[48px] rounded-2xl transition-all duration-200 relative select-none active:scale-95 touch-manipulation cursor-pointer ${
                isTasks ? 'text-cyan-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl relative transition-all duration-200 ${
                  isTasks
                    ? 'bg-cyan-500/15 shadow-[0_0_14px_rgba(6,182,212,0.4)] text-cyan-400 scale-105'
                    : 'text-zinc-400'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                {pendingSubmissionsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center shadow-xs">
                    {pendingSubmissionsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Tasks</span>
              {isTasks && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse" />
              )}
            </button>

            {/* Tab 3: Tournament (NEW) */}
            <button
              id="mobile-tab-tournament"
              type="button"
              onClick={() => setWorkerTab('Tournament')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 min-h-[48px] rounded-2xl transition-all duration-200 relative select-none active:scale-95 touch-manipulation cursor-pointer ${
                isTournament ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl relative transition-all duration-200 ${
                  isTournament
                    ? 'bg-amber-500/15 shadow-[0_0_14px_rgba(245,158,11,0.45)] text-amber-400 scale-105'
                    : 'text-zinc-400'
                }`}
              >
                <Trophy className="w-5 h-5" />
                {tournaments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[9px] font-black flex items-center justify-center shadow-xs">
                    {tournaments.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Arena</span>
              {isTournament && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-pulse" />
              )}
            </button>

            {/* Tab 4: Earnings */}
            <button
              id="mobile-tab-earnings"
              type="button"
              onClick={() => setWorkerTab('Earnings')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 min-h-[48px] rounded-2xl transition-all duration-200 relative select-none active:scale-95 touch-manipulation cursor-pointer ${
                isEarnings ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isEarnings
                    ? 'bg-emerald-500/15 shadow-[0_0_14px_rgba(16,185,129,0.45)] text-emerald-400 scale-105'
                    : 'text-zinc-400'
                }`}
              >
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Earnings</span>
              {isEarnings && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
              )}
            </button>

            {/* Tab 5: Profile */}
            <button
              id="mobile-tab-profile"
              type="button"
              onClick={() => setWorkerTab('Profile')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 min-h-[48px] rounded-2xl transition-all duration-200 relative select-none active:scale-95 touch-manipulation cursor-pointer ${
                isProfile ? 'text-cyan-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl relative transition-all duration-200 ${
                  isProfile
                    ? 'bg-cyan-500/15 shadow-[0_0_14px_rgba(6,182,212,0.4)] text-cyan-400 scale-105'
                    : 'text-zinc-400'
                }`}
              >
                <User className="w-5 h-5" />
                {currentWorker.googleAccount && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Profile</span>
              {isProfile && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse" />
              )}
            </button>
          </>
        )}

        {currentRole === 'admin' && (
          <>
            <button
              type="button"
              onClick={() => setAdminSidebarOption('Active')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl ${
                adminSidebarOption === 'Active' ? 'text-blue-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <ListTodo className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Tasks</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminSidebarOption('Create')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl ${
                adminSidebarOption === 'Create' ? 'text-blue-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Create</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminSidebarOption('Submission')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl ${
                adminSidebarOption === 'Submission' ? 'text-blue-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Audits</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminSidebarOption('Withdrawal')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl ${
                adminSidebarOption === 'Withdrawal' ? 'text-blue-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Payouts</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminSidebarOption('User')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl ${
                adminSidebarOption === 'User' ? 'text-blue-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Users</span>
            </button>
          </>
        )}

        {currentRole === 'partner' && (
          <>
            <button
              type="button"
              onClick={() => setPartnerTab('Assign Requests')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl ${
                partnerTab === 'Assign Requests' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <Inbox className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Requests</span>
            </button>
            <button
              type="button"
              onClick={() => setPartnerTab('Upload')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl ${
                partnerTab === 'Upload' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <UploadCloud className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setPartnerTab('Withdrawal Request')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl ${
                partnerTab === 'Withdrawal Request' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Withdraw</span>
            </button>
            <button
              type="button"
              onClick={() => setPartnerTab('Activity Log')}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl ${
                partnerTab === 'Activity Log' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Activity</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
