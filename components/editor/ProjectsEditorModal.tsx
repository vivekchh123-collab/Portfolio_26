"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, Globe, HelpCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

export interface CustomLinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string; // Small image URL or Base64
}

interface ProjectsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customLinks?: CustomLinkItem[];
  setCustomLinks?: (links: CustomLinkItem[]) => void;
}

export default function ProjectsEditorModal({
  isOpen,
  onClose,
  customLinks: externalLinks = [],
  setCustomLinks: externalSetLinks,
}: ProjectsEditorModalProps) {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [links, setLinks] = useState<CustomLinkItem[]>(externalLinks);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && user?.id) {
      async function fetchLinks() {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("custom_links")
            .eq("user_id", user?.id)
            .single();

          if (
            isMounted &&
            data?.custom_links &&
            Array.isArray(data.custom_links) &&
            !error
          ) {
            setLinks(data.custom_links);
            if (externalSetLinks) externalSetLinks(data.custom_links);
          } else if (isMounted && externalLinks.length > 0) {
            setLinks(externalLinks);
          }
        } catch (err) {
          console.error("Failed to load custom links:", err);
        }
      }
      fetchLinks();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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

  const handleAddLink = () => {
    const newLink: CustomLinkItem = {
      id: Date.now().toString(),
      title: "LinkedIn",
      url: "https://linkedin.com/in/",
      icon: "",
    };
    setLinks((prev) => [...prev, newLink]);
  };

  const handleLinkChange = (
    id: string,
    field: keyof CustomLinkItem,
    value: string,
  ) => {
    setLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleIconUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Icon image must be under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        handleLinkChange(id, "icon", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLink = (id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    if (!user?.id) {
      alert("Please log in to save links.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          custom_links: links,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (error) {
        console.error("Save error:", error.message);
        alert("Failed to save links.");
      } else {
        if (externalSetLinks) externalSetLinks(links);
        window.dispatchEvent(new Event("developer-links-updated"));
        onClose();
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Unexpected error occurred.");
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
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-xl space-y-6 shadow-2xl relative text-slate-900 dark:text-slate-100 max-h-[85vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 pr-8">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Globe
                size={22}
                className="text-indigo-600 dark:text-indigo-400"
              />
              Developer & Social Links
            </h2>
            <p className="text-xs text-slate-400">
              Add LinkedIn, GitHub, LeetCode, Instagram, etc.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddLink}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer"
          >
            <Plus size={14} /> Add Link
          </button>
        </div>

        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3 relative"
            >
              <button
                type="button"
                onClick={() => handleRemoveLink(link.id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                title="Remove Link"
              >
                <Trash2 size={15} />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pr-8">
                {/* Small Icon Picker */}
                <div className="sm:col-span-3 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0">
                    {link.icon ? (
                      <img
                        src={link.icon}
                        alt={link.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Globe size={18} className="text-slate-400" />
                    )}
                  </div>
                  <label className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                    <Upload size={12} className="inline mr-0.5" /> Icon
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconUpload(link.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Title */}
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) =>
                      handleLinkChange(link.id, "title", e.target.value)
                    }
                    placeholder="Platform"
                    className="w-full p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-semibold"
                  />
                </div>

                {/* URL */}
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) =>
                      handleLinkChange(link.id, "url", e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>
            </div>
          ))}

          {links.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-4">
              No links added yet. Click &quot;Add Link&quot; above to create
              your navigation links.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition mt-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          {isSaving ? "Saving Links..." : "Save & Apply Links"}
        </button>
      </div>
    </div>
  );
}
