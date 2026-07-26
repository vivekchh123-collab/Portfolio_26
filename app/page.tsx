"use client";

import { ArrowDown } from "lucide-react";
import { Great_Vibes, Oswald } from "next/font/google";
import { useProfile } from "./layout";

const signatureFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const headlineFont = Oswald({
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const { name, quote, profileImg, signature } = useProfile();

  return (
    <main className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between py-8 text-black dark:text-white bg-white dark:bg-slate-950 transition-colors w-full">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Side: FIXED "I AM" + DYNAMIC NAME */}
        <section className="lg:col-span-7 space-y-6 z-10">
          {/* Headline */}
          <div
            className={`space-y-0 leading-[0.85] tracking-tight uppercase ${headlineFont.className}`}
          >
            <h1 className="text-7xl sm:text-8xl md:text-[110px] font-bold text-black dark:text-white">
              I AM
            </h1>
            <h2 className="text-7xl sm:text-8xl md:text-[110px] font-bold text-black dark:text-white break-words">
              {name}
            </h2>
          </div>

          {/* Tagline / Quote */}
          <div className="pt-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[2px] bg-black dark:bg-white" />
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-normal">
                 {quote}
              </p>
            </div>
          </div>
        </section>

        {/* Right Side: Portrait Image */}
        <section className="lg:col-span-5 flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-md aspect-[4/5] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <img
              src={profileImg}
              alt={name}
              className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition duration-700 dark:mix-blend-normal mix-blend-multiply"
            />
          </div>
        </section>
      </div>

      {/* Bottom Signature */}
      <div className="flex justify-end pt-6">
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">
            Verified Signature
          </span>
          <p
            className={`text-4xl text-black dark:text-white select-none ${signatureFont.className}`}
          >
            {signature}
          </p>
        </div>
      </div>
    </main>
  );
}
