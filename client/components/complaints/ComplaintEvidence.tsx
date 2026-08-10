"use client";

import {
  Camera,
  Video,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

type ComplaintEvidenceProps = {
  imageUrl?: string | null;
  imageUrls?: string[];
  videoUrl?: string | null;

  aiVerified?: boolean;
  aiDecision?: string | null;
  aiSeverity?: string | null;
  aiScore?: number | null;
  aiReason?: string | null;
  aiDetectedIssue?: string | null;
};

export default function ComplaintEvidence({
  imageUrl,
  imageUrls = [],
  videoUrl,
  aiVerified,
  aiDecision,
  aiSeverity,
  aiScore,
  aiReason,
  aiDetectedIssue,
}: ComplaintEvidenceProps) {
  const images = [
    ...(imageUrl ? [imageUrl] : []),
    ...imageUrls,
  ].filter(
    (value, index, array) =>
      value &&
      array.indexOf(value) === index
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Camera className="h-4 w-4 text-cyan-400" />
          Complaint Evidence
        </h3>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
            >
              <img
                src={url}
                alt={`Complaint evidence ${index + 1}`}
                className="h-56 w-full object-cover transition hover:scale-[1.02]"
              />

              <div className="border-t border-white/10 px-3 py-2 text-[10px] text-gray-500">
                Photo {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 p-5 text-center text-xs text-gray-500">
          No complaint photos available.
        </div>
      )}

      {videoUrl && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <Video className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-medium text-white">
              Complaint Video Evidence
            </span>
          </div>

          <video
            src={videoUrl}
            controls
            playsInline
            className="max-h-[420px] w-full"
          />
        </div>
      )}

      {aiVerified && (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" />

            <h4 className="text-sm font-semibold text-white">
              Gemini AI Verification
            </h4>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-[9px] text-gray-500">
                Decision
              </p>

              <p className="mt-1 text-xs font-bold text-white">
                {aiDecision || "N/A"}
              </p>
            </div>

            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-[9px] text-gray-500">
                Severity
              </p>

              <p className="mt-1 text-xs font-bold text-white">
                {aiSeverity || "N/A"}
              </p>
            </div>
          </div>

          {typeof aiScore === "number" && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>AI Score</span>
                <span>
                  {Math.round(aiScore)}%
                </span>
              </div>

              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/30">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, aiScore)
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {aiDetectedIssue && (
            <p className="mt-4 text-xs text-gray-400">
              <span className="font-semibold text-gray-300">
                Detected issue:
              </span>{" "}
              {aiDetectedIssue}
            </p>
          )}

          {aiReason && (
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              {aiReason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}