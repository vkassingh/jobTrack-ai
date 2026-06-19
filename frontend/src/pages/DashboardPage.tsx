import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Briefcase, Brain, Settings, LogOut,
  Menu, History, Bell, LayoutGrid, List,
  BriefcaseBusiness, FileText, Upload, Trash2,
  Download, Eye, X, Globe, ExternalLink, Calendar,
  DollarSign, Search, Edit2, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import api from '../lib/api'

interface JobApplication {
  id: string;
  userId: string;
  company: string;
  role: string;
  salary: string;
  status: string; // Wishlist, Applied, Interviewing, Offer, Rejected
  jobDescriptionUrl: string;
  notes: string;
  dateApplied: string;
}

interface DiscoverJob {
  id: string;
  company: string;
  role: string;
  salary: string;
  description: string;
  jobUrl: string;
  source: string;
  location: string;
  logoUrl: string;
}

const STATUSES = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected']

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'applications' | 'resumes' | 'discover'>('applications')
  
  // Applications CRUD states
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  
  // Selected app for detail modal / editing
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  
  // Form states for Add/Edit
  const [formCompany, setFormCompany] = useState('')
  const [formRole, setFormRole] = useState('')
  const [formSalary, setFormSalary] = useState('')
  const [formStatus, setFormStatus] = useState('Wishlist')
  const [formUrl, setFormUrl] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formDate, setFormDate] = useState('')
  
  // Job Discovery states
  const [discoverQuery, setDiscoverQuery] = useState('')
  const [discoverSource, setDiscoverSource] = useState('all')
  const [discoverJobs, setDiscoverJobs] = useState<DiscoverJob[]>([])
  const [loadingDiscover, setLoadingDiscover] = useState(false)
  const [expandedDiscoverJobId, setExpandedDiscoverJobId] = useState<string | null>(null)

  // Resume states
  const [resumes, setResumes] = useState<any[]>([])
  const [loadingResumes, setLoadingResumes] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedResumeText, setSelectedResumeText] = useState<string | null>(null)
  const [selectedResumeName, setSelectedResumeName] = useState<string>('')
  
  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Drag and drop state
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null)

  const logout = useAuthStore((state) => state.logout)
  const userEmail = useAuthStore((state) => state.userEmail)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Fetch applications
  const fetchApplications = async () => {
    setLoadingApplications(true)
    setErrorMessage(null)
    try {
      const response = await api.get('/applications')
      setApplications(response.data)
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to load applications.')
    } finally {
      setLoadingApplications(false)
    }
  }

  // Fetch resumes helper
  const fetchResumes = async () => {
    setLoadingResumes(true)
    setErrorMessage(null)
    try {
      const response = await api.get('/resumes')
      setResumes(response.data)
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to load resumes.')
    } finally {
      setLoadingResumes(false)
    }
  }

  // Fetch external discover jobs
  const fetchDiscoverJobs = async () => {
    setLoadingDiscover(true)
    setErrorMessage(null)
    try {
      const response = await api.get('/applications/discover', {
        params: {
          query: discoverQuery,
          source: discoverSource
        }
      })
      setDiscoverJobs(response.data)
    } catch (err: any) {
      setErrorMessage('Failed to discover jobs. Please verify internet connection.')
    } finally {
      setLoadingDiscover(false)
    }
  }

  const handleDiscoverSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDiscoverJobs()
  }

  // Effect to load respective tab data
  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications()
    } else if (activeTab === 'resumes') {
      fetchResumes()
    } else if (activeTab === 'discover') {
      if (discoverJobs.length === 0) {
        fetchDiscoverJobs()
      }
    }
    setSuccessMessage(null)
    setErrorMessage(null)
  }, [activeTab])

  // Handle application CRUD operations
  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCompany.trim() || !formRole.trim()) {
      alert('Company Name and Job Role are required.')
      return
    }

    let dateAppliedVal = new Date().toISOString()
    if (formDate) {
      const parsedDate = new Date(formDate)
      if (!isNaN(parsedDate.getTime())) {
        dateAppliedVal = parsedDate.toISOString()
      }
    }

    const payload = {
      company: formCompany.trim(),
      role: formRole.trim(),
      salary: formSalary.trim(),
      status: formStatus,
      jobDescriptionUrl: formUrl.trim(),
      notes: formNotes.trim(),
      dateApplied: dateAppliedVal
    }

    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      if (modalMode === 'add') {
        await api.post('/applications', payload)
        setSuccessMessage('Job application tracked successfully!')
        setActiveTab('applications')
      } else if (modalMode === 'edit' && selectedApp) {
        await api.put(`/applications/${selectedApp.id}`, payload)
        setSuccessMessage('Job application updated successfully!')
      }
      setIsAddEditModalOpen(false)
      fetchApplications()
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to save application.')
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      await api.delete(`/applications/${id}`)
      setSuccessMessage('Application removed.')
      fetchApplications()
      if (isViewModalOpen && selectedApp?.id === id) {
        setIsViewModalOpen(false)
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete application.')
    }
  }

  const handleUpdateStatus = async (app: JobApplication, newStatus: string) => {
    try {
      await api.put(`/applications/${app.id}`, {
        company: app.company,
        role: app.role,
        salary: app.salary,
        status: newStatus,
        jobDescriptionUrl: app.jobDescriptionUrl,
        notes: app.notes,
        dateApplied: app.dateApplied
      })
      fetchApplications()
    } catch (err) {
      alert('Failed to update status.')
    }
  }

  // Modal controllers
  const openAddModal = (status = 'Wishlist', prefill?: Partial<JobApplication>) => {
    setModalMode('add')
    setSelectedApp(null)
    setFormCompany(prefill?.company || '')
    setFormRole(prefill?.role || '')
    setFormSalary(prefill?.salary || '')
    setFormStatus(prefill?.status || status)
    setFormUrl(prefill?.jobDescriptionUrl || '')
    setFormNotes(prefill?.notes || '')
    setFormDate(new Date().toISOString().split('T')[0])
    setIsAddEditModalOpen(true)
  }

  const openEditModal = (app: JobApplication) => {
    setModalMode('edit')
    setSelectedApp(app)
    setFormCompany(app.company)
    setFormRole(app.role)
    setFormSalary(app.salary)
    setFormStatus(app.status)
    setFormUrl(app.jobDescriptionUrl)
    setFormNotes(app.notes)
    setFormDate(app.dateApplied ? app.dateApplied.split('T')[0] : new Date().toISOString().split('T')[0])
    setIsAddEditModalOpen(true)
  }

  const openViewModal = (app: JobApplication) => {
    setSelectedApp(app)
    setIsViewModalOpen(true)
  }

  // Handle file upload (resumes)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setErrorMessage('Please select a PDF file.')
      return
    }

    setUploading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setSuccessMessage('Resume uploaded and parsed successfully!')
      fetchResumes()
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload resume.')
    } finally {
      setUploading(false)
    }
  }

  // Handle delete resume
  const handleDeleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      await api.delete(`/resumes/${id}`)
      setSuccessMessage('Resume deleted successfully.')
      fetchResumes()
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete resume.')
    }
  }

  // Handle preview parsed text
  const handleViewText = async (id: string, fileName: string) => {
    try {
      const response = await api.get(`/resumes/${id}`)
      setSelectedResumeText(response.data.parsedText)
      setSelectedResumeName(fileName)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch resume text.')
    }
  }

  // Handle download resume
  const handleDownloadResume = async (id: string, fileName: string) => {
    try {
      const response = await api.get(`/resumes/download/${id}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err: any) {
      alert('Failed to download resume.')
    }
  }

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('text/plain', appId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setDraggedOverColumn(null)
    const appId = e.dataTransfer.getData('text/plain')
    const app = applications.find((a) => a.id === appId)
    if (app && app.status !== newStatus) {
      await handleUpdateStatus(app, newStatus)
    }
  }

  // Import external job directly
  const handleImportJob = (job: DiscoverJob) => {
    openAddModal('Applied', {
      company: job.company || '',
      role: job.role || '',
      salary: job.salary || '',
      jobDescriptionUrl: job.jobUrl || '',
      notes: `Imported from ${job.source || 'Discover'}.\nLocation: ${job.location || 'Remote'}\n\nDescription summary:\n${(job.description || '').replace(/<[^>]*>/g, '').substring(0, 300)}...`
    })
  }

  // Local filtering/searching on applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.notes && app.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Group applications by status for Kanban Board
  const appsByStatus = (status: string) => {
    return filteredApps.filter((app) => app.status === status)
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Wishlist': return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'Applied': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Interviewing': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Offer': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-200'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed h-full left-0 w-sidebar-width flex flex-col gap-sm py-lg border-r border-outline-variant bg-surface-container-low shadow-[0_4px_12px_rgba(0,0,0,0.03)] z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        {/* Brand */}
        <div className="px-lg mb-xl">
          <div className="flex items-center gap-sm">
            <BriefcaseBusiness className="text-primary" size={22} />
            <h1 className="font-h2 text-h2 font-bold text-primary">JobTrack AI</h1>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">AI-powered job tracking</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-sm flex flex-col gap-xs">
          <button 
            onClick={() => openAddModal()}
            className="w-full flex items-center gap-md bg-primary text-on-primary rounded-lg px-md py-sm active:scale-[0.98] transition-all hover:opacity-90 font-semibold mb-xs"
          >
            <Plus size={18} />
            <span className="font-body-md text-body-md">New Application</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('applications')
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-md px-md py-sm transition-colors rounded-lg group ${activeTab === 'applications' ? 'bg-surface-container-high text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <Briefcase size={18} className={activeTab === 'applications' ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
            <span className="font-body-md text-body-md">My Applications</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('discover')
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-md px-md py-sm transition-colors rounded-lg group ${activeTab === 'discover' ? 'bg-surface-container-high text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <Globe size={18} className={activeTab === 'discover' ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
            <span className="font-body-md text-body-md">Discover Jobs</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('resumes')
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-md px-md py-sm transition-colors rounded-lg group ${activeTab === 'resumes' ? 'bg-surface-container-high text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <FileText size={18} className={activeTab === 'resumes' ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
            <span className="font-body-md text-body-md">My Resumes</span>
          </button>
          
          <a className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container-high px-md py-sm transition-colors rounded-lg group" href="#">
            <Brain size={18} className="group-hover:text-primary transition-colors" />
            <span className="font-body-md text-body-md">AI Insights</span>
          </a>
        </nav>

        {/* Bottom actions */}
        <div className="px-sm flex flex-col gap-xs">
          <button className="w-full py-sm px-md bg-primary text-on-primary rounded-lg font-button text-button shadow-sm hover:opacity-90 transition-all mb-sm">
            Upgrade to Pro
          </button>
          <button
            onClick={() => {
              setSidebarOpen(false)
              navigate('/profile')
            }}
            className="w-full flex items-center gap-md text-on-surface-variant hover:bg-surface-container-high px-md py-sm transition-colors rounded-lg group"
          >
            <Settings size={18} className="group-hover:text-primary transition-colors" />
            <span className="font-body-md text-body-md">Profile</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-md text-on-surface-variant hover:bg-surface-container-high px-md py-sm transition-colors rounded-lg group"
          >
            <LogOut size={18} className="group-hover:text-primary transition-colors" />
            <span className="font-body-md text-body-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-sidebar-width flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* Top bar */}
        <header className="sticky top-0 w-full z-45 backdrop-blur-md border-b border-outline-variant bg-surface/80 flex items-center justify-between px-xl py-sm">
          <div className="flex items-center gap-xl">
            <button
              className="md:hidden p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-h3 text-h3 text-on-surface capitalize">
              {activeTab === 'applications' ? 'My Applications' : activeTab === 'resumes' ? 'My Resumes' : 'Discover Jobs'}
            </span>
            
            {activeTab === 'applications' && (
              <div className="hidden md:flex gap-md border-l border-outline-variant pl-xl">
                <button 
                  onClick={() => setStatusFilter('All')}
                  className={`font-label-sm text-label-sm px-sm py-xs rounded-md transition-all ${statusFilter === 'All' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  All ({applications.length})
                </button>
                {STATUSES.map(st => {
                  const count = applications.filter(a => a.status === st).length
                  return (
                    <button 
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`font-label-sm text-label-sm px-sm py-xs rounded-md transition-all ${statusFilter === st ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
                    >
                      {st} ({count})
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-md">
            <div className="hidden sm:flex gap-sm mr-md border-r border-outline-variant pr-md">
              <button className="p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
                <History size={18} />
              </button>
              <button className="p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
                <Bell size={18} />
              </button>
              <button className="p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
                <Settings size={18} />
              </button>
            </div>
            
            {activeTab === 'applications' && (
              <>
                <button 
                  onClick={() => openAddModal()}
                  className="px-md py-sm bg-primary text-on-primary rounded-lg font-button text-button shadow-sm hover:opacity-90 transition-all flex items-center gap-xs"
                >
                  <Plus size={15} />
                  New
                </button>
              </>
            )}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="font-label-sm text-label-sm text-on-primary uppercase font-bold">
                {userEmail?.[0] ?? 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-xl py-xl">
          <div className="max-w-[1400px] mx-auto">

            {/* Notifications */}
            {errorMessage && (
              <div className="mb-lg bg-error-container text-error px-md py-sm rounded-lg flex items-center justify-between shadow-sm border border-error/20 animate-fade-in">
                <span className="font-label-sm font-semibold">{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="hover:opacity-85"><X size={16} /></button>
              </div>
            )}
            {successMessage && (
              <div className="mb-lg bg-primary-container text-primary px-md py-sm rounded-lg flex items-center justify-between shadow-sm border border-primary/20 animate-fade-in">
                <span className="font-label-sm font-semibold">{successMessage}</span>
                <button onClick={() => setSuccessMessage(null)} className="hover:opacity-85"><X size={16} /></button>
              </div>
            )}

            {activeTab === 'applications' ? (
              <>
                {/* Dashboard Sub Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md mb-xl">
                  <div>
                    <h2 className="font-h1 text-h1 text-on-surface mb-xs">Job Board</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Add, manage, update, and track your active job applications.</p>
                  </div>
                  
                  <div className="flex items-center gap-sm self-start sm:self-center">
                    {/* Search bar */}
                    <div className="relative">
                      <Search className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant/60" size={16} />
                      <input 
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-xl pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none transition-colors w-[200px] sm:w-[260px] shadow-sm"
                      />
                    </div>

                    {/* View mode toggle */}
                    <div className="bg-surface-container border border-outline-variant rounded-lg p-xs flex gap-xs shadow-sm">
                      <button
                        onClick={() => setViewMode('kanban')}
                        className={`p-sm rounded-md transition-all ${viewMode === 'kanban' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                        title="Kanban Board View"
                      >
                        <LayoutGrid size={18} />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-sm rounded-md transition-all ${viewMode === 'table' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                        title="Tabular List View"
                      >
                        <List size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {loadingApplications ? (
                  <div className="flex justify-center items-center py-xl min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredApps.length === 0 ? (
                  <div className="text-center py-xl border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-md min-h-[350px] bg-surface-container-lowest">
                    <Briefcase size={56} className="text-outline-variant animate-bounce" />
                    <div>
                      <h3 className="font-h3 text-h3 text-on-surface font-bold">No job applications found</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Try searching for something else or import/create a new application.</p>
                    </div>
                    <div className="flex gap-sm">
                      <button onClick={() => openAddModal()} className="px-md py-sm bg-primary text-on-primary rounded-lg font-button text-button hover:opacity-90 transition-all shadow-sm">
                        Create Manual Job
                      </button>
                      <button onClick={() => setActiveTab('discover')} className="px-md py-sm bg-surface-container-high text-primary border border-outline-variant rounded-lg font-button text-button hover:bg-surface-container-highest transition-all">
                        Discover & Import Jobs
                      </button>
                    </div>
                  </div>
                ) : viewMode === 'kanban' ? (
                  /* KANBAN BOARD VIEW */
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-md items-start min-h-[600px]">
                    {STATUSES.map((status) => {
                      const list = appsByStatus(status)
                      const isDraggedOver = draggedOverColumn === status

                      return (
                        <div
                          key={status}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, status)}
                          onDragEnter={() => setDraggedOverColumn(status)}
                          onDragLeave={() => setDraggedOverColumn(null)}
                          className={`flex flex-col bg-surface-container-low rounded-2xl p-md border-2 transition-all min-h-[500px] ${
                            isDraggedOver 
                              ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' 
                              : 'border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.01)]'
                          }`}
                        >
                          {/* Column Header */}
                          <div className="flex items-center justify-between mb-md pb-xs border-b border-outline-variant/50">
                            <div className="flex items-center gap-xs">
                              <span className="font-h3 text-h3 text-on-surface font-bold">{status}</span>
                              <span className="text-label-sm font-semibold px-xs py-2xs bg-surface-container-high text-on-surface-variant rounded-full text-xs">
                                {list.length}
                              </span>
                            </div>
                            <button 
                              onClick={() => openAddModal(status)}
                              className="p-xs text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-all"
                              title={`Add to ${status}`}
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Cards Area */}
                          <div className="flex-1 flex flex-col gap-sm overflow-y-auto">
                            {list.map((app) => (
                              <div
                                key={app.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, app.id)}
                                onClick={() => openViewModal(app)}
                                className={`group bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-md shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary/40 transition-all cursor-pointer relative`}
                              >
                                <div className="flex justify-between items-start mb-xs">
                                  <h4 className="font-h3 text-h3 text-on-surface group-hover:text-primary transition-colors font-bold truncate max-w-[150px]">
                                    {app.role}
                                  </h4>
                                  <div className="flex items-center gap-2xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                    <button 
                                      onClick={() => openEditModal(app)}
                                      className="p-2xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md"
                                      title="Edit"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteApplication(app.id)}
                                      className="p-2xs text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-md"
                                      title="Delete"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                                
                                <p className="font-body-md text-body-md text-on-surface font-semibold truncate max-w-[180px] mb-xs">
                                  {app.company}
                                </p>

                                <div className="flex items-center gap-xs flex-wrap mt-md">
                                  {app.salary && (
                                    <span className="inline-flex items-center gap-2xs text-[11px] font-semibold text-primary px-xs py-[2px] bg-primary/10 rounded-md">
                                      <DollarSign size={10} />
                                      {app.salary}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-on-surface-variant/80 font-medium">
                                    {new Date(app.dateApplied).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                  </span>
                                </div>

                                {app.notes && (
                                  <p className="mt-sm text-xs text-on-surface-variant/70 italic line-clamp-1 border-t border-outline-variant/20 pt-xs">
                                    {app.notes}
                                  </p>
                                )}

                                {/* Status controller arrow buttons for mobile/no-drag convenience */}
                                <div className="flex justify-between items-center mt-md pt-xs border-t border-outline-variant/20 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                                  <button
                                    disabled={STATUSES.indexOf(app.status) === 0}
                                    onClick={() => handleUpdateStatus(app, STATUSES[STATUSES.indexOf(app.status) - 1])}
                                    className="p-2xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded disabled:opacity-30 disabled:pointer-events-none"
                                    title="Move Left"
                                  >
                                    <ChevronLeft size={14} />
                                  </button>
                                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/50">Move Column</span>
                                  <button
                                    disabled={STATUSES.indexOf(app.status) === STATUSES.length - 1}
                                    onClick={() => handleUpdateStatus(app, STATUSES[STATUSES.indexOf(app.status) + 1])}
                                    className="p-2xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded disabled:opacity-30 disabled:pointer-events-none"
                                    title="Move Right"
                                  >
                                    <ChevronRight size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* TABULAR LIST VIEW */
                  <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant bg-surface-container-low font-h3 text-h3 text-on-surface-variant">
                          <th className="p-md font-bold">Company</th>
                          <th className="p-md font-bold">Job Role</th>
                          <th className="p-md font-bold">Salary</th>
                          <th className="p-md font-bold">Applied Date</th>
                          <th className="p-md font-bold">Status</th>
                          <th className="p-md font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30 text-body-md text-on-surface">
                        {filteredApps.map((app) => (
                          <tr 
                            key={app.id}
                            className="hover:bg-surface-container-low/40 transition-colors group cursor-pointer"
                            onClick={() => openViewModal(app)}
                          >
                            <td className="p-md font-bold">{app.company}</td>
                            <td className="p-md">{app.role}</td>
                            <td className="p-md">
                              {app.salary ? (
                                <span className="text-primary font-semibold">{app.salary}</span>
                              ) : (
                                <span className="text-on-surface-variant/40">—</span>
                              )}
                            </td>
                            <td className="p-md">
                              {new Date(app.dateApplied).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="p-md">
                              <span className={`inline-block px-sm py-[3px] border rounded-full text-xs font-semibold ${getStatusBadgeStyle(app.status)}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-md text-right" onClick={e => e.stopPropagation()}>
                              <div className="inline-flex gap-xs">
                                <button
                                  onClick={() => openViewModal(app)}
                                  className="p-sm text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                                  title="View"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => openEditModal(app)}
                                  className="p-sm text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteApplication(app.id)}
                                  className="p-sm text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : activeTab === 'discover' ? (
              /* JOB DISCOVERY WORKSPACE */
              <div className="flex flex-col gap-xl">
                <div>
                  <h2 className="font-h1 text-h1 text-on-surface mb-xs">Discover Careers</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Search and pull remote job listings from <strong>RemoteOK</strong> and <strong>FakeJobs API</strong>, then import them directly to your tracking board in one click.
                  </p>
                </div>

                {/* Discovery search filters */}
                <form onSubmit={handleDiscoverSearch} className="flex flex-col sm:flex-row gap-md bg-surface-container-low border border-outline-variant p-lg rounded-2xl shadow-sm">
                  <div className="flex-1 relative">
                    <Search className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant/60" size={18} />
                    <input
                      type="text"
                      placeholder="Search roles, skills, or companies (e.g. React, Engineer, Stripe)..."
                      value={discoverQuery}
                      onChange={(e) => setDiscoverQuery(e.target.value)}
                      className="w-full pl-xl pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md outline-none focus:border-primary transition-colors shadow-sm"
                    />
                  </div>

                  <div className="flex gap-md sm:w-auto">
                    <select
                      value={discoverSource}
                      onChange={(e) => setDiscoverSource(e.target.value)}
                      className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md outline-none focus:border-primary transition-colors cursor-pointer shadow-sm min-w-[130px]"
                    >
                      <option value="all">All Sources</option>
                      <option value="remoteok">RemoteOK</option>
                      <option value="fakejobs">FakeJobs</option>
                    </select>

                    <button
                      type="submit"
                      disabled={loadingDiscover}
                      className="px-xl py-sm bg-primary text-on-primary font-button text-button rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-xs min-w-[100px] disabled:opacity-50"
                    >
                      {loadingDiscover ? (
                        <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>
                </form>

                {/* Discovery jobs results */}
                {loadingDiscover ? (
                  <div className="flex justify-center items-center py-xl min-h-[300px]">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : discoverJobs.length === 0 ? (
                  <div className="text-center py-xl border border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-sm bg-surface-container-lowest min-h-[250px]">
                    <Globe size={40} className="text-outline-variant animate-pulse" />
                    <p className="font-body-md text-body-md text-on-surface-variant font-medium">No external jobs found. Refine your keywords.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-md">
                    {discoverJobs.map((job) => {
                      const isExpanded = expandedDiscoverJobId === job.id
                      
                      return (
                        <div
                          key={job.id}
                          className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-lg hover:border-primary/45 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-md flex flex-col gap-md"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
                            <div className="flex items-center gap-md">
                              {job.logoUrl ? (
                                <img
                                  src={job.logoUrl}
                                  alt={job.company}
                                  className="w-12 h-12 rounded-xl object-contain bg-white border border-outline-variant/30 p-xs"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '' // remove broken image
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg uppercase">
                                  {job.company?.[0] ?? 'C'}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-sm flex-wrap">
                                  <h3 className="font-h3 text-h3 font-bold text-on-surface">{job.role}</h3>
                                  <span className={`text-[10px] font-bold px-sm py-[2px] rounded-md ${
                                    job.source === 'RemoteOK' 
                                      ? 'bg-red-50 text-red-700 border border-red-200' 
                                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                                  }`}>
                                    {job.source}
                                  </span>
                                </div>
                                <p className="font-body-md text-body-md font-semibold text-on-surface-variant mt-xs">
                                  {job.company} • <span className="font-medium text-xs">{job.location || 'Remote'}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-sm self-stretch md:self-auto justify-end">
                              {job.salary && (
                                <span className="inline-flex items-center gap-xs font-semibold text-emerald-700 bg-emerald-50 px-sm py-sm rounded-xl text-xs border border-emerald-200">
                                  <DollarSign size={13} />
                                  {job.salary}
                                </span>
                              )}
                              <button
                                onClick={() => handleImportJob(job)}
                                className="px-md py-sm bg-primary text-on-primary rounded-xl font-button text-button hover:opacity-90 transition-all flex items-center gap-2xs shadow-sm"
                              >
                                <Plus size={14} />
                                Track Job
                              </button>
                            </div>
                          </div>

                          {/* Description toggle */}
                          <div className="border-t border-outline-variant/30 pt-md">
                            <div className={`text-body-md text-on-surface-variant leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}
                              dangerouslySetInnerHTML={{ __html: job.description }}
                            />
                            
                            <div className="flex justify-between items-center mt-md">
                              <button
                                onClick={() => setExpandedDiscoverJobId(isExpanded ? null : job.id)}
                                className="text-primary font-button text-button hover:underline text-xs"
                              >
                                {isExpanded ? 'Show Less' : 'Read Full Description'}
                              </button>
                              
                              <a
                                href={job.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-xs text-on-surface-variant hover:text-primary font-button text-button text-xs transition-colors"
                              >
                                View Original Posting
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* RESUMES WORKSPACE */
              <div className="flex flex-col gap-xl">
                {/* Header */}
                <div>
                  <h2 className="font-h1 text-h1 text-on-surface mb-xs">Manage Resumes</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Upload your resumes in PDF format. Our AI parser will extract the text to optimize your applications.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
                  {/* Upload panel */}
                  <div className="lg:col-span-1 bg-surface-container-low border border-outline-variant rounded-2xl p-xl flex flex-col gap-lg h-fit">
                    <h3 className="font-h3 text-h3 text-on-surface font-semibold">Upload New Resume</h3>
                    <label className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-xl flex flex-col items-center justify-center gap-md cursor-pointer transition-all bg-surface hover:bg-surface-container-lowest">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      <Upload size={32} className="text-primary" />
                      <div className="text-center">
                        <p className="font-body-md text-body-md text-on-surface font-semibold">Click to select PDF</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">Only PDF files up to 10MB</p>
                      </div>
                    </label>

                    {uploading && (
                      <div className="flex items-center gap-md justify-center py-sm">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-label-sm text-label-sm text-primary font-semibold">Uploading & parsing PDF...</span>
                      </div>
                    )}
                  </div>

                  {/* Resumes List */}
                  <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl flex flex-col gap-lg">
                    <h3 className="font-h3 text-h3 text-on-surface font-semibold">Your Resumes ({resumes.length})</h3>
                    {loadingResumes ? (
                      <div className="flex justify-center items-center py-xl">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : resumes.length === 0 ? (
                      <div className="text-center py-xl border border-dashed border-outline-variant rounded-xl flex flex-col items-center gap-sm">
                        <FileText size={48} className="text-outline-variant" />
                        <p className="font-body-md text-body-md text-on-surface-variant">No resumes uploaded yet.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-sm">
                        {resumes.map((resume) => (
                          <div 
                            key={resume.id} 
                            className="flex items-center justify-between p-md bg-surface-container-low border border-outline-variant rounded-xl hover:border-primary transition-all"
                          >
                            <div className="flex items-center gap-md">
                              <div className="p-sm bg-primary/10 rounded-lg text-primary">
                                <FileText size={24} />
                              </div>
                              <div>
                                <h4 className="font-body-md text-body-md font-semibold text-on-surface truncate max-w-[200px] sm:max-w-[320px]">
                                  {resume.fileName}
                                </h4>
                                <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">
                                  Uploaded on {new Date(resume.uploadDate).toLocaleDateString()} • {resume.parsedTextLength} chars
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-xs">
                              <button 
                                onClick={() => handleViewText(resume.id, resume.fileName)}
                                className="p-sm hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all"
                                title="View parsed text"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => handleDownloadResume(resume.id, resume.fileName)}
                                className="p-sm hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all"
                                title="Download PDF"
                              >
                                <Download size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteResume(resume.id)}
                                className="p-sm hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error transition-all"
                                title="Delete resume"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Add / Edit Application Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-md backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant w-full max-w-[500px] rounded-2xl flex flex-col shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-xl py-lg border-b border-outline-variant bg-surface-container-low">
              <h3 className="font-h3 text-h3 text-on-surface font-bold">
                {modalMode === 'add' ? 'Add Tracked Job' : 'Edit Job Details'}
              </h3>
              <button 
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-xs hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant hover:text-on-surface"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveApplication} className="p-xl flex flex-col gap-md overflow-y-auto max-h-[75vh]">
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">Job Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                  className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">Company Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Google"
                  value={formCompany}
                  onChange={e => setFormCompany(e.target.value)}
                  className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm font-bold text-on-surface-variant">Salary Estimate</label>
                  <input 
                    type="text" 
                    placeholder="e.g. $120,000 - $140,000"
                    value={formSalary}
                    onChange={e => setFormSalary(e.target.value)}
                    className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm font-bold text-on-surface-variant">Applied Date</label>
                  <input 
                    type="date" 
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">Tracking Status</label>
                <select 
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                  className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none transition-colors cursor-pointer"
                >
                  {STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">Job Description URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/careers/job"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">Personal Notes</label>
                <textarea 
                  placeholder="Key contacts, interview prep details, or next steps..."
                  rows={4}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-sm border-t border-outline-variant/50 pt-lg mt-sm">
                <button 
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-lg py-sm bg-surface-container-low text-on-surface-variant border border-outline-variant rounded-lg font-button text-button hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-lg py-sm bg-primary text-on-primary rounded-lg font-button text-button hover:opacity-90 shadow-sm transition-all"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-md backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant w-full max-w-[500px] rounded-2xl flex flex-col shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-xl py-lg border-b border-outline-variant bg-surface-container-low">
              <div className="flex items-center gap-sm">
                <Briefcase className="text-primary" size={20} />
                <span className="font-h3 text-h3 text-on-surface font-bold">Application Details</span>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-xs hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant hover:text-on-surface"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-xl flex flex-col gap-md overflow-y-auto max-h-[75vh]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-h2 text-h2 text-on-surface font-bold">{selectedApp.role}</h3>
                  <p className="font-body-lg text-body-lg font-semibold text-primary mt-2xs">{selectedApp.company}</p>
                </div>
                <span className={`px-md py-sm border rounded-full text-xs font-semibold shadow-sm ${getStatusBadgeStyle(selectedApp.status)}`}>
                  {selectedApp.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-md border-t border-b border-outline-variant/30 py-md my-sm">
                <div className="flex items-center gap-sm text-on-surface-variant">
                  <DollarSign size={18} className="text-primary" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant/70">Salary</p>
                    <p className="font-body-md text-on-surface font-semibold">{selectedApp.salary || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-sm text-on-surface-variant">
                  <Calendar size={18} className="text-primary" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant/70">Date Applied</p>
                    <p className="font-body-md text-on-surface font-semibold">
                      {new Date(selectedApp.dateApplied).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {selectedApp.jobDescriptionUrl && (
                <div className="flex flex-col gap-2xs">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Job Description Link</span>
                  <a 
                    href={selectedApp.jobDescriptionUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2xs text-primary hover:underline text-body-md font-semibold font-mono"
                  >
                    View Original Posting
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <div className="flex flex-col gap-2xs mt-sm">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Personal Tracker Notes</span>
                <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap min-h-[100px] italic">
                  {selectedApp.notes || 'No notes added for this application.'}
                </div>
              </div>

              <div className="flex justify-end gap-sm border-t border-outline-variant/50 pt-lg mt-md">
                <button 
                  onClick={() => {
                    setIsViewModalOpen(false)
                    openEditModal(selectedApp)
                  }}
                  className="px-lg py-sm bg-surface-container-high text-primary border border-outline-variant rounded-lg font-button text-button hover:bg-surface-container-highest transition-colors flex items-center gap-2xs"
                >
                  <Edit2 size={14} />
                  Edit Details
                </button>
                <button 
                  onClick={() => handleDeleteApplication(selectedApp.id)}
                  className="px-lg py-sm bg-error text-on-error rounded-lg font-button text-button hover:opacity-90 transition-all flex items-center gap-2xs shadow-sm"
                >
                  <Trash2 size={14} />
                  Delete Tracker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parsed Text Preview Modal */}
      {selectedResumeText !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md">
          <div className="bg-surface border border-outline-variant w-full max-w-[700px] rounded-2xl flex flex-col max-h-[80vh] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-xl py-lg border-b border-outline-variant bg-surface-container-low">
              <div>
                <h3 className="font-h3 text-h3 text-on-surface font-semibold">Parsed Resume Text</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs truncate max-w-[200px] sm:max-w-[400px]">
                  {selectedResumeName}
                </p>
              </div>
              <button 
                onClick={() => setSelectedResumeText(null)}
                className="p-sm hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-xl overflow-y-auto bg-surface-container-lowest font-mono text-sm whitespace-pre-wrap text-on-surface-variant">
              {selectedResumeText || "No text could be extracted from this PDF."}
            </div>
            <div className="px-xl py-md border-t border-outline-variant bg-surface-container-low flex justify-end">
              <button 
                onClick={() => setSelectedResumeText(null)}
                className="px-lg py-sm bg-primary text-on-primary rounded-lg font-button text-button hover:opacity-90 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
