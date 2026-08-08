import {
  FileText,
  Clock3,
  LoaderCircle,
  CheckCircle2,
} from 'lucide-react';

interface CitizenStatsProps {
  totalComplaints: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
}

export default function CitizenStats({
  totalComplaints,
  pendingCount,
  inProgressCount,
  resolvedCount,
}: CitizenStatsProps) {
  const stats = [
    {
      label: 'Total Complaints',
      value: totalComplaints,
      description: 'Submitted to date',
      icon: FileText,
      iconClass: 'text-cyan-400',
      valueClass: 'text-white',
    },
    {
      label: 'Pending',
      value: pendingCount,
      description: 'Awaiting review',
      icon: Clock3,
      iconClass: 'text-amber-400',
      valueClass: 'text-amber-400',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      description: 'Being dispatched',
      icon: LoaderCircle,
      iconClass: 'text-blue-400',
      valueClass: 'text-blue-400',
    },
    {
      label: 'Resolved',
      value: resolvedCount,
      description: 'Successfully closed',
      icon: CheckCircle2,
      iconClass: 'text-emerald-400',
      valueClass: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-lg hover:border-cyan-500/30 transition"
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-medium">
                {stat.label}
              </span>

              <Icon className={`w-4 h-4 ${stat.iconClass}`} />
            </div>

            <div
              className={`text-2xl sm:text-3xl font-extrabold mt-1 ${stat.valueClass}`}
            >
              {stat.value}
            </div>

            <p className="text-[10px] text-gray-500 mt-1">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}