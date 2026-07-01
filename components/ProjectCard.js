'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { FiFolder, FiVideo, FiDownload, FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi'

export default function ProjectCard({ project, onUpdate }) {
  const router = useRouter()
  const [videoCount, setVideoCount] = useState(0)
  const [downloadedCount, setDownloadedCount] = useState(0)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(project.name)

  useEffect(() => {
    fetchCounts()
  }, [project.id])

  async function fetchCounts() {
    const { count: total } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id)

    const { count: downloaded } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id)
      .eq('downloaded', true)

    setVideoCount(total || 0)
    setDownloadedCount(downloaded || 0)
  }

  async function handleUpdateName() {
    await supabase
      .from('projects')
      .update({ name })
      .eq('id', project.id)
    setEditing(false)
    onUpdate()
  }

  async function handleDelete() {
    if (confirm('Delete this project and all its videos?')) {
      await supabase.from('videos').delete().eq('project_id', project.id)
      await supabase.from('projects').delete().eq('id', project.id)
      onUpdate()
    }
  }

  const progress = videoCount > 0 ? (downloadedCount / videoCount) * 100 : 0

  return (
    <div className="card neon-border group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FiFolder className="text-neon-cyan flex-shrink-0" />
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleUpdateName}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
              className="input-neon text-sm py-1 px-2 flex-1"
              autoFocus
            />
          ) : (
            <h3 
              className="font-semibold text-white truncate cursor-pointer hover:text-neon-cyan transition-colors"
              onClick={() => router.push(`/project/${project.id}`)}
            >
              {project.name}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiEdit2 className="text-gray-400 hover:text-neon-cyan" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiTrash2 className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {project.folder_path && (
        <p className="text-xs text-gray-500 mb-3 truncate" title={project.folder_path}>
          📁 {project.folder_path}
        </p>
      )}

      {project.notes && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.notes}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Download Progress</span>
          <span className="text-neon-green">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-pink to-neon-green transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-gray-400">
            <FiVideo className="text-neon-pink" />
            {videoCount} videos
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <FiDownload className="text-neon-green" />
            {downloadedCount} done
          </span>
        </div>
        <button
          onClick={() => router.push(`/project/${project.id}`)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <FiExternalLink className="text-gray-400 hover:text-neon-cyan" />
        </button>
      </div>
    </div>
  )
}
