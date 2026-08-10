"use client";

import React from "react";

interface Complaint {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  status: string;
  priority: string;
}

interface ComplaintListProps {
  complaints: Complaint[];
}

export default function ComplaintList({
  complaints,
}: ComplaintListProps) {
  if (complaints.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gray-950/80 p-6 text-center text-sm text-gray-400">
        No complaints found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div
          key={complaint.id}
          className="rounded-2xl border border-white/10 bg-gray-950/80 p-5"
        >
          <h3 className="font-semibold text-white">
            {complaint.title}
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            {complaint.description || "No description provided."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg border border-cyan-500/20 px-2 py-1 text-cyan-400">
              {complaint.category}
            </span>

            <span className="rounded-lg border border-white/10 px-2 py-1 text-gray-300">
              {complaint.status}
            </span>

            <span className="rounded-lg border border-white/10 px-2 py-1 text-gray-300">
              {complaint.priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}