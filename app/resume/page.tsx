"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Printer,
  Lock,
  Unlock,
  ExternalLink,
  Send,
  Check,
} from "lucide-react";
import { Great_Vibes } from "next/font/google";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import ResumeEditorModal, {
  ResumeData,
} from "@/components/editor/ResumeEditorModal";
import ResumeSkeleton from "@/components/Loading/ResumeSkeleton";

const signatureFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function ResumePage() {
  const { user } = useUser();
  const searchParams = useSearchParams();

  // Read viewUser URL parameter for shareable link support
  const viewUserId = searchParams.get("viewUser");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Access Request Form States
  const [mode, setMode] = useState<"password" | "request">("password");
  const [visitorName, setVisitorName] = useState("");
  const [requestReason, setReason] = useState("");
  const [visitorContact, setVisitorContact] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default Fallback Resume Data
  const defaultResume: ResumeData = {
    password: "1234",
    name: "Olivia Wilson",
    role: "DESIGNER AND ARCHITECT",
    aboutMe:
      "We use an About Me section to briefly introduce ourselves and help others understand our background, skills, interests, achievements, and goals. It creates a good first impression and allows visitors, recruiters, or clients to quickly know who we are and what we can offer.",
    phone: "+91 9876543210",
    email: "trackerrproo@gmail.com",
    socials: [
      { id: "1", platform: "LinkedIn", url: "https://linkedin.com" },
      { id: "2", platform: "Portfolio", url: "https://reallygreatsite.com" },
    ],
    address: "123 Anywhere St., Any City, ST 12345",
    photoUrl:
      "data:image/jpeg;base64,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",
    skills: ["Skill_1", "Skill_2", "Skill_3", "Skill_4"],
    languages: ["Spanish", "English", "Italian"],
    workExperience: [
      {
        title: "Future Software Engineer",
        company: "Vihub Inc.",
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

  // Fetch resume data directly from Supabase (target shared user or logged-in user)
  const loadResumeDataFromSupabase = async () => {
    const targetUserId = viewUserId || user?.id;
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("resume_data")
        .eq("user_id", targetUserId)
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
    } finally {
      setIsLoading(false);
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
  }, [user, viewUserId]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === (resumeData?.password || "1234")) {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect Password! Try again.");
    }
  };

  // Handle Access Request Submission
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !visitorName.trim() ||
      !requestReason.trim() ||
      !visitorContact.trim()
    ) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const targetUserId = viewUserId || user?.id || "default";

      // Priority 1: Current Clerk logged-in user email
      // Priority 2: Email from Supabase resumeData (excluding the dummy email)
      // Priority 3: undefined (lets API route lookup via Supabase/env)
      let targetOwnerEmail = user?.primaryEmailAddress?.emailAddress;

      if (
        !targetOwnerEmail &&
        resumeData?.email &&
        resumeData.email !== "trackerrproo@gmail.com"
      ) {
        targetOwnerEmail = resumeData.email;
      }

      const response = await fetch("/api/send-access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          ownerEmail: targetOwnerEmail,
          visitorName,
          reason: requestReason,
          contactNumber: visitorContact,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error || "Failed to dispatch email notification",
        );
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Failed to send access request:", err);
      setErrorMsg(err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
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
    <>
      {isLoading && <ResumeSkeleton />}

      <main className="min-h-screen pt-24 pb-10 px-4 flex flex-col items-center justify-center relative z-10">
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

        <div className="printable-resume relative w-full max-w-4xl bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {!isAuthenticated && (
            <div className="absolute inset-0 z-30 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 print:hidden">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-5 text-white pointer-events-auto">
                {isSubmitted ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Request Sent!</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your request and contact details have been emailed
                      directly to the profile job applicant. They will review
                      your message and reach out to you if interested.
                    </p>
                  </div>
                ) : mode === "password" ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                      <Lock size={24} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Protected Resume
                    </h2>
                    <p className="text-xs text-slate-400">
                      Please enter password to view full resume details.
                    </p>

                    <input
                      type="password"
                      placeholder="Enter password..."
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full p-3 border rounded-xl text-sm bg-slate-800/90 border-slate-700 text-white placeholder-slate-500 focus:outline-indigo-500"
                    />

                    {errorMsg && (
                      <p className="text-xs text-rose-500 font-medium">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                    >
                      <Unlock size={16} /> Unlock Resume
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode("request");
                        setErrorMsg("");
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer pt-2 block mx-auto"
                    >
                      Don't have a password? Request Access
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={handleRequestSubmit}
                    className="space-y-3.5 text-left"
                  >
                    <div className="text-center space-y-1">
                      <h2 className="text-xl font-bold">Request Access</h2>
                      <p className="text-xs text-slate-400">
                        Provide your details to send a direct access request to
                        the profile owner.
                      </p>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="w-full p-2.5 border rounded-xl text-xs bg-slate-800/90 border-slate-700 text-white placeholder-slate-500 focus:outline-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Why do you want this?
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Hiring for Full-Stack role..."
                        value={requestReason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2.5 border rounded-xl text-xs bg-slate-800/90 border-slate-700 text-white placeholder-slate-500 focus:outline-indigo-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +1 234 567 8900"
                        value={visitorContact}
                        onChange={(e) => setVisitorContact(e.target.value)}
                        className="w-full p-2.5 border rounded-xl text-xs bg-slate-800/90 border-slate-700 text-white placeholder-slate-500 focus:outline-indigo-500"
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-rose-500 font-medium text-center">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                    >
                      <Send size={14} />
                      <span>
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode("password");
                        setErrorMsg("");
                      }}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer pt-1 block mx-auto text-center"
                    >
                      Back to Password Entry
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          <div
            className={`grid grid-cols-1 md:grid-cols-12 min-h-[1000px] ${
              !isAuthenticated
                ? "filter blur-md select-none pointer-events-none"
                : ""
            }`}
          >
            <div className="md:col-span-5 bg-[#f3e5e3] p-8 flex flex-col gap-8 border-r border-slate-200/50">
              {resumeData?.photoUrl && (
                <div className="p-3 bg-white shadow-md rounded-xl inline-block mx-auto">
                  <div className="w-48 h-56 overflow-hidden border-2 border-[#d9b8b3]">
                    <img
                      src={resumeData.photoUrl}
                      alt={formattedName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

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

            <div className="md:col-span-7 p-10 bg-white flex flex-col gap-8 justify-between">
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

        <ResumeEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          resumeData={resumeData}
          setResumeData={setResumeData}
        />
      </main>
    </>
  );
}
