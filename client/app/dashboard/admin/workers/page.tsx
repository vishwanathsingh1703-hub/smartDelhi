"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  Activity,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  HardHat,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  UserX,
  Wifi,
  X,
  Zap,
} from "lucide-react";

interface Worker {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  ward?: string | null;
  isActive: boolean;
  _count: {
    assignedComplaints: number;
  };
}

function StatusPill({
  active,
}: {
  active: boolean;
}) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-70" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-300">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
      Inactive
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/[0.13] hover:bg-white/[0.05]">
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${accent} opacity-[0.08] blur-3xl transition duration-500 group-hover:opacity-[0.16]`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-white">
            {value.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent}/10`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function WorkerAvatar({
  name,
}: {
  name: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-blue-500/10 text-sm font-black text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.06)]">
      {initials || "W"}
    </div>
  );
}

function WorkersDashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const fetchWorkers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/workers",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (data.success) {
        setWorkers(
          Array.isArray(data.workers)
            ? data.workers
            : []
        );
      }
    } catch (error) {
      console.error(
        "WORKERS_FETCH_ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const toggleWorker = async (
    worker: Worker
  ) => {
    try {
      setUpdating(worker.id);

      const response = await fetch(
        `/api/admin/workers/${worker.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            isActive: !worker.isActive,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.message ||
            "Failed to update worker"
        );
        return;
      }

      setWorkers((current) =>
        current.map((item) =>
          item.id === worker.id
            ? {
                ...item,
                isActive:
                  data.worker.isActive,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "WORKER_UPDATE_ERROR:",
        error
      );

      alert(
        "Failed to update worker"
      );
    } finally {
      setUpdating(null);
    }
  };

  const activeWorkers = workers.filter(
    (worker) => worker.isActive
  ).length;

  const inactiveWorkers =
    workers.length - activeWorkers;

  const totalComplaints =
    workers.reduce(
      (sum, worker) =>
        sum +
        Number(
          worker._count
            ?.assignedComplaints || 0
        ),
      0
    );

  const filteredWorkers =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return workers.filter(
        (worker) => {
          const matchesSearch =
            !query ||
            worker.name
              .toLowerCase()
              .includes(query) ||
            worker.email
              .toLowerCase()
              .includes(query) ||
            String(
              worker.ward || ""
            )
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter ===
              "ACTIVE" &&
              worker.isActive) ||
            (statusFilter ===
              "INACTIVE" &&
              !worker.isActive);

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      workers,
      search,
      statusFilter,
    ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02050b] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-[5%] h-[450px] w-[450px] rounded-full bg-cyan-500/5 blur-[140px]" />
          <div className="absolute right-[5%] top-[25%] h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[140px]" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto h-16 w-16">
              <div className="absolute inset-0 rounded-full border border-cyan-400/20" />

              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-400" />

              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-cyan-400/10">
                <HardHat className="h-5 w-5 text-cyan-400" />
              </div>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-300">
              Initializing Workforce Intelligence
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Connecting to SmartDELHI worker registry
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#02050b] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="absolute left-[5%] top-[0%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[140px]" />

        <div className="absolute right-[0%] top-[20%] h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-[150px]" />

        <div className="absolute bottom-[-150px] left-[35%] h-[400px] w-[400px] rounded-full bg-blue-500/[0.035] blur-[140px]" />
      </div>

      <main className="relative mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        {/* TOP BAR */}

        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.025] px-5 py-4 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black tracking-tight">
                  SmartDELHI
                </span>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-cyan-300">
                  Workforce Intelligence
                </span>
              </div>

              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-600">
                Municipal Workforce Command Center
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
              onClick={fetchWorkers}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* HERO */}

        <section className="mb-7 grid gap-5 xl:grid-cols-[1.45fr_.55fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-cyan-400/[0.08] via-white/[0.025] to-violet-400/[0.06] p-6 sm:p-8">
            <div className="absolute right-[-100px] top-[-100px] h-80 w-80 rounded-full bg-cyan-400/10 blur-[110px]" />

            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />

                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                  Municipal Workforce Layer
                </span>
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                MCD Worker
                <span className="text-cyan-400">
                  {" "}
                  Management
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Monitor workforce availability,
                ward assignments and active civic
                workload from one centralized
                operational dashboard.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  <Users className="h-3 w-3" />
                  {workers.length} Registered
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  <Activity className="h-3 w-3" />
                  {activeWorkers} Active
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  <ClipboardList className="h-3 w-3" />
                  {totalComplaints} Assigned
                </span>
              </div>
            </div>
          </div>

          {/* LIVE STATUS */}

          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  Workforce status
                </p>

                <p className="mt-1 text-lg font-black">
                  Live Operations
                </p>
              </div>

              <Wifi className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-300">
                      Available workforce
                    </p>

                    <p className="text-[10px] text-slate-600">
                      Currently operational
                    </p>
                  </div>
                </div>

                <span className="text-xl font-black text-emerald-300">
                  {activeWorkers}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-400/10">
                    <UserX className="h-4 w-4 text-rose-400" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-300">
                      Offline workforce
                    </p>

                    <p className="text-[10px] text-slate-600">
                      Currently unavailable
                    </p>
                  </div>
                </div>

                <span className="text-xl font-black text-rose-300">
                  {inactiveWorkers}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* KPI */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total workforce"
            value={workers.length}
            subtitle="Registered MCD workers"
            icon={Users}
            accent="bg-cyan-400"
          />

          <StatCard
            title="Active workers"
            value={activeWorkers}
            subtitle="Currently operational"
            icon={CheckCircle2}
            accent="bg-emerald-400"
          />

          <StatCard
            title="Inactive workers"
            value={inactiveWorkers}
            subtitle="Currently unavailable"
            icon={UserX}
            accent="bg-rose-400"
          />

          <StatCard
            title="Assigned workload"
            value={totalComplaints}
            subtitle="Active complaint assignments"
            icon={ClipboardList}
            accent="bg-violet-400"
          />
        </section>

        {/* WORKFORCE TABLE */}

        <section className="overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.025] shadow-2xl shadow-black/20 backdrop-blur-xl">
          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                Workforce Registry
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-white">
                All Municipal Workers
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Manage worker availability and
                operational assignments.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* SEARCH */}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search worker..."
                  className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-9 pr-9 text-xs text-white outline-none placeholder:text-slate-600 transition focus:border-cyan-400/30 sm:w-56"
                />

                {search && (
                  <button
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* FILTER */}

              <div className="flex rounded-xl border border-white/[0.08] bg-black/20 p-1">
                {(
                  [
                    ["ALL", "All"],
                    ["ACTIVE", "Active"],
                    ["INACTIVE", "Offline"],
                  ] as const
                ).map(
                  ([value, label]) => (
                    <button
                      key={value}
                      onClick={() =>
                        setStatusFilter(
                          value
                        )
                      }
                      className={`rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition ${
                        statusFilter ===
                        value
                          ? "bg-cyan-400 text-slate-950"
                          : "text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* RESULT COUNT */}

          <div className="border-b border-white/[0.05] px-5 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Showing{" "}
                <span className="text-slate-400">
                  {filteredWorkers.length}
                </span>{" "}
                workers
              </span>

              <span className="text-[10px] text-slate-700">
                Live registry
              </span>
            </div>
          </div>

          {/* EMPTY */}

          {filteredWorkers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <Users className="h-6 w-6 text-slate-600" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-400">
                No workers found
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Try changing your search or
                status filter.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-black/20">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
                        Worker
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
                        Ward
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
                        Workload
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
                        Control
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredWorkers.map(
                      (worker) => {
                        const complaints =
                          Number(
                            worker._count
                              ?.assignedComplaints ||
                              0
                          );

                        return (
                          <tr
                            key={worker.id}
                            className="group border-b border-white/[0.045] transition hover:bg-white/[0.025]"
                          >
                            {/* WORKER */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <WorkerAvatar
                                  name={
                                    worker.name
                                  }
                                />

                                <div className="min-w-0">
                                  <p className="truncate font-bold text-slate-200">
                                    {
                                      worker.name
                                    }
                                  </p>

                                  <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-600">
                                    <UserRound className="h-3 w-3" />
                                    Municipal Worker
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* CONTACT */}

                            <td className="px-6 py-5">
                              <div className="space-y-1.5">
                                <p className="flex items-center gap-2 text-xs text-slate-400">
                                  <Mail className="h-3 w-3 text-slate-600" />
                                  {
                                    worker.email
                                  }
                                </p>

                                <p className="flex items-center gap-2 text-xs text-slate-600">
                                  <Phone className="h-3 w-3" />
                                  {worker.phone ||
                                    "No phone"}
                                </p>
                              </div>
                            </td>

                            {/* WARD */}

                            <td className="px-6 py-5">
                              {worker.ward ? (
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/15 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-300">
                                  <MapPin className="h-3 w-3" />
                                  Ward{" "}
                                  {
                                    worker.ward
                                  }
                                </span>
                              ) : (
                                <span className="text-xs text-slate-600">
                                  Not assigned
                                </span>
                              )}
                            </td>

                            {/* WORKLOAD */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10">
                                  <ClipboardList className="h-4 w-4 text-blue-300" />
                                </div>

                                <div>
                                  <p className="text-sm font-black text-white">
                                    {
                                      complaints
                                    }
                                  </p>

                                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                                    Assigned
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">
                              <StatusPill
                                active={
                                  worker.isActive
                                }
                              />
                            </td>

                            {/* ACTION */}

                            <td className="px-6 py-5 text-right">
                              <button
                                onClick={() =>
                                  toggleWorker(
                                    worker
                                  )
                                }
                                disabled={
                                  updating ===
                                  worker.id
                                }
                                className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  worker.isActive
                                    ? "border-rose-400/15 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20"
                                    : "border-emerald-400/15 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                                }`}
                              >
                                {updating ===
                                worker.id
                                  ? "Updating..."
                                  : worker.isActive
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET CARDS */}

              <div className="grid gap-3 p-4 lg:hidden">
                {filteredWorkers.map(
                  (worker) => {
                    const complaints =
                      Number(
                        worker._count
                          ?.assignedComplaints ||
                          0
                      );

                    return (
                      <div
                        key={worker.id}
                        className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition hover:border-white/[0.12]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <WorkerAvatar
                              name={
                                worker.name
                              }
                            />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-white">
                                {
                                  worker.name
                                }
                              </p>

                              <p className="mt-1 truncate text-[10px] text-slate-600">
                                {
                                  worker.email
                                }
                              </p>
                            </div>
                          </div>

                          <StatusPill
                            active={
                              worker.isActive
                            }
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3">
                            <p className="text-[9px] uppercase tracking-wider text-slate-600">
                              Ward
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-300">
                              {worker.ward ||
                                "Unassigned"}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3">
                            <p className="text-[9px] uppercase tracking-wider text-slate-600">
                              Complaints
                            </p>

                            <p className="mt-1 text-xs font-bold text-cyan-300">
                              {
                                complaints
                              }
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            toggleWorker(
                              worker
                            )
                          }
                          disabled={
                            updating ===
                            worker.id
                          }
                          className={`mt-3 w-full rounded-xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition disabled:opacity-50 ${
                            worker.isActive
                              ? "border-rose-400/15 bg-rose-400/10 text-rose-300"
                              : "border-emerald-400/15 bg-emerald-400/10 text-emerald-300"
                          }`}
                        >
                          {updating ===
                          worker.id
                            ? "Updating..."
                            : worker.isActive
                            ? "Deactivate Worker"
                            : "Activate Worker"}
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default function AdminWorkersPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <WorkersDashboard />
    </AuthGuard>
  );
}