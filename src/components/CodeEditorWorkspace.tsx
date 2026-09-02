/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Terminal,
  Eye,
  Lightbulb,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  FileCode,
  Download,
  HelpCircle,
  Zap,
  AlignLeft,
  Smartphone,
  Monitor,
  Tablet,
  Settings,
  ChevronRight,
  Bot
} from "lucide-react";
import confetti from "canvas-confetti";

export interface CodeEditorWorkspaceProps {
  initialCode?: string;
  language?: "python" | "javascript" | "html" | "css" | "sql";
  title?: string;
  instructions?: string;
  hints?: string[];
  expectedOutput?: string;
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
  onRunSuccess?: (output: string) => void;
  onAskKiboAI?: (code: string, error?: string) => void;
  theme?: "dark" | "light" | "myanmar" | "onedark";
  showInstructionsTab?: boolean;
  experimentSnippets?: { title: string; code: string; description: string }[];
}

export default function CodeEditorWorkspace({
  initialCode = 'print("Hello, Myanmar Developer!")',
  language = "python",
  title = "Interactive Practice Sandbox",
  instructions,
  hints = [],
  expectedOutput,
  readOnly = false,
  onCodeChange,
  onRunSuccess,
  onAskKiboAI,
  theme: defaultTheme = "dark",
  showInstructionsTab = true,
  experimentSnippets
}: CodeEditorWorkspaceProps) {
  // State
  const [code, setCode] = useState(initialCode);
  const [userLanguage, setUserLanguage] = useState(language);
  const [editorTheme, setEditorTheme] = useState<"dark" | "light" | "myanmar" | "onedark">(defaultTheme);
  const [fontSize, setFontSize] = useState<number>(14);
  const [activeMobileTab, setActiveMobileTab] = useState<"editor" | "output" | "instructions">("editor");
  const [outputTab, setOutputTab] = useState<"console" | "preview">("console");
  const [previewViewport, setPreviewViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
  
  // Execution Output & Status
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [executionError, setExecutionError] = useState<{
    raw: string;
    myanmar: string;
    hint: string;
    line?: number;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [formattedToast, setFormattedToast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [activeSnippetIdx, setActiveSnippetIdx] = useState<number | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLPreElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);

  // Synchronize when initialCode changes from outside
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    setUserLanguage(language);
  }, [language]);

  // Handle Code changes with undo support
  const handleCodeChange = (newCode: string) => {
    setHistory(prev => [...prev.slice(-30), code]);
    setRedoStack([]);
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [...prev, code]);
    setHistory(prev => prev.slice(0, prev.length - 1));
    setCode(previous);
    if (onCodeChange) onCodeChange(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, code]);
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setCode(next);
    if (onCodeChange) onCodeChange(next);
  };

  // Keyboard Shortcuts: Tab, Indent, Brackets, Run (Ctrl+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      executeCode();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = "  "; // 2 spaces
      const newText = code.substring(0, start) + spaces + code.substring(end);
      handleCodeChange(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
      return;
    }

    // Auto-close brackets & quotes
    const pairs: Record<string, string> = {
      "(": ")",
      "{": "}",
      "[": "]",
      '"': '"',
      "'": "'"
    };

    if (pairs[e.key]) {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // If user selected text, wrap it
      if (start !== end) {
        e.preventDefault();
        const selected = code.substring(start, end);
        const wrapped = e.key + selected + pairs[e.key];
        const newText = code.substring(0, start) + wrapped + code.substring(end);
        handleCodeChange(newText);
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = end + 1;
        }, 0);
      }
    }
  };

  // Synchronize scrolling between textarea, highlight layer, and line numbers
  const handleScroll = () => {
    if (!textareaRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  // Quick Mobile Insert Symbol
  const insertSymbol = (symbol: string, offset = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = code.substring(0, start) + symbol + code.substring(end);
    handleCodeChange(newText);
    setTimeout(() => {
      textarea.focus();
      const pos = start + symbol.length + offset;
      textarea.selectionStart = textarea.selectionEnd = pos;
    }, 0);
  };

  // Format Code Feature (Basic Beautifier)
  const formatCode = () => {
    try {
      let formatted = code;
      if (userLanguage === "html") {
        // Simple HTML Indentation
        let indent = 0;
        const lines = code.split("\n");
        const formattedLines = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed) return "";
          if (trimmed.startsWith("</") || trimmed.startsWith("-->")) {
            indent = Math.max(0, indent - 1);
          }
          const indented = "  ".repeat(indent) + trimmed;
          if (
            (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.endsWith("/>") && !trimmed.startsWith("<!") && !trimmed.startsWith("<!--")) &&
            !trimmed.match(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i) &&
            trimmed.includes(">") &&
            !trimmed.substring(trimmed.indexOf(">")).includes("</")
          ) {
            indent++;
          }
          return indented;
        });
        formatted = formattedLines.join("\n");
      } else if (userLanguage === "javascript" || userLanguage === "css") {
        // Basic JS/CSS bracket beautifier
        let indent = 0;
        const lines = code.split("\n");
        const formattedLines = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed) return "";
          if (trimmed.startsWith("}") || trimmed.startsWith("]") || trimmed.startsWith(")")) {
            indent = Math.max(0, indent - 1);
          }
          const indented = "  ".repeat(indent) + trimmed;
          if (trimmed.endsWith("{") || trimmed.endsWith("[") || (trimmed.endsWith("(") && !trimmed.startsWith("for"))) {
            indent++;
          }
          return indented;
        });
        formatted = formattedLines.join("\n");
      } else if (userLanguage === "python") {
        // Python whitespace trim and colon indent check
        const lines = code.split("\n");
        let indent = 0;
        const formattedLines = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed) return "";
          // Check for unindent keywords
          if (trimmed.startsWith("return") || trimmed.startsWith("pass") || trimmed.startsWith("break") || trimmed.startsWith("continue")) {
            // Keep current indent
          }
          if (trimmed.startsWith("elif ") || trimmed.startsWith("else:") || trimmed.startsWith("except") || trimmed.startsWith("finally:")) {
            indent = Math.max(0, indent - 1);
          }
          const indented = "    ".repeat(indent) + trimmed;
          if (trimmed.endsWith(":")) {
            indent++;
          }
          return indented;
        });
        formatted = formattedLines.join("\n");
      }

      handleCodeChange(formatted);
      setFormattedToast(true);
      setTimeout(() => setFormattedToast(false), 2000);
    } catch (e) {
      console.warn("Formatting skipped", e);
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  // Reset Code
  const handleResetCode = () => {
    if (window.confirm("မူလနမူနာ ကုဒ်ပုံစံအတိုင်း အစပြန်လည်ပြင်ဆင်လိုပါသလားခင်ဗျာ?")) {
      handleCodeChange(initialCode);
      setConsoleOutput("[SYSTEM] >>> မူလကုဒ်ပုံစံအတိုင်း အစပြန်လည်သတ်မှတ်ပြီးပါပြီ။");
      setExecutionError(null);
      setIsSuccess(null);
    }
  };

  // Download Code
  const handleDownloadCode = () => {
    const ext = userLanguage === "python" ? "py" : userLanguage === "javascript" ? "js" : userLanguage === "html" ? "html" : "txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `practice_code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Execute Code Logic
  const executeCode = async () => {
    setIsRunning(true);
    setExecutionError(null);
    setIsSuccess(null);
    setConsoleOutput("");
    setActiveMobileTab("output");

    const startTime = performance.now();

    // Client-side execution for JavaScript & HTML
    if (userLanguage === "html") {
      setOutputTab("preview");
      setIsSuccess(true);
      setExecutionTime(Math.round(performance.now() - startTime));
      setConsoleOutput(`[HTML LIVE PREVIEW] Document rendered successfully.`);
      setIsRunning(false);
      return;
    }

    if (userLanguage === "javascript") {
      const logs: string[] = [];
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      try {
        console.log = (...args: any[]) => {
          logs.push(args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "));
        };
        console.warn = (...args: any[]) => {
          logs.push(`[WARN] ` + args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
        };
        console.error = (...args: any[]) => {
          logs.push(`[ERROR] ` + args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
        };

        // Wrap execution in safe Function constructor
        // Prevent window/document access if needed
        const runFn = new Function(`
          "use strict";
          ${code}
        `);
        const result = runFn();

        const duration = Math.round(performance.now() - startTime);
        setExecutionTime(duration);

        let finalOutput = logs.join("\n");
        if (result !== undefined) {
          finalOutput += (finalOutput ? "\n" : "") + `[Return Value]: ${typeof result === "object" ? JSON.stringify(result, null, 2) : result}`;
        }
        if (!finalOutput) {
          finalOutput = "[SUCCESS] ကုဒ်အောင်မြင်စွာ လည်ပတ်ပြီးပါပြီ (Output မထုတ်ပြန်ပါ)။";
        }

        setConsoleOutput(finalOutput);
        setIsSuccess(true);
        setOutputTab("console");

        if (expectedOutput && finalOutput.trim().includes(expectedOutput.trim())) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }
        if (onRunSuccess) onRunSuccess(finalOutput);
      } catch (err: any) {
        const duration = Math.round(performance.now() - startTime);
        setExecutionTime(duration);
        setIsSuccess(false);

        let myanmarExplanation = "JavaScript ကုဒ်တွင် အမှားတစ်ခု ဖြစ်ပေါ်နေပါသည်ခင်ဗျာ။";
        let hint = "ကုဒ်စာကြောင်းများနှင့် အပိတ်အဖွင့် syntax များကို သေချာစစ်ဆေးကြည့်ပါ။";

        const errStr = err.toString();
        if (errStr.includes("SyntaxError")) {
          myanmarExplanation = "Syntax Error (ရေးထုံးအမှား): ကွင်းစကွင်းပိတ် { }, ( ), [ ] သို့မဟုတ် semicolon / quotation mark အပိတ် ကျန်နေနိုင်ပါသည်။";
          hint = "brackets { } နှင့် quotes များ အစအပိတ် စုံမစုံ စစ်ဆေးပါ။";
        } else if (errStr.includes("ReferenceError")) {
          myanmarExplanation = "Reference Error: မကြေညာရသေးသော variable သို့မဟုတ် function နာမည်ကို အသုံးပြုထားပါသည်။";
          hint = "let, const သို့မဟုတ် var ဖြင့် variable ကို အရင်ဆုံး သတ်မှတ်ကြေညာပေးပါ။";
        } else if (errStr.includes("TypeError")) {
          myanmarExplanation = "Type Error: မသင့်လျော်သော data type ပေါ်တွင် operation ပြုလုပ်မိခြင်း သို့မဟုတ် function မဟုတ်သည်ကို ခေါ်ယူမိခြင်းကြောင့် ဖြစ်ပါသည်။";
          hint = "ခေါ်ယူထားသော variable သို့မဟုတ် method သည် အမှန်တကယ် ရှိမရှိ စစ်ဆေးပါ။";
        }

        setExecutionError({
          raw: errStr,
          myanmar: myanmarExplanation,
          hint
        });
        setConsoleOutput(logs.join("\n") + (logs.length ? "\n" : "") + `[ERROR] ${errStr}`);
      } finally {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
        setIsRunning(false);
      }
      return;
    }

    // Python / Server-side execution
    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: userLanguage,
          code
        })
      });

      const data = await response.json();
      const duration = data.executionTimeMs || Math.round(performance.now() - startTime);
      setExecutionTime(duration);

      if (response.ok && data.success) {
        setConsoleOutput(data.output || "[SUCCESS] ကုဒ်အောင်မြင်စွာ လည်ပတ်ပြီးပါပြီ (Output မထုတ်ပြန်ပါ)။");
        setIsSuccess(true);
        setOutputTab("console");

        if (expectedOutput && (data.output || "").trim().includes(expectedOutput.trim())) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }
        if (onRunSuccess) onRunSuccess(data.output);
      } else {
        setIsSuccess(false);
        setExecutionError({
          raw: data.error || "Execution Error",
          myanmar: data.myanmar || "ကုဒ်လည်ပတ်မှု မအောင်မြင်ပါ။ စာလုံးပေါင်းနှင့် အပိတ်အဖွင့်များကို ပြန်စစ်ပါ။",
          hint: data.hint || "စာကြောင်းနံပါတ်နှင့် syntax များကို သေချာစစ်ဆေးပေးပါ။"
        });
        setConsoleOutput((data.output ? data.output + "\n" : "") + `[RUN ERROR] ${data.error}`);
      }
    } catch (err: any) {
      setIsSuccess(false);
      setExecutionError({
        raw: err.message || "Network / Server Error",
        myanmar: "ဆာဗာသို့ ချိတ်ဆက်၍ မရပါခင်ဗျာ။ အင်တာနက်လိုင်း ချိတ်ဆက်မှုကို စစ်ဆေးပါ။",
        hint: "ခေတ္တစောင့်ဆိုင်းပြီးနောက် ပြန်လည်စမ်းသပ်ကြည့်ပါ။"
      });
      setConsoleOutput(`[SYSTEM ERROR] ဆာဗာနှင့် ချိတ်ဆက်မှု အဆင်မပြေပါ။`);
    } finally {
      setIsRunning(false);
    }
  };

  // Syntax Highlighting Engine (Clean, lightweight regex tokenizer)
  const renderHighlightedCode = useCallback((rawCode: string, lang: string) => {
    // Escape HTML
    const escapeHtml = (str: string) =>
      str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (lang === "python") {
      const pythonKeywords = /\b(def|class|if|elif|else|while|for|in|return|import|from|as|try|except|finally|with|lambda|yield|pass|break|continue|and|or|not|is|None|True|False|global|async|await)\b/g;
      const pythonBuiltins = /\b(print|input|len|range|int|str|float|list|dict|set|tuple|type|sum|min|max|abs|open|enumerate|zip|map|filter|super|round)\b/g;
      const strings = /(["'])(?:(?=(\\?))\2.)*?\1|('''[\s\S]*?'''|"""[\s\S]*?""")/g;
      const comments = /(#.*$)/gm;
      const numbers = /\b(\d+(\.\d+)?)\b/g;

      // Tokenize
      return escapeHtml(rawCode)
        .replace(strings, '<span class="text-emerald-400 font-semibold">$&</span>')
        .replace(comments, '<span class="text-slate-500 italic">$&</span>')
        .replace(pythonKeywords, '<span class="text-purple-400 font-bold">$&</span>')
        .replace(pythonBuiltins, '<span class="text-blue-400 font-semibold">$&</span>')
        .replace(numbers, '<span class="text-amber-400">$&</span>');
    }

    if (lang === "javascript" || lang === "typescript") {
      const jsKeywords = /\b(function|const|let|var|return|if|else|for|while|do|switch|case|break|continue|import|export|from|default|class|extends|new|this|async|await|try|catch|finally|typeof|instanceof|null|undefined|true|false)\b/g;
      const jsBuiltins = /\b(console|document|window|Math|Array|Object|String|Number|Boolean|JSON|Promise|setTimeout|setInterval|alert|fetch)\b/g;
      const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
      const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
      const numbers = /\b(\d+(\.\d+)?)\b/g;

      return escapeHtml(rawCode)
        .replace(strings, '<span class="text-emerald-400 font-semibold">$&</span>')
        .replace(comments, '<span class="text-slate-500 italic">$&</span>')
        .replace(jsKeywords, '<span class="text-purple-400 font-bold">$&</span>')
        .replace(jsBuiltins, '<span class="text-cyan-400 font-semibold">$&</span>')
        .replace(numbers, '<span class="text-amber-400">$&</span>');
    }

    if (lang === "html") {
      return escapeHtml(rawCode)
        .replace(/(&lt;\/?[\w\d-]+)/g, '<span class="text-rose-400 font-bold">$1</span>')
        .replace(/(&gt;)/g, '<span class="text-rose-400 font-bold">$1</span>')
        .replace(/(\s+[\w:-]+)(?==)/g, '<span class="text-amber-300">$1</span>')
        .replace(/(".*?")/g, '<span class="text-emerald-400">$1</span>')
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-slate-500 italic">$1</span>');
    }

    return escapeHtml(rawCode);
  }, []);

  // Theme Styles Dictionary
  const themeClasses = {
    dark: {
      wrapper: "bg-[#0f172a] text-slate-100 border-slate-800",
      toolbar: "bg-slate-900/90 border-slate-800 text-slate-300",
      editorArea: "bg-[#0b0f19] text-slate-100",
      lineNumbers: "text-slate-600 bg-[#090d16] border-r border-slate-800/80",
      console: "bg-[#06090e] border-slate-800 text-slate-200"
    },
    onedark: {
      wrapper: "bg-[#282c34] text-[#abb2bf] border-[#1e2227]",
      toolbar: "bg-[#21252b] border-[#1e2227] text-slate-300",
      editorArea: "bg-[#282c34] text-[#abb2bf]",
      lineNumbers: "text-[#5c6370] bg-[#21252b] border-r border-[#1e2227]",
      console: "bg-[#1e2227] border-[#2c313a] text-[#abb2bf]"
    },
    light: {
      wrapper: "bg-slate-50 text-slate-900 border-slate-300",
      toolbar: "bg-slate-200/90 border-slate-300 text-slate-700",
      editorArea: "bg-white text-slate-900",
      lineNumbers: "text-slate-400 bg-slate-100 border-r border-slate-200",
      console: "bg-slate-100 border-slate-300 text-slate-800"
    },
    myanmar: {
      wrapper: "bg-[#064e3b] text-emerald-100 border-[#047857]",
      toolbar: "bg-[#065f46] border-[#047857] text-emerald-200",
      editorArea: "bg-[#022c22] text-emerald-100",
      lineNumbers: "text-emerald-600 bg-[#064e3b] border-r border-[#047857]",
      console: "bg-[#022c22] border-[#047857] text-emerald-200"
    }
  }[editorTheme];

  const lines = code.split("\n");

  // Mobile quick symbols list
  const mobileSymbols = [
    { label: "( )", val: "()", offset: -1 },
    { label: "{ }", val: "{}", offset: -1 },
    { label: "[ ]", val: "[]", offset: -1 },
    { label: '" "', val: '""', offset: -1 },
    { label: "' '", val: "''", offset: -1 },
    { label: ":", val: ":", offset: 0 },
    { label: ";", val: ";", offset: 0 },
    { label: "=", val: " = ", offset: 0 },
    { label: "==", val: " == ", offset: 0 },
    { label: ">", val: " > ", offset: 0 },
    { label: "<", val: " < ", offset: 0 },
    { label: "+", val: " + ", offset: 0 },
    { label: "-", val: " - ", offset: 0 },
    { label: "Tab", val: "  ", offset: 0 },
    ...(userLanguage === "python"
      ? [
          { label: "print()", val: "print()", offset: -1 },
          { label: "def", val: "def ():", offset: -3 },
          { label: "return", val: "return ", offset: 0 },
          { label: "if", val: "if :", offset: -1 },
          { label: "for", val: "for item in list:", offset: 0 }
        ]
      : userLanguage === "html"
      ? [
          { label: "<div>", val: "<div></div>", offset: -6 },
          { label: "<h1>", val: "<h1></h1>", offset: -5 },
          { label: "<p>", val: "<p></p>", offset: -4 },
          { label: "class", val: 'class=""', offset: -1 }
        ]
      : [
          { label: "console.log()", val: "console.log()", offset: -1 },
          { label: "const", val: "const ", offset: 0 },
          { label: "let", val: "let ", offset: 0 },
          { label: "=>", val: " => ", offset: 0 }
        ])
  ];

  return (
    <div
      className={`flex flex-col border rounded-2xl overflow-hidden transition-all shadow-xl ${
        themeClasses.wrapper
      } ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none w-screen h-screen m-0 p-0"
          : "w-full min-h-[550px]"
      }`}
    >
      {/* 1. Header Toolbar */}
      <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2.5 ${themeClasses.toolbar}`}>
        {/* Left: Language & Title */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
            <FileCode className="w-3.5 h-3.5" />
            <span className="uppercase">{userLanguage}</span>
          </div>
          <span className="text-xs font-bold font-display truncate max-w-[200px] sm:max-w-md">
            {title}
          </span>
        </div>

        {/* Center: Mobile Navigation Tabs (visible on mobile / small screens) */}
        <div className="flex sm:hidden items-center bg-black/20 p-0.5 rounded-lg border border-slate-800/40 text-[11px] font-bold">
          <button
            onClick={() => setActiveMobileTab("editor")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeMobileTab === "editor"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            💻 Code
          </button>
          <button
            onClick={() => setActiveMobileTab("output")}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeMobileTab === "output"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚡ Output
            {isSuccess !== null && (
              <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? "bg-emerald-400" : "bg-red-400"}`} />
            )}
          </button>
          {showInstructionsTab && instructions && (
            <button
              onClick={() => setActiveMobileTab("instructions")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeMobileTab === "instructions"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📖 Guide
            </button>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Format Code */}
          <button
            onClick={formatCode}
            className="p-1.5 text-xs rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            title="Format / Prettify Code (သပ်ရပ်အောင်ပြင်ဆင်မည်)"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[10px] font-mono">FORMAT</span>
          </button>

          {/* Theme Selector */}
          <div className="hidden lg:flex items-center bg-black/20 p-0.5 rounded-lg border border-slate-800/40 text-[9px] font-mono">
            {(["dark", "onedark", "light", "myanmar"] as const).map(t => (
              <button
                key={t}
                onClick={() => setEditorTheme(t)}
                className={`px-2 py-0.5 rounded uppercase font-bold cursor-pointer transition-all ${
                  editorTheme === t ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Font size adjustment */}
          <div className="hidden md:flex items-center space-x-0.5 bg-black/20 px-1 py-0.5 rounded-lg border border-slate-800/40 text-[10px] font-mono">
            <button
              onClick={() => setFontSize(prev => Math.max(11, prev - 1))}
              className="px-1.5 py-0.5 hover:text-white text-slate-400 cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[10px] text-slate-500 px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
              className="px-1.5 py-0.5 hover:text-white text-slate-400 cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 text-xs rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Copy Code to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download Code */}
          <button
            onClick={handleDownloadCode}
            className="p-1.5 text-xs rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Download Code File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Reset Code */}
          <button
            onClick={handleResetCode}
            className="p-1.5 text-xs rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Reset to Template (မူလအတိုင်းပြန်စမည်)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-xs rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Formatted Toast */}
      {formattedToast && (
        <div className="bg-blue-600 text-white text-[10px] font-mono py-1 text-center font-bold uppercase tracking-wider animate-pulse">
          ✨ Code Auto-Formatted Cleanly (ကုဒ်များကို သပ်ရပ်စွာ အလှဆင်ပြီးပါပြီ)
        </div>
      )}

      {/* 2. Visual Breadcrumb Workflow: Code ➔ Run ➔ Output */}
      <div className="bg-black/30 px-4 py-2 border-b border-slate-800/40 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="flex items-center space-x-1 text-blue-400 font-bold">
            <span className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px]">1</span>
            <span>Code ရေးပါ</span>
          </span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className={`flex items-center space-x-1 ${isRunning ? "text-amber-400 font-bold animate-pulse" : "text-slate-400"}`}>
            <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[9px]">2</span>
            <span>Run စမ်းသပ်မည်</span>
          </span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className={`flex items-center space-x-1 ${isSuccess === true ? "text-emerald-400 font-bold" : isSuccess === false ? "text-red-400 font-bold" : "text-slate-500"}`}>
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px]">3</span>
            <span>Output ရလဒ်</span>
          </span>
        </div>

        {/* Execution Metrics (Run time / status) */}
        {executionTime !== null && (
          <div className="flex items-center space-x-2 text-[10px]">
            <span className="text-slate-500 font-mono">⚡ {executionTime}ms</span>
            {isSuccess === true && (
              <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                ✓ Success (200 OK)
              </span>
            )}
            {isSuccess === false && (
              <span className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 font-bold">
                ✕ Error Occurred
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Optional Beginner Experimentation Snippets Bar */}
      {experimentSnippets && experimentSnippets.length > 0 && (
        <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/40 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>စမ်းသပ်ရန် ဥပမာများ:</span>
          </span>
          {experimentSnippets.map((snip, idx) => (
            <button
              key={idx}
              onClick={() => {
                handleCodeChange(snip.code);
                setActiveSnippetIdx(idx);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                activeSnippetIdx === idx
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                  : "bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700/50"
              }`}
              title={snip.description}
            >
              {snip.title}
            </button>
          ))}
        </div>
      )}

      {/* 4. Main Body: Editor & Output (Responsive Grid) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[350px] divide-y lg:divide-y-0 lg:divide-x divide-slate-800/60 overflow-hidden">
        
        {/* LEFT COLUMN: Code Editor Area */}
        <div
          className={`lg:col-span-7 flex flex-col min-h-[320px] ${
            activeMobileTab !== "editor" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Editor Workspace with Synchronized Highlighting */}
          <div className={`relative flex-1 flex overflow-hidden ${themeClasses.editorArea}`}>
            {/* Line Numbers */}
            <div
              ref={lineNumbersRef}
              className={`select-none py-4 px-2 font-mono text-right text-xs leading-relaxed min-w-[40px] flex flex-col items-end overflow-hidden ${themeClasses.lineNumbers}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {lines.map((_, i) => (
                <div key={i} className="leading-relaxed">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Editor Canvas Container */}
            <div className="relative flex-1 overflow-hidden">
              {/* Syntax Highlight Layer */}
              <pre
                ref={highlightRef}
                aria-hidden="true"
                className="absolute inset-0 p-4 m-0 font-mono leading-relaxed pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{
                  __html: renderHighlightedCode(code + "\n", userLanguage)
                }}
              />

              {/* Raw Editable Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => handleCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                readOnly={readOnly}
                spellCheck="false"
                placeholder="ကုဒ်များကို ဤနေရာတွင် စမ်းသပ်ရေးသားပါ..."
                className="absolute inset-0 w-full h-full p-4 m-0 bg-transparent font-mono leading-relaxed text-transparent caret-white focus:outline-none resize-none whitespace-pre-wrap break-words z-10 selection:bg-blue-500/30 selection:text-white"
                style={{
                  fontSize: `${fontSize}px`,
                  caretColor: editorTheme === "light" ? "#0f172a" : "#38bdf8"
                }}
              />
            </div>
          </div>

          {/* Mobile Quick Symbols Toolbar (Docked right below code area on mobile) */}
          <div className="bg-slate-900/90 border-t border-slate-800/80 px-2 py-1.5 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold shrink-0 px-1">
              Insert:
            </span>
            {mobileSymbols.map((item, idx) => (
              <button
                key={idx}
                onClick={() => insertSymbol(item.val, item.offset)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm border border-slate-700/50"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Run Action Bar */}
          <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-850 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 font-mono hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Shortcut: [Ctrl + Enter to Run]</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={executeCode}
                disabled={isRunning}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>ခေတ္တစောင့်ပါ...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ကုဒ်စမ်းသပ်မည် (Run Code)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output & Results / Instructions Area */}
        <div
          className={`lg:col-span-5 flex flex-col min-h-[320px] ${themeClasses.console} ${
            activeMobileTab === "editor" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Output Header Tabs */}
          <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-1 bg-black/30 p-0.5 rounded-lg border border-slate-800/60 text-xs font-bold">
              <button
                onClick={() => setOutputTab("console")}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  outputTab === "console"
                    ? "bg-slate-800 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Console Log</span>
              </button>

              {userLanguage === "html" && (
                <button
                  onClick={() => setOutputTab("preview")}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    outputTab === "preview"
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              )}
            </div>

            {/* Clear output button */}
            <div className="flex items-center space-x-2">
              {outputTab === "preview" && (
                <div className="flex items-center space-x-1 bg-black/30 p-0.5 rounded-md border border-slate-800/50">
                  <button
                    onClick={() => setPreviewViewport("mobile")}
                    className={`p-1 rounded cursor-pointer ${previewViewport === "mobile" ? "text-blue-400 bg-white/10" : "text-slate-500"}`}
                    title="Mobile Viewport"
                  >
                    <Smartphone className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setPreviewViewport("tablet")}
                    className={`p-1 rounded cursor-pointer ${previewViewport === "tablet" ? "text-blue-400 bg-white/10" : "text-slate-500"}`}
                    title="Tablet Viewport"
                  >
                    <Tablet className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setPreviewViewport("desktop")}
                    className={`p-1 rounded cursor-pointer ${previewViewport === "desktop" ? "text-blue-400 bg-white/10" : "text-slate-500"}`}
                    title="Desktop Viewport"
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                </div>
              )}
              {consoleOutput && (
                <button
                  onClick={() => {
                    setConsoleOutput("");
                    setExecutionError(null);
                    setIsSuccess(null);
                  }}
                  className="text-[10px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Clear Output
                </button>
              )}
            </div>
          </div>

          {/* Output Content Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-between space-y-3 font-mono text-xs">
            {outputTab === "console" ? (
              <div className="space-y-3">
                {/* 1. Beginner-Friendly Error Card */}
                {executionError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 space-y-2.5 text-left font-sans">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-red-400 font-display">
                          မိတ်ဆွေ၏ ကုဒ်တွင် အောက်ပါအမှားရှိနေပါသည် (Error Detected)
                        </h4>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          {executionError.myanmar}
                        </p>
                      </div>
                    </div>

                    {/* Actionable Hint */}
                    <div className="bg-slate-950/60 border border-red-500/20 rounded-lg p-2.5 flex items-start space-x-2 text-[11px] text-slate-300">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <span className="font-bold text-amber-300">ဘယ်လိုပြင်ဆင်ရမလဲ (Actionable Hint): </span>
                        <span>{executionError.hint}</span>
                      </div>
                    </div>

                    {/* Ask AI Mentor Button */}
                    {onAskKiboAI && (
                      <button
                        onClick={() => onAskKiboAI(code, executionError.raw)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Kibo AI အား အမှားအကြောင်း မေးမြန်းမည် 🤖</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 2. Success Banner */}
                {isSuccess === true && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center space-x-2 text-emerald-400 font-sans text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold">အောင်မြင်ပါသည်! </span>
                      <span className="text-slate-300">ကုဒ်လည်ပတ်မှု အောင်မြင်စွာ ပြီးဆုံးပါပြီ။</span>
                    </div>
                  </div>
                )}

                {/* 3. Raw Console Output Pre */}
                <div className="bg-black/40 border border-slate-800/60 rounded-xl p-3 min-h-[120px] text-left">
                  {consoleOutput ? (
                    <pre className="whitespace-pre-wrap font-mono text-slate-200 text-xs leading-relaxed break-words">
                      {consoleOutput}
                    </pre>
                  ) : (
                    <p className="text-slate-500 italic text-center mt-6 font-sans">
                      ကုဒ်စမ်းသပ်ရန် <strong>"Run Code"</strong> ခလုတ်ကို နှိပ်ပါ သို့မဟုတ် <strong>[Ctrl+Enter]</strong> နှိပ်ပါ ခင်ဗျာ။
                    </p>
                  )}
                </div>

                {/* 4. Expected Output Comparison (if applicable) */}
                {expectedOutput && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-left space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      မျှော်မှန်းထားသည့် ရလဒ် (Expected Output):
                    </span>
                    <pre className="bg-slate-950 p-2 rounded border border-slate-800/80 text-emerald-400 text-xs font-mono overflow-x-auto">
                      {expectedOutput}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              /* Live Preview HTML iFrame */
              <div className="flex-1 flex flex-col justify-center items-center">
                <div
                  className={`bg-white rounded-xl overflow-hidden shadow-2xl transition-all border border-slate-800 h-[280px] ${
                    previewViewport === "mobile"
                      ? "w-[240px]"
                      : previewViewport === "tablet"
                      ? "w-[360px]"
                      : "w-full"
                  }`}
                >
                  <iframe
                    title="Live HTML Preview"
                    srcDoc={code}
                    sandbox="allow-scripts"
                    className="w-full h-full border-0 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Hints Accordion Footer */}
            {hints && hints.length > 0 && (
              <div className="border-t border-slate-800/80 pt-2 text-left font-sans">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showHints ? "Hints လမ်းညွှန်ချက် ဖျောက်ရန်" : "Hint လမ်းညွှန်ချက် ရယူရန် (Need a Hint?)"}</span>
                </button>

                {showHints && (
                  <div className="mt-2 bg-slate-900/80 border border-amber-500/20 rounded-xl p-3 space-y-1.5 text-xs text-slate-300">
                    {hints.map((h, i) => (
                      <p key={i} className="leading-relaxed">
                        💡 {h}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
