import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BriefcaseBusiness,
  ClipboardList,
  Clock,
  Clock3,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  MapPin,
  ArrowRight,
} from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function WorkerDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth');
  }

  if (user.role !== 'WORKER') {
    if (user.role === 'CITIZEN') {
      redirect('/dashboard/citizen');
    }

    if (user.role === 'ADMIN') {
      redirect('/dashboard/admin');
    }

    redirect('/auth');
  }

  // Fetch Ward-level statistics, Assigned complaints, and Recent ward complaints concurrently
  const [
    totalWardComplaints,
    pendingWardComplaints,
    inProgressWardComplaints,
    resolvedWardComplaints,
    assignedComplaints,
    recentWardComplaints,
  ] = await Promise.all([
    // Ward Total
    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
      },
    }),

    // Ward Pending
    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
        status: 'PENDING',
      },
    }),

    // Ward In Progress
    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
        status: 'IN_PROGRESS',
      },
    }),

    // Ward Resolved
    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
        status: 'RESOLVED',
      },
    }),

    // Complaints assigned specifically to this worker
    prisma.complaint.findMany({
      where: {
        assignedWorkerId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    }),

    // Recent complaints in the worker's ward
    prisma.complaint.findMany({
      where: {
        ward: user.ward || undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
  ]);

  // Specific Assigned Worker Counts
  const assignedCount = assignedComplaints.filter(
    (c) => c.status === 'Assigned' || c.status === 'PENDING'
  ).length;

  const inProgressCount = assignedComplaints.filter(
    (c) => c.status === 'InProgress' || c.status === 'IN_PROGRESS'
  ).length;

  const completedCount = assignedComplaints.filter(
    (c) => c.workCompletedAt !== null
  ).length;

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* ================= HEADER ================= */}
      <header className="border-b border-cyan-500/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="font-bold text-lg tracking-wide">
                Smart<span className="text-cyan-400">DELHI</span>
              </div>

              <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">
                Worker Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white">{user.name}</p>

              <p className="text-[10px] text-gray-400">
                {user.ward ? `Ward: ${user.ward}` : 'MCD Worker'}
              </p>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/30 bg-red-950/30 text-red-300 hover:bg-red-900/40 transition text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* WELCOME BANNER */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <BriefcaseBusiness className="w-3.5 h-3.5" />
            MCD Worker Command Center
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, <span className="text-cyan-400">{user.name}</span>
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage complaints assigned directly to you and track overall ward resolution progress.
          </p>
        </div>

        {/* WORKER PERSONAL ASSIGNMENTS STATS */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Your Personal Tasks Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-amber-500/20 bg-gray-950/80 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Assigned To You
                </p>
                <Clock3 className="w-5 h-5 text-amber-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold">{assignedCount}</p>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-gray-950/80 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Work In Progress
                </p>
                <BriefcaseBusiness className="w-5 h-5 text-blue-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold">{inProgressCount}</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-gray-950/80 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Completed Work
                </p>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold">{completedCount}</p>
            </div>
          </div>
        </div>

        {/* QUICK ACTION TO ASSIGNED COMPLAINTS */}
        <Link
          href="/dashboard/worker/assigned"
          className="group block rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 hover:border-cyan-400/60 transition p-6 shadow-xl"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <BriefcaseBusiness className="w-6 h-6 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  View & Action Assigned Complaints
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Accept assigned jobs, verify location coordinates, and mark work completed.
                </p>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        {/* OVERALL WARD STATISTICS */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Overall Ward ({user.ward || 'MCD'}) Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-950/80 border border-cyan-500/20 rounded-2xl p-5">
              <ClipboardList className="w-6 h-6 text-cyan-400 mb-3" />
              <p className="text-xs text-gray-400">Total Ward Complaints</p>
              <p className="text-3xl font-bold mt-1">{totalWardComplaints}</p>
            </div>

            <div className="bg-gray-950/80 border border-amber-500/20 rounded-2xl p-5">
              <AlertCircle className="w-6 h-6 text-amber-400 mb-3" />
              <p className="text-xs text-gray-400">Ward Pending</p>
              <p className="text-3xl font-bold mt-1">{pendingWardComplaints}</p>
            </div>

            <div className="bg-gray-950/80 border border-blue-500/20 rounded-2xl p-5">
              <Clock className="w-6 h-6 text-blue-400 mb-3" />
              <p className="text-xs text-gray-400">Ward In Progress</p>
              <p className="text-3xl font-bold mt-1">{inProgressWardComplaints}</p>
            </div>

            <div className="bg-gray-950/80 border border-emerald-500/20 rounded-2xl p-5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-3" />
              <p className="text-xs text-gray-400">Ward Resolved</p>
              <p className="text-3xl font-bold mt-1">{resolvedWardComplaints}</p>
            </div>
          </div>
        </div>

        {/* RECENT WARD COMPLAINTS SECTION */}
        <div className="bg-gray-950/80 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Ward Complaints</h2>
              <p className="text-xs text-gray-500 mt-1">
                Latest civic issues reported in {user.ward ? `Ward ${user.ward}` : 'your ward'}.
              </p>
            </div>

            <Link
              href="/dashboard/worker/assigned"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All Assigned
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentWardComplaints.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <ClipboardList className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-300">No complaints found</p>
              <p className="text-xs text-gray-500 mt-1">
                There are currently no complaints reported in your ward.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWardComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-sm text-white">
                        {complaint.title}
                      </h3>

                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                        {complaint.status.replace('_', ' ')}
                      </span>

                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
                        {complaint.priority}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {complaint.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 mt-2">
                      <span>
                        Category: <strong className="text-gray-300">{complaint.category}</strong>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {complaint.latitude !== null && complaint.longitude !== null
                          ? 'Location Available'
                          : 'No Coordinates'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/worker/assigned`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 text-xs font-semibold transition"
                  >
                    Manage Work
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}