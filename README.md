# YT Shorts Manager

A mobile-responsive web app for managing YouTube Shorts video collections.

**Live:** https://yt-shorts-manager.vercel.app

## Features

- Create and manage projects
- Bulk import YouTube Shorts URLs
- Track download status per video
- Add notes at project and video level
- Store folder paths for downloads
- Paginated video list
- Copy all URLs with one click
- YouTube thumbnail auto-fetch
- Neon-styled dark UI

## Quick Start

### 1. Supabase Database

Go to Supabase Dashboard → SQL Editor and run the SQL in `supabase/schema.sql`

### 2. Install & Run

```bash
npm install
npm run dev
```

### 3. Deploy

Already deployed to Vercel. Push to GitHub for auto-deploy:

```bash
git add . && git commit -m "update" && git push
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Tech Stack

- Next.js 14
- Supabase (PostgreSQL)
- Tailwind CSS
- Vercel
