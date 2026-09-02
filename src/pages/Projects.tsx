/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Code, 
  Terminal, 
  Play, 
  Lightbulb, 
  CheckCircle2, 
  RotateCcw, 
  ChevronRight, 
  BookOpen, 
  Lock,
  Plus,
  Trash2,
  CheckSquare,
  Sparkles,
  MessageSquare,
  Award,
  Send,
  User,
  Clock,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Edit,
  Eye,
  FileText
} from "lucide-react";
import { UserProfile, Project, AssignmentSubmission } from "../types";
import { 
  getProjects, 
  saveProject, 
  deleteProject, 
  getStudentSubmissions, 
  getAllSubmissions, 
  submitAssignment, 
  gradeAssignment,
  sanitizeInput
} from "../lib/db";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { isUserPremium } from "../utils/premiumSecurity";

interface ProjectsProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

interface KiboMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Projects({ user, onUpdateUser }: ProjectsProps) {
  const isPremiumUser = isUserPremium(user);
  const isTeacherOrAdmin = user.role === "teacher" || user.role === "admin";

  // System Lists & States
  const [projects, setProjects] = useState<Project[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<AssignmentSubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "admin" | "grading">("projects");

  // Selected workspace state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [customAlert, setCustomAlert] = useState<{ show: boolean; title?: string; message: string; isError?: boolean } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kibo AI Mentor states
  const [kiboOpen, setKiboOpen] = useState(false);
  const [kiboMessages, setKiboMessages] = useState<KiboMessage[]>([]);
  const [kiboInput, setKiboInput] = useState("");
  const [kiboLoading, setKiboLoading] = useState(false);
  const kiboEndRef = useRef<HTMLDivElement | null>(null);

  // Admin Management States
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<Omit<Project, "steps"> & { steps: string }>({
    id: "",
    title: "",
    description: "",
    difficulty: "Beginner",
    category: "Programming Basics",
    startingCode: "",
    solutionCode: "",
    steps: ""
  });

  // Grading Panel States
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [gradingSubmitting, setGradingSubmitting] = useState(false);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const activeProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  // Load Initial Data
  useEffect(() => {
    loadData();
  }, [user.uid, isTeacherOrAdmin]);

  // Scroll Kibo conversation to bottom
  useEffect(() => {
    if (kiboOpen) {
      kiboEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [kiboMessages, kiboOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch dynamic projects from Firestore
      const projs = await getProjects();
      setProjects(projs || []);

      if (user.uid) {
        // Fetch student's past submissions
        const studentSubs = await getStudentSubmissions(user.uid);
        setUserSubmissions(studentSubs || []);

        // Fetch all student submissions if teacher/admin
        if (isTeacherOrAdmin) {
          const allSubs = await getAllSubmissions();
          setAllSubmissions(allSubs || []);
        }
      }
    } catch (err) {
      console.error("Failed to load project workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    if (proj.difficulty === "Advanced" && !isPremiumUser) {
      setCustomAlert({
        show: true,
        title: "Kibo Premium လိုအပ်ပါသည်",
        message: "👑 ဤသည်မှာ Kibo Premium အဖွဲ့ဝင်များသာ လုပ်ဆောင်နိုင်သော အဆင့်မြင့် Assignment / Project ဖြစ်ပါသည်။ ရွှေသင်္ကေတ (Coins) သုံးစွဲ၍ Profile Page တွင် Premium အဆင့်မြှင့်တင်နိုင်ပါတယ်ဗျာ။",
        isError: true
      });
      return;
    }

    setSelectedProjectId(projectId);

    // Load from draft in localStorage or fallback to starting code
    const savedDraft = localStorage.getItem(`clm_draft_${user.uid || "guest"}_${projectId}`);
    setUserCode(savedDraft || proj.startingCode);
    setConsoleOutput(null);
    setIsSuccess(null);

    // Initial Kibo message setup
    setKiboMessages([
      {
        role: "assistant",
        content: `မင်္ဂလာပါ ${user.name || "ကျောင်းသားလေး"} ရေ! အခုလုပ်မယ့် **"${proj.title}"** ပရောဂျက်အတွက် လိုအပ်တဲ့ အယူအဆတွေ၊ လမ်းညွှန်ချက်တွေနဲ့ အမှားပြင်ဆင်တာတွေကို မေးမြန်းနိုင်ပါတယ်ဗျာ။ ကုဒ်ရေးနေရင်း အဆင်မပြေတာရှိရင် စာရိုက်ပြီး လှမ်းမေးလိုက်ပါနော်။`
      }
    ]);
  };

  // Run Code dynamically on backend python runner
  const handleRunCode = async () => {
    if (!activeProject) return;
    setIsRunning(true);
    setConsoleOutput("ကုဒ်ကို ဆာဗာပေါ်တွင် စတင်လည်ပတ်နေပါသည်...");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "python",
          code: userCode
        })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setConsoleOutput(`[RUN SUCCESS]\n\n${resData.output}`);
        setIsSuccess(true);
        
        // Save local draft automatically
        localStorage.setItem(`clm_draft_${user.uid || "guest"}_${activeProject.id}`, userCode);
      } else {
        const errMsg = resData.error || "Execution Error";
        const myanmarMsg = resData.myanmar || "ကုဒ်လည်ပတ်မှု မအောင်မြင်ပါ။ Error များကို ပြန်လည်စစ်ဆေးပါ။";
        setConsoleOutput(`[RUN ERROR] ${errMsg}\n\nရှင်းလင်းချက်: ${myanmarMsg}`);
        setIsSuccess(false);
      }
    } catch (err) {
      setConsoleOutput(`[SYSTEM ERROR] ဆာဗာနှင့် ချိတ်ဆက်မှု အဆင်မပြေပါ။`);
      setIsSuccess(false);
    } finally {
      setIsRunning(false);
    }
  };

  // Save current work code draft
  const handleSaveDraft = () => {
    if (!activeProject) return;
    localStorage.setItem(`clm_draft_${user.uid || "guest"}_${activeProject.id}`, userCode);
    setCustomAlert({
      show: true,
      title: "မူကြမ်းသိမ်းဆည်းပြီး",
      message: "သင့်ကုဒ်မူကြမ်းကို သင့် browser စက်ထဲတွင် အောင်မြင်စွာ သိမ်းဆည်းလိုက်ပါပြီခင်ဗျာ။"
    });
  };

  // Submit Homework to Firestore for Grading
  const handleSubmitAssignment = async () => {
    if (!activeProject || !user.uid) return;
    setIsSubmitting(true);

    const assignmentId = `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const submission: AssignmentSubmission = {
      assignmentId,
      uid: user.uid,
      submissionURL: userCode,
      grade: null,
      feedback: null,
      projectId: activeProject.id,
      projectTitle: activeProject.title,
      assignmentType: activeProject.category.toLowerCase().includes("design") ? "ui_design" : "coding",
      studentName: user.name || "ကျောင်းသားသစ်",
      studentEmail: user.email,
      submittedAt: new Date().toISOString()
    };

    try {
      await submitAssignment(submission);

      // Award XP for first submission of this project
      const completedList = user.completedLessons || [];
      const hasCompleted = completedList.includes(`proj-${activeProject.id}`);
      if (!hasCompleted) {
        let newXp = user.xp + 150;
        let newLevel = user.level;
        const achievements = [...(user.achievements || [])];

        if (newXp >= newLevel * 1000) {
          newXp -= newLevel * 1000;
          newLevel += 1;
          achievements.push({
            id: `lvl-${newLevel}`,
            title: `Level ${newLevel} စွမ်းအားရှင်`,
            description: `Code Learn Myanmar တွင် အဆင့် ${newLevel} သို့ အောင်မြင်စွာ တက်လှမ်းနိုင်ခဲ့ခြင်း။`,
            icon: "Trophy",
            unlockedAt: new Date().toLocaleDateString()
          });
        }

        // Add to completed
        const completed = [...completedList, `proj-${activeProject.id}`];
        
        achievements.push({
          id: `ach-${activeProject.id}`,
          title: `${activeProject.title} တည်ဆောက်သူ`,
          description: `မြန်မာလို လက်တွေ့ ${activeProject.title} ကို အပြည့်အစုံ ရေးသားတည်ဆောက်နိုင်ခဲ့ခြင်း။`,
          icon: "Code",
          unlockedAt: new Date().toLocaleDateString()
        });

        await onUpdateUser({
          ...user,
          xp: newXp,
          level: newLevel,
          completedLessons: completed,
          achievements
        });
      }

      setCustomAlert({
        show: true,
        title: "အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ",
        message: `🎉 "${activeProject.title}" အတွက် ကုဒ်အိမ်စာတင်သွင်းမှု အောင်မြင်ပါသည်! +150 XP ရရှိပြီး ဆရာမှ လာရောက်စစ်ဆေး အကဲဖြတ်ပေးသွားမည် ဖြစ်ပါသည်ဗျာ။`
      });

      // Reload submissions list
      loadData();
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      setCustomAlert({
        show: true,
        title: "တင်သွင်းမှု မအောင်မြင်ပါ",
        message: "ကွန်ရက်ချိတ်ဆက်မှု ချို့ယွင်းနေပါသဖြင့် နောက်မှ ပြန်လည်တင်သွင်းကြည့်ပါ။",
        isError: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Talk to Kibo AI Mentor specialized on this assignment
  const handleSendToKibo = async () => {
    if (!kiboInput.trim() || kiboLoading || !activeProject) return;

    const userMsg = kiboInput.trim();
    setKiboInput("");
    setKiboMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setKiboLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...kiboMessages,
            { role: "user", content: `Student context in Project "${activeProject.title}":\nMy current code is:\n\`\`\`python\n${userCode}\n\`\`\`\n\nStudent question:\n${userMsg}` }
          ],
          currentCourse: null,
          currentLesson: null,
          userProfile: user,
          stream: false
        })
      });

      const resData = await response.json();
      if (response.ok && resData.text) {
        setKiboMessages(prev => [...prev, { role: "assistant", content: resData.text }]);
      } else {
        throw new Error();
      }
    } catch (err) {
      setKiboMessages(prev => [...prev, { role: "assistant", content: "တောင်းပန်ပါတယ်ခင်ဗျာ။ Kibo ဆာဗာ အနည်းငယ် အလုပ်များနေသဖြင့် နောက်တစ်ကြိမ် ပြန်မေးပေးပါနော်။" }]);
    } finally {
      setKiboLoading(false);
    }
  };

  // Create or Update Project Definition (Admin Only)
  const handleSaveProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.id || !projectForm.title) return;

    // Parse steps from newline or JSON
    let parsedSteps = [];
    try {
      parsedSteps = JSON.parse(projectForm.steps);
    } catch (e) {
      // Fallback: parse lines
      parsedSteps = (projectForm?.steps || "").split("\n\n").map((chunk, index) => {
        const lines = chunk.split("\n");
        return {
          title: lines[0] || `အဆင့် ${index + 1}`,
          content: lines.slice(1).join("\n") || "ညွှန်ကြားချက်အသေးစိတ်..."
        };
      });
    }

    const projectToSave: Project = {
      id: projectForm.id,
      title: projectForm.title,
      description: projectForm.description,
      difficulty: projectForm.difficulty,
      category: projectForm.category,
      startingCode: projectForm.startingCode,
      solutionCode: projectForm.solutionCode,
      steps: parsedSteps
    };

    try {
      await saveProject(projectToSave);
      setCustomAlert({
        show: true,
        title: "ပရောဂျက်ကို သိမ်းဆည်းပြီးပါပြီ",
        message: `အောင်မြင်ပါသည်! "${projectForm.title}" ပရောဂျက်ကို Firestore သို့ စနစ်တကျ ရေးသားထည့်သွင်းပြီးပါပြီ။`
      });
      setIsEditingProject(false);
      loadData();
    } catch (err) {
      console.error("Admin: failed to save project:", err);
      alert("Firestore Permission Denied or validation failed. Rules limit modifications.");
    }
  };

  // Delete Project Definition (Admin Only)
  const handleDeleteProject = async (projId: string) => {
    if (!window.confirm("ဤပရောဂျက်ကို အပြီးတိုင် ဖျက်ပစ်ရန် သေချာပါသလားခင်ဗျာ။")) return;
    try {
      await deleteProject(projId);
      loadData();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  // Grade Homework Submission (Teacher Only)
  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    setGradingSubmitting(true);

    try {
      await gradeAssignment(selectedSubmission.assignmentId, gradeInput, feedbackInput, user.uid || "");
      setCustomAlert({
        show: true,
        title: "အမှတ်ပေးခြင်း အောင်မြင်ပါသည်",
        message: `ကျောင်းသား "${selectedSubmission.studentName}" ၏ တင်သွင်းမှုကို အဆင့် "${gradeInput}" ဖြင့် အကဲဖြတ်ပြီးပါပြီ။`
      });
      setSelectedSubmission(null);
      setGradeInput("");
      setFeedbackInput("");
      loadData();
    } catch (err) {
      console.error("Failed to grade submission:", err);
    } finally {
      setGradingSubmitting(false);
    }
  };

  const categories = ["All", "Programming Basics", "Full-Stack Development", "Web Design", "Git & VCS"];

  const filteredProjects = projects.filter(p => {
    const matchDiff = difficultyFilter === "All" || p.difficulty === difficultyFilter;
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchDiff && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-10 relative">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-6 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">Dynamic Assignments Hub</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-white">
            ကုဒ်လေ့ကျင့်ခန်းနှင့် အိမ်စာစနစ်
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl">
            ဆရာများသတ်မှတ်ထားသော လက်တွေ့ပရောဂျက်များနှင့် အိမ်စာများကို ဤနေရာတွင် ကိုယ်တိုင်ကုဒ်ရေးစမ်းသပ်ပြီး တိုက်ရိုက်တင်သွင်းအကဲဖြတ်နိုင်ပါသည်ဗျာ။
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-fit self-start md:self-center">
          <button
            onClick={() => { setActiveTab("projects"); setSelectedProjectId(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "projects" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ပရောဂျက်များ</span>
          </button>
          
          {isTeacherOrAdmin && (
            <>
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "admin" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
              >
                <Edit className="w-3.5 h-3.5" />
                <span>စီမံခန့်ခွဲမှုစနစ်</span>
              </button>
              <button
                onClick={() => setActiveTab("grading")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "grading" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>အဆင့်သတ်မှတ်ရန် ({allSubmissions.filter(s => s.grade === null).length})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingState 
          variant="course_grid" 
          count={6} 
          message="Loading project assignments..." 
          messageMm="ပရောဂျက် သင်ခန်းစာများကို ဆွဲတင်နေပါသည်..." 
          onRetry={loadData} 
        />
      ) : selectedProjectId === null && activeTab === "projects" ? (
        
        /* STUDENT PROJECTS DASHBOARD & PORTAL */
        <div className="space-y-8">
          
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-400">စစ်ထုတ်ရန် (Filters):</span>
              <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {["All", "Beginner", "Intermediate", "Advanced"].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${difficultyFilter === diff ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                  >
                    {diff === "All" ? "အားလုံး" : diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">ကဏ္ဍ (Category):</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === "All" ? "အားလုံးပြရန်" : cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Layout of Assignments */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => {
                const studentSub = userSubmissions.find(sub => sub.projectId === proj.id);
                const isLocked = proj.difficulty === "Advanced" && !isPremiumUser;

                return (
                  <div 
                    key={proj.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group ${
                      isLocked 
                        ? "border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-b from-white to-amber-500/[0.01]" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Tags */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          proj.difficulty === "Advanced"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : proj.difficulty === "Intermediate"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          {proj.difficulty}
                        </span>

                        {/* Grading Status Badge */}
                        {studentSub ? (
                          studentSub.grade ? (
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Grade: {studentSub.grade}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" />
                              စစ်ဆေးဆဲ
                            </span>
                          )
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-slate-900 dark:text-white font-display font-bold text-lg leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {proj.description}
                        </p>
                      </div>

                      {/* Step Count and Metadata */}
                      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                          {proj.steps?.length || 0} အဆင့်လမ်းညွှန်
                        </span>
                        <span>•</span>
                        <span>{proj.category}</span>
                      </div>
                    </div>

                    {/* Call to action */}
                    {isLocked ? (
                      <button
                        onClick={() => handleSelectProject(proj.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Premium ဖြင့် လော့ခ်ဖွင့်ပါ</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectProject(proj.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-blue-500/10"
                      >
                        <Code className="w-4 h-4" />
                        <span>ပရောဂျက်စတင်ရန်</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState 
              variant="no_projects"
              title="No matching projects found"
              titleMm="ပရောဂျက်များ မတွေ့ရှိပါ"
              description="No projects match your selected filters. Reset filters to explore all available assignments."
              descriptionMm="စစ်ထုတ်ထားသော အဆင့် သို့မဟုတ် Category နှင့် ကိုက်ညီသည့် ပရောဂျက် မရှိသေးပါ။ စစ်ထုတ်မှုများကို ရှင်းလင်းကြည့်ပါ။"
              primaryAction={{
                label: "Reset Filters",
                labelMm: "စစ်ထုတ်မှုကို ရှင်းလင်းမည်",
                onClick: () => {
                  setDifficultyFilter("All");
                  setCategoryFilter("All");
                }
              }}
            />
          )}
        </div>

      ) : selectedProjectId && activeProject ? (
        
        /* STUDENT INTERACTIVE WORKSPACE & CODING LAB */
        <div className="space-y-6">
          
          {/* Breadcrumb back */}
          <button
            onClick={() => setSelectedProjectId(null)}
            className="inline-flex items-center space-x-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>ပရောဂျက်စာရင်းသို့ ပြန်သွားရန်</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[calc(100vh-16rem)]">
            
            {/* Guide & Steps panel (Left - 5 columns) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[80vh] shadow-sm">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 font-mono">Assignment Guidelines</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">Python Standard</span>
                  </div>
                  <h2 className="text-xl font-display font-extrabold text-slate-900 dark:text-white leading-tight">
                    {activeProject.title}
                  </h2>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {activeProject.description}
                </div>

                {/* Steps Timeline Accordion */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                    လမ်းညွှန်ချက်အဆင့်ဆင့် (Instructions)
                  </h4>
                  <div className="space-y-3">
                    {activeProject.steps?.map((step, sIdx) => (
                      <div key={sIdx} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono flex items-center justify-center font-bold border border-blue-500/20">
                            {sIdx + 1}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</h5>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-7">{step.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action status & grading details */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                {userSubmissions.find(sub => sub.projectId === activeProject.id) ? (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ဤအိမ်စာကို တင်သွင်းပြီးပါပြီ</span>
                    </div>
                    {userSubmissions.find(sub => sub.projectId === activeProject.id)?.grade ? (
                      <div className="space-y-1 text-xs">
                        <p className="text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-emerald-600">ရရှိသည့်အဆင့် (Grade):</span> {userSubmissions.find(sub => sub.projectId === activeProject.id)?.grade}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 mt-1">
                          ဆရာ့ထံမှ အကြံပြုချက်: "{userSubmissions.find(sub => sub.projectId === activeProject.id)?.feedback}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        ဆရာမှ အမှတ်ပေးအကဲဖြတ်ခြင်း ဆောင်ရွက်နေဆဲဖြစ်ပါသည်။ ၎င်းပြင်ဆင်မှုပြီးဆုံးက အကြံပြုချက်ကို ဤနေရာတွင် ပြသသွားမည်ဖြစ်ပါသည်ခင်ဗျာ။
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 text-xs text-slate-500 leading-relaxed flex gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>ကုဒ်ကို ကောင်းမွန်စွာ တွက်ချက်နိုင်အောင် ရေးသားပြီးပါက အိမ်စာတင်သွင်းရန် အပေါ်ညာဘက်မှ Submit လုပ်နိုင်ပါသည်ဗျာ။</span>
                  </div>
                )}
              </div>
            </div>

            {/* Editor Workspace & Live Runner Terminal (Right - 7 columns) */}
            <div className="lg:col-span-7 flex flex-col space-y-4 h-full">
              
              {/* Python Editor Container */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-xl min-h-[400px]">
                <div className="bg-[#020617] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="flex items-center justify-center w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="flex items-center justify-center w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider pl-2">Workspace Python Terminal</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setUserCode(activeProject.startingCode)}
                      className="p-1.5 rounded bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all"
                      title="Reset Template Code"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setKiboOpen(!kiboOpen)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${kiboOpen ? "bg-purple-600 text-white" : "bg-purple-950/40 text-purple-400 hover:bg-purple-900/30"}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Kibo AI Mentor
                    </button>
                  </div>
                </div>

                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="flex-1 bg-transparent p-6 font-mono text-xs text-[#94A3B8] focus:text-white focus:outline-none resize-none leading-relaxed"
                  spellCheck="false"
                  placeholder="# Write your program here..."
                />

                {/* Workspace footer actions */}
                <div className="bg-[#020617] p-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={handleSaveDraft}
                    className="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-700/50"
                  >
                    မူကြမ်းသိမ်းမည်
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-emerald-400 shadow-md cursor-pointer border border-emerald-500/25 disabled:opacity-50"
                    >
                      {isRunning ? (
                        <span className="animate-spin h-3.5 w-3.5 border-2 border-emerald-400 border-t-transparent rounded-full"></span>
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>ကုဒ်စမ်းသပ်မည် (Run)</span>
                    </button>

                    <button
                      onClick={handleSubmitAssignment}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>အိမ်စာ တင်သွင်းမည် (Submit)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Server Console output */}
              {consoleOutput && (
                <div className={`p-5 rounded-2xl border font-mono text-xs text-left ${isSuccess ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/5 border-red-500/10 text-red-600 dark:text-red-400"}`}>
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-2 mb-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Compiler Console logs</span>
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                    )}
                  </div>
                  <pre className="whitespace-pre-wrap font-mono leading-relaxed">{consoleOutput}</pre>
                </div>
              )}
            </div>

            {/* Kibo AI Drawer panel (collapsible floating drawer inside workspace layout) */}
            {kiboOpen && (
              <div className="lg:col-span-12 xl:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between max-h-[80vh] shadow-2xl overflow-hidden mt-4 lg:mt-0">
                <div className="bg-[#020617] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-xs font-bold text-white font-display">Kibo AI Tutor</span>
                  </div>
                  <button 
                    onClick={() => setKiboOpen(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    ပိတ်မည်
                  </button>
                </div>

                {/* Dialogue area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
                  {kiboMessages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`flex gap-3 text-xs leading-relaxed max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-purple-900 text-purple-300"}`}>
                        {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`p-3 rounded-2xl ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-100"}`}>
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    </div>
                  ))}
                  <div ref={kiboEndRef} />
                </div>

                {/* Input box */}
                <div className="p-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={kiboInput}
                    onChange={(e) => setKiboInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendToKibo()}
                    placeholder="Kibo သို့ မြန်မာလို လှမ်းမေးပါ..."
                    className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleSendToKibo}
                    disabled={kiboLoading}
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      ) : activeTab === "admin" && isTeacherOrAdmin ? (
        
        /* ADMIN PANEL - PROJECT & ASSIGNMENT DESIGNER */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">🛠️ အိမ်စာ/ပရောဂျက် စီမံခန့်ခွဲသူ Panel</h2>
            <button
              onClick={() => {
                setIsEditingProject(true);
                setProjectForm({
                  id: `proj_${Date.now()}`,
                  title: "",
                  description: "",
                  difficulty: "Beginner",
                  category: "Programming Basics",
                  startingCode: "# Templates start code here",
                  solutionCode: "# Answer formula reference",
                  steps: `[{"title":"အဆင့် ၁","content":"အဆင့်အသေးစိတ်..."}]`
                });
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              ပရောဂျက်အသစ်ဖန်တီးမည်
            </button>
          </div>

          {isEditingProject ? (
            <form onSubmit={handleSaveProjectForm} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">အိမ်စာ/ပရောဂျက် အချက်အလက်သတ်မှတ်ခြင်း</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Unique Project ID (အင်္ဂလိပ်လိုသာ)</label>
                  <input
                    type="text"
                    value={projectForm.id}
                    onChange={(e) => setProjectForm({ ...projectForm, id: sanitizeInput(e.target.value, 80) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:outline-none"
                    placeholder="e.g. proj_employee_payroll"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Project / Assignment Title (မြန်မာလို)</label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:outline-none"
                    placeholder="e.g. ဝန်ထမ်းလစာစာရင်းတွက်ချက်စနစ်"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">သတ်မှတ်ချက်အဆင့် (Difficulty)</label>
                  <select
                    value={projectForm.difficulty}
                    onChange={(e) => setProjectForm({ ...projectForm, difficulty: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced (Premium Only)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">သင်တန်းကဏ္ဍ (Category)</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:outline-none"
                  >
                    <option value="Programming Basics">Programming Basics</option>
                    <option value="Full-Stack Development">Full-Stack Development</option>
                    <option value="Web Design">Web Design</option>
                    <option value="Git & VCS">Git & VCS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">ဖော်ပြချက်နှင့် လုပ်ဆောင်ချက် လိုအပ်ချက်များ (Description - Markdown structure)</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:outline-none h-28"
                  placeholder="ကုဒ်လုပ်ဆောင်ချက် လိုအပ်ချက်များကို မြန်မာလို အသေးစိတ်ရေးပါ..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">လမ်းညွှန်ချက် အဆင့်ဆင့် (JSON steps structure: [&#123; "title": "...", "content": "..." &#125;])</label>
                <textarea
                  value={projectForm.steps}
                  onChange={(e) => setProjectForm({ ...projectForm, steps: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono rounded-xl p-3 focus:outline-none h-24"
                  placeholder='[{"title":"အဆင့် ၁","content":"အဆင့်အသေးစိတ်..."}]'
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">အစပြုကုဒ် (Starting Code Template - Python)</label>
                  <textarea
                    value={projectForm.startingCode}
                    onChange={(e) => setProjectForm({ ...projectForm, startingCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 font-mono text-xs text-white rounded-xl p-4 focus:outline-none h-44"
                    placeholder="# starting code here"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">အဖြေမှန်ရည်ညွှန်းချက် (Reference Solution Formula)</label>
                  <textarea
                    value={projectForm.solutionCode}
                    onChange={(e) => setProjectForm({ ...projectForm, solutionCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 font-mono text-xs text-white rounded-xl p-4 focus:outline-none h-44"
                    placeholder="# reference solution code here"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditingProject(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-blue-500/10"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">ခေါင်းစဉ်</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4">ကဏ္ဍ</th>
                      <th className="px-6 py-4 text-right">လုပ်ဆောင်ချက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{proj.title}</td>
                        <td className="px-6 py-4">{proj.difficulty}</td>
                        <td className="px-6 py-4">{proj.category}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setIsEditingProject(true);
                              setProjectForm({
                                id: proj.id,
                                title: proj.title,
                                description: proj.description,
                                difficulty: proj.difficulty,
                                category: proj.category,
                                startingCode: proj.startingCode,
                                solutionCode: proj.solutionCode,
                                steps: JSON.stringify(proj.steps)
                              });
                            }}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 cursor-pointer"
                          >
                            ပြင်မည်
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1.5 bg-red-500/15 text-red-600 rounded hover:bg-red-500/20 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      ) : activeTab === "grading" && isTeacherOrAdmin ? (
        
        /* TEACHER/ADMIN GRADING PANEL & QUEUE */
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">📝 အကဲဖြတ်မှုနှင့် အိမ်စာအမှတ်ပေးစင်တာ</h2>
            <p className="text-slate-500 text-xs mt-1">ကျောင်းသားများတင်သွင်းလာသော homework ကုဒ်များကို review လုပ်ပြီး အမှတ်ပေး အကဲဖြတ်မှုနှင့် feedback ရေးသားနိုင်ပါသည်ဗျာ။</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* List queue - 5 cols */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 overflow-y-auto max-h-[70vh]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pb-2">Submissions Queue</span>
              
              {allSubmissions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">တင်သွင်းထားသောအိမ်စာ လတ်တလောမရှိသေးပါ။</div>
              ) : (
                <div className="space-y-2.5">
                  {allSubmissions.map((sub) => (
                    <button
                      key={sub.assignmentId}
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setGradeInput(sub.grade || "");
                        setFeedbackInput(sub.feedback || "");
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${selectedSubmission?.assignmentId === sub.assignmentId ? "border-blue-600 bg-blue-50/10 dark:bg-blue-950/10" : "border-slate-150 hover:border-slate-300 dark:border-slate-800"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-100 font-display text-xs">{sub.studentName}</span>
                        {sub.grade ? (
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold">Grade: {sub.grade}</span>
                        ) : (
                          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-bold">စစ်ရန်ကျန်</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{sub.projectTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preview & Grade Form - 7 cols */}
            <div className="lg:col-span-7">
              {selectedSubmission ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold px-2.5 py-0.5 rounded-full uppercase">{selectedSubmission.assignmentType}</span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{selectedSubmission.projectTitle}</h3>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{selectedSubmission.studentName}</p>
                      <p className="text-slate-400 text-[10px]">{selectedSubmission.studentEmail}</p>
                    </div>
                  </div>

                  {/* Code Viewer */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Code className="w-4 h-4 text-blue-500" />
                        ကျောင်းသားရေးသားထားသော ကုဒ်ဖိုင် (Submitted Code):
                      </span>
                    </div>
                    <pre className="p-4 bg-[#0F172A] border border-slate-800 text-slate-300 rounded-xl font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
                      {selectedSubmission.submissionURL}
                    </pre>
                  </div>

                  {/* Evaluation Grading Form */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">အကဲဖြတ်အမှတ်ပေးစနစ် (Grading Form)</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-xs font-bold text-slate-500 col-span-1">အဆင့်သတ်မှတ်ခြင်း (Grade/Score):</label>
                      <input
                        type="text"
                        value={gradeInput}
                        onChange={(e) => setGradeInput(sanitizeInput(e.target.value, 8))}
                        className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 focus:outline-none"
                        placeholder="e.g. A, B, Pass, 100"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">ဆရာ့ထံမှ အကြံပြုချက်နှင့် လမ်းညွှန်ချက် (Feedback Commentary):</label>
                      <textarea
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:outline-none h-24"
                        placeholder="ကုဒ်ပိုမိုသပ်ရပ်လာစေရန်နှင့် algorithm ကောင်းမွန်လာစေရန် လမ်းညွှန်ချက်များကို ရေးသားပေးပါ..."
                        required
                      />
                    </div>

                    <button
                      onClick={handleGradeSubmission}
                      disabled={gradingSubmitting}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/10 disabled:opacity-50"
                    >
                      {gradingSubmitting ? "သိမ်းဆည်းနေပါသည်..." : "အကဲဖြတ်ချက် သိမ်းဆည်းမည် (Grade Submission)"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-xs h-full flex flex-col justify-center items-center gap-3">
                  <FileText className="w-10 h-10 text-slate-300" />
                  <span>စစ်ဆေးရန် ကျောင်းသားအိမ်စာကို ဘယ်ဘက်မှ ရွေးချယ်ပေးပါခင်ဗျာ။</span>
                </div>
              )}
            </div>
          </div>
        </div>

      ) : null}

      {/* CUSTOM BEAUTIFUL NOTIFICATION MODAL */}
      {customAlert?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${customAlert.isError ? "bg-red-500/15 text-red-500" : "bg-emerald-500/15 text-emerald-500"}`}>
              {customAlert.isError ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-slate-900 dark:text-white font-display font-extrabold text-lg leading-tight">
                {customAlert.title || "အောင်မြင်ပါသည် ခင်ဗျာ!"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {customAlert.message}
              </p>
            </div>
            
            <button
              onClick={() => setCustomAlert(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/10"
            >
              ကောင်းပါပြီ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
