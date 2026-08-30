# Dynamic Developer Portfolio & Credential Showcase

A modern, full-stack personal portfolio and developer showcase platform built with Next.js (App Router), Clerk Authentication, Supabase, and Tailwind CSS.

---

## 🌟 Key Features

- **Interactive Hero & Profile Management:** In-browser modal editor for bio, roles, names, custom signatures, and compressed image uploads.
- **Dynamic Projects Showcase:** Manage applications with live URLs, technology tags, multi-screenshot galleries, and full-screen lightbox view.
- **Certificates & Badges Showcase:** Dedicated certificates page with credential verification links, multi-asset previews, and modal editing.
- **Public Social Engagements:** Visitors can like and comment on projects and certificates in real-time without mandatory authentication.
- **Custom Social & Developer Links:** Manage customizable dropdown platform links (GitHub, LeetCode, LinkedIn, Instagram, etc.) with custom icon uploads.
- **Password-Protected Resume System:** Integrated resume editor featuring customizable work history, education, skills, and private access passwords.
- **Shareable Profile Previews:** Share custom public views via `?viewUser=[USER_ID]` query parameters.
- **Seamless Dark Mode:** Responsive light/dark theme toggles built with Tailwind CSS.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Authentication:** [Clerk](https://clerk.com/)
- **Database & Persistence:** [Supabase](https://supabase.com/) (PostgreSQL & JSONB Data Models)
- **Styling:** Tailwind CSS
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** TypeScript

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/portfolio-app.git
cd portfolio-app
```

### 2. Install Dependencies

```bash
npm install
```
### 3. Supabase Database Schema

Run the following SQL migration script in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  name TEXT DEFAULT 'Portfolio Owner',
  email TEXT,
  role TEXT DEFAULT 'Software Engineer',
  bio TEXT DEFAULT 'Building scalable web experiences.',
  signature TEXT DEFAULT 'Signature',
  profile_img TEXT,
  github_url TEXT DEFAULT 'https://github.com',
  leetcode_url TEXT DEFAULT 'https://leetcode.com',
  custom_links JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  certificates JSONB DEFAULT '[]'::jsonb,
  project_likes_map JSONB DEFAULT '{}'::jsonb,
  project_user_likes_map JSONB DEFAULT '{}'::jsonb,
  project_comments_map JSONB DEFAULT '{}'::jsonb,
  cert_likes_map JSONB DEFAULT '{}'::jsonb,
  cert_user_likes_map JSONB DEFAULT '{}'::jsonb,
  cert_comments_map JSONB DEFAULT '{}'::jsonb,
  resume_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Architecture

```
├── app/
│   ├── certificates/      # Certificates view & layout
│   ├── projects/          # Projects showcase & comments
│   ├── resume/            # Password-protected resume
│   ├── layout.tsx         # Root layout & Profile Context
│   └── page.tsx           # Hero page
├── components/
│   ├── editor/            # In-browser live editor modals
│   │   ├── AppShowcaseEditorModal.tsx
│   │   ├── CertificateEditorModal.tsx
│   │   ├── HomeEditorModal.tsx
│   │   ├── ProjectsEditorModal.tsx
│   │   └── ResumeEditorModal.tsx
│   ├── Loading/           # Skeleton loaders
│   └── Navbar.tsx         # Global navigation & quick action triggers
└── lib/
    └── supabaseClient.ts  # Supabase client instantiation
```

---

## 🚢 Deployment

Deploy seamlessly on Vercel:

1. Push your repository to GitHub.
2. Import the project on [Vercel](https://vercel.com/new).
3. Add your environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Click Deploy.
