"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MoreVertical,
  Edit3,
  ExternalLink,
  Home,
  FileText,
  Briefcase,
  Award,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="font-bold text-xl text-indigo-400 hover:text-indigo-300 transition"
        >
          Vivek<span className="text-white">.dev</span>
        </Link>

        {/* Main Navigation Links */}
        <div className="hidden md:flex gap-6 font-medium text-slate-300 text-sm">
          <Link href="/" className="hover:text-indigo-400 transition">
            Home
          </Link>
          <Link href="/resume" className="hover:text-indigo-400 transition">
            Resume
          </Link>
          <Link href="/cv" className="hover:text-indigo-400 transition">
            CV
          </Link>
          <Link href="/projects" className="hover:text-indigo-400 transition">
            Projects
          </Link>
        </div>

        {/* Side Corner Three-Dot Options Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Options"
          >
            <MoreVertical size={20} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-slate-200 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quick Navigation & Edit
              </div>

              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-800 hover:text-indigo-400 transition"
              >
                <Home size={16} /> Home Section
              </Link>

              <Link
                href="/resume"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-800 hover:text-indigo-400 transition"
              >
                <FileText size={16} /> Resume Details
              </Link>

              <Link
                href="/cv"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-800 hover:text-indigo-400 transition"
              >
                <Award size={16} /> Academic CV
              </Link>

              <Link
                href="/projects"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-800 hover:text-indigo-400 transition"
              >
                <Briefcase size={16} /> Projects List
              </Link>

              <div className="my-1 border-t border-slate-800" />

              {/* Edit Mode / Content Customizer action */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  alert(
                    "To edit content, update the respective files in VS Code under the app/ directory!",
                  );
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-indigo-400 hover:bg-slate-800 transition text-left"
              >
                <Edit3 size={16} /> Edit Page Content
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
