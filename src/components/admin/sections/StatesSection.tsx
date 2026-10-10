import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Worker, Partner, WithdrawalRequest, Submission } from '../../../types';
import { RewardsDistributionChart } from '../RewardsDistributionChart';
import {
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  CheckCircle,
  Globe2,
  Server,
  Zap,
} from 'lucide-react';

export const StatesSection: React.FC = () => {
  const { tasks, submissions, withdrawals, workers, partners } = useApp();

  const totalWorkerBalances = workers.reduce((acc: number, w: Worker) => acc + w.availableBalanceINR, 0);
  const totalWorkerEarned = workers.reduce((acc: number, w: Worker) => acc + w.totalEarnedINR, 0);
  const totalPartnerEarned = partners.reduce((acc: number, p: Partner) => acc + p.earnedBalanceINR, 0);

  const totalWithdrawalsCompleted = withdrawals
    .filter((w: WithdrawalRequest) => w.status === 'completed')
    .reduce((acc: number, w: WithdrawalRequest) => acc + w.amountINR, 0);

  const approvedSubmissions = submissions.filter((s: Submission) => s.status === 'approved').length;
  const totalSubmissions = submissions.length || 1;
  const approvalRate = Math.round((approvedSubmissions / totalSubmissions) * 100);

  const stateDistribution = [
    { state: 'Maharashtra', percentage: 28, workers: 420, volumeINR: '₹142,000' },
    { state: 'Karnataka', percentage: 22, workers: 340, volumeINR: '₹118,500' },
    { state: 'Delhi NCR', percentage: 18, workers: 290, volumeINR: '₹95,200' },
    { state: 'Telangana', percentage: 14, workers: 210, volumeINR: '₹74,100' },
    { state: 'Tamil Nadu', percentage: 11, workers: 180, volumeINR: '₹58,400' },
    { state: 'Others / Union Territories', percentage: 7, workers: 115, volumeINR: '₹34,800' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
          Telemetry &amp; States Telemetry
        </span>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Platform States &amp; Analytics</h1>
        <p className="text-sm text-zinc-500">
          Financial circulation in INR, regional distribution across Indian states, and operational health.
        </p>
      </div>

      {/* Financial Health KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Disbursed Payouts</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-2">
            ₹{(totalWithdrawalsCompleted ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" /> Settled via IMPS &amp; UPI
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Worker Escrow Balances</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 mt-2">
            ₹{(totalWorkerBalances ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-1">Available across {workers.length} worker wallets</span>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Partner Commission Escrow</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 mt-2">
            ₹{(totalPartnerEarned ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-1">{partners.length} active agency partners</span>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Global Approval Rate</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 mt-2">{approvalRate}%</div>
          <span className="text-[11px] text-indigo-600 block mt-1">From {submissions.length} audited tasks</span>
        </div>
      </div>

      {/* Recharts 30-Day INR Rewards Distribution Bar Chart */}
      <RewardsDistributionChart />

      {/* Regional States Distribution */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Regional Indian States Performance</h2>
              <p className="text-[11px] text-zinc-500">Distribution of active task completions and payout volume.</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
            All India Coverage
          </span>
        </div>

        <div className="space-y-3.5">
          {stateDistribution.map((item) => (
            <div key={item.state} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900">{item.state}</span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-zinc-500">{item.workers} Workers</span>
                  <span className="font-bold text-emerald-800">{item.volumeINR}</span>
                  <span className="font-bold text-zinc-900 w-8 text-right">{item.percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${item.percentage * 3.2}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Infrastructure Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <span className="text-zinc-500 font-medium block">API Gateway Cluster</span>
            <span className="font-bold text-zinc-900 text-sm">Cluster Asia-South1</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
            99.98% Up
          </span>
        </div>

        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <span className="text-zinc-500 font-medium block">UPI / IMPS Gateway</span>
            <span className="font-bold text-zinc-900 text-sm">NPCI Bank Node</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
            Operational
          </span>
        </div>

        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <span className="text-zinc-500 font-medium block">Verification Queue Engine</span>
            <span className="font-bold text-zinc-900 text-sm">Throughput 120/min</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};
