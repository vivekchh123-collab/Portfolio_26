"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Globe,
  Copy,
  Check,
  Save,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

export interface CustomLinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
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
  customLinks: externalLinks,
  setCustomLinks: externalSetLinks,
}: ProjectsEditorModalProps) {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [links, setLinks] = useState<CustomLinkItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ref to prevent background re-fetching from overwriting active edits
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      if (!hasLoadedRef.current) {
        // 1. Initialize with external state if available
        if (externalLinks && externalLinks.length > 0) {
          setLinks(externalLinks);
        }

        // 2. Load latest database values once on modal open
        if (user?.id) {
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
              }
            } catch (err) {
              console.error("Failed to load custom links:", err);
            } finally {
              if (isMounted) {
                hasLoadedRef.current = true;
              }
            }
          }
          fetchLinks();
        } else {
          hasLoadedRef.current = true;
        }
      }
    } else {
      // Reset load lock on close
      hasLoadedRef.current = false;
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.id]);

  // Modal Escape key and body scroll freeze
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
      title: "New Platform",
      url: "https://",
      icon: "",
    };
    // Prepend to top
    setLinks((prev) => [newLink, ...prev]);
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

  const handleCopyLink = (id: string, url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

        <div className="flex flex-wrap justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 pr-8 gap-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Globe
                size={22}
                className="text-indigo-600 dark:text-indigo-400"
              />
              Developer &amp; Social Links
            </h2>
            <p className="text-xs text-slate-400">
              Add LinkedIn, GitHub, LeetCode, Instagram, etc.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddLink}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer shadow-md"
            >
              <Plus size={14} /> Add Link
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save size={14} />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3 relative"
            >
              {/* Actions Column: Trash on Top, Copy Below */}
              <div className="absolute top-3 right-3 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveLink(link.id)}
                  className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-0.5"
                  title="Remove Link"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyLink(link.id, link.url)}
                  className="text-slate-400 hover:text-indigo-400 transition cursor-pointer p-0.5"
                  title="Copy URL"
                >
                  {copiedId === link.id ? (
                    <Check size={15} className="text-emerald-500" />
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pr-9">
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
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition mt-2 cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {isSaving ? "Saving Links..." : "Save & Apply Links"}
        </button>
      </div>
    </div>
  );
}
