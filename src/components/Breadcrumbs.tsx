/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  isCurrent?: boolean;
  badge?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = "" }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto scrollbar-none py-1.5 max-w-full ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1 || item.isCurrent;
        const Icon = item.icon;

        return (
          <div key={index} className="flex items-center space-x-1.5 flex-shrink-0">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
            )}

            {isLast ? (
              <span 
                className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 max-w-[200px] sm:max-w-[320px] truncate"
                aria-current="page"
                title={item.label}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/20 flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </span>
            ) : item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer max-w-[160px] sm:max-w-[220px] truncate"
                title={item.label}
              >
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />}
                <span className="truncate">{item.label}</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium max-w-[160px] truncate">
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="truncate">{item.label}</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
