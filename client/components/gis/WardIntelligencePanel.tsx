"use client";

interface WardMetric {
  ward: string;
  complaintCount: number;
  highPriority: number;
  resolved: number;
  activeWorkers: number;
}

interface WardIntelligencePanelProps {
  ward: WardMetric | null;
  onClose: () => void;
}

export default function WardIntelligencePanel({
  ward,
  onClose,
}: WardIntelligencePanelProps) {
  if (!ward) {
    return (
      <div className="absolute right-5 top-5 z-[1000] w-[320px] rounded-2xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
          Ward Intelligence
        </p>

        <h2 className="mt-2 text-lg font-bold">
          Select a ward
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Click any ward polygon on the Delhi
          command map to inspect its civic
          performance.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-900 p-3">
            <p className="text-[10px] uppercase text-slate-500">
              Layer
            </p>

            <p className="mt-1 font-semibold">
              Ward Heatmap
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-3">
            <p className="text-[10px] uppercase text-slate-500">
              Mode
            </p>

            <p className="mt-1 font-semibold">
              Live
            </p>
          </div>
        </div>
      </div>
    );
  }

  const resolutionRate =
    ward.complaintCount > 0
      ? Math.round(
          (ward.resolved /
            ward.complaintCount) *
            100
        )
      : 0;

  return (
    <div className="absolute right-5 top-5 z-[1000] w-[340px] rounded-2xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl">

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            Ward Intelligence
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {ward.ward}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-800 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Complaints
          </p>

          <p className="mt-1 text-2xl font-bold">
            {ward.complaintCount}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-[10px] uppercase tracking-wider text-red-400">
            High Priority
          </p>

          <p className="mt-1 text-2xl font-bold text-red-400">
            {ward.highPriority}
          </p>
        </div>

        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-[10px] uppercase tracking-wider text-green-400">
            Resolved
          </p>

          <p className="mt-1 text-2xl font-bold text-green-400">
            {ward.resolved}
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-[10px] uppercase tracking-wider text-blue-400">
            Active Workers
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-400">
            {ward.activeWorkers}
          </p>
        </div>

      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">
            Resolution Rate
          </span>

          <span className="font-semibold">
            {resolutionRate}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${resolutionRate}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3">
        <p className="text-xs leading-5 text-slate-400">
          Ward intelligence is calculated from
          live complaint and workforce records.
        </p>
      </div>

    </div>
  );
}