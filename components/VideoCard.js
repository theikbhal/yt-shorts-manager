'use client'

import { useState } from 'react'
import { getSupabase } from '../lib/supabase'
import { FiVideo, FiCheck, FiExternalLink, FiTrash2, FiEdit2, FiCopy } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function VideoCard({ video, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(video.notes || '')

  async function toggleDownloaded() {
    await getSupabase()
      .from('videos')
      .update({ downloaded: !video.downloaded })
      .eq('id', video.id)
    onUpdate()
  }

  async function handleDelete() {
    await getSupabase().from('videos').delete().eq('id', video.id)
    toast.success('Video removed')
    onUpdate()
  }

  async function saveNotes() {
    await getSupabase()
      .from('videos')
      .update({ notes })
      .eq('id', video.id)
    setEditing(false)
    toast.success('Notes saved')
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(video.url)
    toast.success('URL copied!')
  }

  const getVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/shorts\/|youtu\.be\/)([^&?/]+)/)
    return match ? match[1] : null
  }

  const videoId = getVideoId(video.url)
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null

  return (
    <div className={`card ${video.downloaded ? 'neon-border-green' : 'neon-border'} transition-all`}>
      <div className="flex gap-3">
        {/* Thumbnail */}
        {thumbnailUrl && (
          <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-20 rounded-lg overflow-hidden bg-gray-800">
            <img
              src={thumbnailUrl}
              alt="thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm text-white truncate flex-1">{video.url}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={copyUrl}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                title="Copy URL"
              >
                <FiCopy className="text-gray-400 text-sm" />
              </button>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiExternalLink className="text-gray-400 text-sm" />
              </a>
              <button
                onClick={handleDelete}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiTrash2 className="text-gray-400 text-sm" />
              </button>
            </div>
          </div>

          {/* Notes */}
          {editing ? (
            <div className="mb-2">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveNotes}
                onKeyDown={(e) => e.key === 'Enter' && saveNotes()}
                className="input-neon text-sm py-1 px-2"
                placeholder="Add note..."
                autoFocus
              />
            </div>
          ) : (
            video.notes && (
              <p 
                className="text-xs text-gray-400 mb-2 cursor-pointer hover:text-neon-cyan"
                onClick={() => setEditing(true)}
              >
                📝 {video.notes}
              </p>
            )
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDownloaded}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                video.downloaded
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-neon-yellow hover:text-neon-yellow'
              }`}
            >
              {video.downloaded ? (
                <>
                  <FiCheck className="text-sm" /> Downloaded
                </>
              ) : (
                <>
                  <FiVideo className="text-sm" /> Pending
                </>
              )}
            </button>
            {!video.notes && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-500 hover:text-neon-cyan transition-colors"
              >
                + Add note
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
