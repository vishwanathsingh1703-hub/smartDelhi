"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  MapPin,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  description: string | null;
  category: string;
  ward: string;
  status: string;
  priority: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  workCompletedAt: string | null;
  user: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
}

export default function AssignedComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState<string | null>(
    null
  );

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/worker/complaints?assignedOnly=true",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to load complaints."
        );
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const acceptComplaint = async (id: string) => {
    try {
      setActionLoading(id);
      setError("");

      const response = await fetch(
        `/api/worker/complaints/${id}/accept`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to accept complaint."
        );
      }

      await fetchComplaints();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to accept complaint."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const completeComplaint = async (id: string) => {
    const confirmed = window.confirm(
      "Have you actually completed this civic work? This will notify the citizen for verification."
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      const response = await fetch(
        `/api/worker/complaints/${id}/complete`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to complete complaint."
        );
      }

      await fetchComplaints();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete complaint."
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-cyan-500/10 bg-gray-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold">
              SmartDELHI
            </h1>

            <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
              Worker Portal
            </p>
          </div>

          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <BriefcaseBusiness className="w-3.5 h-3.5" />
              Assigned Work
            </div>

            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold">
              Assigned Complaints
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Accept assigned jobs and mark completed work.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchComplaints}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-gray-950/80 p-10 text-center">
            <span className="inline-block w-6 h-6 rounded-full border-2 border-white/20 border-t-cyan-400 animate-spin" />

            <p className="mt-4 text-sm text-gray-500">
              Loading assigned complaints...
            </p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-gray-950/80 p-10 text-center">
            <BriefcaseBusiness className="w-12 h-12 text-gray-600 mx-auto" />

            <h3 className="mt-4 text-lg font-bold">
              No assigned complaints
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Admin assignments will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {complaints.map((complaint) => {
              const isAssigned =
                complaint.status === "Assigned" ||
                complaint.status === "PENDING";

              const isInProgress =
                complaint.status === "InProgress" ||
                complaint.status === "IN_PROGRESS";

              const isCompleted =
                complaint.workCompletedAt !== null;

              return (
                <div
                  key={complaint.id}
                  className="rounded-3xl border border-cyan-500/10 bg-gray-950/80 backdrop-blur-xl p-6 hover:border-cyan-500/30 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">
                          {complaint.title}
                        </h3>

                        <span className="px-2.5 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase">
                          {complaint.status.replace("_", " ")}
                        </span>

                        <span className="px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase">
                          {complaint.priority}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                        {complaint.description ||
                          "No description provided."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-gray-500">
                        <span>
                          Category:{" "}
                          <strong className="text-gray-300">
                            {complaint.category}
                          </strong>
                        </span>

                        <span>
                          Ward:{" "}
                          <strong className="text-gray-300">
                            {complaint.ward}
                          </strong>
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />

                          {complaint.latitude !== null &&
                          complaint.longitude !== null
                            ? `${complaint.latitude.toFixed(
                                5
                              )}, ${complaint.longitude.toFixed(5)}`
                            : "Location unavailable"}
                        </span>
                      </div>

                      {complaint.user && (
                        <div className="mt-4 rounded-xl bg-white/5 border border-white/5 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-600">
                            Citizen
                          </p>

                          <p className="mt-1 text-xs text-gray-300">
                            {complaint.user.name}
                          </p>

                          {complaint.user.phone && (
                            <p className="mt-1 text-[11px] text-gray-500">
                              {complaint.user.phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col gap-2 lg:w-44">
                      {isAssigned && (
                        <button
                          type="button"
                          onClick={() =>
                            acceptComplaint(complaint.id)
                          }
                          disabled={
                            actionLoading === complaint.id
                          }
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-xs font-bold transition disabled:opacity-50"
                        >
                          {actionLoading === complaint.id ? (
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          ) : (
                            <BriefcaseBusiness className="w-4 h-4" />
                          )}

                          Accept Job
                        </button>
                      )}

                      {isInProgress && !isCompleted && (
                        <button
                          type="button"
                          onClick={() =>
                            completeComplaint(complaint.id)
                          }
                          disabled={
                            actionLoading === complaint.id
                          }
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-xs font-bold transition disabled:opacity-50"
                        >
                          {actionLoading === complaint.id ? (
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}

                          Mark Complete
                        </button>
                      )}

                      {isCompleted && (
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          Work Completed
                        </div>
                      )}

                      {complaint.latitude !== null &&
                        complaint.longitude !== null && (
                          <a
                            href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition"
                          >
                            <MapPin className="w-4 h-4" />
                            Open Location
                          </a>
                        )}
                    </div>
                  </div>

                  {isCompleted && (
                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-cyan-400">
                      <Clock3 className="w-4 h-4" />
                      Citizen verification is now required.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}