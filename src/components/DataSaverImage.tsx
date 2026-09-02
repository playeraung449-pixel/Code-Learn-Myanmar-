/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Data Saver Adaptive Image Component
 * Automatically serves compressed, low-bandwidth optimized images and defer loads
 * when Data Saver mode is enabled for mobile data economy.
 */

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Zap, Eye } from "lucide-react";
import { performanceManager } from "../lib/performanceManager";

interface DataSaverImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  lowResWidth?: number;
  lowResQuality?: number;
  allowManualFullLoad?: boolean;
}

export const DataSaverImage: React.FC<DataSaverImageProps> = ({
  src,
  alt,
  className = "",
  lowResWidth = 320,
  lowResQuality = 40,
  allowManualFullLoad = false,
  ...props
}) => {
  const [isDataSaver, setIsDataSaver] = useState<boolean>(performanceManager.isDataSaverActive());
  const [loadHighRes, setLoadHighRes] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const unsub = performanceManager.subscribe((state) => {
      setIsDataSaver(state.dataSaver.enabled && state.dataSaver.reduceImageQuality);
    });
    return unsub;
  }, []);

  const optimizedSrc = isDataSaver && !loadHighRes
    ? performanceManager.getOptimizedImageUrl(src, { width: lowResWidth, quality: lowResQuality })
    : src;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-slate-400 opacity-50" />
        </div>
      )}

      {hasError ? (
        <div className="w-full h-full min-h-[120px] bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-3 text-slate-400 text-xs">
          <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
          <span className="text-[10px] text-center font-mono">Image unavailable</span>
        </div>
      ) : (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={isDataSaver ? "lazy" : (props.loading || "lazy")}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${isDataSaver && !loadHighRes ? "filter contrast-95" : ""}`}
          {...props}
        />
      )}

      {/* Data Saver Low-Res Indicator & Manual Tap to Load High Res */}
      {isDataSaver && allowManualFullLoad && !loadHighRes && isLoaded && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLoadHighRes(true);
          }}
          className="absolute bottom-2 right-2 px-2 py-1 bg-slate-900/80 hover:bg-slate-900 text-amber-300 text-[9px] font-bold rounded-lg border border-amber-500/30 flex items-center space-x-1 shadow-sm backdrop-blur-sm transition-all cursor-pointer"
          title="Data Saver Active: Tap to load full HD image"
        >
          <Zap className="w-2.5 h-2.5 text-amber-400" />
          <span>HD ဖွင့်မည်</span>
        </button>
      )}
    </div>
  );
};
