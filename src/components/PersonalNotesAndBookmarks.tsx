/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Bookmark, 
  BookMarked, 
  Trash2, 
  ArrowRight, 
  Search, 
  Plus, 
  Pin, 
  Edit3, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Copy, 
  Check, 
  Play, 
  Printer, 
  Download, 
  Eye, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  Code, 
  Link as LinkIcon, 
  AlertTriangle,
  Lock,
  Compass,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  increment, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { offlineSyncManager } from "../lib/offlineSyncManager";
import { PersonalNote, SavedCodeSnippet } from "../types";
import { ExtendedUserProfile, RichBookmark } from "../utils/progress";
import { motion, AnimatePresence } from "motion/react";
import { EmptyState } from "./EmptyState";

interface PersonalNotesAndBookmarksProps {
  user: ExtendedUserProfile;
  allBookmarks: RichBookmark[];
  filteredBookmarks: RichBookmark[];
  bookmarkCategory: "all" | "lesson" | "project" | "article";
  setBookmarkCategory: (cat: "all" | "lesson" | "project" | "article") => void;
  bookmarkSearch: string;
  setBookmarkSearch: (val: string) => void;
  handleRemoveBookmark: (id: string) => void;
  setSelectedCourse: (course: any, lessonIndex: number) => void;
  setCurrentTab: (tab: string) => void;
  COURSES: any[];
}

export const PersonalNotesAndBookmarks: React.FC<PersonalNotesAndBookmarksProps> = ({
  user,
  allBookmarks,
  filteredBookmarks,
  bookmarkCategory,
  setBookmarkCategory,
  bookmarkSearch,
  setBookmarkSearch,
  handleRemoveBookmark,
  setSelectedCourse,
  setCurrentTab,
  COURSES
}) => {
  // Navigation tabs: bookmarks, notes, snippets
  const [activeTab, setActiveTab] = useState<"bookmarks" | "notes" | "snippets">("notes");

  // Premium State Evaluation
  const isPremiumUser = user.role === "premium" || user.role === "teacher" || user.role === "admin" || (user as any).isPremium === true;

  // --- NOTES STATE ---
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [noteSearch, setNoteSearch] = useState("");
  const [noteCategoryFilter, setNoteCategoryFilter] = useState<string>("all");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [isNoteOffline, setIsNoteOffline] = useState(false);

  // Note editor form
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentEditingNote, setCurrentEditingNote] = useState<PersonalNote | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState<PersonalNote["category"]>("General");
  const [noteTagsText, setNoteTagsText] = useState("");
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const noteContentRef = useRef<HTMLTextAreaElement>(null);

  // --- SNIPPETS STATE ---
  const [snippets, setSnippets] = useState<SavedCodeSnippet[]>([]);
  const [snippetSearch, setSnippetSearch] = useState("");
  const [snippetLangFilter, setSnippetLangFilter] = useState<string>("all");
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [isSnippetOffline, setIsSnippetOffline] = useState(false);

  // Snippet editor form
  const [isEditingSnippet, setIsEditingSnippet] = useState(false);
  const [currentEditingSnippet, setCurrentEditingSnippet] = useState<SavedCodeSnippet | null>(null);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetDescription, setSnippetDescription] = useState("");
  const [snippetCode, setSnippetCode] = useState("");
  const [snippetLanguage, setSnippetLanguage] = useState("JavaScript");

  // Code copy state helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sandboxed python execution state
  const [executingSnippetId, setExecutingSnippetId] = useState<string | null>(null);
  const [executionOutput, setExecutionOutput] = useState<{ success: boolean; output: string; error: string; myanmar?: string } | null>(null);

  // --- KIBO AI ASSISTANT STATE ---
  const [aiNoteId, setAiNoteId] = useState<string | null>(null);
  const [aiPromptType, setAiPromptType] = useState<"summarize" | "explain" | "improve" | "translate" | "questions" | null>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Load notes and snippets on mount
  useEffect(() => {
    fetchNotesFromCloud();
    fetchSnippetsFromCloud();
  }, [user.uid]);

  // Sync / Increment Platform Statistics Helper
  const syncPlatformStat = async (statField: "totalNotesCount" | "totalSnippetsCount", incrementValue: number) => {
    try {
      const statRef = doc(db, "platform_stats", "global");
      await setDoc(statRef, {
        [statField]: increment(incrementValue)
      }, { merge: true });
    } catch (e) {
      console.warn("Failed to synchronize aggregate platform stats:", e);
    }
  };

  // --- FETCH NOTES ---
  const fetchNotesFromCloud = async () => {
    setLoadingNotes(true);
    try {
      const qNotes = query(collection(db, "personal_notes"), where("uid", "==", user.uid));
      const snap = await getDocs(qNotes);
      const fetched = snap.docs.map(doc => doc.data() as PersonalNote);
      
      // Sort notes: pinned first, then by date descending
      fetched.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      setNotes(fetched);
      localStorage.setItem(`clm_notes_${user.uid}`, JSON.stringify(fetched));
      setIsNoteOffline(false);
    } catch (err) {
      console.warn("Operating offline: loading notes from LocalStorage.", err);
      setIsNoteOffline(true);
      const cached = localStorage.getItem(`clm_notes_${user.uid}`);
      if (cached) {
        setNotes(JSON.parse(cached));
      }
    } finally {
      setLoadingNotes(false);
    }
  };

  // --- FETCH SNIPPETS ---
  const fetchSnippetsFromCloud = async () => {
    setLoadingSnippets(true);
    try {
      const qSnippets = query(collection(db, "saved_snippets"), where("uid", "==", user.uid));
      const snap = await getDocs(qSnippets);
      const fetched = snap.docs.map(doc => doc.data() as SavedCodeSnippet);
      
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setSnippets(fetched);
      localStorage.setItem(`clm_snippets_${user.uid}`, JSON.stringify(fetched));
      setIsSnippetOffline(false);
    } catch (err) {
      console.warn("Operating offline: loading snippets from LocalStorage.", err);
      setIsSnippetOffline(true);
      const cached = localStorage.getItem(`clm_snippets_${user.uid}`);
      if (cached) {
        setSnippets(JSON.parse(cached));
      }
    } finally {
      setLoadingSnippets(false);
    }
  };

  // --- SAVE / EDIT NOTE ---
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    // Check plan limits for free users
    if (!isPremiumUser && notes.length >= 5 && !currentEditingNote) {
      alert("လက်ရှိတွင် Free Tier (အခြေခံဗားရှင်း) ဖြစ်သောကြောင့် မှတ်စု အများဆုံး ၅ ခုသာ ရေးသားသိမ်းဆည်းနိုင်ပါသည်ခင်ဗျာ။ Unlimited အသုံးပြုရန် Premium သို့ အဆင့်မြှင့်တင်ပေးပါဦး။");
      return;
    }

    const noteId = currentEditingNote?.id || `note-${Date.now()}`;
    const now = new Date().toISOString();
    const tags = noteTagsText.split(",").map(t => t.trim()).filter(t => t.length > 0);

    const newNote: PersonalNote = {
      id: noteId,
      uid: user.uid,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category: noteCategory,
      isPinned: currentEditingNote?.isPinned || false,
      tags: tags,
      createdAt: currentEditingNote?.createdAt || now,
      updatedAt: now
    };

    // Optimistic state update
    const updatedNotes = currentEditingNote 
      ? notes.map(n => n.id === noteId ? newNote : n)
      : [newNote, ...notes];

    // Re-sort notes
    updatedNotes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    setNotes(updatedNotes);
    localStorage.setItem(`clm_notes_${user.uid}`, JSON.stringify(updatedNotes));

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      offlineSyncManager.enqueue("SAVE_PERSONAL_NOTE", newNote, `မှတ်စု (${newNote.title})`);
      setIsNoteOffline(true);
    } else {
      try {
        await setDoc(doc(db, "personal_notes", noteId), newNote);
        if (!currentEditingNote) {
          // Increment aggregate statistics in background
          syncPlatformStat("totalNotesCount", 1);
        }
        setIsNoteOffline(false);
      } catch (err) {
        console.warn("Failed to write to firestore. Enqueued for offline sync.", err);
        offlineSyncManager.enqueue("SAVE_PERSONAL_NOTE", newNote, `မှတ်စု (${newNote.title})`);
        setIsNoteOffline(true);
      }
    }

    // Reset Form
    setIsEditingNote(false);
    setCurrentEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("General");
    setNoteTagsText("");
    setEditorMode("write");
  };

  // --- DELETE NOTE ---
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("ဤမှတ်စုကို ဖျက်ပစ်ရန် သေချာပါသလားခင်ဗျာ။")) return;

    const filtered = notes.filter(n => n.id !== noteId);
    setNotes(filtered);
    localStorage.setItem(`clm_notes_${user.uid}`, JSON.stringify(filtered));

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      offlineSyncManager.enqueue("DELETE_PERSONAL_NOTE", { id: noteId }, `မှတ်စု ဖျက်သိမ်းမှု`);
      setIsNoteOffline(true);
    } else {
      try {
        await deleteDoc(doc(db, "personal_notes", noteId));
        syncPlatformStat("totalNotesCount", -1);
        setIsNoteOffline(false);
      } catch (err) {
        console.warn("Failed to delete note in cloud. Enqueued for sync.", err);
        offlineSyncManager.enqueue("DELETE_PERSONAL_NOTE", { id: noteId }, `မှတ်စု ဖျက်သိမ်းမှု`);
        setIsNoteOffline(true);
      }
    }

    if (aiNoteId === noteId) {
      setAiNoteId(null);
      setAiResponse("");
    }
  };

  // --- PIN / UNPIN NOTE ---
  const handleTogglePinNote = async (note: PersonalNote) => {
    const updatedNote = { ...note, isPinned: !note.isPinned };
    const updatedNotes = notes.map(n => n.id === note.id ? updatedNote : n);
    
    // Sort
    updatedNotes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    setNotes(updatedNotes);
    localStorage.setItem(`clm_notes_${user.uid}`, JSON.stringify(updatedNotes));

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      offlineSyncManager.enqueue("SAVE_PERSONAL_NOTE", updatedNote, `မှတ်စု စာညှပ် ပြောင်းလဲမှု`);
      setIsNoteOffline(true);
    } else {
      try {
        await updateDoc(doc(db, "personal_notes", note.id), { isPinned: updatedNote.isPinned });
        setIsNoteOffline(false);
      } catch (err) {
        console.warn("Failed to update pin state in cloud. Enqueued for sync.", err);
        offlineSyncManager.enqueue("SAVE_PERSONAL_NOTE", updatedNote, `မှတ်စု စာညှပ် ပြောင်းလဲမှု`);
        setIsNoteOffline(true);
      }
    }
  };

  // --- SAVE / EDIT CODE SNIPPET ---
  const handleSaveSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetTitle.trim() || !snippetCode.trim()) return;

    // Check plan limits for free users
    if (!isPremiumUser && snippets.length >= 3 && !currentEditingSnippet) {
      alert("လက်ရှိတွင် Free Tier (အခြေခံဗားရှင်း) ဖြစ်သောကြောင့် ကုဒ်မှတ်စု အများဆုံး ၃ ခုသာ သိမ်းဆည်းနိုင်ပါသည်ခင်ဗျာ။ Unlimited အသုံးပြုရန် Premium သို့ အဆင့်မြှင့်တင်ပေးပါဦး။");
      return;
    }

    const snippetId = currentEditingSnippet?.id || `snip-${Date.now()}`;
    const now = new Date().toISOString();

    const newSnippet: SavedCodeSnippet = {
      id: snippetId,
      uid: user.uid,
      title: snippetTitle.trim(),
      description: snippetDescription.trim() || undefined,
      code: snippetCode.trim(),
      language: snippetLanguage,
      createdAt: currentEditingSnippet?.createdAt || now
    };

    const updatedSnippets = currentEditingSnippet
      ? snippets.map(s => s.id === snippetId ? newSnippet : s)
      : [newSnippet, ...snippets];

    updatedSnippets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setSnippets(updatedSnippets);
    localStorage.setItem(`clm_snippets_${user.uid}`, JSON.stringify(updatedSnippets));

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      offlineSyncManager.enqueue("SAVE_SNIPPET", newSnippet, `ကုဒ်မှတ်စု (${newSnippet.title})`);
      setIsSnippetOffline(true);
    } else {
      try {
        await setDoc(doc(db, "saved_snippets", snippetId), newSnippet);
        if (!currentEditingSnippet) {
          syncPlatformStat("totalSnippetsCount", 1);
        }
        setIsSnippetOffline(false);
      } catch (err) {
        console.warn("Failed to write snippet to cloud. Enqueued for sync.", err);
        offlineSyncManager.enqueue("SAVE_SNIPPET", newSnippet, `ကုဒ်မှတ်စု (${newSnippet.title})`);
        setIsSnippetOffline(true);
      }
    }

    setIsEditingSnippet(false);
    setCurrentEditingSnippet(null);
    setSnippetTitle("");
    setSnippetDescription("");
    setSnippetCode("");
    setSnippetLanguage("JavaScript");
  };

  // --- DELETE SNIPPET ---
  const handleDeleteSnippet = async (snippetId: string) => {
    if (!confirm("ဤကုဒ်မှတ်စုကို ဖျက်ပစ်ရန် သေချာပါသလားခင်ဗျာ။")) return;

    const filtered = snippets.filter(s => s.id !== snippetId);
    setSnippets(filtered);
    localStorage.setItem(`clm_snippets_${user.uid}`, JSON.stringify(filtered));

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      offlineSyncManager.enqueue("DELETE_PERSONAL_NOTE", { id: snippetId }, `ကုဒ်မှတ်စု ဖျက်သိမ်းမှု`);
      setIsSnippetOffline(true);
    } else {
      try {
        await deleteDoc(doc(db, "saved_snippets", snippetId));
        syncPlatformStat("totalSnippetsCount", -1);
        setIsSnippetOffline(false);
      } catch (err) {
        console.warn("Failed to delete snippet in cloud. Deleted locally.", err);
        setIsSnippetOffline(true);
      }
    }
  };

  // --- RUN PYTHON CODE (SANDBOX) ---
  const handleRunPython = async (snippet: SavedCodeSnippet) => {
    if (snippet.language.toLowerCase() !== "python") return;

    setExecutingSnippetId(snippet.id);
    setExecutionOutput(null);

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "python", code: snippet.code })
      });
      const data = await response.json();
      setExecutionOutput(data);
    } catch (e) {
      setExecutionOutput({
        success: false,
        output: "",
        error: "Server connectivity error. Unable to execute Python code in sandbox."
      });
    }
  };

  // --- COPY TO CLIPBOARD ---
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- EXPORT NOTE ---
  const handleExportNote = (note: PersonalNote, format: "pdf" | "md" | "txt") => {
    if (format === "pdf") {
      // Elegant native printable HTML window that renders a gorgeous document preview for PDF saving
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const htmlContent = `
        <html>
          <head>
            <title>${note.title} - CLM Study Notes</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .title {
                font-size: 28px;
                font-weight: bold;
                color: #0f172a;
                margin: 0 0 10px 0;
              }
              .meta {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .content {
                font-size: 15px;
                white-space: pre-wrap;
              }
              .footer {
                margin-top: 50px;
                border-top: 1px solid #e2e8f0;
                padding-top: 15px;
                font-size: 11px;
                color: #94a3b8;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="meta">${note.category} | Created: ${new Date(note.createdAt).toLocaleDateString()}</div>
              <h1 class="title">${note.title}</h1>
            </div>
            <div class="content">${note.content}</div>
            <div class="footer">
              Generated by Code Learn Myanmar AI Study Hub. Keep Coding, Keep Growing!
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    } else {
      const extension = format === "md" ? "md" : "txt";
      const mime = format === "md" ? "text/markdown" : "text/plain";
      
      const fileContent = format === "md" 
        ? `# ${note.title}\n\n**Category**: ${note.category}\n**Created**: ${new Date(note.createdAt).toLocaleString()}\n\n---\n\n${note.content}`
        : `Title: ${note.title}\nCategory: ${note.category}\nCreated: ${new Date(note.createdAt).toLocaleString()}\n\n---\n\n${note.content}`;

      const blob = new Blob([fileContent], { type: `${mime};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${note.title.replace(/\s+/g, '_')}_notes.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // --- KIBO AI ASSISTANT ---
  const handleKiboAIAssist = async (note: PersonalNote, promptType: typeof aiPromptType) => {
    if (!isPremiumUser) {
      alert("Kibo AI Advanced Note Assistant features are exclusive to Premium Users. Upgrade now to unlock automated summaries, translations, concept explanations, and custom practice exams!");
      return;
    }

    setAiNoteId(note.id);
    setAiPromptType(promptType);
    setAiResponse("");
    setAiLoading(true);

    let promptInstructions = "";
    if (promptType === "summarize") {
      promptInstructions = "စကားလုံးအနည်းငယ်ဖြင့် ဖော်ပြပါမှတ်စုကို အဓိကအချက်များအဖြစ် အကျဉ်းချုပ်ပေးပါ။ Bullet points လှလှလေးများဖြင့် ဖော်ပြပေးပါ။";
    } else if (promptType === "explain") {
      promptInstructions = "မှတ်စုပါ နည်းပညာပိုင်းဆိုင်ရာ သဘောတရားများကို မြန်မာနိုင်ငံသားကျောင်းသားတစ်ဦးအတွက် နားလည်လွယ်သော နေ့စဉ်လူနေမှုဘဝ ဥပမာ (Myanmar Analogy) များဖြင့် မြန်မာလို အသေးစိတ် ရှင်းပြပေးပါ။ ဥပမာအားဖြင့် application design များကို အုန်းစိမ်းရည်ဆိုင် သို့မဟုတ် လက်ဖက်ရည်ဆိုင်နှင့် နှိုင်းယှဉ်ရှင်းပြသကဲ့သို့ ဖတ်ရသည်မှာ သက်တောင့်သက်သာရှိပါစေဗျာ။";
    } else if (promptType === "improve") {
      promptInstructions = "ဤမှတ်စုကို ပိုမိုဖတ်ရလွယ်ကူပြီး စနစ်တကျရှိစေရန် Markdown formatting (bold, bullet lists, code blocks) များ စနစ်တကျ သုံးစွဲပြီး အသစ်ပြန်လည် ရေးသားပေးပါ။";
    } else if (promptType === "translate") {
      promptInstructions = "မှတ်စုပါ အင်္ဂလိပ်စာကြောင်းများနှင့် နည်းပညာကုဒ်သဘောတရားများကို လှပသပ်ရပ်ပြီး ဖတ်ရလွယ်ကူသော မြန်မာဘာသာသို့ တိကျစွာ ပြန်ဆိုပေးပါ။";
    } else if (promptType === "questions") {
      promptInstructions = "ဤမှတ်စု၏ သင်ယူမှုအကြောင်းအရာကို အခြေခံ၍ ကျောင်းသား ကိုယ်တိုင်ဖြေဆိုရန် ရွေးချယ်စရာ ၄ ခုပါဝင်သော Multiple-Choice Question (MCQ) မေးခွန်း ၃ ခုကို (မြန်မာလို မေးခွန်း၊ ရွေးချယ်စရာများနှင့် မှန်ကန်သောအဖြေ ရှင်းလင်းချက်) ထုတ်ပေးပါ။";
    }

    try {
      const messages = [
        {
          role: "user",
          content: `Please analyze the following personal study note and assist the student.\n\nNote Title: "${note.title}"\nNote Category: "${note.category}"\nNote Content:\n"""\n${note.content}\n"""\n\nInstructions:\n${promptInstructions}\n\nWrite in an extremely encouraging, friendly virtual programming mentor voice, and explain clearly in beautiful Unicode Myanmar language. Keep coding keywords in English. Always end with a warm Myanmar signature.`
        }
      ];

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, userProfile: user })
      });
      const data = await response.json();
      
      if (data.text) {
        setAiResponse(data.text);
      } else {
        setAiResponse("တောင်းပန်ပါတယ်ခင်ဗျာ။ Kibo AI တွက်ချက်မှု အဆင်မပြေဖြစ်သွားလို့ နောက်တစ်ကြိမ် ပြန်လည်နှိပ်ပေးပါဦး။");
      }
    } catch (err) {
      console.error(err);
      setAiResponse("Kibo AI ဆာဗာနှင့် ဆက်သွယ်မှု အဆင်မပြေပါ။ အင်တာနက်လိုင်း စစ်ဆေးပေးပါခင်ဗျာ။");
    } finally {
      setAiLoading(false);
    }
  };

  // --- SAVE AI RESPONSE TO NOTE ---
  const handleSaveAIResponseToNote = async (note: PersonalNote, action: "append" | "replace") => {
    if (!aiResponse) return;

    const updatedContent = action === "append"
      ? `${note.content}\n\n### 🤖 Kibo AI Assistant Response:\n${aiResponse}`
      : `### 🤖 Kibo AI Assistant Response:\n${aiResponse}`;

    const updatedNote = { ...note, content: updatedContent, updatedAt: new Date().toISOString() };
    const updatedNotes = notes.map(n => n.id === note.id ? updatedNote : n);

    setNotes(updatedNotes);
    localStorage.setItem(`clm_notes_${user.uid}`, JSON.stringify(updatedNotes));

    try {
      await updateDoc(doc(db, "personal_notes", note.id), {
        content: updatedContent,
        updatedAt: updatedNote.updatedAt
      });
      setIsNoteOffline(false);
      alert("Kibo AI ၏ ရလဒ်ကို သင်၏ မှတ်စုထဲတွင် အောင်မြင်စွာ သိမ်းဆည်းလိုက်ပါပြီဗျာ!");
      setAiNoteId(null);
      setAiResponse("");
    } catch (e) {
      console.warn(e);
      setIsNoteOffline(true);
      alert("ဒေသတွင်းတွင် သိမ်းဆည်းလိုက်ပါသည်။ ကလောက်ဆာဗာချိတ်ဆက်ရန် လိုအပ်နေပါသေးသည်။");
    }
  };

  // --- IN-EDITOR MARKDOWN TOOLS ---
  const insertMarkdownText = (tagOpen: string, tagClose: string) => {
    const txtArea = noteContentRef.current;
    if (!txtArea) return;

    const start = txtArea.selectionStart;
    const end = txtArea.selectionEnd;
    const text = txtArea.value;
    const selected = text.substring(start, end);

    const replacement = tagOpen + selected + tagClose;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setNoteContent(newContent);

    // Reposition cursor
    setTimeout(() => {
      txtArea.focus();
      txtArea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selected.length);
    }, 0);
  };

  // --- MARKDOWN-TO-HTML PARSER ---
  const parseMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return "";
    let html = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks: ```js ... ```
    html = html.replace(/```([\s\S]*?)```/g, (match, p1) => {
      return `<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-3 border border-slate-800">${p1.trim()}</pre>`;
    });

    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-rose-500 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200 dark:border-slate-700">$1</code>');

    // Headings: # Heading
    html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-xl font-bold font-display text-slate-900 dark:text-white mt-4 mb-2">$1</h1>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-lg font-bold font-display text-slate-900 dark:text-white mt-3 mb-1.5">$1</h2>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-base font-bold font-display text-slate-900 dark:text-white mt-2 mb-1">$1</h3>');

    // Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');

    // Italic: *text*
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-800 dark:text-slate-200">$1</em>');

    // Bullet lists: - item
    html = html.replace(/^\s*-\s+(.+)$/gm, '<li class="list-disc ml-5 my-1 text-slate-700 dark:text-slate-300">$1</li>');

    // Numbered lists: 1. item
    html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="list-decimal ml-5 my-1 text-slate-700 dark:text-slate-300">$1</li>');

    // Paragraphs
    html = html.replace(/^(?!<h|<pre|<li|<code|<ul|<ol)(.+)$/gm, '<p class="my-2 leading-relaxed text-slate-700 dark:text-slate-300 text-sm">$1</p>');

    return html;
  };

  // --- FILTERS & SEARCH PROCESSING ---
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(noteSearch.toLowerCase()) || 
                          note.content.toLowerCase().includes(noteSearch.toLowerCase()) ||
                          (note.tags || []).some(t => t.toLowerCase().includes(noteSearch.toLowerCase()));
    const matchesCategory = noteCategoryFilter === "all" || note.category === noteCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(snippetSearch.toLowerCase()) || 
                          (snippet.description || "").toLowerCase().includes(snippetSearch.toLowerCase()) ||
                          snippet.code.toLowerCase().includes(snippetSearch.toLowerCase());
    const matchesLang = snippetLangFilter === "all" || snippet.language.toLowerCase() === snippetLangFilter.toLowerCase();
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Tab Selector Header */}
      <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "notes" 
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow" 
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ကျောင်းသားကိုယ်ပိုင်မှတ်စုများ ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("snippets")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "snippets" 
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow" 
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Code className="w-4 h-4" />
          <span>သိမ်းဆည်းထားသော ကုဒ်များ ({snippets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "bookmarks" 
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow" 
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>သိမ်းဆည်းထားသော သင်ခန်းစာများ ({allBookmarks.length})</span>
        </button>
      </div>

      {/* Free Tier Limitation friendly notification header */}
      {!isPremiumUser && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-amber-100 text-sm">Free Tier (အခြေခံဗားရှင်း) ကန့်သတ်ချက်များ</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                လက်ရှိတွင် အခြေခံအကောင့်အသုံးပြုထား၍ ကိုယ်ပိုင်မှတ်စု ၅ ခုနှင့် ကုဒ်မှတ်စု ၃ ခုအထိသာ သိမ်းဆည်းခွင့်ရှိပါသည်။ Kibo Premium ကို unlocking လုပ်ပြီး အကန့်အသတ်မရှိ သိမ်းဆည်းမှုနှင့် Kibo AI ၏ အထူးအကူအညီများကို ရယူနိုင်ပါသည်!
              </p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentTab("profile")}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <span>👑 Gold Coins ဖြင့် Premium ရယူရန်</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==================== 1. BOOKMARKS TAB ==================== */}
      {activeTab === "bookmarks" && (
        <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <BookMarked className="w-6 h-6 text-blue-500" />
                <span>သိမ်းဆည်းထားသော အမှတ်တရသင်ခန်းစာများ ({filteredBookmarks.length})</span>
              </h3>
              <p className="text-xs text-slate-400">သင်ခန်းစာများ၊ စိန်ခေါ်မှုများနှင့် ပရောဂျက်များကို တစ်နေရာတည်းတွင် အချိန်မရွေး ပြန်လည်လေ့လာနိုင်ပါသည်။</p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <select
                value={bookmarkCategory}
                onChange={(e) => setBookmarkCategory(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">အမျိုးအစားအားလုံး</option>
                <option value="lesson">သင်ခန်းစာများ</option>
                <option value="project">ပရောဂျက်များ</option>
                <option value="article">ဆောင်းပါးများ</option>
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="ခေါင်းစဉ်ဖြင့် ရှာဖွေပါ..."
                  value={bookmarkSearch}
                  onChange={(e) => setBookmarkSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map((item) => (
                <div 
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.date}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 hover:text-blue-500 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      ဘွတ်မတ်ခ် ID: {item.id}။ Cloud synchronizing synchronization.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/70">
                    <button
                      onClick={() => handleRemoveBookmark(item.id)}
                      className="text-xs text-rose-500 hover:text-rose-400 font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ဖယ်ရှားရန်</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        for (const c of COURSES) {
                          const lesIdx = c.lessons.findIndex((l: any) => l.id === item.id);
                          if (lesIdx >= 0) {
                            setSelectedCourse(c, lesIdx);
                            return;
                          }
                        }
                        if (item.category === "project") {
                          setCurrentTab("projects");
                        } else if (item.category === "article") {
                          setCurrentTab("blog");
                        } else {
                          setCurrentTab("courses");
                        }
                      }}
                      className="text-xs text-blue-500 hover:text-blue-400 font-bold flex items-center space-x-0.5 cursor-pointer"
                    >
                      <span>လေ့လာရန်သွားမည်</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              variant={bookmarkSearch.trim() !== "" ? "no_search_results" : "no_bookmarks"}
              title={bookmarkSearch.trim() !== "" ? "No bookmarks matched search" : "No bookmarks saved yet"}
              titleMm={bookmarkSearch.trim() !== "" ? "ရှာဖွေမှုနှင့် ကိုက်ညီသော Bookmark မရှိပါ" : "သိမ်းဆည်းထားသော အမှတ်တရမှတ်စုများ မရှိသေးပါ"}
              description={bookmarkSearch.trim() !== "" ? "Try searching for different keywords or reset category filters." : "Click the bookmark icon on any lesson or project to quickly access it later."}
              descriptionMm={bookmarkSearch.trim() !== "" ? "ရှာဖွေသော စာလုံး သို့မဟုတ် Category နှင့် ကိုက်ညီသည့် အမှတ်အသား မတွေ့ပါ။" : "သင်ခန်းစာများ၊ ပရောဂျက်များ ဖတ်ရှုနေစဉ် Bookmark အိုင်ကွန်လေးကို နှိပ်ပြီး အချိန်မရွေး ပြန်လည်ကြည့်ရှုနိုင်ရန် သိမ်းဆည်းထားနိုင်ပါသည်။"}
              primaryAction={bookmarkSearch.trim() !== "" ? {
                label: "Clear Search",
                labelMm: "ရှာဖွေမှုကို ရှင်းလင်းမည်",
                onClick: () => {
                  setBookmarkSearch("");
                  setBookmarkCategory("all");
                }
              } : {
                label: "Browse Lessons",
                labelMm: "သင်ခန်းစာများ ကြည့်မည်",
                onClick: () => setCurrentTab("courses")
              }}
            />
          )}
        </section>
      )}

      {/* ==================== 2. NOTES TAB ==================== */}
      {activeTab === "notes" && (
        <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
          {/* Note Form or Note Grid UI */}
          {!isEditingNote ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-500" />
                    <span>ကျောင်းသားကိုယ်ပိုင်မှတ်စုများ ({filteredNotes.length})</span>
                    {isNoteOffline && <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md font-sans">Offline Fallback Mode</span>}
                  </h3>
                  <p className="text-xs text-slate-400">သင်ခန်းစာသစ်များလေ့လာနေစဉ် ကိုယ်ပိုင်အဓိကအချက်အလက်များ၊ သဘောတရားများကို မှတ်တမ်းတင်သိမ်းဆည်းထားပါ။</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (!isPremiumUser && notes.length >= 5) {
                        alert("လက်ရှိတွင် Free Tier (အခြေခံဗားရှင်း) ဖြစ်သောကြောင့် မှတ်စု အများဆုံး ၅ ခုသာ ရေးသားသိမ်းဆည်းနိုင်ပါသည်ခင်ဗျာ။ Unlimited အသုံးပြုရန် Premium သို့ အဆင့်မြှင့်တင်ပေးပါဦး။");
                        return;
                      }
                      setCurrentEditingNote(null);
                      setNoteTitle("");
                      setNoteContent("");
                      setNoteCategory("General");
                      setNoteTagsText("");
                      setIsEditingNote(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>မှတ်စုအသစ်ရေးမည်</span>
                  </button>

                  <select
                    value={noteCategoryFilter}
                    onChange={(e) => setNoteCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="all">အမျိုးအစားအားလုံး</option>
                    <option value="Lesson">Lessons</option>
                    <option value="Module">Modules</option>
                    <option value="Course">Courses</option>
                    <option value="Project">Projects</option>
                    <option value="Assignment">Assignments</option>
                    <option value="Quiz">Quizzes</option>
                    <option value="General">General</option>
                  </select>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="မှတ်စု / Tags ရှာရန်..."
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {loadingNotes ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-400">ကိုယ်ပိုင်မှတ်စုများ ရယူနေပါသည်၊ ခဏစောင့်ပါ...</p>
                </div>
              ) : filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNotes.map((note) => (
                    <div 
                      key={note.id}
                      className={`border rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/30 ${
                        note.isPinned 
                          ? "border-amber-400/50 dark:border-amber-500/40 bg-amber-50/10 dark:bg-amber-950/5" 
                          : "border-slate-150 dark:border-slate-850"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-mono font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                              {note.category}
                            </span>
                            {note.tags && note.tags.map((tag, i) => (
                              <span key={i} className="text-[9px] text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleTogglePinNote(note)}
                              className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer ${
                                note.isPinned ? "text-amber-500" : "text-slate-300 dark:text-slate-600"
                              }`}
                              title={note.isPinned ? "Unpin Note" : "Pin Note to Top"}
                            >
                              <Pin className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">
                            {note.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Last update: {new Date(note.updatedAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Rendering styled note content snippet */}
                        <div 
                          className="text-xs text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed font-sans overflow-hidden border-t border-slate-100 dark:border-slate-800/80 pt-2 prose dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(note.content) }}
                        />
                      </div>

                      <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/70 pt-4 mt-2">
                        {/* Kibo AI Quick Assistant panel inside card for Premium Users */}
                        <div className="bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                              <span>Kibo AI မှတ်စုကူညီပေးသူ</span>
                            </span>
                            {!isPremiumUser && <Lock className="w-3 h-3 text-slate-400" />}
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => handleKiboAIAssist(note, "summarize")}
                              className="px-2 py-1 bg-white hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/20 text-[10px] text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-700 font-bold"
                            >
                              အကျဉ်းချုပ်
                            </button>
                            <button
                              onClick={() => handleKiboAIAssist(note, "explain")}
                              className="px-2 py-1 bg-white hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/20 text-[10px] text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-700 font-bold"
                            >
                              ဥပမာဖြင့်ရှင်းပြပါ
                            </button>
                            <button
                              onClick={() => handleKiboAIAssist(note, "translate")}
                              className="px-2 py-1 bg-white hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/20 text-[10px] text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-700 font-bold"
                            >
                              မြန်မာဘာသာပြန်
                            </button>
                            <button
                              onClick={() => handleKiboAIAssist(note, "questions")}
                              className="px-2 py-1 bg-white hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/20 text-[10px] text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-700 font-bold"
                            >
                              မေးခွန်းထုတ်ပါ
                            </button>
                          </div>

                          {/* Live AI Response Display inside note card */}
                          {aiNoteId === note.id && (
                            <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850 mt-2 text-xs space-y-2 max-h-60 overflow-y-auto">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                <span className="font-bold text-indigo-500 flex items-center gap-1 uppercase text-[9px] font-mono">
                                  <Sparkles className="w-3 h-3" />
                                  Kibo Response: {aiPromptType}
                                </span>
                                <button 
                                  onClick={() => { setAiNoteId(null); setAiResponse(""); }}
                                  className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  Close
                                </button>
                              </div>
                              
                              {aiLoading ? (
                                <div className="flex items-center gap-2 py-3">
                                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-slate-400 text-[10px] italic">Kibo AI မှ တွက်ချက်ဖန်တီးပေးနေပါသည်၊ ခဏစောင့်ပါ...</span>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs whitespace-pre-wrap">{aiResponse}</p>
                                  
                                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                                    <button
                                      onClick={() => handleSaveAIResponseToNote(note, "append")}
                                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] rounded-lg transition-all font-bold cursor-pointer"
                                    >
                                      မှတ်စုအောက်တွင် ထပ်ဖြည့်မည်
                                    </button>
                                    <button
                                      onClick={() => handleSaveAIResponseToNote(note, "replace")}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] rounded-lg transition-all font-bold cursor-pointer"
                                    >
                                      မှတ်စုကို အစားထိုးမည်
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Note Export & Standard Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-150 dark:border-slate-850/80">
                          <div className="flex items-center gap-1.5">
                            {/* Exports buttons */}
                            <button
                              onClick={() => handleExportNote(note, "txt")}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                              title="TXT ဖိုင်ဒေါင်းလုဒ်လုပ်ရန်"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExportNote(note, "md")}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-all cursor-pointer text-[10px] font-bold"
                              title="Markdown ဖိုင်ဒေါင်းလုဒ်လုပ်ရန်"
                            >
                              MD
                            </button>
                            <button
                              onClick={() => handleExportNote(note, "pdf")}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                              title="PDF အဖြစ် ပရင့်ထုတ်ရန်"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-xs text-rose-500 hover:text-rose-400 font-bold flex items-center space-x-1 cursor-pointer p-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ဖျက်မည်</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setCurrentEditingNote(note);
                                setNoteTitle(note.title);
                                setNoteContent(note.content);
                                setNoteCategory(note.category);
                                setNoteTagsText(note.tags ? note.tags.join(", ") : "");
                                setIsEditingNote(true);
                              }}
                              className="text-xs text-indigo-500 hover:text-indigo-400 font-bold flex items-center space-x-1 cursor-pointer p-1.5 bg-indigo-500/5 dark:bg-indigo-400/5 px-2.5 py-1.5 rounded-xl border border-indigo-500/10"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>ပြင်ဆင်မည်</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  variant={noteSearch.trim() !== "" ? "no_search_results" : "no_notes"}
                  title={noteSearch.trim() !== "" ? "No notes matching search" : "No personal notes yet"}
                  titleMm={noteSearch.trim() !== "" ? "ရှာဖွေမှုနှင့် ကိုက်ညီသော မှတ်စု မရှိပါ" : "ကိုယ်ပိုင်မှတ်စုများ မရှိသေးပါ"}
                  description={noteSearch.trim() !== "" ? "Try different search terms or clear your category filter." : "Write down your key learnings, takeaways, and code notes while studying."}
                  descriptionMm={noteSearch.trim() !== "" ? "ရှာဖွေသော စာလုံး သို့မဟုတ် Category နှင့် ကိုက်ညီသည့် မှတ်စု မတွေ့ပါ။" : "သင်ခန်းစာများ လေ့လာရင်း မှတ်သားထားလိုသော အချက်အလက်များနှင့် မှတ်စုများကို ရေးသားသိမ်းဆည်းနိုင်ပါသည်။"}
                  primaryAction={noteSearch.trim() !== "" ? {
                    label: "Clear Search",
                    labelMm: "ရှာဖွေမှုကို ရှင်းလင်းမည်",
                    onClick: () => {
                      setNoteSearch("");
                      setNoteCategoryFilter("all");
                    }
                  } : {
                    label: "Add First Note",
                    labelMm: "ပထမဆုံး မှတ်စုရေးမည်",
                    onClick: () => {
                      setCurrentEditingNote(null);
                      setNoteTitle("");
                      setNoteContent("");
                      setIsEditingNote(true);
                    }
                  }}
                />
              )}
            </div>
          ) : (
            /* NOTE WRITING / EDITING INTERFACE */
            <form onSubmit={handleSaveNote} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-indigo-500" />
                    <span>{currentEditingNote ? "ကိုယ်ပိုင်မှတ်စု ပြင်ဆင်ရန်" : "ကိုယ်ပိုင်မှတ်စု အသစ်ရေးသားရန်"}</span>
                  </h3>
                  <p className="text-xs text-slate-400">Markdown syntax ဖြင့် စာလုံးပုံစံများ ရေးသားပြင်ဆင်နိုင်ပါသည်။</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditorMode("write")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editorMode === "write" 
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    ကုဒ်/အသေးစိတ်
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editorMode === "preview" 
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 inline mr-1" />
                    Preview ပုံရိပ်
                  </button>
                </div>
              </div>

              {editorMode === "write" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">မှတ်စုခေါင်းစဉ်</label>
                      <input 
                        type="text" 
                        required
                        placeholder="ဥပမာ - HTML Variables and Boxes"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">အမျိုးအစား (Category)</label>
                      <select
                        value={noteCategory}
                        onChange={(e) => setNoteCategory(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white"
                      >
                        <option value="General">General</option>
                        <option value="Lesson">Lesson</option>
                        <option value="Module">Module</option>
                        <option value="Course">Course</option>
                        <option value="Project">Project</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Quiz">Quiz</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">မှတ်စုအသေးစိတ်အချက်အလက်များ</label>
                      
                      {/* Markdown Toolbar */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => insertMarkdownText("**", "**")}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                          title="Bold"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownText("*", "*")}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                          title="Italic"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownText("# ", "")}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                          title="H1 Heading"
                        >
                          <Heading1 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownText("## ", "")}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                          title="H2 Heading"
                        >
                          <Heading2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownText("- ", "")}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                          title="List"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownText("```\n", "\n```")}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                          title="Code Block"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownText("[", "](url)")}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                          title="Link"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      ref={noteContentRef}
                      required
                      rows={12}
                      placeholder="Markdown format သုံးပြီး မှတ်သားနိုင်ပါသည်။ ဥပမာ-
# Title
ဤသင်ခန်းစာသည်...
- Item 1
- Item 2
**အရေးကြီးသောအချက်**"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Tags (ကော်မာခြားပြီး ရေးပါ)</label>
                    <input 
                      type="text" 
                      placeholder="variables, basic, html, css"
                      value={noteTagsText}
                      onChange={(e) => setNoteTagsText(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                /* LIVE MARKDOWN PREVIEW */
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[300px]">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-[10px] uppercase font-mono font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-md">
                      {noteCategory}
                    </span>
                    <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-2">{noteTitle || "ခေါင်းစဉ်မရှိသေးပါ"}</h2>
                  </div>
                  
                  <div 
                    className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-700 dark:text-slate-300 pt-2"
                    dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(noteContent) || "<em>စာသားများ ရေးသားထားခြင်း မရှိသေးပါ</em>" }}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingNote(false);
                    setCurrentEditingNote(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* ==================== 3. CODE SNIPPETS TAB ==================== */}
      {activeTab === "snippets" && (
        <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
          {!isEditingSnippet ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Code className="w-6 h-6 text-pink-500" />
                    <span>သိမ်းဆည်းထားသော ကုဒ်များ ({filteredSnippets.length})</span>
                    {isSnippetOffline && <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md font-sans">Offline Fallback Mode</span>}
                  </h3>
                  <p className="text-xs text-slate-400">ကျောင်းသားအကောင့်တွင် ကုဒ်ပုံစံတိုများ၊ Algorithm များနှင့် သီးသန့် template များကို သိမ်းဆည်းပါ။</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (!isPremiumUser && snippets.length >= 3) {
                        alert("လက်ရှိတွင် Free Tier (အခြေခံဗားရှင်း) ဖြစ်သောကြောင့် ကုဒ်မှတ်စု အများဆုံး ၃ ခုသာ သိမ်းဆည်းနိုင်ပါသည်ခင်ဗျာ။ Unlimited အသုံးပြုရန် Premium သို့ အဆင့်မြှင့်တင်ပေးပါဦး။");
                        return;
                      }
                      setCurrentEditingSnippet(null);
                      setSnippetTitle("");
                      setSnippetDescription("");
                      setSnippetCode("");
                      setSnippetLanguage("JavaScript");
                      setIsEditingSnippet(true);
                    }}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ကုဒ်မှတ်စုအသစ်</span>
                  </button>

                  <select
                    value={snippetLangFilter}
                    onChange={(e) => setSnippetLangFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="all">အားလုံး</option>
                    <option value="HTML">HTML</option>
                    <option value="CSS">CSS</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="Kotlin">Kotlin</option>
                    <option value="Firebase">Firebase</option>
                  </select>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="ကုဒ် / ခေါင်းစဉ် ရှာရန်..."
                      value={snippetSearch}
                      onChange={(e) => setSnippetSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {loadingSnippets ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-400">သိမ်းဆည်းထားသော ကုဒ်များ ရယူနေပါသည်၊ ခဏစောင့်ပါ...</p>
                </div>
              ) : filteredSnippets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSnippets.map((snippet) => (
                    <div 
                      key={snippet.id}
                      className="border border-slate-150 dark:border-slate-800/80 rounded-2xl p-6 bg-slate-50/30 dark:bg-slate-900/10 flex flex-col justify-between space-y-4 hover:shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono font-bold text-pink-500 bg-pink-500/10 px-2.5 py-0.5 rounded-md">
                            {snippet.language}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyToClipboard(snippet.code, snippet.id)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer flex items-center gap-1"
                              title="Code Copy"
                            >
                              {copiedId === snippet.id ? (
                                <Check className="w-3.5 h-3.5 text-green-500 animate-bounce" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span className="text-[10px] font-sans">{copiedId === snippet.id ? "Copied" : "Copy"}</span>
                            </button>

                            {snippet.language.toLowerCase() === "python" && (
                              <button
                                onClick={() => handleRunPython(snippet)}
                                className="p-1.5 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg text-green-600 hover:text-green-500 transition-all cursor-pointer flex items-center gap-1 font-bold text-xs"
                                title="Run Python in Sandbox"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span className="text-[10px] font-sans">Run</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">
                            {snippet.title}
                          </h4>
                          {snippet.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {snippet.description}
                            </p>
                          )}
                        </div>

                        {/* Code Preview Frame */}
                        <div className="relative">
                          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-48 border border-slate-800">
                            {snippet.code}
                          </pre>
                        </div>

                        {/* Python Runtime Sandbox Output */}
                        {executingSnippetId === snippet.id && (
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                              <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                                <Play className="w-3 h-3 animate-ping" />
                                PYTHON SANDBOX PLAYGROUND OUTPUT:
                              </span>
                              <button 
                                onClick={() => { setExecutingSnippetId(null); setExecutionOutput(null); }}
                                className="text-[9px] text-slate-500 hover:text-slate-300"
                              >
                                Clear
                              </button>
                            </div>

                            {executionOutput ? (
                              <div className="space-y-2">
                                {executionOutput.success ? (
                                  <pre className="text-green-400 whitespace-pre-wrap">{executionOutput.output || "Completed successfully (No output returned)."}</pre>
                                ) : (
                                  <div className="space-y-1.5 text-rose-400">
                                    <pre className="whitespace-pre-wrap">{executionOutput.error || "Syntax or compilation failure."}</pre>
                                    {executionOutput.myanmar && (
                                      <p className="text-xs font-sans text-slate-300 bg-rose-950/20 p-2.5 rounded-lg border border-rose-800/20 mt-1 leading-relaxed">
                                        💡 {executionOutput.myanmar}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 py-1 text-slate-500">
                                <div className="w-3.5 h-3.5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] italic">Executing code safely in sandbox container...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-150 dark:border-slate-850/80 mt-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Saved: {new Date(snippet.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDeleteSnippet(snippet.id)}
                            className="text-xs text-rose-500 hover:text-rose-400 font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ဖျက်မည်</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setCurrentEditingSnippet(snippet);
                              setSnippetTitle(snippet.title);
                              setSnippetDescription(snippet.description || "");
                              setSnippetCode(snippet.code);
                              setSnippetLanguage(snippet.language);
                              setIsEditingSnippet(true);
                            }}
                            className="text-xs text-pink-500 hover:text-pink-400 font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>ကုဒ်ပြင်မည်</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  variant="custom"
                  icon={Code}
                  title={snippetSearch.trim() !== "" ? "No code snippets matched search" : "No code snippets saved yet"}
                  titleMm={snippetSearch.trim() !== "" ? "ရှာဖွေမှုနှင့် ကိုက်ညီသော ကုဒ်မှတ်စု မရှိပါ" : "ကုဒ်မှတ်စုများ မရှိသေးပါ"}
                  description={snippetSearch.trim() !== "" ? "Try searching for a different keyword or language filter." : "Save your favorite algorithms, CSS tricks, and template snippets here for quick reuse."}
                  descriptionMm={snippetSearch.trim() !== "" ? "ရှာဖွေသော စာလုံး သို့မဟုတ် Language နှင့် ကိုက်ညီသည့် ကုဒ်မှတ်စု မတွေ့ပါ။" : "သင်ခန်းစာများ လေ့လာရင်း အသုံးဝင်သော Template များနှင့် အရေးကြီးကုဒ်များကို စနစ်တကျ မှတ်တမ်းတင်သိမ်းဆည်းနိုင်ပါသည်။"}
                  primaryAction={snippetSearch.trim() !== "" ? {
                    label: "Clear Search",
                    labelMm: "ရှာဖွေမှုကို ရှင်းလင်းမည်",
                    onClick: () => {
                      setSnippetSearch("");
                      setSnippetLangFilter("all");
                    }
                  } : {
                    label: "Add Code Snippet",
                    labelMm: "ကုဒ်မှတ်စု အသစ်သိမ်းမည်",
                    onClick: () => {
                      setCurrentEditingSnippet(null);
                      setSnippetTitle("");
                      setSnippetDescription("");
                      setSnippetCode("");
                      setSnippetLanguage("JavaScript");
                      setIsEditingSnippet(true);
                    }
                  }}
                />
              )}
            </div>
          ) : (
            /* CODE SNIPPET FORM WRITER */
            <form onSubmit={handleSaveSnippet} className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-pink-500" />
                  <span>{currentEditingSnippet ? "ကုဒ်မှတ်စု ပြင်ဆင်ခြင်း" : "ကုဒ်မှတ်စု အသစ်သိမ်းဆည်းခြင်း"}</span>
                </h3>
                <p className="text-xs text-slate-400">ကျောင်းသားအကောင့်တွင် အမြဲသိမ်းဆည်းထားနိုင်ရန် သန့်ရှင်းသပ်ရပ်သော syntax ကုဒ်များကို ရေးသားသိမ်းဆည်းပါ။</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">ကုဒ်ခေါင်းစဉ်</label>
                  <input 
                    type="text" 
                    required
                    placeholder="ဥပမာ - CSS Responsive Flexbox Layout, Binary Search"
                    value={snippetTitle}
                    onChange={(e) => setSnippetTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 font-sans text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">ပရိုဂရမ်မင်းဘာသာစကား (Language)</label>
                  <select
                    value={snippetLanguage}
                    onChange={(e) => setSnippetLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-800 dark:text-white"
                  >
                    <option value="HTML">HTML</option>
                    <option value="CSS">CSS</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python (Playable)</option>
                    <option value="Java">Java</option>
                    <option value="Kotlin">Kotlin</option>
                    <option value="Firebase">Firebase Examples</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">တိုတောင်းသော အညွှန်းရှင်းလင်းချက် (Description)</label>
                <input 
                  type="text" 
                  placeholder="ဥပမာ - Screen အရွယ်အစားအလိုက် adaptive ဖြစ်စေသော navigation bar ဒီဇိုင်း"
                  value={snippetDescription}
                  onChange={(e) => setSnippetDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 font-sans text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Programming Codes</label>
                <textarea
                  required
                  rows={10}
                  placeholder="ကုဒ်များကို ရေးသားပါ..."
                  value={snippetCode}
                  onChange={(e) => setSnippetCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-55 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingSnippet(false);
                    setCurrentEditingSnippet(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
};
