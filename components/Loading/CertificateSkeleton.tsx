export default function CertificateSkeleton() {
  return (
    <main className="min-h-[calc(100vh-5rem)] pt-24 pb-12 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-colors animate-pulse">
      <div className="w-full max-w-6xl mx-auto space-y-12 flex flex-col items-center px-4 sm:px-6">
        {/* Certificate Card Skeleton */}
        <div className="w-full max-w-6xl bg-sky-100/40 dark:bg-slate-900/40 border border-sky-200/50 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 flex flex-col justify-between min-h-[520px]">
          {/* Header Skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-indigo-200 dark:bg-indigo-950/60 rounded-md" />
              <div className="h-9 sm:h-11 w-72 sm:w-96 bg-slate-300 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>

          {/* Certificate Image Frame Skeleton */}
          <div className="space-y-3">
            <div className="w-full h-72 sm:h-80 md:h-96 rounded-2xl bg-slate-200 dark:bg-slate-950/80 border border-slate-300/40 dark:border-slate-800" />
            <div className="flex items-center gap-3 pt-1">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-12 w-16 bg-slate-300 dark:bg-slate-800 rounded-lg" />
              <div className="h-12 w-16 bg-slate-300 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>

          {/* Details & Action Bar Skeleton */}
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>

            <div className="pt-4 border-t border-slate-300/40 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
              <div className="h-9 w-24 bg-slate-300 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
