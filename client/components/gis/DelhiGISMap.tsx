"use client";

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  CircleMarker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import WardLayer from "@/components/gis/WardLayer";
import WardIntelligencePanel from "@/components/gis/WardIntelligencePanel";

import { useEffect, useState } from "react";

interface WardMetric {
  ward: string;
  complaintCount: number;
  highPriority: number;
  resolved: number;
  activeWorkers: number;
}

interface ComplaintMarker {
  id: string;
  title: string;
  category: string;
  priority: string;
  ward: string;
  latitude: number;
  longitude: number;
}

interface GISSummary {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  highPriorityComplaints: number;
  activeWorkers: number;
  activeVehicles: number;
  resolutionRate: number;
}

export default function DelhiGISMap() {
  const [wards, setWards] =
    useState<WardMetric[]>([]);

  const [selectedWard, setSelectedWard] =
    useState<WardMetric | null>(null);

  const [summary, setSummary] =
    useState<GISSummary | null>(null);

  const [complaints, setComplaints] =
    useState<ComplaintMarker[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadGISData = async () => {
      try {
        setLoading(true);

        const [
          wardsResponse,
          summaryResponse,
        ] = await Promise.all([
          fetch("/api/gis/wards"),
          fetch("/api/gis/summary"),
        ]);

        const wardsData =
          await wardsResponse.json();

        const summaryData =
          await summaryResponse.json();

        if (wardsData.success) {
          setWards(
            wardsData.wards
          );
        }

        if (summaryData.success) {
          setSummary(
            summaryData.summary
          );
        }

        /*
         * Complaint markers are loaded
         * separately so the map remains
         * usable even when there are no
         * geolocated complaints.
         */
        try {
          const complaintsResponse =
            await fetch(
              "/api/admin/complaints"
            );

          const complaintsData =
            await complaintsResponse.json();

          if (
            complaintsData.success &&
            Array.isArray(
              complaintsData.complaints
            )
          ) {
            const markers =
              complaintsData.complaints
                .filter(
                  (complaint: {
                    latitude?: number | null;
                    longitude?: number | null;
                  }) =>
                    typeof complaint.latitude ===
                      "number" &&
                    typeof complaint.longitude ===
                      "number"
                )
                .map(
                  (complaint: {
                    id: string;
                    title: string;
                    category: string;
                    priority: string;
                    ward: string;
                    latitude: number;
                    longitude: number;
                  }) => ({
                    id: complaint.id,
                    title: complaint.title,
                    category:
                      complaint.category,
                    priority:
                      complaint.priority,
                    ward: complaint.ward,
                    latitude:
                      complaint.latitude,
                    longitude:
                      complaint.longitude,
                  })
                );

            setComplaints(markers);
          }
        } catch (error) {
          console.error(
            "GIS_COMPLAINT_MARKERS_ERROR:",
            error
          );
        }
      } catch (error) {
        console.error(
          "GIS_DATA_ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadGISData();
  }, []);

  return (
    <div className="relative h-[calc(100vh-120px)] min-h-[650px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">

      {/* TOP COMMAND BAR */}

      <div className="absolute left-5 top-5 z-[1000] max-w-[calc(100%-40px)]">

        <div className="rounded-2xl border border-white/10 bg-slate-950/90 px-5 py-4 shadow-2xl backdrop-blur-xl">

          <div className="flex flex-wrap items-center gap-6">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">
                SmartDELHI GIS
              </p>

              <h1 className="mt-1 text-xl font-bold text-white">
                Delhi Civic Command Center
              </h1>
            </div>

            <div className="hidden h-10 w-px bg-slate-800 md:block" />

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Complaints
              </p>

              <p className="text-lg font-bold text-white">
                {summary?.totalComplaints ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                High Priority
              </p>

              <p className="text-lg font-bold text-red-400">
                {summary?.highPriorityComplaints ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Workers
              </p>

              <p className="text-lg font-bold text-green-400">
                {summary?.activeWorkers ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Vehicles
              </p>

              <p className="text-lg font-bold text-blue-400">
                {summary?.activeVehicles ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Resolution
              </p>

              <p className="text-lg font-bold text-emerald-400">
                {summary?.resolutionRate ?? 0}%
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* MAP */}

      <MapContainer
        center={[28.6139, 77.209]}
        zoom={11}
        minZoom={9}
        maxZoom={18}
        zoomControl={false}
        className="h-full w-full"
      >

        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />

        {/* WARD HEATMAP */}

        <WardLayer
          metrics={wards}
          onSelect={(ward) =>
            setSelectedWard(ward)
          }
        />

        {/* COMPLAINT INTELLIGENCE MARKERS */}

        {complaints.map(
          (complaint) => {
            const isCritical =
              complaint.priority
                ?.toLowerCase() ===
                "critical" ||
              complaint.priority
                ?.toLowerCase() ===
                "high";

            return (
              <CircleMarker
                key={complaint.id}
                center={[
                  complaint.latitude,
                  complaint.longitude,
                ]}
                radius={
                  isCritical
                    ? 9
                    : 6
                }
                pathOptions={{
                  color: isCritical
                    ? "#ef4444"
                    : "#38bdf8",

                  fillColor:
                    isCritical
                      ? "#ef4444"
                      : "#38bdf8",

                  fillOpacity: 0.85,

                  weight: 2,
                }}
              >
                <Popup>
                  <div className="min-w-[190px]">

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      {complaint.category}
                    </p>

                    <h3 className="mt-1 font-bold">
                      {complaint.title}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <strong>Ward:</strong>{" "}
                        {complaint.ward}
                      </p>

                      <p>
                        <strong>Priority:</strong>{" "}
                        {complaint.priority}
                      </p>
                    </div>

                  </div>
                </Popup>
              </CircleMarker>
            );
          }
        )}

      </MapContainer>

      {/* LEGEND */}

      <div className="absolute bottom-5 left-5 z-[1000] rounded-2xl border border-white/10 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl">

        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Intelligence Layers
        </p>

        <div className="space-y-2 text-xs">

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-slate-300">
              High / Critical complaint
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-400" />
            <span className="text-slate-300">
              Standard complaint
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-blue-600/70" />
            <span className="text-slate-300">
              Ward complaint intensity
            </span>
          </div>

        </div>
      </div>

      {/* WARD PANEL */}

      <WardIntelligencePanel
        ward={selectedWard}
        onClose={() =>
          setSelectedWard(null)
        }
      />

      {/* LOADING */}

      {loading && (
        <div className="absolute bottom-5 right-5 z-[1000] rounded-xl border border-blue-500/20 bg-slate-950/90 px-4 py-3 text-xs text-blue-300 shadow-xl backdrop-blur-xl">
          Loading live GIS intelligence...
        </div>
      )}

    </div>
  );
}