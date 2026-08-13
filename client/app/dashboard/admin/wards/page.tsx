"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Download,
  Gauge,
  HardHat,
  Layers3,
  Map,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface Ward {
  id: string;
  number: number;
  name: string;
  zone?: string | null;
  population?: number | null;
  budget: number;
  isActive: boolean;
  complaintCount: number;
}

interface Worker {
  id: string;
  name: string;
  ward?: string | null;
  isActive: boolean;
}

type HealthStatus = "EXCELLENT" | "GOOD" | "WATCH" | "CRITICAL";
type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface WardIntelligence {
  score: number;
  health: HealthStatus;
  risk: RiskLevel;
  workerCount: number;
  complaintsPerWorker: number;
  complaintsPer10k: number;
  budgetEfficiency: number;
  servicePressure: number;
  estimatedResolved: number;
  estimatedPending: number;
  estimatedResponseHours: number;
  sanitationIndex: number;
  infrastructureIndex: number;
  workforceIndex: number;
  citizenSatisfaction: number;
  monthlyBudgetBurn: number;
  activeProjects: number;
}

/* =========================================================
   ILLUSTRATIVE 2026 DEMO INTELLIGENCE
   Replace with API fields later.
========================================================= */

const DEMO_WARD_METRICS: Record<
  number,
  Partial<WardIntelligence>
> = {
  1: {
    sanitationIndex: 88,
    infrastructureIndex: 82,
    citizenSatisfaction: 84,
    activeProjects: 6,
    monthlyBudgetBurn: 7.8,
  },
  2: {
    sanitationIndex: 79,
    infrastructureIndex: 75,
    citizenSatisfaction: 76,
    activeProjects: 8,
    monthlyBudgetBurn: 8.9,
  },
  3: {
    sanitationIndex: 91,
    infrastructureIndex: 87,
    citizenSatisfaction: 89,
    activeProjects: 5,
    monthlyBudgetBurn: 6.4,
  },
  4: {
    sanitationIndex: 73,
    infrastructureIndex: 69,
    citizenSatisfaction: 71,
    activeProjects: 10,
    monthlyBudgetBurn: 9.8,
  },
  5: {
    sanitationIndex: 86,
    infrastructureIndex: 78,
    citizenSatisfaction: 81,
    activeProjects: 7,
    monthlyBudgetBurn: 7.1,
  },
  6: {
    sanitationIndex: 68,
    infrastructureIndex: 65,
    citizenSatisfaction: 66,
    activeProjects: 12,
    monthlyBudgetBurn: 10.4,
  },
};

/* =========================================================
   HELPERS
========================================================= */

const money = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`;

const compactMoney = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  return money(value);
};

const compactNumber = (value: number) => {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return Math.round(value).toLocaleString("en-IN");
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function getWardWorkerCount(
  ward: Ward,
  workers: Worker[]
) {
  return workers.filter((worker) => {
    if (!worker.isActive || !worker.ward) return false;

    const workerWard = worker.ward
      .trim()
      .toLowerCase();

    return (
      workerWard === String(ward.number).toLowerCase() ||
      workerWard === ward.name.trim().toLowerCase()
    );
  }).length;
}

function getHealth(score: number): HealthStatus {
  if (score >= 85) return "EXCELLENT";
  if (score >= 70) return "GOOD";
  if (score >= 55) return "WATCH";
  return "CRITICAL";
}

function getRisk(score: number): RiskLevel {
  if (score >= 82) return "LOW";
  if (score >= 68) return "MEDIUM";
  if (score >= 52) return "HIGH";
  return "CRITICAL";
}

function buildWardIntelligence(
  ward: Ward,
  workers: Worker[]
): WardIntelligence {
  const workerCount = getWardWorkerCount(
    ward,
    workers
  );

  const demo =
    DEMO_WARD_METRICS[ward.number] || {};

  const population = Math.max(
    ward.population || 10000,
    10000
  );

  const complaintsPerWorker =
    ward.complaintCount /
    Math.max(workerCount, 1);

  const complaintsPer10k =
    (ward.complaintCount / population) * 10000;

  const sanitationIndex =
    demo.sanitationIndex ??
    clamp(92 - ward.complaintCount * 0.55);

  const infrastructureIndex =
    demo.infrastructureIndex ??
    clamp(88 - ward.complaintCount * 0.4);

  const workforceIndex = clamp(
    workerCount === 0
      ? 30
      : 100 -
      complaintsPerWorker * 4
  );

  const responseHours = clamp(
    8 + complaintsPerWorker * 2.8,
    3,
    48
  );

  const citizenSatisfaction =
    demo.citizenSatisfaction ??
    clamp(
      94 -
      ward.complaintCount * 0.5
    );

  const servicePressure = clamp(
    ward.complaintCount * 1.7 +
    complaintsPerWorker * 2.2
  );

  const estimatedResolved = Math.round(
    ward.complaintCount *
    (0.62 + citizenSatisfaction / 500)
  );

  const estimatedPending = Math.max(
    0,
    ward.complaintCount -
    estimatedResolved
  );

  const budgetEfficiency = clamp(
    60 +
    infrastructureIndex * 0.25 +
    sanitationIndex * 0.15 -
    servicePressure * 0.12
  );

  const score = Math.round(
    sanitationIndex * 0.25 +
    infrastructureIndex * 0.2 +
    workforceIndex * 0.2 +
    citizenSatisfaction * 0.2 +
    budgetEfficiency * 0.15
  );

  return {
    score,
    health: getHealth(score),
    risk: getRisk(score),

    workerCount,
    complaintsPerWorker,
    complaintsPer10k,
    budgetEfficiency,
    servicePressure,

    estimatedResolved,
    estimatedPending,
    estimatedResponseHours: responseHours,

    sanitationIndex,
    infrastructureIndex,
    workforceIndex,
    citizenSatisfaction,

    monthlyBudgetBurn:
      demo.monthlyBudgetBurn ??
      Math.max(3.5, Math.min(12, ward.budget / 1000000)),

    activeProjects:
      demo.activeProjects ??
      Math.max(2, Math.round(ward.budget / 10000000)),
  };
}

/* =========================================================
   BADGE
========================================================= */

function StatusBadge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "green" | "blue" | "amber" | "red" | "purple";
}) {
  const styles = {
    green:
      "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    blue:
      "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
    amber:
      "bg-amber-400/10 text-amber-300 border-amber-400/20",
    red:
      "bg-rose-400/10 text-rose-300 border-rose-400/20",
    purple:
      "bg-violet-400/10 text-violet-300 border-violet-400/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.055]">
      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full ${accent} opacity-[0.08] blur-3xl transition duration-500 group-hover:opacity-[0.16]`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-white">
            {value}
          </p>

          <div className="mt-2 flex items-center gap-2">
            {trend === "up" && (
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
            )}

            {trend === "down" && (
              <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
            )}

            <span className="text-xs text-slate-500">
              {sub}
            </span>
          </div>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent} bg-opacity-10`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SCORE RING
========================================================= */

function ScoreRing({
  score,
  size = "large",
}: {
  score: number;
  size?: "small" | "large";
}) {
  const radius = size === "large" ? 52 : 30;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Number.isFinite(score)
    ? clamp(score)
    : 0;

  const offset =
    circumference -
    (safeScore / 100) * circumference;

  const color =
    safeScore >= 85
      ? "#34d399"
      : safeScore >= 70
        ? "#22d3ee"
        : safeScore >= 55
          ? "#f59e0b"
          : "#fb7185";

  return (
    <div
      className={`relative ${size === "large"
          ? "h-32 w-32"
          : "h-20 w-20"
        }`}
    >
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 128 128"
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={
            size === "large" ? 9 : 7
          }
        />

        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={
            size === "large" ? 9 : 7
          }
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-black text-white ${size === "large"
              ? "text-2xl"
              : "text-sm"
            }`}
        >
          {Math.round(safeScore)}
        </span>

        {size === "large" && (
          <span className="text-[8px] uppercase tracking-widest text-slate-500">
            Score
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MINI BAR
========================================================= */

function MetricBar({
  label,
  value,
  color = "bg-cyan-400",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const safeValue = Number.isFinite(value)
    ? clamp(value)
    : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {label}
        </span>

        <span className="text-xs font-bold text-slate-300">
          {Math.round(safeValue)}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-black tracking-tight text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

function WardsDashboard() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] =
    useState("ALL");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [selectedWard, setSelectedWard] =
    useState<Ward | null>(null);

  const [sortBy, setSortBy] =
    useState<
      | "score"
      | "complaints"
      | "budget"
      | "population"
    >("score");

  const [showInsights, setShowInsights] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  /* =====================================================
     FETCH
  ===================================================== */

  const fetchWardData = async () => {
    try {
      setLoading(true);

      const [
        wardsResponse,
        workersResponse,
      ] = await Promise.all([
        fetch("/api/admin/wards", {
          cache: "no-store",
        }),
        fetch("/api/admin/workers", {
          cache: "no-store",
        }),
      ]);

      const wardsData =
        await wardsResponse.json();

      const workersData =
        await workersResponse.json();

      if (
        !wardsResponse.ok ||
        !wardsData.success
      ) {
        throw new Error(
          wardsData.message ||
          "Failed to fetch ward data"
        );
      }

      setWards(
        Array.isArray(wardsData.wards)
          ? wardsData.wards
          : []
      );

      if (workersData.success) {
        setWorkers(
          Array.isArray(workersData.workers)
            ? workersData.workers
            : []
        );
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        "WARD_DATA_ERROR:",
        error
      );

      alert(
        "Failed to load ward intelligence data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardData();
  }, []);

  /* =====================================================
     DERIVED DATA
  ===================================================== */

  const zones = useMemo(() => {
    return Array.from(
      new Set(
        wards
          .map((ward) => ward.zone)
          .filter(
            (zone): zone is string =>
              Boolean(zone)
          )
      )
    ).sort();
  }, [wards]);

  const wardIntelligence = useMemo(() => {
    const intelligence = new globalThis.Map<
      string,
      WardIntelligence
    >();

    wards.forEach((ward) => {
      const workerCount = getWardWorkerCount(
        ward,
        workers
      );

      const complaintCount = Number(
        ward.complaintCount ?? 0
      );

      const population = Math.max(
        Number(ward.population ?? 0),
        10000
      );

      const budget = Number(
        ward.budget ?? 0
      );

      const demo =
        DEMO_WARD_METRICS[ward.number] || {};

      /* -----------------------------------------
         BASIC WORKLOAD METRICS
      ----------------------------------------- */

      const complaintsPerWorker =
        complaintCount /
        Math.max(workerCount, 1);

      const complaintsPer10k =
        (complaintCount / population) * 10000;

      /* -----------------------------------------
         SERVICE INDICES
      ----------------------------------------- */

      const sanitationIndex =
        demo.sanitationIndex ??
        clamp(
          92 -
            complaintCount * 0.55
        );

      const infrastructureIndex =
        demo.infrastructureIndex ??
        clamp(
          88 -
            complaintCount * 0.4
        );

      const workforceIndex = clamp(
        workerCount === 0
          ? 30
          : 100 -
              complaintsPerWorker * 4
      );

      const citizenSatisfaction =
        demo.citizenSatisfaction ??
        clamp(
          94 -
            complaintCount * 0.5
        );

      /* -----------------------------------------
         SERVICE PRESSURE
      ----------------------------------------- */

      const servicePressure = clamp(
        complaintCount * 1.7 +
          complaintsPerWorker * 2.2
      );

      /* -----------------------------------------
         RESPONSE TIME
      ----------------------------------------- */

      const estimatedResponseHours =
        clamp(
          8 +
            complaintsPerWorker * 2.8,
          3,
          48
        );

      /* -----------------------------------------
         RESOLUTION ESTIMATION
      ----------------------------------------- */

      const estimatedResolved =
        Math.round(
          complaintCount *
            (0.62 +
              citizenSatisfaction / 500)
        );

      const estimatedPending =
        Math.max(
          0,
          complaintCount -
            estimatedResolved
        );

      /* -----------------------------------------
         BUDGET EFFICIENCY
      ----------------------------------------- */

      const budgetEfficiency =
        clamp(
          60 +
            infrastructureIndex * 0.25 +
            sanitationIndex * 0.15 -
            servicePressure * 0.12
        );

      /* -----------------------------------------
         FINAL WARD SCORE
      ----------------------------------------- */

      const score = Math.round(
        sanitationIndex * 0.25 +
          infrastructureIndex * 0.20 +
          workforceIndex * 0.20 +
          citizenSatisfaction * 0.20 +
          budgetEfficiency * 0.15
      );

      /* -----------------------------------------
         HEALTH + RISK
      ----------------------------------------- */

      const health = getHealth(score);
      const risk = getRisk(score);

      /* -----------------------------------------
         DEMO / DERIVED METRICS
      ----------------------------------------- */

      const monthlyBudgetBurn =
        demo.monthlyBudgetBurn ??
        Math.max(
          3.5,
          Math.min(
            12,
            budget / 1000000
          )
        );

      const activeProjects =
        demo.activeProjects ??
        Math.max(
          2,
          Math.round(
            budget / 10000000
          )
        );

      /* -----------------------------------------
         STORE FINAL INTELLIGENCE OBJECT
      ----------------------------------------- */

      intelligence.set(
        ward.id,
        {
          score,
          health,
          risk,

          workerCount,
          complaintsPerWorker,
          complaintsPer10k,
          budgetEfficiency,
          servicePressure,

          estimatedResolved,
          estimatedPending,
          estimatedResponseHours,

          sanitationIndex,
          infrastructureIndex,
          workforceIndex,
          citizenSatisfaction,

          monthlyBudgetBurn,
          activeProjects,
        }
      );
    });

    return intelligence;
  }, [wards, workers]);


  const filteredWards = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    const result = wards.filter((ward) => {
      const matchesSearch =
        !value ||
        ward.name
          .toLowerCase()
          .includes(value) ||
        String(ward.number).includes(
          value
        );

      const matchesZone =
        zoneFilter === "ALL" ||
        ward.zone === zoneFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE"
          ? ward.isActive
          : !ward.isActive);

      return (
        matchesSearch &&
        matchesZone &&
        matchesStatus
      );
    });

    return result.sort((a, b) => {
      const ai =
        wardIntelligence.get(a.id);

      const bi =
        wardIntelligence.get(b.id);

      if (sortBy === "score") {
        return (
          (bi?.score ?? 0) -
          (ai?.score ?? 0)
        );
      }

      if (sortBy === "complaints") {
        return (
          Number(b.complaintCount ?? 0) -
          Number(a.complaintCount ?? 0)
        );
      }

      if (sortBy === "budget") {
        return (
          Number(b.budget ?? 0) -
          Number(a.budget ?? 0)
        );
      }

      return (
        Number(b.population ?? 0) -
        Number(a.population ?? 0)
      );
    });
  }, [
    wards,
    search,
    zoneFilter,
    statusFilter,
    sortBy,
    wardIntelligence,
  ]);

  const totalComplaints = useMemo(
    () =>
      wards.reduce(
        (sum, ward) =>
          sum +
          Number(ward.complaintCount || 0),
        0
      ),
    [wards]
  );

  const activeWards = useMemo(
    () =>
      wards.filter(
        (ward) => ward.isActive
      ).length,
    [wards]
  );

  const inactiveWards =
    wards.length - activeWards;

  const totalActiveWorkers = useMemo(
    () =>
      workers.filter(
        (worker) => worker.isActive
      ).length,
    [workers]
  );

  const totalBudget = useMemo(
    () =>
      wards.reduce(
        (sum, ward) =>
          sum + Number(ward.budget || 0),
        0
      ),
    [wards]
  );

  const averageScore = useMemo(() => {
    if (!wards.length) return 0;

    return Math.round(
      wards.reduce(
        (sum, ward) =>
          sum +
          (wardIntelligence.get(
            ward.id
          )?.score || 0),
        0
      ) / wards.length
    );
  }, [wards, wardIntelligence]);

  const totalPopulation = useMemo(
    () =>
      wards.reduce(
        (sum, ward) =>
          sum +
          Number(ward.population || 0),
        0
      ),
    [wards]
  );

  const criticalWards = useMemo(
    () =>
      wards.filter(
        (ward) =>
          wardIntelligence.get(
            ward.id
          )?.risk === "CRITICAL"
      ),
    [wards, wardIntelligence]
  );

  const highRiskWards = useMemo(
    () =>
      wards.filter(
        (ward) =>
          wardIntelligence.get(
            ward.id
          )?.risk === "HIGH"
      ),
    [wards, wardIntelligence]
  );

  const topWards = useMemo(() => {
    return [...wards]
      .sort(
        (a, b) =>
          (wardIntelligence.get(
            b.id
          )?.score || 0) -
          (wardIntelligence.get(
            a.id
          )?.score || 0)
      )
      .slice(0, 5);
  }, [wards, wardIntelligence]);

  const pressureWards = useMemo(() => {
    return [...wards]
      .sort(
        (a, b) =>
          (wardIntelligence.get(
            b.id
          )?.servicePressure || 0) -
          (wardIntelligence.get(
            a.id
          )?.servicePressure || 0)
      )
      .slice(0, 5);
  }, [wards, wardIntelligence]);

  const zoneAnalytics = useMemo(() => {
    return zones.map((zone) => {
      const zoneWards = wards.filter(
        (ward) => ward.zone === zone
      );

      const complaints =
        zoneWards.reduce(
          (sum, ward) =>
            sum + ward.complaintCount,
          0
        );

      const budget =
        zoneWards.reduce(
          (sum, ward) =>
            sum + Number(ward.budget || 0),
          0
        );

      const score =
        zoneWards.length > 0
          ? Math.round(
            zoneWards.reduce(
              (sum, ward) =>
                sum +
                (wardIntelligence.get(
                  ward.id
                )?.score || 0),
              0
            ) / zoneWards.length
          )
          : 0;

      return {
        zone,
        wards: zoneWards.length,
        complaints,
        budget,
        score,
      };
    });
  }, [
    zones,
    wards,
    wardIntelligence,
  ]);

  /* =====================================================
     CSV EXPORT
  ===================================================== */

  const exportCSV = () => {
    const rows = [
      [
        "Ward",
        "Name",
        "Zone",
        "Population",
        "Complaints",
        "Workers",
        "Budget",
        "AI Score",
        "Risk",
        "Health",
      ],
      ...filteredWards.map((ward) => {
        const intel =
          wardIntelligence.get(ward.id);

        return [
          ward.number,
          ward.name,
          ward.zone || "",
          ward.population || 0,
          ward.complaintCount,
          intel?.workerCount || 0,
          ward.budget || 0,
          intel?.score || 0,
          intel?.risk || "",
          intel?.health || "",
        ];
      }),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      "smartdelhi-ward-intelligence.csv";

    anchor.click();

    URL.revokeObjectURL(url);
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02050b] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto h-16 w-16">
              <div className="absolute inset-0 rounded-full border border-cyan-400/20" />

              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-400" />

              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-cyan-400/10">
                <Map className="h-5 w-5 text-cyan-400" />
              </div>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-300">
              Initializing Ward Intelligence
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Connecting to SmartDELHI municipal data
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#02050b] text-white">
      {/* BACKGROUND GRID */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="absolute left-[10%] top-[5%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[140px]" />

        <div className="absolute right-[5%] top-[25%] h-[450px] w-[450px] rounded-full bg-violet-500/5 blur-[140px]" />
      </div>

      <main className="relative mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.025] px-5 py-4 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10">
              <Building2 className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight">
                  SmartDELHI
                </span>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-cyan-300">
                  MCD Intelligence
                </span>
              </div>

              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-600">
                Ward Command & Control Center
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                System operational
              </span>
            </div>

            <button
              onClick={fetchWardData}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-300"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="mb-7 grid gap-5 xl:grid-cols-[1.45fr_.55fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-cyan-400/[0.08] via-white/[0.025] to-violet-400/[0.06] p-6 sm:p-8">
            <div className="absolute right-[-90px] top-[-100px] h-72 w-72 rounded-full bg-cyan-400/10 blur-[100px]" />

            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />

                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                  Municipal Intelligence Layer
                </span>
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                Delhi Ward
                <span className="text-cyan-400">
                  {" "}
                  Intelligence
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                A unified operational view of ward
                performance, civic workload,
                workforce capacity, budget pressure
                and citizen-service health.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <StatusBadge tone="blue">
                  {wards.length} Wards tracked
                </StatusBadge>

                <StatusBadge tone="green">
                  {activeWards} Active
                </StatusBadge>

                <StatusBadge tone="purple">
                  {totalActiveWorkers} Active workers
                </StatusBadge>

                {criticalWards.length > 0 && (
                  <StatusBadge tone="red">
                    {criticalWards.length} Critical
                  </StatusBadge>
                )}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.025] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  Citywide index
                </p>

                <p className="mt-1 text-lg font-black">
                  Ward Service Health
                </p>
              </div>

              <Gauge className="h-5 w-5 text-cyan-400" />
            </div>

            <div className="mt-5 flex items-center gap-5">
              <ScoreRing
                score={averageScore}
              />

              <div>
                <p className="text-2xl font-black text-white">
                  {averageScore >= 85
                    ? "Excellent"
                    : averageScore >= 70
                      ? "Healthy"
                      : averageScore >= 55
                        ? "Needs attention"
                        : "Critical"}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Composite score based on
                  sanitation, infrastructure,
                  workforce and citizen-service
                  indicators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            KPI GRID
        ================================================= */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total wards"
            value={compactNumber(
              wards.length
            )}
            sub={`${activeWards} currently active`}
            icon={Map}
            accent="bg-cyan-400"
          />

          <StatCard
            label="Civic complaints"
            value={compactNumber(
              totalComplaints
            )}
            sub="Current registered workload"
            icon={ClipboardList}
            accent="bg-blue-400"
            trend="down"
          />

          <StatCard
            label="Population covered"
            value={compactNumber(
              totalPopulation
            )}
            sub="Across loaded wards"
            icon={Users}
            accent="bg-violet-400"
          />

          <StatCard
            label="Ward budget"
            value={compactMoney(
              totalBudget
            )}
            sub="Allocated across wards"
            icon={Wallet}
            accent="bg-emerald-400"
          />

          <StatCard
            label="Active workforce"
            value={compactNumber(
              totalActiveWorkers
            )}
            sub="Active workers linked"
            icon={HardHat}
            accent="bg-amber-400"
          />
        </section>

        {/* =================================================
            ALERT STRIP
        ================================================= */}

        {(criticalWards.length > 0 ||
          highRiskWards.length > 0) && (
            <section className="mb-8 rounded-3xl border border-amber-400/15 bg-gradient-to-r from-amber-400/[0.07] to-rose-400/[0.04] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10">
                    <AlertCircle className="h-5 w-5 text-amber-300" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-white">
                      Ward pressure requires attention
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {criticalWards.length} critical and{" "}
                      {highRiskWards.length} high-risk
                      ward(s) are currently flagged by
                      the illustrative intelligence layer.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSortBy("score")
                  }
                  className="rounded-xl border border-amber-300/15 bg-amber-300/5 px-4 py-2 text-xs font-bold text-amber-200"
                >
                  Review risk wards
                </button>
              </div>
            </section>
          )}

        {/* =================================================
            INSIGHTS + ZONES
        ================================================= */}

        <section className="mb-9 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <div>
            <SectionTitle
              eyebrow="AI-assisted overview"
              title="Operational priorities"
              description="Where administration should look first."
            />

            <div className="space-y-3">
              {pressureWards
                .slice(0, 4)
                .map((ward) => {
                  const intel =
                    wardIntelligence.get(
                      ward.id
                    );

                  if (!intel) return null;

                  return (
                    <button
                      key={ward.id}
                      onClick={() =>
                        setSelectedWard(
                          ward
                        )
                      }
                      className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-cyan-400/20 hover:bg-white/[0.045]"
                    >
                      <ScoreRing
                        score={
                          intel.score
                        }
                        size="small"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-white">
                            Ward {ward.number}
                          </span>

                          <span className="text-xs text-slate-600">
                            {ward.name}
                          </span>

                          <StatusBadge
                            tone={
                              intel.risk ===
                                "CRITICAL"
                                ? "red"
                                : intel.risk ===
                                  "HIGH"
                                  ? "amber"
                                  : "blue"
                            }
                          >
                            {intel.risk}
                          </StatusBadge>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-slate-700">
                              Complaints
                            </p>
                            <p className="text-xs font-bold text-slate-300">
                              {
                                ward.complaintCount
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-slate-700">
                              Workers
                            </p>
                            <p className="text-xs font-bold text-slate-300">
                              {
                                intel.workerCount
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-slate-700">
                              Pressure
                            </p>
                            <p className="text-xs font-bold text-slate-300">
                              {Math.round(
                                intel.servicePressure
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-slate-700">
                              Response
                            </p>
                            <p className="text-xs font-bold text-slate-300">
                              {intel.estimatedResponseHours.toFixed(
                                1
                              )}
                              h
                            </p>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-400" />
                    </button>
                  );
                })}
            </div>
          </div>

          <div>
            <SectionTitle
              eyebrow="Zone intelligence"
              title="Administrative zones"
              description="Compare workload, funding and service health."
            />

            <div className="space-y-3">
              {zoneAnalytics.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-sm text-slate-600">
                  Zone data will appear once ward
                  records contain zone information.
                </div>
              ) : (
                zoneAnalytics.map(
                  (zone) => (
                    <div
                      key={zone.zone}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-white">
                            {zone.zone}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-600">
                            {zone.wards} wards ·{" "}
                            {zone.complaints} complaints
                          </p>
                        </div>

                        <span className="text-lg font-black text-cyan-300">
                          {zone.score}
                        </span>
                      </div>

                      <div className="mt-3">
                        <MetricBar
                          label="Service health"
                          value={zone.score}
                        />
                      </div>

                      <div className="mt-3 flex justify-between text-[10px] text-slate-600">
                        <span>
                          Budget{" "}
                          {compactMoney(
                            zone.budget
                          )}
                        </span>

                        <span>
                          Workload{" "}
                          {zone.complaints}
                        </span>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            PERFORMANCE + BUDGET
        ================================================= */}

        <section className="mb-9 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
            <SectionTitle
              eyebrow="Performance"
              title="Top performing wards"
              description="Highest composite service-health scores."
            />

            <div className="space-y-4">
              {topWards.map(
                (ward, index) => {
                  const intel =
                    wardIntelligence.get(
                      ward.id
                    );

                  if (!intel) return null;

                  return (
                    <button
                      key={ward.id}
                      onClick={() =>
                        setSelectedWard(
                          ward
                        )
                      }
                      className="flex w-full items-center gap-4 text-left"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] text-xs font-black text-slate-400">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-white">
                              Ward{" "}
                              {
                                ward.number
                              }
                            </span>

                            <span className="ml-2 text-[10px] text-slate-600">
                              {
                                ward.name
                              }
                            </span>
                          </div>

                          <span className="text-xs font-black text-emerald-300">
                            {
                              intel.score
                            }
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                            style={{
                              width: `${intel.score}%`,
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
            <SectionTitle
              eyebrow="Fiscal intelligence"
              title="Ward budget pressure"
              description="Funding allocation and illustrative burn-rate signals."
            />

            <div className="mb-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600">
                    Total allocation
                  </p>

                  <p className="mt-1 text-2xl font-black text-white">
                    {compactMoney(
                      totalBudget
                    )}
                  </p>
                </div>

                <CircleDollarSign className="h-7 w-7 text-emerald-300" />
              </div>
            </div>

            <div className="space-y-4">
              {topWards
                .slice(0, 4)
                .map((ward) => {
                  const intel =
                    wardIntelligence.get(
                      ward.id
                    );

                  if (!intel) return null;

                  return (
                    <div
                      key={ward.id}
                    >
                      <div className="mb-1.5 flex justify-between">
                        <span className="text-xs font-bold text-slate-400">
                          Ward{" "}
                          {ward.number}
                        </span>

                        <span className="text-xs font-black text-slate-300">
                          {compactMoney(
                            ward.budget
                          )}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400"
                          style={{
                            width: `${clamp(
                              (ward.budget /
                                Math.max(
                                  totalBudget,
                                  1
                                )) *
                              100 *
                              3.5
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1 flex justify-between text-[9px] text-slate-700">
                        <span>
                          {intel.activeProjects} active projects
                        </span>

                        <span>
                          ~
                          {
                            intel.monthlyBudgetBurn
                          }
                          % monthly burn
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>

        {/* =================================================
            FILTER / CONTROL BAR
        ================================================= */}

        <section className="mb-5 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search ward number or name..."
                className="w-full rounded-2xl border border-white/[0.07] bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/30"
              />
            </div>

            <div className="relative">
              <select
                value={zoneFilter}
                onChange={(event) =>
                  setZoneFilter(
                    event.target.value
                  )
                }
                className="appearance-none rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3 pr-10 text-xs font-bold text-slate-300 outline-none"
              >
                <option value="ALL">
                  All zones
                </option>

                {zones.map((zone) => (
                  <option
                    key={zone}
                    value={zone}
                  >
                    {zone}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="appearance-none rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3 pr-10 text-xs font-bold text-slate-300 outline-none"
              >
                <option value="ALL">
                  All status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as
                    | "score"
                    | "complaints"
                    | "budget"
                    | "population"
                  )
                }
                className="appearance-none rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3 pr-10 text-xs font-bold text-slate-300 outline-none"
              >
                <option value="score">
                  Sort: AI score
                </option>

                <option value="complaints">
                  Sort: complaints
                </option>

                <option value="budget">
                  Sort: budget
                </option>

                <option value="population">
                  Sort: population
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            </div>
          </div>
        </section>

        {/* =================================================
            WARD GRID
        ================================================= */}

        <section className="mb-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
                Ward directory
              </p>

              <h2 className="mt-1 text-xl font-black">
                Live ward overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing{" "}
                {filteredWards.length} of{" "}
                {wards.length} loaded wards.
              </p>
            </div>

            <button
              onClick={() =>
                setShowInsights(
                  !showInsights
                )
              }
              className="flex items-center gap-2 self-start rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-400"
            >
              <Activity className="h-3.5 w-3.5" />
              {showInsights
                ? "Compact view"
                : "Intelligence view"}
            </button>
          </div>

          {filteredWards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02] p-14 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-700" />

              <p className="mt-4 text-sm font-bold text-slate-500">
                No wards match your filters.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setZoneFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="mt-3 text-xs font-bold text-cyan-400"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredWards.map(
                (ward) => {
                  const intel =
                    wardIntelligence.get(
                      ward.id
                    );

                  if (!intel) return null;

                  const healthTone =
                    intel.health ===
                      "EXCELLENT"
                      ? "green"
                      : intel.health ===
                        "GOOD"
                        ? "blue"
                        : intel.health ===
                          "WATCH"
                          ? "amber"
                          : "red";

                  return (
                    <button
                      key={ward.id}
                      onClick={() =>
                        setSelectedWard(
                          ward
                        )
                      }
                      className="group relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.045]"
                    >
                      <div
                        className={`absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full blur-[80px] ${intel.risk ===
                            "CRITICAL"
                            ? "bg-rose-400/10"
                            : intel.risk ===
                              "HIGH"
                              ? "bg-amber-400/10"
                              : "bg-cyan-400/10"
                          }`}
                      />

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.07] bg-black/20 text-sm font-black text-cyan-300">
                              {ward.number}
                            </div>

                            <div>
                              <p className="text-sm font-black text-white">
                                {ward.name}
                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-600">
                                {ward.zone ||
                                  "Zone not assigned"}
                              </p>
                            </div>
                          </div>

                          <ScoreRing
                            score={
                              intel.score
                            }
                            size="small"
                          />
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <StatusBadge
                            tone={
                              healthTone
                            }
                          >
                            {
                              intel.health
                            }
                          </StatusBadge>

                          <StatusBadge
                            tone={
                              intel.risk ===
                                "CRITICAL"
                                ? "red"
                                : intel.risk ===
                                  "HIGH"
                                  ? "amber"
                                  : "blue"
                            }
                          >
                            {
                              intel.risk
                            }{" "}
                            risk
                          </StatusBadge>

                          {!ward.isActive && (
                            <StatusBadge tone="red">
                              Inactive
                            </StatusBadge>
                          )}
                        </div>

                        {showInsights && (
                          <>
                            <div className="mt-5 grid grid-cols-2 gap-2">
                              <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <ClipboardList className="h-3.5 w-3.5" />
                                  <span className="text-[9px] uppercase tracking-wider">
                                    Complaints
                                  </span>
                                </div>

                                <p className="mt-2 text-lg font-black text-white">
                                  {
                                    ward.complaintCount
                                  }
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Users className="h-3.5 w-3.5" />
                                  <span className="text-[9px] uppercase tracking-wider">
                                    Workers
                                  </span>
                                </div>

                                <p className="mt-2 text-lg font-black text-white">
                                  {
                                    intel.workerCount
                                  }
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Wallet className="h-3.5 w-3.5" />
                                  <span className="text-[9px] uppercase tracking-wider">
                                    Budget
                                  </span>
                                </div>

                                <p className="mt-2 text-sm font-black text-white">
                                  {compactMoney(
                                    ward.budget
                                  )}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  <span className="text-[9px] uppercase tracking-wider">
                                    Response
                                  </span>
                                </div>

                                <p className="mt-2 text-sm font-black text-white">
                                  {intel.estimatedResponseHours.toFixed(
                                    1
                                  )}
                                  h
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 space-y-3">
                              <MetricBar
                                label="Sanitation"
                                value={
                                  intel.sanitationIndex
                                }
                                color="bg-emerald-400"
                              />

                              <MetricBar
                                label="Infrastructure"
                                value={
                                  intel.infrastructureIndex
                                }
                                color="bg-cyan-400"
                              />

                              <MetricBar
                                label="Workforce capacity"
                                value={
                                  intel.workforceIndex
                                }
                                color="bg-violet-400"
                              />
                            </div>
                          </>
                        )}

                        <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4">
                          <span className="text-[10px] text-slate-600">
                            {intel.activeProjects} active
                            civic projects
                          </span>

                          <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 opacity-70 transition group-hover:opacity-100">
                            View intelligence
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* =================================================
            BOTTOM INTELLIGENCE GRID
        ================================================= */}

        <section className="mb-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>

              <div>
                <p className="text-sm font-black">
                  Service resilience
                </p>

                <p className="text-[10px] text-slate-600">
                  Illustrative 2026 index
                </p>
              </div>
            </div>

            <div className="mt-6 text-4xl font-black text-emerald-300">
              {clamp(
                averageScore + 4
              )}
              %
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Overall operational resilience
              derived from loaded ward service
              indicators.
            </p>

            <div className="mt-5">
              <MetricBar
                label="Resilience"
                value={clamp(
                  averageScore + 4
                )}
                color="bg-emerald-400"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
                <Target className="h-5 w-5 text-amber-300" />
              </div>

              <div>
                <p className="text-sm font-black">
                  Workload concentration
                </p>

                <p className="text-[10px] text-slate-600">
                  Complaint distribution signal
                </p>
              </div>
            </div>

            <div className="mt-6 text-4xl font-black text-amber-300">
              {wards.length
                ? Math.round(
                  (pressureWards.reduce(
                    (sum, ward) =>
                      sum +
                      ward.complaintCount,
                    0
                  ) /
                    Math.max(
                      totalComplaints,
                      1
                    )) *
                  100
                )
                : 0}
              %
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Share of complaint workload
              concentrated inside the five highest
              pressure wards.
            </p>

            <div className="mt-5">
              <MetricBar
                label="Concentration"
                value={
                  wards.length
                    ? clamp(
                      (pressureWards.reduce(
                        (sum, ward) =>
                          sum +
                          ward.complaintCount,
                        0
                      ) /
                        Math.max(
                          totalComplaints,
                          1
                        )) *
                      100
                    )
                    : 0
                }
                color="bg-amber-400"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10">
                <Zap className="h-5 w-5 text-violet-300" />
              </div>

              <div>
                <p className="text-sm font-black">
                  Digital readiness
                </p>

                <p className="text-[10px] text-slate-600">
                  SmartDELHI operational coverage
                </p>
              </div>
            </div>

            <div className="mt-6 text-4xl font-black text-violet-300">
              {wards.length
                ? Math.round(
                  (activeWards /
                    wards.length) *
                  100
                )
                : 0}
              %
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Active ward records available for
              digital monitoring and intelligence.
            </p>

            <div className="mt-5">
              <MetricBar
                label="Coverage"
                value={
                  wards.length
                    ? (activeWards /
                      wards.length) *
                    100
                    : 0
                }
                color="bg-violet-400"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="border-t border-white/[0.05] py-6">
          <div className="flex flex-col gap-2 text-[10px] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <div>
              SmartDELHI · Ward Command & Control
              · Administrative Intelligence
            </div>

            <div>
              {lastUpdated
                ? `Last synced ${lastUpdated.toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}`
                : "Awaiting sync"}
            </div>
          </div>

          <p className="mt-2 text-[9px] leading-5 text-slate-800">
            Additional service-health, response,
            budget-burn and performance indicators
            shown on this interface are illustrative
            demo intelligence until connected to
            corresponding production datasets.
          </p>
        </footer>
      </main>

      {/* =================================================
          WARD DETAIL DRAWER
      ================================================= */}

      {selectedWard && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close ward details"
            onClick={() =>
              setSelectedWard(null)
            }
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-white/[0.08] bg-[#050a12] shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#050a12]/90 p-5 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                    Ward intelligence profile
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-white">
                    Ward{" "}
                    {
                      selectedWard.number
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedWard.name}
                    {selectedWard.zone
                      ? ` · ${selectedWard.zone}`
                      : ""}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedWard(null)
                  }
                  className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-2 text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-5">
              {(() => {
                const intel =
                  wardIntelligence.get(
                    selectedWard.id
                  );

                if (!intel) {
                  return null;
                }

                return (
                  <>
                    {/* SCORE */}

                    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
                      <div className="flex items-center gap-5">
                        <ScoreRing
                          score={
                            intel.score
                          }
                        />

                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-600">
                            Composite score
                          </p>

                          <p className="mt-1 text-2xl font-black text-white">
                            {intel.score}
                            /100
                          </p>

                          <div className="mt-2 flex gap-2">
                            <StatusBadge
                              tone={
                                intel.health ===
                                  "EXCELLENT"
                                  ? "green"
                                  : intel.health ===
                                    "GOOD"
                                    ? "blue"
                                    : intel.health ===
                                      "WATCH"
                                      ? "amber"
                                      : "red"
                              }
                            >
                              {
                                intel.health
                              }
                            </StatusBadge>

                            <StatusBadge
                              tone={
                                intel.risk ===
                                  "CRITICAL"
                                  ? "red"
                                  : intel.risk ===
                                    "HIGH"
                                    ? "amber"
                                    : "blue"
                              }
                            >
                              {
                                intel.risk
                              }{" "}
                              risk
                            </StatusBadge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CORE METRICS */}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                        <p className="text-[9px] uppercase tracking-widest text-slate-700">
                          Population
                        </p>

                        <p className="mt-2 text-xl font-black">
                          {compactNumber(
                            selectedWard.population ||
                            0
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                        <p className="text-[9px] uppercase tracking-widest text-slate-700">
                          Complaints
                        </p>

                        <p className="mt-2 text-xl font-black">
                          {
                            selectedWard.complaintCount
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                        <p className="text-[9px] uppercase tracking-widest text-slate-700">
                          Active workers
                        </p>

                        <p className="mt-2 text-xl font-black">
                          {
                            intel.workerCount
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                        <p className="text-[9px] uppercase tracking-widest text-slate-700">
                          Ward budget
                        </p>

                        <p className="mt-2 text-lg font-black">
                          {compactMoney(
                            selectedWard.budget
                          )}
                        </p>
                      </div>
                    </div>

                    {/* SERVICE HEALTH */}

                    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
                      <div className="mb-5 flex items-center gap-3">
                        <Gauge className="h-4 w-4 text-cyan-400" />

                        <div>
                          <p className="text-sm font-black">
                            Service health
                          </p>

                          <p className="text-[10px] text-slate-600">
                            Operational indicators
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <MetricBar
                          label="Sanitation"
                          value={
                            intel.sanitationIndex
                          }
                          color="bg-emerald-400"
                        />

                        <MetricBar
                          label="Infrastructure"
                          value={
                            intel.infrastructureIndex
                          }
                          color="bg-cyan-400"
                        />

                        <MetricBar
                          label="Workforce capacity"
                          value={
                            intel.workforceIndex
                          }
                          color="bg-violet-400"
                        />

                        <MetricBar
                          label="Citizen satisfaction"
                          value={
                            intel.citizenSatisfaction
                          }
                          color="bg-amber-400"
                        />

                        <MetricBar
                          label="Budget efficiency"
                          value={
                            intel.budgetEfficiency
                          }
                          color="bg-blue-400"
                        />
                      </div>
                    </div>

                    {/* WORKLOAD */}

                    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-rose-400" />

                        <div>
                          <p className="text-sm font-black">
                            Workload intelligence
                          </p>

                          <p className="text-[10px] text-slate-600">
                            Complaint pressure and response
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-700">
                            Per worker
                          </p>

                          <p className="mt-1 text-xl font-black">
                            {intel.complaintsPerWorker.toFixed(
                              1
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-700">
                            Per 10K citizens
                          </p>

                          <p className="mt-1 text-xl font-black">
                            {intel.complaintsPer10k.toFixed(
                              1
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-700">
                            Est. resolved
                          </p>

                          <p className="mt-1 text-xl font-black text-emerald-300">
                            {
                              intel.estimatedResolved
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-700">
                            Est. pending
                          </p>

                          <p className="mt-1 text-xl font-black text-amber-300">
                            {
                              intel.estimatedPending
                            }
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-rose-400/10 bg-rose-400/[0.035] p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400">
                            Service pressure
                          </span>

                          <span className="text-lg font-black text-rose-300">
                            {Math.round(
                              intel.servicePressure
                            )}
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
                            style={{
                              width: `${clamp(
                                intel.servicePressure
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* BUDGET */}

                    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
                      <div className="flex items-center gap-3">
                        <CircleDollarSign className="h-4 w-4 text-emerald-400" />

                        <div>
                          <p className="text-sm font-black">
                            Fiscal snapshot
                          </p>

                          <p className="text-[10px] text-slate-600">
                            Illustrative operational estimate
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-slate-700">
                              Allocated budget
                            </p>

                            <p className="mt-1 text-2xl font-black">
                              {compactMoney(
                                selectedWard.budget
                              )}
                            </p>
                          </div>

                          <span className="text-xs font-bold text-emerald-300">
                            {
                              intel.budgetEfficiency
                            }
                            % efficiency
                          </span>
                        </div>

                        <div className="mt-5">
                          <MetricBar
                            label="Budget efficiency"
                            value={
                              intel.budgetEfficiency
                            }
                            color="bg-emerald-400"
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-black/20 p-3">
                            <p className="text-[9px] uppercase text-slate-700">
                              Active projects
                            </p>

                            <p className="mt-1 text-lg font-black">
                              {
                                intel.activeProjects
                              }
                            </p>
                          </div>

                          <div className="rounded-2xl bg-black/20 p-3">
                            <p className="text-[9px] uppercase text-slate-700">
                              Monthly burn
                            </p>

                            <p className="mt-1 text-lg font-black">
                              {
                                intel.monthlyBudgetBurn
                              }
                              %
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ADMIN ACTION */}

                    <div className="rounded-3xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5">
                      <div className="flex gap-3">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />

                        <div>
                          <p className="text-sm font-black">
                            SmartDELHI recommendation
                          </p>

                          <p className="mt-2 text-xs leading-6 text-slate-500">
                            {intel.risk ===
                              "CRITICAL"
                              ? "Prioritise this ward for immediate workforce redistribution, complaint triage and field verification."
                              : intel.risk ===
                                "HIGH"
                                ? "Increase field monitoring and review complaint concentration before the next operational cycle."
                                : intel.risk ===
                                  "MEDIUM"
                                  ? "Maintain normal monitoring while reviewing workload and response-time trends."
                                  : "Ward is operating within the illustrative healthy range. Continue monitoring for trend changes."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PAGE EXPORT
========================================================= */

export default function AdminWardsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <WardsDashboard />
    </AuthGuard>
  );
}