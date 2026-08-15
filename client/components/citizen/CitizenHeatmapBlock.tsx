"use client";

import { useEffect, useRef, useState } from "react";
import {
  RefreshCw,
  Navigation,
  MapPin,
  AlertTriangle,
  Maximize2,
} from "lucide-react";



interface ComplaintLocation {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  ward: string;
  latitude: number;
  longitude: number;
}

const DEFAULT_CENTER = {
  lat: 28.6139,
  lng: 77.209,
};

export default function CitizenHeatmapBlock() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstanceRef = useRef<any>(null);

  const markersRef = useRef<any[]>([]);

  const circlesRef = useRef<any[]>([]);

  const [complaints, setComplaints] = useState<ComplaintLocation[]>([]);

  const [loading, setLoading] = useState(true);

  const [mapLoading, setMapLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintLocation | null>(null);

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  /*
   * ============================================================
   * LOAD GOOGLE MAPS
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    const loadGoogleMaps = async () => {
      try {
        if (!apiKey) {
          throw new Error(
            "Google Maps API key is missing. Check .env.local."
          );
        }

        /*
         * Google Maps already loaded
         */
        if (
          window.google?.maps?.importLibrary
        ) {
          await window.google.maps.importLibrary(
            "maps"
          );

          await window.google.maps.importLibrary(
            "marker"
          );

          if (!cancelled) {
            setMapLoading(false);
          }

          return;
        }

        /*
         * Check if another component is already
         * loading Google Maps
         */
        const existingScript =
          document.querySelector(
            'script[data-google-maps="true"]'
          ) as HTMLScriptElement | null;

        if (existingScript) {
          await new Promise<void>(
            (resolve, reject) => {
              const handleLoad = () => {
                resolve();
              };

              const handleError = () => {
                reject(
                  new Error(
                    "Unable to load Google Maps."
                  )
                );
              };

              existingScript.addEventListener(
                "load",
                handleLoad,
                { once: true }
              );

              existingScript.addEventListener(
                "error",
                handleError,
                { once: true }
              );
            }
          );
        } else {
          /*
           * Create Google Maps script
           */
          await new Promise<void>(
            (resolve, reject) => {
              const script =
                document.createElement(
                  "script"
                );

              script.src =
                `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;

              script.async = true;

              script.defer = true;

              script.dataset.googleMaps =
                "true";

              script.onload = () => {
                resolve();
              };

              script.onerror = () => {
                reject(
                  new Error(
                    "Unable to load Google Maps. Check your API key and enabled APIs."
                  )
                );
              };

              document.head.appendChild(
                script
              );
            }
          );
        }

        /*
         * Wait until Google Maps exposes importLibrary
         */
        let attempts = 0;

        while (
          !window.google?.maps?.importLibrary &&
          attempts < 100
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, 100)
          );

          attempts++;
        }

        if (
          !window.google?.maps?.importLibrary
        ) {
          throw new Error(
            "Google Maps loaded but the Maps API is unavailable."
          );
        }

        /*
         * Explicitly load required libraries
         */
        await window.google.maps.importLibrary(
          "maps"
        );

        await window.google.maps.importLibrary(
          "marker"
        );

        if (!cancelled) {
          setMapLoading(false);
        }
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load Google Maps.";

        setError(message);

        setMapLoading(false);
      }
    };

    loadGoogleMaps();

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  /*
   * ============================================================
   * FETCH COMPLAINTS
   * ============================================================
   */

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      setError(null);

      const response = await fetch(
        "/api/complaints",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
          "Failed to load complaints."
        );
      }

      const rawComplaints: any[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.complaints)
            ? data.complaints
            : [];

      /*
       * Explicit ComplaintLocation-compatible
       * typing prevents implicit-any errors.
       */

      const locations: ComplaintLocation[] =
        rawComplaints
          .filter(
            (complaint: any) =>
              complaint?.latitude !== null &&
              complaint?.latitude !== undefined &&
              complaint?.longitude !== null &&
              complaint?.longitude !== undefined
          )
          .map(
            (
              complaint: any
            ): ComplaintLocation => ({
              id: String(
                complaint.id
              ),

              title:
                complaint.title ||
                "Civic Complaint",

              category:
                complaint.category ||
                "General",

              status:
                complaint.status ||
                "PENDING",

              priority:
                complaint.priority ||
                "MEDIUM",

              ward:
                complaint.ward ||
                "Unknown",

              latitude: Number(
                complaint.latitude
              ),

              longitude: Number(
                complaint.longitude
              ),
            })
          )
          .filter(
            (
              complaint: ComplaintLocation
            ) =>
              Number.isFinite(
                complaint.latitude
              ) &&
              Number.isFinite(
                complaint.longitude
              )
          );

      setComplaints(locations);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load complaint locations.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Fetch complaints on mount
   */

  useEffect(() => {
    fetchComplaints();
  }, []);

  /*
   * ============================================================
   * INITIALIZE GOOGLE MAP
   * ============================================================
   */

  useEffect(() => {
    if (
      mapLoading ||
      !mapRef.current ||
      mapInstanceRef.current
    ) {
      return;
    }

    const initializeMap =
      async () => {
        try {
          if (
            !window.google?.maps?.importLibrary
          ) {
            return;
          }

          /*
           * Load Maps library
           */

          const mapsLibrary =
            await window.google.maps.importLibrary(
              "maps"
            );

          /*
           * Get actual Map constructor
           */

          const Map =
            mapsLibrary.Map;

          if (!Map) {
            throw new Error(
              "Google Maps Map constructor is unavailable."
            );
          }

          /*
           * Create map
           */
          if (!mapRef.current) return;
          mapInstanceRef.current =
            new Map(
              mapRef.current,
              {
                center:
                  DEFAULT_CENTER,

                zoom: 11,

                mapTypeControl:
                  true,

                mapTypeControlOptions:
                {
                  style:
                    window.google
                      .maps
                      .MapTypeControlStyle
                      .HORIZONTAL_BAR,

                  position:
                    window.google
                      .maps
                      .ControlPosition
                      .TOP_LEFT,
                },

                streetViewControl:
                  false,

                fullscreenControl:
                  true,

                fullscreenControlOptions:
                {
                  position:
                    window.google
                      .maps
                      .ControlPosition
                      .TOP_RIGHT,
                },

                zoomControl: true,

                gestureHandling:
                  "greedy",
              }
            );
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to initialize Google Maps.";

          setError(message);

          setMapLoading(false);
        }
      };

    initializeMap();
  }, [mapLoading]);

  /*
   * ============================================================
   * UPDATE MARKERS + HOTSPOT CIRCLES
   * ============================================================
   */

  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !window.google?.maps ||
      complaints.length === 0
    ) {
      return;
    }

    const map =
      mapInstanceRef.current;

    /*
     * Remove old markers
     */

    markersRef.current.forEach(
      (marker: any) => {
        marker.setMap(null);
      }
    );

    markersRef.current = [];

    /*
     * Remove old circles
     */

    circlesRef.current.forEach(
      (circle: any) => {
        circle.setMap(null);
      }
    );

    circlesRef.current = [];

    /*
     * Create complaint markers
     */

    complaints.forEach(
      (
        complaint: ComplaintLocation
      ) => {
        let markerColor =
          "#e79d2e";

        if (
          complaint.priority ===
          "HIGH" ||
          complaint.priority ===
          "CRITICAL"
        ) {
          markerColor =
            "#ef4444";
        } else if (
          complaint.priority ===
          "MEDIUM"
        ) {
          markerColor =
            "#facc15";
        }

        /*
         * Marker
         */

        const marker =
          new window.google.maps.Marker(
            {
              position: {
                lat:
                  complaint.latitude,

                lng:
                  complaint.longitude,
              },

              map,

              title:
                complaint.title,

              icon: {
                path:
                  window.google
                    .maps
                    .SymbolPath
                    .CIRCLE,

                scale: 8,

                fillColor:
                  markerColor,

                fillOpacity: 1,

                strokeColor:
                  "#ffffff",

                strokeWeight: 2,
              },
            }
          );

        marker.addListener(
          "click",
          () => {
            setSelectedComplaint(
              complaint
            );

            map.panTo({
              lat:
                complaint.latitude,

              lng:
                complaint.longitude,
            });
          }
        );

        markersRef.current.push(
          marker
        );

        /*
         * Hotspot circle
         */

        const radius =
          complaint.priority ===
            "CRITICAL" ||
            complaint.priority ===
            "HIGH"
            ? 500
            : complaint.priority ===
              "MEDIUM"
              ? 350
              : 220;

        const circle =
          new window.google.maps.Circle(
            {
              map,

              center: {
                lat:
                  complaint.latitude,

                lng:
                  complaint.longitude,
              },

              radius,

              fillColor:
                markerColor,

              fillOpacity:
                0.18,

              strokeColor:
                markerColor,

              strokeOpacity:
                0.35,

              strokeWeight: 1,
            }
          );

        circlesRef.current.push(
          circle
        );
      }
    );

    /*
     * Fit map around complaints
     */

    if (
      complaints.length > 0
    ) {
      const bounds =
        new window.google.maps.LatLngBounds();

      complaints.forEach(
        (
          complaint: ComplaintLocation
        ) => {
          bounds.extend({
            lat:
              complaint.latitude,

            lng:
              complaint.longitude,
          });
        }
      );

      map.fitBounds(bounds);

      if (
        complaints.length === 1
      ) {
        map.setZoom(15);
      }
    }

    /*
     * Cleanup
     */

    return () => {
      markersRef.current.forEach(
        (marker: any) => {
          marker.setMap(null);
        }
      );

      circlesRef.current.forEach(
        (circle: any) => {
          circle.setMap(null);
        }
      );
    };
  }, [complaints]);

  /*
   * ============================================================
   * MY LOCATION
   * ============================================================
   */

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition =
        {
          lat:
            position.coords
              .latitude,

          lng:
            position.coords
              .longitude,
        };

        if (
          mapInstanceRef.current
        ) {
          mapInstanceRef.current.panTo(
            currentPosition
          );

          mapInstanceRef.current.setZoom(
            16
          );
        }
      },

      () => {
        setError(
          "Unable to access your current location."
        );
      },

      {
        enableHighAccuracy:
          true,

        timeout: 10000,
      }
    );
  };

  /*
   * ============================================================
   * FULLSCREEN
   * ============================================================
   */

  const handleFullscreen =
    () => {
      if (!mapRef.current) {
        return;
      }

      if (
        !document.fullscreenElement
      ) {
        mapRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    };

  /*
   * ============================================================
   * STATUS COLOR
   * ============================================================
   */

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "RESOLVED":
        return "text-emerald-400";

      case "IN_PROGRESS":
        return "text-blue-400";

      case "PENDING":
        return "text-amber-400";

      case "REJECTED":
        return "text-red-400";

      default:
        return "text-gray-300";
    }
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <section className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-xl">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

        <div>
          <div className="flex items-center gap-2">

            <MapPin className="h-5 w-5 text-cyan-400" />

            <h2 className="text-lg font-extrabold text-white">
              Civic Issue Heatmap
            </h2>

          </div>

          <p className="mt-1 text-xs text-gray-400">
            Real-time civic complaint hotspots
            across Delhi.
          </p>
        </div>

        <button
          onClick={
            fetchComplaints
          }
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading
                ? "animate-spin"
                : ""
              }`}
          />

          Refresh
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">

          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* Map */}

      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gray-900">

        {mapLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950/90 backdrop-blur-sm">

            <div className="text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

              <p className="mt-3 text-xs text-gray-400">
                Loading Google Maps...
              </p>

            </div>

          </div>
        )}

        <div
          ref={mapRef}
          className="h-[380px] w-full sm:h-[450px]"
        />

        {/* Map Buttons */}

        <div className="absolute bottom-4 left-4 z-10 flex gap-2">

          <button
            onClick={
              handleMyLocation
            }
            className="flex items-center gap-2 rounded-xl border border-blue-400/30 bg-gray-950/90 px-3 py-2 text-xs font-medium text-blue-300 shadow-lg backdrop-blur hover:bg-gray-900"
          >
            <Navigation className="h-3.5 w-3.5" />

            My Location
          </button>

          <button
            onClick={
              handleFullscreen
            }
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-gray-950/90 px-3 py-2 text-xs font-medium text-gray-300 shadow-lg backdrop-blur hover:bg-gray-900"
          >
            <Maximize2 className="h-3.5 w-3.5" />

            Fullscreen
          </button>

        </div>

      </div>

      {/* Stats */}

      <div className="mt-4 grid grid-cols-2 gap-3">

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">

          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Mapped Complaints
          </p>

          <p className="mt-1 text-2xl font-extrabold text-cyan-400">
            {complaints.length}
          </p>

        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">

          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Coverage
          </p>

          <p className="mt-1 text-sm font-bold text-white">
            Delhi NCR
          </p>

        </div>

      </div>

      {/* Selected Complaint */}

      {selectedComplaint && (
        <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-400">
                Selected Complaint
              </p>

              <h3 className="mt-1 text-sm font-bold text-white">
                {selectedComplaint.title}
              </h3>

            </div>

            <button
              onClick={() =>
                setSelectedComplaint(
                  null
                )
              }
              className="text-xs text-gray-500 hover:text-white"
            >
              Close
            </button>

          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">

            <div className="rounded-lg bg-white/5 p-2.5">

              <p className="text-[9px] text-gray-500">
                Category
              </p>

              <p className="mt-1 text-xs font-semibold text-white">
                {
                  selectedComplaint.category
                }
              </p>

            </div>

            <div className="rounded-lg bg-white/5 p-2.5">

              <p className="text-[9px] text-gray-500">
                Ward
              </p>

              <p className="mt-1 text-xs font-semibold text-white">
                {
                  selectedComplaint.ward
                }
              </p>

            </div>

            <div className="rounded-lg bg-white/5 p-2.5">

              <p className="text-[9px] text-gray-500">
                Priority
              </p>

              <p className="mt-1 text-xs font-semibold text-white">
                {
                  selectedComplaint.priority
                }
              </p>

            </div>

            <div className="rounded-lg bg-white/5 p-2.5">

              <p className="text-[9px] text-gray-500">
                Status
              </p>

              <p
                className={`mt-1 text-xs font-bold ${getStatusClass(
                  selectedComplaint.status
                )}`}
              >
                {selectedComplaint.status.replace(
                  "_",
                  " "
                )}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* Legend */}

      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[10px] text-gray-400">

        <span className="font-semibold text-gray-300">
          Hotspot:
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Low
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          Medium
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          High
        </span>

        <span className="ml-auto">
          {complaints.length} locations
        </span>

      </div>

    </section>
  );
}