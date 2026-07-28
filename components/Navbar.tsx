"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Edit3,
  Sun,
  Moon,
  FileText,
  ChevronDown,
  Code2,
  Layers,
} from "lucide-react";
import HomeEditorModal from "./editor/HomeEditorModal";
import ProjectsEditorModal from "./editor/ProjectsEditorModal";
import AppShowcaseEditorModal, {
  ProjectItem,
} from "./editor/AppShowcaseEditorModal";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);

  // Editor Modal States
  const [isHomeEditModalOpen, setIsHomeEditModalOpen] = useState(false);
  const [isProjectsEditModalOpen, setIsProjectsEditModalOpen] = useState(false);
  const [isAppShowcaseModalOpen, setIsAppShowcaseModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Dynamic Profile URLs
  const [githubUrl, setGithubUrl] = useState(
    "https://github.com/vivekchh123-collab",
  );
  const [leetcodeUrl, setLeetcodeUrl] = useState(
    "https://leetcode.com/u/vivek_chaurasiya_14/",
  );

  // Dynamic Projects State
  const defaultProjects: ProjectItem[] = [
    {
      id: "1",
      name: "Personal Performance Tracker",
      description:
        "Habit tracking and data visualization app analyzing daily routines and productivity trends.",
      appUrl: "https://tracker-pro.example.com",
      techStack: ["Next.js", "Node.js", "Prisma", "PostgreSQL"],
      images: [],
    },
  ];

  const [projects, setProjects] = useState<ProjectItem[]>(defaultProjects);

  const menuRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Load and sync projects from localStorage
  useEffect(() => {
    const loadProjects = () => {
      const saved = localStorage.getItem("user_projects_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
          }
        } catch (e) {
          console.error("Failed to parse projects in Navbar", e);
        }
      }
    };

    loadProjects();
    window.addEventListener("projects-updated", loadProjects);
    return () => window.removeEventListener("projects-updated", loadProjects);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (
        projectsRef.current &&
        !projectsRef.current.contains(event.target as Node)
      ) {
        setIsProjectsDropdownOpen(false);
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

            {/* V Logo Editor Options */}
            {isOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                {pathname === "/resume" ? (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(
                        new CustomEvent("open-resume-editor"),
                      );
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <FileText
                      size={16}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    Edit Resume Content
                  </button>
                ) : pathname === "/projects" ? (
                  <>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setIsAppShowcaseModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                    >
                      <Layers
                        size={16}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                      Edit Projects Showcase
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setIsProjectsEditModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                    >
                      <Code2
                        size={16}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                      Edit Developer Links
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsHomeEditModalOpen(true);
                    }}
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

          {/* Top Right Navigation Links + Dark Mode Button */}
          <div className="flex gap-8 items-center font-medium text-slate-600 dark:text-slate-300 text-sm tracking-wide">
            <Link
              href="/"
              className="hover:text-black dark:hover:text-white transition"
            >
              About Me
            </Link>

            {/* PROJECT LINK + DROPDOWN ARROW */}
            <div className="relative flex items-center" ref={projectsRef}>
              <Link
                href="/projects"
                className="hover:text-black dark:hover:text-white transition py-2"
              >
                Project
              </Link>

              <button
                onClick={() =>
                  setIsProjectsDropdownOpen(!isProjectsDropdownOpen)
                }
                className="p-1 hover:text-black dark:hover:text-white transition focus:outline-none cursor-pointer ml-0.5"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isProjectsDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* GitHub & LeetCode Menu */}
              {isProjectsDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsProjectsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black p-0.5">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-full h-full fill-current"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    <span>GitHub</span>
                  </a>

                  <a
                    href={leetcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsProjectsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path
                          fill="#FFA116"
                          d="M16.102 17.93l-2.697 2.607c-.466.451-1.211.451-1.677 0l-7.231-6.992a3.864 3.864 0 010-5.462l7.23-6.992c.466-.451 1.212-.451 1.678 0l2.697 2.607a1.189 1.189 0 010 1.681l-4.717 4.561a1.189 1.189 0 000 1.681l4.717 4.561a1.189 1.189 0 010 1.681z"
                        />
                        <path
                          fill="#282828"
                          className="dark:fill-white transition"
                          d="M10.887 12.841h9.113c.656 0 1.188-.532 1.188-1.188s-.532-1.188-1.188-1.188h-9.113c-.656 0-1.188.532-1.188 1.188s.532 1.188 1.188 1.188z"
                        />
                      </svg>
                    </div>
                    <span>LeetCode</span>
                  </a>
                </div>
              )}
            </div>

            <Link
              href="/resume"
              className="hover:text-black dark:hover:text-white transition"
            >
              Resume
            </Link>

            {/* TOP RIGHT DARK MODE BUTTON */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200 cursor-pointer"
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Editor Components */}
      <HomeEditorModal
        isOpen={isHomeEditModalOpen}
        onClose={() => setIsHomeEditModalOpen(false)}
      />

      <ProjectsEditorModal
        isOpen={isProjectsEditModalOpen}
        onClose={() => setIsProjectsEditModalOpen(false)}
        githubUrl={githubUrl}
        setGithubUrl={setGithubUrl}
        leetcodeUrl={leetcodeUrl}
        setLeetcodeUrl={setLeetcodeUrl}
      />

      <AppShowcaseEditorModal
        isOpen={isAppShowcaseModalOpen}
        onClose={() => setIsAppShowcaseModalOpen(false)}
        projects={projects}
        setProjects={setProjects}
      />
    </>
  );
}
