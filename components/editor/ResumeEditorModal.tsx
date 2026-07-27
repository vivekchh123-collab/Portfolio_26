"use client";

import { X, Upload, Key } from "lucide-react";

export interface ResumeData {
  password: string; // <-- Added password property
  name: string;
  role: string;
  aboutMe: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  photoUrl: string;
  skills: string[];
  languages: string[];
  workExperience: Array<{
    title: string;
    company: string;
    period: string;
    desc: string;
  }>;
  education: Array<{ degree: string; school: string; period: string }>;
}

interface ResumeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export default function ResumeEditorModal({
  isOpen,
  onClose,
  resumeData,
  setResumeData,
}: ResumeEditorModalProps) {
  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setResumeData((prev) => ({
            ...prev,
            photoUrl: reader.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl relative text-slate-900 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-black dark:hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
          Edit Resume Content
        </h2>

        {/* Security / Password Setting Section */}
        <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
          <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
            <Key size={14} /> Resume Access Password
          </label>
          <input
            type="text"
            value={resumeData.password}
            onChange={(e) =>
              setResumeData({ ...resumeData, password: e.target.value })
            }
            placeholder="Set password to unlock resume"
            className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white focus:outline-indigo-600 font-mono"
          />
          <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 mt-1">
            This is the password visitors must enter to unblur your resume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Full Name
            </label>
            <input
              type="text"
              value={resumeData.name}
              onChange={(e) =>
                setResumeData({ ...resumeData, name: e.target.value })
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
              value={resumeData.role}
              onChange={(e) =>
                setResumeData({ ...resumeData, role: e.target.value })
              }
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Profile Image
            </label>
            <div className="flex gap-2 items-center mt-1">
              <label className="flex items-center gap-2 p-2 border border-dashed rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 cursor-pointer">
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
                value={resumeData.photoUrl}
                onChange={(e) =>
                  setResumeData({ ...resumeData, photoUrl: e.target.value })
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
              value={resumeData.aboutMe}
              onChange={(e) =>
                setResumeData({ ...resumeData, aboutMe: e.target.value })
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
              value={resumeData.phone}
              onChange={(e) =>
                setResumeData({ ...resumeData, phone: e.target.value })
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
              value={resumeData.email}
              onChange={(e) =>
                setResumeData({ ...resumeData, email: e.target.value })
              }
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Website
            </label>
            <input
              type="text"
              value={resumeData.website}
              onChange={(e) =>
                setResumeData({ ...resumeData, website: e.target.value })
              }
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Address
            </label>
            <input
              type="text"
              value={resumeData.address}
              onChange={(e) =>
                setResumeData({ ...resumeData, address: e.target.value })
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
              value={resumeData.skills.join(", ")}
              onChange={(e) =>
                setResumeData({
                  ...resumeData,
                  skills: e.target.value.split(",").map((s) => s.trim()),
                })
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
              value={resumeData.languages.join(", ")}
              onChange={(e) =>
                setResumeData({
                  ...resumeData,
                  languages: e.target.value.split(",").map((l) => l.trim()),
                })
              }
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition mt-2"
        >
          Save Resume Changes
        </button>
      </div>
    </div>
  );
}
