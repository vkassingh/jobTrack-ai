import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Briefcase, Brain, Users, Settings, LogOut,
  Menu, History, Bell, LayoutGrid, List,
  MoreVertical, ArrowRight, Lightbulb, Sparkles, BriefcaseBusiness
} from 'lucide-react'
import { useAuthStore } from '../store/auth'

const PLACEHOLDER_DOCS = [
  { id: '1', title: 'Software Engineer — Google', subtitle: 'Applied 2 hours ago', shared: false },
  { id: '2', title: 'Frontend Developer — Meta', subtitle: 'Applied 5 hours ago', shared: true },
  { id: '3', title: 'Full Stack Engineer — Stripe', subtitle: 'Applied yesterday', shared: false },
  { id: '4', title: 'React Developer — Shopify', subtitle: 'Applied 3 days ago', shared: false },
]

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const userEmail = useAuthStore((state) => state.userEmail)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
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
          <button className="w-full flex items-center gap-md bg-surface-container-high text-primary border-l-2 border-primary px-md py-sm active:scale-[0.98] transition-transform">
            <Plus size={18} />
            <span className="font-body-md text-body-md font-semibold">New Application</span>
          </button>
          <a className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container-high px-md py-sm transition-colors rounded-lg group" href="#">
            <Briefcase size={18} className="group-hover:text-primary transition-colors" />
            <span className="font-body-md text-body-md">My Applications</span>
          </a>
          <a className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container-high px-md py-sm transition-colors rounded-lg group" href="#">
            <Brain size={18} className="group-hover:text-primary transition-colors" />
            <span className="font-body-md text-body-md">AI Insights</span>
          </a>
          <a className="flex items-center gap-md text-on-surface-variant hover:bg-surface-container-high px-md py-sm transition-colors rounded-lg group" href="#">
            <Users size={18} className="group-hover:text-primary transition-colors" />
            <span className="font-body-md text-body-md">Shared with Me</span>
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
      <main className="md:ml-sidebar-width flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 w-full z-40 backdrop-blur-md border-b border-outline-variant bg-surface/80 flex items-center justify-between px-xl py-sm">
          <div className="flex items-center gap-xl">
            <button
              className="md:hidden p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-h3 text-h3 text-on-surface">My Applications</span>
            <nav className="hidden md:flex gap-lg">
              <a className="font-label-sm text-label-sm text-primary font-bold border-b-2 border-primary py-xs" href="#">All</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors py-xs" href="#">Applied</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors py-xs" href="#">Interviewing</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors py-xs" href="#">Offers</a>
            </nav>
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
            <button className="hidden sm:block px-md py-sm bg-surface-container-low text-on-surface-variant rounded-lg font-button text-button hover:bg-surface-container-high transition-colors border border-outline-variant">
              Export
            </button>
            <button className="px-md py-sm bg-primary text-on-primary rounded-lg font-button text-button shadow-sm hover:opacity-90 transition-all flex items-center gap-xs">
              <Plus size={15} />
              New
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="font-label-sm text-label-sm text-on-primary uppercase">
                {userEmail?.[0] ?? 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-xl py-xl">
          <div className="max-w-[1200px] mx-auto">

            {/* Section header */}
            <div className="flex items-end justify-between mb-lg">
              <div>
                <h2 className="font-h1 text-h1 text-on-surface mb-xs">Recent Activity</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Manage and track your job applications.</p>
              </div>
              <div className="flex gap-sm">
                <button className="p-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:border-primary transition-all">
                  <LayoutGrid size={18} />
                </button>
                <button className="p-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:border-primary transition-all">
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
              {PLACEHOLDER_DOCS.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-surface-container-lowest border border-transparent rounded-xl p-lg shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-outline-variant transition-all cursor-pointer"
                >
                  <div className="aspect-[4/3] bg-surface-container rounded-lg mb-md overflow-hidden relative border border-outline-variant/30 flex items-center justify-center">
                    <Briefcase size={40} className="text-outline-variant" />
                    {doc.shared && (
                      <div className="absolute top-sm right-sm bg-surface-container-lowest/90 backdrop-blur-sm p-xs rounded-full border border-outline-variant/20">
                        <Users size={14} className="text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-xs">
                      <h3 className="font-h3 text-h3 text-on-surface group-hover:text-primary transition-colors">{doc.title}</h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{doc.subtitle}</p>
                    </div>
                    <MoreVertical size={18} className="text-on-surface-variant/40 shrink-0" />
                  </div>
                </div>
              ))}
            </div>

            {/* Bento */}
            <div className="mt-xl grid grid-cols-1 md:grid-cols-3 gap-lg">
              {/* Promo */}
              <div className="md:col-span-2 bg-primary-container text-on-primary-container px-xl py-xl rounded-xl flex flex-col justify-center items-start shadow-lg overflow-hidden relative min-h-[200px]">
                <div className="relative z-10 flex flex-col gap-sm">
                  <h4 className="font-h2 text-h2">Master Your Job Search</h4>
                  <p className="font-body-md text-body-md opacity-90 max-w-md">
                    Unlock AI-powered resume analysis and interview prep with JobTrack AI Pro.
                  </p>
                  <button className="mt-sm px-lg py-sm bg-surface-container-lowest text-primary rounded-lg font-button text-button hover:bg-surface-container-low transition-all self-start">
                    Explore Features
                  </button>
                </div>
                <div className="absolute -right-12 -bottom-12 opacity-20 rotate-12 pointer-events-none">
                  <Sparkles size={180} />
                </div>
              </div>

              {/* Pro tip */}
              <div className="bg-surface-container-high px-xl py-xl rounded-xl border border-outline-variant flex flex-col justify-between gap-lg">
                <div className="flex flex-col gap-sm">
                  <Lightbulb size={24} className="text-primary" fill="currentColor" />
                  <h4 className="font-h3 text-h3 text-on-surface">Pro Tip</h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Use AI resume analysis to tailor each application to the job description and increase your callback rate.
                  </p>
                </div>
                <a className="text-primary font-button text-button inline-flex items-center gap-xs hover:gap-sm transition-all" href="#">
                  View AI Features
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-lg right-lg md:hidden">
        <button className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
          <Plus size={22} />
        </button>
      </div>

    </div>
  )
}
