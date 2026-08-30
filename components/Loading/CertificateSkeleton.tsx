export default function CertificateSkeleton() {
  return (
    <main className="min-h-[calc(100vh-5rem)] pt-24 pb-12 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-colors animate-pulse">
      <div className="w-full max-w-6xl mx-auto space-y-10 flex flex-col items-center px-4 sm:px-0">
        {/* Top Header Row Skeleton */}
        <div className="w-full flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-80 bg-slate-200 dark:bg-slate-800/60 rounded-md" />
          </div>
          <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Certificate Card Skeleton */}
        <div className="w-full space-y-8 flex flex-col items-center">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between"
            >
              {/* Header Skeleton */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-3.5 w-44 bg-indigo-950/70 rounded-md" />
                  <div className="h-8 sm:h-9 w-60 sm:w-80 bg-slate-800 rounded-xl" />
                </div>
                <div className="h-9 w-36 bg-slate-800 rounded-xl" />
              </div>

              {/* Side-by-Side Split Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left Image Placeholder */}
                <div className="md:col-span-6 lg:col-span-5">
                  <div className="aspect-[16/10] w-full rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-3 left-3 h-5 w-12 rounded-lg bg-slate-800" />
                  </div>
                </div>

                {/* Right Details Placeholder */}
                <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-center space-y-3 p-2">
                  <div className="h-3 w-32 bg-indigo-950/80 rounded" />
                  <div className="h-5 w-full bg-slate-800/80 rounded-md" />
                  <div className="h-5 w-4/5 bg-slate-800/80 rounded-md" />
                  <div className="h-5 w-2/3 bg-slate-800/80 rounded-md" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-24 bg-slate-800 rounded-xl" />
                  <div className="h-9 w-32 bg-slate-800 rounded-xl" />
                </div>
                <div className="h-9 w-24 bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
