'use client';

import { FormEvent, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Loader2,
} from 'lucide-react';

const categories = [
  'Road Damage',
  'Garbage',
  'Street Light',
  'Water Supply',
  'Sewerage',
  'Drainage',
  'Traffic',
  'Other',
];

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 }; // Delhi Center

export default function NewComplaintPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [ward, setWard] = useState('');
  const [priority, setPriority] = useState('Medium');

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Map Refs
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  /*
   * =====================================================
   * REVERSE GEOCODING (LAT/LNG -> ADDRESS & WARD)
   * =====================================================
   */
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setGeocoding(true);
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));

      if (!apiKey) return;

      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await res.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        setAddress(firstResult.formatted_address || '');

        // Auto-extract Ward/Area if not manually filled
        let detectedWard = '';
        firstResult.address_components.forEach((comp: any) => {
          if (
            comp.types.includes('sublocality') ||
            comp.types.includes('sublocality_level_1')
          ) {
            detectedWard = comp.long_name;
          }
          if (comp.long_name.toLowerCase().includes('ward')) {
            detectedWard = comp.long_name;
          }
        });

        if (detectedWard && !ward) {
          setWard(detectedWard);
        }
      }
    } catch (err) {
      console.error('Reverse Geocoding Error:', err);
    } finally {
      setGeocoding(false);
    }
  };

  /*
   * =====================================================
   * INITIALIZE PIN DROP MAP
   * =====================================================
   */
  useEffect(() => {
    if (!apiKey || !mapRef.current || mapInstanceRef.current || !window.google?.maps) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: DEFAULT_CENTER,
      map: map,
      draggable: true,
      title: 'Drag me to set complaint location',
    });

    markerRef.current = marker;

    // Drag marker event
    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (pos) {
        reverseGeocode(pos.lat(), pos.lng());
      }
    });

    // Map click event
    map.addListener('click', (e: any) => {
      const clickedLat = e.latLng.lat();
      const clickedLng = e.latLng.lng();
      marker.setPosition({ lat: clickedLat, lng: clickedLng });
      reverseGeocode(clickedLat, clickedLng);
    });
  }, [apiKey]);

  // Current GPS Location Button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(currentPos);
          mapInstanceRef.current.setZoom(16);
        }
        if (markerRef.current) {
          markerRef.current.setPosition(currentPos);
        }

        reverseGeocode(currentPos.lat, currentPos.lng);
      },
      () => {
        setError('Unable to fetch your current GPS location.');
        setGeocoding(false);
      },
      { enableHighAccuracy: true }
    );
  };

  /*
   * =====================================================
   * SUBMIT COMPLAINT
   * =====================================================
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!title.trim()) {
        throw new Error('Complaint title is required.');
      }

      if (!category) {
        throw new Error('Please select a complaint category.');
      }

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          ward: ward.trim(),
          priority,
          latitude: latitude.trim() ? parseFloat(latitude) : null,
          longitude: longitude.trim() ? parseFloat(longitude) : null,
          address: address.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || 'Unable to submit complaint.'
        );
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard/citizen');
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit complaint. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="border-b border-cyan-500/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-lg tracking-wide">
              Smart<span className="text-blue-500">DELHI</span>
            </span>

            <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
              Citizen Portal
            </p>
          </div>

          <Link
            href="/dashboard/citizen"
            className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            Civic Complaint
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Submit a Complaint
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Report a civic issue to the SmartDELHI municipal command center.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />

            <div>
              <p className="font-semibold">Submission failed</p>
              <p className="mt-1 text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
            Complaint submitted successfully. Redirecting...
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-5 sm:p-7 shadow-2xl"
        >
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Complaint Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Garbage not collected near main road"
                required
                maxLength={150}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Category *
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition cursor-pointer"
              >
                <option value="" className="bg-gray-950">
                  Select complaint category
                </option>

                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-gray-950"
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem in detail..."
                rows={5}
                maxLength={1000}
                className="w-full resize-none bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />

              <p className="mt-1 text-[10px] text-gray-600 text-right">
                {description.length}/1000
              </p>
            </div>

            {/* Ward + Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ward */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Ward
                </label>

                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Example: Ward 42"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                />

                <p className="mt-1.5 text-[10px] text-gray-500">
                  Leave blank to use your registered ward.
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition cursor-pointer"
                >
                  <option value="Low" className="bg-gray-950">
                    Low
                  </option>

                  <option value="Medium" className="bg-gray-950">
                    Medium
                  </option>

                  <option value="High" className="bg-gray-950">
                    High
                  </option>
                </select>
              </div>
            </div>

            {/* Location Section (Map + Inputs) */}
            <div className="border-t border-white/10 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-xs font-semibold text-gray-300">
                      Location & Interactive Pin Drop
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Click or drag pin on map to auto-fill address and coordinates.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="inline-flex items-center gap-1 text-[11px] bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg transition"
                >
                  <Navigation className="w-3 h-3" />
                  GPS Location
                </button>
              </div>

              {/* Pin Drop Map */}
              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-black/60 shadow-inner">
                {geocoding && (
                  <div className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-cyan-300 flex items-center gap-2 border border-cyan-500/30">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Detecting Address...
                  </div>
                )}
                <div ref={mapRef} className="w-full h-56" />
              </div>

              {/* Detected Address Display */}
              {address && (
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200">
                  <span className="font-semibold">Detected Address: </span>
                  {address}
                </div>
              )}

              {/* Manual Lat / Lng Inputs (Preserved as requested) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Latitude */}
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="28.6139"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="77.2090"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Submitting Complaint...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Complaint
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}