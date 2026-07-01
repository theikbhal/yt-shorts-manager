'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FiX, FiUpload, FiLink } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function BulkImportModal({ projectId, onClose, onImported }) {
  const [urls, setUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [imported, setImported] = useState(0)

  function parseUrls(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    const urlPattern = /(?:youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/watch\?v=)[\w-]+/
    
    return lines.filter(line => urlPattern.test(line))
  }

  async function handleImport() {
    const validUrls = parseUrls(urls)
    
    if (validUrls.length === 0) {
      toast.error('No valid YouTube URLs found')
      return
    }

    setLoading(true)
    let count = 0

    for (const url of validUrls) {
      const { error } = await supabase
        .from('videos')
        .insert({
          project_id: projectId,
          url: url.trim(),
          downloaded: false
        })

      if (!error) count++
    }

    setImported(count)
    setLoading(false)
    
    if (count > 0) {
      toast.success(`Imported ${count} videos!`)
      onImported()
      setTimeout(onClose, 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg card neon-border-pink">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiUpload className="text-neon-pink" />
            Import YouTube URLs
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="text-gray-400" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-3">
            Paste YouTube Shorts URLs below (one per line):
          </p>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            className="textarea-neon h-48 font-mono text-sm"
            placeholder={`https://youtube.com/shorts/abc123
https://youtube.com/shorts/def456
https://youtu.be/ghi789`}
          />
          <p className="text-xs text-gray-500 mt-2">
            <FiLink className="inline mr-1" />
            Detected {parseUrls(urls).length} valid URLs
          </p>
        </div>

        {imported > 0 ? (
          <div className="text-center py-4">
            <p className="text-neon-green text-lg font-semibold">
              ✓ Imported {imported} videos
            </p>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-neon-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading || parseUrls(urls).length === 0}
              className="flex-1 btn-neon disabled:opacity-50"
            >
              {loading ? 'Importing...' : `Import ${parseUrls(urls).length} URLs`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
