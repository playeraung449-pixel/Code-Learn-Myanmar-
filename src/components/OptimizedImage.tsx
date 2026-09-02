/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - High-Performance Optimized Image Component
 * Provides progressive blur loading, native lazy loading, zero layout shift (CLS protection),
 * Low-Bandwidth Data Saver adaptation, and network error recovery with retry.
 */

import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, RefreshCw, AlertCircle } from "lucide-react";
import { performanceManager } from "../lib/performanceManager";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string; // e.g. "16/9", "4/3", "1/1"
  fallbackSrc?: string;
  lowResPlaceholder?: string;
  className?: string;
  containerClassName?: string;
  showErrorRetry?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  aspectRatio,
  fallbackSrc,
  lowResPlaceholder,
  className = "",
  containerClassName = "",
  showErrorRetry = true,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [liteMode, setLiteMode] = useState(performanceManager.getState().liteMode);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const unsub = performanceManager.subscribe((st) => {
      setLiteMode(st.liteMode);
    });
    return unsub;
  }, []);

  // Reset states on src change or retry
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src, retryCount]);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoaded(false);
    setRetryCount((prev) => prev + 1);
  };

  // Add cache-busting timestamp on manual retry if needed
  const effectiveSrc = retryCount > 0 && src.startsWith("http") 
    ? `${src}${src.includes("?") ? "&" : "?"}_retry=${retryCount}` 
    : src;

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800/60 transition-colors ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* 1. Low-Resolution / Shimmer Skeleton Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/70 dark:bg-slate-800/80 animate-pulse z-0">
          {lowResPlaceholder ? (
            <img
              src={lowResPlaceholder}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover filter blur-md scale-105 opacity-60"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400 dark:text-slate-600 animate-pulse" />
          )}
        </div>
      )}

      {/* 2. Actual Optimized Image */}
      {!hasError && (
        <img
          ref={imgRef}
          src={effectiveSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      )}

      {/* 3. Error Fallback & Non-blocking Retry */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 z-10">
          <AlertCircle className="w-6 h-6 text-amber-500 mb-1" />
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            ပုံရိပ် မဖွင့်နိုင်ပါ
          </p>
          {showErrorRetry && (
            <button
              onClick={handleRetry}
              type="button"
              className="mt-2 inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <RefreshCw className="w-3 h-3 animate-spin-reverse" />
              <span>ပြန်စမ်းမည်</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
