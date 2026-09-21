export type Role = 'admin' | 'partner' | 'worker';

export type TaskPriority = 'Normal' | 'High' | 'Urgent';

export type TaskStatus = 'active' | 'paused' | 'completed' | 'draft';

export type SubmissionStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'on_hold';

export type WithdrawalStatus = 'pending' | 'approved' | 'completed' | 'rejected';

export type AdminSidebarOption =
  | 'Q-U-U-E-U-E'
  | 'Request'
  | 'Submission'
  | 'Create'
  | 'Active'
  | 'Secret'
  | 'User'
  | 'Setup'
  | 'Gaming'
  | 'Appeals'
  | 'Hold'
  | 'States'
  | 'Withdrawal'
  | 'Maintenance'
  | 'Partners'
  | 'Assign';

export type PartnerTab = 'Assign Requests' | 'Upload' | 'Withdrawal Request';

export type WorkerTab =
  | 'Available Tasks'
  | 'My Submissions'
  | 'Submission Status'
  | 'Withdraw'
  | 'Income in INR'
  | 'Available Balance'
  | 'Withdrawal History';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'Social Media' | 'App Testing' | 'Survey & Research' | 'Content Creation' | 'Data Verification' | 'Gaming & Offers';
  rewardINR: number;
  proofType: 'Screenshot' | 'Text & Link' | 'Document' | 'Code Verification';
  proofInstructions: string;
  totalSlots: number;
  completedSlots: number;
  assignedPartnerName: string;
  assignedPartnerId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  deadline: string;
  secretKey?: string;
  bannerUrl?: string;
  estimatedMinutes: number;
}

export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  workerId: string;
  workerName: string;
  workerEmail: string;
  rewardINR: number;
  assignedPartnerName: string;
  status: SubmissionStatus;
  proofText: string;
  proofUrl?: string;
  proofFileName?: string;
  secretCodeProvided?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerName?: string;
  reviewerRole?: 'admin' | 'partner';
  reviewNotes?: string;
  holdReason?: string;
  appealText?: string;
  appealStatus?: 'none' | 'pending' | 'resolved' | 'denied';
  appealSubmittedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  role: 'worker' | 'partner';
  amountINR: number;
  method: 'UPI' | 'Bank Transfer' | 'Paytm';
  payoutDetails: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  transactionRef?: string;
  adminNotes?: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  assignedTaskCount: number;
  completedReviewsCount: number;
  commissionRatePercent: number;
  earnedBalanceINR: number;
  status: 'Active' | 'Pending' | 'Suspended';
  joinedDate: string;
  agencyType: string;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  availableBalanceINR: number;
  totalEarnedINR: number;
  completedTasksCount: number;
  status: 'Active' | 'Flagged' | 'Suspended';
  joinedDate: string;
  upiId?: string;
}

export interface SecretVoucher {
  id: string;
  code: string;
  description: string;
  rewardINR: number;
  maxRedemptions: number;
  redeemedCount: number;
  expiresAt: string;
  active: boolean;
  redeemedBy: string[];
}

export interface PartnerUpload {
  id: string;
  partnerName: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  description: string;
  uploadedAt: string;
}

export interface SystemRequest {
  id: string;
  type: 'verification' | 'reward_boost' | 'partner_application' | 'limit_increase';
  requesterName: string;
  requesterRole: 'worker' | 'partner';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  requestedAmountINR?: number;
}

export interface GamingOffer {
  id: string;
  title: string;
  description: string;
  gameType: 'Daily Spin' | 'Trivia Quiz' | 'App Quest';
  rewardINR: number;
  cooldownHours: number;
  badge: string;
  active: boolean;
  lastPlayedAt?: string;
}

export interface PlatformSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  bannerBrandingText: string;
  showBanner: boolean;
  minWithdrawalINR: number;
  partnerCommissionRatePercent: number;
  autoApproveSurveys: boolean;
  emailNotifications: boolean;
  emergencyLock: boolean;
}
