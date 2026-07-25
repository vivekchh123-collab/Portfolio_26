import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl text-indigo-400 hover:text-indigo-300 transition"
        >
          Vivek<span className="text-white">.dev</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-6 font-medium text-slate-300 text-sm sm:text-base">
          <Link href="/" className="hover:text-indigo-400 transition">
            Home
          </Link>
          <Link href="/resume" className="hover:text-indigo-400 transition">
            Resume
          </Link>
          <Link href="/cv" className="hover:text-indigo-400 transition">
            CV
          </Link>
          <Link href="/projects" className="hover:text-indigo-400 transition">
            Projects
          </Link>
        </div>
      </div>
    </nav>
  );
}
