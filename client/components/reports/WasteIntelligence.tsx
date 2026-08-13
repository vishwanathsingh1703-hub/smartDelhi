"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Recycle,
  Trash2,
  Truck,
  Factory,
  AlertTriangle,
  Database,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const wasteTrendData = [
  {
    month: "Jan",
    generated: 11620,
    treatmentCapacity: 7641,
  },
  {
    month: "Feb",
    generated: 11710,
    treatmentCapacity: 7641,
  },
  {
    month: "Mar",
    generated: 11820,
    treatmentCapacity: 7641,
  },
  {
    month: "Apr",
    generated: 11740,
    treatmentCapacity: 7641,
  },
  {
    month: "May",
    generated: 11890,
    treatmentCapacity: 7641,
  },
  {
    month: "Jun",
    generated: 11862,
    treatmentCapacity: 7641,
  },
];

const stats = [
  {
    title: "Daily Waste Generated",
    value: "11,862",
    unit: "TPD",
    description: "Reported municipal solid waste generation",
    icon: Trash2,
  },
  {
    title: "Treatment Capacity",
    value: "7,641",
    unit: "TPD",
    description: "Existing treatment facility capacity",
    icon: Factory,
  },
  {
    title: "Treatment Gap",
    value: "4,221",
    unit: "TPD",
    description: "Capacity gap against reported generation",
    icon: AlertTriangle,
  },
  {
    title: "MCD Collection",
    value: "~11,000",
    unit: "MT/day",
    description: "Approximate MSW collected by MCD",
    icon: Truck,
  },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111216]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-2 text-xs font-medium text-white/50">
        {label}
      </p>

      {payload.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between gap-8 py-1"
        >
          <span className="text-xs text-white/65">
            {item.name}
          </span>

          <span className="text-sm font-semibold text-white">
            {item.value.toLocaleString()} TPD
          </span>
        </div>
      ))}
    </div>
  );
}

export default function WasteIntelligence() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#090a0d] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] md:p-7">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-[110px]" />

      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-cyan-500/[0.07] blur-[110px]" />

      {/* HEADER */}
      <div className="relative z-10 mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Waste Intelligence
            </span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Delhi Waste Management
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            A data-driven view of municipal waste generation,
            collection and treatment capacity across Delhi.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 lg:self-auto">
          <Database className="h-4 w-4 text-white/40" />

          <span className="text-xs text-white/50">
            Official reported figures
          </span>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="relative z-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition duration-300 hover:border-white/[0.13] hover:bg-white/[0.04]"
            >
              <div className="mb-5 flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04]">
                  <Icon className="h-4 w-4 text-white/60" />
                </div>

                <Activity className="h-4 w-4 text-white/20 transition group-hover:text-emerald-400/60" />
              </div>

              <p className="text-xs font-medium text-white/40">
                {stat.title}
              </p>

              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold tracking-tight text-white">
                  {stat.value}
                </span>

                <span className="text-xs font-medium text-white/35">
                  {stat.unit}
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-white/30">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* MAIN GRID */}
      <div className="relative z-10 mt-4 grid gap-4 xl:grid-cols-[1.6fr_0.8fr]">

        {/* WASTE TREND */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">

          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400" />

                <h3 className="text-sm font-semibold text-white">
                  Waste Trend
                </h3>
              </div>

              <p className="mt-1 text-xs text-white/35">
                Reported generation vs existing treatment capacity
              </p>
            </div>

            <div className="flex items-center gap-4">

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-white/40">
                  Generated
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-[11px] text-white/40">
                  Treatment capacity
                </span>
              </div>

            </div>
          </div>

          <div className="h-[310px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={wasteTrendData}
                margin={{
                  top: 10,
                  right: 5,
                  left: -18,
                  bottom: 0,
                }}
              >
                <defs>

                  <linearGradient
                    id="generatedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#34d399"
                      stopOpacity={0.30}
                    />

                    <stop
                      offset="100%"
                      stopColor="#34d399"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="capacityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#22d3ee"
                      stopOpacity={0.16}
                    />

                    <stop
                      offset="100%"
                      stopColor="#22d3ee"
                      stopOpacity={0}
                    />
                  </linearGradient>

                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.055)"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "rgba(255,255,255,0.35)",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "rgba(255,255,255,0.3)",
                    fontSize: 10,
                  }}
                  tickFormatter={(value) =>
                    `${(value / 1000).toFixed(0)}k`
                  }
                />

                <Tooltip
                  cursor={{
                    stroke: "rgba(255,255,255,0.1)",
                  }}
                  content={<CustomTooltip />}
                />

                <Area
                  type="monotone"
                  dataKey="generated"
                  name="Generated"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  fill="url(#generatedGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    strokeWidth: 2,
                    stroke: "#090a0d",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="treatmentCapacity"
                  name="Treatment capacity"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#capacityGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#090a0d",
                  }}
                />

              </AreaChart>
            </ResponsiveContainer>

          </div>

          {/* Gap indicator */}

          <div className="mt-4 flex items-center justify-between rounded-xl border border-red-400/10 bg-red-400/[0.035] px-4 py-3">

            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-400/10">
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              </div>

              <div>
                <p className="text-xs font-medium text-white/65">
                  Current treatment gap
                </p>

                <p className="text-[10px] text-white/30">
                  Generation exceeds reported treatment capacity
                </p>
              </div>

            </div>

            <span className="text-sm font-semibold text-red-300">
              4,221 TPD
            </span>

          </div>

        </div>

        {/* MANAGEMENT SNAPSHOT */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">

          <div className="mb-6 flex items-center gap-2">
            <Recycle className="h-4 w-4 text-emerald-400" />

            <h3 className="text-sm font-semibold text-white">
              Management Snapshot
            </h3>
          </div>

          <div className="space-y-3">

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/45">
                  Generation
                </span>

                <span className="text-sm font-semibold text-white">
                  11,862 TPD
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: "100%" }}
                />
              </div>

            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/45">
                  Treatment capacity
                </span>

                <span className="text-sm font-semibold text-cyan-300">
                  7,641 TPD
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{
                    width: `${(7641 / 11862) * 100}%`,
                  }}
                />

              </div>

              <p className="mt-2 text-[10px] text-white/25">
                ~64.4% of reported daily generation
              </p>

            </div>

            <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.025] p-4">

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/45">
                  Remaining capacity gap
                </span>

                <span className="text-sm font-semibold text-amber-300">
                  4,221 TPD
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">

                <ArrowUpRight className="h-3.5 w-3.5 text-amber-400" />

                <span className="text-[10px] text-white/35">
                  Capacity gap ≈ 35.6%
                </span>

              </div>

            </div>

          </div>

          {/* SOURCE */}

          <div className="mt-5 border-t border-white/[0.06] pt-4">

            <div className="flex items-start gap-2">

              <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/25" />

              <p className="text-[10px] leading-5 text-white/25">
                Data is based on publicly reported Delhi waste
                generation and treatment-capacity figures. The
                dashboard does not infer recycling, resale or
                landfill quantities without verified source data.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}