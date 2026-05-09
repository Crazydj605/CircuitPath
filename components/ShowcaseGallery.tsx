'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, Upload, X, ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Project = {
  id: string
  user_id: string
  title: string
  description: string
  image_url: string
  created_at: string
  votes: { count: number }[]
}

export default function ShowcaseGallery() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const [{ data: { session } }, res] = await Promise.all([
        supabase.auth.getSession(),
        fetch('/api/showcase'),
      ])
      if (session) {
        setUserId(session.user.id)
        setUserToken(session.access_token)
        const { data: votes } = await supabase
          .from('showcase_votes')
          .select('project_id')
          .eq('user_id', session.user.id)
        setMyVotes(new Set((votes || []).map((v: any) => v.project_id)))
      }
      if (res.ok) setProjects(await res.json())
      setLoading(false)
    }
    init()
  }, [])

  const voteCount = (p: Project) => p.votes?.[0]?.count ?? 0

  const handleVote = async (projectId: string) => {
    if (!userToken) return
    const wasVoted = myVotes.has(projectId)
    setMyVotes(prev => {
      const next = new Set(prev)
      wasVoted ? next.delete(projectId) : next.add(projectId)
      return next
    })
    setProjects(prev => prev.map(p => p.id === projectId
      ? { ...p, votes: [{ count: voteCount(p) + (wasVoted ? -1 : 1) }] }
      : p
    ))
    await fetch('/api/showcase/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, userToken }),
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setUploadFile(f)
    setUploadPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async () => {
    if (!uploadTitle.trim() || !uploadFile || !userToken || uploading) return
    setUploading(true)
    setUploadError('')
    const fd = new FormData()
    fd.append('title', uploadTitle.trim())
    fd.append('description', uploadDesc.trim())
    fd.append('file', uploadFile)
    fd.append('userToken', userToken)
    const res = await fetch('/api/showcase', { method: 'POST', body: fd })
    if (res.ok) {
      const newProject = await res.json()
      setProjects(prev => [{ ...newProject, votes: [{ count: 0 }] }, ...prev])
      setShowUpload(false)
      setUploadTitle('')
      setUploadDesc('')
      setUploadFile(null)
      setUploadPreview(null)
    } else {
      const err = await res.json()
      setUploadError(err.error || 'Upload failed — please try again.')
    }
    setUploading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-md overflow-hidden animate-pulse">
            <div className="aspect-video bg-slate-100" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload button */}
      {userId && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowUpload(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
          >
            {showUpload ? <><X className="w-4 h-4" /> Cancel</> : <><Upload className="w-4 h-4" /> Share your project</>}
          </button>
        </div>
      )}

      {/* Upload form */}
      {showUpload && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm">Share your project</h3>

          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
              uploadPreview ? 'border-slate-300' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {uploadPreview ? (
              <img src={uploadPreview} alt="preview" className="max-h-48 mx-auto rounded object-contain" />
            ) : (
              <div className="space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-400">Click to upload a photo</p>
                <p className="text-xs text-slate-300">JPG, PNG, WebP up to 5MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <input
            type="text"
            value={uploadTitle}
            onChange={e => setUploadTitle(e.target.value)}
            placeholder="Project title"
            maxLength={80}
            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:border-slate-400"
          />
          <textarea
            value={uploadDesc}
            onChange={e => setUploadDesc(e.target.value)}
            placeholder="What did you build? (optional)"
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:border-slate-400 resize-none"
          />
          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
          <button
            onClick={handleSubmit}
            disabled={!uploadTitle.trim() || !uploadFile || uploading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading…' : 'Post to Showcase'}
          </button>
        </div>
      )}

      {/* Gallery grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          <p className="text-sm">No projects yet — be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {projects.map(project => (
            <div key={project.id} className="bg-white border border-slate-200 rounded-md overflow-hidden group">
              <div className="aspect-video bg-slate-100 overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-900 truncate mb-0.5">{project.title}</p>
                {project.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{project.description}</p>
                )}
                <button
                  onClick={() => handleVote(project.id)}
                  disabled={!userId}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    myVotes.has(project.id)
                      ? 'text-rose-600 hover:text-rose-400'
                      : 'text-slate-400 hover:text-rose-500'
                  } disabled:cursor-default`}
                >
                  <Heart className={`w-3.5 h-3.5 ${myVotes.has(project.id) ? 'fill-current' : ''}`} />
                  {voteCount(project)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
