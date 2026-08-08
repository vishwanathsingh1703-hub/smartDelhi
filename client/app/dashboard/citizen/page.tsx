import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CitizenStats from '@/components/citizen/CitizenStats';

import {
  FileText,
  PlusCircle,
  MapPin,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default async function CitizenDashboardPage() {
  const user = await getSessionUser();

  // Authentication check
  if (!user) {
    redirect('/auth');
  }

  // Role-based access control
  if (user.role !== 'CITIZEN') {
    if (user.role === 'ADMIN') {
      redirect('/dashboard/admin');
    }

    if (user.role === 'WORKER') {
      redirect('/dashboard/worker');
    }

    redirect('/auth');
  }

  // Fetch citizen complaint statistics and recent complaints
  const [
    totalComplaints,
    pendingCount,
    inProgressCount,
    resolvedCount,
    recentComplaints,
  ] = await Promise.all([
    prisma.complaint.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.complaint.count({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
    }),

    prisma.complaint.count({
      where: {
        userId: user.id,
        status: 'IN_PROGRESS',
      },
    }),

    prisma.complaint.count({
      where: {
        userId: user.id,
        status: 'RESOLVED',
      },
    }),

    prisma.complaint.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
  ]);

  const statusColors: Record<string, string> = {
    PENDING:
      'bg-amber-500/10 border-amber-500/30 text-amber-400',
    IN_PROGRESS:
      'bg-blue-500/10 border-blue-500/30 text-blue-400',
    RESOLVED:
      'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    REJECTED:
      'bg-red-500/10 border-red-500/30 text-red-400',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
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
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link
              href="/dashboard/citizen/notifications"
              className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-cyan-500/40 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />

              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />

              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
            </Link>

            {/* User */}
            <div className="hidden sm:flex items-center space-x-3 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-2xl">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold shadow-md">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <div className="text-left text-xs">
                <p className="font-semibold text-white leading-tight">
                  {user.name}
                </p>

                <p className="text-[10px] text-gray-400">
                  {user.ward
                    ? `Ward: ${user.ward}`
                    : 'Citizen Account'}
                </p>
              </div>
            </div>

            {/* Logout */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center space-x-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 px-3.5 py-2 rounded-xl text-xs font-medium transition shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />

                <span className="hidden md:inline">
                  Logout
                </span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ================= SIDEBAR ================= */}
        <aside className="lg:col-span-3">
          <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-4 shadow-xl">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-3 pb-2">
              Menu
            </p>

            <nav className="space-y-1 text-sm font-medium">
              {/* Dashboard */}
              <Link
                href="/dashboard/citizen"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Overview</span>
              </Link>

              {/* Complaints */}
              <Link
                href="/dashboard/citizen/complaints"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <FileText className="w-4 h-4" />
                <span>My Complaints</span>
              </Link>

              {/* New Complaint */}
              <Link
                href="/dashboard/citizen/complaints/new"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Complaint</span>
              </Link>

              {/* Notifications */}
              <Link
                href="/dashboard/citizen/notifications"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </Link>

              {/* Heatmap */}
              <Link
                href="/dashboard/citizen/heatmap"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <MapPin className="w-4 h-4" />
                <span>Heatmap</span>
              </Link>

              {/* Profile */}
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

        {/* ================= CONTENT ================= */}
        <main className="lg:col-span-9 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-950/60 via-gray-900/80 to-gray-950/90 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Citizen Portal</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-white via-gray-200 to-cyan-300 bg-clip-text text-transparent">
                  {user.name}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-400 max-w-xl leading-relaxed">
                Track your reported municipal issues, monitor real-time
                ward resolution statuses, and submit new grievances directly
                to the Delhi civic command center.
              </p>
            </div>

            <div className="relative z-10 flex-shrink-0">
              <Link
                href="/dashboard/citizen/complaints/new"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-cyan-500/20 transition duration-300"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report a Civic Issue</span>
              </Link>
            </div>
          </div>

          {/* ================= STATISTICS ================= */}
          <CitizenStats
            totalComplaints={totalComplaints}
            pendingCount={pendingCount}
            inProgressCount={inProgressCount}
            resolvedCount={resolvedCount}
          />

          {/* ================= RECENT COMPLAINTS ================= */}
          <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight text-white">
                  Recent Complaints
                </h2>

                <p className="text-xs text-gray-400">
                  Your latest submitted civic grievances
                </p>
              </div>

              <Link
                href="/dashboard/citizen/complaints"
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Empty State */}
            {recentComplaints.length === 0 ? (
              <div className="text-center py-12 space-y-3 border border-dashed border-white/10 rounded-2xl bg-black/20">
                <Layers className="w-10 h-10 text-gray-600 mx-auto" />

                <p className="text-sm font-medium text-gray-300">
                  No complaints filed yet
                </p>

                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Report road damage, garbage accumulation, or street light
                  failures to get started.
                </p>

                <Link
                  href="/dashboard/citizen/complaints/new"
                  className="inline-flex items-center gap-2 mt-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-medium px-4 py-2 rounded-xl transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Report First Issue
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-white">
                          {complaint.title}
                        </span>

                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                            statusColors[complaint.status] ||
                            'bg-gray-500/10 text-gray-300 border-gray-500/20'
                          }`}
                        >
                          {complaint.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-1">
                        {complaint.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                        <span>
                          Category:{' '}
                          <strong className="text-gray-300">
                            {complaint.category}
                          </strong>
                        </span>

                        <span>•</span>

                        <span>
                          Ward:{' '}
                          <strong className="text-gray-300">
                            {complaint.ward}
                          </strong>
                        </span>

                        <span>•</span>

                        <span>
                          {new Date(
                            complaint.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/citizen/complaints/${complaint.id}`}
                      className="flex-shrink-0 inline-flex items-center justify-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 px-3 py-1.5 rounded-lg transition"
                    >
                      View
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}