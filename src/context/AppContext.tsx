import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  auth,
  testConnection,
  getSingleDocument,
  saveDocument,
  removeDocument,
  fetchCollection,
  subscribeToCollection,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '../lib/firebase';
import {
  Role,
  AdminSidebarOption,
  PartnerTab,
  PartnerPanelCode,
  PartnerPanelInfo,
  WorkerTab,
  Task,
  Submission,
  WithdrawalRequest,
  Partner,
  Worker,
  SecretVoucher,
  PartnerUpload,
  SystemRequest,
  GamingOffer,
  PlatformSettings,
  UserTransaction,
  AdminActivityLog,
  PartnerActivityLog,
  Tournament,
  TournamentGameMode,
  TournamentStatus,
  TournamentParticipant,
  TournamentSupportTicket,
  TournamentMatchResult,
  RoleSecurityPins,
  DepositRequest,
  DepositRequestStatus,
} from '../types';

export const DEFAULT_ROLE_PINS: RoleSecurityPins = {
  adminPin: '', // No default or placeholder PIN for admin; must be set exclusively by administrator
  moderatorPin: '', // No default PIN for moderator; must be set exclusively by administrator
  partnerPin: '', // No default PIN for partner; must be set exclusively by administrator
  partnerPanelPins: {}, // No default PINs for individual panels; must be set exclusively by administrator
};

export const LEGACY_DEFAULT_PINS = new Set([
  '1115',
  '2244',
  '8899',
  '0099',
  '0088',
  '0077',
  '0066',
  '1001',
  '2002',
  '3003',
  '4004',
  '1122',
  '3344',
  '5566',
]);

export const PARTNER_PANELS: PartnerPanelInfo[] = [
  {
    code: 'A',
    label: 'Partner A',
    uniquePartnerName: 'Partner A - Apex Media',
    agencyType: 'Digital Marketing & Social',
    description: 'Digital Campaign Engagement & Brand Sentiment Verification Desk',
  },
  {
    code: 'B',
    label: 'Partner B',
    uniquePartnerName: 'Partner B - TaskPro Partners',
    agencyType: 'App Quality & QA Testing',
    description: 'Mobile APK Testing & Onboarding Flow Diagnostics Desk',
  },
  {
    code: 'C',
    label: 'Partner C',
    uniquePartnerName: 'Partner C - Nexus Digital',
    agencyType: 'Content & Survey Verification',
    description: 'Research Survey Answers & Demographic Data Verification Desk',
  },
  {
    code: 'D',
    label: 'Partner D',
    uniquePartnerName: 'Partner D - Vanguard Agency',
    agencyType: 'E-commerce & Growth Operations',
    description: 'E-commerce Funnels & High-Value Campaign Audits Desk',
  },
];

export const isPartnerMatch = (nameA?: string, nameB?: string): boolean => {
  if (!nameA || !nameB) return false;
  const a = nameA.toLowerCase().trim();
  const b = nameB.toLowerCase().trim();
  if (a === b) return true;

  // Partner A
  if ((a.includes('partner a') || a.includes('apex media')) && (b.includes('partner a') || b.includes('apex media'))) return true;
  // Partner B
  if ((a.includes('partner b') || a.includes('taskpro')) && (b.includes('partner b') || b.includes('taskpro'))) return true;
  // Partner C
  if ((a.includes('partner c') || a.includes('nexus')) && (b.includes('partner c') || b.includes('nexus'))) return true;
  // Partner D
  if ((a.includes('partner d') || a.includes('vanguard')) && (b.includes('partner d') || b.includes('vanguard'))) return true;

  return false;
};

interface AppContextType {
  // Current active role & user view
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  selectedPartnerName: string;
  setSelectedPartnerName: (name: string) => void;

  // Security PIN Verification & Partner Access
  pinModalOpen: boolean;
  pendingRole: 'admin' | 'partner' | null;
  pendingPartnerPanel: PartnerPanelCode | null;
  partnerStep: 'select' | 'name' | 'pin';
  enteredPartnerName: string;
  setEnteredPartnerName: (name: string) => void;
  pinError: string | null;
  partnerPanels: PartnerPanelInfo[];

  requestRoleChange: (role: Role, panelCode?: PartnerPanelCode) => void;
  selectPartnerPanelToVerify: (panelCode: PartnerPanelCode) => void;
  submitPartnerName: (name: string) => boolean;
  verifyPin: (pin: string) => boolean;
  closePinModal: () => void;

  // Active navigation tabs
  adminSidebarOption: AdminSidebarOption;
  setAdminSidebarOption: (tab: AdminSidebarOption) => void;
  partnerTab: PartnerTab;
  setPartnerTab: (tab: PartnerTab) => void;
  workerTab: WorkerTab;
  setWorkerTab: (tab: WorkerTab) => void;

  // Primary Entities
  tasks: Task[];
  submissions: Submission[];
  withdrawals: WithdrawalRequest[];
  partners: Partner[];
  workers: Worker[];
  secretVouchers: SecretVoucher[];
  partnerUploads: PartnerUpload[];
  systemRequests: SystemRequest[];
  gamingOffers: GamingOffer[];
  settings: PlatformSettings;

  // Current logged in worker/partner profiles
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  logout: () => void;
  currentWorker: Worker;
  currentPartner: Partner;
  activeWorkerId: string;
  setActiveWorkerId: (id: string) => void;

  // Google Sign-In & User ID Mapping
  googleAuthModalOpen: boolean;
  setGoogleAuthModalOpen: (open: boolean) => void;
  loginUser: (email: string) => Promise<{ success: boolean; worker?: Worker; message: string }> | { success: boolean; worker?: Worker; message: string };
  loginWithGoogle: (profile?: {
    email?: string;
    name?: string;
    avatarUrl?: string;
    googleId?: string;
  }) => Promise<{ worker: Worker; isNewUser: boolean; uniqueUserId: string }>;
  signupUser: (profile: {
    email: string;
    name?: string;
    phone?: string;
    avatarUrl?: string;
    password?: string;
  }) => Promise<{ success: boolean; worker?: Worker; isNewUser?: boolean; message?: string }>;
  registerUser: (profile: {
    email: string;
    name?: string;
    phone?: string;
    avatarUrl?: string;
    password?: string;
  }) => Promise<{ success: boolean; worker?: Worker; isNewUser?: boolean; message?: string }>;
  logoutGoogle: () => void;
  unlinkGoogleAccount: (workerId: string) => void;

  // Task Actions
  createTask: (newTask: Omit<Task, 'id' | 'createdAt' | 'completedSlots'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  assignTaskToPartner: (taskId: string, partnerName: string) => void;

  // Submission & Review Actions
  submitTaskProof: (
    taskId: string,
    proofText: string,
    proofUrl?: string,
    proofFileName?: string,
    secretCode?: string,
    proofImage?: string
  ) => { success: boolean; message: string };
  reviewSubmission: (
    submissionId: string,
    decision: 'approved' | 'rejected' | 'on_hold',
    reviewerName: string,
    reviewerRole: 'admin' | 'partner',
    notes?: string,
    holdReason?: string
  ) => void;
  submitAppeal: (submissionId: string, appealText: string) => void;
  resolveAppeal: (submissionId: string, approve: boolean, resolutionNotes: string) => void;

  // Withdrawal Actions
  requestWithdrawal: (amountINR: number, method: 'UPI' | 'Bank Transfer' | 'Paytm', payoutDetails: string, role: 'worker' | 'partner') => { success: boolean; message: string };
  processWithdrawal: (withdrawalId: string, status: 'approved' | 'completed' | 'rejected', transactionRef?: string, notes?: string) => void;

  // Secret Voucher Actions
  redeemVoucher: (code: string) => { success: boolean; message: string; rewardINR?: number };
  createVoucher: (voucher: Omit<SecretVoucher, 'id' | 'redeemedCount' | 'redeemedBy'>) => void;
  toggleVoucherStatus: (id: string) => void;

  // Partner Upload Actions
  addPartnerUpload: (upload: Omit<PartnerUpload, 'id' | 'uploadedAt'>) => void;

  // System Request Actions
  handleSystemRequest: (requestId: string, approve: boolean) => void;

  // Gaming Actions
  playGamingOffer: (offerId: string) => { success: boolean; wonINR: number; message: string };

  // Activity Logs & Transaction History
  userTransactions: UserTransaction[];
  adminActivityLogs: AdminActivityLog[];
  partnerActivityLogs: PartnerActivityLog[];
  logAdminActivity: (log: Omit<AdminActivityLog, 'id' | 'timestamp'>) => void;
  logPartnerActivity: (log: Omit<PartnerActivityLog, 'id' | 'timestamp' | 'date' | 'time'>) => void;

  // Settings & Maintenance Actions
  updateSettings: (updates: Partial<PlatformSettings>) => void;
  updateWorkerBalance: (workerId: string, deltaINR: number, reason: string, performedByAdmin?: string) => void;
  deleteWorker: (workerId: string, performedByAdmin?: string) => void;
  addPartner: (newPartner: Omit<Partner, 'id' | 'assignedTaskCount' | 'completedReviewsCount' | 'earnedBalanceINR' | 'joinedDate'>) => void;

  // Tournament Actions
  tournaments: Tournament[];
  tournamentParticipants: TournamentParticipant[];
  addTournament: (newTourn: Omit<Tournament, 'id' | 'registeredSlots' | 'createdAt'>) => Tournament;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  registerForTournament: (tournamentId: string, inGameName: string, inGameUid: string) => { success: boolean; message: string };
  updateParticipant: (participantId: string, updates: Partial<TournamentParticipant>) => void;
  removeParticipant: (participantId: string) => void;
  awardTournamentPrizes: (
    tournamentId: string,
    results: { participantId: string; rank: number; kills: number; prizeINR: number; points: number }[]
  ) => void;
  isModeratorUnlocked: boolean;
  setIsModeratorUnlocked: (unlocked: boolean) => void;

  // Match Results System
  matchResults: TournamentMatchResult[];
  addMatchResult: (result: Omit<TournamentMatchResult, 'id' | 'publishedAt'>) => TournamentMatchResult;
  updateMatchResult: (id: string, updates: Partial<TournamentMatchResult>) => void;
  deleteMatchResult: (id: string) => void;

  // Customer Support Tickets
  supportTickets: TournamentSupportTicket[];
  createSupportTicket: (ticket: Omit<TournamentSupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => TournamentSupportTicket;
  updateSupportTicket: (id: string, updates: Partial<TournamentSupportTicket>) => void;
  resolveSupportTicket: (id: string, reply: string, compensationINR?: number) => void;

  // Role Security PINs Management
  roleSecurityPins: RoleSecurityPins;
  updateRolePin: (role: 'admin' | 'moderator' | 'partner' | string, newPin: string) => void;
  resetRolePins: () => void;
  verifyAdminPin: (pin: string) => boolean;
  verifyModeratorPin: (pin: string) => boolean;

  // Tournament Deposit Requests
  depositRequests: DepositRequest[];
  createDepositRequest: (data: { senderName: string; amountINR: number; utr: string }) => Promise<boolean>;
  approveDepositRequest: (requestId: string, notes?: string) => void;
  rejectDepositRequest: (requestId: string, reason?: string) => void;

  // App Navigation Sidebar
  isAppSidebarOpen: boolean;
  setIsAppSidebarOpen: (open: boolean) => void;

  // Quick reset / reload
  resetToDefaultData: () => void;
  notificationMessage: string | null;
  clearNotification: () => void;
  notify: (message: string) => void;
  isFirestoreConnected: boolean;
}

const STORAGE_KEY = 'taskflow_platform_state_v1';

export const INITIAL_DEPOSIT_REQUESTS: DepositRequest[] = [
  {
    id: 'dep-1003',
    userId: 'w-1',
    userName: 'Aarav Sharma (EID-1001)',
    userEmail: 'aarav.sharma@example.com',
    senderName: 'Aarav Kumar Sharma',
    amountINR: 500,
    utr: '428190382910',
    upiId: 'soumodipbera@fam',
    status: 'Pending',
    submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    approvalWindowMessage: 'Deposits are manually verified and approved within 8 hours.',
  },
  {
    id: 'dep-1002',
    userId: 'w-2',
    userName: 'Priya Patel (EID-1002)',
    userEmail: 'priya.patel@example.com',
    senderName: 'Priya Jayesh Patel',
    amountINR: 250,
    utr: '428177492019',
    upiId: 'soumodipbera@fam',
    status: 'Approved',
    submittedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    reviewedBy: 'Administrator',
    reviewNotes: 'Verified with bank statement UPI credit. Credited ₹250 to player wallet.',
    approvalWindowMessage: 'Deposits are manually verified and approved within 8 hours.',
  },
  {
    id: 'dep-1001',
    userId: 'w-3',
    userName: 'Rohan Verma (EID-1003)',
    userEmail: 'rohan.verma@example.com',
    senderName: 'Rohan S Verma',
    amountINR: 1000,
    utr: '428110992384',
    upiId: 'soumodipbera@fam',
    status: 'Pending',
    submittedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    approvalWindowMessage: 'Deposits are manually verified and approved within 8 hours.',
  },
];

const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'p-1',
    name: 'Partner A - Apex Media',
    email: 'ops@apexmedia.io',
    contactNumber: '+91 98765 43210',
    assignedTaskCount: 5,
    completedReviewsCount: 38,
    commissionRatePercent: 12,
    earnedBalanceINR: 3450,
    status: 'Active',
    joinedDate: '2025-11-10',
    agencyType: 'Digital Marketing & Social',
  },
  {
    id: 'p-2',
    name: 'Partner B - TaskPro Partners',
    email: 'contact@taskpro.org',
    contactNumber: '+91 98123 45678',
    assignedTaskCount: 3,
    completedReviewsCount: 22,
    commissionRatePercent: 10,
    earnedBalanceINR: 2100,
    status: 'Active',
    joinedDate: '2025-12-05',
    agencyType: 'App Quality & QA Testing',
  },
  {
    id: 'p-3',
    name: 'Partner C - Nexus Digital',
    email: 'admin@nexusdigital.in',
    contactNumber: '+91 99887 76655',
    assignedTaskCount: 4,
    completedReviewsCount: 17,
    commissionRatePercent: 15,
    earnedBalanceINR: 1850,
    status: 'Active',
    joinedDate: '2026-01-14',
    agencyType: 'Content & Survey Verification',
  },
  {
    id: 'p-4',
    name: 'Partner D - Vanguard Agency',
    email: 'ops@vanguardagency.in',
    contactNumber: '+91 98234 56780',
    assignedTaskCount: 3,
    completedReviewsCount: 14,
    commissionRatePercent: 14,
    earnedBalanceINR: 1620,
    status: 'Active',
    joinedDate: '2026-02-01',
    agencyType: 'E-commerce & Growth Operations',
  },
];

export const generateUniqueUserId = (existingWorkers: Worker[]): string => {
  const existingSet = new Set<string>();
  existingWorkers.forEach((w) => {
    if (w.uniqueUserId) existingSet.add(w.uniqueUserId.toUpperCase());
    if (w.id) existingSet.add(w.id.toUpperCase());
  });

  let attempts = 0;
  while (attempts < 5000) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const candidate = `UID-${randomNum}`;
    if (!existingSet.has(candidate.toUpperCase())) {
      return candidate;
    }
    attempts++;
  }
  return `UID-${Date.now().toString().slice(-6)}`;
};

export const generateUniqueEID = (existingWorkers: Worker[]): string => {
  const existingSet = new Set<string>();
  existingWorkers.forEach((w) => {
    if (w.eid) existingSet.add(w.eid.toUpperCase());
    if (w.uniqueUserId) existingSet.add(w.uniqueUserId.toUpperCase().replace('UID-', 'EID-'));
  });

  let attempts = 0;
  while (attempts < 5000) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const candidate = `EID-${randomNum}`;
    if (!existingSet.has(candidate.toUpperCase())) {
      return candidate;
    }
    attempts++;
  }
  return `EID-${Date.now().toString().slice(-6)}`;
};

const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w-100',
    uniqueUserId: 'UID-928410',
    eid: 'EID-928410',
    name: 'Arati Bera',
    email: 'aratibera754@gmail.com',
    phone: '+91 98310 54321',
    availableBalanceINR: 0,
    totalEarnedINR: 0,
    completedTasksCount: 0,
    status: 'Active',
    joinedDate: '2026-02-10',
    upiId: 'aratibera@okhdfcbank',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aratibera754',
    googleAccount: {
      email: 'aratibera754@gmail.com',
      name: 'Arati Bera',
      googleId: 'goog_aratibera754',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aratibera754',
      signedInAt: '2026-09-21 08:55',
    },
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-101',
    title: 'Download & Rate Fintech Companion App',
    description: 'Install the companion mobile finance tracker, sign up with any valid email, and post a genuine 5-star review on the Play Store with 2 lines of constructive feedback.',
    category: 'App Testing',
    rewardINR: 120,
    proofType: 'Screenshot',
    proofInstructions: 'Submit a clear screenshot of your posted Play Store review showing your username and star rating.',
    totalSlots: 50,
    completedSlots: 24,
    assignedPartnerName: 'TaskPro Partners',
    assignedPartnerId: 'p-2',
    status: 'active',
    priority: 'High',
    createdAt: '2026-03-01',
    deadline: '2026-04-15',
    estimatedMinutes: 8,
    bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    taskLink: 'https://play.google.com/store/apps/details?id=com.fintech.companion',
  },
  {
    id: 'task-102',
    title: 'Follow & Retweet Crypto Ecosystem Announcement',
    description: 'Visit the official Twitter/X profile @EcosystemGlobal, hit Follow, like the pinned tweet, and quote-retweet with hashtag #Web3Rewards.',
    category: 'Social Media',
    rewardINR: 65,
    proofType: 'Text & Link',
    proofInstructions: 'Provide the direct URL to your quote-retweet along with your Twitter/X username.',
    totalSlots: 100,
    completedSlots: 68,
    assignedPartnerName: 'Apex Media',
    assignedPartnerId: 'p-1',
    status: 'active',
    priority: 'Normal',
    createdAt: '2026-03-05',
    deadline: '2026-04-20',
    estimatedMinutes: 3,
    bannerUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
    taskLink: 'https://x.com/EcosystemGlobal/status/1765000000000',
  },
  {
    id: 'task-103',
    title: 'Consumer Brand Preference Survey 2026',
    description: 'Complete our 12-question demographic research survey regarding consumer preferences in quick-commerce delivery services across urban regions.',
    category: 'Survey & Research',
    rewardINR: 95,
    proofType: 'Code Verification',
    proofInstructions: 'Complete the survey until the final thank-you page to receive the 6-character survey completion code. Enter that code below.',
    totalSlots: 80,
    completedSlots: 41,
    assignedPartnerName: 'Nexus Digital Solutions',
    assignedPartnerId: 'p-3',
    status: 'active',
    priority: 'Normal',
    createdAt: '2026-03-08',
    deadline: '2026-04-10',
    secretKey: 'SRV928',
    estimatedMinutes: 6,
    bannerUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    taskLink: 'https://surveys.brandpulse.com/s/2026-consumer-study',
  },
  {
    id: 'task-104',
    title: 'Write 150-Word Product Review for Wireless Earbuds',
    description: 'Review the SoundPulse Pro earbuds on our community blog catalog. Mention audio clarity, battery endurance, and ergonomics.',
    category: 'Content Creation',
    rewardINR: 180,
    proofType: 'Text & Link',
    proofInstructions: 'Paste the review text (minimum 150 words) and specify the publication URL or handle.',
    totalSlots: 30,
    completedSlots: 12,
    assignedPartnerName: 'Apex Media',
    assignedPartnerId: 'p-1',
    status: 'active',
    priority: 'Urgent',
    createdAt: '2026-03-10',
    deadline: '2026-04-05',
    estimatedMinutes: 15,
    bannerUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    taskLink: 'https://techpulse.blog/reviews/soundpulse-pro',
  },
  {
    id: 'task-105',
    title: 'Merchant Store Listing Verification & Geo-Tag',
    description: 'Verify the opening hours, storefront address, and operational status of assigned grocery partners on the neighborhood map directory.',
    category: 'Data Verification',
    rewardINR: 150,
    proofType: 'Screenshot',
    proofInstructions: 'Upload a screenshot of the directory verification checkmark with confirmed timestamp.',
    totalSlots: 40,
    completedSlots: 19,
    assignedPartnerName: 'Nexus Digital Solutions',
    assignedPartnerId: 'p-3',
    status: 'active',
    priority: 'Normal',
    createdAt: '2026-03-12',
    deadline: '2026-04-18',
    estimatedMinutes: 10,
    bannerUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80',
    taskLink: 'https://maps.google.com/search/grocery+stores',
  },
  {
    id: 'task-106',
    title: 'Level 5 Milestone in Strategy Quest RPG',
    description: 'Download Strategy Quest from the offers wall, create a free account, complete tutorial and reach Castle Citadel Level 5.',
    category: 'Gaming & Offers',
    rewardINR: 240,
    proofType: 'Screenshot',
    proofInstructions: 'Upload an in-game screenshot showing your player profile banner and Citadel Level 5 unlocked.',
    totalSlots: 25,
    completedSlots: 8,
    assignedPartnerName: 'TaskPro Partners',
    assignedPartnerId: 'p-2',
    status: 'active',
    priority: 'High',
    createdAt: '2026-03-14',
    deadline: '2026-04-30',
    estimatedMinutes: 25,
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    taskLink: 'https://offers.strategyquestgame.com/download',
  },
  {
    id: 'task-107',
    title: 'E-commerce Checkout & UPI Payment Gateway QA Audit',
    description: 'Perform a test checkout on the partner shop website using staging mode, test payment gateway UPI intent trigger, and submit confirmation ID.',
    category: 'Data Verification',
    rewardINR: 190,
    proofType: 'Screenshot',
    proofInstructions: 'Submit a screenshot of the completed test transaction receipt showing order ID #ORD-998.',
    totalSlots: 35,
    completedSlots: 12,
    assignedPartnerName: 'Partner D - Vanguard Agency',
    assignedPartnerId: 'p-4',
    status: 'active',
    priority: 'High',
    createdAt: '2026-03-15',
    deadline: '2026-04-25',
    estimatedMinutes: 12,
    bannerUrl: 'https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=600&q=80',
    taskLink: 'https://staging-shop.vanguardagency.com/checkout',
  },
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-301',
    taskId: 'task-102',
    taskTitle: 'Follow & Retweet Crypto Ecosystem Announcement',
    workerId: 'w-101',
    workerName: 'Alex Rivera',
    workerEmail: 'alex.rivera@example.com',
    rewardINR: 65,
    assignedPartnerName: 'Apex Media',
    status: 'approved',
    proofText: 'Retweeted with hashtag #Web3Rewards. My handle is @alex_crypto_dev.',
    proofUrl: 'https://twitter.com/alex_crypto_dev/status/1789201928391',
    submittedAt: '2026-03-15 11:20 AM',
    reviewedAt: '2026-03-15 02:45 PM',
    reviewerName: 'Apex Media Ops',
    reviewerRole: 'partner',
    reviewNotes: 'Verified handle and quote retweet. Authentic activity.',
  },
  {
    id: 'sub-302',
    taskId: 'task-101',
    taskTitle: 'Download & Rate Fintech Companion App',
    workerId: 'w-101',
    workerName: 'Alex Rivera',
    workerEmail: 'alex.rivera@example.com',
    rewardINR: 120,
    assignedPartnerName: 'TaskPro Partners',
    status: 'under_review',
    proofText: 'Installed app and posted 5-star review titled "Smooth budgeting tracker with clean charts".',
    proofFileName: 'playstore_review_alex_fintech.png',
    submittedAt: '2026-03-18 09:15 AM',
  },
  {
    id: 'sub-303',
    taskId: 'task-104',
    taskTitle: 'Write 150-Word Product Review for Wireless Earbuds',
    workerId: 'w-101',
    workerName: 'Alex Rivera',
    workerEmail: 'alex.rivera@example.com',
    rewardINR: 180,
    assignedPartnerName: 'Apex Media',
    status: 'submitted',
    proofText: 'The SoundPulse Pro delivers crisp treble and surprisingly deep bass for its compact housing. Battery life reached 7.5 hours on single charge during daily commute. Ear tips fit securely without fatigue.',
    proofUrl: 'https://techpulse.blog/reviews/soundpulse-pro-user-impressions',
    submittedAt: '2026-03-20 04:30 PM',
  },
  {
    id: 'sub-304',
    taskId: 'task-103',
    taskTitle: 'Consumer Brand Preference Survey 2026',
    workerId: 'w-102',
    workerName: 'Sarah Chen',
    workerEmail: 'sarah.chen@example.com',
    rewardINR: 95,
    assignedPartnerName: 'Nexus Digital Solutions',
    status: 'approved',
    proofText: 'Survey completed fully. Code entered accurately.',
    secretCodeProvided: 'SRV928',
    submittedAt: '2026-03-16 03:10 PM',
    reviewedAt: '2026-03-16 03:40 PM',
    reviewerName: 'Nexus Admin Reviewer',
    reviewerRole: 'partner',
    reviewNotes: 'Survey confirmation code SRV928 verified in survey platform database.',
  },
  {
    id: 'sub-305',
    taskId: 'task-105',
    taskTitle: 'Merchant Store Listing Verification & Geo-Tag',
    workerId: 'w-103',
    workerName: 'David Miller',
    workerEmail: 'david.m@example.com',
    rewardINR: 150,
    assignedPartnerName: 'Nexus Digital Solutions',
    status: 'on_hold',
    proofText: 'Verified store #4092 at Central Ave.',
    proofFileName: 'store_photo_4092.jpg',
    submittedAt: '2026-03-17 01:20 PM',
    reviewerName: 'Nexus Partner Lead',
    reviewerRole: 'partner',
    holdReason: 'Timestamp on the photo metadata is blurred. Secondary physical check required.',
  },
  {
    id: 'sub-306',
    taskId: 'task-106',
    taskTitle: 'Level 5 Milestone in Strategy Quest RPG',
    workerId: 'w-104',
    workerName: 'Priya Sharma',
    workerEmail: 'priya.s@example.com',
    rewardINR: 240,
    assignedPartnerName: 'TaskPro Partners',
    status: 'rejected',
    proofText: 'Level 5 completed.',
    proofFileName: 'strategy_quest_screenshot.png',
    submittedAt: '2026-03-14 06:10 PM',
    reviewedAt: '2026-03-15 10:00 AM',
    reviewerName: 'TaskPro QA Officer',
    reviewerRole: 'partner',
    reviewNotes: 'Uploaded screenshot depicts Citadel Level 3, not the required Level 5 milestone.',
    appealStatus: 'pending',
    appealText: 'I reached Level 5 an hour after taking the first screenshot! Please find my updated progression link and account ID #99281.',
    appealSubmittedAt: '2026-03-16 11:30 AM',
  },
  {
    id: 'sub-307',
    taskId: 'task-107',
    taskTitle: 'E-commerce Checkout & UPI Payment Gateway QA Audit',
    workerId: 'w-102',
    workerName: 'Sarah Chen',
    workerEmail: 'sarah.chen@example.com',
    rewardINR: 190,
    assignedPartnerName: 'Partner D - Vanguard Agency',
    status: 'submitted',
    proofText: 'Successfully completed checkout audit via UPI mock intent. Order reference is ORD-998-TEST.',
    proofFileName: 'order_receipt_ORD998.png',
    submittedAt: '2026-03-21 11:20 AM',
  },
];

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wth-501',
    userId: 'w-101',
    userName: 'Alex Rivera',
    role: 'worker',
    amountINR: 500,
    method: 'UPI',
    payoutDetails: 'alex.rivera@okhdfcbank',
    status: 'completed',
    requestedAt: '2026-03-10 10:30 AM',
    processedAt: '2026-03-10 03:15 PM',
    transactionRef: 'UPI/607812984711/SUCCESS',
    adminNotes: 'Payout verified and credited via IMPS settlement.',
  },
  {
    id: 'wth-502',
    userId: 'w-102',
    userName: 'Sarah Chen',
    role: 'worker',
    amountINR: 1000,
    method: 'UPI',
    payoutDetails: 'sarahc@icici',
    status: 'pending',
    requestedAt: '2026-03-19 02:00 PM',
  },
  {
    id: 'wth-503',
    userId: 'p-1',
    userName: 'Apex Media',
    role: 'partner',
    amountINR: 2500,
    method: 'Bank Transfer',
    payoutDetails: 'A/C: 987654321098, IFSC: HDFC0001234, Apex Media LLP',
    status: 'approved',
    requestedAt: '2026-03-18 11:45 AM',
    adminNotes: 'Approved by finance desk. Scheduled for batch NEFT release at 5 PM.',
  },
];

const INITIAL_VOUCHERS: SecretVoucher[] = [
  {
    id: 'v-1',
    code: 'WELCOME50',
    description: 'First-time registration celebration reward bonus.',
    rewardINR: 50,
    maxRedemptions: 500,
    redeemedCount: 142,
    expiresAt: '2026-06-30',
    active: true,
    redeemedBy: ['w-102'],
  },
  {
    id: 'v-2',
    code: 'SUPERBONUS100',
    description: 'High performer reward voucher for completing 5+ tasks.',
    rewardINR: 100,
    maxRedemptions: 100,
    redeemedCount: 38,
    expiresAt: '2026-05-15',
    active: true,
    redeemedBy: [],
  },
  {
    id: 'v-3',
    code: 'SPRING25',
    description: 'Seasonal festival bonus voucher.',
    rewardINR: 25,
    maxRedemptions: 1000,
    redeemedCount: 520,
    expiresAt: '2026-04-30',
    active: true,
    redeemedBy: [],
  },
];

const INITIAL_UPLOADS: PartnerUpload[] = [
  {
    id: 'up-1',
    partnerName: 'Apex Media',
    fileName: 'Apex_Social_Audit_Checklist_Q1.pdf',
    fileType: 'application/pdf',
    fileSize: '1.4 MB',
    relatedTaskId: 'task-102',
    relatedTaskTitle: 'Follow & Retweet Crypto Ecosystem Announcement',
    description: 'Step-by-step verification guideline for campaign retweets and account authenticity.',
    uploadedAt: '2026-03-06 02:15 PM',
  },
  {
    id: 'up-2',
    partnerName: 'TaskPro Partners',
    fileName: 'Fintech_App_Review_Criteria_v2.docx',
    fileType: 'application/msword',
    fileSize: '840 KB',
    relatedTaskId: 'task-101',
    relatedTaskTitle: 'Download & Rate Fintech Companion App',
    description: 'Quality criteria for approving Play Store app reviews and rating screenshots.',
    uploadedAt: '2026-03-02 10:00 AM',
  },
  {
    id: 'up-3',
    partnerName: 'Nexus Digital Solutions',
    fileName: 'Survey_Completion_Secret_Keys_Batch1.csv',
    fileType: 'text/csv',
    fileSize: '320 KB',
    relatedTaskId: 'task-103',
    relatedTaskTitle: 'Consumer Brand Preference Survey 2026',
    description: 'Master list of valid survey redemption hash keys for fast programmatic matching.',
    uploadedAt: '2026-03-09 11:30 AM',
  },
];

const INITIAL_REQUESTS: SystemRequest[] = [
  {
    id: 'req-01',
    type: 'limit_increase',
    requesterName: 'Sarah Chen',
    requesterRole: 'worker',
    title: 'Daily Withdrawal Limit Increase Request',
    description: 'Requesting daily withdrawal ceiling upgrade from ₹1,000 to ₹3,000 based on steady weekly completion.',
    status: 'pending',
    requestedAt: '2026-03-19 04:00 PM',
    requestedAmountINR: 3000,
  },
  {
    id: 'req-02',
    type: 'partner_application',
    requesterName: 'Vanguard Marketing Ltd',
    requesterRole: 'partner',
    title: 'New Partner Onboarding Application',
    description: 'Requesting agency account to manage video engagement campaigns and survey reviews.',
    status: 'pending',
    requestedAt: '2026-03-18 01:10 PM',
  },
  {
    id: 'req-03',
    type: 'verification',
    requesterName: 'David Miller',
    requesterRole: 'worker',
    title: 'Fast-Track ID Verification Request',
    description: 'Uploaded government ID card proof for Level 2 verification clearance.',
    status: 'approved',
    requestedAt: '2026-03-14 09:30 AM',
  },
];

const INITIAL_GAMING: GamingOffer[] = [
  {
    id: 'game-1',
    title: 'Daily Lucky Wheel',
    description: 'Spin once every 24 hours to win a guaranteed cash reward between ₹10 and ₹50 added instantly to your balance.',
    gameType: 'Daily Spin',
    rewardINR: 25,
    cooldownHours: 24,
    badge: 'Popular',
    active: true,
  },
  {
    id: 'game-2',
    title: 'Tech & Knowledge Trivia Quiz',
    description: 'Answer 3 quick digital knowledge questions correctly to claim an instant bonus reward.',
    gameType: 'Trivia Quiz',
    rewardINR: 30,
    cooldownHours: 12,
    badge: 'Skill Reward',
    active: true,
  },
  {
    id: 'game-3',
    title: 'Daily Task Streaks Master',
    description: 'Complete at least 2 tasks in a single calendar day to unlock this achievement streak bonus.',
    gameType: 'App Quest',
    rewardINR: 40,
    cooldownHours: 24,
    badge: 'Bonus Quest',
    active: true,
  },
];

const INITIAL_SETTINGS: PlatformSettings = {
  maintenanceMode: false,
  maintenanceMessage: 'System is temporarily under scheduled maintenance. Task completions are safely queued.',
  bannerBrandingText: 'Special Reward Fest 2026: Complete 3 tasks today for an extra 15% bonus credit!',
  showBanner: true,
  minWithdrawalINR: 100,
  partnerCommissionRatePercent: 12,
  autoApproveSurveys: false,
  emailNotifications: true,
  emergencyLock: false,
};

const INITIAL_USER_TRANSACTIONS: UserTransaction[] = [
  {
    id: 'tx-init-1',
    workerId: 'w-100',
    workerEid: 'EID-928410',
    workerName: 'Arati Bera',
    type: 'add',
    amountINR: 500,
    balanceBeforeINR: 950,
    balanceAfterINR: 1450,
    performedByAdmin: 'Super Admin (System)',
    reason: 'Special Campaign Verification Incentive',
    timestamp: '2026-03-20 11:30 AM',
  },
  {
    id: 'tx-init-2',
    workerId: 'w-101',
    workerEid: 'EID-849201',
    workerName: 'Alex Rivera',
    type: 'add',
    amountINR: 250,
    balanceBeforeINR: 600,
    balanceAfterINR: 850,
    performedByAdmin: 'Super Admin (Finance)',
    reason: 'QA Audit Bonus Credit',
    timestamp: '2026-03-19 03:45 PM',
  },
  {
    id: 'tx-init-3',
    workerId: 'w-101',
    workerEid: 'EID-849201',
    workerName: 'Alex Rivera',
    type: 'deduct',
    amountINR: 100,
    balanceBeforeINR: 700,
    balanceAfterINR: 600,
    performedByAdmin: 'Super Admin (Audit)',
    reason: 'Manual adjustment for duplicate task submission',
    timestamp: '2026-03-18 01:15 PM',
  },
  {
    id: 'tx-init-4',
    workerId: 'w-102',
    workerEid: 'EID-391823',
    workerName: 'Sarah Chen',
    type: 'add',
    amountINR: 1200,
    balanceBeforeINR: 1200,
    balanceAfterINR: 2400,
    performedByAdmin: 'Super Admin (Primary)',
    reason: 'Top Performer Monthly Reward',
    timestamp: '2026-03-17 04:00 PM',
  },
];

const INITIAL_ADMIN_LOGS: AdminActivityLog[] = [
  {
    id: 'alog-1',
    action: 'add_balance',
    title: 'Added ₹500 to Arati Bera',
    targetUserId: 'w-100',
    targetUserEid: 'EID-928410',
    targetUserName: 'Arati Bera',
    amountINR: 500,
    details: 'Direct balance addition of ₹500. Reason: Special Campaign Verification Incentive. Balance changed from ₹950 to ₹1,450.',
    performedByAdmin: 'Super Admin (System)',
    timestamp: '2026-03-20 11:30 AM',
  },
  {
    id: 'alog-2',
    action: 'withdrawal_approved',
    title: 'Withdrawal Approved: ₹450 for Sarah Chen',
    targetUserId: 'w-102',
    targetUserEid: 'EID-391823',
    targetUserName: 'Sarah Chen',
    amountINR: 450,
    details: 'Payout of ₹450 via UPI to sarah@icici approved and marked completed. Ref: UPI/83921049/SUCCESS.',
    performedByAdmin: 'Super Admin (Finance Desk)',
    timestamp: '2026-03-19 02:10 PM',
  },
  {
    id: 'alog-3',
    action: 'add_balance',
    title: 'Added ₹250 to Alex Rivera',
    targetUserId: 'w-101',
    targetUserEid: 'EID-849201',
    targetUserName: 'Alex Rivera',
    amountINR: 250,
    details: 'Direct balance addition of ₹250. Reason: QA Audit Bonus Credit.',
    performedByAdmin: 'Super Admin (Finance)',
    timestamp: '2026-03-19 03:45 PM',
  },
  {
    id: 'alog-4',
    action: 'deduct_balance',
    title: 'Deducted ₹100 from Alex Rivera',
    targetUserId: 'w-101',
    targetUserEid: 'EID-849201',
    targetUserName: 'Alex Rivera',
    amountINR: 100,
    details: 'Deducted ₹100 from balance. Reason: Manual adjustment for duplicate task submission. Balance updated from ₹700 to ₹600.',
    performedByAdmin: 'Super Admin (Audit)',
    timestamp: '2026-03-18 01:15 PM',
  },
  {
    id: 'alog-5',
    action: 'withdrawal_rejected',
    title: 'Withdrawal Rejected: ₹300 for Priya Sharma',
    targetUserId: 'w-103',
    targetUserEid: 'EID-729402',
    targetUserName: 'Priya Sharma',
    amountINR: 300,
    details: 'Payout request was rejected. Reason: Incorrect UPI ID formatting. Funds refunded to worker balance.',
    performedByAdmin: 'Super Admin (Finance Desk)',
    timestamp: '2026-03-17 10:20 AM',
  },
];

const INITIAL_PARTNER_LOGS: PartnerActivityLog[] = [
  {
    id: 'plog-1',
    partnerId: 'p-1',
    partnerName: 'Partner A - Apex Media',
    action: 'Task Proof Verified & Approved',
    targetUserId: 'w-100',
    targetUserEid: 'EID-928410',
    targetUserName: 'Arati Bera',
    paymentStatus: 'Approved',
    amountINR: 150,
    details: 'Verified Social Media Engagement proof. Followed brand guidelines.',
    date: '2026-03-20',
    time: '11:45 AM',
    timestamp: '2026-03-20 11:45 AM',
  },
  {
    id: 'plog-2',
    partnerId: 'p-2',
    partnerName: 'Partner B - TaskPro Partners',
    action: 'Mobile App QA Audit Review',
    targetUserId: 'w-101',
    targetUserEid: 'EID-849201',
    targetUserName: 'Alex Rivera',
    paymentStatus: 'Approved',
    amountINR: 65,
    details: 'Verified app installation and level 3 playthrough screenshot.',
    date: '2026-03-19',
    time: '04:10 PM',
    timestamp: '2026-03-19 04:10 PM',
  },
  {
    id: 'plog-3',
    partnerId: 'p-3',
    partnerName: 'Partner C - Nexus Digital',
    action: 'Research Survey Validation',
    targetUserId: 'w-102',
    targetUserEid: 'EID-391823',
    targetUserName: 'Sarah Chen',
    paymentStatus: 'Credited',
    amountINR: 95,
    details: 'Survey completion verified. Demographic requirements satisfied.',
    date: '2026-03-18',
    time: '02:30 PM',
    timestamp: '2026-03-18 02:30 PM',
  },
  {
    id: 'plog-4',
    partnerId: 'p-4',
    partnerName: 'Partner D - Vanguard Agency',
    action: 'Campaign Lead Audit',
    targetUserId: 'w-103',
    targetUserEid: 'EID-729402',
    targetUserName: 'Priya Sharma',
    paymentStatus: 'Rejected',
    amountINR: 180,
    details: 'Submission proof incomplete: Missing confirmation screenshot.',
    date: '2026-03-17',
    time: '09:50 AM',
    timestamp: '2026-03-17 09:50 AM',
  },
  {
    id: 'plog-5',
    partnerId: 'p-1',
    partnerName: 'Partner A - Apex Media',
    action: 'Brand Review Task Verification',
    targetUserId: 'w-104',
    targetUserEid: 'EID-610294',
    targetUserName: 'David Miller',
    paymentStatus: 'Pending',
    amountINR: 120,
    details: 'Submission received and placed in verification queue.',
    date: '2026-03-16',
    time: '05:15 PM',
    timestamp: '2026-03-16 05:15 PM',
  },
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'tourn-1',
    title: 'Free Fire MAX Pro Solo Blitz',
    game: 'Free Fire MAX',
    gameMode: 'Solo',
    prizePoolINR: 5000,
    firstPrizeINR: 2500,
    secondPrizeINR: 1500,
    thirdPrizeINR: 700,
    perKillINR: 50,
    entryFeeINR: 0,
    map: 'Bermuda',
    maxSlots: 48,
    registeredSlots: 38,
    registeredPlayerIds: ['w-100', 'w-101'],
    scheduleDate: '2026-10-07',
    scheduleTime: '21:00 IST',
    status: 'Registration Open',
    roomId: 'ROOM-88210',
    roomPassword: 'FF9',
    rules: 'No teaming up allowed. Emotes enabled. Gun attributes ON. Standard esports competitive loadouts.',
    createdAt: '2026-10-04 10:00 AM',
    createdBy: 'System Moderator',
  },
  {
    id: 'tourn-2',
    title: 'Grand Battle Royale Championship',
    game: 'Free Fire MAX',
    gameMode: 'Battle Royale',
    prizePoolINR: 12000,
    firstPrizeINR: 6000,
    secondPrizeINR: 3500,
    thirdPrizeINR: 1500,
    perKillINR: 40,
    entryFeeINR: 25,
    map: 'Purgatory',
    maxSlots: 48,
    registeredSlots: 42,
    registeredPlayerIds: ['w-102'],
    scheduleDate: '2026-10-08',
    scheduleTime: '18:30 IST',
    status: 'Registration Open',
    roomId: 'ROOM-94112',
    roomPassword: 'ROYAL',
    rules: 'Full map survival match. Zone shrinkage high speed. Headshot multiplier standard.',
    createdAt: '2026-10-04 11:30 AM',
    createdBy: 'System Moderator',
  },
  {
    id: 'tourn-3',
    title: 'Elite 4-Squad Clash Series',
    game: 'Free Fire MAX',
    gameMode: 'Squad',
    prizePoolINR: 15000,
    firstPrizeINR: 8000,
    secondPrizeINR: 4500,
    thirdPrizeINR: 2000,
    perKillINR: 60,
    entryFeeINR: 50,
    map: 'Kalahari',
    maxSlots: 48,
    registeredSlots: 32,
    registeredPlayerIds: [],
    scheduleDate: '2026-10-08',
    scheduleTime: '21:00 IST',
    status: 'Upcoming',
    roomId: '',
    roomPassword: '',
    rules: '4-player team coordination. Voice chat recommended. Disconnections forfeit slot.',
    createdAt: '2026-10-04 02:00 PM',
    createdBy: 'System Moderator',
  },
  {
    id: 'tourn-4',
    title: 'Iron Cage Lone Wolf Duel',
    game: 'Free Fire MAX',
    gameMode: 'Lone Wolf',
    prizePoolINR: 3000,
    firstPrizeINR: 1800,
    secondPrizeINR: 800,
    thirdPrizeINR: 400,
    perKillINR: 25,
    entryFeeINR: 0,
    map: 'Iron Cage',
    maxSlots: 16,
    registeredSlots: 14,
    registeredPlayerIds: ['w-100'],
    scheduleDate: '2026-10-09',
    scheduleTime: '19:30 IST',
    status: 'Registration Open',
    roomId: 'ROOM-55291',
    roomPassword: 'WOLF',
    rules: 'Round robin best-of-5 rounds. Weapon selection rotation per round.',
    createdAt: '2026-10-03 04:00 PM',
    createdBy: 'System Moderator',
  },
  {
    id: 'tourn-5',
    title: 'Creator Custom Craftland Showdown',
    game: 'Free Fire MAX',
    gameMode: 'Craftland',
    prizePoolINR: 8000,
    firstPrizeINR: 4500,
    secondPrizeINR: 2500,
    thirdPrizeINR: 1000,
    perKillINR: 30,
    entryFeeINR: 0,
    map: 'Custom Arena #489',
    maxSlots: 24,
    registeredSlots: 20,
    registeredPlayerIds: [],
    scheduleDate: '2026-10-10',
    scheduleTime: '20:00 IST',
    status: 'Upcoming',
    roomId: '',
    roomPassword: '',
    rules: 'Custom gravity and speed settings. Unlimited gloo walls enabled.',
    createdAt: '2026-10-04 05:00 PM',
    createdBy: 'System Moderator',
  },
  {
    id: 'tourn-6',
    title: 'Apex 1v1 Sniper Showdown',
    game: 'Free Fire MAX',
    gameMode: '1v1',
    prizePoolINR: 2000,
    firstPrizeINR: 1400,
    secondPrizeINR: 600,
    thirdPrizeINR: 0,
    perKillINR: 50,
    entryFeeINR: 0,
    map: 'Desert Duel',
    maxSlots: 8,
    registeredSlots: 7,
    registeredPlayerIds: [],
    scheduleDate: '2026-10-05',
    scheduleTime: '22:00 IST',
    status: 'Registration Open',
    roomId: 'ROOM-11029',
    roomPassword: 'ONE',
    rules: 'AWM & Barrett only. No body armor. 1-shot elimination rules.',
    createdAt: '2026-10-04 06:00 PM',
    createdBy: 'System Moderator',
  },
  {
    id: 'tourn-7',
    title: 'Duo Warfare 2v2 Tag Cup',
    game: 'Free Fire MAX',
    gameMode: '2v2',
    prizePoolINR: 4000,
    firstPrizeINR: 2400,
    secondPrizeINR: 1200,
    thirdPrizeINR: 400,
    perKillINR: 35,
    entryFeeINR: 0,
    map: 'Bermuda Mini',
    maxSlots: 16,
    registeredSlots: 12,
    registeredPlayerIds: [],
    scheduleDate: '2026-10-06',
    scheduleTime: '16:00 IST',
    status: 'Registration Open',
    roomId: 'ROOM-22941',
    roomPassword: 'DUO',
    rules: '2 players per team. Revive within 15 seconds. Zone shrinks every 60s.',
    createdAt: '2026-10-04 07:00 PM',
    createdBy: 'System Moderator',
  },
  {
    id: 'tourn-8',
    title: 'Trios Warzone 3v3 Firefight',
    game: 'Free Fire MAX',
    gameMode: '3v3',
    prizePoolINR: 6000,
    firstPrizeINR: 3500,
    secondPrizeINR: 1800,
    thirdPrizeINR: 700,
    perKillINR: 40,
    entryFeeINR: 20,
    map: 'Alpine Outpost',
    maxSlots: 24,
    registeredSlots: 18,
    registeredPlayerIds: [],
    scheduleDate: '2026-10-07',
    scheduleTime: '20:30 IST',
    status: 'Upcoming',
    roomId: '',
    roomPassword: '',
    rules: '3-member squad formation. High loot density. Classic competitive rules.',
    createdAt: '2026-10-04 08:00 PM',
    createdBy: 'System Moderator',
  },
];

export const INITIAL_TOURNAMENT_PARTICIPANTS: TournamentParticipant[] = [
  {
    id: 'tp-1',
    tournamentId: 'tourn-1',
    workerId: 'w-100',
    workerName: 'Arati Bera',
    workerUid: 'UID-928410',
    inGameName: 'Arati_SniperX',
    inGameUid: 'FF-7829104',
    registeredAt: '2026-10-04 12:15 PM',
    status: 'registered',
  },
  {
    id: 'tp-2',
    tournamentId: 'tourn-1',
    workerId: 'w-101',
    workerName: 'Alex Rivera',
    workerUid: 'UID-849201',
    inGameName: 'Alex_Rogue99',
    inGameUid: 'FF-4920183',
    registeredAt: '2026-10-04 01:20 PM',
    status: 'registered',
  },
  {
    id: 'tp-3',
    tournamentId: 'tourn-4',
    workerId: 'w-100',
    workerName: 'Arati Bera',
    workerUid: 'UID-928410',
    inGameName: 'Arati_SniperX',
    inGameUid: 'FF-7829104',
    registeredAt: '2026-10-04 03:00 PM',
    status: 'registered',
  },
];

export const INITIAL_MATCH_RESULTS: TournamentMatchResult[] = [
  {
    id: 'mr-1',
    tournamentId: 'tourn-1',
    tournamentTitle: 'Free Fire MAX Pro Solo Blitz',
    game: 'Free Fire MAX',
    gameMode: 'Solo',
    matchDate: '2026-10-04',
    matchTime: '20:00 IST',
    map: 'Bermuda',
    roomId: 'ROOM-89210',
    status: 'published',
    mvpPlayerName: 'Arati_SniperX',
    totalKills: 22,
    totalPrizeDistributedINR: 5000,
    publishedAt: '2026-10-04 09:15 PM',
    verifiedBy: 'Tournament Moderator Console',
    notes: 'Official Solo match completed. 1st place tie resolved by total kill count.',
    scores: [
      {
        participantId: 'tp-1',
        inGameName: 'Arati_SniperX',
        inGameUid: 'FF-7829104',
        workerId: 'w-100',
        workerName: 'Arati Bera',
        rank: 1,
        kills: 8,
        damage: 2850,
        placementPoints: 12,
        killPoints: 8,
        totalPoints: 20,
        prizeWonINR: 2900,
        isMvp: true,
      },
      {
        participantId: 'tp-2',
        inGameName: 'Alex_Rogue99',
        inGameUid: 'FF-4920183',
        workerId: 'w-101',
        workerName: 'Alex Rivera',
        rank: 2,
        kills: 5,
        damage: 1940,
        placementPoints: 9,
        killPoints: 5,
        totalPoints: 14,
        prizeWonINR: 1750,
      },
      {
        participantId: 'tp-guest-3',
        inGameName: 'ShadowViper',
        inGameUid: 'FF-9201948',
        workerId: 'w-103',
        workerName: 'Priya Sharma',
        rank: 3,
        kills: 4,
        damage: 1620,
        placementPoints: 8,
        killPoints: 4,
        totalPoints: 12,
        prizeWonINR: 900,
      },
      {
        participantId: 'tp-guest-4',
        inGameName: 'VenomStrike',
        inGameUid: 'FF-1039485',
        workerId: 'w-104',
        workerName: 'Rahul Verma',
        rank: 4,
        kills: 3,
        damage: 1210,
        placementPoints: 7,
        killPoints: 3,
        totalPoints: 10,
        prizeWonINR: 150,
      },
      {
        participantId: 'tp-guest-5',
        inGameName: 'CyberNinja',
        inGameUid: 'FF-8837190',
        workerId: 'w-105',
        workerName: 'Deepak Rao',
        rank: 5,
        kills: 2,
        damage: 980,
        placementPoints: 6,
        killPoints: 2,
        totalPoints: 8,
        prizeWonINR: 100,
      },
    ],
  },
  {
    id: 'mr-2',
    tournamentId: 'tourn-3',
    tournamentTitle: 'Lone Wolf Iron Cage Showdown',
    game: 'Free Fire MAX',
    gameMode: 'Lone Wolf',
    matchDate: '2026-10-03',
    matchTime: '18:00 IST',
    map: 'Iron Cage',
    roomId: 'ROOM-49102',
    status: 'published',
    mvpPlayerName: 'TitanHunter',
    totalKills: 16,
    totalPrizeDistributedINR: 3000,
    publishedAt: '2026-10-03 07:10 PM',
    verifiedBy: 'Tournament Moderator Console',
    notes: 'Intense 1v1 duel bracket. All rounds recorded and verified.',
    scores: [
      {
        participantId: 'tp-lw-1',
        inGameName: 'TitanHunter',
        inGameUid: 'FF-6629104',
        workerId: 'w-106',
        workerName: 'Vikram Joshi',
        rank: 1,
        kills: 9,
        damage: 3400,
        placementPoints: 12,
        killPoints: 9,
        totalPoints: 21,
        prizeWonINR: 1800,
        isMvp: true,
      },
      {
        participantId: 'tp-lw-2',
        inGameName: 'StormBreaker',
        inGameUid: 'FF-5510294',
        workerId: 'w-107',
        workerName: 'Amit Patel',
        rank: 2,
        kills: 7,
        damage: 2900,
        placementPoints: 9,
        killPoints: 7,
        totalPoints: 16,
        prizeWonINR: 1200,
      },
    ],
  },
];

export const INITIAL_SUPPORT_TICKETS: TournamentSupportTicket[] = [
  {
    id: 'tick-1',
    ticketNumber: 'TICK-8021',
    workerId: 'w-100',
    workerName: 'Arati Bera',
    workerUid: 'UID-928410',
    inGameName: 'Arati_SniperX',
    inGameUid: 'FF-7829104',
    tournamentId: 'tourn-1',
    tournamentTitle: 'Free Fire MAX Pro Solo Blitz',
    category: 'score_dispute',
    priority: 'high',
    status: 'open',
    subject: 'Score update discrepancy near Clock Tower zone',
    description: 'In round 3 I eliminated two players with AWM near Clock Tower, but interim scorecard showed 6 kills instead of 8. Requesting score verification from match recording.',
    createdAt: '2026-10-05 06:30 AM',
    updatedAt: '2026-10-05 06:30 AM',
  },
  {
    id: 'tick-2',
    ticketNumber: 'TICK-8022',
    workerId: 'w-101',
    workerName: 'Alex Rivera',
    workerUid: 'UID-849201',
    inGameName: 'Alex_Rogue99',
    inGameUid: 'FF-4920183',
    tournamentId: 'tourn-1',
    tournamentTitle: 'Free Fire MAX Pro Solo Blitz',
    category: 'room_issue',
    priority: 'medium',
    status: 'resolved',
    subject: 'Room password release notification delay',
    description: 'The room password was marked hidden until 8 minutes before match start which caused me to join the custom lobby late.',
    moderatorReply: 'Reviewed lobby logs. The password publish was delayed by 3 minutes due to server re-check. Issue resolved and ₹50 goodwill bonus credited.',
    moderatorNotes: 'Player verified in lobby. Compensation of ₹50 approved.',
    compensationINR: 50,
    createdAt: '2026-10-04 07:55 PM',
    updatedAt: '2026-10-04 08:30 PM',
    resolvedAt: '2026-10-04 08:30 PM',
  },
  {
    id: 'tick-3',
    ticketNumber: 'TICK-8023',
    workerId: 'w-103',
    workerName: 'Priya Sharma',
    workerUid: 'UID-902194',
    inGameName: 'ShadowViper',
    inGameUid: 'FF-9201948',
    tournamentId: 'tourn-1',
    tournamentTitle: 'Free Fire MAX Pro Solo Blitz',
    category: 'prize_payout',
    priority: 'urgent',
    status: 'in_progress',
    subject: 'Confirmation of ₹900 prize deposit for 3rd place',
    description: 'I finished 3rd rank with 4 kills in Solo Blitz. Requesting confirmation if the ₹900 prize has been processed to my in-app INR wallet.',
    moderatorNotes: 'Verifying transaction ledger tx-tourn-payout-3.',
    createdAt: '2026-10-05 07:15 AM',
    updatedAt: '2026-10-05 07:40 AM',
  },
  {
    id: 'tick-4',
    ticketNumber: 'TICK-8024',
    workerId: 'w-104',
    workerName: 'Rahul Verma',
    workerUid: 'UID-103948',
    inGameName: 'VenomStrike',
    inGameUid: 'FF-1039485',
    tournamentId: 'tourn-2',
    tournamentTitle: 'Squad Domination Championship',
    category: 'cheating_report',
    priority: 'high',
    status: 'open',
    subject: 'Suspected speed hack in Squad match lobby #2',
    description: 'Player opponent team member was moving unusually fast through Pochinok buildings without vehicle. Requesting spectator clip review.',
    createdAt: '2026-10-05 08:00 AM',
    updatedAt: '2026-10-05 08:00 AM',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load or fallback
  const [currentRole, setCurrentRole] = useState<Role>('worker');
  const [selectedPartnerName, setSelectedPartnerName] = useState<string>('Partner A - Apex Media');

  // Role Security PINs (No default/placeholder PINs; must be set uniquely by administrator)
  const [roleSecurityPins, setRoleSecurityPins] = useState<RoleSecurityPins>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_role_pins');
      if (stored) {
        const parsed = JSON.parse(stored);
        const cleanPanelPins: Record<string, string> = {};
        if (parsed.partnerPanelPins && typeof parsed.partnerPanelPins === 'object') {
          Object.entries(parsed.partnerPanelPins).forEach(([k, v]) => {
            const str = String(v).trim();
            if (str && !LEGACY_DEFAULT_PINS.has(str)) {
              cleanPanelPins[k] = str;
            }
          });
        }
        const adminPin = parsed.adminPin && !LEGACY_DEFAULT_PINS.has(parsed.adminPin) ? parsed.adminPin : '';
        const moderatorPin = parsed.moderatorPin && !LEGACY_DEFAULT_PINS.has(parsed.moderatorPin) ? parsed.moderatorPin : '';
        const partnerPin = parsed.partnerPin && !LEGACY_DEFAULT_PINS.has(parsed.partnerPin) ? parsed.partnerPin : '';

        return {
          adminPin,
          moderatorPin,
          partnerPin,
          partnerPanelPins: cleanPanelPins,
        };
      }
      return DEFAULT_ROLE_PINS;
    } catch {
      return DEFAULT_ROLE_PINS;
    }
  });

  const [isAppSidebarOpen, setIsAppSidebarOpen] = useState<boolean>(false);

  const updateRolePin = (role: 'admin' | 'moderator' | 'partner' | string, newPin: string) => {
    const clean = newPin.trim();
    if (!clean) return;
    if (LEGACY_DEFAULT_PINS.has(clean)) {
      notify('Default/placeholder PINs are prohibited. Please choose a unique custom PIN.');
      return;
    }
    setRoleSecurityPins((prev) => {
      let updated: RoleSecurityPins;
      if (role === 'admin') {
        updated = { ...prev, adminPin: clean };
      } else if (role === 'moderator') {
        updated = { ...prev, moderatorPin: clean };
      } else if (role === 'partner') {
        updated = { ...prev, partnerPin: clean };
      } else {
        updated = {
          ...prev,
          partnerPanelPins: { ...prev.partnerPanelPins, [role]: clean },
        };
      }
      try {
        localStorage.setItem(STORAGE_KEY + '_role_pins', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });
    notify(`Security PIN for ${role.toUpperCase()} updated.`);
  };

  const resetRolePins = () => {
    setRoleSecurityPins((prev) => {
      // Preserves administrator's custom PIN while clearing all role PINs to empty.
      // No default/placeholder PINs exist.
      const updated: RoleSecurityPins = {
        adminPin: prev.adminPin || '',
        moderatorPin: '',
        partnerPin: '',
        partnerPanelPins: {},
      };
      try {
        localStorage.setItem(STORAGE_KEY + '_role_pins', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });
    notify('Role PINs cleared. No default PINs exist; set unique custom PINs as required.');
  };

  const verifyAdminPin = (pin: string): boolean => {
    const clean = pin.trim();
    if (!roleSecurityPins.adminPin || LEGACY_DEFAULT_PINS.has(clean)) return false;
    return clean === roleSecurityPins.adminPin;
  };

  const verifyModeratorPin = (pin: string): boolean => {
    const clean = pin.trim();
    if (!roleSecurityPins.moderatorPin || LEGACY_DEFAULT_PINS.has(clean)) return false;
    return clean === roleSecurityPins.moderatorPin;
  };

  const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
  const [pendingRole, setPendingRole] = useState<'admin' | 'partner' | null>(null);
  const [pendingPartnerPanel, setPendingPartnerPanel] = useState<PartnerPanelCode | null>(null);
  const [partnerStep, setPartnerStep] = useState<'select' | 'name' | 'pin'>('select');
  const [enteredPartnerName, setEnteredPartnerName] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const requestRoleChange = (role: Role, panelCode?: PartnerPanelCode) => {
    if (role === 'worker') {
      setCurrentRole('worker');
      closePinModal();
      return;
    }

    if (role === 'admin') {
      setPendingRole('admin');
      setPendingPartnerPanel(null);
      setPartnerStep('pin');
      setPinError(null);
      setPinModalOpen(true);
      return;
    }

    if (role === 'partner') {
      setPendingRole('partner');
      setPendingPartnerPanel(panelCode || null);
      setPartnerStep('pin');
      setPinError(null);
      setPinModalOpen(true);
      return;
    }
  };

  const selectPartnerPanelToVerify = (panelCode: PartnerPanelCode) => {
    setPendingRole('partner');
    setPendingPartnerPanel(panelCode);
    setPartnerStep('pin');
    setEnteredPartnerName('');
    setPinError(null);
    setPinModalOpen(true);
  };

  const submitPartnerName = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      setPinError('Please enter your partner name.');
      return false;
    }
    setEnteredPartnerName(trimmed);
    setPinError(null);
    setPartnerStep('pin');
    return true;
  };

  const verifyPin = (enteredPin: string): boolean => {
    const cleanPin = enteredPin.trim();

    if (pendingRole === 'admin') {
      if (!roleSecurityPins.adminPin) {
        setPinError('No custom Admin PIN set. Administrator must initialize a custom PIN first.');
        return false;
      }
      if (cleanPin === '1115') {
        setPinError('Default PIN "1115" is eliminated. Enter your custom Administrator PIN.');
        return false;
      }
      if (cleanPin === roleSecurityPins.adminPin) {
        setCurrentRole('admin');
        closePinModal();
        return true;
      } else {
        setPinError('Incorrect custom PIN. Access denied.');
        return false;
      }
    }

    if (pendingRole === 'partner') {
      if (LEGACY_DEFAULT_PINS.has(cleanPin)) {
        setPinError('Default/placeholder PINs are eliminated. Authentication requires the custom PIN configured by the administrator.');
        return false;
      }

      // Check panel-specific custom PIN or global partner PIN set by administrator
      const panelSpecificPin = pendingPartnerPanel ? roleSecurityPins.partnerPanelPins?.[pendingPartnerPanel] : null;
      const expectedPin = panelSpecificPin || roleSecurityPins.partnerPin;

      if (!expectedPin) {
        setPinError('No custom PIN configured for this partner agency. Administrator must set a unique PIN in Admin Console > Security.');
        return false;
      }

      const isCorrectPartnerPin = cleanPin === expectedPin;

      if (isCorrectPartnerPin) {
        if (pendingPartnerPanel) {
          const target = PARTNER_PANELS.find((p) => p.code === pendingPartnerPanel);
          if (target) setSelectedPartnerName(target.uniquePartnerName);
        }
        setCurrentRole('partner');
        closePinModal();
        return true;
      } else {
        setPinError('Incorrect custom PIN. Access denied.');
        return false;
      }
    }

    return false;
  };

  const closePinModal = () => {
    setPinModalOpen(false);
    setPendingRole(null);
    setPendingPartnerPanel(null);
    setPartnerStep('select');
    setEnteredPartnerName('');
    setPinError(null);
  };

  const [adminSidebarOption, setAdminSidebarOption] = useState<AdminSidebarOption>('Active');
  const [partnerTab, setPartnerTab] = useState<PartnerTab>('Assign Requests');
  const [workerTab, setWorkerTab] = useState<WorkerTab>('Home');

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_tasks');
      return stored ? JSON.parse(stored) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_submissions');
      return stored ? JSON.parse(stored) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_withdrawals');
      return stored ? JSON.parse(stored) : INITIAL_WITHDRAWALS;
    } catch {
      return INITIAL_WITHDRAWALS;
    }
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_partners');
      if (!stored) return INITIAL_PARTNERS;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length < 4) {
        return INITIAL_PARTNERS;
      }
      return parsed;
    } catch {
      return INITIAL_PARTNERS;
    }
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_workers');
      if (!stored) return INITIAL_WORKERS;
      let parsed: Worker[] = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_WORKERS;

      // Filter out demo/sample accounts (@example.com and demo IDs w-101..w-104)
      const realAccounts = parsed.filter((w) => {
        if (!w || !w.email) return false;
        const lowerEmail = w.email.toLowerCase();
        if (lowerEmail.endsWith('@example.com')) return false;
        if (['w-101', 'w-102', 'w-103', 'w-104'].includes(w.id)) return false;
        return true;
      });

      // Keep all real parsed users intact without mutating existing user data
      const existingIds = new Set<string>();
      const existingEmails = new Set<string>();
      realAccounts.forEach((w) => {
        if (w.id) existingIds.add(w.id.toUpperCase());
        if (w.email) existingEmails.add(w.email.toLowerCase());
        if (w.googleAccount?.email) existingEmails.add(w.googleAccount.email.toLowerCase());
      });

      const mergedList: Worker[] = realAccounts.length > 0 ? [...realAccounts] : [...INITIAL_WORKERS];

      // Ensure default initial real worker (Arati Bera w-100) is included if missing
      INITIAL_WORKERS.forEach((initWorker) => {
        const alreadyInList =
          existingIds.has(initWorker.id.toUpperCase()) ||
          existingEmails.has(initWorker.email.toLowerCase()) ||
          (initWorker.googleAccount && existingEmails.has(initWorker.googleAccount.email.toLowerCase()));

        if (!alreadyInList) {
          mergedList.push(initWorker);
          existingIds.add(initWorker.id.toUpperCase());
          existingEmails.add(initWorker.email.toLowerCase());
        }
      });

      // Ensure every user has both uniqueUserId and matching eid without overwriting valid existing values
      // And initialize Available Balance and Lifetime Earnings to zero for all users as requested
      const cleaned = mergedList.map((w) => {
        const uId = w.uniqueUserId || `UID-${w.id.replace(/\D/g, '') || Math.floor(100000 + Math.random() * 900000)}`;
        const eId = w.eid || uId.replace('UID-', 'EID-');
        return {
          ...w,
          uniqueUserId: uId,
          eid: eId,
          availableBalanceINR: 0,
          totalEarnedINR: 0,
        };
      });

      try {
        localStorage.setItem(STORAGE_KEY + '_workers', JSON.stringify(cleaned));
      } catch (err) {
        console.error('Storage sync error:', err);
      }
      return cleaned;
    } catch {
      return INITIAL_WORKERS;
    }
  });

  const [secretVouchers, setSecretVouchers] = useState<SecretVoucher[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_vouchers');
      return stored ? JSON.parse(stored) : INITIAL_VOUCHERS;
    } catch {
      return INITIAL_VOUCHERS;
    }
  });

  const [partnerUploads, setPartnerUploads] = useState<PartnerUpload[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_uploads');
      return stored ? JSON.parse(stored) : INITIAL_UPLOADS;
    } catch {
      return INITIAL_UPLOADS;
    }
  });

  const [systemRequests, setSystemRequests] = useState<SystemRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_requests');
      return stored ? JSON.parse(stored) : INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  });

  const [gamingOffers, setGamingOffers] = useState<GamingOffer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_gaming');
      return stored ? JSON.parse(stored) : INITIAL_GAMING;
    } catch {
      return INITIAL_GAMING;
    }
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_settings');
      return stored ? JSON.parse(stored) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_transactions');
      return stored ? JSON.parse(stored) : INITIAL_USER_TRANSACTIONS;
    } catch {
      return INITIAL_USER_TRANSACTIONS;
    }
  });

  const [adminActivityLogs, setAdminActivityLogs] = useState<AdminActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_admin_logs');
      return stored ? JSON.parse(stored) : INITIAL_ADMIN_LOGS;
    } catch {
      return INITIAL_ADMIN_LOGS;
    }
  });

  const [partnerActivityLogs, setPartnerActivityLogs] = useState<PartnerActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_partner_logs');
      return stored ? JSON.parse(stored) : INITIAL_PARTNER_LOGS;
    } catch {
      return INITIAL_PARTNER_LOGS;
    }
  });

  const logAdminActivity = (log: Omit<AdminActivityLog, 'id' | 'timestamp'>) => {
    const newEntry: AdminActivityLog = {
      ...log,
      id: `alog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setAdminActivityLogs((prev) => [newEntry, ...prev]);
  };

  const logPartnerActivity = (log: Omit<PartnerActivityLog, 'id' | 'timestamp' | 'date' | 'time'>) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newEntry: PartnerActivityLog = {
      ...log,
      id: `plog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: dateStr,
      time: timeStr,
      timestamp: `${dateStr} ${timeStr}`,
    };
    setPartnerActivityLogs((prev) => [newEntry, ...prev]);
  };

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_tournaments');
      return stored ? JSON.parse(stored) : INITIAL_TOURNAMENTS;
    } catch {
      return INITIAL_TOURNAMENTS;
    }
  });

  const [tournamentParticipants, setTournamentParticipants] = useState<TournamentParticipant[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_tourn_participants');
      return stored ? JSON.parse(stored) : INITIAL_TOURNAMENT_PARTICIPANTS;
    } catch {
      return INITIAL_TOURNAMENT_PARTICIPANTS;
    }
  });

  const [matchResults, setMatchResults] = useState<TournamentMatchResult[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_match_results');
      return stored ? JSON.parse(stored) : INITIAL_MATCH_RESULTS;
    } catch {
      return INITIAL_MATCH_RESULTS;
    }
  });

  const [supportTickets, setSupportTickets] = useState<TournamentSupportTicket[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_support_tickets');
      return stored ? JSON.parse(stored) : INITIAL_SUPPORT_TICKETS;
    } catch {
      return INITIAL_SUPPORT_TICKETS;
    }
  });

  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_deposit_requests');
      return stored ? JSON.parse(stored) : INITIAL_DEPOSIT_REQUESTS;
    } catch {
      return INITIAL_DEPOSIT_REQUESTS;
    }
  });

  const [isModeratorUnlocked, setIsModeratorUnlockedState] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('taskflow_moderator_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const setIsModeratorUnlocked = (unlocked: boolean) => {
    setIsModeratorUnlockedState(unlocked);
    try {
      sessionStorage.setItem('taskflow_moderator_unlocked', unlocked ? 'true' : 'false');
    } catch {
      // ignore
    }
  };

  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);
  const isCloudInitializedRef = useRef<boolean>(false);

  // Validate Firestore connection and subscribe to collections
  useEffect(() => {
    let isSubscribed = true;

    testConnection()
      .then((connected) => {
        if (isSubscribed) {
          setIsFirestoreConnected(connected);
        }
      })
      .catch(() => {
        if (isSubscribed) {
          setIsFirestoreConnected(false);
        }
      });

    // Real-time listener for Workers
    const unsubWorkers = subscribeToCollection<Worker>('workers', (cloudWorkers) => {
      if (cloudWorkers && cloudWorkers.length > 0) {
        setWorkers((prev) => {
          const workerMap = new Map<string, Worker>();
          cloudWorkers.forEach((w) => {
            if (w && w.id && w.email) {
              workerMap.set(w.id, w);
            }
          });
          prev.forEach((w) => {
            if (!workerMap.has(w.id)) {
              const hasCloudEmailMatch = cloudWorkers.some((cw) => cw.email?.toLowerCase() === w.email?.toLowerCase());
              if (!hasCloudEmailMatch) {
                workerMap.set(w.id, w);
              }
            }
          });
          return Array.from(workerMap.values());
        });
      }
    });

    // Real-time listener for Tasks
    const unsubTasks = subscribeToCollection<Task>('tasks', (cloudTasks) => {
      if (cloudTasks && cloudTasks.length > 0) {
        setTasks(cloudTasks);
      } else if (!isCloudInitializedRef.current) {
        tasks.forEach((t) => saveDocument('tasks', t));
      }
    });

    // Real-time listener for Submissions
    const unsubSubs = subscribeToCollection<Submission>('submissions', (cloudSubs) => {
      if (cloudSubs && cloudSubs.length > 0) {
        setSubmissions(cloudSubs);
      }
    });

    // Real-time listener for Withdrawals
    const unsubWithdrawals = subscribeToCollection<WithdrawalRequest>('withdrawals', (cloudWiths) => {
      if (cloudWiths && cloudWiths.length > 0) {
        setWithdrawals(cloudWiths);
      }
    });

    // Real-time listener for Vouchers
    const unsubVouchers = subscribeToCollection<SecretVoucher>('vouchers', (cloudV) => {
      if (cloudV && cloudV.length > 0) {
        setSecretVouchers(cloudV);
      }
    });

    // Real-time listener for Tournaments
    const unsubTournaments = subscribeToCollection<Tournament>('tournaments', (cloudTourns) => {
      if (cloudTourns && cloudTourns.length > 0) {
        setTournaments(cloudTourns);
      } else if (!isCloudInitializedRef.current) {
        tournaments.forEach((t) => saveDocument('tournaments', t).catch(() => {}));
      }
    });

    // Real-time listener for Tournament Participants
    const unsubParticipants = subscribeToCollection<TournamentParticipant>('tournamentParticipants', (cloudParts) => {
      if (cloudParts && cloudParts.length > 0) {
        setTournamentParticipants(cloudParts);
      }
    });

    isCloudInitializedRef.current = true;

    return () => {
      isSubscribed = false;
      unsubWorkers();
      unsubTasks();
      unsubSubs();
      unsubWithdrawals();
      unsubVouchers();
      unsubTournaments();
      unsubParticipants();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_tasks', JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEY + '_submissions', JSON.stringify(submissions));
      localStorage.setItem(STORAGE_KEY + '_withdrawals', JSON.stringify(withdrawals));
      localStorage.setItem(STORAGE_KEY + '_partners', JSON.stringify(partners));
      localStorage.setItem(STORAGE_KEY + '_workers', JSON.stringify(workers));
      localStorage.setItem(STORAGE_KEY + '_vouchers', JSON.stringify(secretVouchers));
      localStorage.setItem(STORAGE_KEY + '_uploads', JSON.stringify(partnerUploads));
      localStorage.setItem(STORAGE_KEY + '_requests', JSON.stringify(systemRequests));
      localStorage.setItem(STORAGE_KEY + '_gaming', JSON.stringify(gamingOffers));
      localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEY + '_tournaments', JSON.stringify(tournaments));
      localStorage.setItem(STORAGE_KEY + '_tourn_participants', JSON.stringify(tournamentParticipants));
      localStorage.setItem(STORAGE_KEY + '_transactions', JSON.stringify(userTransactions));
      localStorage.setItem(STORAGE_KEY + '_admin_logs', JSON.stringify(adminActivityLogs));
      localStorage.setItem(STORAGE_KEY + '_partner_logs', JSON.stringify(partnerActivityLogs));
    } catch (e) {
      console.error('Storage sync error:', e);
    }
  }, [tasks, submissions, withdrawals, partners, workers, secretVouchers, partnerUploads, systemRequests, gamingOffers, settings, userTransactions, adminActivityLogs, partnerActivityLogs]);

  const notify = (msg: string) => {
    setNotificationMessage(msg);
  };

  const clearNotification = () => {
    setNotificationMessage(null);
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const storedAuth =
        localStorage.getItem(STORAGE_KEY + '_isAuthenticated') === 'true' ||
        sessionStorage.getItem(STORAGE_KEY + '_isAuthenticated') === 'true';
      const storedActiveId = localStorage.getItem(STORAGE_KEY + '_activeWorkerId');
      // Session persistence: if authenticated and active worker ID is stored, resume session
      return storedAuth && !!storedActiveId;
    } catch {
      return false;
    }
  });

  const logout = () => {
    try {
      signOut(auth).catch((err) => console.warn('Firebase signOut error:', err));
      sessionStorage.removeItem(STORAGE_KEY + '_isAuthenticated');
      localStorage.removeItem(STORAGE_KEY + '_isAuthenticated');
      localStorage.removeItem(STORAGE_KEY + '_activeWorkerId');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    setActiveWorkerId('');
    setCurrentRole('worker');
    notify('Successfully signed out.');
  };

  const [activeWorkerId, setActiveWorkerId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_activeWorkerId');
      if (stored && !['w-101', 'w-102', 'w-103', 'w-104'].includes(stored)) {
        return stored;
      }
      return auth.currentUser?.uid || '';
    } catch {
      return '';
    }
  });

  const loginUser = async (email: string): Promise<{ success: boolean; worker?: Worker; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    let existing = workers.find(
      (w) =>
        w.email.toLowerCase() === cleanEmail ||
        (w.googleAccount && w.googleAccount.email.toLowerCase() === cleanEmail)
    );

    // If not found in current React state, query Firestore workers collection directly
    if (!existing) {
      try {
        const cloudWorkers = await fetchCollection<Worker>('workers');
        const match = cloudWorkers.find(
          (w) =>
            w.email?.toLowerCase() === cleanEmail ||
            (w.googleAccount && w.googleAccount.email.toLowerCase() === cleanEmail)
        );
        if (match) {
          existing = match;
          setWorkers((prev) => {
            if (prev.some((w) => w.id === match.id)) return prev;
            return [...prev, match];
          });
        }
      } catch (err) {
        console.warn('Firestore fetchCollection error in loginUser:', err);
      }
    }

    if (!existing) {
      return {
        success: false,
        message: 'No registered user found with this email. Please sign up to create your account.',
      };
    }

    if (auth.currentUser?.uid) {
      const syncRes = await syncWorkerRecordWithUid(auth.currentUser.uid, cleanEmail, existing.name);
      return { success: true, worker: syncRes.worker, message: 'Login successful' };
    }

    setIsAuthenticated(true);
    setActiveWorkerId(existing.id);
    try {
      localStorage.setItem(STORAGE_KEY + '_isAuthenticated', 'true');
      sessionStorage.setItem(STORAGE_KEY + '_isAuthenticated', 'true');
      localStorage.setItem(STORAGE_KEY + '_activeWorkerId', existing.id);
    } catch (e) {
      console.error(e);
    }
    notify(`Welcome back, ${existing.name}!`);
    return { success: true, worker: existing, message: 'Login successful' };
  };

  const [googleAuthModalOpen, setGoogleAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_activeWorkerId', activeWorkerId);
    } catch (e) {
      console.error(e);
    }
  }, [activeWorkerId]);

  // Primary active profiles
  const currentWorker =
    workers.find((w) => w.id === activeWorkerId || w.uniqueUserId === activeWorkerId) ||
    workers.find((w) => auth.currentUser?.uid && w.id === auth.currentUser.uid) ||
    workers[0] ||
    INITIAL_WORKERS[0];
  const currentPartner = partners.find((p) => isPartnerMatch(p.name, selectedPartnerName)) || partners[0];

  const inFlightSyncRef = useRef<{
    [uid: string]: Promise<{ worker: Worker; isNewUser: boolean; uniqueUserId: string }> | undefined;
  }>({});

  const syncWorkerRecordWithUid = async (
    targetUid: string,
    cleanEmail: string,
    cleanName: string,
    avatarUrl?: string
  ): Promise<{ worker: Worker; isNewUser: boolean; uniqueUserId: string }> => {
    if (!targetUid) {
      throw new Error('Target UID is required to sync worker record.');
    }

    // Reuse in-flight synchronization for this UID if already executing
    const existingSync = inFlightSyncRef.current[targetUid];
    if (existingSync) {
      return existingSync;
    }

    const syncPromise = (async () => {
      // 1. Direct check in Firestore for workers/{targetUid}
      let directDoc: Worker | null = null;
      try {
        directDoc = await getSingleDocument<Worker>('workers', targetUid);
      } catch (e) {
        console.warn('Direct doc lookup notice:', e);
      }

      // Check matching local worker
      const localMatch = workers.find(
        (w) =>
          w.id === targetUid ||
          (cleanEmail && w.email && w.email.toLowerCase() === cleanEmail) ||
          (cleanEmail && w.googleAccount && w.googleAccount.email?.toLowerCase() === cleanEmail)
      );

      const existingData = directDoc || localMatch;
      const isNew = !existingData;
      const assignedUniqueId =
        existingData?.uniqueUserId || generateUniqueUserId(workers);
      const assignedEid =
        existingData?.eid || assignedUniqueId.replace('UID-', 'EID-');

      const authoritativeWorker: Worker = {
        id: targetUid, // Exactly the authenticated user's UID as doc ID: workers/{authenticatedUserUID}
        uniqueUserId: assignedUniqueId,
        eid: assignedEid,
        name: cleanName || existingData?.name || (cleanEmail ? cleanEmail.split('@')[0] : 'TaskFlow Worker'),
        email: cleanEmail || existingData?.email || '',
        phone: existingData?.phone || '+91 9' + Math.floor(10000000 + Math.random() * 90000000),
        availableBalanceINR:
          existingData?.availableBalanceINR !== undefined ? existingData.availableBalanceINR : 0,
        totalEarnedINR:
          existingData?.totalEarnedINR !== undefined ? existingData.totalEarnedINR : 0,
        completedTasksCount: existingData?.completedTasksCount ?? 0,
        status: existingData?.status || 'Active',
        joinedDate: existingData?.joinedDate || new Date().toISOString().split('T')[0],
        upiId: existingData?.upiId || '',
        avatarUrl:
          avatarUrl ||
          existingData?.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail || targetUid)}`,
        googleAccount: {
          email: cleanEmail || existingData?.email || '',
          name: cleanName || existingData?.name || (cleanEmail ? cleanEmail.split('@')[0] : 'Worker'),
          googleId: targetUid,
          avatarUrl:
            avatarUrl ||
            existingData?.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail || targetUid)}`,
          signedInAt: new Date().toLocaleString(),
        },
      };

      // 2. Persist to Firestore: create or update EXACTLY ONE document using authenticated user's UID: workers/{targetUid}
      await saveDocument('workers', authoritativeWorker);
      console.log(`[Firestore] Worker document successfully created/updated at workers/${targetUid}`);

      // 3. Asynchronously remove any legacy duplicate documents in Firestore with another ID for this email
      if (cleanEmail) {
        fetchCollection<Worker>('workers').then((cloudWorkers) => {
          for (const docItem of cloudWorkers) {
            if (docItem.id && docItem.id !== targetUid) {
              const matchesEmail =
                (docItem.email && docItem.email.toLowerCase() === cleanEmail) ||
                (docItem.googleAccount && docItem.googleAccount.email?.toLowerCase() === cleanEmail);
              if (matchesEmail) {
                console.log(`[Deduplication] Removing obsolete duplicate worker doc: ${docItem.id} in favor of UID ${targetUid}`);
                removeDocument('workers', docItem.id).catch((e) => console.warn('Error removing duplicate:', e));
              }
            }
          }
        }).catch((err) => console.warn('Background cleanup notice:', err));
      }

      // 4. Update local React state without duplicates
      setWorkers((prev) => {
        const cleanList = prev.filter(
          (w) =>
            w.id !== targetUid &&
            (cleanEmail ? w.email?.toLowerCase() !== cleanEmail : true) &&
            (cleanEmail ? (!w.googleAccount || w.googleAccount.email?.toLowerCase() !== cleanEmail) : true)
        );
        return [authoritativeWorker, ...cleanList];
      });

      // 5. Update session storage and active worker
      try {
        localStorage.setItem(STORAGE_KEY + '_activeWorkerId', targetUid);
        localStorage.setItem(STORAGE_KEY + '_isAuthenticated', 'true');
        sessionStorage.setItem(STORAGE_KEY + '_isAuthenticated', 'true');
      } catch (err) {
        console.error('Storage sync error:', err);
      }
      setActiveWorkerId(targetUid);
      setIsAuthenticated(true);
      setGoogleAuthModalOpen(false);

      if (isNew) {
        logAdminActivity({
          action: 'other',
          title: `New User Registered: ${authoritativeWorker.name}`,
          targetUserId: authoritativeWorker.id,
          targetUserEid: authoritativeWorker.eid,
          targetUserName: authoritativeWorker.name,
          amountINR: 150,
          details: `New user successfully registered: User ID ${authoritativeWorker.uniqueUserId} / E-ID ${authoritativeWorker.eid} (UID: ${targetUid}). Welcome credit ₹150.`,
          performedByAdmin: 'Auth System',
        });
        notify(
          `Welcome to TaskFlow! Verified User ID: ${assignedUniqueId} (E-ID: ${assignedEid})`
        );
      } else {
        notify(
          `Signed in as ${authoritativeWorker.name} (${cleanEmail || assignedUniqueId}). User ID: ${assignedUniqueId}`
        );
      }

      return {
        worker: authoritativeWorker,
        isNewUser: isNew,
        uniqueUserId: assignedUniqueId,
      };
    })();

    inFlightSyncRef.current[targetUid] = syncPromise;
    try {
      return await syncPromise;
    } finally {
      delete inFlightSyncRef.current[targetUid];
    }
  };

  const loginWithGoogle = async (profile?: {
    email?: string;
    name?: string;
    avatarUrl?: string;
    googleId?: string;
  }): Promise<{ worker: Worker; isNewUser: boolean; uniqueUserId: string }> => {
    let cleanEmail = profile?.email?.trim().toLowerCase();
    let cleanName = profile?.name?.trim();
    let avatarUrl = profile?.avatarUrl;
    let authUid = profile?.googleId || auth.currentUser?.uid;

    // Trigger Firebase Auth Google popup if no direct profile was provided
    if (!cleanEmail) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        authUid = fbUser.uid;
        cleanEmail = (fbUser.email || '').toLowerCase();
        cleanName = fbUser.displayName || cleanEmail.split('@')[0];
        avatarUrl = fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`;
      } catch (authErr: any) {
        console.warn('Firebase Google Auth:', authErr);
        if (authErr?.code === 'auth/popup-closed-by-user' || authErr?.code === 'auth/cancelled-popup-request') {
          throw new Error('Google sign-in was cancelled.');
        }
        throw authErr;
      }
    }

    const finalUid = authUid || auth.currentUser?.uid || (cleanEmail ? `uid_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : `uid_${Date.now()}`);
    cleanName = cleanName || (cleanEmail ? cleanEmail.split('@')[0] : 'Worker');
    avatarUrl = avatarUrl || (cleanEmail ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}` : undefined);

    return await syncWorkerRecordWithUid(finalUid, cleanEmail || '', cleanName, avatarUrl);
  };

  // Firebase Auth State Listener for persistent session and zero-duplicate UID synchronization
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.uid) {
        const cleanEmail = (fbUser.email || '').trim().toLowerCase();
        const cleanName = fbUser.displayName?.trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'TaskFlow Worker');
        const avatarUrl = fbUser.photoURL || (cleanEmail ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}` : undefined);
        try {
          await syncWorkerRecordWithUid(fbUser.uid, cleanEmail, cleanName, avatarUrl);
        } catch (err) {
          console.warn('Auth state auto-sync notice:', err);
        }
      }
    });

    return () => unsubAuth();
  }, []);

  const registerUser = async (profile: {
    email: string;
    name?: string;
    phone?: string;
    avatarUrl?: string;
    password?: string;
  }): Promise<{ success: boolean; worker?: Worker; isNewUser?: boolean; message?: string }> => {
    const cleanEmail = profile.email.trim().toLowerCase();
    const cleanName = profile.name?.trim() || cleanEmail.split('@')[0];
    const defaultPassword = profile.password || 'TaskFlow@2026';
    let authUid: string | undefined;

    // 1. Attempt to create user in Firebase Authentication
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, defaultPassword);
      authUid = cred.user.uid;
      console.log('Firebase Auth created user successfully:', authUid);
    } catch (authErr: any) {
      if (authErr?.code === 'auth/email-already-in-use') {
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, defaultPassword);
          authUid = cred.user.uid;
        } catch (signInErr) {
          console.warn('Firebase Auth signIn notice:', signInErr);
        }
      } else {
        console.warn('Firebase Auth notice:', authErr?.code, authErr?.message);
      }
    }

    const finalUid = authUid || auth.currentUser?.uid || `w-${Date.now()}`;
    const syncRes = await syncWorkerRecordWithUid(finalUid, cleanEmail, cleanName, profile.avatarUrl);
    return {
      success: true,
      worker: syncRes.worker,
      isNewUser: syncRes.isNewUser,
      message: syncRes.isNewUser ? 'Account registered successfully.' : 'Welcome back!',
    };
  };

  const signupUser = registerUser;

  const logoutGoogle = () => {
    try {
      signOut(auth).catch((err) => console.warn('Firebase signOut error:', err));
    } catch (e) {
      console.error(e);
    }
    if (!currentWorker.googleAccount) {
      logout();
      return;
    }
    const workerName = currentWorker.name;
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === currentWorker.id
          ? {
              ...w,
              googleAccount: undefined,
            }
          : w
      )
    );
    logout();
    notify(`Signed out of Google account for ${workerName}.`);
  };

  const unlinkGoogleAccount = (workerId: string) => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId
          ? {
              ...w,
              googleAccount: undefined,
            }
          : w
      )
    );
    notify('Google account unlinked.');
  };

  // Actions
  const createTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'completedSlots'>): Task => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      completedSlots: 0,
    };
    setTasks((prev) => [newTask, ...prev]);
    saveDocument('tasks', newTask);

    // If assigned to a partner, increment that partner's assigned task count
    if (newTask.assignedPartnerName && newTask.assignedPartnerName !== 'Unassigned') {
      setPartners((prev) =>
        prev.map((p) =>
          p.name === newTask.assignedPartnerName ? { ...p, assignedTaskCount: p.assignedTaskCount + 1 } : p
        )
      );
    }
    notify(`Task "${newTask.title}" created successfully!`);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates };
          saveDocument('tasks', updated);
          return updated;
        }
        return t;
      })
    );
    notify(`Task updated.`);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    removeDocument('tasks', taskId);
    notify(`Task deleted.`);
  };

  const assignTaskToPartner = (taskId: string, partnerName: string) => {
    const partner = partners.find((p) => p.name === partnerName);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assignedPartnerName: partnerName,
              assignedPartnerId: partner ? partner.id : undefined,
            }
          : t
      )
    );

    // Also update any pending submissions under this task
    setSubmissions((prev) =>
      prev.map((s) => (s.taskId === taskId ? { ...s, assignedPartnerName: partnerName } : s))
    );

    if (partnerName !== 'Unassigned') {
      setPartners((prev) =>
        prev.map((p) => (p.name === partnerName ? { ...p, assignedTaskCount: p.assignedTaskCount + 1 } : p))
      );
    }
    notify(`Task assigned to ${partnerName}.`);
  };

  const submitTaskProof = (
    taskId: string,
    proofText: string,
    proofUrl?: string,
    proofFileName?: string,
    secretCode?: string,
    proofImage?: string
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    // Check if task is paused or completed
    if (task.status !== 'active') {
      return { success: false, message: 'This task is currently not accepting submissions.' };
    }

    if (task.completedSlots >= task.totalSlots) {
      return { success: false, message: 'All slots for this task are full.' };
    }

    // Check if worker already submitted
    const existing = submissions.find((s) => s.taskId === taskId && s.workerId === currentWorker.id);
    if (existing && existing.status !== 'rejected') {
      return { success: false, message: 'You have already submitted proof for this task.' };
    }

    // Check secret code requirement if applicable
    if (task.secretKey && (!secretCode || secretCode.trim().toUpperCase() !== task.secretKey.toUpperCase())) {
      return { success: false, message: `Invalid verification code. Please complete the task requirements.` };
    }

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      workerEmail: currentWorker.email,
      rewardINR: task.rewardINR,
      assignedPartnerName: task.assignedPartnerName || 'Apex Media',
      status: 'submitted',
      proofText,
      proofUrl,
      proofFileName,
      proofImage,
      secretCodeProvided: secretCode,
      submittedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setSubmissions((prev) => [newSub, ...prev]);
    saveDocument('submissions', newSub);
    notify(`Proof submitted for "${task.title}". It is now pending review.`);
    return { success: true, message: 'Proof submitted successfully! It has been routed for review.' };
  };

  const reviewSubmission = (
    submissionId: string,
    decision: 'approved' | 'rejected' | 'on_hold',
    reviewerName: string,
    reviewerRole: 'admin' | 'partner',
    notes?: string,
    holdReason?: string
  ) => {
    const targetSub = submissions.find((s) => s.id === submissionId);
    if (!targetSub) return;

    const previousStatus = targetSub.status;

    const updatedSub: Submission = {
      ...targetSub,
      status: decision,
      reviewedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      reviewerName,
      reviewerRole,
      reviewNotes: notes || (decision === 'approved' ? 'Approved and verified.' : 'Requirements not met.'),
      holdReason: decision === 'on_hold' ? holdReason || 'Pending additional verification.' : undefined,
    };
    saveDocument('submissions', updatedSub);

    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? updatedSub : s))
    );

    // If newly approved, credit worker and partner commission
    if (decision === 'approved' && previousStatus !== 'approved') {
      const reward = targetSub.rewardINR;
      const workerToUpdate = workers.find((w) => w.id === targetSub.workerId);
      if (workerToUpdate) {
        saveDocument('workers', {
          ...workerToUpdate,
          availableBalanceINR: workerToUpdate.availableBalanceINR + reward,
          totalEarnedINR: workerToUpdate.totalEarnedINR + reward,
          completedTasksCount: workerToUpdate.completedTasksCount + 1,
        });
      }
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === targetSub.workerId
            ? {
                ...w,
                availableBalanceINR: w.availableBalanceINR + reward,
                totalEarnedINR: w.totalEarnedINR + reward,
                completedTasksCount: w.completedTasksCount + 1,
              }
            : w
        )
      );

      // Increment completed slots on task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === targetSub.taskId ? { ...t, completedSlots: Math.min(t.totalSlots, t.completedSlots + 1) } : t
        )
      );

      // Credit partner commission if reviewed by partner or assigned to partner
      const partnerName = targetSub.assignedPartnerName;
      if (partnerName && partnerName !== 'Unassigned') {
        setPartners((prev) =>
          prev.map((p) => {
            if (p.name === partnerName) {
              const commission = Math.round((reward * p.commissionRatePercent) / 100);
              return {
                ...p,
                earnedBalanceINR: p.earnedBalanceINR + Math.max(commission, 10),
                completedReviewsCount: p.completedReviewsCount + 1,
              };
            }
            return p;
          })
        );
      }
      notify(`Submission approved! ₹${reward} credited to ${targetSub.workerName}'s balance.`);
    } else if (decision === 'rejected') {
      notify(`Submission rejected. Reason logged.`);
    } else if (decision === 'on_hold') {
      notify(`Submission placed on hold.`);
    }

    const matchingWorker = workers.find((w) => w.id === targetSub.workerId);
    const workerEid = matchingWorker?.eid || 'EID-USER';
    if (reviewerRole === 'partner') {
      logPartnerActivity({
        partnerId: reviewerName,
        partnerName: reviewerName,
        action: `Task Submission: ${decision === 'approved' ? 'Approved' : decision === 'rejected' ? 'Rejected' : 'Placed On Hold'}`,
        targetUserId: targetSub.workerId,
        targetUserEid: workerEid,
        targetUserName: targetSub.workerName,
        paymentStatus: decision === 'approved' ? 'Approved' : decision === 'rejected' ? 'Rejected' : 'Pending',
        amountINR: targetSub.rewardINR,
        details: `Task "${targetSub.taskTitle}". Notes: ${notes || 'Reviewed by partner'}. ${decision === 'approved' ? `Reward of ₹${targetSub.rewardINR} credited.` : ''}`,
      });
    } else {
      logAdminActivity({
        action: decision === 'approved' ? 'submission_approved' : 'submission_rejected',
        title: `Task Submission ${decision === 'approved' ? 'Approved' : 'Reviewed'}: ${targetSub.taskTitle}`,
        targetUserId: targetSub.workerId,
        targetUserEid: workerEid,
        targetUserName: targetSub.workerName,
        amountINR: targetSub.rewardINR,
        details: `Task: ${targetSub.taskTitle}. Decision: ${decision}. Worker: ${targetSub.workerName} (${workerEid}). Notes: ${notes || 'Admin review'}.`,
        performedByAdmin: reviewerName,
      });
    }
  };

  const submitAppeal = (submissionId: string, appealText: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          return {
            ...s,
            appealStatus: 'pending',
            appealText,
            appealSubmittedAt: new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        }
        return s;
      })
    );
    notify(`Appeal submitted. Admin will review the decision.`);
  };

  const resolveAppeal = (submissionId: string, approve: boolean, resolutionNotes: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    if (approve) {
      reviewSubmission(submissionId, 'approved', 'Admin Appeal Desk', 'admin', resolutionNotes);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, appealStatus: 'resolved' } : s))
      );
      notify(`Appeal accepted: Overturned and approved with ₹${sub.rewardINR} credited.`);
    } else {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                appealStatus: 'denied',
                reviewNotes: `Appeal denied: ${resolutionNotes}`,
              }
            : s
        )
      );
      notify(`Appeal denied: Rejection maintained.`);
    }
  };

  const requestWithdrawal = (
    amountINR: number,
    method: 'UPI' | 'Bank Transfer' | 'Paytm',
    payoutDetails: string,
    role: 'worker' | 'partner'
  ) => {
    if (amountINR < settings.minWithdrawalINR) {
      return {
        success: false,
        message: `Minimum withdrawal amount is ₹${settings.minWithdrawalINR}.`,
      };
    }

    if (role === 'worker') {
      if (currentWorker.availableBalanceINR < amountINR) {
        return {
          success: false,
          message: `Insufficient balance. Your available balance is ₹${currentWorker.availableBalanceINR}.`,
        };
      }
      // Deduct balance immediately
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === currentWorker.id
            ? { ...w, availableBalanceINR: w.availableBalanceINR - amountINR }
            : w
        )
      );
    } else {
      if (currentPartner.earnedBalanceINR < amountINR) {
        return {
          success: false,
          message: `Insufficient partner commission. Available balance is ₹${currentPartner.earnedBalanceINR}.`,
        };
      }
      // Deduct partner balance
      setPartners((prev) =>
        prev.map((p) =>
          p.id === currentPartner.id
            ? { ...p, earnedBalanceINR: p.earnedBalanceINR - amountINR }
            : p
        )
      );
    }

    const newReq: WithdrawalRequest = {
      id: `wth-${Date.now()}`,
      userId: role === 'worker' ? currentWorker.id : currentPartner.id,
      userName: role === 'worker' ? currentWorker.name : currentPartner.name,
      role,
      amountINR,
      method,
      payoutDetails,
      status: 'pending',
      requestedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setWithdrawals((prev) => [newReq, ...prev]);
    saveDocument('withdrawals', newReq);
    if (role === 'worker') {
      saveDocument('workers', {
        ...currentWorker,
        availableBalanceINR: currentWorker.availableBalanceINR - amountINR,
      });
    }
    notify(`Withdrawal request of ₹${amountINR} submitted successfully.`);
    return {
      success: true,
      message: `Withdrawal request of ₹${amountINR} submitted successfully. Funds will be processed within 24 hours.`,
    };
  };

  const processWithdrawal = (
    withdrawalId: string,
    status: 'approved' | 'completed' | 'rejected',
    transactionRef?: string,
    notes?: string
  ) => {
    const target = withdrawals.find((w) => w.id === withdrawalId);
    if (!target) return;

    // If rejected, refund the deducted balance to user
    if (status === 'rejected' && target.status !== 'rejected') {
      if (target.role === 'worker') {
        setWorkers((prev) =>
          prev.map((w) =>
            w.id === target.userId
              ? { ...w, availableBalanceINR: w.availableBalanceINR + target.amountINR }
              : w
          )
        );
      } else {
        setPartners((prev) =>
          prev.map((p) =>
            p.id === target.userId
              ? { ...p, earnedBalanceINR: p.earnedBalanceINR + target.amountINR }
              : p
          )
        );
      }
    }

    setWithdrawals((prev) =>
      prev.map((w) => {
        if (w.id === withdrawalId) {
          return {
            ...w,
            status,
            processedAt: new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            transactionRef: transactionRef || (status === 'completed' ? `UPI/${Date.now().toString().slice(-8)}/SUCCESS` : undefined),
            adminNotes: notes || (status === 'completed' ? 'Processed and settled successfully.' : 'Status updated by administrator.'),
          };
        }
        return w;
      })
    );

    const matchingWorker = workers.find((w) => w.id === target.userId);
    const workerEid = matchingWorker?.eid || (target.role === 'worker' ? 'EID-USER' : 'PARTNER');

    if (status === 'completed' || status === 'approved') {
      logAdminActivity({
        action: 'withdrawal_approved',
        title: `Withdrawal Approved: ₹${target.amountINR} for ${target.userName}`,
        targetUserId: target.userId,
        targetUserEid: workerEid,
        targetUserName: target.userName,
        amountINR: target.amountINR,
        details: `Payout of ₹${target.amountINR} via ${target.method} (${target.payoutDetails}) approved and marked ${status}. Ref: ${transactionRef || 'UPI/SUCCESS'}. Notes: ${notes || 'Processed'}`,
        performedByAdmin: 'Super Admin (Finance Desk)',
      });
    } else if (status === 'rejected') {
      logAdminActivity({
        action: 'withdrawal_rejected',
        title: `Withdrawal Rejected: ₹${target.amountINR} for ${target.userName}`,
        targetUserId: target.userId,
        targetUserEid: workerEid,
        targetUserName: target.userName,
        amountINR: target.amountINR,
        details: `Withdrawal request of ₹${target.amountINR} was rejected. Reason: ${notes || 'Administrative review'}. Funds refunded to balance.`,
        performedByAdmin: 'Super Admin (Finance Desk)',
      });
    }

    notify(`Withdrawal #${withdrawalId.slice(-4)} marked as ${status}.`);
  };

  const redeemVoucher = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const voucher = secretVouchers.find((v) => v.code === cleanCode);

    if (!voucher) {
      return { success: false, message: 'Invalid voucher code.' };
    }
    if (!voucher.active) {
      return { success: false, message: 'This secret voucher has been deactivated.' };
    }
    if (voucher.redeemedCount >= voucher.maxRedemptions) {
      return { success: false, message: 'This secret voucher has reached maximum redemption capacity.' };
    }
    if (voucher.redeemedBy.includes(currentWorker.id)) {
      return { success: false, message: 'You have already redeemed this voucher.' };
    }

    // Credit worker
    const updatedWorkerBalance = currentWorker.availableBalanceINR + voucher.rewardINR;
    const updatedWorkerEarned = currentWorker.totalEarnedINR + voucher.rewardINR;
    saveDocument('workers', {
      ...currentWorker,
      availableBalanceINR: updatedWorkerBalance,
      totalEarnedINR: updatedWorkerEarned,
    });
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === currentWorker.id
          ? {
              ...w,
              availableBalanceINR: updatedWorkerBalance,
              totalEarnedINR: updatedWorkerEarned,
            }
          : w
      )
    );

    // Update voucher
    const updatedVoucher = {
      ...voucher,
      redeemedCount: voucher.redeemedCount + 1,
      redeemedBy: [...voucher.redeemedBy, currentWorker.id],
    };
    saveDocument('vouchers', updatedVoucher);
    setSecretVouchers((prev) =>
      prev.map((v) => (v.id === voucher.id ? updatedVoucher : v))
    );

    notify(`Secret code applied! ₹${voucher.rewardINR} credited to your available balance.`);
    return {
      success: true,
      message: `Success! Code "${voucher.code}" redeemed. ₹${voucher.rewardINR} credited to your account.`,
      rewardINR: voucher.rewardINR,
    };
  };

  const createVoucher = (voucher: Omit<SecretVoucher, 'id' | 'redeemedCount' | 'redeemedBy'>) => {
    const newV: SecretVoucher = {
      ...voucher,
      code: voucher.code.trim().toUpperCase(),
      id: `v-${Date.now()}`,
      redeemedCount: 0,
      redeemedBy: [],
    };
    setSecretVouchers((prev) => [newV, ...prev]);
    saveDocument('vouchers', newV);
    notify(`Secret voucher "${newV.code}" created.`);
  };

  const toggleVoucherStatus = (id: string) => {
    setSecretVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, active: !v.active } : v))
    );
    notify(`Voucher status toggled.`);
  };

  const addPartnerUpload = (upload: Omit<PartnerUpload, 'id' | 'uploadedAt'>) => {
    const newUp: PartnerUpload = {
      ...upload,
      id: `up-${Date.now()}`,
      uploadedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setPartnerUploads((prev) => [newUp, ...prev]);
    notify(`File "${newUp.fileName}" uploaded successfully.`);
  };

  const handleSystemRequest = (requestId: string, approve: boolean) => {
    setSystemRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: approve ? 'approved' : 'rejected' } : r))
    );
    notify(`Request marked as ${approve ? 'approved' : 'rejected'}.`);
  };

  const playGamingOffer = (offerId: string) => {
    const offer = gamingOffers.find((g) => g.id === offerId);
    if (!offer) return { success: false, wonINR: 0, message: 'Offer not found.' };

    let won = offer.rewardINR;
    if (offer.gameType === 'Daily Spin') {
      const prizes = [10, 15, 20, 25, 30, 40, 50];
      won = prizes[Math.floor(Math.random() * prizes.length)];
    }

    setWorkers((prev) =>
      prev.map((w) =>
        w.id === currentWorker.id
          ? {
              ...w,
              availableBalanceINR: w.availableBalanceINR + won,
              totalEarnedINR: w.totalEarnedINR + won,
            }
          : w
      )
    );

    setGamingOffers((prev) =>
      prev.map((g) => (g.id === offerId ? { ...g, lastPlayedAt: new Date().toISOString() } : g))
    );

    notify(`Congratulations! Won ₹${won} from ${offer.title}.`);
    return {
      success: true,
      wonINR: won,
      message: `You won ₹${won}! Reward has been credited to your Available Balance.`,
    };
  };

  const updateSettings = (updates: Partial<PlatformSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveDocument('settings', { id: 'global', ...next });
      return next;
    });
    notify(`Platform settings updated.`);
  };

  const updateWorkerBalance = (
    workerId: string,
    deltaINR: number,
    reason: string,
    performedByAdmin: string = 'Super Admin (System)'
  ) => {
    let affectedWorker: Worker | undefined;
    let oldBalance = 0;
    let newBalance = 0;
    let newTotalEarned = 0;

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          affectedWorker = w;
          oldBalance = w.availableBalanceINR;
          newBalance = Math.max(0, w.availableBalanceINR + deltaINR);
          newTotalEarned = deltaINR > 0 ? w.totalEarnedINR + deltaINR : w.totalEarnedINR;
          const updated = { ...w, availableBalanceINR: newBalance, totalEarnedINR: newTotalEarned };
          saveDocument('workers', updated);
          return updated;
        }
        return w;
      })
    );

    if (affectedWorker) {
      const isAdd = deltaINR >= 0;
      const absAmount = Math.abs(deltaINR);
      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // User Transaction History
      const newTx: UserTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        workerId: affectedWorker.id,
        workerEid: affectedWorker.eid,
        workerName: affectedWorker.name,
        type: isAdd ? 'add' : 'deduct',
        amountINR: absAmount,
        balanceBeforeINR: oldBalance,
        balanceAfterINR: newBalance,
        performedByAdmin,
        reason: reason || (isAdd ? 'Admin balance credit' : 'Admin balance deduction'),
        timestamp,
      };
      setUserTransactions((prev) => [newTx, ...prev]);

      // Admin Activity Log
      logAdminActivity({
        action: isAdd ? 'add_balance' : 'deduct_balance',
        title: isAdd ? `Added ₹${absAmount} to ${affectedWorker.name}` : `Deducted ₹${absAmount} from ${affectedWorker.name}`,
        targetUserId: affectedWorker.id,
        targetUserEid: affectedWorker.eid,
        targetUserName: affectedWorker.name,
        amountINR: absAmount,
        details: `${isAdd ? 'Added' : 'Deducted'} ₹${absAmount}. Reason: ${reason || 'Manual balance adjustment'}. Balance changed from ₹${oldBalance} to ₹${newBalance}.`,
        performedByAdmin,
      });

      notify(
        `Balance updated for ${affectedWorker.name}: ${isAdd ? `+₹${absAmount}` : `-₹${absAmount}`} (${reason}).`
      );
    }
  };

  const deleteWorker = (workerId: string, performedByAdmin: string = 'Super Admin (System)') => {
    const target = workers.find((w) => w.id === workerId);
    if (!target) return;

    // Delete ONLY this user; other users, balances, submissions, and platform data remain intact
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
    removeDocument('workers', workerId);

    logAdminActivity({
      action: 'user_deleted',
      title: `Deleted User: ${target.name} (${target.eid})`,
      targetUserId: target.id,
      targetUserEid: target.eid,
      targetUserName: target.name,
      amountINR: target.availableBalanceINR,
      details: `User account deleted. Last known balance: ₹${target.availableBalanceINR}, Email: ${target.email}, UID: ${target.uniqueUserId}. Other user accounts and records unaffected.`,
      performedByAdmin,
    });

    notify(`User "${target.name}" (${target.eid}) deleted successfully.`);
  };

  const addPartner = (
    newPartner: Omit<Partner, 'id' | 'assignedTaskCount' | 'completedReviewsCount' | 'earnedBalanceINR' | 'joinedDate'>
  ) => {
    const created: Partner = {
      ...newPartner,
      id: `p-${Date.now()}`,
      assignedTaskCount: 0,
      completedReviewsCount: 0,
      earnedBalanceINR: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setPartners((prev) => [...prev, created]);
    notify(`Partner "${created.name}" registered.`);
  };

  // Tournament Action Implementations
  const addTournament = (newTourn: Omit<Tournament, 'id' | 'registeredSlots' | 'createdAt'>): Tournament => {
    const created: Tournament = {
      ...newTourn,
      id: `tourn-${Date.now()}`,
      registeredSlots: 0,
      registeredPlayerIds: [],
      createdAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdBy: 'Moderator Console',
    };

    setTournaments((prev) => {
      const updated = [created, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY + '_tournaments', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });

    saveDocument('tournaments', created).catch((err) => {
      console.warn('Firestore save tournament error:', err);
    });

    notify(`Tournament "${created.title}" successfully published!`);
    return created;
  };

  const updateTournament = (id: string, updates: Partial<Tournament>) => {
    setTournaments((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      try {
        localStorage.setItem(STORAGE_KEY + '_tournaments', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      const target = updated.find((t) => t.id === id);
      if (target) {
        saveDocument('tournaments', target).catch(console.warn);
      }
      return updated;
    });
    notify('Tournament details updated.');
  };

  const deleteTournament = (id: string) => {
    setTournaments((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY + '_tournaments', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });
    removeDocument('tournaments', id).catch(console.warn);
    notify('Tournament deleted.');
  };

  const registerForTournament = (
    tournamentId: string,
    inGameName: string,
    inGameUid: string
  ): { success: boolean; message: string } => {
    const targetTournament = tournaments.find((t) => t.id === tournamentId);
    if (!targetTournament) {
      return { success: false, message: 'Tournament not found.' };
    }

    if (targetTournament.registeredSlots >= targetTournament.maxSlots) {
      return { success: false, message: 'Tournament slots are already full.' };
    }

    if (targetTournament.registeredPlayerIds?.includes(currentWorker.id)) {
      return { success: false, message: 'You are already registered for this tournament.' };
    }

    // Check entry fee if > 0
    if (targetTournament.entryFeeINR > 0) {
      const balance = currentWorker.availableBalanceINR || 0;
      if (balance < targetTournament.entryFeeINR) {
        return {
          success: false,
          message: `Insufficient balance (₹${balance}). Entry fee is ₹${targetTournament.entryFeeINR}.`,
        };
      }
      // Deduct entry fee
      updateWorkerBalance(
        currentWorker.id,
        -targetTournament.entryFeeINR,
        `Tournament Entry Fee: ${targetTournament.title}`
      );
    }

    const newParticipant: TournamentParticipant = {
      id: `tp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tournamentId,
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      workerUid: currentWorker.uniqueUserId || currentWorker.eid,
      inGameName: inGameName.trim(),
      inGameUid: inGameUid.trim(),
      registeredAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'registered',
    };

    setTournamentParticipants((prev) => {
      const updated = [newParticipant, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY + '_tourn_participants', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });

    setTournaments((prev) => {
      const updated = prev.map((t) => {
        if (t.id === tournamentId) {
          const newPlayerIds = [...(t.registeredPlayerIds || []), currentWorker.id];
          return {
            ...t,
            registeredSlots: Math.min(t.maxSlots, (t.registeredSlots || 0) + 1),
            registeredPlayerIds: newPlayerIds,
          };
        }
        return t;
      });
      try {
        localStorage.setItem(STORAGE_KEY + '_tournaments', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      const updatedTarget = updated.find((t) => t.id === tournamentId);
      if (updatedTarget) {
        saveDocument('tournaments', updatedTarget).catch(console.warn);
      }
      return updated;
    });

    saveDocument('tournamentParticipants', newParticipant).catch(console.warn);

    notify(`Successfully joined "${targetTournament.title}"! Good luck, Player!`);
    return {
      success: true,
      message: `Registration confirmed for ${targetTournament.title}!`,
    };
  };

  const updateParticipant = (participantId: string, updates: Partial<TournamentParticipant>) => {
    setTournamentParticipants((prev) => {
      const updated = prev.map((p) => (p.id === participantId ? { ...p, ...updates } : p));
      try {
        localStorage.setItem(STORAGE_KEY + '_tourn_participants', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      const target = updated.find((p) => p.id === participantId);
      if (target) {
        saveDocument('tournamentParticipants', target).catch(console.warn);
      }
      return updated;
    });
  };

  const removeParticipant = (participantId: string) => {
    const target = tournamentParticipants.find((p) => p.id === participantId);
    if (!target) return;

    setTournamentParticipants((prev) => {
      const updated = prev.filter((p) => p.id !== participantId);
      try {
        localStorage.setItem(STORAGE_KEY + '_tourn_participants', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });
    removeDocument('tournamentParticipants', participantId).catch(console.warn);

    // Update tournament slots and player IDs
    setTournaments((prev) => {
      const updated = prev.map((t) => {
        if (t.id === target.tournamentId) {
          const newPlayerIds = (t.registeredPlayerIds || []).filter((id) => id !== target.workerId);
          return {
            ...t,
            registeredSlots: Math.max(0, (t.registeredSlots || 0) - 1),
            registeredPlayerIds: newPlayerIds,
          };
        }
        return t;
      });
      try {
        localStorage.setItem(STORAGE_KEY + '_tournaments', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      const updatedTarget = updated.find((t) => t.id === target.tournamentId);
      if (updatedTarget) {
        saveDocument('tournaments', updatedTarget).catch(console.warn);
      }
      return updated;
    });
    notify(`Removed player "${target.inGameName}" from tournament roster.`);
  };

  const awardTournamentPrizes = (
    tournamentId: string,
    results: { participantId: string; rank: number; kills: number; prizeINR: number; points: number }[]
  ) => {
    const targetTournament = tournaments.find((t) => t.id === tournamentId);
    if (!targetTournament) return;

    // Update participants with rank, kills, prize, points
    setTournamentParticipants((prev) => {
      const updated = prev.map((p) => {
        if (p.tournamentId === tournamentId) {
          const matchResult = results.find((r) => r.participantId === p.id);
          if (matchResult) {
            return {
              ...p,
              rank: matchResult.rank,
              kills: matchResult.kills,
              prizeWonINR: matchResult.prizeINR,
              points: matchResult.points,
              status: matchResult.rank === 1 ? ('winner' as const) : ('eliminated' as const),
            };
          }
        }
        return p;
      });
      try {
        localStorage.setItem(STORAGE_KEY + '_tourn_participants', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });

    // Credit prizes directly to workers' app wallets
    results.forEach((r) => {
      if (r.prizeINR > 0) {
        const participant = tournamentParticipants.find((p) => p.id === r.participantId);
        if (participant) {
          updateWorkerBalance(
            participant.workerId,
            r.prizeINR,
            `Tournament Prize (Rank #${r.rank}, ${r.kills} Kills): ${targetTournament.title}`,
            'Esports Moderator'
          );
        }
      }
    });

    // Mark tournament as completed
    updateTournament(tournamentId, { status: 'Completed' });
    notify(`Match results saved and ₹ prizes credited for "${targetTournament.title}"!`);
  };

  // Match Results Action Implementations
  const addMatchResult = (
    newResult: Omit<TournamentMatchResult, 'id' | 'publishedAt'>
  ): TournamentMatchResult => {
    const created: TournamentMatchResult = {
      ...newResult,
      id: `mr-${Date.now()}`,
      publishedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMatchResults((prev) => {
      const updated = [created, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY + '_match_results', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });
    saveDocument('matchResults', created).catch(console.warn);
    notify(`Match scores successfully published for "${created.tournamentTitle}"!`);
    return created;
  };

  const updateMatchResult = (id: string, updates: Partial<TournamentMatchResult>) => {
    setMatchResults((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
      try {
        localStorage.setItem(STORAGE_KEY + '_match_results', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      const target = updated.find((m) => m.id === id);
      if (target) {
        saveDocument('matchResults', target).catch(console.warn);
      }
      return updated;
    });
    notify('Match results updated successfully.');
  };

  const deleteMatchResult = (id: string) => {
    setMatchResults((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY + '_match_results', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });
    removeDocument('matchResults', id).catch(console.warn);
    notify('Match result record deleted.');
  };

  // Customer Support Tickets Action Implementations
  const createSupportTicket = (
    ticket: Omit<TournamentSupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): TournamentSupportTicket => {
    const ticketNum = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const created: TournamentSupportTicket = {
      ...ticket,
      id: `tick-${Date.now()}`,
      ticketNumber: ticketNum,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    setSupportTickets((prev) => {
      const updated = [created, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY + '_support_tickets', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });
    saveDocument('tournamentSupportTickets', created).catch(console.warn);
    notify(`Support ticket ${ticketNum} submitted! A tournament moderator will review it.`);
    return created;
  };

  const updateSupportTicket = (id: string, updates: Partial<TournamentSupportTicket>) => {
    const now = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setSupportTickets((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t));
      try {
        localStorage.setItem(STORAGE_KEY + '_support_tickets', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      const target = updated.find((t) => t.id === id);
      if (target) {
        saveDocument('tournamentSupportTickets', target).catch(console.warn);
      }
      return updated;
    });
    notify('Support ticket updated.');
  };

  const resolveSupportTicket = (id: string, reply: string, compensationINR?: number) => {
    const now = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const target = supportTickets.find((t) => t.id === id);
    if (!target) return;

    if (compensationINR && compensationINR > 0) {
      updateWorkerBalance(
        target.workerId,
        compensationINR,
        `Compensation for Support Ticket ${target.ticketNumber}: ${reply}`,
        'Moderator Helpdesk'
      );
    }

    updateSupportTicket(id, {
      status: 'resolved',
      moderatorReply: reply,
      compensationINR,
      resolvedAt: now,
      updatedAt: now,
    });
    notify(`Support Ticket ${target.ticketNumber} marked as resolved!`);
  };

  // Tournament Deposit Requests Actions
  const createDepositRequest = async (data: {
    senderName: string;
    amountINR: number;
    utr: string;
  }): Promise<boolean> => {
    const cleanSender = data.senderName.trim();
    const cleanUtr = data.utr.trim();
    const amount = Number(data.amountINR);

    if (!cleanSender) {
      notify('Please enter the Payment Sender Name.');
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      notify('Please enter a valid deposit amount in INR.');
      return false;
    }
    if (!cleanUtr || cleanUtr.length < 6) {
      notify('Please enter a valid 12-digit UTR transaction reference number.');
      return false;
    }

    const newRequest: DepositRequest = {
      id: `dep-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      userId: currentWorker.id || 'w-1',
      userName: `${currentWorker.name || 'Player'} (${currentWorker.eid || 'EID-1001'})`,
      userEmail: currentWorker.email,
      senderName: cleanSender,
      amountINR: amount,
      utr: cleanUtr,
      upiId: 'soumodipbera@fam',
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      approvalWindowMessage: 'Deposits are manually verified and approved within 8 hours.',
    };

    setDepositRequests((prev) => {
      const updated = [newRequest, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY + '_deposit_requests', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });

    notify(`Deposit request of ₹${amount} submitted! Administrator review in progress (typically approved within 8 hours).`);
    return true;
  };

  const approveDepositRequest = (requestId: string, notes?: string) => {
    const target = depositRequests.find((d) => d.id === requestId);
    if (!target) return;
    if (target.status === 'Approved') {
      notify('Deposit request is already approved.');
      return;
    }

    const reviewedAt = new Date().toISOString();
    const reviewNotes = notes?.trim() || `Verified against UPI bank records for UTR ${target.utr}. Credited ₹${target.amountINR}.`;

    // 1. Credit balance to worker account
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === target.userId || w.uniqueUserId === target.userId || w.eid === target.userId
          ? {
              ...w,
              availableBalanceINR: (w.availableBalanceINR || 0) + target.amountINR,
              totalEarnedINR: (w.totalEarnedINR || 0) + target.amountINR,
            }
          : w
      )
    );

    // 2. Update request status to Approved
    setDepositRequests((prev) => {
      const updated = prev.map((d) =>
        d.id === requestId
          ? {
              ...d,
              status: 'Approved' as DepositRequestStatus,
              reviewedAt,
              reviewedBy: 'Administrator',
              reviewNotes,
            }
          : d
      );
      try {
        localStorage.setItem(STORAGE_KEY + '_deposit_requests', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });

    notify(`Deposit request ${target.id} approved! ₹${target.amountINR} credited to user wallet.`);
  };

  const rejectDepositRequest = (requestId: string, reason?: string) => {
    const target = depositRequests.find((d) => d.id === requestId);
    if (!target) return;

    const reviewedAt = new Date().toISOString();
    const reviewNotes = reason?.trim() || 'Payment not matched in banking statement or duplicate UTR.';

    setDepositRequests((prev) => {
      const updated = prev.map((d) =>
        d.id === requestId
          ? {
              ...d,
              status: 'Rejected' as DepositRequestStatus,
              reviewedAt,
              reviewedBy: 'Administrator',
              reviewNotes,
            }
          : d
      );
      try {
        localStorage.setItem(STORAGE_KEY + '_deposit_requests', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
      return updated;
    });

    notify(`Deposit request ${target.id} marked as Rejected.`);
  };

  const resetToDefaultData = () => {
    setTasks(INITIAL_TASKS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setWithdrawals(INITIAL_WITHDRAWALS);
    setPartners(INITIAL_PARTNERS);
    setWorkers(INITIAL_WORKERS);
    setSecretVouchers(INITIAL_VOUCHERS);
    setPartnerUploads(INITIAL_UPLOADS);
    setSystemRequests(INITIAL_REQUESTS);
    setGamingOffers(INITIAL_GAMING);
    setSettings(INITIAL_SETTINGS);
    setTournaments(INITIAL_TOURNAMENTS);
    setTournamentParticipants(INITIAL_TOURNAMENT_PARTICIPANTS);
    setMatchResults(INITIAL_MATCH_RESULTS);
    setSupportTickets(INITIAL_SUPPORT_TICKETS);
    setDepositRequests(INITIAL_DEPOSIT_REQUESTS);
    notify(`Demo data refreshed to default state.`);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        selectedPartnerName,
        setSelectedPartnerName,
        pinModalOpen,
        pendingRole,
        pendingPartnerPanel,
        partnerStep,
        enteredPartnerName,
        setEnteredPartnerName,
        pinError,
        partnerPanels: PARTNER_PANELS,
        requestRoleChange,
        selectPartnerPanelToVerify,
        submitPartnerName,
        verifyPin,
        closePinModal,
        adminSidebarOption,
        setAdminSidebarOption,
        partnerTab,
        setPartnerTab,
        workerTab,
        setWorkerTab,
        tasks,
        submissions,
        withdrawals,
        partners,
        workers,
        secretVouchers,
        partnerUploads,
        systemRequests,
        gamingOffers,
        settings,
        isAuthenticated,
        setIsAuthenticated,
        logout,
        currentWorker,
        currentPartner,
        activeWorkerId,
        setActiveWorkerId,
        googleAuthModalOpen,
        setGoogleAuthModalOpen,
        loginUser,
        loginWithGoogle,
        signupUser,
        registerUser,
        logoutGoogle,
        unlinkGoogleAccount,
        createTask,
        updateTask,
        deleteTask,
        assignTaskToPartner,
        submitTaskProof,
        reviewSubmission,
        submitAppeal,
        resolveAppeal,
        requestWithdrawal,
        processWithdrawal,
        redeemVoucher,
        createVoucher,
        toggleVoucherStatus,
        addPartnerUpload,
        handleSystemRequest,
        playGamingOffer,
        updateSettings,
        updateWorkerBalance,
        deleteWorker,
        userTransactions,
        adminActivityLogs,
        partnerActivityLogs,
        logAdminActivity,
        logPartnerActivity,
        addPartner,
        tournaments,
        tournamentParticipants,
        addTournament,
        updateTournament,
        deleteTournament,
        registerForTournament,
        updateParticipant,
        removeParticipant,
        awardTournamentPrizes,
        isModeratorUnlocked,
        setIsModeratorUnlocked,
        matchResults,
        addMatchResult,
        updateMatchResult,
        deleteMatchResult,
        supportTickets,
        createSupportTicket,
        updateSupportTicket,
        resolveSupportTicket,
        roleSecurityPins,
        updateRolePin,
        resetRolePins,
        verifyAdminPin,
        verifyModeratorPin,
        depositRequests,
        createDepositRequest,
        approveDepositRequest,
        rejectDepositRequest,
        isAppSidebarOpen,
        setIsAppSidebarOpen,
        resetToDefaultData,
        notificationMessage,
        clearNotification,
        notify,
        isFirestoreConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
