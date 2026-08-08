import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
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

  const [
    totalComplaints,
    pendingComplaints,
    inProgressComplaints,
    resolvedComplaints,
    recentComplaints,
  ] = await Promise.all([
    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
      },
    }),

    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
        status: 'PENDING',
      },
    }),

    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
        status: 'IN_PROGRESS',
      },
    }),

    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
        status: 'RESOLVED',
      },
    }),

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

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* HEADER */}
      <header className="border-b border-cyan-500/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
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
              <p className="text-sm font-semibold">
                {user.name}
              </p>

              <p className="text-[10px] text-gray-400">
                {user.ward ? `Ward: ${user.ward}` : 'MCD Worker'}
              </p>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/30 bg-red-950/30 text-red-300 hover:bg-red-900/40 transition text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* WELCOME */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            MCD Worker Command Center
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold">
            Welcome,{' '}
            <span className="text-cyan-400">
              {user.name}
            </span>
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage and resolve civic complaints assigned to your ward.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <div className="bg-gray-950/80 border border-cyan-500/20 rounded-2xl p-5">
            <ClipboardList className="w-6 h-6 text-cyan-400 mb-3" />

            <p className="text-xs text-gray-400">
              Total Complaints
            </p>

            <p className="text-3xl font-bold mt-1">
              {totalComplaints}
            </p>
          </div>

          <div className="bg-gray-950/80 border border-amber-500/20 rounded-2xl p-5">
            <AlertCircle className="w-6 h-6 text-amber-400 mb-3" />

            <p className="text-xs text-gray-400">
              Pending
            </p>

            <p className="text-3xl font-bold mt-1">
              {pendingComplaints}
            </p>
          </div>

          <div className="bg-gray-950/80 border border-blue-500/20 rounded-2xl p-5">
            <Clock className="w-6 h-6 text-blue-400 mb-3" />

            <p className="text-xs text-gray-400">
              In Progress
            </p>

            <p className="text-3xl font-bold mt-1">
              {inProgressComplaints}
            </p>
          </div>

          <div className="bg-gray-950/80 border border-emerald-500/20 rounded-2xl p-5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-3" />

            <p className="text-xs text-gray-400">
              Resolved
            </p>

            <p className="text-3xl font-bold mt-1">
              {resolvedComplaints}
            </p>
          </div>

        </div>

        {/* COMPLAINTS */}
        <div className="bg-gray-950/80 border border-cyan-500/20 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold">
                Ward Complaints
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Latest complaints from your assigned ward.
              </p>
            </div>

            <Link
              href="/dashboard/worker/complaints"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <ClipboardList className="w-10 h-10 text-gray-600 mx-auto mb-3" />

              <p className="text-sm text-gray-300">
                No complaints found
              </p>

              <p className="text-xs text-gray-500 mt-1">
                There are currently no complaints in your ward.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-sm">
                        {complaint.title}
                      </h3>

                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-white/10 text-gray-300">
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {complaint.description || 'No description provided.'}
                    </p>

                    <p className="text-[11px] text-gray-500 mt-2">
                      Category: {complaint.category}
                      {' • '}
                      Priority: {complaint.priority}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/worker/complaints/${complaint.id}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 text-xs font-semibold transition"
                  >
                    Manage
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