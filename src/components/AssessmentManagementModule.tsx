import React, { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  Archive, 
  Clock, 
  Search, 
  Filter, 
  Save, 
  RefreshCw, 
  Crown, 
  Tag, 
  FileCode, 
  Send, 
  AlertTriangle, 
  ShieldAlert, 
  CheckSquare, 
  Sliders, 
  Layers, 
  BarChart2, 
  Check, 
  X, 
  ArrowRight, 
  ExternalLink, 
  Code, 
  FileText, 
  UploadCloud, 
  Link as LinkIcon, 
  GraduationCap, 
  TrendingUp, 
  Sparkles, 
  Play, 
  ListOrdered,
  ChevronDown,
  ChevronRight,
  UserCheck,
  History,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { 
  AdminQuiz, 
  AdminAssignment, 
  AdminProject, 
  StudentAssessmentSubmission, 
  AdminQuestion, 
  QuestionType, 
  QuestionDifficulty,
  ProjectRubricCriterion,
  UserProfile,
  Course
} from "../types";
import { 
  getAdminQuizzesFromDb, 
  saveAdminQuizToDb, 
  deleteAdminQuizFromDb,
  getAdminAssignmentsFromDb,
  saveAdminAssignmentToDb,
  deleteAdminAssignmentFromDb,
  getAdminProjectsFromDb,
  saveAdminProjectToDb,
  deleteAdminProjectFromDb,
  getStudentSubmissionsFromDb,
  saveStudentSubmissionToDb,
  evaluateStudentSubmissionInDb
} from "../lib/db";

interface AssessmentManagementModuleProps {
  adminUser: UserProfile;
  courses?: Course[];
  initialSubTab?: "quizzes" | "assignments" | "projects" | "submissions" | "analytics";
  onRefreshData?: () => Promise<void>;
}

export default function AssessmentManagementModule({
  adminUser,
  courses = [],
  initialSubTab = "quizzes",
  onRefreshData
}: AssessmentManagementModuleProps) {
  // Main Sub-tabs
  const [subTab, setSubTab] = useState<"quizzes" | "assignments" | "projects" | "submissions" | "analytics">(initialSubTab);

  // Synchronize when initialSubTab changes from parent
  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Data States
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [assignments, setAssignments] = useState<AdminAssignment[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [submissions, setSubmissions] = useState<StudentAssessmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [accessFilter, setAccessFilter] = useState<string>("all");

  // Notifications
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load All Assessment Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [qList, aList, pList, sList] = await Promise.all([
        getAdminQuizzesFromDb(),
        getAdminAssignmentsFromDb(),
        getAdminProjectsFromDb(),
        getStudentSubmissionsFromDb()
      ]);
      setQuizzes(qList);
      setAssignments(aList);
      setProjects(pList);
      setSubmissions(sList);
    } catch (e) {
      console.error("Failed to load assessments:", e);
      showToast("ဒေတာများ ရယူရာတွင် ချို့ယွင်းချက်ရှိပါသည်", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------------------------------------
  // QUIZ STATE & HANDLERS
  // -------------------------------------------------------------
  const [editingQuiz, setEditingQuiz] = useState<AdminQuiz | null>(null);
  const [isNewQuiz, setIsNewQuiz] = useState(false);
  const [quizModalTab, setQuizModalTab] = useState<"general" | "questions" | "settings" | "access">("general");
  
  // Question sub-editor inside Quiz
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  
  // Live Quiz Tester Modal
  const [testingQuiz, setTestingQuiz] = useState<AdminQuiz | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, any>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);

  const handleOpenCreateQuiz = () => {
    const newQ: AdminQuiz = {
      id: `quiz_${Date.now()}`,
      title: "",
      slug: "",
      description: "",
      category: "basics",
      status: "Draft",
      accessConfig: { accessType: "free" },
      settings: {
        timeLimitMinutes: 15,
        passingScorePercent: 80,
        maxAttempts: 3,
        randomQuestionOrder: true,
        showCorrectAnswers: true,
        showExplanation: true,
        xpReward: 100,
        coinsReward: 30
      },
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingQuiz(newQ);
    setIsNewQuiz(true);
    setQuizModalTab("general");
  };

  const handleSaveQuiz = async () => {
    if (!editingQuiz) return;
    if (!editingQuiz.title.trim()) {
      showToast("Quiz Title ထည့်သွင်းပေးပါ", "error");
      return;
    }
    if (editingQuiz.questions.length === 0) {
      showToast("အနည်းဆုံး မေးခွန်း ၁ ခု ထည့်သွင်းပေးပါ", "error");
      return;
    }

    try {
      await saveAdminQuizToDb(editingQuiz);
      showToast(`Quiz "${editingQuiz.title}" ကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ`);
      setEditingQuiz(null);
      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (e) {
      showToast("သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်", "error");
    }
  };

  const handleDuplicateQuiz = async (quiz: AdminQuiz) => {
    const duplicated: AdminQuiz = {
      ...quiz,
      id: `quiz_${Date.now()}`,
      title: `${quiz.title} (Copy)`,
      slug: `${quiz.slug}-copy`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveAdminQuizToDb(duplicated);
    showToast(`Quiz "${quiz.title}" ကို ကူးယူဖန်တီးပြီးပါပြီ`);
    await loadData();
  };

  const handleTogglePublishQuiz = async (quiz: AdminQuiz) => {
    const nextStatus = quiz.status === "Published" ? "Unpublished" : "Published";
    const updated: AdminQuiz = { ...quiz, status: nextStatus };
    await saveAdminQuizToDb(updated);
    showToast(`Quiz Status ကို "${nextStatus}" သို့ ပြောင်းလဲပြီးပါပြီ`);
    await loadData();
  };

  const handleArchiveQuiz = async (quiz: AdminQuiz) => {
    const updated: AdminQuiz = { ...quiz, status: "Archived" };
    await saveAdminQuizToDb(updated);
    showToast(`Quiz "${quiz.title}" ကို သိမ်းဆည်းမှတ်တမ်းတင် (Archive) လိုက်ပါပြီ`);
    await loadData();
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm("ဤ Quiz အား အပြီးအပိုင် ဖျက်ပစ်ရန် သေချာပါသလား။")) {
      await deleteAdminQuizFromDb(quizId);
      showToast("Quiz အား ဖျက်ပစ်ပြီးပါပြီ");
      await loadData();
    }
  };

  // -------------------------------------------------------------
  // ASSIGNMENT STATE & HANDLERS
  // -------------------------------------------------------------
  const [editingAssignment, setEditingAssignment] = useState<AdminAssignment | null>(null);
  const [isNewAssignment, setIsNewAssignment] = useState(false);

  const handleOpenCreateAssignment = () => {
    const newA: AdminAssignment = {
      id: `assign_${Date.now()}`,
      title: "",
      type: "coding_exercise",
      description: "",
      instructions: [""],
      difficulty: "Intermediate",
      maxScore: 100,
      passingScore: 75,
      xpReward: 120,
      coinsReward: 40,
      submissionType: "code",
      accessConfig: { accessType: "free" },
      status: "Draft",
      starterCode: "// Write your code here\n",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingAssignment(newA);
    setIsNewAssignment(true);
  };

  const handleSaveAssignment = async () => {
    if (!editingAssignment) return;
    if (!editingAssignment.title.trim()) {
      showToast("Assignment Title ထည့်သွင်းပေးပါ", "error");
      return;
    }
    try {
      await saveAdminAssignmentToDb(editingAssignment);
      showToast(`Assignment "${editingAssignment.title}" ကို သိမ်းဆည်းပြီးပါပြီ`);
      setEditingAssignment(null);
      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (e) {
      showToast("သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်", "error");
    }
  };

  const handleDuplicateAssignment = async (assign: AdminAssignment) => {
    const duplicated: AdminAssignment = {
      ...assign,
      id: `assign_${Date.now()}`,
      title: `${assign.title} (Copy)`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveAdminAssignmentToDb(duplicated);
    showToast(`Assignment "${assign.title}" ကို ကူးယူပြီးပါပြီ`);
    await loadData();
  };

  const handleDeleteAssignment = async (assignId: string) => {
    if (window.confirm("ဤ Assignment အား ဖျက်ပစ်ရန် သေချာပါသလား။")) {
      await deleteAdminAssignmentFromDb(assignId);
      showToast("Assignment အား ဖျက်ပစ်ပြီးပါပြီ");
      await loadData();
    }
  };

  // -------------------------------------------------------------
  // PROJECT STATE & HANDLERS
  // -------------------------------------------------------------
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [projectModalTab, setProjectModalTab] = useState<"info" | "requirements" | "resources" | "rubric">("info");

  const handleOpenCreateProject = () => {
    const newP: AdminProject = {
      id: `proj_${Date.now()}`,
      title: "",
      description: "",
      objectives: [""],
      requirements: [""],
      difficulty: "Intermediate",
      technologies: ["React", "Tailwind CSS"],
      starterResources: [],
      submissionRequirements: ["Live Demo URL", "GitHub Repository Link"],
      evaluationMode: "hybrid",
      grading: {
        maxScore: 100,
        passingScore: 75,
        xpReward: 300,
        coinsReward: 100,
        rubric: [
          {
            id: `rubric_1`,
            category: "Functionality",
            title: "Core Functionality & Logic",
            description: "Working features and state integrity",
            maxPoints: 40
          },
          {
            id: `rubric_2`,
            category: "Code Quality",
            title: "Clean Code & Modularity",
            description: "Proper formatting, clean components, error handling",
            maxPoints: 30
          },
          {
            id: `rubric_3`,
            category: "UI / UX",
            title: "Interface & Usability",
            description: "Responsive layout, accessibility, feedback states",
            maxPoints: 30
          }
        ]
      },
      accessConfig: { accessType: "free" },
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingProject(newP);
    setIsNewProject(true);
    setProjectModalTab("info");
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    if (!editingProject.title.trim()) {
      showToast("Project Title ထည့်သွင်းပေးပါ", "error");
      return;
    }
    try {
      await saveAdminProjectToDb(editingProject);
      showToast(`Project "${editingProject.title}" ကို သိမ်းဆည်းပြီးပါပြီ`);
      setEditingProject(null);
      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (e) {
      showToast("သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်", "error");
    }
  };

  const handleDeleteProject = async (projId: string) => {
    if (window.confirm("ဤ Project အား ဖျက်ပစ်ရန် သေချာပါသလား။")) {
      await deleteAdminProjectFromDb(projId);
      showToast("Project အား ဖျက်ပစ်ပြီးပါပြီ");
      await loadData();
    }
  };

  // -------------------------------------------------------------
  // SUBMISSION EVALUATION & GRADING MODAL
  // -------------------------------------------------------------
  const [selectedSubmission, setSelectedSubmission] = useState<StudentAssessmentSubmission | null>(null);
  const [evalCriterionScores, setEvalCriterionScores] = useState<Record<string, number>>({});
  const [evalWrittenFeedback, setEvalWrittenFeedback] = useState("");
  const [evalSuggestions, setEvalSuggestions] = useState<string[]>([""]);
  const [evalPassed, setEvalPassed] = useState<boolean>(true);
  const [evalStatus, setEvalStatus] = useState<StudentAssessmentSubmission["status"]>("passed");
  const [evalResubmitAllowed, setEvalResubmitAllowed] = useState(true);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  // Initialize evaluation form when a submission is selected
  const handleOpenEvaluationModal = (sub: StudentAssessmentSubmission) => {
    setSelectedSubmission(sub);
    setEvalWrittenFeedback(sub.evaluation?.writtenFeedback || "");
    setEvalSuggestions(sub.evaluation?.improvementSuggestions?.length ? sub.evaluation.improvementSuggestions : [""]);
    setEvalStatus(sub.status === "pending" || sub.status === "submitted" ? "under_review" : sub.status);
    setEvalPassed(sub.evaluation?.passed !== undefined ? sub.evaluation.passed : true);
    setEvalResubmitAllowed(sub.resubmissionAllowed !== undefined ? sub.resubmissionAllowed : true);

    // Initialize criterion scores based on matched project rubric or default
    if (sub.itemType === "project") {
      const proj = projects.find(p => p.id === sub.itemId);
      const initialScores: Record<string, number> = {};
      if (proj && proj.grading?.rubric) {
        proj.grading.rubric.forEach(r => {
          initialScores[r.id] = sub.evaluation?.criterionScores?.[r.id] ?? Math.round(r.maxPoints * 0.85);
        });
      } else {
        initialScores["general"] = sub.evaluation?.totalScore ?? 80;
      }
      setEvalCriterionScores(initialScores);
    } else {
      setEvalCriterionScores(sub.evaluation?.criterionScores || { "score": sub.evaluation?.totalScore || 85 });
    }
  };

  const calculatedTotalScore = useMemo(() => {
    if (!selectedSubmission) return 0;
    if (selectedSubmission.itemType === "project") {
      return Object.values(evalCriterionScores).reduce<number>((a, b) => a + Number(b || 0), 0);
    }
    return Object.values(evalCriterionScores)[0] || 0;
  }, [evalCriterionScores, selectedSubmission]);

  const handleSaveEvaluation = async () => {
    if (!selectedSubmission) return;
    setIsSubmittingGrade(true);

    try {
      const totalScore = calculatedTotalScore;
      const maxScore = selectedSubmission.itemType === "project" 
        ? (projects.find(p => p.id === selectedSubmission.itemId)?.grading.maxScore || 100)
        : (assignments.find(a => a.id === selectedSubmission.itemId)?.maxScore || 100);

      const passThreshold = selectedSubmission.itemType === "project"
        ? (projects.find(p => p.id === selectedSubmission.itemId)?.grading.passingScore || 70)
        : (assignments.find(a => a.id === selectedSubmission.itemId)?.passingScore || 70);

      const isPass = totalScore >= passThreshold;
      const finalStatus = isPass ? "passed" : (evalStatus === "needs_improvement" ? "needs_improvement" : "failed");

      const xpToAward = isPass 
        ? (selectedSubmission.itemType === "project" 
            ? (projects.find(p => p.id === selectedSubmission.itemId)?.grading.xpReward || 300)
            : (assignments.find(a => a.id === selectedSubmission.itemId)?.xpReward || 120))
        : 20;

      const evalData = {
        evaluatedBy: adminUser.email || "Admin Instructor",
        evaluatedAt: new Date().toISOString(),
        totalScore,
        maxScore,
        passed: isPass,
        xpAwarded: xpToAward,
        criterionScores: evalCriterionScores,
        writtenFeedback: evalWrittenFeedback.trim() || (isPass ? "အလွန်ကောင်းမွန်သော တင်သွင်းချက် ဖြစ်ပါသည်။" : "အချို့သော အချက်များကို ပြန်လည်ပြင်ဆင်ရန် လိုအပ်ပါသည်။"),
        improvementSuggestions: evalSuggestions.filter(s => s.trim() !== "")
      };

      await evaluateStudentSubmissionInDb(selectedSubmission.id, evalData, finalStatus, evalResubmitAllowed);
      showToast(`ကျောင်းသား ${selectedSubmission.userName} ၏ အမှတ်ပေးမှု အောင်မြင်ပါသည်`);
      setSelectedSubmission(null);
      await loadData();
    } catch (e) {
      showToast("အမှတ်ပေးရာတွင် အမှားဖြစ်ပေါ်ပါသည်", "error");
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  // -------------------------------------------------------------
  // ANALYTICS COMPUTATIONS
  // -------------------------------------------------------------
  const analyticsSummary = useMemo(() => {
    const totalQuizAttempts = submissions.filter(s => s.itemType === "quiz").length;
    const passedQuizzes = submissions.filter(s => s.itemType === "quiz" && (s.status === "passed" || s.quizResult?.passed)).length;
    const quizPassRate = totalQuizAttempts > 0 ? Math.round((passedQuizzes / totalQuizAttempts) * 100) : 88;
    const quizFailRate = totalQuizAttempts > 0 ? 100 - quizPassRate : 12;

    const quizScores = submissions.filter(s => s.itemType === "quiz" && s.quizResult).map(s => s.quizResult!.percentage);
    const avgQuizScore = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 86;

    const totalAssignments = assignments.length;
    const totalProjects = projects.length;
    const pendingReviews = submissions.filter(s => s.status === "submitted" || s.status === "under_review").length;
    const flaggedAntiCheat = submissions.filter(s => s.antiCheatAnalysis?.isFlagged).length;

    return {
      totalQuizAttempts,
      passedQuizzes,
      quizPassRate,
      quizFailRate,
      avgQuizScore,
      totalAssignments,
      totalProjects,
      pendingReviews,
      flaggedAntiCheat
    };
  }, [submissions, assignments, projects]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-medium border animate-slide-in ${
          notification.type === "success" 
            ? "bg-emerald-950/95 border-emerald-500/50 text-emerald-200" 
            : notification.type === "error" 
            ? "bg-rose-950/95 border-rose-500/50 text-rose-200" 
            : "bg-blue-950/95 border-blue-500/50 text-blue-200"
        }`}>
          {notification.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {notification.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {notification.type === "info" && <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header & Sub-navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Assessment & Evaluation Center
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    Admin Portal
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Quizzes, Assignments, Coding Projects နှင့် ကျောင်းသားများ၏ တင်သွင်းချက်များကို အမှတ်ပေး/စစ်ဆေးစီမံနိုင်ပါသည်။
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center space-x-2 mt-6 pt-5 border-t border-slate-800/80 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSubTab("quizzes")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              subTab === "quizzes"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Quizzes ({quizzes.length})</span>
          </button>

          <button
            onClick={() => setSubTab("assignments")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              subTab === "assignments"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Assignments ({assignments.length})</span>
          </button>

          <button
            onClick={() => setSubTab("projects")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              subTab === "projects"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Coding Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setSubTab("submissions")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 relative ${
              subTab === "submissions"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Submissions & Grading</span>
            {analyticsSummary.pendingReviews > 0 && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-950 font-black">
                {analyticsSummary.pendingReviews}
              </span>
            )}
            {analyticsSummary.flaggedAntiCheat > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-black animate-pulse">
                {analyticsSummary.flaggedAntiCheat} flagged
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab("analytics")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              subTab === "analytics"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics & Reports</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUIZZES MANAGEMENT */}
      {/* ========================================================================= */}
      {subTab === "quizzes" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search quizzes by title or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Unpublished">Unpublished</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateQuiz}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </button>
          </div>

          {/* Quizzes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes
              .filter(q => statusFilter === "all" || q.status === statusFilter)
              .filter(q => searchQuery === "" || q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.category.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((quiz) => (
                <div key={quiz.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            quiz.status === "Published" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            quiz.status === "Draft" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}>
                            {quiz.status}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-800/40">
                            {quiz.category.toUpperCase()}
                          </span>
                          {quiz.accessConfig.accessType === "premium" && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-800/40 flex items-center space-x-1">
                              <Crown className="w-2.5 h-2.5" />
                              <span>Premium</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-100 mt-2 group-hover:text-indigo-300 transition-colors">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {quiz.description}
                        </p>
                      </div>
                    </div>

                    {/* Quiz Badges */}
                    <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-800/70 text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{quiz.questions.length} Questions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{quiz.settings.timeLimitMinutes > 0 ? `${quiz.settings.timeLimitMinutes} mins` : "Unlimited"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>{quiz.settings.xpReward} XP (Pass: {quiz.settings.passingScorePercent}%)</span>
                      </div>
                    </div>

                    {/* Analytics snippet */}
                    {quiz.analytics && (
                      <div className="mt-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Attempts: <strong className="text-slate-200">{quiz.analytics.totalAttempts}</strong></span>
                        <span>Pass Rate: <strong className="text-emerald-400">{quiz.analytics.passRate}%</strong></span>
                        <span>Avg: <strong className="text-indigo-300">{quiz.analytics.avgScore}%</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/70">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setTestingQuiz(quiz);
                          setTestAnswers({});
                          setTestSubmitted(false);
                        }}
                        className="px-2.5 py-1.5 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/50 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-all"
                        title="Live Interactive Preview"
                      >
                        <Play className="w-3 h-3" />
                        <span>Test Quiz</span>
                      </button>

                      <button
                        onClick={() => handleTogglePublishQuiz(quiz)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                          quiz.status === "Published"
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                            : "bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50"
                        }`}
                      >
                        {quiz.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDuplicateQuiz(quiz)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Duplicate Quiz"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuiz(quiz);
                          setIsNewQuiz(false);
                          setQuizModalTab("general");
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Quiz"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchiveQuiz(quiz)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Archive Quiz"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ASSIGNMENT MANAGEMENT */}
      {/* ========================================================================= */}
      {subTab === "assignments" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleOpenCreateAssignment}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Assignment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments
              .filter(a => searchQuery === "" || a.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((assign) => (
                <div key={assign.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {assign.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        {assign.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-800/30">
                        Submission: {assign.submissionType.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 mt-2 group-hover:text-indigo-300 transition-colors">
                      {assign.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {assign.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Max {assign.maxScore} pts (Pass: {assign.passingScore})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{assign.xpReward} XP Reward</span>
                      </div>
                      {assign.deadline && (
                        <div className="flex items-center space-x-1 text-rose-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Deadline: {new Date(assign.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/70">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingAssignment(assign);
                          setIsNewAssignment(false);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-indigo-400" />
                        <span>Edit Assignment</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDuplicateAssignment(assign)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assign.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CODING PROJECTS & RUBRICS MANAGEMENT */}
      {/* ========================================================================= */}
      {subTab === "projects" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleOpenCreateProject}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coding Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects
              .filter(p => searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((proj) => (
                <div key={proj.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {proj.evaluationMode.toUpperCase()} EVALUATION
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                          {proj.difficulty}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {proj.grading.xpReward} XP
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 mt-2.5 group-hover:text-indigo-300 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {proj.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Rubric Overview */}
                    <div className="mt-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800/60">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
                        <span className="flex items-center space-x-1">
                          <Sliders className="w-3 h-3 text-indigo-400" />
                          <span>Evaluation Rubric ({proj.grading.rubric.length} Criteria)</span>
                        </span>
                        <span className="text-slate-400 font-mono">Pass: {proj.grading.passingScore}/{proj.grading.maxScore}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                        {proj.grading.rubric.map(r => (
                          <span key={r.id} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {r.category}: <strong className="text-slate-200">{r.maxPoints} pts</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/70">
                    <button
                      onClick={() => {
                        setEditingProject(proj);
                        setIsNewProject(false);
                        setProjectModalTab("info");
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-indigo-400" />
                      <span>Edit Project & Rubric</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SUBMISSIONS, GRADING & ANTI-CHEAT CENTER */}
      {/* ========================================================================= */}
      {subTab === "submissions" && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Total Submissions</span>
              <p className="text-2xl font-black text-white mt-1">{submissions.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Awaiting Evaluation</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{analyticsSummary.pendingReviews}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Passed / Completed</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {submissions.filter(s => s.status === "passed").length}
              </p>
            </div>
            <div className="bg-slate-900 border border-rose-900/50 rounded-2xl p-4 bg-rose-950/10">
              <span className="text-xs text-rose-400 font-semibold flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Anti-Cheat Review Required</span>
              </span>
              <p className="text-2xl font-black text-rose-400 mt-1">{analyticsSummary.flaggedAntiCheat}</p>
            </div>
          </div>

          {/* Submissions Table / Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200">Student Submissions & Evaluation Queue</h3>
              <span className="text-xs text-slate-400">Showing all recent attempts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Assessment Item</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Anti-Cheat Flags</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200">{sub.userName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{sub.userEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-300 truncate">{sub.itemTitle}</div>
                        <div className="text-[10px] text-slate-500">Attempt #{sub.attemptNumber} • {new Date(sub.submittedAt).toLocaleString()}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          {sub.itemType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === "passed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                          sub.status === "needs_improvement" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                          sub.status === "failed" ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" :
                          "bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse"
                        }`}>
                          {sub.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {sub.evaluation?.totalScore !== undefined ? (
                          <span className={sub.evaluation.passed ? "text-emerald-400" : "text-rose-400"}>
                            {sub.evaluation.totalScore} / {sub.evaluation.maxScore} pts
                          </span>
                        ) : sub.quizResult ? (
                          <span className={sub.quizResult.passed ? "text-emerald-400" : "text-rose-400"}>
                            {sub.quizResult.score} / {sub.quizResult.totalPossibleScore} ({sub.quizResult.percentage}%)
                          </span>
                        ) : (
                          <span className="text-slate-500">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.antiCheatAnalysis?.isFlagged ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-rose-950/70 border border-rose-500/40 text-rose-300 rounded-full text-[10px] font-bold">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            <span>Flagged ({sub.antiCheatAnalysis.similarityScore}%)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Clear</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEvaluationModal(sub)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow transition-all"
                        >
                          {sub.evaluation ? "Review / Edit Grade" : "Grade Submission"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ANALYTICS & REPORTS */}
      {/* ========================================================================= */}
      {subTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Average Quiz Score</span>
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">{analyticsSummary.avgQuizScore}%</p>
              <div className="w-full bg-slate-950 rounded-full h-2 mt-4 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${analyticsSummary.avgQuizScore}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Based on {analyticsSummary.totalQuizAttempts} verified student attempts</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Pass Rate vs Failure</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-baseline space-x-2 mt-2">
                <p className="text-3xl font-black text-emerald-400">{analyticsSummary.quizPassRate}%</p>
                <span className="text-xs text-slate-400">Pass</span>
                <span className="text-slate-600">/</span>
                <p className="text-xl font-bold text-rose-400">{analyticsSummary.quizFailRate}%</p>
                <span className="text-xs text-slate-400">Fail</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-emerald-500" style={{ width: `${analyticsSummary.quizPassRate}%` }} />
                <div className="bg-rose-500" style={{ width: `${analyticsSummary.quizFailRate}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Target passing benchmark is ≥80%</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Average Attempts per Quiz</span>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">1.4</p>
              <p className="text-[11px] text-slate-400 mt-4">
                ကျောင်းသားအများစုသည် ပထမ (သို့) ဒုတိယအကြိမ် ကြိုးစားမှုတွင် စာမေးပွဲ အောင်မြင်ကြပါသည်။
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT / CREATE QUIZ */}
      {/* ========================================================================= */}
      {editingQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <span>{isNewQuiz ? "Create New Assessment Quiz" : `Edit Quiz: ${editingQuiz.title}`}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">မေးခွန်းတွဲများ၊ အချိန်သတ်မှတ်ချက်နှင့် အောင်မှတ်ရာခိုင်နှုန်းများ သတ်မှတ်နိုင်ပါသည်</p>
              </div>
              <button
                onClick={() => setEditingQuiz(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 px-5 pt-2 bg-slate-950/30 gap-2">
              <button
                onClick={() => setQuizModalTab("general")}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
                  quizModalTab === "general" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                General Info
              </button>
              <button
                onClick={() => setQuizModalTab("questions")}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                  quizModalTab === "questions" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Questions ({editingQuiz.questions.length})</span>
              </button>
              <button
                onClick={() => setQuizModalTab("settings")}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
                  quizModalTab === "settings" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Quiz Settings & Rewards
              </button>
              <button
                onClick={() => setQuizModalTab("access")}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
                  quizModalTab === "access" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Access Control
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {quizModalTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Quiz Title *</label>
                    <input
                      type="text"
                      value={editingQuiz.title}
                      onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                      placeholder="e.g. Python Core Logic & Data Types Quiz"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Description (Myanmar / English)</label>
                    <textarea
                      rows={3}
                      value={editingQuiz.description}
                      onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                      placeholder="Explain what this quiz tests..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                      <select
                        value={editingQuiz.category}
                        onChange={(e) => setEditingQuiz({ ...editingQuiz, category: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="basics">Programming Basics</option>
                        <option value="web">Web Development (HTML/CSS)</option>
                        <option value="frontend">Frontend (React/JS)</option>
                        <option value="backend">Backend (Node/Python)</option>
                        <option value="database">Database & SQL</option>
                        <option value="android">Android & Kotlin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                      <select
                        value={editingQuiz.status}
                        onChange={(e) => setEditingQuiz({ ...editingQuiz, status: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Unpublished">Unpublished</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {quizModalTab === "questions" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">မေးခွန်း အမျိုးအစား ၆ မျိုးအထိ ထည့်သွင်းနိုင်ပါသည်</p>
                    <button
                      onClick={() => {
                        const newQuest: AdminQuestion = {
                          id: `q_${Date.now()}`,
                          type: "multiple_choice",
                          question: "",
                          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                          correctAnswer: 0,
                          explanation: "",
                          difficulty: "Easy",
                          points: 10,
                          xpReward: 15
                        };
                        setEditingQuestion(newQuest);
                        setEditingQuestionIndex(null);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>

                  {/* Question Cards List */}
                  <div className="space-y-3">
                    {editingQuiz.questions.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                        <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">မေးခွန်းများ မထည့်သွင်းရသေးပါ။ "Add Question" ကို နှိပ်၍ စတင်ထည့်သွင်းပါ။</p>
                      </div>
                    ) : (
                      editingQuiz.questions.map((q, idx) => (
                        <div key={q.id || idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-indigo-400">Q{idx + 1}.</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                {q.type.replace("_", " ").toUpperCase()}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                                {q.points} pts
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-200 mt-1">{q.question || "Untitled Question"}</p>
                            {q.explanation && (
                              <p className="text-[11px] text-slate-400 italic">Exp: {q.explanation}</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setEditingQuestion({ ...q });
                                setEditingQuestionIndex(idx);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const next = editingQuiz.questions.filter((_, i) => i !== idx);
                                setEditingQuiz({ ...editingQuiz, questions: next });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {quizModalTab === "settings" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Time Limit (Minutes)</label>
                      <input
                        type="number"
                        value={editingQuiz.settings.timeLimitMinutes}
                        onChange={(e) => setEditingQuiz({
                          ...editingQuiz,
                          settings: { ...editingQuiz.settings, timeLimitMinutes: Number(e.target.value) }
                        })}
                        placeholder="0 = Unlimited"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                      />
                      <span className="text-[10px] text-slate-500">0 ထည့်ပါက အချိန်အကန့်အသတ်မရှိပါ</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Passing Score (%)</label>
                      <input
                        type="number"
                        value={editingQuiz.settings.passingScorePercent}
                        onChange={(e) => setEditingQuiz({
                          ...editingQuiz,
                          settings: { ...editingQuiz.settings, passingScorePercent: Number(e.target.value) }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Maximum Attempts</label>
                      <input
                        type="number"
                        value={editingQuiz.settings.maxAttempts}
                        onChange={(e) => setEditingQuiz({
                          ...editingQuiz,
                          settings: { ...editingQuiz.settings, maxAttempts: Number(e.target.value) }
                        })}
                        placeholder="0 = Unlimited"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">XP Reward on Passing</label>
                      <input
                        type="number"
                        value={editingQuiz.settings.xpReward}
                        onChange={(e) => setEditingQuiz({
                          ...editingQuiz,
                          settings: { ...editingQuiz.settings, xpReward: Number(e.target.value) }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Coins Reward (CLM Coins)</label>
                      <input
                        type="number"
                        value={editingQuiz.settings.coinsReward || 0}
                        onChange={(e) => setEditingQuiz({
                          ...editingQuiz,
                          settings: { ...editingQuiz.settings, coinsReward: Number(e.target.value) }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Toggle Configurations */}
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingQuiz.settings.randomQuestionOrder}
                        onChange={(e) => setEditingQuiz({
                          ...editingQuiz,
                          settings: { ...editingQuiz.settings, randomQuestionOrder: e.target.checked }
                        })}
                        className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                      />
                      <span>Randomize Question Order (မေးခွန်းအစီအစဉ် ကျပန်းပြောင်းလဲပြသမည်)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingQuiz.settings.showCorrectAnswers}
                        onChange={(e) => setEditingQuiz({
                          ...editingQuiz,
                          settings: { ...editingQuiz.settings, showCorrectAnswers: e.target.checked }
                        })}
                        className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                      />
                      <span>Show Correct Answers in Results (ဖြေဆိုပြီးပါက အဖြေမှန်များ ပြသမည်)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingQuiz.settings.showExplanation}
                        onChange={(e) => setEditingQuiz({
                          ...editingQuiz,
                          settings: { ...editingQuiz.settings, showExplanation: e.target.checked }
                        })}
                        className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                      />
                      <span>Show Detailed Explanations (အသေးစိတ် ရှင်းလင်းချက်များ ဖော်ပြမည်)</span>
                    </label>
                  </div>
                </div>
              )}

              {quizModalTab === "access" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Access Level</label>
                    <select
                      value={editingQuiz.accessConfig.accessType}
                      onChange={(e) => setEditingQuiz({
                        ...editingQuiz,
                        accessConfig: { ...editingQuiz.accessConfig, accessType: e.target.value as any }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="free">Free (အားလုံးလွတ်လပ်စွာ ဖြေဆိုနိုင်သည်)</option>
                      <option value="premium">Premium Only (VIP Members သာ ဖြေဆိုခွင့်ရှိသည်)</option>
                      <option value="course">Course Specific (သတ်မှတ်ထားသော သင်တန်းတက်သူများသာ)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end space-x-2">
              <button
                onClick={() => setEditingQuiz(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuiz}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUESTION SUB-EDITOR */}
      {/* ========================================================================= */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white">
                {editingQuestionIndex !== null ? "Edit Question" : "Add New Question"}
              </h4>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Question Type</label>
                <select
                  value={editingQuestion.type}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as QuestionType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="multiple_choice">Multiple Choice (အဖြေ ၄ ခု)</option>
                  <option value="true_false">True / False (မှန်/မှား)</option>
                  <option value="multiple_select">Multiple Select (အဖြေတစ်ခုထက်မက)</option>
                  <option value="code_output">Code Output Question</option>
                  <option value="code_completion">Code Completion (ဖြည့်စွက်)</option>
                  <option value="short_answer">Short Answer (တိုတိုတုတ်တုတ်)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Difficulty</label>
                <select
                  value={editingQuestion.difficulty}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as QuestionDifficulty })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Question Text (Myanmar / English) *</label>
              <textarea
                rows={2}
                value={editingQuestion.question}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                placeholder="မေးခွန်းကို ရိုက်ထည့်ပါ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Code Snippet Box (for code output / completion) */}
            {(editingQuestion.type === "code_output" || editingQuestion.type === "code_completion" || editingQuestion.codeSnippet) && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={3}
                  value={editingQuestion.codeSnippet || ""}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, codeSnippet: e.target.value })}
                  placeholder="// Paste or write code snippet here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Options Management */}
            {["multiple_choice", "true_false", "multiple_select", "code_output"].includes(editingQuestion.type) && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-300">Answer Options & Correct Answer</label>
                {(editingQuestion.options || []).map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center space-x-2">
                    <input
                      type={editingQuestion.type === "multiple_select" ? "checkbox" : "radio"}
                      name="correct_opt"
                      checked={
                        editingQuestion.type === "multiple_select"
                          ? Array.isArray(editingQuestion.correctAnswer) && editingQuestion.correctAnswer.includes(oIdx)
                          : Number(editingQuestion.correctAnswer) === oIdx
                      }
                      onChange={(e) => {
                        if (editingQuestion.type === "multiple_select") {
                          const curr = Array.isArray(editingQuestion.correctAnswer) ? [...editingQuestion.correctAnswer] : [];
                          if (e.target.checked) curr.push(oIdx);
                          else {
                            const filtered = curr.filter(i => i !== oIdx);
                            setEditingQuestion({ ...editingQuestion, correctAnswer: filtered });
                            return;
                          }
                          setEditingQuestion({ ...editingQuestion, correctAnswer: curr });
                        } else {
                          setEditingQuestion({ ...editingQuestion, correctAnswer: oIdx });
                        }
                      }}
                      className="rounded bg-slate-950 text-indigo-600"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...(editingQuestion.options || [])];
                        next[oIdx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: next });
                      }}
                      placeholder={`Option ${oIdx + 1}`}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Short Answer / Code Completion Answer */}
            {["code_completion", "short_answer"].includes(editingQuestion.type) && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Correct Answer String</label>
                <input
                  type="text"
                  value={editingQuestion.correctAnswer || ""}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                  placeholder="e.g. return, def, console.log"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Explanation (မြန်မာလို ရှင်းလင်းချက်)</label>
              <textarea
                rows={2}
                value={editingQuestion.explanation}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                placeholder="အဘယ်ကြောင့် ဤအဖြေမှန်ရသည်ကို ရှင်းပြပါ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!editingQuestion.question.trim()) {
                    showToast("မေးခွန်းစာသား ထည့်သွင်းပေးပါ", "error");
                    return;
                  }
                  if (editingQuiz) {
                    const nextQuestions = [...editingQuiz.questions];
                    if (editingQuestionIndex !== null) {
                      nextQuestions[editingQuestionIndex] = editingQuestion;
                    } else {
                      nextQuestions.push(editingQuestion);
                    }
                    setEditingQuiz({ ...editingQuiz, questions: nextQuestions });
                  }
                  setEditingQuestion(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EVALUATION & GRADING MODAL */}
      {/* ========================================================================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 font-mono uppercase">
                    {selectedSubmission.itemType} Evaluation
                  </span>
                  <span className="text-xs text-slate-400">by {selectedSubmission.userName} ({selectedSubmission.userEmail})</span>
                </div>
                <h3 className="font-bold text-lg text-white mt-1">{selectedSubmission.itemTitle}</h3>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Anti-Cheat Alert Banner if Flagged */}
            {selectedSubmission.antiCheatAnalysis?.isFlagged && (
              <div className="p-4 bg-rose-950/70 border-b border-rose-900/60 flex items-start space-x-3 text-xs text-rose-200">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-rose-300">
                    Anti-Cheat Alert: Suspicious pattern detected ({selectedSubmission.antiCheatAnalysis.similarityScore}% Similarity Match)
                  </p>
                  <p className="text-[11px] text-rose-300/80">
                    {selectedSubmission.antiCheatAnalysis.suspiciousReason}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSubmission.antiCheatAnalysis.flags.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-900/80 text-rose-200 rounded text-[10px]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Submission Content Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span>Submitted Content</span>
                </h4>

                {/* Code / Text Preview */}
                {selectedSubmission.submissionContent.code && (
                  <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-56">
                    {selectedSubmission.submissionContent.code}
                  </pre>
                )}

                {selectedSubmission.submissionContent.text && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap">
                    {selectedSubmission.submissionContent.text}
                  </div>
                )}

                {/* Project Links */}
                {(selectedSubmission.submissionContent.githubUrl || selectedSubmission.submissionContent.liveDemoUrl) && (
                  <div className="flex flex-wrap gap-3">
                    {selectedSubmission.submissionContent.githubUrl && (
                      <a
                        href={selectedSubmission.submissionContent.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-indigo-400 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-slate-800 transition-colors"
                      >
                        <Code className="w-4 h-4" />
                        <span>Open GitHub Repository</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedSubmission.submissionContent.liveDemoUrl && (
                      <a
                        href={selectedSubmission.submissionContent.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-indigo-800 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>View Live Demo URL</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Rubric / Scoring Controls */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Rubric Grading & Criterion Scores</span>
                </h4>

                <div className="space-y-3">
                  {Object.entries(evalCriterionScores).map(([critId, score]) => (
                    <div key={critId} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-xs text-slate-200 capitalize">{critId.replace("rubric_", "").replace("_", " ")}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Criterion assessment score</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={score}
                          onChange={(e) => {
                            setEvalCriterionScores({
                              ...evalCriterionScores,
                              [critId]: Number(e.target.value)
                            });
                          }}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-center font-mono font-bold text-slate-100"
                        />
                        <span className="text-xs text-slate-400">pts</span>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/40 flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-200">Total Calculated Score:</span>
                    <span className="font-mono text-base font-black text-indigo-400">{calculatedTotalScore} pts</span>
                  </div>
                </div>
              </div>

              {/* Written Feedback & Suggestions */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Written Feedback to Student</label>
                  <textarea
                    rows={3}
                    value={evalWrittenFeedback}
                    onChange={(e) => setEvalWrittenFeedback(e.target.value)}
                    placeholder="ကျောင်းသားအတွက် အသေးစိတ် အမှတ်ပေးမှတ်ချက်နှင့် အကြံပြုချက် ရေးသားပါ..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Resubmission Permission */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200">Allow Resubmission</span>
                    <p className="text-[10px] text-slate-400">ကျောင်းသားအား အဖြေပြန်လည်ပြင်ဆင်ခွင့် ပေး/မပေး</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evalResubmitAllowed}
                      onChange={(e) => setEvalResubmitAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleSaveEvaluation}
                disabled={isSubmittingGrade}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmittingGrade ? "Saving..." : "Submit Evaluation & Grade"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: LIVE INTERACTIVE QUIZ TESTER */}
      {/* ========================================================================= */}
      {testingQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/40">
                  LIVE TEST PREVIEW
                </span>
                <h3 className="font-bold text-base text-white mt-1">{testingQuiz.title}</h3>
              </div>
              <button onClick={() => setTestingQuiz(null)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {testingQuiz.questions.map((q, qIdx) => {
                const studentAns = testAnswers[q.id];
                return (
                  <div key={q.id || qIdx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 font-mono">Question {qIdx + 1} of {testingQuiz.questions.length}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{q.points} Points</span>
                    </div>

                    <p className="text-sm font-semibold text-slate-100">{q.question}</p>

                    {q.codeSnippet && (
                      <pre className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto">
                        {q.codeSnippet}
                      </pre>
                    )}

                    {/* Options */}
                    {q.options && (
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = q.type === "multiple_select"
                            ? Array.isArray(studentAns) && studentAns.includes(oIdx)
                            : studentAns === oIdx;

                          return (
                            <button
                              key={oIdx}
                              disabled={testSubmitted}
                              onClick={() => {
                                if (q.type === "multiple_select") {
                                  const cur = Array.isArray(studentAns) ? [...studentAns] : [];
                                  const next = cur.includes(oIdx) ? cur.filter(i => i !== oIdx) : [...cur, oIdx];
                                  setTestAnswers({ ...testAnswers, [q.id]: next });
                                } else {
                                  setTestAnswers({ ...testAnswers, [q.id]: oIdx });
                                }
                              }}
                              className={`w-full p-3 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-indigo-600/20 border border-indigo-500 text-indigo-200"
                                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800/60"
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {testSubmitted && (
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1 mt-2">
                        <p className="font-bold text-emerald-400">Correct Answer: {String(q.correctAnswer)}</p>
                        <p className="text-slate-400 italic">Explanation: {q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Answered: {Object.keys(testAnswers).length} / {testingQuiz.questions.length}
              </span>
              <button
                onClick={() => setTestSubmitted(true)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Submit & Check Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
