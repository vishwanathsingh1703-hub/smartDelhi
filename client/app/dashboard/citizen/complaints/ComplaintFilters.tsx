"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  X,
} from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  ward: string | null;
  createdAt: Date | string;
}

interface ComplaintFiltersProps {
  complaints: Complaint[];
}

const categories = [
  "All",
  "Road Damage",
  "Garbage",
  "Street Light",
  "Water Supply",
  "Sewerage",
  "Drainage",
  "Traffic",
  "Other",
];

const statuses = [
  "All",
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

export default function ComplaintFilters({
  complaints,
}: ComplaintFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        complaint.title
          .toLowerCase()
          .includes(searchText) ||
        (complaint.description || "")
          .toLowerCase()
          .includes(searchText) ||
        complaint.category
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        complaint.category === category;

      const matchesStatus =
        status === "All" ||
        complaint.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [complaints, search, category, status]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setStatus("All");
  };

  const hasFilters =
    search !== "" ||
    category !== "All" ||
    status !== "All";

  return (
    <div className="space-y-4">

      {/* FILTER BAR */}
      <div className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4">

        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-cyan-400" />

          <h2 className="text-sm font-bold text-white">
            Filter Complaints
          </h2>

          <span className="ml-auto text-[11px] text-gray-500">
            Showing{" "}
            <span className="text-cyan-400 font-bold">
              {filteredComplaints.length}
            </span>{" "}
            of {complaints.length}
          </span>
        </div>

        {/* SEARCH */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search complaints..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* CATEGORY */}
        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">
            Category
          </label>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setCategory(item)
                }
                className={`px-3 py-2 rounded-xl text-[11px] font-semibold border transition ${
                  category === item
                    ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-300"
                    : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">
            Status
          </label>

          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setStatus(item)
                }
                className={`px-3 py-2 rounded-xl text-[11px] font-semibold border transition ${
                  status === item
                    ? "bg-blue-500/15 border-blue-400/40 text-blue-300"
                    : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item === "All"
                  ? "All"
                  : item.replace(
                      "_",
                      " "
                    )}
              </button>
            ))}
          </div>
        </div>

        {/* CLEAR */}
        {hasFilters && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 text-[11px] font-semibold transition"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* FILTERED COMPLAINTS */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-gray-950/80 border border-white/10 rounded-2xl p-8 text-center">
          <Search className="w-8 h-8 mx-auto text-gray-600 mb-3" />

          <h3 className="text-sm font-bold text-white">
            No complaints found
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Try changing your search or filters.
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-xs text-cyan-400 hover:text-cyan-300"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map(
            (complaint) => (
              <div
                key={complaint.id}
                className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/10 hover:border-cyan-500/30 rounded-2xl p-5 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* LEFT */}
                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="text-base sm:text-lg font-bold text-white">
                        {complaint.title}
                      </h2>

                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                        {complaint.category}
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                          complaint.status ===
                          "RESOLVED"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : complaint.status ===
                              "IN_PROGRESS"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            : complaint.status ===
                              "REJECTED"
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {complaint.status.replace(
                          "_",
                          " "
                        )}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                      {complaint.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-gray-500">

                      <span>
                        Ward:{" "}
                        <strong className="text-gray-300">
                          {complaint.ward ||
                            "Unknown"}
                        </strong>
                      </span>

                      <span>
                        Priority:{" "}
                        <strong className="text-gray-300">
                          {complaint.priority}
                        </strong>
                      </span>

                      <span>
                        {new Date(
                          complaint.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>

                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex-shrink-0">

                    <a
                      href={`/dashboard/citizen/complaints/${complaint.id}`}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-cyan-500/20 text-cyan-400 hover:text-white hover:border-cyan-400/40 hover:bg-cyan-500/10 text-xs font-semibold transition"
                    >
                      View Details
                    </a>

                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}