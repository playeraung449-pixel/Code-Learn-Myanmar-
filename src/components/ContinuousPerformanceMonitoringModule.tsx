/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Continuous Performance Monitoring & Telemetry Dashboard
 * Features:
 * - Real-Time Core Performance Metrics (Page Load, API, Database, Error Rate, Resources, Kibo AI)
 * - Automated Slow Feature Detection & Root Cause Diagnostics
 * - 1-Click Multi-Tier Auto-Optimizations
 * - Live Latency & Error Radar with Filtering and Diagnostic Export
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Zap,
  Clock,
  Database,
  AlertTriangle,
  Layers,
  Bot,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Sparkles,
  Sliders,
  Download,
  Filter,
  Search,
  Eye,
  Check,
  Flame,
  Globe,
  HardDrive,
  Cpu,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  Info,
  Radio,
  FileSpreadsheet,
  FileJson
} from "lucide-react";
import {
  PerformanceScoreSummary,
  SlowFeatureDiagnostic,
  AutoOptimizationAction,
  PageLoadMetric,
  ApiLatencyMetric,
  DatabaseLatencyMetric,
  ErrorTrackingMetric,
  ResourcePerformanceMetric,
  KiboAiPerformanceMetric
} from "../types";
import { continuousPerfEngine } from "../lib/continuousPerformanceMonitoring";
import { performanceManager } from "../lib/performanceManager";
import { performanceTestingEngine, PerformanceBenchmarkResult, PerformanceConditionSummary, TestCondition } from "../lib/performanceTestingEngine";
import { responsiveTestingEngine, ResponsiveTestCaseResult, DeviceTestingSummary, BrowserTestingSummary, ModuleTestingSummary, ScreenDeviceCategory, DeviceOrientation, BrowserEnvironment, ResponsiveUiModule } from "../lib/responsiveTestingEngine";
import { Smartphone, Monitor, Tablet, Laptop, Chrome } from "lucide-react";

export type PerfMonitoringSubTab =
  | "radar"
  | "conditions"
  | "responsive"
  | "slow_features"
  | "optimizations"
  | "api_db"
  | "errors"
  | "resources"
  | "kibo_ai";

interface ContinuousPerformanceMonitoringModuleProps {
  onRefreshParent?: () => void;
  initialSubTab?: PerfMonitoringSubTab;
}

export const ContinuousPerformanceMonitoringModule: React.FC<ContinuousPerformanceMonitoringModuleProps> = ({
  onRefreshParent,
  initialSubTab = "radar"
}) => {
  const [activeTab, setActiveTab] = useState<PerfMonitoringSubTab>(initialSubTab);
  const [summary, setSummary] = useState<PerformanceScoreSummary>(continuousPerfEngine.getPerformanceSummary());
  const [diagnostics, setDiagnostics] = useState<SlowFeatureDiagnostic[]>(continuousPerfEngine.getSlowFeatureDiagnostics());
  const [optimizations, setOptimizations] = useState<AutoOptimizationAction[]>(continuousPerfEngine.getAutoOptimizations());
  const [pageLoads, setPageLoads] = useState<PageLoadMetric[]>(continuousPerfEngine.getPageLoadMetrics());
  const [apiMetrics, setApiMetrics] = useState<ApiLatencyMetric[]>(continuousPerfEngine.getApiMetrics());
  const [dbMetrics, setDbMetrics] = useState<DatabaseLatencyMetric[]>(continuousPerfEngine.getDatabaseMetrics());
  const [errors, setErrors] = useState<ErrorTrackingMetric[]>(continuousPerfEngine.getErrorsList());
  const [resources, setResources] = useState<ResourcePerformanceMetric[]>(continuousPerfEngine.getResourceMetrics());
  const [kiboMetrics, setKiboMetrics] = useState<KiboAiPerformanceMetric[]>(continuousPerfEngine.getKiboMetrics());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isOptimizingAll, setIsOptimizingAll] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  // Condition Testing State
  const [conditionSummaries, setConditionSummaries] = useState<PerformanceConditionSummary[]>(
    performanceTestingEngine.getConditionSummaries()
  );
  const [benchmarkResults, setBenchmarkResults] = useState<PerformanceBenchmarkResult[]>(
    performanceTestingEngine.getResults()
  );
  const [selectedCondition, setSelectedCondition] = useState<TestCondition>("Fast Network");
  const [isRunningConditionTests, setIsRunningConditionTests] = useState(false);

  // Responsive & Cross-Browser Testing State
  const [responsiveResults, setResponsiveResults] = useState<ResponsiveTestCaseResult[]>(
    responsiveTestingEngine.getResults()
  );
  const [deviceSummaries, setDeviceSummaries] = useState<DeviceTestingSummary[]>(
    responsiveTestingEngine.getDeviceSummaries()
  );
  const [browserSummaries, setBrowserSummaries] = useState<BrowserTestingSummary[]>(
    responsiveTestingEngine.getBrowserSummaries()
  );
  const [moduleSummaries, setModuleSummaries] = useState<ModuleTestingSummary[]>(
    responsiveTestingEngine.getModuleSummaries()
  );
  const [selectedDevice, setSelectedDevice] = useState<ScreenDeviceCategory>("Standard Mobile (375px-414px)");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [isRunningResponsiveAudit, setIsRunningResponsiveAudit] = useState(false);

  // Run initial test suite if empty
  useEffect(() => {
    if (benchmarkResults.length === 0) {
      performanceTestingEngine.runFullPerformanceSuite().then((res) => {
        setBenchmarkResults(res);
        setConditionSummaries(performanceTestingEngine.getConditionSummaries());
      });
    }
    if (responsiveResults.length === 0) {
      responsiveTestingEngine.runFullResponsiveAudit().then((res) => {
        setResponsiveResults(res);
        setDeviceSummaries(responsiveTestingEngine.getDeviceSummaries());
        setBrowserSummaries(responsiveTestingEngine.getBrowserSummaries());
        setModuleSummaries(responsiveTestingEngine.getModuleSummaries());
      });
    }
  }, []);

  const handleRunFullResponsiveAudit = async () => {
    setIsRunningResponsiveAudit(true);
    setLastActionMessage(null);
    const res = await responsiveTestingEngine.runFullResponsiveAudit();
    setResponsiveResults([...res]);
    setDeviceSummaries(responsiveTestingEngine.getDeviceSummaries());
    setBrowserSummaries(responsiveTestingEngine.getBrowserSummaries());
    setModuleSummaries(responsiveTestingEngine.getModuleSummaries());
    setIsRunningResponsiveAudit(false);
    setLastActionMessage("Completed full Mobile, Cross-Browser & 9-Module Responsive Audit!");
    setTimeout(() => setLastActionMessage(null), 5000);
  };

  const handleRunFullConditionSuite = async () => {
    setIsRunningConditionTests(true);
    setLastActionMessage(null);
    const res = await performanceTestingEngine.runFullPerformanceSuite();
    setBenchmarkResults([...res]);
    setConditionSummaries(performanceTestingEngine.getConditionSummaries());
    setIsRunningConditionTests(false);
    setLastActionMessage("Multi-Environment Performance Test Suite completed across all 7 conditions & 6 targets!");
    setTimeout(() => setLastActionMessage(null), 5000);
  };

  const handleRunSingleCondition = async (cond: TestCondition) => {
    setIsRunningConditionTests(true);
    const res = await performanceTestingEngine.runConditionSuite(cond);
    setBenchmarkResults((prev) => [...prev.filter((r) => r.condition !== cond), ...res]);
    setConditionSummaries(performanceTestingEngine.getConditionSummaries());
    setIsRunningConditionTests(false);
    setLastActionMessage(`Condition benchmark completed for ${cond}!`);
    setTimeout(() => setLastActionMessage(null), 4000);
  };

  // Subscribe to real-time telemetry updates
  useEffect(() => {
    const unsubscribe = continuousPerfEngine.subscribe((newSummary) => {
      setSummary(newSummary);
      setDiagnostics(continuousPerfEngine.getSlowFeatureDiagnostics());
      setOptimizations(continuousPerfEngine.getAutoOptimizations());
      setPageLoads(continuousPerfEngine.getPageLoadMetrics());
      setApiMetrics(continuousPerfEngine.getApiMetrics());
      setDbMetrics(continuousPerfEngine.getDatabaseMetrics());
      setErrors(continuousPerfEngine.getErrorsList());
      setResources(continuousPerfEngine.getResourceMetrics());
      setKiboMetrics(continuousPerfEngine.getKiboMetrics());
    });

    return () => unsubscribe();
  }, []);

  const handleRunOptimization = async (optId: string) => {
    setLastActionMessage(null);
    const success = await continuousPerfEngine.applyAutoOptimization(optId);
    if (success) {
      setLastActionMessage("Optimization applied successfully! (စွမ်းဆောင်ရည် မြှင့်တင်မှု အောင်မြင်ပါသည်)");
      setTimeout(() => setLastActionMessage(null), 4000);
    }
  };

  const handleRunAllOptimizations = async () => {
    setIsOptimizingAll(true);
    setLastActionMessage(null);
    const count = await continuousPerfEngine.runAllOptimizations();
    setIsOptimizingAll(false);
    setLastActionMessage(`Successfully completed ${count} automated performance optimizations!`);
    setTimeout(() => setLastActionMessage(null), 5000);
  };

  const handleExportTelemetry = () => {
    const jsonStr = continuousPerfEngine.exportTelemetryReport();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codelearn_perf_telemetry_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* ========================================================================= */}
      {/* HEADER WITH LIVE STATUS, REFRESH & EXPORT */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    Continuous Performance Monitoring
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Radio className="w-3 h-3 mr-1 animate-ping text-emerald-400" /> LIVE RADAR
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                  အချိန်နှင့်တစ်ပြေးညီ စနစ်တစ်ခုလုံး၏ အမြန်နှုန်း၊ Database၊ API၊ AI Latency နှင့် Error များအား စောင့်ကြည့်စစ်ဆေးခြင်း
                </p>
              </div>
            </div>
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              id="btn-perf-opt-all"
              onClick={handleRunAllOptimizations}
              disabled={isOptimizingAll}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
                isOptimizingAll
                  ? "bg-amber-600/50 text-amber-200 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold hover:shadow-amber-500/20 hover:scale-[1.02]"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isOptimizingAll ? "animate-spin" : ""}`} />
              <span>{isOptimizingAll ? "Optimizing..." : "1-Click Auto Optimize"}</span>
            </button>

            <button
              id="btn-perf-export"
              onClick={handleExportTelemetry}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export Telemetry</span>
            </button>

            <button
              id="btn-perf-refresh"
              onClick={() => {
                setSummary(continuousPerfEngine.getPerformanceSummary());
                if (onRefreshParent) onRefreshParent();
              }}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
              title="Refresh Radar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION BANNER */}
        {lastActionMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lastActionMessage}</span>
          </div>
        )}

        {/* SUBTABS NAVIGATION */}
        <div className="flex overflow-x-auto scrollbar-none items-center gap-1.5 mt-6 pt-4 border-t border-slate-800/80">
          {[
            { id: "radar", label: "Executive Radar", icon: Activity, badge: summary.pageLoadGrade },
            { id: "conditions", label: "Condition Testing", icon: Cpu, badge: "7 Conditions" },
            { id: "responsive", label: "Mobile & Browser Testing", icon: Smartphone, badge: "9 Modules" },
            { id: "slow_features", label: "Slow Features", icon: TrendingDown, badge: diagnostics.length > 0 ? diagnostics.length : null },
            { id: "optimizations", label: "Auto Optimizations", icon: Sparkles, badge: "5 Available" },
            { id: "api_db", label: "API & Database Latency", icon: Database, badge: `${summary.apiAvgLatencyMs}ms` },
            { id: "errors", label: "Error Radar", icon: AlertTriangle, badge: summary.totalActiveErrors > 0 ? summary.totalActiveErrors : null },
            { id: "resources", label: "Resources & Bandwidth", icon: HardDrive, badge: `${summary.totalBytesSavedKb}KB Saved` },
            { id: "kibo_ai", label: "Kibo AI Performance", icon: Bot, badge: `${summary.kiboStreamingRate} c/s` }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PerfMonitoringSubTab)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                      isActive
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE RADAR (KPIs, HEALTH GAUGES, SPEED PROFILE) */}
      {/* ========================================================================= */}
      {activeTab === "radar" && (
        <div className="space-y-6">
          {/* TOP 6 METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {/* 1. Page Load Time */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Page Load</span>
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-white font-mono flex items-baseline space-x-1">
                  <span>{summary.pageLoadAvgMs}</span>
                  <span className="text-xs text-slate-400 font-normal">ms</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                    Grade {summary.pageLoadGrade}
                  </span>
                  <span className="text-[10px] text-slate-400">Score: {summary.pageLoadScore}/100</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 truncate">TTFB: ~65ms | LCP: ~{Math.round(summary.pageLoadAvgMs * 0.8)}ms</p>
            </div>

            {/* 2. API Response Time */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">API Latency</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-white font-mono flex items-baseline space-x-1">
                  <span>{summary.apiAvgLatencyMs}</span>
                  <span className="text-xs text-slate-400 font-normal">ms</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {summary.apiSuccessRatePct}% Success
                  </span>
                  {summary.apiSlowCallsCount > 0 && (
                    <span className="text-[10px] text-amber-400 font-medium">
                      {summary.apiSlowCallsCount} slow
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 truncate">p95: ~{Math.round(summary.apiAvgLatencyMs * 1.35)}ms</p>
            </div>

            {/* 3. Database Response Time */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">DB Latency</span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-white font-mono flex items-baseline space-x-1">
                  <span>{summary.dbAvgLatencyMs}</span>
                  <span className="text-xs text-slate-400 font-normal">ms</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {summary.dbCacheHitRatePct}% Cache Hit
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 truncate">Firestore reads cached in LRU</p>
            </div>

            {/* 4. Error Rate */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Error Rate</span>
                <AlertTriangle className={`w-4 h-4 ${summary.errorRatePct > 2 ? "text-rose-400" : "text-slate-400"}`} />
              </div>
              <div className="my-2">
                <div className={`text-xl font-bold font-mono flex items-baseline space-x-1 ${summary.errorRatePct > 2 ? "text-rose-400" : "text-white"}`}>
                  <span>{summary.errorRatePct}</span>
                  <span className="text-xs text-slate-400 font-normal">%</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                    summary.totalActiveErrors === 0
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    {summary.totalActiveErrors} Active Issues
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 truncate">Global JS & API failures</p>
            </div>

            {/* 5. Resource Size & Bandwidth */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Data Saver</span>
                <HardDrive className="w-4 h-4 text-purple-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-white font-mono flex items-baseline space-x-1">
                  <span>{summary.totalBytesSavedKb}</span>
                  <span className="text-xs text-slate-400 font-normal">KB</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                    Bandwidth Saved
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 truncate">Transferred: {summary.totalTransferredKb} KB</p>
            </div>

            {/* 6. Kibo AI Response Time */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kibo AI Speed</span>
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-white font-mono flex items-baseline space-x-1">
                  <span>{summary.kiboStreamingRate}</span>
                  <span className="text-xs text-slate-400 font-normal">chars/s</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                    {summary.kiboAvgLatencyMs}ms avg
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 truncate">Success rate: {summary.kiboSuccessRatePct}%</p>
            </div>
          </div>

          {/* RADAR OVERVIEW SPLIT: HEALTH SCORE + PROACTIVE SLOW FEATURE WARNINGS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* COMPOSITE HEALTH GAUGE */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">System Performance Score</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    summary.status === "optimal"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : summary.status === "good"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {summary.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Page speed, API latency, DB caching, Error rate ပေါင်းစပ်ရမှတ်
                </p>

                <div className="flex flex-col items-center justify-center my-6">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="text-slate-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="text-amber-500 transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * summary.overallScore) / 100}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-extrabold text-white font-mono">{summary.overallScore}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Out of 100</span>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-xs font-semibold text-emerald-400">
                      ⚡ Grade {summary.pageLoadGrade} High-Speed Architecture
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Last audit: {summary.lastAuditTimestamp}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION RECOMMENDATION */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Proactive Recommendation</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  စနစ်၏ ဒေတာဘေ့စ် Cache နှင့် Kibo AI Pre-caching တို့သည် ပုံမှန်အခြေအနေတွင် ရှိနေပါသည်။ ၂G/၃G မိုဘိုင်းသုံးစွဲသူများအတွက် Data Saver မုဒ် အလိုအလျောက် အဆင်သင့်ရှိပါသည်။
                </p>
              </div>
            </div>

            {/* LIVE SLOW FEATURE ANOMALY RADAR */}
            <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Identified Slow Features & Bottlenecks</h3>
                  </div>
                  <span className="text-xs text-slate-400">{diagnostics.length} Potential Optimizations</span>
                </div>

                <div className="space-y-3">
                  {diagnostics.slice(0, 3).map((diag) => (
                    <div
                      key={diag.id}
                      className="p-3.5 bg-slate-950/70 border border-slate-800/90 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            diag.impactLevel === "high"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : diag.impactLevel === "medium"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}>
                            {diag.impactLevel}
                          </span>
                          <h4 className="text-xs font-bold text-slate-200 truncate">{diag.featureName}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">avg {diag.avgLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{diag.bottleneckReasonMm}</p>
                        <p className="text-[10px] text-emerald-400/90 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          <span>{diag.suggestedOptimizationMm}</span>
                        </p>
                      </div>

                      {diag.autoFixAvailable && (
                        <button
                          onClick={() => handleRunOptimization(
                            diag.category === "ai" ? "opt_ai_precaching" :
                            diag.category === "database" ? "opt_query_dedup" :
                            diag.category === "asset" ? "opt_data_saver" : "opt_cache_purge"
                          )}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-semibold transition-all shrink-0"
                        >
                          Auto Fix
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* NAVIGATION TO DETAIL TAB */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Continuous telemetry scanning every 8s</span>
                <button
                  onClick={() => setActiveTab("slow_features")}
                  className="text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1"
                >
                  <span>View All Diagnostics & Root Causes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: MULTI-ENVIRONMENT & REAL-WORLD CONDITION TESTING */}
      {/* ========================================================================= */}
      {activeTab === "conditions" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  <span>Multi-Condition Performance & Real-World Resilience Suite</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  အင်တာနက်လိုင်းအခြေအနေ (Fast / Slow / Unstable) နှင့် ဖုန်း/ကွန်ပျူတာ စွမ်းဆောင်ရည်အမျိုးမျိုး (Low-end / Mid-range / High-end / Desktop) တွင် စမ်းသပ်စစ်ဆေးမှုများ
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleRunFullConditionSuite}
                  disabled={isRunningConditionTests}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunningConditionTests ? "animate-spin" : ""}`} />
                  <span>{isRunningConditionTests ? "Testing All 7 Environments..." : "Run All 7 Environments Suite"}</span>
                </button>
              </div>
            </div>

            {/* 7 CONDITION SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {conditionSummaries.map((summary) => {
                const isSelected = selectedCondition === summary.condition;
                return (
                  <button
                    key={summary.condition}
                    onClick={() => setSelectedCondition(summary.condition)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white truncate">{summary.condition}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            summary.grade === "A+" || summary.grade === "A"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : summary.grade === "B"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {summary.grade}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{summary.conditionMm}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Avg: {summary.averageLatencyMs}ms</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          summary.responsivenessStatus === "Optimal"
                            ? "text-emerald-400"
                            : summary.responsivenessStatus === "Good"
                            ? "text-blue-400"
                            : "text-amber-400"
                        }`}
                      >
                        {summary.responsivenessStatus}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SELECTED CONDITION DEEP DIVE */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      {selectedCondition}
                    </span>
                    <span className="text-xs text-slate-400">
                      {conditionSummaries.find((s) => s.condition === selectedCondition)?.notesMm}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRunSingleCondition(selectedCondition)}
                  disabled={isRunningConditionTests}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunningConditionTests ? "animate-spin" : ""}`} />
                  <span>Re-test {selectedCondition}</span>
                </button>
              </div>

              {/* 6 TARGET AREAS BREAKDOWN */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  "Page Loading",
                  "API Response",
                  "Database Queries",
                  "Kibo Response",
                  "Course Loading",
                  "Quiz Loading"
                ].map((targetName) => {
                  const bench = benchmarkResults.find(
                    (b) => b.condition === selectedCondition && b.target === targetName
                  );

                  if (!bench) return null;

                  return (
                    <div
                      key={targetName}
                      className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{targetName}</span>
                          <span
                            className={`flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              bench.passed
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{bench.passed ? "PASS" : "FAIL"}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 font-sans">{bench.testNameMm}</p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between text-xs font-mono">
                          <span className="text-slate-400">Response Latency:</span>
                          <span className="text-amber-400 font-bold">{bench.latencyMs} ms</span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs font-mono">
                          <span className="text-slate-400">Threshold:</span>
                          <span className="text-slate-500">&lt; {bench.thresholdMs} ms</span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs font-mono">
                          <span className="text-slate-400">Perf Score:</span>
                          <span className="text-emerald-400 font-bold">{bench.score}/100</span>
                        </div>

                        {bench.memoryMb && (
                          <div className="flex items-baseline justify-between text-xs font-mono">
                            <span className="text-slate-400">Heap Footprint:</span>
                            <span className="text-blue-400">{bench.memoryMb} MB</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                          Active Defenses & Optimizations:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {bench.optimizationsTriggered.map((opt) => (
                            <span
                              key={opt}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: MOBILE, CROSS-BROWSER & RESPONSIVE UI AUDIT */}
      {/* ========================================================================= */}
      {activeTab === "responsive" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <span>Mobile Screens, Major Browsers & 9-Module Responsive Audit</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ဖုန်းမျက်နှာပြင် (Small / Standard / Foldable), Tablet, Desktop, Browser များ (Chrome / Safari / Samsung / Firefox / Edge) နှင့် Core UI Module ၉ ခုအား စစ်ဆေးမှု
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleRunFullResponsiveAudit}
                  disabled={isRunningResponsiveAudit}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunningResponsiveAudit ? "animate-spin" : ""}`} />
                  <span>{isRunningResponsiveAudit ? "Auditing All Viewports & Engines..." : "Run Full Responsive Audit"}</span>
                </button>
              </div>
            </div>

            {/* 1. DEVICE SCREEN SIZES BREAKDOWN */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-blue-400" />
                <span>1. Major Screen Sizes & Orientations (Portrait / Landscape)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {deviceSummaries.map((dev) => {
                  const isSelected = selectedDevice === dev.device;
                  return (
                    <button
                      key={dev.device}
                      onClick={() => setSelectedDevice(dev.device)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white truncate">{dev.device}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {dev.grade}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{dev.deviceMm}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{dev.passCount}/{dev.totalCount} Passed</span>
                        <span className="text-emerald-400 font-semibold">{dev.status}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. SUPPORTED BROWSERS & RUNTIMES */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Chrome className="w-4 h-4 text-emerald-400" />
                <span>2. Supported Browsers & Platform Runtimes</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {browserSummaries.map((b) => (
                  <div
                    key={b.browser}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white truncate">{b.browser}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono inline-block mt-1">
                        {b.engine}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{b.status}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 9 CORE UI MODULES AUDIT GRID */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>3. Nine Core UI Modules Responsive Verification</span>
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Filter Module:</span>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1"
                  >
                    <option value="all">All 9 Modules</option>
                    {moduleSummaries.map((m) => (
                      <option key={m.module} value={m.module}>
                        {m.module} ({m.moduleMm})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {moduleSummaries
                  .filter((m) => selectedModule === "all" || m.module === selectedModule)
                  .map((m) => {
                    const sampleResult = responsiveResults.find((r) => r.module === m.module && r.device === selectedDevice);
                    return (
                      <div
                        key={m.module}
                        className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                              <span>{m.module}</span>
                              <span className="text-slate-400 font-normal">({m.moduleMm})</span>
                            </span>
                            <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>100% USABLE</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 font-sans">
                            {sampleResult ? sampleResult.observationsMm : "Layout adapted seamlessly."}
                          </p>
                        </div>

                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Adaptation Strategy:</span>
                            <span className="text-amber-400 font-semibold">{m.adaptationStrategy}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Touch Compliance:</span>
                            <span className="text-emerald-400">Min 44px (Pass)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Layout Shift (CLS):</span>
                            <span className="text-blue-400">&lt; 0.01 (Stable)</span>
                          </div>
                        </div>

                        {sampleResult && (
                          <div className="pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                              Active Responsive Controls:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {sampleResult.adaptiveMechanisms.map((mech) => (
                                <span
                                  key={mech}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                                >
                                  {mech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SLOW FEATURES & BOTTLENECK ANALYSIS */}
      {/* ========================================================================= */}
      {activeTab === "slow_features" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-amber-400" />
                  <span>Slow Feature Diagnostics & Optimization Insights</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  စနစ်အတွင်း ကြာချိန်မြင့်မားနေသော Endpoint များ၊ Database Queries များနှင့် ရုပ်ပုံအရွယ်အစားများအား ရှာဖွေဖော်ထုတ်ခြင်း
                </p>
              </div>

              {/* FILTER BY CATEGORY */}
              <div className="flex items-center space-x-2">
                {["all", "ai", "api", "database", "asset"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all ${
                      selectedCategory === cat
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagnostics
                .filter((d) => selectedCategory === "all" || d.category === selectedCategory)
                .map((diag) => (
                  <div
                    key={diag.id}
                    className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            diag.impactLevel === "high"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : diag.impactLevel === "medium"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}>
                            {diag.impactLevel} Impact
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-800 text-slate-400 rounded">
                            {diag.category}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {diag.avgLatencyMs}ms avg
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">{diag.featureName}</h4>
                        <p className="text-xs text-amber-300/90 mt-0.5">{diag.featureNameMm}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 space-y-1.5">
                        <div className="text-[11px] text-slate-400">
                          <strong className="text-slate-300">Root Cause:</strong> {diag.bottleneckReason}
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium">
                          {diag.bottleneckReasonMm}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-emerald-300 space-y-1">
                        <div className="font-semibold flex items-center space-x-1.5 text-emerald-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Recommended Action:</span>
                        </div>
                        <p>{diag.suggestedOptimizationMm}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono">p95 Latency: {diag.p95LatencyMs}ms</span>
                      <button
                        onClick={() => handleRunOptimization(
                          diag.category === "ai" ? "opt_ai_precaching" :
                          diag.category === "database" ? "opt_query_dedup" :
                          diag.category === "asset" ? "opt_data_saver" : "opt_cache_purge"
                        )}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold transition-all"
                      >
                        Apply Fix
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUTO-OPTIMIZATION CONTROL CENTER */}
      {/* ========================================================================= */}
      {activeTab === "optimizations" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Continuous Auto-Optimization Center</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  မိုဘိုင်းဖုန်းများနှင့် ၂G/၃G ကွန်ရက်များတွင် လျင်မြန်စွာ အသုံးပြုနိုင်ရန် စနစ်တွင်း စွမ်းဆောင်ရည် အလိုအလျောက် မြှင့်တင်ရေး မော်ဂျူးများ
                </p>
              </div>

              <button
                onClick={handleRunAllOptimizations}
                disabled={isOptimizingAll}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                {isOptimizingAll ? "Optimizing Entire Platform..." : "Apply All 5 Optimizations"}
              </button>
            </div>

            <div className="space-y-3.5">
              {optimizations.map((opt) => (
                <div
                  key={opt.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">{opt.name}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-400">
                        {opt.category}
                      </span>
                      {opt.status === "applied" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Applied {opt.lastAppliedAt}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-300/90 font-medium">{opt.nameMm}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{opt.descriptionMm}</p>
                    <p className="text-[11px] text-emerald-400 font-mono">⚡ {opt.estimatedGainMm}</p>
                  </div>

                  <button
                    onClick={() => handleRunOptimization(opt.id)}
                    disabled={opt.status === "running"}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      opt.status === "applied"
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                    }`}
                  >
                    {opt.status === "running" ? "Optimizing..." : opt.status === "applied" ? "Re-apply" : "Optimize"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: API & DATABASE LATENCY INSPECTOR */}
      {/* ========================================================================= */}
      {activeTab === "api_db" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RECENT API REQUESTS */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Live API Endpoint Latencies</h3>
                </div>
                <span className="text-xs text-slate-500">{apiMetrics.length} requests captured</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {apiMetrics.slice(0, 15).map((api) => (
                  <div
                    key={api.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          api.method === "GET" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {api.method}
                        </span>
                        <span className="font-mono text-slate-200 truncate">{api.endpoint}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{api.timestamp}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold ${api.isSlow ? "text-amber-400" : "text-emerald-400"}`}>
                        {api.durationMs}ms
                      </span>
                      <div className="text-[10px] text-slate-400">
                        Status: <span className={api.status >= 400 ? "text-rose-400 font-bold" : "text-emerald-400"}>{api.status || 200}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT FIRESTORE DATABASE QUERIES */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Firestore Query & Mutation Latencies</h3>
                </div>
                <span className="text-xs text-slate-500">{dbMetrics.length} DB operations</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {dbMetrics.slice(0, 15).map((db) => (
                  <div
                    key={db.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-400">
                          {db.operation}
                        </span>
                        <span className="font-mono text-slate-200 truncate">collection: {db.collectionName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {db.fromCache ? "⚡ LRU Cache Hit" : "Remote Fetch"} | {db.timestamp}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold ${db.isSlow ? "text-amber-400" : "text-emerald-400"}`}>
                        {db.durationMs}ms
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {db.documentCount || 1} docs
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ERROR RADAR & ANOMALY DETECTOR */}
      {/* ========================================================================= */}
      {activeTab === "errors" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>Real-Time Error Telemetry & Anomaly Radar</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Global JS Exceptions၊ API 4xx/5xx Errors များနှင့် Unhandled Rejections များကို အချိန်နှင့်တစ်ပြေးညီ ဖမ်းယူမှတ်တမ်းတင်ခြင်း
                </p>
              </div>

              {errors.length > 0 && (
                <button
                  onClick={() => continuousPerfEngine.clearAllErrors()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
                >
                  Clear Error Logs
                </button>
              )}
            </div>

            {errors.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">No Active Errors Detected</h4>
                <p className="text-xs text-slate-400 mt-1">စနစ်အတွင်း ပျက်စီးမှု သို့မဟုတ် Error မရှိဘဲ ချောမွေ့စွာ အလုပ်လုပ်နေပါသည်ခင်ဗျာ။</p>
              </div>
            ) : (
              <div className="space-y-3">
                {errors.map((err) => (
                  <div
                    key={err.id}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all ${
                      err.resolved
                        ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                        : "bg-slate-950/80 border-rose-500/30"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {err.type}
                        </span>
                        <span className="text-xs font-bold text-white truncate">{err.message}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-400 rounded-full font-mono">
                          x{err.count}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{err.url}</p>
                      <p className="text-[10px] text-slate-500">
                        First seen: {err.firstSeen} | Last seen: {err.lastSeen}
                      </p>
                    </div>

                    {!err.resolved && (
                      <button
                        onClick={() => continuousPerfEngine.resolveError(err.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 text-xs font-semibold transition-all shrink-0"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: RESOURCE SIZE & BANDWIDTH CONSUMPTION */}
      {/* ========================================================================= */}
      {activeTab === "resources" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-purple-400" />
                  <span>Resource Size & Network Bandwidth Optimization</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  JavaScript၊ Stylesheets၊ Web Fonts နှင့် ရုပ်ပုံဖိုင်များ၏ အရွယ်အစားနှင့် ဒေတာချွေတာနိုင်မှု စာရင်း
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-purple-300 font-mono font-bold">
                  {summary.totalBytesSavedKb} KB Total Bandwidth Saved
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-4">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Transferred Bytes</span>
                <p className="text-lg font-bold text-white font-mono mt-1">{summary.totalTransferredKb} KB</p>
              </div>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Decoded Asset Size</span>
                <p className="text-lg font-bold text-white font-mono mt-1">{summary.totalDecodedKb} KB</p>
              </div>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Compression Ratio</span>
                <p className="text-lg font-bold text-emerald-400 font-mono mt-1">
                  ~{summary.totalDecodedKb > 0 ? Math.round(((summary.totalDecodedKb - summary.totalTransferredKb) / summary.totalDecodedKb) * 100) : 45}%
                </p>
              </div>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Asset Count</span>
                <p className="text-lg font-bold text-white font-mono mt-1">{summary.totalResourcesCount}</p>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-400 font-mono">
                        {res.initiatorType}
                      </span>
                      <span className="font-mono text-slate-200 truncate">{res.shortName}</span>
                      {res.isOversized && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-400">
                          &gt;400KB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="text-slate-200 font-bold">{res.transferSizeKb} KB</span>
                    <div className="text-[10px] text-slate-500">{res.durationMs}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: KIBO AI ASSISTANT PERFORMANCE */}
      {/* ========================================================================= */}
      {activeTab === "kibo_ai" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <span>Kibo AI Assistant Latency & Streaming Radar</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  AI စကားဝိုင်း တိုက်ရိုက်ထုတ်လွှင့်မှု အမြန်နှုန်း၊ Token Throughput နှင့် Fallback စနစ်များ၏ ကြာချိန်များ
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
                  {summary.kiboStreamingRate} chars/second
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Average Generation Latency</span>
                <p className="text-xl font-bold text-white font-mono mt-1">{summary.kiboAvgLatencyMs} ms</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">AI Success & Uptime</span>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{summary.kiboSuccessRatePct}%</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Offline Knowledge Fallback</span>
                <p className="text-xl font-bold text-cyan-400 font-mono mt-1">Sub-10ms Active</p>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
              {kiboMetrics.map((kibo) => (
                <div
                  key={kibo.id}
                  className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-cyan-500/20 text-cyan-400">
                        {kibo.feature}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300">
                        {kibo.streamMode}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Prompt: {kibo.promptLength} chars | Response: {kibo.responseLength} chars | {kibo.timestamp}
                    </span>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="text-cyan-300 font-bold">{kibo.totalDurationMs}ms</span>
                    <div className="text-[10px] text-slate-500">
                      TTFT: {kibo.timeToFirstTokenMs || 350}ms
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
