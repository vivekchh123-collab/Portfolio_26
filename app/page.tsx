"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Heart,
  UserPlus,
  UserCheck,
  Users,
  HeartHandshake,
  Check,
  Share2,
} from "lucide-react";
import { Great_Vibes } from "next/font/google";
import { useProfile } from "./layout";
import { supabase } from "@/lib/supabaseClient";
import HomeSkeleton from "@/components//Loading/HomeSkeleton";

export const dynamic = "force-dynamic";

const signatureFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function HomeContent() {
  const profileContext = useProfile();
  const { user } = useUser();
  const searchParams = useSearchParams();

  // Read URL parameters for view mode
  const searchedUserFromUrl = searchParams.get("user");
  const viewUserId = searchParams.get("viewUser");
  const targetUserId = viewUserId || user?.id;

  const [isLoading, setIsLoading] = useState(true);

  // Username State
  const [username, setUsername] = useState("olivia_wilson");
  const [copiedLink, setCopiedLink] = useState(false);

  // View Mode State
  const [viewedUser] = useState<string | null>(null);

  // Engagement States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Load Profile and Engagement Counts directly from Supabase
  const fetchPageProfile = async () => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (data && !error) {
        if (data.username) setUsername(data.username);
        if (data.name && profileContext?.setName)
          profileContext.setName(data.name);
        if (data.role && profileContext?.setRole)
          profileContext.setRole(data.role);
        if (data.bio && profileContext?.setBio) profileContext.setBio(data.bio);
        if (data.signature && profileContext?.setSignature)
          profileContext.setSignature(data.signature);
        if (data.profile_img && profileContext?.setProfileImg)
          profileContext.setProfileImg(data.profile_img);
        if (typeof data.follower_count === "number")
          setFollowerCount(data.follower_count);
        if (typeof data.following_count === "number")
          setFollowingCount(data.following_count);
        if (typeof data.like_count === "number") setLikeCount(data.like_count);
      }
    } catch (e) {
      console.error("Failed to load profile from database", e);
    } finally {
      setIsLoading(false); // Hide home skeleton when profile data arrives
    }
  };

  useEffect(() => {
    fetchPageProfile();

    window.addEventListener("profile-updated", fetchPageProfile);
    return () =>
      window.removeEventListener("profile-updated", fetchPageProfile);
  }, [user, searchParams, targetUserId]);

  // Public Follow Handler
  const handleFollowToggle = async () => {
    if (!targetUserId) return;

    const nextIsFollowing = !isFollowing;
    const nextFollowerCount = nextIsFollowing
      ? followerCount + 1
      : Math.max(0, followerCount - 1);

    setIsFollowing(nextIsFollowing);
    setFollowerCount(nextFollowerCount);

    await supabase.from("profiles").upsert(
      {
        user_id: targetUserId,
        follower_count: nextFollowerCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  };

  // Public Profile Like Handler
  const handleProfileLikeToggle = async () => {
    if (!targetUserId) return;

    const nextHasLiked = !hasLiked;
    const nextLikeCount = nextHasLiked
      ? likeCount + 1
      : Math.max(0, likeCount - 1);

    setHasLiked(nextHasLiked);
    setLikeCount(nextLikeCount);

    await supabase.from("profiles").upsert(
      {
        user_id: targetUserId,
        like_count: nextLikeCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  };

  // Generate Direct Shareable Link with target ID
  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      const currentHost = window.location.origin;
      const targetId = user?.id || viewUserId;
      const shareableLink = targetId
        ? `${currentHost}/?viewUser=${targetId}`
        : currentHost;

      navigator.clipboard.writeText(shareableLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Display states
  const activeUserQuery = searchedUserFromUrl || viewedUser;
  const activeName = activeUserQuery
    ? activeUserQuery
    : profileContext?.name || "Olivia Wilson";
  const activeSignature = activeUserQuery
    ? activeUserQuery
    : profileContext?.signature || "Olivia";

  const isViewingGuest = Boolean(activeUserQuery);

  return (
    <>
      {/* Home / About Me Specific Skeleton */}
      {isLoading && <HomeSkeleton />}

      <main className="min-h-[calc(100vh-5rem)] pt-24 pb-12 flex items-center justify-center text-slate-900 dark:text-slate-100 transition-colors px-4">
        <div className="w-full max-w-6xl mx-auto bg-sky-100/60 dark:bg-slate-900/60 border border-sky-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[520px]">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xl sm:text-2xl font-medium text-slate-600 dark:text-slate-400">
                      Hi, I'm
                    </p>

                    {/* Share Direct View-Only Link Button */}
                    {!isViewingGuest && (
                      <button
                        onClick={handleCopyShareLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs"
                        title="Copy Direct HTTP Link"
                      >
                        {copiedLink ? (
                          <>
                            <Check size={14} className="text-emerald-500" />
                            <span className="text-emerald-500">
                              Link Copied!
                            </span>
                          </>
                        ) : (
                          <>
                            <Share2 size={14} />
                            <span>Share Link</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold capitalize text-slate-900 dark:text-white tracking-tight">
                    {activeName}
                  </h1>

                  <h2 className="text-2xl sm:text-3xl font-light text-slate-600 dark:text-slate-300 pt-2">
                    {profileContext?.role ||
                      "Designer & Developer crafting modern digital experiences."}
                  </h2>
                </div>

                <div className="pt-2 border-t border-slate-300/40 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    About Myself
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                    {profileContext?.bio ||
                      "I'm a passionate designer and developer creating modern digital experiences."}
                  </p>
                </div>
              </div>

              {/* STATS & ENGAGEMENT */}
              <div className="pt-6 border-t border-slate-300/40 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800 text-sky-600 dark:text-sky-400">
                      <Users size={18} />
                    </div>
                    <div>
                      <span className="text-base font-extrabold block leading-none">
                        {followerCount}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Followers
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                      <HeartHandshake size={18} />
                    </div>
                    <div>
                      <span className="text-base font-extrabold block leading-none">
                        {followingCount}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Following
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800 text-rose-500">
                      <Heart
                        size={18}
                        className={hasLiked ? "fill-rose-500" : ""}
                      />
                    </div>
                    <div>
                      <span className="text-base font-extrabold block leading-none">
                        {likeCount}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Likes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visitor Public Engagement Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
                      isFollowing
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        : "bg-sky-600 hover:bg-sky-500 text-white"
                    }`}
                  >
                    {isFollowing ? (
                      <UserCheck size={14} />
                    ) : (
                      <UserPlus size={14} />
                    )}
                    <span>{isFollowing ? "Following" : "Follow"}</span>
                  </button>

                  <button
                    onClick={handleProfileLikeToggle}
                    className={`p-2 rounded-xl transition shadow-md border cursor-pointer ${
                      hasLiked
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-rose-500"
                    }`}
                  >
                    <Heart
                      size={16}
                      className={hasLiked ? "fill-white" : "fill-rose-500"}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-5 relative bg-sky-200/50 dark:bg-slate-800/50 flex items-center justify-center min-h-[380px] lg:min-h-full overflow-hidden">
              <img
                src={
                  profileContext?.profileImg ||
                  "data:image/jpeg;base64,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"
                }
                alt={activeName}
                className="w-full h-full object-cover object-center max-h-[550px] lg:max-h-full transition duration-500"
              />
              <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/20 text-right text-white shadow-xl pointer-events-none">
                <span className="text-[9px] uppercase tracking-widest text-slate-300 block leading-tight">
                  Verified Signature
                </span>
                <p
                  className={`text-3xl font-normal drop-shadow-md select-none capitalize ${signatureFont.className}`}
                >
                  {activeSignature}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <HomeContent />
    </Suspense>
  );
}
