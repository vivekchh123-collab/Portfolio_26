"use client";

import { useEffect, useState, useRef } from "react";
import { X, Plus, Trash2, Upload, Layers, RefreshCw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  appUrl: string;
  techStack: string[];
  images: string[];
}

interface AppShowcaseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: ProjectItem[];
  setProjects?: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
}

export default function AppShowcaseEditorModal({
  isOpen,
  onClose,
  projects: externalProjects,
  setProjects: externalSetProjects,
}: AppShowcaseEditorModalProps) {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [localProjects, setLocalProjects] = useState<ProjectItem[]>([]);

  // Ref lock to guarantee data is only fetched once per modal opening
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      if (!hasLoadedRef.current) {
        // Hydrate from external state first if available
        if (externalProjects && externalProjects.length > 0) {
          setLocalProjects(JSON.parse(JSON.stringify(externalProjects)));
        }

        // Fetch from Supabase once on modal open
        if (user?.id) {
          async function fetchUserProjects() {
            try {
              const { data, error } = await supabase
                .from("profiles")
                .select("projects")
                .eq("user_id", user?.id)
                .single();

              if (
                isMounted &&
                data?.projects &&
                Array.isArray(data.projects) &&
                data.projects.length > 0 &&
                !error
              ) {
                setLocalProjects(data.projects);
              }
            } catch (err) {
              console.error("Failed to fetch projects in editor modal:", err);
            } finally {
              if (isMounted) {
                hasLoadedRef.current = true;
              }
            }
          }
          fetchUserProjects();
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
  }, [isOpen, user?.id, externalProjects]);

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

  // Add project cleanly to local state
  const handleAddProject = () => {
    const newProject: ProjectItem = {
      id: Date.now().toString(),
      name: "New Application Name",
      description: "Short description of the application...",
      appUrl: "https://",
      techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
      images: [],
    };
    setLocalProjects((prev) => [...prev, newProject]);
  };

  // Remove project cleanly from local state
  const handleRemoveProject = (id: string) => {
    setLocalProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Update specific field inside local state
  const handleProjectChange = (
    id: string,
    field: keyof ProjectItem,
    value: any,
  ) => {
    setLocalProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  // File reader helper
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read image"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Upload images
  const handleImageUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles: File[] = [];

    fileList.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 2MB limit.`);
      } else {
        validFiles.push(file);
      }
    });

    try {
      const uploadedDataUrls = await Promise.all(
        validFiles.map((file) => readFileAsDataUrl(file)),
      );

      setLocalProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, images: [...(p.images || []), ...uploadedDataUrls] }
            : p,
        ),
      );
    } catch (err) {
      console.error("Error reading uploaded images:", err);
    }
  };

  // Replace single image
  const handleReplaceImage = async (
    projectId: string,
    imageIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds 2MB limit.`);
      return;
    }

    try {
      const base64 = await readFileAsDataUrl(file);
      setLocalProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const updatedImgs = [...p.images];
          updatedImgs[imageIndex] = base64;
          return { ...p, images: updatedImgs };
        }),
      );
    } catch (err) {
      console.error("Error replacing image:", err);
    }
  };

  // Remove single image without resetting other fields
  const handleRemoveImage = (projectId: string, imageIndex: number) => {
    setLocalProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedImgs = p.images.filter((_, idx) => idx !== imageIndex);
        return { ...p, images: updatedImgs };
      }),
    );
  };

  // Save changes to Supabase and update parent state
  const handleSave = async () => {
    if (!user?.id) {
      alert("You must be logged in to save projects.");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          projects: localProjects,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (error) {
        console.error("Supabase Save Error:", error.message);
        alert("Failed to save applications showcase to database.");
      } else {
        if (externalSetProjects) {
          externalSetProjects(localProjects);
        }
        window.dispatchEvent(new Event("projects-updated"));
        onClose();
      }
    } catch (error) {
      console.error("Storage Error:", error);
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
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-3xl space-y-6 shadow-2xl relative text-slate-900 dark:text-slate-100 max-h-[85vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Layers size={22} className="text-indigo-600 dark:text-indigo-400" />
          Edit Applications &amp; Showcase Images
        </h2>

        {/* PROJECTS LIST */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Applications List ({localProjects.length})
            </h3>
            <button
              onClick={handleAddProject}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer shadow-md"
            >
              <Plus size={14} /> Add New Project
            </button>
          </div>

          {localProjects.map((project) => (
            <div
              key={project.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4 relative"
            >
              <button
                type="button"
                onClick={() => handleRemoveProject(project.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                title="Remove Project"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) =>
                      handleProjectChange(project.id, "name", e.target.value)
                    }
                    className="w-full mt-1 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Live Application URL
                  </label>
                  <input
                    type="text"
                    value={project.appUrl}
                    onChange={(e) =>
                      handleProjectChange(project.id, "appUrl", e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full mt-1 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Image Upload Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Project Screenshots ({project.images?.length || 0})
                </label>

                <div className="flex flex-wrap gap-3 items-center">
                  <label className="flex flex-col items-center justify-center w-28 h-20 border-2 border-dashed rounded-xl text-xs bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition">
                    <Upload size={18} />
                    <span className="text-[10px] font-medium mt-1">
                      Upload More
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(project.id, e)}
                      className="hidden"
                    />
                  </label>

                  {project.images?.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group shadow-sm"
                    >
                      <img
                        src={img}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <label
                          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition"
                          title="Swap Image"
                        >
                          <RefreshCw size={14} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleReplaceImage(project.id, idx, e)
                            }
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(project.id, idx)}
                          className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 cursor-pointer transition"
                          title="Delete Image"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={project.description}
                  onChange={(e) =>
                    handleProjectChange(
                      project.id,
                      "description",
                      e.target.value,
                    )
                  }
                  className="w-full mt-1 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Tech Stack (Comma Separated)
                </label>
                <input
                  type="text"
                  value={(project.techStack || []).join(", ")}
                  onChange={(e) =>
                    handleProjectChange(
                      project.id,
                      "techStack",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    )
                  }
                  className="w-full mt-1 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          ))}

          {localProjects.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-6">
              No projects added yet. Click &quot;Add New Project&quot; above.
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition mt-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          {isSaving ? "Saving to Database..." : "Save Application Showcase"}
        </button>
      </div>
    </div>
  );
}
