'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '../lib/supabase'
import ProjectCard from '../components/ProjectCard'
import CreateProjectModal from '../components/CreateProjectModal'
import { FiPlus, FiFolder, FiVideo, FiDownload } from 'react-icons/fi'

export default function Home() {
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalProjects: 0, totalVideos: 0, downloaded: 0 })

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setLoading(true)
    const { data: projectsData, error } = await getSupabase()
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectsData) {
      setProjects(projectsData)
      
      const { count: videoCount } = await getSupabase()
        .from('videos')
        .select('*', { count: 'exact', head: true })

      const { count: downloadedCount } = await getSupabase()
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('downloaded', true)

      setStats({
        totalProjects: projectsData.length,
        totalVideos: videoCount || 0,
        downloaded: downloadedCount || 0
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center">
                <FiVideo className="text-black text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">YT Shorts Manager</h1>
                <p className="text-xs text-gray-400">Manage your YouTube Shorts projects</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-neon flex items-center gap-2"
            >
              <FiPlus className="text-lg" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="card neon-border">
            <div className="flex items-center gap-3">
              <FiFolder className="text-neon-cyan text-2xl" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
                <p className="text-xs text-gray-400">Projects</p>
              </div>
            </div>
          </div>
          <div className="card neon-border-pink">
            <div className="flex items-center gap-3">
              <FiVideo className="text-neon-pink text-2xl" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalVideos}</p>
                <p className="text-xs text-gray-400">Videos</p>
              </div>
            </div>
          </div>
          <div className="card neon-border-green">
            <div className="flex items-center gap-3">
              <FiDownload className="text-neon-green text-2xl" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.downloaded}</p>
                <p className="text-xs text-gray-400">Downloaded</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FiFolder className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6">Create your first project to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-neon"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onUpdate={fetchProjects}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={fetchProjects}
        />
      )}
    </div>
  )
}
