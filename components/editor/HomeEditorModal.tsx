"use client";

import { X, Upload } from "lucide-react";
import { useProfile } from "@/app/layout";

interface HomeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HomeEditorModal({
  isOpen,
  onClose,
}: HomeEditorModalProps) {
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

  if (!isOpen) return null;

  // Handle direct local image file upload from folder
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfileImg(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative text-slate-900 dark:text-slate-100">
        <button
          onClick={onClose}
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

          {/* Local Folder File Upload Input */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Profile Image
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-center gap-2 w-full p-2.5 border border-dashed rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-750 cursor-pointer transition">
                <Upload size={16} />
                <span>Upload from folder</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                Or paste image URL below:
              </p>

              <input
                type="text"
                value={profileImg}
                onChange={(e) => setProfileImg(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-indigo-600"
              />
            </div>
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
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition mt-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
