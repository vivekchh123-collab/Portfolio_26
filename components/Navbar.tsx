"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Edit3, X, Sun, Moon } from "lucide-react";
import { useProfile } from "@/app/layout";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    name,
    setName,
    quote,
    setQuote,
    profileImg,
    setProfileImg,
    signature,
    setSignature,
  } = useProfile();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle Dark Mode on <html> tag
  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* TOP LEFT: Custom V Logo Button (Replaces Three Dots) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center focus:outline-none"
              aria-label="Options Menu"
            >
              {/* Custom SVG recreating the geometric V logo */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-black dark:text-white fill-current transition"
              >
                <path d="M 10 20 L 50 90 L 90 20 L 72 20 L 50 62 L 38 40 L 52 40 L 40 20 Z" />
              </svg>
            </button>

            {/* Left-Aligned Dropdown Menu */}
            {isOpen && (
              <div className="absolute left-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                {/* Dark Mode / Light Mode Switch */}
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                >
                  <span className="flex items-center gap-2">
                    {isDarkMode ? (
                      <Sun size={16} className="text-amber-400" />
                    ) : (
                      <Moon size={16} className="text-indigo-600" />
                    )}
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                  <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">
                    {isDarkMode ? "ON" : "OFF"}
                  </span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                {/* Edit Modal Trigger */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                >
                  <Edit3
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Edit Homepage Content
                </button>
              </div>
            )}
          </div>

          {/* Right Navigation Links */}
          <div className="flex gap-8 font-medium text-slate-600 dark:text-slate-300 text-sm tracking-wide">
            <Link
              href="/"
              className="hover:text-black dark:hover:text-white transition"
            >
              About Me
            </Link>
            <Link
              href="/projects"
              className="hover:text-black dark:hover:text-white transition"
            >
              Portfolio
            </Link>
            <Link
              href="/resume"
              className="hover:text-black dark:hover:text-white transition"
            >
              Resume
            </Link>
            <Link
              href="/cv"
              className="hover:text-black dark:hover:text-white transition"
            >
              CV
            </Link>
          </div>
        </div>
      </nav>

      {/* Edit Content Modal (Dark / Light Theme Compatible) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black dark:hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
              Edit Hero Section
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Name Heading
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Quote / Tagline
                </label>
                <input
                  type="text"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Profile Image URL
                </label>
                <input
                  type="text"
                  value={profileImg}
                  onChange={(e) => setProfileImg(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Auto-Signature Text
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-indigo-600"
                />
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition mt-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </>
  );
}
