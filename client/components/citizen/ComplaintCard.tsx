'use client';

import Link from 'next/link';
import {
  Calendar,
  MapPin,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface ComplaintCardProps {
  complaint: {
    id: string;
    title: string;
    description: string;
    category: string;
    ward: string;
    status: string;
    priority: string;
    createdAt: string | Date;
  };
}

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    icon: typeof Clock;
  }
> = {
  PENDING: {
    label: 'Pending',
    className:
      'bg-amber-500/10 border-amber-500/30 text-amber-400',
    icon: Clock,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className:
      'bg-blue-500/10 border-blue-500/30 text-blue-400',
    icon: AlertCircle,
  },
  RESOLVED: {
    label: 'Resolved',
    className:
      'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    className:
      'bg-red-500/10 border-red-500/30 text-red-400',
    icon: XCircle,
  },
};

const priorityConfig: Record<string, string> = {
  LOW: 'text-gray-400',
  MEDIUM: 'text-amber-400',
  HIGH: 'text-orange-400',
  URGENT: 'text-red-400 font-bold',
};

export default function ComplaintCard({
  complaint,
}: ComplaintCardProps) {
  const status =
    statusConfig[complaint.status] || {
      label: complaint.status.replace('_', ' '),
      className:
        'bg-gray-500/10 border-gray-500/30 text-gray-400',
      icon: AlertCircle,
    };

  const StatusIcon = status.icon;

  const priorityClass =
    priorityConfig[complaint.priority] || 'text-gray-300';

  const formattedDate = new Date(
    complaint.createdAt
  ).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="group bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-lg hover:border-cyan-500/40 hover:shadow-cyan-500/5 transition-all duration-300">

      {/* Top Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

        <div className="flex-1 min-w-0">

          {/* ID + Category */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-gray-500 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">
              #{complaint.id.slice(0, 8)}
            </span>

            <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg">
              {complaint.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition">
            {complaint.title}
          </h3>
        </div>

        {/* Status */}
        <span
          className={`inline-flex items-center gap-1.5 shrink-0 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border ${status.className}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </span>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs text-gray-400 leading-relaxed line-clamp-2">
        {complaint.description}
      </p>

      {/* Information */}
      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Ward */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />

          <span className="truncate">
            <span className="text-gray-500">Ward: </span>
            <strong className="text-gray-300 font-medium">
              {complaint.ward}
            </strong>
          </span>
        </div>

        {/* Priority */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />

          <span>
            <span className="text-gray-500">Priority: </span>
            <strong className={priorityClass}>
              {complaint.priority}
            </strong>
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />

          <span>
            <span className="text-gray-500">Filed: </span>
            <strong className="text-gray-300 font-medium">
              {formattedDate}
            </strong>
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-end">
        <Link
          href={`/dashboard/citizen/complaints/${complaint.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition group/link"
        >
          View Details

          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}