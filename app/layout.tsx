import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vivek Chaurasiya | Full-Stack Portfolio",
  description: "Personal Developer Profile Website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
          {children}
        </main>
        <footer className="border-t border-slate-800 text-center py-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Vivek Chaurasiya. Built with Next.js &
          Tailwind CSS.
        </footer>
      </body>
    </html>
  );
}
