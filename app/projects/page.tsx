const projects = [
  {
    title: "Personal Performance Tracker",
    description:
      "Habit tracking and data visualization app analyzing daily routines and productivity trends.",
    tech: ["Next.js", "Node.js", "Prisma", "PostgreSQL"],
    link: "#",
  },
  {
    title: "Full-Stack Portfolio",
    description:
      "Modern developer portfolio built with Next.js App Router and styled with Tailwind CSS.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS"],
    link: "#",
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-slate-400 mt-1">
          A collection of applications and systems I&apos;ve built.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100">
                {project.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {project.description}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 bg-slate-800 text-indigo-300 text-xs rounded font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
