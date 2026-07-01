'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '../../lib/supabase'
import { FiArrowLeft, FiUpload, FiCheck, FiVideo, FiCopy, FiTrash2, FiEdit2, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function SimplePage() {
  const router = useRouter()
  const [urls, setUrls] = useState('')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [batchSize, setBatchSize] = useState(30)
  const [currentBatch, setCurrentBatch] = useState(1)
  const [filter, setFilter] = useState('all') // all, pending, downloaded

  useEffect(() => {
    fetchVideos()
  }, [])

  async function fetchVideos() {
    setLoading(true)
    const { data } = await getSupabase()
      .from('simple_videos')
      .select('*')
      .order('created_at', { ascending: false })

    setVideos(data || [])
    setLoading(false)
  }

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

    setImporting(true)
    let count = 0

    for (const url of validUrls) {
      const { error } = await getSupabase()
        .from('simple_videos')
        .insert({
          url: url.trim(),
          downloaded: false
        })
      if (!error) count++
    }

    setImporting(false)
    if (count > 0) {
      toast.success(`Imported ${count} videos!`)
      setUrls('')
      fetchVideos()
    }
  }

  async function toggleDownloaded(id, current) {
    await getSupabase()
      .from('simple_videos')
      .update({ downloaded: !current })
      .eq('id', id)
    fetchVideos()
  }

  async function updateNote(id, note) {
    await getSupabase()
      .from('simple_videos')
      .update({ notes: note })
      .eq('id', id)
  }

  async function deleteVideo(id) {
    await getSupabase().from('simple_videos').delete().eq('id', id)
    toast.success('Removed')
    fetchVideos()
  }

  async function deleteAll() {
    if (confirm('Delete ALL videos?')) {
      await getSupabase().from('simple_videos').delete().neq('id', '0')
      toast.success('All deleted')
      fetchVideos()
    }
  }

  const filteredVideos = videos.filter(v => {
    if (filter === 'pending') return !v.downloaded
    if (filter === 'downloaded') return v.downloaded
    return true
  })

  const totalPages = Math.ceil(filteredVideos.length / batchSize)
  const paginatedVideos = filteredVideos.slice(
    (currentBatch - 1) * batchSize,
    currentBatch * batchSize
  )

  const downloadedCount = videos.filter(v => v.downloaded).length
  const pendingCount = videos.length - downloadedCount

  const copyAllUrls = () => {
    const allUrls = filteredVideos.map(v => v.url).join('\n')
    navigator.clipboard.writeText(allUrls)
    toast.success(`${filteredVideos.length} URLs copied!`)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiArrowLeft className="text-gray-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Simple Mode</h1>
              <p className="text-xs text-gray-400">Paste 1000+ URLs, manage in batches</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm mb-4">
            <span className="text-gray-400">
              Total: <span className="text-white font-bold">{videos.length}</span>
            </span>
            <span className="text-neon-green">
              Done: <span className="font-bold">{downloadedCount}</span>
            </span>
            <span className="text-neon-yellow">
              Pending: <span className="font-bold">{pendingCount}</span>
            </span>
          </div>

          {/* Import Section */}
          <div className="mb-4">
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="textarea-neon h-32 font-mono text-sm mb-2"
              placeholder={`Paste YouTube URLs here (one per line)\nSupports 1000+ URLs\n\nhttps://youtube.com/shorts/abc123\nhttps://youtube.com/shorts/def456\nhttps://youtu.be/ghi789`}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleImport}
                disabled={importing || parseUrls(urls).length === 0}
                className="btn-neon flex items-center gap-2 disabled:opacity-50"
              >
                <FiUpload />
                {importing ? 'Importing...' : `Import ${parseUrls(urls).length} URLs`}
              </button>
              <span className="text-xs text-gray-500">
                Detected: {parseUrls(urls).length}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter */}
            <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
              {['all', 'pending', 'downloaded'].map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setCurrentBatch(1) }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filter === f 
                      ? 'bg-neon-cyan text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Batch Size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Batch:</span>
              <select
                value={batchSize}
                onChange={(e) => { setBatchSize(Number(e.target.value)); setCurrentBatch(1) }}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-neon-cyan outline-none"
              >
                {[10, 20, 30, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <button
              onClick={copyAllUrls}
              className="btn-neon-outline flex items-center gap-2 text-sm"
            >
              <FiCopy /> Copy {filter === 'all' ? 'All' : filter}
            </button>

            <button
              onClick={deleteAll}
              className="btn-neon-outline border-red-500 text-red-500 hover:bg-red-500 text-sm"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      </header>

      {/* Videos List */}
      <main className="max-w-5xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : paginatedVideos.length === 0 ? (
          <div className="text-center py-20">
            <FiVideo className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400">No videos yet</h3>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginatedVideos.map((video, idx) => (
                <VideoRow
                  key={video.id}
                  video={video}
                  index={(currentBatch - 1) * batchSize + idx + 1}
                  onToggle={() => toggleDownloaded(video.id, video.downloaded)}
                  onDelete={() => deleteVideo(video.id)}
                  onUpdateNote={(note) => updateNote(video.id, note)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6 py-4">
                <button
                  onClick={() => setCurrentBatch(p => Math.max(1, p - 1))}
                  disabled={currentBatch === 1}
                  className="btn-neon-outline disabled:opacity-30 p-2"
                >
                  <FiChevronLeft />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page
                    if (totalPages <= 5) {
                      page = i + 1
                    } else if (currentBatch <= 3) {
                      page = i + 1
                    } else if (currentBatch >= totalPages - 2) {
                      page = totalPages - 4 + i
                    } else {
                      page = currentBatch - 2 + i
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentBatch(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          currentBatch === page
                            ? 'bg-neon-cyan text-black'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentBatch(p => Math.min(totalPages, p + 1))}
                  disabled={currentBatch === totalPages}
                  className="btn-neon-outline disabled:opacity-30 p-2"
                >
                  <FiChevronRight />
                </button>

                <span className="text-gray-400 text-sm ml-2">
                  {currentBatch} / {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function VideoRow({ video, index, onToggle, onDelete, onUpdateNote }) {
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState(video.notes || '')

  const getVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&?/]+)/)
    return match ? match[1] : null
  }

  const videoId = getVideoId(video.url)
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/default.jpg` : null

  const saveNote = () => {
    onUpdateNote(note)
    setEditing(false)
  }

  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
      video.downloaded ? 'bg-neon-green/5 border border-neon-green/20' : 'bg-gray-900/50 border border-gray-800'
    }`}>
      {/* Index */}
      <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">{index}</span>

      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          video.downloaded
            ? 'bg-neon-green border-neon-green'
            : 'border-gray-600 hover:border-neon-yellow'
        }`}
      >
        {video.downloaded && <FiCheck className="text-black text-xs" />}
      </button>

      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="w-12 h-9 rounded overflow-hidden bg-gray-800 flex-shrink-0">
          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* URL */}
      <div className="flex-1 min-w-0">
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm truncate block ${video.downloaded ? 'text-gray-500 line-through' : 'text-white hover:text-neon-cyan'}`}
        >
          {video.url}
        </a>
        
        {/* Note */}
        {editing ? (
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={saveNote}
            onKeyDown={(e) => e.key === 'Enter' && saveNote()}
            className="text-xs bg-transparent border-b border-neon-cyan outline-none text-gray-300 w-full mt-1"
            placeholder="Add note..."
            autoFocus
          />
        ) : (
          video.notes && (
            <p className="text-xs text-gray-500 mt-0.5">📝 {video.notes}</p>
          )
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 hover:bg-gray-800 rounded transition-colors"
        >
          <FiEdit2 className="text-gray-500 text-xs" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 hover:bg-gray-800 rounded transition-colors"
        >
          <FiTrash2 className="text-gray-500 text-xs" />
        </button>
      </div>
    </div>
  )
}
