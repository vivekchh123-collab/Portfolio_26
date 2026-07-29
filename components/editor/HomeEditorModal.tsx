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
    role,
    setRole,
    bio,
    setBio,
    profileImg,
    setProfileImg,
    signature,
    setSignature,
  } = useProfile();

  if (!isOpen) return null;

  // Compress large uploaded images
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

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve(compressedDataUrl);
          } else {
            reject("Canvas context unavailable");
          }
        };
        img.onerror = (error) => reject(error);
      };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedImage = await compressImage(file);
      setProfileImg(compressedImage);
    } catch (err) {
      console.error("Failed to compress uploaded image", err);
      alert("Could not process this image file.");
    }
  };

  const handleSave = () => {
    try {
      const profileData = {
        name,
        role,
        bio,
        profileImg,
        signature,
      };
      localStorage.setItem("user_profile_data", JSON.stringify(profileData));
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e) {
      console.error("Failed to save profile to localStorage", e);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative text-slate-900 dark:text-slate-100 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
          Edit Hero Section
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Full Name
            </label>
            <input
              type="text"
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Title / Profession
            </label>
            <input
              type="text"
              value={role || ""}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              About Yourself (Bio)
            </label>
            <textarea
              rows={3}
              value={bio || ""}
              onChange={(e) => setBio(e.target.value)}
              className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>

          {/* EDIT SIGNATURE */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Auto-Signature Text
            </label>
            <input
              type="text"
              value={signature || ""}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="e.g. Vivek"
              className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-serif"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Profile Image
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-center gap-2 w-full p-2.5 border border-dashed rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 cursor-pointer transition">
                <Upload size={16} />
                <span>Upload from folder</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                Or paste image URL below:
              </p>

              <input
                type="text"
                value={profileImg || ""}
                onChange={(e) => setProfileImg(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition mt-2 cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
