/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Code, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Settings, 
  Shield, 
  Trash2, 
  HelpCircle, 
  Activity, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Play, 
  ArrowRight, 
  BookOpen, 
  Award, 
  Terminal,
  Bookmark,
  ExternalLink,
  Crown,
  Heart,
  MessageSquare,
  Info
} from "lucide-react";
import { UserProfile, CodeReviewSettings, CodeReviewAttempt } from "../types";
import { getCodeReviewSettings, saveCodeReviewSettings, getUserCodeReviewHistory } from "../lib/db";
import MarkdownRenderer from "../components/MarkdownRenderer";

interface CodeReviewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  setCurrentTab: (tab: string) => void;
}

const LANGUAGES = [
  { id: "html", name: "HTML", enabled: true },
  { id: "css", name: "CSS", enabled: true },
  { id: "javascript", name: "JavaScript", enabled: true },
  { id: "java", name: "Java", enabled: true },
  { id: "kotlin", name: "Kotlin", enabled: true },
  { id: "typescript", name: "TypeScript (Coming Soon)", enabled: false },
  { id: "react", name: "React (Coming Soon)", enabled: false },
  { id: "node", name: "Node.js (Coming Soon)", enabled: false },
  { id: "python", name: "Python (Coming Soon)", enabled: false },
];

const CONTEXT_TYPES = [
  { id: "lesson", name: "သင်ခန်းစာမှကုဒ် (Lesson Code)" },
  { id: "practice", name: "လေ့ကျင့်ခန်းကုဒ် (Practice Exercise)" },
  { id: "assignment", name: "အိမ်စာကုဒ် (Assignment Code)" },
  { id: "project", name: "ပရောဂျက်ကုဒ် (Project Code)" },
];

export default function CodeReview({ user, onUpdateUser, setCurrentTab }: CodeReviewProps) {
  // DB configurations & states
  const [settings, setSettings] = useState<CodeReviewSettings>({
    freeLimit: 3,
    premiumLimit: 100,
    supportedLanguages: ["html", "css", "javascript", "java", "kotlin"],
    systemPromptTemplate: "You are an expert AI programming teacher and code reviewer for Code Learn Myanmar. Review the code submitted by the student. Act as a supportive learning assistant, not a final authority.",
    isFeatureEnabled: true
  });
  
  const [history, setHistory] = useState<CodeReviewAttempt[]>([]);
  const [isAdminView, setIsAdminView] = useState(false);
  
  // Input fields
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [contextType, setContextType] = useState("lesson");
  
  // Review Status
  const [isLoading, setIsLoading] = useState(false);
  const [activeReview, setActiveReview] = useState<CodeReviewAttempt | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Tab control inside report
  const [activeReportTab, setActiveReportTab] = useState<"explanation" | "errors" | "suggestions" | "recommendations">("explanation");
  
  // Follow up chat overlay with Kibo
  const [kiboChatOpen, setKiboChatOpen] = useState(false);
  const [kiboChatMessages, setKiboChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [kiboInput, setKiboInput] = useState("");
  const [isKiboLoading, setIsKiboLoading] = useState(false);

  // Admin Config States
  const [adminFreeLimit, setAdminFreeLimit] = useState(3);
  const [adminPremiumLimit, setAdminPremiumLimit] = useState(100);
  const [adminLanguages, setAdminLanguages] = useState<string[]>([]);
  const [adminPromptTemplate, setAdminPromptTemplate] = useState("");
  const [adminFeatureEnabled, setAdminFeatureEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check premium status
  const isPremiumUser = user?.role === "premium" || user?.role === "teacher" || user?.role === "admin" || user?.isPremium === true;
  const isUserAdmin = user?.role === "admin" || user?.role === "teacher" || user?.email === "playeraung449@gmail.com";

  // Load initial settings and student review history
  useEffect(() => {
    async function loadInitialData() {
      try {
        const cloudSettings = await getCodeReviewSettings();
        setSettings(cloudSettings);
        
        // Sync Admin states
        setAdminFreeLimit(cloudSettings.freeLimit);
        setAdminPremiumLimit(cloudSettings.premiumLimit);
        setAdminLanguages(cloudSettings.supportedLanguages);
        setAdminPromptTemplate(cloudSettings.systemPromptTemplate);
        setAdminFeatureEnabled(cloudSettings.isFeatureEnabled);

        if (user?.uid) {
          const attempts = await getUserCodeReviewHistory(user.uid);
          setHistory(attempts);
          if (attempts.length > 0) {
            setActiveReview(attempts[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to load Code Review initial data:", err);
      }
    }
    loadInitialData();
  }, [user?.uid]);

  // Calculate daily reviews used
  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const todayStr = getTodayString();
  const reviewsToday = history.filter(attempt => attempt.timestamp.startsWith(todayStr)).length;
  const allowedLimit = isPremiumUser ? settings.premiumLimit : settings.freeLimit;
  const limitsExceeded = reviewsToday >= allowedLimit;

  // Save admin settings
  const handleSaveAdminSettings = async () => {
    try {
      const updated: CodeReviewSettings = {
        freeLimit: Number(adminFreeLimit),
        premiumLimit: Number(adminPremiumLimit),
        supportedLanguages: adminLanguages,
        systemPromptTemplate: adminPromptTemplate,
        isFeatureEnabled: adminFeatureEnabled
      };
      await saveCodeReviewSettings(updated);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save admin settings:", err);
    }
  };

  const handleToggleAdminLang = (langId: string) => {
    if (adminLanguages.includes(langId)) {
      setAdminLanguages(adminLanguages.filter(l => l !== langId));
    } else {
      setAdminLanguages([...adminLanguages, langId]);
    }
  };

  // Submit Code Review request
  const handleSubmitReview = async () => {
    if (!code.trim()) {
      setErrorMsg("ဆန်းစစ်ရန် သင်၏ ပရိုဂရမ်ကုဒ်များကို ထည့်သွင်းပေးပါဦးခင်ဗျာ။");
      return;
    }

    if (limitsExceeded) {
      setErrorMsg(`ယနေ့အတွက် ဆန်းစစ်နိုင်သော ကန့်သတ်ချက် ပြည့်သွားပါပြီ။ ${isPremiumUser ? "" : "Kibo Premium သို့ အဆင့်မြှင့်တင်ပြီး"}`);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/gemini/review-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          contextType,
          userProfile: user
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Review failed");
      }

      const data = await response.json();
      
      const newAttempt: CodeReviewAttempt = {
        id: `review_${Date.now()}`,
        uid: user?.uid || "guest",
        userEmail: user?.email || "guest@codelearnmyanmar.edu.mm",
        code,
        language,
        contextType: contextType as any,
        timestamp: new Date().toISOString(),
        qualityScore: data.qualityScore || 80,
        reviewResult: data.reviewResult
      };

      // Add to local state history
      setHistory(prev => [newAttempt, ...prev]);
      setActiveReview(newAttempt);
      setActiveReportTab("explanation");
      setCode(""); // Clear editor for next code

      // Optional: award points/xp for submitting a code review
      if (user && onUpdateUser) {
        const updatedCoins = (user.coins || 0) + 10; // Award 10 coins
        const updatedXp = (user.xp || 0) + 15;     // Award 15 XP
        onUpdateUser({
          ...user,
          coins: updatedCoins,
          xp: updatedXp
        });
      }

    } catch (err: any) {
      console.error("Code Review Fetch Error:", err);
      setErrorMsg(err.message || "ဆာဗာချိတ်ဆက်မှု ပြတ်တောက်သွားပါသဖြင့် ထပ်မံကြိုးစားကြည့်ပါခင်ဗျာ။");
    } finally {
      setIsLoading(false);
    }
  };

  // Kibo Follow up chats
  const handleSendKiboMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || kiboInput;
    if (!textToSend.trim() || !activeReview) return;

    const userMsg = { role: "user" as const, content: textToSend };
    const updatedMessages = [...kiboChatMessages, userMsg];
    setKiboChatMessages(updatedMessages);
    setKiboInput("");
    setIsKiboLoading(true);

    try {
      const contextPrompt = `
[CONVERSATION ABOUT STUDENT'S CODE REVIEW REPORT]
Submitted Code Language: ${activeReview.language}
Submitted Code Context: ${activeReview.contextType}
Submitted Code:
\`\`\`
${activeReview.code}
\`\`\`

Report Summary: ${activeReview.reviewResult.qualitySummary}
Report Explanation: ${activeReview.reviewResult.explanation}

The student asks: "${textToSend}"
Please respond as Kibo, the friendly virtual mentor of Code Learn Myanmar. Keep explanation simple in Myanmar language, and code references in English. Avoid jargon.
`;

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: contextPrompt }]
        })
      });

      if (!res.ok) throw new Error("Assistant fetch error");
      const data = await res.json();

      setKiboChatMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (err) {
      console.error("Kibo chat error:", err);
      setKiboChatMessages(prev => [...prev, { role: "assistant", content: "တောင်းပန်ပါတယ်ခင်ဗျာ၊ အချက်အလက်ပြန်လည်ဖြေကြားရန် ချိတ်ဆက်မှု အဆင်မပြေဖြစ်သွားပါသည်။" }]);
    } finally {
      setIsKiboLoading(false);
    }
  };

  const handleKiboQuickAction = (actionLabel: string, actionQuery: string) => {
    setKiboChatOpen(true);
    handleSendKiboMessage(`${actionLabel} - ${actionQuery}`);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 text-left">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Code className="w-8 h-8 text-blue-500" />
            <h1 className="font-display font-black text-2xl text-white tracking-tight">
              AI Code Review Center
            </h1>
            <span className="bg-blue-500/15 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              VERSION 1.0
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            ရေးသားထားသော ကုဒ်များကို AI စနစ်ဖြင့် ချက်ချင်းဆန်းစစ်ပြီး ပိုမိုကောင်းမွန်သော coding အလေ့အထများ မွေးမြူပါ။
          </p>
        </div>

        {/* Access tracker */}
        <div className="flex items-center gap-3 bg-[#1E293B]/60 border border-slate-800 rounded-2xl p-4">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            {isPremiumUser ? <Crown className="w-5 h-5 text-amber-500" /> : <Award className="w-5 h-5" />}
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
              {isPremiumUser ? "👑 Premium Unlimited Access" : "🎁 Free Student Access"}
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-sm font-bold text-white">{reviewsToday}</span>
              <span className="text-slate-500">/</span>
              <span className="text-xs text-slate-400">{allowedLimit} reviews today</span>
            </div>
          </div>
        </div>
      </header>

      {/* ADMIN CONTROLS BANNER/BUTTON */}
      {isUserAdmin && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-900/30 rounded-2xl text-left">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-bold text-sm text-purple-200">Administrator Console Enabled</h3>
              <p className="text-[11px] text-slate-400">ဆရာ/ဆရာမများနှင့် စနစ်ကြီးကြပ်သူများအတွက် Review Limits နှင့် system prompts များကို ချိန်ညှိနိုင်သော ကဏ္ဍဖြစ်ပါသည်ခင်ဗျာ။</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className="px-3.5 py-1.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isAdminView ? "Hide Admin Panel" : "Show Admin Panel"}</span>
          </button>
        </div>
      )}

      {/* ADMIN CONFIGURATION SECTION */}
      {isAdminView && isUserAdmin && (
        <section className="bg-[#1E293B]/80 border border-purple-800/30 rounded-2xl p-6 text-left space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-lg text-purple-200 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              <span>Admin Feature Configurations (အုပ်ချုပ်ရေးမှူးစနစ် ချိန်ညှိရန်)</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Feature Status:</span>
              <button
                onClick={() => setAdminFeatureEnabled(!adminFeatureEnabled)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  adminFeatureEnabled 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {adminFeatureEnabled ? "🟢 ACTIVE" : "🔴 DISABLED"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Daily Code Review Limits</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Free Users Limit/Day</label>
                  <input
                    type="number"
                    value={adminFreeLimit}
                    onChange={(e) => setAdminFreeLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Premium Users Limit/Day</label>
                  <input
                    type="number"
                    value={adminPremiumLimit}
                    onChange={(e) => setAdminPremiumLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Supported Programming Languages</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["html", "css", "javascript", "java", "kotlin"].map((lang) => (
                    <label key={lang} className="flex items-center space-x-2 p-2 bg-slate-900/60 border border-slate-800 rounded-xl cursor-pointer hover:border-purple-500/40 transition-all">
                      <input
                        type="checkbox"
                        checked={adminLanguages.includes(lang)}
                        onChange={() => handleToggleAdminLang(lang)}
                        className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0"
                      />
                      <span className="text-xs uppercase font-mono">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">System AI Prompt Template</h3>
              <p className="text-[10px] text-slate-400">AI Code Reviewer ၏ ဉာဏ်ရည်နှင့် ပြောဆိုပြုမူပုံကို ထိန်းချုပ်မည့် default instruction ဖြစ်ပါသည်ခင်ဗျာ။</p>
              <textarea
                value={adminPromptTemplate}
                onChange={(e) => setAdminPromptTemplate(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none font-sans resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-purple-400" />
              <span>ဤပြောင်းလဲမှုများသည် platform ရှိ ကျောင်းသားအားလုံးအပေါ် ချက်ချင်းသက်ရောက်မှုရှိပါမည်။</span>
            </p>
            <div className="flex items-center gap-3">
              {saveSuccess && <span className="text-xs text-emerald-400 font-bold">✓ Successfully Saved!</span>}
              <button
                onClick={handleSaveAdminSettings}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-purple-600/10"
              >
                Save Configurations
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CORE CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SUBMISSION FORM (Lg: 5 columns) */}
        <section className="lg:col-span-5 bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 text-left shadow-lg">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-500" />
              <span>ကုဒ်ဆန်းစစ်ရန်တင်ပြခြင်း (Submit Code)</span>
            </h2>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            
            {/* Context and Language selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">ပရိုဂရမ်မင်းဘာသာစကား</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id} disabled={!lang.enabled || !settings.supportedLanguages.includes(lang.id)}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">ဆန်းစစ်မည့် ကုဒ်အမျိုးအစား</label>
                <select
                  value={contextType}
                  onChange={(e) => setContextType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                >
                  {CONTEXT_TYPES.map((ctx) => (
                    <option key={ctx.id} value={ctx.id}>
                      {ctx.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">သင်ရေးသားထားသော ကုဒ်များကို ကူးယူထည့်သွင်းပါ</label>
                <span className="font-mono text-slate-500 text-[10px]">{code.length} characters</span>
              </div>
              <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`// ဤနေရာတွင် ကုဒ်များကို ကူးယူထည့်သွင်းပါ (e.g. JavaScript function, HTML markup)...`}
                  rows={14}
                  className="w-full p-4 bg-slate-950 font-mono text-xs text-emerald-400 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmitReview}
              disabled={isLoading || limitsExceeded}
              className={`w-full py-3 px-4 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-all ${
                limitsExceeded
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800"
                  : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-blue-600/15 active:scale-95"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI ဉာဏ်ရည်တု ကုဒ်ဆန်းစစ်နေပါသည် ခင်ဗျာ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ကုဒ်ဆန်းစစ်ချက် တောင်းဆိုရန် (Request Code Review)</span>
                </>
              )}
            </button>

            {/* Daily Coins award disclaimer */}
            <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-center">
              <p className="text-[10px] text-slate-400">
                💡 ကုဒ်ဆန်းစစ်ချက် တစ်ကြိမ်ပြုလုပ်တိုင်း အတွေ့အကြုံ <span className="text-blue-400 font-bold">+15 XP</span> နှင့် <span className="text-yellow-500 font-bold">+10 Coins</span> ရရှိပါမည်ခင်ဗျာ။
              </p>
            </div>
          </div>

          {/* CODE REVIEW ATTEMPTS HISTORY */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              ယခင် ဆန်းစစ်မှုမှတ်တမ်းများ ({history.length})
            </h3>
            {history.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">မှတ်တမ်းများ မရှိသေးပါ ခင်ဗျာ။</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {history.map((review) => (
                  <div
                    key={review.id}
                    onClick={() => setActiveReview(review)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left flex items-center justify-between ${
                      activeReview?.id === review.id
                        ? "bg-blue-600/10 border-blue-500/40"
                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {review.language}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(review.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1 truncate max-w-[180px]">
                        {review.reviewResult?.qualitySummary || "Code Review Report"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                        review.qualityScore >= 80 
                          ? "bg-emerald-500/15 text-emerald-400" 
                          : review.qualityScore >= 50 
                            ? "bg-yellow-500/15 text-yellow-400" 
                            : "bg-red-500/15 text-red-400"
                      }`}>
                        {review.qualityScore}%
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: REPORT DISPLAY (Lg: 7 columns) */}
        <section className="lg:col-span-7 space-y-6">
          
          {activeReview ? (
            <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-5 sm:p-6 lg:p-8 space-y-6 text-left shadow-lg">
              
              {/* REPORT HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                    {activeReview.language} • {activeReview.contextType}
                  </span>
                  <h3 className="font-bold text-lg text-white mt-1 leading-tight">
                    ဆန်းစစ်ချက်အစီရင်ခံစာ (Code Review Report)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ဆန်းစစ်သည့်နေ့စွဲ - {new Date(activeReview.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Circular Score Badge */}
                <div className="flex items-center space-x-3.5 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Quality Rating</span>
                    <span className="text-xs font-bold text-slate-300">
                      {activeReview.qualityScore >= 80 ? "Excellent" : activeReview.qualityScore >= 50 ? "Good Attempt" : "Needs Review"}
                    </span>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-black text-sm border-2 ${
                    activeReview.qualityScore >= 80
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : activeReview.qualityScore >= 50
                        ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                        : "border-rose-500 text-rose-400 bg-rose-500/10"
                  }`}>
                    {activeReview.qualityScore}%
                  </div>
                </div>
              </div>

              {/* DISCLAIMER */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-2 text-[10px] text-slate-400 leading-normal">
                <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>
                  ⚠️ ဤဆန်းစစ်ချက်ရမှတ်သည် သင်ယူမှုတိုးတက်မှုအတွက် အကြံပြုအကဲဖြတ်ချက်သက်သက်သာဖြစ်ပြီး တရားဝင်စာမေးပွဲရမှတ်မဟုတ်ပါ ခင်ဗျာ။
                </span>
              </div>

              {/* REPORT SUMMARY CARD */}
              <div className="p-4 bg-gradient-to-tr from-blue-950/20 to-slate-900 border border-blue-900/20 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs uppercase font-mono font-bold text-blue-400">စနစ်သုံးသပ်ချက်အကျဉ်း (Summary)</h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-bold">
                    "{activeReview.reviewResult.qualitySummary}"
                  </p>
                </div>
              </div>

              {/* REPORT CONTENT TAB CONTROLLER */}
              <div className="flex border-b border-slate-800">
                <button
                  onClick={() => setActiveReportTab("explanation")}
                  className={`flex-1 py-2.5 font-bold text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeReportTab === "explanation"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Myanmar Explanation</span>
                </button>
                <button
                  onClick={() => setActiveReportTab("errors")}
                  className={`flex-1 py-2.5 font-bold text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeReportTab === "errors"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Error Analysis</span>
                </button>
                <button
                  onClick={() => setActiveReportTab("suggestions")}
                  className={`flex-1 py-2.5 font-bold text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeReportTab === "suggestions"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Improvements</span>
                </button>
                <button
                  onClick={() => setActiveReportTab("recommendations")}
                  className={`flex-1 py-2.5 font-bold text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeReportTab === "recommendations"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Recommendations</span>
                </button>
              </div>

              {/* TAB 1: CODE EXPLANATION */}
              {activeReportTab === "explanation" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-200">ကုဒ်လုပ်ဆောင်ချက်အသေးစိတ်ရှင်းလင်းချက်</h4>
                    <span className="text-[10px] font-mono text-slate-500">LINE BY LINE ANALYSIS</span>
                  </div>
                  <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 leading-relaxed text-sm text-slate-300 font-sans">
                    <MarkdownRenderer content={activeReview.reviewResult.explanation} />
                  </div>
                </div>
              )}

              {/* TAB 2: ERROR & BUG ANALYSIS */}
              {activeReportTab === "errors" && (
                <div className="space-y-4 font-sans">
                  <h4 className="font-bold text-sm text-slate-200">အမှားဆန်းစစ်ချက် အစီရင်ခံစာ (Error Analysis)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-1 text-left">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Syntax Errors (ရေးထုံးအမှား)</span>
                      <p className="text-xs font-bold text-white leading-relaxed mt-1">
                        {activeReview.reviewResult.errorAnalysis.syntaxErrors || "မရှိပါ"}
                      </p>
                    </div>

                    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-1 text-left">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Logic Mistakes (ယုတ္တိအမှားများ)</span>
                      <p className="text-xs font-bold text-white leading-relaxed mt-1">
                        {activeReview.reviewResult.errorAnalysis.logicMistakes || "မရှိပါ"}
                      </p>
                    </div>

                    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-1 text-left">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Unused Variables (မသုံးသော Variables)</span>
                      <p className="text-xs font-bold text-white leading-relaxed mt-1">
                        {activeReview.reviewResult.errorAnalysis.unusedVariables || "မရှိပါ"}
                      </p>
                    </div>

                    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-1 text-left">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Naming Conventions (အမည်ပေးပုံ)</span>
                      <p className="text-xs font-bold text-white leading-relaxed mt-1">
                        {activeReview.reviewResult.errorAnalysis.poorNaming || "မရှိပါ"}
                      </p>
                    </div>

                    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-1 text-left">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Duplicate Code (ထပ်နေသောကုဒ်များ)</span>
                      <p className="text-xs font-bold text-white leading-relaxed mt-1">
                        {activeReview.reviewResult.errorAnalysis.duplicateCode || "မရှိပါ"}
                      </p>
                    </div>

                    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-1 text-left">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Missing Comments (ရှင်းလင်းချက်မှတ်စု)</span>
                      <p className="text-xs font-bold text-white leading-relaxed mt-1">
                        {activeReview.reviewResult.errorAnalysis.missingComments || "မရှိပါ"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: IMPROVEMENTS & BEST PRACTICES */}
              {activeReportTab === "suggestions" && (
                <div className="space-y-6 font-sans">
                  
                  {/* Suggestions List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>ပြုပြင်ရန် အကြံပြုချက်များ (Improvement Suggestions)</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {activeReview.reviewResult.suggestions && activeReview.reviewResult.suggestions.length > 0 ? (
                        activeReview.reviewResult.suggestions.map((s, idx) => (
                          <div key={idx} className="p-3 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                            💡 <span className="font-bold text-slate-100">{s}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">ပြုပြင်ရန် အကြံပြုချက်များ မရှိသေးပါ ခင်ဗျာ။</p>
                      )}
                    </div>
                  </div>

                  {/* Best Practices & Readability Tips Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Best Practices</h4>
                      <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                        {activeReview.reviewResult.bestPractices?.map((bp, i) => (
                          <li key={i}>{bp}</li>
                        )) || <li className="italic text-slate-500">None</li>}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Readability Tips</h4>
                      <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                        {activeReview.reviewResult.readabilityTips?.map((rt, i) => (
                          <li key={i}>{rt}</li>
                        )) || <li className="italic text-slate-500">None</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Maintainability */}
                  {activeReview.reviewResult.maintainabilitySuggestions && activeReview.reviewResult.maintainabilitySuggestions.length > 0 && (
                    <div className="pt-2 space-y-2 border-t border-slate-800">
                      <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Maintainability Suggestions (ထိန်းသိမ်းမှုလွယ်ကူစေရန်)</h4>
                      <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                        {activeReview.reviewResult.maintainabilitySuggestions.map((ms, i) => (
                          <li key={i}>{ms}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LEARNING RECOMMENDATIONS */}
              {activeReportTab === "recommendations" && (
                <div className="space-y-6 font-sans">
                  <h4 className="font-bold text-sm text-slate-200">ဆက်လက်လေ့လာရန် လမ်းညွှန်ချက်များ (Learning Recommendations)</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">ဆက်စပ်သင်ခန်းစာများ (Related Lessons)</span>
                      <div className="space-y-2">
                        {activeReview.reviewResult.learningRecommendations.relatedLessons?.map((rl, i) => (
                          <div
                            key={i}
                            onClick={() => setCurrentTab("courses")}
                            className="p-3 bg-[#0F172A] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-blue-400 font-bold flex items-center justify-between cursor-pointer transition-all"
                          >
                            <span>{rl}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        )) || <p className="text-xs text-slate-500 italic">No recommendations yet</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">လက်တွေ့လေ့ကျင့်ခန်းများ (Practice Exercises)</span>
                      <div className="space-y-2">
                        {activeReview.reviewResult.learningRecommendations.practiceExercises?.map((pe, i) => (
                          <div
                            key={i}
                            onClick={() => setCurrentTab("projects")}
                            className="p-3 bg-[#0F172A] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 flex items-center justify-between cursor-pointer transition-all"
                          >
                            <span>{pe}</span>
                            <Play className="w-3 h-3 text-slate-500" />
                          </div>
                        )) || <p className="text-xs text-slate-500 italic">No recommendations yet</p>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800">
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">တရားဝင် ကိုးကားစာရွက်စာတမ်း (Relevant Docs)</span>
                      <div className="space-y-2">
                        {activeReview.reviewResult.learningRecommendations.relevantDocs?.map((rd, i) => (
                          <a
                            key={i}
                            href="https://developer.mozilla.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-[#0F172A] hover:bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between transition-all"
                          >
                            <span>{rd}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          </a>
                        )) || <p className="text-xs text-slate-500 italic">No documentation</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">ဉာဏ်စမ်းစိန်ခေါ်မှု (Mini Challenge)</span>
                      <div className="p-4 bg-gradient-to-tr from-purple-950/20 to-slate-950/20 border border-purple-900/10 rounded-2xl">
                        {activeReview.reviewResult.learningRecommendations.miniChallenges?.map((mc, i) => (
                          <p key={i} className="text-xs text-slate-200 leading-relaxed font-bold">
                            🏆 {mc}
                          </p>
                        )) || <p className="text-xs text-slate-500 italic">None</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* KIBO FOLLOW-UP QUICK ACTIONS */}
              <div className="pt-6 border-t border-slate-800 text-left space-y-3">
                <h4 className="text-xs uppercase font-mono font-bold text-slate-400">Kibo Interactive Follow-up Actions</h4>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleKiboQuickAction("Explain this code", "ဤကုဒ်၏ အလုပ်လုပ်ပုံကို ခြုံငုံ၍ မြန်မာလို ရိုးရှင်းစွာ ရှင်းပြပေးပါဗျာ။")}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Explain code</span>
                  </button>
                  <button
                    onClick={() => handleKiboQuickAction("Line-by-line explanation", "ဤကုဒ်ကို စာကြောင်းတစ်ကြောင်းချင်းစီအလိုက် ဘာလုပ်သည်ကို ရှင်းပြပေးပါဗျာ။")}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Line by line explanation</span>
                  </button>
                  <button
                    onClick={() => handleKiboQuickAction("Suggest improvements", "ဤကုဒ်ကို ပိုမိုမြန်ဆန်ပြီး မှန်ကန်စေရန် အခြားမည်ကဲ့သို့ ရေးသားနိုင်သလဲခင်ဗျာ။")}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Suggest improvements</span>
                  </button>
                  <button
                    onClick={() => handleKiboQuickAction("Simplify code", "ဤကုဒ်ကို အတိုဆုံးနှင့် ရိုးရှင်းဆုံးဖြစ်အောင် ပြန်လည်ရေးသားပေးပါဦးခင်ဗျာ။")}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    <span>Simplify code</span>
                  </button>
                  <button
                    onClick={() => handleKiboQuickAction("Show another example", "ဤ concept နှင့်တူညီသော အခြား လက်တွေ့အသုံးချ code ဥပမာတစ်ခု ပြသပေးပါဗျာ။")}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Show another example</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-4">
              <Code className="w-16 h-16 text-slate-700 animate-pulse" />
              <h3 className="font-bold text-lg text-slate-200">ကုဒ်ဆန်းစစ်ချက် အစီရင်ခံစာများ မရှိသေးပါ</h3>
              <p className="text-xs text-slate-400 max-w-md">
                ဘယ်ဘက်ခြမ်းရှိ သေတ္တာထဲသို့ သင်ရေးသားထားသော HTML, CSS, JavaScript, Java သို့မဟုတ် Kotlin ကုဒ်များကို ကူးယူထည့်သွင်း၍ AI ဆန်းစစ်ချက် တောင်းဆိုနိုင်ပါတယ်ခင်ဗျာ။
              </p>
            </div>
          )}

        </section>

      </div>

      {/* KIBO FOLLOW-UP CHAT OVERLAY MODAL */}
      {kiboChatOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col h-[550px] shadow-2xl text-left">
            
            {/* Modal Header */}
            <header className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white uppercase">
                    K
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Kibo Virtual Coding Mentor</h3>
                  <p className="text-[10px] text-slate-400">Deep Follow-up discussion</p>
                </div>
              </div>
              <button
                onClick={() => setKiboChatOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {kiboChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none text-right"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none text-left"
                  }`}>
                    {msg.role === "assistant" ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isKiboLoading && (
                <div className="flex justify-start">
                  <div className="p-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Kibo စဉ်းစားနေပါသည်...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={kiboInput}
                onChange={(e) => setKiboInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendKiboMessage();
                }}
                placeholder="ကုဒ်နှင့်ပတ်သက်၍ သိရှိလိုသည်များကို မြန်မာလို ဆက်လက်မေးမြန်းပါ..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none placeholder-slate-500 font-sans"
              />
              <button
                onClick={() => handleSendKiboMessage()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-600/10"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
