"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Edit3, Sun, Moon, FileText } from "lucide-react";
import HomeEditorModal from "./editor/HomeEditorModal";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isHomeEditModalOpen, setIsHomeEditModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleEditClick = () => {
    setIsOpen(false);
    if (pathname === "/resume") {
      // Dispatches custom browser event to open resume editor
      window.dispatchEvent(new CustomEvent("open-resume-editor"));
    } else {
      setIsHomeEditModalOpen(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Top-Left V Logo Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center focus:outline-none cursor-pointer"
            >
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

            {isOpen && (
              <div className="absolute left-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                {/* Theme Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {isDarkMode ? (
                      <Sun size={16} className="text-amber-400" />
                    ) : (
                      <Moon size={16} className="text-indigo-600" />
                    )}
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                {/* Dynamic Editor Trigger */}
                {pathname === "/resume" ? (
                  <button
                    onClick={handleEditClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <FileText
                      size={16}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    Edit Resume Content
                  </button>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <Edit3
                      size={16}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    Edit Homepage Content
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
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
              Project
            </Link>
            <Link
              href="/resume"
              className="hover:text-black dark:hover:text-white transition"
            >
              Resume
            </Link>
          </div>
        </div>
      </nav>

      {/* Render Isolated Homepage Editor Component */}
      <HomeEditorModal
        isOpen={isHomeEditModalOpen}
        onClose={() => setIsHomeEditModalOpen(false)}
      />
    </>
  );
}
