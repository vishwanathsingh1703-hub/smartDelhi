'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkCompleteButtonProps {
  complaintId: string;
  isVerified: boolean;
  latitude: number | null;
  longitude: number | null;
}

export default function WorkCompleteButton({
  complaintId,
  isVerified,
  latitude,
  longitude,
}: WorkCompleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleComplete = async () => {
    setError(null);

    if (
      !isVerified ||
      latitude === null ||
      longitude === null
    ) {
      setError(
        'Please verify your location before marking the work as completed.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/complaints/${complaintId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude,
            longitude,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to complete the complaint.'
        );
      }

      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />

          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleComplete}
        disabled={!isVerified || loading}
        className={`w-full flex items-center justify-center gap-2 font-medium text-xs py-3.5 rounded-xl shadow-lg transition ${
          isVerified
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 cursor-pointer'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
        } disabled:opacity-60`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}

        <span>
          {loading
            ? 'Submitting Completion...'
            : isVerified
              ? 'Mark Work Completed'
              : 'Verify Location First'}
        </span>
      </button>
    </div>
  );
}