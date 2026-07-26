"use client";

import { useState, createContext, useContext } from "react";
import { Inter, Great_Vibes } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });
const signatureFont = Great_Vibes({ weight: "400", subsets: ["latin"] });

// Context for editable homepage data
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
  const [name, setName] = useState("Vivek");
  const [quote, setQuote] = useState("Full-Stack Developer & ECE Engineer");
  const [profileImg, setProfileImg] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  );
  const [signature, setSignature] = useState("Vivek Chaurasiya");

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#f5f5f3] text-slate-900 min-h-screen flex flex-col`}
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
          <Navbar signatureFontClass={signatureFont.className} />
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 relative">
            {children}
          </main>
        </ProfileContext.Provider>
      </body>
    </html>
  );
}
