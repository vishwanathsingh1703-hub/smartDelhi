'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function ComplaintFeedbackPage() {
  const params = useParams();
  const router = useRouter();

  const complaintId = String(params.id);

  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/complaints/${complaintId}/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            rating,
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'Unable to submit feedback.'
        );
      }

      setSuccess(
        'Thank you! Your complaint has been verified and marked as resolved.'
      );

      setTimeout(() => {
        router.push(
          `/dashboard/citizen/complaints/${complaintId}`
        );
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* HEADER */}
      <header className="border-b border-cyan-500/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">
              Smart<span className="text-cyan-400">DELHI</span>
            </div>

            <p className="text-[9px] text-gray-500 uppercase tracking-wider">
              Citizen Portal
            </p>
          </div>

          <Link
            href={`/dashboard/citizen/complaints/${complaintId}`}
            className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* TITLE */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>

            <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold">
              Verify Complaint Resolution
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Has the reported problem actually been solved?
            </p>

            <p className="mt-2 text-[11px] text-gray-600 break-all">
              Complaint ID: {complaintId}
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* YES */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-sm font-semibold text-white">
                Is your complaint resolved?
              </p>

              <p className="mt-1 text-xs text-gray-500">
                By submitting feedback, you confirm that the
                reported issue has been resolved.
              </p>
            </div>

            {/* RATING */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Rate the resolution
              </label>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {rating === 0
                  ? 'Select your rating'
                  : `${rating} out of 5 stars`}
              </p>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-white mb-2"
              >
                Feedback
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={5}
                maxLength={1000}
                placeholder="Tell us about the resolution and worker service..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 resize-none"
              />

              <p className="mt-1 text-right text-[10px] text-gray-600">
                {description.length}/1000
              </p>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Feedback...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Resolution & Submit Feedback
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-gray-600">
              Your confirmation will mark this complaint as
              officially resolved.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}