"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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
import HomeSkeleton from "@/components/Loading/HomeSkeleton";

export const dynamic = "force-dynamic";

const signatureFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop";

function HomeContent() {
  const profileContext = useProfile();
  const { user } = useUser();
  const searchParams = useSearchParams();

  // Read URL parameters for view mode
  const searchedUserFromUrl = searchParams.get("user");
  const viewUserId = searchParams.get("viewUser");
  const targetUserId = viewUserId || user?.id;

  const [isLoading, setIsLoading] = useState(true);

  // Engagement & Link States
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Fetch Profile & Stats from Supabase cleanly
  const fetchPageProfile = useCallback(async () => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "name, role, bio, signature, profile_img, follower_count, following_count, like_count",
        )
        .eq("user_id", targetUserId)
        .single();

      if (data && !error) {
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
      setIsLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchPageProfile();

    window.addEventListener("profile-updated", fetchPageProfile);
    return () =>
      window.removeEventListener("profile-updated", fetchPageProfile);
  }, [fetchPageProfile]);

  // Public Follow Handler
  const handleFollowToggle = async () => {
    if (!targetUserId) return;

    const nextIsFollowing = !isFollowing;
    const nextFollowerCount = nextIsFollowing
      ? followerCount + 1
      : Math.max(0, followerCount - 1);

    setIsFollowing(nextIsFollowing);
    setFollowerCount(nextFollowerCount);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          follower_count: nextFollowerCount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", targetUserId);

      if (error) {
        console.error("Failed to sync follower count:", error.message);
      }
    } catch (err) {
      console.error("Follow sync error:", err);
    }
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

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          like_count: nextLikeCount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", targetUserId);

      if (error) {
        console.error("Failed to sync profile like count:", error.message);
      }
    } catch (err) {
      console.error("Profile like sync error:", err);
    }
  };

  // Copy Direct Share Link
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

  // Dynamic Fallbacks
  const activeUserQuery = searchedUserFromUrl;
  const fallbackName = user?.fullName || "Portfolio Owner";
  const fallbackSignature = user?.firstName || "Signature";
  const fallbackImage = user?.imageUrl || DEFAULT_AVATAR;

  const activeName = activeUserQuery
    ? activeUserQuery
    : profileContext?.name || fallbackName;

  const activeSignature = activeUserQuery
    ? activeUserQuery
    : profileContext?.signature || fallbackSignature;

  const activeProfileImg = profileContext?.profileImg || fallbackImage;

  const isViewingGuest = Boolean(
    activeUserQuery || (viewUserId && viewUserId !== user?.id),
  );

  return (
    <>
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

                    {!isViewingGuest && (
                      <button
                        onClick={handleCopyShareLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs"
                        title="Copy Direct Link"
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
                      "Developer & Designer crafting modern digital experiences."}
                  </h2>
                </div>

                <div className="pt-2 border-t border-slate-300/40 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    About Myself
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                    {profileContext?.bio ||
                      "Welcome to my personal portfolio space. Explore my work, skills, and experience!"}
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
                src={activeProfileImg}
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
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
