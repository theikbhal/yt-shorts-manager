-- Run this in Supabase SQL Editor

CREATE TABLE simple_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  notes TEXT,
  downloaded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE simple_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON simple_videos FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_simple_videos_downloaded ON simple_videos(downloaded);
