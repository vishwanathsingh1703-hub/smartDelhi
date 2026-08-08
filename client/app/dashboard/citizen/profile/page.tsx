import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Link from 'next/link';
import {
  User,
  FileText,
  PlusCircle,
  Bell,
  MapPin,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

export default async function CitizenProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth');
  }

  if (user.role !== 'CITIZEN') {
    if (user.role === 'ADMIN') {
      redirect('/dashboard/admin');
    }

    if (user.role === 'WORKER') {
      redirect('/dashboard/worker');
    }

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

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/citizen/notifications"
              className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center space-x-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 px-3.5 py-2 rounded-xl text-xs font-medium transition"
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
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
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
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Profile Content */}
        <main className="lg:col-span-9 space-y-6">
          {/* Page Header */}
          <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <User className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Citizen Profile
                </h1>

                <p className="text-xs text-gray-400 mt-1">
                  View your verified account information and security status.
                </p>
              </div>
            </div>
          </div>

          {/* Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Identity Card */}
            <div className="md:col-span-1 bg-gray-950/80 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-xl">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center text-4xl font-extrabold shadow-lg shadow-cyan-500/20">
                  {user.name?.charAt(0).toUpperCase() || 'C'}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    {user.name}
                  </h2>

                  <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    <ShieldCheck className="w-3 h-3" />
                    {user.role}
                  </span>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Account Active
                  </div>
                </div>

                <form
                  action="/api/auth/logout"
                  method="POST"
                  className="pt-2"
                >
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 py-2.5 rounded-xl text-xs font-medium transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout Account
                  </button>
                </form>
              </div>
            </div>

            {/* Account Details */}
            <div className="md:col-span-2 bg-gray-950/80 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />

                <h3 className="text-sm font-bold tracking-wider text-cyan-400 uppercase">
                  Account Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    Full Name
                  </div>

                  <p className="font-semibold text-white text-sm break-words">
                    {user.name}
                  </p>
                </div>

                {/* Email */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    Email Address
                  </div>

                  <p className="font-semibold text-white text-sm break-all">
                    {user.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    Phone Number
                  </div>

                  <p className="font-semibold text-white text-sm">
                    {user.phone || 'Not provided'}
                  </p>
                </div>

                {/* Ward */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    Assigned Ward
                  </div>

                  <p className="font-semibold text-white text-sm">
                    {user.ward || 'Not specified'}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Account Status
                  </div>

                  <p
                    className={`font-semibold text-sm ${
                      user.isActive
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {user.isActive ? 'Active & Verified' : 'Inactive'}
                  </p>
                </div>

                {/* Member Since */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Member Since
                  </div>

                  <p className="font-semibold text-white text-sm">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(
                          'en-IN',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }
                        )
                      : 'Not available'}
                  </p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Secure Session</span>
                </div>

                <p className="text-[11px] text-gray-300 leading-relaxed mt-2">
                  Your SmartDELHI session is protected by the application's
                  authentication system. Account access is restricted
                  according to your assigned role.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4">
              Quick Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/dashboard/citizen/complaints"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition"
              >
                <FileText className="w-5 h-5 text-cyan-400" />

                <div>
                  <p className="text-xs font-semibold text-white">
                    My Complaints
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Track submitted issues
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/citizen/complaints/new"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition"
              >
                <PlusCircle className="w-5 h-5 text-cyan-400" />

                <div>
                  <p className="text-xs font-semibold text-white">
                    New Complaint
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Report a civic issue
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/citizen/notifications"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition"
              >
                <Bell className="w-5 h-5 text-cyan-400" />

                <div>
                  <p className="text-xs font-semibold text-white">
                    Notifications
                  </p>

                  <p className="text-[10px] text-gray-500">
                    View civic updates
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}