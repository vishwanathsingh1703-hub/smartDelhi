"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  MapPin,
  User,
  LogOut,
  Navigation,
  RefreshCw,
  AlertTriangle,
  Filter,
  X,
} from "lucide-react";

declare global {
  interface Window {
    google: any;
    initGoogleMap?: () => void;
  }
}

interface ComplaintLocation {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  ward: string;
  latitude: number;
  longitude: number;
  userId?: string;
}

type FilterCategory =
  | "ALL"
  | "GARBAGE"
  | "ROAD"
  | "SEWAGE"
  | "WATER"
  | "ELECTRICITY"
  | "CLEANLINESS";

type ViewFilter = "ALL" | "MINE";

const DEFAULT_CENTER = {
  lat: 28.6139,
  lng: 77.209,
};

const CATEGORY_OPTIONS: {
  value: FilterCategory;
  label: string;
}[] = [
  { value: "ALL", label: "All Issues" },
  { value: "GARBAGE", label: "Garbage" },
  { value: "ROAD", label: "Road" },
  { value: "SEWAGE", label: "Sewage" },
  { value: "WATER", label: "Water" },
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "CLEANLINESS", label: "Cleanliness" },
];

export default function CitizenHeatmapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstanceRef = useRef<any>(null);

  const markersRef = useRef<any[]>([]);

  const circlesRef = useRef<any[]>([]);

  const myLocationMarkerRef = useRef<any>(null);

  const [complaints, setComplaints] = useState<
    ComplaintLocation[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [mapLoading, setMapLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintLocation | null>(null);

  const [categoryFilter, setCategoryFilter] =
    useState<FilterCategory>("ALL");

  const [viewFilter, setViewFilter] =
    useState<ViewFilter>("ALL");

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  /*
   * =====================================================
   * LOAD CURRENT USER
   * =====================================================
   */

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        /*
         * Try the common session endpoint.
         * If your project exposes user data differently,
         * the heatmap still works for ALL complaints.
         */

        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const user =
          data?.user || data;

        if (user?.id) {
          setCurrentUserId(
            String(user.id)
          );
        }
      } catch {
        /*
         * Do not break the map if the optional
         * current-user endpoint does not exist.
         */
      }
    };

    loadCurrentUser();
  }, []);

  /*
   * =====================================================
   * LOAD GOOGLE MAPS
   * =====================================================
   */

  useEffect(() => {
    if (!apiKey) {
      setMapLoading(false);

      setError(
        "Google Maps API key is missing in .env.local"
      );

      return;
    }

    if (
      window.google &&
      window.google.maps
    ) {
      setMapLoading(false);
      return;
    }

    const existingScript =
      document.querySelector(
        'script[data-google-maps="true"]'
      );

    if (existingScript) {
      const handleLoad = () => {
        setMapLoading(false);
      };

      existingScript.addEventListener(
        "load",
        handleLoad
      );

      return () => {
        existingScript.removeEventListener(
          "load",
          handleLoad
        );
      };
    }

    window.initGoogleMap = () => {
      setMapLoading(false);
    };

    const script =
      document.createElement("script");

    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`;

    script.async = true;
    script.defer = true;

    script.dataset.googleMaps =
      "true";

    script.onerror = () => {
      setMapLoading(false);

      setError(
        "Failed to load Google Maps. Check your API key and internet connection."
      );
    };

    document.head.appendChild(
      script
    );

    return () => {
      delete window.initGoogleMap;
    };
  }, [apiKey]);

  /*
   * =====================================================
   * FETCH COMPLAINTS
   * =====================================================
   */

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await fetch(
          "/api/complaints",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to load complaints"
        );
      }

      const rawComplaints: unknown[] =
        Array.isArray(data)
          ? data
          : Array.isArray(
                data?.complaints
              )
            ? data.complaints
            : [];

      const locations: ComplaintLocation[] =
        rawComplaints
          .filter(
            (
              item: unknown
            ): item is Record<
              string,
              any
            > => {
              if (
                !item ||
                typeof item !==
                  "object"
              ) {
                return false;
              }

              return (
                item.latitude !==
                  null &&
                item.latitude !==
                  undefined &&
                item.longitude !==
                  null &&
                item.longitude !==
                  undefined
              );
            }
          )
          .map(
            (
              complaint: Record<
                string,
                any
              >
            ): ComplaintLocation => ({
              id: String(
                complaint.id
              ),

              title:
                complaint.title ||
                "Civic Complaint",

              category:
                complaint.category ||
                "GENERAL",

              status:
                complaint.status ||
                "PENDING",

              priority:
                complaint.priority ||
                "NORMAL",

              ward:
                complaint.ward ||
                "Unknown",

              latitude:
                Number(
                  complaint.latitude
                ),

              longitude:
                Number(
                  complaint.longitude
                ),

              userId:
                complaint.userId
                  ? String(
                      complaint.userId
                    )
                  : complaint.user?.id
                    ? String(
                        complaint.user.id
                      )
                    : undefined,
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

      setComplaints(
        locations
      );
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

  useEffect(() => {
    fetchComplaints();
  }, []);

  /*
   * =====================================================
   * NORMALIZE CATEGORY
   * =====================================================
   */

  const normalizeCategory = (
    category: string
  ): string => {
    return category
      .toUpperCase()
      .replace(/[\s_-]+/g, "");
  };

  /*
   * =====================================================
   * FILTER COMPLAINTS
   * =====================================================
   */

  const filteredComplaints =
    useMemo(() => {
      return complaints.filter(
        (
          complaint: ComplaintLocation
        ) => {
          const normalized =
            normalizeCategory(
              complaint.category
            );

          const categoryMatch =
            categoryFilter ===
              "ALL" ||
            normalized.includes(
              categoryFilter
            );

          const mineMatch =
            viewFilter ===
              "ALL" ||
            Boolean(
              currentUserId &&
                complaint.userId ===
                  currentUserId
            );

          return (
            categoryMatch &&
            mineMatch
          );
        }
      );
    }, [
      complaints,
      categoryFilter,
      viewFilter,
      currentUserId,
    ]);

  /*
   * =====================================================
   * INITIALIZE MAP
   * =====================================================
   */

  useEffect(() => {
    if (
      mapLoading ||
      !mapRef.current ||
      mapInstanceRef.current ||
      !window.google?.maps
    ) {
      return;
    }

    let cancelled = false;

    const initializeMap =
      async () => {
        try {
          const {
            Map,
            Circle,
            LatLngBounds,
          } =
            await window.google.maps.importLibrary(
              "maps"
            );

          const {
            AdvancedMarkerElement,
          } =
            await window.google.maps.importLibrary(
              "marker"
            );

          if (
            cancelled ||
            !mapRef.current
          ) {
            return;
          }

          const map =
            new Map(
              mapRef.current,
              {
                center:
                  DEFAULT_CENTER,

                zoom: 11,

                mapTypeControl:
                  true,

                streetViewControl:
                  false,

                fullscreenControl:
                  true,

                zoomControl:
                  true,

                gestureHandling:
                  "greedy",

                mapId:
                  "SMART_DELHI_MAP",
              }
            );

          mapInstanceRef.current =
            map;

          map.__Circle =
            Circle;

          map.__LatLngBounds =
            LatLngBounds;

          map.__AdvancedMarkerElement =
            AdvancedMarkerElement;
        } catch (err) {
          console.error(
            "GOOGLE_MAP_INIT_ERROR:",
            err
          );

          setError(
            "Google Maps failed to initialize."
          );
        }
      };

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, [mapLoading]);

  /*
   * =====================================================
   * CREATE CUSTOM COMPLAINT PIN
   * =====================================================
   */

  const createComplaintPin = (
    complaint: ComplaintLocation
  ) => {
    const pin =
      document.createElement(
        "div"
      );

    const priority =
      complaint.priority.toUpperCase();

    let background =
      "#3b82f6";

    if (
      priority === "HIGH" ||
      priority === "CRITICAL"
    ) {
      background =
        "#ef4444";
    } else if (
      priority === "MEDIUM"
    ) {
      background =
        "#facc15";
    }

    pin.style.width =
      "28px";

    pin.style.height =
      "28px";

    pin.style.borderRadius =
      "50% 50% 50% 0";

    pin.style.background =
      background;

    pin.style.border =
      "3px solid white";

    pin.style.boxShadow =
      "0 3px 12px rgba(0,0,0,0.45)";

    pin.style.transform =
      "rotate(-45deg)";

    pin.style.display =
      "flex";

    pin.style.alignItems =
      "center";

    pin.style.justifyContent =
      "center";

    const inner =
      document.createElement(
        "div"
      );

    inner.style.width =
      "8px";

    inner.style.height =
      "8px";

    inner.style.borderRadius =
      "50%";

    inner.style.background =
      "white";

    pin.appendChild(
      inner
    );

    return pin;
  };

  /*
   * =====================================================
   * CREATE CURRENT LOCATION MARKER
   * =====================================================
   */

  const createMyLocationMarker =
    (
      position: {
        lat: number;
        lng: number;
      }
    ) => {
      if (
        !mapInstanceRef.current
      ) {
        return;
      }

      const map =
        mapInstanceRef.current;

      const AdvancedMarkerElement =
        map.__AdvancedMarkerElement;

      if (
        !AdvancedMarkerElement
      ) {
        return;
      }

      if (
        myLocationMarkerRef.current
      ) {
        myLocationMarkerRef.current.map =
          null;
      }

      const container =
        document.createElement(
          "div"
        );

      container.style.width =
        "34px";

      container.style.height =
        "34px";

      container.style.borderRadius =
        "50%";

      container.style.background =
        "rgba(37,99,235,0.18)";

      container.style.border =
        "2px solid #2563eb";

      container.style.display =
        "flex";

      container.style.alignItems =
        "center";

      container.style.justifyContent =
        "center";

      container.style.boxShadow =
        "0 0 0 6px rgba(37,99,235,0.12)";

      const dot =
        document.createElement(
          "div"
        );

      dot.style.width =
        "14px";

      dot.style.height =
        "14px";

      dot.style.borderRadius =
        "50%";

      dot.style.background =
        "#2563eb";

      dot.style.border =
        "3px solid white";

      container.appendChild(
        dot
      );

      myLocationMarkerRef.current =
        new AdvancedMarkerElement({
          map,

          position,

          title:
            "Your current location",

          content:
            container,
        });
    };

  /*
   * =====================================================
   * UPDATE HOTSPOTS + MARKERS
   * =====================================================
   */

  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !window.google?.maps
    ) {
      return;
    }

    const map =
      mapInstanceRef.current;

    const Circle =
      map.__Circle;

    const LatLngBounds =
      map.__LatLngBounds;

    const AdvancedMarkerElement =
      map.__AdvancedMarkerElement;

    if (
      !Circle ||
      !LatLngBounds ||
      !AdvancedMarkerElement
    ) {
      return;
    }

    /*
     * Remove old markers
     */

    markersRef.current.forEach(
      (
        marker: any
      ) => {
        marker.map = null;
      }
    );

    markersRef.current = [];

    /*
     * Remove old circles
     */

    circlesRef.current.forEach(
      (
        circle: any
      ) => {
        circle.setMap(null);
      }
    );

    circlesRef.current = [];

    /*
     * No filtered complaints
     */

    if (
      filteredComplaints.length ===
      0
    ) {
      map.setCenter(
        DEFAULT_CENTER
      );

      map.setZoom(11);

      return;
    }

    /*
     * =================================================
     * GROUP COMPLAINTS BY LOCATION
     * =================================================
     */

    const groups = new Map<
      string,
      {
        lat: number;
        lng: number;
        complaints: ComplaintLocation[];
      }
    >();

    filteredComplaints.forEach(
      (
        complaint: ComplaintLocation
      ) => {
        /*
         * Approx 100m grouping.
         * Complaints close to each other
         * become one hotspot.
         */

        const latKey =
          Math.round(
            complaint.latitude *
              1000
          ) / 1000;

        const lngKey =
          Math.round(
            complaint.longitude *
              1000
          ) / 1000;

        const key =
          `${latKey}_${lngKey}`;

        if (
          !groups.has(key)
        ) {
          groups.set(
            key,
            {
              lat:
                complaint.latitude,

              lng:
                complaint.longitude,

              complaints: [],
            }
          );
        }

        groups
          .get(key)!
          .complaints.push(
            complaint
          );
      }
    );

    const maxCount =
      Math.max(
        1,
        ...Array.from(
          groups.values()
        ).map(
          (
            group: {
              lat: number;
              lng: number;
              complaints: ComplaintLocation[];
            }
          ) =>
            group.complaints
              .length
        )
      );

    /*
     * =================================================
     * DRAW CIRCLE HOTSPOTS
     * =================================================
     */

    groups.forEach(
      (
        group: {
          lat: number;
          lng: number;
          complaints: ComplaintLocation[];
        }
      ) => {
        const count =
          group.complaints
            .length;

        const intensity =
          count / maxCount;

        let fillColor =
          "#3b82f6";

        let radius = 220;

        /*
         * LOW
         */

        if (
          count <= 1
        ) {
          fillColor =
            "#3b82f6";

          radius = 180;
        }

        /*
         * MEDIUM
         */

        if (
          count >= 2 &&
          count <
            Math.max(
              3,
              maxCount * 0.6
            )
        ) {
          fillColor =
            "#facc15";

          radius = 320;
        }

        /*
         * HIGH
         */

        if (
          count >= 3 ||
          intensity >= 0.75
        ) {
          fillColor =
            "#ef4444";

          radius = 500;
        }

        /*
         * Bigger hotspot for many complaints
         */

        radius +=
          Math.min(
            700,
            count * 80
          );

        const circle =
          new Circle({
            map,

            center: {
              lat:
                group.lat,

              lng:
                group.lng,
            },

            radius,

            strokeColor:
              fillColor,

            strokeOpacity:
              0.45,

            strokeWeight: 1.5,

            fillColor,

            fillOpacity:
              0.10 +
              intensity *
                0.18,

            clickable: true,
          });

        circle.addListener(
          "click",
          () => {
            const firstComplaint =
              group
                .complaints[0];

            if (
              firstComplaint
            ) {
              setSelectedComplaint(
                firstComplaint
              );
            }
          }
        );

        circlesRef.current.push(
          circle
        );
      }
    );

    /*
     * =================================================
     * DRAW INDIVIDUAL COMPLAINT PINS
     * =================================================
     */

    filteredComplaints.forEach(
      (
        complaint: ComplaintLocation
      ) => {
        const pin =
          createComplaintPin(
            complaint
          );

        const marker =
          new AdvancedMarkerElement(
            {
              map,

              position: {
                lat:
                  complaint.latitude,

                lng:
                  complaint.longitude,
              },

              title:
                complaint.title,

              content:
                pin,
            }
          );

        marker.addListener(
          "click",
          () => {
            setSelectedComplaint(
              complaint
            );
          }
        );

        markersRef.current.push(
          marker
        );
      }
    );

    /*
     * =================================================
     * FIT MAP TO FILTERED COMPLAINTS
     * =================================================
     */

    const bounds =
      new LatLngBounds();

    filteredComplaints.forEach(
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

    map.fitBounds(
      bounds
    );

    if (
      filteredComplaints.length ===
      1
    ) {
      map.setZoom(15);
    }
  }, [
    filteredComplaints,
  ]);

  /*
   * =====================================================
   * MY LOCATION
   * =====================================================
   */

  const handleMyLocation =
    () => {
      if (
        !navigator.geolocation
      ) {
        setError(
          "Geolocation is not supported by your browser."
        );

        return;
      }

      setLocationLoading(
        true
      );

      setError(null);

      navigator.geolocation.getCurrentPosition(
        (
          position
        ) => {
          const currentPosition =
            {
              lat:
                position.coords
                  .latitude,

              lng:
                position.coords
                  .longitude,
            };

          createMyLocationMarker(
            currentPosition
          );

          mapInstanceRef.current?.panTo(
            currentPosition
          );

          mapInstanceRef.current?.setZoom(
            16
          );

          setLocationLoading(
            false
          );
        },

        () => {
          setLocationLoading(
            false
          );

          setError(
            "Unable to access your current location. Please allow location permission."
          );
        },

        {
          enableHighAccuracy:
            true,

          timeout: 10000,

          maximumAge: 30000,
        }
      );
    };

  /*
   * =====================================================
   * STATUS STYLE
   * =====================================================
   */

  const getStatusClass =
    (
      status: string
    ) => {
      switch (
        status
      ) {
        case "RESOLVED":
          return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

        case "IN_PROGRESS":
          return "text-blue-400 bg-blue-500/10 border-blue-500/30";

        case "PENDING":
          return "text-amber-400 bg-amber-500/10 border-amber-500/30";

        case "REJECTED":
          return "text-red-400 bg-red-500/10 border-red-500/30";

        default:
          return "text-gray-300 bg-white/5 border-white/10";
      }
    };

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HEADER */}

      <header className="border-b border-blue-500/20 bg-gray-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-lg tracking-wide">
              Smart
              <span className="text-blue-500">
                DELHI
              </span>
            </span>

            <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
              Citizen Portal
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/citizen/notifications"
              className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-cyan-400 transition"
            >
              <Bell className="w-4 h-4" />
            </Link>

            <form
              action="/api/auth/logout"
              method="POST"
            >
              <button
                type="submit"
                className="flex items-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 px-3.5 py-2 rounded-xl text-xs font-medium transition"
              >
                <LogOut className="w-3.5 h-3.5" />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SIDEBAR */}

          <aside className="lg:col-span-3">
            <div className="bg-gray-950/80 border border-blue-500/20 rounded-3xl p-4 shadow-xl">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-3 pb-2">
                Menu
              </p>

              <nav className="space-y-1 text-sm font-medium">
                <Link
                  href="/dashboard/citizen"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Overview
                </Link>

                <Link
                  href="/dashboard/citizen/complaints"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  <FileText className="w-4 h-4" />
                  My Complaints
                </Link>

                <Link
                  href="/dashboard/citizen/complaints/new"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit Complaint
                </Link>

                <Link
                  href="/dashboard/citizen/notifications"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </Link>

                <Link
                  href="/dashboard/citizen/heatmap"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border border-cyan-400/40 text-cyan-300"
                >
                  <MapPin className="w-4 h-4" />
                  Heatmap
                </Link>

                <Link
                  href="/dashboard/citizen/profile"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </nav>
            </div>

            {/* STATS */}

            <div className="mt-4 bg-gray-950/80 border border-blue-500/20 rounded-3xl p-5 shadow-xl space-y-4">
              <div>
                <p className="text-xs text-gray-400">
                  Showing Complaints
                </p>

                <p className="text-2xl font-extrabold text-cyan-400">
                  {
                    filteredComplaints.length
                  }
                </p>
              </div>

              <div className="h-px bg-white/10" />

              <div>
                <p className="text-xs text-gray-400">
                  Total Complaints
                </p>

                <p className="text-lg font-bold text-white">
                  {
                    complaints.length
                  }
                </p>
              </div>

              <div className="h-px bg-white/10" />

              <div>
                <p className="text-xs text-gray-400">
                  Map Coverage
                </p>

                <p className="text-sm font-semibold text-white">
                  Delhi NCR
                </p>
              </div>

              <button
                onClick={
                  handleMyLocation
                }
                disabled={
                  locationLoading
                }
                className="w-full flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 px-3 py-2.5 rounded-xl text-xs font-medium transition disabled:opacity-50"
              >
                <Navigation className="w-3.5 h-3.5" />

                {locationLoading
                  ? "Locating..."
                  : "My Location"}
              </button>
            </div>
          </aside>

          {/* MAP AREA */}

          <main className="lg:col-span-9 space-y-5">
            {/* TITLE */}

            <div className="bg-gray-950/80 border border-blue-500/30 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Civic Issue Heatmap
                  </h1>

                  <p className="text-xs text-gray-400 mt-1">
                    Real-time complaint hotspots
                    reported by citizens across
                    Delhi.
                  </p>
                </div>

                <button
                  onClick={
                    fetchComplaints
                  }
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-2.5 rounded-xl text-xs font-medium transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      loading
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Refresh
                </button>
              </div>
            </div>

            {/* FILTERS */}

            <div className="bg-gray-950/80 border border-blue-500/20 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-cyan-400" />

                <h2 className="text-sm font-bold text-white">
                  Map Filters
                </h2>
              </div>

              {/* ALL / MY COMPLAINTS */}

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() =>
                    setViewFilter(
                      "ALL"
                    )
                  }
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${
                    viewFilter ===
                    "ALL"
                      ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-300"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  All Complaints
                </button>

                <button
                  onClick={() =>
                    setViewFilter(
                      "MINE"
                    )
                  }
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${
                    viewFilter ===
                    "MINE"
                      ? "bg-blue-500/15 border-blue-400/40 text-blue-300"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  My Complaints
                </button>
              </div>

              {/* CATEGORY FILTER */}

              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map(
                  (
                    option
                  ) => (
                    <button
                      key={
                        option.value
                      }
                      onClick={() =>
                        setCategoryFilter(
                          option.value
                        )
                      }
                      className={`px-3 py-2 rounded-xl text-[11px] font-semibold border transition ${
                        categoryFilter ===
                        option.value
                          ? "bg-blue-600/20 border-blue-400/40 text-blue-300"
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {
                        option.label
                      }
                    </button>
                  )
                )}
              </div>

              {/* ACTIVE FILTER */}

              {(categoryFilter !==
                "ALL" ||
                viewFilter !==
                  "ALL") && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
                  <div className="text-[11px] text-gray-400">
                    Showing{" "}
                    <span className="font-bold text-cyan-300">
                      {
                        filteredComplaints.length
                      }
                    </span>{" "}
                    complaints
                  </div>

                  <button
                    onClick={() => {
                      setCategoryFilter(
                        "ALL"
                      );

                      setViewFilter(
                        "ALL"
                      );
                    }}
                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* ERROR */}

            {error && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />

                <div>
                  <p className="font-semibold">
                    Map Error
                  </p>

                  <p className="mt-1 text-red-300/80">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* MAP */}

            <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 shadow-2xl bg-gray-950">
              {mapLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950/90 backdrop-blur-sm">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />

                    <p className="text-xs text-gray-400">
                      Loading Google Maps...
                    </p>
                  </div>
                </div>
              )}

              <div
                ref={
                  mapRef
                }
                className="w-full h-[550px] sm:h-[650px]"
              />
            </div>

            {/* NO RESULTS */}

            {!loading &&
              filteredComplaints.length ===
                0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                  <MapPin className="w-8 h-8 text-gray-600 mx-auto" />

                  <p className="mt-3 text-sm font-semibold text-gray-300">
                    No complaints found
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Try another category or
                    switch back to All Complaints.
                  </p>
                </div>
              )}

            {/* SELECTED COMPLAINT */}

            {selectedComplaint && (
              <div className="bg-gray-950/90 border border-cyan-500/30 rounded-3xl p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                      Selected Complaint
                    </p>

                    <h2 className="text-lg font-bold mt-1">
                      {
                        selectedComplaint.title
                      }
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedComplaint(
                        null
                      )
                    }
                    className="text-gray-500 hover:text-white text-xs"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500">
                      Category
                    </p>

                    <p className="text-xs font-semibold mt-1">
                      {
                        selectedComplaint.category
                      }
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500">
                      Ward
                    </p>

                    <p className="text-xs font-semibold mt-1">
                      {
                        selectedComplaint.ward
                      }
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500">
                      Priority
                    </p>

                    <p className="text-xs font-semibold mt-1">
                      {
                        selectedComplaint.priority
                      }
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500">
                      Status
                    </p>

                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded-lg border text-[10px] font-bold ${getStatusClass(
                        selectedComplaint.status
                      )}`}
                    >
                      {selectedComplaint.status.replace(
                        "_",
                        " "
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 mt-4">
                  Coordinates:{" "}
                  {selectedComplaint.latitude.toFixed(
                    6
                  )}
                  ,{" "}
                  {selectedComplaint.longitude.toFixed(
                    6
                  )}
                </p>
              </div>
            )}

            {/* LEGEND */}

            <div className="bg-gray-950/80 border border-blue-500/20 rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-5 text-[11px] text-gray-400">
                <span className="font-semibold text-gray-300">
                  Hotspot intensity:
                </span>

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Low
                </span>

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  Medium
                </span>

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  High
                </span>

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white" />
                  Complaint Pin
                </span>

                <span className="ml-auto">
                  {
                    filteredComplaints.length
                  }{" "}
                  shown
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}