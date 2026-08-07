"use client";

import React from "react";

export default function ProjectSkeleton() {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-start pt-24 pb-12 px-4 overflow-hidden select-none">
      <div className="w-full max-w-6xl mx-auto space-y-12 flex flex-col items-center">
        {/* Project Card Skeleton */}
        <div className="w-full max-w-6xl bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 flex flex-col justify-between min-h-[520px] animate-pulse">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="h-10 sm:h-12 w-2/5 bg-slate-800 rounded-2xl" />
            <div className="h-9 w-28 bg-slate-800 rounded-2xl" />
          </div>

          {/* Featured Image & Thumbnails */}
          <div className="space-y-3">
            <div className="w-full h-72 sm:h-80 md:h-96 rounded-2xl bg-slate-800/90 border border-slate-700/50" />
            <div className="flex items-center gap-3 pt-1">
              <div className="h-3 w-16 bg-slate-800 rounded" />
              <div className="h-12 w-16 bg-slate-800 rounded-lg shrink-0" />
              <div className="h-12 w-16 bg-slate-800 rounded-lg shrink-0" />
            </div>
          </div>

          {/* Details & Tech Stack */}
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <div className="h-3 w-28 bg-slate-800 rounded" />
              <div className="h-4 w-full bg-slate-800 rounded" />
              <div className="h-4 w-3/4 bg-slate-800 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-800 rounded" />
              <div className="flex flex-wrap gap-2">
                <div className="h-7 w-20 bg-slate-800 rounded-xl" />
                <div className="h-7 w-24 bg-slate-800 rounded-xl" />
                <div className="h-7 w-16 bg-slate-800 rounded-xl" />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-9 w-24 bg-slate-800 rounded-xl" />
                <div className="h-9 w-28 bg-slate-800 rounded-xl" />
              </div>
              <div className="h-9 w-20 bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
