"use client";

import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ExternalLink,
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
import CertificateEditorModal, {
  CertificateItem,
} from "@/components/editor/CertificateEditorModal";
import CertificateSkeleton from "@/components/Loading/CertificateSkeleton";

export const dynamic = "force-dynamic";

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

function CertificatesContent() {
  const { user, isSignedIn } = useUser();
  const searchParams = useSearchParams();

  const viewUserId = searchParams.get("viewUser");
  const targetUserId = viewUserId || user?.id;
  const isOwner = Boolean(isSignedIn && user && targetUserId === user.id);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [sessionLikedMap, setSessionLikedMap] = useState<
    Record<string, boolean>
  >({});
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});

  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    certId: string | null;
    imageIndex: number;
  }>({
    isOpen: false,
    certId: null,
    imageIndex: 0,
  });

  const [activeCommentCertId, setActiveCommentCertId] = useState<string | null>(
    null,
  );
  const [commentInput, setCommentInput] = useState("");
  const [authorNameInput, setAuthorNameInput] = useState("");
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const defaultCertificates: CertificateItem[] = [
    {
      id: "1",
      title: "Certificate Title",
      issuer: "ISSUING ORGANIZATION",
      issueDate: "2026",
      description:
        "Brief overview of achievements and accredited competencies...",
      credentialUrl: "https://example.com/verify-cert",
      images: [
        "https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=1000&auto=format&fit=crop",
      ],
    },
  ];

  const [certificates, setCertificates] =
    useState<CertificateItem[]>(defaultCertificates);

  const sortedCertificates = useMemo(() => {
    return [...certificates].reverse();
  }, [certificates]);

  const loadCertsData = useCallback(async () => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("certificates, cert_likes_map, cert_comments_map")
        .eq("user_id", targetUserId)
        .single();

      if (data && !error) {
        if (
          data.certificates &&
          Array.isArray(data.certificates) &&
          data.certificates.length > 0
        ) {
          setCertificates(data.certificates);
        }
        if (data.cert_likes_map) setLikesMap(data.cert_likes_map);
        if (data.cert_comments_map) setCommentsMap(data.cert_comments_map);
      }
    } catch (e) {
      console.error("Failed to load certificate data from Supabase", e);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    loadCertsData();
    window.addEventListener("certificates-updated", loadCertsData);
    return () =>
      window.removeEventListener("certificates-updated", loadCertsData);
  }, [loadCertsData]);

  const syncEngagementsToSupabase = async (
    updatedLikes: Record<string, number>,
    updatedComments: Record<string, Comment[]>,
  ) => {
    if (!targetUserId) return;
    try {
      await supabase
        .from("profiles")
        .update({
          cert_likes_map: updatedLikes,
          cert_comments_map: updatedComments,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", targetUserId);
    } catch (err) {
      console.error("Failed to sync certificate engagements:", err);
    }
  };

  const handleLikeToggle = (certId: string) => {
    const isCurrentlyLiked = !!sessionLikedMap[certId];
    const currentLikes = likesMap[certId] || 0;

    const nextLikes = isCurrentlyLiked
      ? Math.max(0, currentLikes - 1)
      : currentLikes + 1;

    const updatedLikesMap = { ...likesMap, [certId]: nextLikes };
    const updatedSessionMap = {
      ...sessionLikedMap,
      [certId]: !isCurrentlyLiked,
    };

    setLikesMap(updatedLikesMap);
    setSessionLikedMap(updatedSessionMap);

    syncEngagementsToSupabase(updatedLikesMap, commentsMap);
  };

  const handleAddComment = (certId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: authorNameInput.trim() || "Visitor",
      text: commentInput.trim(),
      timestamp: "Just now",
    };

    const certComments = commentsMap[certId] || [];
    const updatedComments = [newComment, ...certComments];
    const updatedCommentsMap = { ...commentsMap, [certId]: updatedComments };

    setCommentsMap(updatedCommentsMap);
    syncEngagementsToSupabase(likesMap, updatedCommentsMap);
    setCommentInput("");
  };

  const handleDeleteComment = (certId: string, commentId: string) => {
    if (!isOwner) return;
    const certComments = commentsMap[certId] || [];
    const filtered = certComments.filter((c) => c.id !== commentId);
    const updatedCommentsMap = { ...commentsMap, [certId]: filtered };

    setCommentsMap(updatedCommentsMap);
    syncEngagementsToSupabase(likesMap, updatedCommentsMap);
  };

  const handleShare = async (cert: CertificateItem) => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: cert.title,
      text: `View accredited certificate: ${cert.title} issued by ${cert.issuer}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShareId(cert.id);
      setTimeout(() => setCopiedShareId(null), 2500);
    }
  };

  const activeLightboxCert = certificates.find(
    (c) => c.id === lightboxState.certId,
  );
  const activeLightboxImages = activeLightboxCert?.images || [];

  if (isLoading) {
    return <CertificateSkeleton />;
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] pt-24 pb-12 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-6xl mx-auto space-y-10 flex flex-col items-center px-4 sm:px-0">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Certificates &amp; Credentials
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Verified certifications, courses, and accredited achievements
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {sortedCertificates.length} Certificates
          </span>
        </div>

        {/* Certificates List */}
        <div className="w-full space-y-8 flex flex-col items-center">
          {sortedCertificates.map((cert) => {
            const certLikes = likesMap[cert.id] || 0;
            const isLiked = !!sessionLikedMap[cert.id];
            const certComments = commentsMap[cert.id] || [];
            const isCommentBoxOpen = activeCommentCertId === cert.id;

            const images =
              cert.images && cert.images.length > 0
                ? cert.images
                : [
                    "https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=1000&auto=format&fit=crop",
                  ];

            const extraImages = images.slice(1);
            const isSingleImage = images.length === 1;

            return (
              <div
                key={cert.id}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-colors space-y-6 flex flex-col justify-between"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-indigo-400 font-bold text-xs uppercase tracking-wider">
                      {cert.issuer} • {cert.issueDate}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {cert.title}
                    </h2>
                  </div>

                  {cert.credentialUrl && (
                    <a
                      href={
                        cert.credentialUrl.startsWith("http")
                          ? cert.credentialUrl
                          : `https://${cert.credentialUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition shadow-md border border-slate-700"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                {/* DYNAMIC MEDIA & CONTENT GRID */}
                {isSingleImage ? (
                  /* Case 1 Image: Left Image + Right Details Content */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Left Primary Image */}
                    <div className="md:col-span-6 lg:col-span-5">
                      <div
                        onClick={() =>
                          setLightboxState({
                            isOpen: true,
                            certId: cert.id,
                            imageIndex: 0,
                          })
                        }
                        className="group relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl"
                      >
                        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-bold text-xs shadow-md tracking-wider">
                          {cert.issueDate || "2026"}
                        </div>
                        <img
                          src={images[0]}
                          alt={cert.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[1.5px] gap-1.5 text-xs font-semibold">
                          <Maximize2 size={16} />
                          <span>View Full</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Empty Space Filled by Credential Details */}
                    <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-center space-y-2 p-2">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                        CREDENTIAL DETAILS
                      </h3>
                      <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
                        {cert.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Case Multi-Images: Left Primary Image + Right Extra Images Grid */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      {/* Left Main Featured Image */}
                      <div
                        onClick={() =>
                          setLightboxState({
                            isOpen: true,
                            certId: cert.id,
                            imageIndex: 0,
                          })
                        }
                        className="md:col-span-6 lg:col-span-5 group relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl"
                      >
                        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-bold text-xs shadow-md tracking-wider">
                          {cert.issueDate || "2026"}
                        </div>
                        <img
                          src={images[0]}
                          alt={`${cert.title} 1`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[1.5px] gap-1.5 text-xs font-semibold">
                          <Maximize2 size={16} />
                          <span>Main Image</span>
                        </div>
                      </div>

                      {/* Right Grid Column for Additional Uploaded Images */}
                      <div className="md:col-span-6 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {extraImages.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() =>
                              setLightboxState({
                                isOpen: true,
                                certId: cert.id,
                                imageIndex: idx + 1,
                              })
                            }
                            className="group relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                          >
                            <img
                              src={img}
                              alt={`${cert.title} ${idx + 2}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[1.5px]">
                              <Maximize2 size={14} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description Below for Multi-Image Items */}
                    <div className="space-y-1 pt-1">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        CREDENTIAL DETAILS
                      </h3>
                      <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                        {cert.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeToggle(cert.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shadow-xs cursor-pointer border text-xs font-bold ${
                        isLiked
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-slate-800 border-slate-700 text-rose-500 hover:bg-slate-700"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={isLiked ? "fill-white" : "fill-rose-500"}
                      />
                      <span>{certLikes} Likes</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentCertId(
                          isCommentBoxOpen ? null : cert.id,
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 hover:bg-slate-700 text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <MessageSquare size={16} />
                      <span>{certComments.length} Comments</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleShare(cert)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-900 text-xs font-bold transition cursor-pointer shadow-md"
                  >
                    {copiedShareId === cert.id ? (
                      <>
                        <Check size={15} className="text-emerald-600" />
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

                {/* Comments Drawer */}
                {isCommentBoxOpen && (
                  <div className="pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Endorsements &amp; Comments ({certComments.length})
                      </h4>
                      <button
                        onClick={() => setActiveCommentCertId(null)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => handleAddComment(cert.id, e)}
                      className="space-y-2 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60"
                    >
                      <input
                        type="text"
                        placeholder="Your Name (optional)"
                        value={authorNameInput}
                        onChange={(e) => setAuthorNameInput(e.target.value)}
                        className="w-full p-2 border rounded-xl text-xs bg-slate-900 border-slate-700 text-white focus:outline-indigo-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Leave an endorsement or review..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className="flex-1 p-2.5 border rounded-xl text-xs bg-slate-900 border-slate-700 text-white focus:outline-indigo-500"
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

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {certComments.length > 0 ? (
                        certComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs space-y-1 relative group"
                          >
                            <div className="flex justify-between items-center pr-6">
                              <span className="font-bold text-indigo-400">
                                {comment.author}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {comment.timestamp}
                              </span>
                            </div>
                            <p className="text-slate-300">{comment.text}</p>
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteComment(cert.id, comment.id)
                                }
                                className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                title="Delete Comment"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center py-2">
                          No comments yet. Be the first to endorse!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxState.isOpen && activeLightboxCert && (
        <div
          onClick={() =>
            setLightboxState({ isOpen: false, certId: null, imageIndex: 0 })
          }
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none overflow-hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full flex justify-between items-center bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl text-white max-w-6xl mx-auto shadow-2xl shrink-0"
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-tight">
                {activeLightboxCert.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                Accredited by {activeLightboxCert.issuer} (
                {lightboxState.imageIndex + 1} of {activeLightboxImages.length})
              </p>
            </div>
            <button
              onClick={() =>
                setLightboxState({ isOpen: false, certId: null, imageIndex: 0 })
              }
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 w-full max-w-6xl mx-auto my-3 flex items-center justify-center overflow-hidden"
          >
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

            <img
              src={activeLightboxImages[lightboxState.imageIndex]}
              alt={activeLightboxCert.title}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-800"
            />

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

          {activeLightboxImages.length > 1 && (
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
          )}
        </div>
      )}

      <CertificateEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        certificates={certificates}
        setCertificates={setCertificates}
      />
    </main>
  );
}

export default function CertificatesPage() {
  return (
    <Suspense fallback={<CertificateSkeleton />}>
      <CertificatesContent />
    </Suspense>
  );
}
