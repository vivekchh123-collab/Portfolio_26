"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  UserPlus,
  UserCheck,
  Users,
  HeartHandshake,
} from "lucide-react";
import { Great_Vibes } from "next/font/google";
import { useProfile } from "./layout";

const signatureFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const profileContext = useProfile();

  // Interactive Engagement States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  const profile = {
    name: profileContext?.name || "Vivek Chaurasiya",
    role: profileContext?.role || "Full-Stack Developer & ECE Student",
    bio:
      profileContext?.bio ||
      "Passionate developer and engineering student dedicated to crafting clean user interfaces, scalable web applications, and interactive digital experiences.",
    profileImg:
      profileContext?.profileImg ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    signature: profileContext?.signature || "Vivek",
  };

  // Sync saved likes/followers from localStorage on load
  useEffect(() => {
    const savedFollowers = localStorage.getItem("user_follower_count");
    const savedLikes = localStorage.getItem("user_like_count");
    const savedIsFollowing = localStorage.getItem("user_is_following");
    const savedHasLiked = localStorage.getItem("user_has_liked");

    if (savedFollowers !== null) setFollowerCount(parseInt(savedFollowers, 10));
    if (savedLikes !== null) setLikeCount(parseInt(savedLikes, 10));
    if (savedIsFollowing !== null) setIsFollowing(JSON.parse(savedIsFollowing));
    if (savedHasLiked !== null) setHasLiked(JSON.parse(savedHasLiked));
  }, []);

  const handleFollowToggle = () => {
    const nextState = !isFollowing;
    const nextCount = nextState
      ? followerCount + 1
      : Math.max(0, followerCount - 1);
    setIsFollowing(nextState);
    setFollowerCount(nextCount);
    localStorage.setItem("user_is_following", JSON.stringify(nextState));
    localStorage.setItem("user_follower_count", nextCount.toString());
  };

  const handleLikeToggle = () => {
    const nextState = !hasLiked;
    const nextCount = nextState ? likeCount + 1 : Math.max(0, likeCount - 1);
    setHasLiked(nextState);
    setLikeCount(nextCount);
    localStorage.setItem("user_has_liked", JSON.stringify(nextState));
    localStorage.setItem("user_like_count", nextCount.toString());
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] pt-24 pb-12 flex items-center justify-center text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-6xl mx-auto bg-sky-100/60 dark:bg-slate-900/60 border border-sky-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[520px]">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl font-medium text-slate-600 dark:text-slate-400">
                  Hi, I'm
                </p>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {profile.name}
                </h1>
                <h2 className="text-2xl sm:text-3xl font-light text-slate-600 dark:text-slate-300 pt-1">
                  {profile.role}
                </h2>
              </div>

              <div className="pt-2 border-t border-slate-300/40 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  About Myself
                </h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                  {profile.bio}
                </p>
              </div>
            </div>

            {/* VIEWER ENGAGEMENT */}
            <div className="pt-6 border-t border-slate-300/40 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800 shadow-sm text-sky-600 dark:text-sky-400">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-base font-extrabold block leading-none">
                      {followerCount}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Followers
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400">
                    <HeartHandshake size={18} />
                  </div>
                  <div>
                    <span className="text-base font-extrabold block leading-none">
                      {followingCount}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Following
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800 shadow-sm text-rose-500">
                    <Heart
                      size={18}
                      className={hasLiked ? "fill-rose-500" : ""}
                    />
                  </div>
                  <div>
                    <span className="text-base font-extrabold block leading-none">
                      {likeCount}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                    <>
                      <UserCheck size={14} /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} /> Follow
                    </>
                  )}
                </button>

                <button
                  onClick={handleLikeToggle}
                  className={`p-2 rounded-xl transition shadow-md cursor-pointer border ${
                    hasLiked
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700"
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
              src={profile.profileImg}
              alt={profile.name}
              className="w-full h-full object-cover object-center max-h-[550px] lg:max-h-full transition duration-500"
            />
            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/20 text-right text-white shadow-xl pointer-events-none">
              <span className="text-[9px] uppercase tracking-widest text-slate-300 block leading-tight">
                Verified Signature
              </span>
              <p
                className={`text-3xl font-normal drop-shadow-md select-none ${signatureFont.className}`}
              >
                {profile.signature}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
