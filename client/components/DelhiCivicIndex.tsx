"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Home,
  Leaf,
  Loader2,
  Map,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Toilet,
  TreePine,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

type CivicMetric = {
  id: string;
  title: string;
  value: number | string | null;
  unit?: string;
  year?: string;
  source: string;
  sourceUrl: string;
  status: "live" | "latest" | "unavailable";
};

type CivicResponse = {
  success: boolean;
  updatedAt: string;
  source: string;
  metrics: CivicMetric[];
};

const iconMap: Record<string, React.ReactNode> = {
  "smart-city-index": <Sparkles />,
  "education-pgi": <GraduationCap />,
  "pmay-housing": <Home />,
  "road-infrastructure": <Map />,
  sanitation: <Toilet />,
  "sex-ratio": <Users />,
  "green-cover": <TreePine />,
  cleanliness: <ShieldCheck />,
};

const fallbackColors: Record<string, string> = {
  "smart-city-index": "cyan",
  "education-pgi": "blue",
  "pmay-housing": "violet",
  "road-infrastructure": "amber",
  sanitation: "emerald",
  "sex-ratio": "pink",
  "green-cover": "green",
  cleanliness: "cyan",
};

export default function DelhiCivicIndex() {
  const [data, setData] = useState<CivicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);

      const response = await fetch("/api/delhi/civic-data", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load civic data");
      }

      const result: CivicResponse = await response.json();

      setData(result);
    } catch (error) {
      console.error("Delhi civic data error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    return data?.metrics ?? [];
  }, [data]);

  return (
    <section className="relative w-full overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#050b14]/90 p-5 sm:p-7 lg:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
      {/* Ambient background */}

      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-cyan-500/[0.06] blur-[100px]" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-600/[0.06] blur-[110px]" />

      {/* Header */}

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />

            Delhi Civic Intelligence
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Delhi Quality &amp; Civic Index
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Government-backed indicators covering education, housing,
            sanitation, roads, environment, demographics and urban
            development.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={refreshing}
          className="group flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.06] hover:text-white disabled:opacity-50"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 transition group-hover:rotate-180" />
          )}

          Refresh Government Data
        </button>
      </div>

      {/* Live status */}

      <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.05] px-3 py-1.5 text-[10px] font-medium text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>

          GOVERNMENT DATA CONNECTOR
        </div>

        {data?.updatedAt && (
          <div className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] text-slate-500">
            Connector updated{" "}
            {new Date(data.updatedAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>

      {/* Metrics */}

      <div className="relative z-10 mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-[185px] animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.025]"
              />
            ))
          : metrics.map((metric, index) => {
              const color = fallbackColors[metric.id] ?? "cyan";

              return (
                <motion.div
                  key={metric.id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                  }}
                  whileHover={{
                    y: -5,
                  }}
                  className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-500 hover:border-cyan-400/20 hover:bg-white/[0.045]"
                >
                  {/* Glow */}

                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/[0.05] blur-3xl transition duration-500 group-hover:bg-cyan-400/[0.10]" />

                  {/* Top */}

                  <div className="relative flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-cyan-400">
                      <span className="h-4 w-4">
                        {iconMap[metric.id] ?? <Activity />}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-medium ${
                        metric.status === "unavailable"
                          ? "border-amber-400/20 bg-amber-400/[0.05] text-amber-300"
                          : "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300"
                      }`}
                    >
                      {metric.status === "unavailable" ? (
                        "SOURCE PENDING"
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          VERIFIED
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title */}

                  <div className="relative mt-5">
                    <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      {metric.title}
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-semibold tracking-tight text-white">
                        {metric.value ?? "—"}
                      </span>

                      {metric.unit && (
                        <span className="text-[10px] text-slate-500">
                          {metric.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}

                  <div className="relative mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-600">
                        Source
                      </div>

                      <div className="mt-0.5 max-w-[150px] truncate text-[10px] text-slate-400">
                        {metric.source}
                      </div>
                    </div>

                    <a
                      href={metric.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-slate-500 transition hover:border-cyan-400/30 hover:text-cyan-300"
                      aria-label={`Open source for ${metric.title}`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Bottom line */}

                  <div
                    className={`absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r ${
                      color === "blue"
                        ? "from-blue-500/0 via-blue-400 to-blue-500/0"
                        : color === "violet"
                        ? "from-violet-500/0 via-violet-400 to-violet-500/0"
                        : color === "amber"
                        ? "from-amber-500/0 via-amber-400 to-amber-500/0"
                        : color === "emerald"
                        ? "from-emerald-500/0 via-emerald-400 to-emerald-500/0"
                        : color === "green"
                        ? "from-green-500/0 via-green-400 to-green-500/0"
                        : color === "pink"
                        ? "from-pink-500/0 via-pink-400 to-pink-500/0"
                        : "from-cyan-500/0 via-cyan-400 to-cyan-500/0"
                    }`}
                  />
                </motion.div>
              );
            })}
      </div>

      {/* Land cover visual */}

      <div className="relative z-10 mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Circular graph */}

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6"
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Urban Land Profile
          </div>

          <div className="mt-5 flex items-center justify-center">
            <div className="relative h-44 w-44">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(#22d3ee 0deg 285deg, #22c55e 285deg 330deg, #64748b 330deg 360deg)",
                }}
              />

              <div className="absolute inset-[12px] flex flex-col items-center justify-center rounded-full bg-[#07101c]">
                <span className="text-3xl font-semibold text-white">
                  Delhi
                </span>

                <span className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                  Land Profile
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Urban
              </span>

              <span className="font-medium text-white">79%</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Green / Forest
              </span>

              <span className="font-medium text-white">12.5%</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                Other
              </span>

              <span className="font-medium text-white">8.5%</span>
            </div>
          </div>
        </motion.div>

        {/* Intelligence summary */}

        <div className="lg:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoCard
            icon={<Building2 />}
            title="Urban Development"
            text="Infrastructure, housing and civic development indicators will be connected to their official government datasets."
          />

          <InfoCard
            icon={<Leaf />}
            title="Environment"
            text="Forest and green-cover indicators can be synchronized with official Forest Survey of India releases."
          />

          <InfoCard
            icon={<GraduationCap />}
            title="Education"
            text="School infrastructure and education-performance indicators can be mapped from official Ministry of Education datasets."
          />

          <InfoCard
            icon={<Activity />}
            title="Data Intelligence"
            text="SmartDELHI can maintain the latest available official value while clearly displaying its source and update year."
          />
        </div>
      </div>

      {/* Footer source */}

      <div className="relative z-10 mt-6 flex flex-col gap-2 border-t border-white/[0.06] pt-4 text-[9px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          SmartDELHI Government Data Intelligence Layer
        </span>

        <span>
          Sources are official government datasets / portals where available.
        </span>
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="group rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-500 hover:border-cyan-400/20 hover:bg-white/[0.045]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-cyan-400">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        {text}
      </p>
    </motion.div>
  );
}