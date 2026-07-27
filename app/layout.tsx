"use client";

import { useState, createContext, useContext } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

interface ProfileContextType {
  name: string;
  setName: (v: string) => void;
  quote: string;
  setQuote: (v: string) => void;
  profileImg: string;
  setProfileImg: (v: string) => void;
  signature: string;
  setSignature: (v: string) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context)
    throw new Error("useProfile must be used within ProfileProvider");
  return context;
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("VIVEK");
  const [quote, setQuote] = useState("Full-Stack Developer & ECE Engineer");
  const [profileImg, setProfileImg] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  );
  const [signature, setSignature] = useState("Vivek Chaurasiya");

  return (
    <html lang="en" className="dark bg-slate-950 transition-colors">
      <body
        className={`${inter.className} bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col m-0 p-0`}
      >
        <ProfileContext.Provider
          value={{
            name,
            setName,
            quote,
            setQuote,
            profileImg,
            setProfileImg,
            signature,
            setSignature,
          }}
        >
          <Navbar />
          {/* Main content wrapper */}
          <div className="flex-1 w-full max-w-7xl mx-auto px-6 bg-transparent">
            {children}
          </div>
        </ProfileContext.Provider>
      </body>
    </html>
  );
}
