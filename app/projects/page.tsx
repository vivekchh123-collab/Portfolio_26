"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink,
  Code,
  Heart,
  MessageSquare,
  Share2,
  Send,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import AppShowcaseEditorModal, {
  ProjectItem,
} from "@/components/editor/AppShowcaseEditorModal";

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export default function ProjectsPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Engagement States per Project
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLikesMap, setUserLikesMap] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});

  // Active Selected Image Index per Project
  const [activeImageIndexMap, setActiveImageIndexMap] = useState<
    Record<string, number>
  >({});

  // Fullscreen Lightbox Modal State
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    projectId: string | null;
    imageIndex: number;
  }>({
    isOpen: false,
    projectId: null,
    imageIndex: 0,
  });

  // UI state for active comment box and share feedback
  const [activeCommentProjectId, setActiveCommentProjectId] = useState<
    string | null
  >(null);
  const [commentInput, setCommentInput] = useState("");
  const [authorNameInput, setAuthorNameInput] = useState("");
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Default fallback project
  const defaultProjects: ProjectItem[] = [
    {
      id: "1",
      name: "Personal Performance Tracker",
      description:
        "Habit tracking and data visualization app analyzing daily routines and productivity trends.",
      appUrl: "https://tracker-pro.example.com",
      techStack: ["Next.js", "Node.js", "Prisma", "PostgreSQL"],
      images: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop",
      ],
    },
  ];

  const [projects, setProjects] = useState<ProjectItem[]>(defaultProjects);

  // Load Saved Projects, Likes, & Comments from LocalStorage
  useEffect(() => {
    const loadProjects = () => {
      const savedProjects = localStorage.getItem("user_projects_data");
      if (savedProjects) {
        try {
          const parsed = JSON.parse(savedProjects);
          if (Array.isArray(parsed) && parsed.length > 0) setProjects(parsed);
        } catch (e) {
          console.error("Failed to load projects", e);
        }
      }

      const savedLikes = localStorage.getItem("user_project_likes_map");
      if (savedLikes) setLikesMap(JSON.parse(savedLikes));

      const savedUserLikes = localStorage.getItem(
        "user_project_user_likes_map",
      );
      if (savedUserLikes) setUserLikesMap(JSON.parse(savedUserLikes));

      const savedComments = localStorage.getItem("user_project_comments_map");
      if (savedComments) setCommentsMap(JSON.parse(savedComments));
    };

    loadProjects();

    const handleOpenEditor = () => setIsEditorOpen(true);
    window.addEventListener("open-projects-editor", handleOpenEditor);
    window.addEventListener("projects-updated", loadProjects);

    return () => {
      window.removeEventListener("open-projects-editor", handleOpenEditor);
      window.removeEventListener("projects-updated", loadProjects);
    };
  }, []);

  // Handle Like Toggle
  const handleLikeToggle = (projectId: string) => {
    const hasLiked = !!userLikesMap[projectId];
    const currentLikes = likesMap[projectId] || 0;

    const nextLikes = hasLiked
      ? Math.max(0, currentLikes - 1)
      : currentLikes + 1;
    const nextUserLikes = !hasLiked;

    const updatedLikesMap = { ...likesMap, [projectId]: nextLikes };
    const updatedUserLikesMap = { ...userLikesMap, [projectId]: nextUserLikes };

    setLikesMap(updatedLikesMap);
    setUserLikesMap(updatedUserLikesMap);

    localStorage.setItem(
      "user_project_likes_map",
      JSON.stringify(updatedLikesMap),
    );
    localStorage.setItem(
      "user_project_user_likes_map",
      JSON.stringify(updatedUserLikesMap),
    );
  };

  // Handle Add Comment
  const handleAddComment = (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: authorNameInput.trim() || "Guest Visitor",
      text: commentInput.trim(),
      timestamp: "Just now",
    };

    const projectComments = commentsMap[projectId] || [];
    const updatedComments = [newComment, ...projectComments];
    const updatedCommentsMap = { ...commentsMap, [projectId]: updatedComments };

    setCommentsMap(updatedCommentsMap);
    localStorage.setItem(
      "user_project_comments_map",
      JSON.stringify(updatedCommentsMap),
    );

    setCommentInput("");
  };

  // Switch Active Image Card Display
  const handleSelectImage = (projectId: string, index: number) => {
    setActiveImageIndexMap((prev) => ({
      ...prev,
      [projectId]: index,
    }));
  };

  // Native Web Share API + Clipboard Fallback
  const handleShare = async (project: ProjectItem) => {
    const shareUrl = project.appUrl?.startsWith("http")
      ? project.appUrl
      : typeof window !== "undefined"
        ? window.location.href
        : "";

    const shareData = {
      title: project.name,
      text: `Check out ${project.name}: ${project.description}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShareId(project.id);
      setTimeout(() => setCopiedShareId(null), 2500);
    }
  };

  // Lightbox Modal Project & Active Image Helper
  const activeLightboxProject = projects.find(
    (p) => p.id === lightboxState.projectId,
  );
  const activeLightboxImages = activeLightboxProject?.images || [];

  return (
    <main className="min-h-[calc(100vh-5rem)] pt-24 pb-12 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-6xl mx-auto space-y-12 flex flex-col items-center">
        <div className="w-full space-y-12 flex flex-col items-center">
          {projects.map((project) => {
            const projectLikes = likesMap[project.id] || 0;
            const isLiked = !!userLikesMap[project.id];
            const projectComments = commentsMap[project.id] || [];
            const isCommentBoxOpen = activeCommentProjectId === project.id;

            const images =
              project.images && project.images.length > 0
                ? project.images
                : [
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
                  ];
            const activeImgIdx = activeImageIndexMap[project.id] || 0;
            const currentImg = images[activeImgIdx] || images[0];

            return (
              <div
                key={project.id}
                className="w-full max-w-6xl bg-sky-100/60 dark:bg-slate-900/60 border border-sky-200/60 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl transition-colors space-y-6 flex flex-col justify-between min-h-[520px]"
              >
                {/* TOP HEADER ROW */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {project.name}
                  </h1>

                  <div>
                    {project.appUrl && (
                      <a
                        href={
                          project.appUrl.startsWith("http")
                            ? project.appUrl
                            : `https://${project.appUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-100 hover:bg-slate-100 dark:hover:bg-white text-slate-900 font-bold text-xs transition shadow-md border border-slate-200 dark:border-slate-100"
                      >
                        <span>Visit Live</span>
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>

                {/* MIDDLE SECTION: MAIN PREVIEW WITH MULTI-IMAGE SWITCHER */}
                <div className="space-y-3">
                  <div
                    onClick={() =>
                      setLightboxState({
                        isOpen: true,
                        projectId: project.id,
                        imageIndex: activeImgIdx,
                      })
                    }
                    className="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/50 dark:border-slate-800 shadow-inner group cursor-pointer"
                  >
                    <img
                      src={currentImg}
                      alt={project.name}
                      className="w-full h-full object-cover object-top hover:scale-102 transition duration-500"
                    />

                    {/* View Original Size Indicator Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-2 text-white font-medium text-xs backdrop-blur-[2px]">
                      <Maximize2 size={18} />
                      <span>Click to view original size</span>
                    </div>
                  </div>

                  {/* THUMBNAIL IMAGE SWITCHER (IF MULTIPLE IMAGES EXIST) */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Images ({images.length}):
                      </span>
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectImage(project.id, idx)}
                          className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                            activeImgIdx === idx
                              ? "border-sky-500 scale-105 shadow-md"
                              : "border-slate-300 dark:border-slate-700 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOTTOM DETAILS: ABOUT & TECH STACK */}
                <div className="space-y-6 pt-2">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      ABOUT PROJECT
                    </h3>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {project.description}
                    </p>
                  </div>

                  {project.techStack && project.techStack.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Code size={13} /> TECH STACK
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech, index) => (
                          <span
                            key={index}
                            className="px-4 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* INTERACTIVE ACTIONS BAR: LIKES, COMMENTS & SHARE */}
                  <div className="pt-4 border-t border-slate-300/40 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* LIKE BUTTON */}
                      <button
                        onClick={() => handleLikeToggle(project.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shadow-xs cursor-pointer border text-xs font-bold ${
                          isLiked
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        <Heart
                          size={16}
                          className={isLiked ? "fill-white" : "fill-rose-500"}
                        />
                        <span>{projectLikes} Likes</span>
                      </button>

                      {/* COMMENT BUTTON */}
                      <button
                        onClick={() =>
                          setActiveCommentProjectId(
                            isCommentBoxOpen ? null : project.id,
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        <MessageSquare size={16} />
                        <span>{projectComments.length} Comments</span>
                      </button>
                    </div>

                    {/* SHARE BUTTON */}
                    <button
                      onClick={() => handleShare(project)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition cursor-pointer shadow-md"
                    >
                      {copiedShareId === project.id ? (
                        <>
                          <Check
                            size={15}
                            className="text-emerald-400 dark:text-emerald-600"
                          />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={15} />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* COMMENTS DRAWER */}
                  {isCommentBoxOpen && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Viewer Comments ({projectComments.length})
                        </h4>
                        <button
                          onClick={() => setActiveCommentProjectId(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Add Comment Form */}
                      <form
                        onSubmit={(e) => handleAddComment(project.id, e)}
                        className="space-y-2 bg-white/70 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60"
                      >
                        <input
                          type="text"
                          placeholder="Your Name (optional)"
                          value={authorNameInput}
                          onChange={(e) => setAuthorNameInput(e.target.value)}
                          className="w-full p-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-indigo-600"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            className="flex-1 p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-indigo-600"
                          />
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition cursor-pointer"
                          >
                            <Send size={13} />
                            <span>Post</span>
                          </button>
                        </div>
                      </form>

                      {/* Comment Feed */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {projectComments.length > 0 ? (
                          projectComments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                  {comment.author}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {comment.timestamp}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300">
                                {comment.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic text-center py-2">
                            No comments yet. Be the first to share your
                            thoughts!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- FULLSCREEN LIGHTBOX MODAL (ZERO IMAGE BLOCKS / OVERLAPS) --- */}
      {lightboxState.isOpen && activeLightboxProject && (
        <div
          onClick={() =>
            setLightboxState({ isOpen: false, projectId: null, imageIndex: 0 })
          }
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none overflow-hidden"
        >
          {/* TOP HEADER BAR (ROW 1 - OUTSIDE IMAGE AREA) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full flex justify-between items-center bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl text-white max-w-6xl mx-auto shadow-2xl shrink-0"
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-tight">
                {activeLightboxProject.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Original Size View ({lightboxState.imageIndex + 1} of{" "}
                {activeLightboxImages.length})
              </p>
            </div>
            <button
              onClick={() =>
                setLightboxState({
                  isOpen: false,
                  projectId: null,
                  imageIndex: 0,
                })
              }
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close View"
            >
              <X size={20} />
            </button>
          </div>

          {/* MAIN IMAGE CONTAINER (ROW 2 - FLEX-1 HEIGHT WITH OBJECT-CONTAIN) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 w-full max-w-6xl mx-auto my-3 flex items-center justify-center overflow-hidden"
          >
            {/* Previous Arrow */}
            {activeLightboxImages.length > 1 && (
              <button
                onClick={() =>
                  setLightboxState((prev) => ({
                    ...prev,
                    imageIndex:
                      (prev.imageIndex - 1 + activeLightboxImages.length) %
                      activeLightboxImages.length,
                  }))
                }
                className="absolute left-2 sm:left-4 z-30 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition cursor-pointer shadow-xl"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Completely Unblocked Full Image */}
            <img
              src={activeLightboxImages[lightboxState.imageIndex]}
              alt={activeLightboxProject.name}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-800"
            />

            {/* Next Arrow */}
            {activeLightboxImages.length > 1 && (
              <button
                onClick={() =>
                  setLightboxState((prev) => ({
                    ...prev,
                    imageIndex:
                      (prev.imageIndex + 1) % activeLightboxImages.length,
                  }))
                }
                className="absolute right-2 sm:right-4 z-30 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition cursor-pointer shadow-xl"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* BOTTOM THUMBNAILS BAR (ROW 3 - OUTSIDE IMAGE AREA) */}
          {activeLightboxImages.length > 1 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full flex justify-center shrink-0"
            >
              <div className="flex items-center gap-2.5 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl max-w-full overflow-x-auto">
                {activeLightboxImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      setLightboxState((prev) => ({ ...prev, imageIndex: idx }))
                    }
                    className={`w-14 h-10 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                      lightboxState.imageIndex === idx
                        ? "border-sky-400 scale-105 shadow-md"
                        : "border-transparent opacity-40 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt="Thumb"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-2 shrink-0" />
          )}
        </div>
      )}

      {/* Editor Modal Component */}
      <AppShowcaseEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        projects={projects}
        setProjects={setProjects}
      />
    </main>
  );
}
