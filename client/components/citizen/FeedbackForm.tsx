'use client';

import { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';

type FeedbackFormProps = {
  complaintId: string;
};

export default function FeedbackForm({
  complaintId,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError('');

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
            description: description.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'Failed to submit feedback.'
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mt-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>

          <div>
            <h3 className="font-bold text-white">
              Complaint Verified & Resolved
            </h3>

            <p className="mt-1 text-xs text-emerald-300">
              Thank you for verifying the work and submitting your
              feedback.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-cyan-500/20 bg-gray-950/80 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">
          Verify Resolution & Give Feedback
        </h2>

        <p className="mt-1 text-xs text-gray-400">
          Confirm that your complaint has been resolved and rate
          the worker's service.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Your Rating
          </p>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} star${
                  star > 1 ? 's' : ''
                }`}
                className="rounded-lg p-1 transition hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            ))}

            {rating > 0 && (
              <span className="ml-2 text-sm font-semibold text-yellow-400">
                {rating}/5
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="feedback-description"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400"
          >
            Description
          </label>

          <textarea
            id="feedback-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={4}
            maxLength={1000}
            placeholder="Tell us about your experience..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-cyan-500/50"
          />

          <p className="mt-1 text-right text-[10px] text-gray-600">
            {description.length}/1000
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            'Submitting...'
          ) : (
            <>
              <Send className="h-4 w-4" />
              Verify & Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
}