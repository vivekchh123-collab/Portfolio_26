import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="space-y-6 pt-6">
        <span className="px-3 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
          Electronics & Communication Engineering
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Hi, I&apos;m <span className="text-indigo-400">Vivek Chaurasiya</span>
          .
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          I build scalable web applications using full-stack technologies.
          Focused on strong fundamentals in C, Node.js, React, Docker, and
          database architecture.
        </p>
        <div className="flex gap-4 pt-2">
          <Link
            href="/projects"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition"
          >
            View Projects
          </Link>
          <Link
            href="/resume"
            className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 font-medium rounded-lg transition"
          >
            Check Resume
          </Link>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="space-y-4 pt-8 border-t border-slate-800">
        <h2 className="text-xl font-bold text-slate-200">Primary Tech Stack</h2>
        <div className="flex flex-wrap gap-3">
          {[
            "Next.js",
            "React",
            "Node.js",
            "Express / Fastify",
            "PostgreSQL",
            "Prisma",
            "Docker",
            "C Programming",
          ].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
