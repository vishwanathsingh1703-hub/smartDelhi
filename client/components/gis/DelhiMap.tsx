"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";

import { useEffect } from "react";

import "leaflet/dist/leaflet.css";

export interface GISComplaint {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  ward: string;
  status: string;
  priority: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

interface DelhiMapProps {
  complaints: GISComplaint[];
}

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

function getCategoryColor(category: string) {
  const value = category.toLowerCase();

  if (value.includes("garbage")) {
    return "#22c55e";
  }

  if (value.includes("road")) {
    return "#f59e0b";
  }

  if (value.includes("water")) {
    return "#38bdf8";
  }

  if (value.includes("sewage")) {
    return "#a78bfa";
  }

  if (value.includes("electric")) {
    return "#facc15";
  }

  if (value.includes("clean")) {
    return "#34d399";
  }

  return "#60a5fa";
}

function getPriorityRadius(priority: string) {
  const value = priority.toLowerCase();

  if (value === "critical") {
    return 12;
  }

  if (value === "high") {
    return 10;
  }

  if (value === "medium") {
    return 8;
  }

  return 6;
}

function getStatusOpacity(status: string) {
  const value = status.toLowerCase();

  if (
    value === "resolved" ||
    value === "completed"
  ) {
    return 0.55;
  }

  return 0.9;
}

export default function DelhiMap({
  complaints,
}: DelhiMapProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">

      <MapContainer
        center={[28.6139, 77.209]}
        zoom={11}
        minZoom={9}
        maxZoom={18}
        zoomControl={false}
        scrollWheelZoom={true}
        className="h-full w-full"
      >

        {/* REAL DELHI STREET MAP */}
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <ZoomControl position="bottomright" />

        <MapResizeHandler />

        {/* COMPLAINT GIS LAYERS */}
        {complaints.map((complaint) => {
          if (
            complaint.latitude === null ||
            complaint.longitude === null
          ) {
            return null;
          }

          const color = getCategoryColor(
            complaint.category
          );

          const radius = getPriorityRadius(
            complaint.priority
          );

          const opacity =
            getStatusOpacity(
              complaint.status
            );

          return (
            <CircleMarker
              key={complaint.id}
              center={[
                complaint.latitude,
                complaint.longitude,
              ]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: opacity,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[230px] text-slate-900">

                  <div className="mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      SmartDELHI Complaint
                    </p>

                    <h3 className="mt-1 text-base font-bold">
                      {complaint.title}
                    </h3>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Category:</strong>{" "}
                      {complaint.category}
                    </p>

                    <p>
                      <strong>Ward:</strong>{" "}
                      {complaint.ward}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {complaint.status}
                    </p>

                    <p>
                      <strong>Priority:</strong>{" "}
                      {complaint.priority}
                    </p>
                  </div>

                  {complaint.description && (
                    <p className="mt-3 border-t pt-3 text-xs text-slate-600">
                      {complaint.description}
                    </p>
                  )}

                  <p className="mt-3 text-[10px] text-slate-400">
                    {new Date(
                      complaint.createdAt
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      </MapContainer>

      {/* MAP STATUS */}
      <div className="pointer-events-none absolute left-4 top-4 z-[1000]">
        <div className="rounded-xl border border-white/20 bg-slate-950/90 px-4 py-3 shadow-2xl backdrop-blur-xl">

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />

            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Delhi Live GIS
            </span>
          </div>

          <p className="mt-1 text-[11px] text-slate-400">
            Real-time complaint intelligence
          </p>

        </div>
      </div>

      {/* LEGEND */}
      <div className="absolute bottom-5 left-5 z-[1000] rounded-xl border border-white/20 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl">

        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Complaint Categories
        </p>

        <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-xs text-slate-300">

          {[
            ["Garbage", "#22c55e"],
            ["Road", "#f59e0b"],
            ["Water", "#38bdf8"],
            ["Sewage", "#a78bfa"],
            ["Electricity", "#facc15"],
            ["Other", "#60a5fa"],
          ].map(([name, color]) => (
            <div
              key={name}
              className="flex items-center gap-2"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: color,
                }}
              />

              <span>{name}</span>
            </div>
          ))}

        </div>
      </div>

      {/* PIN COUNT */}
      <div className="absolute right-4 top-4 z-[1000]">
        <div className="rounded-xl border border-white/20 bg-slate-950/90 px-4 py-3 text-right shadow-2xl backdrop-blur-xl">

          <p className="text-2xl font-bold text-white">
            {complaints.length}
          </p>

          <p className="text-[10px] uppercase tracking-wider text-slate-400">
            Visible Pins
          </p>

        </div>
      </div>

    </div>
  );
}