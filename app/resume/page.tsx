"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Printer,
  Lock,
  Unlock,
  ExternalLink,
} from "lucide-react";
import { Great_Vibes } from "next/font/google";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import ResumeEditorModal, {
  ResumeData,
} from "@/components/editor/ResumeEditorModal";

const signatureFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function ResumePage() {
  const { user } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Default Fallback Resume Data
  const defaultResume: ResumeData = {
    password: "1234",
    name: "Olivia Wilson",
    role: "DESIGNER AND ARCHITECT",
    aboutMe:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi.",
    phone: "+123-456-7890",
    email: "hello@reallygreatsite.com",
    socials: [
      { id: "1", platform: "LinkedIn", url: "https://linkedin.com" },
      { id: "2", platform: "Portfolio", url: "https://reallygreatsite.com" },
    ],
    address: "123 Anywhere St., Any City, ST 12345",
    photoUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    skills: [
      "Editing Software",
      "Architectural Software",
      "Photo Editing",
      "Video Editing",
    ],
    languages: ["Spanish", "English", "Italian"],
    workExperience: [
      {
        title: "DESIGNER AND TEAM LEADER",
        company: "Wardiere Inc.",
        period: "2020 - 2025",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        title: "ARCHITECT",
        company: "Larana Company",
        period: "2015 - 2020",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
    ],
    education: [
      {
        degree: "BACHELOR OF DESIGN",
        school: "Borcelle University",
        period: "2008 - 2012",
      },
      {
        degree: "BACHELOR OF ARCHITECTURE",
        school: "Borcelle University",
        period: "2005 - 2009",
      },
    ],
  };

  const [resumeData, setResumeData] = useState<ResumeData>(defaultResume);

  // Fetch resume data directly from Supabase
  const loadResumeDataFromSupabase = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("resume_data")
        .eq("user_id", user.id)
        .single();

      if (
        data?.resume_data &&
        typeof data.resume_data === "object" &&
        Object.keys(data.resume_data).length > 0 &&
        !error
      ) {
        setResumeData(data.resume_data as ResumeData);
      }
    } catch (e) {
      console.error("Failed to load resume data from Supabase", e);
    }
  };

  useEffect(() => {
    loadResumeDataFromSupabase();

    const handleOpenEditor = () => setIsEditorOpen(true);
    window.addEventListener("open-resume-editor", handleOpenEditor);
    window.addEventListener("resume-updated", loadResumeDataFromSupabase);

    return () => {
      window.removeEventListener("open-resume-editor", handleOpenEditor);
      window.removeEventListener("resume-updated", loadResumeDataFromSupabase);
    };
  }, [user]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === (resumeData?.password || "1234")) {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect Password! Try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedName = resumeData?.name || "Olivia Wilson";
  const nameParts = formattedName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <main className="min-h-screen pt-24 pb-10 px-4 flex flex-col items-center justify-center relative z-10">
      {/* TOP ACTION BAR */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 print:hidden h-10">
        <h1 className="text-xl font-bold dark:text-white">
          Interactive Resume
        </h1>
        <div>
          {isAuthenticated && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-sm transition cursor-pointer shadow-md"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {/* Main Resume Card Frame */}
      <div className="printable-resume relative w-full max-w-4xl bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* BLUR OVERLAY FOR PASSWORD PROTECTION */}
        {!isAuthenticated && (
          <div className="absolute inset-0 z-30 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-6 print:hidden">
            <form
              onSubmit={handlePasswordSubmit}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-4 pointer-events-auto"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Lock size={24} />
              </div>
              <h2 className="text-xl font-bold dark:text-white">
                Protected Resume
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please enter password to view full resume details.
              </p>
              <input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-3 border rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:outline-indigo-600"
              />
              {errorMsg && (
                <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock size={16} /> Unlock Resume
              </button>
            </form>
          </div>
        )}

        {/* RESUME TEMPLATE CONTENT */}
        <div
          className={`grid grid-cols-1 md:grid-cols-12 min-h-[1000px] ${
            !isAuthenticated
              ? "filter blur-md select-none pointer-events-none"
              : ""
          }`}
        >
          {/* LEFT SIDEBAR (BLUSH PINK) */}
          <div className="md:col-span-5 bg-[#f3e5e3] p-8 flex flex-col gap-8 border-r border-slate-200/50">
            {/* Photo Box */}
            {resumeData?.photoUrl && (
              <div className="p-3 bg-white shadow-md rounded-xl inline-block mx-auto">
                <div className="w-48 h-56 overflow-hidden border-2 border-[#d9b8b3]">
                  <img
                    src={resumeData.photoUrl}
                    alt={formattedName}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>
            )}

            {/* About Me */}
            {resumeData?.aboutMe && (
              <div className="space-y-3">
                <h3 className="bg-white py-1 px-4 text-center font-bold tracking-widest text-sm text-slate-800 uppercase shadow-sm">
                  ABOUT ME
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed text-justify px-1">
                  {resumeData.aboutMe}
                </p>
              </div>
            )}

            {/* Contact & Dynamic Social Media Links */}
            <div className="space-y-3">
              <h3 className="bg-white py-1 px-4 text-center font-bold tracking-widest text-sm text-slate-800 uppercase shadow-sm">
                CONTACT & SOCIALS
              </h3>
              <div className="space-y-2.5 text-xs text-slate-700 px-1">
                {resumeData?.phone && (
                  <p className="flex items-center gap-3">
                    <Phone size={14} className="text-[#a87068] shrink-0" />
                    <span>{resumeData.phone}</span>
                  </p>
                )}
                {resumeData?.email && (
                  <p className="flex items-center gap-3">
                    <Mail size={14} className="text-[#a87068] shrink-0" />
                    <span>{resumeData.email}</span>
                  </p>
                )}
                {resumeData?.address && (
                  <p className="flex items-center gap-3">
                    <MapPin size={14} className="text-[#a87068] shrink-0" />
                    <span>{resumeData.address}</span>
                  </p>
                )}

                {/* Render Dynamic Social Media Links */}
                {resumeData?.socials && resumeData.socials.length > 0 && (
                  <div className="pt-2 border-t border-[#e2cac7] space-y-2">
                    {resumeData.socials.map((social) => {
                      const href = social.url?.startsWith("http")
                        ? social.url
                        : `https://${social.url}`;
                      return (
                        <a
                          key={social.id}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between hover:text-[#a87068] transition font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <Globe size={13} className="text-[#a87068]" />
                            {social.platform || "Social Link"}
                          </span>
                          <ExternalLink size={11} className="opacity-60" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {resumeData?.skills && resumeData.skills.length > 0 && (
              <div className="space-y-3">
                <h3 className="bg-white py-1 px-4 text-center font-bold tracking-widest text-sm text-slate-800 uppercase shadow-sm">
                  SKILLS
                </h3>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 px-2">
                  {resumeData.skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {resumeData?.languages && resumeData.languages.length > 0 && (
              <div className="space-y-3">
                <h3 className="bg-white py-1 px-4 text-center font-bold tracking-widest text-sm text-slate-800 uppercase shadow-sm">
                  LANGUAGES
                </h3>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 px-2">
                  {resumeData.languages.map((lang, index) => (
                    <li key={index}>{lang}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* RIGHT CONTENT (WHITE) */}
          <div className="md:col-span-7 p-10 bg-white flex flex-col gap-8 justify-between">
            {/* Header / Name */}
            <div className="space-y-1 pt-4">
              <h1
                className={`text-6xl text-slate-900 ${signatureFont.className}`}
              >
                {firstName}
              </h1>
              {lastName && (
                <h2 className="text-2xl font-bold tracking-[0.25em] text-slate-900 uppercase">
                  {lastName}
                </h2>
              )}
              <div className="w-full h-[3px] bg-[#e6cecb] my-3" />
              {resumeData?.role && (
                <p className="text-xs font-bold tracking-[0.2em] text-slate-700 uppercase">
                  {resumeData.role}
                </p>
              )}
            </div>

            {/* Work Experience */}
            {resumeData?.workExperience &&
              resumeData.workExperience.length > 0 && (
                <div className="space-y-4">
                  <h3 className="bg-[#f3e5e3] py-1.5 px-4 font-bold tracking-widest text-sm text-slate-800 uppercase">
                    WORK EXPERIENCE
                  </h3>
                  <div className="space-y-5 px-1">
                    {resumeData.workExperience.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 uppercase">
                          {item.title}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-600">
                          {item.company}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.period}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed text-justify mt-1">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Education */}
            {resumeData?.education && resumeData.education.length > 0 && (
              <div className="space-y-4 pb-6">
                <h3 className="bg-[#f3e5e3] py-1.5 px-4 font-bold tracking-widest text-sm text-slate-800 uppercase">
                  EDUCATION
                </h3>
                <div className="space-y-4 px-1">
                  {resumeData.education.map((item, index) => (
                    <div key={index} className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase">
                        {item.degree}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {item.school}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.period}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Component */}
      <ResumeEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        resumeData={resumeData}
        setResumeData={setResumeData}
      />
    </main>
  );
}
