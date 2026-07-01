# How to Use - YT Shorts Manager

## Step 1: Create a Project

1. Click **New Project** button (top right)
2. Enter project name (required)
3. Add notes (optional) - for project-level notes
4. Add folder path (optional) - where downloads will be saved
5. Click **Create Project**

## Step 2: Import YouTube Shorts URLs

1. Click on a project to open it
2. Click **Import URLs** button
3. Paste YouTube Shorts URLs (one per line)
   - Supports: `youtube.com/shorts/xxx`, `youtu.be/xxx`, `youtube.com/watch?v=xxx`
4. Click **Import** button
5. URLs are auto-detected and validated

## Step 3: Manage Videos

### Toggle Download Status
- Click **Pending** button to mark as **Downloaded**
- Click **Downloaded** to mark as **Pending**

### Add Notes to Videos
- Click **+ Add note** on any video
- Type your note and press Enter

### Copy URL
- Click the copy icon to copy a single URL
- Click **Copy All** to copy all video URLs in the project

### Open Video
- Click the external link icon to open video in YouTube

### Delete Video
- Click the trash icon to remove a video

## Step 4: Track Progress

- Progress bar shows download completion percentage
- Stats show: Total projects, Total videos, Downloaded count
- Each project card shows individual progress

## Step 5: Project-Level Features

### Edit Project Name
- Click the edit icon on project card
- Type new name and press Enter

### Edit Folder Path
- Click the folder path below project name
- Enter path and click Save

### Project Notes
- Click **Notes** button in project view
- Add or edit project notes
- Click Save

### Delete Project
- Click the trash icon on project card
- Confirm deletion (deletes all videos too)

## Data Storage

All data stored in Supabase:
- `projects` table: Project name, notes, folder path
- `videos` table: URL, notes, download status

## Mobile Usage

Fully responsive - works on phones, tablets, and desktop.
