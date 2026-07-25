export default function CVPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold">Curriculum Vitae (CV)</h1>
          <p className="text-slate-400 mt-1">
            Detailed academic profile, engineering background, and research
            interests.
          </p>
        </div>
        <a
          href="/cv.pdf"
          download
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
        >
          Download Full CV (PDF)
        </a>
      </div>

      {/* Education */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-400">Education</h2>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">
                Bachelor of Technology (B.Tech)
              </h3>
              <p className="text-indigo-300 text-sm">
                Electronics and Communication Engineering (ECE)
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Present</span>
          </div>
          <p className="text-slate-400 text-sm pt-2 leading-relaxed">
            Rigorous academic foundation covering digital electronics, circuit
            design, signal processing, advanced linear algebra, calculus, and
            foundational computer systems.
          </p>
        </div>
      </section>

      {/* Coursework & Fundamental Topics */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-400">
          Relevant Coursework & Studies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-200">
              Engineering Mathematics
            </h3>
            <p className="text-sm text-slate-400">
              Linear Algebra, Matrix Rank, Calculus, Fourier Transforms, and
              Differential Equations.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-200">
              Electrical & Computing Systems
            </h3>
            <p className="text-sm text-slate-400">
              Circuit Analysis Theorems, Memory Management, Bitwise Algorithms,
              and Low-Level C Concepts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
