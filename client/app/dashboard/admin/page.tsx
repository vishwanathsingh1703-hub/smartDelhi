"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  BellRing,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileBarChart2,
  Gauge,
  Layers3,
  LogOut,
  MapPinned,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  UserRound,
  WalletCards,
  HardHat,
  Zap,
  X,
  Command,
  LayoutDashboard,
  Radio,
  BrainCircuit,
  PanelsTopLeft,
  ArrowUpRight,
  CircleDot,
  ActivitySquare,
  CalendarDays,
  Map,
  Cpu,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ExternalLink,
  Shield,
  Bell,
  Settings,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   TYPES
========================================================= */

interface Complaint {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  ward: string;
  status: string;
  priority: string;
  createdAt: string;

  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;

  assignedWorker?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    ward?: string | null;
  } | null;
}

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

interface Stats {
  complaints: {
    total: number;
    pending: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    citizenVerified: number;
  };

  users: {
    citizens: number;
    workers: number;
    activeWorkers: number;
  };
}

interface AnalyticsItem {
  name: string;
  count: number;
}

interface WardAnalytics {
  ward: string;
  count: number;
}

interface MonthlyTrend {
  month: string;
  count: number;
}

interface Analytics {
  categories: AnalyticsItem[];
  statuses: AnalyticsItem[];
  priorities: AnalyticsItem[];
  wards: WardAnalytics[];
  monthlyTrend: MonthlyTrend[];
}

type DashboardTab =
  | "overview"
  | "operations"
  | "intelligence"
  | "workforce"
  | "gallery";

/* =========================================================
   MAIN
========================================================= */

function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<DashboardTab>("overview");

  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [selectedWorkers, setSelectedWorkers] =
    useState<Record<string, string>>({});

  /* =========================================================
     FETCH
  ========================================================= */

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        statsResponse,
        complaintsResponse,
        workersResponse,
        analyticsResponse,
      ] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/complaints"),
        fetch("/api/admin/workers"),
        fetch("/api/admin/analytics"),
      ]);

      const statsData = await statsResponse.json();
      const complaintsData = await complaintsResponse.json();
      const workersData = await workersResponse.json();
      const analyticsData = await analyticsResponse.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }

      if (complaintsData.success) {
        setComplaints(complaintsData.complaints);
      }

      if (workersData.success) {
        setWorkers(workersData.workers);
      }

      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (error) {
      console.error("ADMIN_DASHBOARD_ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const params = new URLSearchParams();

      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (wardFilter) params.set("ward", wardFilter);
      if (priorityFilter) params.set("priority", priorityFilter);

      const query = params.toString();

      const response = await fetch(
        `/api/admin/complaints${query ? `?${query}` : ""}`
      );

      const data = await response.json();

      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error("ADMIN_COMPLAINTS_ERROR:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchComplaints();
    }
  }, [
    statusFilter,
    categoryFilter,
    wardFilter,
    priorityFilter,
  ]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  /* =========================================================
     ASSIGN WORKER
  ========================================================= */

  const assignWorker = async (complaintId: string) => {
    const workerId = selectedWorkers[complaintId];

    if (!workerId) {
      alert("Please select a worker first.");
      return;
    }

    try {
      setAssigning(complaintId);

      const response = await fetch(
        `/api/admin/complaints/${complaintId}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to assign worker.");
        return;
      }

      setComplaints((current) =>
        current.map((complaint) =>
          complaint.id === complaintId
            ? data.complaint
            : complaint
        )
      );

      setSelectedComplaint((current) =>
        current?.id === complaintId
          ? data.complaint
          : current
      );

      alert("Worker assigned successfully.");
    } catch (error) {
      console.error("ASSIGN_WORKER_ERROR:", error);
      alert("Something went wrong while assigning worker.");
    } finally {
      setAssigning(null);
    }
  };

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        complaints.map(
          (complaint) => complaint.category
        )
      )
    );
  }, [complaints]);

  const wards = useMemo(() => {
    return Array.from(
      new Set(
        complaints.map(
          (complaint) => complaint.ward
        )
      )
    );
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return complaints;

    return complaints.filter((complaint) => {
      return (
        complaint.title
          ?.toLowerCase()
          .includes(term) ||
        complaint.category
          ?.toLowerCase()
          .includes(term) ||
        complaint.ward
          ?.toLowerCase()
          .includes(term) ||
        complaint.user?.name
          ?.toLowerCase()
          .includes(term)
      );
    });
  }, [complaints, search]);

  const total = stats?.complaints.total ?? 0;
  const resolved = stats?.complaints.resolved ?? 0;
  const pending = stats?.complaints.pending ?? 0;
  const assigned = stats?.complaints.assigned ?? 0;
  const inProgress =
    stats?.complaints.inProgress ?? 0;
  const verified =
    stats?.complaints.citizenVerified ?? 0;

  const resolutionRate =
    total > 0
      ? Math.round((resolved / total) * 100)
      : 0;

  const verificationRate =
    total > 0
      ? Math.round((verified / total) * 100)
      : 0;

  const activeWorkers =
    stats?.users.activeWorkers ?? 0;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040a] text-white flex items-center justify-center">
        <Background />

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-cyan-400/20 bg-cyan-400/[0.06]"
          >
            <Cpu className="h-8 w-8 text-cyan-300" />
          </motion.div>

          <h2 className="mt-7 text-xl font-black">
            SMARTDELHI
          </h2>

          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
            Intelligence Core
          </p>

          <div className="mx-auto mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/5">
            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-full w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            />
          </div>

          <p className="mt-4 text-xs text-slate-600">
            Connecting civic intelligence systems...
          </p>
        </motion.div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02040a] text-white">
      <Background />

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,.08),transparent_30%),radial-gradient(circle_at_100%_60%,rgba(59,130,246,.07),transparent_35%)]" />

      <div className="relative z-10 flex min-h-screen">

        {/* =====================================================
            LEFT RAIL
        ===================================================== */}

        <aside className="hidden w-[82px] shrink-0 border-r border-white/[0.06] bg-black/20 backdrop-blur-2xl lg:flex lg:flex-col lg:items-center lg:py-5">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.07]">
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="mt-10 flex flex-1 flex-col gap-3">
            <RailButton
              active={activeTab === "overview"}
              icon={LayoutDashboard}
              onClick={() =>
                setActiveTab("overview")
              }
            />

            <RailButton
              active={activeTab === "operations"}
              icon={Radio}
              onClick={() =>
                setActiveTab("operations")
              }
            />

            <RailButton
              active={activeTab === "intelligence"}
              icon={BrainCircuit}
              onClick={() =>
                setActiveTab("intelligence")
              }
            />

            <RailButton
              active={activeTab === "workforce"}
              icon={Users}
              onClick={() =>
                setActiveTab("workforce")
              }
            />

            <RailButton
              active={activeTab === "gallery"}
              icon={PanelsTopLeft}
              onClick={() =>
                setActiveTab("gallery")
              }
            />
          </div>

          <div className="flex flex-col gap-3">
            <RailButton
              icon={Settings}
              onClick={() => { }}
            />

            <RailButton
              icon={LogOut}
              danger
              onClick={handleLogout}
            />
          </div>
        </aside>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <main className="min-w-0 flex-1">

          {/* ===================================================
              TOP SYSTEM BAR
          =================================================== */}

          <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#02040a]/80 backdrop-blur-2xl">

            <div className="flex h-[72px] items-center justify-between px-4 md:px-7">

              <div className="flex min-w-0 items-center gap-3">

                <div className="lg:hidden">
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                    <Menu className="h-4 w-4" />
                  </button>
                </div>

                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
                      SMARTDELHI
                    </span>

                    <span className="text-slate-700">
                      /
                    </span>

                    <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      ADMIN CORE
                    </span>
                  </div>
                </div>

                <div className="hidden h-6 w-px bg-white/[0.07] sm:block" />

                <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-1.5">
                  <motion.span
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                    }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  />

                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                    All systems operational
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">

                <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                  <Command className="h-3.5 w-3.5 text-slate-600" />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search command center..."
                    className="w-[180px] bg-transparent text-xs text-white outline-none placeholder:text-slate-700"
                  />
                </div>

                <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                  <Bell className="h-4 w-4 text-slate-400" />

                  {pending > 0 && (
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-400" />
                  )}
                </button>

                <button
                  onClick={fetchDashboardData}
                  className="group flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 text-xs font-bold text-slate-400 transition hover:border-cyan-400/20 hover:text-cyan-300"
                >
                  <RefreshCw className="h-3.5 w-3.5 transition-transform duration-700 group-hover:rotate-180" />

                  <span className="hidden sm:block">
                    Sync
                  </span>
                </button>

                <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 sm:flex">
                  <Shield className="h-4 w-4 text-cyan-300" />
                </div>
              </div>
            </div>

            {/* TAB BAR */}

            <div className="overflow-x-auto px-4 md:px-7">
              <div className="flex min-w-max gap-6">

                <TabButton
                  label="Overview"
                  active={activeTab === "overview"}
                  onClick={() =>
                    setActiveTab("overview")
                  }
                />

                <TabButton
                  label="Operations"
                  active={activeTab === "operations"}
                  onClick={() =>
                    setActiveTab("operations")
                  }
                />

                <TabButton
                  label="Intelligence"
                  active={activeTab === "intelligence"}
                  onClick={() =>
                    setActiveTab("intelligence")
                  }
                />

                <TabButton
                  label="Workforce"
                  active={activeTab === "workforce"}
                  onClick={() =>
                    setActiveTab("workforce")
                  }
                />

                <TabButton
                  label="Command Gallery"
                  active={activeTab === "gallery"}
                  onClick={() =>
                    setActiveTab("gallery")
                  }
                />
              </div>
            </div>
          </header>

          {/* ===================================================
              PAGE BODY
          =================================================== */}

          <div className="mx-auto max-w-[1700px] px-4 py-7 md:px-7 md:py-9">

            {/* PAGE TITLE */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-8"
            >
              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">

                <div>


                  <h1 className="text-4xl font-black tracking-[-0.055em] md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200">
                    Command Center
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                    A unified intelligence layer for
                    complaints, citizens, workforce,
                    wards and municipal operations.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <QuickStat
                    label="Complaints"
                    value={total}
                  />

                  <QuickStat
                    label="Resolved"
                    value={resolved}
                  />

                  <QuickStat
                    label="Workers"
                    value={activeWorkers}
                  />
                </div>
              </div>
            </motion.div>

            {/* =================================================
                TAB CONTENT
            ================================================= */}

            <AnimatePresence mode="wait">

              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >

                  {/* KPI STRIP */}

                  <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

                    <Kpi
                      label="Total"
                      value={total}
                      icon={Layers3}
                      accent="cyan"
                    />

                    <Kpi
                      label="Pending"
                      value={pending}
                      icon={Clock3}
                      accent="amber"
                    />

                    <Kpi
                      label="Assigned"
                      value={assigned}
                      icon={UserCheck}
                      accent="violet"
                    />

                    <Kpi
                      label="In Progress"
                      value={inProgress}
                      icon={Activity}
                      accent="blue"
                    />

                    <Kpi
                      label="Resolved"
                      value={resolved}
                      icon={CheckCircle2}
                      accent="green"
                    />

                    <Kpi
                      label="Verified"
                      value={verified}
                      icon={ShieldCheck}
                      accent="cyan"
                    />
                  </div>

                  {/* MAIN INTELLIGENCE */}

                  <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">

                    <HealthPanel
                      resolutionRate={resolutionRate}
                      verificationRate={
                        verificationRate
                      }
                      activeWorkers={
                        activeWorkers
                      }
                      citizens={
                        stats?.users.citizens ?? 0
                      }
                    />

                    <TrendPanel
                      data={
                        analytics?.monthlyTrend ?? []
                      }
                    />
                  </div>

                  {/* MODULE ALBUM */}

                  <div className="mt-6">
                    <SectionHeading
                      eyebrow="Administration"
                      title="Control modules"
                    />

                    <ModuleGallery />
                  </div>

                  {/* RECENT COMPLAINTS */}

                  <div className="mt-6">
                    <SectionHeading
                      eyebrow="Live operations"
                      title="Priority incidents"
                    />

                    <ComplaintPreview
                      complaints={filteredComplaints.slice(
                        0,
                        6
                      )}
                      onOpen={
                        setSelectedComplaint
                      }
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === "operations" && (
                <motion.div
                  key="operations"
                  initial={{
                    opacity: 0,
                    x: 30,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -30,
                  }}
                >
                  <OperationsPanel
                    complaints={filteredComplaints}
                    workers={workers}
                    search={search}
                    setSearch={setSearch}
                    statusFilter={statusFilter}
                    setStatusFilter={
                      setStatusFilter
                    }
                    categoryFilter={
                      categoryFilter
                    }
                    setCategoryFilter={
                      setCategoryFilter
                    }
                    wardFilter={wardFilter}
                    setWardFilter={setWardFilter}
                    priorityFilter={
                      priorityFilter
                    }
                    setPriorityFilter={
                      setPriorityFilter
                    }
                    categories={categories}
                    wards={wards}
                    selectedWorkers={
                      selectedWorkers
                    }
                    setSelectedWorkers={
                      setSelectedWorkers
                    }
                    assigning={assigning}
                    assignWorker={assignWorker}
                    onOpen={
                      setSelectedComplaint
                    }
                  />
                </motion.div>
              )}

              {activeTab === "intelligence" && (
                <motion.div
                  key="intelligence"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -20,
                  }}
                >
                  <IntelligencePanel
                    analytics={analytics}
                  />
                </motion.div>
              )}

              {activeTab === "workforce" && (
                <motion.div
                  key="workforce"
                  initial={{
                    opacity: 0,
                    x: 30,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -30,
                  }}
                >
                  <WorkforcePanel
                    workers={workers}
                  />
                </motion.div>
              )}

              {activeTab === "gallery" && (
                <motion.div
                  key="gallery"
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                >
                  <CommandGallery />
                </motion.div>
              )}

            </AnimatePresence>

            {/* FOOTER */}

            <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[0.05] py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700 md:flex-row">
              <span>
                SmartDELHI Civic Intelligence Platform
              </span>

              <span>
                Delhi Administration Core • v1.0
              </span>
            </footer>
          </div>
        </main>
      </div>

      {/* =====================================================
          SLIDE OVER WINDOW
      ===================================================== */}

      <AnimatePresence>
        {selectedComplaint && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setSelectedComplaint(null)
              }
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            />

            <motion.aside
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 220,
              }}
              className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-[520px] flex-col border-l border-white/[0.08] bg-[#050912]/95 shadow-[-30px_0_100px_rgba(0,0,0,.5)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] p-5">

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300">
                    Incident window
                  </p>

                  <h2 className="mt-1 text-lg font-black">
                    Complaint details
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setSelectedComplaint(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-slate-400 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">

                <div className="rounded-[24px] border border-cyan-400/10 bg-cyan-400/[0.035] p-5">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-xs text-slate-500">
                        Incident ID
                      </p>

                      <p className="mt-1 font-mono text-[10px] text-cyan-300">
                        {selectedComplaint.id}
                      </p>
                    </div>

                    <PriorityBadge
                      priority={
                        selectedComplaint.priority
                      }
                    />
                  </div>

                  <h3 className="mt-5 text-2xl font-black">
                    {selectedComplaint.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {selectedComplaint.description ||
                      "No additional description provided."}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <DetailBox
                    label="Category"
                    value={
                      selectedComplaint.category
                    }
                    icon={Layers3}
                  />

                  <DetailBox
                    label="Ward"
                    value={
                      selectedComplaint.ward
                    }
                    icon={MapPinned}
                  />

                  <DetailBox
                    label="Status"
                    value={
                      selectedComplaint.status
                    }
                    icon={Activity}
                  />

                  <DetailBox
                    label="Reported"
                    value={new Date(
                      selectedComplaint.createdAt
                    ).toLocaleDateString()}
                    icon={CalendarDays}
                  />
                </div>

                <div className="mt-4 rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-5">

                  <div className="flex items-center gap-3">
                    <UserRound className="h-4 w-4 text-cyan-300" />

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
                        Citizen
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        {selectedComplaint.user?.name ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    {selectedComplaint.user?.email ||
                      "No email"}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {selectedComplaint.user?.phone ||
                      "No phone"}
                  </p>
                </div>

                <div className="mt-4 rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-5">

                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
                        Workforce
                      </p>

                      <h3 className="mt-1 font-bold">
                        Assignment
                      </h3>
                    </div>

                    <HardHat className="h-5 w-5 text-violet-300" />
                  </div>

                  <select
                    value={
                      selectedWorkers[
                      selectedComplaint.id
                      ] ||
                      selectedComplaint
                        .assignedWorker?.id ||
                      ""
                    }
                    onChange={(e) =>
                      setSelectedWorkers(
                        (current) => ({
                          ...current,
                          [selectedComplaint.id]:
                            e.target.value,
                        })
                      )
                    }
                    className="w-full rounded-xl border border-white/[0.07] bg-[#080f1b] px-4 py-3 text-xs text-slate-300 outline-none focus:border-cyan-400/30"
                  >
                    <option value="">
                      Select worker
                    </option>

                    {workers.map((worker) => (
                      <option
                        key={worker.id}
                        value={worker.id}
                      >
                        {worker.name}
                        {worker.ward
                          ? ` • ${worker.ward}`
                          : ""}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      assignWorker(
                        selectedComplaint.id
                      )
                    }
                    disabled={
                      assigning ===
                      selectedComplaint.id
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black text-[#021017] transition hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {assigning ===
                      selectedComplaint.id
                      ? "Updating..."
                      : "Assign / Reassign Worker"}

                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   BACKGROUND
========================================================= */

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.05] blur-[130px]" />

      <div className="absolute right-[-10%] top-[30%] h-[600px] w-[600px] rounded-full bg-blue-600/[0.05] blur-[150px]" />

      <div className="absolute bottom-[-20%] left-[30%] h-[500px] w-[500px] rounded-full bg-violet-600/[0.035] blur-[150px]" />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      {Array.from({ length: 25 }).map(
        (_, index) => (
          <motion.span
            key={index}
            className="absolute h-1 w-1 rounded-full bg-cyan-300"
            style={{
              left: `${(index * 41) % 100}%`,
              top: `${(index * 67) % 100}%`,
            }}
            animate={{
              opacity: [0.05, 0.4, 0.05],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4 + (index % 4),
              repeat: Infinity,
              delay: index * 0.15,
            }}
          />
        )
      )}
    </div>
  );
}

/* =========================================================
   RAIL
========================================================= */

function RailButton({
  icon: Icon,
  active,
  danger,
  onClick,
}: {
  icon: LucideIcon;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{
        scale: 1.08,
      }}
      whileTap={{
        scale: 0.94,
      }}
      onClick={onClick}
      className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition ${danger
          ? "border-red-400/10 text-red-300 hover:bg-red-400/10"
          : active
            ? "border-cyan-400/20 bg-cyan-400/[0.09] text-cyan-300"
            : "border-transparent text-slate-600 hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-white"
        }`}
    >
      {active && (
        <motion.span
          layoutId="rail-active"
          className="absolute -left-[17px] h-5 w-0.5 rounded-full bg-cyan-300"
        />
      )}

      <Icon className="h-4 w-4" />
    </motion.button>
  );
}

/* =========================================================
   TABS
========================================================= */

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-1 py-4 text-[10px] font-black uppercase tracking-[0.15em] transition ${active
          ? "text-cyan-300"
          : "text-slate-600 hover:text-slate-300"
        }`}
    >
      {label}

      {active && (
        <motion.div
          layoutId="tab-active"
          className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,.7)]"
        />
      )}
    </button>
  );
}

/* =========================================================
   QUICK STAT
========================================================= */

function QuickStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-[110px] rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

/* =========================================================
   KPI
========================================================= */

function Kpi({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent:
  | "cyan"
  | "amber"
  | "violet"
  | "blue"
  | "green";
}) {
  const styles = {
    cyan: {
      text: "text-cyan-300",
      bg: "bg-cyan-400/[0.07]",
      border: "border-cyan-400/10",
    },
    amber: {
      text: "text-amber-300",
      bg: "bg-amber-400/[0.07]",
      border: "border-amber-400/10",
    },
    violet: {
      text: "text-violet-300",
      bg: "bg-violet-400/[0.07]",
      border: "border-violet-400/10",
    },
    blue: {
      text: "text-blue-300",
      bg: "bg-blue-400/[0.07]",
      border: "border-blue-400/10",
    },
    green: {
      text: "text-emerald-300",
      bg: "bg-emerald-400/[0.07]",
      border: "border-emerald-400/10",
    },
  }[accent];

  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.015,
      }}
      className="group relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-white/[0.025] p-4 backdrop-blur-xl"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/[0.025] blur-2xl transition group-hover:bg-cyan-400/[0.08]" />

      <div className="relative">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${styles.bg} ${styles.border}`}
        >
          <Icon
            className={`h-4 w-4 ${styles.text}`}
          />
        </div>

        <p className="mt-5 text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">
          {label}
        </p>

        <p className="mt-1 text-2xl font-black">
          {value.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   HEALTH
========================================================= */

function HealthPanel({
  resolutionRate,
  verificationRate,
  activeWorkers,
  citizens,
}: {
  resolutionRate: number;
  verificationRate: number;
  activeWorkers: number;
  citizens: number;
}) {
  return (
    <motion.section
      whileHover={{
        borderColor:
          "rgba(34,211,238,.15)",
      }}
      className="relative overflow-hidden rounded-[30px] border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-2xl md:p-7"
    >
      <div className="absolute right-[-120px] top-[-120px] h-[350px] w-[350px] rounded-full bg-cyan-400/[0.06] blur-[100px]" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-300" />

              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300">
                Civic health
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-black">
              Response performance
            </h2>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/[0.06] bg-black/20 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600 sm:flex">
            <CircleDot className="h-3 w-3 text-emerald-400" />
            Live
          </div>
        </div>

        <div className="mt-8 grid items-center gap-8 md:grid-cols-[210px_1fr]">
          <CircularHealth
            value={resolutionRate}
          />

          <div className="grid grid-cols-2 gap-3">
            <MiniMetric
              label="Resolution"
              value={`${resolutionRate}%`}
              icon={CheckCircle2}
              color="green"
            />

            <MiniMetric
              label="Verification"
              value={`${verificationRate}%`}
              icon={ShieldCheck}
              color="cyan"
            />

            <MiniMetric
              label="Active workforce"
              value={activeWorkers}
              icon={HardHat}
              color="blue"
            />

            <MiniMetric
              label="Citizens"
              value={citizens}
              icon={Users}
              color="violet"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* =========================================================
   CIRCULAR
========================================================= */

function CircularHealth({
  value,
}: {
  value: number;
}) {
  const radius = 76;
  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (value / 100) * circumference;

  return (
    <div className="relative mx-auto h-[190px] w-[190px]">
      <svg
        viewBox="0 0 190 190"
        className="-rotate-90"
      >
        <circle
          cx="95"
          cy="95"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.05)"
          strokeWidth="11"
        />

        <motion.circle
          cx="95"
          cy="95"
          r={radius}
          fill="none"
          stroke="url(#healthGradient2)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          initial={{
            strokeDashoffset:
              circumference,
          }}
          animate={{
            strokeDashoffset: offset,
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
        />

        <defs>
          <linearGradient
            id="healthGradient2"
            x1="0"
            x2="1"
          >
            <stop
              offset="0%"
              stopColor="#22d3ee"
            />

            <stop
              offset="100%"
              stopColor="#3b82f6"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black tracking-[-0.06em]">
          {value}%
        </span>

        <span className="mt-1 text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">
          Resolution
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   MINI METRIC
========================================================= */

function MiniMetric({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color:
  | "green"
  | "cyan"
  | "blue"
  | "violet";
}) {
  const styles = {
    green:
      "text-emerald-300 bg-emerald-400/[0.06]",
    cyan:
      "text-cyan-300 bg-cyan-400/[0.06]",
    blue:
      "text-blue-300 bg-blue-400/[0.06]",
    violet:
      "text-violet-300 bg-violet-400/[0.06]",
  };

  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="rounded-2xl border border-white/[0.06] bg-black/15 p-4"
    >
      <div
        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${styles[color]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>
    </motion.div>
  );
}

/* =========================================================
   TREND
========================================================= */

function TrendPanel({
  data,
}: {
  data: MonthlyTrend[];
}) {
  const max = Math.max(
    ...data.map((x) => x.count),
    1
  );

  return (
    <section className="rounded-[30px] border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-2xl md:p-7">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-blue-300" />

        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-300">
          Activity signal
        </span>
      </div>

      <h2 className="mt-2 text-2xl font-black">
        Complaint activity
      </h2>

      <p className="mt-1 text-xs text-slate-600">
        Recent civic reporting trend.
      </p>

      <div className="mt-8 h-[190px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-700">
            No trend data.
          </div>
        ) : (
          <div className="flex h-full items-end gap-2">
            {data.map((item, index) => {
              const height =
                Math.max(
                  8,
                  (item.count / max) * 100
                );

              return (
                <div
                  key={`${item.month}-${index}`}
                  className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <motion.div
                    initial={{
                      height: 0,
                    }}
                    animate={{
                      height: `${height}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.06,
                    }}
                    className="relative w-full max-w-[30px] rounded-t-lg bg-gradient-to-t from-blue-600/50 to-cyan-300/80"
                  >
                    <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded-md border border-white/10 bg-black px-2 py-1 text-[8px] text-white group-hover:block">
                      {item.count}
                    </span>
                  </motion.div>

                  <span className="text-[8px] text-slate-700">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-600">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-black">
        {title}
      </h2>
    </div>
  );
}

/* =========================================================
   MODULE GALLERY
========================================================= */

function ModuleGallery() {
  const modules = [
    {
      title: "Vehicles",
      description:
        "Track and manage civic fleet.",
      href: "/dashboard/admin/vehicles",
      icon: Zap,
      accent: "blue",
      number: "01",
    },
    {
      title: "Ward Management",
      description:
        "Delhi ward operations.",
      href: "/dashboard/admin/wards",
      icon: MapPinned,
      accent: "cyan",
      number: "02",
    },
    {
      title: "Budget Intelligence",
      description:
        "Financial control layer.",
      href: "/dashboard/admin/budget",
      icon: WalletCards,
      accent: "green",
      number: "03",
    },
    {
      title: "Analytics",
      description:
        "Civic intelligence.",
      href: "/dashboard/admin/analytics",
      icon: BarChart3,
      accent: "violet",
      number: "04",
    },
    {
      title: "Reports Center",
      description:
        "Generate official reports.",
      href: "/dashboard/admin/reports",
      icon: FileBarChart2,
      accent: "cyan",
      number: "05",
    },
    {
      title: "AI Score Center",
      description:
        "Risk intelligence engine.",
      href: "/dashboard/admin/ai-score",
      icon: Bot,
      accent: "pink",
      number: "06",
    },
    {
      title: "Worker Management",
      description:
        "MCD worker portal.",
      href: "/dashboard/admin/worker",
      icon: Bot,
      accent: "pink",
      number: "06",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {modules.map((module, index) => {
        const Icon = module.icon;

        return (
          <Link
            key={module.title}
            href={module.href}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              whileHover={{
                y: -7,
                scale: 1.015,
              }}
              className="group relative min-h-[175px] overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl"
            >
              <span className="absolute right-4 top-4 font-mono text-[9px] text-slate-800">
                {module.number}
              </span>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04]">
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>

              <h3 className="mt-7 text-sm font-black">
                {module.title}
              </h3>

              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                {module.description}
              </p>

              <div className="absolute bottom-5 right-5 flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-slate-700 transition group-hover:border-cyan-400/20 group-hover:text-cyan-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

/* =========================================================
   COMPLAINT PREVIEW
========================================================= */

function ComplaintPreview({
  complaints,
  onOpen,
}: {
  complaints: Complaint[];
  onOpen: (complaint: Complaint) => void;
}) {
  if (!complaints.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/[0.07] py-16 text-center text-xs text-slate-700">
        No complaints found.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {complaints.map((complaint, index) => (
        <motion.button
          key={complaint.id}
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: index * 0.05,
          }}
          onClick={() => onOpen(complaint)}
          className="group text-left"
        >
          <div className="h-full rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.025]">

            <div className="flex items-start justify-between gap-3">

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,.7)]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                  {complaint.category}
                </span>
              </div>

              <PriorityBadge
                priority={complaint.priority}
              />
            </div>

            <h3 className="mt-5 line-clamp-2 text-base font-black">
              {complaint.title}
            </h3>

            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
              {complaint.description ||
                "No description available."}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4">

              <div className="flex items-center gap-2 text-[9px] text-slate-600">
                <MapPinned className="h-3 w-3" />

                {complaint.ward}
              </div>

              <div className="flex items-center gap-1 text-[9px] font-bold text-cyan-300 opacity-60 transition group-hover:opacity-100">
                Inspect
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* =========================================================
   OPERATIONS
========================================================= */

function OperationsPanel({
  complaints,
  workers,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  wardFilter,
  setWardFilter,
  priorityFilter,
  setPriorityFilter,
  categories,
  wards,
  selectedWorkers,
  setSelectedWorkers,
  assigning,
  assignWorker,
  onOpen,
}: {
  complaints: Complaint[];
  workers: Worker[];
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  wardFilter: string;
  setWardFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  categories: string[];
  wards: string[];
  selectedWorkers: Record<string, string>;
  setSelectedWorkers: React.Dispatch<
    React.SetStateAction<
      Record<string, string>
    >
  >;
  assigning: string | null;
  assignWorker: (id: string) => void;
  onOpen: (complaint: Complaint) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-white/[0.07] bg-white/[0.025] backdrop-blur-2xl">

      <div className="border-b border-white/[0.06] p-6 md:p-7">

        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">

          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-300" />

              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300">
                Live operations
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-black">
              Complaint command desk
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Inspect, filter and assign municipal
              response teams.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-xs text-slate-500">
            {complaints.length} incidents
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">

          <div className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.07] bg-[#07101a] px-3">
            <Search className="h-3.5 w-3.5 text-slate-600" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search incidents..."
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-700"
            />
          </div>

          <Filter
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              ["", "All Status"],
              ["Pending", "Pending"],
              ["Assigned", "Assigned"],
              ["IN_PROGRESS", "In Progress"],
              ["RESOLVED", "Resolved"],
            ]}
          />

          <Filter
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              ["", "All Categories"],
              ...categories.map((x) => [
                x,
                x,
              ]),
            ]}
          />

          <Filter
            value={wardFilter}
            onChange={setWardFilter}
            options={[
              ["", "All Wards"],
              ...wards.map((x) => [
                x,
                x,
              ]),
            ]}
          />

          <Filter
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              ["", "All Priority"],
              ["High", "High"],
              ["Medium", "Medium"],
              ["Low", "Low"],
            ]}
          />
        </div>
      </div>

      <div className="grid gap-3 p-4 md:p-5">
        {complaints.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-700">
            No incidents match current filters.
          </div>
        ) : (
          complaints.map((complaint, index) => (
            <motion.div
              key={complaint.id}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.025,
              }}
              className="group rounded-[22px] border border-white/[0.06] bg-black/15 p-4 transition hover:border-white/[0.1] hover:bg-white/[0.025]"
            >
              <div className="grid gap-5 xl:grid-cols-[1fr_180px_180px_270px] xl:items-center">

                <button
                  onClick={() =>
                    onOpen(complaint)
                  }
                  className="text-left"
                >
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={
                        complaint.status
                      }
                    />

                    <PriorityBadge
                      priority={
                        complaint.priority
                      }
                    />
                  </div>

                  <h3 className="mt-3 font-black text-white">
                    {complaint.title}
                  </h3>

                  <p className="mt-1 line-clamp-1 text-xs text-slate-600">
                    {complaint.description ||
                      "No description"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3 text-[9px] text-slate-700">
                    <span>
                      {complaint.category}
                    </span>

                    <span>•</span>

                    <span>
                      {complaint.ward}
                    </span>

                    <span>•</span>

                    <span>
                      {new Date(
                        complaint.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </button>

                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-700">
                    Citizen
                  </p>

                  <p className="mt-2 text-xs font-bold text-slate-300">
                    {complaint.user?.name ||
                      "Unknown"}
                  </p>

                  <p className="mt-1 truncate text-[9px] text-slate-700">
                    {complaint.user?.email ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-700">
                    Ward
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <MapPinned className="h-3 w-3 text-cyan-300" />
                    {complaint.ward}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[8px] font-black uppercase tracking-[0.15em] text-slate-700">
                    Workforce
                  </p>

                  <select
                    value={
                      selectedWorkers[
                      complaint.id
                      ] ||
                      complaint.assignedWorker?.id ||
                      ""
                    }
                    onChange={(e) =>
                      setSelectedWorkers(
                        (current) => ({
                          ...current,
                          [complaint.id]:
                            e.target.value,
                        })
                      )
                    }
                    className="w-full rounded-xl border border-white/[0.07] bg-[#07101b] px-3 py-2.5 text-[10px] text-slate-300 outline-none focus:border-cyan-400/30"
                  >
                    <option value="">
                      Select worker
                    </option>

                    {workers.map((worker) => (
                      <option
                        key={worker.id}
                        value={worker.id}
                      >
                        {worker.name}
                        {worker.ward
                          ? ` • ${worker.ward}`
                          : ""}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      assignWorker(
                        complaint.id
                      )
                    }
                    disabled={
                      assigning === complaint.id
                    }
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-2.5 text-[10px] font-black text-[#021017] hover:bg-cyan-300 disabled:opacity-40"
                  >
                    {assigning === complaint.id
                      ? "Updating..."
                      : complaint.assignedWorker
                        ? "Reassign"
                        : "Assign"}

                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}

/* =========================================================
   FILTER
========================================================= */

function Filter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-11 w-full appearance-none rounded-xl border border-white/[0.07] bg-[#07101a] px-3 pr-8 text-[10px] text-slate-400 outline-none focus:border-cyan-400/30"
      >
        {options.map(([value, label]) => (
          <option
            key={value}
            value={value}
          >
            {label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-700" />
    </div>
  );
}

/* =========================================================
   INTELLIGENCE
========================================================= */

function IntelligencePanel({
  analytics,
}: {
  analytics: Analytics | null;
}) {
  if (!analytics) {
    return (
      <div className="rounded-[30px] border border-white/[0.07] bg-white/[0.025] p-16 text-center text-xs text-slate-700">
        Intelligence data unavailable.
      </div>
    );
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Intelligence layer"
        title="Civic analytics"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <AnalyticsCard
          title="Complaint categories"
          icon={Layers3}
        >
          {analytics.categories.map(
            (item) => (
              <AnalyticsBar
                key={item.name}
                label={item.name}
                value={item.count}
                max={Math.max(
                  ...analytics.categories.map(
                    (x) => x.count
                  ),
                  1
                )}
              />
            )
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Status distribution"
          icon={Activity}
        >
          {analytics.statuses.map(
            (item) => (
              <AnalyticsBar
                key={item.name}
                label={item.name}
                value={item.count}
                max={Math.max(
                  ...analytics.statuses.map(
                    (x) => x.count
                  ),
                  1
                )}
              />
            )
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Priority distribution"
          icon={AlertTriangle}
        >
          {analytics.priorities.map(
            (item) => (
              <AnalyticsBar
                key={item.name}
                label={item.name}
                value={item.count}
                max={Math.max(
                  ...analytics.priorities.map(
                    (x) => x.count
                  ),
                  1
                )}
              />
            )
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Highest complaint wards"
          icon={MapPinned}
        >
          {analytics.wards
            .slice(0, 10)
            .map((item) => (
              <AnalyticsBar
                key={item.ward}
                label={item.ward}
                value={item.count}
                max={Math.max(
                  ...analytics.wards.map(
                    (x) => x.count
                  ),
                  1
                )}
              />
            ))}
        </AnalyticsCard>
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function AnalyticsCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl"
    >
      <div className="mb-7 flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/[0.06]">
          <Icon className="h-4 w-4 text-cyan-300" />
        </div>

        <h3 className="font-black">
          {title}
        </h3>
      </div>

      <div className="space-y-5">
        {children}
      </div>
    </motion.div>
  );
}

function AnalyticsBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage = Math.max(
    5,
    Math.round((value / max) * 100)
  );

  return (
    <div>
      <div className="mb-2 flex justify-between gap-4">
        <span className="truncate text-xs text-slate-500">
          {label}
        </span>

        <span className="text-xs font-black text-white">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${percentage}%`,
          }}
          transition={{
            duration: 0.9,
          }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
        />
      </div>
    </div>
  );
}

/* =========================================================
   WORKFORCE
========================================================= */

function WorkforcePanel({
  workers,
}: {
  workers: Worker[];
}) {
  const active = workers.filter(
    (worker) => worker.isActive
  ).length;

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <SectionHeading
          eyebrow="Workforce intelligence"
          title="Municipal worker directory"
        />

        <div className="rounded-full border border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] text-emerald-300">
          {active} active workers
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {workers.map((worker, index) => (
          <motion.div
            key={worker.id}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.04,
            }}
            whileHover={{
              y: -5,
            }}
            className="rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-5"
          >
            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/10 to-blue-500/5">
                  <UserRound className="h-5 w-5 text-cyan-300" />
                </div>

                <div>
                  <h3 className="text-sm font-black">
                    {worker.name}
                  </h3>

                  <p className="mt-1 max-w-[180px] truncate text-[9px] text-slate-700">
                    {worker.email}
                  </p>
                </div>
              </div>

              <span
                className={`h-2 w-2 rounded-full ${worker.isActive
                    ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]"
                    : "bg-slate-700"
                  }`}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">

              <div className="rounded-xl border border-white/[0.05] bg-black/15 p-3">
                <p className="text-[8px] uppercase tracking-[0.15em] text-slate-700">
                  Ward
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  {worker.ward ||
                    "Not assigned"}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.05] bg-black/15 p-3">
                <p className="text-[8px] uppercase tracking-[0.15em] text-slate-700">
                  Assigned
                </p>

                <p className="mt-1 text-xs font-black text-cyan-300">
                  {
                    worker._count
                      .assignedComplaints
                  }
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[9px] text-slate-700">
              <span>
                {worker.phone || "No phone"}
              </span>

              <span>
                {worker.isActive
                  ? "ACTIVE"
                  : "OFFLINE"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   COMMAND GALLERY
========================================================= */

function CommandGallery() {
  const cards = [
    {
      title: "Live Delhi Map",
      subtitle: "GIS intelligence",
      icon: Map,
      href: "/dashboard/admin/wards",
      size: "large",
    },
    {
      title: "AI Risk Engine",
      subtitle: "Predictive intelligence",
      icon: BrainCircuit,
      href: "/dashboard/admin/ai-score",
      size: "normal",
    },
    {
      title: "Reports",
      subtitle: "Official documentation",
      icon: FileBarChart2,
      href: "/dashboard/admin/reports",
      size: "normal",
    },
    {
      title: "Budget",
      subtitle: "Financial intelligence",
      icon: WalletCards,
      href: "/dashboard/admin/budget",
      size: "normal",
    },
    {
      title: "Fleet Control",
      subtitle: "Vehicle operations",
      icon: Zap,
      href: "/dashboard/admin/vehicles",
      size: "normal",
    },
    {
      title: "Analytics",
      subtitle: "City intelligence",
      icon: BarChart3,
      href: "/dashboard/admin/analytics",
      size: "normal",
    },
  ];

  return (
    <div>
      <SectionHeading
        eyebrow="Command gallery"
        title="Administration workspace"
      />

      <div className="grid auto-rows-[180px] gap-4 md:grid-cols-2 xl:grid-cols-3">

        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className={
                card.size === "large"
                  ? "md:row-span-2"
                  : ""
              }
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: index * 0.06,
                }}
                whileHover={{
                  scale: 1.015,
                }}
                className="group relative h-full overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-6"
              >
                <div className="absolute right-[-50px] top-[-50px] h-40 w-40 rounded-full bg-cyan-400/[0.06] blur-[60px] transition group-hover:bg-cyan-400/[0.12]" />

                <div className="relative flex h-full flex-col">

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035]">
                      <Icon className="h-5 w-5 text-cyan-300" />
                    </div>

                    <ExternalLink className="h-4 w-4 text-slate-700 transition group-hover:text-cyan-300" />
                  </div>

                  <div className="mt-auto">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                      Workspace
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      {card.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-600">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL BOX
========================================================= */

function DetailBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
      <Icon className="h-4 w-4 text-cyan-300" />

      <p className="mt-3 text-[8px] uppercase tracking-[0.15em] text-slate-700">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-slate-300">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  let cls =
    "border-slate-400/10 bg-slate-400/[0.05] text-slate-400";

  if (normalized === "resolved") {
    cls =
      "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300";
  }

  if (
    normalized === "in_progress" ||
    normalized === "in progress"
  ) {
    cls =
      "border-blue-400/15 bg-blue-400/[0.07] text-blue-300";
  }

  if (normalized === "assigned") {
    cls =
      "border-violet-400/15 bg-violet-400/[0.07] text-violet-300";
  }

  if (normalized === "pending") {
    cls =
      "border-amber-400/15 bg-amber-400/[0.07] text-amber-300";
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wide ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {status}
    </span>
  );
}

/* =========================================================
   PRIORITY
========================================================= */

function PriorityBadge({
  priority,
}: {
  priority: string;
}) {
  const normalized =
    priority.toLowerCase();

  let cls =
    "border-slate-400/10 bg-slate-400/[0.05] text-slate-400";

  if (normalized === "high") {
    cls =
      "border-red-400/15 bg-red-400/[0.07] text-red-300";
  }

  if (normalized === "medium") {
    cls =
      "border-amber-400/15 bg-amber-400/[0.07] text-amber-300";
  }

  if (normalized === "low") {
    cls =
      "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wide ${cls}`}
    >
      {priority}
    </span>
  );
}

/* =========================================================
   ANALYTICS END
========================================================= */

/* =========================================================
   EXPORT
========================================================= */

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AdminDashboard />
    </AuthGuard>
  );
}