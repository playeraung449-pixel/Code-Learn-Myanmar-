/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  Sparkles, 
  AlertCircle, 
  Settings, 
  Shield, 
  BookOpen, 
  Award, 
  ArrowRight, 
  Play, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Activity, 
  FileText, 
  ChevronRight, 
  RefreshCw, 
  ExternalLink, 
  Crown,
  Heart,
  Upload,
  Info,
  Bug,
  Code,
  FileCode,
  Eye,
  Book,
  Clipboard,
  Check
} from "lucide-react";
import { UserProfile, DebugSettings, DebugAttempt } from "../types";
import { getDebugSettings, saveDebugSettings, getUserDebugHistory } from "../lib/db";
import MarkdownRenderer from "../components/MarkdownRenderer";

interface DebugAssistantProps {
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

export default function DebugAssistant({ user, onUpdateUser, setCurrentTab }: DebugAssistantProps) {
  // DB configurations & states
  const [settings, setSettings] = useState<DebugSettings>({
    freeLimit: 3,
    premiumLimit: 100,
    supportedLanguages: ["html", "css", "javascript", "java", "kotlin"],
    systemPromptTemplate: "You are Kibo, an AI-powered debugging assistant and friendly virtual mentor for Code Learn Myanmar. Help students understand, analyze, and solve programming errors. Teach debugging skills, do not simply provide answers.",
    isFeatureEnabled: true,
    maxCodeLength: 5000
  });
  
  const [history, setHistory] = useState<DebugAttempt[]>([]);
  const [isAdminView, setIsAdminView] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  // Input fields
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Debug Status
  const [isLoading, setIsLoading] = useState(false);
  const [activeDebug, setActiveDebug] = useState<DebugAttempt | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Guided Debug Stepper (0 to 4)
  const [activeStep, setActiveStep] = useState<number>(0);
  
  // Admin Config States
  const [adminFreeLimit, setAdminFreeLimit] = useState(3);
  const [adminPremiumLimit, setAdminPremiumLimit] = useState(100);
  const [adminLanguages, setAdminLanguages] = useState<string[]>([]);
  const [adminPromptTemplate, setAdminPromptTemplate] = useState("");
  const [adminFeatureEnabled, setAdminFeatureEnabled] = useState(true);
  const [adminMaxCodeLength, setAdminMaxCodeLength] = useState(5000);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check premium & admin status
  const isPremiumUser = user?.role === "premium" || user?.role === "teacher" || user?.role === "admin" || user?.isPremium === true;
  const isUserAdmin = user?.role === "admin" || user?.role === "teacher" || user?.email === "playeraung449@gmail.com";

  // Load initial settings and history
  useEffect(() => {
    async function loadInitialData() {
      try {
        const cloudSettings = await getDebugSettings();
        setSettings(cloudSettings);
        
        // Sync Admin states
        setAdminFreeLimit(cloudSettings.freeLimit);
        setAdminPremiumLimit(cloudSettings.premiumLimit);
        setAdminLanguages(cloudSettings.supportedLanguages);
        setAdminPromptTemplate(cloudSettings.systemPromptTemplate);
        setAdminFeatureEnabled(cloudSettings.isFeatureEnabled);
        setAdminMaxCodeLength(cloudSettings.maxCodeLength);

        if (user?.uid) {
          const attempts = await getUserDebugHistory(user.uid);
          setHistory(attempts);
          if (attempts.length > 0) {
            setActiveDebug(attempts[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to load Debug Assistant settings:", err);
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

  // Clipboard helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // Drag and Drop files upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    let detectedLang = "javascript";
    if (ext === "html" || ext === "htm") detectedLang = "html";
    else if (ext === "css") detectedLang = "css";
    else if (ext === "java") detectedLang = "java";
    else if (ext === "kt" || ext === "kotlin") detectedLang = "kotlin";

    if (!settings.supportedLanguages.includes(detectedLang)) {
      setErrorMsg(`လောလောဆယ် .${ext} extension အား debug ရန်မပံ့ပိုးသေးပါခင်ဗျာ။`);
      return;
    }

    setLanguage(detectedLang);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setCode(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Save admin settings
  const handleSaveAdminSettings = async () => {
    try {
      const updated: DebugSettings = {
        freeLimit: Number(adminFreeLimit),
        premiumLimit: Number(adminPremiumLimit),
        supportedLanguages: adminLanguages,
        systemPromptTemplate: adminPromptTemplate,
        isFeatureEnabled: adminFeatureEnabled,
        maxCodeLength: Number(adminMaxCodeLength)
      };
      await saveDebugSettings(updated);
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

  // Submit Debug Request
  const handleSubmitDebug = async () => {
    if (!code.trim() && !errorMessage.trim() && !description.trim()) {
      setErrorMsg("ဆန်းစစ်ရန် code၊ error message သို့မဟုတ် ပြဿနာအကြောင်းအရာ တစ်ခုခု ထည့်သွင်းပေးပါခင်ဗျာ။");
      return;
    }

    if (limitsExceeded) {
      setErrorMsg(`ယနေ့အတွက် debug ကူညီမှုကန့်သတ်ချက် ပြည့်သွားပါပြီ။ ${isPremiumUser ? "" : "Kibo Premium သို့ အဆင့်မြှင့်တင်ပြီး ကန့်သတ်မဲ့ရယူပါ"}`);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/gemini/debug-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          errorMessage,
          description,
          language,
          userProfile: user
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Debugging process failed");
      }

      const data: DebugAttempt = await response.json();

      // Update history state
      setHistory(prev => [data, ...prev]);
      setActiveDebug(data);
      setActiveStep(0); // Reset to step 1
      
      // Clear forms
      setCode("");
      setErrorMessage("");
      setDescription("");

      // Award XP & coins
      if (user && onUpdateUser) {
        const updatedCoins = (user.coins || 0) + 12; // 12 coins
        const updatedXp = (user.xp || 0) + 20;     // 20 XP
        onUpdateUser({
          ...user,
          coins: updatedCoins,
          xp: updatedXp
        });
      }

    } catch (err: any) {
      console.error("Debug assistant Error:", err);
      setErrorMsg(err.message || "အချက်အလက်ဆန်းစစ်ရန် အဆင်မပြေဖြစ်သွားပါသဖြင့် ပြန်လည်ကြိုးစားကြည့်ပါခင်ဗျာ။");
    } finally {
      setIsLoading(false);
    }
  };

  // Steps info matching visual stepper
  const getStepTitle = (step: number) => {
    switch(step) {
      case 0: return "1. Error အမျိုးအစားကို ဖော်ထုတ်ခြင်း (Identify)";
      case 1: return "2. အမှားဖြစ်နေသောကုဒ်နေရာကို ရှာဖွေခြင်း (Locate)";
      case 2: return "3. အမှားဖြစ်ရခြင်းအကြောင်းရင်းကို ရှင်းလင်းခြင်း (Explain)";
      case 3: return "4. အမှားပြင်ဆင်ရန် နည်းလမ်းများ (Suggest)";
      case 4: return "5. စမ်းသပ်စစ်ဆေးရန် အကြံပြုခြင်း (Test)";
      default: return "";
    }
  };

  const getStepContent = (step: number, dbg: DebugAttempt) => {
    if (!dbg || !dbg.debugResult) return "";
    const res = dbg.debugResult;
    switch(step) {
      case 0: 
        return `### Error Type: **${res.errorType || "Syntax / Logic Error"}**\n\n${res.explanation.whatHappened}`;
      case 1:
        return `### Error Location\n\n${res.explanation.whereItOccurred}`;
      case 2:
        return `### Why this happened\n\n${res.explanation.whyItHappened}`;
      case 3:
        return `### Actionable Solutions\n\n${res.explanation.howToFixIt}`;
      case 4:
        return `### Testing & Next Steps\n\n${res.explanation.howToAvoidNextTime}`;
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 text-left">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Bug className="w-8 h-8 text-rose-500 animate-pulse" />
            <h1 className="font-display font-black text-2xl text-white tracking-tight">
              Kibo AI Debug Assistant
            </h1>
            <span className="bg-rose-500/15 text-rose-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              LEARNING ASSISTANT
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            အမှားများကို အလွယ်တကူရှာဖွေပြီး ဖြေရှင်းနည်းများကို မြန်မာလို လေ့လာသင်ယူကာ Debugging စွမ်းရည်ကို တိုးတက်စေပါ။
          </p>
        </div>

        {/* Access control display */}
        <div className="flex items-center gap-3 bg-[#1E293B]/60 border border-slate-800 rounded-2xl p-4">
          <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
            {isPremiumUser ? <Crown className="w-5 h-5 text-amber-500 animate-bounce" /> : <Award className="w-5 h-5 text-slate-300" />}
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
              {isPremiumUser ? "👑 Premium Daily Access" : "🎁 Free Student Access"}
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-sm font-bold text-white">{reviewsToday}</span>
              <span className="text-slate-500">/</span>
              <span className="text-xs text-slate-400">{allowedLimit} requests used today</span>
            </div>
          </div>
        </div>
      </header>

      {/* ADMIN CONTROLS BUTTON */}
      {isUserAdmin && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-900/30 rounded-2xl text-left">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-bold text-sm text-purple-200">Administrator Config Dashboard</h3>
              <p className="text-[11px] text-slate-400">စနစ်ကြီးကြပ်သူများအတွက် Debug Feature ချိန်ညှိမှုများကို ဤနေရာတွင် လုပ်ဆောင်နိုင်ပါသည်ခင်ဗျာ။</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className="px-3.5 py-1.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isAdminView ? "Hide Configurations" : "Show Configurations"}</span>
          </button>
        </div>
      )}

      {/* ADMIN CONFIGURATION SECTION */}
      {isAdminView && isUserAdmin && (
        <section className="bg-[#1E293B]/80 border border-purple-800/30 rounded-2xl p-6 text-left space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-lg text-purple-200 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              <span>Admin AI Debug Settings (ချိန်ညှိရန်)</span>
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
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Daily Limits & Restrictions</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Free Limits/Day</label>
                  <input
                    type="number"
                    value={adminFreeLimit}
                    onChange={(e) => setAdminFreeLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Premium Limits/Day</label>
                  <input
                    type="number"
                    value={adminPremiumLimit}
                    onChange={(e) => setAdminPremiumLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Max Code Characters</label>
                  <input
                    type="number"
                    value={adminMaxCodeLength}
                    onChange={(e) => setAdminMaxCodeLength(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Supported Languages</h3>
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
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">AI Prompt Instruction (Kibo Debugger Persona)</h3>
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
              {saveSuccess && <span className="text-xs text-emerald-400 font-bold">✓ Settings Saved Successfully!</span>}
              <button
                onClick={handleSaveAdminSettings}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-purple-600/10"
              >
                Save Settings
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CORE CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SOURCE SUBMISSION */}
        <section className="lg:col-span-5 bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 text-left shadow-lg">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-rose-500" />
              <span>ပြဿနာ တင်သွင်းရန် (Error Paste Area)</span>
            </h2>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4 font-sans">
            
            {/* Input Selectors */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">ပရိုဂရမ်မင်းဘာသာစကား</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id} disabled={!lang.enabled || !settings.supportedLanguages.includes(lang.id)}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description of problems */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">ကြုံတွေ့နေရသောပြဿနာ (Describe Problem)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ဘာတွေမှားယွင်းနေပါသလဲ? e.g. function ခေါ်တာ အလုပ်မလုပ်ပါ၊ loop က ရပ်မသွားပါ..."
                rows={2}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
              />
            </div>

            {/* Error Message pasted */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">ရရှိသော Error Message / Console Output</label>
              <textarea
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="Terminal သို့မဟုတ် Console ထဲမှ အမှားစာတန်းများကို ကူးယူထည့်သွင်းပါ (e.g. Uncaught ReferenceError: x is not defined)..."
                rows={2}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-red-400 placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Code Input & File drag drop */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">ရင်းမြစ်ကုဒ် (Source Code)</label>
              
              <div 
                className={`relative border rounded-2xl overflow-hidden transition-all ${
                  dragActive 
                    ? "border-rose-500 bg-rose-500/5" 
                    : "border-slate-800 bg-slate-950"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// ဤနေရာတွင် သင်၏ ကုဒ်များကို ရေးသား သို့မဟုတ် ကူးယူထည့်သွင်းပါ..."
                  rows={10}
                  className="w-full p-4 bg-slate-950 font-mono text-xs text-emerald-400 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                />

                {/* Drag and Drop label */}
                <div className="absolute bottom-2 right-2 flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-all" onClick={triggerFileInput}>
                  <Upload className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[10px] text-slate-300 font-semibold font-sans">
                    Upload Code File
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".html,.css,.js,.java,.kt"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            {/* Debug Submit Button */}
            <button
              onClick={handleSubmitDebug}
              disabled={isLoading || limitsExceeded}
              className={`w-full py-3.5 px-4 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-all ${
                limitsExceeded
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800"
                  : "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer hover:shadow-rose-600/15 active:scale-95"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Kibo Error များအား ဆန်းစစ်ဖော်ထုတ်နေပါသည် ခင်ဗျာ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ပြဿနာများ ဆန်းစစ်ဖြေရှင်းရန် (Analyze & Debug)</span>
                </>
              )}
            </button>

            {/* XP and Coins awards notification */}
            <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 text-center">
              <p className="text-[10px] text-slate-400">
                💡 AI Debugger ကိုသုံးပြီး အမှားပြင်ခြင်းဖြင့် အတွေ့အကြုံ <span className="text-rose-400 font-bold">+20 XP</span> နှင့် <span className="text-yellow-500 font-bold">+12 Coins</span> ရရှိပါမည်။
              </p>
            </div>
          </div>

          {/* HISTORY LOGS */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              ယခင် အမှားရှာဖွေမှုမှတ်တမ်းများ ({history.length})
            </h3>
            {history.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">မှတ်တမ်းများ မရှိသေးပါ ခင်ဗျာ။</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {history.map((dbg) => (
                  <div
                    key={dbg.id}
                    onClick={() => {
                      setActiveDebug(dbg);
                      setActiveStep(0);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left flex items-center justify-between ${
                      activeDebug?.id === dbg.id
                        ? "bg-rose-600/10 border-rose-500/40"
                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {dbg.language}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(dbg.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1 truncate max-w-[180px]">
                        {dbg.debugResult?.errorType || "Error Debug Analysis"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        Resolved
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: REVIEWS & REPORTS DISPLAY */}
        <section className="lg:col-span-7 space-y-6">
          
          {activeDebug ? (
            <div className="space-y-6">
              
              {/* PRIMARY REPORT SHEET */}
              <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-5 sm:p-6 lg:p-8 space-y-6 text-left shadow-lg">
                
                {/* Header Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md">
                      {activeDebug.language} • {activeDebug.debugResult.errorType}
                    </span>
                    <h3 className="font-bold text-lg text-white mt-1 leading-tight">
                      အဆင့်ဆင့်အမှားရှာဖွေခြင်း အစီရင်ခံစာ (AI Debug Analysis)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ဆန်းစစ်သည့်နေ့စွဲ - {new Date(activeDebug.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {/* Kibo visual banner */}
                  <div className="flex items-center space-x-2 bg-rose-950/20 border border-rose-900/30 rounded-2xl p-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold text-xs">
                      KB
                    </div>
                    <div>
                      <span className="text-[10px] text-rose-300 block font-bold leading-none">Kibo Mentor</span>
                      <span className="text-[9px] text-slate-400">Virtual Educator</span>
                    </div>
                  </div>
                </div>

                {/* STEP-BY-STEP GUIDED DEBUGGING STEPPER (5 Steps) */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-mono font-bold text-slate-400">Step-by-Step Debugging Process (အမှားရှာဖွေရေးလမ်းညွှန်)</h4>
                  
                  {/* Progress Line and Buttons */}
                  <div className="flex items-center justify-between relative">
                    <div className="absolute left-2.5 right-2.5 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-10"></div>
                    
                    {[
                      { icon: "🔍", label: "Identify", desc: "Error အမျိုးအစား" },
                      { icon: "📍", label: "Locate", desc: "အမှားဖြစ်သောနေရာ" },
                      { icon: "💡", label: "Explain", desc: "အဓိပ္ပာယ်ရှင်းလင်းချက်" },
                      { icon: "🛠️", label: "Suggest", desc: "ပြင်ဆင်ရန်နည်းလမ်း" },
                      { icon: "🔄", label: "Test", desc: "စမ်းသပ်စစ်ဆေးခြင်း" }
                    ].map((stepInfo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveStep(idx)}
                        className={`z-10 flex flex-col items-center group cursor-pointer`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                          activeStep === idx
                            ? "bg-rose-600 border-rose-500 text-white scale-110 shadow-lg shadow-rose-600/20"
                            : activeStep > idx
                              ? "bg-rose-950/40 border-rose-800 text-rose-400"
                              : "bg-slate-900 border-slate-800 text-slate-500"
                        }`}>
                          {stepInfo.icon}
                        </div>
                        <span className={`text-[9px] mt-1 font-bold ${
                          activeStep === idx ? "text-rose-400" : "text-slate-500"
                        }`}>{stepInfo.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Step Panel */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-left">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-xs font-bold text-rose-400">
                        {getStepTitle(activeStep)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Step {activeStep + 1} of 5
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed font-sans markdown-body pt-1">
                      <MarkdownRenderer content={getStepContent(activeStep, activeDebug)} />
                    </div>

                    {/* Navigation Buttons inside stepper */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/40 mt-3">
                      <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(prev => prev - 1)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          activeStep === 0 
                            ? "text-slate-600 bg-slate-900 cursor-not-allowed" 
                            : "text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
                        }`}
                      >
                        ← Back
                      </button>
                      <button
                        disabled={activeStep === 4}
                        onClick={() => setActiveStep(prev => prev + 1)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          activeStep === 4 
                            ? "text-slate-600 bg-slate-900 cursor-not-allowed" 
                            : "text-rose-400 bg-rose-950/30 border border-rose-900/30 hover:bg-rose-950/50 cursor-pointer"
                        }`}
                      >
                        Next Step →
                      </button>
                    </div>
                  </div>
                </div>

                {/* CODE COMPARISON (Original Code vs Revised Code Side by Side/Stacked) */}
                {activeDebug.debugResult.codeComparison && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase font-mono font-bold text-slate-400">Code Comparison (မူရင်း နှင့် ပြင်ဆင်ချက် ကုဒ် နှိုင်းယှဉ်မှု)</h4>
                      <span className="text-[10px] text-slate-500 font-mono">EDUCATIONAL HIGHLIGHT</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Original Code */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 border border-slate-800 border-b-0 rounded-t-xl">
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            <span>မူရင်းကုဒ် (Original Code)</span>
                          </span>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-b-xl p-3 max-h-60 overflow-y-auto">
                          <pre className="font-mono text-[11px] text-rose-400/90 whitespace-pre-wrap leading-normal text-left">
                            {activeDebug.debugResult.codeComparison.originalCode || activeDebug.code}
                          </pre>
                        </div>
                      </div>

                      {/* Revised Code */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 border border-slate-800 border-b-0 rounded-t-xl">
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3 text-emerald-500 animate-pulse" />
                            <span>ပြင်ဆင်ထားသောကုဒ် (Revised Code)</span>
                          </span>
                          <button
                            onClick={() => handleCopy(activeDebug.debugResult.codeComparison.revisedCode, "revised")}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-all"
                            title="Copy Corrected Code"
                          >
                            {copied === "revised" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-b-xl p-3 max-h-60 overflow-y-auto">
                          <pre className="font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-normal text-left">
                            {activeDebug.debugResult.codeComparison.revisedCode}
                          </pre>
                        </div>
                      </div>

                    </div>

                    {/* Diff/Improvement description */}
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-left">
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block mb-1">အဓိက ပြင်ဆင်ပြောင်းလဲမှုများ (Key Differences)</span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {activeDebug.debugResult.codeComparison.diffDescription}
                      </p>
                    </div>
                  </div>
                )}

                {/* BENTO BOX: LEARNING RESOURCES RECOMMENDATIONS */}
                {activeDebug.debugResult.learningResources && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-xs uppercase font-mono font-bold text-slate-400">ဆက်စပ်လေ့လာရန် လမ်းညွှန်ချက်များ (Learning Resources)</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Lessons */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">သင်ခန်းစာများ (Recommended Lessons)</span>
                        <div className="space-y-1.5">
                          {activeDebug.debugResult.learningResources.lessons?.map((les, i) => (
                            <div
                              key={i}
                              onClick={() => setCurrentTab("courses")}
                              className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/60 rounded-xl text-xs text-blue-400 font-bold flex items-center justify-between cursor-pointer transition-all"
                            >
                              <span className="truncate">{les}</span>
                              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                            </div>
                          )) || <p className="text-xs text-slate-500 italic">No custom lessons recommended</p>}
                        </div>
                      </div>

                      {/* Exercises */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">လက်တွေ့လေ့ကျင့်ခန်းများ (Exercises)</span>
                        <div className="space-y-1.5">
                          {activeDebug.debugResult.learningResources.exercises?.map((exe, i) => (
                            <div
                              key={i}
                              onClick={() => setCurrentTab("projects")}
                              className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/60 rounded-xl text-xs text-slate-300 flex items-center justify-between cursor-pointer transition-all"
                            >
                              <span className="truncate">{exe}</span>
                              <Play className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            </div>
                          )) || <p className="text-xs text-slate-500 italic">No exercises recommended</p>}
                        </div>
                      </div>

                      {/* Quizzes */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ဉာဏ်စမ်းမေးခွန်းများ (Related Quizzes)</span>
                        <div className="space-y-1.5">
                          {activeDebug.debugResult.learningResources.quizzes?.map((quiz, i) => (
                            <div
                              key={i}
                              onClick={() => setCurrentTab("courses")}
                              className="p-2.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-rose-400 flex items-center justify-between cursor-pointer transition-all font-bold"
                            >
                              <span className="truncate">{quiz}</span>
                              <Award className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            </div>
                          )) || <p className="text-xs text-slate-500 italic">No quizzes recommended</p>}
                        </div>
                      </div>

                      {/* Documentation */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ကိုးကားစာရွက်စာတမ်းများ (Docs)</span>
                        <div className="space-y-1.5">
                          {activeDebug.debugResult.learningResources.docs?.map((doc, i) => (
                            <a
                              key={i}
                              href="https://developer.mozilla.org"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/60 rounded-xl text-xs text-slate-400 flex items-center justify-between transition-all"
                            >
                              <span className="truncate">{doc}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            </a>
                          )) || <p className="text-xs text-slate-500 italic">No docs recommended</p>}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* BENTO BOX: DEBUGGING TIPS (Best Practices, Common Mistakes, testingSuggestions, etc.) */}
              {activeDebug.debugResult.debuggingTips && (
                <div className="bg-[#1E293B]/40 border border-slate-800 rounded-3xl p-6 text-left space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Book className="w-5 h-5 text-amber-500 animate-pulse" />
                      <span>Kibo Debugging Tips & Best Practices (အမှားကင်းကုဒ် ရေးသားနည်းများ)</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                    
                    {/* Best practices */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        <span>လိုက်နာရန် အလေ့အထကောင်းများ (Best Practices)</span>
                      </h4>
                      <ul className="space-y-2">
                        {activeDebug.debugResult.debuggingTips.bestPractices?.map((bp, i) => (
                          <li key={i} className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/40">
                            ⭐ {bp}
                          </li>
                        )) || <li className="text-xs text-slate-500">None</li>}
                      </ul>
                    </div>

                    {/* Beginner mistakes */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        <span>အစပြုသူများ မှားလေ့ရှိသောအမှားများ (Beginner Mistakes)</span>
                      </h4>
                      <ul className="space-y-2">
                        {activeDebug.debugResult.debuggingTips.beginnerMistakes?.map((bm, i) => (
                          <li key={i} className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/40">
                            ⚠️ {bm}
                          </li>
                        )) || <li className="text-xs text-slate-500">None</li>}
                      </ul>
                    </div>

                    {/* Organization tips */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                        <FileCode className="w-4 h-4" />
                        <span>ကုဒ်စနစ်တကျဖွဲ့စည်းခြင်း (Organization Tips)</span>
                      </h4>
                      <ul className="space-y-2">
                        {activeDebug.debugResult.debuggingTips.organizationTips?.map((ot, i) => (
                          <li key={i} className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/40">
                            📦 {ot}
                          </li>
                        )) || <li className="text-xs text-slate-500">None</li>}
                      </ul>
                    </div>

                    {/* Testing suggestions */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4" />
                        <span>စမ်းသပ်စစ်ဆေးရန် အကြံပြုချက်များ (Testing Suggestions)</span>
                      </h4>
                      <ul className="space-y-2">
                        {activeDebug.debugResult.debuggingTips.testingSuggestions?.map((ts, i) => (
                          <li key={i} className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/40">
                            🔍 {ts}
                          </li>
                        )) || <li className="text-xs text-slate-500">None</li>}
                      </ul>
                    </div>

                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-400 leading-normal">
                    ⚠️ <strong>သတိပြုရန်-</strong> AI Debugger သည် သင်ကြားရေးအကြံပြုချက်များကိုသာ ပေးစွမ်းနိုင်ခြင်းဖြစ်ပြီး ကုဒ်များအား အမှန်တကယ်အသုံးမပြုမီ မိမိကိုယ်တိုင် ပြန်လည်စမ်းသပ်ရန် လိုအပ်ပါသည်ခင်ဗျာ။
                  </div>

                </div>
              )}

            </div>
          ) : (
            /* NO REPORT LOADED STATE */
            <div className="bg-[#1E293B]/60 border border-slate-800 rounded-3xl p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                <Bug className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-bold text-lg text-white">ဆန်းစစ်ချက် မရှိသေးပါ ခင်ဗျာ</h3>
                <p className="text-slate-400 text-xs leading-normal">
                  ဘယ်ဘက်ကဏ္ဍတွင် သင်၏ အမှားများကို ဖြည့်စွက်ပြီး "Analyze & Debug" ကို နှိပ်ခြင်းဖြင့် Kibo ဉာဏ်ရည်တု အမှားပြင်လက်ထောက်၏ ကူညီမှုကို ရယူလိုက်ပါ။
                </p>
              </div>
            </div>
          )}

        </section>

      </div>

    </div>
  );
}
