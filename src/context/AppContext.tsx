import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Role,
  AdminSidebarOption,
  PartnerTab,
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
} from '../types';

interface AppContextType {
  // Current active role & user view
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  selectedPartnerName: string;
  setSelectedPartnerName: (name: string) => void;

  // Security PIN Verification
  pinModalOpen: boolean;
  pendingRole: 'admin' | 'partner' | null;
  pinError: string | null;
  requestRoleChange: (role: Role) => void;
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
  currentWorker: Worker;
  currentPartner: Partner;

  // Task Actions
  createTask: (newTask: Omit<Task, 'id' | 'createdAt' | 'completedSlots'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  assignTaskToPartner: (taskId: string, partnerName: string) => void;

  // Submission & Review Actions
  submitTaskProof: (taskId: string, proofText: string, proofUrl?: string, proofFileName?: string, secretCode?: string) => { success: boolean; message: string };
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

  // Settings & Maintenance Actions
  updateSettings: (updates: Partial<PlatformSettings>) => void;
  updateWorkerBalance: (workerId: string, deltaINR: number, reason: string) => void;
  addPartner: (newPartner: Omit<Partner, 'id' | 'assignedTaskCount' | 'completedReviewsCount' | 'earnedBalanceINR' | 'joinedDate'>) => void;

  // Quick reset / reload
  resetToDefaultData: () => void;
  notificationMessage: string | null;
  clearNotification: () => void;
}

const STORAGE_KEY = 'taskflow_platform_state_v1';

const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'p-1',
    name: 'Apex Media',
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
    name: 'TaskPro Partners',
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
    name: 'Nexus Digital Solutions',
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
];

const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+91 91234 56789',
    availableBalanceINR: 650,
    totalEarnedINR: 2450,
    completedTasksCount: 9,
    status: 'Active',
    joinedDate: '2026-02-01',
    upiId: 'alex.rivera@okhdfcbank',
  },
  {
    id: 'w-102',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    phone: '+91 93456 78901',
    availableBalanceINR: 1200,
    totalEarnedINR: 3800,
    completedTasksCount: 14,
    status: 'Active',
    joinedDate: '2026-01-20',
    upiId: 'sarahc@icici',
  },
  {
    id: 'w-103',
    name: 'David Miller',
    email: 'david.m@example.com',
    phone: '+91 94567 89012',
    availableBalanceINR: 320,
    totalEarnedINR: 980,
    completedTasksCount: 4,
    status: 'Active',
    joinedDate: '2026-02-15',
    upiId: 'davidm@paytm',
  },
  {
    id: 'w-104',
    name: 'Priya Sharma',
    email: 'priya.s@example.com',
    phone: '+91 95678 90123',
    availableBalanceINR: 840,
    totalEarnedINR: 1950,
    completedTasksCount: 7,
    status: 'Active',
    joinedDate: '2026-02-28',
    upiId: 'priyasharma@oksbi',
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load or fallback
  const [currentRole, setCurrentRole] = useState<Role>('worker');
  const [selectedPartnerName, setSelectedPartnerName] = useState<string>('Apex Media');

  // Security PIN Verification
  const ADMIN_PIN = '122444';
  const PARTNER_PIN = '228906';

  const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
  const [pendingRole, setPendingRole] = useState<'admin' | 'partner' | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const requestRoleChange = (role: Role) => {
    if (role === currentRole) return;

    if (role === 'worker') {
      setCurrentRole('worker');
      setPinModalOpen(false);
      setPendingRole(null);
      setPinError(null);
      return;
    }

    // Both admin and partner require their respective PINs
    setPendingRole(role);
    setPinError(null);
    setPinModalOpen(true);
  };

  const verifyPin = (enteredPin: string): boolean => {
    if (pendingRole === 'admin') {
      if (enteredPin === ADMIN_PIN) {
        setCurrentRole('admin');
        setPinModalOpen(false);
        setPendingRole(null);
        setPinError(null);
        return true;
      } else {
        setPinError('Incorrect PIN. Please try again.');
        return false;
      }
    }

    if (pendingRole === 'partner') {
      if (enteredPin === PARTNER_PIN) {
        setCurrentRole('partner');
        setPinModalOpen(false);
        setPendingRole(null);
        setPinError(null);
        return true;
      } else {
        setPinError('Incorrect PIN. Please try again.');
        return false;
      }
    }

    return false;
  };

  const closePinModal = () => {
    setPinModalOpen(false);
    setPendingRole(null);
    setPinError(null);
  };

  const [adminSidebarOption, setAdminSidebarOption] = useState<AdminSidebarOption>('Active');
  const [partnerTab, setPartnerTab] = useState<PartnerTab>('Assign Requests');
  const [workerTab, setWorkerTab] = useState<WorkerTab>('Available Tasks');

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
      return stored ? JSON.parse(stored) : INITIAL_PARTNERS;
    } catch {
      return INITIAL_PARTNERS;
    }
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_workers');
      return stored ? JSON.parse(stored) : INITIAL_WORKERS;
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

  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

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
    } catch (e) {
      console.error('Storage sync error:', e);
    }
  }, [tasks, submissions, withdrawals, partners, workers, secretVouchers, partnerUploads, systemRequests, gamingOffers, settings]);

  const notify = (msg: string) => {
    setNotificationMessage(msg);
  };

  const clearNotification = () => {
    setNotificationMessage(null);
  };

  // Primary active profiles
  const currentWorker = workers.find((w) => w.id === 'w-101') || workers[0];
  const currentPartner = partners.find((p) => p.name === selectedPartnerName) || partners[0];

  // Actions
  const createTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'completedSlots'>): Task => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      completedSlots: 0,
    };
    setTasks((prev) => [newTask, ...prev]);

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
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
    notify(`Task updated.`);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
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
    secretCode?: string
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
      secretCodeProvided: secretCode,
      submittedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setSubmissions((prev) => [newSub, ...prev]);
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

    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          return {
            ...s,
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
        }
        return s;
      })
    );

    // If newly approved, credit worker and partner commission
    if (decision === 'approved' && previousStatus !== 'approved') {
      const reward = targetSub.rewardINR;
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
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === currentWorker.id
          ? {
              ...w,
              availableBalanceINR: w.availableBalanceINR + voucher.rewardINR,
              totalEarnedINR: w.totalEarnedINR + voucher.rewardINR,
            }
          : w
      )
    );

    // Update voucher
    setSecretVouchers((prev) =>
      prev.map((v) =>
        v.id === voucher.id
          ? {
              ...v,
              redeemedCount: v.redeemedCount + 1,
              redeemedBy: [...v.redeemedBy, currentWorker.id],
            }
          : v
      )
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
    setSettings((prev) => ({ ...prev, ...updates }));
    notify(`Platform settings updated.`);
  };

  const updateWorkerBalance = (workerId: string, deltaINR: number, reason: string) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const newBal = Math.max(0, w.availableBalanceINR + deltaINR);
          const newTotal = deltaINR > 0 ? w.totalEarnedINR + deltaINR : w.totalEarnedINR;
          return { ...w, availableBalanceINR: newBal, totalEarnedINR: newTotal };
        }
        return w;
      })
    );
    notify(`Balance updated for worker: ${deltaINR >= 0 ? `+₹${deltaINR}` : `-₹${Math.abs(deltaINR)}`} (${reason}).`);
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
        pinError,
        requestRoleChange,
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
        currentWorker,
        currentPartner,
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
        addPartner,
        resetToDefaultData,
        notificationMessage,
        clearNotification,
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
