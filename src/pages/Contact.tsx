/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Send, 
  Facebook, 
  Info, 
  CheckCircle2,
  AlertTriangle,
  LifeBuoy,
  MessageSquare,
  Bug,
  Sparkles,
  Shield,
  Search,
  Filter,
  Paperclip,
  Monitor,
  Clock,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  FileText,
  HelpCircle,
  TrendingUp,
  Archive,
  Bot,
  UserCheck,
  Zap,
  BookOpen,
  Award,
  CreditCard,
  Lock,
  Layers,
  ArrowRight
} from "lucide-react";
import { 
  UserProfile, 
  SupportTicket, 
  SupportCategory, 
  SupportStatus, 
  SupportPriority 
} from "../types";
import { 
  submitSupportTicket, 
  getSupportTickets, 
  updateSupportTicketStatus, 
  replyToSupportTicket, 
  isValidEmail, 
  sanitizeInput,
  createNotification 
} from "../lib/db";

interface ContactProps {
  user?: UserProfile;
}

// Category list configuration
const CATEGORIES: { id: SupportCategory; labelMm: string; icon: any; desc: string }[] = [
  { id: "Support", labelMm: "အထွေထွေ အကူအညီ (General Support)", icon: LifeBuoy, desc: "အကောင့်၊ သင်တန်း၊ ဘွဲ့ရလက်မှတ်နှင့် ပတ်သက်သည့် အကူအညီများ" },
  { id: "Bug Report", labelMm: "စနစ်အမှား တိုင်ကြားရန် (Bug Report)", icon: Bug, desc: "သင်ခန်းစာ ပျက်စီးခြင်း၊ Quiz အဖြေမှားခြင်းနှင့် Error များ" },
  { id: "Feature Request", labelMm: "လုပ်ဆောင်ချက်သစ် အကြံပြုရန် (Feature Request)", icon: Sparkles, desc: "သင်တန်းသစ်များ၊ ဘာသာစကားသစ်များ၊ UI / AI အကြံပြုချက်များ" },
  { id: "General Feedback", labelMm: "အထွေထွေ သုံးသပ်ချက် (General Feedback)", icon: MessageSquare, desc: "Code Learn Myanmar ပလပ်ဖောင်းအပေါ် သုံးသပ်ချက်နှင့် အကြံပြုချက်များ" },
  { id: "Course Feedback", labelMm: "သင်တန်းအကြံပြုချက် (Course Feedback)", icon: BookOpen, desc: "သင်တန်းအကြောင်းအရာ၊ ရှင်းလင်းချက်နှင့် လေ့ကျင့်ခန်း အကြံပြုချက်များ" },
  { id: "Lesson Feedback", labelMm: "သင်ခန်းစာ တုံ့ပြန်ချက် (Lesson Feedback)", icon: Layers, desc: "သီးခြား သင်ခန်းစာတစ်ခု၏ ရှင်းလင်းချက် သို့မဟုတ် ကုဒ်နမူနာများ" },
  { id: "Quiz Feedback", labelMm: "Quiz မေးခွန်း တုံ့ပြန်ချက် (Quiz Feedback)", icon: HelpCircle, desc: "Quiz မေးခွန်းများ၊ အဖြေမှန်ဆန်းစစ်ချက် အကြံပြုချက်များ" },
  { id: "Payment Issue", labelMm: "ငွေပေးချေမှု အခက်အခဲ (Payment Issue)", icon: CreditCard, desc: "KBZPay, WavePay, Premium အကောင့် အဆင်မပြေမှုများ" },
  { id: "Technical Issue", labelMm: "နည်းပညာ အခက်အခဲ (Technical Issue)", icon: Monitor, desc: "Website လိုင်းနှေးခြင်း၊ Code Editor Error နှင့် Loading အဆင်မပြေမှု" },
  { id: "Account Issue", labelMm: "အကောင့်ဆိုင်ရာ အခက်အခဲ (Account Issue)", icon: Lock, desc: "စကားဝှက်မေ့ခြင်း၊ Cloud Sync အဆင်မပြေခြင်း၊ အကောင့် ပြန်လည်ရယူခြင်း" }
];

// Subcategory focus options depending on selected category
const SUB_CATEGORIES: Record<string, string[]> = {
  "Feature Request": [
    "New Courses (သင်တန်းသစ်များ အကြံပြုရန်)",
    "New Programming Languages (ပရိုဂရမ်မင်း ဘာသာစကားသစ်များ)",
    "New Features (လုပ်ဆောင်ချက်သစ်များ)",
    "UI Improvements (ဒီဇိုင်းနှင့် အသွင်အပြင် တိုးတက်စေရန်)",
    "AI Improvements (Kibo AI ဉာဏ်ရည်တု မြှင့်တင်ရန်)",
    "Premium Features (Premium သီးသန့် အခွင့်အရေးများ)"
  ],
  "Bug Report": [
    "Broken Lessons (ဖွင့်မရသော သင်ခန်းစာများ)",
    "Incorrect Quiz Answers (Quiz အဖြေမှားယွင်းနေခြင်း)",
    "UI Problems (ဒီဇိုင်း ပုံပျက်နေခြင်း)",
    "Loading Issues (စာမျက်နှာ ဖွင့်မရဘဲ စောင့်နေရခြင်း)",
    "Login Problems (အကောင့် ဝင်မရခြင်း)",
    "Payment Problems (ငွေပေးချေပြီး စနစ်မပွင့်ခြင်း)",
    "Application Errors (အက်ပ် Error တက်ခြင်း)"
  ],
  "Support": [
    "Account Recovery (အကောင့် ပြန်လည်ရယူရန်)",
    "Premium Purchase (Premium ဝယ်ယူခြင်း အကူအညီ)",
    "Certificate Problems (ဘွဲ့ရလက်မှတ် ထုတ်မရခြင်း)",
    "Project Submission Issues (ပရောဂျက် တင်မရခြင်း)",
    "Technical Questions (နည်းပညာ မေးခွန်းများ)"
  ]
};

// Kibo Smart Knowledge Base Solutions for Deflection
const KIBO_HELP_SOLUTIONS = [
  {
    keywords: ["payment", "kbzpay", "wavepay", "premium", "money", "ငွေ", "ဝယ်"],
    title: "💡 KBZPay / WavePay Premium Activation Guide",
    solution: "KBZPay သို့မဟုတ် WavePay ဖြင့် ငွေလွှဲပြီးပါက Transaction ID နှင့် Screenshot ကို 'Premium ရယူရန်' စာမျက်နှာတွင် ဖြည့်သွင်း၍ ခွင့်ပြုချက် စောင့်ဆိုင်းနိုင်ပါသည်။ အများအားဖြင့် ၁ နာရီအတွင်း အကောင့်ဖွင့်ပေးပါသည်ခင်ဗျာ။",
    linkTab: "premium"
  },
  {
    keywords: ["certificate", "cert", "လက်မှတ်", "ဘွဲ့ရ"],
    title: "🎓 Certificate Generation Troubleshooting",
    solution: "သင်တန်းတစ်ခု၏ သင်ခန်းစာ 100% ပြီးမြောက်ပါက 'Progress Dashboard -> Certificates' မှ ဘွဲ့ရလက်မှတ်အား အလိုအလျောက် Download ရယူနိုင်ပါသည်။ လက်မှတ် ပေါ်မလာပါက Page refresh ပြုလုပ်ကြည့်ပါ။",
    linkTab: "progress"
  },
  {
    keywords: ["login", "password", "account", "sync", "အကောင့်", "စကားဝှက်"],
    title: "🔐 Account Recovery & Cloud Sync",
    solution: "Google Account ဖြင့် Sync ပြုလုပ်ထားပါက မည်သည့် Browser တွင်မဆို အကောင့်ကို လွယ်ကူစွာ ပြန်လည်ရယူနိုင်ပါသည်။ 'Sync Progress' ခလုတ်ကို နှိပ်၍ အကောင့်ဝင်ရောက်ပါ။",
    linkTab: "profile"
  },
  {
    keywords: ["loading", "slow", "editor", "error", "code", "လိုင်းနှေး"],
    title: "⚡ Quick Code Editor & Browser Cache Reset",
    solution: "Code Editor တွင် ကုဒ် Run မရပါက သို့မဟုတ် လိုင်းနှေးနေပါက Browser Cache ကို ရှင်းလင်းပါ သို့မဟုတ် Ctrl + F5 (Hard Refresh) ပြုလုပ်ကြည့်ပါဗျာ။",
    linkTab: "projects"
  }
];

export default function Contact({ user }: ContactProps) {
  const [activeTab, setActiveTab] = useState<"submit" | "my_tickets" | "admin_portal">("submit");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<SupportCategory>("Support");
  const [subCategory, setSubCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [includeDeviceInfo, setIncludeDeviceInfo] = useState(true);
  const [priority, setPriority] = useState<SupportPriority>("Medium");

  // Status & Notifications
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kibo AI Deflection matching
  const [matchedSolutions, setMatchedSolutions] = useState<typeof KIBO_HELP_SOLUTIONS>([]);

  // Selected Ticket Modal State (Student & Admin)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Admin Portal Filters
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>("all");
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>("all");
  const [adminPriorityFilter, setAdminPriorityFilter] = useState<string>("all");
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>("");

  const isAdmin = user?.role === "admin";

  // Auto detect user device info
  const getDeviceInfo = () => {
    return {
      browser: navigator.userAgent.includes("Chrome") ? "Google Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : "Standard Browser",
      os: navigator.platform,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent
    };
  };

  // Load tickets on tab switch
  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getSupportTickets(user?.uid, isAdmin);
      setTickets(data);
    } catch (err) {
      console.warn("Could not load support tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [activeTab, user?.uid, isAdmin]);

  // Kibo Smart Solution Deflection matcher
  useEffect(() => {
    const text = `${title} ${description}`.toLowerCase();
    if (text.trim().length > 3) {
      const matches = KIBO_HELP_SOLUTIONS.filter(sol => 
        sol.keywords.some(kw => text.includes(kw))
      );
      setMatchedSolutions(matches);
    } else {
      setMatchedSolutions([]);
    }
  }, [title, description]);

  // Handle image upload mock base64 converter
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError("ဓာတ်ပုံ ပမာဏသည် 2MB ထက်မကျော်လွန်ရပါဗျာ (Max file size 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Ticket Handler
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const titleTrimmed = title.trim();
    const descTrimmed = description.trim();

    if (!titleTrimmed || !descTrimmed) {
      setFormError("ကျေးဇူးပြု၍ အကြောင်းအရာ ခေါင်းစဉ်နှင့် အသေးစိတ် ရှင်းလင်းချက် ဖြည့်သွင်းပေးပါဗျာ။");
      return;
    }

    if (titleTrimmed.length > 150) {
      setFormError("ခေါင်းစဉ်သည် စာလုံးရေ ၁၅၀ ထက်မကျော်ရပါဗျာ။");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await submitSupportTicket({
        studentId: user?.uid || `guest-${Date.now()}`,
        studentName: user?.name || "Anonymous Learner",
        studentEmail: user?.email || "learner@codelearnmyanmar.com",
        title: sanitizeInput(titleTrimmed, 150),
        category,
        subCategory: subCategory ? sanitizeInput(subCategory, 100) : undefined,
        description: sanitizeInput(descTrimmed, 3000),
        screenshotUrl: screenshotUrl || undefined,
        deviceInfo: includeDeviceInfo ? getDeviceInfo() : undefined,
        priority
      });

      // Send confirmation notification
      if (user?.uid) {
        await createNotification({
          userId: user.uid,
          category: "system",
          type: "bug_fix",
          title: "📩 အကူအညီ တောင်းဆိုချက် လက်ခံရရှိပါသည်",
          titleMm: "📩 အကူအညီ တောင်းဆိုချက် လက်ခံရရှိပါသည်",
          description: `သင့်၏ တောင်းဆိုချက် #${created.id.slice(-6)} ကို Platform Team မှ လက်ခံရရှိပြီး စစ်ဆေးပေးနေပါပြီ။`,
          descriptionMm: `သင့်၏ တောင်းဆိုချက် #${created.id.slice(-6)} ကို Platform Team မှ လက်ခံရရှိပြီး စစ်ဆေးပေးနေပါပြီ။`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      setSubmitSuccess(true);
      setTitle("");
      setDescription("");
      setScreenshotUrl("");
      setSubCategory("");
      await loadTickets();
    } catch (err) {
      setFormError("တောင်းဆိုချက် ပေးပို့ရာတွင် အဆင်မပြေမှု ဖြစ်ပွားခဲ့ပါသည်။ ပြန်လည် ကြိုးစားပေးပါဗျာ။");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reply to ticket
  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setIsReplying(true);
    try {
      const senderRole = isAdmin ? "admin" : "student";
      const senderName = isAdmin ? "CLM Support Team" : (user?.name || "Student");
      const senderId = user?.uid || "user";

      await replyToSupportTicket(
        selectedTicket.id,
        replyMessage.trim(),
        senderId,
        senderName,
        senderRole
      );

      // Notify student if admin replied
      if (isAdmin && selectedTicket.studentId) {
        await createNotification({
          userId: selectedTicket.studentId,
          category: "system",
          type: "bug_fix",
          title: "💬 Admin မှ သင့်တောင်းဆိုချက်အား အကြောင်းပြန်ပါသည်",
          titleMm: "💬 Admin မှ သင့်တောင်းဆိုချက်အား အကြောင်းပြန်ပါသည်",
          description: `တောင်းဆိုချက် #${selectedTicket.id.slice(-6)} အတွက် Admin အကူအညီအကြောင်းပြန်ချက် ပေးပို့ထားပါသည်။`,
          descriptionMm: `တောင်းဆိုချက် #${selectedTicket.id.slice(-6)} အတွက် Admin အကူအညီအကြောင်းပြန်ချက် ပေးပို့ထားပါသည်။`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      setReplyMessage("");
      await loadTickets();
      // Update modal reference
      const updatedList = await getSupportTickets(user?.uid, isAdmin);
      const refetched = updatedList.find(t => t.id === selectedTicket.id);
      if (refetched) setSelectedTicket(refetched);
    } catch (err) {
      console.warn("Error sending reply:", err);
    } finally {
      setIsReplying(false);
    }
  };

  // Admin status update
  const handleUpdateStatus = async (ticketId: string, newStatus: SupportStatus, newPriority?: SupportPriority, isArchived?: boolean) => {
    try {
      await updateSupportTicketStatus(ticketId, newStatus, newPriority, isArchived);
      
      const targetTicket = tickets.find(t => t.id === ticketId);
      if (targetTicket && targetTicket.studentId) {
        await createNotification({
          userId: targetTicket.studentId,
          category: "system",
          type: "bug_fix",
          title: `📌 Support Ticket Status Updated: ${newStatus}`,
          titleMm: `📌 သင့်တောင်းဆိုချက် အခြေအနေ: ${newStatus}`,
          description: `တောင်းဆိုချက် #${ticketId.slice(-6)} ၏ အခြေအနေအား ${newStatus} သို့ ပြောင်းလဲလိုက်ပါပြီ။`,
          descriptionMm: `တောင်းဆိုချက် #${ticketId.slice(-6)} ၏ အခြေအနေအား ${newStatus} သို့ ပြောင်းလဲလိုက်ပါပြီ။`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      await loadTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus, priority: newPriority || prev.priority, isArchived: isArchived !== undefined ? isArchived : prev.isArchived } : null);
      }
    } catch (err) {
      console.warn("Could not update status:", err);
    }
  };

  // Filtered tickets for Admin
  const filteredAdminTickets = tickets.filter(t => {
    if (adminStatusFilter !== "all" && t.status !== adminStatusFilter) return false;
    if (adminCategoryFilter !== "all" && t.category !== adminCategoryFilter) return false;
    if (adminPriorityFilter !== "all" && t.priority !== adminPriorityFilter) return false;
    if (adminSearchQuery.trim()) {
      const q = adminSearchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.studentEmail.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Admin Analytics Metrics
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status === "Pending").length;
  const resolvedTickets = tickets.filter(t => t.status === "Resolved").length;
  const bugReportCount = tickets.filter(t => t.category === "Bug Report").length;
  const featureRequestCount = tickets.filter(t => t.category === "Feature Request").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <LifeBuoy className="w-6 h-6" />
            </span>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900 dark:text-white">
              ကူညီပံ့ပိုးရေးနှင့် တုံ့ပြန်ချက် စာမျက်နှာ (Feedback & Support)
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm max-w-3xl">
            သင်ခန်းစာ အခက်အခဲများ၊ စနစ်အမှား တိုင်ကြားချက်များနှင့် လုပ်ဆောင်ချက်သစ် အကြံပြုချက်များကို တိုက်ရိုက် ပေးပို့နိုင်ပါသည်။
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("submit")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "submit"
                ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>တောင်းဆိုချက် ပေးပို့ရန်</span>
          </button>

          <button
            onClick={() => setActiveTab("my_tickets")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === "my_tickets"
                ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>ကျွန်ုပ်၏ တောင်းဆိုချက်များ ({tickets.length})</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin_portal")}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "admin_portal"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-purple-400 hover:text-purple-300"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Support Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: SUBMIT FEEDBACK & SUPPORT TICKET */}
      {activeTab === "submit" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Container (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>တောင်းဆိုချက်/အကြံပြုချက် ပုံစံ (Submission Form)</span>
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full font-bold">
                🔒 Privacy Protected
              </span>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center space-y-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  တောင်းဆိုချက် ပေးပို့မှု အောင်မြင်ပါသည်!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                  သင့်၏ အကြံပြုချက်/တောင်းဆိုချက်အား Platform Team သို့ အောင်မြင်စွာ ပေးပို့ပြီးပါပြီ။ 'ကျွန်ုပ်၏ တောင်းဆိုချက်များ' တွင် စစ်ဆေးနိုင်ပါသည်။
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    နောက်ထပ် ပေးပို့ရန်
                  </button>
                  <button
                    onClick={() => setActiveTab("my_tickets")}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    တောင်းဆိုချက်များ ကြည့်ရန်
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-5">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold rounded-xl flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Category Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>အမျိုးအစား ရွေးချယ်ရန် (Category)</span>
                    <span className="text-[10px] text-slate-400 font-mono">Required</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategory(cat.id);
                            setSubCategory("");
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-blue-500"}`} />
                            <span className="text-xs font-bold truncate">{cat.id}</span>
                          </div>
                          <span className={`text-[10px] line-clamp-1 ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                            {cat.labelMm}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Sub-category Focus (If applicable) */}
                {SUB_CATEGORIES[category] && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      သီးခြား အကြောင်းအရာ (Specific Focus)
                    </label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- ရွေးချယ်ရန် (Optional) --</option>
                      {SUB_CATEGORIES[category].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 3. Title Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ခေါင်းစဉ် (Request Title)
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - HTML Lesson 3 တွင် Video ဖွင့်မရပါ သို့မဟုတ် Dark Mode အကြံပြုချက်"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* 4. Description Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    အသေးစိတ် ရှင်းလင်းချက် (Description)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="ဖြစ်ပေါ်နေသော အခက်အခဲ သို့မဟုတ် လိုလားသော အကြံပြုချက်အား အသေးစိတ် ရေးသားပေးပါဗျာ..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* 5. Priority & Device Info Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      ဦးစားပေး အဆင့် (Priority)
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as SupportPriority)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="Low">🟢 Low (ပုံမှန် အကြံပြုချက်)</option>
                      <option value="Medium">🟡 Medium (အသင့်အတင့် အရေးကြီး)</option>
                      <option value="High">🟠 High (အရေးကြီး အခက်အခဲ)</option>
                      <option value="Urgent">🔴 Urgent (အမြန်ဆုံး ဖြေရှင်းရန်)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      စက်ပစ္စည်း အချက်အလက် (Device Info)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIncludeDeviceInfo(!includeDeviceInfo)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                        includeDeviceInfo
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <Monitor className="w-4 h-4" />
                        <span>Include Browser & Screen Resolution</span>
                      </span>
                      {includeDeviceInfo ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 6. Screenshot File Drop (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>ဓာတ်ပုံ ပူးတွဲရန် (Optional Screenshot)</span>
                    <span className="text-[10px] text-slate-400">Max 2MB</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center space-x-2 transition-all">
                      <Paperclip className="w-4 h-4 text-blue-500" />
                      <span>{screenshotUrl ? "ဓာတ်ပုံ လဲလှယ်ရန်" : "Choose Image File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>
                    {screenshotUrl && (
                      <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl">
                        <span className="text-[11px] text-blue-500 font-bold">Image Attached!</span>
                        <button type="button" onClick={() => setScreenshotUrl("")} className="text-slate-400 hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>ပေးပို့နေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>တောင်းဆိုချက် ပေးပို့မည် (Submit Support Ticket)</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Kibo Smart Solution Deflection & Contact Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Kibo Smart Deflection Box */}
            {matchedSolutions.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-md text-white">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Bot className="w-5 h-5 animate-bounce" />
                  <h4 className="font-display font-bold text-sm">
                    Kibo AI Smart Solution Found!
                  </h4>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  သင့်မေးခွန်းအတွက် အောက်ပါ လျင်မြန်သော ဖြေရှင်းနည်းများက အကူအညီ ဖြစ်နိုင်ပါသည် -
                </p>

                <div className="space-y-3">
                  {matchedSolutions.map((sol, idx) => (
                    <div key={idx} className="p-3 bg-white/10 backdrop-blur-md rounded-xl space-y-1.5 text-xs">
                      <h5 className="font-bold text-amber-300">{sol.title}</h5>
                      <p className="text-[11px] text-slate-200 leading-normal">{sol.solution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Direct Channels */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                <span>တိုက်ရိုက် ဆက်သွယ်ရန် လိပ်စာများ</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono">Official Email Support</p>
                    <a href="mailto:support@codelearnmyanmar.com" className="font-bold text-slate-900 dark:text-white hover:text-blue-500">
                      support@codelearnmyanmar.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono">Facebook Page</p>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="font-bold text-slate-900 dark:text-white hover:text-blue-500">
                      facebook.com/CodeLearnMyanmar
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                ℹ️ တောင်းဆိုချက်များအားလုံးကို အလုပ်လုပ်ရက် (၂၄) နာရီအတွင်း အကြောင်းပြန်ပေးပါသည်ခင်ဗျာ။
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY SUPPORT TICKETS HISTORY */}
      {activeTab === "my_tickets" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <span>ကျွန်ုပ်၏ တောင်းဆိုချက်များ (My Support Tickets)</span>
              </h3>
              <button
                onClick={loadTickets}
                className="p-2 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <LifeBuoy className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm">သင့်တွင် လက်ရှိ ပေးပို့ထားသော တောင်းဆိုချက် မရှိသေးပါဗျာ။</p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  တောင်းဆိုချက်သစ် ပေးပို့မည်
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-150 dark:divide-slate-800">
                {tickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 px-3 rounded-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-bold">
                          #{t.id.slice(-6)}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-500">
                          {t.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1 font-mono">
                        <span>Category: {t.category}</span>
                        <span>•</span>
                        <span>Date: {new Date(t.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{t.responses?.length || 0} Replies</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === "Pending" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        t.status === "Under Review" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                        t.status === "In Progress" ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" :
                        t.status === "Resolved" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                        "bg-slate-500/10 text-slate-400"
                      }`}>
                        {t.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN PORTAL MANAGEMENT */}
      {activeTab === "admin_portal" && isAdmin && (
        <div className="space-y-6">
          {/* Admin Analytics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Requests</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalTickets}</p>
            </div>
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono text-amber-500 uppercase font-bold">Pending Review</span>
              <p className="text-2xl font-extrabold text-amber-500">{pendingTickets}</p>
            </div>
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono text-emerald-500 uppercase font-bold">Resolved Rate</span>
              <p className="text-2xl font-extrabold text-emerald-500">
                {totalTickets > 0 ? `${Math.round((resolvedTickets / totalTickets) * 100)}%` : "100%"}
              </p>
            </div>
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono text-purple-500 uppercase font-bold">Bugs / Features</span>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                🐞 {bugReportCount} / 💡 {featureRequestCount}
              </p>
            </div>
          </div>

          {/* Admin Filters & Search */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span>Admin Request Queue</span>
              </h3>
              <input
                type="text"
                placeholder="Search by student, email, ID..."
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              <select
                value={adminStatusFilter}
                onChange={(e) => setAdminStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
              >
                <option value="all">Status: All</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={adminCategoryFilter}
                onChange={(e) => setAdminCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
              >
                <option value="all">Category: All</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
              </select>
            </div>

            {/* Admin Table */}
            <div className="divide-y divide-slate-150 dark:divide-slate-800 pt-2">
              {filteredAdminTickets.map(t => (
                <div key={t.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded font-bold">
                        #{t.id.slice(-6)}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({t.studentName} - {t.studentEmail})</span>
                    </div>
                    <p className="text-xs text-slate-400">{t.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdateStatus(t.id, e.target.value as SupportStatus)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl"
                    >
                      Reply / Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TICKET DETAILS & REPLY MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-left">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">
                  #{selectedTicket.id.slice(-6)}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                  {selectedTicket.category}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {selectedTicket.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                From: {selectedTicket.studentName} ({selectedTicket.studentEmail}) • {new Date(selectedTicket.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Ticket Content */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-300">Description:</p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.screenshotUrl && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400">Attached Screenshot:</span>
                  <img src={selectedTicket.screenshotUrl} alt="Screenshot" className="max-h-60 rounded-xl border border-slate-200 dark:border-slate-800 object-contain" />
                </div>
              )}

              {selectedTicket.deviceInfo && (
                <div className="p-3 bg-slate-100 dark:bg-slate-850 rounded-xl text-[10px] font-mono text-slate-400 space-y-0.5">
                  <p>💻 Browser: {selectedTicket.deviceInfo.browser}</p>
                  <p>🖥️ Screen: {selectedTicket.deviceInfo.screenSize}</p>
                </div>
              )}

              {/* Timeline Responses */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Conversation History:</h4>
                {selectedTicket.responses?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">အကြောင်းပြန်ချက် မရှိသေးပါဗျာ။</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTicket.responses.map(r => (
                      <div
                        key={r.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          r.senderRole === "admin"
                            ? "bg-purple-500/10 border border-purple-500/20 text-purple-200 ml-4"
                            : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-300 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span>{r.senderName} ({r.senderRole})</span>
                          <span className="font-mono text-slate-400">{new Date(r.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{r.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="space-y-2 pt-2">
                <textarea
                  rows={3}
                  placeholder="ပြန်လည် ဖြေကြားရန် စာသား ရေးသားပါ..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendReply}
                  disabled={isReplying || !replyMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isReplying ? "Sending..." : "Send Reply"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
