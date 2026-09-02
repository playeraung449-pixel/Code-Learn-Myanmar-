/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  Check, 
  HelpCircle, 
  Wallet, 
  CreditCard, 
  QrCode, 
  Coins, 
  Upload, 
  Clock, 
  Settings, 
  AlertCircle, 
  Trash2, 
  Calendar, 
  X, 
  Lock,
  MessageSquare,
  FileText,
  Code,
  Award,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Crown,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  UserMinus,
  UserPlus,
  Search,
  FileSpreadsheet,
  Download,
  Eye,
  RotateCcw,
  FileCheck,
  Copy,
  Receipt,
  Scale,
  ShieldAlert,
  DollarSign,
  Info,
  ArrowRight,
  Send,
  BookOpen,
  Video,
  Layers,
  Terminal,
  GraduationCap,
  FolderArchive,
  FileCode,
  FileCode2,
  PlayCircle,
  BookMarked,
  Database,
  Smartphone,
  Layout,
  CheckCircle
} from "lucide-react";
import { UserProfile, PaymentRequest, PaymentSettings, RefundRequest, PaymentDispute, PaymentAuditLog, TelegramAccessRequest, TelegramChannelSettings } from "../types";
import { 
  submitPaymentRequest, 
  getPaymentRequestsForUser, 
  getAllPaymentRequests, 
  updatePaymentRequestStatus, 
  getPaymentSettings, 
  savePaymentSettings,
  saveUserProfile,
  adminActivateUserPremium,
  adminDeactivateUserPremium,
  adminSimpleExtendUserPremium,
  saveRefundRequest,
  getRefundRequestsForUser,
  getAllRefundRequests,
  updateRefundRequestStatus,
  savePaymentDispute,
  getPaymentDisputesForUser,
  getAllPaymentDisputes,
  updatePaymentDispute,
  getPaymentAuditLogs,
  addPaymentAuditLog,
  detectRefundFraud
} from "../lib/db";
import {
  getTelegramSettings,
  saveTelegramSettings,
  getAllTelegramRequests,
  approveTelegramAccessRequest,
  rejectTelegramAccessRequest,
  DEFAULT_TELEGRAM_SETTINGS
} from "../utils/telegramService";
import TelegramVideoHubModal from "../components/TelegramVideoHubModal";
import KiboMascot from "../components/KiboMascot";
import { 
  isUserPremium, 
  isUserPremiumExpired, 
  getPremiumStatusDetails, 
  getPremiumFeatureAccess, 
  verifyPremiumWithServer,
  PREMIUM_FEATURE_DEFINITIONS
} from "../utils/premiumSecurity";

const dataURLtoBlob = (dataurl: string): Blob | null => {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("dataURLtoBlob conversion error", e);
    return null;
  }
};

interface PremiumPageProps {
  user: UserProfile;
  firebaseUser: any;
  onRefreshUser: () => void;
}

export default function PremiumPage({ user, firebaseUser, onRefreshUser }: PremiumPageProps) {
  const [activeTab, setActiveTab] = useState<"plans" | "submissions" | "refunds" | "disputes" | "policy" | "admin">("plans");
  const [adminSubTab, setAdminSubTab] = useState<"verifications" | "refunds" | "disputes" | "policy_config" | "audit_trail">("verifications");
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "six_months" | "lifetime">("six_months");
  
  // Payment configurations (configurable by Admin, default values exist)
  const [paymentConfig, setPaymentConfig] = useState<PaymentSettings>({
    settingsId: "payment_info",
    kpayNumber: "09426012797",
    kpayName: "Aung Zaw Myint",
    waveNumber: "09792328651",
    waveName: "Htay Htay Hlaing",
    priceMonthlyMMK: 5000,
    priceMonthlyCoins: 100,
    priceSixMonthsMMK: 25000,
    priceSixMonthsCoins: 500,
    priceLifetimeMMK: 60000,
    priceLifetimeCoins: 1000,
    refundEligibilityDays: 7,
    refundProcessingDaysText: "၁ - ၃ ရုံးဖွင့်ရက်အတွင်း (1-3 working days)",
    refundEnabled: true,
    disputesEnabled: true,
    refundPolicyText: "ကျသင့်ငွေ ပြန်အမ်းခြင်း (Refund) ကို ဝယ်ယူပြီး ၇ ရက်အတွင်း နည်းပညာပိုင်းဆိုင်ရာ အဆင်မပြေမှု သို့မဟုတ် မတော်တဆ မှားယွင်းဝယ်ယူမှုများအတွက် လျှောက်ထားနိုင်ပါသည်။",
    cancellationPolicyText: "Pending အဆင့် ငွေလွှဲတောင်းဆိုမှုများအား Admin မစစ်ဆေးမီ ကျောင်းသားကိုယ်တိုင် ချက်ချင်း ပယ်ဖျက်နိုင်ပါသည်။",
    termsOfServiceText: "မမှန်မကန် ငွေလွှဲပြေစာ သို့မဟုတ် လိမ်လည်တောင်းဆိုမှုများ ပြုလုပ်ပါက အကောင့်အား အပြီးပိတ်သိမ်းမည်ဖြစ်ပါသည်။"
  });

  // Admin policy & terms editable states
  const [editRefundEligibilityDays, setEditRefundEligibilityDays] = useState(7);
  const [editRefundProcessingDaysText, setEditRefundProcessingDaysText] = useState("၁ - ၃ ရုံးဖွင့်ရက်အတွင်း (1-3 working days)");
  const [editRefundEnabled, setEditRefundEnabled] = useState(true);
  const [editDisputesEnabled, setEditDisputesEnabled] = useState(true);
  const [editRefundPolicyText, setEditRefundPolicyText] = useState("");
  const [editCancellationPolicyText, setEditCancellationPolicyText] = useState("");
  const [editTermsOfServiceText, setEditTermsOfServiceText] = useState("");

  // Refund states
  const [myRefunds, setMyRefunds] = useState<RefundRequest[]>([]);
  const [loadingMyRefunds, setLoadingMyRefunds] = useState(false);
  const [adminRefunds, setAdminRefunds] = useState<RefundRequest[]>([]);
  const [loadingAdminRefunds, setLoadingAdminRefunds] = useState(false);

  // Refund Creation Modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundTargetReq, setRefundTargetReq] = useState<PaymentRequest | null>(null);
  const [refundReason, setRefundReason] = useState<"Accidental Duplicate Purchase" | "Technical Issue Service Interruption" | "Wrong Plan Selected" | "Unauthorized Transaction" | "Dissatisfied / Other">("Accidental Duplicate Purchase");
  const [refundDescription, setRefundDescription] = useState("");
  const [refundEvidence, setRefundEvidence] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundMsg, setRefundMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Admin Refund Review Modal
  const [reviewingRefund, setReviewingRefund] = useState<RefundRequest | null>(null);
  const [adminRefundStatus, setAdminRefundStatus] = useState<"under_review" | "approved" | "rejected" | "completed">("under_review");
  const [adminRefundNote, setAdminRefundNote] = useState("");
  const [adminRefundPremiumAction, setAdminRefundPremiumAction] = useState<"cancelled" | "remain_active" | "adjusted">("cancelled");
  const [isProcessingAdminRefund, setIsProcessingAdminRefund] = useState(false);

  // Payment Dispute states
  const [myDisputes, setMyDisputes] = useState<PaymentDispute[]>([]);
  const [loadingMyDisputes, setLoadingMyDisputes] = useState(false);
  const [adminDisputes, setAdminDisputes] = useState<PaymentDispute[]>([]);
  const [loadingAdminDisputes, setLoadingAdminDisputes] = useState(false);

  // Dispute Creation Modal
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState<"rejected_incorrectly" | "premium_not_activated" | "wrong_plan" | "wrong_amount" | "other">("premium_not_activated");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeTargetReqId, setDisputeTargetReqId] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeMsg, setDisputeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Admin Dispute Review Modal
  const [reviewingDispute, setReviewingDispute] = useState<PaymentDispute | null>(null);
  const [adminDisputeStatus, setAdminDisputeStatus] = useState<"open" | "in_progress" | "resolved" | "closed">("in_progress");
  const [adminDisputeResponse, setAdminDisputeResponse] = useState("");
  const [isProcessingAdminDispute, setIsProcessingAdminDispute] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<PaymentAuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [auditSearchTerm, setAuditSearchTerm] = useState("");
  const [auditEntityTypeFilter, setAuditEntityTypeFilter] = useState("all");

  // Admin config edit states
  const [editKpayNum, setEditKpayNum] = useState("");
  const [editKpayName, setEditKpayName] = useState("");
  const [editWaveNum, setEditWaveNum] = useState("");
  const [editWaveName, setEditWaveName] = useState("");

  // Dynamic pricing editable states
  const [editPriceMonthlyMMK, setEditPriceMonthlyMMK] = useState(5000);
  const [editPriceMonthlyCoins, setEditPriceMonthlyCoins] = useState(100);
  const [editPriceSixMonthsMMK, setEditPriceSixMonthsMMK] = useState(25000);
  const [editPriceSixMonthsCoins, setEditPriceSixMonthsCoins] = useState(500);
  const [editPriceLifetimeMMK, setEditPriceLifetimeMMK] = useState(60000);
  const [editPriceLifetimeCoins, setEditPriceLifetimeCoins] = useState(1000);

  // Active promotion campaign states
  const [editIsPromoActive, setEditIsPromoActive] = useState(false);
  const [editPromoDiscountPercent, setEditPromoDiscountPercent] = useState(20);
  const [editPromoBannerText, setEditPromoBannerText] = useState("Kibo Premium အထူးပရိုမိုးရှင်း ကာလအတွင်း % သက်သာခွင့်ရယူလိုက်ပါ။");
  const [editPromoStartDate, setEditPromoStartDate] = useState("");
  const [editPromoEndDate, setEditPromoEndDate] = useState("");

  // Custom events states
  const [editCurrentEventId, setEditCurrentEventId] = useState("none");
  const [editCurrentEventTitle, setEditCurrentEventTitle] = useState("");
  const [editCurrentEventDescription, setEditCurrentEventDescription] = useState("");
  const [editCurrentEventBonusXp, setEditCurrentEventBonusXp] = useState(50);

  // Manual payment submission form states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"KPay" | "Wave Money">("KPay");
  const [screenshotBase64, setScreenshotBase64] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Student submissions list & filter states
  const [mySubmissions, setMySubmissions] = useState<PaymentRequest[]>([]);
  const [loadingMySubmissions, setLoadingMySubmissions] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "cancelled" | "refunded">("all");
  const [studentMethodFilter, setStudentMethodFilter] = useState<"all" | "KPay" | "Wave Money" | "Coins">("all");
  const [studentPlanFilter, setStudentPlanFilter] = useState<"all" | "monthly" | "six_months" | "lifetime">("all");

  // Transaction detail modal state
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<PaymentRequest | null>(null);

  // Admin submissions dashboard
  const [adminRequests, setAdminRequests] = useState<PaymentRequest[]>([]);
  const [adminFilter, setAdminFilter] = useState<"all" | "pending" | "approved" | "rejected" | "cancelled" | "refunded">("all");
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [adminMethodFilter, setAdminMethodFilter] = useState<"all" | "KPay" | "Wave Money" | "Coins">("all");
  const [loadingAdminRequests, setLoadingAdminRequests] = useState(false);
  const [adminNotes, setAdminNotes] = useState<{ [reqId: string]: string }>({});
  const [adminActionLoading, setAdminActionLoading] = useState<{ [reqId: string]: boolean }>({});

  // View enlarged image modal
  const [viewImageSrc, setViewImageSrc] = useState<string | null>(null);

  // Admin Direct Student Membership Controls
  const [adminTargetUid, setAdminTargetUid] = useState("");
  const [adminTargetPlan, setAdminTargetPlan] = useState<"monthly" | "six_months" | "lifetime">("monthly");
  const [adminCustomDays, setAdminCustomDays] = useState(30);
  const [adminDirectLoading, setAdminDirectLoading] = useState(false);
  const [adminDirectMsg, setAdminDirectMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Telegram Video Hub & Admin Verification States
  const [isTelegramHubOpen, setIsTelegramHubOpen] = useState(false);
  const [telegramRequests, setTelegramRequests] = useState<TelegramAccessRequest[]>([]);
  const [loadingTelegramRequests, setLoadingTelegramRequests] = useState(false);
  const [telegramSearchTerm, setTelegramSearchTerm] = useState("");
  const [telegramStatusFilter, setTelegramStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [telegramSettings, setTelegramSettings] = useState<TelegramChannelSettings>(DEFAULT_TELEGRAM_SETTINGS);
  const [editTgFreeUrl, setEditTgFreeUrl] = useState(DEFAULT_TELEGRAM_SETTINGS.freeChannelUrl);
  const [editTgFreeName, setEditTgFreeName] = useState(DEFAULT_TELEGRAM_SETTINGS.freeChannelName);
  const [editTgPremiumUrl, setEditTgPremiumUrl] = useState(DEFAULT_TELEGRAM_SETTINGS.premiumChannelInviteLink);
  const [editTgPremiumName, setEditTgPremiumName] = useState(DEFAULT_TELEGRAM_SETTINGS.premiumChannelName);
  const [editTgVerificationRequired, setEditTgVerificationRequired] = useState(DEFAULT_TELEGRAM_SETTINGS.adminVerificationRequired);
  const [editTgSupportHandle, setEditTgSupportHandle] = useState(DEFAULT_TELEGRAM_SETTINGS.supportTelegramHandle);
  const [telegramActionLoading, setTelegramActionLoading] = useState<{ [id: string]: boolean }>({});
  const [telegramFeedbackMsg, setTelegramFeedbackMsg] = useState<string | null>(null);

  const loadTelegramData = async () => {
    setLoadingTelegramRequests(true);
    try {
      const [settings, requests] = await Promise.all([
        getTelegramSettings(),
        getAllTelegramRequests()
      ]);
      setTelegramSettings(settings);
      setEditTgFreeUrl(settings.freeChannelUrl);
      setEditTgFreeName(settings.freeChannelName);
      setEditTgPremiumUrl(settings.premiumChannelInviteLink);
      setEditTgPremiumName(settings.premiumChannelName);
      setEditTgVerificationRequired(settings.adminVerificationRequired);
      setEditTgSupportHandle(settings.supportTelegramHandle);
      setTelegramRequests(requests);
    } catch (err) {
      console.warn("Could not load Telegram data:", err);
    } finally {
      setLoadingTelegramRequests(false);
    }
  };

  const handleApproveTelegramReq = async (req: TelegramAccessRequest) => {
    setTelegramActionLoading(prev => ({ ...prev, [req.id]: true }));
    try {
      await approveTelegramAccessRequest(req.id, user.uid, editTgPremiumUrl, "Approved by Admin");
      setTelegramFeedbackMsg(`Student [${req.userName || req.telegramUsername}] အား Telegram VIP ခွင့်ပြုချက် အောင်မြင်စွာ ပေးအပ်ပြီးပါပြီ။`);
      await loadTelegramData();
      onRefreshUser();
    } catch (e) {
      console.error(e);
      alert("ခွင့်ပြုချက်ပေးခြင်း မအောင်မြင်ပါ။");
    } finally {
      setTelegramActionLoading(prev => ({ ...prev, [req.id]: false }));
      setTimeout(() => setTelegramFeedbackMsg(null), 4000);
    }
  };

  const handleRejectTelegramReq = async (req: TelegramAccessRequest) => {
    setTelegramActionLoading(prev => ({ ...prev, [req.id]: true }));
    try {
      await rejectTelegramAccessRequest(req.id, user.uid, "Rejected by Admin review");
      setTelegramFeedbackMsg(`Student [${req.userName || req.telegramUsername}] ၏ VIP တောင်းဆိုမှုကို ပယ်ဖျက်လိုက်ပါသည်။`);
      await loadTelegramData();
      onRefreshUser();
    } catch (e) {
      console.error(e);
      alert("ငြင်းပယ်ခြင်း မအောင်မြင်ပါ။");
    } finally {
      setTelegramActionLoading(prev => ({ ...prev, [req.id]: false }));
      setTimeout(() => setTelegramFeedbackMsg(null), 4000);
    }
  };

  const handleSaveTelegramConfig = async () => {
    try {
      const updated: TelegramChannelSettings = {
        ...telegramSettings,
        freeChannelUrl: editTgFreeUrl,
        freeChannelName: editTgFreeName,
        premiumChannelInviteLink: editTgPremiumUrl,
        premiumChannelName: editTgPremiumName,
        adminVerificationRequired: editTgVerificationRequired,
        supportTelegramHandle: editTgSupportHandle
      };
      await saveTelegramSettings(updated);
      setTelegramSettings(updated);
      setTelegramFeedbackMsg("Telegram Channel ဆက်တင်များ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!");
      setTimeout(() => setTelegramFeedbackMsg(null), 3000);
    } catch (e) {
      console.error(e);
      alert("သိမ်းဆည်းခြင်း မအောင်မြင်ပါ။");
    }
  };

  const isAdmin = user.role === "admin" || user.role === "teacher" || (user as any).isAdmin === true;

  const handleAdminDirectActivate = async () => {
    if (!adminTargetUid.trim()) {
      alert("ကျေးဇူးပြု၍ Student UID သို့မဟုတ် Email ရိုက်ထည့်ပါ");
      return;
    }
    setAdminDirectLoading(true);
    setAdminDirectMsg(null);
    try {
      await adminActivateUserPremium(adminTargetUid.trim(), adminTargetPlan, adminCustomDays);
      setAdminDirectMsg({
        type: "success",
        text: `Student [${adminTargetUid.trim()}] အား Premium Plan (${adminTargetPlan}) အား အောင်မြင်စွာ ဖွင့်လှစ်ပေးပြီးပါပြီ!`
      });
      setAdminTargetUid("");
      onRefreshUser();
    } catch (e: any) {
      console.error("Direct activate error:", e);
      setAdminDirectMsg({
        type: "error",
        text: "Premium ဖွင့်ပေးခြင်း မအောင်မြင်ပါ။ Student UID သေချာစစ်ဆေးပါ။"
      });
    } finally {
      setAdminDirectLoading(false);
    }
  };

  const handleAdminDirectDeactivate = async () => {
    if (!adminTargetUid.trim()) {
      alert("ကျေးဇူးပြု၍ Student UID သို့မဟုတ် Email ရိုက်ထည့်ပါ");
      return;
    }
    const confirm = window.confirm(`Student [${adminTargetUid.trim()}] ၏ Premium အကောင့်အား Free Plan သို့ ပြောင်းလဲပိတ်သိမ်းရန် သေချာပါသလား?`);
    if (!confirm) return;

    setAdminDirectLoading(true);
    setAdminDirectMsg(null);
    try {
      await adminDeactivateUserPremium(adminTargetUid.trim());
      setAdminDirectMsg({
        type: "success",
        text: `Student [${adminTargetUid.trim()}] အား Free Plan သို့ ပြောင်းလဲပေးပြီးပါပြီ (ပြီးစီးခဲ့သော သင်ခန်းစာများနှင့် ဘွဲ့ရလက်မှတ်များ ပျက်စီးမည်မဟုတ်ပါ)`
      });
      setAdminTargetUid("");
      onRefreshUser();
    } catch (e: any) {
      console.error("Direct deactivate error:", e);
      setAdminDirectMsg({
        type: "error",
        text: "Deactivate ပြုလုပ်ခြင်း မအောင်မြင်ပါ။"
      });
    } finally {
      setAdminDirectLoading(false);
    }
  };

  const handleAdminDirectExtend = async (addDays: number) => {
    if (!adminTargetUid.trim()) {
      alert("ကျေးဇူးပြု၍ Student UID သို့မဟုတ် Email ရိုက်ထည့်ပါ");
      return;
    }
    setAdminDirectLoading(true);
    setAdminDirectMsg(null);
    try {
      await adminSimpleExtendUserPremium(adminTargetUid.trim(), addDays);
      setAdminDirectMsg({
        type: "success",
        text: `Student [${adminTargetUid.trim()}] ၏ သက်တမ်းအား +${addDays} ရက် တိုးမြှင့်ပေးပြီးပါပြီ!`
      });
      onRefreshUser();
    } catch (e: any) {
      console.error("Direct extend error:", e);
      setAdminDirectMsg({
        type: "error",
        text: "သက်တမ်းတိုးပေးခြင်း မအောင်မြင်ပါ။"
      });
    } finally {
      setAdminDirectLoading(false);
    }
  };

  // Load payment settings and submissions on mount
  useEffect(() => {
    async function loadData() {
      // 1. Load payment details & policy config
      try {
        const settings = await getPaymentSettings();
        setPaymentConfig(settings);
        setEditKpayNum(settings.kpayNumber);
        setEditKpayName(settings.kpayName);
        setEditWaveNum(settings.waveNumber);
        setEditWaveName(settings.waveName);
        
        // Populate custom config fields
        setEditPriceMonthlyMMK(settings.priceMonthlyMMK ?? 5000);
        setEditPriceMonthlyCoins(settings.priceMonthlyCoins ?? 100);
        setEditPriceSixMonthsMMK(settings.priceSixMonthsMMK ?? 25000);
        setEditPriceSixMonthsCoins(settings.priceSixMonthsCoins ?? 500);
        setEditPriceLifetimeMMK(settings.priceLifetimeMMK ?? 60000);
        setEditPriceLifetimeCoins(settings.priceLifetimeCoins ?? 1000);
        
        setEditIsPromoActive(settings.isPromoActive ?? false);
        setEditPromoDiscountPercent(settings.promoDiscountPercent ?? 20);
        setEditPromoBannerText(settings.promoBannerText ?? "Kibo Premium အထူးပရိုမိုးရှင်း ကာလအတွင်း % သက်သာခွင့်ရယူလိုက်ပါ။");
        setEditPromoStartDate(settings.promoStartDate ?? "");
        setEditPromoEndDate(settings.promoEndDate ?? "");
        
        setEditCurrentEventId(settings.currentEventId ?? "none");
        setEditCurrentEventTitle(settings.currentEventTitle ?? "");
        setEditCurrentEventDescription(settings.currentEventDescription ?? "");
        setEditCurrentEventBonusXp(settings.currentEventBonusXpPercent ?? 50);

        setEditRefundEligibilityDays(settings.refundEligibilityDays ?? 7);
        setEditRefundProcessingDaysText(settings.refundProcessingDaysText ?? "၁ - ၃ ရုံးဖွင့်ရက်အတွင်း (1-3 working days)");
        setEditRefundEnabled(settings.refundEnabled ?? true);
        setEditDisputesEnabled(settings.disputesEnabled ?? true);
        setEditRefundPolicyText(settings.refundPolicyText ?? "");
        setEditCancellationPolicyText(settings.cancellationPolicyText ?? "");
        setEditTermsOfServiceText(settings.termsOfServiceText ?? "");
      } catch (err) {
        console.warn("Could not load payment configs", err);
      }

      // 2. Load student's own requests, refunds, disputes & telegram settings
      await loadTelegramData();
      if (firebaseUser?.uid) {
        loadStudentRequests();
        loadStudentRefundsAndDisputes();
      }
    }
    loadData();
  }, [firebaseUser]);

  // Load Admin Requests when Admin tab is active
  useEffect(() => {
    if (activeTab === "admin" && isAdmin) {
      loadAdminRequestsList();
      loadAdminRefundsAndDisputes();
      loadTelegramData();
    }
  }, [activeTab]);

  const loadStudentRequests = async () => {
    if (!firebaseUser?.uid) return;
    setLoadingMySubmissions(true);
    try {
      const list = await getPaymentRequestsForUser(firebaseUser.uid);
      setMySubmissions(list);
    } catch (err) {
      console.error("Error loading submissions", err);
    } finally {
      setLoadingMySubmissions(false);
    }
  };

  const loadStudentRefundsAndDisputes = async () => {
    if (!firebaseUser?.uid) return;
    setLoadingMyRefunds(true);
    setLoadingMyDisputes(true);
    try {
      const [refList, dispList] = await Promise.all([
        getRefundRequestsForUser(firebaseUser.uid),
        getPaymentDisputesForUser(firebaseUser.uid)
      ]);
      setMyRefunds(refList);
      setMyDisputes(dispList);
    } catch (err) {
      console.error("Error loading student refunds & disputes", err);
    } finally {
      setLoadingMyRefunds(false);
      setLoadingMyDisputes(false);
    }
  };

  const loadAdminRequestsList = async () => {
    setLoadingAdminRequests(true);
    try {
      const list = await getAllPaymentRequests();
      setAdminRequests(list);
    } catch (err) {
      console.error("Error loading admin requests", err);
    } finally {
      setLoadingAdminRequests(false);
    }
  };

  const loadAdminRefundsAndDisputes = async () => {
    if (!isAdmin) return;
    setLoadingAdminRefunds(true);
    setLoadingAdminDisputes(true);
    setLoadingAuditLogs(true);
    try {
      const [allRef, allDisp, allLogs] = await Promise.all([
        getAllRefundRequests(),
        getAllPaymentDisputes(),
        getPaymentAuditLogs()
      ]);
      setAdminRefunds(allRef);
      setAdminDisputes(allDisp);
      setAuditLogs(allLogs);
    } catch (e) {
      console.error("Error loading admin refunds, disputes, audit logs", e);
    } finally {
      setLoadingAdminRefunds(false);
      setLoadingAdminDisputes(false);
      setLoadingAuditLogs(false);
    }
  };

  // Pricing Info with dynamic discount calculations
  const isPromoValid = paymentConfig.isPromoActive && 
    (!paymentConfig.promoStartDate || new Date() >= new Date(paymentConfig.promoStartDate)) &&
    (!paymentConfig.promoEndDate || new Date() <= new Date(paymentConfig.promoEndDate));

  const discountMultiplier = isPromoValid ? (1 - (paymentConfig.promoDiscountPercent || 0) / 100) : 1;

  const rawMonthlyMMK = paymentConfig.priceMonthlyMMK ?? 5000;
  const rawSixMonthsMMK = paymentConfig.priceSixMonthsMMK ?? 25000;
  const rawLifetimeMMK = paymentConfig.priceLifetimeMMK ?? 60000;

  const rawMonthlyCoins = paymentConfig.priceMonthlyCoins ?? 100;
  const rawSixMonthsCoins = paymentConfig.priceSixMonthsCoins ?? 500;
  const rawLifetimeCoins = paymentConfig.priceLifetimeCoins ?? 1000;

  const plansInfo = {
    monthly: {
      name: "Premium Monthly",
      duration: "၁ လ (1 Month)",
      priceMMK: isPromoValid 
        ? Math.round(rawMonthlyMMK * discountMultiplier).toLocaleString() 
        : rawMonthlyMMK.toLocaleString(),
      priceCoins: isPromoValid 
        ? Math.round(rawMonthlyCoins * discountMultiplier) 
        : rawMonthlyCoins,
      saveLabel: isPromoValid ? `${paymentConfig.promoDiscountPercent}% OFF!` : "",
      desc: "လစဉ်လေ့လာလိုသူများအတွက် အသင့်တော်ဆုံး အခြေခံအဆင့်မြှင့်တင်မှု",
      rawPriceMMK: rawMonthlyMMK,
      rawPriceCoins: rawMonthlyCoins
    },
    six_months: {
      name: "Premium 6 Months",
      duration: "၆ လ (6 Months)",
      priceMMK: isPromoValid 
        ? Math.round(rawSixMonthsMMK * discountMultiplier).toLocaleString() 
        : rawSixMonthsMMK.toLocaleString(),
      priceCoins: isPromoValid 
        ? Math.round(rawSixMonthsCoins * discountMultiplier) 
        : rawSixMonthsCoins,
      saveLabel: isPromoValid ? `${paymentConfig.promoDiscountPercent}% OFF!` : "Save 15%!",
      desc: "အသုံးအများဆုံးနှင့် စျေးအသက်သာဆုံး ၆ လတာ သင်တန်းဝင်ခွင့်",
      rawPriceMMK: rawSixMonthsMMK,
      rawPriceCoins: rawSixMonthsCoins
    },
    lifetime: {
      name: "Premium Lifetime",
      duration: "တစ်သက်တာ (Lifetime)",
      priceMMK: isPromoValid 
        ? Math.round(rawLifetimeMMK * discountMultiplier).toLocaleString() 
        : rawLifetimeMMK.toLocaleString(),
      priceCoins: isPromoValid 
        ? Math.round(rawLifetimeCoins * discountMultiplier) 
        : rawLifetimeCoins,
      saveLabel: isPromoValid ? `${paymentConfig.promoDiscountPercent}% OFF!` : "Best Value!",
      desc: "တစ်ခါတည်းပေးရုံဖြင့် နောက်ထပ်ဘာမှပေးစရာမလိုဘဲ တစ်သက်တာ အကန့်အသတ်မရှိ လေ့လာခွင့်",
      rawPriceMMK: rawLifetimeMMK,
      rawPriceCoins: rawLifetimeCoins
    }
  };

  // Convert File to Base64
  const processFile = (file: File) => {
    if (file.size > 800 * 1024) { // 800KB limit
      alert("ပုံ၏အရွယ်အစားမှာ 800KB ထက် ပိုကြီးနေပါသည်။ ပိုမိုသေးငယ်သော Screenshot ကို အသုံးပြုပါ။");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("ပုံအမျိုးအစား (JPG, PNG) သာ တင်သွင်းပေးပါ။");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag Events for Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Option A: Instant Coin Upgrade
  const handleCoinUpgrade = async () => {
    const cost = plansInfo[selectedPlan].priceCoins;
    const currentCoins = user.coins || 0;

    if (currentCoins < cost) {
      alert(`သင့်တွင် Coins မလုံလောက်ပါ။ Premium Upgrade ရယူရန် ${cost} Coins လိုအပ်သော်လည်း လက်ရှိတွင် ${currentCoins} Coins သာရှိပါသည်။ သင်ခန်းစာများနှင့် Quizzes များ ဖြေဆိုခြင်းဖြင့် Coins များ ထပ်မံစုဆောင်းပါ!`);
      return;
    }

    const confirmUpgrade = window.confirm(
      `သင်၏ Coins ${cost} ခုကို အသုံးပြုပြီး ${plansInfo[selectedPlan].name} သို့ ချက်ချင်း တက်လှမ်းလိုပါသလား?`
    );
    if (!confirmUpgrade) return;

    try {
      const now = new Date();
      let premiumUntil = new Date();
      
      if (selectedPlan === "monthly") {
        premiumUntil.setMonth(premiumUntil.getMonth() + 1);
      } else if (selectedPlan === "six_months") {
        premiumUntil.setMonth(premiumUntil.getMonth() + 6);
      } else if (selectedPlan === "lifetime") {
        premiumUntil.setFullYear(premiumUntil.getFullYear() + 99);
      }

      const updatedProfile: UserProfile = {
        ...user,
        coins: currentCoins - cost,
        isPremium: true,
        premiumPlan: selectedPlan,
        premiumActivatedAt: now.toISOString(),
        premiumUntil: premiumUntil.toISOString()
      };

      if (firebaseUser?.uid) {
        await saveUserProfile(firebaseUser.uid, updatedProfile);
        onRefreshUser();
        alert(`ဂုဏ်ယူပါသည်! Coins ${cost} ခုကိုနှုတ်ယူပြီး ${plansInfo[selectedPlan].name} အောင်မြင်စွာ တက်လှမ်းပြီးပါပြီ! 👑`);
      }
    } catch (err) {
      console.error("Coin upgrade failed", err);
      alert("Coin ဖြင့် အဆင့်မြှင့်တင်မှု မအောင်မြင်ပါ။ နောက်မှ ထပ်မံကြိုးစားကြည့်ပါ။");
    }
  };

  // Option B: Manual Payment Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser?.uid) {
      alert("ကျေးဇူးပြု၍ ဦးစွာ အကောင့်ဝင်ရောက်ပါ။");
      return;
    }
    if (!screenshotBase64) {
      alert("ကျေးဇူးပြု၍ လွှဲပြောင်းမှု Screenshot ပုံကို ထည့်သွင်းပေးပါ။");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const trimmedRef = transactionRef.trim();
      if (trimmedRef) {
        const isDuplicateRef = mySubmissions.some(
          (sub) => sub.transactionRef && sub.transactionRef.trim().toLowerCase() === trimmedRef.toLowerCase() && sub.status !== "rejected"
        );
        if (isDuplicateRef) {
          const confirmDuplicate = window.confirm(
            "သတိပေးချက်: ဤ Transaction Reference (သို့) ငွေလွှဲပြေစာနံပါတ်ဖြင့် မကြာသေးမီက တင်ပြထားပြီးဖြစ်ပါသည်။ ထပ်မံ၍ တင်ပြလိုသည်မှာ သေချာပါသလား?"
          );
          if (!confirmDuplicate) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      const selectedPlanInfo = plansInfo[selectedPlan];
      const amountVal = selectedPlanInfo?.rawPriceMMK || (selectedPlan === "monthly" ? 5000 : selectedPlan === "six_months" ? 25000 : 60000);

      const reqId = "pay_" + Math.random().toString(36).substring(2, 15);
      const requestData: PaymentRequest = {
        requestId: reqId,
        uid: firebaseUser.uid,
        userEmail: user.email,
        userName: user.name,
        planId: selectedPlan,
        paymentMethod: selectedPaymentMethod,
        amountMMK: amountVal,
        screenshot: screenshotBase64,
        transactionRef: transactionRef.trim(),
        status: "pending",
        submittedAt: new Date().toISOString(),
        auditTrail: [
          { action: "submitted", timestamp: new Date().toISOString(), by: user.name || "Student" }
        ]
      };

      // 1. Immediately update local component state for instant visual feedback
      setMySubmissions(prev => [requestData, ...prev.filter(r => (r.requestId || r.id) !== reqId)]);

      // 2. Persist to DB & LocalStorage
      await submitPaymentRequest(requestData);
      
      // 3. Send Telegram notification asynchronously in background
      setTimeout(() => {
        try {
          const botToken = "8774748793:AAEK7tJa1B_u8EozcqYA0B6guMmwoF2zGJc";
          const chatId = "6427719618";
          const planObj = plansInfo[selectedPlan];
          
          const caption = `🔔 <b>Kibo CodeLearn - New Premium Request</b>\n\n` +
            `👤 <b>အမည်:</b> ${user.name}\n` +
            `📧 <b>အီးမေးလ်:</b> ${user.email}\n` +
            `🔑 <b>UID:</b> <code>${firebaseUser.uid}</code>\n` +
            `💳 <b>Plan:</b> ${planObj ? planObj.name : selectedPlan}\n` +
            `💵 <b>နှုန်းထား:</b> ${planObj ? planObj.priceMMK : "N/A"} MMK\n` +
            `📝 <b>Ref ID/Txn Info:</b> ${transactionRef.trim() || "N/A"}\n` +
            `⏰ <b>တင်သွင်းချိန်:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Yangon', hour12: true })}\n\n` +
            `📍 <i>ကျေးဇူးပြု၍ Admin Panel သို့မဟုတ် Dashboard တွင် ဝင်ရောက်စစ်ဆေးအတည်ပြုပေးပါရန်။</i>`;

          const sendTextMessage = () => {
            fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: caption,
                parse_mode: "HTML"
              })
            }).catch(err => console.error("Telegram sendMessage error:", err));
          };

          if (screenshotBase64 && screenshotBase64.startsWith("data:")) {
            const blob = dataURLtoBlob(screenshotBase64);
            if (blob) {
              const formData = new FormData();
              formData.append("chat_id", chatId);
              formData.append("caption", caption);
              formData.append("parse_mode", "HTML");
              formData.append("photo", blob, "receipt.png");
              
              fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: "POST",
                body: formData,
              })
              .then(async res => {
                if (!res.ok) {
                  const errTxt = await res.text();
                  console.warn("Telegram sendPhoto failed, falling back to sendMessage:", errTxt);
                  sendTextMessage();
                }
              })
              .catch(telegramErr => {
                console.warn("Telegram photo notify exception, falling back to sendMessage:", telegramErr);
                sendTextMessage();
              });
            } else {
              sendTextMessage();
            }
          } else {
            sendTextMessage();
          }
        } catch (telegramErr) {
          console.error("Telegram notification background error:", telegramErr);
        }
      }, 0);
      
      setSubmitMessage({
        type: "success",
        text: "ငွေလွှဲပြောင်းမှု တင်ပြချက် ချက်ချင်း မှတ်တမ်းထဲသို့ ရောက်ရှိသွားပြီး Telegram Notification ပေးပို့လိုက်ပါပြီ! စီမံခန့်ခွဲသူမှ သေချာစွာ စစ်ဆေးပြီးနောက် ၂၄ နာရီအတွင်း Premium ဖွင့်လှစ်ပေးမည်ဖြစ်ပါသည်။"
      });

      // Clear Form
      setScreenshotBase64("");
      setTransactionRef("");
    } catch (err) {
      console.error("Submit payment request failed", err);
      setSubmitMessage({
        type: "error",
        text: "တင်ပြချက်ပေးပို့မှု မအောင်မြင်ပါ။ အင်တာနက်ချိတ်ဆက်မှု စစ်ဆေးပြီး ပြန်လည်လုပ်ဆောင်ပါ။"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Actions: Approve/Reject Payment Request
  const handleAdminAction = async (requestId: string, uid: string, status: "approved" | "rejected", planId: "monthly" | "six_months" | "lifetime" | string) => {
    setAdminActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const notes = adminNotes[requestId] || "";
      await updatePaymentRequestStatus(requestId, uid, status, notes, planId as any);
      
      alert(`Request [${requestId}] သည် status [${status}] သို့ အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။`);
      
      // Reload lists
      loadAdminRequestsList();
      onRefreshUser();
    } catch (err) {
      console.error("Admin update failed", err);
      alert("စစ်ဆေးမှု ပြင်ဆင်ခြင်း မအောင်မြင်ပါ။ rules နှင့် error log များကို ပြန်စစ်ပါ။");
    } finally {
      setAdminActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Admin Config Save
  const handleSaveConfig = async () => {
    try {
      const updatedConfig: PaymentSettings = {
        settingsId: "payment_info",
        kpayNumber: editKpayNum,
        kpayName: editKpayName,
        waveNumber: editWaveNum,
        waveName: editWaveName,
        
        // Dynamic pricing
        priceMonthlyMMK: Number(editPriceMonthlyMMK),
        priceMonthlyCoins: Number(editPriceMonthlyCoins),
        priceSixMonthsMMK: Number(editPriceSixMonthsMMK),
        priceSixMonthsCoins: Number(editPriceSixMonthsCoins),
        priceLifetimeMMK: Number(editPriceLifetimeMMK),
        priceLifetimeCoins: Number(editPriceLifetimeCoins),
        
        // Promotional details
        isPromoActive: editIsPromoActive,
        promoDiscountPercent: Number(editPromoDiscountPercent),
        promoBannerText: editPromoBannerText,
        promoStartDate: editPromoStartDate,
        promoEndDate: editPromoEndDate,
        
        // Custom events
        currentEventId: editCurrentEventId,
        currentEventTitle: editCurrentEventTitle,
        currentEventDescription: editCurrentEventDescription,
        currentEventBonusXpPercent: Number(editCurrentEventBonusXp),

        // Refund & Policy configurations
        refundEligibilityDays: Number(editRefundEligibilityDays),
        refundProcessingDaysText: editRefundProcessingDaysText,
        refundEnabled: editRefundEnabled,
        disputesEnabled: editDisputesEnabled,
        refundPolicyText: editRefundPolicyText,
        cancellationPolicyText: editCancellationPolicyText,
        termsOfServiceText: editTermsOfServiceText
      };

      await savePaymentSettings(updatedConfig);
      setPaymentConfig(updatedConfig);
      alert("ဆုလာဘ်၊ ပရိုမိုးရှင်းနှင့် ငွေပေးချေမှု ဆက်တင်များအားလုံးကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ ခင်ဗျာ!");
    } catch (err) {
      console.error("Save config failed", err);
      alert("အပြောင်းအလဲ သိမ်းဆည်းရန် မအောင်မြင်ပါ။");
    }
  };

  // Student Refund Submission
  const handleSubmitRefundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTargetReq) {
      alert("ကျေးဇူးပြု၍ ပြန်အမ်းငွေ လျှောက်ထားလိုသည့် ငွေလွှဲပြေစာကို ရွေးချယ်ပါ");
      return;
    }
    if (!refundDescription.trim()) {
      alert("ကျေးဇူးပြု၍ ပြန်အမ်းငွေ လျှောက်ထားရသည့် အကြောင်းအရင်း အသေးစိတ် ရေးသားပါ");
      return;
    }

    setRefundSubmitting(true);
    setRefundMsg(null);

    try {
      const existingReqsCount = myRefunds.length;
      const targetReqId = refundTargetReq.requestId || refundTargetReq.id || "";
      const hasDuplicateReqId = myRefunds.some(r => r.requestId === targetReqId);

      const newRefundId = "ref_" + Math.random().toString(36).substring(2, 15);
      const refundObj: RefundRequest = {
        refundId: newRefundId,
        requestId: targetReqId,
        uid: firebaseUser.uid,
        userEmail: user.email,
        userName: user.name,
        planId: (refundTargetReq.planId as any) || "monthly",
        paymentMethod: refundTargetReq.paymentMethod,
        originalAmountMMK: refundTargetReq.amountMMK || (refundTargetReq.planId === "monthly" ? 5000 : refundTargetReq.planId === "six_months" ? 25000 : 60000),
        refundAmountMMK: refundTargetReq.amountMMK || (refundTargetReq.planId === "monthly" ? 5000 : refundTargetReq.planId === "six_months" ? 25000 : 60000),
        requestedRefundAmountMMK: refundTargetReq.amountMMK || (refundTargetReq.planId === "monthly" ? 5000 : refundTargetReq.planId === "six_months" ? 25000 : 60000),
        reason: refundReason,
        description: refundDescription.trim(),
        evidenceAttachment: refundEvidence,
        status: "requested",
        requestedAt: new Date().toISOString(),
        isFlaggedFraud: hasDuplicateReqId || existingReqsCount >= 2,
        fraudFlags: hasDuplicateReqId ? ["Duplicate refund claim for same transaction"] : existingReqsCount >= 2 ? ["Excessive refund history (2+ prior requests)"] : []
      };

      await saveRefundRequest(refundObj);
      setMyRefunds(prev => [refundObj, ...prev]);

      setRefundMsg({
        type: "success",
        text: "ပြန်အမ်းငွေ လျှောက်ထားမှု အောင်မြင်စွာ ပေးပို့ပြီးပါပြီ။ Admin မှ ၁ - ၃ ရုံးဖွင့်ရက်အတွင်း စစ်ဆေးပြီး အကြောင်းပြန်ပါမည်။"
      });

      setRefundDescription("");
      setRefundEvidence("");
      setRefundTargetReq(null);
      setTimeout(() => {
        setIsRefundModalOpen(false);
        setRefundMsg(null);
      }, 2000);
    } catch (e) {
      console.error("Submit refund failed", e);
      setRefundMsg({
        type: "error",
        text: "ပြန်အမ်းငွေ လျှောက်ထားမှု ပေးပို့၍ မရရှိပါ။ အင်တာနက် ချိတ်ဆက်မှု စစ်ဆေးပါ။"
      });
    } finally {
      setRefundSubmitting(false);
    }
  };

  // Student Payment Dispute Submission
  const handleSubmitPaymentDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDescription.trim()) {
      alert("ကျေးဇူးပြု၍ အငြင်းပွားမှုဆိုင်ရာ အကြောင်းအရင်း အသေးစိတ် ရေးသားပါ");
      return;
    }

    setDisputeSubmitting(true);
    setDisputeMsg(null);

    try {
      const newDisputeId = "disp_" + Math.random().toString(36).substring(2, 15);
      const disputeObj: PaymentDispute = {
        disputeId: newDisputeId,
        requestId: disputeTargetReqId || undefined,
        uid: firebaseUser.uid,
        userEmail: user.email,
        userName: user.name,
        category: disputeCategory,
        description: disputeDescription.trim(),
        status: "open",
        createdAt: new Date().toISOString()
      };

      await savePaymentDispute(disputeObj);
      setMyDisputes(prev => [disputeObj, ...prev]);

      setDisputeMsg({
        type: "success",
        text: "အငြင်းပွားမှု တိုင်ကြားချက် အောင်မြင်စွာ တင်ပြပြီးပါပြီ။ တာဝန်ရှိသူမှ စစ်ဆေး၍ မကြာမီ အကြောင်းပြန်ပေးပါမည်။"
      });

      setDisputeDescription("");
      setDisputeTargetReqId("");
      setTimeout(() => {
        setIsDisputeModalOpen(false);
        setDisputeMsg(null);
      }, 2000);
    } catch (e) {
      console.error("Submit dispute failed", e);
      setDisputeMsg({
        type: "error",
        text: "တိုင်ကြားချက် ပေးပို့၍ မရရှိပါ။"
      });
    } finally {
      setDisputeSubmitting(false);
    }
  };

  // Admin Refund Request Status Update
  const handleAdminUpdateRefund = async () => {
    if (!reviewingRefund) return;
    setIsProcessingAdminRefund(true);
    try {
      await updateRefundRequestStatus(
        reviewingRefund.refundId,
        adminRefundStatus,
        adminRefundNote,
        adminRefundPremiumAction,
        user.name || "Admin"
      );

      alert(`Refund Request [${reviewingRefund.refundId}] အား status [${adminRefundStatus}] သို့ ပြောင်းလဲလိုက်ပါပြီ!`);

      loadAdminRefundsAndDisputes();
      loadAdminRequestsList();
      onRefreshUser();
      setReviewingRefund(null);
    } catch (e) {
      console.error("Admin refund update error", e);
      alert("Refund အခြေအနေ ပြင်ဆင်ခြင်း မအောင်မြင်ပါ။");
    } finally {
      setIsProcessingAdminRefund(false);
    }
  };

  // Admin Dispute Status & Response Update
  const handleAdminUpdateDispute = async () => {
    if (!reviewingDispute) return;
    setIsProcessingAdminDispute(true);
    try {
      await updatePaymentDispute(
        reviewingDispute.disputeId,
        adminDisputeStatus,
        adminDisputeResponse,
        user.name || "Admin"
      );

      alert(`Payment Dispute [${reviewingDispute.disputeId}] အား အောင်မြင်စွာ ဖြေရှင်း/ပြင်ဆင်လိုက်ပါပြီ!`);

      loadAdminRefundsAndDisputes();
      setReviewingDispute(null);
    } catch (e) {
      console.error("Admin dispute update error", e);
      alert("Dispute အကြောင်းပြန်ခြင်း မအောင်မြင်ပါ။");
    } finally {
      setIsProcessingAdminDispute(false);
    }
  };

  const getStatusBadge = (status: "pending" | "approved" | "rejected" | "cancelled" | "refunded" | string) => {
    switch (status) {
      case "pending":
        return <span className="bg-amber-500/10 text-amber-500 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />စောင့်ဆိုင်းဆဲ (Pending)</span>;
      case "approved":
        return <span className="bg-emerald-500/10 text-emerald-500 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1 w-fit"><Check className="w-3 h-3" />အတည်ပြုပြီး (Approved)</span>;
      case "rejected":
        return <span className="bg-red-500/10 text-red-500 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-red-500/20 flex items-center gap-1 w-fit"><X className="w-3 h-3" />ငြင်းပယ်ထား (Rejected)</span>;
      case "cancelled":
        return <span className="bg-slate-500/10 text-slate-400 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-slate-500/20 flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" />ပယ်ဖျက်ထား (Cancelled)</span>;
      case "refunded":
        return <span className="bg-purple-500/10 text-purple-400 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-purple-500/20 flex items-center gap-1 w-fit"><RotateCcw className="w-3 h-3" />ငွေပြန်အမ်းပြီး (Refunded)</span>;
      default:
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold px-2 py-1 rounded-full">{status}</span>;
    }
  };

  // Helper: Detect duplicate transaction references or screenshots across requests
  const checkDuplicateRequest = (req: PaymentRequest, allRequests: PaymentRequest[]) => {
    const duplicates: string[] = [];
    if (!req) return { isDuplicate: false, reasons: [] };

    // 1. Same transaction reference
    if (req.transactionRef && req.transactionRef.trim()) {
      const trimmedRef = req.transactionRef.trim().toLowerCase();
      const matchRef = allRequests.filter(
        (other) =>
          (other.requestId || other.id) !== (req.requestId || req.id) &&
          other.transactionRef &&
          other.transactionRef.trim().toLowerCase() === trimmedRef
      );
      if (matchRef.length > 0) {
        duplicates.push(`တူညီသော Transaction Reference [${req.transactionRef}] ဖြင့် အခြားလျှောက်ထားချက် ${matchRef.length} ခု ရှိနေပါသည်`);
      }
    }

    // 2. Same screenshot
    if (req.screenshot) {
      const matchImage = allRequests.filter(
        (other) =>
          (other.requestId || other.id) !== (req.requestId || req.id) &&
          other.screenshot === req.screenshot
      );
      if (matchImage.length > 0) {
        duplicates.push(`တူညီသော Screenshot ပြေစာပုံဖြင့် အခြားလျှောက်ထားချက် ${matchImage.length} ခု ရှိနေပါသည်`);
      }
    }

    // 3. Same user repeated submission within 24h
    const sameUserSubmissions = allRequests.filter(
      (other) =>
        (other.requestId || other.id) !== (req.requestId || req.id) &&
        other.uid === req.uid &&
        other.planId === req.planId &&
        Math.abs(new Date(other.submittedAt).getTime() - new Date(req.submittedAt).getTime()) < 24 * 60 * 60 * 1000
    );
    if (sameUserSubmissions.length > 0) {
      duplicates.push(`အသုံးပြုသူ [${req.userName || req.uid}] မှ အလားတူ Plan ကို ၂၄ နာရီအတွင်း ထပ်မံလျှောက်ထားထားပါသည်`);
    }

    return {
      isDuplicate: duplicates.length > 0,
      reasons: duplicates
    };
  };

  // CSV Export for transactions
  const exportTransactionsToCSV = (requestsToExport: PaymentRequest[]) => {
    if (requestsToExport.length === 0) {
      alert("Export ထုတ်ရန် မည်သည့် မှတ်တမ်းမျှ မရှိပါ။");
      return;
    }
    const headers = ["Transaction_ID", "User_Name", "User_Email", "User_UID", "Plan", "Payment_Method", "Amount_MMK", "TXID_Reference", "Status", "Submitted_At", "Reviewed_At", "Activation_Date", "Expiration_Date", "Notes"];
    const rows = requestsToExport.map(r => [
      `"${r.requestId || r.id || ""}"`,
      `"${(r.userName || "").replace(/"/g, '""')}"`,
      `"${(r.userEmail || "").replace(/"/g, '""')}"`,
      `"${r.uid || ""}"`,
      `"${r.planId || ""}"`,
      `"${r.paymentMethod || "KPay/Wave"}"`,
      `"${r.amountMMK || (r.planId === 'monthly' ? 5000 : r.planId === 'six_months' ? 25000 : 60000)}"`,
      `"${(r.transactionRef || "").replace(/"/g, '""')}"`,
      `"${r.status || ""}"`,
      `"${r.submittedAt || ""}"`,
      `"${r.reviewedAt || ""}"`,
      `"${r.activationDate || ""}"`,
      `"${r.expirationDate || ""}"`,
      `"${(r.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CLM_Payment_Transactions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const exportTransactionsToJSON = (requestsToExport: PaymentRequest[]) => {
    if (requestsToExport.length === 0) {
      alert("Export ထုတ်ရန် မည်သည့် မှတ်တမ်းမျှ မရှိပါ။");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(requestsToExport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CLM_Payment_Transactions_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Student cancel pending request
  const handleCancelMyRequest = async (req: PaymentRequest) => {
    const confirmCancel = window.confirm(`Request [${req.requestId}] အား ပယ်ဖျက်ရန် သေချာပါသလား?`);
    if (!confirmCancel) return;

    try {
      await updatePaymentRequestStatus(
        req.requestId,
        req.uid,
        "cancelled",
        "ကျောင်းသားမှ ကိုယ်တိုင်ပယ်ဖျက်လိုက်ပါသည် (Cancelled by Student)",
        req.planId as any
      );
      alert("လျှောက်ထားချက်ကို အောင်မြင်စွာ ပယ်ဖျက်လိုက်ပါပြီ။");
      loadStudentRequests();
      if (selectedRequestDetail && selectedRequestDetail.requestId === req.requestId) {
        setSelectedRequestDetail(null);
      }
    } catch (e) {
      console.error("Cancel request failed", e);
      alert("ပယ်ဖျက်၍ မရရှိနိုင်ပါ။");
    }
  };

  // Filtered Student Submissions
  const filteredMySubmissions = mySubmissions.filter((req) => {
    if (studentStatusFilter !== "all" && req.status !== studentStatusFilter) return false;
    if (studentMethodFilter !== "all" && req.paymentMethod !== studentMethodFilter) return false;
    if (studentPlanFilter !== "all" && req.planId !== studentPlanFilter) return false;
    if (studentSearchTerm.trim()) {
      const q = studentSearchTerm.trim().toLowerCase();
      const matchId = (req.requestId || req.id || "").toLowerCase().includes(q);
      const matchRef = (req.transactionRef || "").toLowerCase().includes(q);
      const matchNotes = (req.notes || "").toLowerCase().includes(q);
      const matchPlan = (plansInfo[req.planId]?.name || "").toLowerCase().includes(q);
      if (!matchId && !matchRef && !matchNotes && !matchPlan) return false;
    }
    return true;
  });

  // Filtered Admin Requests
  const filteredAdminRequests = adminRequests.filter((req) => {
    if (adminFilter !== "all" && req.status !== adminFilter) return false;
    if (adminMethodFilter !== "all" && req.paymentMethod !== adminMethodFilter) return false;
    if (adminSearchTerm.trim()) {
      const q = adminSearchTerm.trim().toLowerCase();
      const matchId = (req.requestId || req.id || "").toLowerCase().includes(q);
      const matchUid = (req.uid || "").toLowerCase().includes(q);
      const matchEmail = (req.userEmail || "").toLowerCase().includes(q);
      const matchName = (req.userName || "").toLowerCase().includes(q);
      const matchRef = (req.transactionRef || "").toLowerCase().includes(q);
      const matchMethod = (req.paymentMethod || "").toLowerCase().includes(q);
      if (!matchId && !matchUid && !matchEmail && !matchName && !matchRef && !matchMethod) return false;
    }
    return true;
  });

  // Admin Financial Statistics
  const adminStats = {
    total: adminRequests.length,
    pending: adminRequests.filter((r) => r.status === "pending").length,
    approved: adminRequests.filter((r) => r.status === "approved").length,
    rejected: adminRequests.filter((r) => r.status === "rejected").length,
    cancelled: adminRequests.filter((r) => r.status === "cancelled").length,
    refunded: adminRequests.filter((r) => r.status === "refunded").length,
    totalRevenueMMK: adminRequests
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => {
        const amt = r.amountMMK || (r.planId === "monthly" ? 5000 : r.planId === "six_months" ? 25000 : 60000);
        return sum + amt;
      }, 0)
  };

  // Display Premium expiration time format
  const getPremiumExpiryText = () => {
    if (!user.premiumUntil) return "";
    const date = new Date(user.premiumUntil);
    return date.toLocaleDateString("my-MM", { year: "numeric", month: "long", day: "numeric" }) + " ထိ";
  };

  // Calculation of membership status info using centralized security module
  const isPremiumActive = isUserPremium(user);
  const isExpired = isUserPremiumExpired(user);

  const getStatusTitle = () => {
    if (isPremiumActive) {
      if (user.premiumPlan === "lifetime") return "Premium Lifetime Plan 👑";
      if (user.premiumPlan === "six_months") return "Premium 6 Months Plan 👑";
      return "Premium Monthly Plan 👑";
    }
    if (isExpired) return "Premium Expired ⏳";
    return "Free Member Plan ⚡";
  };

  const getRemainingDaysText = () => {
    if (!isPremiumActive) return "0 Days Remaining";
    if (user.premiumPlan === "lifetime") return "Unlimited (Lifetime Access 👑)";
    if (!user.premiumUntil) return "Active";
    const diffMs = new Date(user.premiumUntil).getTime() - Date.now();
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return `${days} Days Remaining (${days} ရက် ကျန်ရှိသေးသည်)`;
  };

  const getActivationDateText = () => {
    if (user.premiumActivatedAt) {
      return new Date(user.premiumActivatedAt).toLocaleDateString("my-MM", { year: "numeric", month: "short", day: "numeric" });
    }
    return user.isPremium ? "Active" : "N/A (Free Member)";
  };

  const getExpiryDateText = () => {
    if (user.premiumPlan === "lifetime") return "တစ်သက်တာ (Never Expires 👑)";
    if (user.premiumUntil) {
      return new Date(user.premiumUntil).toLocaleDateString("my-MM", { year: "numeric", month: "short", day: "numeric" });
    }
    return "N/A (Free Member)";
  };

  const getExpiryWarningBanner = () => {
    if (isExpired) {
      return (
        <div className="mt-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 text-xs font-bold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <span className="block">⚠️ သင်၏ Premium သက်တမ်း ကုန်ဆုံးသွားပါပြီ (Expired)</span>
            <p className="font-normal text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              သင် ပြီးစီးခဲ့ပြီးသော သင်ခန်းစာများ၊ ပရောဂျက်များ၊ Certificate ဘာဂျ်များနှင့် မှတ်စုများအားလုံး လုံခြုံစွာ ရှိနေမည်ဖြစ်ပါသည်။ Premium အင်္ဂါရပ်များ အပြည့်အဝ ပြန်လည်ရယူရန် သက်တမ်းတိုး (Renew) ပါခင်ဗျာ။
            </p>
          </div>
        </div>
      );
    }

    if (isPremiumActive && user.premiumPlan !== "lifetime" && user.premiumUntil) {
      const diffMs = new Date(user.premiumUntil).getTime() - Date.now();
      const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      
      if (days <= 1) {
        return (
          <div className="mt-3 p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-start gap-3 text-amber-700 dark:text-amber-300 text-xs font-bold animate-pulse">
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="block">⏰ သတိပေးချက်: သင်၏ Premium သက်တမ်း ကုန်ဆုံးရန် ၁ ရက် (သို့) ၂၄ နာရီအောက်သာ ကျန်ရှိပါတော့သည်!</span>
              <p className="font-normal text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                သင်ယူမှု မပြတ်တောက်စေရန် ယခုပင် သက်တမ်းတိုး (Renew) သို့မဟုတ် Plan ပြောင်းလဲပါ ခင်ဗျာ။
              </p>
            </div>
          </div>
        );
      } else if (days <= 3) {
        return (
          <div className="mt-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="block">⏰ သတိပေးချက်: သင်၏ Premium သက်တမ်း ကုန်ဆုံးရန် {days} ရက်သာ ကျန်ရှိပါတော့သည် (3 Days Remaining)</span>
              <p className="font-normal text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                သင်ယူမှု ကောင်းမွန်စွာ ဆက်လက်လုပ်ဆောင်နိုင်ရန် ကြိုတင် သက်တမ်းတိုးနိုင်ပါသည်။
              </p>
            </div>
          </div>
        );
      } else if (days <= 7) {
        return (
          <div className="mt-3 p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center gap-3 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>🔔 အသိပေးချက်: သင်၏ Premium သက်တမ်း ကုန်ဆုံးရန် {days} ရက် ကျန်ရှိပါသည် (7 Days Remaining)</span>
          </div>
        );
      }
    }

    return null;
  };

  const featureComparisonMatrix = [
    { feature: "အခြေခံ သင်တန်းများနှင့် သင်ခန်းစာများ (Basic Courses & Lessons)", free: "✅ ရရှိနိုင်သည်", premium: "✅ ရရှိနိုင်သည်", icon: FileText },
    { feature: "အဆင့်မြင့် & လုပ်ငန်းသုံး သင်တန်းများ (Advanced & Pro Courses)", free: "🔒 အကြိုကြည့်ရုံ (Preview)", premium: "✅ အကန့်အသတ်မရှိ (All Courses) 👑", icon: Code, highlight: true },
    { feature: "သင်ယူမှု လမ်းကြောင်းများ (All Roadmaps & Career Tracks)", free: "⚡ အခြေခံအဆင့်သာ", premium: "✅ Roadmaps အားလုံး ရယူနိုင် 👑", icon: ExternalLink },
    { feature: "လက်တွေ့ ပရောဂျက်များ (All Projects & Challenges)", free: "⚡ Basic Projects သာ", premium: "✅ All Projects & Premium Challenges 👑", icon: Sparkles, highlight: true },
    { feature: "Quizzes & ဉာဏ်စမ်း မေးခွန်းများ (Quizzes)", free: "⚡ Basic Quizzes", premium: "✅ All Quizzes & Premium Tests 👑", icon: Award },
    { feature: "Kibo AI Assistant (AI လက်ထောက်)", free: "⚡ တစ်ရက်လျှင် ၅ ကြိမ်", premium: "✅ အကန့်အသတ်မရှိ Advanced AI 👑", icon: Zap, highlight: true },
    { feature: "Extended AI Code Review (ကုဒ်စစ်ဆေးပေးခြင်း)", free: "⚡ အခြေခံ စစ်ဆေးမှု", premium: "✅ Extended AI Review & Refactoring 👑", icon: Code },
    { feature: "Extended AI Debug Assistant (Debug ကူညီခြင်း)", free: "⚡ ကန့်သတ်ချက်ဖြင့်", premium: "✅ Extended AI Debugging Support 👑", icon: Sparkles },
    { feature: "ကိုယ်ပိုင် မှတ်စုများ (Unlimited Learning Notes)", free: "⚡ အများဆုံး ၅ ခု", premium: "✅ အကန့်အသတ်မရှိ (Unlimited) 👑", icon: FileText },
    { feature: "သင်ခန်းစာ Bookmarks (Unlimited Bookmarks)", free: "⚡ အများဆုံး ၅ ခု", premium: "✅ အကန့်အသတ်မရှိ (Unlimited) 👑", icon: Check },
    { feature: "Advanced Portfolio (ကိုယ်ပိုင် အဆင့်မြင့် ပေါ်တိုဖိုလီယို)", free: "⚡ Basic Portfolio", premium: "✅ Advanced Portfolio & Badges 👑", icon: Award, highlight: true },
    { feature: "Exclusive Premium Badge (👑 သီးသန့် ဘာဂျ်)", free: "❌ မပါဝင်ပါ", premium: "✅ Exclusive Crown Badge 👑", icon: ShieldCheck, highlight: true },
    { feature: "QR Verified Premium Certificates (တရားဝင် ဘွဲ့ရလက်မှတ်)", free: "⚡ Standard Certificate", premium: "✅ QR Verified Premium Certificate 👑", icon: Award },
    { feature: "Priority Support & Feature Access (ဦးစားပေး ကူညီမှု)", free: "⚡ Normal Support", premium: "✅ Priority Feature & Dedicated Support 👑", icon: UserCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 text-left">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Header Info with Kibo Mascot */}
        <div className="bg-gradient-to-tr from-[#1E293B] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-1 space-y-3.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase rounded-full tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Premium Membership</span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-4xl leading-tight tracking-tight">
                Code Learn <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Kibo Premium</span> ရယူပါ
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                ကြော်ငြာများကင်းစင်ပြီး အဆင့်မြင့်သင်ရိုးညွှန်းတမ်းများ၊ လက်တွေ့ကျသောလုပ်ငန်းသုံးပရောဂျက်များ၊ 
                ကန့်သတ်မဲ့ Kibo AI လက်ထောက်နှင့် နိုင်ငံတကာအသိအမှတ်ပြု ဘွဲ့ရလက်မှတ်များအားလုံးကို တစ်နေရာတည်းတွင် အပြည့်အဝရယူလိုက်ပါ။
              </p>
              
              {user.isPremium ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-2xl border border-yellow-500/30">
                  <ShieldCheck className="w-4 h-4 fill-current" />
                  <span>အကောင့်အခြေအနေ - Premium 👑 ({getPremiumExpiryText()})</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-2xl border border-slate-700/60">
                  <Lock className="w-3.5 h-3.5" />
                  <span>အကောင့်အခြေအနေ - Free အကောင့် (အခြေခံသင်ခန်းစာများသာ)</span>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 bg-slate-800/40 p-4 rounded-3xl border border-slate-800 backdrop-blur-sm">
              <KiboMascot 
                emotion={user.isPremium ? "proud" : "excited"} 
                size="md" 
                speechBubble={user.isPremium ? "Premium ဝင်ရောက်ခြင်းအတွက် ကျေးဇူးတင်ပါတယ်ခင်ဗျာ! အတူတူကြိုးစားစို့" : "Kibo Premium မှာ Advanced သင်ခန်းစာတွေစောင့်ကြိုနေတယ်နော်!"} 
              />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 space-x-1">
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "plans"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            👑 Premium Plans များ
          </button>
          
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "submissions"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            📄 လျှောက်ထားမှုမှတ်တမ်း ({mySubmissions.length})
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "admin"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Settings className="w-4 h-4 animate-spin-slow" />
              <span>🛠️ Admin Dashboard</span>
            </button>
          )}
        </div>

        {/* ----------------- TAB 1: PLANS ----------------- */}
        {activeTab === "plans" && (
          <div className="space-y-8">

            {/* MEMBERSHIP STATUS DISPLAY CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      MEMBERSHIP STATUS OVERVIEW
                    </span>
                    {isPremiumActive && (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        👑 ACTIVE PREMIUM
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>လက်ရှိအကောင့်ပလန်:</span>
                    <span className="text-blue-600 dark:text-blue-400">{getStatusTitle()}</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-150 dark:border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Current Plan</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{getStatusTitle()}</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-150 dark:border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Activation Date</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">{getActivationDateText()}</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-150 dark:border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Expiration Date</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">{getExpiryDateText()}</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-150 dark:border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Remaining Days</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{getRemainingDaysText()}</span>
                    </div>
                  </div>

                  {getExpiryWarningBanner()}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  {isPremiumActive ? (
                    <button
                      onClick={() => {
                        const elem = document.getElementById("plans-section");
                        elem?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Renew / Upgrade Plan (သက်တမ်းတိုး/အဆင့်မြှင့်မည်)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const elem = document.getElementById("plans-section");
                        elem?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Purchase Premium Now (Premium ရယူမည်)</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Graceful Downgrade Assurance Banner */}
              <div className="mt-5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <h5 className="font-bold text-slate-900 dark:text-white">💡 သက်တမ်းကုန်ဆုံးခြင်းဆိုင်ရာ အာမခံချက် (Graceful Downgrade Guarantee)</h5>
                  <p className="leading-relaxed text-[11px]">
                    Premium သက်တမ်း ကုန်ဆုံးသွားပါက Premium Feature များ ခေတ္တသော့ခတ်သွားမည်ဖြစ်သော်လည်း <strong>ယခင် သင်ပြီးစီးခဲ့သော သင်ခန်းစာများ၊ တည်ဆောက်ခဲ့သော ပရောဂျက်များနှင့် ရရှိထားသော ဘွဲ့ရလက်မှတ် (Certificates) အားလုံး</strong>သည် ကျောင်းသားထံတွင် ၁၀၀% ဆက်လက်ရှိနေမည်ဖြစ်ပြီး မည်သည့်အခါမျှ ပျက်စီးသွားမည် မဟုတ်ပါ။
                  </p>
                </div>
              </div>

              {/* Telegram Video Delivery Hub Promo Card */}
              <div className="mt-5 p-5 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/20">
                    <Send className="w-5 h-5 -rotate-12 translate-x-[-1px] translate-y-[-1px]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Telegram Video Lessons & Resource Hub</span>
                      </h5>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25">
                        Official Channel
                      </span>
                      {user?.telegramVerificationStatus === "approved" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> VIP Verified
                        </span>
                      ) : user?.telegramVerificationStatus === "pending" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" /> Pending Review
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                      ဗီဒီယို သင်ခန်းစာများနှင့် Project Starter Source Code ZIP များကို Telegram Channel များမှတစ်ဆင့် မြန်မာပြည်တွင်း အင်တာနက်လိုင်း ချွေတာစွာ အလွယ်တကူ Download ရယူကာ Offline ကြည့်ရှုလေ့လာနိုင်ပါသည်။
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => setIsTelegramHubOpen(true)}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram Video Hub ဖွင့်မည်</span>
                  </button>
                  <a
                    href="https://t.me/code_Learn_myanmar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Free Channel</span>
                  </a>
                </div>
              </div>
            </div>

            {/* FEATURE COMPARISON MATRIX TABLE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md overflow-hidden">
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  <span>Free Member vs Premium Member လုပ်ဆောင်ချက်များ နှိုင်းယှဉ်ချက်</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Free အကောင့်တွင် အခြေခံ အုတ်မြစ် ကောင်းစွာ တည်ဆောက်နိုင်ပြီး Premium အကောင့်တွင် Advanced သင်ခန်းစာများနှင့် အကန့်အသတ်မဲ့ AI များကို အပြည့်အဝ သုံးနိုင်ပါသည်
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-mono uppercase bg-slate-50 dark:bg-slate-800/40">
                      <th className="py-3 px-4">လုပ်ဆောင်ချက် (Feature / Capability)</th>
                      <th className="py-3 px-4 text-slate-600 dark:text-slate-300">Free Member (အခမဲ့အကောင့်)</th>
                      <th className="py-3 px-4 text-amber-500 font-extrabold">👑 Premium Member (VIP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {featureComparisonMatrix.map((item, idx) => {
                      const IconComp = item.icon;
                      return (
                        <tr key={item.feature || idx} className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors ${
                          item.highlight ? "bg-amber-500/5 dark:bg-amber-500/10 font-medium" : ""
                        }`}>
                          <td className="py-3 px-4 flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
                            <IconComp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span>{item.feature}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                            {item.free}
                          </td>
                          <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">
                            {item.premium}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 1. KEY PREMIUM BENEFITS SHOWCASE (7 CORE DOMAINS) */}
            <div className="space-y-6">
              
              {/* Header for Benefits Showcase */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span>Premium သီးသန့် အကျိုးကျေးဇူးများနှင့် ဝန်ဆောင်မှုများ</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    အောက်ဖော်ပြပါ အဆင့်မြင့် ဝန်ဆောင်မှုများအားလုံးကို Premium အဖွဲ့ဝင်ဖြစ်သည်နှင့် တပြိုင်နက် အပြည့်အဝ အသုံးပြုနိုင်မည်ဖြစ်ပါသည်
                  </p>
                </div>
                <button
                  onClick={() => {
                    const elem = document.getElementById("plans-selection-grid");
                    elem?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer w-fit"
                >
                  <span>စျေးနှုန်းနှင့် ပက်ကေ့ဂျ်များ ကြည့်မည်</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1. Core Premium Features Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Sparkles className="w-4.5 h-4.5 text-blue-500" />
                    <span>👑 Premium Features (အဆင့်မြင့် လုပ်ဆောင်ချက်များ)</span>
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full">
                    8 Core Capabilities
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {[
                    { title: "100% Ad-Free Experience", desc: "Quizzes, Codes နှင့် စာမေးပွဲများတွင် ကြော်ငြာလုံးဝမပေါ်ဘဲ အာရုံစူးစိုက်နိုင်ခြင်း", icon: ShieldCheck, tag: "Focus Mode" },
                    { title: "Unlimited AI Mentoring", desc: "Kibo AI ထံမှ နေ့စဉ် မေးခွန်းကန့်သတ်ချက်မရှိ စိတ်ကြိုက်မေးမြန်းနိုင်ခြင်း", icon: Zap, tag: "Unlimited" },
                    { title: "QR-Verified Certificates", desc: "သင်တန်းတစ်ခုစီပြီးဆုံးတိုင်း CV တွင်ထည့်သွင်းနိုင်သော တရားဝင်ဘွဲ့ရလက်မှတ်", icon: Award, tag: "Accredited" },
                    { title: "Unlimited Notes & Bookmarks", desc: "အရေးကြီး သင်ခန်းစာများကို မှတ်စုနှင့် Bookmarks အကန့်အသတ်မရှိ သိမ်းဆည်းနိုင်ခြင်း", icon: BookMarked, tag: "Cloud Sync" },
                    { title: "Career Roadmaps & Tracks", desc: "Beginner မှ Professional သို့ တက်လှမ်းရန် စနစ်တကျ ပြုစုထားသော လမ်းကြောင်းများ", icon: Layers, tag: "Step-by-Step" },
                    { title: "Interactive Quizzes & Tests", desc: "ဉာဏ်စမ်းမေးခွန်းများ၊ Solution ရှင်းလင်းချက်များနှင့် အသေးစိတ် ဖြေဆိုခွင့်", icon: CheckCircle2, tag: "Full Access" },
                    { title: "VIP Profile & Crown Badge", desc: "Profile တွင် ရွှေရောင် Crown Badge နှင့် ဦးစားပေး Rank သတ်မှတ်ချက်", icon: Crown, tag: "Exclusive" },
                    { title: "Priority Mentor Support", desc: "သင်ခန်းစာ အခက်အခဲများကို ဆရာများထံမှ အချိန်တိုအတွင်း တိုက်ရိုက်မေးမြန်းခြင်း", icon: MessageSquare, tag: "Priority" }
                  ].map((feat, idx) => {
                    const IconComp = feat.icon;
                    return (
                      <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                            {feat.tag}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{feat.title}</h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">{feat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Available Courses Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                      <BookOpen className="w-4.5 h-4.5 text-emerald-500" />
                      <span>📚 Available Courses (တက်ရောက်နိုင်သော သင်တန်းများ)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Premium ဖြင့် အောက်ပါ နည်းပညာသင်တန်းများ အားလုံးကို အစအဆုံး အပြည့်အဝ လေ့လာခွင့်ရရှိမည်
                    </p>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                    All Courses Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {[
                    {
                      name: "HTML5 & Modern CSS",
                      desc: "Semantic Tags, Flexbox, CSS Grid, Responsive Design နှင့် Modern UI",
                      lessons: "15 Lessons",
                      projects: "3 Projects",
                      level: "Beginner",
                      icon: Layout,
                      color: "from-orange-500/10 to-amber-500/10 border-orange-500/20 text-orange-500"
                    },
                    {
                      name: "Python Programming Basics",
                      desc: "Variables, Conditions, Loops, Functions, Data Structures နှင့် OOP",
                      lessons: "12 Lessons",
                      projects: "2 Projects",
                      level: "Beginner",
                      icon: Terminal,
                      color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500"
                    },
                    {
                      name: "Modern JavaScript & TypeScript",
                      desc: "ES6+, DOM Manipulation, Async/Await, Web APIs နှင့် Types",
                      lessons: "18 Lessons",
                      projects: "4 Projects",
                      level: "Intermediate",
                      icon: FileCode,
                      color: "from-yellow-500/10 to-amber-500/10 border-yellow-500/20 text-yellow-600"
                    },
                    {
                      name: "React 19 & Full-Stack Web",
                      desc: "Components, Hooks, State, Tailwind, Node.js နှင့် Express APIs",
                      lessons: "20 Lessons",
                      projects: "5 Projects",
                      level: "Advanced",
                      icon: Code,
                      color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-500"
                    },
                    {
                      name: "Git & GitHub Workflow",
                      desc: "Version Control, Branching, Pull Requests, Merge Conflict နှင့် CI/CD",
                      lessons: "8 Lessons",
                      projects: "2 Projects",
                      level: "Essential",
                      icon: FolderArchive,
                      color: "from-red-500/10 to-rose-500/10 border-red-500/20 text-red-500"
                    },
                    {
                      name: "Database Design & SQL",
                      desc: "Relational Schemas, PostgreSQL, Queries, Indexing & Normalization",
                      lessons: "10 Lessons",
                      projects: "2 Projects",
                      level: "Intermediate",
                      icon: Database,
                      color: "from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-500"
                    },
                    {
                      name: "Mobile & App Architecture",
                      desc: "React Native အခြေခံ၊ Cross-Platform UI နှင့် Mobile Performance",
                      lessons: "10 Lessons",
                      projects: "2 Projects",
                      level: "Advanced",
                      icon: Smartphone,
                      color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500"
                    },
                    {
                      name: "UI/UX & Design Systems",
                      desc: "Color Theory, Typography, Spacing, Figma Tokens နှင့် Accessibility",
                      lessons: "8 Lessons",
                      projects: "2 Projects",
                      level: "Creative",
                      icon: Sparkles,
                      color: "from-pink-500/10 to-rose-500/10 border-pink-500/20 text-pink-500"
                    }
                  ].map((course, idx) => {
                    const IconComp = course.icon;
                    return (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between space-y-3">
                        <div className="flex items-start justify-between">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${course.color} border flex items-center justify-center`}>
                            <IconComp className="w-4.5 h-4.5" />
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                            {course.level}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{course.name}</h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{course.desc}</p>
                        </div>
                        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{course.lessons}</span>
                          <span className="text-emerald-500 font-bold">{course.projects}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Advanced Lessons & 4. Premium Videos (2 Columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Advanced Lessons */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <FileCode2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                          🚀 Advanced Lessons (အဆင့်မြင့် သင်ခန်းစာများ)
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-mono">Production-Grade Deep Dives</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      အခြေခံပြီးမြောက်ပြီးသော ကျောင်းသားများအတွက် အလုပ်ခွင်ဝင်ရောက်နိုင်သည်အထိ အဆင့်မြင့်နည်းပညာများကို အသေးစိတ် လက်တွေ့လေ့ကျင့်ပေးပါသည်-
                    </p>

                    <div className="space-y-2 pt-1">
                      {[
                        { title: "Asynchronous JavaScript & Event Loop", detail: "Promises, Async/Await, Microtasks & Web Workers" },
                        { title: "State Management Architecture", detail: "Zustand, Redux Toolkit & React Context Performance" },
                        { title: "Production REST & JWT Authentication", detail: "Express.js, Middleware, Refresh Tokens & RBAC Security" },
                        { title: "SQL Optimization & Database Indexing", detail: "Query Execution Plans, Indexes & Normalization" },
                        { title: "Cloud Deployment & Docker CI/CD", detail: "Dockerizing Apps, Cloud Run Deployments & Env Secrets" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <div className="text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                            <span className="text-slate-400 block text-[10px]">{item.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Premium Videos */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                          🎬 Premium Videos (ဗီဒီယို သင်ခန်းစာများ)
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-mono">1080p HD & Offline Viewing</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      ရှင်းလင်းပြတ်သားသော အသံ၊ ၁၀၈၀p ဗီဒီယိုများနှင့်အတူ လက်တွေ့ ပရောဂျက်တည်ဆောက်ပုံများကို အဆင့်ဆင့် ကြည့်ရှုလေ့လာနိုင်ပါသည်-
                    </p>

                    <div className="space-y-2 pt-1">
                      {[
                        { title: "1080p Crystal Clear Screencasts", detail: "ကုဒ်စာလုံးတိုင်းကို ပြတ်သားစွာ မြင်တွေ့ရသော အရည်အသွေးမြင့် ဗီဒီယိုများ" },
                        { title: "Offline Video Download Access", detail: "အင်တာနက်လိုင်းမလိုဘဲ ဖုန်း/ကွန်ပျူတာထဲ ဒေါင်းလုဒ်ဆွဲကာ အော့ဖ်လိုင်း ကြည့်ရှုနိုင်ခြင်း" },
                        { title: "High-Speed Telegram Video Mirror", detail: "ပြည်တွင်း အင်တာနက် ဒေတာဖိုး အလွန်သက်သာစေရန် Telegram မှ တိုက်ရိုက်ဒေါင်းလုဒ်" },
                        { title: "Step-by-Step Project Walkthroughs", detail: "အစမှအဆုံး ပရောဂျက်များကို ဆရာနှင့်အတူ လိုက်လံတည်ဆောက်သည့် လက်တွေ့ဗီဒီယိုများ" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-2">
                          <PlayCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                          <div className="text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                            <span className="text-slate-400 block text-[10px]">{item.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* 5. Premium Resources & 6. Kibo Benefits (2 Columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Premium Resources */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <FolderArchive className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                          📦 Premium Resources (အရင်းအမြစ် & ကုဒ်ဖိုင်များ)
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-mono">Downloadable Source Kits & Guides</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      အချိန်ကုန်သက်သာစေရန်နှင့် အလုပ်ခွင်သုံး စံချိန်မီကုဒ်များကို တိုက်ရိုက်ဒေါင်းလုဒ်ရယူကာ အသုံးပြုနိုင်ပါသည်-
                    </p>

                    <div className="space-y-2 pt-1">
                      {[
                        { title: "Production Starter Code Kits", detail: "ချက်ချင်း run နိုင်သော Full-Stack Boilerplates (React, Express, Tailwind, Vite)" },
                        { title: "High-Res PDF Cheat Sheets", detail: "HTML5, CSS3, JavaScript ES6+, Python နှင့် Git Commands လက်စွဲ PDF များ" },
                        { title: "System Architecture Diagrams", detail: "Database Relational Schemas နှင့် Server Architecture ဒီဇိုင်းပုံစံများ" },
                        { title: "Tech Interview Prep Question Bank", detail: "လုပ်ငန်းခွင် အင်တာဗျူးများတွင် မေးလေ့ရှိသော Coding & Architecture မေးခွန်း ၁၀၀+" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5 stroke-[3px]" />
                          <div className="text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                            <span className="text-slate-400 block text-[10px]">{item.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kibo Benefits */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                          🤖 Kibo AI Mentor Benefits (Kibo အကျိုးကျေးဇူးများ)
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-mono">24/7 Personalized AI Tutor</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      မြန်မာဘာသာဖြင့် သဘာဝကျကျ အမေးအဖြေပြုလုပ်နိုင်သော AI Mentor Kibo ၏ အဆင့်မြင့် လုပ်ဆောင်ချက်များ-
                    </p>

                    <div className="space-y-2 pt-1">
                      {[
                        { title: "Unlimited 24/7 Myanmar AI Tutor", detail: "မည်သည့်အချိန်မဆို သင်ခန်းစာမေးခွန်းများကို ကန့်သတ်ချက်မရှိ ချက်ချင်းမေးမြန်းနိုင်ခြင်း" },
                        { title: "Instant Error & Bug Debugger", detail: "ကုဒ်မှားနေပါက ဘာကြောင့်မှားသည်၊ မည်သို့ပြင်ဆင်ရမည်ကို အသေးစိတ်ရှင်းပြပေးခြင်း" },
                        { title: "Line-by-Line Code Review", detail: "သင်ရေးသားထားသော ကုဒ်များကို စစ်ဆေးပေးပြီး Clean Code ဖြစ်အောင် အကြံပြုခြင်း" },
                        { title: "Voice-Assisted Audio Explanation", detail: "စာဖတ်ရသက်သာစေရန် မြန်မာအသံဖြင့် ရှင်းပြပေးသော Voice Assistance" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-2">
                          <Zap className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5 fill-current" />
                          <div className="text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                            <span className="text-slate-400 block text-[10px]">{item.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* 7. Premium Telegram Access Card */}
              <div className="bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-500/20 rounded-3xl p-6 text-left shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-500/20">
                    <Send className="w-6 h-6 -rotate-12 translate-x-[-1px] translate-y-[-1px]" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ✈️ Premium Telegram VIP Access (VIP တယ်လီဂရမ် အဖွဲ့ဝင်ခွင့်)
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                        Exclusive Channel
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                      Premium ကျောင်းသားများ သီးသန့် VIP Telegram Group တွင် ဆရာများနှင့် တိုက်ရိုက် မေးမြန်းဆွေးနွေးနိုင်ပြီး၊ ဗီဒီယိုသင်ခန်းစာများနှင့် Resource ZIP ဖိုင်များကို မြန်မာပြည်တွင်း အင်တာနက်လိုင်း ချွေတာစွာ အလွယ်တကူ Download ရယူနိုင်ပါသည်။
                    </p>
                    <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-sky-500" /> Direct Mentor Q&A</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-sky-500" /> High-Speed Mirror</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-sky-500" /> Live Study Sessions</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsTelegramHubOpen(true)}
                  className="px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-sky-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer flex-shrink-0 w-full md:w-auto"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram Hub စစ်ဆေးမည်</span>
                </button>
              </div>

            </div>

            {/* ================================================= */}
            {/* SERVER-TRUSTED PREMIUM LIFECYCLE & FEATURES ARCHITECTURE */}
            {/* ================================================= */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 relative z-10">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 text-[11px] font-mono font-bold uppercase rounded-full border border-amber-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Server-Side Controlled Lifecycle</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Premium Flow & Trusted Architecture
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    ကျောင်းသားများ၏ Premium အဆင့်အတန်းနှင့် Feature ရယူခွင့်များကို လုံခြုံစိတ်ချရသော Server-Side Timestamp များနှင့် စစ်ဆေးအတည်ပြုချက်များဖြင့်သာ ထိန်းချုပ်ထားပါသည်။
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700/60 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-300 font-mono text-[11px]">Server Verified:</span>
                  <span className={`font-bold ${isPremiumActive ? "text-amber-400" : "text-slate-400"}`}>
                    {isPremiumActive ? "👑 Premium Active" : isExpired ? "⏳ Expired" : "⚡ Free Member"}
                  </span>
                </div>
              </div>

              {/* 1. Step-by-Step Flow Chart */}
              <div className="space-y-3 relative z-10">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span>🔄 Premium Flow (အဆင့်ဆင့် လုပ်ဆောင်ပုံ)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  {[
                    { step: "1", title: "User", desc: "ကျောင်းသား အကောင့်ဖွင့်ခြင်း", icon: "👤", color: "border-slate-700 bg-slate-800/60" },
                    { step: "2", title: "Choose Plan", desc: "မိမိနှစ်သက်ရာ Plan ရွေးချယ်ခြင်း", icon: "🎯", color: "border-blue-500/40 bg-blue-500/10" },
                    { step: "3", title: "Payment", desc: "KBZPay / WavePay / Coins ဖြင့် ငွေလွှဲခြင်း", icon: "💳", color: "border-indigo-500/40 bg-indigo-500/10" },
                    { step: "4", title: "Verification", desc: "Admin မှ Transaction စစ်ဆေးအတည်ပြုခြင်း", icon: "🛡️", color: "border-amber-500/40 bg-amber-500/10" },
                    { step: "5", title: "Activated", desc: "Server ပေါ်တွင် Premium သက်တမ်း စတင်ခြင်း", icon: "⚡", color: "border-emerald-500/40 bg-emerald-500/10" },
                    { step: "6", title: "Features Unlocked", desc: "Premium Feature များ ချက်ချင်း အသုံးပြုခွင့်ရရှိခြင်း", icon: "👑", color: "border-yellow-500/60 bg-yellow-500/15" },
                  ].map((f, i) => (
                    <div key={f.step} className={`p-3.5 rounded-2xl border ${f.color} flex flex-col justify-between space-y-2 relative`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{f.icon}</span>
                        <span className="text-[10px] font-mono font-black text-slate-400 px-2 py-0.5 rounded-full bg-slate-900/60">
                          Step {f.step}
                        </span>
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-white">{f.title}</h5>
                        <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. The 6 Core Premium Features Grid */}
              <div className="space-y-3 relative z-10 pt-2">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5" />
                  <span>💎 Premium Features (ပါဝင်သော အထူးလုပ်ဆောင်ချက် ၆ မျိုး)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[
                    {
                      id: "advanced_lessons",
                      name: "1. Advanced Lessons",
                      myanmarName: "အဆင့်မြင့် သင်ခန်းစာများ",
                      desc: "သင်ခန်းစာ ၃ မှစတင်၍ ကျန်ရှိသော Advanced Modules, Security, Best Practices များကို အပြည့်အဝ လေ့လာခွင့်",
                      icon: BookOpen,
                      status: isPremiumActive ? "Unlocked 👑" : "Premium Only 🔒"
                    },
                    {
                      id: "premium_videos",
                      name: "2. Premium Videos",
                      myanmarName: "သီးသန့် ဗီဒီယိုသင်ခန်းစာများ",
                      desc: "Telegram Fast-Mirror နှင့် HD Video Streaming ဖြင့် မြန်မာပြည်တွင်း အင်တာနက် သက်သာစွာ ဒေါင်းလုဒ်ရယူနိုင်ခြင်း",
                      icon: Video,
                      status: isPremiumActive ? "Unlocked 👑" : "Premium Only 🔒"
                    },
                    {
                      id: "premium_resources",
                      name: "3. Premium Resources",
                      myanmarName: "ဒေါင်းလုဒ် ရင်းမြစ်များ",
                      desc: "Production Starter Code ZIPs, Developer Cheat Sheets, Architecture Boilerplates များကို ဒေါင်းလုဒ်ရယူနိုင်ခြင်း",
                      icon: FolderArchive,
                      status: isPremiumActive ? "Unlocked 👑" : "Premium Only 🔒"
                    },
                    {
                      id: "advanced_projects",
                      name: "4. Advanced Projects",
                      myanmarName: "လက်တွေ့ အဆင့်မြင့် ပရောဂျက်များ",
                      desc: "Fullstack E-Commerce, Real-Time Chat, Cloud API ပရောဂျက်ကြီးများနှင့် ဆရာများ၏ Code Grading စနစ်",
                      icon: Code,
                      status: isPremiumActive ? "Unlocked 👑" : "Premium Only 🔒"
                    },
                    {
                      id: "higher_kibo_usage",
                      name: "5. Higher Kibo Usage",
                      myanmarName: "Kibo AI မြင့်မားသော ကန့်သတ်ချက်",
                      desc: "ဉာဏ်ရည်ပြည့် အဆင့်မြင့် Gemini မော်ဒယ်ဖြင့် ကန့်သတ်မဲ့ Code Review, Deep Debugging နှင့် စိတ်ကြိုက် ရှင်းလင်းချက်များ",
                      icon: Zap,
                      status: isPremiumActive ? "Unlimited 👑" : "5 msgs/day ⚡"
                    },
                    {
                      id: "telegram_access",
                      name: "6. Premium Telegram Access",
                      myanmarName: "သီးသန့် Telegram VIP Channel",
                      desc: "VIP Private Community, ဆရာများနှင့် တိုက်ရိုက်ဆွေးနွေးမှု Q&A နှင့် အထူး update များကို အချိန်နှင့်တပြေးညီ ရယူခြင်း",
                      icon: Send,
                      status: isPremiumActive ? "VIP Access 👑" : "Free Channel ⚡"
                    },
                  ].map((feat) => {
                    const IconComp = feat.icon;
                    return (
                      <div 
                        key={feat.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPremiumActive 
                            ? "bg-slate-800/80 border-amber-500/30 text-slate-200" 
                            : "bg-slate-800/40 border-slate-700/60 text-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                            isPremiumActive 
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-700/60 text-slate-400 border border-slate-600/40"
                          }`}>
                            {feat.status}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white mt-2.5">{feat.name}</h5>
                        <p className="text-[11px] font-medium text-amber-300/80">{feat.myanmarName}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">{feat.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Expiration Policy Box */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-2">
                      <span>⏳ သက်တမ်းကုန်ဆုံးခြင်း မူဝါဒ (Expiration Rule)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Graceful Downgrade
                      </span>
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Premium သက်တမ်း ကုန်ဆုံးပါက <strong>Premium Features (၆ မျိုး) သည် ခေတ္တ Locked ဖြစ်သွားမည်</strong> ဖြစ်ပြီး၊ 
                      <strong> Free Features (အခြေခံသင်ခန်းစာများ၊ Quizzes၊ ရရှိထားပြီးသော Certificates များ) သည် ၁၀၀% ဆက်လက်ရရှိနိုင်မည်ဖြစ်ပါသည်။</strong>
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Server-Side Enforced</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PRICING PLANS & SELECTION GRID */}
            <div id="plans-section" className="space-y-6 pt-4">
              
              <div id="plans-selection-grid" className="text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-blue-500" />
                      <span>ရွေးချယ်နိုင်သော Premium အစီအစဉ်များ (Available Pricing Plans)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      မိမိနှင့် သင့်လျော်သော ပက်ကေ့ဂျ်ကို ရွေးချယ်ပြီး "Upgrade to Premium" ကို နှိပ်ပါ
                    </p>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                    🛡️ 7-Day Money-Back Guarantee
                  </span>
                </div>
              </div>

              {/* Package Plan Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(Object.keys(plansInfo) as Array<"monthly" | "six_months" | "lifetime">).map((key) => {
                  const plan = plansInfo[key];
                  const isSelected = selectedPlan === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedPlan(key)}
                      className={`p-6 rounded-3xl border text-left flex flex-col justify-between transition-all relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-b from-blue-600 to-indigo-700 text-white border-blue-500 shadow-xl shadow-blue-500/20 scale-[1.02]"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 shadow-md"
                      }`}
                    >
                      {plan.saveLabel && (
                        <span className={`absolute top-3 right-3 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full shadow-sm ${
                          isSelected ? "bg-white text-blue-600" : "bg-gradient-to-r from-red-500 to-rose-600 text-white animate-pulse"
                        }`}>
                          {plan.saveLabel}
                        </span>
                      )}
                      
                      <div>
                        <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isSelected ? "text-blue-100" : "text-slate-400"
                        }`}>
                          {plan.duration}
                        </p>
                        <h4 className="text-lg font-black mt-1 leading-snug">{plan.name}</h4>
                        <p className={`text-xs mt-2 leading-relaxed ${
                          isSelected ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                        }`}>
                          {plan.desc}
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/80 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Check className={`w-3.5 h-3.5 ${isSelected ? "text-blue-200" : "text-emerald-500"}`} />
                            <span>အဆင့်မြင့် သင်တန်းများနှင့် ဗီဒီယိုအားလုံး</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Check className={`w-3.5 h-3.5 ${isSelected ? "text-blue-200" : "text-emerald-500"}`} />
                            <span>Kibo AI လက်ထောက်နှင့် Telegram VIP</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Check className={`w-3.5 h-3.5 ${isSelected ? "text-blue-200" : "text-emerald-500"}`} />
                            <span>QR Verified ဘွဲ့ရလက်မှတ်များ</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-dashed border-slate-200/50 dark:border-slate-800 flex flex-col space-y-3 w-full">
                        <div className="flex items-baseline justify-between">
                          <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tight">{plan.priceMMK} MMK</span>
                            <span className={`text-[10px] font-mono ${
                              isSelected ? "text-blue-200" : "text-slate-400"
                            }`}>
                              သို့မဟုတ် {plan.priceCoins} Coins
                            </span>
                          </div>
                          
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                            isSelected ? "bg-white border-white text-blue-600" : "border-slate-300 dark:border-slate-700"
                          }`}>
                            {isSelected && <Check className="w-4 h-4 stroke-[4px]" />}
                          </div>
                        </div>

                        {/* Direct CTA on the card */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(key);
                            const elem = document.getElementById("checkout-options-section");
                            elem?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-white text-blue-600 hover:bg-blue-50 shadow-md"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-current" />
                          <span>{key === "lifetime" ? "Get Lifetime Access" : "Upgrade to Premium"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Methods & Verification Section */}
              <div id="checkout-options-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
              
              {/* Left/Middle Column - Checkout Forms */}
              <div className="lg:col-span-2 space-y-8">

              {/* Payment Methods Wrapper */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Option A: Coin payment */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                        <Coins className="w-5 h-5 fill-current" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">Option A: Coins ဖြင့် တိုက်ရိုက်ယူရန်</h4>
                        <span className="text-[10px] text-slate-400 block font-mono">Instant Virtual Upgrade</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      သင့်တွင် စုဆောင်းထားသော Virtual Coins လုံလောက်ပါက ချက်ချင်း Premium အဖြစ်သို့ အတည်ပြုချက်စောင့်စရာမလိုဘဲ တက်လှမ်းနိုင်ပါသည်။
                    </p>

                    <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 flex justify-between items-center text-xs font-bold text-yellow-600 dark:text-yellow-400">
                      <span>သင့်လက်ရှိ Coins အရေအတွက်:</span>
                      <span className="font-mono text-sm">{user.coins || 0} Coins</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleCoinUpgrade}
                      disabled={user.isPremium}
                      className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-yellow-500/10"
                    >
                      <Coins className="w-4 h-4 fill-current" />
                      <span>{plansInfo[selectedPlan].priceCoins} Coins ဖြင့် ချက်ချင်းရယူပါ</span>
                    </button>
                  </div>
                </div>

                {/* Manual payment instruction block */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center space-x-2.5 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">လွှဲပြောင်းရမည့် ငွေစာရင်းအသေးစိတ်</h4>
                      <span className="text-[10px] text-slate-400 block font-mono">Configure Payment Accounts</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">KBZPay ACCOUNT</p>
                      <p className="text-sm font-mono font-extrabold text-blue-600 dark:text-blue-400 mt-1">{paymentConfig.kpayNumber}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5">{paymentConfig.kpayName}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">WAVEMONEY ACCOUNT</p>
                      <p className="text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{paymentConfig.waveNumber}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5">{paymentConfig.waveName}</p>
                    </div>

                    <div className="flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400 bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>ငွေလွှဲပြောင်းရာတွင် ရွေးချယ်ထားသော ပက်ကေ့ဂျ်စျေးနှုန်းအတိုင်း အတိအကျလွှဲပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Manual Transfer Screenshot Upload Form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">Option B: ငွေလွှဲဓာတ်ပုံတင်ပြရန် (KPay / Wave)</h4>
                    <span className="text-[10px] text-slate-400 block font-mono">Manual Bank Proof Submission</span>
                  </div>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">ရွေးချယ်ထားသော ပက်ကေ့ဂျ်</label>
                    <input
                      type="text"
                      disabled
                      value={`${plansInfo[selectedPlan].name} (${plansInfo[selectedPlan].priceMMK} MMK)`}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">ငွေလွှဲခဲ့သည့် နည်းလမ်း ရွေးချယ်ရန် (Payment Method)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("KPay")}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          selectedPaymentMethod === "KPay"
                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                            : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center font-extrabold text-[10px]">K</div>
                        <span>KBZPay (KPay)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("Wave Money")}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          selectedPaymentMethod === "Wave Money"
                            ? "bg-yellow-500 text-slate-950 border-yellow-500 shadow-md shadow-yellow-500/20"
                            : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-yellow-500/30 flex items-center justify-center font-extrabold text-[10px]">W</div>
                        <span>Wave Pay / Money</span>
                      </button>
                    </div>
                  </div>

                  {/* Screenshot Drag & Drop Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">ငွေလွှဲပြေစာ Screenshot တင်သွင်းရန် (မဖြစ်မနေ)</label>
                    
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${
                        isDragging 
                          ? "border-blue-500 bg-blue-500/5" 
                          : screenshotBase64 
                            ? "border-emerald-500 bg-emerald-500/5" 
                            : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 hover:border-slate-400 dark:hover:border-slate-700"
                      }`}
                      onClick={() => document.getElementById("manual-file-upload")?.click()}
                    >
                      <input
                        type="file"
                        id="manual-file-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                      
                      {screenshotBase64 ? (
                        <div className="space-y-3.5">
                          <img 
                            src={screenshotBase64} 
                            alt="Payment slip preview" 
                            className="max-h-48 rounded-xl object-contain mx-auto shadow-md"
                          />
                          <p className="text-[11px] text-emerald-500 font-bold flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>ငွေလွှဲပြေစာ Screenshot ထည့်သွင်းပြီးပါပြီ (ပုံကိုပြောင်းရန် ထပ်နှိပ်ပါ)</span>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-300 flex items-center justify-center mx-auto mb-2">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            ဤနေရာတွင် Screenshot ဆွဲထည့်ပါ သို့မဟုတ် ဖိုင်ရွေးချယ်ရန် နှိပ်ပါ
                          </p>
                          <span className="block text-[10px] text-slate-400">Supported formats: PNG, JPG, JPEG (Max 800KB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transaction Ref Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Transaction ID / TXID (စိတ်ကြိုက်)</label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="ဥပမာ။ 20260711990184 (ဂဏန်း သို့မဟုတ် နံပါတ်စဥ်)"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {submitMessage && (
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      submitMessage.type === "success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                    }`}>
                      {submitMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/10"
                  >
                    {isSubmitting ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 stroke-[3px]" />
                    )}
                    <span>{isSubmitting ? "လုပ်ဆောင်နေပါသည်..." : "လွှဲပြောင်းမှု တင်သွင်းမည် (Submit Proof)"}</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column - FAQs & Refund Policy */}
            <div className="space-y-8">
              
              {/* Promotion / Ads Policy Alert Card */}
              <div className="bg-gradient-to-tr from-purple-900/10 to-indigo-900/10 border border-purple-500/10 rounded-3xl p-6 relative overflow-hidden text-left shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                
                <h4 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest block font-mono mb-2">
                  🛡️ ADVERTISING & ACCESS POLICY
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                  <span className="block font-bold">ကြော်ငြာပေါ်လစီ -</span>
                  Free အသုံးပြုသူများသည် အခါအားလျော်စွာ စိတ်ဓာတ်မြှင့်တင်ရေး ပရိုမိုးရှင်း ကာတွန်းများကို မြင်တွေ့ရမည်ဖြစ်သော်လည်း <strong>Quizzes, Assignments, Project Submissions နှင့် Certificates</strong> များ ရေးသား/ထုတ်ယူရာတွင် ကြော်ငြာများ လုံးဝနှောင့်ယှက်မည်မဟုတ်ပါ။
                </p>
              </div>

              {/* FAQS Accordion Block */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                  <HelpCircle className="w-4.5 h-4.5 text-blue-500" />
                  <span>မေးလေ့မေးထရှိသော မေးခွန်းများ (FAQs)</span>
                </h3>

                <div className="space-y-4 text-xs leading-relaxed">
                  {[
                    {
                      q: "ငွေလွှဲပြီးလျှင် Premium မည်မျှကြာမှ တက်ပါသလဲ။",
                      a: "KBZPay သို့မဟုတ် Wave Screenshot တင်သွင်းပြီးပါက ကျွန်ုပ်တို့၏ စီမံခန့်ခွဲသူ (Admin) များမှ စစ်ဆေးအတည်ပြုပေးပါသည်။ များသောအားဖြင့် ၃ နာရီမှ အများဆုံး ၂၄ နာရီအတွင်း အကောင့်ကို Premium အဖြစ် ချက်ချင်းဖွင့်ပေးပါမည်။"
                    },
                    {
                      q: "Coins ကို ဘယ်လိုရရှိနိုင်ပါသလဲ။",
                      a: "Code Learn Myanmar တွင် အကောင့်ဖွင့်ပြီး သင်တန်းများတက်ရောက်ခြင်း၊ Quizzes မေးခွန်းများကို အောင်မြင်စွာဖြေဆိုခြင်း၊ mini-projects များတင်ပြခြင်းဖြင့် virtual XP နှင့် Coins များ အခမဲ့စုဆောင်းနိုင်ပါသည်။"
                    },
                    {
                      q: "ငွေပြန်အမ်းပေးခြင်းဆိုင်ရာ မူဝါဒ (Refund Policy) ရှိပါသလား။",
                      a: "Premium ဝယ်ယူပြီး သင်ခန်းစာများ ဖတ်ရှုခွင့်မရရှိခြင်း၊ စနစ်ပိုင်းဆိုင်ရာ ချွတ်ယွင်းချက်ရှိပါက ဓာတ်ပုံတင်သွင်းတင်ပြပြီး ၇ ရက်အတွင်း ၁၀၀% ငွေပြန်အမ်းခွင့် တောင်းခံနိုင်ပါသည်။ student support သို့ စာမျက်နှာအောက်ခြေမှ ဆက်သွယ်ပါ။"
                    },
                    {
                      q: "အဆင့်မြှင့်တင်မှု လမ်းကြောင်း (Upgrade Path) ဘယ်လိုရှိလဲ။",
                      a: "လစဉ်ပက်ကေ့ဂျ်မှသည် ၆ လ သို့မဟုတ် တစ်သက်တာပက်ကေ့ဂျ်များသို့ မည်သည့်အချိန်တွင်မဆို အကောင့်ကို Upgrade Path အဆင့်ဆင့်တိုးမြှင့် သွားနိုင်ပါသည်။"
                    },
                    {
                      q: "အနာဂတ်တွင် အခြားငွေပေးချေမှုစနစ်များ ထပ်တိုးဖို့ရှိပါသလား။",
                      a: "ဟုတ်ကဲ့ပါ၊ ကျွန်ုပ်တို့၏ စနစ်တည်ဆောက်ပုံမှာ အနာဂတ်တွင် Auto Payment Gateway, Mobile Subscriptions, Promo Codes များကို လွယ်ကူစွာ ချိတ်ဆက်နိုင်ရန် Flexible Architecture ဖြင့် ပြင်ဆင်ထားပါသည်။"
                    }
                  ].map((faq, idx) => (
                    <div key={idx} className="border-b border-slate-100 dark:border-slate-800/80 pb-3 last:border-0 last:pb-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-start gap-1.5">
                        <span className="text-blue-500">Q.</span>
                        <span>{faq.q}</span>
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-1.5 pl-4">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      )}

        {/* ----------------- TAB 2: MY SUBMISSIONS ----------------- */}
        {activeTab === "submissions" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-500" />
                  <span>လွှဲပြောင်းမှု တင်ပြချက်များ (My Payment Transactions)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">သင်၏ Premium လျှောက်ထားမှု မှတ်တမ်းများ၊ ပြေစာများနှင့် စစ်ဆေးချက် အခြေအနေများ</p>
              </div>
              <button 
                onClick={loadStudentRequests}
                className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-1.5 w-fit"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMySubmissions ? "animate-spin" : ""}`} />
                <span>ပြန်လည်ဆန်းသစ်ရန် (Refresh)</span>
              </button>
            </div>

            {/* Filter Controls Toolbar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative md:col-span-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    placeholder="TXID, Request ID ဖြင့် ရှာဖွေရန်..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">အခြေအနေ: အားလုံး (All Statuses)</option>
                    <option value="pending">စောင့်ဆိုင်းဆဲ (Pending)</option>
                    <option value="approved">အတည်ပြုပြီး (Approved)</option>
                    <option value="rejected">ငြင်းပယ်ထား (Rejected)</option>
                    <option value="cancelled">ပယ်ဖျက်ထား (Cancelled)</option>
                    <option value="refunded">ငွေပြန်အမ်းပြီး (Refunded)</option>
                  </select>
                </div>

                {/* Method Filter */}
                <div>
                  <select
                    value={studentMethodFilter}
                    onChange={(e) => setStudentMethodFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">ငွေပေးချေမှု နည်းလမ်း: အားလုံး</option>
                    <option value="KPay">KPay (KBZPay)</option>
                    <option value="Wave Money">Wave Pay / Money</option>
                    <option value="Coins">Coins Upgrade</option>
                  </select>
                </div>

                {/* Plan Filter */}
                <div>
                  <select
                    value={studentPlanFilter}
                    onChange={(e) => setStudentPlanFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">ပက်ကေ့ဂျ်: အားလုံး (All Plans)</option>
                    <option value="monthly">Monthly (၁ လ)</option>
                    <option value="six_months">6 Months (၆ လ)</option>
                    <option value="lifetime">Lifetime (တစ်သက်တာ)</option>
                  </select>
                </div>
              </div>

              {(studentSearchTerm || studentStatusFilter !== "all" || studentMethodFilter !== "all" || studentPlanFilter !== "all") && (
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-500">
                    တွေ့ရှိသော မှတ်တမ်း: <strong className="text-purple-600 dark:text-purple-400">{filteredMySubmissions.length}</strong> / {mySubmissions.length} ခု
                  </span>
                  <button
                    onClick={() => {
                      setStudentSearchTerm("");
                      setStudentStatusFilter("all");
                      setStudentMethodFilter("all");
                      setStudentPlanFilter("all");
                    }}
                    className="text-purple-600 hover:underline font-bold"
                  >
                    Filter များကို ပြန်စброရန် (Clear Filters)
                  </button>
                </div>
              )}
            </div>

            {loadingMySubmissions ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <Clock className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-2" />
                <span>လျှောက်ထားမှုများကို ဆွဲယူနေပါသည်...</span>
              </div>
            ) : filteredMySubmissions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Wallet className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-xs font-bold">တင်ပြထားသော လွှဲပြောင်းမှုမရှိသေးပါ (သို့မဟုတ် ရှာဖွေမှုနှင့် မကိုက်ညီပါ)။</p>
                <p className="text-[10px] text-slate-400 mt-1">Premium Plan ရွေးချယ်ပြီး manual screenshot ဖြင့် တင်သွင်းနိုင်ပါသည်။</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-mono uppercase">
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">ပက်ကေ့ဂျ် (Plan)</th>
                      <th className="py-3 px-4">နည်းလမ်း (Method)</th>
                      <th className="py-3 px-4">ပမာဏ (Amount)</th>
                      <th className="py-3 px-4">TXID Reference</th>
                      <th className="py-3 px-4">ရက်စွဲ (Date)</th>
                      <th className="py-3 px-4">အခြေအနေ (Status)</th>
                      <th className="py-3 px-4 text-center">လုပ်ဆောင်ချက် (Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {filteredMySubmissions.map((req, idx) => (
                      <tr key={req.requestId || req.id || `sub_${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="py-4 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">{req.requestId}</td>
                        <td className="py-4 px-4 font-bold capitalize text-slate-900 dark:text-white">
                          {plansInfo[req.planId]?.name || req.planId}
                        </td>
                        <td className="py-4 px-4 font-bold">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {req.paymentMethod || "KPay / Wave"}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {req.amountMMK ? `${req.amountMMK.toLocaleString()} MMK` : req.paymentMethod === "Coins" ? "Coins Upgrade" : `${(req.planId === 'monthly' ? 5000 : req.planId === 'six_months' ? 25000 : 60000).toLocaleString()} MMK`}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-slate-500">
                          {req.transactionRef || <span className="text-slate-400 italic font-normal">ဖြည့်မထားပါ</span>}
                        </td>
                        <td className="py-4 px-4 font-mono text-[10px] text-slate-400">
                          {new Date(req.submittedAt).toLocaleString("my-MM")}
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(req.status)}</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => setSelectedRequestDetail(req)}
                            className="px-3 py-1.5 text-[11px] font-bold bg-purple-600/10 hover:bg-purple-600 text-purple-600 hover:text-white rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>အသေးစိတ်</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 3: ADMIN DASHBOARD ----------------- */}
        {activeTab === "admin" && isAdmin && (
          <div className="space-y-8 text-left">
            
            {/* Direct Student Membership Control Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                    ကျောင်းသား Premium အကောင့် တိုက်ရိုက် စီမံခန့်ခွဲမှု (Direct Student Membership Management)
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    ကျောင်းသားများ၏ Premium အကောင့်များကို တိုက်ရိုက် Activate ပြုလုပ်ခြင်း၊ Deactivate ပြုလုပ်ခြင်း၊ Plan ပြောင်းလဲခြင်း သို့မဟုတ် သက်တမ်းတိုးမြှင့်ပေးခြင်း
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Student UID သို့မဟုတ် Email
                  </label>
                  <input
                    type="text"
                    value={adminTargetUid}
                    onChange={(e) => setAdminTargetUid(e.target.value)}
                    placeholder="e.g. user_12345 or student@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Membership Plan ရွေးချယ်ပါ
                  </label>
                  <select
                    value={adminTargetPlan}
                    onChange={(e) => setAdminTargetPlan(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="monthly">Monthly Plan (၁ လ)</option>
                    <option value="six_months">6-Months Plan (၆ လ)</option>
                    <option value="lifetime">Lifetime Plan (တစ်သက်တာ 👑)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Custom Days (ရက်ပေါင်း)
                  </label>
                  <input
                    type="number"
                    value={adminCustomDays}
                    onChange={(e) => setAdminCustomDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                    placeholder="e.g. 30"
                  />
                </div>
              </div>

              {adminDirectMsg && (
                <div className={`p-3.5 rounded-xl border text-xs font-bold ${
                  adminDirectMsg.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                }`}>
                  {adminDirectMsg.text}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={handleAdminDirectActivate}
                  disabled={adminDirectLoading}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Activate Premium (ဖွင့်လှစ်မည်)</span>
                </button>

                <button
                  onClick={() => handleAdminDirectExtend(30)}
                  disabled={adminDirectLoading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Extend +30 Days (+၃၀ ရက် သက်တမ်းတိုး)</span>
                </button>

                <button
                  onClick={() => handleAdminDirectExtend(180)}
                  disabled={adminDirectLoading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Extend +180 Days (+၆ လ သက်တမ်းတိုး)</span>
                </button>

                <button
                  onClick={handleAdminDirectDeactivate}
                  disabled={adminDirectLoading}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-red-500/10 cursor-pointer"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>Deactivate Premium (ပိတ်သိမ်းမည်)</span>
                </button>
              </div>
            </div>

            {/* Payment Details Config Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
              <div className="flex items-center space-x-2.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Settings className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">ငွေလက်ခံစာရင်း ပြင်ဆင်ရန် (Admin Account configuration)</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">ကျောင်းသားများ မြင်တွေ့ရမည့် KBZPay နှင့် Wave ငွေလွှဲအကောင့်နံပါတ်များကို စီမံရန်</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-4">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">KBZPay Setting</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">KBZPay Account Phone</label>
                      <input
                        type="text"
                        value={editKpayNum}
                        onChange={(e) => setEditKpayNum(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100"
                        placeholder="09..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">KBZPay Account Owner Name</label>
                      <input
                        type="text"
                        value={editKpayName}
                        onChange={(e) => setEditKpayName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
                        placeholder="U..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-4">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">WaveMoney Setting</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">WaveMoney Phone</label>
                      <input
                        type="text"
                        value={editWaveNum}
                        onChange={(e) => setEditWaveNum(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100"
                        placeholder="09..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">WaveMoney Account Owner Name</label>
                      <input
                        type="text"
                        value={editWaveName}
                        onChange={(e) => setEditWaveName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
                        placeholder="U..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Dynamic Pricing Settings */}
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4 text-left">
                <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">💰 Dynamic Plan Pricing Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Monthly Price config */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-3">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full font-bold uppercase">Monthly Plan</span>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Price (Myanmar Kyats - MMK)</label>
                      <input
                        type="number"
                        value={editPriceMonthlyMMK}
                        onChange={(e) => setEditPriceMonthlyMMK(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Price (Learning Coins)</label>
                      <input
                        type="number"
                        value={editPriceMonthlyCoins}
                        onChange={(e) => setEditPriceMonthlyCoins(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono font-bold text-yellow-500"
                      />
                    </div>
                  </div>

                  {/* 6 Months Price config */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-3">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full font-bold uppercase">6-Months Plan</span>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Price (Myanmar Kyats - MMK)</label>
                      <input
                        type="number"
                        value={editPriceSixMonthsMMK}
                        onChange={(e) => setEditPriceSixMonthsMMK(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Price (Learning Coins)</label>
                      <input
                        type="number"
                        value={editPriceSixMonthsCoins}
                        onChange={(e) => setEditPriceSixMonthsCoins(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono font-bold text-yellow-500"
                      />
                    </div>
                  </div>

                  {/* Lifetime Price config */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-3">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full font-bold uppercase">Lifetime Plan</span>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Price (Myanmar Kyats - MMK)</label>
                      <input
                        type="number"
                        value={editPriceLifetimeMMK}
                        onChange={(e) => setEditPriceLifetimeMMK(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Price (Learning Coins)</label>
                      <input
                        type="number"
                        value={editPriceLifetimeCoins}
                        onChange={(e) => setEditPriceLifetimeCoins(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono font-bold text-yellow-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Discount & Promotional Campaigns */}
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono">📢 Premium Promotional Campaigns</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editIsPromoActive}
                      onChange={(e) => setEditIsPromoActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                    <span className="ml-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Promo Campaign Active</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Discount %</label>
                        <input
                          type="number"
                          value={editPromoDiscountPercent}
                          onChange={(e) => setEditPromoDiscountPercent(Number(e.target.value))}
                          className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono font-bold text-red-500"
                          placeholder="e.g. 20"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={editPromoStartDate}
                          onChange={(e) => setEditPromoStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-[10px] font-mono text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">End Date</label>
                        <input
                          type="date"
                          value={editPromoEndDate}
                          onChange={(e) => setEditPromoEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-[10px] font-mono text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Promo Banner Ad Text (Shown on Dashboard & Promos)</label>
                      <textarea
                        value={editPromoBannerText}
                        onChange={(e) => setEditPromoBannerText(e.target.value)}
                        className="w-full h-18 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans"
                        placeholder="ပရိုမိုးရှင်း စာသား..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Special Events, Contest and Challenges */}
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4 text-left">
                <h4 className="text-xs font-extrabold text-pink-600 dark:text-pink-400 uppercase tracking-wider font-mono">🏆 Special Events & Learning Challenges</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Select Event Type */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Select Active Event</label>
                      <select
                        value={editCurrentEventId}
                        onChange={(e) => setEditCurrentEventId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <option value="none">No Event Active (ပွဲတော်မရှိပါ)</option>
                        <option value="html_week">HTML Week Challenge</option>
                        <option value="js_challenge">JavaScript Coding Challenge</option>
                        <option value="css_contest">CSS Design Contest</option>
                        <option value="holiday">Holiday Learning Event</option>
                        <option value="anniversary">CLM Anniversary Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Daily Check-In Extra XP Bonus (%)</label>
                      <input
                        type="number"
                        value={editCurrentEventBonusXp}
                        onChange={(e) => setEditCurrentEventBonusXp(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono font-bold text-pink-500"
                        placeholder="e.g. 50 for +50% extra XP"
                      />
                    </div>
                  </div>

                  {/* Title & Description of the Event */}
                  <div className="col-span-2 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Event Title (Myanmar)</label>
                      <input
                        type="text"
                        value={editCurrentEventTitle}
                        onChange={(e) => setEditCurrentEventTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold"
                        placeholder="e.g. JavaScript ရက်သတ္တပတ် စိန်ခေါ်မှု"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Event Description & Rules (Myanmar)</label>
                      <textarea
                        value={editCurrentEventDescription}
                        onChange={(e) => setEditCurrentEventDescription(e.target.value)}
                        className="w-full h-18 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs leading-relaxed font-sans"
                        placeholder="e.g. စိန်ခေါ်မှုကာလအတွင်း နေ့စဉ်မပျက် check-in ဝင်ပြီး ၅၀% ပိုမိုများပြားသော XP ရယူပါ!"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/10 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3px]" />
                  <span>အပြောင်းအလဲ သိမ်းဆည်းရန် (Save Settings)</span>
                </button>
              </div>
            </div>

            {/* Submissions List Review Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
              
              {/* Summary Stats Cards Bar */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">TOTAL REQUESTS</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{adminStats.total}</p>
                </div>

                <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase block">PENDING VERIFY</span>
                  <p className="text-lg font-black text-amber-500 mt-1">{adminStats.pending}</p>
                </div>

                <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase block">APPROVED</span>
                  <p className="text-lg font-black text-emerald-500 mt-1">{adminStats.approved}</p>
                </div>

                <div className="p-4 bg-red-500/5 dark:bg-red-500/10 rounded-2xl border border-red-500/20">
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase block">REJECTED</span>
                  <p className="text-lg font-black text-red-500 mt-1">{adminStats.rejected}</p>
                </div>

                <div className="col-span-2 md:col-span-1 p-4 bg-purple-500/5 dark:bg-purple-500/10 rounded-2xl border border-purple-500/20">
                  <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase block">APPROVED REVENUE</span>
                  <p className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">{adminStats.totalRevenueMMK.toLocaleString()} MMK</p>
                </div>
              </div>

              {/* Toolbar: Search, Filters & Export Buttons */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={adminSearchTerm}
                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                    placeholder="Transaction ID, UID, Email, Name, TXID ဖြင့် ရှာဖွေရန်..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Status Filter Dropdown */}
                <select
                  value={adminFilter}
                  onChange={(e) => setAdminFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Status: အားလုံး (All Statuses)</option>
                  <option value="pending">စောင့်ဆိုင်းဆဲ (Pending)</option>
                  <option value="approved">အတည်ပြုပြီး (Approved)</option>
                  <option value="rejected">ငြင်းပယ်ထား (Rejected)</option>
                  <option value="cancelled">ပယ်ဖျက်ထား (Cancelled)</option>
                  <option value="refunded">ငွေပြန်အမ်းပြီး (Refunded)</option>
                </select>

                {/* Payment Method Filter */}
                <select
                  value={adminMethodFilter}
                  onChange={(e) => setAdminMethodFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Method: အားလုံး</option>
                  <option value="KPay">KPay (KBZPay)</option>
                  <option value="Wave Money">Wave Pay / Money</option>
                  <option value="Coins">Coins Upgrade</option>
                </select>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportTransactionsToCSV(filteredAdminRequests)}
                    className="px-3 py-2 text-xs font-bold bg-emerald-600/10 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    title="Export Filtered Transactions to CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>

                  <button
                    onClick={() => exportTransactionsToJSON(filteredAdminRequests)}
                    className="px-3 py-2 text-xs font-bold bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    title="Export Filtered Transactions to JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {loadingAdminRequests ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Clock className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-2" />
                  <span>လျှောက်ထားချက်များကို ဆွဲယူနေပါသည်...</span>
                </div>
              ) : filteredAdminRequests.length === 0 ? (
                <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <UserCheck className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-xs font-bold">ရှာဖွေမှု သို့မဟုတ် Filter နှင့် ကိုက်ညီသော လျှောက်ထားချက် မရှိပါ။</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredAdminRequests.map((req, idx) => {
                    const dupCheck = checkDuplicateRequest(req, adminRequests);
                    return (
                      <div key={req.requestId || req.id || `admin_req_${idx}`} className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row gap-5">
                        
                        {/* Left: Thumbnail image with hover-zoom */}
                        <div className="flex-shrink-0 flex items-start justify-center">
                          {req.screenshot ? (
                            <div className="relative group">
                              <img 
                                src={req.screenshot} 
                                className="w-32 h-44 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                                alt="bill image"
                              />
                              <button
                                onClick={() => setViewImageSrc(req.screenshot || null)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white text-[10px] font-bold"
                              >
                                ပုံကြီးကြည့်ရန်
                              </button>
                            </div>
                          ) : (
                            <div className="w-32 h-44 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                              ပုံမရှိပါ
                            </div>
                          )}
                        </div>

                        {/* Middle: Request details info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h4 className="text-xs font-mono text-slate-400 flex items-center gap-2">
                                <span>Request ID:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{req.requestId}</span>
                                <button 
                                  onClick={() => setSelectedRequestDetail(req)} 
                                  className="text-purple-600 hover:underline text-[10px] flex items-center gap-0.5 ml-2 font-sans font-bold"
                                >
                                  <Eye className="w-3 h-3" /> အပြည့်အစုံ
                                </button>
                              </h4>
                              <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                                {req.userName || "အမည်မသိကျောင်းသား"} ({req.userEmail})
                              </p>
                              <span className="text-[10px] font-mono text-slate-400 block">UID: {req.uid}</span>
                            </div>
                            <div>
                              {getStatusBadge(req.status)}
                            </div>
                          </div>

                          {/* Duplicate Warning Banner if flags detected */}
                          {dupCheck.isDuplicate && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-400 space-y-1">
                              <p className="font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <span>သတိပေးချက်: ထပ်နေသော ငွေလွှဲပြေစာ (Duplicate Transaction Detected)</span>
                              </p>
                              <ul className="list-disc pl-5 text-[11px] space-y-0.5 text-amber-600 dark:text-amber-300">
                                {dupCheck.reasons.map((r, rIdx) => (
                                  <li key={rIdx}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-3 text-[11px] font-sans leading-relaxed">
                            <div className="bg-slate-100/60 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-200/20">
                              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">SELECTED PLAN</p>
                              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 capitalize">{plansInfo[req.planId]?.name || req.planId}</p>
                            </div>

                            <div className="bg-slate-100/60 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-200/20">
                              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">PAYMENT METHOD</p>
                              <p className="text-xs font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">{req.paymentMethod || "KPay / Wave"}</p>
                            </div>

                            <div className="bg-slate-100/60 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-200/20">
                              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">TXID REFERENCE</p>
                              <p className="text-xs font-mono font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{req.transactionRef || "ဖြည့်မထားပါ"}</p>
                            </div>
                          </div>

                          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                            <span>တင်သွင်းသည့် ရက်စွဲ: <strong className="text-slate-600 dark:text-slate-300">{new Date(req.submittedAt).toLocaleString("my-MM")}</strong></span>
                            {req.reviewedAt && <span>စစ်ဆေးခဲ့သည့် ရက်စွဲ: <strong className="text-slate-600 dark:text-slate-300">{new Date(req.reviewedAt).toLocaleString("my-MM")}</strong></span>}
                          </div>

                          {/* Admin input for notes */}
                          {req.status === "pending" ? (
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">Admin Verification Notes (မှတ်ချက် သို့မဟုတ် ငြင်းပယ်ရခြင်းအကြောင်းရင်း)</label>
                              <input
                                type="text"
                                value={adminNotes[req.requestId] || ""}
                                onChange={(e) => setAdminNotes({ ...adminNotes, [req.requestId]: e.target.value })}
                                placeholder="ဥပမာ။ ငွေလွှဲမှု မှန်ကန်ကြောင်း စစ်ဆေးတွေ့ရှိရသဖြင့် Premium သို့ အတည်ပြုပေးလိုက်ပါသည်။"
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          ) : (
                            req.notes && (
                              <div className="p-3 bg-slate-100/50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs">
                                <span className="font-bold text-slate-500 block text-[9px] uppercase font-mono mb-1">SAVED VERIFICATION NOTES</span>
                                <p className="text-slate-600 dark:text-slate-300 font-semibold">{req.notes}</p>
                              </div>
                            )
                          )}
                        </div>

                        {/* Right: Actions buttons */}
                        <div className="flex md:flex-col justify-end gap-2 flex-shrink-0 md:w-36">
                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAdminAction(req.requestId, req.uid, "approved", req.planId)}
                                disabled={adminActionLoading[req.requestId]}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
                              >
                                {adminActionLoading[req.requestId] ? (
                                  <Clock className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                )}
                                <span>အတည်ပြုမည်</span>
                              </button>

                              <button
                                onClick={() => handleAdminAction(req.requestId, req.uid, "rejected", req.planId)}
                                disabled={adminActionLoading[req.requestId]}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-red-500/10"
                              >
                                {adminActionLoading[req.requestId] ? (
                                  <Clock className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5 stroke-[3px]" />
                                )}
                                <span>ငြင်းပယ်မည်</span>
                              </button>
                            </>
                          )}

                          {req.status === "approved" && (
                            <button
                              onClick={() => handleAdminAction(req.requestId, req.uid, "rejected", req.planId)}
                              disabled={adminActionLoading[req.requestId]}
                              className="py-2 px-3 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Revoke / Reject</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Telegram Channels & VIP Access Request Review Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                    <Send className="w-5 h-5 -rotate-12 translate-x-[-1px] translate-y-[-1px]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                      <span>Telegram Channels & VIP Verification Dashboard</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25">
                        Video Delivery Hub
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      ကျောင်းသားများ၏ Telegram VIP Channel ဝင်ခွင့်တောင်းဆိုမှုများကို အတည်ပြုပေးခြင်းနှင့် Channel Links များကို စီမံခန့်ခွဲခြင်း
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadTelegramData}
                    className="px-3.5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingTelegramRequests ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Telegram Channel Configuration */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-sky-500" />
                  <span>Telegram Channel Configuration (ချန်နယ်လင့်ခ်များ ပြင်ဆင်ရန်)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Free Public Channel Title
                    </label>
                    <input
                      type="text"
                      value={editTgFreeName}
                      onChange={(e) => setEditTgFreeName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      placeholder="Code Learn Myanmar"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Free Public Channel URL
                    </label>
                    <input
                      type="text"
                      value={editTgFreeUrl}
                      onChange={(e) => setEditTgFreeUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      placeholder="https://t.me/code_Learn_myanmar"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Premium VIP Private Channel Title
                    </label>
                    <input
                      type="text"
                      value={editTgPremiumName}
                      onChange={(e) => setEditTgPremiumName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      placeholder="Code Learn Myanmar (VIP / Premium Pro)"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Premium VIP Channel Invite Link (Private Join Link)
                    </label>
                    <input
                      type="text"
                      value={editTgPremiumUrl}
                      onChange={(e) => setEditTgPremiumUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      placeholder="https://t.me/+CLM_VIP_Verified_DirectAccess"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Support Admin Telegram Handle
                    </label>
                    <input
                      type="text"
                      value={editTgSupportHandle}
                      onChange={(e) => setEditTgSupportHandle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      placeholder="@CodeLearnAdmin"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="tg-admin-verify"
                      checked={editTgVerificationRequired}
                      onChange={(e) => setEditTgVerificationRequired(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300"
                    />
                    <label htmlFor="tg-admin-verify" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      VIP Channel ဝင်ခွင့်အတွက် Admin Verification မဖြစ်မနေ လိုအပ်မည်
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveTelegramConfig}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-sky-500/10 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    <span>Telegram ဆက်တင်များ သိမ်းဆည်းမည်</span>
                  </button>
                </div>
              </div>

              {/* Feedback alert */}
              {telegramFeedbackMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{telegramFeedbackMsg}</span>
                </div>
              )}

              {/* Telegram Student Requests List */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {(["all", "pending", "approved", "rejected"] as const).map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => setTelegramStatusFilter(filterType)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                          telegramStatusFilter === filterType
                            ? "bg-sky-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {filterType === "all" ? "အားလုံး (All)" : filterType === "pending" ? "စောင့်ဆိုင်းဆဲ (Pending)" : filterType === "approved" ? "အတည်ပြုပြီး (Approved)" : "ငြင်းပယ်ထား (Rejected)"}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full md:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={telegramSearchTerm}
                      onChange={(e) => setTelegramSearchTerm(e.target.value)}
                      placeholder="Username, Name, UID..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {loadingTelegramRequests ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <Clock className="w-6 h-6 animate-spin mx-auto text-slate-400 mb-2" />
                    <span>Telegram တောင်းဆိုချက်များကို ဆွဲယူနေပါသည်...</span>
                  </div>
                ) : telegramRequests.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Send className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold">Telegram VIP တောင်းဆိုမှု မှတ်တမ်း မရှိသေးပါ။</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-mono uppercase bg-slate-50 dark:bg-slate-800/40">
                          <th className="py-3 px-4">Request ID</th>
                          <th className="py-3 px-4">ကျောင်းသား (Student)</th>
                          <th className="py-3 px-4">Telegram Handle</th>
                          <th className="py-3 px-4">Membership Plan</th>
                          <th className="py-3 px-4">တောင်းဆိုသည့်ရက်စွဲ</th>
                          <th className="py-3 px-4">အခြေအနေ (Status)</th>
                          <th className="py-3 px-4 text-center">လုပ်ဆောင်ချက် (Actions)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {telegramRequests
                          .filter(r => {
                            if (telegramStatusFilter !== "all" && r.status !== telegramStatusFilter) return false;
                            if (telegramSearchTerm.trim()) {
                              const q = telegramSearchTerm.toLowerCase();
                              return (
                                r.requestId?.toLowerCase().includes(q) ||
                                r.userName?.toLowerCase().includes(q) ||
                                r.userEmail?.toLowerCase().includes(q) ||
                                r.telegramUsername?.toLowerCase().includes(q) ||
                                r.uid?.toLowerCase().includes(q)
                              );
                            }
                            return true;
                          })
                          .map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                              <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">{req.requestId}</td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900 dark:text-white">{req.userName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{req.userEmail}</div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                <a
                                  href={`https://t.me/${req.telegramUsername.replace("@", "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline inline-flex items-center gap-1"
                                >
                                  {req.telegramUsername}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                              <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">{req.planName}</td>
                              <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                                {new Date(req.createdAt).toLocaleString("my-MM")}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  req.status === "approved"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : req.status === "pending"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                }`}>
                                  {req.status === "approved" ? "Approved" : req.status === "pending" ? "Pending" : "Rejected"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {req.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => handleApproveTelegramReq(req)}
                                        disabled={telegramActionLoading[req.id]}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check className="w-3 h-3" />
                                        <span>Approve</span>
                                      </button>
                                      <button
                                        onClick={() => handleRejectTelegramReq(req)}
                                        disabled={telegramActionLoading[req.id]}
                                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <X className="w-3 h-3" />
                                        <span>Reject</span>
                                      </button>
                                    </>
                                  )}
                                  {req.status === "approved" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(req.privateInviteLink || editTgPremiumUrl);
                                          alert("VIP Channel Invite Link copied to clipboard!");
                                        }}
                                        className="px-2.5 py-1 bg-sky-500/15 hover:bg-sky-500 text-sky-600 hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Copy className="w-3 h-3" />
                                        <span>Copy Link</span>
                                      </button>
                                      <button
                                        onClick={() => handleRejectTelegramReq(req)}
                                        disabled={telegramActionLoading[req.id]}
                                        className="px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Revoke</span>
                                      </button>
                                    </>
                                  )}
                                  {req.status === "rejected" && (
                                    <button
                                      onClick={() => handleApproveTelegramReq(req)}
                                      disabled={telegramActionLoading[req.id]}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Re-approve</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        </div>

      {/* Transaction Details Modal */}
      {selectedRequestDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-scale-in text-left space-y-6 my-8">
            <button
              onClick={() => setSelectedRequestDetail(null)}
              className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3px]" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  ငွေပေးချေမှု အသေးစိတ် (Transaction Receipt)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID: <span className="font-bold text-purple-600">{selectedRequestDetail.requestId}</span>
                </p>
              </div>
            </div>

            {/* Invoice Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">STUDENT INFO</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{selectedRequestDetail.userName || "အမည်မသိကျောင်းသား"}</p>
                <p className="text-slate-500 font-mono text-[11px]">{selectedRequestDetail.userEmail}</p>
                <p className="text-slate-400 font-mono text-[10px]">UID: {selectedRequestDetail.uid}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">PLAN & AMOUNT</span>
                <p className="font-extrabold text-purple-600 dark:text-purple-400 capitalize">
                  {plansInfo[selectedRequestDetail.planId]?.name || selectedRequestDetail.planId}
                </p>
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {selectedRequestDetail.amountMMK ? `${selectedRequestDetail.amountMMK.toLocaleString()} MMK` : selectedRequestDetail.paymentMethod === "Coins" ? "Coins Upgrade" : `${(selectedRequestDetail.planId === 'monthly' ? 5000 : selectedRequestDetail.planId === 'six_months' ? 25000 : 60000).toLocaleString()} MMK`}
                </p>
                <p className="text-slate-500 text-[11px]">Method: <strong className="text-slate-700 dark:text-slate-300">{selectedRequestDetail.paymentMethod || "KPay/Wave"}</strong></p>
              </div>
            </div>

            {/* Reference & Status */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-100/60 dark:bg-slate-800/20 rounded-xl border border-slate-200/40 font-mono">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">TXID / REFERENCE</span>
                <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">{selectedRequestDetail.transactionRef || "ဖြည့်မထားပါ"}</p>
              </div>

              <div className="p-3 bg-slate-100/60 dark:bg-slate-800/20 rounded-xl border border-slate-200/40">
                <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">STATUS</span>
                {getStatusBadge(selectedRequestDetail.status)}
              </div>
            </div>

            {/* Screenshot preview */}
            {selectedRequestDetail.screenshot && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <span>ငွေလွှဲပြေစာ Screenshot</span>
                </span>
                <div 
                  onClick={() => setViewImageSrc(selectedRequestDetail.screenshot || null)}
                  className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5 cursor-zoom-in relative group"
                >
                  <img src={selectedRequestDetail.screenshot} className="w-full h-full object-contain mx-auto" alt="Receipt slip" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-xs font-bold">
                    ပုံကြီးချဲ့၍ ကြည့်ရန် (Zoom)
                  </div>
                </div>
              </div>
            )}

            {/* Notes if present */}
            {selectedRequestDetail.notes && (
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-xs space-y-1">
                <span className="text-[10px] font-bold text-purple-600 uppercase font-mono block">VERIFICATION / REJECTION NOTES</span>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">{selectedRequestDetail.notes}</p>
              </div>
            )}

            {/* Audit Trail History */}
            {selectedRequestDetail.auditTrail && selectedRequestDetail.auditTrail.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  စနစ်စစ်ဆေးမှု မှတ်တမ်း (Audit Trail)
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedRequestDetail.auditTrail.map((log, lIdx) => (
                    <div key={lIdx} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-[11px] flex items-center justify-between font-mono">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">{log.action}</span>
                      <span className="text-slate-400 text-[10px]">{new Date(log.timestamp).toLocaleString("my-MM")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancel request option if student & pending */}
            {selectedRequestDetail.status === "pending" && selectedRequestDetail.uid === user?.uid && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    handleCancelMyRequest(selectedRequestDetail);
                    setSelectedRequestDetail(null);
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>ဤငွေလွှဲတောင်းဆိုမှုကို ပယ်ဖျက်မည် (Cancel Request)</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Enlarged Screenshot Modal */}
      {viewImageSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-2 shadow-2xl animate-scale-in">
            <button
              onClick={() => setViewImageSrc(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white hover:bg-red-500 hover:scale-105 transition-all cursor-pointer z-10"
            >
              <X className="w-4 h-4 stroke-[3px]" />
            </button>
            <img 
              src={viewImageSrc} 
              className="max-w-full max-h-[80vh] rounded-2xl object-contain mx-auto" 
              alt="Enlarged slip" 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Telegram Video Delivery Hub Modal */}
      <TelegramVideoHubModal
        isOpen={isTelegramHubOpen}
        onClose={() => setIsTelegramHubOpen(false)}
        user={user}
        onRefreshUser={onRefreshUser}
      />

    </div>
  );
}
