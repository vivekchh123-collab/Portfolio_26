"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Caveat } from "next/font/google";
import { ClerkProvider, useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import "@/app/globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-signature",
});

export interface ProfileContextType {
  name: string;
  setName: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  profileImg: string;
  setProfileImg: (val: string) => void;
  signature: string;
  setSignature: (val: string) => void;
}

const defaultProfile: ProfileContextType = {
  name: "Olivia Wilson",
  setName: () => {},
  role: "Designer & Developer",
  setRole: () => {},
  bio: "Designer & Developer crafting modern digital experiences.",
  setBio: () => {},
  profileImg:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  setProfileImg: () => {},
  signature: "Olivia",
  setSignature: () => {},
};

const ProfileContext = createContext<ProfileContextType>(defaultProfile);

export function useProfile() {
  return useContext(ProfileContext);
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser();

  const [name, setName] = useState("Olivia Wilson");
  const [role, setRole] = useState("Designer & Developer");
  const [bio, setBio] = useState(
    "I'm a passionate designer and developer creating modern digital experiences.",
  );
  const [profileImg, setProfileImg] = useState(
    "data:image/jpeg;base64,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",
  );
  const [signature, setSignature] = useState("Vivek");

  // Fetch initial profile state directly from Supabase
  const loadProfileFromSupabase = async () => {
    if (!isSignedIn || !user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, role, bio, profile_img, signature")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        if (data.name) setName(data.name);
        if (data.role) setRole(data.role);
        if (data.bio) setBio(data.bio);
        if (data.profile_img) setProfileImg(data.profile_img);
        if (data.signature) setSignature(data.signature);
      }
    } catch (e) {
      console.error("Failed to fetch layout profile context from Supabase", e);
    }
  };

  useEffect(() => {
    loadProfileFromSupabase();

    window.addEventListener("profile-updated", loadProfileFromSupabase);
    return () =>
      window.removeEventListener("profile-updated", loadProfileFromSupabase);
  }, [user, isSignedIn]);

  return (
    <ProfileContext.Provider
      value={{
        name,
        setName,
        role,
        setRole,
        bio,
        setBio,
        profileImg,
        setProfileImg,
        signature,
        setSignature,
      }}
    >
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 flex-1 w-full">{children}</div>
      <Footer />
    </ProfileContext.Provider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${caveat.variable} dark`}>
        <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen antialiased transition-colors flex flex-col justify-between">
          <LayoutContent>{children}</LayoutContent>
        </body>
      </html>
    </ClerkProvider>
  );
}
