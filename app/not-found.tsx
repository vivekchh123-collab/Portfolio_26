import { Suspense } from "react";
import Link from "next/link";

function NotFoundContent() {
  return (
    <main className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">
          404
        </h1>
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <NotFoundContent />
    </Suspense>
  );
}
