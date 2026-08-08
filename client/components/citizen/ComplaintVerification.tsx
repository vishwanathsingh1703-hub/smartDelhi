'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Star,
  Loader2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ComplaintVerificationProps {
  complaintId: string;
}

export default function ComplaintVerification({
  complaintId,
}: ComplaintVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [description, setDescription] = useState('');

  const [submittingFeedback, setSubmittingFeedback] =
    useState(false);

  const [feedbackSubmitted, setFeedbackSubmitted] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleVerify = async () => {
    if (verifying) return;

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/complaints/${complaintId}/verify`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || 'Failed to verify complaint.'
        );
      }

      setVerified(true);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.'
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleFeedbackSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setError(
        'Please select a star rating between 1 and 5.'
      );
      return;
    }

    if (!verified) {
      setError(
        'Please verify the complaint before submitting feedback.'
      );
      return;
    }

    if (submittingFeedback) return;

    setSubmittingFeedback(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/complaints/${complaintId}/feedback`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating,
            description: description.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || 'Failed to submit feedback.'
        );
      }

      setFeedbackSubmitted(true);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.'
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="rounded-3xl border border-cyan-500/20 bg-gray-950/80 backdrop-blur-xl p-6">
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">
            Work Completion Notice
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            The assigned worker has marked this complaint as
            completed.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />

          <span>{error}</span>
        </div>
      )}

      {/* VERIFY */}
      {!verified && !feedbackSubmitted && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              Please inspect the resolution site and confirm
              whether the reported problem has actually been
              resolved.
            </p>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}

            <span>
              {verifying
                ? 'Verifying Complaint...'
                : 'Verify Complaint'}
            </span>
          </button>
        </div>
      )}

      {/* VERIFIED + FEEDBACK */}
      {verified && !feedbackSubmitted && (
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />

            <div>
              <p className="font-bold text-sm">
                Complaint Verified
              </p>

              <p className="mt-1 opacity-90">
                Your verification was successful. Please rate
                the quality of the completed work.
              </p>
            </div>
          </div>

          {/* FEEDBACK FORM */}
          <form
            onSubmit={handleFeedbackSubmit}
            className="mt-6 space-y-5"
          >
            {/* RATING */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Rate Resolution Quality
              </label>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    aria-label={`Rate ${star} out of 5`}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                    onClick={() => setRating(star)}
                    onMouseEnter={() =>
                      setHoverRating(star)
                    }
                    onMouseLeave={() =>
                      setHoverRating(0)
                    }
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <=
                        (hoverRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <p className="mt-2 text-[11px] text-gray-500">
                {rating === 0
                  ? 'Select a rating from 1 to 5 stars.'
                  : `You selected ${rating} out of 5 stars.`}
              </p>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  Feedback Comments
                  <span className="text-gray-600 normal-case tracking-normal">
                    (Optional)
                  </span>
                </span>
              </label>

              <textarea
                rows={4}
                maxLength={2000}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Share your experience regarding the resolution..."
                className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition resize-none"
              />

              <p className="mt-1 text-[10px] text-gray-600 text-right">
                {description.length}/2000
              </p>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={
                submittingFeedback || rating === 0
              }
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingFeedback ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Star className="w-4 h-4" />
              )}

              <span>
                {submittingFeedback
                  ? 'Submitting Feedback...'
                  : 'Submit Feedback'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* SUCCESS */}
      {feedbackSubmitted && (
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />

            <p className="mt-3 font-bold text-white">
              Complaint Resolved Successfully
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Your verification and feedback have been
              recorded successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}