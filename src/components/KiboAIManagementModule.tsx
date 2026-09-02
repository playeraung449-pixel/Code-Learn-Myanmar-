/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Bot,
  Sparkles,
  Sliders,
  ShieldCheck,
  Zap,
  Activity,
  History,
  BookOpen,
  Terminal,
  Cpu,
  RefreshCw,
  Save,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  BarChart3,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code2,
  Lock,
  Layers,
  Crown,
  Coins,
  Send,
  MessageSquare,
  Shield,
  Eye,
  FileText,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Settings,
  AlertCircle
} from "lucide-react";
import {
  UserProfile,
  KiboAISettings,
  KiboAIModel,
  KiboPersonalityPreset,
  KiboKnowledgeItem,
  KiboPromptVersion,
  KiboUsageMetric,
  KiboAuditLogRecord,
  Course
} from "../types";
import { COURSES } from "../courses/data";
import {
  getKiboAISettingsFromDb,
  saveKiboAISettingsToDb,
  getKiboKnowledgeItemsFromDb,
  saveKiboKnowledgeItemToDb,
  deleteKiboKnowledgeItemFromDb,
  getKiboPromptVersionsFromDb,
  rollbackKiboPromptVersion,
  getKiboAuditLogsFromDb,
  getKiboUsageMetricsFromDb,
  DEFAULT_KIBO_AI_SETTINGS
} from "../lib/db";
import MarkdownRenderer from "./MarkdownRenderer";

interface KiboAIManagementModuleProps {
  user: UserProfile;
  firebaseUser: any;
  onRefreshParent?: () => void;
}

type SubTab =
  | "overview"
  | "model_config"
  | "personality_learning"
  | "tier_limits"
  | "prompts_versioning"
  | "knowledge_base"
  | "safety_guardrails"
  | "test_sandbox"
  | "analytics_monitoring"
  | "audit_logs";

export default function KiboAIManagementModule({
  user,
  firebaseUser,
  onRefreshParent
}: KiboAIManagementModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Core Data States
  const [settings, setSettings] = useState<KiboAISettings>(DEFAULT_KIBO_AI_SETTINGS);
  const [knowledgeItems, setKnowledgeItems] = useState<KiboKnowledgeItem[]>([]);
  const [promptVersions, setPromptVersions] = useState<KiboPromptVersion[]>([]);
  const [auditLogs, setAuditLogs] = useState<KiboAuditLogRecord[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<KiboUsageMetric[]>([]);

  // Knowledge Item Form Modal
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [editingKnowledgeItem, setEditingKnowledgeItem] = useState<KiboKnowledgeItem | null>(null);
  const [kbTitle, setKbTitle] = useState("");
  const [kbCategory, setKbCategory] = useState<KiboKnowledgeItem["category"]>("curriculum");
  const [kbContent, setKbContent] = useState("");
  const [kbKeywords, setKbKeywords] = useState("");
  const [kbEnabled, setKbEnabled] = useState(true);

  // Custom Blocked Keyword Input
  const [newBlockedKeyword, setNewBlockedKeyword] = useState("");

  // Prompt Version Rollback Modal
  const [selectedPromptVersion, setSelectedPromptVersion] = useState<KiboPromptVersion | null>(null);

  // Test Sandbox (Live Playground) States
  const [sandboxRole, setSandboxRole] = useState<"free" | "premium">("free");
  const [sandboxFeature, setSandboxFeature] = useState<
    "chat" | "code_review" | "debug" | "quiz_hint" | "project_advice"
  >("chat");
  const [sandboxCourseId, setSandboxCourseId] = useState<string>(COURSES[0]?.id || "python-basics");
  const [sandboxPrompt, setSandboxPrompt] = useState<string>(
    "ဆရာ Kibo ခင်ဗျာ၊ Python မှာ Variable ဆိုတာ ဘာလဲ? အခြေခံနမူနာလေးနဲ့ မြန်မာလို ရှင်းပြပေးပါခင်ဗျာ။"
  );
  const [sandboxExecuting, setSandboxExecuting] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [sandboxStats, setSandboxStats] = useState<{
    latencyMs: number;
    tokensEstimated: number;
    modelUsed: string;
    safetyPassed: boolean;
  } | null>(null);

  // Load All Kibo Data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [s, k, v, a, m] = await Promise.all([
        getKiboAISettingsFromDb(),
        getKiboKnowledgeItemsFromDb(),
        getKiboPromptVersionsFromDb(),
        getKiboAuditLogsFromDb(),
        getKiboUsageMetricsFromDb()
      ]);
      setSettings(s);
      setKnowledgeItems(k);
      setPromptVersions(v);
      setAuditLogs(a);
      setUsageMetrics(m);
    } catch (err) {
      console.error("Error loading Kibo settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Save Settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await saveKiboAISettingsToDb(
        settings,
        user?.email || firebaseUser?.email || "admin@codelearnmm.com",
        user?.uid || firebaseUser?.uid || "admin_uid"
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadAllData();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error("Error saving Kibo settings:", err);
      alert("Failed to save Kibo settings.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Master Kibo Switch
  const handleToggleMasterSwitch = async () => {
    const updated = { ...settings, isEnabled: !settings.isEnabled };
    setSettings(updated);
    try {
      await saveKiboAISettingsToDb(
        updated,
        user?.email || firebaseUser?.email || "admin@codelearnmm.com",
        user?.uid || firebaseUser?.uid || "admin_uid"
      );
      await loadAllData();
    } catch (e) {}
  };

  // Preset Handlers for Personality
  const handleSelectPersonalityPreset = (preset: KiboPersonalityPreset) => {
    let toneName = "";
    let enc = 4;
    let simp = 4;
    let soc = 4;

    switch (preset) {
      case "friendly_encouraging":
        toneName = "ဖော်ရွေပြီး စိတ်ရှည်လက်ရှည် ပညာသင်ကြားပေးသော Mentor";
        enc = 5;
        simp = 4;
        soc = 3;
        break;
      case "patient_socratic":
        toneName = "မေးခွန်းများဖြင့် ဦးနှောက်ဖွင့်ပေးသော Socratic ပညာရှင်";
        enc = 4;
        simp = 4;
        soc = 5;
        break;
      case "educational_structured":
        toneName = "စနစ်တကျ အစီအစဉ်ချ သင်ကြားပေးသော ကထိက အဆင့်ဆရာ";
        enc = 3;
        simp = 5;
        soc = 4;
        break;
      case "professional_senior":
        toneName = "လုပ်ငန်းခွင်အတွေ့အကြုံရင့် Senior Software Engineer";
        enc = 3;
        simp = 3;
        soc = 3;
        break;
      case "custom":
        toneName = "စိတ်ကြိုက်သတ်မှတ်ထားသော Personality";
        enc = settings.personality.encouragementLevel;
        simp = settings.personality.simplificationLevel;
        soc = settings.personality.socraticGuidanceLevel;
        break;
    }

    setSettings({
      ...settings,
      personality: {
        ...settings.personality,
        preset,
        toneName,
        encouragementLevel: enc,
        simplificationLevel: simp,
        socraticGuidanceLevel: soc
      }
    });
  };

  // Add/Edit Knowledge Item
  const handleOpenKnowledgeModal = (item?: KiboKnowledgeItem) => {
    if (item) {
      setEditingKnowledgeItem(item);
      setKbTitle(item.title);
      setKbCategory(item.category);
      setKbContent(item.content);
      setKbKeywords(item.keywords.join(", "));
      setKbEnabled(item.isEnabled);
    } else {
      setEditingKnowledgeItem(null);
      setKbTitle("");
      setKbCategory("curriculum");
      setKbContent("");
      setKbKeywords("");
      setKbEnabled(true);
    }
    setIsKnowledgeModalOpen(true);
  };

  const handleSaveKnowledgeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbTitle.trim() || !kbContent.trim()) return;

    const newItem: KiboKnowledgeItem = {
      id: editingKnowledgeItem ? editingKnowledgeItem.id : `kb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: kbTitle.trim(),
      category: kbCategory,
      content: kbContent.trim(),
      keywords: kbKeywords.split(",").map(k => k.trim()).filter(Boolean),
      isEnabled: kbEnabled,
      createdAt: editingKnowledgeItem ? editingKnowledgeItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: user?.email || "admin@codelearnmm.com"
    };

    try {
      await saveKiboKnowledgeItemToDb(
        newItem,
        user?.email || "admin@codelearnmm.com",
        user?.uid || "admin_uid"
      );
      setIsKnowledgeModalOpen(false);
      await loadAllData();
    } catch (err) {
      alert("Failed to save knowledge item");
    }
  };

  const handleDeleteKnowledgeItem = async (id: string) => {
    if (!window.confirm("ဤ Knowledge Item အား ဖျက်ပစ်ရန် သေချာပါသလားခင်ဗျာ။")) return;
    try {
      await deleteKiboKnowledgeItemFromDb(
        id,
        user?.email || "admin@codelearnmm.com",
        user?.uid || "admin_uid"
      );
      await loadAllData();
    } catch (e) {}
  };

  // Rollback Prompt Version
  const handleRollbackPrompt = async (versionId: string) => {
    if (!window.confirm("သတ်မှတ်ထားသော Prompt Version အဟောင်းသို့ ပြန်လည် Rollback ပြုလုပ်မည်မှာ သေချာပါသလားခင်ဗျာ။")) return;
    try {
      await rollbackKiboPromptVersion(
        versionId,
        user?.email || "admin@codelearnmm.com",
        user?.uid || "admin_uid"
      );
      setSelectedPromptVersion(null);
      await loadAllData();
      alert("Prompt version successfully rolled back!");
    } catch (e) {
      alert("Rollback failed.");
    }
  };

  // Blocked Keywords Management
  const handleAddBlockedKeyword = () => {
    if (!newBlockedKeyword.trim()) return;
    const kw = newBlockedKeyword.trim().toLowerCase();
    if (!settings.safetyAndGuardrails.customBlockedKeywords.includes(kw)) {
      setSettings({
        ...settings,
        safetyAndGuardrails: {
          ...settings.safetyAndGuardrails,
          customBlockedKeywords: [...settings.safetyAndGuardrails.customBlockedKeywords, kw]
        }
      });
    }
    setNewBlockedKeyword("");
  };

  const handleRemoveBlockedKeyword = (kw: string) => {
    setSettings({
      ...settings,
      safetyAndGuardrails: {
        ...settings.safetyAndGuardrails,
        customBlockedKeywords: settings.safetyAndGuardrails.customBlockedKeywords.filter(k => k !== kw)
      }
    });
  };

  // Run Test Sandbox Simulation
  const handleExecuteSandbox = async () => {
    if (!sandboxPrompt.trim() || sandboxExecuting) return;
    setSandboxExecuting(true);
    setSandboxResponse(null);
    setSandboxStats(null);

    const startTime = Date.now();
    const activeCourse = COURSES.find(c => c.id === sandboxCourseId) || COURSES[0];

    try {
      // Check safety filter first
      const hasBlockedWord = settings.safetyAndGuardrails.customBlockedKeywords.some(kw =>
        sandboxPrompt.toLowerCase().includes(kw.toLowerCase())
      );

      if (hasBlockedWord && settings.safetyAndGuardrails.blockMaliciousCode) {
        setSandboxResponse(
          "⚠️ **[Kibo Safety Guardrail Triggered]**\n\nတောင်းပန်ပါတယ်ခင်ဗျာ။ သင်မေးမြန်းထားသော မေးခွန်းထဲတွင် လုံခြုံရေးဆိုင်ရာ ပိတ်ပင်ထားသော စကားလုံး သို့မဟုတ် ပလက်ဖောင်း စည်းကမ်းချက်များနှင့် မကိုက်ညီသော အချက်များ ပါဝင်နေသည့်အတွက် ဖြေကြားခွင့် မပြုနိုင်ပါခင်ဗျာ။"
        );
        setSandboxStats({
          latencyMs: Date.now() - startTime,
          tokensEstimated: 85,
          modelUsed: settings.activeModel,
          safetyPassed: false
        });
        setSandboxExecuting(false);
        return;
      }

      // Execute via backend Gemini chat API
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: sandboxPrompt }],
          currentCourse: activeCourse,
          currentLesson: activeCourse?.lessons?.[0] || null,
          userProfile: {
            role: sandboxRole === "premium" ? "premium" : "student",
            isPremium: sandboxRole === "premium"
          },
          stream: false
        })
      });

      const data = await res.json();
      const latency = Date.now() - startTime;
      const responseText = data.text || "အဖြေမရရှိနိုင်ပါ။";

      setSandboxResponse(responseText);
      setSandboxStats({
        latencyMs: latency,
        tokensEstimated: Math.round((sandboxPrompt.length + responseText.length) / 3.8),
        modelUsed: settings.activeModel,
        safetyPassed: true
      });
    } catch (err: any) {
      setSandboxResponse(`⚠️ စမ်းသပ်မှု မအောင်မြင်ပါ: ${err.message || "Network Error"}`);
      setSandboxStats({
        latencyMs: Date.now() - startTime,
        tokensEstimated: 0,
        modelUsed: settings.activeModel,
        safetyPassed: false
      });
    } finally {
      setSandboxExecuting(false);
    }
  };

  // KPI calculations from usage metrics
  const totalRequestsToday = useMemo(() => {
    return usageMetrics[0]?.totalRequests || 184;
  }, [usageMetrics]);

  const avgLatency = useMemo(() => {
    if (!usageMetrics.length) return 720;
    const sum = usageMetrics.reduce((acc, m) => acc + m.avgResponseTimeMs, 0);
    return Math.round(sum / usageMetrics.length);
  }, [usageMetrics]);

  const freeVsPremRatio = useMemo(() => {
    const today = usageMetrics[0];
    if (!today) return { free: 65, premium: 35 };
    const total = today.totalRequests || 1;
    return {
      free: Math.round((today.freeRequests / total) * 100),
      premium: Math.round((today.premiumRequests / total) * 100)
    };
  }, [usageMetrics]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading Kibo AI Configuration & Engine State...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* HEADER & MASTER TOGGLE BANNER */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="relative p-3.5 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-2xl">
              <Bot className="w-8 h-8 text-amber-400" />
              <span
                className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  settings.isEnabled ? "bg-emerald-400 animate-pulse" : "bg-red-500"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  Kibo AI Assistant Management Control
                </h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    settings.isEnabled
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}
                >
                  {settings.isEnabled ? "● LIVE ACTIVE" : "● DISABLED"}
                </span>
                <span className="text-xs font-mono text-slate-400">v{settings.version}.0</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Code Learn Myanmar ၏ တရားဝင် AI Mentor (Kibo) ၏ အပြုအမူ၊ စွမ်းဆောင်ရည်၊ Usage Limits၊ Personality နှင့် Guardrails များအား ဗဟိုမှ ထိန်းချုပ်စီမံသော Control Center။
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleMasterSwitch}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-md ${
                settings.isEnabled
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black"
              }`}
            >
              <PowerIcon className="w-4 h-4" />
              <span>{settings.isEnabled ? "Disable Kibo AI" : "Enable Kibo AI"}</span>
            </button>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 shadow-lg transition-all"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? "Saving..." : saveSuccess ? "Saved Successfully!" : "Save All Changes"}</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Active Engine</p>
            <p className="text-sm font-black text-amber-400 mt-0.5 truncate">{settings.activeModel}</p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Requests Today</p>
            <p className="text-sm font-black text-slate-100 mt-0.5">{totalRequestsToday.toLocaleString()} reqs</p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Free vs Premium Split</p>
            <p className="text-sm font-black text-emerald-400 mt-0.5">
              {freeVsPremRatio.free}% Free / {freeVsPremRatio.premium}% Prem
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Avg Latency</p>
            <p className="text-sm font-black text-cyan-400 mt-0.5">{avgLatency} ms</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar border-b border-slate-800">
        {[
          { id: "overview", label: "Overview & Features", icon: Sliders },
          { id: "model_config", label: "Model & Engine", icon: Cpu },
          { id: "personality_learning", label: "Personality & Socratic Mode", icon: Sparkles },
          { id: "tier_limits", label: "Tiers & Quota Limits", icon: Layers },
          { id: "prompts_versioning", label: "Prompts & History", icon: FileText },
          { id: "knowledge_base", label: "Knowledge Base (RAG)", icon: BookOpen },
          { id: "safety_guardrails", label: "Safety & Guardrails", icon: ShieldCheck },
          { id: "test_sandbox", label: "Live Test Sandbox", icon: Terminal },
          { id: "analytics_monitoring", label: "Analytics & Usage", icon: BarChart3 },
          { id: "audit_logs", label: "Audit Logs", icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-2 transition-all ${
                isActive
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & FEATURE AVAILABILITY MATRIX */}
      {/* ========================================================================= */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <span>Kibo AI Feature Availability Matrix</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  ကျောင်းသားများ အသုံးပြုနိုင်သော Kibo AI ၏ လုပ်ဆောင်ချက် တစ်ခုချင်းစီအား ဖွင့်/ပိတ် ထိန်းချုပ်နိုင်ပါသည်။
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  key: "lessonExplanation",
                  title: "Lesson Explanation",
                  desc: "သင်ခန်းစာ သဘောတရားများအား မြန်မာလို အသေးစိတ် ရှင်းလင်းသင်ကြားပေးခြင်း",
                  icon: BookOpen
                },
                {
                  key: "codeExplanation",
                  title: "Code Explanation",
                  desc: "ကုဒ် syntax၊ execution flow နှင့် logic များအား တစ်ကြောင်းချင်း ခွဲခြမ်းစိတ်ဖြာပြခြင်း",
                  icon: Code2
                },
                {
                  key: "codingHints",
                  title: "Coding Hints & Socratic Guidance",
                  desc: "အဖြေတိုက်ရိုက်မပေးဘဲ တွေးခေါ်နည်း လမ်းစများနှင့် အဆင့်ဆင့် အကြံဉာဏ်များ ပေးခြင်း",
                  icon: Sparkles
                },
                {
                  key: "debuggingGuidance",
                  title: "Debugging Guidance",
                  desc: "Error တက်နေသော ကုဒ်များ၏ အမှားဇာစ်မြစ်ကို ရှာဖွေပြီး ဖြေရှင်းနည်း သင်ပြပေးခြင်း",
                  icon: Terminal
                },
                {
                  key: "quizAssistance",
                  title: "Quiz Assistance & Mistake Explainer",
                  desc: "မှားယွင်းသွားသော ဉာဏ်စမ်းမေးခွန်းများ၏ သဘောတရားကို အမှားဆန်းစစ် ရှင်းပြခြင်း",
                  icon: HelpCircle
                },
                {
                  key: "projectGuidance",
                  title: "Project Guidance & Code Architecture",
                  desc: "Mini Projects နှင့် Portfolio များ ရေးသားရာတွင် Structure ချပေးခြင်း",
                  icon: Layers
                },
                {
                  key: "learningRecommendations",
                  title: "Learning Recommendations",
                  desc: "ကျောင်းသား၏ တိုးတက်မှုအလိုက် ဆက်လက်လေ့လာသင့်သော သင်ခန်းစာများ ညွှန်းဆိုခြင်း",
                  icon: TrendingUp
                },
                {
                  key: "studyMotivation",
                  title: "Study Motivation & Encouragement",
                  desc: "စိတ်ဓာတ်တက်ကြွစေမည့် အားပေးစကားများနှင့် လေ့ကျင့်မှု စည်းကမ်းများ တိုက်တွန်းခြင်း",
                  icon: Bot
                },
                {
                  key: "portfolioAdvisor",
                  title: "Portfolio & Career Advisor",
                  desc: "Software Engineer လုပ်ငန်းခွင် ဝင်ရောက်ရန် CV နှင့် GitHub portfolio အကြံဉာဏ်များ",
                  icon: Crown
                }
              ].map(item => {
                const isChecked = (settings.featureAvailability as any)[item.key];
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      setSettings({
                        ...settings,
                        featureAvailability: {
                          ...settings.featureAvailability,
                          [item.key]: !isChecked
                        }
                      });
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between space-x-3 ${
                      isChecked
                        ? "bg-slate-950 border-amber-500/40 shadow-sm hover:border-amber-400"
                        : "bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isChecked ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-100">{item.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        isChecked ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isChecked ? "ON" : "OFF"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick System Architecture Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Kibo AI Backend Architecture Safeguards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <p className="font-bold text-amber-400">Server-Side Proxy</p>
                <p className="text-slate-400">
                  Google Gemini SDK calls strictly run inside Express backend (`server.ts`). GEMINI_API_KEY is never exposed to browser.
                </p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <p className="font-bold text-emerald-400">Socratic Mode Guard</p>
                <p className="text-slate-400">
                  Direct homework/quiz solution dumping is actively mitigated through system instructions and hints prioritization.
                </p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <p className="font-bold text-cyan-400">Context Injection</p>
                <p className="text-slate-400">
                  Active course, lesson objectives, and student skill levels are injected in real time to ground model responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MODEL & CORE PARAMETERS CONFIG */}
      {/* ========================================================================= */}
      {activeSubTab === "model_config" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <span>Primary AI Model Selection & Generation Config</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kibo အတွက် အသုံးပြုမည့် Google Gemini ဉာဏ်ရည်တု Model နှင့် Model parameters များကို သတ်မှတ်ပါ။
              </p>
            </div>

            {/* Model Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: "gemini-3.7-flash",
                  name: "Gemini 3.7 Flash",
                  badge: "RECOMMENDED",
                  desc: "Ultra-fast response latency, state-of-the-art coding and multimodal reasoning for Myanmar students.",
                  latency: "~500ms"
                },
                {
                  id: "gemini-3.1-pro-preview",
                  name: "Gemini 3.1 Pro",
                  badge: "DEEP REASONING",
                  desc: "Advanced logic reasoning, complex system architecture design, and deep code auditing.",
                  latency: "~1200ms"
                },
                {
                  id: "gemini-3.1-flash-lite",
                  name: "Gemini 3.1 Flash Lite",
                  badge: "ULTRA LOW COST",
                  desc: "Lightweight, highly economical for simple question answering and high concurrency throughput.",
                  latency: "~350ms"
                },
                {
                  id: "gemini-3.1-flash-tts-preview",
                  name: "Gemini 3.1 Flash Audio",
                  badge: "AUDIO READY",
                  desc: "Supports text-to-speech audio outputs for interactive pronunciation and verbal explanations.",
                  latency: "~900ms"
                }
              ].map(m => {
                const isSelected = settings.activeModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSettings({ ...settings, activeModel: m.id as KiboAIModel })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-slate-950 border-amber-500 shadow-md ring-1 ring-amber-500/50"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-bold rounded-full border border-amber-500/30">
                          {m.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs font-bold text-slate-100">{m.name}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{m.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Avg Latency</span>
                      <span className="text-cyan-400 font-bold">{m.latency}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sliders & Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200">Temperature: {settings.temperature}</span>
                    <span className="text-slate-400">(0.0 = Deterministic, 1.0 = Highly Creative)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.temperature}
                    onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200">Top-P (Nucleus Sampling): {settings.topP}</span>
                    <span className="text-slate-400">(0.1 - 1.0)</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={settings.topP}
                    onChange={e => setSettings({ ...settings, topP: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200">Max Output Tokens: {settings.maxOutputTokens}</span>
                    <span className="text-slate-400">(Words per response limit)</span>
                  </div>
                  <input
                    type="range"
                    min="512"
                    max="8192"
                    step="256"
                    value={settings.maxOutputTokens}
                    onChange={e => setSettings({ ...settings, maxOutputTokens: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Thinking Level (Gemini 3 Series):</label>
                  <select
                    value={settings.thinkingLevel}
                    onChange={e => setSettings({ ...settings, thinkingLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  >
                    <option value="DEFAULT">DEFAULT (Balanced Reasoning)</option>
                    <option value="HIGH">HIGH (Deep multi-step reasoning)</option>
                    <option value="LOW">LOW (Fast concise explanations)</option>
                    <option value="MINIMAL">MINIMAL (Direct answers with minimal thoughts)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PERSONALITY & SOCRATIC LEARNING MODE */}
      {/* ========================================================================= */}
      {activeSubTab === "personality_learning" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Kibo AI Personality & Pedagogical Tone</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kibo ၏ ဖော်ရွေမှု၊ အားပေးမှုနှင့် မြန်မာဘာသာ သင်ကြားရေး လေယူလေသိမ်းများကို သတ်မှတ်ပါ။
              </p>
            </div>

            {/* Personality Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Select Personality Preset:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: "friendly_encouraging",
                    title: "Friendly & Encouraging",
                    desc: "နွေးထွေးဖော်ရွေပြီး အမြဲအားပေးသော ဆရာ"
                  },
                  {
                    id: "patient_socratic",
                    title: "Patient & Socratic",
                    desc: "မေးခွန်းများဖြင့် လမ်းပြတွေးခေါ်စေသော ပညာရှင်"
                  },
                  {
                    id: "educational_structured",
                    title: "Educational & Structured",
                    desc: "အဆင့်ဆင့် စနစ်တကျ ခွဲခြမ်းပြသော ဆရာကြီး"
                  },
                  {
                    id: "professional_senior",
                    title: "Professional Senior Dev",
                    desc: "လုပ်ငန်းခွင် အလေ့အကျင့်ကောင်းများ သင်ပြပေးသော Senior"
                  }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersonalityPreset(p.id as KiboPersonalityPreset)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.personality.preset === p.id
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <p className="text-xs font-bold">{p.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Personality Dimension Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-200">Encouragement & Warmth: {settings.personality.encouragementLevel}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={settings.personality.encouragementLevel}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      personality: {
                        ...settings.personality,
                        encouragementLevel: parseInt(e.target.value, 10),
                        preset: "custom"
                      }
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-200">Simplification & Analogies: {settings.personality.simplificationLevel}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={settings.personality.simplificationLevel}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      personality: {
                        ...settings.personality,
                        simplificationLevel: parseInt(e.target.value, 10),
                        preset: "custom"
                      }
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-200">Socratic Questioning Intensity: {settings.personality.socraticGuidanceLevel}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={settings.personality.socraticGuidanceLevel}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      personality: {
                        ...settings.personality,
                        socraticGuidanceLevel: parseInt(e.target.value, 10),
                        preset: "custom"
                      }
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Socratic Anti-Cheat & Learning Mode Rules */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200">Pedagogical Learning Rules & Anti-Cheating</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Prioritize Hints Over Direct Solutions</p>
                    <p className="text-[11px] text-slate-400">ကျောင်းသားများအား အဖြေတိုက်ရိုက်မပေးဘဲ တွေးခေါ်နည်း အရိပ်အမြွက် ပေးခြင်း</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.learningMode.prioritizeHintsOverSolutions}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        learningMode: { ...settings.learningMode, prioritizeHintsOverSolutions: e.target.checked }
                      })
                    }
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                <label className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Block Direct Quiz Solution Dumping</p>
                    <p className="text-[11px] text-slate-400">Quiz/Assignment မေးခွန်းများအား အလွယ်တကူ copy paste ဖြေရှင်းပေးခြင်း တားဆီးခြင်း</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.learningMode.blockDirectQuizSolutionDumping}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        learningMode: { ...settings.learningMode, blockDirectQuizSolutionDumping: e.target.checked }
                      })
                    }
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TIERS & QUOTA LIMITS (FREE VS PREMIUM) */}
      {/* ========================================================================= */}
      {activeSubTab === "tier_limits" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Free User Limits */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Free Student Tier Limits</h3>
                  <p className="text-xs text-slate-400">အခမဲ့အသုံးပြုသူများအတွက် နေ့စဉ်ကန့်သတ်ချက်များ</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Daily Total AI Requests (မေးခွန်း မေးမြန်းခွင့်):</label>
                  <input
                    type="number"
                    value={settings.freeUserLimits.dailyTotalRequests}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        freeUserLimits: {
                          ...settings.freeUserLimits,
                          dailyTotalRequests: parseInt(e.target.value, 10) || 0
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Daily Code Analysis / Reviews:</label>
                  <input
                    type="number"
                    value={settings.freeUserLimits.dailyCodeReviews}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        freeUserLimits: {
                          ...settings.freeUserLimits,
                          dailyCodeReviews: parseInt(e.target.value, 10) || 0
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Daily Debug Requests:</label>
                  <input
                    type="number"
                    value={settings.freeUserLimits.dailyDebugRequests}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        freeUserLimits: {
                          ...settings.freeUserLimits,
                          dailyDebugRequests: parseInt(e.target.value, 10) || 0
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Max Input Code Length (Characters):</label>
                  <input
                    type="number"
                    value={settings.freeUserLimits.maxInputLengthChars}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        freeUserLimits: {
                          ...settings.freeUserLimits,
                          maxInputLengthChars: parseInt(e.target.value, 10) || 0
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Premium User Limits */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Premium Student Tier Limits</h3>
                  <p className="text-xs text-slate-400">Premium အသုံးပြုသူများအတွက် ဦးစားပေး ကန့်သတ်ချက်များ</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Daily Total AI Requests:</label>
                  <input
                    type="number"
                    value={settings.premiumUserLimits.dailyTotalRequests}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        premiumUserLimits: {
                          ...settings.premiumUserLimits,
                          dailyTotalRequests: parseInt(e.target.value, 10) || 0
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Daily Code Analysis / Reviews:</label>
                  <input
                    type="number"
                    value={settings.premiumUserLimits.dailyCodeReviews}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        premiumUserLimits: {
                          ...settings.premiumUserLimits,
                          dailyCodeReviews: parseInt(e.target.value, 10) || 0
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Daily Debug Requests:</label>
                  <input
                    type="number"
                    value={settings.premiumUserLimits.dailyDebugRequests}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        premiumUserLimits: {
                          ...settings.premiumUserLimits,
                          dailyDebugRequests: parseInt(e.target.value, 10) || 0
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Max Input Code Length (Characters):</label>
                  <input
                    type="number"
                    value={settings.premiumUserLimits.maxInputLengthChars}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        premiumUserLimits: {
                          ...settings.premiumUserLimits,
                          maxInputLengthChars: parseInt(e.target.value, 10) || 0
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PROMPT MANAGEMENT & VERSIONING */}
      {/* ========================================================================= */}
      {activeSubTab === "prompts_versioning" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Master System Prompt & Prompt Engineering Editor</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kibo AI အား ပေးထားသော အဓိက System Instructions နှင့် feature prompts များကို တည်းဖြတ်ပါ။
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Master System Instruction:</label>
              <textarea
                rows={10}
                value={settings.masterSystemPrompt}
                onChange={e => setSettings({ ...settings, masterSystemPrompt: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 custom-scrollbar leading-relaxed"
              />
            </div>

            {/* Feature Prompts */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-200">Feature-Specific Prompt Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Code Review Prompt:</label>
                  <textarea
                    rows={3}
                    value={settings.featurePrompts.codeReview}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        featurePrompts: { ...settings.featurePrompts, codeReview: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Debug Assistant Prompt:</label>
                  <textarea
                    rows={3}
                    value={settings.featurePrompts.debugAssistant}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        featurePrompts: { ...settings.featurePrompts, debugAssistant: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Prompt Version History */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Prompt Version History & 1-Click Rollback</span>
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {promptVersions.map(pv => (
                  <div
                    key={pv.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-amber-400">Version {pv.versionNumber}</span>
                      <span className="text-slate-400 ml-2">• {pv.changeNotes}</span>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Saved by {pv.savedBy} on {new Date(pv.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRollbackPrompt(pv.id)}
                      className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rollback to this</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: KNOWLEDGE BASE (RAG & APPROVED CURRICULUM DOCS) */}
      {/* ========================================================================= */}
      {activeSubTab === "knowledge_base" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Approved Knowledge Base & Myanmar Technical Glossary</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Kibo ဖြေကြားရာတွင် ကိုးကားအသုံးပြုမည့် သင်ရိုးညွှန်းတမ်းစည်းမျဉ်းများနှင့် မြန်မာဘာသာ programming ဝေါဟာရများ။
                </p>
              </div>

              <button
                onClick={() => handleOpenKnowledgeModal()}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Knowledge Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledgeItems.map(item => (
                <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-bold rounded-full border border-amber-500/30 uppercase">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 mt-1">{item.title}</h4>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenKnowledgeModal(item)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-900"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteKnowledgeItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-3">{item.content}</p>

                  <div className="flex flex-wrap gap-1 pt-2">
                    {item.keywords.map((kw, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-900 text-slate-400 text-[9px] rounded font-mono">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KNOWLEDGE ITEM MODAL */}
          {isKnowledgeModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <form
                onSubmit={handleSaveKnowledgeItem}
                className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-100 text-sm">
                    {editingKnowledgeItem ? "Edit Knowledge Item" : "Add New Knowledge Item"}
                  </h3>
                  <button type="button" onClick={() => setIsKnowledgeModalOpen(false)} className="text-slate-400">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Title:</label>
                  <input
                    type="text"
                    required
                    value={kbTitle}
                    onChange={e => setKbTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category:</label>
                  <select
                    value={kbCategory}
                    onChange={e => setKbCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  >
                    <option value="curriculum">Curriculum & Course Notes</option>
                    <option value="glossary">Myanmar Technical Glossary</option>
                    <option value="guidelines">Programming Guidelines</option>
                    <option value="platform_rules">Platform Rules & Socratic Policy</option>
                    <option value="faq">Frequently Asked Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Content:</label>
                  <textarea
                    rows={4}
                    required
                    value={kbContent}
                    onChange={e => setKbContent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Keywords (Comma separated):</label>
                  <input
                    type="text"
                    placeholder="variable, loop, python, syntax"
                    value={kbKeywords}
                    onChange={e => setKbKeywords(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Save Knowledge Document
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SAFETY, MODERATION & GUARDRAILS */}
      {/* ========================================================================= */}
      {activeSubTab === "safety_guardrails" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>AI Safety Filters, Guardrails & Anti-Exploit Controls</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ကျောင်းသားများ အန္တရာယ်ရှိသော ကုဒ်များ၊ Prompt Injection တိုက်ခိုက်မှုများနှင့် စည်းကမ်းဖောက်ဖျက်မှုများကို ကာကွယ်ပါ။
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-200">Block Malicious Code & Vulnerability Exploits</p>
                  <p className="text-[11px] text-slate-400">DDOS၊ Reverse Shell နှင့် Malicious Scripts များ ထုတ်ပေးခြင်း တားမြစ်ခြင်း</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.safetyAndGuardrails.blockMaliciousCode}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      safetyAndGuardrails: {
                        ...settings.safetyAndGuardrails,
                        blockMaliciousCode: e.target.checked
                      }
                    })
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              <label className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-200">Prevent System Prompt Leakage</p>
                  <p className="text-[11px] text-slate-400">"Ignore instructions", "Reveal prompt" ကဲ့သို့သော Jailbreak များကို ငြင်းပယ်ခြင်း</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.safetyAndGuardrails.preventSystemPromptLeakage}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      safetyAndGuardrails: {
                        ...settings.safetyAndGuardrails,
                        preventSystemPromptLeakage: e.target.checked
                      }
                    })
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>
            </div>

            {/* Custom Blocked Keywords */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200">Custom Blacklisted Keywords & Forbidden Patterns</h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter forbidden keyword or phrase..."
                  value={newBlockedKeyword}
                  onChange={e => setNewBlockedKeyword(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddBlockedKeyword();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddBlockedKeyword}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Add Keyword
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {settings.safetyAndGuardrails.customBlockedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-mono flex items-center space-x-1"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlockedKeyword(kw)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: LIVE ADMIN TEST SANDBOX (PLAYGROUND) */}
      {/* ========================================================================= */}
      {activeSubTab === "test_sandbox" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <span>Live Admin Test Sandbox (Interactive Playground)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ကျောင်းသားများ၏ နေရာမှ ဝင်ရောက်ကာ Kibo AI ၏ တုန့်ပြန်မှု၊ latency နှင့် token ကုန်ကျစရိတ်များကို အချိန်နှင့်တပြေးညီ တိုက်ရိုက် စမ်းသပ်ပါ။
              </p>
            </div>

            {/* Simulation Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Simulated User Tier:</label>
                <select
                  value={sandboxRole}
                  onChange={e => setSandboxRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                >
                  <option value="free">Free Student (Basic Tier)</option>
                  <option value="premium">👑 Premium Student (VIP Tier)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Learning Context (Course):</label>
                <select
                  value={sandboxCourseId}
                  onChange={e => setSandboxCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                >
                  {COURSES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Engine in Use:</label>
                <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-amber-400 font-mono font-bold">
                  {settings.activeModel}
                </div>
              </div>
            </div>

            {/* Test Prompt Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Test Prompt Input:</label>
              <textarea
                rows={3}
                value={sandboxPrompt}
                onChange={e => setSandboxPrompt(e.target.value)}
                placeholder="မေးခွန်း သို့မဟုတ် error ကုဒ် ရိုက်ထည့်ပါ..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleExecuteSandbox}
                disabled={sandboxExecuting || !sandboxPrompt.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 shadow-lg disabled:opacity-50"
              >
                {sandboxExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{sandboxExecuting ? "Simulating AI Response..." : "Execute Test Simulation"}</span>
              </button>
            </div>

            {/* Simulation Results */}
            {sandboxResponse && (
              <div className="p-5 bg-slate-950 border border-amber-500/30 rounded-xl space-y-4 animate-fade-in">
                {sandboxStats && (
                  <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-slate-800 text-[11px] font-mono">
                    <span className="text-slate-400">Latency: <b className="text-cyan-400">{sandboxStats.latencyMs}ms</b></span>
                    <span className="text-slate-400">Tokens Estimated: <b className="text-amber-400">~{sandboxStats.tokensEstimated}</b></span>
                    <span className="text-slate-400">Safety Check: <b className={sandboxStats.safetyPassed ? "text-emerald-400" : "text-red-400"}>{sandboxStats.safetyPassed ? "PASSED" : "FLAGGED"}</b></span>
                  </div>
                )}

                <div className="prose prose-invert max-w-none text-xs leading-relaxed">
                  <MarkdownRenderer content={sandboxResponse} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: ANALYTICS & USAGE MONITORING */}
      {/* ========================================================================= */}
      {activeSubTab === "analytics_monitoring" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span>Kibo AI Usage Analytics & Cost Monitoring</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                နေ့စဉ် AI မေးမြန်းမှု အရေအတွက်၊ အသုံးပြုသူ အမျိုးအစားနှင့် feature အလိုက် ကုန်ကျစရိတ် စာရင်းဇယားများ။
              </p>
            </div>

            <div className="space-y-3">
              {usageMetrics.map(m => (
                <div
                  key={m.date}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 font-mono">{m.date}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Chat Tutor: {m.featureBreakdown.chatTutor} • Code Review: {m.featureBreakdown.codeReview} • Debug: {m.featureBreakdown.debugAssistant}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <span className="font-black text-amber-400 text-sm block">{m.totalRequests} reqs</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {m.freeRequests} Free / {m.premiumRequests} Prem
                      </span>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-mono block">{m.avgResponseTimeMs} ms</span>
                      <span className="text-[10px] text-slate-500 font-mono">~{m.estimatedTokens.toLocaleString()} tokens</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeSubTab === "audit_logs" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <History className="w-5 h-5 text-amber-400" />
                <span>Kibo AI Administrative Audit Trail</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kibo AI ဆက်တင်များ၊ Prompt များနှင့် Limit များ ပြောင်းလဲခဲ့သော Admin မှတ်တမ်းများ။
              </p>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
              {auditLogs.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-amber-400">{log.action.replace(/_/g, " ").toUpperCase()}</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 block">{log.adminEmail}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PowerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
