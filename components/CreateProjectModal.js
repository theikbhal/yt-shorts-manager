'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FiX, FiFolder, FiFileText } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function CreateProjectModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [folderPath, setFolderPath] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Project name is required')
      return
    }

    setLoading(true)
    const { error } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        notes: notes.trim(),
        folder_path: folderPath.trim()
      })

    if (error) {
      toast.error('Failed to create project')
    } else {
      toast.success('Project created!')
      onCreated()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md card neon-border-pink">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiFolder className="text-neon-pink" />
            New Project
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-neon"
              placeholder="My YT Shorts Project"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FiFileText className="inline mr-1" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea-neon h-24"
              placeholder="Project notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📁 Folder Path
            </label>
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              className="input-neon"
              placeholder="/Users/downloads/shorts"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-neon-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-neon disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
