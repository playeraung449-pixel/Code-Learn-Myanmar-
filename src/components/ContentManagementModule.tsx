import React, { useState, useEffect, useMemo } from "react";
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  Archive, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileText, 
  Video, 
  Code, 
  HelpCircle, 
  Award, 
  Sparkles, 
  Clock, 
  BarChart2, 
  History, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Play, 
  Save, 
  RefreshCw, 
  Crown, 
  Tag, 
  GraduationCap, 
  GripVertical,
  CheckSquare,
  AlertTriangle,
  Send,
  FileCode,
  Image as ImageIcon,
  ListOrdered,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users
} from "lucide-react";
import { 
  Course, 
  Lesson, 
  CourseModule, 
  ContentVersion, 
  QuizQuestion, 
  MiniExercise, 
  UserProfile 
} from "../types";
import { saveCourseToDb, deleteCourseFromDb, addPaymentAuditLog } from "../lib/db";

interface ContentManagementModuleProps {
  courses: Course[];
  adminUser: UserProfile;
  onRefreshData: () => Promise<void>;
}

export default function ContentManagementModule({
  courses,
  adminUser,
  onRefreshData
}: ContentManagementModuleProps) {
  // State for search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedAccess, setSelectedAccess] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Selected Course for Editing
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "modules" | "validation" | "preview" | "history" | "analytics">("info");
  
  // Lesson Editor State (Inside Course Editor)
  const [editingLesson, setEditingLesson] = useState<{
    lesson: Lesson;
    moduleId?: string;
    isNew?: boolean;
  } | null>(null);
  const [lessonTab, setLessonTab] = useState<"general" | "content" | "exercise" | "quiz" | "assignment" | "access">("general");

  // Module Modal
  const [editingModule, setEditingModule] = useState<{
    module: CourseModule;
    isNew?: boolean;
  } | null>(null);

  // Version History Modal/Input
  const [versionSummaryInput, setVersionSummaryInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Notification helper
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = selectedCategory === "all" || c.category === selectedCategory;
      const matchLang = selectedLanguage === "all" || (c.programmingLanguage || "").toLowerCase() === selectedLanguage.toLowerCase();
      const matchDiff = selectedDifficulty === "all" || c.difficulty === selectedDifficulty;
      const matchAccess = selectedAccess === "all" || (selectedAccess === "premium" ? c.isPremium : !c.isPremium);
      const matchStatus = selectedStatus === "all" || (c.status || "Published") === selectedStatus;

      return matchSearch && matchCat && matchLang && matchDiff && matchAccess && matchStatus;
    });
  }, [courses, searchQuery, selectedCategory, selectedLanguage, selectedDifficulty, selectedAccess, selectedStatus]);

  // Overall KPI Statistics
  const kpiStats = useMemo(() => {
    const totalCourses = courses.length;
    let totalLessons = 0;
    let totalQuizzes = 0;
    let publishedCount = 0;
    let draftCount = 0;
    let premiumCount = 0;

    courses.forEach(c => {
      totalLessons += c.lessons ? c.lessons.length : 0;
      totalQuizzes += c.quizzesCount || 0;
      const status = c.status || "Published";
      if (status === "Published") publishedCount++;
      if (status === "Draft" || status === "Under Review") draftCount++;
      if (c.isPremium) premiumCount++;
    });

    return { totalCourses, totalLessons, totalQuizzes, publishedCount, draftCount, premiumCount };
  }, [courses]);

  // Create New Empty Course
  const handleCreateNewCourse = () => {
    const newCourse: Course = {
      id: `course_${Date.now()}`,
      title: "Course အသစ် (Untitled Course)",
      slug: `course-${Date.now()}`,
      description: "သင်တန်းအသေးစိတ် ဖော်ပြချက် ရေးသားပါ။",
      category: "basics",
      lessonCount: 0,
      difficulty: "Level 1: Beginner",
      estimatedTime: "2 Hours",
      lessons: [],
      modules: [],
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
      programmingLanguage: "Python",
      isPremium: false,
      status: "Draft",
      projectCount: 1,
      prerequisites: ["ကွန်ပျူတာ အခြေခံ အသုံးပြုတတ်ရပါမည်။"],
      learningOutcomes: ["ပရိုဂရမ်မင်း အခြေခံသဘောတရားများကို နားလည်သဘောပေါက်ခြင်း"],
      certificateAvailable: true,
      introduction: "ဤသင်တန်းသည် ပရိုဂရမ်မင်း အခြေခံ စတင်လေ့လာသူများအတွက် ဖြစ်ပါသည်။",
      roadmap: [
        { step: "၁", title: "အခြေခံ မိတ်ဆက်", description: "အခြေခံ သဘောတရား လေ့လာခြင်း" }
      ],
      quizzesCount: 0,
      assignmentsCount: 0,
      finalProject: {
        title: "အပြီးသတ် ပရောဂျက် (Final Project)",
        description: "သင်တန်းပါ အကြောင်းအရာများကို အသုံးချ၍ ပရောဂျက် ရေးသားပါ။",
        guide: ["အဆင့် ၁ - ပရောဂျက် တည်ဆောက်ပါ"],
        startingCode: `# Write your code here`,
        solutionCode: `print("Hello World")`
      },
      courseSummary: "သင်တန်း အနှစ်ချုပ် ဖော်ပြချက်",
      versionHistory: [
        {
          versionNumber: "v1.0",
          changedBy: adminUser.name || "Admin",
          changedByUid: adminUser.uid,
          changedDate: new Date().toISOString(),
          changeSummary: "Initial Course Creation Draft"
        }
      ]
    };

    setActiveCourse(newCourse);
    setActiveTab("info");
  };

  // Save Course Changes
  const handleSaveCourse = async (courseToSave: Course, summary: string = "Course Update") => {
    setIsSaving(true);
    try {
      const newVersion: ContentVersion = {
        versionNumber: `v1.${(courseToSave.versionHistory?.length || 0) + 1}`,
        changedBy: adminUser.name || "Administrator",
        changedByUid: adminUser.uid,
        changedDate: new Date().toISOString(),
        changeSummary: summary
      };

      const updatedHistory = [newVersion, ...(courseToSave.versionHistory || [])];
      const finalCourse = { ...courseToSave, versionHistory: updatedHistory };

      await saveCourseToDb(finalCourse);
      await addPaymentAuditLog(
        "policy",
        finalCourse.id,
        `CMS: Saved course "${finalCourse.title}"`,
        adminUser.name || "Admin",
        adminUser.uid,
        `Course status: ${finalCourse.status}, Lessons count: ${finalCourse.lessons?.length || 0}`
      );

      setActiveCourse(finalCourse);
      await onRefreshData();
      showToast(`" ${finalCourse.title} " အား အောင်မြင်စွာ သိမ်းဆည်းလိုက်ပါပြီ!`);
    } catch (err) {
      console.error("Save course error:", err);
      showToast("Course သိမ်းဆည်းစဉ် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Duplicate Course
  const handleDuplicateCourse = async (c: Course) => {
    if (!window.confirm(`" ${c.title} " ကို ပွားယူ (Duplicate) ရန် သေချာပါသလား?`)) return;

    const duplicated: Course = {
      ...c,
      id: `course_copy_${Date.now()}`,
      title: `${c.title} (Copy)`,
      slug: `${c.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: "Draft",
      versionHistory: [
        {
          versionNumber: "v1.0",
          changedBy: adminUser.name || "Admin",
          changedByUid: adminUser.uid,
          changedDate: new Date().toISOString(),
          changeSummary: `Duplicated from ${c.title}`
        }
      ]
    };

    await saveCourseToDb(duplicated);
    await onRefreshData();
    showToast(`" ${duplicated.title} " အဖြစ် ပွားယူပြီးပါပြီ!`);
  };

  // Delete / Archive Course
  const handleDeleteCourse = async (c: Course) => {
    if (!window.confirm(`" ${c.title} " အား စနစ်မှ ဖျက်ဆီး/အပြီးတိုင် ဖယ်ရှားရန် သေချာပါသလား?`)) return;

    await deleteCourseFromDb(c.id);
    await onRefreshData();
    if (activeCourse?.id === c.id) setActiveCourse(null);
    showToast(`" ${c.title} " အား စနစ်မှ ဖျက်ဆီးပြီးပါပြီ!`);
  };

  // Toggle Publish Status
  const handleTogglePublishStatus = async (c: Course) => {
    const nextStatus = c.status === "Published" ? "Unpublished" : "Published";
    const updated = { ...c, status: nextStatus as any };
    await handleSaveCourse(updated, `Status changed to ${nextStatus}`);
  };

  // Validation Checks for Publishing Checklist
  const publicationValidation = useMemo(() => {
    if (!activeCourse) return null;

    const checks = [
      {
        id: "title_desc",
        label: "Course Title & Description (ခေါင်းစဉ်နှင့် ဖော်ပြချက် ပြည့်စုံမှု)",
        passed: Boolean(activeCourse.title && activeCourse.description && activeCourse.introduction),
        details: activeCourse.title ? "ခေါင်းစဉ်နှင့် အသေးစိတ် ဖော်ပြချက် ထည့်သွင်းပြီးပါပြီ" : "ခေါင်းစဉ် မပြည့်စုံသေးပါ"
      },
      {
        id: "lessons_count",
        label: "Content Availability (အနည်းဆုံး သင်ခန်းစာ ၁ ခု ပါဝင်မှု)",
        passed: (activeCourse.lessons?.length || 0) > 0,
        details: `စုစုပေါင်း သင်ခန်းစာ ${activeCourse.lessons?.length || 0} ခု ရှိပါသည်`
      },
      {
        id: "lesson_order",
        label: "Lesson Order & Structure (သင်ခန်းစာများ အစီအစဉ် ကျနမှု)",
        passed: activeCourse.lessons.every((l, idx) => (l.orderNumber ?? idx + 1) > 0),
        details: "သင်ခန်းစာ အစီအစဉ် အမှတ်စဉ်များ သတ်မှတ်ပြီးပါပြီ"
      },
      {
        id: "quiz_config",
        label: "Quiz Integration & Passing Score (စစ်ဆေးမှု မေးခွန်းများနှင့် အောင်မှတ်)",
        passed: activeCourse.lessons.some(l => l.quiz && l.quiz.length > 0 ? l.passingScore !== undefined && l.passingScore >= 50 : true),
        details: "Quiz မေးခွန်းများ ပါဝင်ပါက အောင်မှတ် Passing Score (50%-100%) သတ်မှတ်ထားရှိပါသည်"
      },
      {
        id: "access_config",
        label: "Access Designation (Free / Premium နှင့် Preview သတ်မှတ်ချက်)",
        passed: activeCourse.lessons.every(l => l.accessConfig !== undefined),
        details: "သင်ခန်းစာ တိုင်းအတွက် Access Control Configuration ချိန်ညှိပြီးပါပြီ"
      }
    ];

    const allPassed = checks.every(c => c.passed);
    return { checks, allPassed };
  }, [activeCourse]);

  // Helper for Lesson Save inside Active Course
  const handleSaveLesson = () => {
    if (!editingLesson || !activeCourse) return;

    const { lesson, moduleId, isNew } = editingLesson;
    let updatedLessons = [...(activeCourse.lessons || [])];

    if (isNew) {
      updatedLessons.push({
        ...lesson,
        id: lesson.id || `les_${Date.now()}`,
        orderNumber: lesson.orderNumber || updatedLessons.length + 1
      });
    } else {
      updatedLessons = updatedLessons.map(l => l.id === lesson.id ? lesson : l);
    }

    // Also update module if moduleId present
    let updatedModules = [...(activeCourse.modules || [])];
    if (moduleId) {
      updatedModules = updatedModules.map(m => {
        if (m.id === moduleId) {
          const modLessons = [...(m.lessons || [])];
          if (isNew) {
            modLessons.push(lesson);
          } else {
            const idx = modLessons.findIndex(l => l.id === lesson.id);
            if (idx >= 0) modLessons[idx] = lesson;
            else modLessons.push(lesson);
          }
          return { ...m, lessons: modLessons };
        }
        return m;
      });
    }

    const updatedCourse = {
      ...activeCourse,
      lessons: updatedLessons,
      modules: updatedModules
    };

    setActiveCourse(updatedCourse);
    setEditingLesson(null);
    showToast(`" ${lesson.title} " သင်ခန်းစာ သိမ်းဆည်းပြီးပါပြီ!`);
  };

  // Helper for Module Save
  const handleSaveModule = () => {
    if (!editingModule || !activeCourse) return;

    const { module, isNew } = editingModule;
    let updatedModules = [...(activeCourse.modules || [])];

    if (isNew) {
      updatedModules.push({
        ...module,
        id: module.id || `mod_${Date.now()}`,
        orderNumber: module.orderNumber || updatedModules.length + 1,
        lessons: module.lessons || []
      });
    } else {
      updatedModules = updatedModules.map(m => m.id === module.id ? module : m);
    }

    const updatedCourse = {
      ...activeCourse,
      modules: updatedModules
    };

    setActiveCourse(updatedCourse);
    setEditingModule(null);
    showToast(`Module "${module.title}" သိမ်းဆည်းပြီးပါပြီ!`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center space-x-2 animate-bounce ${
          notification.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-300" 
            : "bg-red-950/90 border-red-500/50 text-red-300"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>Educational Content Management System (သင်ရိုးညွှန်းတမ်း စီမံခန့်ခွဲမှု)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Source Code ပြင်ဆင်ရန် မလိုဘဲ သင်တန်းများ၊ Modules၊ Lessons၊ Quizzes၊ Assignments နှင့် လေ့ကျင့်ခန်းများအား တိုက်ရိုက် ရေးသားဖန်တီး၊ စီမံ၊ ထုတ်ဝေနိုင်ပါသည်။
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefreshData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
            title="Refresh Courses Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreateNewCourse}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Course အသစ် ဖန်တီးမည်</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW KPI METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            Total Courses
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <span className="text-xl font-bold text-slate-100 font-mono mt-2">{kpiStats.totalCourses}</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            Total Lessons
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
          </span>
          <span className="text-xl font-bold text-slate-100 font-mono mt-2">{kpiStats.totalLessons}</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            Published
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          </span>
          <span className="text-xl font-bold text-blue-400 font-mono mt-2">{kpiStats.publishedCount}</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            Draft / Review
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <span className="text-xl font-bold text-amber-400 font-mono mt-2">{kpiStats.draftCount}</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            Premium
            <Crown className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <span className="text-xl font-bold text-amber-400 font-mono mt-2">{kpiStats.premiumCount}</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            Total Quizzes
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
          </span>
          <span className="text-xl font-bold text-slate-100 font-mono mt-2">{kpiStats.totalQuizzes}</span>
        </div>
      </div>

      {/* SEARCH AND MULTI-FIELD FILTER BAR */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Course ခေါင်းစဉ် သို့မဟုတ် ဖော်ပြချက်ဖြင့် ရှာရန်..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Categories (အားလုံး)</option>
              <option value="basics">Basics (အခြေခံ)</option>
              <option value="web">Web Development</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="android">Android</option>
              <option value="database">Database</option>
              <option value="git">Git & GitHub</option>
              <option value="ai">AI Programming</option>
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Languages (အားလုံး)</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="html/css">HTML & CSS</option>
              <option value="java">Java</option>
              <option value="kotlin">Kotlin</option>
              <option value="sql">SQL</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Difficulty (အားလုံး)</option>
              <option value="Level 1: Beginner">Level 1: Beginner</option>
              <option value="Level 2: Basic">Level 2: Basic</option>
              <option value="Level 3: Intermediate">Level 3: Intermediate</option>
              <option value="Level 4: Advanced">Level 4: Advanced</option>
              <option value="Level 5: Professional">Level 5: Professional</option>
            </select>

            <select
              value={selectedAccess}
              onChange={(e) => setSelectedAccess(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Access (အားလုံး)</option>
              <option value="free">Free Courses Only</option>
              <option value="premium">Premium Courses Only</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Status (အားလုံး)</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Unpublished">Unpublished</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* COURSE LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">ရှာဖွေမှုနှင့် ကိုက်ညီသော သင်တန်းများ မရှိပါ</p>
            <button
              onClick={handleCreateNewCourse}
              className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
            >
              Course အသစ် ဖန်တီးမည်
            </button>
          </div>
        ) : (
          filteredCourses.map((c) => {
            const status = c.status || "Published";
            return (
              <div
                key={c.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative h-36 bg-slate-950 overflow-hidden">
                    <img
                      src={c.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80"}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

                    {/* Status Pill */}
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                        status === "Published"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : status === "Draft"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-slate-800/80 text-slate-400 border-slate-700"
                      }`}>
                        {status}
                      </span>

                      {c.isPremium && (
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>PREMIUM</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-slate-900/80 text-slate-300 text-[10px] font-mono rounded-lg border border-slate-700">
                        {c.programmingLanguage || "General"}
                      </span>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                        {c.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{c.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                    </div>

                    {/* Metrics Row */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.lessons?.length || c.lessonCount || 0} Lessons</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.estimatedTime || "2 Hours"}</span>
                      </span>
                      <span className="text-amber-400 font-bold">{c.difficulty?.split(":")[0] || "Level 1"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Bar */}
                <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-1">
                  <button
                    onClick={() => {
                      setActiveCourse(c);
                      setActiveTab("info");
                    }}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all border border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit / Manage</span>
                  </button>

                  <button
                    onClick={() => handleTogglePublishStatus(c)}
                    className={`p-1.5 rounded-lg border text-xs ${
                      status === "Published"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    }`}
                    title={status === "Published" ? "Unpublish Course" : "Publish Course"}
                  >
                    {status === "Published" ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDuplicateCourse(c)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                    title="Duplicate Course"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteCourse(c)}
                    className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg border border-slate-700 hover:border-red-500/30"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE COURSE EDITOR MODAL / DRAWER */}
      {/* ========================================================================= */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                    <span>{activeCourse.title}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-mono rounded-full">
                      {activeCourse.status || "Draft"}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">ID: {activeCourse.id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSaveCourse(activeCourse, "Manual Admin Save")}
                  disabled={isSaving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Save Course Changes"}</span>
                </button>
                <button
                  onClick={() => setActiveCourse(null)}
                  className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editor Tabs Header */}
            <div className="flex items-center space-x-1 bg-slate-950 px-4 pt-2 border-b border-slate-800 overflow-x-auto">
              {[
                { id: "info", label: "Course Info", icon: FileText },
                { id: "modules", label: "Curriculum & Lessons", icon: Layers },
                { id: "validation", label: "Publishing Checklist", icon: ShieldCheck },
                { id: "preview", label: "Student Preview", icon: Eye },
                { id: "history", label: "Version History", icon: History },
                { id: "analytics", label: "Analytics", icon: BarChart2 }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center space-x-2 transition-all shrink-0 ${
                      isActive
                        ? "bg-slate-900 text-amber-400 border-t-2 border-amber-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: COURSE INFO & METADATA */}
              {activeTab === "info" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title (သင်တန်းခေါင်းစဉ်)</label>
                      <input
                        type="text"
                        value={activeCourse.title}
                        onChange={(e) => setActiveCourse({ ...activeCourse, title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={activeCourse.slug}
                        onChange={(e) => setActiveCourse({ ...activeCourse, slug: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Category (အမျိုးအစား)</label>
                      <select
                        value={activeCourse.category}
                        onChange={(e) => setActiveCourse({ ...activeCourse, category: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="basics">Basics (အခြေခံ)</option>
                        <option value="web">Web Development</option>
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                        <option value="android">Android</option>
                        <option value="database">Database</option>
                        <option value="git">Git & GitHub</option>
                        <option value="deployment">Deployment</option>
                        <option value="ai">AI Programming</option>
                        <option value="career">Career Path</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Programming Language</label>
                      <input
                        type="text"
                        value={activeCourse.programmingLanguage || ""}
                        placeholder="e.g. Python, JavaScript, HTML/CSS, Kotlin, SQL"
                        onChange={(e) => setActiveCourse({ ...activeCourse, programmingLanguage: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty Level (ခက်ခဲမှုအဆင့်)</label>
                      <select
                        value={activeCourse.difficulty}
                        onChange={(e) => setActiveCourse({ ...activeCourse, difficulty: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Level 1: Beginner">Level 1: Beginner</option>
                        <option value="Level 2: Basic">Level 2: Basic</option>
                        <option value="Level 3: Intermediate">Level 3: Intermediate</option>
                        <option value="Level 4: Advanced">Level 4: Advanced</option>
                        <option value="Level 5: Professional">Level 5: Professional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Time (ခန့်မှန်းကြာချိန်)</label>
                      <input
                        type="text"
                        value={activeCourse.estimatedTime}
                        onChange={(e) => setActiveCourse({ ...activeCourse, estimatedTime: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Publication Status (ထုတ်ဝေမှုအခြေအနေ)</label>
                      <select
                        value={activeCourse.status || "Draft"}
                        onChange={(e) => setActiveCourse({ ...activeCourse, status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-bold"
                      >
                        <option value="Draft">Draft (မူကြမ်း - Students ထံမပြပါ)</option>
                        <option value="Under Review">Under Review (စစ်ဆေးဆဲ)</option>
                        <option value="Published">Published (ထုတ်ဝေပြီး)</option>
                        <option value="Unpublished">Unpublished (ခေတ္တပိတ်ထားသည်)</option>
                        <option value="Archived">Archived (သိမ်းဆည်းထားသည်)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Access Level (ဝင်ရောက်ကြည့်ရှုခွင့်)</label>
                      <div className="flex items-center space-x-4 pt-1">
                        <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeCourse.isPremium || false}
                            onChange={(e) => setActiveCourse({ ...activeCourse, isPremium: e.target.checked })}
                            className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="font-bold text-amber-400">Requires Premium Membership</span>
                        </label>

                        <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeCourse.certificateAvailable ?? true}
                            onChange={(e) => setActiveCourse({ ...activeCourse, certificateAvailable: e.target.checked })}
                            className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                          />
                          <span>Issuable Certificate</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Thumbnail Image URL</label>
                    <input
                      type="text"
                      value={activeCourse.thumbnail || ""}
                      onChange={(e) => setActiveCourse({ ...activeCourse, thumbnail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Course Description (သင်တန်းအကျဉ်းချုပ်)</label>
                    <textarea
                      rows={2}
                      value={activeCourse.description}
                      onChange={(e) => setActiveCourse({ ...activeCourse, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Course Introduction (သင်တန်း မိတ်ဆက်)</label>
                    <textarea
                      rows={3}
                      value={activeCourse.introduction}
                      onChange={(e) => setActiveCourse({ ...activeCourse, introduction: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Prerequisites and Outcomes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Prerequisites (ကြိုတင်လိုအပ်ချက်များ - 1 per line)</label>
                      <textarea
                        rows={3}
                        value={(activeCourse.prerequisites || []).join("\n")}
                        onChange={(e) => setActiveCourse({
                          ...activeCourse,
                          prerequisites: e.target.value.split("\n").filter(Boolean)
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Learning Outcomes (ရရှိမည့် သင်ယူမှု ရလဒ်များ - 1 per line)</label>
                      <textarea
                        rows={3}
                        value={(activeCourse.learningOutcomes || []).join("\n")}
                        onChange={(e) => setActiveCourse({
                          ...activeCourse,
                          learningOutcomes: e.target.value.split("\n").filter(Boolean)
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MODULES & LESSONS MANAGEMENT */}
              {activeTab === "modules" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <h3 className="font-bold text-sm text-slate-200">Curriculum Structure (သင်ရိုးမာတိကာ)</h3>
                      <p className="text-xs text-slate-400">Modules နှင့် Lessons များအား အစဉ်လိုက် ဖန်တီး၊ တည်းဖြတ်၊ အစီအစဉ် ပြန်လည်ပြင်ဆင်နိုင်ပါသည်။</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingModule({
                          module: {
                            id: `mod_${Date.now()}`,
                            title: "Module အသစ်",
                            description: "Module အကြောင်းအရာ ရေးသားပါ",
                            orderNumber: (activeCourse.modules?.length || 0) + 1,
                            lessons: []
                          },
                          isNew: true
                        })}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700"
                      >
                        + Module အသစ်
                      </button>

                      <button
                        onClick={() => setEditingLesson({
                          lesson: {
                            id: `les_${Date.now()}`,
                            title: "Lesson အသစ်",
                            slug: `lesson-${Date.now()}`,
                            duration: "30 mins",
                            whatIsIt: "အကြောင်းအရာ ရှင်းလင်းချက်",
                            whyImportant: "အရေးပါပုံ ရှင်းလင်းချက်",
                            realWorldUsage: "လက်တွေ့အသုံးပြုပုံ",
                            syntax: "// Write code syntax here",
                            examples: ["// Code Example"],
                            commonMistakes: [],
                            bestPractices: ["Best Practice Tip"],
                            miniExercise: {
                              id: `ex_${Date.now()}`,
                              instruction: "လေ့ကျင့်ခန်း ညွှန်ကြားချက်",
                              codeTemplate: "# Write code template",
                              expectedOutput: "Expected Output",
                              hints: ["Hint 1"]
                            },
                            quiz: [
                              {
                                id: `q_${Date.now()}`,
                                question: "စမ်းသပ်မေးခွန်း ၁",
                                options: ["Option A", "Option B", "Option C", "Option D"],
                                correctOptionIndex: 0,
                                explanation: "အဖြေမှန် ရှင်းလင်းချက်"
                              }
                            ],
                            miniProject: {
                              title: "Mini Project",
                              description: "Project Description",
                              guide: ["Step 1"],
                              startingCode: "# Code"
                            },
                            status: "Published",
                            passingScore: 80,
                            accessConfig: { accessType: "free" }
                          },
                          isNew: true
                        })}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow"
                      >
                        + Lesson အသစ်
                      </button>
                    </div>
                  </div>

                  {/* Modules List */}
                  {activeCourse.modules && activeCourse.modules.length > 0 && (
                    <div className="space-y-4">
                      {activeCourse.modules.map((mod, modIdx) => (
                        <div key={mod.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                                {mod.orderNumber || modIdx + 1}
                              </span>
                              <h4 className="font-bold text-sm text-slate-100">{mod.title}</h4>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingModule({ module: mod, isNew: false })}
                                className="p-1 text-slate-400 hover:text-amber-400"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const updated = activeCourse.modules?.filter(m => m.id !== mod.id);
                                  setActiveCourse({ ...activeCourse, modules: updated });
                                }}
                                className="p-1 text-slate-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400">{mod.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lessons Table */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-3 bg-slate-900 border-b border-slate-800 font-bold text-xs text-slate-300 flex items-center justify-between">
                      <span>Course Lessons ({activeCourse.lessons?.length || 0})</span>
                      <span className="text-[10px] text-slate-500">Order & Status</span>
                    </div>

                    <div className="divide-y divide-slate-800/60">
                      {(activeCourse.lessons || []).length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                          သင်ခန်းစာ မရှိသေးပါ - "+ Lesson အသစ်" နှိပ်၍ ထည့်သွင်းပါ
                        </div>
                      ) : (
                        activeCourse.lessons.map((les, idx) => (
                          <div key={les.id} className="p-3 hover:bg-slate-900/50 flex items-center justify-between text-xs transition-colors">
                            <div className="flex items-center space-x-3">
                              <span className="w-6 h-6 bg-slate-900 text-slate-400 font-mono text-[11px] font-bold rounded-lg flex items-center justify-center border border-slate-800">
                                {les.orderNumber || idx + 1}
                              </span>
                              <div>
                                <p className="font-bold text-slate-200">{les.title}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{les.duration} • Quiz: {les.quiz?.length || 0} questions</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                les.accessConfig?.accessType === "free" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                              }`}>
                                {les.accessConfig?.accessType || "free"}
                              </span>

                              <span className="px-2 py-0.5 bg-slate-900 text-slate-400 rounded-full text-[10px] border border-slate-800">
                                {les.status || "Published"}
                              </span>

                              <button
                                onClick={() => setEditingLesson({ lesson: les, isNew: false })}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700"
                              >
                                Edit Lesson
                              </button>

                              <button
                                onClick={() => {
                                  const updated = activeCourse.lessons.filter(l => l.id !== les.id);
                                  setActiveCourse({ ...activeCourse, lessons: updated });
                                }}
                                className="p-1 text-slate-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PUBLISHING CHECKLIST */}
              {activeTab === "validation" && publicationValidation && (
                <div className="space-y-6">
                  <div className={`p-5 rounded-2xl border ${
                    publicationValidation.allPassed 
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : "bg-amber-950/30 border-amber-500/40 text-amber-300"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {publicationValidation.allPassed ? (
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-8 h-8 text-amber-400" />
                        )}
                        <div>
                          <h3 className="font-bold text-base">
                            {publicationValidation.allPassed 
                              ? "Publishing Readiness Verified! (ထုတ်ဝေရန် အဆင့်သင့်ဖြစ်ပါပြီ)"
                              : "Publication Requirements Pending (စစ်ဆေးချက်အချို့ လိုအပ်နေပါသေးသည်)"}
                          </h3>
                          <p className="text-xs opacity-80 mt-0.5">
                            ကျောင်းသားများထံ မထုတ်ဝေမီ စနစ်မှ လိုအပ်ချက်များအား အလိုအလျောက် စစ်ဆေးထားပါသည်။
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const nextStatus = publicationValidation.allPassed ? "Published" : "Draft";
                          handleSaveCourse({ ...activeCourse, status: nextStatus }, "Status updated via Validation Checklist");
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                          publicationValidation.allPassed
                            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                            : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                        }`}
                      >
                        {activeCourse.status === "Published" ? "Keep Published" : "Publish Course Now"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {publicationValidation.checks.map(check => (
                      <div
                        key={check.id}
                        className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {check.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                          )}
                          <div>
                            <p className="font-bold text-xs text-slate-200">{check.label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{check.details}</p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          check.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {check.passed ? "PASSED" : "PENDING"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: STUDENT PREVIEW */}
              {activeTab === "preview" && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                    <span>Student View Preview Simulation Mode (ကျောင်းသားမြင်ကွင်း ကြိုတင်ကြည့်ရှုစစ်ဆေးခြင်း)</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px]">Live Render</span>
                  </div>

                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6">
                    <div className="space-y-2 border-b border-slate-800 pb-4">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-full">
                        {activeCourse.category.toUpperCase()}
                      </span>
                      <h1 className="text-2xl font-bold text-slate-100">{activeCourse.title}</h1>
                      <p className="text-xs text-slate-400">{activeCourse.description}</p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-bold text-sm text-slate-200">Course Roadmap & Lessons</h3>
                      <div className="space-y-2">
                        {activeCourse.lessons.map((les, idx) => (
                          <div key={les.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px]">
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-slate-200">{les.title}</span>
                            </div>
                            <span className="text-slate-500 font-mono text-[11px]">{les.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: VERSION HISTORY */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <h3 className="font-bold text-sm text-slate-200">Record New Version Snapshot</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ပြင်ဆင်မှု အကျဉ်းချုပ် ရေးသားပါ (e.g. Added Module 3 & Updated Quizzes)..."
                        value={versionSummaryInput}
                        onChange={(e) => setVersionSummaryInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={async () => {
                          if (!versionSummaryInput.trim()) return;
                          await handleSaveCourse(activeCourse, versionSummaryInput);
                          setVersionSummaryInput("");
                        }}
                        className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                      >
                        Save Snapshot
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-3 bg-slate-900 border-b border-slate-800 font-bold text-xs text-slate-300">
                      Version Changelog History
                    </div>

                    <div className="divide-y divide-slate-800/60">
                      {(activeCourse.versionHistory || []).map((ver, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 font-mono font-bold rounded text-[10px]">
                                {ver.versionNumber}
                              </span>
                              <span className="font-semibold text-slate-200">{ver.changeSummary}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">
                              By {ver.changedBy} on {new Date(ver.changedDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ANALYTICS */}
              {activeTab === "analytics" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold">Lesson Views</span>
                    <p className="text-2xl font-bold text-slate-100 font-mono mt-1">1,248</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold">Completion Rate</span>
                    <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">84.2%</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold">Quiz Performance</span>
                    <p className="text-2xl font-bold text-amber-400 font-mono mt-1">91.5%</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold">Avg Time spent</span>
                    <p className="text-2xl font-bold text-blue-400 font-mono mt-1">42 mins</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LESSON EDITOR MODAL */}
      {/* ========================================================================= */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100">Lesson Editor: {editingLesson.lesson.title}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveLesson}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Save Lesson
                </button>
                <button onClick={() => setEditingLesson(null)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lesson Editor Sub-tabs */}
            <div className="flex items-center space-x-1 bg-slate-950 px-4 pt-2 border-b border-slate-800 overflow-x-auto">
              {[
                { id: "general", label: "Basic Info" },
                { id: "content", label: "Myanmar Content & Code" },
                { id: "exercise", label: "Practice Exercise" },
                { id: "quiz", label: "Quiz Questions" },
                { id: "access", label: "Access & Prerequisites" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setLessonTab(t.id as any)}
                  className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all ${
                    lessonTab === t.id ? "bg-slate-900 text-amber-400 border-t-2 border-amber-500" : "text-slate-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {lessonTab === "general" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Lesson Title</label>
                    <input
                      type="text"
                      value={editingLesson.lesson.title}
                      onChange={(e) => setEditingLesson({
                        ...editingLesson,
                        lesson: { ...editingLesson.lesson, title: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (e.g. 30 mins)</label>
                    <input
                      type="text"
                      value={editingLesson.lesson.duration}
                      onChange={(e) => setEditingLesson({
                        ...editingLesson,
                        lesson: { ...editingLesson.lesson, duration: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {lessonTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">What is it? (ဒါဟာ ဘာလဲ - မြန်မာရှင်းလင်းချက်)</label>
                    <textarea
                      rows={2}
                      value={editingLesson.lesson.whatIsIt}
                      onChange={(e) => setEditingLesson({
                        ...editingLesson,
                        lesson: { ...editingLesson.lesson, whatIsIt: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Syntax Code Example</label>
                    <textarea
                      rows={4}
                      value={editingLesson.lesson.syntax}
                      onChange={(e) => setEditingLesson({
                        ...editingLesson,
                        lesson: { ...editingLesson.lesson, syntax: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {lessonTab === "quiz" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Quiz Questions ({editingLesson.lesson.quiz?.length || 0})</span>
                    <button
                      onClick={() => {
                        const newQ: QuizQuestion = {
                          id: `q_${Date.now()}`,
                          question: "မေးခွန်းအသစ် ရေးသားပါ",
                          options: ["Option A", "Option B", "Option C", "Option D"],
                          correctOptionIndex: 0,
                          explanation: "အဖြေမှန် ရှင်းလင်းချက်"
                        };
                        const quizList = [...(editingLesson.lesson.quiz || []), newQ];
                        setEditingLesson({
                          ...editingLesson,
                          lesson: { ...editingLesson.lesson, quiz: quizList }
                        });
                      }}
                      className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg"
                    >
                      + Question အသစ်
                    </button>
                  </div>

                  {(editingLesson.lesson.quiz || []).map((q, qIdx) => (
                    <div key={q.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-400">Question {qIdx + 1}</span>
                        <button
                          onClick={() => {
                            const updated = editingLesson.lesson.quiz?.filter(item => item.id !== q.id);
                            setEditingLesson({
                              ...editingLesson,
                              lesson: { ...editingLesson.lesson, quiz: updated }
                            });
                          }}
                          className="text-red-400 text-xs hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...(editingLesson.lesson.quiz || [])];
                          updated[qIdx].question = e.target.value;
                          setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, quiz: updated } });
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                      />
                    </div>
                  ))}
                </div>
              )}

              {lessonTab === "access" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Access Type</label>
                    <select
                      value={editingLesson.lesson.accessConfig?.accessType || "free"}
                      onChange={(e) => setEditingLesson({
                        ...editingLesson,
                        lesson: {
                          ...editingLesson.lesson,
                          accessConfig: { ...editingLesson.lesson.accessConfig, accessType: e.target.value as any }
                        }
                      })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                    >
                      <option value="free">Free Access</option>
                      <option value="premium">Premium Only</option>
                      <option value="preview">Preview Allowed</option>
                      <option value="locked">Locked (Prerequisites Required)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE EDITOR MODAL */}
      {/* ========================================================================= */}
      {editingModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100">Module Editor</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Module Title</label>
              <input
                type="text"
                value={editingModule.module.title}
                onChange={(e) => setEditingModule({
                  ...editingModule,
                  module: { ...editingModule.module, title: e.target.value }
                })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Module Description</label>
              <textarea
                rows={3}
                value={editingModule.module.description}
                onChange={(e) => setEditingModule({
                  ...editingModule,
                  module: { ...editingModule.module, description: e.target.value }
                })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setEditingModule(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl">
                Cancel
              </button>
              <button onClick={handleSaveModule} className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl">
                Save Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
