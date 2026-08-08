import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Link from 'next/link';
import {
  Bell,
  FileText,
  PlusCircle,
  MapPin,
  User,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export default async function CitizenNotificationsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth');
  }

  if (user.role !== 'CITIZEN') {
    if (user.role === 'ADMIN') redirect('/dashboard/admin');
    if (user.role === 'WORKER') redirect('/dashboard/worker');
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <Link
            href="/dashboard/citizen"
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <video
                src="/videos/logo-animation.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="font-bold text-lg tracking-wide">
                Smart<span className="text-blue-500">DELHI</span>
              </span>
              <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
                Citizen Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/citizen/notifications"
              className="relative p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </Link>

            <div className="hidden sm:flex items-center space-x-3 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-2xl">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="text-left text-xs">
                <p className="font-semibold text-white leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-gray-400">
                  {user.ward ? `Ward: ${user.ward}` : 'Citizen Account'}
                </p>
              </div>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center space-x-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 px-3.5 py-2 rounded-xl text-xs font-medium transition shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-4 shadow-xl">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-3 pb-2">
              Menu
            </p>

            <nav className="space-y-1 text-sm font-medium">

              <Link
                href="/dashboard/citizen"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </Link>

              <Link
                href="/dashboard/citizen/complaints"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <FileText className="w-4 h-4" />
                <span>My Complaints</span>
              </Link>

              <Link
                href="/dashboard/citizen/complaints/new"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Complaint</span>
              </Link>

              <Link
                href="/dashboard/citizen/notifications"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-sm"
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </Link>

              <Link
                href="/dashboard/citizen/heatmap"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <MapPin className="w-4 h-4" />
                <span>Heatmap</span>
              </Link>

              <Link
                href="/dashboard/citizen/profile"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>

            </nav>
          </div>
        </aside>

        {/* Notifications Content */}
        <main className="lg:col-span-9 space-y-6">

          {/* Page Header */}
          <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Notifications Center
                </h1>

                <p className="text-xs text-gray-400 mt-1">
                  Stay updated about your complaints and municipal actions.
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-12 text-center shadow-xl">

            <div className="w-20 h-20 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <Bell className="w-9 h-9 text-gray-600" />
            </div>

            <h2 className="text-lg font-bold text-white">
              No notifications yet
            </h2>

            <p className="text-xs text-gray-400 max-w-md mx-auto mt-2 leading-relaxed">
              You will receive notifications here when there are updates
              regarding your complaints, complaint status changes, or
              municipal actions.
            </p>

            <Link
              href="/dashboard/citizen/complaints"
              className="inline-flex items-center space-x-2 mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition"
            >
              <FileText className="w-4 h-4" />
              <span>View My Complaints</span>
            </Link>

          </div>

          {/* Notification Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="bg-gray-950/80 border border-white/10 rounded-2xl p-5">
              <Bell className="w-5 h-5 text-cyan-400 mb-3" />
              <h3 className="text-sm font-semibold">
                Complaint Updates
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Get notified when your complaint status changes.
              </p>
            </div>

            <div className="bg-gray-950/80 border border-white/10 rounded-2xl p-5">
              <FileText className="w-5 h-5 text-blue-400 mb-3" />
              <h3 className="text-sm font-semibold">
                Municipal Actions
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Track actions taken by municipal authorities.
              </p>
            </div>

            <div className="bg-gray-950/80 border border-white/10 rounded-2xl p-5">
              <MapPin className="w-5 h-5 text-emerald-400 mb-3" />
              <h3 className="text-sm font-semibold">
                Ward Updates
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Receive relevant updates for your assigned ward.
              </p>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}