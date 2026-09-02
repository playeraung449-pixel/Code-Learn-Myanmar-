/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Terminal, 
  HelpCircle, 
  Code2, 
  RefreshCw, 
  Compass,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Plus,
  Info,
  Search,
  Edit3,
  CheckSquare,
  X,
  Crown,
  Coins,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Bot,
  BookOpen,
  Lightbulb,
  Bug,
  GraduationCap
} from "lucide-react";
import { Course, Lesson, UserProfile } from "../types";
import MarkdownRenderer from "../components/MarkdownRenderer";
import KiboMascot from "../components/KiboMascot";
import { isUserPremium } from "../utils/premiumSecurity";
import Kibo3DMentor, { Kibo3DState } from "../components/Kibo3DMentor";
import { 
  saveAIChatSession, 
  getAIChatSessions, 
  deleteAIChatSession, 
  AIChatSession 
} from "../lib/db";
import { 
  reduceContextMessages, 
  reduceLessonContext, 
  recordClientTierUsage,
  generateKiboCacheKey,
  getCachedKiboResponse,
  setCachedKiboResponse
} from "../lib/kiboClient";
import { generateLocalKiboResponse } from "../lib/kiboLocalFallback";
import { continuousPerfEngine } from "../lib/continuousPerformanceMonitoring";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  currentCourse?: Course | null;
  currentLesson?: Lesson | null;
  embeddedMode?: boolean;
  user?: UserProfile | null;
  onUpdateUser?: (updated: UserProfile) => void;
  triggerPrompt?: { text: string; id: number } | null;
}

export default function AIAssistant({ 
  currentCourse = null, 
  currentLesson = null, 
  embeddedMode = false,
  user = null,
  onUpdateUser,
  triggerPrompt = null
}: AIAssistantProps) {
  
  // Welcoming prompt based on learning context
  const getInitialWelcome = () => {
    if (currentCourse && currentLesson) {
      return `မင်္ဂလာပါခင်ဗျာ! ကျွန်တော်ကတော့ **Code Learn Myanmar** ရဲ့ AI Virtual Mentor **Kibo** ဖြစ်ပါတယ်။ \n\nမောင်မင်းက အခု **${currentCourse.title}** သင်တန်းထဲက **${currentLesson.title}** အကြောင်းကို လေ့လာနေတယ်ဆိုတော့... ဒီသင်ခန်းစာပါ အယူအဆတွေ၊ ကုဒ်ရေးနည်းတွေ သို့မဟုတ် ကုဒ်တက်နေတဲ့ error တွေကို မေးမြန်းနိုင်ပါတယ်ဗျာ။ ဘာကူညီပေးရမလဲ ခင်ဗျာ။`;
    }
    return "မင်္ဂလာပါခင်ဗျာ! ကျွန်တော်ကတော့ **Code Learn Myanmar** ရဲ့ AI Virtual Mentor **Kibo** ဖြစ်ပါတယ်။ ပရိုဂရမ်မင်းနဲ့ပတ်သက်ပြီး သိချင်တာတွေ၊ ကုဒ်ရေးနည်းတွေ သို့မဟုတ် ကုဒ်တက်နေတဲ့ error တွေကို မြန်မာလို အသေးစိတ် မေးမြန်းနိုင်ပါတယ်ဗျာ။ ဘာကူညီပေးရမလဲ ခင်ဗျာ။";
  };

  // State managers
  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: getInitialWelcome() }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false); // For compact mobile/embedded view
  
  // Renaming state
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  // Kibo 3D Mentor Active Mascot Animation State
  const [kiboState, setKiboState] = useState<Kibo3DState>("idle");
  const [show3DMentorDrawer, setShow3DMentorDrawer] = useState(!embeddedMode);

  // Copy status indicators
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isCopiedMain, setIsCopiedMain] = useState<number | null>(null);

  // References
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Daily request limits for Free Users
  const [dailyMsgCount, setDailyMsgCount] = useState<number>(() => {
    const today = new Date().toDateString();
    const count = localStorage.getItem(`clm_kibo_requests_${today}`);
    return count ? parseInt(count, 10) : 0;
  });

  // Calculate premium status
  const isPremiumUser = isUserPremium(user);

  // Sync initial welcome message on lesson switch (if chat has not diverged yet)
  useEffect(() => {
    if (messages.length === 1 && !activeSessionId) {
      setMessages([{ role: "assistant", content: getInitialWelcome() }]);
    }
  }, [currentLesson, currentCourse]);

  // Load chat sessions from Firestore on mount/user auth
  useEffect(() => {
    if (user?.uid) {
      loadSessionsFromFirestore();
    } else {
      setSessions([]);
    }
  }, [user?.uid]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize message input height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputValue]);

  // Handle external trigger prompts from Kibo Quick Questions
  useEffect(() => {
    if (triggerPrompt && triggerPrompt.text) {
      handleSendMessage(triggerPrompt.text);
    }
  }, [triggerPrompt]);

  // Firestore Session Fetching
  const loadSessionsFromFirestore = async () => {
    if (!user?.uid) return;
    try {
      const fetched = await getAIChatSessions(user.uid);
      setSessions(fetched);
    } catch (e) {
      console.warn("Could not fetch sessions from Firestore:", e);
    }
  };

  // Create a clean new session
  const handleStartNewSession = () => {
    setActiveSessionId(null);
    setMessages([{ role: "assistant", content: getInitialWelcome() }]);
    setInputValue("");
    setIsHistoryExpanded(false);
  };

  // Switch to an existing session
  const handleSwitchSession = (session: AIChatSession) => {
    setActiveSessionId(session.chatId);
    setMessages(session.messages);
    setInputValue("");
    setIsHistoryExpanded(false);
  };

  // Delete a session
  const handleDeleteSession = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("ဤစကားဝိုင်း သမိုင်းကြောင်းကို အပြီးတိုင် ဖျက်ပစ်ရန် သေချာပါသလားခင်ဗျာ။")) return;
    
    try {
      await deleteAIChatSession(chatId);
      // Remove locally
      setSessions((prev) => prev.filter((s) => s.chatId !== chatId));
      if (activeSessionId === chatId) {
        handleStartNewSession();
      }
    } catch (err) {
      console.error("Failed to delete chat session:", err);
    }
  };

  // Rename a session
  const handleStartRename = (session: AIChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingSessionId(session.chatId);
    setRenameTitle(session.title);
  };

  const handleSaveRename = async (chatId: string) => {
    if (!renameTitle.trim()) return;
    try {
      const session = sessions.find((s) => s.chatId === chatId);
      if (session && user?.uid) {
        await saveAIChatSession(chatId, user.uid, renameTitle.trim(), session.messages, session.createdAt);
        // Refresh local
        setSessions((prev) => 
          prev.map((s) => s.chatId === chatId ? { ...s, title: renameTitle.trim() } : s)
        );
      }
      setRenamingSessionId(null);
    } catch (err) {
      console.error("Failed to rename session:", err);
    }
  };

  // Buy Kibo Premium with Virtual Coins
  const handleBuyPremiumWithCoins = async () => {
    if (!user || !onUpdateUser) return;
    
    const coinBalance = user.coins ?? 0;
    if (coinBalance < 200) {
      alert(`တောင်းပန်ပါတယ်ခင်ဗျာ။ Kibo Premium အဆင့်မြှင့်ရန် ရွှေသင်္ကေတ (Coins) ၂၀၀ လိုအပ်သော်လည်း သင့်ထံတွင် ${coinBalance} Coins သာ ရှိပါသေးသည်။ သင်ခန်းစာများ၊ ဉာဏ်စမ်းများနှင့် Mini Projects များကို အောင်မြင်အောင် ဖြေဆိုရင်း Coins များ ထပ်မံစုဆောင်းနိုင်ပါတယ်ခင်ဗျာ။`);
      return;
    }

    if (window.confirm(`👑 Kibo Premium အဆင့်မြှင့်မည်မှာ သေချာပါသလားခင်ဗျာ။ \n\nဤလုပ်ဆောင်ချက်သည် သင့်လက်ကျန် Coins များထဲမှ ၂၀၀ Coins နှုတ်ယူသွားမည် ဖြစ်ပြီး Kibo virtual mentor ၏ အဆင့်မြင့်နည်းပညာဝန်ဆောင်မှုများ (ကုဒ်စစ်ဆေးခြင်း၊ ပရောဂျက်အသေးစိတ်လမ်းညွှန်ချက်၊ ကုဒ်ပိုမိုကောင်းမွန်အောင်ပြုပြင်ပေးခြင်းနှင့် ကန့်သတ်ချက်မဲ့မေးခွန်းများမေးမြန်းခြင်း) တို့ကို တစ်သက်တာ အခမဲ့ အသုံးပြုခွင့် ရရှိမည်ဖြစ်ပါသည်။`)) {
      const updatedUser: UserProfile = {
        ...user,
        coins: coinBalance - 200,
        role: "premium", // Update role to premium
        level: user.level,
        xp: user.xp,
        completedLessons: user.completedLessons,
        achievements: [
          ...user.achievements,
          {
            id: "kibo_premium",
            title: "Kibo Premium တပည့်တော်ကြီး",
            description: "Kibo AI virtual mentor ၏ Premium တစ်သက်တာအသုံးပြုခွင့်ကို အောင်မြင်စွာ အဆင့်မြှင့်နိုင်ခဲ့ခြင်း။",
            icon: "Crown",
            unlockedAt: new Date().toLocaleDateString()
          }
        ]
      };
      
      // Inject property isPremium to ensure full compliance
      (updatedUser as any).isPremium = true;

      try {
        await onUpdateUser(updatedUser);
        alert("🎉 ဂုဏ်ယူပါတယ်ခင်ဗျာ! Kibo Premium အဆင့်မြှင့်တင်မှု အောင်မြင်ပါသည်။ အဆင့်မြင့် ဝန်ဆောင်မှုအားလုံးကို ယခုပင် စတင်အသုံးပြုနိုင်ပါပြီဗျာ။");
      } catch (err) {
        alert("မအောင်မြင်ပါခင်ဗျာ။ ကွန်ရက်ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ထပ်မံကြိုးစားကြည့်ပေးပါ။");
      }
    }
  };

  // Increment and track daily counts for Free tier
  const trackRequestLimit = (): boolean => {
    if (isPremiumUser) return true; // Premium has unlimited access

    const today = new Date().toDateString();
    const newCount = dailyMsgCount + 1;
    setDailyMsgCount(newCount);
    localStorage.setItem(`clm_kibo_requests_${today}`, newCount.toString());

    if (newCount > 10) {
      return false; // Exceeded limit
    }
    return true;
  };

  // Streaming chat handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    // Check limit first
    const withinLimit = trackRequestLimit();
    if (!withinLimit) {
      alert("⚠️ သတိပေးချက်: အခမဲ့ အသုံးပြုသူများအတွက် တစ်ရက်လျှင် မေးခွန်း ၁၀ ခုသာ မေးမြန်းခွင့် ကန့်သတ်ထားပါသည်ခင်ဗျာ။ အဆင့်မြင့် Kibo Premium အဆင့်မြှင့်ရန် ရွှေသင်္ကေတ (Coins) ၂၀၀ သာ လိုအပ်ပါသည်။ စာမျက်နှာဘေးဘက်တွင် Coins ဖြင့် Premium သို့ အဆင့်မြှင့်တင်နိုင်ပါတယ်ဗျာ။");
      return;
    }

    if (text.length > 16000) {
      alert("စာလုံးအရေအတွက် ၁၆,၀၀၀ ကန့်သတ်ချက်ထက် ကျော်လွန်နေပါတယ်ခင်ဗျာ။");
      return;
    }

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);
    setKiboState("thinking");

    // Dynamic Title Generation for a brand new conversation
    let currentSessionIdToUse = activeSessionId;
    let isNewSession = false;
    if (!currentSessionIdToUse) {
      currentSessionIdToUse = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setActiveSessionId(currentSessionIdToUse);
      isNewSession = true;
    }

    // Context reduction and payload trimming
    const optimizedMessages = reduceContextMessages(updatedMessages, isPremiumUser);
    const { course: optimizedCourse, lesson: optimizedLesson } = reduceLessonContext(currentCourse, currentLesson);

    // Check client-side cached response first
    const clientCacheKey = generateKiboCacheKey(
      "chat", 
      text, 
      currentCourse?.id, 
      currentLesson?.id, 
      isPremiumUser ? "premium" : "free"
    );
    const cachedResponse = getCachedKiboResponse(clientCacheKey);

    if (cachedResponse) {
      // Instant response from cache without API hit
      setMessages((prev) => [...prev, { role: "assistant", content: cachedResponse }]);
      recordClientTierUsage("chat");
      continuousPerfEngine.recordKiboMetric({
        feature: "chat",
        totalDurationMs: 5,
        streamMode: "cached",
        promptLength: text.length,
        responseLength: cachedResponse.length,
        status: "success"
      });
      setIsLoading(false);
      return;
    }

    let assistantResponseText = "";
    let succeeded = false;
    const aiStartTime = performance.now();
    let firstTokenTime: number | undefined = undefined;

    // 1. Try Streaming POST
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: optimizedMessages,
          currentCourse: optimizedCourse,
          currentLesson: optimizedLesson,
          userProfile: {
            uid: user?.uid,
            role: user?.role,
            isPremium: isPremiumUser
          },
          stream: true
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder("utf-8");
          let done = false;
          
          // Add empty assistant response slot for streaming output
          setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

          let buffer = "";
          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              const chunkStr = decoder.decode(value, { stream: !done });
              buffer += chunkStr;

              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data: ")) {
                  const dataStr = trimmed.slice(6);
                  if (dataStr === "[DONE]") {
                    continue;
                  }
                  try {
                    const parsed = JSON.parse(dataStr);
                    if (parsed.text) {
                      if (firstTokenTime === undefined) {
                        firstTokenTime = Math.round(performance.now() - aiStartTime);
                      }
                      assistantResponseText += parsed.text;
                      setMessages((prev) => {
                        const copy = [...prev];
                        const last = copy[copy.length - 1];
                        if (last && last.role === "assistant") {
                          last.content = assistantResponseText;
                        }
                        return copy;
                      });
                    } else if (parsed.error) {
                      assistantResponseText = parsed.error;
                      setMessages((prev) => {
                        const copy = [...prev];
                        const last = copy[copy.length - 1];
                        if (last && last.role === "assistant") {
                          last.content = assistantResponseText;
                        }
                        return copy;
                      });
                    }
                  } catch (e) {
                    // Ignore line parse errors
                  }
                }
              }
            }
          }
          if (assistantResponseText.trim().length > 0) {
            succeeded = true;
            const totalElapsed = Math.round(performance.now() - aiStartTime);
            continuousPerfEngine.recordKiboMetric({
              feature: "chat",
              totalDurationMs: totalElapsed,
              timeToFirstTokenMs: firstTokenTime,
              tokensPerSec: Math.round((assistantResponseText.length / Math.max(1, totalElapsed)) * 1000),
              streamMode: "streaming",
              promptLength: text.length,
              responseLength: assistantResponseText.length,
              status: "success"
            });
          }
        }
      } else {
        // Parse error response from server
        try {
          const errData = await response.json();
          if (errData?.myanmar || errData?.error) {
            assistantResponseText = errData.myanmar || errData.error;
            setMessages((prev) => [...prev, { role: "assistant", content: assistantResponseText }]);
            succeeded = true;
          }
        } catch {
          // Fall through to fallback
        }
      }
    } catch (streamErr) {
      console.warn("Streaming fetch failed, attempting non-streaming fallback...", streamErr);
    }

    // 2. Non-Streaming Fallback if streaming failed
    if (!succeeded) {
      try {
        const response = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: optimizedMessages,
            currentCourse: optimizedCourse,
            currentLesson: optimizedLesson,
            userProfile: {
              uid: user?.uid,
              role: user?.role,
              isPremium: isPremiumUser
            },
            stream: false
          }),
        });

        if (response.ok) {
          const data = await response.json();
          assistantResponseText = data.text || "";
          if (assistantResponseText) {
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant") {
                last.content = assistantResponseText;
              } else {
                copy.push({ role: "assistant", content: assistantResponseText });
              }
              return copy;
            });
            succeeded = true;
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          if (errData.myanmar || errData.error) {
            assistantResponseText = errData.myanmar || errData.error;
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant") {
                last.content = assistantResponseText;
              } else {
                copy.push({ role: "assistant", content: assistantResponseText });
              }
              return copy;
            });
            succeeded = true;
          }
        }
      } catch (nonStreamErr) {
        console.warn("Non-streaming fetch failed, switching to local offline assistant...", nonStreamErr);
      }
    }

    // 3. Local Smart Offline Fallback if network completely dropped or failed
    if (!succeeded) {
      assistantResponseText = generateLocalKiboResponse(text, currentCourse, currentLesson, isPremiumUser);
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.role === "assistant") {
          last.content = assistantResponseText;
        } else {
          copy.push({ role: "assistant", content: assistantResponseText });
        }
        return copy;
      });
      succeeded = true;
    }

    // Save conversation in client cache and Firestore
    try {
      if (assistantResponseText.length > 10) {
        setCachedKiboResponse(clientCacheKey, assistantResponseText);
        recordClientTierUsage("chat");
      }

      if (user?.uid && currentSessionIdToUse) {
        const finalMessages: Message[] = [...updatedMessages, { role: "assistant", content: assistantResponseText }];
        const conversationTitle = isNewSession ? text.slice(0, 40) + (text.length > 40 ? "..." : "") : (sessions.find(s => s.chatId === currentSessionIdToUse)?.title || text.slice(0, 40));
        await saveAIChatSession(currentSessionIdToUse, user.uid, conversationTitle, finalMessages);
        await loadSessionsFromFirestore();
      }
    } catch (saveErr) {
      console.warn("Could not persist session:", saveErr);
    } finally {
      setIsLoading(false);
      if (assistantResponseText.toLowerCase().includes("error") || assistantResponseText.includes("အမှား")) {
        setKiboState("error_help");
      } else if (assistantResponseText.includes("ဂုဏ်ယူ") || assistantResponseText.includes("တော်တယ်")) {
        setKiboState("celebration");
      } else {
        setKiboState("explaining");
      }
      setTimeout(() => {
        setKiboState("idle");
      }, 7000);
    }
  };

  // Regenerate Response
  const handleRegenerateResponse = async () => {
    if (isLoading || messages.length < 2) return;

    // Find last user message
    let lastUserMsgIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMsgIdx = i;
        break;
      }
    }

    if (lastUserMsgIdx === -1) return;

    const lastUserText = messages[lastUserMsgIdx].content;
    const messagesToKeep = messages.slice(0, lastUserMsgIdx + 1);
    setMessages(messagesToKeep);
    setIsLoading(true);

    let assistantResponseText = "";
    let succeeded = false;

    // 1. Try Streaming
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: messagesToKeep,
          currentCourse,
          currentLesson,
          userProfile: {
            ...user,
            isPremium: isPremiumUser
          },
          stream: true
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder("utf-8");
          let done = false;
          setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

          let buffer = "";
          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              const chunkStr = decoder.decode(value, { stream: !done });
              buffer += chunkStr;

              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data: ")) {
                  const dataStr = trimmed.slice(6);
                  if (dataStr === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(dataStr);
                    if (parsed.text) {
                      assistantResponseText += parsed.text;
                      setMessages((prev) => {
                        const copy = [...prev];
                        const last = copy[copy.length - 1];
                        if (last && last.role === "assistant") {
                          last.content = assistantResponseText;
                        }
                        return copy;
                      });
                    }
                  } catch (e) {}
                }
              }
            }
          }
          if (assistantResponseText.trim().length > 0) {
            succeeded = true;
          }
        }
      }
    } catch (e) {
      console.warn("Regenerate stream failed:", e);
    }

    // 2. Non-Streaming fallback
    if (!succeeded) {
      try {
        const response = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: messagesToKeep,
            currentCourse,
            currentLesson,
            userProfile: {
              ...user,
              isPremium: isPremiumUser
            },
            stream: false
          }),
        });

        if (response.ok) {
          const data = await response.json();
          assistantResponseText = data.text || "";
          if (assistantResponseText) {
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant") {
                last.content = assistantResponseText;
              } else {
                copy.push({ role: "assistant", content: assistantResponseText });
              }
              return copy;
            });
            succeeded = true;
          }
        }
      } catch (err) {
        console.warn("Regenerate fallback failed:", err);
      }
    }

    // 3. Local offline fallback if still needed
    if (!succeeded) {
      assistantResponseText = generateLocalKiboResponse(lastUserText, currentCourse, currentLesson, isPremiumUser);
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.role === "assistant") {
          last.content = assistantResponseText;
        } else {
          copy.push({ role: "assistant", content: assistantResponseText });
        }
        return copy;
      });
    }

    // Save regenerated chat in Firestore
    try {
      if (user?.uid && activeSessionId) {
        const finalMessages: Message[] = [...messagesToKeep, { role: "assistant", content: assistantResponseText }];
        const currentTitle = sessions.find(s => s.chatId === activeSessionId)?.title || "စကားဝိုင်းသစ်";
        await saveAIChatSession(activeSessionId, user.uid, currentTitle, finalMessages);
        await loadSessionsFromFirestore();
      }
    } catch (saveErr) {
      console.warn("Could not save regenerated session:", saveErr);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setIsCopiedMain(idx);
    setTimeout(() => setIsCopiedMain(null), 2000);
  };

  // Filter previous sessions list by search query
  const filteredSessions = sessions.filter((s) => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Dynamic context suggestions
  const suggestions = currentLesson 
    ? [
        `"${currentLesson.title}" သင်ခန်းစာကို မြန်မာလို အကျဉ်းချုပ် ရှင်းပြပေးပါ။`,
        `ဒီသင်ခန်းစာနဲ့ပတ်သက်တဲ့ ဥပမာကုဒ်တစ်ခု ရေးပြပါ။`,
        `လေ့ကျင့်ခန်း (Exercise) ဖြေရှင်းဖို့ Tips လေးတွေ ပေးပါ။`,
        `ဒီသင်ခန်းစာထဲက Technical terms များကို ရှင်းပြပေးပါ။`
      ]
    : [
        "Variable ဆိုတာ ဘာလဲ ဥပမာနဲ့ ရှင်းပြပါ။",
        "Python မှာ list နဲ့ tuple ဘာကွာလဲ။",
        "HTML structure အခြေခံ ဘယ်လိုတည်ဆောက်ရမလဲ။",
        "Git commit လုပ်ရခြင်းရဲ့ အဓိကရည်ရွယ်ချက်က ဘာလဲ။"
      ];

  // Premium Prompts Trigger
  const handlePremiumPromptClick = (actionName: string, promptText: string) => {
    if (!isPremiumUser) {
      alert(`👑 Kibo Premium အဆင့်မြင့် လုပ်ဆောင်ချက် ဖြစ်ပါသည်! \n\n[${actionName}] လုပ်ဆောင်ချက်သည် Premium သုံးစွဲသူများသာ အသုံးပြုနိုင်ပါသည်။ သင်၏ပရိုဖိုင်းမှ ရွှေ Coins ၂၀၀ သုံးကာ Kibo Premium သို့ အချိန်မရွေး အဆင့်မြှင့်တင်နိုင်ပါသည်ခင်ဗျာ။`);
      return;
    }
    handleSendMessage(promptText);
  };

  return (
    <div id="kibo_workspace_container" className="flex h-full w-full bg-[#0F172A] overflow-hidden">
      
      {/* SIDEBAR: CONVERSATION HISTORY & PREMIUM MODULE (Only on Desktop when not embeddedMode) */}
      {!embeddedMode && (
        <aside id="kibo_sidebar" className="w-80 bg-[#1E293B]/70 border-r border-slate-800 flex flex-col h-full flex-shrink-0 hidden md:flex">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex flex-col space-y-3 flex-shrink-0 text-left">
            <button
              onClick={handleStartNewSession}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-blue-600/10 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>စကားဝိုင်းသစ်စတင်ရန်</span>
            </button>
            
            {/* Search History */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="စကားဝိုင်းများ ရှာဖွေရန်..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-300 focus:outline-none placeholder-slate-500 font-sans"
              />
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-left">
            <span className="px-3 py-1.5 text-[9px] text-slate-500 font-mono uppercase font-bold flex items-center space-x-1.5">
              <MessageSquare className="w-3 h-3 text-slate-500" />
              <span>လွန်ခဲ့သော ဆွေးနွေးမှုများ ({filteredSessions.length})</span>
            </span>

            {filteredSessions.length === 0 ? (
              <div className="py-8 px-4 text-center text-slate-500 text-xs">
                {searchQuery ? "မတွေ့ရှိပါခင်ဗျာ" : "မှတ်တမ်းမရှိသေးပါ"}
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = session.chatId === activeSessionId;
                const isRenaming = renamingSessionId === session.chatId;
                
                return (
                  <div
                    key={session.chatId}
                    onClick={() => handleSwitchSession(session)}
                    className={`group w-full p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer border transition-all ${
                      isActive 
                        ? "bg-purple-500/10 border-purple-500/20 text-purple-200 font-semibold" 
                        : "bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
                      {isRenaming ? (
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(session.chatId);
                          }}
                          autoFocus
                          className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white w-full focus:outline-none font-sans"
                        />
                      ) : (
                        <span className="truncate flex-1 font-sans">{session.title}</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0">
                      {isRenaming ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRename(session.chatId);
                          }}
                          className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          title="Save title"
                        >
                          <CheckSquare className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleStartRename(session, e)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                          title="Rename"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteSession(session.chatId, e)}
                        className="p-1 rounded hover:bg-red-950/20 text-slate-500 hover:text-red-400"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Premium coins buy module */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/30 text-left flex-shrink-0">
            {isPremiumUser ? (
              <div className="p-3 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-2xl flex flex-col space-y-1.5 text-xs">
                <div className="flex items-center space-x-2 text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                  <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Kibo Premium Active</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">သင့်ထံတွင် တစ်သက်တာ Premium လမ်းညွှန်မှု ကဏ္ဍအားလုံး ပွင့်နေပါပြီဗျာ။</p>
                <div className="flex items-center space-x-1 text-amber-500 font-semibold font-mono text-[11px] pt-1">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>{user?.coins ?? 0} Coins available</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">Kibo Free Tier</span>
                  <div className="flex items-center space-x-1 text-amber-500 font-bold font-mono">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{user?.coins ?? 0}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Advanced Debugging, Project Mentor and Optimization များ သုံးစွဲရန် Coins ၂၀၀ ဖြင့် Premium သို့ အဆင့်မြှင့်တင်ပါဗျာ။
                </p>
                <button
                  onClick={handleBuyPremiumWithCoins}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-purple-600/10 active:scale-95"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Upgrade to Premium (200 Coins)</span>
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* MAIN CHAT AREA */}
      <section className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* COMPACT HISTORY COLLAPSIBLE LIST (Embedded or Mobile viewport only) */}
        {!embeddedMode && sessions.length > 0 && (
          <div className="md:hidden border-b border-slate-800 bg-slate-900/60 flex flex-col flex-shrink-0 text-left relative z-20">
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="w-full px-4 py-2 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200"
            >
              <span className="flex items-center space-x-2">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>လွန်ခဲ့သော စကားဝိုင်းမှတ်တမ်းများ ({sessions.length})</span>
              </span>
              {isHistoryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isHistoryExpanded && (
              <div className="absolute top-full left-0 right-0 bg-[#1E293B] border-b border-slate-800 max-h-60 overflow-y-auto p-2 space-y-1 shadow-xl z-20">
                {sessions.map((s) => (
                  <div
                    key={s.chatId}
                    onClick={() => handleSwitchSession(s)}
                    className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer ${
                      s.chatId === activeSessionId ? "bg-purple-500/10 text-purple-400" : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <span className="truncate flex-1 font-sans pr-2">{s.title}</span>
                    <button
                      onClick={(e) => handleDeleteSession(s.chatId, e)}
                      className="text-red-400 p-1 hover:bg-red-950/20 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleStartNewSession}
                  className="w-full py-1.5 text-center text-xs font-bold text-blue-400 hover:bg-slate-900 border-t border-slate-800 mt-2 block"
                >
                  + စကားဝိုင်းအသစ် စတင်ရန်
                </button>
              </div>
            )}
          </div>
        )}

        {/* Embedded Mode Compact Header with History Dropdown */}
        {embeddedMode && sessions.length > 0 && (
          <div className="bg-slate-900/80 border-b border-slate-850 px-3 py-1.5 flex items-center justify-between flex-shrink-0 text-left relative z-20">
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="flex items-center space-x-1.5 text-[10px] text-slate-400 hover:text-slate-200"
            >
              <MessageSquare className="w-3 h-3 text-purple-400" />
              <span>စကားဝိုင်းများ ({sessions.length})</span>
              {isHistoryExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={handleStartNewSession}
              className="text-[10px] text-blue-400 font-bold hover:underline"
            >
              + New Session
            </button>

            {isHistoryExpanded && (
              <div className="absolute top-full left-0 right-0 bg-[#1E293B] border-b border-slate-800 max-h-48 overflow-y-auto p-1.5 space-y-1 shadow-2xl z-20">
                {sessions.map((s) => (
                  <div
                    key={s.chatId}
                    onClick={() => handleSwitchSession(s)}
                    className={`p-1.5 rounded-lg flex items-center justify-between text-[11px] cursor-pointer ${
                      s.chatId === activeSessionId ? "bg-purple-500/10 text-purple-400 font-semibold" : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <span className="truncate flex-1 font-sans pr-2">{s.title}</span>
                    <button
                      onClick={(e) => handleDeleteSession(s.chatId, e)}
                      className="text-red-400 p-0.5 hover:bg-red-950/20 rounded"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`flex-1 flex flex-col overflow-hidden mx-auto w-full ${
          embeddedMode ? "p-3 h-full" : "max-w-4xl px-4 sm:px-6 lg:px-8 py-6 h-full"
        }`}>
          
          {/* Active Learning Context Banner */}
          {currentCourse && currentLesson && !embeddedMode && (
            <div className="flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2.5 rounded-2xl mb-4 text-left">
              <Info className="w-4 h-4 text-purple-400 flex-shrink-0 animate-pulse" />
              <div className="text-xs">
                <span className="text-slate-400 font-mono">လက်ရှိလေ့လာနေသော အကြောင်းအရာ: </span>
                <span className="text-purple-400 font-bold font-display">{currentCourse.title}</span>
                <span className="text-slate-500 mx-1.5 font-mono">›</span>
                <span className="text-slate-200 font-bold">{currentLesson.title}</span>
              </div>
            </div>
          )}

          {/* Active Banner for Kibo character with 3D Mascot Drawer Toggle */}
          {!embeddedMode && (
            <div className="flex flex-col space-y-3 pb-4 border-b border-slate-800 text-left flex-shrink-0 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShow3DMentorDrawer(!show3DMentorDrawer)}
                    className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    title={show3DMentorDrawer ? "Hide 3D Mentor" : "Show 3D Mentor"}
                  >
                    <Bot className="w-5 h-5 text-blue-400 animate-pulse" />
                  </button>
                  <div>
                    <h1 className="font-display font-bold text-base text-slate-100 flex items-center space-x-2">
                      <span>Kibo 3D AI Coding Mentor</span>
                      {isPremiumUser && (
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-md flex items-center space-x-0.5">
                          <Crown className="w-2.5 h-2.5" />
                          <span>PREMIUM</span>
                        </span>
                      )}
                    </h1>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {isPremiumUser 
                        ? "ကန့်သတ်ချက်မရှိ စကားဝိုင်းစနစ်နှင့် အဆင့်မြင့် 3D AI ကုဒ်အကြံပေးချက်များ အသင့်ရှိပါသည်" 
                        : `အခမဲ့အသုံးပြုမှု: ယနေ့မေးမြန်းမှု ${dailyMsgCount} / ၁၀ အသုံးပြုပြီး`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShow3DMentorDrawer(!show3DMentorDrawer)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border ${
                      show3DMentorDrawer
                        ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{show3DMentorDrawer ? "Hide 3D Mentor" : "Show 3D Avatar"}</span>
                  </button>

                  {messages.length > 1 && (
                    <button 
                      onClick={handleStartNewSession}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      title="Clear Session"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">စကားဝိုင်းသစ်</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible 3D Interactive Mascot Container */}
              {show3DMentorDrawer && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 transition-all duration-300 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />
                  <Kibo3DMentor
                    state={kiboState}
                    onStateChange={(st) => setKiboState(st)}
                    currentLessonTitle={currentLesson?.title}
                    currentCourseTitle={currentCourse?.title}
                    onAskQuestion={(q) => handleSendMessage(q)}
                    onRequestExplanation={() =>
                      handleSendMessage(
                        currentLesson
                          ? `"${currentLesson.title}" သင်ခန်းစာ၏ အဓိက အချက်များနှင့် သဘောတရားများကို မြန်မာလို အဆင့်ဆင့် ရှင်းပြပေးပါခင်ဗျာ။`
                          : "Programming အခြေခံ သဘောတရားများကို မြန်မာလို အဆင့်ဆင့် ရှင်းပြပေးပါခင်ဗျာ။"
                      )
                    }
                    onAskCodingHelp={() =>
                      handleSendMessage(
                        "ကျွန်တော် ရေးသားထားသော ကုဒ်များတွင် ဖြစ်ပေါ်နေသော Syntax/Logic Error များကို အဆင့်ဆင့် ရှာဖွေပြီး ဖြေရှင်းနည်း ရှင်းပြပေးပါခင်ဗျာ။"
                      )
                    }
                    onAskExample={() =>
                      handleSendMessage(
                        currentLesson
                          ? `"${currentLesson.title}" နှင့် သက်ဆိုင်သော လက်တွေ့ကျသည့် ဥပမာ ကုဒ်တစ်ခု ရေးပြပေးပါခင်ဗျာ။`
                          : "လက်တွေ့ အသုံးဝင်သော Programming Code ဥပမာတစ်ခု ရေးပြပေးပါခင်ဗျာ။"
                      )
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* 5 Core Kibo Functions Interactive Quick Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 mb-3 flex flex-col space-y-2 text-left flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-300">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-display">Kibo Functions (ပင်မလုပ်ဆောင်ချက် ၅ ရပ်)</span>
              </div>
              <div className="flex items-center space-x-1 text-[9px] text-slate-500 font-mono">
                <span className="hidden sm:inline">Active learning companion</span>
                <span className="text-emerald-400 font-semibold">● Guided Mentorship</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <button
                onClick={() => handleSendMessage(
                  currentLesson 
                    ? `"${currentLesson.title}" သင်ခန်းစာ၏ အဓိက သဘောတရားများနှင့် Syntax အသုံးပြုပုံများကို နေ့စဉ်ဘဝ ဥပမာများနှင့်အတူ မြန်မာလို အဆင့်ဆင့် ရှင်းပြပေးပါခင်ဗျာ။`
                    : "Programming အခြေခံ သဘောတရားများကို နေ့စဉ်ဘဝ ဥပမာများနှင့်အတူ မြန်မာလို ရှင်းပြပေးပါခင်ဗျာ။"
                )}
                className="p-2 bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-xl text-left transition-all group cursor-pointer"
                title="Explain Lessons"
              >
                <div className="flex items-center space-x-1.5 text-blue-400 text-[11px] font-bold">
                  <BookOpen className="w-3 h-3" />
                  <span>Explain Lesson</span>
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5 font-sans">သင်ခန်းစာ ရှင်းပြရန်</p>
              </button>

              <button
                onClick={() => handleSendMessage(
                  currentLesson
                    ? `ကျွန်တော် လက်ရှိလေ့လာနေသော "${currentLesson.title}" နှင့်ပတ်သက်ပြီး သိလိုသည်များ မေးမြန်းလိုပါသည်။ အခြေခံအဆင့်မှ စတင်၍ ရှင်းပြပေးပါခင်ဗျာ။`
                    : "Programming နည်းပညာနှင့် ပတ်သက်ပြီး သိလိုသော မေးခွန်းများကို မြန်မာလို ဖြေကြားပေးပါခင်ဗျာ။"
                )}
                className="p-2 bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 rounded-xl text-left transition-all group cursor-pointer"
                title="Answer Questions"
              >
                <div className="flex items-center space-x-1.5 text-purple-400 text-[11px] font-bold">
                  <HelpCircle className="w-3 h-3" />
                  <span>Answer Questions</span>
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5 font-sans">မေးခွန်းများ မေးရန်</p>
              </button>

              <button
                onClick={() => handleSendMessage(
                  currentLesson
                    ? `"${currentLesson.title}" လေ့ကျင့်ခန်း (Exercise) ကို ကိုယ်တိုင် ဖြေရှင်းနိုင်ရန် အတွေးအခေါ်နှင့် Logic အဆင့်ဆင့်ကို လမ်းညွှန်ပေးပါခင်ဗျာ။ (အဖြေတိုက်ရိုက်မပေးဘဲ Hints နှင့် Step-by-step logic သာ ပေးပါ)`
                    : "Coding ပြဿနာများကို ဖြေရှင်းနိုင်ရန် စဉ်းစားတွေးခေါ်ပုံနှင့် Logic လမ်းညွှန်ချက်များ ပေးပါခင်ဗျာ။"
                )}
                className="p-2 bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all group cursor-pointer"
                title="Provide Coding Guidance"
              >
                <div className="flex items-center space-x-1.5 text-amber-400 text-[11px] font-bold">
                  <Compass className="w-3 h-3" />
                  <span>Coding Guidance</span>
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5 font-sans">ကုဒ်ရေးနည်း လမ်းညွှန်</p>
              </button>

              <button
                onClick={() => handleSendMessage(
                  currentLesson
                    ? `"${currentLesson.title}" သင်ခန်းစာနှင့် သက်ဆိုင်သော Basic မှစတင်၍ Practical နှင့် Real-world အသုံးချ Code ဥပမာများကို တစ်လိုင်းချင်း ရှင်းလင်းချက်နှင့်အတူ ပြသပေးပါခင်ဗျာ။`
                    : "လက်တွေ့ အသုံးချနိုင်သော Basic နှင့် Real-world Code နမူနာ ဥပမာများကို ရှင်းလင်းချက်နှင့်အတူ ပြသပေးပါခင်ဗျာ။"
                )}
                className="p-2 bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-all group cursor-pointer"
                title="Give Examples"
              >
                <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px] font-bold">
                  <Lightbulb className="w-3 h-3" />
                  <span>Give Examples</span>
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5 font-sans">နမူနာ ဥပမာများ</p>
              </button>

              <button
                onClick={() => handleSendMessage(
                  "ကျွန်တော် ရေးသားထားသော ကုဒ်များတွင် တက်နေသော Error Message / Syntax Issue ကို စစ်ဆေးပေးပြီး အမှားဖြစ်ရသည့် အကြောင်းအရင်း (Root Cause) ကို မြန်မာလို ရှင်းပြကာ ပြင်ဆင်နည်း လမ်းညွှန်ပေးပါခင်ဗျာ။"
                )}
                className="p-2 bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/40 rounded-xl text-left transition-all group cursor-pointer col-span-2 sm:col-span-1"
                title="Help Understand Errors"
              >
                <div className="flex items-center space-x-1.5 text-rose-400 text-[11px] font-bold">
                  <Bug className="w-3 h-3" />
                  <span>Understand Errors</span>
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5 font-sans">အမှားများ ဆန်းစစ်ရန်</p>
              </button>
            </div>

            {/* Pedagogical Principle Notice */}
            <div className="text-[9.5px] text-slate-400/90 leading-tight px-1 flex items-center space-x-1 font-sans">
              <span className="text-purple-400 font-bold">💡 Mentor Rule:</span>
              <span>Kibo သည် သင်ယူမှုကို အစားထိုးခြင်း မပြုဘဲ လမ်းညွှန်ရှင်းပြကာ ကိုယ်တိုင် လက်တွေ့ရေးသား လေ့ကျင့်နိုင်ရန် ကူညီပေးပါသည်။</span>
            </div>
          </div>

          {/* CHAT SCROLL WINDOW */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scroll-smooth py-2">
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex items-start space-x-2 text-left ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                    {isPremiumUser ? (
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                  </div>
                )}
                
                <div className="max-w-[85%] flex flex-col space-y-1">
                  <div 
                    className={`rounded-2xl px-3.5 py-2.5 text-xs md:text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-500/10"
                        : "bg-slate-900/90 text-slate-200 border border-slate-800/80"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap font-sans break-words">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    )}
                  </div>

                  {/* Copy, edit, regenerate buttons under Kibo response */}
                  {msg.role === "assistant" && msg.content && (
                    <div className="flex items-center space-x-2 pl-1 pt-0.5 text-[10px] text-slate-500 font-mono">
                      <button
                        onClick={() => handleCopyText(msg.content, idx)}
                        className="flex items-center space-x-1 hover:text-slate-300 transition-colors py-0.5 px-1.5 bg-slate-900/40 rounded border border-slate-800/40 cursor-pointer"
                      >
                        {isCopiedMain === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-sans">ကူးယူပြီးပြီ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="font-sans">ကုဒ်ကူးယူမည်</span>
                          </>
                        )}
                      </button>

                      {idx === messages.length - 1 && idx > 0 && !isLoading && (
                        <button
                          onClick={handleRegenerateResponse}
                          className="flex items-center space-x-1 hover:text-slate-300 transition-colors py-0.5 px-1.5 bg-slate-900/40 rounded border border-slate-800/40 cursor-pointer font-sans"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>ထပ်မံအဖြေတောင်းမည်</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 font-bold font-mono text-[10px] mt-0.5">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
            ))}
            
            {/* Thinking / Typing Loader */}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-start space-x-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0 animate-spin">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-400 animate-pulse flex items-center space-x-1.5 font-sans">
                  <span>Kibo စဥ်းစားနေပါသည်...</span>
                  <span className="flex space-x-0.5">
                    <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* PREMIUM INTERACTIVE CONTROL RAIL (Only visible on non-embedded desktop) */}
          {!embeddedMode && (
            <div className="py-2.5 border-t border-slate-800/60 mt-2 flex-shrink-0 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-bold flex items-center space-x-1">
                  <Crown className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>Kibo Premium Assistants (အဆင့်မြင့် ဝန်ဆောင်မှုများ)</span>
                </span>
                {!isPremiumUser && (
                  <button 
                    onClick={handleBuyPremiumWithCoins}
                    className="text-[9px] text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-1 hover:underline"
                  >
                    <Coins className="w-2.5 h-2.5 text-amber-500" />
                    <span>၂၀၀ Coins ဖြင့် Premium ဝယ်ယူရန်</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handlePremiumPromptClick(
                    "Advanced Bug Audit",
                    "အောက်ပါကုဒ်တွင်ရှိသော Syntax နှင့် Logical error များကို အသေးစိတ်စစ်ဆေးပေးပြီး မြန်မာလို အမှားထောက်ပြပေးပါခင်ဗျာ။ \n\n```python\n# ဤနေရာတွင် ကုဒ်ထည့်ပါ\n```"
                  )}
                  className="p-2 bg-slate-900 border border-slate-800 hover:border-purple-500/30 rounded-xl text-left text-[11px] group transition-all"
                >
                  <div className="flex items-center space-x-1 text-slate-300 group-hover:text-purple-400 font-bold mb-0.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>🔍 Advanced Bug Audit</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">ကုဒ်မှားများကို အနုစိတ် လိုက်လံထောက်လှမ်းစစ်ဆေးပေးခြင်း။</span>
                </button>

                <button
                  onClick={() => handlePremiumPromptClick(
                    "Architecture Layout",
                    "ကျွန်တော် တည်ဆောက်မယ့် ပရောဂျက်တစ်ခုအတွက် လိုအပ်တဲ့ Folder Structure, Database Table architecture, API endpoint architecture များကို Myanmar Language ဖြင့် လမ်းညွှန်ပေးပါခင်ဗျာ။"
                  )}
                  className="p-2 bg-slate-900 border border-slate-800 hover:border-purple-500/30 rounded-xl text-left text-[11px] group transition-all"
                >
                  <div className="flex items-center space-x-1 text-slate-300 group-hover:text-purple-400 font-bold mb-0.5">
                    <Code2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>🏗️ Architecture Layout</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">Database, Folders နှင့် APIs များကို ကြိုတင်ဒီဇိုင်းဆွဲပေးခြင်း။</span>
                </button>

                <button
                  onClick={() => handlePremiumPromptClick(
                    "Run Code Optimizer",
                    "အောက်ပါ ကုဒ်လိုင်းများ ပိုမိုမြန်ဆန်ပြီး ရှင်းလင်းကျစ်လျစ်သွားအောင် Algorithm & Execution flow ပိုကောင်းအောင် Optimize လုပ်ပေးပါခင်ဗျာ။ \n\n```javascript\n# ဤနေရာတွင် ကုဒ်ထည့်ပါ\n```"
                  )}
                  className="p-2 bg-slate-900 border border-slate-800 hover:border-purple-500/30 rounded-xl text-left text-[11px] group transition-all"
                >
                  <div className="flex items-center space-x-1 text-slate-300 group-hover:text-purple-400 font-bold mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>⚡ Code Optimizer</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">ကုဒ်များ စွမ်းဆောင်ရည် ပိုမြန်၊ ပိုမိုကျစ်လျစ်သွားစေရန် ပြင်ဆင်ခြင်း။</span>
                </button>

                <button
                  onClick={() => handlePremiumPromptClick(
                    "Professional Review",
                    "အောက်ဖော်ပြပါ ကျွန်တော့်ရဲ့ ကုဒ်များကို Professional Systems စံနှုန်းများနှင့်အညီ Clean Code ဖြစ်မဖြစ် သုံးသပ်အကြံပြုပေးပါဗျာ။ \n\n```python\n# ဤနေရာတွင် ကုဒ်ထည့်ပါ\n```"
                  )}
                  className="p-2 bg-slate-900 border border-slate-800 hover:border-purple-500/30 rounded-xl text-left text-[11px] group transition-all"
                >
                  <div className="flex items-center space-x-1 text-slate-300 group-hover:text-purple-400 font-bold mb-0.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>🚀 Professional Review</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">စံချိန်မီ သေသပ်သော ကမ္ဘာ့အဆင့်မီ Clean Code ရေးထုံးများ စစ်ဆေးပေးခြင်း။</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick suggestions for starting conversation */}
          {messages.length === 1 && !isLoading && (
            <div className="py-2.5 space-y-1.5 flex-shrink-0 text-left">
              <span className="text-[9px] text-slate-500 font-mono uppercase font-bold flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                <span>နမူနာ မေးခွန်းများ</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSendMessage(sug)}
                    className="text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl transition-all text-left shadow-sm cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TEXT INPUT CONTROLS BLOCK */}
          <div className="flex-shrink-0 mt-2 space-y-1">
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-2 flex items-end space-x-2 shadow-inner">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                placeholder={
                  currentLesson 
                    ? `"${currentLesson.title}" နှင့်ပတ်သက်၍ မေးမြန်းရန်... (Shift+Enter to newline)`
                    : "Kibo virtual mentor ထံ ပရိုဂရမ်မင်း မေးခွန်းများ မြန်မာလို မေးမြန်းရန်..."
                }
                disabled={isLoading}
                className="flex-1 bg-transparent px-2.5 py-1.5 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 resize-none max-h-[180px] overflow-y-auto leading-relaxed"
                maxLength={16000}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all transform active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/10 flex-shrink-0 self-end"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Length Indicator & Quick Info */}
            <div className="flex items-center justify-between px-2 text-[9px] text-slate-500 font-mono">
              <span className="font-sans">Shift + Enter ဖြင့် စာကြောင်းသစ် ဆင်းနိုင်သည်။</span>
              <span className={inputValue.length > 14000 ? "text-amber-500" : "text-slate-500"}>
                {inputValue.length.toLocaleString()} / 16,000 characters
              </span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
