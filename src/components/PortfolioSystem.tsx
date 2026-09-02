/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  FolderGit2, 
  Globe, 
  Star, 
  Heart, 
  Eye, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Share2, 
  ExternalLink, 
  Award, 
  Trophy, 
  Wand2, 
  BarChart3, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  Copy, 
  Check, 
  X, 
  Upload, 
  HelpCircle,
  Zap,
  ArrowRight
} from "lucide-react";
import { UserProfile, PortfolioProject } from "../types";
import { 
  getPortfolioProjects, 
  savePortfolioProject, 
  deletePortfolioProject, 
  togglePortfolioLike, 
  adminToggleFeatureProject, 
  adminChangeProjectVisibility 
} from "../lib/db";

interface PortfolioSystemProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  viewMode?: "my_portfolio" | "public_showcase";
  onNavigateTab?: (tab: string) => void;
}

export default function PortfolioSystem({
  user,
  onUpdateUser,
  viewMode = "my_portfolio",
  onNavigateTab
}: PortfolioSystemProps) {
  const [currentMode, setCurrentMode] = useState<"my_portfolio" | "public_showcase">(viewMode);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [publicProjects, setPublicProjects] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Modals & Active Selections
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [viewingProject, setViewingProject] = useState<PortfolioProject | null>(null);
  const [publicProfileStudent, setPublicProfileStudent] = useState<{ uid: string; name: string } | null>(null);

  // Kibo AI Portfolio Assistant state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"description" | "improve_text" | "suggest_title" | "recommendations">("description");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<any>(null);
  const [aiPromptHighlights, setAiPromptHighlights] = useState("");

  // Editor Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formProjectType, setFormProjectType] = useState<"Mini Project" | "Final Project" | "Personal Project" | "Assignment Showcase">("Personal Project");
  const [formDifficulty, setFormDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced" | "Professional">("Beginner");
  const [formStatus, setFormStatus] = useState<"Completed" | "In Progress" | "Draft">("Completed");
  const [formCompletionDate, setFormCompletionDate] = useState(new Date().toISOString().split("T")[0]);
  const [formLanguages, setFormLanguages] = useState<string[]>(["HTML", "CSS"]);
  const [formFrameworks, setFormFrameworks] = useState<string[]>([]);
  const [formCustomLanguage, setFormCustomLanguage] = useState("");
  const [formCustomFramework, setFormCustomFramework] = useState("");
  const [formScreenshot, setFormScreenshot] = useState("");
  const [formGithubUrl, setFormGithubUrl] = useState("");
  const [formLiveDemoUrl, setFormLiveDemoUrl] = useState("");
  const [formVisibility, setFormVisibility] = useState<"Public" | "Private">("Public");
  const [formSaveSuccess, setFormSaveSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const isTeacherOrAdmin = user.role === "teacher" || user.role === "admin";
  const isPremium = user.isPremium === true || user.role === "premium" || isTeacherOrAdmin;

  const AVAILABLE_LANGUAGES = ["HTML", "CSS", "JavaScript", "TypeScript", "Python", "Java", "Kotlin", "SQL", "C++", "PHP"];
  const AVAILABLE_FRAMEWORKS = ["React", "Vue", "Node.js", "Express", "Tailwind CSS", "Bootstrap", "Firebase", "Android SDK", "Jetpack Compose", "Spring Boot"];

  // Fetch projects on load or mode switch
  useEffect(() => {
    loadProjectsData();
  }, [user.uid, currentMode]);

  const loadProjectsData = async () => {
    setIsLoading(true);
    try {
      const myProjs = await getPortfolioProjects(user.uid, false);
      const pubProjs = await getPortfolioProjects(undefined, true);
      setProjects(myProjs);
      setPublicProjects(pubProjs);
    } catch (e) {
      console.error("Error loading portfolio projects:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditor = (proj?: PortfolioProject) => {
    // Check free tier limit (Max 3 projects for free users)
    if (!proj && !isPremium && projects.length >= 3) {
      alert("အခမဲ့အကောင့်အဆင့်တွင် ပရောဂျက် ၃ ခုသာ ထည့်သွင်းခွင့်ရှိပါသည်ခင်ဗျာ။ Kibo Premium အဆင့်သို့ တိုးမြှင့်ကာ အကန့်အသတ်မရှိ Portfolio များ ဖန်တီးနိုင်ပါသည်။");
      return;
    }

    if (proj) {
      setEditingProject(proj);
      setFormTitle(proj.title);
      setFormDescription(proj.description);
      setFormProjectType(proj.projectType);
      setFormDifficulty(proj.difficulty);
      setFormStatus(proj.status);
      setFormCompletionDate(proj.completionDate || new Date().toISOString().split("T")[0]);
      setFormLanguages(proj.languages || []);
      setFormFrameworks(proj.frameworks || []);
      setFormScreenshot(proj.screenshot || "");
      setFormGithubUrl(proj.githubUrl || "");
      setFormLiveDemoUrl(proj.liveDemoUrl || "");
      setFormVisibility(proj.visibility || "Public");
    } else {
      setEditingProject(null);
      setFormTitle("");
      setFormDescription("");
      setFormProjectType("Personal Project");
      setFormDifficulty("Beginner");
      setFormStatus("Completed");
      setFormCompletionDate(new Date().toISOString().split("T")[0]);
      setFormLanguages(["HTML", "CSS"]);
      setFormFrameworks([]);
      setFormScreenshot("");
      setFormGithubUrl("");
      setFormLiveDemoUrl("");
      setFormVisibility("Public");
    }
    setFormError("");
    setFormSaveSuccess(false);
    setIsEditorOpen(true);
  };

  const handleToggleLanguage = (lang: string) => {
    if (formLanguages.includes(lang)) {
      setFormLanguages(formLanguages.filter(l => l !== lang));
    } else {
      setFormLanguages([...formLanguages, lang]);
    }
  };

  const handleAddCustomLanguage = () => {
    if (formCustomLanguage.trim() && !formLanguages.includes(formCustomLanguage.trim())) {
      setFormLanguages([...formLanguages, formCustomLanguage.trim()]);
      setFormCustomLanguage("");
    }
  };

  const handleToggleFramework = (fw: string) => {
    if (formFrameworks.includes(fw)) {
      setFormFrameworks(formFrameworks.filter(f => f !== fw));
    } else {
      setFormFrameworks([...formFrameworks, fw]);
    }
  };

  const handleAddCustomFramework = () => {
    if (formCustomFramework.trim() && !formFrameworks.includes(formCustomFramework.trim())) {
      setFormFrameworks([...formFrameworks, formCustomFramework.trim()]);
      setFormCustomFramework("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("ပုံပမာဏသည် 2MB ထက် မကျော်လွန်ရပါခင်ဗျာ။");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Project Title ထည့်သွင်းရန် လိုအပ်ပါသည်။");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Project Description ထည့်သွင်းရန် လိုအပ်ပါသည်။");
      return;
    }

    const projectId = editingProject ? editingProject.id : `port_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newProj: PortfolioProject = {
      id: projectId,
      uid: user.uid,
      title: formTitle.trim(),
      description: formDescription.trim(),
      projectType: formProjectType,
      difficulty: formDifficulty,
      status: formStatus,
      completionDate: formCompletionDate,
      languages: formLanguages,
      frameworks: formFrameworks,
      screenshot: formScreenshot || editingProject?.screenshot || "",
      thumbnail: formScreenshot || editingProject?.thumbnail || "",
      githubUrl: formGithubUrl.trim(),
      liveDemoUrl: formLiveDemoUrl.trim(),
      visibility: formVisibility,
      studentName: user.name,
      studentEmail: user.email,
      studentPhoto: user.photo || "",
      isFeatured: editingProject?.isFeatured || false,
      likes: editingProject?.likes || 0,
      views: editingProject?.views || 1,
      createdAt: editingProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await savePortfolioProject(newProj);
      setFormSaveSuccess(true);
      setTimeout(() => {
        setIsEditorOpen(false);
        loadProjectsData();
      }, 1000);
    } catch (e: any) {
      setFormError(e.message || "Project သိမ်းဆည်းရာတွင် အမှားအယွင်း ရှိခဲ့ပါသည်။");
    }
  };

  const handleDelete = async (projId: string) => {
    if (window.confirm("ဤ Portfolio Project ကို ဖျက်ရန် သေချာပါသလားခင်ဗျာ?")) {
      await deletePortfolioProject(projId);
      loadProjectsData();
    }
  };

  const handleLike = async (projId: string) => {
    await togglePortfolioLike(projId, user.uid);
    loadProjectsData();
  };

  const handleAdminToggleFeature = async (projId: string, currentFeatured: boolean) => {
    await adminToggleFeatureProject(projId, !currentFeatured);
    loadProjectsData();
  };

  const handleAdminToggleVisibility = async (projId: string, currentVisibility: "Public" | "Private") => {
    const newVis = currentVisibility === "Public" ? "Private" : "Public";
    await adminChangeProjectVisibility(projId, newVis);
    loadProjectsData();
  };

  // Kibo AI Call
  const handleCallKiboAi = async (mode: "description" | "improve_text" | "suggest_title" | "recommendations") => {
    setIsAiLoading(true);
    setAiMode(mode);
    setAiOutput(null);

    try {
      const res = await fetch("/api/gemini/portfolio-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          title: formTitle,
          description: mode === "description" ? aiPromptHighlights || formDescription : formDescription,
          projectType: formProjectType,
          languages: formLanguages,
          frameworks: formFrameworks,
          difficulty: formDifficulty,
          githubUrl: formGithubUrl,
          liveDemoUrl: formLiveDemoUrl
        })
      });

      if (!res.ok) {
        throw new Error("Kibo AI response failed");
      }

      const data = await res.json();
      setAiOutput(data);
    } catch (err) {
      console.error("AI Portfolio assist error:", err);
      // Fallback response for offline or error
      if (mode === "description") {
        setAiOutput({
          suggestedDescription: `${formTitle || "ဤ ပရောဂျက်"} ကို ${formLanguages.join(", ")} နှင့် ${formFrameworks.join(", ")} တို့ကို အသုံးပြု၍ ရေးသားထားပါသည်။ အသုံးပြုသူများအတွက် လွယ်ကူရှင်းလင်းသော UI Design နှင့် စနစ်တကျ ရေးသားထားသော Code Logic များ ပါဝင်ပါသည်။`,
          keyFeatures: ["User-Friendly Interface Design", "Responsive Layout Support", "Clean & Well-Structured Code Base"],
          learningHighlights: "Modern programming fundamentals and step-by-step problem solving skills."
        });
      } else if (mode === "suggest_title") {
        setAiOutput({
          suggestedTitles: [
            `${formLanguages[0] || "Code"} Master: ${formTitle || "App"}`,
            `Smart ${formTitle || "Project"} Hub`,
            `Interactive ${formLanguages[0] || "Web"} Workspace`,
            `ProDev: ${formTitle || "Showcase Application"}`,
            `NextGen ${formTitle || "Platform"}`
          ],
          reasoning: "အဆိုပါ ခေါင်းစဉ်များသည် နည်းပညာစွမ်းရည်နှင့် ပရိုဖက်ရှင်နယ် ဆန်းသစ်မှုကို ပေါ်လွင်စေပါသည်ခင်ဗျာ။"
        });
      } else if (mode === "improve_text") {
        setAiOutput({
          improvedText: `${formDescription}\n\n[Key Highlights]: ${formLanguages.join(", ")} စွမ်းရည်များကို ထိရောက်စွာ အသုံးပြုထားသော ပရောဂျက်ဖြစ်ပါသည်။`,
          improvementsMade: ["စာပိုဒ် ဖွဲ့စည်းပုံ ပိုမိုသပ်ရပ်အောင် ပြင်ဆင်ခဲ့ပါသည်။", "Technical Terms များကို ပိုမို ပေါ်လွင်စေပါသည်။"],
          recruiterTips: "အလုပ်ခန့်အပ်သူများ ကြည့်ရှုပါက သင့်၏ တိုးတက်လေ့လာနိုင်စွမ်းကို ထင်ရှားစေပါမည်။"
        });
      } else {
        setAiOutput({
          completenessScore: 80,
          recommendations: [
            "GitHub Repository link ထည့်သွင်းပေးပါက Code အရည်အသွေးကို စစ်ဆေးနိုင်ပါမည်။",
            "Live Demo Link ထည့်သွင်းထားခြင်းက ကြည့်ရှုသူများကို တိုက်ရိုက် စမ်းသပ်ခွင့်ပေးနိုင်ပါသည်။",
            "Project Screenshot သန့်ရှင်းစွာ တင်ပေးခြင်းက ပိုမို ဆွဲဆောင်မှု ရှိစေပါမည်။"
          ],
          portfolioStrengths: ["ဘာသာစကားအသုံးပြုမှု ရှင်းလင်းခြင်း", "အဓိက အင်္ဂါရပ်များ စုံလင်ခြင်း"]
        });
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiSuggestedDescription = (descText: string) => {
    setFormDescription(descText);
    setIsAiModalOpen(false);
  };

  const applyAiSuggestedTitle = (titleText: string) => {
    setFormTitle(titleText);
    setIsAiModalOpen(false);
  };

  // Filtered Lists
  const listToFilter = currentMode === "my_portfolio" ? projects : publicProjects;
  
  const filteredProjects = listToFilter.filter(p => {
    // Search query
    const query = searchQuery.toLowerCase();
    const matchSearch = !query || 
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.studentName.toLowerCase().includes(query) ||
      (p.languages && p.languages.some(l => l.toLowerCase().includes(query))) ||
      (p.frameworks && p.frameworks.some(f => f.toLowerCase().includes(query)));

    // Language
    const matchLang = selectedLanguage === "all" || (p.languages && p.languages.includes(selectedLanguage));
    
    // Difficulty
    const matchDiff = selectedDifficulty === "all" || p.difficulty === selectedDifficulty;
    
    // Type
    const matchType = selectedType === "all" || p.projectType === selectedType;

    // Status
    const matchStatus = statusFilter === "all" || p.status === statusFilter;

    // Visibility (for my portfolio)
    const matchVis = visibilityFilter === "all" || p.visibility === visibilityFilter;

    // Featured
    const matchFeatured = !featuredOnly || p.isFeatured;

    return matchSearch && matchLang && matchDiff && matchType && matchStatus && matchVis && matchFeatured;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Student Project Portfolio & Showcase</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              {currentMode === "my_portfolio" ? "ကျွန်ုပ်၏ ပရောဂျက် ရလဒ်စုစည်းမှု" : "ကျောင်းသားများ၏ ပြသပရောဂျက်များ (Showcase)"}
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              {currentMode === "my_portfolio" 
                ? "မိမိကိုယ်တိုင် ရေးသားထားသော Mini Projects, Final Projects များနှင့် အတန်းစံပြ ရလဒ်များကို စနစ်တကျ သိမ်းဆည်းပြီး အလုပ်အကိုင် အခွင့်အလမ်းများအတွက် ပြသလိုက်ပါ။"
                : "Code Learn Myanmar သင်တန်းသားများ၏ တည်ဆောက်ထားသော ထူးချွန်ပရောဂျက်များကို လေ့လာကြည့်ရှုပြီး အကြံပြုချက်များ ပေးပို့နိုင်ပါသည်။"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl flex items-center border border-white/20">
              <button
                onClick={() => setCurrentMode("my_portfolio")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  currentMode === "my_portfolio"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                <span>My Portfolio ({projects.length})</span>
              </button>
              <button
                onClick={() => setCurrentMode("public_showcase")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  currentMode === "public_showcase"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Public Showcase</span>
              </button>
            </div>

            {currentMode === "my_portfolio" && (
              <button
                onClick={() => handleOpenEditor()}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-bold text-xs shadow-lg hover:shadow-amber-400/30 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ပရောဂျက်အသစ် ထည့်မည်</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* STATS OVERVIEW CARDS (My Portfolio Mode) */}
      {currentMode === "my_portfolio" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{projects.length}</p>
              <p className="text-xs text-slate-400 font-medium">စုစုပေါင်း ပရောဂျက်</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {projects.filter(p => p.visibility === "Public").length}
              </p>
              <p className="text-xs text-slate-400 font-medium">Public (အများမြင်)</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {projects.filter(p => p.visibility === "Private").length}
              </p>
              <p className="text-xs text-slate-400 font-medium">Private (ကိုယ်ပိုင်)</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {projects.reduce((acc, curr) => acc + (curr.likes || 0), 0)}
              </p>
              <p className="text-xs text-slate-400 font-medium">စုစုပေါင်း Likes</p>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ရှာဖွေရန် ခေါင်းစဉ်၊ ဘာသာစကား..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Language filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">🌐 All Languages</option>
              {AVAILABLE_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            {/* Type filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">📂 All Project Types</option>
              <option value="Mini Project">Mini Project</option>
              <option value="Final Project">Final Project</option>
              <option value="Personal Project">Personal Project</option>
              <option value="Assignment Showcase">Assignment Showcase</option>
            </select>

            {/* Difficulty filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">⚡ All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Professional">Professional</option>
            </select>

            {currentMode === "my_portfolio" && (
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">👁️ All Visibility</option>
                <option value="Public">Public Only</option>
                <option value="Private">Private Only</option>
              </select>
            )}

            <button
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                featuredOnly
                  ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Featured</span>
            </button>
          </div>
        </div>
      </div>

      {/* PROJECT GRID DISPLAY */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Portfolio Projects များကို ရယူနေပါသည်...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {currentMode === "my_portfolio" ? "ပရောဂျက် မရှိသေးပါ" : "ရှာဖွေမှု ရလဒ် မတွေ့ရှိပါ"}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {currentMode === "my_portfolio"
                ? "သင်၏ ပထမဆုံး Mini Project သို့မဟုတ် Final Project ကို 'ပရောဂျက်အသစ် ထည့်မည်' ခလုတ်နှိပ်ကာ စတင်ထည့်သွင်းပါ။"
                : "အခြား ရှာဖွေမှု စကားလုံး သို့မဟုတ် Filter များ ပြောင်းလဲကာ ပြန်လည် စမ်းသပ်ကြည့်ပါခင်ဗျာ။"}
            </p>
          </div>
          {currentMode === "my_portfolio" && (
            <button
              onClick={() => handleOpenEditor()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-all inline-flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ပရောဂျက်အသစ် ဖန်တီးမည်</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="group bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Media Header / Image */}
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  {proj.screenshot ? (
                    <img
                      src={proj.screenshot}
                      alt={proj.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                      <FolderGit2 className="w-10 h-10 mb-2 text-blue-500/50" />
                      <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">Code Learn Portfolio</span>
                    </div>
                  )}

                  {/* Top Badges overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md ${
                      proj.visibility === "Public"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-purple-600/90 text-white"
                    }`}>
                      {proj.visibility === "Public" ? "🌐 Public" : "🔒 Private"}
                    </span>

                    {proj.isFeatured && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 shadow-md flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-slate-900" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 space-y-3">
                  {/* Category & Date */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span className="text-blue-500 dark:text-blue-400 font-bold">{proj.projectType}</span>
                    <span className="font-mono">{proj.completionDate || "Recently"}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
                    {proj.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Tech Stack Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.languages?.slice(0, 3).map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono"
                      >
                        {lang}
                      </span>
                    ))}
                    {proj.frameworks?.slice(0, 2).map((fw) => (
                      <span
                        key={fw}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium font-mono"
                      >
                        {fw}
                      </span>
                    ))}
                  </div>

                  {/* Student Author info if Public Showcase Mode */}
                  {currentMode === "public_showcase" && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                          {proj.studentName?.charAt(0) || "S"}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {proj.studentName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-400">
                        <button
                          onClick={() => handleLike(proj.id)}
                          className={`flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer ${
                            proj.likedBy?.includes(user.uid) ? "text-red-500 font-bold" : ""
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${proj.likedBy?.includes(user.uid) ? "fill-red-500" : ""}`} />
                          <span>{proj.likes || 0}</span>
                        </button>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{proj.views || 1}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-500 text-xs font-bold transition-all flex items-center space-x-1"
                      title="GitHub Repo"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Repo</span>
                    </a>
                  )}

                  {proj.liveDemoUrl && (
                    <a
                      href={proj.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Demo</span>
                    </a>
                  )}
                </div>

                {/* Owner or Admin Action Buttons */}
                <div className="flex items-center space-x-1">
                  {/* Admin Feature Button */}
                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => handleAdminToggleFeature(proj.id, !!proj.isFeatured)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        proj.isFeatured ? "bg-amber-400/20 text-amber-500" : "text-slate-400 hover:text-amber-500"
                      }`}
                      title={proj.isFeatured ? "Unfeature Project" : "Feature Project"}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}

                  {/* Owner Edit and Delete */}
                  {(proj.uid === user.uid || isTeacherOrAdmin) && (
                    <>
                      <button
                        onClick={() => handleOpenEditor(proj)}
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(proj.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PORTFOLIO PROJECT EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingProject ? "Portfolio Project ပြင်ဆင်ရန်" : "Portfolio Project အသစ်ထည့်သွင်းရန်"}
                  </h3>
                  <p className="text-xs text-slate-400">ကျောင်းသားရေးရာ ကိုယ်ပိုင် အမှတ်တံဆိပ် တည်ဆောက်ပါ</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* AI Assistant Button inside modal */}
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kibo AI Assistant</span>
                </button>

                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProject} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSaveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Portfolio Project အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီခင်ဗျာ!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Project Title (ခေါင်းစဉ်) *</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiModalOpen(true);
                        setAiMode("suggest_title");
                      }}
                      className="text-[11px] text-purple-500 hover:underline flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Kibo Title Ideas</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="ဥပမာ - Python Grade Calculator & Student Manager"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>

                {/* Project Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Project Category (အမျိုးအစား)
                  </label>
                  <select
                    value={formProjectType}
                    onChange={(e) => setFormProjectType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="Mini Project">Mini Project</option>
                    <option value="Final Project">Final Project</option>
                    <option value="Personal Project">Personal Project</option>
                    <option value="Assignment Showcase">Assignment Showcase</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Difficulty Level (ခက်ခဲမှု)
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="Beginner">Beginner (အခြေခံ)</option>
                    <option value="Intermediate">Intermediate (အလယ်အလတ်)</option>
                    <option value="Advanced">Advanced (အဆင့်မြင့်)</option>
                    <option value="Professional">Professional (ကျွမ်းကျင်)</option>
                  </select>
                </div>

                {/* Status & Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Project Status (အခြေအနေ)
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="Completed">Completed (ပြီးစီးပြီး)</option>
                    <option value="In Progress">In Progress (လုပ်ဆောင်ဆဲ)</option>
                    <option value="Draft">Draft (မူကြမ်း)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Completion Date (ပြီးစီးသည့် ရက်စွဲ)
                  </label>
                  <input
                    type="date"
                    value={formCompletionDate}
                    onChange={(e) => setFormCompletionDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Project Description (အသေးစိတ် ရှင်းလင်းချက်) *
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAiModalOpen(true);
                          setAiMode("description");
                        }}
                        className="text-[11px] text-purple-500 hover:underline flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Write with AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAiModalOpen(true);
                          setAiMode("improve_text");
                        }}
                        className="text-[11px] text-blue-500 hover:underline flex items-center space-x-1"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Improve Text</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="ပရောဂျက်၏ ရည်ရွယ်ချက်၊ ပါဝင်သော Function များ၊ လေ့လာသိရှိခဲ့ရသော အချက်များကို ရေးသားပါ..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    required
                  />
                </div>

                {/* Languages Selection */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Programming Languages (အသုံးပြုထားသော ဘာသာစကားများ)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleToggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                          formLanguages.includes(lang)
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={formCustomLanguage}
                      onChange={(e) => setFormCustomLanguage(e.target.value)}
                      placeholder="အခြား ဘာသာစကား (e.g. Go, Rust)"
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomLanguage}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-xs font-bold"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Frameworks Selection */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Frameworks & Libraries (အသုံးပြုထားသော Framework များ)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_FRAMEWORKS.map(fw => (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => handleToggleFramework(fw)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                          formFrameworks.includes(fw)
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {fw}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={formCustomFramework}
                      onChange={(e) => setFormCustomFramework(e.target.value)}
                      placeholder="အခြား Framework (e.g. Next.js, Django)"
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFramework}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-xs font-bold"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Project Screenshot / Thumbnail
                  </label>
                  <div className="flex items-center space-x-4">
                    {formScreenshot ? (
                      <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                        <img src={formScreenshot} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormScreenshot("")}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold">Upload Image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}

                    <div className="flex-1 space-y-1">
                      <input
                        type="url"
                        value={formScreenshot}
                        onChange={(e) => setFormScreenshot(e.target.value)}
                        placeholder="သို့မဟုတ် Image URL ထည့်သွင်းပါ (https://...)"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                      />
                      <p className="text-[10px] text-slate-400">စခရင်ရှော့ ပုံရိပ်ပါရှိပါက ကြည့်ရှုသူများ ပိုမို စိတ်ဝင်စားပါမည်။</p>
                    </div>
                  </div>
                </div>

                {/* GitHub Repo & Live Demo Links */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>GitHub Repository URL</span>
                  </label>
                  <input
                    type="url"
                    value={formGithubUrl}
                    onChange={(e) => setFormGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    <span>Live Demo Link</span>
                  </label>
                  <input
                    type="url"
                    value={formLiveDemoUrl}
                    onChange={(e) => setFormLiveDemoUrl(e.target.value)}
                    placeholder="https://my-app.vercel.app"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-mono"
                  />
                </div>

                {/* Visibility Toggle */}
                <div className="space-y-2 md:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-purple-500" />
                    <span>Visibility Setting (မြင်နိုင်စွမ်း ဆက်တင်)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Private သတ်မှတ်ပါက သင့်ကိုယ်ပိုင် အကောင့်တစ်ခုတည်း၌သာ မြင်ရမည်ဖြစ်ပြီး Public Showcase ၌ ပေါ်မည် မဟုတ်ပါခင်ဗျာ။
                  </p>
                  <div className="flex items-center space-x-4 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="Public"
                        checked={formVisibility === "Public"}
                        onChange={() => setFormVisibility("Public")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-white">🌐 Public (အများမြင်နိုင်သည်)</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="Private"
                        checked={formVisibility === "Private"}
                        onChange={() => setFormVisibility("Private")}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-white">🔒 Private (ကိုယ်ပိုင်သာ)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  မလုပ်ဆောင်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {editingProject ? "ပြင်ဆင်မှုများ သိမ်းမည်" : "Portfolio သို့ ထည့်သွင်းမည်"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KIBO AI PORTFOLIO ASSISTANT MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Kibo AI Portfolio Advisor</h3>
                  <p className="text-xs text-purple-100">ပရိုဖက်ရှင်နယ် Portfolio ဖန်တီးနိုင်ရေး ကူညီပေးပါမည်</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Assistant Navigation Modes */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
              <button
                onClick={() => handleCallKiboAi("description")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  aiMode === "description" ? "bg-purple-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto Description</span>
              </button>

              <button
                onClick={() => handleCallKiboAi("improve_text")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  aiMode === "improve_text" ? "bg-purple-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Improve Text</span>
              </button>

              <button
                onClick={() => handleCallKiboAi("suggest_title")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  aiMode === "suggest_title" ? "bg-purple-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Title Ideas</span>
              </button>

              <button
                onClick={() => handleCallKiboAi("recommendations")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  aiMode === "recommendations" ? "bg-purple-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Portfolio Audit</span>
              </button>
            </div>

            {/* AI Body Output Area */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {isAiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Kibo AI က သင့်ပရောဂျက်အတွက် စိစစ်ဆန်းစစ်နေပါသည်...
                  </p>
                </div>
              ) : !aiOutput ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-slate-500">
                    အထက်ပါ Mode များမှ မိမိလိုအပ်သော AI အကူအညီကို ရွေးချယ်ပါခင်ဗျာ။
                  </p>
                  <button
                    onClick={() => handleCallKiboAi(aiMode)}
                    className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    AI စတင် အသုံးပြုမည်
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  {/* Mode: Description */}
                  {aiMode === "description" && aiOutput.suggestedDescription && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-300 font-mono">
                          Suggested Project Description
                        </span>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {aiOutput.suggestedDescription}
                        </p>
                      </div>

                      {aiOutput.keyFeatures && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Key Features:</span>
                          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            {aiOutput.keyFeatures.map((f: string, i: number) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={() => applyAiSuggestedDescription(aiOutput.suggestedDescription)}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>ဤ Description ကို Form ထဲသို့ အသုံးပြုမည်</span>
                      </button>
                    </div>
                  )}

                  {/* Mode: Suggest Title */}
                  {aiMode === "suggest_title" && aiOutput.suggestedTitles && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">{aiOutput.reasoning}</p>
                      <div className="space-y-2">
                        {aiOutput.suggestedTitles.map((t: string, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                          >
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{t}</span>
                            <button
                              onClick={() => applyAiSuggestedTitle(t)}
                              className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold"
                            >
                              အသုံးပြုမည်
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode: Improve Text */}
                  {aiMode === "improve_text" && aiOutput.improvedText && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-300 font-mono">
                          Improved Recruitment-Ready Version
                        </span>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {aiOutput.improvedText}
                        </p>
                      </div>

                      <button
                        onClick={() => applyAiSuggestedDescription(aiOutput.improvedText)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md"
                      >
                        ဤ ပြင်ဆင်ထားသော စာသားအား ထည့်သွင်းမည်
                      </button>
                    </div>
                  )}

                  {/* Mode: Recommendations */}
                  {aiMode === "recommendations" && aiOutput.recommendations && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">Portfolio Completeness Score:</span>
                        <span className="text-lg font-extrabold text-amber-500 font-mono">{aiOutput.completenessScore}%</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">အကြံပြုချက်များ:</span>
                        {aiOutput.recommendations.map((r: string, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
