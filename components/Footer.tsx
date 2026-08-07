"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ShieldCheck, FileText, Lock, Activity, Mail } from "lucide-react";

export default function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-8 px-6 text-xs transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Side: V Logo & Copyright */}
          <div className="flex items-center gap-3">
            {/* Custom V Logo */}
            <div className="w-5 h-5 flex items-center justify-center text-black dark:text-white fill-current">
              <svg
                width="20"
                height="20"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-current"
              >
                <path d="M 10 20 L 50 90 L 90 20 L 72 20 L 50 62 L 38 40 L 52 40 L 40 20 Z" />
              </svg>
            </div>

            <span className="font-medium text-slate-800 dark:text-slate-200">
              © 2026 ViHub, Inc.
            </span>
          </div>

          {/* Right Side: Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setActiveModal("terms")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition cursor-pointer"
            >
              Terms
            </button>
            <button
              onClick={() => setActiveModal("privacy")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition cursor-pointer"
            >
              Privacy
            </button>
            <button
              onClick={() => setActiveModal("security")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition cursor-pointer"
            >
              Security
            </button>
            <button
              onClick={() => setActiveModal("status")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition cursor-pointer"
            >
              Status
            </button>
            <Link
              href="/projects"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition"
            >
              Docs
            </Link>
            <button
              onClick={() => setActiveModal("contact")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition cursor-pointer"
            >
              Contact
            </button>
            <button
              onClick={() => setActiveModal("privacy")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition cursor-pointer"
            >
              Do not share my personal information
            </button>
          </div>
        </div>
      </footer>

      {/* --- INFORMATIONAL POPUP MODALS --- */}
      {activeModal && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative text-slate-900 dark:text-slate-100 space-y-4"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>

            {activeModal === "terms" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  <FileText size={20} /> Terms of Service
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Welcome to ViHub, Inc. By accessing or using this portfolio
                  application, you agree to respect all intellectual property
                  rights presented herein. Content and showcased applications
                  are protected for demonstration purposes.
                </p>
              </div>
            )}

            {activeModal === "privacy" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  <Lock size={20} /> Privacy & Data Policy
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  ViHub respects user privacy. Profile data, showcase items, and
                  resume configurations are securely managed via Supabase and
                  Clerk authentication. No personal data is shared with third
                  parties without your direct consent.
                </p>
              </div>
            )}

            {activeModal === "security" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  <ShieldCheck size={20} /> Security Information
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Our platform utilizes standard Next.js security headers,
                  Row-Level Security (RLS) policies on Supabase, encrypted Clerk
                  session tokens, and password protection for sensitive resume
                  content.
                </p>
              </div>
            )}

            {activeModal === "status" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                  <Activity size={20} /> System Status
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  All ViHub services operational (100% Uptime)
                </div>
              </div>
            )}

            {activeModal === "contact" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  <Mail size={20} /> Contact ViHub
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  For inquiries, project collaborations, or engineering
                  feedback, feel free to connect via GitHub or LeetCode from the
                  top-right navigation menu, or email me at
                  trackerrproo@gmail.com.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
