"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import "@/app/globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("Vivek Chaurasiya");
  const [role, setRole] = useState("Full-Stack Developer & ECE Student");
  const [bio, setBio] = useState(
    "Passionate developer and engineering student dedicated to crafting clean user interfaces, scalable web applications, and interactive digital experiences.",
  );
  const [profileImg, setProfileImg] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  );
  const [signature, setSignature] = useState("Vivek");

  useEffect(() => {
    const saved = localStorage.getItem("user_profile_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.role) setRole(parsed.role);
        if (parsed.bio) setBio(parsed.bio);
        if (parsed.profileImg) setProfileImg(parsed.profileImg);
        if (parsed.signature) setSignature(parsed.signature);
      } catch (e) {
        console.error("Failed to load profile context", e);
      }
    }
  }, []);

  return (
    <html lang="en" className="dark">
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen antialiased transition-colors">
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
          <div className="max-w-7xl mx-auto px-6">{children}</div>
        </ProfileContext.Provider>
      </body>
    </html>
  );
}
