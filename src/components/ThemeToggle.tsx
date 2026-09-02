import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme, ThemeMode } from "../context/ThemeContext";

interface ThemeToggleProps {
  variant?: "icon-only" | "dropdown" | "pills" | "compact";
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = "pills", className = "" }) => {
  const { theme, setTheme, toggleTheme, resolvedTheme } = useTheme();

  if (variant === "icon-only") {
    return (
      <button
        onClick={toggleTheme}
        title={`Current: ${theme === "system" ? `System (${resolvedTheme})` : theme} - Click to switch`}
        className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
          resolvedTheme === "dark"
            ? "bg-slate-800 border-slate-700/80 text-amber-400 hover:text-amber-300 hover:bg-slate-750"
            : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
        } ${className}`}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-blue-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`inline-flex p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl ${className}`}>
        <button
          onClick={() => setTheme("light")}
          title="Light Mode (အလင်းရောင် အသွင်အပြင်)"
          className={`p-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer ${
            theme === "light"
              ? "bg-white text-amber-600 shadow-sm font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setTheme("dark")}
          title="Dark Mode (အမှောင်ရောင် အသွင်အပြင်)"
          className={`p-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer ${
            theme === "dark"
              ? "bg-slate-900 text-blue-400 shadow-sm font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setTheme("system")}
          title="Use System Theme (စက်ပစ္စည်း အပြင်အဆင်အတိုင်း)"
          className={`p-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer ${
            theme === "system"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Default "pills" variant with descriptive text
  return (
    <div className={`grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl ${className}`}>
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          theme === "light"
            ? "bg-white text-slate-900 shadow-md border border-slate-200/80 text-amber-600"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Sun className={`w-4 h-4 ${theme === "light" ? "text-amber-500" : "text-slate-400"}`} />
        <span>Light Mode</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          theme === "dark"
            ? "bg-slate-800 text-white shadow-md border border-slate-700/80 text-blue-400"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Moon className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-slate-400"}`} />
        <span>Dark Mode</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          theme === "system"
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-700/80"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Laptop className={`w-4 h-4 ${theme === "system" ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"}`} />
        <span>System Theme</span>
      </button>
    </div>
  );
};
