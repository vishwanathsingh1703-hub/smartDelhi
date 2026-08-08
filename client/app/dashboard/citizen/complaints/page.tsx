import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusStyles: Record<string, string> = {
  PENDING:
    'bg-amber-500/10 border-amber-500/30 text-amber-400',

  Pending:
    'bg-amber-500/10 border-amber-500/30 text-amber-400',

  IN_PROGRESS:
    'bg-blue-500/10 border-blue-500/30 text-blue-400',

  InProgress:
    'bg-blue-500/10 border-blue-500/30 text-blue-400',

  RESOLVED:
    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',

  Resolved:
    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',

  REJECTED:
    'bg-red-500/10 border-red-500/30 text-red-400',

  Rejected:
    'bg-red-500/10 border-red-500/30 text-red-400',
};

function getStatusIcon(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === 'RESOLVED') {
    return <CheckCircle2 className="w-4 h-4" />;
  }

  if (normalized === 'IN_PROGRESS') {
    return <Clock className="w-4 h-4" />;
  }

  if (normalized === 'REJECTED') {
    return <AlertCircle className="w-4 h-4" />;
  }

  return <Clock className="w-4 h-4" />;
}

export default async function MyComplaintsPage() {
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

  const complaints = await prisma.complaint.findMany({
    where: {
      userId: user.id,
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
            <span className="font-bold text-lg tracking-wide">
              Smart<span className="text-blue-500">DELHI</span>
            </span>

            <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
              Citizen Portal
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/citizen"
              className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-cyan-400 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              href="/dashboard/citizen/complaints/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-4 py-2 rounded-xl text-xs font-semibold transition"
            >
              <PlusCircle className="w-4 h-4" />
              New Complaint
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TITLE */}
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            Citizen Complaints
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                My Complaints
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Track all civic complaints submitted from your account.
              </p>
            </div>

            <div className="text-sm text-gray-400">
              Total:{' '}
              <span className="text-white font-bold">
                {complaints.length}
              </span>
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {complaints.length === 0 ? (
          <div className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-10 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />

            <h2 className="text-lg font-bold text-white">
              No complaints yet
            </h2>

            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              You have not submitted any civic complaints yet.
              Report an issue to get started.
            </p>

            <Link
              href="/dashboard/citizen/complaints/new"
              className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 rounded-xl text-sm font-semibold hover:brightness-110 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Your First Complaint
            </Link>
          </div>
        ) : (
          /* COMPLAINT LIST */
          <div className="space-y-4">
            {complaints.map((complaint) => {
              const statusClass =
                statusStyles[complaint.status] ||
                'bg-gray-500/10 border-gray-500/20 text-gray-300';

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
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase font-bold tracking-wider ${statusClass}`}
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
                        href={`/dashboard/citizen/complaints/${complaint.id}`}
                        className="inline-flex items-center justify-center gap-2 w-full lg:w-auto px-4 py-2.5 rounded-xl border border-cyan-500/20 text-cyan-400 hover:text-white hover:border-cyan-400/40 hover:bg-cyan-500/10 text-xs font-semibold transition"
                      >
                        View Details
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