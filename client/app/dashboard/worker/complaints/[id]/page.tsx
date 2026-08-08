'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

import LocationVerification from '@/components/worker/LocationVerification';
import WorkCompleteButton from '@/components/worker/WorkCompleteButton';

export default function WorkerComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const complaintId = String(params.id);

  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [verifiedLatitude, setVerifiedLatitude] = useState<number | null>(null);
  const [verifiedLongitude, setVerifiedLongitude] = useState<number | null>(
    null
  );
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLocationVerified = (
    latitude: number,
    longitude: number,
    distance: number
  ) => {
    setIsLocationVerified(true);
    setVerifiedLatitude(latitude);
    setVerifiedLongitude(longitude);
    setError('');

    setMessage(
      `Location verified successfully. You are ${Math.round(
        distance
      )}m from the complaint location.`
    );
  };

  const handleVerificationReset = () => {
    setIsLocationVerified(false);
    setVerifiedLatitude(null);
    setVerifiedLongitude(null);
  };

  const handleCompleted = async () => {
    setMessage(
      'Work completed successfully. Citizen verification is now pending.'
    );

    setTimeout(() => {
      router.refresh();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg tracking-wide">
              Smart<span className="text-blue-500">DELHI</span>
            </div>

            <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
              Worker Portal
            </p>
          </div>

          <Link
            href="/dashboard/worker/complaints"
            className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Complaints
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* TITLE */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              Worker Action Center
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold">
              Complaint Details & Completion
            </h1>

            <p className="mt-2 text-xs text-gray-500 break-all">
              Complaint ID: {complaintId}
            </p>
          </div>

          {/* INFORMATION CARDS */}
          <div className="space-y-4 mb-8">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">
                  Complaint Reference
                </p>

                <p className="mt-1 text-white font-semibold">
                  Complaint #{complaintId}
                </p>
              </div>

              {isLocationVerified && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Site Verified
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-cyan-400">
                  <MapPin className="w-4 h-4" />

                  <span className="text-xs font-semibold">
                    100m Radius Check
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Worker must be within 100 meters of the registered
                  complaint location to verify site presence.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />

                  <span className="text-xs font-semibold">
                    Citizen Verification
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  After work completion, the citizen must verify the
                  solution before the complaint becomes resolved.
                </p>
              </div>
            </div>
          </div>

          {/* LOCATION VERIFICATION */}
          <div className="mb-8">
            <LocationVerification
              complaintLat={null}
              complaintLon={null}
              onLocationVerified={handleLocationVerified}
              onVerificationReset={handleVerificationReset}
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}
          {message && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />

              <span>{message}</span>
            </div>
          )}

          {/* WORK COMPLETE */}
          <div className="pt-6 border-t border-white/10">
            <WorkCompleteButton
              complaintId={complaintId}
              isVerified={isLocationVerified}
              latitude={verifiedLatitude}
              longitude={verifiedLongitude}
            />

            <p className="mt-3 text-center text-[11px] text-gray-500">
              Work completion is available only after your GPS location
              is verified within 100 meters of the complaint site.
            </p>
          </div>

          {/* FLOW INFO */}
          <div className="mt-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
            <p className="text-xs font-semibold text-blue-300">
              Completion Flow
            </p>

            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Worker GPS verification → Work Completed → Citizen
              Notification → Citizen confirms problem solved → Feedback →
              Complaint RESOLVED
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}