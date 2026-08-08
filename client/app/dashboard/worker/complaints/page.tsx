import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'RESOLVED':
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

    case 'IN_PROGRESS':
      return 'bg-blue-500/10 border-blue-500/30 text-blue-400';

    case 'REJECTED':
      return 'bg-red-500/10 border-red-500/30 text-red-400';

    default:
      return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  }
}

function getStatusIcon(status: string) {
  switch (status.toUpperCase()) {
    case 'RESOLVED':
      return <CheckCircle2 className="w-3.5 h-3.5" />;

    case 'IN_PROGRESS':
      return <Clock className="w-3.5 h-3.5" />;

    case 'REJECTED':
      return <AlertCircle className="w-3.5 h-3.5" />;

    default:
      return <ClipboardList className="w-3.5 h-3.5" />;
  }
}

export default async function WorkerComplaintsPage() {
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

  const complaints = await prisma.complaint.findMany({
    where: {
      ward: user.ward || undefined,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* HEADER */}
      <header className="border-b border-cyan-500/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg tracking-wide">
              Smart<span className="text-cyan-400">DELHI</span>
            </div>

            <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
              Worker Portal
            </p>
          </div>

          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TITLE */}
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <ClipboardList className="w-3.5 h-3.5" />
            Ward Complaints
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Complaint Management
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Manage civic complaints reported in your assigned ward.
              </p>
            </div>

            <div className="text-sm text-gray-400">
              Ward:{' '}
              <span className="text-cyan-400 font-bold">
                {user.ward || 'Not Assigned'}
              </span>
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {complaints.length === 0 ? (
          <div className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-4" />

            <h2 className="text-lg font-bold">
              No complaints found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              There are currently no complaints registered in your ward.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => {
              const statusStyle = getStatusStyle(complaint.status);

              return (
                <div
                  key={complaint.id}
                  className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/10 hover:border-cyan-500/30 rounded-2xl p-5 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    {/* LEFT */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-white">
                          {complaint.title}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase font-bold tracking-wider ${statusStyle}`}
                        >
                          {getStatusIcon(complaint.status)}

                          {complaint.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                        {complaint.description ||
                          'No description provided.'}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-500">
                        <span>
                          Category:{' '}
                          <strong className="text-gray-300">
                            {complaint.category}
                          </strong>
                        </span>

                        <span>
                          Ward:{' '}
                          <strong className="text-gray-300">
                            {complaint.ward}
                          </strong>
                        </span>

                        <span>
                          Priority:{' '}
                          <strong className="text-gray-300">
                            {complaint.priority}
                          </strong>
                        </span>

                        <span>
                          {new Date(
                            complaint.createdAt
                          ).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex-shrink-0">
                      <Link
                        href={`/dashboard/worker/complaints/${complaint.id}`}
                        className="inline-flex items-center justify-center gap-2 w-full lg:w-auto px-4 py-2.5 rounded-xl border border-cyan-500/20 text-cyan-400 hover:text-white hover:border-cyan-400/40 hover:bg-cyan-500/10 text-xs font-semibold transition"
                      >
                        Manage Complaint
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}