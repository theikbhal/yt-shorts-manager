# YT Shorts Manager

A mobile-responsive web app for managing YouTube Shorts video collections.

## Features

- Create and manage projects
- Bulk import YouTube Shorts URLs
- Track download status per video
- Add notes at project and video level
- Store folder paths for downloads
- Paginated video list
- Neon-styled dark UI

## Setup

### 1. Supabase Database

Go to Supabase Dashboard → SQL Editor and run:

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  notes TEXT,
  folder_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  notes TEXT,
  downloaded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON videos FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_videos_project_id ON videos(project_id);
CREATE INDEX idx_videos_downloaded ON videos(downloaded);
```

### 2. Install & Run

```bash
npm install
npm run dev
```

### 3. Deploy to Vercel

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

Then connect to Vercel for auto-deployment.

## Environment Variables

Already configured in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
