import { useState } from "react";
import { 
  ArrowLeft, 
  Clock, 
  Terminal, 
  Award, 
  CheckCircle2, 
  Play, 
  BookOpen, 
  Layers,
  ChevronRight,
  TrendingUp,
  Sparkles,
  MapPin,
  HelpCircle,
  Code2,
  FileText,
  BookmarkCheck,
  AlertCircle,
  Printer,
  Lock,
  Trophy,
  Send,
  ExternalLink,
  Home
} from "lucide-react";
import { Course, UserProfile } from "../types";
import { Assessment } from "./Assessment";
import TelegramVideoHubModal from "./TelegramVideoHubModal";
import Breadcrumbs from "./Breadcrumbs";

interface CourseDetailsProps {
  course: Course;
  user: UserProfile;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onBack: () => void;
  onStartLearning: (course: Course, lessonIdx: number) => void;
}

export default function CourseDetails({ 
  course, 
  user, 
  onUpdateUser,
  onBack, 
  onStartLearning 
}: CourseDetailsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "projects" | "certificate">("overview");
  const [showTelegramHub, setShowTelegramHub] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<{
    id: string;
    title: string;
    type: "lesson_quiz" | "module_assessment" | "final_assessment";
  } | null>(null);

  const handleLaunchAssessment = (id: string, title: string, type: "lesson_quiz" | "module_assessment" | "final_assessment") => {
    setActiveAssessment({ id, title, type });
  };
  
  // Calculate completion statistics
  const isPremiumUser = user.role === "premium" || user.role === "teacher" || user.role === "admin" || (user as any).isPremium === true;
  const completedSet = new Set(user.completedLessons || []);
  const completedLessonsInCourse = course.lessons.filter(l => completedSet.has(l.id));
  const totalLessonsCount = course.lessons.length || course.lessonCount || 1;
  const progressPercent = Math.round((completedLessonsInCourse.length / totalLessonsCount) * 100);
  const isAllLessonsCompleted = completedLessonsInCourse.length === totalLessonsCount;
  
  // Find first uncompleted lesson index
  const firstUncompletedIdx = course.lessons.findIndex(l => !completedSet.has(l.id));
  const resumeIdx = firstUncompletedIdx === -1 ? 0 : firstUncompletedIdx;

  const handlePrintCertificate = (certId: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate Verification - ${course.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              background-color: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .certificate {
              background: white;
              border: 16px double #1e293b;
              padding: 48px;
              width: 800px;
              text-align: center;
              box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
              position: relative;
            }
            h1 { font-size: 36px; margin-bottom: 8px; color: #1e293b; }
            h2 { font-size: 20px; font-weight: normal; color: #64748b; margin-top: 0; }
            .recipient { font-size: 28px; font-weight: bold; color: #2563eb; margin: 32px 0; border-bottom: 2px solid #e2e8f0; display: inline-block; padding-bottom: 8px; width: 80%; }
            .text { font-size: 16px; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; }
            .footer-info { display: flex; justify-content: space-between; margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 24px; }
            .footer-item { text-align: left; font-size: 14px; color: #64748b; }
            .badge { width: 80px; height: 80px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin: 0 auto 24px auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="badge">CLM PASS</div>
            <h1>CERTIFICATE OF COMPLETION</h1>
            <h2>CODE LEARN MYANMAR</h2>
            <p class="text">This is proudly presented to</p>
            <div class="recipient">${user.name}</div>
            <p class="text">for successfully completing the course <strong>"${course.title}"</strong> and demonstrating professional proficiency in all lessons, mini exercises, and assignments.</p>
            <div class="footer-info">
              <div class="footer-item">
                <strong>Issued Date:</strong> ${new Date().toLocaleDateString()}<br/>
                <strong>Platform:</strong> Code Learn Myanmar
              </div>
              <div class="footer-item" style="text-align: right;">
                <strong>Verification ID:</strong> ${certId}<br/>
                <strong>Status:</strong> VERIFIED ONLINE
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (activeAssessment) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <button
          id="btn-back-from-assessment"
          onClick={() => setActiveAssessment(null)}
          className="flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>သင်ရိုးသို့ ပြန်သွားရန် (Back to Curriculum)</span>
        </button>
        
        <Assessment
          assessmentId={activeAssessment.id}
          assessmentTitle={activeAssessment.title}
          assessmentType={activeAssessment.type}
          courseId={course.id}
          courseTitle={course.title}
          user={user}
          onUpdateUser={(updatedUser) => {
            if (onUpdateUser) {
              onUpdateUser(updatedUser);
            }
          }}
          onComplete={(score, total, passed) => {
            console.log(`Assessment finished: ${score}/${total}, Passed: ${passed}`);
          }}
          onCancel={() => setActiveAssessment(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 text-left animate-fade-in animate-duration-300">
      {/* Breadcrumb & Back navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumbs
          items={[
            {
              label: "Home",
              onClick: onBack,
              icon: Home
            },
            {
              label: "Courses (သင်တန်းများ)",
              onClick: onBack,
              icon: BookOpen
            },
            {
              label: course.category ? course.category.toUpperCase() : "WEB DEV"
            },
            {
              label: course.title,
              isCurrent: true
            }
          ]}
        />
      </div>

      {/* Course Banner Card */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                {course.category.toUpperCase()} CATEGORY
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                {course.difficulty}
              </span>
            </div>

            <h1 className="font-display font-black text-2xl md:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="font-bold">{course.lessonCount} Lessons</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="font-mono">{course.estimatedTime} Estimation</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-300">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>ပြီးမြောက်ပါက လက်မှတ် ရရှိမည် (Certificate)</span>
              </span>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center md:items-end justify-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-xl">
              <Terminal className="w-10 h-10" />
            </div>
            
            <button
              onClick={() => onStartLearning(course, resumeIdx)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-sm text-white shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              id="btn-main-start-learning"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {progressPercent > 0 ? "ဆက်လက်လေ့လာရန် (Resume Learning)" : "စတင်သင်ယူရန် (Start Learning)"}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Telegram Video Delivery Banner */}
      <section className="bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-500/20 dark:border-sky-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/20">
            <Send className="w-5 h-5 transform -rotate-12" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Telegram Video Delivery System
              </h4>
              <span className="text-[9px] font-mono font-bold bg-sky-500/20 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full">
                DATA SAVER
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              ဝက်ဘ်ဆိုက် bandwidth နှင့် ဖုန်းဒေတာ သက်သာစေရန် သင်ခန်းစာ ဗီဒီယိုများကို Telegram (Free & VIP) ချန်နယ်များတွင် တိုက်ရိုက် ကြည့်ရှုနိုင်ပါသည်။
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowTelegramHub(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
            id="btn-open-tg-hub-course"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram Hub & Links</span>
          </button>
          <a
            href="https://t.me/code_Learn_myanmar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            <span>Free Channel</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>

      {/* Progress Bar Component */}
      {progressPercent > 0 && (
        <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm mb-3">
            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>သင်တန်းပြီးစီးမှု တိုးတက်မှု (Your Course Progress)</span>
            </span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {completedLessonsInCourse.length} / {course.lessons.length} Lessons ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>
      )}

      {/* Custom Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-medium">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 border-b-2 transition-all ${activeTab === "overview" ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
          id="tab-course-overview"
        >
          ၁။ မိတ်ဆက်နှင့် လမ်းညွှန် (Overview & Roadmap)
        </button>
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`pb-3 px-4 border-b-2 transition-all ${activeTab === "curriculum" ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
          id="tab-course-curriculum"
        >
          ၂။ သင်ခန်းစာများ (Lessons Curriculum)
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 px-4 border-b-2 transition-all ${activeTab === "projects" ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
          id="tab-course-projects"
        >
          ၃။ လက်တွေ့ပရောဂျက်များ (Mini & Final Projects)
        </button>
        <button
          onClick={() => setActiveTab("certificate")}
          className={`pb-3 px-4 border-b-2 transition-all ${activeTab === "certificate" ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
          id="tab-course-certificate"
        >
          ၄။ အနှစ်ချုပ်နှင့် အသိအမှတ်ပြုလက်မှတ် (Summary & Certificate)
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* Tab 1: Overview Panel */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Introduction Card */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <span>သင်တန်းမိတ်ဆက် (Course Introduction)</span>
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {course.introduction}
                </p>
              </div>

              {/* Roadmap Timeline */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-500" />
                    <span>သင်ယူမှု လမ်းပြမြေပုံ (Learning Roadmap)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    ဤသင်တန်းတွင် လေ့လာသင်ယူရမည့် အဆင့်ဆင့်သော လမ်းကြောင်း ဖြစ်ပါသည်။
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-8 py-2">
                  {course.roadmap.map((step, idx) => (
                    <div key={idx} className="relative">
                      {/* Circle indicator */}
                      <span className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center border-4 border-white dark:border-[#0F172A] shadow-md">
                        {step.step}
                      </span>
                      <div className="space-y-1 pl-4 text-left">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{step.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Info: Prerequisites & Outcomes Box */}
            <div className="lg:col-span-4 space-y-6">
              {/* Prerequisites Card */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                  လိုအပ်ချက်များ (Prerequisites)
                </h4>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learning Outcomes Card */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                  ရရှိမည့် အကျိုးကျေးဇူးများ (Learning Outcomes)
                </h4>
                <ul className="space-y-2">
                  {course.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300">
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Curriculum Panel */}
        {activeTab === "curriculum" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                သင်ခန်းစာများစာရင်း (Lesson Curriculum)
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                ပထမဦးဆုံး သင်ခန်းစာမှ စတင်၍ တစ်ဆင့်ချင်းစီ လိုက်လံကုဒ်ရေးပြီး လေ့လာနိုင်ပါသည် ခင်ဗျာ။
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {course.lessons.map((lesson, idx) => {
                const isCompleted = completedSet.has(lesson.id);
                const isLockedPrereq = idx > 0 && !completedSet.has(course.lessons[idx - 1].id);
                const isLockedPremium = idx >= 2 && !isPremiumUser;
                const isLocked = isLockedPrereq || isLockedPremium;
                const isNextToStudy = idx === resumeIdx && !isLocked;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      if (isLockedPrereq) {
                        return; // Prevent starting if prerequisite locked
                      }
                      if (isLockedPremium) {
                        return; // Handled by upgrade button
                      }
                      onStartLearning(course, idx);
                    }}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-left group ${
                      isCompleted
                        ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer"
                        : isLockedPremium
                        ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30"
                        : isLockedPrereq
                        ? "bg-slate-100/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-80 cursor-not-allowed"
                        : isNextToStudy
                        ? "bg-blue-600/5 dark:bg-blue-600/10 border-blue-500/30 hover:border-blue-500/60 cursor-pointer"
                        : "bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start md:items-center space-x-3.5 min-w-0 flex-1">
                      {/* Lesson Number / Lock / Status Circle */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : isLockedPremium
                          ? "bg-amber-500/20 text-amber-500"
                          : isLockedPrereq
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                          : isNextToStudy
                          ? "bg-blue-600 text-white shadow shadow-blue-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}>
                        {isLockedPremium ? (
                          <span>💎</span>
                        ) : isLockedPrereq ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`font-bold text-sm truncate ${
                            isCompleted
                              ? "text-slate-700 dark:text-slate-300"
                              : isLockedPrereq
                              ? "text-slate-400 dark:text-slate-500 line-through"
                              : isNextToStudy
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-900 dark:text-white"
                          }`}>
                            {lesson.title}
                          </h3>

                          {/* State Badges: Completed, In Progress, Locked, 💎 PREMIUM */}
                          {isCompleted ? (
                            <span className="inline-flex items-center space-x-1 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>COMPLETED (ပြီးမြောက်ပြီး)</span>
                            </span>
                          ) : isLockedPremium ? (
                            <span className="inline-flex items-center space-x-1 text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                              <span>💎 PREMIUM</span>
                            </span>
                          ) : isLockedPrereq ? (
                            <span className="text-[9px] bg-slate-500/15 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> LOCKED (သော့ခတ်ထားပါသည်)
                            </span>
                          ) : isNextToStudy ? (
                            <span className="text-[9px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-mono font-bold animate-pulse flex items-center gap-1">
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>IN PROGRESS (လေ့လာဆဲ)</span>
                            </span>
                          ) : (
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono font-medium">
                              READY TO LEARN
                            </span>
                          )}

                          <span className="inline-flex items-center space-x-1 text-[9px] font-mono font-medium text-sky-600 dark:text-sky-400 bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 px-2 py-0.5 rounded">
                            <Send className="w-2.5 h-2.5" />
                            <span>Telegram Video</span>
                          </span>
                        </div>

                        {isLockedPremium ? (
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <p className="text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1.5">
                                <span>💎 Kibo VIP Premium သီးသန့် သင်ခန်းစာ ဖြစ်ပါသည်</span>
                              </p>
                              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                                ကျန်ရှိသော အဆင့်မြင့်လက်တွေ့သင်ခန်းစာများနှင့် အောင်လက်မှတ်ရယူရန် Premium သို့ အဆင့်မြှင့်တင်ပါ။
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const premiumTabBtn = document.querySelector('[data-tab="premium"]') as HTMLElement;
                                if (premiumTabBtn) premiumTabBtn.click();
                              }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs rounded-lg shadow-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>Upgrade to Premium 👑</span>
                            </button>
                          </div>
                        ) : isLockedPrereq ? (
                          <div className="bg-slate-500/5 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 mt-1.5 space-y-1 text-xs">
                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                              • သော့ဖွင့်ရန် လိုအပ်ချက်: ရှေ့သင်ခန်းစာ <strong className="text-slate-900 dark:text-white">"{course.lessons[idx - 1].title}"</strong> ကို အရင်ဆုံး အောင်မြင်စွာ ပြီးမြောက်အောင် လေ့လာရပါမည်။
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
                            {lesson.whatIsIt}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lesson.duration}</span>
                      </span>

                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : isLockedPremium ? (
                        <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono flex items-center gap-1">
                          <span>💎 PREMIUM</span>
                        </div>
                      ) : isLockedPrereq ? (
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-110 flex items-center justify-center transition-all">
                          <Play className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COURSE & MODULE ASSESSMENTS CORNER */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="font-display font-bold text-base md:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                  <span>ဆန်းစစ်ချက် စာမေးပွဲများ (Module & Course Assessments)</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  အလွတ်ကျက်မှတ်ခြင်းထက် လက်တွေ့နားလည်မှုကို တိုင်းတာသော Intelligent Assessments များဖြစ်ပါသည်။ အဆင့်မြင့် XP ဆုလာဘ်များ ရယူလိုက်ပါ။
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Module Assessment Card */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/30 dark:from-slate-900/40 dark:to-slate-900/10 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-indigo-200/40 dark:border-indigo-800/40">
                        Module Assessment
                      </span>
                      <span className="text-xs text-amber-500 font-bold font-mono flex items-center gap-1">🏆 +100 XP</span>
                    </div>
                    <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                      မော်ဂျူးအဆင့် စွမ်းရည်စစ်ဆေးချက် (Module 1 Assessment)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      မော်ဂျူး၏ အဓိက သီအိုရီများနှင့် syntax တည်ဆောက်ပုံများကို ပြည့်စုံစွာ ဆန်းစစ်စစ်ဆေးမည် ဖြစ်သည်။
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      handleLaunchAssessment(
                        `${course.id}-module-assessment`,
                        `${course.title}: Module 1 Comprehensive Assessment`,
                        "module_assessment"
                      );
                    }}
                    className="w-full text-center py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-sans text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm hover:translate-y-[-1px]"
                  >
                    ဆန်းစစ်ချက် စတင်မည် (Start Assessment)
                  </button>
                </div>

                {/* Final Course Assessment Card */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/30 dark:from-slate-900/40 dark:to-slate-900/10 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-rose-200/40 dark:border-rose-800/40">
                        Course Final Exam
                      </span>
                      <span className="text-xs text-rose-500 font-bold font-mono flex items-center gap-1">🏆 +200 XP</span>
                    </div>
                    <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                      သင်တန်းအပြီးသတ် မဟာစာမေးပွဲ (Course Final Assessment)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      သင်တန်းတစ်ခုလုံးရှိ ခေါင်းစဉ်အားလုံးကို ခြုံငုံ၍ အသိဉာဏ်တုဆန်းစစ်ချက် ပုစ္ဆာမျိုးစုံဖြင့် စစ်ဆေးမည်ဖြစ်သည်။
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAllLessonsCompleted) {
                        alert("သင်တန်း၏ သင်ခန်းစာအားလုံး ပြီးဆုံးမှသာ အပြီးသတ်စာမေးပွဲကို ဖြေဆိုခွင့် ရှိပါမည် ခင်ဗျာ။");
                        return;
                      }
                      handleLaunchAssessment(
                        `${course.id}-final-assessment`,
                        `${course.title}: Final Graduation Exam`,
                        "final_assessment"
                      );
                    }}
                    disabled={!isAllLessonsCompleted}
                    className={`w-full text-center py-2.5 px-4 font-sans text-xs font-semibold rounded-xl transition shadow-sm ${
                      isAllLessonsCompleted
                        ? "bg-rose-600 hover:bg-rose-700 text-white hover:translate-y-[-1px] cursor-pointer"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    {!isAllLessonsCompleted ? "သော့ခတ်ထားပါသည် (Locked)" : "စာမေးပွဲ စတင်ဖြေဆိုမည် (Start Exam)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Projects Panel */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-500" />
                <span>လက်တွေ့ပရောဂျက်ငယ်များ (Mini Projects)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                သင်ခန်းစာတစ်ခုချင်းစီအလိုက် တည်ဆောက်ရမည့် လက်တွေ့အသုံးချ mini-projects များ ဖြစ်ပါသည်။
              </p>
            </div>

            {/* List of lesson-level mini projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.lessons.map((lesson, idx) => (
                <div key={lesson.id} className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">LESSON {idx + 1} PROJECT</span>
                    {completedSet.has(lesson.id) ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">Completed</span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">Locked</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lesson.miniProject.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{lesson.miniProject.description}</p>
                </div>
              ))}
            </div>

            {/* Final Project Card */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-900 border border-blue-500/30 rounded-2xl p-6 md:p-8 text-white space-y-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    COURSE FINAL PROJECT
                  </span>
                  <h3 className="font-display font-bold text-xl text-white pt-1">{course.finalProject.title}</h3>
                </div>
                <div>
                  {isAllLessonsCompleted ? (
                    <span className="inline-flex items-center space-x-1 text-xs bg-emerald-500/25 text-emerald-400 font-bold border border-emerald-500/30 px-3 py-1 rounded-full">
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>စတင်ရန် အဆင်သင့်ဖြစ်ပါသည်</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs bg-red-500/10 text-red-400 font-bold border border-red-500/20 px-3 py-1 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>သင်ခန်းစာများ အရင်ပြီးအောင်လုပ်ပါ</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {course.finalProject.description}
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">အဆင့်ဆင့် လမ်းညွှန်ချက် (Step-by-Step Guide)</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {course.finalProject.guide.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">{idx + 1}</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Summary & Certificate Panel */}
        {activeTab === "certificate" && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>သင်တန်းအနှစ်ချုပ် (Course Summary)</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {course.courseSummary}
              </p>
            </div>

            {/* Certificate Widget */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-[#1E293B]">
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="space-y-3 max-w-lg text-center md:text-left">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto md:mx-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">ဂုဏ်ထူးဆောင်အောင်လက်မှတ် (Course Certificate)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    သင်တန်းရှိ သင်ခန်းစာအားလုံး၊ ဉာဏ်စမ်းမေးခွန်းများနှင့် လက်တွေ့ပရောဂျက်များကို ပြီးမြောက်ပါက ကမ္ဘာတစ်ဝှမ်းမှ စိစစ်အတည်ပြုနိုင်သော Professional Certificate ကို အခမဲ့ Claim ပြုလုပ်နိုင်ပါမည်။
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {isAllLessonsCompleted ? (
                    <div className="space-y-3 text-center md:text-right">
                      <span className="inline-flex items-center space-x-1 text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>သင်တန်း အောင်မြင်ပြီးပါပြီ (Passed)</span>
                      </span>
                      <div className="pt-2">
                        <button
                          onClick={() => handlePrintCertificate(`CLM-${course.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`)}
                          className="inline-flex items-center space-x-1.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-lg cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>လက်မှတ် ဒေါင်းလုဒ်ဆွဲရန် (Download PDF)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center max-w-xs space-y-2">
                      <span className="text-xs font-mono text-red-500 font-bold flex items-center justify-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>သော့ခတ်ထားဆဲ (Locked)</span>
                      </span>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        လက်မှတ်ရရှိရန် သင်တန်းရှိ သင်ခန်းစာအားလုံး ({course.lessonCount} ခု) ကို အရင်ပြီးမြောက်အောင် လေ့လာရပါမည်။
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => onStartLearning(course, resumeIdx)}
                          className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          ဆက်လက်လေ့လာပါ &gt;
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* Telegram Video Hub Modal */}
      <TelegramVideoHubModal
        isOpen={showTelegramHub}
        onClose={() => setShowTelegramHub(false)}
        user={user}
        onUpdateUser={onUpdateUser}
      />
    </div>
  );
}
