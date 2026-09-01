"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Key, Plus, Trash2, Share2, Save } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface ResumeData {
  password?: string;
  name?: string;
  role?: string;
  aboutMe?: string;
  phone?: string;
  email?: string;
  socials?: SocialLink[];
  address?: string;
  photoUrl?: string;
  skills?: string[];
  languages?: string[];
  workExperience?: Array<{
    title: string;
    company: string;
    period: string;
    desc: string;
  }>;
  education?: Array<{ degree: string; school: string; period: string }>;
}

interface ResumeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData?: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export default function ResumeEditorModal({
  isOpen,
  onClose,
  resumeData: externalResumeData,
  setResumeData: setExternalResumeData,
}: ResumeEditorModalProps) {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  // Maintain isolated internal modal state
  const [formData, setFormData] = useState<ResumeData>({});

  // Ref to guarantee we ONLY load from DB/props ONCE per modal opening
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      if (!hasLoadedRef.current) {
        // Hydrate from external state first if available
        if (externalResumeData && Object.keys(externalResumeData).length > 0) {
          setFormData(JSON.parse(JSON.stringify(externalResumeData)));
        }

        // Fetch from Supabase once on modal open
        if (user?.id) {
          async function fetchResumeData() {
            try {
              const { data, error } = await supabase
                .from("profiles")
                .select("resume_data")
                .eq("user_id", user?.id)
                .single();

              if (
                isMounted &&
                data?.resume_data &&
                typeof data.resume_data === "object" &&
                Object.keys(data.resume_data).length > 0 &&
                !error
              ) {
                setFormData(data.resume_data as ResumeData);
              } else if (isMounted && user?.primaryEmailAddress?.emailAddress) {
                setFormData((prev) => ({
                  ...prev,
                  email: user?.primaryEmailAddress?.emailAddress || prev.email,
                }));
              }
            } catch (err) {
              console.error("Failed to fetch resume data from Supabase", err);
            } finally {
              if (isMounted) {
                hasLoadedRef.current = true;
              }
            }
          }

          fetchResumeData();
        } else {
          hasLoadedRef.current = true;
        }
      }
    } else {
      // Reset load lock when modal closes
      hasLoadedRef.current = false;
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.id]); // Kept strictly to isOpen and user?.id to prevent unwanted state wipes

  // Modal Escape key and scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compress uploaded photo
  const compressImage = (
    file: File,
    maxWidth = 800,
    quality = 0.7,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve(compressedDataUrl);
          } else {
            reject(new Error("Canvas context unavailable"));
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setFormData((prev) => ({
        ...prev,
        photoUrl: compressed,
      }));
    } catch (err) {
      console.error("Failed to process photo upload:", err);
      alert("Could not process this image file.");
    }
  };

  // --- Social Media Handlers ---
  const addSocialLink = () => {
    const newSocial: SocialLink = {
      id: Date.now().toString(),
      platform: "LinkedIn",
      url: "https://",
    };
    setFormData((prev) => ({
      ...prev,
      socials: [...(prev?.socials || []), newSocial],
    }));
  };

  const handleSocialChange = (
    id: string,
    field: keyof SocialLink,
    value: string,
  ) => {
    const updated = (formData?.socials || []).map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    setFormData((prev) => ({ ...prev, socials: updated }));
  };

  const removeSocialLink = (id: string) => {
    const updated = (formData?.socials || []).filter((item) => item.id !== id);
    setFormData((prev) => ({ ...prev, socials: updated }));
  };

  // --- Work Experience Handlers ---
  const handleWorkChange = (index: number, field: string, value: string) => {
    const updated = [...(formData?.workExperience || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, workExperience: updated }));
  };

  const addWorkExperience = () => {
    setFormData((prev) => ({
      ...prev,
      workExperience: [
        {
          title: "JOB TITLE",
          company: "Company Name",
          period: "2024 - Present",
          desc: "Description here...",
        },
        ...(prev?.workExperience || []),
      ],
    }));
  };

  const removeWorkExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: (prev?.workExperience || []).filter(
        (_, i) => i !== index,
      ),
    }));
  };

  // --- Education Handlers ---
  const handleEducationChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = [...(formData?.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, education: updated }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        {
          degree: "DEGREE / DIPLOMA",
          school: "University / Institute",
          period: "2020 - 2024",
        },
        ...(prev?.education || []),
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: (prev?.education || []).filter((_, i) => i !== index),
    }));
  };

  // Save to Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to save resume data.");
      return;
    }

    if (!formData || Object.keys(formData).length === 0) {
      alert("Resume data is empty. Please enter your details before saving.");
      return;
    }

    setIsSaving(true);

    const userEmail =
      formData.email && formData.email !== "trackerrproo@gmail.com"
        ? formData.email
        : user.primaryEmailAddress?.emailAddress || formData.email;

    const dataToSave: ResumeData = {
      ...formData,
      email: userEmail,
    };

    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          email: userEmail,
          resume_data: dataToSave,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (error) {
        console.error("Supabase Save Error:", error.message);
        alert("Failed to save resume changes to database.");
      } else {
        setExternalResumeData(dataToSave);
        window.dispatchEvent(new Event("resume-updated"));
        onClose();
      }
    } catch (e) {
      console.error("Failed to save resume:", e);
      alert("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pt-24 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl relative text-slate-900 dark:text-slate-100"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        {/* Header with Quick Save */}
        <div className="flex flex-wrap justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 pr-8 gap-3">
          <h2 className="text-xl font-bold">Edit Resume Content</h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer shadow-md disabled:opacity-50"
          >
            <Save size={14} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Security / Password Setting Section */}
          <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
            <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
              <Key size={14} /> Resume Access Password
            </label>
            <input
              type="text"
              value={formData?.password || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Set password to unlock resume"
              className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white focus:outline-indigo-600 font-mono"
            />
          </div>

          {/* Personal & Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                value={formData?.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Title / Profession
              </label>
              <input
                type="text"
                value={formData?.role || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Profile Image
              </label>
              <div className="flex gap-2 items-center mt-1">
                <label className="flex items-center gap-2 p-2 border border-dashed rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                  <Upload size={14} /> Upload from folder
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={formData?.photoUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      photoUrl: e.target.value,
                    }))
                  }
                  placeholder="Or paste URL"
                  className="flex-1 p-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                About Me Summary
              </label>
              <textarea
                rows={3}
                value={formData?.aboutMe || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, aboutMe: e.target.value }))
                }
                className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Phone
              </label>
              <input
                type="text"
                value={formData?.phone || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Email
              </label>
              <input
                type="text"
                value={
                  formData?.email ||
                  user?.primaryEmailAddress?.emailAddress ||
                  ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            {/* DYNAMIC SOCIAL MEDIA SECTION */}
            <div className="md:col-span-2 space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                  <Share2 size={14} className="text-indigo-500" /> Social Media
                  Links
                </label>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer"
                >
                  <Plus size={12} /> Add Social Link
                </button>
              </div>

              <div className="space-y-2">
                {formData?.socials && formData.socials.length > 0 ? (
                  formData.socials.map((social) => (
                    <div
                      key={social.id}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                    >
                      <input
                        type="text"
                        placeholder="Platform (e.g. LinkedIn)"
                        value={social.platform || ""}
                        onChange={(e) =>
                          handleSocialChange(
                            social.id,
                            "platform",
                            e.target.value,
                          )
                        }
                        className="w-1/3 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="URL (https://...)"
                        value={social.url || ""}
                        onChange={(e) =>
                          handleSocialChange(social.id, "url", e.target.value)
                        }
                        className="flex-1 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(social.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No social media links added yet.
                  </p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Address
              </label>
              <input
                type="text"
                value={formData?.address || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Skills (Comma separated)
              </label>
              <input
                type="text"
                value={(formData?.skills || []).join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    skills: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Languages (Comma separated)
              </label>
              <input
                type="text"
                value={(formData?.languages || []).join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    languages: e.target.value
                      .split(",")
                      .map((l) => l.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          {/* WORK EXPERIENCE SECTION */}
          <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Work Experience
              </h3>
              <button
                type="button"
                onClick={addWorkExperience}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-medium hover:bg-indigo-100 transition cursor-pointer"
              >
                <Plus size={14} /> Add Experience
              </button>
            </div>

            {(formData?.workExperience || []).map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-3 relative"
              >
                <button
                  type="button"
                  onClick={() => removeWorkExperience(index)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-6">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) =>
                        handleWorkChange(index, "title", e.target.value)
                      }
                      className="w-full mt-0.5 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">
                      Company
                    </label>
                    <input
                      type="text"
                      value={item.company || ""}
                      onChange={(e) =>
                        handleWorkChange(index, "company", e.target.value)
                      }
                      className="w-full mt-0.5 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">
                      Period / Dates
                    </label>
                    <input
                      type="text"
                      value={item.period || ""}
                      onChange={(e) =>
                        handleWorkChange(index, "period", e.target.value)
                      }
                      className="w-full mt-0.5 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={item.desc || ""}
                    onChange={(e) =>
                      handleWorkChange(index, "desc", e.target.value)
                    }
                    className="w-full mt-0.5 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* EDUCATION SECTION */}
          <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Education
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-medium hover:bg-indigo-100 transition cursor-pointer"
              >
                <Plus size={14} /> Add Education
              </button>
            </div>

            {(formData?.education || []).map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-3 relative"
              >
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-6">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">
                      Degree / Course
                    </label>
                    <input
                      type="text"
                      value={item.degree || ""}
                      onChange={(e) =>
                        handleEducationChange(index, "degree", e.target.value)
                      }
                      className="w-full mt-0.5 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">
                      School / University
                    </label>
                    <input
                      type="text"
                      value={item.school || ""}
                      onChange={(e) =>
                        handleEducationChange(index, "school", e.target.value)
                      }
                      className="w-full mt-0.5 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">
                      Period / Years
                    </label>
                    <input
                      type="text"
                      value={item.period || ""}
                      onChange={(e) =>
                        handleEducationChange(index, "period", e.target.value)
                      }
                      className="w-full mt-0.5 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition mt-4 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {isSaving ? "Saving to Database..." : "Save Resume Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
