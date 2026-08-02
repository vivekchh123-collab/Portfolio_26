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
  name: "Vivek Chaurasiya",
  setName: () => {},
  role: "Full-Stack Developer & ECE Student",
  setRole: () => {},
  bio: "Passionate developer and engineering student dedicated to crafting clean user interfaces, scalable web applications, and interactive digital experiences.",
  setBio: () => {},
  profileImg:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  setProfileImg: () => {},
  signature: "Vivek",
  setSignature: () => {},
};

const ProfileContext = createContext<ProfileContextType>(defaultProfile);

export function useProfile() {
  return useContext(ProfileContext);
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser();

  const [name, setName] = useState("Vivek Chaurasiya");
  const [role, setRole] = useState("Full-Stack Developer & ECE Student");
  const [bio, setBio] = useState(
    "Passionate developer and engineering student dedicated to crafting clean user interfaces, scalable web applications, and interactive digital experiences.",
  );
  const [profileImg, setProfileImg] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
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
