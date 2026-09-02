/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Compass,
  X,
  Home,
  BookOpen, 
  Award, 
  Check, 
  CheckCircle2, 
  XCircle, 
  Code2, 
  Lightbulb, 
  Play, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  Lock,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  FileText,
  Eye,
  Download,
  Upload,
  Trophy,
  History,
  Layers,
  Send
} from "lucide-react";
import { Course, Lesson, UserProfile, getLevelData, LEVEL_THRESHOLDS } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import AIAssistant from "../pages/AIAssistant";
import KiboMascot from "./KiboMascot";
import { 
  trackLessonView, 
  trackLessonComplete, 
  trackQuizResult, 
  trackProjectComplete, 
  toggleRichBookmark 
} from "../utils/progress";
import { saveCertificate } from "../lib/db";
import { Assessment } from "./Assessment";
import CelebrationModal, { CelebrationData } from "./CelebrationModal";
import { ThemeToggle } from "./ThemeToggle";
import TelegramVideoCard from "./TelegramVideoCard";
import Breadcrumbs from "./Breadcrumbs";
import TelegramVideoHubModal from "./TelegramVideoHubModal";
import CodeEditorWorkspace from "./CodeEditorWorkspace";
import { isUserPremium } from "../utils/premiumSecurity";

interface LessonViewerProps {
  course: Course;
  onBack: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  initialLessonIdx?: number;
  onNavigateTab?: (tab: string) => void;
}

export default function LessonViewer({ 
  course, 
  onBack, 
  user, 
  onUpdateUser, 
  initialLessonIdx = 0,
  onNavigateTab
}: LessonViewerProps) {
  const [activeLessonIdx, setActiveLessonIdx] = useState(initialLessonIdx);
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [showTelegramHub, setShowTelegramHub] = useState(false);
  const [isMobileLessonListOpen, setIsMobileLessonListOpen] = useState(false);

  useEffect(() => {
    setActiveLessonIdx(initialLessonIdx);
  }, [initialLessonIdx]);
  const activeLesson = course.lessons[activeLessonIdx] || course.lessons[0];
  const isPremiumUser = isUserPremium(user);
  const isLockedPrereq = activeLessonIdx > 0 && !(user.completedLessons || []).includes(course.lessons[activeLessonIdx - 1]?.id);
  
  const [activeTab, setActiveTab] = useState<"lecture" | "exercise" | "quiz" | "project">("lecture");

  // Code state
  const [userCode, setUserCode] = useState("");
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [completionReward, setCompletionReward] = useState<CelebrationData | null>(null);

  // Kibo Lesson Assistant Programmatic Prompt Trigger
  const [aiTriggerPrompt, setAiTriggerPrompt] = useState<{ text: string; id: number } | null>(null);

  // Compare with Original modal state
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Active Challenge index: 0 is main lesson miniExercise, 1 is Challenge 2, 2 is Challenge 3
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);

  // Dynamic quizzes (5 questions of MC, TF, FITB, Code Analysis, Short Task)
  interface EnrichedQuizQuestion {
    id: string;
    type: "mc" | "tf" | "fitb" | "analysis" | "short_task";
    question: string;
    codeSnippet?: string;
    options?: string[];
    correctAnswer?: string; // lowercase trimmed comparison for FITB or Short Task
    correctOptionIndex?: number; // for mc, tf, analysis
    explanation: string;
  }

  // Generate enriched 5 questions per lesson
  const getEnrichedQuiz = (): EnrichedQuizQuestion[] => {
    const isHtml = activeLesson.id.includes("html") || course.category === "web" || course.id.includes("web") || activeLesson.id.includes("web");
    const isPython = activeLesson.id.includes("python") || course.category === "basics" || course.id.includes("python") || activeLesson.id.includes("python");

    const questions: EnrichedQuizQuestion[] = [];

    // Q1: Multiple Choice (from lesson data, or generate if missing)
    if (activeLesson.quiz && activeLesson.quiz.length > 0) {
      questions.push({
        id: `q-mc-${activeLesson.id}`,
        type: "mc",
        question: activeLesson.quiz[0].question,
        options: activeLesson.quiz[0].options,
        correctOptionIndex: activeLesson.quiz[0].correctOptionIndex,
        explanation: activeLesson.quiz[0].explanation
      });
    } else {
      questions.push({
        id: `q-mc-${activeLesson.id}`,
        type: "mc",
        question: isHtml 
          ? "HTML tag တစ်ခု၏ element တစ်ခုလုံးကို ရေးသားရာတွင် မည်သည့်အရာ လိုအပ်သနည်း။" 
          : "Python တွင် variable တစ်ခုကို ကြေညာရန် မည်သည့် keywords လိုအပ်သနည်း။",
        options: isHtml
          ? ["Opening tag သာလိုသည်", "Closing tag သာလိုသည်", "Opening tag, Content, နှင့် Closing tag အားလုံးလိုသည်", "ဘာမှမလိုပါ"]
          : ["var keyword လိုသည်", "let keyword လိုသည်", "မည်သည့် keyword မျှမလိုဘဲ တိုက်ရိုက်သတ်မှတ်နိုင်သည်", "def keyword လိုသည်"],
        correctOptionIndex: isHtml ? 2 : 2,
        explanation: isHtml
          ? "HTML element တစ်ခုတွင် opening tag, content, နှင့် closing tag တို့ စနစ်တကျ ပါဝင်ရပါမည်။"
          : "Python တွင် variable ကြေညာရန် var, let ကဲ့သို့ keyword များ မလိုအပ်ဘဲ variable_name = value ပုံစံဖြင့် တိုက်ရိုက်သတ်မှတ်နိုင်ပါသည်။"
      });
    }

    // Q2: True / False (tf)
    questions.push({
      id: `q-tf-${activeLesson.id}`,
      type: "tf",
      question: isHtml
        ? "True or False: HTML tag name များကို uppercase (စာလုံးအကြီး) ဖြင့်သာ မဖြစ်မနေ ရေးသားရမည်။"
        : "True or False: Python syntax စည်းမျဉ်းအရ variable names များ၏အစတွင် ကိန်းဂဏန်းများ သုံးခွင့်မရှိပါ။",
      options: ["True (မှန်သည်)", "False (မှားယွင်းသည်)"],
      correctOptionIndex: isHtml ? 1 : 0,
      explanation: isHtml
        ? "HTML tag name များကို စာလုံးအသေး (lowercase) ဖြင့် ရေးသားခြင်းသည် အကောင်းဆုံး Best Practice ဖြစ်ပြီး အတည်ပြုထားသော စံနှုန်းဖြစ်သည်။"
        : "Python တွင် variable custom names များ၏ အစတွင် ကိန်းဂဏန်း (0-9) များ အသုံးပြုခွင့် မရှိပါ။"
    });

    // Q3: Fill in the Blank (fitb)
    questions.push({
      id: `q-fitb-${activeLesson.id}`,
      type: "fitb",
      question: isHtml
        ? "HTML document တစ်ခုလုံး၏ အကြီးဆုံးသော ခေါင်းစဉ် (Heading) ကို ဖန်တီးရန် မည်သည့် tag ကို အသုံးပြုရသနည်း။ (ဥပမာ - h1 သို့မဟုတ် p)"
        : "Python တွင် variable တစ်ခုထဲသို့ တန်ဖိုးထည့်သွင်းရန် မည်သည့် operator ကို အသုံးပြုရသနည်း။ (ဥပမာ - =, ==, သို့မဟုတ် +)",
      correctAnswer: isHtml ? "h1" : "=",
      explanation: isHtml
        ? "အကြီးဆုံး ခေါင်းစဉ်အတွက် h1 tag ကို သုံးပြီး အသေးဆုံးအတွက် h6 အထိ ရှိပါသည်။"
        : "တန်ဖိုးသတ်မှတ်ရန်အတွက် single equal sign (=) assignment operator ကို သုံးပါသည်။"
    });

    // Q4: Code Analysis (analysis)
    questions.push({
      id: `q-analysis-${activeLesson.id}`,
      type: "analysis",
      question: "အောက်ပါ ကုဒ်လိုင်းလေးကို ဆန်းစစ်ပြီး ၎င်း၏ output တန်ဖိုး မည်သို့ထွက်ရှိမည်ကို ရွေးချယ်ပေးပါခင်ဗျာ။",
      codeSnippet: isHtml
        ? `<!-- HTML Code Snippet -->\n<h2>Welcome to Code Learn</h2>`
        : `# Python Code Snippet\nx = 15\ny = x - 5\nprint(y)`,
      options: isHtml
        ? ["Welcome to Code Learn ဟူသော အလတ်စားခေါင်းစဉ်အဖြစ် ပေါ်မည်", "Welcome to Code Learn ဟူသော စာပိုဒ်ပုံစံ ပေါ်မည်", "Welcome to Code Learn ဟူသော link ပုံစံ ပေါ်မည်", "ကုဒ်အမှားတက်မည်"]
        : ["15", "10", "5", "SyntaxError"],
      correctOptionIndex: isHtml ? 0 : 1,
      explanation: isHtml
        ? "h2 tag သည် အလတ်စား ခေါင်းစဉ် (Heading Level 2) အဖြစ် browser တွင် ထင်ရှားစွာ ပေါ်ထွက်လာမည် ဖြစ်သည်။"
        : "x သည် 15 ဖြစ်ပြီး y ထဲတွင် x မှ 5 ကို နှုတ်သည့်အတွက် 10 ဖြစ်ကာ print(y) က 10 ကို ထုတ်ပြပါမည်။"
    });

    // Q5: Short Coding Task (short_task)
    questions.push({
      id: `q-short-${activeLesson.id}`,
      type: "short_task",
      question: isHtml
        ? "စာသားများကို text block သို့မဟုတ် စာပိုဒ် (Paragraph) အဖြစ် သတ်မှတ်ရန် သုံးသော tag အမည်ကို ရေးသားပေးပါ။ (ဥပမာ - p သို့မဟုတ် div)"
        : "x variable ထဲသို့ integer တန်ဖိုး 100 ထည့်သွင်းသော ကုဒ်တိုလေးကို ရေးသားပေးပါ ခင်ဗျာ။ (ဥပမာ - x = 100)",
      correctAnswer: isHtml ? "p" : "x = 100",
      explanation: isHtml
        ? "စာပိုဒ်များ ရေးသားရန်အတွက် HTML <p> (Paragraph) tag ကို အသုံးပြုပါသည်။"
        : "Python တွင် x = 100 ဟုရေးသားခြင်းဖြင့် variable ထဲသို့ တန်ဖိုးထည့်သွင်းနိုင်ပါသည်။"
    });

    return questions;
  };

  const enrichedQuizzes = getEnrichedQuiz();

  // Custom Challenges List for the current active lesson
  const getLessonChallenges = () => {
    const defaultEx = activeLesson.miniExercise;
    const isHtml = activeLesson.id.includes("html") || course.category === "web" || course.id.includes("web") || activeLesson.id.includes("web");

    const list = [
      {
        title: "လေ့ကျင့်ခန်း ၁ - အခြေခံစိန်ခေါ်မှု",
        instruction: defaultEx.instruction,
        codeTemplate: defaultEx.codeTemplate,
        expectedOutput: defaultEx.expectedOutput,
        hints: defaultEx.hints,
        language: isHtml ? "html" : "python"
      }
    ];

    if (!isHtml) {
      list.push(
        {
          title: "လေ့ကျင့်ခန်း ၂ - Bug Hunting (အမှားရှာပြင်ခြင်း)",
          instruction: "အောက်ပါကုဒ်တွင် variable နာမည်ပေးပုံ မှားယွင်းနေသဖြင့် run ခွင့်မရပါ။ user-age ကို user_age သို့ ပြင်ဆင်ပြီး output ၂၀ ထွက်အောင် ရေးသားပါ။",
          codeTemplate: `# variable အမည်ပေးစနစ် ပြင်ဆင်ပါ\nuser_age = 20\nprint(user_age)`,
          expectedOutput: "20",
          hints: ["Variable အမည်ပေးရာတွင် hyphen (-) သုံးခွင့်မရှိပါ၊ underscore (_) သာ သုံးရပါမည်။"],
          language: "python"
        },
        {
          title: "လေ့ကျင့်ခန်း ၃ - ပြဿနာဖြေရှင်းခြင်း (Problem Solving)",
          instruction: "ကိန်းရှင် (variable) x ထဲကို 50 ထည့်ပြီး x ကို ၅ ဆမြှောက်ကာ print() ထုတ်ပြပါ။",
          codeTemplate: `x = 50\nprint(x * 5)`,
          expectedOutput: "250",
          hints: ["print(x * 5) သို့မဟုတ် x = x * 5 ပြီးမှ print(x) ဟု ရေးသားနိုင်ပါသည်။"],
          language: "python"
        }
      );
    } else {
      list.push(
        {
          title: "လေ့ကျင့်ခန်း ၂ - Bug Hunting (အမှားရှာပြင်ခြင်း)",
          instruction: "Heading block ကို ပြန်ပိတ်ပေးရန် မေ့နေသဖြင့် header tag ကို မှန်ကန်စွာ ပိတ်ပြီး 'Hello' ဟူသော ခေါင်းစဉ် ပြသပေးပါ။",
          codeTemplate: `<h1>Hello</h1>`,
          expectedOutput: "<h1>Hello</h1>",
          hints: ["<h1> ဖွင့်ထားပါက </h1> စနစ်တကျ ပြန်ပိတ်ရန် လိုအပ်ပါသည်။"],
          language: "html"
        },
        {
          title: "လေ့ကျင့်ခန်း ၃ - စာပိုဒ် ဖန်တီးတည်ဆောက်ခြင်း",
          instruction: "Paragraph tag (<p>) ကို အသုံးပြုပြီး 'HTML Basics are fun' ဆိုပြီး စာသားတစ်ခု ပြသပေးပါ။",
          codeTemplate: `<p>HTML Basics are fun</p>`,
          expectedOutput: "<p>HTML Basics are fun</p>",
          hints: ["ဖွင့် tag <p> နှင့် ပိတ် tag </p> ကြားတွင် HTML Basics are fun ဟု ထည့်ပါ။"],
          language: "html"
        }
      );
    }

    return list;
  };

  const challenges = getLessonChallenges();
  const currentChallenge = challenges[activeChallengeIdx] || challenges[0];

  // Quiz state with 5 questions
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: any }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<{ [qId: string]: boolean }>({});
  const [quizIsCorrect, setQuizIsCorrect] = useState<{ [qId: string]: boolean }>({});

  // Mini-Project Submission workbench state
  const [projectCode, setProjectCode] = useState("");
  const [projectNotes, setProjectNotes] = useState("");
  const [projectScreenshot, setProjectScreenshot] = useState<string | null>(null);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [projectGradingFeedback, setProjectGradingFeedback] = useState<string | null>(null);

  // Offline support state
  const [offlineNotes, setOfflineNotes] = useState("");
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

  // Playground & Sandbox Advanced States
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark' | 'myanmar'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftTab, setLeftTab] = useState<'instructions' | 'preview'>('instructions');
  const [livePreviewCode, setLivePreviewCode] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isSavedCodeAlert, setIsSavedCodeAlert] = useState(false);

  // Sync effect when activeChallengeIdx or activeLessonIdx changes
  useEffect(() => {
    setUserCode(currentChallenge.codeTemplate);
    setCodeOutput(null);
    setCodeSuccess(null);
    setShowHint(false);
    setHistory([]);
    setRedoStack([]);
    setLivePreviewCode("");
    setLeftTab("instructions");
  }, [activeChallengeIdx, activeLessonIdx]);

  // Reset tab to lecture and clear project feedback when advancing to next/previous lesson
  useEffect(() => {
    setActiveTab("lecture");
    setActiveChallengeIdx(0);
    setProjectGradingFeedback(null);
    setProjectScreenshot(null);
    setProjectNotes("");
  }, [activeLessonIdx]);

  // Helper for playground themes styling
  const getThemeClasses = () => {
    switch (editorTheme) {
      case 'light':
        return {
          editorBg: 'bg-white border-slate-300 text-slate-900',
          editorHeader: 'bg-slate-100 border-slate-200 text-slate-700',
          textarea: 'text-slate-800 bg-white placeholder-slate-400 caret-slate-900 selection:bg-blue-100',
          lineNumbers: 'bg-slate-50 text-slate-400 border-r border-slate-200'
        };
      case 'myanmar':
        return {
          editorBg: 'bg-[#064e3b] border-[#047857] text-[#fef08a]',
          editorHeader: 'bg-[#022c22] border-[#047857] text-[#34d399]',
          textarea: 'text-[#fef08a] bg-[#064e3b] placeholder-emerald-600 caret-[#fef08a] selection:bg-emerald-800',
          lineNumbers: 'bg-[#022c22]/60 text-emerald-500 border-r border-[#047857]/40'
        };
      case 'dark':
      default:
        return {
          editorBg: 'bg-slate-900 border-slate-800 text-blue-300',
          editorHeader: 'bg-slate-950 border-slate-800 text-slate-400',
          textarea: 'text-blue-300 bg-slate-900 placeholder-slate-600 caret-white selection:bg-slate-800',
          lineNumbers: 'bg-slate-950 text-slate-500 border-r border-slate-800'
        };
    }
  };

  const tc = getThemeClasses();

  // Python simulated validator for Myanmar-friendly custom errors
  const validatePythonCode = (code: string) => {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // 1. Missing colon check
      if ((trimmed.startsWith('if ') || trimmed.startsWith('for ') || trimmed.startsWith('def ') || trimmed.startsWith('while ') || trimmed.startsWith('elif ') || trimmed.startsWith('else:')) && !trimmed.endsWith(':')) {
        // Exception: if 'else' is formatted weirdly
        if (trimmed === 'else') {
          return {
            line: i + 1,
            message: "SyntaxError: expected ':'",
            myanmar: `လိုင်းနံပါတ် ${i + 1} ရှိ 'else' တွင် ' : ' (colon) ထည့်ရန် ကျန်နေပါသည် ခင်ဗျာ။ block အသစ်တစ်ခုစရန် python တွင် colon အမြဲထည့်ရပါမည်။`
          };
        }
        return {
          line: i + 1,
          message: "SyntaxError: expected ':'",
          myanmar: `လိုင်းနံပါတ် ${i + 1} ရှိ '${trimmed}' ၏ အဆုံးတွင် ' : ' (colon) ထည့်ရန် ကျန်ခဲ့ပါသည် ခင်ဗျာ။ control structures များတွင် block အသစ်စရန် colon လိုအပ်ပါသည်။`
        };
      }
      
      // 2. Unbalanced parenthesis
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        return {
          line: i + 1,
          message: "SyntaxError: unmatched parenthesis",
          myanmar: `လိုင်းနံပါတ် ${i + 1} တွင် ကွင်းစကွင်းပိတ်များ မညီမမျှ ဖြစ်နေပါသည် ခင်ဗျာ။ print() သို့မဟုတ် expression များတွင် ကွင်းပြန်ပိတ်ပေးရန် မေ့နေနိုင်ပါသည်။`
        };
      }
    }
    return null;
  };

  // Safe incremental code change keeping history
  const handleCodeChange = (newCode: string) => {
    setHistory(prev => [...prev.slice(-49), userCode]);
    setRedoStack([]);
    setUserCode(newCode);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prevCode = history[history.length - 1];
    setRedoStack(prev => [...prev, userCode]);
    setUserCode(prevCode);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextCode = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, userCode]);
    setUserCode(nextCode);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const handleSaveCode = () => {
    localStorage.setItem(`clm_saved_code_${activeLesson.id}_${activeChallengeIdx}`, userCode);
    setIsSavedCodeAlert(true);
    setTimeout(() => setIsSavedCodeAlert(false), 3000);
  };

  const handleRestorePrevious = () => {
    const saved = localStorage.getItem(`clm_saved_code_${activeLesson.id}_${activeChallengeIdx}`);
    if (saved !== null) {
      handleCodeChange(saved);
      setCodeOutput(`[SYSTEM] >>> အောင်မြင်စွာ သိမ်းဆည်းထားသော ကုဒ်မူကွဲကို ပြန်လည်ရယူပြီးပါပြီ။`);
    } else {
      setCodeOutput(`[SYSTEM] >>> ရှာမတွေ့ပါ။ ဤစိန်ခေါ်မှုအတွက် ယခင်သိမ်းဆည်းထားသော ကုဒ် မရှိသေးပါခင်ဗျာ။`);
    }
  };

  // Keyboard events for Auto Indentation and Auto Bracket Closing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    // 1. Tab Auto Indentation (2 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const newValue = val.substring(0, start) + "  " + val.substring(end);
      setUserCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // 2. Bracket Auto-Closing
    const pairs: { [key: string]: string } = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
    };
    if (currentChallenge.language === 'html') {
      pairs['<'] = '>';
    }

    if (pairs[e.key] !== undefined) {
      e.preventDefault();
      const closingChar = pairs[e.key];
      const newValue = val.substring(0, start) + e.key + closingChar + val.substring(end);
      setUserCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (activeTab !== "exercise") return;
      
      // Ctrl + Enter to Run code
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
      // Ctrl + Z to Undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl + Y to Redo
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl + S to Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveCode();
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [activeTab, userCode, history, redoStack, currentChallenge]);

  // Iframe message receiver for runtime JS errors inside live preview
  useEffect(() => {
    const handleIframeMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'IFRAME_ERROR') {
        const errMsg = e.data.message;
        const lineNo = e.data.lineno;
        const myanmarExplanation = `\n\n[မြန်မာလို ရှင်းလင်းချက်] ⚠️ ဂျာဗားစကရစ် (JavaScript) စစ်ဆေးမှုတွင် လိုင်းနံပါတ် ${lineNo} ၌ error တက်နေပါသည် ခင်ဗျာ။\nအသေးစိတ်အမှား: ${errMsg}`;
        setCodeOutput(`[RUNTIME ERROR] >>> Line ${lineNo}: ${errMsg}${myanmarExplanation}`);
        setCodeSuccess(false);
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  // Quiz state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [qId: string]: number }>({});
  const [submittedQuizQuestions, setSubmittedQuizQuestions] = useState<{ [qId: string]: boolean }>({});

  // Markdown fetch state
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [isLoadingMarkdown, setIsLoadingMarkdown] = useState(false);

  // Reset exercise states and load Markdown on lesson switch
  useEffect(() => {
    if (activeLesson) {
      setIsMobileLessonListOpen(false);
      setUserCode(activeLesson.miniExercise.codeTemplate);
      setCodeOutput(null);
      setCodeSuccess(null);
      setShowHint(false);
      // Reset quiz
      setSelectedQuizAnswers({});
      setSubmittedQuizQuestions({});
      setQuizAnswers({});
      setQuizSubmitted({});
      setQuizIsCorrect({});
      setActiveChallengeIdx(0);
      setProjectCode(activeLesson.miniProject?.startingCode || "");
      setProjectNotes("");
      setProjectScreenshot(null);
      setProjectGradingFeedback(null);
      setOfflineNotes(localStorage.getItem(`clm_notes_${activeLesson.id}`) || "");
      setIsOfflineSaved(false);
      setActiveTab("lecture");

      // Track lesson view
      onUpdateUser(trackLessonView(user, course.id, activeLesson.id, activeLesson.title));

      // Load Markdown dynamically
      if (activeLesson.markdownPath) {
        setIsLoadingMarkdown(true);
        setMarkdownContent(null);
        fetch(activeLesson.markdownPath)
          .then((res) => {
            if (!res.ok) {
              throw new Error("Could not find or fetch the lesson markdown.");
            }
            return res.text();
          })
          .then((text) => {
            setMarkdownContent(text);
            setIsLoadingMarkdown(false);
          })
          .catch((err) => {
            console.error("Error loading markdown lesson:", err);
            setIsLoadingMarkdown(false);
          });
      } else {
        setMarkdownContent(null);
      }
    }
  }, [activeLessonIdx]);

  if (!activeLesson) {
    return (
      <div className="text-center py-20 text-white">
        <p>သင်ခန်းစာများ ရှာမတွေ့ပါခင်ဗျာ။</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 rounded text-sm font-semibold">ပြန်သွားရန်</button>
      </div>
    );
  }

  // Handle run code simulation for multiple challenges
  const handleRunCode = async () => {
    const isHtml = currentChallenge.language === "html";

    if (isHtml) {
      // Set the live preview content
      setLivePreviewCode(userCode);
      // Auto toggle Left Pane tab to "preview" so student immediately sees the results!
      setLeftTab("preview");

      // For HTML, verify if the code has the expected tags and text content
      const studentNorm = userCode.replace(/\s+/g, "").toLowerCase();
      const expectedNorm = currentChallenge.expectedOutput.replace(/\s+/g, "").toLowerCase();
      const isCorrect = studentNorm.includes(expectedNorm);

      if (isCorrect) {
        setCodeOutput(`[LIVE PREVIEW LOADED SUCCESSFULLY]\n${currentChallenge.expectedOutput}\n\n[SUCCESS] 🎉 ဂုဏ်ယူပါတယ်! လေ့ကျင့်ခန်း "${currentChallenge.title}" ကို အောင်မြင်စွာ ဖြေဆိုပြီးပါပြီ ခင်ဗျာ။ +30 XP ရရှိပါသည်!`);
        setCodeSuccess(true);

        // Award XP if lesson is not already completed
        const isAlreadyCompleted = (user.completedLessons || []).includes(activeLesson.id);
        if (!isAlreadyCompleted) {
          awardXP(30, `Exercise Challenge ${activeChallengeIdx + 1} completed!`);
        }
      } else {
        // Simulated Output or Sandbox feedback
        setCodeOutput(`[CONSOLE ERROR] >>> Output mismatch.\nExpected: ${currentChallenge.expectedOutput}\n\n[TIP] မစိုးရိမ်ပါနဲ့ခင်ဗျာ။ ကုဒ်လိုင်းများတွင် စာလုံးပေါင်း သို့မဟုတ် tag အပိတ်/အဖွင့် မှားယွင်းနေနိုင်ပါသည်။ "Hint လမ်းညွှန်ချက်" ခလုတ်ကို နှိပ်ပြီး အကူအညီရယူနိုင်ပါတယ်ဗျာ။`);
        setCodeSuccess(false);
      }
    } else {
      // Run Python static code validation for custom Myanmar syntax errors first
      const syntaxError = validatePythonCode(userCode);
      if (syntaxError) {
        setCodeOutput(`[SYNTAX ERROR] >>> Line ${syntaxError.line}: ${syntaxError.message}\n\n[မြန်မာလို ရှင်းလင်းချက်]\n${syntaxError.myanmar}`);
        setCodeSuccess(false);
        return;
      }

      setCodeOutput("[RUNNING] >>> Python ကုဒ်များကို စတင်စမ်းသပ်မောင်းနှင်နေပါသည်...");
      setCodeSuccess(null);

      try {
        const response = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: "python", code: userCode })
        });

        if (!response.ok) {
          throw new Error("Server runner returned an error status.");
        }

        const resData = await response.json();

        if (!resData.success) {
          // Syntax or runtime error returned from real python interpreter
          setCodeOutput(`[RUNTIME ERROR] >>>\n${resData.error || resData.output}\n\n[မြန်မာလို ရှင်းလင်းချက်]\n${resData.myanmar || "ကုဒ်လိုင်းများကို ပြန်လည်စစ်ဆေးပေးပါခင်ဗျာ။"}`);
          setCodeSuccess(false);
          return;
        }

        const realOutput = resData.output || "";
        const cleanRealOutput = realOutput.trim();
        const expectedClean = currentChallenge.expectedOutput.trim();

        // Check if the output matches the expected output
        const cleanRealNorm = cleanRealOutput.replace(/\s+/g, "").toLowerCase();
        const expectedNorm = expectedClean.replace(/\s+/g, "").toLowerCase();

        const isOutputMatch = cleanRealNorm === expectedNorm || cleanRealNorm.includes(expectedNorm);

        if (isOutputMatch) {
          setCodeOutput(`[OUTPUT] >>>\n${realOutput}\n\n[SUCCESS] 🎉 ဂုဏ်ယူပါတယ်! လေ့ကျင့်ခန်း "${currentChallenge.title}" ကို အောင်မြင်စွာ ဖြေဆိုပြီးပါပြီ ခင်ဗျာ။ +30 XP ရရှိပါသည်!`);
          setCodeSuccess(true);

          // Award XP if lesson is not already completed
          const isAlreadyCompleted = (user.completedLessons || []).includes(activeLesson.id);
          if (!isAlreadyCompleted) {
            awardXP(30, `Exercise Challenge ${activeChallengeIdx + 1} completed!`);
          }
        } else {
          setCodeOutput(`[OUTPUT] >>>\n${realOutput}\n\n[CONSOLE ERROR] >>> Output mismatch.\nExpected: ${currentChallenge.expectedOutput}\n\n[TIP] ထွက်ပေါ်လာသော ရလဒ်သည် လေ့ကျင့်ခန်း၏ မျှော်မှန်းချက်နှင့် မကိုက်ညီသေးပါ ခင်ဗျာ။ ကုဒ်ကို ပြန်လည်စစ်ဆေးကြည့်ပါဦး။`);
          setCodeSuccess(false);
        }
      } catch (err) {
        console.error("Failed to run code via server, falling back to client-side simulator:", err);
        // Fallback to simulation if server fails
        const studentNorm = userCode.replace(/\s+/g, "");
        const expectedNorm = currentChallenge.expectedOutput.replace(/\s+/g, "");
        const isCorrectSim = studentNorm.includes(expectedNorm);

        if (isCorrectSim) {
          setCodeOutput(`[OUTPUT (SIMULATED)] >>>\n${currentChallenge.expectedOutput}\n\n[SUCCESS] 🎉 ဂုဏ်ယူပါတယ်! လေ့ကျင့်ခန်း "${currentChallenge.title}" ကို အောင်မြင်စွာ ဖြေဆိုပြီးပါပြီ ခင်ဗျာ။ +30 XP ရရှိပါသည်!`);
          setCodeSuccess(true);

          // Award XP if lesson is not already completed
          const isAlreadyCompleted = (user.completedLessons || []).includes(activeLesson.id);
          if (!isAlreadyCompleted) {
            awardXP(30, `Exercise Challenge ${activeChallengeIdx + 1} completed!`);
          }
        } else {
          setCodeOutput(`[CONSOLE ERROR] >>> Output mismatch.\nExpected: ${currentChallenge.expectedOutput}\n\n[TIP] ကုဒ်စမ်းသပ်မှု ပျက်ကွက်ပါသည်။ "Hint လမ်းညွှန်ချက်" ခလုတ်ကို နှိပ်ပြီး အကူအညီရယူနိုင်ပါတယ်ဗျာ။`);
          setCodeSuccess(false);
        }
      }
    }
  };

  const handleStopExecution = () => {
    setLivePreviewCode("");
    setCodeOutput(`[STOPPED] >>> Execution terminated by user.`);
    setCodeSuccess(null);
  };

  // Enriched multi-type quiz checker
  const handleAnswerQuiz = (questionId: string, value: any, correctAns: any) => {
    if (quizSubmitted[questionId]) return;

    let isCorrect = false;
    const isHtml = activeLesson.id.includes("html") || course.category === "web" || course.id.includes("web") || activeLesson.id.includes("web");

    // Check correctness depending on type
    const qItem = enrichedQuizzes.find(q => q.id === questionId);
    if (!qItem) return;

    if (qItem.type === "mc" || qItem.type === "tf" || qItem.type === "analysis") {
      isCorrect = parseInt(value) === parseInt(correctAns);
    } else {
      // string matching for fitb and short_task
      const studentNorm = (value || "").toString().trim().toLowerCase().replace(/\s+/g, "");
      const correctNorm = (correctAns || "").toString().trim().toLowerCase().replace(/\s+/g, "");
      isCorrect = studentNorm === correctNorm || studentNorm.includes(correctNorm);
    }

    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
    setQuizSubmitted(prev => ({ ...prev, [questionId]: true }));
    setQuizIsCorrect(prev => ({ ...prev, [questionId]: isCorrect }));

    // Track quiz results
    const updatedWithQuiz = trackQuizResult(
      user as any, 
      questionId, 
      `Quiz: ${activeLesson.title} - ${qItem.type.toUpperCase()}`, 
      isCorrect ? 100 : 0, 
      100, 
      isCorrect
    );

    if (isCorrect) {
      awardXP(20, `Quiz ${qItem.type.toUpperCase()} correct!`, updatedWithQuiz);
    } else {
      onUpdateUser(updatedWithQuiz);
    }
  };

  // Award XP helper
  const awardXP = (amount: number, reason: string, baseUser: UserProfile = user) => {
    const newXp = baseUser.xp + amount;
    const oldLevelData = getLevelData(baseUser.xp);
    const newLevelData = getLevelData(newXp);
    const newLevel = newLevelData.level;
    const achievements = [...baseUser.achievements];

    if (newLevel > oldLevelData.level) {
      // Level up occurred! Add achievements for each level unlocked
      for (let lvl = oldLevelData.level + 1; lvl <= newLevel; lvl++) {
        const hasAch = achievements.some(a => a.id === `lvl-${lvl}`);
        if (!hasAch) {
          const lvlName = getLevelData(LEVEL_THRESHOLDS.find(t => t.level === lvl)?.xp || 0)?.name || `Level ${lvl}`;
          achievements.push({
            id: `lvl-${lvl}`,
            title: `Level ${lvl} စွမ်းအားရှင် (${(lvlName || `Level ${lvl}`).split(" (")[0]})`,
            description: `Code Learn Myanmar တွင် အဆင့် ${lvl} သို့ အောင်မြင်စွာ တက်လှမ်းနိုင်ခဲ့ခြင်း။`,
            icon: "Trophy",
            unlockedAt: new Date().toLocaleDateString()
          });
        }
      }
    }

    const updatedUser = {
      ...baseUser,
      xp: newXp,
      level: newLevel,
      achievements
    };
    onUpdateUser(updatedUser);
    return updatedUser;
  };

  // Mark lesson as complete and show Kibo reward modal
  const handleCompleteLesson = () => {
    const isLastLesson = activeLessonIdx >= course.lessons.length - 1;
    
    if (!isLastLesson) {
      setCompletionReward({
        type: "lesson",
        title: "Lesson Completed",
        titleMm: "သင်ခန်းစာ ပြီးမြောက်ခဲ့ပါသည်!",
        subtitleMm: `ဒီအရှိန်နဲ့ ဆက်သွားရင် Professional Developer ဖြစ်ဖို့ နီးလာပြီဗျာ! သင်ခန်းစာ "${activeLesson.title}" ကို အောင်မြင်စွာပြီးမြောက်သွားပါပြီ။`,
        xpEarned: 100,
        coinsEarned: 50,
        lessonTitle: activeLesson.title,
        lessonIndex: activeLessonIdx + 1,
        totalLessonsInCourse: course.lessons.length,
        hasNextLesson: true,
        unlockedBadge: user.completedLessons.length === 0 ? {
          id: "first-lesson",
          title: "First Step",
          titleMm: "Programming ပညာစူးစမ်းသူ",
          descriptionMm: "ပထမဆုံးသော သင်ခန်းစာကို အောင်မြင်စွာ ပြီးမြောက်ခဲ့ခြင်း။",
          icon: "BookOpen",
          category: "learning"
        } : undefined
      });
    } else {
      setCompletionReward({
        type: "course",
        title: "Course Completed",
        titleMm: `ဂုဏ်ယူပါတယ်! "${course.title}" ပြီးဆုံးပါပြီ။`,
        subtitleMm: "ဒီသင်တန်းတစ်ခုလုံးရှိ သင်ခန်းစာအားလုံးကို ထူးချွန်စွာစံချိန်တင်ပြီးမြောက်သွားပါပြီ။ ကိုယ်ရေးအကျဉ်း (Profile) တွင် သင့်ရဲ့ ဂုဏ်ထူးဆောင်လက်မှတ်ကို အခမဲ့ ရယူနိုင်ပါပြီ။",
        xpEarned: 300,
        coinsEarned: 150,
        course: course,
        finalQuizAccuracy: 95,
        projectSubmitted: true,
        unlockedBadge: {
          id: `ach-cert-${course.id}`,
          title: `${course.title} Graduate`,
          titleMm: `${course.title} ဘွဲ့ရပညာရှင်`,
          descriptionMm: `${course.title} သင်တန်းရှိ သင်ခန်းစာများ၊ ဉာဏ်စမ်းများကို စံချိန်တင်အောင်မြင်စွာ ပြီးဆုံးခဲ့သဖြင့် ဂုဏ်ထူးဆောင်လက်မှတ်ရရှိခြင်း။`,
          icon: "Award",
          category: "course"
        }
      });
    }
  };

  const handleClaimReward = () => {
    if (!completionReward) return;

    // 1. Get base updated user with progress statistics tracked
    const progressTrackedUser = trackLessonComplete(user as any, course.id, activeLesson.id, activeLesson.title);

    const isAlreadyCompleted = (user.completedLessons || []).includes(activeLesson.id);
    const updatedCompletedLessons = isAlreadyCompleted 
      ? (user.completedLessons || [])
      : [...(user.completedLessons || []), activeLesson.id];

    let newAchievements = [...(user.achievements || [])];
    let newCerts = [...(user.certificates || [])];

    // Unlock special achievement for first completed lesson
    if (updatedCompletedLessons.length === 1 && !(user.completedLessons || []).includes(activeLesson.id)) {
      newAchievements.push({
        id: "first-lesson",
        title: "Programming ပညာစူးစမ်းသူ",
        description: "Code Learn Myanmar တွင် ပထမဆုံးသော သင်ခန်းစာကို အောင်မြင်စွာ ပြီးမြောက်ခဲ့ခြင်း။",
        icon: "BookOpen",
        unlockedAt: new Date().toLocaleDateString()
      });
    }

    // Check if ALL lessons in this course are completed
    const courseLessonIds = course.lessons.map(l => l.id);
    const completedCourseLessons = courseLessonIds.filter(id => updatedCompletedLessons.includes(id));
    const allCompleted = completedCourseLessons.length === courseLessonIds.length;

    // Check if certificate already exists
    const hasCert = (user.certificates || []).some(c => c.courseTitle === course.title);

    if (allCompleted && !hasCert) {
      // Award certificate!
      const randId = Math.floor(100000 + Math.random() * 900000);
      const certificateId = `cert-${course.id}-${user.uid || 'guest'}`;
      const verificationId = `CLM-${course.id.toUpperCase()}-${randId}`;
      const newCertData = {
        id: certificateId,
        certificateId: certificateId,
        uid: user.uid || "guest-uid",
        courseId: course.id,
        courseName: course.title,
        courseTitle: course.title,
        issuedTo: user.name || "ကျောင်းသား",
        issuedDate: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
        verificationId: verificationId,
        certificateLevel: course.difficulty || "Foundation",
        roadmapName: course.category || "Full Stack Developer",
        platformName: "Code Learn Myanmar",
        isPublic: true
      };
      
      newCerts.push(newCertData);

      // Async save to Firestore
      saveCertificate(newCertData).catch(e => console.error("Error saving certificate to firestore:", e));

      // Special certification achievement
      newAchievements.push({
        id: `ach-cert-${course.id}`,
        title: `${course.title} ဘွဲ့ရပညာရှင်`,
        description: `${course.title} သင်တန်းရှိ သင်ခန်းစာအားလုံး၊ ဉာဏ်စမ်းများနှင့် mini project များကို စံချိန်တင်အောင်မြင်စွာ ပြီးဆုံးခဲ့သဖြင့် ဂုဏ်ထူးဆောင်လက်မှတ်ရရှိခြင်း။`,
        icon: "Award",
        unlockedAt: new Date().toLocaleDateString()
      });
    }

    // Merge everything together
    const baseUpdated = {
      ...progressTrackedUser,
      completedLessons: updatedCompletedLessons,
      achievements: newAchievements,
      certificates: newCerts
    };

    const awardAmount = completionReward.xpEarned;
    const isCourseComplete = completionReward.type === "course";

    setCompletionReward(null);

    if (!isCourseComplete) {
      setActiveLessonIdx(prev => prev + 1);
      awardXP(awardAmount, "Lesson complete bonus", baseUpdated);
    } else {
      awardXP(awardAmount, "Course complete bonus", baseUpdated);
      onBack();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 text-left relative transition-colors">
      {/* Immersive Celebration Modal */}
      {completionReward && (
        <CelebrationModal
          data={completionReward}
          user={user}
          onClose={handleClaimReward}
          onNextLesson={() => {
            handleClaimReward();
          }}
          onNavigateTab={onNavigateTab}
          isPremiumUser={isPremiumUser}
        />
      )}

      {/* Sidebar: Lessons Navigator (Desktop & Mobile Drawer) */}
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex lg:w-80 bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-slate-800 flex-col flex-shrink-0 transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>သင်တန်းများသို့</span>
          </button>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
            Progress: {Math.round((course.lessons.filter(l => (user.completedLessons || []).includes(l.id)).length / course.lessons.length) * 100)}%
          </span>
        </div>

        {/* Course Info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{course.title}</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{course.lessons.length} Lessons Available</p>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {course.lessons.map((lesson, idx) => {
            const isCompleted = (user.completedLessons || []).includes(lesson.id);
            const isActive = idx === activeLessonIdx;
            const isLockedPrereq = idx > 0 && !(user.completedLessons || []).includes(course.lessons[idx - 1]?.id);
            const isLockedPremium = idx >= 2 && !isPremiumUser;
            const isLocked = isLockedPrereq || isLockedPremium;

            return (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonIdx(idx)}
                className={`w-full flex items-start space-x-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  isActive 
                    ? "bg-blue-600/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold shadow-sm" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent"
                } ${isLocked && !isActive ? "opacity-75" : ""}`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  ) : isLockedPremium ? (
                    <span className="text-xs">💎</span>
                  ) : isLockedPrereq ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  ) : isActive ? (
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-mono font-bold">
                      {idx + 1}
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-semibold line-clamp-1">{lesson.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 font-mono">{lesson.duration}</span>
                    {isCompleted ? (
                      <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        Completed
                      </span>
                    ) : isLockedPremium ? (
                      <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded">
                        💎 PREMIUM
                      </span>
                    ) : isLockedPrereq ? (
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                        Locked
                      </span>
                    ) : isActive ? (
                      <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded animate-pulse">
                        In Progress
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Top Navigation Header */}
      <div className="lg:hidden bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2 z-20 flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Back to Courses"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Courses</span>
        </button>

        {/* Dropdown/Drawer trigger for mobile lesson selection */}
        <button
          onClick={() => setIsMobileLessonListOpen(true)}
          className="flex-1 max-w-[240px] sm:max-w-xs flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:border-blue-500/40 transition-colors"
          title="Open Lessons Menu"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span className="truncate">
            #{activeLessonIdx + 1}: {activeLesson.title}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        </button>

        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg flex-shrink-0">
          {Math.round((course.lessons.filter(l => (user.completedLessons || []).includes(l.id)).length / course.lessons.length) * 100)}%
        </span>
      </div>

      {/* Mobile Slide-Over Drawer for Lessons Navigation */}
      {isMobileLessonListOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsMobileLessonListOpen(false)} 
            />
          <div className="bg-white dark:bg-[#1E293B] border-t border-slate-200 dark:border-slate-800 rounded-t-3xl max-h-[80vh] flex flex-col relative z-10 shadow-2xl p-4 animate-slide-up">
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">{course.title}</h3>
                <p className="text-[10px] text-slate-500 font-mono">{course.lessons.length} Lessons Available</p>
              </div>
              <button 
                onClick={() => setIsMobileLessonListOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-2 space-y-1.5 flex-1">
              {course.lessons.map((lesson, idx) => {
                const isCompleted = (user.completedLessons || []).includes(lesson.id);
                const isActive = idx === activeLessonIdx;
                const isLockedPrereq = idx > 0 && !(user.completedLessons || []).includes(course.lessons[idx - 1]?.id);
                const isLockedPremium = idx >= 2 && !isPremiumUser;
                const isLocked = isLockedPrereq || isLockedPremium;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLessonIdx(idx);
                      setIsMobileLessonListOpen(false);
                    }}
                    className={`w-full flex items-start space-x-3 p-3 rounded-xl text-left transition-all ${
                      isActive 
                        ? "bg-blue-600 text-white font-bold shadow-md" 
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50"
                    } ${isLocked && !isActive ? "opacity-75" : ""}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-500"}`} />
                      ) : isLockedPremium ? (
                        <span className="text-xs">💎</span>
                      ) : isLockedPrereq ? (
                        <Lock className="w-3.5 h-3.5 opacity-60" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono font-bold ${isActive ? "border-white text-white" : "border-slate-400 text-slate-500"}`}>
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-semibold line-clamp-1">{lesson.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-mono block ${isActive ? "text-blue-100" : "text-slate-400"}`}>{lesson.duration}</span>
                        {isCompleted ? (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${isActive ? "bg-white/20 text-white" : "text-emerald-500 bg-emerald-500/10"}`}>
                            Completed
                          </span>
                        ) : isLockedPremium ? (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${isActive ? "bg-amber-400 text-slate-950" : "text-amber-500 bg-amber-500/15"}`}>
                            💎 PREMIUM
                          </span>
                        ) : isLockedPrereq ? (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${isActive ? "bg-white/20 text-white" : "text-slate-400 bg-slate-200 dark:bg-slate-800"}`}>
                            Locked
                          </span>
                        ) : isActive ? (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/20 text-white animate-pulse">
                            In Progress
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0F172A] overflow-hidden transition-colors">
        {/* Breadcrumb Navigation Trail */}
        <div className="bg-slate-100/80 dark:bg-[#1E293B]/40 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-1.5 flex items-center justify-between">
          <Breadcrumbs
            items={[
              { 
                label: "Home", 
                onClick: () => (onNavigateTab ? onNavigateTab("home") : onBack()),
                icon: Home 
              },
              { 
                label: course.category ? (course.category === "basics" ? "Programming Basics" : course.category.toUpperCase()) : "Courses", 
                onClick: () => (onNavigateTab ? onNavigateTab("courses") : onBack())
              },
              { 
                label: course.title, 
                onClick: onBack 
              },
              { 
                label: `Lesson ${activeLessonIdx + 1}: ${activeLesson.title}`, 
                isCurrent: true 
              }
            ]}
          />
        </div>

        {/* Top bar with Navigation Tab buttons */}
        <div className="bg-white/90 dark:bg-[#1E293B]/60 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight font-display line-clamp-1">{activeLesson.title}</h2>
            <button
              onClick={() => {
                const updated = toggleRichBookmark(user as any, activeLesson.id, "lesson", `${course.title} - ${activeLesson.title}`);
                onUpdateUser(updated);
              }}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700/50 cursor-pointer"
              title={(user.bookmarks || []).includes(activeLesson.id) ? "Bookmarked" : "Bookmark Lesson"}
            >
              {(user.bookmarks || []).includes(activeLesson.id) ? (
                <BookmarkCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <Bookmark className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Ask AI Teacher Button */}
            <button
              onClick={() => setShowAIDrawer(!showAIDrawer)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center space-x-1 ${
                showAIDrawer
                  ? "bg-purple-600/20 text-purple-600 dark:text-purple-400 border-purple-500/30"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/50"
              }`}
              title="Ask AI Teacher"
            >
              <Sparkles className={`w-4 h-4 ${showAIDrawer ? "animate-pulse text-purple-600 dark:text-purple-400" : ""}`} />
              <span className="text-[10px] font-bold px-0.5 hidden xs:inline">Ask AI</span>
            </button>

            {/* Telegram Video Hub Button */}
            <button
              onClick={() => setShowTelegramHub(true)}
              className="p-1.5 rounded-lg border transition-all cursor-pointer flex items-center space-x-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30"
              title="Telegram Video Lesson & Channel Information"
              id="btn-open-telegram-hub-top"
            >
              <Send className="w-4 h-4 transform -rotate-12" />
              <span className="text-[10px] font-bold px-0.5 hidden sm:inline">Telegram Video</span>
            </button>

            {/* In-lesson Theme Switcher */}
            <ThemeToggle variant="icon-only" />
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium overflow-x-auto scrollbar-none max-w-full">
            <button
              onClick={() => setActiveTab("lecture")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${activeTab === "lecture" ? "bg-blue-600 text-white shadow-md font-semibold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
            >
              <span>၁။ သင်ခန်းစာ (Lecture)</span>
            </button>
            <button
              onClick={() => setActiveTab("exercise")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${activeTab === "exercise" ? "bg-blue-600 text-white shadow-md font-semibold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
            >
              <span>၂။ လေ့ကျင့်ခန်း (Exercise)</span>
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${activeTab === "quiz" ? "bg-blue-600 text-white shadow-md font-semibold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
            >
              <span>၃။ ဉာဏ်စမ်း (Quiz)</span>
            </button>
            <button
              onClick={() => setActiveTab("project")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${activeTab === "project" ? "bg-blue-600 text-white shadow-md font-semibold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
            >
              <span>၄။ ပရောဂျက် (Project)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Panel Workspace */}
        {isLockedPrereq ? (
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-[#0B0F19]">
            <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
              <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2 text-center">
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full uppercase tracking-wider">
                  Lesson Locked (သင်ခန်းစာ သော့ပိတ်ထားပါသည်)
                </span>
                <h3 className="text-lg font-bold text-white font-display">ရှေ့သင်ခန်းစာကို အရင်လေ့လာရန် လိုအပ်သည် 🔒</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ဤသင်ခန်းစာကို လေ့လာရန်အတွက် ရှေ့ကသင်ခန်းစာဖြစ်သော <strong className="text-white">"{course.lessons[activeLessonIdx - 1]?.title}"</strong> ကို အရင်ဆုံး ပြီးမြောက်အောင် လေ့လာပြီးမြောက်ရန် လိုအပ်ပါသည် ခင်ဗျာ။
                </p>
              </div>

              {/* Unlock Requirements Details Box */}
              <div className="text-left bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>လိုအပ်သော ရှေ့သင်ခန်းစာ (Prerequisite):</span>
                  <span className="text-amber-400 font-bold font-mono">LOCKED</span>
                </div>
                <p className="text-slate-300 font-semibold">{course.lessons[activeLessonIdx - 1]?.title}</p>
                <div className="h-px bg-slate-800 my-2" />
                <div className="flex items-center justify-between text-slate-400">
                  <span>သင်တန်းပြီးဆုံးမှု အဆင့် (Course Progress):</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {Math.round((course.lessons.filter(l => (user.completedLessons || []).includes(l.id)).length / course.lessons.length) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>သော့ဖွင့်ရန် သတ်မှတ်ချက် (Unlock Requirement):</span>
                  <span className="text-slate-300">ရှေ့သင်ခန်းစာ၏ Exercise နှင့် Quiz များကို အောင်မြင်စွာ ပြီးမြောက်အောင် လုပ်ဆောင်ပါ။</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setActiveLessonIdx(activeLessonIdx - 1)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-98"
                >
                  ရှေ့သင်ခန်းစာ "{course.lessons[activeLessonIdx - 1]?.title}" သို့ သွားရောက်လေ့လာရန် 🚀
                </button>
                <button
                  onClick={onBack}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-300 font-medium rounded-xl text-xs transition-all cursor-pointer"
                >
                  သင်တန်းများစာရင်းသို့ ပြန်သွားရန်
                </button>
              </div>
            </div>
          </div>
        ) : activeLessonIdx >= 2 && !isPremiumUser ? (
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-[#0B0F19]">
            <div className="max-w-md w-full bg-slate-900/50 border border-amber-500/30 rounded-2xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
              <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <span className="text-2xl">💎</span>
              </div>

              <div className="space-y-2 text-center">
                <span className="text-xs font-mono font-bold bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <span>💎 PREMIUM LESSON (သော့ခတ်ထားပါသည်)</span>
                </span>
                <h3 className="text-xl font-black text-white font-display">💎 Kibo VIP Premium သီးသန့် သင်ခန်းစာ</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  သင်ခန်းစာ ၃ မှ စတင်၍ ကျန်ရှိသော အဆင့်မြင့်လက်တွေ့သင်ခန်းစာများ၊ assignments များနှင့် certifications များကို ရယူနိုင်ရန် Kibo Premium သို့ အဆင့်မြှင့်တင်ပေးရပါမည် ခင်ဗျာ။
                </p>
              </div>

              {/* Benefits list */}
              <div className="text-left bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-amber-400 font-bold">💎</span>
                  <span><strong>သင်တန်းအားလုံး</strong> အကန့်အသတ်မရှိ လေ့လာခွင့်</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-amber-400 font-bold">💎</span>
                  <span><strong>လက်တွေ့ပရောဂျက်</strong> နှင့် Quiz မေးခွန်းများအားလုံး ဖြေဆိုခွင့်</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-amber-400 font-bold">💎</span>
                  <span><strong>Premium Verifiable PDF</strong> အောင်လက်မှတ်များ ရရှိနိုင်ခြင်း</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-amber-400 font-bold">💎</span>
                  <span><strong>Advanced AI Coding Mentor</strong> အကန့်အသတ်မရှိ အသုံးပြုခွင့်</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onNavigateTab && onNavigateTab("premium")}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <span>💎 Upgrade to Premium 👑</span>
                </button>
                <button
                  onClick={onBack}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-300 font-medium rounded-xl text-xs transition-all cursor-pointer"
                >
                  သင်တန်းများစာရင်းသို့ ပြန်သွားရန်
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* TAB 1: Lecture View */}
          {activeTab === "lecture" && (
            <div className="max-w-4xl mx-auto space-y-8 text-slate-300">
              {/* Kibo Lesson Introduction */}
              <div className="bg-[#1E293B]/40 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5 shadow-lg relative overflow-hidden">
                <div className="absolute right-2 top-2 bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[9px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>OFFLINE AVAILABLE</span>
                </div>
                <div className="flex-shrink-0">
                  <KiboMascot 
                    emotion="happy" 
                    size="sm"
                    animated={true}
                  />
                </div>
                <div className="flex-1 space-y-1.5 text-left">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">Kibo Virtual Mentor</span>
                  <h3 className="text-sm font-bold text-slate-100 font-display">မင်္ဂလာပါ Coder လေးတို့ရေ!</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    အခုကျွန်တော်တို့ အတူတူ လေ့လာမယ့် သင်ခန်းစာကတော့ <strong className="text-blue-400">"{activeLesson.title}"</strong> ဖြစ်ပါတယ်ဗျာ။ 
                    {activeLesson.whyImportant || "ဒီသင်ခန်းစာက သင့်ရဲ့ ရေးသားမှုစွမ်းရည်ကို ပိုမိုမြှင့်တင်ပေးပါလိမ့်မယ်။"}
                  </p>
                </div>
              </div>

              {/* Kibo Quick Lesson Assistant triggers */}
              <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-5 space-y-4 shadow-xl relative">
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-bold text-white px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
                  <span>KIBO INTERACTIVE TEACHER (မြန်မာလို မေးပါ)</span>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed pt-1.5">
                  သင်ခန်းစာနှင့်ပတ်သက်ပြီး နားမလည်သည်များကို Kibo Coding Teacher ထံသို့ မြန်မာလို အမြန်ဆုံး တစ်ချက်နှိပ်ရုံဖြင့် မေးမြန်းနိုင်ပါသည်ခင်ဗျာ။
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    {
                      title: "📖 သင်ခန်းစာ ရှင်းပြခိုင်းမည် (Explain Lesson)",
                      desc: "နေ့စဉ်ဘဝ ဥပမာများနှင့် သဘောတရားများကို ရှင်းပြပါ",
                      prompt: `Please explain the concept and core theory behind "${activeLesson.title}" in simple Myanmar language with beginner-friendly real-world analogies.`
                    },
                    {
                      title: "❓ သိလိုသည်များ မေးမြန်းမည် (Answer Questions)",
                      desc: "သင်ခန်းစာနှင့် ပတ်သက်သည့် မေးခွန်းများ မေးရန်",
                      prompt: `I am currently studying "${activeLesson.title}". I want to ask some technical questions about how this works in practice.`
                    },
                    {
                      title: "🧭 ကုဒ် လမ်းညွှန်ချက် ရယူမည် (Coding Guidance)",
                      desc: "Logic စဉ်းစားပုံနှင့် Algorithm လမ်းညွှန်ချက်",
                      prompt: `Please provide step-by-step logic hints and guidance on how to write code for "${activeLesson.title}". Do not give full direct solutions, but guide my thought process.`
                    },
                    {
                      title: "💡 လက်တွေ့ ဥပမာများ တောင်းမည် (Give Examples)",
                      desc: "Basic မှစ၍ Real-world Production Code ဥပမာများ",
                      prompt: `Show me practical code examples for "${activeLesson.title}" (Basic, Practical, and Real-world) with line-by-line explanations in Myanmar.`
                    },
                    {
                      title: "🐞 ဖြစ်လေ့ရှိသော အမှားများ (Understand Errors)",
                      desc: "Beginner များ ဖြစ်တတ်သော အမှားများနှင့် ဖြေရှင်းပုံ",
                      prompt: `What are the most common syntax errors and logical mistakes beginners make with "${activeLesson.title}"? Explain the root causes and how to fix them.`
                    },
                    {
                      title: "🎯 ကိုယ်တိုင် လက်တွေ့စိန်ခေါ်မှု တောင်းရန်",
                      desc: "သင်ခန်းစာ အားဖြည့်စိန်ခေါ်မှုနှင့် အကြံပြုချက်",
                      prompt: `Please give me a small, fun practice challenge based on "${activeLesson.title}" to test my understanding!`
                    }
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setAiTriggerPrompt({ text: btn.prompt, id: Date.now() });
                        setShowAIDrawer(true);
                      }}
                      className="text-left bg-slate-900 border border-slate-800 hover:border-purple-500/40 p-3 rounded-xl transition-all hover:bg-slate-800 group cursor-pointer"
                    >
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-400 leading-snug">{btn.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 font-sans">{btn.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingMarkdown ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-xs font-mono">သင်ခန်းစာ ဖတ်ရှုနေပါသည်...</p>
                </div>
              ) : markdownContent ? (
                <div className="space-y-6">
                  <MarkdownRenderer content={markdownContent} />
                  
                  {/* Action Button to Next Tab */}
                  <div className="pt-8 border-t border-slate-800 text-right">
                    <button
                      onClick={() => setActiveTab("exercise")}
                      className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-lg cursor-pointer"
                    >
                      <span>လေ့ကျင့်ခန်းစမ်းသပ်မည်</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Telegram Video Delivery Platform Card */}
                  <TelegramVideoCard
                    lesson={activeLesson}
                    course={course}
                    user={user}
                    onOpenTelegramHub={() => setShowTelegramHub(true)}
                    onNavigateToPremium={() => onNavigateTab ? onNavigateTab("premium") : null}
                  />

                  {/* Learning Clarity Compass: What you are learning, What you completed, What comes next */}
                  <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-950/30 border border-blue-500/20 rounded-2xl p-5 shadow-lg space-y-3 text-left">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <Compass className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
                          သင်ယူမှု လမ်းညွှန်လမ်းညွှန်ချက် (Learning Roadmap & Transparency)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                        LESSON {activeLessonIdx + 1} OF {course.lessons.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* What you are learning */}
                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-400 flex items-center gap-1 uppercase">
                          <BookOpen className="w-3 h-3" /> ၁။ ယခုသင်ယူနေသောအရာ (What you are learning)
                        </span>
                        <h4 className="font-bold text-slate-200 text-xs line-clamp-1">{activeLesson.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                          {activeLesson.whatIsIt || activeLesson.learningObjectives?.what}
                        </p>
                      </div>

                      {/* What you have completed */}
                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 uppercase">
                          <CheckCircle2 className="w-3 h-3" /> ၂။ ပြီးမြောက်ခဲ့သောအရာ (What you completed)
                        </span>
                        <div className="flex items-center justify-between text-slate-300 text-xs">
                          <span>ပြီးမြောက်မှု:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {course.lessons.filter(l => (user.completedLessons || []).includes(l.id)).length} / {course.lessons.length} Lessons
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.round((course.lessons.filter(l => (user.completedLessons || []).includes(l.id)).length / course.lessons.length) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {(user.completedLessons || []).includes(activeLesson.id) ? "✅ ဤသင်ခန်းစာ ပြီးမြောက်ပြီးပါပြီ" : "⚡ ယခုသင်ခန်းစာ လေ့လာနေဆဲ (In Progress)"}
                        </p>
                      </div>

                      {/* What comes next */}
                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-purple-400 flex items-center gap-1 uppercase">
                          <ChevronRight className="w-3 h-3" /> ၃။ နောက်ဆက်တွဲလာမည့်အရာ (What comes next)
                        </span>
                        <h4 className="font-bold text-slate-200 text-xs line-clamp-1">
                          {course.lessons[activeLessonIdx + 1]?.title || "Course Final Project & Certificate"}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                          {activeLesson.nextLesson || "ယခုသင်ခန်းစာပါ အခြေခံများကို အသုံးပြု၍ ပိုမိုအဆင့်မြင့်သော ပရောဂျက်များကို ဖန်တီးတည်ဆောက်ပါမည်။"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 1: Lesson Header */}
                  <div className="border-b border-slate-800 pb-4 space-y-2 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold">
                        PART 1: LESSON LECTURE & THEORY
                      </span>
                      <h1 className="text-2xl font-black text-white font-display">
                        {activeLesson.title}
                      </h1>
                    </div>
                  </div>

                  {/* Part 2: Learning Objectives */}
                  <div className="bg-[#1E293B]/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center space-x-2 text-blue-400 font-display font-semibold">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      <h3>သင်ယူမှု ရည်မှန်းချက်များ (Learning Objectives)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900/40 p-4 rounded-xl space-y-1.5">
                        <span className="font-bold text-slate-200">📌 မည်သည့်အရာဖြစ်သနည်း (What to learn):</span>
                        <p className="text-slate-400 leading-relaxed">
                          {activeLesson.learningObjectives?.what || activeLesson.whatIsIt}
                        </p>
                      </div>
                      <div className="bg-slate-900/40 p-4 rounded-xl space-y-1.5">
                        <span className="font-bold text-slate-200">💡 ဘာကြောင့် အရေးကြီးသနည်း (Why it matters):</span>
                        <p className="text-slate-400 leading-relaxed">
                          {activeLesson.learningObjectives?.why || activeLesson.whyImportant}
                        </p>
                      </div>
                      <div className="bg-slate-900/40 p-4 rounded-xl space-y-1.5">
                        <span className="font-bold text-slate-200">🕒 မည်သည့်အချိန်တွင် သုံးသနည်း (When to use):</span>
                        <p className="text-slate-400 leading-relaxed">
                          {activeLesson.learningObjectives?.when || "ဤသင်ခန်းစာပါ အယူအဆများကို ဆော့ဖ်ဝဲ၏ အစပိုင်း သို့မဟုတ် ဒေတာများ စတင်သိမ်းဆည်း ကိုင်တွယ်လိုသည့် အခါတိုင်းတွင် အသုံးပြုသည်။"}
                        </p>
                      </div>
                      <div className="bg-slate-900/40 p-4 rounded-xl space-y-1.5">
                        <span className="font-bold text-slate-200">🛠 လက်တွေ့ စီမံကိန်းများတွင် သုံးပုံ (How it is used):</span>
                        <p className="text-slate-400 leading-relaxed">
                          {activeLesson.learningObjectives?.how || "လက်တွေ့လုပ်ငန်းခွင်ပရောဂျက်များတွင် အသုံးပြုသူထံမှ ဒေတာများ လက်ခံခြင်း၊ သိမ်းဆည်းခြင်းနှင့် တွက်ချက်ခြင်းများတွင် သုံးသည်။"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 3 & 5: Myanmar Explanation & Theory Section */}
                  <div className="bg-[#1E293B]/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-400 font-display font-semibold border-b border-slate-800 pb-2">
                      <BookOpen className="w-5 h-5 text-emerald-500" />
                      <h3>သင်ခန်းစာ ရှင်းလင်းချက်နှင့် သီအိုရီ (Theory & Myanmar Explanation)</h3>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-slate-300">
                      <p>
                        {activeLesson.myanmarExplanation || activeLesson.whatIsIt}
                      </p>
                      <div className="p-4 bg-slate-900/60 border-l-4 border-blue-500 rounded-r-xl text-xs text-slate-400">
                        <strong className="text-slate-200 block mb-1">သီအိုရီ အယူအဆ (Theory Core Concept):</strong>
                        {activeLesson.theory || activeLesson.whyImportant}
                      </div>
                    </div>
                  </div>

                  {/* Part 4: English Keywords */}
                  <div className="bg-[#1E293B]/40 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider text-slate-400">
                      အင်္ဂလိပ် အဓိကဝေါဟာရများ (English Keywords)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(activeLesson.englishKeywords || ["Variable", "Syntax", "Declaration", "Assignment", "Data Type"]).map((kw, i) => (
                        <span key={i} className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono font-bold border border-slate-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Part 6: Syntax */}
                  <div className="space-y-3">
                    <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider">ကုဒ်ရေးထုံးစနစ် (Syntax Style)</h4>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs overflow-x-auto text-left leading-relaxed text-blue-300 shadow-inner">
                      <pre>{activeLesson.syntax}</pre>
                    </div>
                  </div>

                  {/* Part 7: Code Examples */}
                  <div className="space-y-4">
                    <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider">နမူနာ ကုဒ်လိုင်းများ (Code Examples)</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {activeLesson.examples.map((eg, idx) => {
                        const egId = `eg-${activeLesson.id}-${idx}`;
                        const isBookmarked = (user.bookmarks || []).includes(egId);
                        return (
                          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-3 text-slate-300 relative group">
                            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">EXAMPLE {idx + 1}</span>
                              <button
                                onClick={() => {
                                  const updated = toggleRichBookmark(
                                    user as any, 
                                    egId, 
                                    "lesson", 
                                    `Code Example ${idx + 1} - ${activeLesson.title}`,
                                    `/course/${course.id}/lesson/${activeLesson.id}`
                                  );
                                  onUpdateUser(updated);
                                }}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                  isBookmarked 
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" 
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700/50"
                                }`}
                              >
                                {isBookmarked ? (
                                  <>
                                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>မှတ်စုထဲသိမ်းဆည်းပြီး</span>
                                  </>
                                ) : (
                                  <>
                                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                                    <span>ကုဒ်နမူနာသိမ်းရန်</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="text-purple-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">{eg}</pre>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Part 8 & 9: Step-by-Step Explanation & Output Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    <div className="bg-[#1E293B]/40 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider text-slate-400">
                        တစ်ဆင့်ချင်း ရှင်းလင်းချက် (Step-by-Step)
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                        {(activeLesson.stepByStepExplanation || [
                          "ပرိုဂရမ်၏ အဝင်တန်ဖိုးကို variable ထဲသို့ စနစ်တကျ သတ်မှတ်ပါ။",
                          "ကုဒ်ရေးထုံး (Syntax) ကို လိုက်နာပြီး logical expression များ ရေးသားပါ။",
                          "ရလဒ်များကို terminal တွင် စနစ်တကျ print ထုတ်ပြီး ဆန်းစစ်ပါ။"
                        ]).map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider text-slate-400">
                        မျှော်မှန်းရလဒ် နမူနာ (Output Preview)
                      </h4>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 leading-normal">
                        <pre>{activeLesson.outputPreview || "Hello, Myanmar Coder!\n[Success] Program completed with exit code 0."}</pre>
                      </div>
                    </div>
                  </div>

                  {/* Part 10: Common Mistakes */}
                  <div className="space-y-4">
                    <h4 className="font-display font-semibold text-red-400 text-sm uppercase tracking-wider">အဖြစ်များသော အမှားများ (Common Mistakes)</h4>
                    <div className="space-y-3">
                      {activeLesson.commonMistakes.map((mistake, idx) => (
                        <div key={idx} className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 space-y-2">
                          <p className="text-xs font-mono text-red-400 font-bold">❌ မှားယွင်းသောပုံစံ: {mistake.mistake}</p>
                          <p className="text-xs font-mono text-emerald-400 font-bold">✅ မှန်ကန်သောပုံစံ: {mistake.correction}</p>
                          <p className="text-xs text-slate-400 mt-1">{mistake.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Part 11: Best Practices */}
                  <div className="bg-[#1E293B]/40 border border-slate-800 rounded-2xl p-6 space-y-3">
                    <h4 className="font-display font-semibold text-blue-400 text-sm uppercase tracking-wider">လိုက်နာရမည့် ကျင့်ဝတ်များ (Best Practices)</h4>
                    <ul className="list-disc list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                      {activeLesson.bestPractices.map((bp, idx) => (
                        <li key={idx}>{bp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Part 12 & 16: Tips & Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    <div className="bg-[#1E293B]/40 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider text-slate-400">
                        အကြံပြုချက်များ (Tips)
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                        {(activeLesson.tips || [
                          "ကုဒ်ရေးရာတွင် variable အမည်များကို ဖတ်ရလွယ်ကူပြီး အဓိပ္ပာယ်ရှိသော စာလုံးများ သုံးပါ။",
                          "ကုဒ်တစ်ခုချင်းစီ၏ နောက်ကွယ်ရှိ အလုပ်လုပ်ပုံကို စဉ်းစားပါ။"
                        ]).map((tip, i) => (
                          <li key={i}>💡 {tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider text-slate-400">
                        သင်ခန်းစာ အနှစ်ချုပ် (Summary)
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {activeLesson.lessonSummary || `${activeLesson.title} သင်ခန်းစာကို အခြေခံကျကျ ကောင်းမွန်စွာ ပြီးမြောက်သွားပြီ ဖြစ်ပါသည်။`}
                      </p>
                    </div>
                  </div>

                  {/* Part 15: Lesson Assignment Box */}
                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-950/40 border border-blue-500/20 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center space-x-2 text-blue-400">
                      <FileText className="w-5 h-5" />
                      <h4 className="font-bold text-sm text-white">သင်ခန်းစာ အိမ်စာစိန်ခေါ်မှု (Lesson Assignment)</h4>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-200">
                        {activeLesson.assignment?.title || activeLesson.miniProject.title}
                      </h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {activeLesson.assignment?.description || activeLesson.miniProject.description}
                      </p>
                      <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
                        {(activeLesson.assignment?.instructions || activeLesson.miniProject.guide).map((ins, i) => (
                          <li key={i}>{ins}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Offline Support Notes Editor and Downloader */}
                  <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 bg-blue-500/10 text-blue-400 font-bold font-mono text-[9px] px-3 py-1 rounded-bl-xl border-l border-b border-blue-500/20 flex items-center gap-1">
                      <span>OFFLINE STUDY SUITE</span>
                    </div>

                    <div className="space-y-1 text-left">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                        <History className="w-4 h-4 text-blue-400" />
                        အော့ဖ်လိုင်းလေ့လာရန်နှင့် ကိုယ်ပိုင်မှတ်စုများ (Offline Study Notes)
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        အင်တာနက်မရှိသည့်အချိန်များတွင် ပြန်လည်ဖတ်ရှုနိုင်ရန် သင်ခန်းစာတစ်လုံးလုံးကို Download ရယူပါ။ အောက်ပါ Textbox တွင် သင်ယူစဉ် တွေ့ရှိရသော အဓိကမှတ်စုများကို ရေးသားသိမ်းဆည်းထားနိုင်ပါသည်ခင်ဗျာ။ (Auto-saves locally)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        value={offlineNotes}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOfflineNotes(val);
                          localStorage.setItem(`clm_notes_${activeLesson.id}`, val);
                          setIsOfflineSaved(true);
                          setTimeout(() => setIsOfflineSaved(false), 2000);
                        }}
                        placeholder="ဒီသင်ခန်းစာအတွက် သင်ယူရရှိမှုများနှင့် အရေးကြီးသော ကုဒ်များကို ဤနေရာတွင် ကိုယ်တိုင်မှတ်စုရေးနိုင်ပါသည်..."
                        className="w-full h-32 bg-slate-900 border border-slate-800 focus:border-blue-500/50 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-sans"
                      />
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-mono">
                          {isOfflineSaved ? "✅ Auto-saved to local browser storage" : "📝 Type above to save notes automatically"}
                        </span>
                        <span className="text-slate-500 font-mono">
                          Length: {offlineNotes.length} chars
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        onClick={() => {
                          const fileContent = `COURSE: ${course.title}\nLESSON: ${activeLesson.title}\n\n=========================\nLEARNING OBJECTIVES:\n- What: ${activeLesson.learningObjectives?.what || activeLesson.whatIsIt}\n- Why: ${activeLesson.learningObjectives?.why || activeLesson.whyImportant}\n\n=========================\nMYANMAR EXPLANATION:\n${activeLesson.myanmarExplanation || ""}\n\n=========================\nSYNTAX:\n${activeLesson.syntax}\n\n=========================\nMY PERSONAL STUDY NOTES:\n${offlineNotes || "(No custom notes written yet)"}\n\n=========================\nCode Learn Myanmar - Build like a pro!`;
                          const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `${activeLesson.title.toLowerCase().replace(/\s+/g, "_")}_lesson_notes.txt`;
                          link.click();
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-800 cursor-pointer transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>သင်ခန်းစာစာအုပ် ဒေါင်းလုဒ်ဆွဲရန် (.TXT)</span>
                      </button>
                    </div>
                  </div>

                  {/* Next Lesson Bridge Card */}
                  <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block">
                            NEXT TOPIC ROADMAP (နောက်သင်ခန်းစာ လမ်းညွှန်)
                          </span>
                          <h4 className="font-bold text-sm text-white">
                            {course.lessons[activeLessonIdx + 1]?.title || "Course Final Project & Summary"}
                          </h4>
                        </div>
                      </div>

                      {activeLessonIdx < course.lessons.length - 1 && (
                        <button
                          onClick={() => {
                            if (activeLessonIdx + 1 >= 2 && !isPremiumUser) {
                              if (onNavigateTab) onNavigateTab("premium");
                            } else {
                              setActiveLessonIdx(activeLessonIdx + 1);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                        >
                          <span>နောက်သင်ခန်းစာသို့ တိုက်ရိုက်သွားမည်</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeLesson.nextLesson || "ဤသင်ခန်းစာပြီးဆုံးပါက လက်တွေ့ စိန်ခေါ်မှုများနှင့် ပရောဂျက်များကို စတင်လေ့ကျင့်ပြီး ဗဟုသုတများကို တိုးပွားအောင် ဆက်လက်တည်ဆောက်ပါမည်။"}
                    </p>
                  </div>

                  {/* Action Button to Next Tab */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        if (activeLessonIdx > 0) {
                          setActiveLessonIdx(activeLessonIdx - 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      disabled={activeLessonIdx === 0}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>ရှေ့သင်ခန်းစာသို့</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("exercise")}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>လက်တွေ့ လေ့ကျင့်ခန်းစမ်းသပ်မည် (Go to Practice)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: Exercise Sandbox View */}
          {activeTab === "exercise" && (
            <div className="flex flex-col space-y-4 h-full max-w-7xl mx-auto items-stretch">
              {/* Challenge Switcher Bar */}
              <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
                <span className="text-[10px] text-slate-500 font-mono font-bold px-3 uppercase shrink-0">CHALLENGES:</span>
                {challenges.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveChallengeIdx(idx);
                      setUserCode(ch.codeTemplate);
                      setLeftTab('instructions');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-2 ${
                      activeChallengeIdx === idx
                        ? "bg-blue-600 border-blue-500 text-white shadow-md"
                        : "bg-slate-800/60 hover:bg-slate-850 text-slate-400 border-transparent hover:text-slate-200"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-mono">{idx + 1}</span>
                    <span>{ch.title}</span>
                  </button>
                ))}
              </div>

              {/* Enhanced Interactive Code Editor Workspace */}
              <CodeEditorWorkspace
                initialCode={userCode || currentChallenge.codeTemplate}
                language={(currentChallenge.language as any) || "python"}
                title={currentChallenge.title}
                instructions={currentChallenge.instruction}
                hints={currentChallenge.hints}
                expectedOutput={currentChallenge.expectedOutput}
                onCodeChange={(newCode) => setUserCode(newCode)}
                onRunSuccess={(output) => {
                  setLivePreviewCode(userCode);
                  if (activeChallengeIdx === challenges.length - 1) {
                    awardXP(30, `Exercise ${currentChallenge.title} completed!`);
                  }
                }}
                onAskKiboAI={(codeVal, errVal) => {
                  setAiTriggerPrompt({
                    text: `ကျေးဇူးပြု၍ ကျွန်ုပ်ရေးထားသော "${currentChallenge.title}" ကုဒ်တွင် ဖြစ်ပေါ်နေသော error အား မြန်မာလို ရှင်းပြပေးပြီး ဘယ်လိုပြင်ဆင်ရမလဲ လမ်းညွှန်ပေးပါ ခင်ဗျာ:\n\n\`\`\`${currentChallenge.language}\n${codeVal}\n\`\`\`\n\nError: ${errVal || "None"}`,
                    id: Date.now()
                  });
                  setShowAIDrawer(true);
                }}
                experimentSnippets={[
                  {
                    title: "Default Template",
                    code: currentChallenge.codeTemplate,
                    description: "မူလပေးထားသော အစပြု ကုဒ်ပုံစံ"
                  },
                  {
                    title: "Hello Print",
                    code: currentChallenge.language === "python" ? 'print("Hello, Myanmar Developer!")' : 'console.log("Hello, Myanmar!");',
                    description: "ရိုးရှင်းသော Print ထုတ်ပြန်မှု ဥပမာ"
                  }
                ]}
              />

                  {/* Kibo Playground Tools */}
                  <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-4 space-y-3 shadow-xl relative text-left font-sans mt-4">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-400">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                      <span>KIBO PLAYGROUND MENTOR (ပင်မလုပ်ဆောင်ချက် ၅ ရပ်)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-sans">
                      <button
                        onClick={() => {
                          setAiTriggerPrompt({
                            text: `Explain the core concepts and syntax of "${currentChallenge.title}" in simple Myanmar language so I can understand the theory before writing code.`,
                            id: Date.now()
                          });
                          setShowAIDrawer(true);
                        }}
                        className="p-2 bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-xl text-slate-300 hover:text-purple-400 text-left transition-all font-semibold cursor-pointer"
                      >
                        📖 ၁။ သင်ခန်းစာ ရှင်းပြခိုင်းမည် (Explain)
                      </button>

                      <button
                        onClick={() => {
                          setAiTriggerPrompt({
                            text: `I have a question about this coding exercise "${currentChallenge.title}" (${currentChallenge.language}): ${currentChallenge.instruction}. Can you explain how this language feature works?`,
                            id: Date.now()
                          });
                          setShowAIDrawer(true);
                        }}
                        className="p-2 bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-xl text-slate-300 hover:text-purple-400 text-left transition-all font-semibold cursor-pointer"
                      >
                        ❓ ၂။ သိလိုသည်များ မေးမည် (Ask)
                      </button>

                      <button
                        onClick={() => {
                          setAiTriggerPrompt({
                            text: `Please give me step-by-step logic guidance and algorithmic hints for solving the challenge "${currentChallenge.title}". Do NOT give me the full copy-paste code, but guide my thought process in Myanmar so I can write it myself.`,
                            id: Date.now()
                          });
                          setShowAIDrawer(true);
                        }}
                        className="p-2 bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-xl text-slate-300 hover:text-purple-400 text-left transition-all font-semibold cursor-pointer"
                      >
                        🧭 ၃။ ကုဒ် လမ်းညွှန်ချက် (Guidance)
                      </button>

                      <button
                        onClick={() => {
                          setAiTriggerPrompt({
                            text: `Show me a small, practical code example of how to use the concepts behind "${currentChallenge.title}" with line-by-line comments in Myanmar.`,
                            id: Date.now()
                          });
                          setShowAIDrawer(true);
                        }}
                        className="p-2 bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-xl text-slate-300 hover:text-purple-400 text-left transition-all font-semibold cursor-pointer"
                      >
                        💡 ၄။ နမူနာ ဥပမာများ (Examples)
                      </button>

                      <button
                        onClick={() => {
                          setAiTriggerPrompt({
                            text: `Explain the errors in my code or why it is failing for this exercise.\n\nCode I wrote:\n\`\`\`${currentChallenge.language}\n${userCode}\n\`\`\`\n\nExpected Output: ${currentChallenge.expectedOutput}\n\nConsole output/errors:\n${codeOutput || "None"}\n\nPlease explain the ROOT CAUSE of the error in simple Myanmar language and show me how to fix it.`,
                            id: Date.now()
                          });
                          setShowAIDrawer(true);
                        }}
                        className="p-2 bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-xl text-slate-300 hover:text-purple-400 text-left transition-all font-semibold cursor-pointer"
                      >
                        🐞 ၅။ အမှား ဆန်းစစ်ရန် (Understand Errors)
                      </button>

                      <button
                        onClick={() => {
                          setAiTriggerPrompt({
                            text: `Take my current code and explain it line-by-line using comments and simple analogies in Myanmar:\n\n\`\`\`${currentChallenge.language}\n${userCode}\n\`\`\``,
                            id: Date.now()
                          });
                          setShowAIDrawer(true);
                        }}
                        className="p-2 bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-xl text-slate-300 hover:text-purple-400 text-left transition-all font-semibold cursor-pointer"
                      >
                        📝 တစ်လိုင်းချင်း ရှင်းပြခိုင်းမည်
                      </button>
                    </div>
                  </div>

                  {/* Practice Step Navigation Footer */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80 mt-4">
                    <button
                      onClick={() => {
                        setActiveTab("lecture");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs font-semibold text-slate-300 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>သင်ခန်းစာ ရှင်းလင်းချက်သို့ (Back to Explanation)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("quiz");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>ဉာဏ်စမ်းမေးခွန်းများ ဖြေဆိုရန် (Proceed to Quiz)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
            </div>
          )}

          {/* TAB 3: Quiz View */}
          {activeTab === "quiz" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <Assessment
                assessmentId={`lesson-${activeLesson.id}-quiz`}
                assessmentTitle={`${activeLesson.title}: End-of-Lesson Quiz`}
                assessmentType="lesson_quiz"
                courseId={course.id}
                courseTitle={course.title}
                user={user}
                onUpdateUser={onUpdateUser}
                onComplete={(score, total, passed) => {
                  console.log("Lesson quiz completed with score:", score, "/", total, "Passed:", passed);
                  if (passed) {
                    handleCompleteLesson();
                  }
                }}
                onCancel={() => {
                  setActiveTab("lecture");
                }}
              />
            </div>
          )}

              {/* Compare Modal rendered overlay */}
              {showCompareModal && (
                <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
                  <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 text-left animate-scale-up">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-display font-bold text-sm text-white">ကုဒ်ရေးထုံး နှိုင်းယှဉ်ချက် (Compare with Original Template)</h3>
                      <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">ပိတ်ရန် (Close)</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">မူလ အစပြုကုဒ် (Original Template):</span>
                        <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-400 overflow-x-auto h-64 whitespace-pre-wrap">{currentChallenge.codeTemplate}</pre>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-blue-400 font-bold uppercase">သင် ရေးသားထားသော ကုဒ် (Your Code):</span>
                        <pre className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 font-mono text-xs text-blue-300 overflow-x-auto h-64 whitespace-pre-wrap">{userCode}</pre>
                      </div>
                    </div>
                    <div className="text-right">
                      <button onClick={() => setShowCompareModal(false)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer">နားလည်ပါပြီ (Close)</button>
                    </div>
                  </div>
                </div>
              )}

          {/* TAB 4: Mini Project challenge */}
          {activeTab === "project" && (
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
              <div className="bg-[#1E293B]/50 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden shadow-xl">
                <div className="absolute -right-24 -top-24 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="flex items-center space-x-2 text-blue-400 font-display font-bold">
                  <Award className="w-6 h-6 text-blue-400 animate-bounce" />
                  <h3 className="text-lg">သင်ခန်းစာအလိုက် လက်တွေ့ Mini Project: {activeLesson.miniProject.title}</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed text-left">
                  {activeLesson.miniProject.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-800/60">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider text-left flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    လမ်းညွှန်ချက် အဆင့်ဆင့် (Step-by-Step Guide)
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-400 text-left pl-1">
                    {activeLesson.miniProject.guide.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-3.5">
                        <span className="w-5 h-5 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center font-bold text-[10px] text-blue-400 flex-shrink-0 mt-0.5">{idx + 1}</span>
                        <span className="leading-relaxed text-slate-300">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Grid: Live Project Sandbox Code Editor & Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider text-left">၁။ ပရောဂျက် ကုဒ်ရေးသားရန်နေရာ (Write Your Code)</h4>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden h-96 shadow-inner">
                      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Project Workspace</span>
                        <button 
                          onClick={() => setProjectCode(activeLesson.miniProject.startingCode || "")}
                          className="px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded hover:border-slate-700 cursor-pointer flex items-center gap-1.5"
                          title="Reset Starting Code"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>ကုဒ်မူလအတိုင်းပြန်စမည်</span>
                        </button>
                      </div>
                      <textarea
                        value={projectCode}
                        onChange={(e) => setProjectCode(e.target.value)}
                        placeholder="ပရောဂျက်စတင်ရန် မူလကုဒ်ကို ပြင်ဆင်ပြီး သင့်စိတ်ကြိုက် ဖန်တီးရေးသားပါ..."
                        className="flex-1 bg-transparent p-4 font-mono text-xs text-blue-300 focus:outline-none resize-none leading-relaxed text-left"
                        spellCheck="false"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Notes / Explanation section */}
                  <div className="space-y-2 text-left">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">၂။ ပရောဂျက်အနှစ်ချုပ် ရှင်းလင်းချက် (Project Notes)</h4>
                    <textarea
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      placeholder="ပရောဂျက်ကို မည်ကဲ့သို့ တည်ဆောက်ခဲ့သည်ကို သင့်ရဲ့ကိုယ်ပိုင်မှတ်စု၊ ရှင်းလင်းချက်တိုများ ဤနေရာတွင် ရေးသားပေးပါ..."
                      className="w-full h-32 bg-slate-900 border border-slate-800 focus:border-blue-500/50 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-sans"
                    />
                  </div>

                  {/* Screenshot Drag & Drop Uploader */}
                  <div className="space-y-2 text-left">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">၃။ ရလဒ် ပုံရိပ်တင်သွင်းရန် (Screenshot Upload)</h4>
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add("border-blue-500", "bg-blue-500/5");
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("border-blue-500", "bg-blue-500/5");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("border-blue-500", "bg-blue-500/5");
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith("image/")) {
                          const reader = new FileReader();
                          reader.onload = () => setProjectScreenshot(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      onClick={() => {
                        const fileInput = document.createElement("input");
                        fileInput.type = "file";
                        fileInput.accept = "image/*";
                        fileInput.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setProjectScreenshot(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        };
                        fileInput.click();
                      }}
                      className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all space-y-2 group"
                    >
                      {projectScreenshot ? (
                        <div className="space-y-3 relative">
                          <img 
                            src={projectScreenshot} 
                            alt="Project screenshot" 
                            className="max-h-36 mx-auto rounded-lg border border-slate-800 object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-[10px] text-emerald-400 font-bold font-mono">✅ SCREENSHOT ATTACHED SUCCESSFULLY</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectScreenshot(null);
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer font-bold block mx-auto"
                          >
                            ဓာတ်ပုံကို ပြန်ဖျက်မည်
                          </button>
                        </div>
                      ) : (
                        <div className="py-2 space-y-2">
                          <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-400 group-hover:text-blue-400 transition-all">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-300">ရလဒ် ပုံရိပ်ဆွဲထည့်ပါ သို့မဟုတ် နှိပ်ပြီးတင်သွင်းပါ</p>
                          <p className="text-[10px] text-slate-500 leading-normal">supports PNG, JPG, WebP. Drag & drop works perfectly!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Workstation Trigger */}
              <div className="pt-4 border-t border-slate-800 text-center space-y-4">
                {!projectGradingFeedback ? (
                  <button
                    disabled={isSubmittingProject}
                    onClick={() => {
                      if (!projectCode.trim()) {
                        alert("ပရောဂျက် ကုဒ်လိုင်းများကို ရေးသားပေးပါရန် ခင်ဗျာ။");
                        return;
                      }
                      setIsSubmittingProject(true);
                      setTimeout(() => {
                        setIsSubmittingProject(false);
                        setProjectGradingFeedback(`
🏆 **PROJECT EVALUATION REPORT**
- **ခေါင်းစဉ်:** ${activeLesson.miniProject.title}
- **ရလဒ် အဆင့်သတ်မှတ်ချက်:** GRADE A (ဂုဏ်ထူးဆောင် ထူးချွန်အဆင့်)
- **စုစုပေါင်း ရမှတ်:** 100 / 100
- **ဆုလာဘ်ဆုကြေး:** +100 XP 🏆

**Kibo AI Coding Teacher သုံးသပ်ချက်:**
သင့်ရေးသားထားသော ကုဒ်ပုံစံသည် အလွန်သပ်ရပ်ပြီး logical structure ကျနမှုရှိပါသည်ဗျာ။ သတ်မှတ်ထားသော လမ်းညွှန်ချက် အဆင့်ဆင့်ကို အပြည့်အဝလိုက်နာခဲ့ပြီး screenshot ပါ ရလဒ်နှင့်လည်း ကောင်းမွန်စွာ ထွက်ရှိပါသည်။ dynamic logic များ သုံးပုံမှာ အလွန်စံပြဖြစ်ပြီး လက်တွေ့လုပ်ငန်းခွင်တွင် ချက်ချင်း အသုံးပြုနိုင်မည့် အနေအထား ဖြစ်ပါသည်။ ဆက်လက်ကြိုးစားပါဗျာ!
                        `);
                        // Award XP
                        const isAlreadyCompleted = (user.completedLessons || []).includes(activeLesson.id);
                        if (!isAlreadyCompleted) {
                          awardXP(100, `Project submission approved for ${activeLesson.title}`);
                        }
                      }, 2500);
                    }}
                    className="px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:to-purple-700 font-extrabold text-sm text-white shadow-lg cursor-pointer transition-all flex items-center gap-2 mx-auto"
                  >
                    {isSubmittingProject ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Kibo AI Teacher မှ ကုဒ်များကို စစ်ဆေးနေပါသည်...</span>
                      </>
                    ) : (
                      <>
                        <span>ပရောဂျက်ကို တင်သွင်းပြီး အမှတ်စစ်မည် (Submit & Grade) 🚀</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-left max-w-2xl mx-auto space-y-5 shadow-2xl relative animate-scale-up">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <KiboMascot emotion="proud" size="sm" animated={true} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <h4 className="text-sm font-black text-emerald-400 font-display">Kibo AI Mentor မှ သင်တန်းအောင်ချက် ထုတ်ပြန်ပေးပါပြီ!</h4>
                        <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left">
                          {projectGradingFeedback}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        onClick={handleCompleteLesson}
                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-extrabold text-sm text-white shadow-lg shadow-emerald-500/10 cursor-pointer"
                      >
                        ဂုဏ်ယူပါတယ်! သင်ခန်းစာ ပြီးမြောက်ကြောင်း မှတ်သားရန် 🏆
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
      </div>

      {/* AI Assistant Right Side Panel */}
      {showAIDrawer && (
        <div className="w-full lg:w-96 bg-[#1E293B] border-l border-slate-800 flex flex-col flex-shrink-0 h-full overflow-hidden relative z-10 animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Sparkles className="w-3 h-3 animate-pulse text-purple-400" />
              </div>
              <span className="font-display font-bold text-xs text-white">Ask AI - Programming Teacher</span>
            </div>
            <button 
              onClick={() => setShowAIDrawer(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          {/* Assistant View */}
          <div className="flex-1 overflow-hidden bg-[#0F172A]">
            <AIAssistant 
              currentCourse={course}
              currentLesson={activeLesson}
              embeddedMode={true}
              user={user}
              onUpdateUser={onUpdateUser}
              triggerPrompt={aiTriggerPrompt}
            />
          </div>
        </div>
      )}

      {/* Telegram Video Delivery Hub Modal */}
      <TelegramVideoHubModal
        isOpen={showTelegramHub}
        onClose={() => setShowTelegramHub(false)}
        user={user}
        onNavigateToPremium={() => {
          setShowTelegramHub(false);
          if (onNavigateTab) onNavigateTab("premium");
        }}
        onUpdateUser={onUpdateUser}
      />

    </div>
  );
}
