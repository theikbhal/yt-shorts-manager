-- Run this in Supabase SQL Editor

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

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (public) key
CREATE POLICY "Allow all for anon" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON videos FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_videos_project_id ON videos(project_id);
CREATE INDEX idx_videos_downloaded ON videos(downloaded);
