'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

declare global {
  interface Window {
    google: typeof google;
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
}

const DEFAULT_CENTER = {
  lat: 28.6139,
  lng: 77.2090,
};

export default function CitizenHeatmapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [complaints, setComplaints] = useState<ComplaintLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintLocation | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  /*
   * Load Google Maps JavaScript API
   */
  useEffect(() => {
    if (!apiKey) {
      setMapLoading(false);
      setError(
        'Google Maps API key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.'
      );
      return;
    }

    if (window.google?.maps) {
      setMapLoading(false);
      return;
    }

    const existingScript = document.querySelector(
      'script[data-google-maps="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setMapLoading(false);
      });

      return;
    }

    const script = document.createElement('script');

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';

    script.onload = () => {
      setMapLoading(false);
    };

    script.onerror = () => {
      setMapLoading(false);
      setError('Unable to load Google Maps. Check your API key and configuration.');
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [apiKey]);

  /*
   * Fetch complaint locations
   */
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/complaints', {
        method: 'GET',
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load complaints');
      }

      const rawComplaints = Array.isArray(data)
        ? data
        : data.complaints || [];

      const locations: ComplaintLocation[] = rawComplaints
        .filter(
          (complaint: any) =>
            complaint.latitude !== null &&
            complaint.latitude !== undefined &&
            complaint.longitude !== null &&
            complaint.longitude !== undefined
        )
        .map((complaint: any) => ({
          id: complaint.id,
          title: complaint.title,
          category: complaint.category,
          status: complaint.status,
          priority: complaint.priority,
          ward: complaint.ward,
          latitude: Number(complaint.latitude),
          longitude: Number(complaint.longitude),
        }))
        .filter(
          (complaint: ComplaintLocation) =>
            Number.isFinite(complaint.latitude) &&
            Number.isFinite(complaint.longitude)
        );

      setComplaints(locations);
    } catch (err: any) {
      setError(err.message || 'Failed to load complaint locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  /*
   * Initialize Google Map
   */
  useEffect(() => {
    if (
      mapLoading ||
      !window.google?.maps ||
      !mapRef.current ||
      mapInstanceRef.current
    ) {
      return;
    }

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 11,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: [
        {
          elementType: 'geometry',
          stylers: [{ color: '#172033' }],
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#172033' }],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca3af' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#263247' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#0b1728' }],
        },
      ],
    });
  }, [mapLoading]);

  /*
   * Update heatmap and markers
   */
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) {
      return;
    }

    const map = mapInstanceRef.current;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Remove old heatmap
    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
      heatmapRef.current = null;
    }

    if (complaints.length === 0) {
      return;
    }

    const heatmapData = complaints.map(
      (complaint) =>
        new window.google.maps.LatLng(
          complaint.latitude,
          complaint.longitude
        )
    );

    heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map,
      radius: 35,
      opacity: 0.75,
    });

    complaints.forEach((complaint) => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: complaint.latitude,
          lng: complaint.longitude,
        },
        map,
        title: complaint.title,
      });

      marker.addListener('click', () => {
        setSelectedComplaint(complaint);
      });

      markersRef.current.push(marker);
    });

    // Fit map around complaints
    const bounds = new window.google.maps.LatLngBounds();

    complaints.forEach((complaint) => {
      bounds.extend({
        lat: complaint.latitude,
        lng: complaint.longitude,
      });
    });

    map.fitBounds(bounds);

    // Avoid excessive zoom when only one complaint exists
    if (complaints.length === 1) {
      map.setZoom(15);
    }
  }, [complaints]);

  /*
   * Get current location
   */
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        mapInstanceRef.current?.panTo(currentPosition);
        mapInstanceRef.current?.setZoom(16);
      },
      () => {
        setError('Unable to access your current location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

      case 'IN_PROGRESS':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';

      case 'PENDING':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';

      case 'REJECTED':
        return 'text-red-400 bg-red-500/10 border-red-500/30';

      default:
        return 'text-gray-300 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-950/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <video
                src="/videos/logo-animation.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="font-bold text-lg tracking-wide">
                Smart<span className="text-blue-500">DELHI</span>
              </span>

              <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
                Citizen Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/citizen/notifications"
              className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-cyan-400 transition"
            >
              <Bell className="w-4 h-4" />
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 px-3.5 py-2 rounded-xl text-xs font-medium transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
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

            {/* Stats */}
            <div className="mt-4 bg-gray-950/80 border border-blue-500/20 rounded-3xl p-5 shadow-xl space-y-4">
              <div>
                <p className="text-xs text-gray-400">Mapped Complaints</p>
                <p className="text-2xl font-extrabold text-cyan-400">
                  {complaints.length}
                </p>
              </div>

              <div className="h-px bg-white/10" />

              <div>
                <p className="text-xs text-gray-400">Map Coverage</p>
                <p className="text-sm font-semibold text-white">
                  Delhi NCR
                </p>
              </div>

              <button
                onClick={handleMyLocation}
                className="w-full flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 px-3 py-2.5 rounded-xl text-xs font-medium transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                My Location
              </button>
            </div>
          </aside>

          {/* Map Area */}
          <main className="lg:col-span-9 space-y-5">
            <div className="bg-gray-950/80 border border-blue-500/30 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Civic Issue Heatmap
                  </h1>

                  <p className="text-xs text-gray-400 mt-1">
                    View complaint hotspots across Delhi using real-time
                    geographic data.
                  </p>
                </div>

                <button
                  onClick={fetchComplaints}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-2.5 rounded-xl text-xs font-medium transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      loading ? 'animate-spin' : ''
                    }`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />

                <div>
                  <p className="font-semibold">Map Error</p>
                  <p className="mt-1 text-red-300/80">{error}</p>
                </div>
              </div>
            )}

            {/* Map */}
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
                ref={mapRef}
                className="w-full h-[550px] sm:h-[650px]"
              />
            </div>

            {/* Selected Complaint */}
            {selectedComplaint && (
              <div className="bg-gray-950/90 border border-cyan-500/30 rounded-3xl p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                      Selected Complaint
                    </p>

                    <h2 className="text-lg font-bold mt-1">
                      {selectedComplaint.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="text-gray-500 hover:text-white text-xs"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500">Category</p>
                    <p className="text-xs font-semibold mt-1">
                      {selectedComplaint.category}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500">Ward</p>
                    <p className="text-xs font-semibold mt-1">
                      {selectedComplaint.ward}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500">Priority</p>
                    <p className="text-xs font-semibold mt-1">
                      {selectedComplaint.priority}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500">Status</p>
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded-lg border text-[10px] font-bold ${getStatusClass(
                        selectedComplaint.status
                      )}`}
                    >
                      {selectedComplaint.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 mt-4">
                  Coordinates: {selectedComplaint.latitude.toFixed(6)},{' '}
                  {selectedComplaint.longitude.toFixed(6)}
                </p>
              </div>
            )}

            {/* Legend */}
            <div className="bg-gray-950/80 border border-blue-500/20 rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-5 text-[11px] text-gray-400">
                <span className="font-semibold text-gray-300">
                  Heatmap intensity:
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

                <span className="ml-auto">
                  {complaints.length} locations mapped
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}