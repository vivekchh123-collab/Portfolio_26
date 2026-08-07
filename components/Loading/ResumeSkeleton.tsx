"use client";

import React from "react";

export default function ResumeSkeleton() {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center pt-20 pb-10 px-4 overflow-hidden select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[750px]">
          {/* Left Sidebar Skeleton */}
          <div className="md:col-span-5 bg-slate-800/50 p-8 flex flex-col gap-6 border-r border-slate-800">
            <div className="w-40 h-48 bg-slate-800 rounded-xl mx-auto" />
            <div className="space-y-3 pt-4">
              <div className="h-6 w-full bg-slate-800 rounded-lg" />
              <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
              <div className="h-4 w-4/6 bg-slate-800/60 rounded" />
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-6 w-full bg-slate-800 rounded-lg" />
              <div className="h-4 w-3/4 bg-slate-800/60 rounded" />
              <div className="h-4 w-2/4 bg-slate-800/60 rounded" />
            </div>
          </div>

          {/* Right Main Content Skeleton */}
          <div className="md:col-span-7 p-10 bg-slate-900 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="h-12 w-3/4 bg-slate-800 rounded-xl" />
              <div className="h-6 w-1/2 bg-slate-800/60 rounded-lg" />
              <div className="h-1 w-full bg-slate-800 my-4" />
            </div>
            <div className="space-y-4">
              <div className="h-8 w-2/5 bg-slate-800 rounded-lg" />
              <div className="h-4 w-full bg-slate-800/60 rounded" />
              <div className="h-4 w-4/5 bg-slate-800/60 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-8 w-2/5 bg-slate-800 rounded-lg" />
              <div className="h-4 w-full bg-slate-800/60 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
