/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCcw, 
  Download, 
  Filter, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Layers, 
  Clock, 
  Sparkles, 
  X,
  FileCheck2,
  Terminal,
  Activity,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  productionTestRunner, 
  TestSuiteSummary, 
  TestCaseResult, 
  TestArea, 
  TestType 
} from "../lib/productionTestRunner";
import { UserProfile } from "../types";

interface ProductionTestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
}

const ALL_AREAS: TestArea[] = [
  "Signup", "Login", "Logout", "Password Reset", "Profile", "UID Copy",
  "Courses", "Lessons", "Quiz", "Practice", "Kibo", "Premium",
  "Payment", "Telegram Access", "Admin Panel", "Notifications", "Data Consistency"
];

const ALL_TYPES: TestType[] = ["Positive", "Negative", "Boundary", "Permission", "Error"];

export default function ProductionTestSuiteModal({
  isOpen,
  onClose,
  currentUser
}: ProductionTestSuiteModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed">("all");
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [liveLogText, setLiveLogText] = useState<string>("Ready to execute full production test suite.");
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Auto-run tests on initial open if not run yet
  useEffect(() => {
    if (isOpen && !testSummary && !isRunning) {
      handleRunTests();
    }
  }, [isOpen]);

  const handleRunTests = async () => {
    setIsRunning(true);
    setProgressPercent(10);
    setLiveLogText("Initializing test execution environment...");
    
    // Smooth progress simulation
    const interval = setInterval(() => {
      setProgressPercent(prev => (prev < 90 ? prev + 15 : prev));
    }, 120);

    try {
      setLiveLogText("Running automated assertions across 17 test areas and 5 test types...");
      const summary = await productionTestRunner.runAllTests();
      clearInterval(interval);
      setProgressPercent(100);
      setTestSummary(summary);
      setLiveLogText(`✅ Completed ${summary.total} tests in ${summary.durationMs}ms. Pass rate: ${summary.passRate}%.`);
    } catch (err: any) {
      clearInterval(interval);
      setLiveLogText(`❌ Test execution halted with error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (!testSummary) return [];
    return testSummary.results.filter(r => {
      const matchArea = selectedArea === "all" || r.area === selectedArea;
      const matchType = selectedType === "all" || r.type === selectedType;
      const matchStatus = statusFilter === "all" || (statusFilter === "passed" ? r.passed : !r.passed);
      const matchSearch = 
        searchQuery === "" ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nameMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.expected.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.actual.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchArea && matchType && matchStatus && matchSearch;
    });
  }, [testSummary, selectedArea, selectedType, statusFilter, searchQuery]);

  const handleExportReport = () => {
    if (!testSummary) return;
    const reportData = {
      title: "Code Learn Myanmar - Production QA Test Report",
      generatedAt: new Date().toISOString(),
      testedBy: currentUser?.email || "Admin QA",
      summary: {
        total: testSummary.total,
        passed: testSummary.passed,
        failed: testSummary.failed,
        passRate: `${testSummary.passRate}%`,
        durationMs: testSummary.durationMs,
        isProductionReady: testSummary.isProductionReady
      },
      coverageByArea: testSummary.byArea,
      coverageByType: testSummary.byType,
      results: testSummary.results
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CLM_Production_QA_Report_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="clm-production-test-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qa-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="qa-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  CLM Production Testing Suite
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v2.8 Release QA
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                စနစ်တစ်ခုလုံးရှိ အရေးပါသော လုပ်ဆောင်ချက် ၁၇ မျိုးနှင့် စစ်ဆေးမှု ၅ မျိုး အားလုံးကို အလိုအလျောက် စစ်ဆေးသည့် စခန်း
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="run-all-tests-btn"
              onClick={handleRunTests}
              disabled={isRunning}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg transition-all ${
                isRunning 
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isRunning ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>စစ်ဆေးနေပါသည် ({progressPercent}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run All Tests (အားလုံး စစ်ဆေးရန်)</span>
                </>
              )}
            </button>

            {testSummary && (
              <button
                id="export-test-report-btn"
                onClick={handleExportReport}
                className="px-3.5 py-2.5 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Export QA Audit Report (JSON)"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Test Suite"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Progress Bar */}
        {isRunning && (
          <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Summary Ribbon & KPI Cards */}
        {testSummary && (
          <div className="p-4 sm:p-5 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Total Test Cases</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-white">{testSummary.total}</span>
                <span className="text-xs text-slate-500">tests</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
              <span className="text-xs text-emerald-400 font-medium block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passed
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-emerald-300">{testSummary.passed}</span>
                <span className="text-xs text-emerald-500/80">({testSummary.passRate}%)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40">
              <span className="text-xs text-rose-400 font-medium block flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Failed
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-rose-300">{testSummary.failed}</span>
                <span className="text-xs text-rose-500/80">failures</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Execution Time
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-cyan-300">{testSummary.durationMs}</span>
                <span className="text-xs text-slate-500">ms</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-center">
              <span className="text-xs text-slate-400 font-medium block">Release Status</span>
              <div className="mt-1">
                {testSummary.isProductionReady ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" /> READY FOR PROD
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <AlertTriangle className="w-3.5 h-3.5" /> PENDING FIXES
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="p-3.5 sm:p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-tests-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search test names, IDs, Myanmar descriptions..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            {/* Filter by Area */}
            <select
              id="filter-area-select"
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              aria-label="Filter test cases by application area"
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="all">All 17 Areas (အားလုံး)</option>
              {ALL_AREAS.map(a => (
                <option key={a} value={a}>Area: {a}</option>
              ))}
            </select>

            {/* Filter by Test Type */}
            <select
              id="filter-type-select"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              aria-label="Filter test cases by execution methodology"
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="all">All 5 Test Types</option>
              {ALL_TYPES.map(t => (
                <option key={t} value={t}>Type: {t}</option>
              ))}
            </select>

            {/* Filter by Status */}
            <div className="flex items-center rounded-lg border border-slate-700 p-0.5 bg-slate-950">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("passed")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === "passed" ? "bg-emerald-950 text-emerald-300 font-semibold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Passed
              </button>
              <button
                onClick={() => setStatusFilter("failed")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === "failed" ? "bg-rose-950 text-rose-300 font-semibold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Failed
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredResults.length}</strong> of {testSummary?.total || 0} assertions
          </div>
        </div>

        {/* Live Terminal Log Bar */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 text-xs font-mono text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="truncate">{liveLogText}</span>
        </div>

        {/* Test Matrix List / Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-900/50">
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileCheck2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-semibold text-slate-300">No test cases match the current filter.</p>
              <p className="text-xs text-slate-500 mt-1">Try selecting "All Areas" or resetting your search query.</p>
            </div>
          ) : (
            filteredResults.map(test => {
              const isExpanded = expandedTestId === test.id;
              return (
                <div
                  key={test.id}
                  id={`test-case-${test.id}`}
                  className={`border rounded-xl transition-all duration-200 ${
                    test.passed 
                      ? "bg-slate-900/80 border-slate-800 hover:border-slate-700" 
                      : "bg-rose-950/20 border-rose-800/50"
                  }`}
                >
                  {/* Test Summary Row */}
                  <div 
                    onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                    className="p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {test.passed ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-slate-400 font-medium">{test.id}</span>
                          <h4 className="text-sm font-semibold text-white truncate">{test.name}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{test.nameMm}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Area Tag */}
                      <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {test.area}
                      </span>

                      {/* Type Tag */}
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        test.type === "Positive" ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40" :
                        test.type === "Negative" ? "bg-rose-950/40 text-rose-300 border-rose-800/40" :
                        test.type === "Boundary" ? "bg-amber-950/40 text-amber-300 border-amber-800/40" :
                        test.type === "Permission" ? "bg-purple-950/40 text-purple-300 border-purple-800/40" :
                        "bg-cyan-950/40 text-cyan-300 border-cyan-800/40"
                      }`}>
                        {test.type}
                      </span>

                      <span className="font-mono text-xs text-slate-500 w-14 text-right">
                        {test.durationMs}ms
                      </span>

                      <button className="text-slate-400 hover:text-white p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Pane */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-slate-950/40 text-xs font-mono space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">Expected Behavior (မျှော်လင့်ထားသော ရလဒ်)</span>
                          <p className="text-slate-300 font-sans">{test.expected}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-emerald-400 font-semibold uppercase text-[10px] block mb-1">Actual Observed Result (လက်တွေ့ရရှိသော ရလဒ်)</span>
                          <p className="text-emerald-300 font-sans">{test.actual}</p>
                        </div>
                      </div>

                      {test.error && (
                        <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800 text-rose-300">
                          <span className="font-bold text-rose-400 block mb-1">Exception Trace:</span>
                          <pre className="overflow-x-auto whitespace-pre-wrap">{test.error}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Target Environment: Production Release Build (Antigravity Antifragile v2.8)</span>
          </div>

          <div className="flex items-center gap-3">
            <span>QA Pass Criteria: <strong>100% Critical Zero-Defect Pass</strong></span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Close Suite (ပိတ်ရန်)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
