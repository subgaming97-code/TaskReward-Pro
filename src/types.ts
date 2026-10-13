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
  | 'Assign'
  | 'Activity Logs'
  | 'Administration'
  | 'Deposit Requests';

export interface RoleSecurityPins {
  adminPin: string;
  moderatorPin: string;
  partnerPin: string;
  partnerPanelPins: Record<string, string>;
}

export type PartnerTab = 'Assign Requests' | 'Upload' | 'Withdrawal Request' | 'Activity Log';

export type PartnerPanelCode = 'A' | 'B' | 'C' | 'D';

export interface PartnerPanelInfo {
  code: PartnerPanelCode;
  label: string;
  uniquePartnerName: string;
  pin?: string;
  agencyType: string;
  description: string;
}

export type WorkerTab =
  | 'Home'
  | 'Tasks'
  | 'Tournament'
  | 'Earnings'
  | 'Profile'
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
  taskLink?: string;
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
  proofImage?: string;
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

export interface GoogleAccountProfile {
  email: string;
  name: string;
  googleId: string;
  avatarUrl?: string;
  signedInAt: string;
}

export interface GamingPreferences {
  preferredMode: TournamentGameMode;
  preferredMap: string;
  playstyle: 'Rusher' | 'Sniper' | 'Support' | 'In-Game Leader (IGL)' | 'Assaulter' | 'All-Rounder';
  device: 'Android Mobile' | 'iOS Mobile' | 'iPad / Tablet' | 'PC / Emulator';
  preferredTime: 'Morning (9 AM - 1 PM)' | 'Afternoon (1 PM - 5 PM)' | 'Evening (5 PM - 9 PM)' | 'Night (9 PM - 1 AM)' | 'Flexible / Any';
  competitiveExperience?: 'Casual Player' | 'Ranked Challenger' | 'Semi-Pro' | 'Tournament Veteran';
  favoriteWeaponCategory?: 'Assault Rifle' | 'SMG' | 'Sniper' | 'Shotgun';
}

export interface Worker {
  id: string;
  uniqueUserId: string;
  eid: string;
  name: string;
  email: string;
  phone: string;
  availableBalanceINR: number;
  totalEarnedINR: number;
  completedTasksCount: number;
  status: 'Active' | 'Flagged' | 'Suspended';
  joinedDate: string;
  upiId?: string;
  avatarUrl?: string;
  googleAccount?: GoogleAccountProfile;
  // Tournament Profile & E-sports Tournament UID
  esportsTournamentUid?: string;
  inGameName?: string;
  inGameUid?: string;
  gamingPreferences?: GamingPreferences;
  hasTournamentProfile?: boolean;
  tournamentProfileCreatedAt?: string;
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

export interface UserTransaction {
  id: string;
  workerId: string;
  workerEid: string;
  workerName: string;
  type: 'add' | 'deduct';
  amountINR: number;
  balanceBeforeINR: number;
  balanceAfterINR: number;
  performedByAdmin: string;
  reason: string;
  timestamp: string;
}

export interface AdminActivityLog {
  id: string;
  action: 'add_balance' | 'deduct_balance' | 'withdrawal_approved' | 'withdrawal_rejected' | 'user_deleted' | 'submission_approved' | 'submission_rejected' | 'other';
  title: string;
  targetUserId?: string;
  targetUserEid?: string;
  targetUserName?: string;
  amountINR?: number;
  details: string;
  performedByAdmin: string;
  timestamp: string;
}

export interface PartnerActivityLog {
  id: string;
  partnerId: string;
  partnerName: string;
  action: string;
  targetUserId: string;
  targetUserEid?: string;
  targetUserName: string;
  paymentStatus: 'Pending' | 'Completed' | 'Approved' | 'Rejected' | 'Credited';
  amountINR: number;
  details: string;
  date: string;
  time: string;
  timestamp: string;
}

export interface UserSession {
  userId: string;
  email: string;
  phone?: string;
  name: string;
  loggedInAt: string;
}

export type TournamentGameMode =
  | 'Solo'
  | 'Battle Royale'
  | 'Squad'
  | 'Lone Wolf'
  | 'Craftland'
  | '1v1'
  | '3v3'
  | '2v2';

export type TournamentStatus =
  | 'Draft'
  | 'Upcoming'
  | 'Registration Open'
  | 'Registration Closed'
  | 'Room Live'
  | 'In Progress'
  | 'Score Verification'
  | 'Completed'
  | 'Cancelled';

export interface Tournament {
  id: string;
  title: string;
  game: string;
  gameMode: TournamentGameMode;
  bannerUrl?: string;
  prizePoolINR: number;
  firstPrizeINR: number;
  secondPrizeINR: number;
  thirdPrizeINR: number;
  runnerUpPrizeINR?: number;
  perKillINR?: number;
  entryFeeINR: number;
  map: string;
  maxSlots: number;
  registeredSlots: number;
  registeredPlayerIds?: string[];
  scheduleDate: string;
  scheduleTime: string;
  startTimeISO?: string;
  status: TournamentStatus;
  roomId?: string;
  roomPassword?: string;
  isRoomCredentialsPublished?: boolean;
  registrationOpen?: boolean;
  rules?: string;
  customMapCode?: string;
  createdAt: string;
  createdBy?: string;
  esportsTournamentUid?: string;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  workerId: string;
  workerName: string;
  workerUid: string;
  esportsTournamentUid?: string;
  inGameName: string;
  inGameUid: string;
  registeredAt: string;
  status: 'registered' | 'checked_in' | 'disqualified' | 'eliminated' | 'winner';
  rank?: number;
  kills?: number;
  prizeWonINR?: number;
  points?: number;
}

export interface TournamentLeaderboardEntry {
  participantId: string;
  workerId: string;
  workerName: string;
  workerUid: string;
  inGameName: string;
  inGameUid: string;
  rank: number;
  kills: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  prizeWonINR: number;
  isBooyah?: boolean;
}

export type TicketCategory =
  | 'score_dispute'
  | 'room_issue'
  | 'prize_payout'
  | 'cheating_report'
  | 'rule_clarification'
  | 'other';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TournamentSupportTicket {
  id: string;
  ticketNumber: string;
  workerId: string;
  workerName: string;
  workerUid: string;
  inGameName: string;
  inGameUid: string;
  tournamentId?: string;
  tournamentTitle?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  moderatorReply?: string;
  moderatorNotes?: string;
  compensationINR?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TournamentPlayerScore {
  participantId: string;
  inGameName: string;
  inGameUid: string;
  workerId: string;
  workerName: string;
  rank: number;
  kills: number;
  damage?: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  prizeWonINR: number;
  isMvp?: boolean;
}

export interface TournamentMatchResult {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  game: string;
  gameMode: TournamentGameMode;
  matchDate: string;
  matchTime: string;
  map: string;
  roomId?: string;
  scores: TournamentPlayerScore[];
  status: 'draft' | 'verified' | 'published';
  mvpPlayerName?: string;
  totalKills: number;
  totalPrizeDistributedINR: number;
  publishedAt: string;
  verifiedBy: string;
  notes?: string;
}

export type DepositRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  senderName: string; // 'Payment Sender Name'
  amountINR: number; // 'Deposit Amount in INR'
  utr: string; // 'UTR'
  upiId: string; // 'soumodipbera@fam'
  status: DepositRequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  approvalWindowMessage?: string;
}

