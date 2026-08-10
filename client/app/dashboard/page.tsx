import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Link from 'next/link';
import CitizenHeatmapBlock from "@/components/citizen/CitizenHeatmapBlock";
export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth');
  }

  const roleBadgeColors: Record<string, string> = {
    ADMIN: 'bg-red-500/10 border-red-500/30 text-red-400',
    WORKER: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    CITIZEN: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="border-b border-white/10 bg-gray-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-black/40 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <video
                src="/videos/logo-animation.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-lg tracking-wide">
              Smart<span className="text-blue-500">DELHI</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 font-medium">
                Command Hub
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-2xl">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-white leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-400">{user.email}</p>
              </div>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center space-x-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-xl text-xs font-medium transition duration-200 shadow-sm"
              >
                <i className="fa-solid fa-right-from-bracket text-[10px]" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation Links */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-4 shadow-xl space-y-1">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-3 pb-2">Navigation</p>
            <nav className="space-y-1 text-sm font-medium">
              <a href="#" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-sm">
                <i className="fa-solid fa-chart-pie w-4 text-center" />
                <span>Overview</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition">
                <i className="fa-solid fa-triangle-exclamation w-4 text-center" />
                <span>Complaints</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition">
                <i className="fa-solid fa-map-location-dot w-4 text-center" />
                <span>Heatmap</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition">
                <i className="fa-solid fa-bell w-4 text-center" />
                <span>Notifications</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition">
                <i className="fa-solid fa-chart-line w-4 text-center" />
                <span>Analytics</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition">
                <i className="fa-solid fa-user-gear w-4 text-center" />
                <span>Profile Settings</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Dashboard Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-950/60 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center space-x-2">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${roleBadgeColors[user.role] || 'bg-blue-500/10 border-blue-500/30 text-cyan-300'}`}>
                  {user.role} ACCESS LEVEL
                </span>
                {user.ward && (
                  <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                    Ward: {user.ward}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, <span className="bg-gradient-to-r from-white via-gray-200 to-cyan-300 bg-clip-text text-transparent">{user.name}</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
                {user.role === 'ADMIN' && 'You have full administrative privileges over city sensors, user routing, and civic operational pipelines.'}
                {user.role === 'WORKER' && 'Review assigned ward tasks, update field statuses, and coordinate with municipal response units in real-time.'}
                {user.role === 'CITIZEN' && 'Monitor your submitted grievance logs, track resolution milestones, and interact with the SmartDELHI AI assistant.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-lg space-y-2">
              <span className="text-xs font-medium text-gray-400">System Status</span>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-lg font-bold">Operational</span>
              </div>
              <p className="text-[11px] text-gray-500">All AI nodes & telemetry stable</p>
            </div>

            <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-lg space-y-2">
              <span className="text-xs font-medium text-gray-400">Active Complaints</span>
              <div className="text-2xl font-extrabold text-cyan-400">1,284</div>
              <p className="text-[11px] text-emerald-400 font-medium">+12% faster resolution today</p>
            </div>

            <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-lg space-y-2">
              <span className="text-xs font-medium text-gray-400">Account Security</span>
              <div className="text-lg font-bold text-white flex items-center space-x-1.5">
                <i className="fa-solid fa-shield-halved text-cyan-400 text-sm" />
                <span>HttpOnly Secure</span>
              </div>
              <p className="text-[11px] text-gray-500">JWT verified & encrypted</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}