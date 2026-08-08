'use client';

import { useState } from 'react';
import {
  MapPin,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface LocationVerificationProps {
  complaintLat: number | null;
  complaintLon: number | null;
  onLocationVerified: (
    lat: number,
    lon: number,
    distance: number
  ) => void;
  onVerificationReset: () => void;
}

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function LocationVerification({
  complaintLat,
  complaintLon,
  onLocationVerified,
  onVerificationReset,
}: LocationVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleCheckLocation = () => {
    setError(null);

    if (complaintLat === null || complaintLon === null) {
      setError('Complaint location is not available.');
      onVerificationReset();
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      onVerificationReset();
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const workerLat = position.coords.latitude;
        const workerLon = position.coords.longitude;

        const dist = calculateHaversineDistance(
          workerLat,
          workerLon,
          complaintLat,
          complaintLon
        );

        setDistance(dist);
        setLoading(false);

        // Maximum allowed distance = 100 meters
        if (dist <= 100) {
          setVerified(true);
          setError(null);

          onLocationVerified(
            workerLat,
            workerLon,
            dist
          );
        } else {
          setVerified(false);

          setError(
            `You are ${Math.round(
              dist
            )}m away. You must be within 100 meters of the complaint location.`
          );

          onVerificationReset();
        }
      },
      (err) => {
        setLoading(false);
        setVerified(false);
        onVerificationReset();

        let message = 'Unable to retrieve your location.';

        if (err.code === 1) {
          message =
            'Location permission denied. Please allow GPS access.';
        } else if (err.code === 2) {
          message =
            'Your current location could not be determined.';
        } else if (err.code === 3) {
          message =
            'Location request timed out. Please try again.';
        }

        setError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="rounded-3xl border border-cyan-500/20 bg-gray-950/80 p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-400" />

          <h2 className="text-base font-bold text-white">
            Proximity Verification
          </h2>
        </div>

        <p className="mt-2 text-xs text-gray-400 leading-relaxed">
          Worker must be physically within 100 meters of
          the complaint location before marking the work
          as completed.
        </p>
      </div>

      {distance !== null && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            verified
              ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/5 border-red-500/30 text-red-300'
          }`}
        >
          {verified ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}

          <div>
            <p className="font-bold text-sm">
              {verified
                ? 'Location Verified'
                : 'Location Not Verified'}
            </p>

            <p className="mt-1 opacity-90">
              Distance from complaint:{' '}
              {Math.round(distance)} meters
            </p>

            {verified && (
              <p className="mt-1 text-emerald-400">
                You are within the allowed 100m range.
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />

          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleCheckLocation}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}

        <span>
          {loading
            ? 'Checking GPS Location...'
            : verified
              ? 'Check Location Again'
              : 'Verify My Location'}
        </span>
      </button>
    </div>
  );
}