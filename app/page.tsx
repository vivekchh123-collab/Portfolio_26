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
  AtSign,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { Great_Vibes } from "next/font/google";
import { useProfile } from "./layout";
import { supabase } from "@/lib/supabaseClient";
import SignatureLoader from "@/components/SignatureLoader";

// Force Next.js to dynamically render this page instead of static pre-rendering
export const dynamic = "force-dynamic";

const signatureFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function HomeContent() {
  const profileContext = useProfile();
  const { user, isSignedIn } = useUser();
  const searchParams = useSearchParams();

  // Read ?user= parameter from URL
  const searchedUserFromUrl = searchParams.get("user");

  const [isLoading, setIsLoading] = useState(true);

  // Username State
  const [username, setUsername] = useState("vivek_chaurasiya");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);

  // View Mode: Viewing Own Profile vs Visitor Search
  const [viewedUser, setViewedUser] = useState<string | null>(null);

  // Engagement States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Fetch user profile data directly from Supabase
  const fetchProfileFromDatabase = async () => {
    if (!isSignedIn || !user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
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
    }
  };

  useEffect(() => {
    fetchProfileFromDatabase();

    window.addEventListener("profile-updated", fetchProfileFromDatabase);
    return () =>
      window.removeEventListener("profile-updated", fetchProfileFromDatabase);
  }, [user, isSignedIn]);

  // Listen for Navbar custom search event
  useEffect(() => {
    const handleSearchEvent = (e: CustomEvent) => {
      const searched = e.detail;
      setViewedUser(searched);
    };

    window.addEventListener("search-user-profile" as any, handleSearchEvent);
    return () =>
      window.removeEventListener(
        "search-user-profile" as any,
        handleSearchEvent,
      );
  }, []);

  // Generate and Copy Direct Shareable HTTP Link
  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      const currentHost = window.location.origin;
      const targetUser = activeUsername;
      const shareableLink = `${currentHost}/?user=${targetUser}`;
      navigator.clipboard.writeText(shareableLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Copy unique username
  const handleCopyUsername = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(activeUsername);
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2000);
    }
  };

  // Determine active display states
  const activeUserQuery = searchedUserFromUrl || viewedUser;
  const activeName = activeUserQuery
    ? activeUserQuery
    : profileContext?.name || "Vivek Chaurasiya";
  const activeUsername = activeUserQuery ? activeUserQuery : username;
  const activeSignature = activeUserQuery
    ? activeUserQuery
    : profileContext?.signature || "Vivek";

  // Check if viewing someone else's profile
  const isViewingGuest = Boolean(activeUserQuery);

  return (
    <>
      {isLoading && (
        <SignatureLoader
          text={activeName}
          duration={2.5}
          onComplete={() => setIsLoading(false)}
        />
      )}

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

                  {/* USERNAME COMPONENT */}
                  <div className="flex items-center gap-2 pt-1">
                    <AtSign size={14} className="text-indigo-500" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {activeUsername}
                      </span>
                      <button
                        onClick={handleCopyUsername}
                        className="text-slate-400 hover:text-indigo-500 transition cursor-pointer"
                        title={
                          copiedUsername ? "Copied!" : "Copy Unique Username"
                        }
                      >
                        {copiedUsername ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-light text-slate-600 dark:text-slate-300 pt-2">
                    {profileContext?.role ||
                      "Full-Stack Developer & ECE Student"}
                  </h2>
                </div>

                <div className="pt-2 border-t border-slate-300/40 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    About Myself
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                    {profileContext?.bio ||
                      "Passionate developer crafting modern digital experiences."}
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

                {/* Visitor Engagement Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsFollowing(!isFollowing);
                      setFollowerCount((c) => (isFollowing ? c - 1 : c + 1));
                    }}
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
                    onClick={() => {
                      setHasLiked(!hasLiked);
                      setLikeCount((c) => (hasLiked ? c - 1 : c + 1));
                    }}
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
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
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

// Default Export wrapped in Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <HomeContent />
    </Suspense>
  );
}
