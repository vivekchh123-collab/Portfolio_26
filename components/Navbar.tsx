"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import {
  Edit3,
  Sun,
  Moon,
  FileText,
  ChevronDown,
  Globe,
  Layers,
  LogIn,
  UserPlus,
  Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import CertificateIcon from "@/components/icons/CertificateIcon";
import HomeEditorModal from "./editor/HomeEditorModal";
import ProjectsEditorModal, {
  CustomLinkItem,
} from "./editor/ProjectsEditorModal";
import CertificateEditorModal, {
  CertificateItem,
} from "./editor/CertificateEditorModal";
import AppShowcaseEditorModal, {
  ProjectItem,
} from "./editor/AppShowcaseEditorModal";
import ResumeEditorModal, { ResumeData } from "./editor/ResumeEditorModal";

const DEFAULT_LINKS: CustomLinkItem[] = [
  {
    id: "1",
    title: "GitHub",
    url: "https://github.com/vivekchh123-collab",
    icon: "",
  },
  {
    id: "2",
    title: "LeetCode",
    url: "https://leetcode.com/u/vivek_chaurasiya_14/",
    icon: "",
  },
];

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const viewUserId = searchParams.get("viewUser");
  const queryParam = viewUserId ? `?viewUser=${viewUserId}` : "";

  const [isOpen, setIsOpen] = useState(false);
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);

  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  const targetUserId = viewUserId || user?.id;

  // Editor Modal States
  const [isHomeEditModalOpen, setIsHomeEditModalOpen] = useState(false);
  const [isProjectsEditModalOpen, setIsProjectsEditModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isAppShowcaseModalOpen, setIsAppShowcaseModalOpen] = useState(false);
  const [isResumeEditModalOpen, setIsResumeEditModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [customLinks, setCustomLinks] =
    useState<CustomLinkItem[]>(DEFAULT_LINKS);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [resumeData, setResumeData] = useState<ResumeData>({});

  const handleProtectedAction = (action: () => void) => {
    setIsOpen(false);
    if (!isSignedIn) {
      openSignIn();
    } else {
      action();
    }
  };

  const loadSupabaseData = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("custom_links, certificates, projects, resume_data")
        .eq("user_id", targetUserId)
        .single();

      if (data && !error) {
        if (
          data.custom_links &&
          Array.isArray(data.custom_links) &&
          data.custom_links.length > 0
        ) {
          setCustomLinks(data.custom_links);
        }
        if (data.certificates && Array.isArray(data.certificates)) {
          setCertificates(data.certificates);
        }
        if (data.projects && Array.isArray(data.projects)) {
          setProjects(data.projects);
        }
        if (data.resume_data && typeof data.resume_data === "object") {
          setResumeData(data.resume_data as ResumeData);
        }
      }
    } catch (e) {
      console.error("Failed to load Navbar data from Supabase", e);
    }
  }, [targetUserId]);

  useEffect(() => {
    loadSupabaseData();

    window.addEventListener("developer-links-updated", loadSupabaseData);
    window.addEventListener("certificates-updated", loadSupabaseData);
    window.addEventListener("projects-updated", loadSupabaseData);
    window.addEventListener("resume-updated", loadSupabaseData);

    return () => {
      window.removeEventListener("developer-links-updated", loadSupabaseData);
      window.removeEventListener("certificates-updated", loadSupabaseData);
      window.removeEventListener("projects-updated", loadSupabaseData);
      window.removeEventListener("resume-updated", loadSupabaseData);
    };
  }, [loadSupabaseData]);

  const menuRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

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
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          {/* LOGO & MENU */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 100 100"
                  fill="none"
                  className="text-black dark:text-white fill-current transition"
                >
                  <path d="M 10 20 L 50 90 L 90 20 L 72 20 L 50 62 L 38 40 L 52 40 L 40 20 Z" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                  <button
                    onClick={() =>
                      handleProtectedAction(() => setIsHomeEditModalOpen(true))
                    }
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Edit3
                        size={16}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                      <span>Edit Hero / About</span>
                    </div>
                    {!isSignedIn && (
                      <Lock size={14} className="text-amber-500" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      handleProtectedAction(() =>
                        setIsAppShowcaseModalOpen(true),
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Layers
                        size={16}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                      <span>Edit Projects</span>
                    </div>
                    {!isSignedIn && <Lock size={14} />}
                  </button>

                  <button
                    onClick={() =>
                      handleProtectedAction(() =>
                        setIsCertificateModalOpen(true),
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <CertificateIcon
                        size={16}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                      <span>Edit Certificates</span>
                    </div>
                    {!isSignedIn && <Lock size={14} />}
                  </button>

                  <button
                    onClick={() =>
                      handleProtectedAction(() =>
                        setIsProjectsEditModalOpen(true),
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Globe
                        size={16}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                      <span>Edit Social / Dev Links</span>
                    </div>
                    {!isSignedIn && <Lock size={14} />}
                  </button>

                  <button
                    onClick={() =>
                      handleProtectedAction(() =>
                        setIsResumeEditModalOpen(true),
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText
                        size={16}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                      <span>Edit Resume</span>
                    </div>
                    {!isSignedIn && <Lock size={14} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* NAV LINKS */}
          <div className="flex gap-4 sm:gap-6 items-center font-medium text-slate-600 dark:text-slate-300 text-sm tracking-wide">
            <Link
              href={`/${queryParam}`}
              className="hover:text-black dark:hover:text-white transition"
            >
              About Me
            </Link>

            {/* PROJECTS & SOCIAL DROPDOWN */}
            <div className="relative flex items-center" ref={projectsRef}>
              <Link
                href={`/projects${queryParam}`}
                className="hover:text-black dark:hover:text-white transition py-2"
              >
                Project
              </Link>

              <button
                onClick={() =>
                  setIsProjectsDropdownOpen(!isProjectsDropdownOpen)
                }
                className="p-1 hover:text-black dark:hover:text-white transition cursor-pointer ml-0.5"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isProjectsDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isProjectsDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                  {customLinks.map((link) => {
                    const safeHref = link.url.startsWith("http")
                      ? link.url
                      : `https://${link.url}`;
                    return (
                      <a
                        key={link.id}
                        href={safeHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsProjectsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          {link.icon ? (
                            <img
                              src={link.icon}
                              alt={link.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Globe size={13} className="text-slate-500" />
                          )}
                        </div>
                        <span className="truncate">{link.title}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CERTIFICATE LINK WITH CUSTOM BADGE */}
            <Link
              href={`/certificates${queryParam}`}
              className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition"
            >
              <CertificateIcon
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />
              <span>Certificates</span>
            </Link>

            <Link
              href={`/resume${queryParam}`}
              className="hover:text-black dark:hover:text-white transition"
            >
              Resume
            </Link>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-indigo-600" />
              )}
            </button>

            {isLoaded && !isSignedIn && (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer">
                    <LogIn size={14} /> Log In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer">
                    <UserPlus size={14} /> Sign Up
                  </button>
                </SignUpButton>
              </div>
            )}

            {isLoaded && isSignedIn && <UserButton />}
          </div>
        </div>
      </nav>

      {isSignedIn && (
        <>
          <HomeEditorModal
            isOpen={isHomeEditModalOpen}
            onClose={() => setIsHomeEditModalOpen(false)}
          />
          <ProjectsEditorModal
            isOpen={isProjectsEditModalOpen}
            onClose={() => setIsProjectsEditModalOpen(false)}
            customLinks={customLinks}
            setCustomLinks={setCustomLinks}
          />
          <CertificateEditorModal
            isOpen={isCertificateModalOpen}
            onClose={() => setIsCertificateModalOpen(false)}
            certificates={certificates}
            setCertificates={setCertificates}
          />
          <AppShowcaseEditorModal
            isOpen={isAppShowcaseModalOpen}
            onClose={() => setIsAppShowcaseModalOpen(false)}
            projects={projects}
            setProjects={setProjects}
          />
          <ResumeEditorModal
            isOpen={isResumeEditModalOpen}
            onClose={() => setIsResumeEditModalOpen(false)}
            resumeData={resumeData}
            setResumeData={setResumeData}
          />
        </>
      )}
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <nav className="h-20 w-full fixed top-0 left-0 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 z-40" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
