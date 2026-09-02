/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuizQuestion {
  id: string;
  question: string; // in Myanmar
  options: string[]; // 4 options
  correctOptionIndex: number;
  explanation: string; // Myanmar explanation of why this option is correct
}

export interface MiniExercise {
  id: string;
  instruction: string; // Myanmar
  codeTemplate: string;
  expectedOutput: string;
  hints: string[];
}

export interface ContentVersion {
  versionNumber: string;
  changedBy: string;
  changedByUid?: string;
  changedDate: string;
  changeSummary: string;
}

export interface LessonAccessConfig {
  accessType: "free" | "premium" | "preview" | "locked";
  prerequisiteType?: "none" | "previous_lesson" | "previous_quiz" | "previous_module" | "specific_course";
  prerequisiteId?: string;
}

export interface LessonAnalytics {
  views: number;
  completionRate: number; // percentage
  quizPerformance: number; // percentage
  dropOffRate: number; // percentage
  avgCompletionTime: string; // e.g. "35 mins"
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  duration: string; // e.g., "45 mins"
  orderNumber?: number;
  status?: "Draft" | "Under Review" | "Published" | "Unpublished" | "Archived";
  accessConfig?: LessonAccessConfig;
  videoUrl?: string;
  imageUrl?: string;
  passingScore?: number; // Passing score percentage for quizzes (e.g. 80)
  versionHistory?: ContentVersion[];
  analytics?: LessonAnalytics;
  markdownPath?: string; // Path to the markdown file e.g., "/content/python/001-variables.md"
  whatIsIt: string; // Explanation of WHAT it is (Myanmar)
  whyImportant: string; // Explanation of WHY it is important (Myanmar)
  realWorldUsage: string; // Real-world usage cases (Myanmar)
  syntax: string; // Code syntax block
  examples: string[]; // List of code examples with brief Myanmar descriptions
  commonMistakes: { mistake: string; correction: string; explanation: string }[];
  bestPractices: string[]; // Myanmar tips
  miniExercise: MiniExercise;
  quiz: QuizQuestion[];
  miniProject: {
    title: string;
    description: string;
    guide: string[];
    startingCode: string;
  };
  // Expanded for Myanmar Platform Core Structure (17 parts)
  learningObjectives?: {
    what: string;
    why: string;
    when: string;
    how: string;
  };
  myanmarExplanation?: string;
  englishKeywords?: string[];
  theory?: string;
  stepByStepExplanation?: string[];
  outputPreview?: string;
  tips?: string[];
  assignment?: {
    title: string;
    description: string;
    instructions: string[];
  };
  lessonSummary?: string;
  nextLesson?: string;

  // Telegram Video Delivery Platform Architecture Fields
  telegramChannelType?: "free" | "premium";
  telegramDirectUrl?: string; // e.g. "https://t.me/code_Learn_myanmar" or post link
  telegramPostId?: string; // e.g. "Lesson_01_Variables" or post ID
  telegramMaterialsUrl?: string;
  downloadableZipUrl?: string;
  telegramResources?: { title: string; type: "video" | "pdf" | "zip" | "code"; link?: string; size?: string }[];
  videoDeliveryPlatform?: "telegram" | "web" | "youtube";
}

export interface TelegramChannelSettings {
  freeChannelName: string;
  freeChannelUrl: string;
  freeChannelHandle: string;
  freeChannelDescription: string;
  premiumChannelName: string;
  premiumChannelInviteLink: string;
  premiumChannelHandle: string;
  premiumChannelDescription: string;
  adminVerificationRequired: boolean;
  supportTelegramHandle: string;
  botUsername?: string;
  allowInstantVerificationForVerifiedPayment?: boolean;
}

export interface TelegramAccessRequest {
  id: string;
  requestId?: string;
  uid: string;
  userName: string;
  userEmail: string;
  telegramUsername: string; // e.g., "@aungaung" or phone
  telegramUserId?: string;
  status: "pending" | "approved" | "rejected" | "revoked";
  planName?: string;
  planId?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  adminNote?: string;
  privateInviteLink?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  orderNumber: number;
  completionRequirements?: string;
  lessons: Lesson[];
}

export interface CourseAnalytics {
  totalViews: number;
  completionRate: number;
  quizAvgScore: number;
  dropOffRate: number;
  avgCompletionTimeMinutes: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: "basics" | "web" | "frontend" | "backend" | "android" | "database" | "git" | "deployment" | "ai" | "career";
  lessonCount: number;
  difficulty: "Level 1: Beginner" | "Level 2: Basic" | "Level 3: Intermediate" | "Level 4: Advanced" | "Level 5: Professional";
  estimatedTime: string; // e.g., "12 hours"
  lessons: Lesson[];
  // CMS Fields
  thumbnail?: string;
  programmingLanguage?: string; // e.g. "Python", "JavaScript", "HTML/CSS", "Java", "Kotlin", "SQL"
  isPremium?: boolean;
  status?: "Draft" | "Under Review" | "Published" | "Unpublished" | "Archived";
  modules?: CourseModule[];
  versionHistory?: ContentVersion[];
  analytics?: CourseAnalytics;
  // Expanded properties following Myanmar Course Information standards
  projectCount: number;
  prerequisites: string[];
  learningOutcomes: string[];
  certificateAvailable: boolean;
  introduction: string; // Course Intro
  roadmap: { step: string; title: string; description: string }[]; // Learning roadmap
  quizzesCount: number;
  assignmentsCount: number;
  finalProject: {
    title: string;
    description: string;
    guide: string[];
    startingCode: string;
    solutionCode: string;
  };
  courseSummary: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  steps: { title: string; content: string }[];
  startingCode: string;
  solutionCode: string;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}

export interface Comment {
  id: string;
  author: string;
  authorId?: string;
  content: string;
  date: string;
  isHelpful?: boolean;
  isBestAnswer?: boolean;
  likes?: number;
  likedBy?: string[];
  isHidden?: boolean;
  hiddenReason?: string;
  isReported?: boolean;
  reportReason?: string;
  reportsCount?: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string;
  date: string;
  likes: number;
  likedBy?: string[];
  replies: Comment[];
  category: string;
  tags?: string[];
  programmingLanguage?: string;
  codeSnippet?: string;
  imageUrl?: string;
  postType?: "Question" | "Discussion" | "Programming Tip" | "Project Showcase" | "Learning Experience";
  bestAnswerId?: string;
  isLocked?: boolean;
  isPinned?: boolean;
  isReported?: boolean;
  reportReason?: string;
  reportsCount?: number;
  reports?: CommunityReport[];
  isHidden?: boolean;
  hiddenReason?: string;
  isFlaggedByFilter?: boolean;
  flaggedReason?: string;
}

export type ReportReasonType = 
  | "Spam" 
  | "Harassment" 
  | "Hate Speech" 
  | "Offensive Language" 
  | "False Information" 
  | "Malicious Links" 
  | "Copyright Violations";

export interface CommunityReport {
  id: string;
  targetType: 'post' | 'reply';
  targetId: string;
  postId: string;
  contentTitle: string;
  contentAuthor: string;
  contentSnippet: string;
  reporterAnonymousId: string; // Confidential token - reporter identity never revealed
  reason: ReportReasonType;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  timestamp: string;
  adminNotes?: string;
}

export interface UserModerationStatus {
  uid: string;
  name: string;
  email?: string;
  status: 'active' | 'warned' | 'suspended' | 'banned';
  postingPrivilege: boolean;
  warningCount: number;
  suspensionEndDate?: string;
  lastActionReason?: string;
}

export interface ModerationSettings {
  autoFilterProfanity: boolean;
  antiSpamEnabled: boolean;
  maxPostsPerTenMins: number;
  blockSuspiciousLinks: boolean;
  plagiarismCheckPrompt: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  titleMm?: string;
  description: string;
  icon: string; // lucide icon name
  unlockedAt?: string;
  xpReward?: number;
  badge?: string;
}

export interface Certificate {
  id: string;
  courseId?: string;
  courseTitle: string;
  issuedTo: string;
  issuedDate: string;
  verificationId: string;
  score?: number;
  certificateUrl?: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  timestamp: string;
  deviceInfo: string;
}

export interface UserSession {
  id: string;
  device?: string; // e.g. "Windows Desktop", "Android Mobile", "MacBook", "iPhone"
  deviceType?: "desktop" | "mobile" | "tablet" | string;
  os?: string;
  browser: string; // e.g. "Chrome 123", "Safari Mobile", "Firefox"
  ip?: string;
  ipAddress?: string;
  location?: string;
  loginTime?: string;
  lastActive: string;
  isCurrent?: boolean;
  isCurrentDevice?: boolean;
}

export interface UserSecurityLog {
  id: string;
  event?: string;
  eventMm?: string;
  action?: string;
  details?: string;
  device?: string;
  status: "success" | "warning" | "failed" | "info";
  timestamp: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export type ReputationLevel = 
  | "Beginner Helper" 
  | "Community Helper" 
  | "Senior Helper" 
  | "Expert Contributor" 
  | "Community Mentor";

export type LeaderboardTimeframe = "daily" | "weekly" | "monthly" | "all_time";
export type LeaderboardCategory = "xp" | "lessons" | "courses" | "streak" | "quizzes" | "reputation";

export interface ReputationData {
  points: number;
  level: ReputationLevel;
  helpfulAnswersCount: number;
  bestAnswersCount: number;
  qualityDiscussionsCount: number;
}

export interface SuspensionRecord {
  reason: string;
  startDate: string;
  durationDays?: number; // e.g., 7, 30, or undefined for permanent
  endDate?: string;
  administrator: string;
  adminUid?: string;
}

export interface AdminInternalNote {
  id: string;
  adminName: string;
  adminUid: string;
  content: string;
  timestamp: string;
}

export interface UserProfile {
  uid?: string;
  name: string;
  fullName?: string;
  email: string;
  photo?: string;
  role?: string;
  accountStatus?: "active" | "suspended" | "restricted" | "deleted";
  membershipStatus?: "free" | "premium" | "expired" | "pending";
  suspensionInfo?: SuspensionRecord;
  suspensionReason?: string;
  suspendedAt?: string;
  communityAccessRestricted?: boolean;
  adminNotesList?: AdminInternalNote[];
  quizStats?: {
    totalQuizzesTaken?: number;
    totalCorrect?: number;
    totalQuestions?: number;
    accuracyRate?: number;
  };
  level: number;
  xp: number;
  coins?: number;
  bookmarks?: string[];
  achievements: Achievement[];
  certificates: Certificate[];
  streak?: number;
  learningStreak?: number;
  longestStreak?: number;
  lastCheckInDate?: string; // YYYY-MM-DD format
  checkInHistory?: string[]; // Array of YYYY-MM-DD strings
  enrolledCourses?: string[];
  completedCourses?: string[];
  completedLessons: string[];
  completedProjects?: string[];
  completedQuizzes?: string[];
  createdDate?: string;
  createdAt?: string;
  lastLogin?: string;
  bio?: string;
  // Reputation & Leaderboard Fields
  reputationPoints?: number;
  reputationLevel?: ReputationLevel;
  helpfulAnswersCount?: number;
  bestAnswersCount?: number;
  qualityDiscussionsCount?: number;
  leaderboardPrivacy?: "public" | "private";
  isFairPlayFlagged?: boolean;
  fairPlayFlagReason?: string;
  preferredLanguage?: "my" | "en";
  themePreference?: "light" | "dark" | "system";
  auditLogs?: AuditEvent[];
  activeSessions?: UserSession[];
  securityLogs?: UserSecurityLog[];
  failedLoginAttempts?: number;
  lockoutUntil?: string;
  autoLogoutMinutes?: number;
  twoFactorEnabled?: boolean;
  securityAlertsCount?: number;
  isPremium?: boolean;
  premiumPlan?: "monthly" | "six_months" | "lifetime";
  premiumUntil?: string; // ISO Date String
  premiumActivatedAt?: string; // ISO Date String
  premiumSince?: string;
  premiumExpiresAt?: string;
  // Gamification Fields
  monthlyStreak?: number;
  yearlyStreak?: number;
  hideNameFromLeaderboard?: boolean;
  studyMinutesToday?: number;
  kiboQuestionsAskedToday?: number;
  lastMissionsResetDate?: string; // YYYY-MM-DD format
  dailyMissionsState?: {
    [missionId: string]: {
      id: string;
      title: string;
      progress: number;
      target: number;
      claimed: boolean;
      xpReward: number;
      coinsReward: number;
    };
  };
  weeklyChallengesState?: {
    [challengeId: string]: {
      id: string;
      title: string;
      progress: number;
      target: number;
      claimed: boolean;
      xpReward: number;
      coinsReward: number;
    };
  };
  monthlyChallengesState?: {
    [challengeId: string]: {
      id: string;
      title: string;
      progress: number;
      target: number;
      claimed: boolean;
      xpReward: number;
      coinsReward: number;
    };
  };
  activeFrame?: string; // e.g., 'default', 'bronze_ring', 'silver_sparkle', 'golden_crown', 'legendary_aura'
  unlockedFrames?: string[];
  activeEffect?: string; // e.g., 'none', 'sparkle', 'gold-glow', 'fire-flicker', 'bubble'
  
  // Intelligent Assessment Tracking Fields
  highestScores?: { [assessmentId: string]: number };
  averageScores?: { [assessmentId: string]: number };
  assessmentAttempts?: { [assessmentId: string]: number };
  completedAssessments?: string[]; // list of assessment IDs passed

  // Developer Profile Mission Fields
  username?: string;
  currentRoadmap?: string;
  visibility?: "public" | "private" | "community";
  githubUrl?: string;
  liveDemoUrl?: string;
  studyTimeHours?: number;
  quizAccuracyPercent?: number;
  completedAssignmentsCount?: number;
  languagesLearned?: string[];
  savedNotes?: { id: string; title: string; content: string; date: string }[];
  savedCodeSnippets?: { id: string; title: string; code: string; language: string; date: string }[];

  // Telegram Video Channel & Access Verification Fields
  telegramUsername?: string;
  telegramVerified?: boolean;
  telegramEligible?: boolean;
  telegramVerificationStatus?: "none" | "pending" | "approved" | "rejected" | "revoked";
  telegramInviteLink?: string;
  telegramApprovedAt?: string;

  // Data Saver Mode Configurations
  dataSaverEnabled?: boolean;
  dataSaverConfig?: DataSaverConfig;

  // Privacy & Data Governance Settings
  privacySettings?: UserPrivacySettings;
}

export interface DataSaverConfig {
  enabled: boolean;
  reduceImageQuality: boolean;
  reduceAnimations: boolean;
  disablePreloading: boolean;
  loadContentOnDemand: boolean;
  reduceBackgroundRequests: boolean;
  avoidUnnecessaryRefreshes: boolean;
}

export interface UserPrivacySettings {
  profileVisibility: "public" | "community" | "private";
  portfolioVisibility?: "public" | "community" | "private";
  showInLeaderboards: boolean;
  showInLeaderboard?: boolean;
  showInCommunity?: boolean;
  showCommunityActivity: boolean;
  showAchievements: boolean;
  showCertificates: boolean;
  aiChatRetentionDays: number; // 0 = ephemeral (never store), 7, 30, 90
  allowAiHistoryRetention?: boolean;
  allowPersonalizedRecommendations: boolean;
  emailNotifications: {
    courseUpdates: boolean;
    quizResults: boolean;
    achievements: boolean;
    systemAnnouncements: boolean;
    securityAlerts: boolean;
  };
}

export interface DataRetentionPolicySettings {
  paymentScreenshotsRetentionDays: number; // e.g. 30, 60, 90, 180
  systemSecurityLogsRetentionDays: number; // e.g. 90, 180, 365, 730
  aiUsageLogsRetentionDays: number; // e.g. 14, 30, 90, 180
  supportRequestsRetentionDays: number; // e.g. 60, 180, 365
  inactiveAccountRetentionDays?: number;
  autoCleanupEnabled: boolean;
  autoPurgeExpiredData?: boolean;
  anonymizeFinancialRecordsOnDelete?: boolean;
  lastCleanupTimestamp?: string;
  lastCleanedRecordsCount?: number;
}

export type LessonQuestionType = "mc" | "ma" | "tf" | "fitb" | "prediction" | "find_error" | "coding";

export interface AssessmentQuestion {
  id: string;
  type: LessonQuestionType;
  question: string; // Myanmar
  codeSnippet?: string; // Optional code block
  options?: string[]; // For "mc", "ma"
  correctOptionIndex?: number; // For "mc", "tf" (0 or 1 for True/False)
  correctOptionIndices?: number[]; // For "ma"
  correctAnswer?: string | string[]; // For "fitb", "prediction", "find_error", "coding"
  explanation: string; // Myanmar explanation
  tips?: string[]; // Myanmar tips
  referenceLesson?: string; // Lesson title or ID
}

export interface AssessmentAttempt {
  id: string;
  uid: string;
  userEmail: string;
  userName: string;
  assessmentId: string; // lessonId, moduleSlug, or courseId
  assessmentTitle: string;
  assessmentType: "lesson_quiz" | "module_assessment" | "final_assessment";
  courseId: string;
  courseTitle: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  passingScore: number;
  timeSpentSeconds: number;
  timestamp: string;
  incorrectQuestions?: string[]; // Array of question IDs
}

export interface AssessmentSettings {
  id: string; // "settings_" + courseId/assessmentId
  passingScorePercent: number; // e.g. 80
  xpReward: number; // e.g. 100
}

export interface PaymentRequest {
  id?: string;
  requestId: string;
  uid: string;
  userEmail?: string;
  userName?: string;
  planId: "monthly" | "six_months" | "lifetime" | string;
  planName?: string;
  paymentMethod?: string; // "KPay" | "Wave Money" | "Coins" | "Other"
  amountMMK?: number;
  amount?: number;
  screenshot?: string; // base64 representation
  transactionRef?: string;
  transactionId?: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "refunded" | "info_requested";
  notes?: string;
  infoRequestedNote?: string;
  rejectionReason?: string;
  membershipId?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  activationDate?: string;
  expirationDate?: string;
  createdAt?: string;
  timestamp?: string;
  isDuplicateFlagged?: boolean;
  duplicateReason?: string;
  fraudFlagged?: boolean;
  fraudReason?: string;
  auditTrail?: { action: string; timestamp: string; by: string; notes?: string }[];
}

export interface AdminPremiumPlan {
  id: string;
  title: string;
  planType: "monthly" | "six_months" | "lifetime" | "custom";
  durationDays: number;
  priceMMK: number;
  originalPriceMMK?: number;
  priceCoins?: number;
  isPopular?: boolean;
  isEnabled: boolean;
  description: string;
  features: string[];
  badge?: string;
  order: number;
  updatedAt?: string;
}

export interface AdminPaymentAccount {
  id: string;
  name: string;
  type: "kpay" | "wave" | "cbbank" | "ayapay" | "bank_transfer" | "other";
  accountNumber: string;
  accountName: string;
  qrCodeUrl?: string;
  isEnabled: boolean;
  instructions?: string;
  isDefault?: boolean;
  dailyLimitMMK?: number;
}

export interface MembershipHistoryRecord {
  id: string;
  uid: string;
  userEmail: string;
  userName: string;
  action: "activated" | "extended" | "expired" | "cancelled" | "refunded" | "plan_changed" | "manual_activated";
  planId: string;
  durationDays?: number;
  previousExpiration?: string;
  newExpiration: string;
  performedBy: string;
  reason?: string;
  timestamp: string;
  paymentRequestId?: string;
  membershipId?: string;
}

export interface FinancialAuditRecord {
  id: string;
  timestamp: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetType?: "payment" | "plan" | "account" | "membership" | "refund" | string;
  targetId?: string;
  targetUid?: string;
  targetUserEmail?: string;
  planId?: string;
  amountMMK?: number;
  details?: string;
  notes?: string;
  isHighRisk?: boolean;
}

export interface RefundRequest {
  id?: string;
  refundId: string;
  requestId: string;
  uid: string;
  userEmail?: string;
  userName?: string;
  planId: "monthly" | "six_months" | "lifetime";
  paymentMethod?: string;
  originalAmountMMK: number;
  refundAmountMMK: number;
  requestedRefundAmountMMK?: number;
  reason: "Accidental Duplicate Purchase" | "Technical Issue Service Interruption" | "Wrong Plan Selected" | "Unauthorized Transaction" | "Dissatisfied / Other";
  description: string;
  evidenceUrl?: string; // base64 screenshot or document
  evidenceAttachment?: string;
  status: "requested" | "under_review" | "approved" | "rejected" | "completed";
  requestedAt: string;
  decisionAt?: string;
  adminNote?: string;
  premiumAction?: "cancelled" | "remain_active" | "adjusted";
  fraudFlagged?: boolean;
  isFlaggedFraud?: boolean;
  fraudReason?: string;
  fraudFlags?: string[];
  auditTrail?: { action: string; timestamp: string; by: string; notes?: string }[];
}

export interface PaymentDispute {
  id?: string;
  disputeId: string;
  requestId?: string;
  uid: string;
  userEmail?: string;
  userName?: string;
  category: "rejected_incorrectly" | "premium_not_activated" | "wrong_plan" | "wrong_amount" | "other";
  description: string;
  attachmentUrl?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  adminResponse?: string;
  createdAt: string;
  updatedAt?: string;
  auditTrail?: { action: string; timestamp: string; by: string; notes?: string }[];
}

export interface PaymentAuditLog {
  id?: string;
  logId: string;
  entityType: "payment_request" | "refund_request" | "dispute" | "policy";
  entityId: string;
  action: string;
  performedBy: string; // e.g. "Admin (email)" or "Student (uid)"
  uid: string;
  details: string;
  timestamp: string;
}

export interface PaymentSettings {
  settingsId: "payment_info";
  kpayNumber: string;
  kpayName: string;
  waveNumber: string;
  waveName: string;
  // Dynamic pricing (MMK and Coins)
  priceMonthlyMMK?: number;
  priceMonthlyCoins?: number;
  priceSixMonthsMMK?: number;
  priceSixMonthsCoins?: number;
  priceLifetimeMMK?: number;
  priceLifetimeCoins?: number;
  
  // Promotional details
  isPromoActive?: boolean;
  promoDiscountPercent?: number; // e.g., 20 for 20%
  promoBannerText?: string;
  promoStartDate?: string; // ISO date string
  promoEndDate?: string; // ISO date string
  
  // Custom events
  currentEventId?: string; // "none", "html_week", "js_challenge", "css_contest", "holiday", "anniversary"
  currentEventTitle?: string;
  currentEventDescription?: string;
  currentEventBonusXpPercent?: number; // extra XP multiplier percent (e.g. 50 = 50% extra)

  // Refund & Cancellation Policy Settings
  refundEligibilityDays?: number; // default e.g. 7
  refundProcessingDaysText?: string; // default "1-3 ရာစက်ရက် (1-3 working days)"
  refundEnabled?: boolean;
  disputesEnabled?: boolean;
  refundPolicyText?: string;
  cancellationPolicyText?: string;
  termsOfServiceText?: string;
}

export interface LevelThreshold {
  level: number;
  name: string;
  xp: number;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, name: "Beginner (အခြေခံ)", xp: 0 },
  { level: 2, name: "Explorer (စူးစမ်းသူ)", xp: 100 },
  { level: 3, name: "Learner (လေ့လာသူ)", xp: 300 },
  { level: 4, name: "Developer (ဖန်တီးသူ)", xp: 700 },
  { level: 5, name: "Advanced Developer (အဆင့်မြင့်ဖန်တီးသူ)", xp: 1500 },
  { level: 6, name: "Professional (ကျွမ်းကျင်ပညာရှင်)", xp: 3000 },
  { level: 7, name: "Expert (ကျွမ်းကျင်သူ)", xp: 6000 },
  { level: 8, name: "Master (ဆရာကြီး)", xp: 10000 },
  { level: 9, name: "Legendary Developer (ဒဏ္ဍာရီလာဝိဇ္ဇာ)", xp: 20000 }
];

export function getLevelData(xp: number) {
  let currentLevel = 1;
  let levelName = "Beginner (အခြေခံ)";
  let minXp = 0;
  let maxXp = 100;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i].level;
      levelName = LEVEL_THRESHOLDS[i].name;
      minXp = LEVEL_THRESHOLDS[i].xp;
      if (i < LEVEL_THRESHOLDS.length - 1) {
        maxXp = LEVEL_THRESHOLDS[i + 1].xp;
      } else {
        maxXp = LEVEL_THRESHOLDS[i].xp; // Max level
      }
    } else {
      break;
    }
  }

  const isMaxLevel = currentLevel === 9;
  const progressXp = xp - minXp;
  const rangeXp = maxXp - minXp;
  const progressPercent = isMaxLevel ? 100 : Math.min((progressXp / rangeXp) * 100, 100);

  return {
    level: currentLevel,
    name: levelName,
    minXp,
    maxXp,
    progressXp: isMaxLevel ? xp : progressXp,
    rangeXp: isMaxLevel ? 20000 : rangeXp,
    progressPercent
  };
}

export interface PersonalNote {
  id: string;
  uid: string;
  title: string;
  content: string; // Markdown / Text
  category: "Lesson" | "Module" | "Course" | "Project" | "Assignment" | "Quiz" | "General";
  associatedId?: string; // e.g. lessonId, courseId
  associatedTitle?: string; // e.g. lessonTitle, courseTitle
  isPinned?: boolean;
  tags?: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface SavedCodeSnippet {
  id: string;
  uid: string;
  title: string;
  description?: string;
  code: string;
  language: string; // e.g., "HTML" | "CSS" | "JavaScript" | "Java" | "Kotlin" | "Firebase Examples"
  createdAt: string; // ISO date string
}

export interface PlatformStats {
  totalNotesCount: number;
  totalSnippetsCount: number;
}

export interface CodeReviewSettings {
  freeLimit: number;
  premiumLimit: number;
  supportedLanguages: string[];
  systemPromptTemplate: string;
  isFeatureEnabled: boolean;
}

export interface CodeReviewAttempt {
  id?: string;
  uid?: string;
  userEmail: string;
  code: string;
  language: string;
  contextType: "lesson" | "practice" | "assignment" | "project";
  timestamp: string;
  qualityScore: number; // 0 to 100
  reviewResult: {
    qualitySummary: string;
    explanation: string;
    suggestions: string[];
    bestPractices: string[];
    readabilityTips: string[];
    maintainabilitySuggestions: string[];
    errorAnalysis: {
      syntaxErrors: string;
      logicMistakes: string;
      unusedVariables: string;
      poorNaming: string;
      duplicateCode: string;
      missingComments: string;
    };
    learningRecommendations: {
      relatedLessons: string[];
      practiceExercises: string[];
      relevantDocs: string[];
      miniChallenges: string[];
    };
  };
}

export interface DebugSettings {
  freeLimit: number;
  premiumLimit: number;
  supportedLanguages: string[];
  systemPromptTemplate: string;
  isFeatureEnabled: boolean;
  maxCodeLength: number;
}

export interface AssignmentSubmission {
  assignmentId: string; // Unique ID (e.g., submission_uuid)
  uid: string; // Firebase Auth UID of the student
  submissionURL: string; // Source code, repo URL, or screenshot URL
  grade?: string | null; // Grade or score given by teacher
  feedback?: string | null; // Feedback text from teacher
  
  // Custom metadata fields (allowed since Firestore rule doesn't enforce hasOnly)
  projectId: string; // Associated project or assignment task ID
  projectTitle: string; // Title of the project/assignment task
  assignmentType: string; // 'practice' | 'coding' | 'ui_design' | 'debugging' | 'mini_project' | 'final_project'
  studentName: string;
  studentEmail: string;
  submittedAt: string; // ISO timestamp
}

export interface DebugAttempt {
  id?: string;
  uid?: string;
  userEmail: string;
  code: string;
  errorMessage: string;
  description: string;
  language: string;
  timestamp: string;
  debugResult: {
    errorType: string; // e.g. Syntax Error, Logic Error, Runtime Error, etc.
    explanation: {
      whatHappened: string;
      whyItHappened: string;
      whereItOccurred: string;
      howToFixIt: string;
      howToAvoidNextTime: string;
    };
    guidedSteps: string[]; // Step 1, Step 2, Step 3...
    codeComparison: {
      originalCode: string;
      revisedCode: string;
      diffDescription: string;
    };
    learningResources: {
      lessons: string[];
      exercises: string[];
      docs: string[];
      quizzes: string[];
    };
    debuggingTips: {
      bestPractices: string[];
      beginnerMistakes: string[];
      organizationTips: string[];
      testingSuggestions: string[];
    };
  };
}

export interface PortfolioProject {
  id: string;
  uid: string;
  title: string;
  description: string;
  projectType: "Mini Project" | "Final Project" | "Personal Project" | "Assignment Showcase";
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Professional";
  status: "Completed" | "In Progress" | "Draft";
  completionDate: string; // YYYY-MM-DD or ISO
  languages: string[];
  frameworks: string[];
  screenshot?: string; // base64 or URL
  thumbnail?: string; // base64 or URL
  githubUrl?: string;
  liveDemoUrl?: string;
  visibility: "Public" | "Private";
  studentName: string;
  studentEmail: string;
  studentPhoto?: string;
  isFeatured?: boolean;
  likes?: number;
  views?: number;
  likedBy?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationCategory = 'learning' | 'community' | 'system' | 'premium' | 'kibo' | 'announcement' | 'challenge' | 'achievement' | 'moderation' | 'reward';

export type SupportCategory = 
  | 'Support'
  | 'General Feedback'
  | 'Bug Report'
  | 'Feature Request'
  | 'Course Feedback'
  | 'Lesson Feedback'
  | 'Quiz Feedback'
  | 'Payment Issue'
  | 'Technical Issue'
  | 'Account Issue';

export type SupportStatus = 'Pending' | 'Under Review' | 'In Progress' | 'Resolved' | 'Closed';
export type SupportPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface SupportTicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'admin';
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  title: string;
  category: SupportCategory;
  subCategory?: string;
  description: string;
  screenshotUrl?: string;
  deviceInfo?: {
    browser: string;
    os: string;
    screenSize: string;
    userAgent: string;
  };
  status: SupportStatus;
  priority: SupportPriority;
  isArchived?: boolean;
  responses: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'lesson_completed' | 'quiz_results' | 'assignment_update' | 'project_status' | 'certificate_available' | 'achievement_unlocked'
  | 'discussion_reply' | 'best_answer_marked' | 'helpful_vote'
  | 'platform_maintenance' | 'new_course_released' | 'bug_fix' | 'feature_update' | 'security_announcement'
  | 'premium_activated' | 'premium_expiring' | 'premium_expiring_soon' | 'payment_approved' | 'payment_rejected' | 'special_premium_offer'
  | 'daily_reminder' | 'streak_reminder' | 'motivational_message' | 'weekly_progress' | 'suggested_next_lesson'
  | 'admin_message' | 'general_announcement' | 'course_announcement' | 'maintenance_notice' | 'promotion' | 'learning_event';

export interface AppNotification {
  id: string;
  userId?: string; // Target specific user ID or undefined for broadcast
  targetAudience?: 'all' | 'premium_only' | 'individual';
  title: string;
  titleMm?: string;
  description: string;
  descriptionMm?: string;
  timestamp: string;
  category: NotificationCategory;
  type: NotificationType;
  read: boolean;
  actionTab?: string;
  actionUrl?: string;
  actionLabelMm?: string;
  createdBy?: 'system' | 'kibo' | 'admin' | string;
  scheduledTime?: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  enableLearning: boolean;
  enableCommunity: boolean;
  enableAnnouncement: boolean;
  enableReminder: boolean;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  titleMm: string;
  content: string;
  contentMm: string;
  type: 'General' | 'Course' | 'Maintenance' | 'Promotion' | 'Learning Event';
  targetAudience: 'all' | 'premium_only';
  createdAt: string;
  scheduledTime?: string;
  expiresAt?: string;
  author: string;
  isPublished: boolean;
  isPinned?: boolean;
}

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "content_admin" | "finance_admin" | "support_admin";
  permissions: string[];
  addedAt: string;
  lastActiveAt?: string;
  status: "active" | "suspended";
}

export const INITIAL_ADMIN_EMAILS = [
  "playeraung449@gmail.com",
  "mobilekyaltagon148@gmail.com"
];

// =========================================================================
// QUIZ, ASSIGNMENT & CODING PROJECT MANAGEMENT INTERFACES (ADMIN & STUDENT)
// =========================================================================

export type QuestionType = 
  | "multiple_choice" 
  | "true_false" 
  | "multiple_select" 
  | "code_output" 
  | "code_completion" 
  | "short_answer";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export interface AdminQuestion {
  id: string;
  type: QuestionType;
  question: string; // in Myanmar & English
  codeSnippet?: string; // Optional code snippet
  options?: string[]; // Multiple choice / True/False / Multiple Select options
  correctAnswer: any; // index number, string, array of indices/strings
  explanation: string; // Myanmar explanation
  difficulty: QuestionDifficulty;
  points: number; // e.g. 10
  xpReward: number; // e.g. 15
}

export interface QuizSettings {
  timeLimitMinutes: number; // 0 = Unlimited
  passingScorePercent: number; // e.g. 80%
  maxAttempts: number; // 0 = Unlimited
  randomQuestionOrder: boolean;
  questionPoolSize?: number; // 0 or undefined = use all questions
  showCorrectAnswers: boolean;
  showExplanation: boolean;
  xpReward: number;
  coinsReward?: number;
}

export interface QuizAccessConfig {
  accessType: "free" | "premium" | "course" | "module";
  courseId?: string;
  moduleId?: string;
}

export interface AdminQuiz {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  courseId?: string;
  courseTitle?: string;
  moduleId?: string;
  status: "Draft" | "Published" | "Unpublished" | "Archived";
  accessConfig: QuizAccessConfig;
  settings: QuizSettings;
  questions: AdminQuestion[];
  analytics?: {
    totalAttempts: number;
    totalPassed: number;
    totalFailed: number;
    avgScore: number;
    avgTimeSeconds: number;
    passRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type AssignmentType = "practice_task" | "coding_exercise" | "written_assignment" | "mini_project";
export type AssignmentSubmissionType = "text" | "code" | "file_upload" | "project_link";

export interface AdminAssignment {
  id: string;
  title: string;
  type: AssignmentType;
  description: string;
  instructions: string[]; // step by step
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Professional";
  deadline?: string; // ISO date string or optional
  maxScore: number;
  passingScore: number;
  xpReward: number;
  coinsReward?: number;
  requiredLessonId?: string;
  requiredLessonTitle?: string;
  courseId?: string;
  courseTitle?: string;
  submissionType: AssignmentSubmissionType;
  accessConfig: {
    accessType: "free" | "premium" | "course" | "module";
    courseId?: string;
    moduleId?: string;
  };
  status: "Draft" | "Published" | "Unpublished" | "Archived";
  starterCode?: string;
  solutionTemplate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectEvaluationMode = "automatic" | "manual" | "hybrid";

export interface ProjectRubricCriterion {
  id: string;
  category: "Code Quality" | "Functionality" | "Problem Solving" | "UI / UX" | "Documentation" | "Best Practices" | "Custom";
  title: string;
  description: string;
  maxPoints: number; // e.g. 20
}

export interface AdminProject {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Professional";
  technologies: string[];
  starterResources: { title: string; url: string; type: "github" | "doc" | "figma" | "zip" }[];
  submissionRequirements: string[];
  evaluationMode: ProjectEvaluationMode;
  grading: {
    maxScore: number;
    passingScore: number;
    xpReward: number;
    coinsReward: number;
    rubric: ProjectRubricCriterion[];
  };
  accessConfig: {
    accessType: "free" | "premium" | "course" | "module";
    courseId?: string;
  };
  status: "Draft" | "Published" | "Unpublished" | "Archived";
  createdAt: string;
  updatedAt: string;
}

export type AssessmentSubmissionStatus = 
  | "pending" 
  | "submitted" 
  | "under_review" 
  | "passed" 
  | "needs_improvement" 
  | "failed";

export interface StudentAssessmentSubmission {
  id: string;
  itemType: "quiz" | "assignment" | "project";
  itemId: string;
  itemTitle: string;
  uid: string;
  userName: string;
  userEmail: string;
  attemptNumber: number;
  submittedAt: string;
  status: AssessmentSubmissionStatus;
  submissionContent: {
    type: "text" | "code" | "file_upload" | "project_link" | "quiz_answers";
    text?: string;
    code?: string;
    language?: string;
    githubUrl?: string;
    liveDemoUrl?: string;
    fileUrl?: string;
    fileName?: string;
    quizAnswers?: Record<string, any>;
  };
  quizResult?: {
    score: number;
    totalPossibleScore: number;
    percentage: number;
    passed: boolean;
    xpEarned: number;
    correctCount: number;
    incorrectCount: number;
    timeSpentSeconds: number;
    questionResults: { questionId: string; correct: boolean; studentAnswer: any; correctAnswer: any }[];
  };
  evaluation?: {
    evaluatedBy: string;
    evaluatedAt: string;
    totalScore: number;
    maxScore: number;
    passed: boolean;
    xpAwarded: number;
    criterionScores: Record<string, number>;
    writtenFeedback: string;
    improvementSuggestions: string[];
  };
  resubmissionAllowed: boolean;
  resubmissionRequested?: boolean;
  previousSubmissionHistory?: {
    attemptNumber: number;
    submittedAt: string;
    content: any;
    score?: number;
    status: AssessmentSubmissionStatus;
    feedback?: string;
  }[];
  antiCheatAnalysis?: {
    isFlagged: boolean;
    flags: string[];
    similarityScore?: number;
    suspiciousReason?: string;
    flaggedAt?: string;
    reviewedByAdmin?: boolean;
  };
}

// =========================================================================
// KIBO AI ADMIN MANAGEMENT & CONTROL INTERFACES
// =========================================================================

export type KiboPersonalityPreset = 
  | "friendly_encouraging" 
  | "patient_socratic" 
  | "educational_structured" 
  | "professional_senior" 
  | "custom";

export type KiboAIModel = 
  | "gemini-3.7-flash" 
  | "gemini-3.1-pro-preview" 
  | "gemini-3.1-flash-lite"
  | "gemini-3.1-flash-tts-preview";

export interface KiboFeatureAvailability {
  lessonExplanation: boolean;
  codeExplanation: boolean;
  codingHints: boolean;
  debuggingGuidance: boolean;
  quizAssistance: boolean;
  projectGuidance: boolean;
  learningRecommendations: boolean;
  studyMotivation: boolean;
  portfolioAdvisor: boolean;
}

export interface KiboTierLimits {
  dailyTotalRequests: number;
  dailyCodeReviews: number;
  dailyDebugRequests: number;
  maxInputLengthChars: number;
  allowStreaming: boolean;
  prioritySpeed?: boolean;
}

export interface KiboPersonalityConfig {
  preset: KiboPersonalityPreset;
  toneName: string;
  encouragementLevel: number; // 1-5
  simplificationLevel: number; // 1-5
  socraticGuidanceLevel: number; // 1-5
  myanmarToneStyle: string;
  signOffPhrase: string;
}

export interface KiboLearningModeConfig {
  prioritizeHintsOverSolutions: boolean;
  enableSocraticQuestioning: boolean;
  blockDirectQuizSolutionDumping: boolean;
  requireStepByStepExplanation: boolean;
  maxHintsBeforeDirectAnswer: number;
}

export interface KiboContextInjectionConfig {
  injectCourseInfo: boolean;
  injectLessonObjectives: boolean;
  injectQuizDetails: boolean;
  injectProjectRubrics: boolean;
  injectUserSkillLevel: boolean;
}

export interface KiboSafetyAndGuardrailsConfig {
  blockMaliciousCode: boolean;
  preventSystemPromptLeakage: boolean;
  preventAcademicDishonesty: boolean;
  contentSafetyThreshold: "strict" | "standard" | "relaxed";
  customBlockedKeywords: string[];
}

export interface KiboCostControlConfig {
  dailyPlatformTokenBudget: number;
  maxTokensPerRequest: number;
  cachingEnabled: boolean;
  rateLimitPerMinute: number;
}

export interface KiboAISettings {
  isEnabled: boolean;
  activeModel: KiboAIModel;
  temperature: number;
  topP: number;
  thinkingLevel: "HIGH" | "LOW" | "MINIMAL" | "DEFAULT";
  maxOutputTokens: number;
  featureAvailability: KiboFeatureAvailability;
  freeUserLimits: KiboTierLimits;
  premiumUserLimits: KiboTierLimits;
  personality: KiboPersonalityConfig;
  learningMode: KiboLearningModeConfig;
  contextInjection: KiboContextInjectionConfig;
  safetyAndGuardrails: KiboSafetyAndGuardrailsConfig;
  costControl: KiboCostControlConfig;
  masterSystemPrompt: string;
  featurePrompts: {
    chatTutor: string;
    codeReview: string;
    debugAssistant: string;
    quizHints: string;
    portfolioAdvisor: string;
  };
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface KiboKnowledgeItem {
  id: string;
  title: string;
  category: "curriculum" | "glossary" | "guidelines" | "platform_rules" | "faq";
  content: string;
  keywords: string[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface KiboPromptVersion {
  id: string;
  versionNumber: number;
  masterSystemPrompt: string;
  featurePrompts: {
    chatTutor: string;
    codeReview: string;
    debugAssistant: string;
    quizHints: string;
    portfolioAdvisor: string;
  };
  activeModel: string;
  personalityPreset: string;
  changeNotes: string;
  savedBy: string;
  timestamp: string;
}

export interface KiboUsageMetric {
  date: string; // YYYY-MM-DD
  totalRequests: number;
  freeRequests: number;
  premiumRequests: number;
  failedRequests: number;
  avgResponseTimeMs: number;
  estimatedTokens: number;
  featureBreakdown: {
    chatTutor: number;
    codeReview: number;
    debugAssistant: number;
    quizHints: number;
    portfolioAdvisor: number;
  };
}

export interface KiboAuditLogRecord {
  id: string;
  action: 
    | "ai_setting_changed" 
    | "limits_changed" 
    | "model_changed" 
    | "prompt_updated" 
    | "kibo_toggled" 
    | "knowledge_updated" 
    | "safety_rule_changed" 
    | "prompt_rollback"
    | "test_simulation_run";
  adminEmail: string;
  adminUid: string;
  details: string;
  targetFeature?: string;
  beforeState?: any;
  afterState?: any;
  timestamp: string;
}

// =========================================================================
// COMMUNICATION & COMMUNITY MANAGEMENT TYPES
// =========================================================================

export type AnnouncementType =
  | "General Announcement"
  | "New Course"
  | "New Lesson"
  | "Premium Announcement"
  | "Maintenance Notice"
  | "Event Announcement"
  | "Important Update";

export type AnnouncementStatus = "draft" | "published" | "unpublished" | "scheduled" | "archived";

export type TargetAudienceType = "all" | "free_users" | "premium_users" | "course_students" | "specific_user";

export interface AdminAnnouncementItem {
  id: string;
  title: string;
  titleMm: string;
  content: string;
  contentMm?: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  targetAudience: TargetAudienceType;
  targetCourseId?: string;
  targetCourseTitle?: string;
  targetUserEmail?: string;
  imageUrl?: string;
  publishDate: string;
  scheduledDate?: string;
  expirationDate?: string;
  isPinned?: boolean;
  viewsCount?: number;
  ctaButtonLabel?: string;
  ctaActionTab?: string;
  ctaExternalUrl?: string;
  createdAt: string;
  updatedAt: string;
  authorDisplayName: string; // e.g. "Code Learn Myanmar Team" (confidential admin alias)
  authorAdminEmail: string;
}

export type AdminNotificationTrigger =
  | "new_course"
  | "new_lesson"
  | "premium_activated"
  | "payment_approved"
  | "payment_rejected"
  | "membership_expired"
  | "support_reply"
  | "challenge_completed"
  | "achievement_unlocked"
  | "system_maintenance"
  | "admin_broadcast"
  | "user_warning"
  | "official_message";

export interface AdminNotificationItem {
  id: string;
  title: string;
  titleMm: string;
  message: string;
  messageMm?: string;
  category: NotificationCategory;
  triggerType: AdminNotificationTrigger;
  targetAudience: TargetAudienceType;
  targetUserId?: string;
  targetUserEmail?: string;
  targetCourseId?: string;
  scheduledFor?: string;
  sentAt?: string;
  status: "sent" | "scheduled" | "cancelled" | "draft";
  totalRecipients: number;
  readCount: number;
  clickCount?: number;
  senderDisplayName: string; // "Code Learn Myanmar Administration"
  senderAdminEmail: string;
  actionTab?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface CommunityCategoryItem {
  id: string;
  name: string;
  nameMm: string;
  description: string;
  icon: string;
  postCount: number;
  isEnabled: boolean;
  order: number;
}

export interface ModerationAuditLog {
  id: string;
  action:
    | "announcement_created"
    | "announcement_updated"
    | "announcement_published"
    | "announcement_unpublished"
    | "announcement_scheduled"
    | "announcement_archived"
    | "announcement_deleted"
    | "notification_sent"
    | "notification_scheduled"
    | "notification_cancelled"
    | "post_approved"
    | "post_hidden"
    | "post_removed"
    | "post_pinned"
    | "post_locked"
    | "comment_hidden"
    | "comment_removed"
    | "report_resolved"
    | "report_rejected"
    | "user_warned"
    | "user_restricted"
    | "user_restored"
    | "category_updated";
  adminEmail: string;
  adminName: string;
  details: string;
  targetId?: string;
  targetType?: "announcement" | "notification" | "post" | "comment" | "report" | "user" | "category";
  timestamp: string;
}

// =========================================================================
// ADMIN SETTINGS, RBAC & SECURITY SYSTEM TYPES
// =========================================================================

export type AdminRoleType =
  | "super_admin"
  | "content_admin"
  | "finance_admin"
  | "community_admin"
  | "support_admin";

export type AdminPermission =
  | "VIEW_USERS"
  | "EDIT_USERS"
  | "DELETE_USERS"
  | "MANAGE_ROLES"
  | "MANAGE_COURSES"
  | "MANAGE_LESSONS"
  | "MANAGE_QUIZZES"
  | "MANAGE_ASSIGNMENTS"
  | "MANAGE_PROJECTS"
  | "PUBLISH_CONTENT"
  | "MANAGE_PREMIUM"
  | "VERIFY_PAYMENTS"
  | "MANAGE_REFUNDS"
  | "MANAGE_COMMUNITY"
  | "MODERATE_CONTENT"
  | "MANAGE_SUPPORT"
  | "MANAGE_ANNOUNCEMENTS"
  | "MANAGE_KIBO"
  | "VIEW_ANALYTICS"
  | "MANAGE_SETTINGS"
  | "MANAGE_SECURITY"
  | "VIEW_AUDIT_LOGS"
  | "TOGGLE_MAINTENANCE"
  | "EXPORT_DATA";

export interface PermissionDefinition {
  id: AdminPermission;
  name: string;
  nameMm: string;
  description: string;
  category: "users" | "content" | "finance" | "community" | "support" | "system" | "analytics";
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  { id: "VIEW_USERS", name: "View Users", nameMm: "အသုံးပြုသူများကို ကြည့်ရှုခြင်း", description: "View student directory and learner profiles", category: "users" },
  { id: "EDIT_USERS", name: "Edit Users", nameMm: "အသုံးပြုသူအချက်အလက် ပြင်ဆင်ခြင်း", description: "Modify learner XP, coins, streak, and status", category: "users" },
  { id: "DELETE_USERS", name: "Delete Users", nameMm: "အသုံးပြုသူ ဖျက်ပစ်ခြင်း", description: "Suspend or remove user accounts (High risk)", category: "users" },
  { id: "MANAGE_ROLES", name: "Manage Roles", nameMm: "အက်ဒမင်ရာထူးနှင့် ခွင့်ပြုချက်များ သတ်မှတ်ခြင်း", description: "Assign and revoke administrator roles and permissions", category: "system" },
  
  { id: "MANAGE_COURSES", name: "Manage Courses", nameMm: "သင်ရိုးများ စီမံခန့်ခွဲခြင်း", description: "Create, edit, and organize courses", category: "content" },
  { id: "MANAGE_LESSONS", name: "Manage Lessons", nameMm: "သင်ခန်းစာများ စီမံခန့်ခွဲခြင်း", description: "Create and edit 23-standard lessons and code examples", category: "content" },
  { id: "MANAGE_QUIZZES", name: "Manage Quizzes", nameMm: "မေးခွန်းဉာဏ်စမ်းများ စီမံခြင်း", description: "Design 10-question quizzes and passing criteria", category: "content" },
  { id: "MANAGE_ASSIGNMENTS", name: "Manage Assignments", nameMm: "လက်တွေ့လေ့ကျင့်ခန်းများ စီမံခြင်း", description: "Create assignments and evaluate student submissions", category: "content" },
  { id: "MANAGE_PROJECTS", name: "Manage Projects", nameMm: "ပရောဂျက်များ စီမံခြင်း", description: "Create mini and final portfolio projects", category: "content" },
  { id: "PUBLISH_CONTENT", name: "Publish Content", nameMm: "သင်ရိုးအကြောင်းအရာ ထုတ်ဝေခြင်း", description: "Publish or unpublish curriculum units to live platform", category: "content" },
  
  { id: "MANAGE_PREMIUM", name: "Manage Premium", nameMm: "ပရီမီယံ အစီအစဉ်များ စီမံခြင်း", description: "Configure VIP pricing, duration, and feature access", category: "finance" },
  { id: "VERIFY_PAYMENTS", name: "Verify Payments", nameMm: "ငွေလွှဲပြေစာများ စစ်ဆေးအတည်ပြုခြင်း", description: "Approve, reject, or request info on KBZPay/WavePay slips", category: "finance" },
  { id: "MANAGE_REFUNDS", name: "Manage Refunds", nameMm: "ငွေပြန်အမ်းမှု တောင်းဆိုချက်များ စီမံခြင်း", description: "Review and process student refund requests (High risk)", category: "finance" },
  
  { id: "MANAGE_COMMUNITY", name: "Manage Community", nameMm: "ကွန်မြူနတီ စီမံခန့်ခွဲခြင်း", description: "Manage forum categories, post pins, and locks", category: "community" },
  { id: "MODERATE_CONTENT", name: "Moderate Content", nameMm: "မသင့်လျော်သော အကြောင်းအရာများ ထိန်းကျောင်းခြင်း", description: "Review reports, hide toxic posts, issue warnings", category: "community" },
  { id: "MANAGE_ANNOUNCEMENTS", name: "Manage Announcements", nameMm: "ကြေညာချက်များနှင့် အသိပေးချက်များ စီမံခြင်း", description: "Publish broadcasts, push notifications, and banners", category: "community" },
  
  { id: "MANAGE_SUPPORT", name: "Manage Support", nameMm: "အကူအညီတောင်းဆိုချက်များ ဖြေရှင်းခြင်း", description: "Respond to support tickets, bug reports, and account help", category: "support" },
  { id: "MANAGE_KIBO", name: "Manage Kibo AI", nameMm: "ကီဘို AI စနစ် ထိန်းချုပ်ခြင်း", description: "Configure AI models, system prompts, quotas, and safety rules", category: "system" },
  
  { id: "VIEW_ANALYTICS", name: "View Analytics", nameMm: "ပလက်ဖောင်း စာရင်းအင်းများ ကြည့်ရှုခြင်း", description: "Access learning, user, revenue, and Kibo telemetry reports", category: "analytics" },
  { id: "MANAGE_SETTINGS", name: "Manage Settings", nameMm: "စနစ် အထွေထွေ Setting များ ပြင်ဆင်ခြင်း", description: "Configure branding, contacts, registration, and notification rules", category: "system" },
  { id: "MANAGE_SECURITY", name: "Manage Security", nameMm: "လုံခြုံရေးနှင့် ဆက်ရှင်များ စီမံခြင်း", description: "Inspect active admin sessions, lockouts, and authentication rules", category: "system" },
  { id: "VIEW_AUDIT_LOGS", name: "View Audit Logs", nameMm: "စနစ်မှတ်တမ်းများ စစ်ဆေးခြင်း", description: "Access comprehensive administrative audit trails", category: "system" },
  { id: "TOGGLE_MAINTENANCE", name: "Toggle Maintenance", nameMm: "ပြုပြင်ထိန်းသိမ်းမှု မုဒ် အဖွင့်/အပိတ်", description: "Switch platform into maintenance mode with admin bypass (High risk)", category: "system" },
  { id: "EXPORT_DATA", name: "Export Data", nameMm: "အချက်အလက်များ ဒေါင်းလုဒ်ထုတ်ယူခြင်း", description: "Export CSV and JSON administrative reports with privacy compliance", category: "analytics" }
];

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRoleType, AdminPermission[]> = {
  super_admin: [
    "VIEW_USERS", "EDIT_USERS", "DELETE_USERS", "MANAGE_ROLES",
    "MANAGE_COURSES", "MANAGE_LESSONS", "MANAGE_QUIZZES", "MANAGE_ASSIGNMENTS", "MANAGE_PROJECTS", "PUBLISH_CONTENT",
    "MANAGE_PREMIUM", "VERIFY_PAYMENTS", "MANAGE_REFUNDS",
    "MANAGE_COMMUNITY", "MODERATE_CONTENT", "MANAGE_ANNOUNCEMENTS",
    "MANAGE_SUPPORT", "MANAGE_KIBO", "VIEW_ANALYTICS",
    "MANAGE_SETTINGS", "MANAGE_SECURITY", "VIEW_AUDIT_LOGS", "TOGGLE_MAINTENANCE", "EXPORT_DATA"
  ],
  content_admin: [
    "MANAGE_COURSES", "MANAGE_LESSONS", "MANAGE_QUIZZES", "MANAGE_ASSIGNMENTS", "MANAGE_PROJECTS", "PUBLISH_CONTENT",
    "VIEW_ANALYTICS", "VIEW_USERS"
  ],
  finance_admin: [
    "MANAGE_PREMIUM", "VERIFY_PAYMENTS", "MANAGE_REFUNDS",
    "VIEW_ANALYTICS", "EXPORT_DATA", "VIEW_USERS"
  ],
  community_admin: [
    "MANAGE_COMMUNITY", "MODERATE_CONTENT", "MANAGE_ANNOUNCEMENTS",
    "VIEW_USERS", "VIEW_ANALYTICS"
  ],
  support_admin: [
    "MANAGE_SUPPORT", "VIEW_USERS", "EDIT_USERS", "VIEW_ANALYTICS"
  ]
};

export interface AdminAccountDetail {
  id: string;
  uid?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: AdminRoleType;
  customPermissions?: AdminPermission[];
  status: "active" | "suspended" | "pending_invitation";
  phone?: string;
  department?: string;
  isPrimarySuperAdmin?: boolean; // Protects playeraung449@gmail.com and mobilekyaltagon148@gmail.com
  twoFactorEnabled?: boolean;
  addedAt: string;
  addedByAdminEmail: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  lastLoginIp?: string;
  failedLoginAttempts?: number;
}

export interface AdminSessionInfo {
  sessionId: string;
  adminUid: string;
  adminEmail: string;
  adminName: string;
  role: AdminRoleType;
  ipAddress: string;
  userAgent: string;
  deviceType: "Desktop (Mac/PC)" | "Mobile Phone" | "Tablet" | "Unknown";
  browser: string;
  location?: string;
  loginAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent: boolean;
  status: "active" | "expired" | "revoked";
}

export interface PlatformSystemSettings {
  id: "platform_settings";
  // General Platform Branding
  platformName: string;
  platformNameMm: string;
  platformLogoUrl: string;
  platformFaviconUrl?: string;
  tagline: string;
  taglineMm: string;
  platformDescription: string;
  platformDescriptionMm: string;
  
  // Contact Information
  contactEmail: string;
  contactPhone: string;
  contactTelegramChannel: string;
  contactTelegramBot: string;
  contactViber: string;
  officeAddressMm: string;
  officeAddressEn: string;
  supportHoursMm: string;
  
  // Maintenance Mode
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceTitleMm: string;
  maintenanceMessageMm: string;
  maintenanceEstimatedEndTime?: string;
  maintenanceAllowAdminBypass: boolean;
  
  // Registration & User Auth Settings
  allowRegistrations: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: "student";
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  defaultFreeQuotaCoins: number;
  defaultFreeQuotaXp: number;
  
  // Notification & Webhook Settings
  emailPaymentAlerts: boolean;
  telegramAdminAlerts: boolean;
  telegramWebhookUrl?: string;
  inAppAdminAlerts: boolean;
  notificationRetentionDays: number;
  
  // Premium & Billing System Settings
  freeTrialDays: number;
  gracePeriodDays: number;
  currencyFormat: "MMK" | "Ks";
  autoExpiryBufferHours: number;
  maxPaymentSlipUploadMb: number;
  
  // Community Settings
  requirePostApproval: boolean;
  profanityFilterEnabled: boolean;
  rateLimitPostsPer10Min: number;
  allowImagesInComments: boolean;
  reputationPointsPerHelpful: number;
  
  // Security & Session Settings
  adminSessionTimeoutMinutes: number; // e.g. 15, 30, 60, 240, 480, 1440
  enableIdleLock: boolean;
  idleLockTimeoutMinutes: number;
  enforce2StepConfirmation: boolean;
  maxActiveSessionsPerAdmin: number;

  // Data Retention & Privacy Governance Settings
  dataRetention?: DataRetentionPolicySettings;
  
  updatedAt: string;
  updatedByAdminEmail: string;
  updatedByAdminUid: string;
}

export type SecurityAuditAction =
  | "ADMIN_LOGIN"
  | "ADMIN_LOGOUT"
  | "SESSION_REVOKED"
  | "ALL_SESSIONS_REVOKED"
  | "SESSION_EXPIRED"
  | "SETTINGS_UPDATED"
  | "MAINTENANCE_TOGGLED"
  | "ROLE_ASSIGNED"
  | "ROLE_UPDATED"
  | "ROLE_REVOKED"
  | "ADMIN_INVITED"
  | "ADMIN_SUSPENDED"
  | "ADMIN_RESTORED"
  | "ADMIN_DELETED"
  | "USER_DELETED"
  | "USER_ACCOUNT_DELETED"
  | "USER_DATA_ANONYMIZED"
  | "USER_DATA_EXPORTED"
  | "ADMIN_VIEWED_USER_DATA"
  | "DATA_RETENTION_CLEANUP"
  | "PAYMENT_PROOF_PURGED"
  | "USER_SUSPENDED"
  | "USER_RESTORED"
  | "COURSE_DELETED"
  | "COURSE_STATUS_CHANGED"
  | "LESSON_DELETED"
  | "PAYMENT_APPROVED"
  | "PAYMENT_REJECTED"
  | "REFUND_APPROVED"
  | "REFUND_REJECTED"
  | "PAYMENT_ACCOUNT_CHANGED"
  | "PRICE_PLAN_CHANGED"
  | "SENSITIVE_CONFIRMATION_PASSED"
  | "SENSITIVE_CONFIRMATION_FAILED"
  | "EXPORT_GENERATED"
  | "COMMUNITY_PURGED"
  | "KIBO_SAFETY_CHANGED"
  | "SYSTEM_HEALTH_CHECK"
  | "BACKUP_CREATED"
  | "BACKUP_VERIFIED"
  | "BACKUP_DELETED"
  | "BACKUP_LOCKED"
  | "BACKUP_DOWNLOADED"
  | "BACKUP_SCHEDULE_UPDATED"
  | "RECOVERY_STARTED"
  | "RECOVERY_COMPLETED"
  | "RECOVERY_FAILED"
  | "RECOVERY_DRILL_EXECUTED"
  | "DATA_VALIDATION_RAN"
  | "INCIDENT_RECORD_CREATED"
  | "INCIDENT_RECORD_UPDATED"
  | "INCIDENT_CASE_UPDATED"
  | "SECURITY_ALERT_STATUS_CHANGED"
  | "SECURITY_TEST_RECORDED"
  | "VULNERABILITY_REVIEW_UPDATED";

export interface SecurityAuditRecord {
  id: string;
  adminUid: string;
  adminEmail: string;
  adminName: string;
  adminRole: AdminRoleType;
  action: SecurityAuditAction;
  targetType: "user" | "course" | "lesson" | "payment" | "refund" | "setting" | "session" | "role" | "system" | "admin" | "backup" | "incident" | "security_alert" | "security_test" | "vulnerability_review" | "incident_case";
  targetId?: string;
  targetName?: string;
  ipAddress?: string;
  deviceInfo?: string;
  status: "success" | "warning" | "failure" | "blocked";
  details: string;
  detailsMm?: string;
  changesPayload?: {
    before?: any;
    after?: any;
  };
  timestamp: string;
}

// ============================================================================
// BACKUP & DISASTER RECOVERY ARCHITECTURE TYPES
// ============================================================================

export type BackupType = "full" | "incremental" | "config" | "database_subset" | "event_triggered";
export type BackupFrequency = "realtime" | "daily" | "weekly" | "monthly" | "event_based" | "manual";
export type BackupStatus = "completed" | "in_progress" | "verified" | "failed" | "corrupted" | "locked";
export type BackupStorageTarget = "primary_firestore" | "local_encrypted_cache" | "cloud_storage_mirror" | "airgap_export";

export interface BackupCategoryDataCount {
  usersCount: number;
  coursesCount: number;
  lessonsCount: number;
  quizzesCount: number;
  assignmentsCount: number;
  projectsCount: number;
  paymentsCount: number;
  membershipsCount: number;
  settingsCount: number;
  auditLogsCount: number;
}

export interface BackupSnapshotRecord {
  id: string;
  title: string;
  description: string;
  type: BackupType;
  frequency: BackupFrequency;
  status: BackupStatus;
  storageTargets: BackupStorageTarget[];
  createdAt: string;
  createdByAdminEmail: string;
  createdByAdminUid: string;
  createdByAdminName: string;
  totalSizeKb: number;
  integrityHash: string; // SHA-256 / checksum string
  isEncrypted: boolean;
  isLocked: boolean; // Protect from auto-cleanup & accidental deletion
  version: string;
  retentionExpiryDate?: string;
  dataSummary: BackupCategoryDataCount;
  payload?: {
    users?: any[];
    courses?: any[];
    lessons?: any[];
    quizzes?: any[];
    assignments?: any[];
    projects?: any[];
    payments?: any[];
    refunds?: any[];
    memberships?: any[];
    platformSettings?: any;
    kiboSettings?: any;
    announcements?: any[];
    auditLogs?: any[];
    securityAuditLogs?: any[];
  };
}

export interface BackupSchedulePolicy {
  id: string;
  name: string;
  nameMm: string;
  frequency: BackupFrequency;
  targetCollections: string[];
  type: BackupType;
  retentionDays: number;
  autoVerify: boolean;
  encryptionEnabled: boolean;
  multiTargetMirroring: boolean;
  lastRunTimestamp?: string;
  nextRunTimestamp?: string;
  enabled: boolean;
  priorityOrder: number;
}

export interface DataValidationCheckItem {
  id: string;
  domain: "users" | "progress" | "premium" | "payments" | "courses" | "lessons" | "admin" | "security_logs";
  name: string;
  nameMm: string;
  status: "passed" | "warning" | "failed" | "skipped";
  recordsCount: number;
  validRecords: number;
  anomaliesFound: number;
  details: string;
  detailsMm: string;
  checkedAt: string;
}

export interface DataValidationReport {
  id: string;
  timestamp: string;
  triggeredBy: string;
  overallStatus: "healthy" | "warning" | "critical";
  healthScore: number; // 0 - 100%
  items: DataValidationCheckItem[];
  summary: string;
  summaryMm: string;
}

export type DisasterScenarioType =
  | "accidental_deletion"
  | "database_corruption"
  | "incorrect_configuration"
  | "failed_deployment"
  | "auth_failure"
  | "third_party_outage"
  | "storage_failure";

export interface DisasterScenarioPlaybook {
  id: DisasterScenarioType;
  title: string;
  titleMm: string;
  severity: "P1 - Critical" | "P2 - High" | "P3 - Medium";
  descriptionMm: string;
  estimatedRTO: string; // Recovery Time Objective (e.g. "< 5 mins")
  estimatedRPO: string; // Recovery Point Objective (e.g. "< 15 mins")
  priorityServices: string[];
  stepByStepSteps: {
    stepNumber: number;
    action: string;
    actionMm: string;
    commandOrGuide: string;
  }[];
  recommendedAction: string;
}

export interface DisasterDrillResult {
  id: string;
  drillName: string;
  scenario: DisasterScenarioType;
  timestamp: string;
  executedByAdminName: string;
  executedByAdminEmail: string;
  durationSeconds: number;
  status: "success" | "warning" | "failure";
  readinessScore: number; // 0 - 100%
  testedSteps: string[];
  validationReportId?: string;
  notes: string;
}

export interface IncidentRecord {
  id: string;
  incidentNumber: string; // e.g. "INC-2026-0801"
  incidentType: DisasterScenarioType | "security_breach" | "other";
  title: string;
  severity: "P1 - Critical" | "P2 - High" | "P3 - Medium" | "P4 - Low";
  status: "investigating" | "mitigated" | "resolved" | "monitoring";
  affectedServices: string[];
  startTime: string;
  resolvedTime?: string;
  leadAdminName: string;
  leadAdminEmail: string;
  rootCause: string;
  recoveryActionTaken: string;
  recoveryResult: string;
  dataLossAssessment: string;
  postMortemNotes: string;
  createdAt: string;
  updatedAt: string;
}

// =========================================================================
// ENTERPRISE CONTINUOUS SECURITY MONITORING & TESTING SUITE TYPES
// =========================================================================

export type SecurityEventSeverity = "information" | "low" | "medium" | "high" | "critical";

export type SecurityMonitoringEventType =
  | "failed_login"
  | "unauthorized_access"
  | "permission_error"
  | "suspicious_account_activity"
  | "admin_security_event"
  | "payment_security_event"
  | "api_error"
  | "password_reset"
  | "account_recovery"
  | "admin_login"
  | "unusual_auth_pattern"
  | "rate_limit_exceeded"
  | "client_tampering_attempt"
  | "kibo_security_event";

export interface SecurityMonitoringEvent {
  id: string;
  eventType: SecurityMonitoringEventType;
  userId?: string;
  userEmail?: string;
  adminId?: string;
  adminEmail?: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
  result: "blocked" | "allowed" | "flagged" | "mitigated" | "error";
  severity: SecurityEventSeverity;
  details: string;
  detailsMm: string;
  endpointOrResource?: string;
  isAlertTriggered?: boolean;
  alertId?: string;
  status: "new" | "investigating" | "resolved" | "false_positive";
  resolvedAt?: string;
  resolvedBy?: string;
}

export type SecurityAlertType =
  | "repeated_unauthorized_access"
  | "abnormal_admin_activity"
  | "large_failed_logins"
  | "unexpected_payment_activity"
  | "privilege_escalation"
  | "api_abuse"
  | "suspicious_recovery";

export interface SecurityAlert {
  id: string;
  alertType: SecurityAlertType;
  title: string;
  titleMm: string;
  severity: "medium" | "high" | "critical";
  triggeredAt: string;
  eventCount: number;
  status: "active" | "acknowledged" | "mitigated" | "resolved";
  details: string;
  detailsMm: string;
  affectedEntity: string;
  recommendedActions: string[];
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export type SecurityTestCategory =
  | "access_control"
  | "database_security"
  | "premium_security"
  | "payment_security"
  | "api_security"
  | "kibo_security";

export interface SecurityTestCase {
  id: string;
  category: SecurityTestCategory;
  name: string;
  nameMm: string;
  description: string;
  descriptionMm: string;
  severity: SecurityEventSeverity;
  ruleTested: string;
  executionType: "automated" | "simulation" | "manual";
  expectedOutcome: string;
  expectedOutcomeMm: string;
  lastRunAt?: string;
  lastResult?: "passed" | "warning" | "failed" | "not_run";
  lastDetails?: string;
  lastExecutionMs?: number;
}

export interface SecurityTestRecord {
  id: string;
  testCaseId: string;
  testName: string;
  testCategory: SecurityTestCategory;
  testDate: string;
  tester: string;
  testerRole: string;
  result: "passed" | "warning" | "failed";
  issueFound: string;
  issueFoundMm: string;
  severity: SecurityEventSeverity;
  resolution: string;
  resolutionMm: string;
  executionTimeMs: number;
  logSummary: string;
  evidencePayload?: Record<string, any>;
}

export type VulnerabilityDomain =
  | "authentication"
  | "database_rules"
  | "api_security"
  | "admin_permissions"
  | "payment_security"
  | "storage_rules";

export interface VulnerabilityReviewItem {
  id: string;
  domain: VulnerabilityDomain;
  title: string;
  titleMm: string;
  scopeDescription: string;
  checklist: {
    item: string;
    checked: boolean;
    verificationMethod: string;
  }[];
  status: "secure" | "needs_attention" | "critical_gap";
  riskLevel: "low" | "medium" | "high" | "critical";
  reviewedBy?: string;
  reviewedAt?: string;
  notes: string;
  remediationPlan: string;
  signOffRequired: boolean;
  isSignedOff: boolean;
}

export type DeploymentCheckDomain =
  | "production_config"
  | "security_rules"
  | "api_config"
  | "admin_permissions"
  | "database_access"
  | "storage_access";

export interface DeploymentSecurityCheckItem {
  id: string;
  checkDomain: DeploymentCheckDomain;
  name: string;
  nameMm: string;
  descriptionMm: string;
  isMandatory: boolean;
  status: "ready" | "pending" | "failed";
  verifiedBy?: string;
  verifiedAt?: string;
  verificationDetails: string;
  automatedCheckAvailable: boolean;
}

export type IncidentLifecyclePhase =
  | "detect"
  | "assess"
  | "contain"
  | "investigate"
  | "recover"
  | "review";

export interface IncidentResponseCase {
  id: string;
  incidentNumber: string; // e.g. "SEC-INC-2026-081"
  title: string;
  titleMm: string;
  currentPhase: IncidentLifecyclePhase;
  severity: "P1 - Critical" | "P2 - High" | "P3 - Medium" | "P4 - Low";
  threatVector: string;
  affectedComponents: string[];
  startTime: string;
  containedAt?: string;
  recoveredAt?: string;
  resolvedAt?: string;
  leadAdminName: string;
  leadAdminEmail: string;
  phaseHistory: {
    phase: IncidentLifecyclePhase;
    enteredAt: string;
    completedAt?: string;
    completedBy?: string;
    notes: string;
    actionTaken: string;
  }[];
  postMortemReport?: string;
  preventiveMeasures?: string[];
  status: "active" | "mitigated" | "closed";
}

// =========================================================================
// CONTINUOUS PERFORMANCE MONITORING & TELEMETRY TYPES
// =========================================================================

export interface PageLoadMetric {
  id: string;
  route: string;
  url: string;
  dnsTimeMs: number;
  tcpTimeMs: number;
  ttfbMs: number;
  domInteractiveMs: number;
  domContentLoadedMs: number;
  loadCompleteMs: number;
  fcpMs?: number; // First Contentful Paint
  lcpMs?: number; // Largest Contentful Paint
  cls?: number;   // Cumulative Layout Shift
  inpMs?: number; // Interaction to Next Paint
  timestamp: string;
}

export interface ApiLatencyMetric {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  status: number;
  durationMs: number;
  requestSizeKb?: number;
  responseSizeKb?: number;
  isSlow: boolean; // > 800ms
  error?: string;
  timestamp: string;
}

export interface DatabaseLatencyMetric {
  id: string;
  operation: "getDoc" | "getDocs" | "setDoc" | "updateDoc" | "deleteDoc" | "query" | "batch" | "transaction";
  collectionName: string;
  durationMs: number;
  documentCount?: number;
  fromCache: boolean;
  isSlow: boolean; // > 400ms
  error?: string;
  timestamp: string;
}

export interface ErrorTrackingMetric {
  id: string;
  type: "js_exception" | "unhandled_promise" | "api_error" | "database_error" | "ai_stream_error" | "network_error";
  message: string;
  stack?: string;
  url: string;
  severity: "low" | "medium" | "high" | "critical";
  count: number;
  firstSeen: string;
  lastSeen: string;
  resolved: boolean;
}

export interface ResourcePerformanceMetric {
  id: string;
  name: string;
  shortName: string;
  initiatorType: "script" | "css" | "img" | "fetch" | "xmlhttprequest" | "font" | "other";
  transferSizeKb: number;
  decodedSizeKb: number;
  durationMs: number;
  isCached: boolean;
  isOversized: boolean; // > 400KB
  timestamp: string;
}

export interface KiboAiPerformanceMetric {
  id: string;
  feature: "chat" | "code_review" | "debug" | "hint" | "assessment" | "portfolio";
  timeToFirstTokenMs?: number;
  totalDurationMs: number;
  tokensPerSec?: number;
  streamMode: "streaming" | "non_streaming" | "local_fallback" | "cached";
  promptLength: number;
  responseLength: number;
  status: "success" | "fallback" | "error";
  error?: string;
  timestamp: string;
}

export interface SlowFeatureDiagnostic {
  id: string;
  featureName: string;
  featureNameMm: string;
  category: "route" | "api" | "database" | "ai" | "asset";
  avgLatencyMs: number;
  p95LatencyMs: number;
  callCount: number;
  errorRatePct: number;
  impactLevel: "low" | "medium" | "high" | "critical";
  bottleneckReason: string;
  bottleneckReasonMm: string;
  suggestedOptimization: string;
  suggestedOptimizationMm: string;
  autoFixAvailable: boolean;
}

export interface PerformanceScoreSummary {
  overallScore: number; // 0 - 100
  pageLoadScore: number; // 0 - 100
  pageLoadAvgMs: number;
  pageLoadGrade: "A+" | "A" | "B" | "C" | "D" | "F";
  apiAvgLatencyMs: number;
  apiSuccessRatePct: number;
  apiSlowCallsCount: number;
  dbAvgLatencyMs: number;
  dbCacheHitRatePct: number;
  dbSlowQueriesCount: number;
  errorRatePct: number;
  totalActiveErrors: number;
  totalResourcesCount: number;
  totalTransferredKb: number;
  totalDecodedKb: number;
  totalBytesSavedKb: number;
  kiboAvgLatencyMs: number;
  kiboSuccessRatePct: number;
  kiboStreamingRate: number; // chars / sec
  activeAnomaliesCount: number;
  status: "optimal" | "good" | "degraded" | "critical";
  lastAuditTimestamp: string;
}

export interface AutoOptimizationAction {
  id: string;
  name: string;
  nameMm: string;
  description: string;
  descriptionMm: string;
  category: "cache_purge" | "data_saver" | "query_dedup" | "ai_precaching" | "asset_compression" | "dom_cleanup";
  status: "idle" | "running" | "applied";
  lastAppliedAt?: string;
  estimatedGain: string;
  estimatedGainMm: string;
}
