/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BookOpen, 
  Code, 
  Sparkles, 
  User, 
  MessageSquare, 
  Menu, 
  X, 
  Trophy, 
  FileText,
  Lock,
  Cloud,
  Sun,
  Moon,
  Laptop,
  Briefcase,
  LogOut,
  Zap,
  ZapOff,
  Eye,
  Keyboard
} from "lucide-react";
import { UserProfile } from "../types";
import { ThemeToggle } from "./ThemeToggle";
import { performanceManager } from "../lib/performanceManager";
import { useAccessibility } from "../context/AccessibilityContext";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile;
  firebaseUser: any;
  onOpenAuth: () => void;
  onSignOut?: () => void;
  theme?: "light" | "dark" | "system";
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
}

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  firebaseUser, 
  onOpenAuth,
  onSignOut,
  theme,
  onThemeChange
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(() => performanceManager.isDataSaverActive());
  const { setIsAccessibilityModalOpen, setIsShortcutsModalOpen } = useAccessibility();

  React.useEffect(() => {
    const unsub = performanceManager.subscribe((state) => {
      setIsDataSaver(state.dataSaver.enabled);
    });
    return unsub;
  }, []);

  const handleToggleDataSaver = () => {
    performanceManager.toggleDataSaver();
  };

  const navItems = [
    { id: "home", label: "ပင်မ (Home)", icon: BookOpen },
    { id: "courses", label: "သင်တန်းများ (Courses)", icon: BookOpen },
    { id: "projects", label: "လေ့ကျင့်ခန်း (Practice)", icon: Code },
    { id: "ai-assistant", label: "Kibo AI", icon: Sparkles },
    { id: "community", label: "ကွန်မြူနတီ (Community)", icon: MessageSquare },
    { id: "profile", label: "ပရိုဖိုင် (Profile)", icon: User },
    { id: "premium", label: "👑 Premium", icon: Sparkles },
  ];

  const toggleTheme = () => {
    if (theme === "dark") {
      onThemeChange("light");
    } else if (theme === "light") {
      onThemeChange("system");
    } else {
      onThemeChange("dark");
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light": return <Sun className="w-4 h-4 text-amber-500" />;
      case "dark": return <Moon className="w-4 h-4 text-blue-400" />;
      case "system": return <Laptop className="w-4 h-4 text-slate-400" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light": return "Light Mode";
      case "dark": return "Dark Mode";
      case "system": return "System Theme";
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-md dark:shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentTab("home")}
          >
            <img 
              src="https://i.ibb.co/tMS4fMck/file-00000000c5c872438eb118e0d2d35195.png" 
              alt="Code Learn Myanmar Logo" 
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-contain shadow-md shadow-blue-500/20"
            />
            <div className="text-left">
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                Code Learn <span className="text-blue-500">Myanmar</span>
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none mt-0.5">မြန်မာလို ပရိုဂရမ်မင်းသင်ယူစို့</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Profile Stats Button */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {/* Data Saver Mode Pill Button */}
            <button
              type="button"
              onClick={handleToggleDataSaver}
              title={isDataSaver ? "Data Saver: ဖွင့်ထားပါသည် (Click to turn OFF)" : "Data Saver: ပိတ်ထားပါသည် (Click to turn ON)"}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                isDataSaver
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isDataSaver ? "text-amber-500 fill-amber-500 animate-pulse" : "text-slate-400"}`} />
              <span className="text-[11px]">
                Data Saver: <span className={isDataSaver ? "text-amber-600 dark:text-amber-400 font-extrabold uppercase" : "text-slate-500 uppercase"}>{isDataSaver ? "ON" : "OFF"}</span>
              </span>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle variant="compact" />

            {/* Accessibility Settings Trigger */}
            <button
              type="button"
              onClick={() => setIsAccessibilityModalOpen(true)}
              title="Accessibility & Display Settings (Alt+A) - စာလုံးအရွယ်အစားနှင့် မြင်သာထင်ရှားမှု"
              aria-label="Open accessibility settings"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
            >
              <Eye className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
              <span className="hidden xl:inline text-[11px]">Accessibility</span>
            </button>

            {/* Keyboard Shortcuts Trigger */}
            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              title="Keyboard Navigation Guide (Shift+?) - ကီးဘုတ်လမ်းညွှန်"
              aria-label="Open keyboard shortcuts guide"
              className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-500 focus:outline-none"
            >
              <Keyboard className="w-4 h-4 text-purple-500" aria-hidden="true" />
            </button>

            {firebaseUser ? (
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <Cloud className="w-3.5 h-3.5" />
                <span>Cloud Synced</span>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 border border-blue-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cloud Sync / Sign In</span>
              </button>
            )}

            <div 
              onClick={() => setCurrentTab("profile")}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 cursor-pointer transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-left font-mono">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">{user?.name || "Student"}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="text-[9px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1 rounded font-bold">LVL {user?.level || 1}</span>
                  <span className="text-[9px] text-slate-500 dark:text-gray-400 font-medium">{user?.xp || 0} XP</span>
                </div>
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Log Out (အကောင့်မှထွက်ရန်)"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white transition-all text-xs font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Log Out</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Theme Toggle Button for Mobile */}
            <ThemeToggle variant="icon-only" />

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2.5 rounded-lg text-base font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 px-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{user?.name || "Student"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || ""}</p>
                </div>
              </div>

              {firebaseUser ? (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Synced
                </span>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAuth();
                  }}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Current Level</span>
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">LVL {user.level}</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Current XP</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{user.xp} XP</span>
              </div>
            </div>

            {/* Mobile Accessibility & Display Options */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsAccessibilityModalOpen(true);
                }}
                className="min-h-[44px] flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Accessibility</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsShortcutsModalOpen(true);
                }}
                className="min-h-[44px] flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold transition-all cursor-pointer"
              >
                <Keyboard className="w-4 h-4" />
                <span>Shortcuts (?)</span>
              </button>
            </div>

            {/* Mobile Data Saver Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${isDataSaver ? "bg-amber-500/20 text-amber-500" : "bg-slate-200 dark:bg-slate-700 text-slate-400"}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Data Saver Mode
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isDataSaver ? "ဒေတာချွေတာရေး ဖွင့်ထားပါသည်" : "ပုံမှန် High Quality စနစ်"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleDataSaver}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isDataSaver
                    ? "bg-amber-500 text-slate-950 font-extrabold"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                }`}
              >
                {isDataSaver ? "ON" : "OFF"}
              </button>
            </div>

            {onSignOut && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out (အကောင့်မှထွက်ရန်)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
