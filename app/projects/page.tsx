"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ExternalLink,
  Code,
  Heart,
  MessageSquare,
  Share2,
  Send,
  Check,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import AppShowcaseEditorModal, {
  ProjectItem,
} from "@/components/editor/AppShowcaseEditorModal";
import ProjectSkeleton from "@/components/Loading/ProjectSkeleton";

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export default function ProjectsPage() {
  const { user, isSignedIn } = useUser();
  const searchParams = useSearchParams();

  // Read viewUser URL parameter to support shareable link view
  const viewUserId = searchParams.get("viewUser");
  const targetUserId = viewUserId || user?.id;

  // Check if current logged-in user is the owner of this profile
  const isOwner = Boolean(isSignedIn && user && targetUserId === user.id);

  // Loading State (Placed inside component body)
  const [isLoading, setIsLoading] = useState(true);
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
        "data:image/jpeg;base64,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",
      ],
    },
  ];

  const [projects, setProjects] = useState<ProjectItem[]>(defaultProjects);

  // Fetch Projects and Engagements from Supabase
  const loadProjectsData = async () => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "projects, project_likes_map, project_user_likes_map, project_comments_map",
        )
        .eq("user_id", targetUserId)
        .single();

      if (data && !error) {
        if (
          data.projects &&
          Array.isArray(data.projects) &&
          data.projects.length > 0
        ) {
          setProjects(data.projects);
        }
        if (data.project_likes_map) setLikesMap(data.project_likes_map);
        if (data.project_user_likes_map)
          setUserLikesMap(data.project_user_likes_map);
        if (data.project_comments_map)
          setCommentsMap(data.project_comments_map);
      }
    } catch (e) {
      console.error("Failed to load project data from Supabase", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectsData();

    const handleOpenEditor = () => setIsEditorOpen(true);
    window.addEventListener("open-projects-editor", handleOpenEditor);
    window.addEventListener("projects-updated", loadProjectsData);

    return () => {
      window.removeEventListener("open-projects-editor", handleOpenEditor);
      window.removeEventListener("projects-updated", loadProjectsData);
    };
  }, [user, viewUserId, targetUserId]);

  // Save Engagements to Supabase publicly
  const syncEngagementsToSupabase = async (
    updatedLikes: Record<string, number>,
    updatedUserLikes: Record<string, boolean>,
    updatedComments: Record<string, Comment[]>,
  ) => {
    if (!targetUserId) return;

    await supabase.from("profiles").upsert(
      {
        user_id: targetUserId,
        project_likes_map: updatedLikes,
        project_user_likes_map: updatedUserLikes,
        project_comments_map: updatedComments,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  };

  // Handle Like Toggle (Anonymous / Visitor accessible)
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

    syncEngagementsToSupabase(
      updatedLikesMap,
      updatedUserLikesMap,
      commentsMap,
    );
  };

  // Handle Add Comment (Anonymous / Visitor accessible)
  const handleAddComment = (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: authorNameInput.trim() || "Visitor",
      text: commentInput.trim(),
      timestamp: "Just now",
    };

    const projectComments = commentsMap[projectId] || [];
    const updatedComments = [newComment, ...projectComments];
    const updatedCommentsMap = { ...commentsMap, [projectId]: updatedComments };

    setCommentsMap(updatedCommentsMap);
    syncEngagementsToSupabase(likesMap, userLikesMap, updatedCommentsMap);

    setCommentInput("");
  };

  // OWNER-ONLY: Delete Comment Handler
  const handleDeleteComment = (projectId: string, commentId: string) => {
    if (!isOwner) return;

    const projectComments = commentsMap[projectId] || [];
    const filteredComments = projectComments.filter((c) => c.id !== commentId);
    const updatedCommentsMap = {
      ...commentsMap,
      [projectId]: filteredComments,
    };

    setCommentsMap(updatedCommentsMap);
    syncEngagementsToSupabase(likesMap, userLikesMap, updatedCommentsMap);
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
    <>
      {/* Renders Project-specific Skeleton Layout */}
      {isLoading && <ProjectSkeleton />}

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

                    {/* THUMBNAIL IMAGE SWITCHER */}
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

                    {/* INTERACTIVE ACTIONS BAR */}
                    <div className="pt-4 border-t border-slate-300/40 dark:border-slate-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* LIKE BUTTON (Public Access) */}
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

                        {/* COMMENT BUTTON (Public Access) */}
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

                        {/* Comment Feed with Owner Delete Controls */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {projectComments.length > 0 ? (
                            projectComments.map((comment) => (
                              <div
                                key={comment.id}
                                className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1 relative group"
                              >
                                <div className="flex justify-between items-center pr-6">
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

                                {/* OWNER-ONLY DELETE BUTTON */}
                                {isOwner && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteComment(
                                        project.id,
                                        comment.id,
                                      )
                                    }
                                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                    title="Delete Comment (Owner Only)"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
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

        {/* --- FULLSCREEN LIGHTBOX MODAL --- */}
        {lightboxState.isOpen && activeLightboxProject && (
          <div
            onClick={() =>
              setLightboxState({
                isOpen: false,
                projectId: null,
                imageIndex: 0,
              })
            }
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none overflow-hidden"
          >
            {/* TOP HEADER BAR */}
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

            {/* MAIN IMAGE CONTAINER */}
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

              {/* Full Image */}
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

            {/* BOTTOM THUMBNAILS BAR */}
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
                        setLightboxState((prev) => ({
                          ...prev,
                          imageIndex: idx,
                        }))
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
    </>
  );
}
