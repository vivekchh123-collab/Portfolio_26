export default function ResumePage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold">Curriculum Vitae</h1>
          <p className="text-slate-400 mt-1">
            Academic background and technical proficiency
          </p>
        </div>
        {/* Download PDF button */}
        <a
          href="/cv.pdf"
          download
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
        >
          Download PDF
        </a>
      </div>

      {/* Education */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-400">Education</h2>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold">
              B.Tech in Electronics and Communication Engineering
            </h3>
            <span className="text-xs text-slate-500 font-mono">Present</span>
          </div>
          <p className="text-slate-400 text-sm">
            Focusing on core engineering, digital systems, programming, and
            mathematical analysis.
          </p>
        </div>
      </section>

      {/* Core Competencies */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-400">
          Skills & Knowledge
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h3 className="font-bold mb-2">Web Development</h3>
            <p className="text-sm text-slate-400">
              Next.js, React, Node.js, Express, Fastify, REST APIs, Tailwind CSS
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h3 className="font-bold mb-2">Databases & Tools</h3>
            <p className="text-sm text-slate-400">
              PostgreSQL, MongoDB, Prisma ORM, Docker, Git, VS Code
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
