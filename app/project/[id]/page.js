'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import VideoCard from '../../../components/VideoCard'
import BulkImportModal from '../../../components/BulkImportModal'
import { FiArrowLeft, FiPlus, FiDownload, FiCheck, FiVideo, FiCopy } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showNotes, setShowNotes] = useState(false)
  const [projectNotes, setProjectNotes] = useState('')
  const [editingPath, setEditingPath] = useState(false)
  const [folderPath, setFolderPath] = useState('')
  const videosPerPage = 10

  useEffect(() => {
    fetchProject()
    fetchVideos()
  }, [params.id])

  async function fetchProject() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (data) {
      setProject(data)
      setProjectNotes(data.notes || '')
      setFolderPath(data.folder_path || '')
    }
  }

  async function fetchVideos() {
    setLoading(true)
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })

    setVideos(data || [])
    setLoading(false)
  }

  async function updateProjectNotes() {
    await supabase
      .from('projects')
      .update({ notes: projectNotes })
      .eq('id', params.id)
    toast.success('Notes updated!')
    fetchProject()
  }

  async function updateFolderPath() {
    await supabase
      .from('projects')
      .update({ folder_path: folderPath })
      .eq('id', params.id)
    setEditingPath(false)
    toast.success('Folder path updated!')
    fetchProject()
  }

  const totalPages = Math.ceil(videos.length / videosPerPage)
  const paginatedVideos = videos.slice(
    (currentPage - 1) * videosPerPage,
    currentPage * videosPerPage
  )

  const downloadedCount = videos.filter(v => v.downloaded).length
  const progress = videos.length > 0 ? (downloadedCount / videos.length) * 100 : 0

  const copyAllUrls = () => {
    const urls = videos.map(v => v.url).join('\n')
    navigator.clipboard.writeText(urls)
    toast.success('All URLs copied!')
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiArrowLeft className="text-gray-400" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{project.name}</h1>
              <button
                onClick={() => setEditingPath(true)}
                className="text-xs text-gray-500 hover:text-neon-cyan transition-colors truncate block max-w-full"
              >
                📁 {folderPath || 'Set folder path'}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{downloadedCount} / {videos.length} downloaded</span>
              <span className="text-neon-green">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-pink to-neon-green transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowBulkImport(true)}
              className="btn-neon flex items-center gap-2 text-sm"
            >
              <FiPlus /> Import URLs
            </button>
            <button
              onClick={copyAllUrls}
              className="btn-neon-outline flex items-center gap-2 text-sm"
            >
              <FiCopy /> Copy All
            </button>
            <button
              onClick={() => setShowNotes(true)}
              className="btn-neon-outline flex items-center gap-2 text-sm"
            >
              <FiVideo /> Notes
            </button>
          </div>
        </div>
      </header>

      {/* Videos List */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <FiVideo className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No videos yet</h3>
            <p className="text-gray-500 mb-6">Import YouTube Shorts URLs to get started</p>
            <button
              onClick={() => setShowBulkImport(true)}
              className="btn-neon"
            >
              Import URLs
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedVideos.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  onUpdate={fetchVideos}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-neon-outline disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="text-gray-400 px-4">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-neon-outline disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal
          projectId={params.id}
          onClose={() => setShowBulkImport(false)}
          onImported={fetchVideos}
        />
      )}

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md card neon-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Project Notes</h3>
              <button
                onClick={() => setShowNotes(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <FiX className="text-gray-400" />
              </button>
            </div>
            <textarea
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              className="textarea-neon h-40 mb-4"
              placeholder="Add notes about this project..."
            />
            <button
              onClick={() => {
                updateProjectNotes()
                setShowNotes(false)
              }}
              className="btn-neon w-full"
            >
              Save Notes
            </button>
          </div>
        </div>
      )}

      {/* Folder Path Modal */}
      {editingPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md card neon-border-pink">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Folder Path</h3>
              <button
                onClick={() => setEditingPath(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <FiX className="text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              className="input-neon mb-4"
              placeholder="/Users/downloads/shorts"
            />
            <button
              onClick={updateFolderPath}
              className="btn-neon w-full"
            >
              Save Path
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
