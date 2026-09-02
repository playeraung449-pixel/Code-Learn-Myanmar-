import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Award, 
  Trophy, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Code, 
  HelpCircle, 
  Check, 
  CheckSquare, 
  Square,
  Volume2,
  Settings,
  Lightbulb,
  Lock,
  Crown,
  Zap
} from "lucide-react";
import { AssessmentQuestion, AssessmentAttempt, UserProfile } from "../types";
import { getQuestionsForAssessment, DEFAULT_QUESTIONS } from "../courses/assessmentQuestions";
import { 
  saveAssessmentAttempt, 
  getAssessmentSettings, 
  getAssessmentAttempts,
  executeQuizCompletionCascade
} from "../lib/db";
import { getLevelData } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { 
  fetchKiboOptimized, 
  generateKiboCacheKey, 
  getCachedKiboResponse, 
  setCachedKiboResponse 
} from "../lib/kiboClient";

interface AssessmentProps {
  assessmentId: string; // lessonId, module slug, or courseId
  assessmentTitle: string;
  assessmentType: "lesson_quiz" | "module_assessment" | "final_assessment";
  courseId: string;
  courseTitle: string;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onComplete: (score: number, total: number, passed: boolean) => void;
  onCancel?: () => void;
}

export const Assessment: React.FC<AssessmentProps> = ({
  assessmentId,
  assessmentTitle,
  assessmentType,
  courseId,
  courseTitle,
  user,
  onUpdateUser,
  onComplete,
  onCancel
}) => {
  const isPremium = user?.isPremium === true || user?.role === "premium" || user?.role === "teacher" || user?.role === "admin";

  // Stage state: 'start' | 'active' | 'feedback' | 'summary'
  const [stage, setStage] = useState<"start" | "active" | "summary">("start");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Answers states
  const [selectedOption, setSelectedOption] = useState<number | null>(null); // for 'mc', 'tf'
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]); // for 'ma'
  const [textAnswer, setTextAnswer] = useState(""); // for 'fitb', 'prediction', 'find_error', 'coding'
  
  // Grading states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectIds, setIncorrectIds] = useState<string[]>([]);
  
  // Metadata states
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [passingScorePercent, setPassingScorePercent] = useState(80);
  const [xpReward, setXpReward] = useState(50); // Default reward for lesson quizzes
  const [xpAwarded, setXPAwarded] = useState(0);
  
  // Accordion review states
  const [expandedReviews, setExpandedReviews] = useState<{ [key: string]: boolean }>({});

  // Kibo Progressive Hint States
  const [currentHintLevel, setCurrentHintLevel] = useState<number>(0);
  const [hintsData, setHintsData] = useState<{
    [qId: string]: {
      level1: string;
      level2: string;
      level3: string;
      conceptReminder?: string;
      programmingTip?: string;
      commonMistake?: string;
    };
  }>({});
  const [isGeneratingHint, setIsGeneratingHint] = useState<boolean>(false);
  const [activeExplanationType, setActiveExplanationType] = useState<"explanation" | "example" | "analogy" | "practice" | null>(null);
  const [explanationContent, setExplanationContent] = useState<{
    [qId: string]: {
      explanation?: string;
      example?: string;
      analogy?: string;
      practice?: string;
    };
  }>({});
  const [isGeneratingHintExplanation, setIsGeneratingHintExplanation] = useState<boolean>(false);
  const [hintsUsedToday, setHintsUsedToday] = useState<number>(0);
  const [showAdminSettings, setShowAdminSettings] = useState<boolean>(false);
  const [adminSettings, setAdminSettings] = useState({
    hintsEnabled: true,
    xpReductionRule: "small" as "none" | "small" | "no_effect",
    maxHints: 3,
    difficulty: "intermediate" as "beginner" | "intermediate" | "advanced",
  });
  const [hintsUsedPerQuestion, setHintsUsedPerQuestion] = useState<{ [qId: string]: number }>({});

  // Sound feedback simulation
  const [audioPlayed, setAudioPlayed] = useState(false);

  // Answers tracking states for all questions
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: any }>({});

  // Kibo AI Review states
  const [selectedReviewTab, setSelectedReviewTab] = useState<"none" | "answers" | "mistakes" | "ask" | "similar" | "history">("none");
  const [mistakesExplanation, setMistakesExplanation] = useState<string>("");
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState<boolean>(false);
  const [explanationError, setExplanationError] = useState<string>("");

  // Similar practice states
  const [similarQuestions, setSimilarQuestions] = useState<any[]>([]);
  const [isGeneratingSimilar, setIsGeneratingSimilar] = useState<boolean>(false);
  const [similarError, setSimilarError] = useState<string>("");
  const [similarAnswers, setSimilarAnswers] = useState<{ [qId: string]: number }>({});
  const [similarSubmitted, setSimilarSubmitted] = useState<{ [qId: string]: boolean }>({});
  const [similarFeedback, setSimilarFeedback] = useState<{ [qId: string]: { correct: boolean; explanation: string } }>({});
  const [similarCompleted, setSimilarCompleted] = useState<boolean>(false);

  // Kibo Chat states
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "မင်္ဂလာပါ! ဒီ quiz မှာရှိတဲ့ မေးခွန်းတွေအကြောင်း မရှင်းလင်းတာရှိရင် သို့မဟုတ် programming concept တွေကို ထပ်မံသိရှိလိုရင် မေးမြန်းနိုင်ပါတယ်ခင်ဗျာ။ Kibo က အမြဲတမ်း ရှင်းပြပေးဖို့ အဆင်သင့်ပါပဲ! 🦊💬"
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>("");

  // Learning history states
  const [attemptsHistory, setAttemptsHistory] = useState<AssessmentAttempt[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [commonMistakes, setCommonMistakes] = useState<{ topic: string; count: number }[]>([]);
  const [improvementTrend, setImprovementTrend] = useState<{ average: number; latest: number; trend: "up" | "down" | "stable" } | null>(null);

  // AI Limit tracking
  const [aiReviewsUsedToday, setAiReviewsUsedToday] = useState<number>(0);

  // Initialize and check AI review limits and progressive hints on mount
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("kibo_ai_review_date");
    let currentCount = parseInt(localStorage.getItem("kibo_ai_review_count") || "0", 10);
    if (savedDate !== todayStr) {
      currentCount = 0;
      localStorage.setItem("kibo_ai_review_date", todayStr);
      localStorage.setItem("kibo_ai_review_count", "0");
    }
    setAiReviewsUsedToday(currentCount);

    // Kibo Smart Hints daily limit initialization
    const savedHintDate = localStorage.getItem("kibo_hints_date");
    let currentHintsUsed = parseInt(localStorage.getItem("kibo_hints_used_today") || "0", 10);
    if (savedHintDate !== todayStr) {
      currentHintsUsed = 0;
      localStorage.setItem("kibo_hints_date", todayStr);
      localStorage.setItem("kibo_hints_used_today", "0");
    }
    setHintsUsedToday(currentHintsUsed);

    // Load admin settings if customized previously
    const savedAdminSettings = localStorage.getItem("kibo_hints_admin_settings");
    if (savedAdminSettings) {
      try {
        setAdminSettings(JSON.parse(savedAdminSettings));
      } catch (e) {
        console.error("Failed to parse admin settings", e);
      }
    }
  }, []);

  // Load questions and settings on mount / ID change
  useEffect(() => {
    const assessmentQuestions = getQuestionsForAssessment(assessmentId);
    setQuestions(assessmentQuestions);

    // Fetch dynamic database settings if they exist
    const loadSettings = async () => {
      const dbSettings = await getAssessmentSettings(assessmentId);
      if (dbSettings) {
        setPassingScorePercent(dbSettings.passingScorePercent);
        setXpReward(dbSettings.xpReward);
      } else {
        // Fallback defaults based on type
        if (assessmentType === "module_assessment") {
          setPassingScorePercent(75);
          setXpReward(100);
        } else if (assessmentType === "final_assessment") {
          setPassingScorePercent(80);
          setXpReward(200);
        } else {
          setPassingScorePercent(80);
          setXpReward(50);
        }
      }
    };
    loadSettings();
  }, [assessmentId, assessmentType]);

  // Duration Timer
  useEffect(() => {
    let timer: any;
    if (stage === "active") {
      timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  const startAssessment = () => {
    setStage("active");
    setCurrentIdx(0);
    setScore(0);
    setIncorrectIds([]);
    setTimeSpent(0);
    setStartTime(Date.now());
    setIsSubmitted(false);
    setUserAnswers({});
    setSelectedReviewTab("none");
    setMistakesExplanation("");
    setSimilarQuestions([]);
    setSimilarAnswers({});
    setSimilarSubmitted({});
    setSimilarFeedback({});
    setSimilarCompleted(false);
    setChatMessages([
      {
        role: "assistant",
        content: "မင်္ဂလာပါ! ဒီ quiz မှာရှိတဲ့ မေးခွန်းတွေအကြောင်း မရှင်းလင်းတာရှိရင် သို့မဟုတ် programming concept တွေကို ထပ်မံသိရှိလိုရင် မေးမြန်းနိုင်ပါတယ်ခင်ဗျာ။ Kibo က အမြဲတမ်း ရှင်းပြပေးဖို့ အဆင်သင့်ပါပဲ! 🦊💬"
      }
    ]);
    resetAnswerState();
  };

  const resetAnswerState = () => {
    setSelectedOption(null);
    setSelectedOptions([]);
    setTextAnswer("");
    setIsSubmitted(false);
    setAudioPlayed(false);
    setCurrentHintLevel(0);
    setActiveExplanationType(null);
  };

  // Kibo Smart Hints handlers
  const handleRequestHint = async () => {
    if (!currentQuestion) return;
    if (!adminSettings.hintsEnabled) return;

    // Check level limits
    const nextLevel = currentHintLevel + 1;
    if (nextLevel > adminSettings.maxHints) return;

    // Check daily limit for free users
    if (!isPremium && hintsUsedToday >= 5) {
      alert("ယနေ့အတွက် အခမဲ့ Kibo Smart Hints ကန့်သတ်ချက် (၅) ကြိမ် ပြည့်သွားပါပြီ။ Premium သို့ ဆင့်မြှင့်ပြီး အကန့်အသတ်မရှိ သုံးစွဲနိုင်ပါသည်!");
      return;
    }

    // Update hints used tracker
    if (!isPremium) {
      const newCount = hintsUsedToday + 1;
      setHintsUsedToday(newCount);
      localStorage.setItem("kibo_hints_used_today", newCount.toString());
    }

    // Set current level
    setCurrentHintLevel(nextLevel);
    setHintsUsedPerQuestion(prev => ({
      ...prev,
      [currentQuestion.id]: Math.max(prev[currentQuestion.id] || 0, nextLevel)
    }));

    // If hints for this question are not loaded yet, fetch them
    if (!hintsData[currentQuestion.id]) {
      setIsGeneratingHint(true);
      try {
        const response = await fetch("/api/gemini/quiz/hint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: currentQuestion,
            language: courseTitle.toLowerCase().includes("python") ? "python" : "javascript",
            studentProgress: {
              previousMistakes: incorrectIds,
              xp: user.xp,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setHintsData(prev => ({
            ...prev,
            [currentQuestion.id]: {
              level1: data.level1 || "စဉ်းစားကြည့်ပါဦးနော်။",
              level2: data.level2 || "မေးခွန်းထဲက key point ကို ရှာကြည့်ပါ။",
              level3: data.level3 || "အဖြေက သင့်နားတင် ရှိနေပါတယ်!",
              conceptReminder: data.conceptReminder,
              programmingTip: data.programmingTip,
              commonMistake: data.commonMistake,
            }
          }));
        } else {
          throw new Error("Failed to load hints");
        }
      } catch (err) {
        console.error("Error loading hints:", err);
        // Fallback local hints
        setHintsData(prev => ({
          ...prev,
          [currentQuestion.id]: {
            level1: "💡 Concept Clue: " + (currentQuestion.explanation?.slice(0, 50) || "Related concept: review variables and basic operations.") + "...",
            level2: "🔍 Guided Thinking: Look closely at variables, operands, and operations defined in the question statement or code snippet.",
            level3: "🎯 Near Solution: Recall the specific execution order or language rules taught in the relevant lesson.",
            conceptReminder: "💡 သတိပေးချက်- Lesson ကို သေချာစွာ ပြန်လည်ဖတ်ရှုခြင်းက အဖြေမှန်ဆီသို့ ပိုမိုမြန်ဆန်စွာ ပို့ဆောင်ပေးနိုင်ပါသည်!",
            programmingTip: "💻 Coding Tip: Syntax error သို့မဟုတ် logical error များကို စစ်ဆေးရာတွင် line-by-line စနစ်တကျ ခြေရာခံပါ။",
            commonMistake: "⚠️ အဖြစ်များဆုံးအမှား- စာလုံးအကြီးအသေးမှားခြင်း (Case Sensitivity) သို့မဟုတ် indentation အကွာအဝေးများ လွဲမှားခြင်း။"
          }
        }));
      } finally {
        setIsGeneratingHint(false);
      }
    }
  };

  const handleRequestExplanation = async (type: "explanation" | "example" | "analogy" | "practice") => {
    if (!currentQuestion) return;
    setActiveExplanationType(type);

    // If already generated in state for this question, just return
    if (explanationContent[currentQuestion.id]?.[type]) {
      return;
    }

    setIsGeneratingHintExplanation(true);
    try {
      const payload = {
        question: currentQuestion,
        language: courseTitle.toLowerCase().includes("python") ? "python" : "javascript",
        explanationType: type,
        userProfile: {
          uid: user?.uid,
          role: user?.role,
          isPremium: user?.isPremium || user?.role === "premium"
        }
      };

      const { data } = await fetchKiboOptimized("/api/gemini/quiz/hint", payload, "hint");

      if (data && data.content) {
        setExplanationContent(prev => ({
          ...prev,
          [currentQuestion.id]: {
            ...(prev[currentQuestion.id] || {}),
            [type]: data.content
          }
        }));
      } else {
        throw new Error("Failed to load explanation");
      }
    } catch (err) {
      console.error("Error loading custom explanation:", err);
      // Fallback
      let fallbackText = "";
      if (type === "explanation") {
        fallbackText = "🇲🇲 **မြန်မာဘာသာရှင်းလင်းချက်-** " + currentQuestion.explanation;
      } else if (type === "example") {
        fallbackText = "💻 **ကုဒ်နမူနာ (Programming Example):**\n```python\n# Syntax\nprint('Hello Code Learn!')\n```";
      } else if (type === "analogy") {
        fallbackText = "💡 **ဥပမာနှိုင်းယှဉ်ချက် (Visual Analogy):** variables များကို ကွန်ပျူတာမှတ်ဉာဏ်ထဲရှိ တံဆိပ်ကပ်ထားသော သေတ္တာလေးများဟု စိတ်ကူးကြည့်ပါ။ သေတ္တာပေါ်တွင် နာမည်ရေးထားပြီး အတွင်း၌ တန်ဖိုးများကို သိမ်းဆည်းပါသည်။";
      } else if (type === "practice") {
        fallbackText = "🎯 **ထပ်မံလေ့ကျင့်ရန် (Additional Practice):** သက်ဆိုင်ရာ logic concept များကို repl သို့မဟုတ် dynamic interpreter တွင် run ကြည့်ပြီး code output များကို ကိုယ်တိုင်ဆန်းစစ်ပါ။";
      }
      setExplanationContent(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...(prev[currentQuestion.id] || {}),
          [type]: fallbackText
        }
      }));
    } finally {
      setIsGeneratingHintExplanation(false);
    }
  };

  // Kibo AI Quiz Review Handlers
  const handleExplainMistakes = async () => {
    const isPremium = user?.isPremium || user?.role === "premium" || user?.role === "teacher" || user?.role === "admin";
    if (!isPremium) {
      const todayStr = new Date().toISOString().split("T")[0];
      const savedDate = localStorage.getItem("kibo_ai_review_date");
      let currentCount = parseInt(localStorage.getItem("kibo_ai_review_count") || "0", 10);
      
      if (savedDate !== todayStr) {
        currentCount = 0;
        localStorage.setItem("kibo_ai_review_date", todayStr);
      }
      
      if (currentCount >= 3) {
        setExplanationError("limit_reached");
        setSelectedReviewTab("mistakes");
        return;
      }
    }

    setIsGeneratingExplanation(true);
    setExplanationError("");
    setSelectedReviewTab("mistakes");

    try {
      const payload = {
        questions: questions.map(q => ({ id: q.id, question: q.question, type: q.type, explanation: q.explanation })),
        incorrectIds,
        studentAnswers: userAnswers,
        userProfile: {
          uid: user?.uid,
          role: user?.role,
          isPremium
        }
      };

      const { data } = await fetchKiboOptimized("/api/gemini/quiz/explain", payload, "review");

      if (!data || !data.explanation) {
        throw new Error("Failed to generate explanation. Please try again.");
      }

      setMistakesExplanation(data.explanation);

      if (!isPremium) {
        const todayStr = new Date().toISOString().split("T")[0];
        const currentCount = parseInt(localStorage.getItem("kibo_ai_review_count") || "0", 10) + 1;
        localStorage.setItem("kibo_ai_review_date", todayStr);
        localStorage.setItem("kibo_ai_review_count", currentCount.toString());
        setAiReviewsUsedToday(currentCount);
      }
    } catch (err: any) {
      setExplanationError(err.message || "Something went wrong.");
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  const handleTrySimilarQuestions = async () => {
    const isPremium = user?.isPremium || user?.role === "premium" || user?.role === "teacher" || user?.role === "admin";
    if (!isPremium) {
      const todayStr = new Date().toISOString().split("T")[0];
      const savedDate = localStorage.getItem("kibo_ai_review_date");
      let currentCount = parseInt(localStorage.getItem("kibo_ai_review_count") || "0", 10);
      
      if (savedDate !== todayStr) {
        currentCount = 0;
        localStorage.setItem("kibo_ai_review_date", todayStr);
      }
      
      if (currentCount >= 3) {
        setSimilarError("limit_reached");
        setSelectedReviewTab("similar");
        return;
      }
    }

    setIsGeneratingSimilar(true);
    setSimilarError("");
    setSimilarCompleted(false);
    setSimilarAnswers({});
    setSimilarSubmitted({});
    setSimilarFeedback({});
    setSelectedReviewTab("similar");

    let topic = assessmentTitle;
    if (incorrectIds.length > 0) {
      const firstIncorrect = questions.find(q => incorrectIds.includes(q.id));
      if (firstIncorrect && firstIncorrect.referenceLesson) {
        topic = firstIncorrect.referenceLesson.replace(/-/g, " ").toUpperCase();
      }
    }

    try {
      const response = await fetch("/api/gemini/quiz/similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          courseTitle
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate similar questions. Please try again.");
      }

      const data = await response.json();
      setSimilarQuestions(data.questions || []);

      if (!isPremium) {
        const todayStr = new Date().toISOString().split("T")[0];
        const currentCount = parseInt(localStorage.getItem("kibo_ai_review_count") || "0", 10) + 1;
        localStorage.setItem("kibo_ai_review_date", todayStr);
        localStorage.setItem("kibo_ai_review_count", currentCount.toString());
        setAiReviewsUsedToday(currentCount);
      }
    } catch (err: any) {
      setSimilarError(err.message || "Failed to load similar questions.");
    } finally {
      setIsGeneratingSimilar(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isSendingMessage) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatError("");

    const updatedMessages = [...chatMessages, { role: "user" as const, content: userMsg }];
    setChatMessages(updatedMessages);
    setIsSendingMessage(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          currentCourse: { id: courseId, title: courseTitle },
          currentLesson: { id: assessmentId, title: assessmentTitle },
          userProfile: user,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error("Kibo could not respond. Please try again.");
      }

      const data = await response.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (err: any) {
      setChatError(err.message || "Something went wrong.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const loadLearningHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const attempts = await getAssessmentAttempts(user.uid);
      const filteredAttempts = attempts.filter((a: any) => a.assessmentId === assessmentId)
        .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setAttemptsHistory(filteredAttempts);

      const mistakeCounts: { [topic: string]: number } = {};
      attempts.forEach((attempt: any) => {
        if (attempt.incorrectQuestions && Array.isArray(attempt.incorrectQuestions)) {
          attempt.incorrectQuestions.forEach((qId: string) => {
            const question = questions.find(q => q.id === qId);
            const topic = question?.referenceLesson || assessmentTitle;
            const readableTopic = topic.replace(/-/g, " ").toUpperCase();
            mistakeCounts[readableTopic] = (mistakeCounts[readableTopic] || 0) + 1;
          });
        }
      });

      const mistakesList = Object.keys(mistakeCounts).map(topic => ({
        topic,
        count: mistakeCounts[topic]
      })).sort((a, b) => b.count - a.count);

      setCommonMistakes(mistakesList);

      if (filteredAttempts.length > 0) {
        const totalScores = filteredAttempts.reduce((sum: number, a: any) => sum + (a.score / a.totalQuestions) * 100, 0);
        const average = Math.round(totalScores / filteredAttempts.length);
        const latest = Math.round((filteredAttempts[filteredAttempts.length - 1].score / filteredAttempts[filteredAttempts.length - 1].totalQuestions) * 100);
        
        let trend: "up" | "down" | "stable" = "stable";
        if (filteredAttempts.length > 1) {
          const prev = (filteredAttempts[filteredAttempts.length - 2].score / filteredAttempts[filteredAttempts.length - 2].totalQuestions) * 100;
          if (latest > prev) trend = "up";
          else if (latest < prev) trend = "down";
        }

        setImprovementTrend({ average, latest, trend });
      }
    } catch (err) {
      console.error("Failed to load learning history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const currentQuestion = questions[currentIdx];

  // Option select handler for Multiple Answer
  const handleToggleMultipleAnswer = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOptions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Answer validation engine
  const handleAnswerSubmit = () => {
    if (!currentQuestion || isSubmitted) return;

    let ansCorrect = false;
    const type = currentQuestion.type;

    if (type === "mc" || type === "tf") {
      ansCorrect = selectedOption === currentQuestion.correctOptionIndex;
    } else if (type === "ma") {
      const correctIndices = currentQuestion.correctOptionIndices || [];
      const hasAllCorrect = correctIndices.every((idx) => selectedOptions.includes(idx));
      const hasNoExtra = selectedOptions.every((idx) => correctIndices.includes(idx));
      ansCorrect = hasAllCorrect && hasNoExtra;
    } else {
      // String normalization and matching for textbox answers
      const studentNorm = textAnswer.trim().toLowerCase().replace(/\s+/g, "");
      const correctVal = currentQuestion.correctAnswer;

      if (Array.isArray(correctVal)) {
        ansCorrect = correctVal.some((v) => {
          const correctNorm = v.trim().toLowerCase().replace(/\s+/g, "");
          return studentNorm === correctNorm || studentNorm.includes(correctNorm);
        });
      } else if (typeof correctVal === "string") {
        const correctNorm = correctVal.trim().toLowerCase().replace(/\s+/g, "");
        ansCorrect = studentNorm === correctNorm || studentNorm.includes(correctNorm);
      }
    }

    setIsCorrect(ansCorrect);
    setIsSubmitted(true);
    
    // Save student answer to userAnswers tracking
    let answerValue: any = "";
    if (type === "mc" || type === "tf") {
      answerValue = selectedOption;
    } else if (type === "ma") {
      answerValue = selectedOptions;
    } else {
      answerValue = textAnswer;
    }
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answerValue
    }));

    if (ansCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setIncorrectIds((prev) => [...prev, currentQuestion.id]);
    }
  };

  // Next/Finish handler
  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      resetAnswerState();
    } else {
      // Save and compile final results
      finishAssessment();
    }
  };

  const finishAssessment = async () => {
    const finalScorePercent = Math.round((score / questions.length) * 100);
    const passed = finalScorePercent >= passingScorePercent;
    
    // Calculate final rewards with Kibo Smart Hints deduction if configured
    let finalXpReward = 0;
    if (passed) {
      let hintXpDeduction = 0;
      if (adminSettings.xpReductionRule === "small") {
        questions.forEach(q => {
          const levelUsed = hintsUsedPerQuestion[q.id] || 0;
          const questionWeight = xpReward / questions.length;
          // Deduct 10% per hint level used on that question
          hintXpDeduction += questionWeight * (levelUsed * 0.1);
        });
      }
      finalXpReward = Math.max(10, Math.round(xpReward - hintXpDeduction)); // minimum 10 XP if passed
      setXPAwarded(finalXpReward);

      try {
        const attemptRecord: AssessmentAttempt = {
          id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          uid: user.uid,
          userEmail: user.email || "",
          userName: user.name || "Student",
          courseId,
          courseTitle,
          assessmentId,
          assessmentTitle,
          assessmentType,
          score: finalScorePercent,
          passingScore: passingScorePercent,
          passed: true,
          totalQuestions: questions.length,
          timeSpentSeconds: timeSpent,
          timestamp: new Date().toISOString()
        };

        const cascadeResult = await executeQuizCompletionCascade({
          attempt: attemptRecord,
          user,
          courseId
        });
        onUpdateUser(cascadeResult.updatedUser);
      } catch (err) {
        console.warn("Cascade execution fallback:", err);
        // Fallback local update
        const currentXp = user.xp;
        const newXp = currentXp + finalXpReward;
        const newLevelData = getLevelData(newXp);
        const updatedUser: UserProfile = {
          ...user,
          xp: newXp,
          level: newLevelData.level,
          completedLessons: assessmentType === "lesson_quiz" && !user.completedLessons?.includes(assessmentId) ? [...(user.completedLessons || []), assessmentId] : user.completedLessons,
          completedCourses: assessmentType === "final_assessment" && !user.completedCourses?.includes(courseId) ? [...(user.completedCourses || []), courseId] : user.completedCourses,
          coins: (user.coins || 0) + (assessmentType === "final_assessment" ? 50 : 10)
        };
        onUpdateUser(updatedUser);
      }
    } else {
      setXPAwarded(0);
      // Even if not passed, record the attempt
      const attemptId = `attempt_${user.uid}_${assessmentId}_${Date.now()}`;
      const attemptRecord: AssessmentAttempt = {
        id: attemptId,
        uid: user.uid,
        userEmail: user.email,
        userName: user.fullName,
        assessmentId,
        assessmentTitle,
        assessmentType,
        courseId,
        courseTitle,
        score,
        totalQuestions: questions.length,
        passed: false,
        passingScore: passingScorePercent,
        timeSpentSeconds: timeSpent,
        timestamp: new Date().toISOString(),
        incorrectQuestions: incorrectIds
      };
      try {
        await saveAssessmentAttempt(attemptRecord);
      } catch (e) {
        console.warn("Failed to persist attempt online. Logged in local sandbox.", e);
      }
    }

    setStage("summary");
    onComplete(score, questions.length, passed);
  };

  const toggleReview = (qId: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Formatting helper for duration minutes
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Kibo character responses & suggestions generator
  const getKiboMotivationalText = () => {
    const percent = Math.round((score / questions.length) * 100);
    if (percent === 100) {
      return "လုံးဝအပြစ်ပြောစရာမရှိအောင် တော်လွန်းပါတယ်! မေးခွန်းအားလုံးကို အမှားမရှိ ဖြေဆိုနိုင်ခဲ့ပါတယ်။ ဆက်လက်ကြိုးစားပါ ကလေးတို့ရေ!";
    } else if (percent >= passingScorePercent) {
      return `တကယ့်ကို ကောင်းမွန်လွန်းပါတယ်! သတ်မှတ်အောင်မှတ် ကျော်လွန်ပြီး Assessment အောင်မြင်သွားပါပြီ။ XP ${xpReward} ရရှိသွားပါပြီ!`;
    } else {
      return "စိတ်မပျက်ပါနဲ့ကွယ်! စာပြန်ဖတ်ပြီး စနစ်တကျ ပြန်လည်ဖြေဆိုကြည့်ရအောင်။ မင်းမှာ လုပ်နိုင်စွမ်း ရှိပါတယ်။ Kibo အမြဲတမ်း အားပေးနေမယ်နော်!";
    }
  };

  const getKiboReviewRecommendation = () => {
    if (incorrectIds.length === 0) return null;
    
    // Match incorrect question types to guide topic review
    const topicsToReview: string[] = [];
    incorrectIds.forEach((id) => {
      const q = questions.find((item) => item.id === id);
      if (q && q.referenceLesson) {
        const readableTopic = q.referenceLesson.replace(/-/g, " ").toUpperCase();
        if (!topicsToReview.includes(readableTopic)) {
          topicsToReview.push(readableTopic);
        }
      }
    });

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
        <h4 className="font-sans font-medium text-amber-800 text-sm flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4" />
          Kibo ၏ ပြန်လည်လေ့လာရန် အကြံပြုချက် (Review Recommendation)
        </h4>
        <p className="font-sans text-xs text-amber-700 leading-relaxed">
          အမှားများကို သုံးသပ်ကြည့်ရာတွင် သင့်အနေဖြင့် အောက်ပါ ခေါင်းစဉ်များကို ပြန်လည် လေ့လာသင်ယူသင့်ပါသည်-
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {topicsToReview.map((topic, index) => (
            <span 
              key={index} 
              className="bg-amber-100 text-amber-800 text-xs font-mono px-2.5 py-1 rounded-md"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Check if current question is correctly answered to render submit buttons
  const isCurrentAnswered = () => {
    if (currentQuestion?.type === "mc" || currentQuestion?.type === "tf") {
      return selectedOption !== null;
    }
    if (currentQuestion?.type === "ma") {
      return selectedOptions.length > 0;
    }
    return textAnswer.trim().length > 0;
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden relative" id="intelligent-assessment-root">
      
      {/* BRANDING METADATA STRIP */}
      <div className="bg-gray-50 px-6 py-2 border-b border-gray-100 flex justify-between items-center text-xs font-mono text-gray-500">
        <div className="flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-gray-400" />
          <span>COURSE: {courseTitle.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>TYPE: {assessmentType.replace(/_/g, " ").toUpperCase()}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ==========================================
            1. START SCREEN STAGE
           ========================================== */}
        {stage === "start" && (
          <motion.div 
            key="start-stage"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-8 text-center"
            id="stage-start-view"
          >
            {/* Mascot welcoming animation */}
            <div className="flex justify-center mb-6 relative">
              <div className="w-32 h-32 bg-rose-50 rounded-full flex items-center justify-center border-2 border-rose-100">
                <span className="text-6xl animate-bounce" style={{ animationDuration: "3s" }}>🦊</span>
              </div>
              <span className="absolute bottom-2 right-1/3 bg-rose-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full animate-pulse">
                Kibo Active
              </span>
            </div>

            <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              ASSESSMENT IS READY
            </span>

            <h2 className="font-sans font-bold text-gray-900 text-2xl mt-4 mb-2">
              {assessmentTitle}
            </h2>

            <p className="font-sans text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-6">
              သင်ယူလေ့လာထားသော အသိပညာများကို လက်တွေ့ဆန်းစစ်ရန် အသိဉာဏ်တုဆန်းစစ်စနစ် (Intelligent Assessment System) မှ ကြိုဆိုပါ၏။ ၎င်းသည် အလွတ်ကျက်မှတ်ခြင်းထက် နားလည်မှုကို အလေးပေးပါသည်။
            </p>

            {/* Assessment info cards */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="block text-gray-400 text-[10px] font-mono">မေးခွန်းအရေအတွက်</span>
                <span className="block text-gray-900 font-sans font-bold text-lg">{questions.length} ပုဒ်</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="block text-gray-400 text-[10px] font-mono">အောင်မှတ်သတ်မှတ်ချက်</span>
                <span className="block text-gray-900 font-sans font-bold text-lg text-emerald-600">{passingScorePercent}%</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="block text-gray-400 text-[10px] font-mono">ရရှိမည့်အကျိုးကျေးဇူး</span>
                <span className="block text-rose-600 font-sans font-bold text-lg flex items-center justify-center gap-1">
                  +{xpReward} XP
                </span>
              </div>
            </div>

            {/* ⚙️ ADMIN TOGGLE BUTTON */}
            <div className="max-w-md mx-auto mb-6">
              <button
                onClick={() => setShowAdminSettings(prev => !prev)}
                className="w-full py-2 px-4 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 text-rose-700 font-sans text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Settings className={`w-3.5 h-3.5 ${showAdminSettings ? "animate-spin" : ""}`} />
                {showAdminSettings ? "Hide Hints & XP Admin Panel" : "Show Hints & XP Admin Panel ⚙️"}
              </button>
            </div>

            {/* ⚙️ ADMIN CONTROLS PANEL */}
            <AnimatePresence>
              {showAdminSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden max-w-md mx-auto mb-8 text-left"
                >
                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 space-y-3.5 shadow-sm">
                    <div className="flex justify-between items-center border-b border-rose-100/50 pb-2">
                      <span className="font-sans font-bold text-rose-900 text-xs flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-rose-600 animate-spin" style={{ animationDuration: '10s' }} />
                        Kibo Hints & XP Settings
                      </span>
                      <span className="text-[9px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-mono font-bold">ADMIN CONF</span>
                    </div>

                    <div className="space-y-3.5 text-xs font-sans text-gray-700">
                      <div className="space-y-1.5">
                        <label className="block font-semibold text-gray-800">Hint Availability</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newSettings = { ...adminSettings, hintsEnabled: true };
                              setAdminSettings(newSettings);
                              localStorage.setItem("kibo_hints_admin_settings", JSON.stringify(newSettings));
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-medium transition ${
                              adminSettings.hintsEnabled 
                                ? "bg-rose-600 border-rose-600 text-white shadow-sm" 
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            Enabled
                          </button>
                          <button
                            onClick={() => {
                              const newSettings = { ...adminSettings, hintsEnabled: false };
                              setAdminSettings(newSettings);
                              localStorage.setItem("kibo_hints_admin_settings", JSON.stringify(newSettings));
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-medium transition ${
                              !adminSettings.hintsEnabled 
                                ? "bg-rose-600 border-rose-600 text-white shadow-sm" 
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            Disabled
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-semibold text-gray-800">Max Hints Per Question</label>
                        <div className="flex gap-2">
                          {[1, 2, 3].map(num => (
                            <button
                              key={num}
                              onClick={() => {
                                const newSettings = { ...adminSettings, maxHints: num };
                                setAdminSettings(newSettings);
                                localStorage.setItem("kibo_hints_admin_settings", JSON.stringify(newSettings));
                              }}
                              className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium transition ${
                                adminSettings.maxHints === num
                                  ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {num} {num === 1 ? "Hint" : "Hints"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-semibold text-gray-800">XP Rules & Deduction Rate</label>
                        <select
                          value={adminSettings.xpReductionRule}
                          onChange={(e) => {
                            const newSettings = { ...adminSettings, xpReductionRule: e.target.value as any };
                            setAdminSettings(newSettings);
                            localStorage.setItem("kibo_hints_admin_settings", JSON.stringify(newSettings));
                          }}
                          className="w-full p-2 border border-gray-200 rounded-lg bg-white outline-none focus:border-rose-500 text-xs text-gray-800 font-sans"
                        >
                          <option value="none">No XP Reduction (Free hints! 🎉)</option>
                          <option value="small">Small XP Reduction (10% per hint level used 📉)</option>
                          <option value="no_effect">No Effect on Completion (Perfect for learning! 🛡️)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-semibold text-gray-800">Difficulty Levels</label>
                        <select
                          value={adminSettings.difficulty}
                          onChange={(e) => {
                            const newSettings = { ...adminSettings, difficulty: e.target.value as any };
                            setAdminSettings(newSettings);
                            localStorage.setItem("kibo_hints_admin_settings", JSON.stringify(newSettings));
                          }}
                          className="w-full p-2 border border-gray-200 rounded-lg bg-white outline-none focus:border-rose-500 text-xs text-gray-800 font-sans"
                        >
                          <option value="beginner">Beginner (More verbal clues & helpful guides)</option>
                          <option value="intermediate">Intermediate (Balanced clues with conceptual points)</option>
                          <option value="advanced">Advanced (Highly subtle hints requiring deep thinking)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 justify-center">
              {onCancel && (
                <button
                  id="btn-assessment-cancel"
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-sans text-sm hover:bg-gray-50 transition"
                >
                  သင်ရိုးသို့ ပြန်သွားရန်
                </button>
              )}
              <button
                id="btn-assessment-start"
                onClick={startAssessment}
                className="px-8 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-sans text-sm font-medium transition shadow-lg shadow-rose-600/25 flex items-center gap-2"
              >
                ဆန်းစစ်ခြင်းစတင်မည်
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            2. ACTIVE TESTING STAGE
           ========================================== */}
        {stage === "active" && currentQuestion && (
          <motion.div 
            key="active-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 md:p-8"
            id="stage-active-view"
          >
            {/* Header progress bar & timer */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans font-semibold text-gray-900 text-sm bg-rose-50 text-rose-700 px-3 py-1 rounded-md">
                မေးခွန်း {currentIdx + 1} / {questions.length}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs text-gray-500">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>ကြာချိန်: {formatTime(timeSpent)}</span>
              </div>
            </div>

            {/* Micro-animated Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
              <motion.div 
                className="h-full bg-rose-600"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Question Text block */}
            <div className="mb-6">
              <span className="font-mono text-[10px] uppercase text-rose-500 font-bold block mb-1">
                QUESTION TYPE: {currentQuestion.type.toUpperCase()}
              </span>
              <h3 className="font-sans font-medium text-gray-900 text-lg leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Syntax Highlighted Code Snippet Placeholder */}
            {currentQuestion.codeSnippet && (
              <div className="mb-6 rounded-xl overflow-hidden border border-gray-800 bg-[#1E1E1E] p-4 font-mono text-sm text-gray-200 relative shadow-inner">
                <div className="absolute top-2 right-2 bg-gray-800 text-[9px] uppercase px-2 py-0.5 rounded text-gray-400">
                  Code Sandbox
                </div>
                <pre className="overflow-x-auto leading-relaxed">
                  <code>{currentQuestion.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* QUESTION INPUT GENERATOR */}
            <div className="mb-8" id="question-inputs-box">
              
              {/* Type: MC (Multiple Choice) & TF (True/False) */}
              {(currentQuestion.type === "mc" || currentQuestion.type === "tf") && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, idx) => (
                    <button
                      key={idx}
                      id={`opt-idx-${idx}`}
                      disabled={isSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border font-sans text-sm transition flex items-center justify-between ${
                        selectedOption === idx 
                          ? "border-rose-500 bg-rose-50/50 text-rose-900 font-medium" 
                          : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                      } ${isSubmitted ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span>{option}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        selectedOption === idx ? "border-rose-600 bg-rose-600 text-white" : "border-gray-300"
                      }`}>
                        {selectedOption === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Type: MA (Multiple Answer) */}
              {currentQuestion.type === "ma" && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, idx) => {
                    const isChecked = selectedOptions.includes(idx);
                    return (
                      <button
                        key={idx}
                        id={`opt-ma-${idx}`}
                        disabled={isSubmitted}
                        onClick={() => handleToggleMultipleAnswer(idx)}
                        className={`w-full text-left p-4 rounded-xl border font-sans text-sm transition flex items-center justify-between ${
                          isChecked 
                            ? "border-rose-500 bg-rose-50/50 text-rose-900 font-medium" 
                            : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                        } ${isSubmitted ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span>{option}</span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          isChecked ? "border-rose-600 bg-rose-600 text-white" : "border-gray-300"
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type: FITB (Fill in the Blank), Prediction, Find Error */}
              {(currentQuestion.type === "fitb" || currentQuestion.type === "prediction" || currentQuestion.type === "find_error") && (
                <div className="space-y-2">
                  <label className="block font-mono text-[10px] text-gray-400 uppercase">
                    သင့်အဖြေအား အောက်ပါကွက်လပ်တွင် ရေးသားပါ
                  </label>
                  <input
                    type="text"
                    id="input-text-answer"
                    disabled={isSubmitted}
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="ဤနေရာတွင် ရိုက်ထည့်ပါ..."
                    className="w-full p-4 rounded-xl border border-gray-200 font-sans text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}

              {/* Type: Short Coding Exercise */}
              {currentQuestion.type === "coding" && (
                <div className="space-y-2">
                  <label className="block font-mono text-[10px] text-gray-400 uppercase">
                    Python Code Editor (လိုင်းအချက်အလက်ကို သတိပြုပါ)
                  </label>
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex">
                    <div className="bg-gray-100 p-4 text-gray-400 font-mono text-xs select-none text-right flex flex-col border-r border-gray-200">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                    </div>
                    <textarea
                      id="textarea-code-answer"
                      rows={3}
                      disabled={isSubmitted}
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="# သင့်ကုဒ်တစ်ကြောင်းကို ဤနေရာတွင် ရေးပါ..."
                      className="w-full p-4 bg-white font-mono text-sm text-gray-800 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* 🦊 KIBO SMART HINT CONSOLE */}
            {adminSettings.hintsEnabled && !isSubmitted && (
              <div className="mb-6 bg-amber-50/40 border border-amber-100/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-bl-xl font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
                  KIBO SMART HINT
                </div>

                <div className="flex gap-4">
                  {/* Mascot Avatar and Hint Counter */}
                  <div className="hidden sm:flex flex-col items-center justify-start pt-1">
                    <div className="w-12 h-12 bg-amber-100/50 rounded-full flex items-center justify-center border border-amber-200">
                      <span className="text-2xl animate-bounce" style={{ animationDuration: "4s" }}>🦊</span>
                    </div>
                    {currentHintLevel > 0 && (
                      <div className="mt-2 text-[10px] font-mono text-amber-600 bg-amber-100/50 px-1.5 py-0.5 rounded font-bold">
                        HINT {currentHintLevel}/{adminSettings.maxHints}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-sans font-bold text-amber-950 text-sm">
                        မေးခွန်းအတွက် အရိပ်အမြွက် (Kibo AI Hint)
                      </h4>
                      {adminSettings.xpReductionRule === "small" && (
                        <span className="text-[10px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-600" />
                          -10% XP penalty per hint
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs text-amber-800 leading-relaxed mb-4">
                      {currentHintLevel === 0 
                        ? "မေးခွန်းကို ဖြေဆိုရခက်ခဲနေပါက Kibo ထံမှ အဆင့်ဆင့် အကူအညီရယူနိုင်ပါသည်။ အဖြေတိုက်ရိုက်ပေးမည်မဟုတ်ဘဲ ကိုယ်တိုင်တွေးတောနိုင်စေရန် လမ်းပြပေးပါမည်။"
                        : "Kibo 🦊 ပေးထားတဲ့ အရိပ်အမြွက်များကို သေချာဆန်းစစ်ပြီး အဖြေမှန်ကို ရှာဖွေကြည့်ပါကွယ်-"
                      }
                    </p>

                    {/* Progress Indicator Dots */}
                    <div className="flex items-center gap-1.5 mb-4">
                      {Array.from({ length: adminSettings.maxHints }).map((_, i) => {
                        const level = i + 1;
                        const isActive = currentHintLevel >= level;
                        return (
                          <div
                            key={level}
                            className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                              isActive ? "bg-amber-500" : "bg-amber-100"
                            }`}
                            title={`Hint Level ${level}`}
                          />
                        );
                      })}
                    </div>

                    {/* Active Hint Content (Markdown style) */}
                    {currentHintLevel > 0 && (
                      <div className="space-y-3 mb-4">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentHintLevel}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="bg-white/80 border border-amber-100 rounded-xl p-4 text-xs font-sans text-gray-800 leading-relaxed shadow-sm space-y-2"
                          >
                            {/* Level Heading */}
                            <div className="flex items-center gap-1.5 text-amber-700 font-bold font-sans">
                              <Lightbulb className="w-4 h-4 text-amber-500" />
                              <span>
                                {currentHintLevel === 1 && "💡 Level 1: Concept Clue (ခေါင်းစဉ်လမ်းစ)"}
                                {currentHintLevel === 2 && "🔍 Level 2: Guided Thinking (တွေးတောပုံအဆင့်ဆင့်)"}
                                {currentHintLevel === 3 && "🎯 Level 3: Proximity Hint (နီးစပ်သောအရိပ်အမြွက်)"}
                              </span>
                            </div>
                            
                            {/* Hint text loading state */}
                            {isGeneratingHint && !hintsData[currentQuestion.id] ? (
                              <div className="py-2 flex items-center gap-2 text-amber-600 font-medium">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Kibo hints ကို စဉ်းစားနေပါသည်...</span>
                              </div>
                            ) : (
                              <div>
                                {currentHintLevel === 1 && hintsData[currentQuestion.id]?.level1}
                                {currentHintLevel === 2 && hintsData[currentQuestion.id]?.level2}
                                {currentHintLevel === 3 && hintsData[currentQuestion.id]?.level3}
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>

                        {/* Additional Study Aids Accordion Tabs (Only visible when hints exist) */}
                        {hintsData[currentQuestion.id] && !isGeneratingHint && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-100/50">
                            <button
                              onClick={() => handleRequestExplanation("explanation")}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-sans font-medium border text-center transition flex items-center justify-center gap-1 ${
                                activeExplanationType === "explanation"
                                  ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                                  : "border-amber-200 bg-amber-50/30 hover:bg-amber-100/50 text-amber-800"
                              }`}
                            >
                              🇲🇲 မြန်မာဘာသာရှင်းလင်းချက်
                            </button>
                            <button
                              onClick={() => handleRequestExplanation("example")}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-sans font-medium border text-center transition flex items-center justify-center gap-1 ${
                                activeExplanationType === "example"
                                  ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                                  : "border-amber-200 bg-amber-50/30 hover:bg-amber-100/50 text-amber-800"
                              }`}
                            >
                              💻 ကုဒ်နမူနာ (Example)
                            </button>
                            <button
                              onClick={() => handleRequestExplanation("analogy")}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-sans font-medium border text-center transition flex items-center justify-center gap-1 ${
                                activeExplanationType === "analogy"
                                  ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                                  : "border-amber-200 bg-amber-50/30 hover:bg-amber-100/50 text-amber-800"
                              }`}
                            >
                              💡 ဥပမာနှိုင်းယှဉ်ချက် (Analogy)
                            </button>
                            <button
                              onClick={() => handleRequestExplanation("practice")}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-sans font-medium border text-center transition flex items-center justify-center gap-1 ${
                                activeExplanationType === "practice"
                                  ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                                  : "border-amber-200 bg-amber-50/30 hover:bg-amber-100/50 text-amber-800"
                              }`}
                            >
                              🎯 လေ့ကျင့်ရန် (Practice)
                            </button>
                          </div>
                        )}

                        {/* Render Active Study Aid Content */}
                        {activeExplanationType && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-50/50 border border-amber-100/70 rounded-xl p-4 mt-2"
                          >
                            {isGeneratingHintExplanation ? (
                              <div className="flex items-center gap-2 text-xs font-sans text-amber-700 font-medium py-1">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                <span>အသေးစိတ် အချက်အလက်များ ဖော်ထုတ်နေပါသည်...</span>
                              </div>
                            ) : (
                              <div className="text-xs font-sans text-gray-800 leading-relaxed markdown-body">
                                <MarkdownRenderer content={explanationContent[currentQuestion.id]?.[activeExplanationType] || "လောလောဆယ် ဖော်ပြရန်မရှိသေးပါ။"} />
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Hint control button */}
                    <div className="flex items-center gap-3">
                      {currentHintLevel < adminSettings.maxHints ? (
                        <button
                          onClick={handleRequestHint}
                          disabled={isGeneratingHint}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-sans text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          {currentHintLevel === 0 
                            ? "🦊 Kibo ထံမှ အရိပ်အမြွက်တောင်းမည်" 
                            : `နောက်ထပ် အရိပ်အမြွက်တောင်းမည် (Hint Level ${currentHintLevel + 1}/${adminSettings.maxHints})`
                          }
                        </button>
                      ) : (
                        <span className="text-xs text-amber-800 font-semibold font-sans flex items-center gap-1 bg-amber-100/60 py-1.5 px-3 rounded-lg border border-amber-200">
                          <Check className="w-3.5 h-3.5 text-amber-600" />
                          မေးခွန်းအတွက် အရိပ်အမြွက်အားလုံး ရယူပြီးပါပြီ။
                        </span>
                      )}

                      {/* Daily Hint Usage Metric / Premium Banner */}
                      <div className="text-[10px] font-sans text-amber-700 font-medium">
                        {isPremium ? (
                          <span className="flex items-center gap-1 bg-amber-100/50 px-2 py-1 rounded">
                            <Crown className="w-3 h-3 text-amber-600" />
                            Premium Unlimited Hints
                          </span>
                        ) : (
                          <span>ယနေ့အသုံးပြုမှု: <strong className="font-bold">{hintsUsedToday}/5</strong> ကြိမ်</span>
                        )}
                      </div>
                    </div>

                    {/* Kibo Companion Tip Panel (Only after first hint) */}
                    {currentHintLevel > 0 && hintsData[currentQuestion.id] && !isGeneratingHint && (
                      <div className="mt-4 pt-3 border-t border-amber-100/50 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-sans text-amber-900/90">
                        {hintsData[currentQuestion.id].conceptReminder && (
                          <div className="bg-white/50 p-2.5 rounded-lg border border-amber-100">
                            <span className="font-bold text-amber-800 block mb-1">💡 Concept Lesson Reminder</span>
                            <p className="line-clamp-3 leading-relaxed">{hintsData[currentQuestion.id].conceptReminder}</p>
                          </div>
                        )}
                        {hintsData[currentQuestion.id].programmingTip && (
                          <div className="bg-white/50 p-2.5 rounded-lg border border-amber-100">
                            <span className="font-bold text-amber-800 block mb-1">💻 Developer Programming Tip</span>
                            <p className="line-clamp-3 leading-relaxed">{hintsData[currentQuestion.id].programmingTip}</p>
                          </div>
                        )}
                        {hintsData[currentQuestion.id].commonMistake && (
                          <div className="bg-white/50 p-2.5 rounded-lg border border-amber-100">
                            <span className="font-bold text-amber-800 block mb-1">⚠️ Common Mistake Caution</span>
                            <p className="line-clamp-3 leading-relaxed">{hintsData[currentQuestion.id].commonMistake}</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* ACTION FOOTER */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="font-sans text-xs text-gray-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                သေချာစွာ စဉ်းစားပြီးမှ အဖြေကို တင်သွင်းပါ။
              </span>

              {!isSubmitted ? (
                <button
                  id="btn-submit-answer"
                  onClick={handleAnswerSubmit}
                  disabled={!isCurrentAnswered()}
                  className={`px-6 py-2.5 rounded-xl font-sans text-sm font-medium transition ${
                    isCurrentAnswered()
                      ? "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/10"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  အဖြေတင်မည်
                </button>
              ) : (
                <button
                  id="btn-next-question"
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 font-sans text-sm font-medium flex items-center gap-1.5 transition"
                >
                  {currentIdx + 1 === questions.length ? "ဆန်းစစ်ချက်အကျဉ်းချုပ်ကြည့်မည်" : "နောက်တစ်ပုဒ်သို့"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* FEEDBACK POPUP SECTION */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-6 p-5 rounded-xl border ${
                    isCorrect 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                  id="answer-feedback-panel"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="font-sans font-bold text-sm">
                          {isCorrect ? "တကယ့်ကို ကောင်းမွန်ပါတယ်! အဖြေမှန်ပါသည်။" : "အဖြေလွဲမှားနေပါသည်။"}
                        </h4>
                        
                        {/* Kibo speech bubble bubble */}
                        <p className="font-sans italic text-xs mt-1 text-gray-600 flex items-center gap-1.5">
                          <span>🦊 Kibo:</span>
                          <span>
                            {isCorrect 
                              ? '"အသိပညာက သင့်ကို တောက်ပစေပါတယ်။ ဆက်လုပ်ပါ!"' 
                              : '"စိတ်မပျက်ပါနဲ့၊ အမှားကနေ သင်ယူခြင်းက ပရိုဂရမ်မာကောင်းတွေရဲ့ စရိုက်ပဲ!"'}
                          </span>
                        </p>
                      </div>

                      {/* Myanmar Explanation standard block */}
                      <div className="bg-white/70 p-3.5 rounded-lg border border-white/20 text-xs font-sans text-gray-700 leading-relaxed">
                        <span className="font-bold text-gray-900 block mb-1">မြန်မာဘာသာဖြင့် ရှင်းလင်းချက် (Myanmar Explanation):</span>
                        {currentQuestion.explanation}
                      </div>

                      {/* Tips blocks */}
                      {currentQuestion.tips && currentQuestion.tips.length > 0 && (
                        <div className="text-[11px] space-y-1">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 font-bold block">
                            PRO-TIPS & CODING HINTS:
                          </span>
                          {currentQuestion.tips.map((tip, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-gray-600 font-sans">
                              <span className="text-rose-500">•</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* ==========================================
            3. SUMMARY / ANALYTICS STAGE
           ========================================== */}
        {stage === "summary" && (
          <motion.div
            key="summary-stage"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 md:p-8"
            id="stage-summary-view"
          >
            {/* Header congratulatory badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mb-3 animate-spin" style={{ animationDuration: "12s" }}>
                {score / questions.length >= passingScorePercent / 100 ? (
                  <Trophy className="w-8 h-8" />
                ) : (
                  <Award className="w-8 h-8" />
                )}
              </div>
              <h2 className="font-sans font-bold text-gray-900 text-xl">
                {score / questions.length * 100 >= passingScorePercent ? "ဆန်းစစ်ချက် အောင်မြင်ပါသည်!" : "ပြန်လည်ကြိုးစားရန် လိုအပ်ပါသည်"}
              </h2>
              <span className="font-mono text-xs text-gray-400">
                COMPLETED AT: {new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Score circle metrics */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
              
              <div className="flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-6">
                <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                  အောင်မှတ်ရလဒ် (My Score)
                </span>
                
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32">
                    <circle 
                      cx="64" cy="64" r="54" 
                      className="stroke-gray-200 fill-none" 
                      strokeWidth="8"
                    />
                    <motion.circle 
                      cx="64" cy="64" r="54" 
                      className="stroke-rose-600 fill-none" 
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 54}
                      initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 54) * (1 - score / questions.length) }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="block font-sans font-extrabold text-2xl text-gray-900">
                      {Math.round((score / questions.length) * 100)}%
                    </span>
                    <span className="block font-mono text-[9px] text-gray-400 uppercase">
                      {score} / {questions.length} မှန်ကန်သည်
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="block text-gray-400 text-[10px] font-mono">အောင်မှတ်လိုအပ်ချက်</span>
                    <span className="block text-gray-900 font-sans font-bold text-sm">{passingScorePercent}%</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="block text-gray-400 text-[10px] font-mono">ကြာမြင့်ချိန်</span>
                    <span className="block text-gray-900 font-sans font-bold text-sm">{formatTime(timeSpent)}</span>
                  </div>
                </div>

                {score / questions.length * 100 >= passingScorePercent ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        +{xpAwarded}
                      </div>
                      <div>
                        <span className="block font-sans text-xs font-bold text-emerald-800">EXP POINTS ACQUIRED!</span>
                        <span className="block font-sans text-[10px] text-emerald-600">သင့်၏ level မြှင့်တင်ရန် XP များ ပေါင်းထည့်ပြီးပါပြီ။</span>
                      </div>
                    </div>
                    {(Object.values(hintsUsedPerQuestion) as number[]).reduce((acc: number, val: number) => acc + val, 0) > 0 && (
                      <div className="mt-1 pt-1.5 border-t border-emerald-200/50 flex flex-wrap gap-2 text-[10px] font-sans text-emerald-800">
                        <span className="bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                          💡 Hints Used: {(Object.values(hintsUsedPerQuestion) as number[]).reduce((acc: number, val: number) => acc + val, 0)} levels
                        </span>
                        {adminSettings.xpReductionRule === "small" && (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                            📉 Hint Discount: -{xpReward - xpAwarded} XP
                          </span>
                        )}
                        {adminSettings.xpReductionRule === "none" && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                            🎉 Free Hints Mode: No XP Deduction
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                      0
                    </div>
                    <div>
                      <span className="block font-sans text-xs font-bold text-rose-800">NO XP GRANTED</span>
                      <span className="block font-sans text-[10px] text-rose-600">အောင်မှတ်မကျော်သောကြောင့် XP မရရှိပါ။</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kibo motivational response bubble */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
              <span className="text-4xl">🦊</span>
              <div className="flex-1">
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-rose-600 block mb-0.5">
                  KIBO ASSISTANCE ADVICE:
                </span>
                <p className="font-sans text-sm text-gray-700 leading-relaxed">
                  {getKiboMotivationalText()}
                </p>
                {getKiboReviewRecommendation()}
              </div>
            </div>

            {/* ==========================================
                KIBO QUIZ REVIEW PANEL (🦊 AI-Powered)
               ========================================== */}
            <div className="bg-white border border-rose-100 rounded-2xl shadow-md p-6 mb-8" id="kibo-quiz-review-panel">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                    <Sparkles className="w-5 h-5 text-rose-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-gray-900 text-base">Kibo AI Quiz Review 🦊✨</h3>
                    <p className="font-sans text-[11px] text-gray-500">AI စနစ်သုံး ဆန်းစစ်ချက် သုံးသပ်ခြင်းနှင့် လေ့လာမှုမှတ်တမ်း</p>
                  </div>
                </div>
                {/* AI Limits tracker badge */}
                <div className="text-right">
                  <span className={`inline-block font-sans text-[10px] font-medium px-2.5 py-1 rounded-full ${
                    user?.isPremium ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                  }`}>
                    {user?.isPremium ? "👑 Premium Unlimited Access" : `⚡ Daily AI Reviews Left: ${Math.max(0, 3 - aiReviewsUsedToday)} / 3`}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-6 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                <button
                  onClick={() => setSelectedReviewTab(selectedReviewTab === "answers" ? "none" : "answers")}
                  className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-sans text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    selectedReviewTab === "answers"
                      ? "bg-white text-rose-700 shadow-sm border border-rose-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  📝 Review Answers
                </button>
                <button
                  onClick={() => {
                    if (selectedReviewTab === "mistakes") {
                      setSelectedReviewTab("none");
                    } else if (mistakesExplanation) {
                      setSelectedReviewTab("mistakes");
                    } else {
                      handleExplainMistakes();
                    }
                  }}
                  disabled={incorrectIds.length === 0}
                  className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-sans text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    incorrectIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    selectedReviewTab === "mistakes"
                      ? "bg-white text-rose-700 shadow-sm border border-rose-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  ❌ Explain Mistakes
                </button>
                <button
                  onClick={() => setSelectedReviewTab(selectedReviewTab === "ask" ? "none" : "ask")}
                  className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-sans text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    selectedReviewTab === "ask"
                      ? "bg-white text-rose-700 shadow-sm border border-rose-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  💬 Ask Kibo
                </button>
                <button
                  onClick={() => {
                    if (selectedReviewTab === "similar") {
                      setSelectedReviewTab("none");
                    } else if (similarQuestions.length > 0) {
                      setSelectedReviewTab("similar");
                    } else {
                      handleTrySimilarQuestions();
                    }
                  }}
                  className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-sans text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    selectedReviewTab === "similar"
                      ? "bg-white text-rose-700 shadow-sm border border-rose-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  🔄 Try Similar Qs
                </button>
                <button
                  onClick={() => {
                    if (selectedReviewTab === "history") {
                      setSelectedReviewTab("none");
                    } else {
                      setSelectedReviewTab("history");
                      loadLearningHistory();
                    }
                  }}
                  className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-sans text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    selectedReviewTab === "history"
                      ? "bg-white text-rose-700 shadow-sm border border-rose-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  📈 Learning History
                </button>
              </div>

              {/* Tab Contents */}
              <AnimatePresence mode="wait">
                {/* 0. DEFAULT COLLAPSED STATE: Personalized Recommendations Card */}
                {selectedReviewTab === "none" && (
                  <motion.div
                    key="tab-none"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="bg-rose-50/30 border border-rose-100 rounded-xl p-5 text-left">
                      <div className="flex items-center gap-2 text-rose-800 font-sans font-bold text-sm mb-3">
                        <Sparkles className="w-4 h-4 text-rose-600" />
                        နောင်ဆက်လက်လေ့လာရန် လမ်းညွှန်ချက်များ (Personalized Recommendations)
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <h4 className="font-sans font-bold text-xs text-gray-800 mb-1">📖 သင်ခန်းစာ ပြန်လည်သုံးသပ်ရန်</h4>
                          <p className="font-sans text-xs text-gray-500 leading-relaxed">
                            {incorrectIds.length > 0 
                              ? `သင်ခန်းစာရှိ "${questions.find(q => incorrectIds.includes(q.id))?.referenceLesson || "တူညီသော အပိုင်း"}" အား တစ်ကြိမ်ပြန်လည်ဖတ်ရှုပြီး programming concept များကို သေချာဆန်းစစ်ပါ။`
                              : "သင်ခန်းစာအားလုံးကို အပြည့်အဝနားလည်သဘောပေါက်ပြီးဖြစ်သည်။ နောက်သင်ခန်းစာအသစ်များသို့ ဆက်လက်တက်လှမ်းနိုင်ပါပြီ။"}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <h4 className="font-sans font-bold text-xs text-gray-800 mb-1">💻 လက်တွေ့လေ့ကျင့်ခန်းများ</h4>
                          <p className="font-sans text-xs text-gray-500 leading-relaxed">
                            {incorrectIds.length > 0
                              ? "အမှားများကို ပြန်လည်မပြင်ဆင်မီ 'Explain Mistakes' ခလုတ်ကို နှိပ်၍ Kibo ၏ အသေးစိတ်ကုဒ် ရှင်းလင်းချက်ကို ဖတ်ပါ။"
                              : "ဂုဏ်ယူပါတယ်! သင်သည် level အဆင့်မြင့်မေးခွန်းများကို ဖြေဆိုရန် 'Try Similar Questions' ဖြင့် စိန်ခေါ်မှုအသစ်များကို လေ့ကျင့်နိုင်ပါပြီ။"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 1. REVIEW MY ANSWERS TAB */}
                {selectedReviewTab === "answers" && (
                  <motion.div
                    key="tab-answers"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 text-left"
                  >
                    <h4 className="font-sans font-bold text-gray-900 text-sm mb-2">အဖြေများအားလုံး ပြန်လည်စစ်ဆေးခြင်း</h4>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {questions.map((qItem, idx) => {
                        const isCorrectAnswer = !incorrectIds.includes(qItem.id);
                        const userAns = userAnswers[qItem.id];

                        return (
                          <div key={qItem.id} className={`p-4 rounded-xl border ${
                            isCorrectAnswer ? "bg-emerald-50/30 border-emerald-100" : "bg-rose-50/30 border-rose-100"
                          }`}>
                            <div className="flex items-start gap-2.5">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono mt-0.5 ${
                                isCorrectAnswer ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                              }`}>
                                {idx + 1}
                              </span>
                              <div className="flex-1 space-y-2">
                                <p className="font-sans font-medium text-xs text-gray-800 leading-relaxed">{qItem.question}</p>
                                
                                {qItem.codeSnippet && (
                                  <pre className="p-2.5 bg-gray-900 rounded-lg text-gray-200 font-mono text-xs overflow-x-auto">
                                    <code>{qItem.codeSnippet}</code>
                                  </pre>
                                )}

                                {/* Choice details */}
                                {qItem.options ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                    {qItem.options.map((opt, oIdx) => {
                                      const isUserSelected = userAns === oIdx;
                                      const isCorrectIdx = qItem.correctOptionIndex === oIdx;
                                      
                                      let optStyle = "border-gray-100 text-gray-600 bg-white";
                                      if (isCorrectIdx) {
                                        optStyle = "border-emerald-200 text-emerald-800 bg-emerald-100/50 font-medium";
                                      } else if (isUserSelected && !isCorrectAnswer) {
                                        optStyle = "border-rose-200 text-rose-800 bg-rose-100/50 font-medium";
                                      }

                                      return (
                                        <div key={oIdx} className={`p-2.5 rounded-lg border text-[11px] font-sans flex items-center justify-between ${optStyle}`}>
                                          <span>{opt}</span>
                                          {isCorrectIdx && <span className="text-emerald-600 font-bold text-[9px] uppercase font-mono">Correct</span>}
                                          {isUserSelected && !isCorrectAnswer && <span className="text-rose-600 font-bold text-[9px] uppercase font-mono">My Answer</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="space-y-1 bg-white/70 p-3 rounded-lg border border-gray-100 mt-2 text-xs">
                                    <div className="text-gray-500 font-sans">သင့်အဖြေ: <span className={isCorrectAnswer ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>{userAns || "မဖြေဆိုခဲ့ပါ"}</span></div>
                                    <div className="text-gray-500 font-sans">အဖြေမှန်: <span className="text-emerald-700 font-bold">{qItem.correctAnswer || "N/A"}</span></div>
                                  </div>
                                )}

                                <p className="font-sans text-[11px] text-gray-500 leading-relaxed bg-white/60 p-2.5 rounded-lg border border-gray-50 mt-2">
                                  💡 <strong>Kibo:</strong> {qItem.explanation}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 2. EXPLAIN MY MISTAKES TAB */}
                {selectedReviewTab === "mistakes" && (
                  <motion.div
                    key="tab-mistakes"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-left"
                  >
                    {isGeneratingExplanation ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
                        <p className="font-sans text-xs text-rose-700">Kibo က သင့်အမှားများကို စနစ်တကျ ပြန်လည်သုံးသပ်ပေးနေပါသည်...</p>
                      </div>
                    ) : explanationError === "limit_reached" ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-4">
                        <span className="text-3xl">👑</span>
                        <h4 className="font-sans font-bold text-amber-900 text-sm">ယနေ့အတွက် AI Reviews အသုံးပြုမှု ကန့်သတ်ချက် ပြည့်သွားပါပြီ</h4>
                        <p className="font-sans text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
                          သင့်အနေဖြင့် ယနေ့အတွက် အခမဲ့ AI Quiz Review (၃) ကြိမ်လုံးကို ပြည့်ဝစွာ အသုံးပြုပြီးပါပြီ။ အကန့်အသတ်မရှိ ဆက်လက်သုံးသပ်လိုပါက Kibo Premium သို့ ဆင့်မြှင့်လိုက်ပါ။
                        </p>
                        <button
                          onClick={() => alert("Kibo Premium သို့ ဆင့်မြှင့်ရန် Profile စာမျက်နှာရှိ Coin Bonus စနစ်များဖြင့် ဆင့်မြှင့်နိုင်ပါသည်ခင်ဗျာ!")}
                          className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs font-semibold transition shadow-md"
                        >
                          Unlock Premium Now
                        </button>
                      </div>
                    ) : explanationError ? (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-2.5 text-rose-800 text-xs font-sans">
                        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        <span>အမှားရှင်းလင်းချက်များကို ထုတ်ပေးရန် အခက်အခဲရှိနေပါသည်။ နောက်တစ်ကြိမ် ပြန်လည်ကြိုးစားကြည့်ပေးပါ။</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-xl text-xs font-sans text-rose-900">
                          <span>💡 ဤအသေးစိတ်သုံးသပ်ချက်ကို Kibo AI မှ ချက်ချင်းဖန်တီးပေးထားခြင်းဖြစ်ပါသည်။</span>
                          <button
                            onClick={handleExplainMistakes}
                            className="text-rose-700 hover:text-rose-900 underline flex items-center gap-1 font-semibold"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Regenerate
                          </button>
                        </div>
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 text-slate-100 font-sans max-h-[450px] overflow-y-auto">
                          <MarkdownRenderer content={mistakesExplanation} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 3. ASK KIBO CHAT TAB */}
                {selectedReviewTab === "ask" && (
                  <motion.div
                    key="tab-ask"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 text-left"
                  >
                    <div className="border border-gray-100 rounded-xl bg-gray-50 flex flex-col h-[350px]">
                      {/* Message Log */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 flex flex-col">
                        {chatMessages.map((msg, mIdx) => (
                          <div
                            key={mIdx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-sans shadow-sm leading-relaxed ${
                              msg.role === "user"
                                ? "bg-rose-600 text-white rounded-br-none"
                                : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                            }`}>
                              {msg.role === "assistant" ? (
                                <div className="space-y-1">
                                  <span className="block text-[9px] uppercase font-bold text-rose-500 tracking-wider">Kibo Mentor 🦊</span>
                                  <MarkdownRenderer content={msg.content} />
                                </div>
                              ) : (
                                msg.content
                              )}
                            </div>
                          </div>
                        ))}
                        {isSendingMessage && (
                          <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 text-xs font-sans shadow-sm flex items-center gap-1.5 text-gray-500">
                              <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                              <span className="font-sans text-[10px]">Kibo စဉ်းစားနေပါသည်...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input */}
                      <div className="p-3 border-t border-gray-100 bg-white flex gap-2 rounded-b-xl">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendChatMessage();
                          }}
                          placeholder="ဒီမေးခွန်းနဲ့ပတ်သက်ပြီး ကွက်လပ်မရှင်းတာရှိရင် ရေးပြီး မေးကြည့်ပါ..."
                          className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl font-sans text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                        />
                        <button
                          onClick={handleSendChatMessage}
                          disabled={!chatInput.trim() || isSendingMessage}
                          className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition ${
                            chatInput.trim() && !isSendingMessage
                              ? "bg-rose-600 text-white hover:bg-rose-700"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          မေးမည်
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. TRY SIMILAR QUESTIONS TAB */}
                {selectedReviewTab === "similar" && (
                  <motion.div
                    key="tab-similar"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-left space-y-4"
                  >
                    {isGeneratingSimilar ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
                        <p className="font-sans text-xs text-rose-700">Kibo က သင့်လေ့ကျင့်ရန် တူညီသောမေးခွန်းအသစ်များကို ဖန်တီးနေပါသည်...</p>
                      </div>
                    ) : similarError === "limit_reached" ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-4">
                        <span className="text-3xl">👑</span>
                        <h4 className="font-sans font-bold text-amber-900 text-sm">ယနေ့အတွက် AI Reviews အသုံးပြုမှု ကန့်သတ်ချက် ပြည့်သွားပါပြီ</h4>
                        <p className="font-sans text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
                          သင့်အနေဖြင့် ယနေ့အတွက် အခမဲ့ AI Quiz Review (၃) ကြိမ်လုံးကို ပြည့်ဝစွာ အသုံးပြုပြီးပါပြီ။ ဆက်လက်လေ့ကျင့်လိုပါက Kibo Premium သို့ ဆင့်မြှင့်လိုက်ပါ။
                        </p>
                        <button
                          onClick={() => alert("Kibo Premium သို့ ဆင့်မြှင့်ရန် Profile စာမျက်နှာရှိ Coin Bonus စနစ်များဖြင့် ဆင့်မြှင့်နိုင်ပါသည်ခင်ဗျာ!")}
                          className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs font-semibold transition shadow-md"
                        >
                          Unlock Premium Now
                        </button>
                      </div>
                    ) : similarError ? (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-2.5 text-rose-800 text-xs font-sans">
                        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        <span>မေးခွန်းအသစ်များ ထုတ်ယူရန် အဆင်မပြေဖြစ်နေပါသည်။ ပြန်လည်ကြိုးစားကြည့်ပေးပါ။</span>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl text-xs font-sans text-rose-900 flex justify-between items-center">
                          <span>🔄 Kibo က သင့်အတွက် သက်ဆိုင်ရာ Programming Topic ဖြင့် လေ့ကျင့်ခန်းအသစ် ၃ ပုဒ်ကို ဖန်တီးပေးထားပါသည်။</span>
                          <button
                            onClick={handleTrySimilarQuestions}
                            className="text-rose-700 hover:text-rose-900 underline flex items-center gap-1 font-semibold"
                          >
                            <RefreshCw className="w-3 h-3" />
                            မေးခွန်းအသစ်များတောင်းမည်
                          </button>
                        </div>

                        <div className="space-y-4">
                          {similarQuestions.map((q, sIdx) => {
                            const selectedOption = similarAnswers[q.id];
                            const isSubmitted = similarSubmitted[q.id];
                            const feedback = similarFeedback[q.id];

                            return (
                              <div key={q.id || sIdx} className="border border-gray-100 p-5 rounded-xl bg-white shadow-sm space-y-3">
                                <span className="block font-mono text-[9px] text-rose-500 font-bold uppercase">Practice Question {sIdx + 1}</span>
                                <p className="font-sans font-medium text-xs text-gray-800">{q.question}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {q.options?.map((opt: string, oIdx: number) => {
                                    const isSelected = selectedOption === oIdx;
                                    let style = "border-gray-200 text-gray-600 bg-white hover:border-gray-300";
                                    if (isSubmitted) {
                                      if (oIdx === q.correctOptionIndex) {
                                        style = "border-emerald-200 text-emerald-800 bg-emerald-50 font-medium";
                                      } else if (isSelected) {
                                        style = "border-rose-200 text-rose-800 bg-rose-50 font-medium";
                                      } else {
                                        style = "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed";
                                      }
                                    } else if (isSelected) {
                                      style = "border-rose-500 text-rose-900 bg-rose-50/50 font-medium";
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        disabled={isSubmitted}
                                        onClick={() => {
                                          setSimilarAnswers(prev => ({ ...prev, [q.id]: oIdx }));
                                        }}
                                        className={`w-full text-left p-3 rounded-lg border text-xs font-sans transition flex items-center justify-between ${style}`}
                                      >
                                        <span>{opt}</span>
                                        {isSubmitted && oIdx === q.correctOptionIndex && <Check className="w-4 h-4 text-emerald-600" />}
                                      </button>
                                    );
                                  })}
                                </div>

                                {!isSubmitted ? (
                                  <button
                                    onClick={() => {
                                      if (selectedOption === undefined) return;
                                      const isCorrect = selectedOption === q.correctOptionIndex;
                                      setSimilarSubmitted(prev => ({ ...prev, [q.id]: true }));
                                      setSimilarFeedback(prev => ({
                                        ...prev,
                                        [q.id]: { correct: isCorrect, explanation: q.explanation }
                                      }));
                                    }}
                                    disabled={selectedOption === undefined}
                                    className={`px-4 py-2 rounded-lg font-sans text-xs font-bold transition mt-2 ${
                                      selectedOption !== undefined
                                        ? "bg-rose-600 text-white hover:bg-rose-700"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                                  >
                                    အဖြေတင်သွင်းမည်
                                  </button>
                                ) : (
                                  <div className={`p-4 rounded-lg border text-xs font-sans mt-3 space-y-1 leading-relaxed ${
                                    feedback?.correct ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-rose-50 border-rose-100 text-rose-900"
                                  }`}>
                                    <div className="font-bold flex items-center gap-1">
                                      {feedback?.correct ? "✅ အဖြေမှန်ကန်ပါတယ်!" : "❌ အဖြေလွဲမှားနေပါသည်"}
                                    </div>
                                    <div className="font-sans text-gray-600 text-[11px] mt-1">
                                      <strong>Kibo Guide:</strong> {feedback?.explanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 5. LEARNING HISTORY TAB */}
                {selectedReviewTab === "history" && (
                  <motion.div
                    key="tab-history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5 text-left"
                  >
                    {isLoadingHistory ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
                        <p className="font-sans text-xs text-rose-700">သင်၏ သင်ယူလေ့လာမှုမှတ်တမ်းကို ဆန်းစစ်နေပါသည်...</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Overall metrics cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <span className="text-[10px] uppercase font-mono text-gray-400">Total Quiz Attempts</span>
                            <span className="block font-sans font-extrabold text-xl text-gray-900 mt-1">{attemptsHistory.length} ကြိမ်</span>
                          </div>
                          
                          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <span className="text-[10px] uppercase font-mono text-gray-400">Average Performance</span>
                            <span className="block font-sans font-extrabold text-xl text-emerald-600 mt-1">
                              {improvementTrend ? `${improvementTrend.average}%` : "0%"}
                            </span>
                          </div>

                          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <span className="text-[10px] uppercase font-mono text-gray-400">Improvement Trend</span>
                            <span className={`block font-sans font-extrabold text-xs mt-1.5 flex items-center gap-1 ${
                              improvementTrend?.trend === "up" ? "text-emerald-600" : improvementTrend?.trend === "down" ? "text-rose-600" : "text-gray-600"
                            }`}>
                              {improvementTrend?.trend === "up" ? "📈 အဆက်မပြတ် တိုးတက်နေပါသည်" : improvementTrend?.trend === "down" ? "📉 ပြန်လည်လေ့လာမှု လိုအပ်နေပါသည်" : "📊 တည်ငြိမ်စွာ ဆက်လက်ရှိနေသည်"}
                            </span>
                          </div>
                        </div>

                        {/* Mistakes Diagnostic & Recommendations */}
                        <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-5">
                          <h4 className="font-sans font-bold text-gray-900 text-xs flex items-center gap-1.5 mb-3">
                            <BookOpen className="w-4 h-4 text-rose-600" />
                            သင့်အတွက် စိန်ခေါ်မှုအရှိဆုံး ပရိုဂရမ်မင်းခေါင်းစဉ်များ (Top Challenging Topics)
                          </h4>
                          
                          {commonMistakes.length > 0 ? (
                            <div className="space-y-3">
                              {commonMistakes.slice(0, 3).map((item, index) => (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between items-center text-xs font-sans font-medium text-gray-700">
                                    <span>{item.topic}</span>
                                    <span className="text-rose-600">{item.count} ကြိမ် မှားယွင်းခဲ့ပါသည်</span>
                                  </div>
                                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-rose-500 h-full rounded-full"
                                      style={{ width: `${Math.min(100, (item.count / attemptsHistory.length) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                              
                              <p className="font-sans text-[11px] text-gray-500 leading-relaxed mt-4">
                                💡 <strong>Kibo Pro-Tip:</strong> သင်အမှားအများဆုံးဖြစ်ခဲ့သော အထက်ပါခေါင်းစဉ်များကို သင်ရိုးမာတိကာတွင် ပြန်လည်ရှာဖွေပြီး အပိုင်းလိုက်လေ့လာခြင်းများ ပြုလုပ်ပါက ပိုမိုလျင်မြန်စွာ ကျွမ်းကျင်လာပါလိမ့်မည်။
                              </p>
                            </div>
                          ) : (
                            <p className="font-sans text-xs text-gray-500">ဂုဏ်ယူပါတယ်! သင်လွဲမှားခဲ့သော မေးခွန်းများ မရှိသလောက် နည်းပါးလှပါသည်။ ဆက်လက်ပြီး ကြိုးစားပါ ကလေးတို့ရေ။</p>
                          )}
                        </div>

                        {/* Recent attempts breakdown list */}
                        <div className="space-y-2">
                          <h4 className="font-sans font-bold text-gray-900 text-xs">မကြာသေးမီက ဖြေဆိုမှုများ (Recent Attempts)</h4>
                          <div className="border border-gray-100 rounded-xl overflow-hidden bg-white divide-y divide-gray-50 text-xs">
                            {attemptsHistory.slice(-5).reverse().map((attempt, index) => (
                              <div key={attempt.id || index} className="p-3 flex items-center justify-between hover:bg-gray-50/50 transition">
                                <div className="space-y-0.5">
                                  <span className="block font-sans font-semibold text-gray-800">
                                    {new Date(attempt.timestamp).toLocaleDateString()} {new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className="block text-[10px] text-gray-400 font-mono">ID: {attempt.id.slice(-8)} | {attempt.timeSpentSeconds}s ကြာမြင့်သည်</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                                    attempt.passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                  }`}>
                                    {attempt.passed ? "PASSED" : "FAILED"}
                                  </span>
                                  <span className="font-sans font-bold text-gray-900 text-sm">{Math.round((attempt.score / attempt.totalQuestions) * 100)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ACTION SUMMARY BUTTONS */}
            <div className="flex gap-3 justify-end border-t border-gray-100 pt-6">
              {score / questions.length * 100 < passingScorePercent && (
                <button
                  id="btn-retry-assessment"
                  onClick={startAssessment}
                  className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 transition text-sm font-sans flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  ထပ်မံဖြေဆိုရန် ပြန်လည်ကြိုးစားပါ
                </button>
              )}
              <button
                id="btn-back-curriculum"
                onClick={() => {
                  if (onCancel) onCancel();
                }}
                className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-sans text-sm font-medium transition"
              >
                သင်ရိုးသို့ ပြန်သွားရန်
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
