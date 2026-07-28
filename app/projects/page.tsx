"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink,
  Heart,
  MessageCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
  Maximize2,
  Check,
} from "lucide-react";
import { ProjectItem } from "@/components/editor/AppShowcaseEditorModal";

interface CommentItem {
  id: string;
  author: string;
  text: string;
  likes: number;
  isLiked: boolean;
  time: string;
}

export default function ProjectsPage() {
  const defaultProjects: ProjectItem[] = [
    {
      id: "1",
      name: "Personal Performance Tracker",
      description:
        "Habit tracking and data visualization app analyzing daily routines and productivity trends.",
      appUrl: "https://tracker-pro.example.com",
      techStack: ["Next.js", "Node.js", "Prisma", "PostgreSQL"],
      images: [],
    },
  ];

  const [projects, setProjects] = useState<ProjectItem[]>(defaultProjects);
  const [activeImageIndices, setActiveImageIndices] = useState<{
    [key: string]: number;
  }>({});

  // Interactive Stats States (Starts at 0)
  const [viewCounts, setViewCounts] = useState<{ [key: string]: number }>({});
  const [likedProjects, setLikedProjects] = useState<{
    [key: string]: boolean;
  }>({});
  const [shareCounts, setShareCounts] = useState<{ [key: string]: number }>({});
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  // Comment States
  const [openCommentAppId, setOpenCommentAppId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<{
    [key: string]: CommentItem[];
  }>({});
  const [newCommentText, setNewCommentText] = useState<{
    [key: string]: string;
  }>({});

  // Lightbox Modal State
  const [lightboxState, setLightboxState] = useState<{
    images: string[];
    currentIndex: number;
  } | null>(null);

  useEffect(() => {
    const loadSavedProjects = () => {
      const saved = localStorage.getItem("user_projects_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
          }
        } catch (e) {
          console.error("Failed to parse projects from localStorage", e);
        }
      }
    };

    loadSavedProjects();
    window.addEventListener("projects-updated", loadSavedProjects);
    return () =>
      window.removeEventListener("projects-updated", loadSavedProjects);
  }, []);

  // Keyboard Navigation for Lightbox Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxState) return;
      if (e.key === "ArrowRight") handleLightboxNext();
      if (e.key === "ArrowLeft") handleLightboxPrev();
      if (e.key === "Escape") setLightboxState(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxState]);

  const incrementViews = (projectId: string) => {
    setViewCounts((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || 0) + 1,
    }));
  };

  const handleNextImage = (
    projectId: string,
    totalImages: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    incrementViews(projectId);
    setActiveImageIndices((prev) => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) + 1) % totalImages,
    }));
  };

  const handlePrevImage = (
    projectId: string,
    totalImages: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    incrementViews(projectId);
    setActiveImageIndices((prev) => ({
      ...prev,
      [projectId]:
        (prev[projectId] || 0) === 0
          ? totalImages - 1
          : (prev[projectId] || 0) - 1,
    }));
  };

  // Fullscreen Modal Navigation
  const handleLightboxNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!lightboxState) return;
    setLightboxState((prev) =>
      prev
        ? {
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.images.length,
          }
        : null,
    );
  };

  const handleLightboxPrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!lightboxState) return;
    setLightboxState((prev) =>
      prev
        ? {
            ...prev,
            currentIndex:
              prev.currentIndex === 0
                ? prev.images.length - 1
                : prev.currentIndex - 1,
          }
        : null,
    );
  };

  const toggleLike = (projectId: string) => {
    setLikedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleShare = (project: ProjectItem) => {
    const linkToShare = project.appUrl || window.location.href;
    navigator.clipboard.writeText(linkToShare);

    setShareCounts((prev) => ({
      ...prev,
      [project.id]: (prev[project.id] || 0) + 1,
    }));

    setCopiedAppId(project.id);
    setTimeout(() => setCopiedAppId(null), 2500);
  };

  const handleAddComment = (projectId: string) => {
    const text = newCommentText[projectId]?.trim();
    if (!text) return;

    const newComment: CommentItem = {
      id: Date.now().toString(),
      author: "Viewer",
      text,
      likes: 0,
      isLiked: false,
      time: "Just now",
    };

    setCommentsMap((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newComment],
    }));

    setNewCommentText((prev) => ({ ...prev, [projectId]: "" }));
  };

  const toggleCommentLike = (projectId: string, commentId: string) => {
    setCommentsMap((prev) => {
      const currentComments = prev[projectId] || [];
      const updatedComments = currentComments.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : c.likes - 1,
          };
        }
        return c;
      });
      return { ...prev, [projectId]: updatedComments };
    });
  };

  return (
    <>
      <main className="min-h-screen pt-28 pb-16 px-4 max-w-xl mx-auto space-y-8 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Featured Projects
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Interactive showcase formatted as social posts.
          </p>
        </div>

        <div className="space-y-8">
          {projects.map((project) => {
            const images = project.images || [];
            const currentImgIndex = activeImageIndices[project.id] || 0;
            const isLiked = likedProjects[project.id] || false;

            const comments = commentsMap[project.id] || [];
            const isCommentOpen = openCommentAppId === project.id;
            const shares = shareCounts[project.id] || 0;
            const views = viewCounts[project.id] || 0;

            // Only show the stats bar if at least one interaction has occurred
            const hasInteracted =
              views > 0 || isLiked || comments.length > 0 || shares > 0;

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-xl overflow-hidden transition-colors relative"
              >
                {/* --- 1. HEADER --- */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-[#262626]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        {project.name}
                      </h3>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Working
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      Full-Stack Web App
                    </span>
                  </div>

                  {project.appUrl && (
                    <a
                      href={project.appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                    >
                      Visit app <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {/* --- 2. SQUARE IMAGE CAROUSEL --- */}
                <div
                  onClick={() => {
                    if (images.length > 0) {
                      incrementViews(project.id);
                      setLightboxState({
                        images,
                        currentIndex: currentImgIndex,
                      });
                    }
                  }}
                  className="relative aspect-square w-full bg-slate-50 dark:bg-black flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-[#262626] cursor-pointer group"
                >
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentImgIndex]}
                        alt={`${project.name} screenshot`}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.01]"
                      />

                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white pointer-events-none">
                        <div className="flex items-center gap-1.5 bg-black/60 px-3.5 py-2 rounded-full backdrop-blur-md text-xs font-medium">
                          <Maximize2 size={14} /> Open Fullscreen Gallery
                        </div>
                      </div>

                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) =>
                              handlePrevImage(project.id, images.length, e)
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-xs cursor-pointer z-10"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={(e) =>
                              handleNextImage(project.id, images.length, e)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-xs cursor-pointer z-10"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 p-6 text-center">
                      <Layers size={40} className="stroke-[1.5]" />
                      <p className="text-xs font-medium">
                        No screenshots uploaded yet
                      </p>
                    </div>
                  )}
                </div>

                {/* --- 3. BOTTOM ACTION BAR --- */}
                <div className="p-4 space-y-3 bg-white dark:bg-[#121212]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Like Button */}
                      <button
                        onClick={() => toggleLike(project.id)}
                        className="transition transform active:scale-125 cursor-pointer"
                        title="Like Post"
                      >
                        <Heart
                          size={24}
                          className={
                            isLiked
                              ? "fill-rose-500 text-rose-500"
                              : "text-slate-800 dark:text-slate-100 hover:text-slate-500 dark:hover:text-slate-400"
                          }
                        />
                      </button>

                      {/* Comment Button */}
                      <button
                        onClick={() =>
                          setOpenCommentAppId(isCommentOpen ? null : project.id)
                        }
                        className="text-slate-800 dark:text-slate-100 hover:text-slate-500 dark:hover:text-slate-400 transition cursor-pointer relative"
                        title="View / Write Comments"
                      >
                        <MessageCircle size={24} />
                      </button>

                      {/* Share Link Button */}
                      <button
                        onClick={() => handleShare(project)}
                        className="text-slate-800 dark:text-slate-100 hover:text-slate-500 dark:hover:text-slate-400 transition cursor-pointer relative"
                        title="Share App Link"
                      >
                        <Send size={22} />
                      </button>
                    </div>

                    {images.length > 1 && (
                      <div className="flex gap-1.5 items-center">
                        {images.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              idx === currentImgIndex
                                ? "bg-sky-500 w-2.5"
                                : "bg-slate-300 dark:bg-[#262626]"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {copiedAppId === project.id && (
                    <div className="bg-sky-500 text-white text-[11px] font-semibold px-3 py-1 rounded-full w-max flex items-center gap-1.5 animate-in fade-in duration-200">
                      <Check size={12} /> Application Link Copied!
                    </div>
                  )}

                  {/* Dynamic Stats Row (Hidden until user interacts) */}
                  {hasInteracted && (
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 animate-in fade-in duration-200">
                      <span>
                        {views} {views === 1 ? "view" : "views"}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>
                        {comments.length}{" "}
                        {comments.length === 1 ? "comment" : "comments"}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>
                        {shares} {shares === 1 ? "share" : "shares"}
                      </span>
                    </div>
                  )}

                  {/* Caption & Description */}
                  <div className="text-xs space-y-1">
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">
                        {project.name}
                      </span>
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        #{tech.replace(/\s+/g, "").toLowerCase()}
                      </span>
                    ))}
                  </div>

                  {/* --- 4. EXPANDABLE COMMENTS SECTION --- */}
                  {isCommentOpen && (
                    <div className="pt-3 border-t border-slate-100 dark:border-[#262626] space-y-3 animate-in fade-in duration-200">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Viewer Comments ({comments.length})
                      </h4>

                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {comments.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            No comments yet. Be the first to leave a comment!
                          </p>
                        ) : (
                          comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="flex items-start justify-between bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                            >
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 dark:text-slate-100 mr-1.5">
                                  {comment.author}
                                </span>
                                <span className="text-slate-700 dark:text-slate-300">
                                  {comment.text}
                                </span>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                                  <span>{comment.time}</span>
                                  {comment.likes > 0 && (
                                    <span className="font-semibold text-slate-500">
                                      {comment.likes}{" "}
                                      {comment.likes === 1 ? "like" : "likes"}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  toggleCommentLike(project.id, comment.id)
                                }
                                className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                                title="Like Comment"
                              >
                                <Heart
                                  size={14}
                                  className={
                                    comment.isLiked
                                      ? "fill-rose-500 text-rose-500"
                                      : "text-slate-400"
                                  }
                                />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={newCommentText[project.id] || ""}
                          onChange={(e) =>
                            setNewCommentText({
                              ...newCommentText,
                              [project.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddComment(project.id);
                          }}
                          placeholder="Add a comment..."
                          className="flex-1 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500"
                        />
                        <button
                          onClick={() => handleAddComment(project.id)}
                          className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- FULLSCREEN GALLERY LIGHTBOX --- */}
      {lightboxState && (
        <div
          onClick={() => setLightboxState(null)}
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 cursor-pointer animate-in fade-in duration-200 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full flex justify-between items-center max-w-6xl z-20 text-white"
          >
            <span className="text-xs font-bold tracking-widest uppercase bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/60">
              Image {lightboxState.currentIndex + 1} of{" "}
              {lightboxState.images.length}
            </span>

            <button
              onClick={() => setLightboxState(null)}
              className="p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition cursor-pointer shadow-lg border border-slate-700/60"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative max-w-6xl w-full flex-1 flex items-center justify-center my-4">
            {lightboxState.images.length > 1 && (
              <button
                onClick={handleLightboxPrev}
                className="absolute left-2 sm:left-6 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition backdrop-blur-md cursor-pointer border border-slate-700/60 z-20 shadow-xl"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[75vh] flex items-center justify-center"
            >
              <img
                src={lightboxState.images[lightboxState.currentIndex]}
                alt={`Original view ${lightboxState.currentIndex + 1}`}
                className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl object-contain border border-slate-800"
              />
            </div>

            {lightboxState.images.length > 1 && (
              <button
                onClick={handleLightboxNext}
                className="absolute right-2 sm:right-6 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition backdrop-blur-md cursor-pointer border border-slate-700/60 z-20 shadow-xl"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {lightboxState.images.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex gap-2 max-w-xl overflow-x-auto p-2 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md z-20"
            >
              {lightboxState.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setLightboxState((prev) =>
                      prev ? { ...prev, currentIndex: idx } : null,
                    )
                  }
                  className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    idx === lightboxState.currentIndex
                      ? "border-sky-500 scale-105"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
