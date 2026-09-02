/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Universal Empty State Component
 * Provides warm, beginner-friendly visual cues and clear calls-to-action
 * whenever a view or collection has no content.
 */

import React from "react";
import { 
  BookOpen, 
  Trophy, 
  Award, 
  Search, 
  Bookmark, 
  FileText, 
  FolderPlus, 
  Bell, 
  MessageSquare, 
  Code, 
  Sparkles, 
  Compass, 
  PlusCircle, 
  ArrowRight,
  RefreshCw,
  LucideIcon
} from "lucide-react";

export type EmptyStateVariant = 
  | "no_completed_lessons"
  | "no_in_progress_courses"
  | "no_certificates"
  | "no_bookmarks"
  | "no_notes"
  | "no_search_results"
  | "no_projects"
  | "no_notifications"
  | "no_discussions"
  | "no_history"
  | "no_goals"
  | "custom";

export interface EmptyStateAction {
  label: string;
  labelMm?: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "outline";
}

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title?: string;
  titleMm?: string;
  description?: string;
  descriptionMm?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  compact?: boolean;
  helpTipMm?: string;
}

const PRESET_CONFIGS: Record<Exclude<EmptyStateVariant, "custom">, {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  titleMm: string;
  description: string;
  descriptionMm: string;
  defaultPrimaryLabel: string;
  defaultPrimaryLabelMm: string;
  helpTipMm?: string;
}> = {
  no_completed_lessons: {
    icon: BookOpen,
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "No lessons completed yet",
    titleMm: "သင်ခန်းစာများ မပြီးမြောက်သေးပါ",
    description: "You haven't completed any lessons yet. Start your journey now and earn your first XP and badges!",
    descriptionMm: "လေ့လာသင်ယူပြီးဆုံးသည့် သင်ခန်းစာ မရှိသေးပါ။ အခြေခံမှစတင်ပြီး ပထမဆုံး XP နှင့် တံဆိပ်များကို ရယူလိုက်ပါ။",
    defaultPrimaryLabel: "Start Learning",
    defaultPrimaryLabelMm: "စတင်လေ့လာမည်",
    helpTipMm: "အကြံပြုချက် - Beginner များအတွက် HTML/CSS သို့မဟုတ် Python သင်တန်းများကို ဦးစွာစတင်ရန် အကြံပြုပါသည်"
  },
  no_in_progress_courses: {
    icon: Compass,
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    title: "No active courses in progress",
    titleMm: "လက်ရှိလေ့လာနေသော သင်တန်းမရှိသေးပါ",
    description: "Pick an exciting course from our catalog and start coding step-by-step.",
    descriptionMm: "သင်တန်းစာရင်းမှ သင်စိတ်ဝင်စားသော ဘာသာရပ်ကို ရွေးချယ်၍ လက်တွေ့ကုဒ်ရေးသားခြင်းကို စတင်လိုက်ပါ။",
    defaultPrimaryLabel: "Explore Courses",
    defaultPrimaryLabelMm: "သင်တန်းများ ကြည့်မည်",
    helpTipMm: "အကြံပြုချက် - သင်တန်းအားလုံးတွင် မြန်မာဘာသာရှင်းလင်းချက်များနှင့် Interactive Code Sandbox များ ပါဝင်ပါသည်"
  },
  no_certificates: {
    icon: Award,
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    title: "No certificates earned yet",
    titleMm: "အောင်လက်မှတ် မရရှိသေးပါ",
    description: "Complete all lessons and pass the final quiz in any course to unlock your official verified certificate.",
    descriptionMm: "သင်တန်းတစ်ခု၏ သင်ခန်းစာများအားလုံးပြီးမြောက်ပြီး စာမေးပွဲ အောင်မြင်ပါက တရားဝင် အောင်လက်မှတ်ကို ရရှိမည်ဖြစ်ပါသည်။",
    defaultPrimaryLabel: "Start a Course",
    defaultPrimaryLabelMm: "သင်တန်းတစ်ခု စတင်မည်",
    helpTipMm: "အောင်လက်မှတ်များကို Portfolio တွင် ချိတ်ဆက်ပြသနိုင်ပြီး QR Code ဖြင့် အတည်ပြုနိုင်ပါသည်"
  },
  no_bookmarks: {
    icon: Bookmark,
    iconBg: "bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    title: "No bookmarks saved yet",
    titleMm: "သိမ်းဆည်းထားသော အမှတ်အသားများ မရှိပါ",
    description: "Click the bookmark icon on any lesson or code snippet to save it for quick review anytime.",
    descriptionMm: "သင်ခန်းစာများ ဖတ်ရှုနေစဉ် Bookmark အိုင်ကွန်ကို နှိပ်၍ အရေးကြီးသောအပိုင်းများကို သိမ်းဆည်းထားနိုင်ပါသည်။",
    defaultPrimaryLabel: "Browse Lessons",
    defaultPrimaryLabelMm: "သင်ခန်းစာများ ကြည့်မည်"
  },
  no_notes: {
    icon: FileText,
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "No personal notes yet",
    titleMm: "ကိုယ်ပိုင်မှတ်စုများ မရှိသေးပါ",
    description: "Write down your thoughts, reminders, and cheat-sheets while studying lessons.",
    descriptionMm: "သင်ခန်းစာများ လေ့လာရင်း မှတ်သားထားလိုသော အချက်အလက်များနှင့် မှတ်စုများကို ရေးသားသိမ်းဆည်းနိုင်ပါသည်။",
    defaultPrimaryLabel: "Add First Note",
    defaultPrimaryLabelMm: "ပထမဆုံး မှတ်စုရေးမည်"
  },
  no_search_results: {
    icon: Search,
    iconBg: "bg-slate-500/10 dark:bg-slate-500/15 border-slate-500/20",
    iconColor: "text-slate-600 dark:text-slate-400",
    title: "No matching results found",
    titleMm: "ရှာဖွေမှုရလဒ် မတွေ့ရှိပါ",
    description: "We couldn't find anything matching your search term. Try different keywords or browse categories.",
    descriptionMm: "သင်ရှာဖွေသော စာလုံးနှင့် ကိုက်ညီသည့်အရာ မတွေ့ရှိပါ။ စာလုံးပေါင်းစစ်ဆေးပါ သို့မဟုတ် အခြားစကားလုံးဖြင့် ရှာကြည့်ပါ။",
    defaultPrimaryLabel: "Clear Search",
    defaultPrimaryLabelMm: "ရှာဖွေမှုကို ရှင်းလင်းမည်"
  },
  no_projects: {
    icon: Code,
    iconBg: "bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/20",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    title: "No projects created yet",
    titleMm: "ပရောဂျက်များ မဖန်တီးရသေးပါ",
    description: "Put theory into practice by building real-world web apps, games, and tools.",
    descriptionMm: "သင်ယူထားသော ပညာရပ်များကို လက်တွေ့အသုံးချပြီး Web App များနှင့် Game များကို စတင်တည်ဆောက်လိုက်ပါ။",
    defaultPrimaryLabel: "Explore Projects",
    defaultPrimaryLabelMm: "ပရောဂျက်များ ကြည့်မည်"
  },
  no_notifications: {
    icon: Bell,
    iconBg: "bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/20",
    iconColor: "text-sky-600 dark:text-sky-400",
    title: "No notifications right now",
    titleMm: "အသိပေးချက် အသစ်မရှိသေးပါ",
    description: "You're all caught up! Updates about course progress and new rewards will appear here.",
    descriptionMm: "အသိပေးချက်များ အားလုံးကြည့်ရှုပြီးပါပြီ။ သင်တန်းအသစ်များနှင့် ဆုလာဘ်သတင်းများ ဤနေရာတွင် ပေါ်လာပါမည်။",
    defaultPrimaryLabel: "Back to Home",
    defaultPrimaryLabelMm: "ပင်မစာမျက်နှာသို့"
  },
  no_discussions: {
    icon: MessageSquare,
    iconBg: "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
    title: "No discussions here yet",
    titleMm: "ဆွေးနွေးမေးမြန်းချက်များ မရှိသေးပါ",
    description: "Be the first to ask a question, share an insight, or start a programming discussion!",
    descriptionMm: "ပထမဆုံးအနေဖြင့် မေးခွန်းမေးမြန်းခြင်း သို့မဟုတ် ကုဒ်ရေးသားခြင်းဆိုင်ရာ အကြံပြုချက်များကို စတင်ဆွေးနွေးလိုက်ပါ။",
    defaultPrimaryLabel: "Start a Discussion",
    defaultPrimaryLabelMm: "ဆွေးနွေးချက် စတင်မည်"
  },
  no_history: {
    icon: Trophy,
    iconBg: "bg-teal-500/10 dark:bg-teal-500/15 border-teal-500/20",
    iconColor: "text-teal-600 dark:text-teal-400",
    title: "No recent activity recorded",
    titleMm: "မကြာသေးမီက လှုပ်ရှားမှုမှတ်တမ်း မရှိပါ",
    description: "Your quiz submissions, lesson completions, and streak logs will be tracked here.",
    descriptionMm: "သင်ခန်းစာလေ့လာမှုများနှင့် Quiz ဖြေဆိုမှုမှတ်တမ်းများကို ဤနေရာတွင် အလိုအလျောက် မှတ်တမ်းတင်ပေးပါမည်။",
    defaultPrimaryLabel: "Start a Lesson",
    defaultPrimaryLabelMm: "သင်ခန်းစာ စတင်လေ့လာမည်"
  },
  no_goals: {
    icon: Sparkles,
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    title: "No learning goals set",
    titleMm: "လေ့လာမှု ရည်မှန်းချက် မသတ်မှတ်ရသေးပါ",
    description: "Set daily or weekly targets to stay motivated and build a solid programming habit.",
    descriptionMm: "နေ့စဉ် သို့မဟုတ် အပတ်စဉ် သင်ယူမှုပန်းတိုင်များ သတ်မှတ်ပြီး ပရိုဂရမ်မင်း အလေ့အကျင့်ကောင်းကို တည်ဆောက်ပါ။",
    defaultPrimaryLabel: "Set a Goal",
    defaultPrimaryLabelMm: "ပန်းတိုင်အသစ် သတ်မှတ်မည်"
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = "custom",
  icon: CustomIcon,
  title,
  titleMm,
  description,
  descriptionMm,
  primaryAction,
  secondaryAction,
  className = "",
  compact = false,
  helpTipMm
}) => {
  const preset = variant !== "custom" ? PRESET_CONFIGS[variant] : null;

  const IconComponent = CustomIcon || (preset ? preset.icon : BookOpen);
  const iconBg = preset ? preset.iconBg : "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20";
  const iconColor = preset ? preset.iconColor : "text-blue-600 dark:text-blue-400";
  
  const displayTitle = title || (preset ? preset.title : "No items found");
  const displayTitleMm = titleMm || (preset ? preset.titleMm : "အချက်အလက်များ မရှိသေးပါ");
  const displayDesc = description || (preset ? preset.description : "There is no content available in this section at the moment.");
  const displayDescMm = descriptionMm || (preset ? preset.descriptionMm : "လက်ရှိတွင် ဖော်ပြစရာ အချက်အလက် မရှိသေးပါ။");
  const displayHelpTip = helpTipMm || (preset ? preset.helpTipMm : undefined);

  return (
    <div 
      className={`w-full rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-center transition-all ${
        compact ? "p-6 sm:p-8" : "p-8 sm:p-12"
      } ${className}`}
      role="region"
      aria-label={displayTitle}
    >
      <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-4">
        {/* Visual Icon Badge */}
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl ${iconBg} border flex items-center justify-center shadow-inner transition-transform hover:scale-105 duration-200`}>
          <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${iconColor}`} aria-hidden="true" />
        </div>

        {/* Text Header & Myanmar Explanation */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <span>{displayTitle}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
            {displayTitleMm}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {displayDescMm}
          </p>
        </div>

        {/* Optional Beginner Guidance Tip */}
        {displayHelpTip && (
          <div className="w-full p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-800 dark:text-blue-200 text-left flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{displayHelpTip}</span>
          </div>
        )}

        {/* Call to Actions (Touch targets min 44-48px) */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full">
            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 focus-visible:ring-4 focus-visible:ring-blue-500 focus:outline-none"
              >
                {primaryAction.icon ? (
                  <primaryAction.icon className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{primaryAction.labelMm || primaryAction.label}</span>
              </button>
            )}

            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 focus-visible:ring-4 focus-visible:ring-slate-400 focus:outline-none"
              >
                {secondaryAction.icon && (
                  <secondaryAction.icon className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{secondaryAction.labelMm || secondaryAction.label}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
