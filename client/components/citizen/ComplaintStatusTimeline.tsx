import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Wrench,
  XCircle,
} from 'lucide-react';

interface TimelineItem {
  status: string;
  title?: string;
  description?: string;
  createdAt?: string | Date;
}

interface ComplaintStatusTimelineProps {
  status: string;
  timeline?: TimelineItem[];
}

const STATUS_CONFIG: Record<
  string,
  {
    title: string;
    icon: React.ElementType;
    color: string;
  }
> = {
  PENDING: {
    title: 'Complaint Submitted',
    icon: FileText,
    color: 'text-amber-400',
  },

  IN_PROGRESS: {
    title: 'Work In Progress',
    icon: Wrench,
    color: 'text-blue-400',
  },

  RESOLVED: {
    title: 'Complaint Resolved',
    icon: CheckCircle2,
    color: 'text-emerald-400',
  },

  REJECTED: {
    title: 'Complaint Rejected',
    icon: XCircle,
    color: 'text-red-400',
  },
};

const STATUS_ORDER = [
  'PENDING',
  'IN_PROGRESS',
  'RESOLVED',
];

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function formatDate(date?: string | Date) {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ComplaintStatusTimeline({
  status,
  timeline = [],
}: ComplaintStatusTimelineProps) {
  const normalizedStatus = status.toUpperCase();

  const isRejected = normalizedStatus === 'REJECTED';

  const currentIndex = isRejected
    ? -1
    : STATUS_ORDER.indexOf(normalizedStatus);

  const generatedTimeline: TimelineItem[] =
    timeline.length > 0
      ? timeline
      : [
          {
            status: 'PENDING',
            title: 'Complaint Submitted',
          },
          ...(normalizedStatus === 'IN_PROGRESS' ||
          normalizedStatus === 'RESOLVED'
            ? [
                {
                  status: 'IN_PROGRESS',
                  title: 'Complaint In Progress',
                },
              ]
            : []),
          ...(normalizedStatus === 'RESOLVED'
            ? [
                {
                  status: 'RESOLVED',
                  title: 'Complaint Resolved',
                },
              ]
            : []),
          ...(normalizedStatus === 'REJECTED'
            ? [
                {
                  status: 'REJECTED',
                  title: 'Complaint Rejected',
                },
              ]
            : []),
        ];

  return (
    <div className="rounded-3xl border border-blue-500/20 bg-gray-950/80 p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-base font-bold text-white">
          Complaint Status
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Track the progress of your civic complaint.
        </p>
      </div>

      <div className="relative">
        {generatedTimeline.map((item, index) => {
          const itemStatus = item.status.toUpperCase();
          const config =
            STATUS_CONFIG[itemStatus] || {
              title: formatStatus(itemStatus),
              icon: AlertCircle,
              color: 'text-gray-400',
            };

          const Icon = config.icon;

          const isCompleted =
            !isRejected &&
            currentIndex >= 0 &&
            STATUS_ORDER.indexOf(itemStatus) <= currentIndex;

          const isCurrent =
            itemStatus === normalizedStatus;

          const isLast =
            index === generatedTimeline.length - 1;

          return (
            <div
              key={`${itemStatus}-${index}`}
              className="relative flex gap-4"
            >
              {!isLast && (
                <div
                  className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-px ${
                    isCompleted
                      ? 'bg-cyan-500/50'
                      : 'bg-white/10'
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  isCurrent || isCompleted
                    ? 'border-cyan-400/50 bg-cyan-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isCurrent || isCompleted
                      ? config.color
                      : 'text-gray-600'
                  }`}
                />
              </div>

              <div
                className={`min-w-0 flex-1 pb-8 ${
                  isLast ? 'pb-0' : ''
                }`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3
                    className={`text-sm font-semibold ${
                      isCurrent || isCompleted
                        ? 'text-white'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.title || config.title}
                  </h3>

                  {item.createdAt && (
                    <span className="text-[10px] text-gray-600">
                      {formatDate(item.createdAt)}
                    </span>
                  )}
                </div>

                <p
                  className={`mt-1 text-xs ${
                    isCurrent || isCompleted
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  {item.description ||
                    (itemStatus === 'PENDING'
                      ? 'Your complaint has been received and is awaiting review.'
                      : itemStatus === 'IN_PROGRESS'
                        ? 'Municipal personnel are currently working on this issue.'
                        : itemStatus === 'RESOLVED'
                          ? 'The reported civic issue has been marked as resolved.'
                          : itemStatus === 'REJECTED'
                            ? 'This complaint was rejected by the municipal authority.'
                            : `Current status: ${formatStatus(itemStatus)}`)}
                </p>

                {isCurrent && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                    <Clock3 className="h-3 w-3" />
                    Current Status
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}