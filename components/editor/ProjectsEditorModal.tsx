"use client";

import { X, Code2, HelpCircle, ExternalLink } from "lucide-react";

interface ProjectsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  githubUrl: string;
  setGithubUrl: (url: string) => void;
  leetcodeUrl: string;
  setLeetcodeUrl: (url: string) => void;
}

export default function ProjectsEditorModal({
  isOpen,
  onClose,
  githubUrl,
  setGithubUrl,
  leetcodeUrl,
  setLeetcodeUrl,
}: ProjectsEditorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pt-24">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-6 shadow-2xl relative text-slate-900 dark:text-slate-100 max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Code2 size={22} className="text-indigo-600 dark:text-indigo-400" />
          Edit Developer Links & Integration
        </h2>

        <div className="space-y-6">
          {/* GITHUB FIELD & GUIDE */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              GitHub Profile URL
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/your-username"
              className="w-full p-2.5 border rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-indigo-600 font-mono text-xs"
            />

            {/* Built-in GitHub Description */}
            <div className="bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-indigo-500" />
                How to connect GitHub:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1 pl-1">
                <li>
                  Log in to{" "}
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 underline inline-flex items-center gap-0.5"
                  >
                    GitHub <ExternalLink size={10} />
                  </a>{" "}
                  and copy your profile URL from the address bar.
                </li>
                <li>
                  Make sure your profile username matches (e.g.,{" "}
                  <span className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">
                    github.com/username
                  </span>
                  ).
                </li>
                <li>
                  To show public repositories on your site, set repository
                  visibility to <strong>Public</strong> inside GitHub Settings.
                </li>
              </ul>
            </div>
          </div>

          {/* LEETCODE FIELD & GUIDE */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              LeetCode Profile URL
            </label>
            <input
              type="text"
              value={leetcodeUrl}
              onChange={(e) => setLeetcodeUrl(e.target.value)}
              placeholder="https://leetcode.com/u/your-username/"
              className="w-full p-2.5 border rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-indigo-600 font-mono text-xs"
            />

            {/* Built-in LeetCode Description */}
            <div className="bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-amber-500" />
                How to connect LeetCode:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1 pl-1">
                <li>
                  Log in to{" "}
                  <a
                    href="https://leetcode.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 underline inline-flex items-center gap-0.5"
                  >
                    LeetCode <ExternalLink size={10} />
                  </a>
                  , click your avatar at top right, and go to{" "}
                  <strong>Profile</strong>.
                </li>
                <li>
                  Copy the URL from your browser (e.g.,{" "}
                  <span className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">
                    leetcode.com/u/username/
                  </span>
                  ).
                </li>
                <li>
                  Your solved stats automatically sync publicly when visitors
                  click or view stats cards!
                </li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition mt-2 cursor-pointer shadow-lg"
        >
          Save & Apply Links
        </button>
      </div>
    </div>
  );
}
