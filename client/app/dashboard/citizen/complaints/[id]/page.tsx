import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Tag,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
} from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FeedbackForm from '@/components/citizen/FeedbackForm';
import { reverseGeocode } from '@/lib/reverseGeocode';
import ComplaintVerification from '@/components/citizen/ComplaintVerification';
type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getStatusClass(status: string) {
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
      return <CheckCircle2 className="w-4 h-4" />;

    case 'IN_PROGRESS':
      return <Clock className="w-4 h-4" />;

    case 'REJECTED':
      return <AlertTriangle className="w-4 h-4" />;

    default:
      return <Clock className="w-4 h-4" />;
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

export default async function ComplaintDetailsPage({
  params,
}: PageProps) {
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

  const { id } = await params;

  const complaint = await prisma.complaint.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      feedback: true,
    },
  });

  if (!complaint) {
    notFound();
  }

  const locationName = await reverseGeocode(
    complaint.latitude,
    complaint.longitude
  );

  const workerCompleted = complaint.workCompletedAt !== null;

  const citizenVerified = complaint.citizenVerified;

  const canGiveFeedback =
    workerCompleted &&
    !citizenVerified &&
    !complaint.feedback;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg tracking-wide">
              Smart<span className="text-blue-500">DELHI</span>
            </div>

            <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
              Citizen Portal
            </p>
          </div>

          <Link
            href="/dashboard/citizen/complaints"
            className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            My Complaints
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TITLE */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            Complaint Details
          </div>

          <div className="mt-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {complaint.title}
            </h1>

            <p className="mt-2 text-xs text-gray-500">
              Complaint ID: {complaint.id}
            </p>
          </div>
        </div>

        {/* STATUS */}
        <div className="mb-6 bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Current Status
              </p>

              <div
                className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusClass(
                  complaint.status
                )}`}
              >
                {getStatusIcon(complaint.status)}
                {formatStatus(complaint.status)}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Priority
              </p>

              <div className="flex items-center gap-2 mt-2 text-sm text-white">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {complaint.priority}
              </div>
            </div>
          </div>
        </div>

        {/* WORKER COMPLETED NOTICE */}
        {workerCompleted && !citizenVerified && (
          <div className="mb-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h2 className="text-base font-bold text-white">
                  Worker marked this complaint as completed
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Please verify whether your problem has actually
                  been resolved. Your verification is required before
                  the complaint can be officially closed.
                </p>
              </div>
            </div>
          </div>
        )}
{workerCompleted && !citizenVerified && (
  <ComplaintVerification complaintId={complaint.id} />
)}
        {/* VERIFIED */}
        {citizenVerified && (
          <div className="mb-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>

              <div>
                <h2 className="text-base font-bold text-emerald-400">
                  Complaint Verified & Resolved
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  You confirmed that the reported problem has been
                  successfully resolved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK FORM */}
        {canGiveFeedback && (
          <div className="mb-6">
            <FeedbackForm complaintId={complaint.id} />
          </div>
        )}

        {/* ALREADY GIVEN FEEDBACK */}
        {complaint.feedback && (
          <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-gray-950/80 p-6">
            <h2 className="text-lg font-bold text-white">
              Your Feedback
            </h2>

            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= complaint.feedback!.rating
                      ? 'text-yellow-400 text-xl'
                      : 'text-gray-600 text-xl'
                  }
                >
                  ★
                </span>
              ))}
            </div>

            {complaint.feedback.description && (
              <p className="mt-3 text-sm text-gray-400">
                {complaint.feedback.description}
              </p>
            )}
          </div>
        )}

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DESCRIPTION */}
          <section className="lg:col-span-2 bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-6">
            <h2 className="text-lg font-bold">
              Complaint Information
            </h2>

            <div className="mt-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Description
              </p>

              <div className="mt-2 rounded-2xl bg-black/30 border border-white/5 p-4">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {complaint.description ||
                    'No description provided.'}
                </p>
              </div>
            </div>

            {/* CATEGORY + WARD */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Tag className="w-4 h-4" />
                  <span className="text-xs">Category</span>
                </div>

                <p className="mt-2 text-sm font-semibold text-white">
                  {complaint.category}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">Ward</span>
                </div>

                <p className="mt-2 text-sm font-semibold text-white">
                  {complaint.ward}
                </p>
              </div>
            </div>
          </section>

          {/* DETAILS */}
          <aside className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-6">
            <h2 className="text-lg font-bold">
              Additional Details
            </h2>

            <div className="mt-5 space-y-4">
              {/* CREATED */}
              <div className="flex items-start gap-3">
                <CalendarDays className="w-4 h-4 text-cyan-400 mt-0.5" />

                <div>
                  <p className="text-[11px] text-gray-500">
                    Submitted On
                  </p>

                  <p className="text-sm text-gray-300 mt-1">
                    {new Date(
                      complaint.createdAt
                    ).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* UPDATED */}
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-blue-400 mt-0.5" />

                <div>
                  <p className="text-[11px] text-gray-500">
                    Last Updated
                  </p>

                  <p className="text-sm text-gray-300 mt-1">
                    {new Date(
                      complaint.updatedAt
                    ).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* WORK COMPLETED */}
              {complaint.workCompletedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />

                  <div>
                    <p className="text-[11px] text-gray-500">
                      Worker Completed
                    </p>

                    <p className="text-sm text-gray-300 mt-1">
                      {new Date(
                        complaint.workCompletedAt
                      ).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* LOCATION */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />

                  <p className="text-xs font-semibold text-gray-300">
                    Complaint Location
                  </p>
                </div>

                <div className="mt-3 rounded-xl bg-white/5 border border-white/5 p-3">
                  <p className="text-sm font-semibold text-white">
                    {locationName}
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Reported complaint area
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* BACK BUTTON */}
        <div className="mt-6">
          <Link
            href="/dashboard/citizen/complaints"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Complaints
          </Link>
        </div>
      </main>
    </div>
  );
}