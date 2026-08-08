"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Link from "next/link";


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

function AdminDashboard() {
  const router = useRouter();

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [selectedWorkers, setSelectedWorkers] = useState<
    Record<string, string>
  >({});

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

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      if (categoryFilter) {
        params.set("category", categoryFilter);
      }

      if (wardFilter) {
        params.set("ward", wardFilter);
      }

      if (priorityFilter) {
        params.set("priority", priorityFilter);
      }

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
  }, [statusFilter, categoryFilter, wardFilter, priorityFilter]);

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

      alert("Worker assigned successfully.");
    } catch (error) {
      console.error("ASSIGN_WORKER_ERROR:", error);
      alert("Something went wrong while assigning worker.");
    } finally {
      setAssigning(null);
    }
  };

  const categories = useMemo(() => {
    return Array.from(
      new Set(complaints.map((complaint) => complaint.category))
    );
  }, [complaints]);

  const wards = useMemo(() => {
    return Array.from(
      new Set(complaints.map((complaint) => complaint.ward))
    );
  }, [complaints]);

  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";

      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";

      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";

      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-500/20 text-green-400";

      case "in_progress":
      case "in progress":
        return "bg-blue-500/20 text-blue-400";

      case "assigned":
        return "bg-purple-500/20 text-purple-400";

      case "pending":
        return "bg-yellow-500/20 text-yellow-400";

      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-400">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
                SmartDELHI Administration
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-2">
                Admin Dashboard
              </h1>

              <p className="text-gray-400 mt-2">
                Monitor complaints, workers and civic operations.
              </p>
            </div>

            {/*  */}
            <div className="flex justify-end gap-4 mb-6">
              {/* Refresh Data Button (maan lijiye yeh hai) */}
              <button
                onClick={fetchDashboardData}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium"
              >
                Refresh Data
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition font-medium text-white"
              >
                Logout
              </button>
            </div>

          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">

          <StatCard
            title="Total"
            value={stats?.complaints.total ?? 0}
          />

          <StatCard
            title="Pending"
            value={stats?.complaints.pending ?? 0}
          />

          <StatCard
            title="Assigned"
            value={stats?.complaints.assigned ?? 0}
          />

          <StatCard
            title="In Progress"
            value={stats?.complaints.inProgress ?? 0}
          />

          <StatCard
            title="Resolved"
            value={stats?.complaints.resolved ?? 0}
          />

          <StatCard
            title="Verified"
            value={stats?.complaints.citizenVerified ?? 0}
          />
        </div>

        {/* USER STATS */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <a
            href="/dashboard/admin/vehicles"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-semibold">
              Vehicles
            </h2>

            <p className="text-gray-400 mt-2">
              Manage civic service vehicles
            </p>
          </a>
          <Link
  href="/dashboard/admin/wards"
  className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 hover:bg-slate-800/60 transition"
>
  <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
    Administration
  </p>

  <h2 className="text-xl font-bold mt-2">
    Ward Management
  </h2>

  <div className="mt-4 text-blue-400 text-sm font-semibold">
    Open Ward Management →
  </div>
</Link>
<Link
  href="/dashboard/admin/budget"
  className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-green-500 hover:bg-slate-800/60 transition"
>
  <p className="text-green-400 text-sm font-semibold uppercase tracking-wider">
    Financial Intelligence
  </p>

  <h2 className="text-xl font-bold mt-2">
    Budget Intelligence
  </h2>


  <div className="mt-4 text-green-400 text-sm font-semibold">
    Open Budget Intelligence →
  </div>
</Link>
<Link
  href="/dashboard/admin/analytics"
  className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500 hover:bg-slate-800/60 transition"
>
  <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider">
    Intelligence
  </p>

  <h2 className="text-xl font-bold mt-2">
    Analytics Dashboard
  </h2>


  <div className="mt-4 text-purple-400 text-sm font-semibold">
    Open Analytics →
  </div>
</Link>
<Link
  href="/dashboard/admin/reports"
  className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500 hover:bg-slate-800/60 transition"
>
  <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
    Administration
  </p>

  <h2 className="text-xl font-bold mt-2">
    Reports Center
  </h2>

  

  <div className="mt-4 text-cyan-400 text-sm font-semibold">
    Open Reports →
  </div>
</Link>
<Link
  href="/dashboard/admin/ai-score"
  className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500 hover:bg-slate-800/60 transition"
>
  <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
    AI Intelligence
  </p>

  <h2 className="text-xl font-bold mt-2">
    AI Score Center
  </h2>


  <div className="mt-4 text-cyan-400 text-sm font-semibold">
    Open AI Score →
  </div>
</Link>
          <InfoCard
            title="Citizens"
            value={stats?.users.citizens ?? 0}
          />

          <InfoCard
            title="Total Workers"
            value={stats?.users.workers ?? 0}
          />

          <InfoCard
            title="Active Workers"
            value={stats?.users.activeWorkers ?? 0}
          />

        </div>

        {/* FILTERS */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 mb-8">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold">
                Complaint Management
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Filter and assign complaints to workers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
            >
              <option value="">All Wards</option>

              {wards.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
            >
              <option value="">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

          </div>
        </div>

        {/* COMPLAINT TABLE */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden mb-8">

          <div className="p-5 border-b border-slate-800">
            <h2 className="text-xl font-semibold">
              Complaints ({complaints.length})
            </h2>
          </div>

          {complaints.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No complaints found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-950/70 text-gray-400">
                  <tr>
                    <th className="text-left px-5 py-4">
                      Complaint
                    </th>

                    <th className="text-left px-5 py-4">
                      Citizen
                    </th>

                    <th className="text-left px-5 py-4">
                      Ward
                    </th>

                    <th className="text-left px-5 py-4">
                      Status
                    </th>

                    <th className="text-left px-5 py-4">
                      Priority
                    </th>

                    <th className="text-left px-5 py-4 min-w-[260px]">
                      Worker
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                    >

                      {/* COMPLAINT */}
                      <td className="px-5 py-5 align-top">
                        <div className="font-semibold">
                          {complaint.title}
                        </div>

                        <div className="text-gray-500 mt-1">
                          {complaint.category}
                        </div>

                        <div className="text-xs text-gray-600 mt-2">
                          {new Date(
                            complaint.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </td>

                      {/* CITIZEN */}
                      <td className="px-5 py-5 align-top">
                        <div>
                          {complaint.user?.name || "Unknown"}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {complaint.user?.email || "-"}
                        </div>
                      </td>

                      {/* WARD */}
                      <td className="px-5 py-5 align-top">
                        {complaint.ward}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-5 align-top">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>
                      </td>

                      {/* PRIORITY */}
                      <td className="px-5 py-5 align-top">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${getPriorityClass(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority}
                        </span>
                      </td>

                      {/* WORKER */}
                      <td className="px-5 py-5 align-top">

                        {complaint.assignedWorker ? (
                          <div className="space-y-2">
                            <div className="font-medium text-green-400">
                              {complaint.assignedWorker.name}
                            </div>

                            <div className="text-xs text-gray-500">
                              {complaint.assignedWorker.ward || "No ward"}
                            </div>

                            <select
                              value={
                                selectedWorkers[complaint.id] ||
                                complaint.assignedWorker.id
                              }
                              onChange={(e) =>
                                setSelectedWorkers((current) => ({
                                  ...current,
                                  [complaint.id]: e.target.value,
                                }))
                              }
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                            >
                              {workers.map((worker) => (
                                <option
                                  key={worker.id}
                                  value={worker.id}
                                >
                                  {worker.name}
                                  {worker.ward
                                    ? ` - ${worker.ward}`
                                    : ""}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() =>
                                assignWorker(complaint.id)
                              }
                              disabled={
                                assigning === complaint.id
                              }
                              className="w-full px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition"
                            >
                              {assigning === complaint.id
                                ? "Updating..."
                                : "Reassign Worker"}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">

                            <select
                              value={
                                selectedWorkers[complaint.id] || ""
                              }
                              onChange={(e) =>
                                setSelectedWorkers((current) => ({
                                  ...current,
                                  [complaint.id]: e.target.value,
                                }))
                              }
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                            >
                              <option value="">
                                Select Worker
                              </option>

                              {workers.map((worker) => (
                                <option
                                  key={worker.id}
                                  value={worker.id}
                                >
                                  {worker.name}
                                  {worker.ward
                                    ? ` - ${worker.ward}`
                                    : ""}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() =>
                                assignWorker(complaint.id)
                              }
                              disabled={
                                assigning === complaint.id
                              }
                              className="w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition"
                            >
                              {assigning === complaint.id
                                ? "Assigning..."
                                : "Assign Worker"}
                            </button>

                          </div>
                        )}

                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>

        {/* ANALYTICS */}
        {analytics && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">

            {/* CATEGORY */}
            <AnalyticsCard title="Complaints by Category">
              {analytics.categories.length === 0 ? (
                <EmptyAnalytics />
              ) : (
                analytics.categories.map((item) => (
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
                ))
              )}
            </AnalyticsCard>

            {/* STATUS */}
            <AnalyticsCard title="Complaints by Status">
              {analytics.statuses.length === 0 ? (
                <EmptyAnalytics />
              ) : (
                analytics.statuses.map((item) => (
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
                ))
              )}
            </AnalyticsCard>

            {/* PRIORITY */}
            <AnalyticsCard title="Priority Distribution">
              {analytics.priorities.length === 0 ? (
                <EmptyAnalytics />
              ) : (
                analytics.priorities.map((item) => (
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
                ))
              )}
            </AnalyticsCard>

            {/* WARDS */}
            <AnalyticsCard title="Top Complaint Wards">
              {analytics.wards.length === 0 ? (
                <EmptyAnalytics />
              ) : (
                analytics.wards.slice(0, 10).map((item) => (
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
                ))
              )}
            </AnalyticsCard>

          </div>
        )}

        {/* WORKERS */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-slate-800">
            <h2 className="text-xl font-semibold">
              Active Workers
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Current worker workload.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-950/70 text-gray-400">
                <tr>
                  <th className="text-left px-5 py-4">
                    Worker
                  </th>

                  <th className="text-left px-5 py-4">
                    Ward
                  </th>

                  <th className="text-left px-5 py-4">
                    Contact
                  </th>

                  <th className="text-left px-5 py-4">
                    Assigned Complaints
                  </th>
                </tr>
              </thead>

              <tbody>

                {workers.map((worker) => (
                  <tr
                    key={worker.id}
                    className="border-t border-slate-800"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium">
                        {worker.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        {worker.email}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {worker.ward || "Not assigned"}
                    </td>

                    <td className="px-5 py-4">
                      {worker.phone || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        {worker._count.assignedComplaints}
                      </span>
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
      <p className="text-gray-400">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

function AnalyticsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-5">
        {title}
      </h3>

      <div className="space-y-4">
        {children}
      </div>
    </div>
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
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">
          {label}
        </span>

        <span className="text-gray-400">
          {value}
        </span>
      </div>

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function EmptyAnalytics() {
  return (
    <p className="text-gray-500">
      No analytics data available.
    </p>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AdminDashboard />
    </AuthGuard>
  );
}