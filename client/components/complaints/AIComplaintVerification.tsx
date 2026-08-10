"use client";

import { useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Upload,
  RefreshCw,
} from "lucide-react";

type VerificationResult = {
  decision: "ACCEPTED" | "DECLINED" | "MANUAL_REVIEW";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number;
  detectedIssue: string;
  reason: string;
  recommendation: string;
};

type Props = {
  category: string;
  title?: string;
  description?: string;
  onVerified?: (result: VerificationResult) => void;
  onImageChange?: (file: File | null) => void;
};

export default function AIComplaintVerification({
  category,
  title = "",
  description = "",
  onVerified,
  onImageChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<VerificationResult | null>(null);
  const [error, setError] = useState("");

  const handleFile = (selectedFile: File | null) => {
    if (!selectedFile) return;

    setError("");
    setResult(null);

    if (!selectedFile.type.startsWith("image/")) {
      setError("Sirf image upload karein.");
      return;
    }

    if (selectedFile.size > 8 * 1024 * 1024) {
      setError("Image size 8MB se kam honi chahiye.");
      return;
    }

    setFile(selectedFile);
    onImageChange?.(selectedFile);

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  };

  const convertToBase64 = (
    selectedFile: File
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const value = String(reader.result);

        resolve(
          value.replace(
            /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
            ""
          )
        );
      };

      reader.onerror = reject;
      reader.readAsDataURL(selectedFile);
    });
  };

  const verifyComplaint = async () => {
    if (!file) {
      setError("Complaint ki photo upload karein.");
      return;
    }

    if (!category.trim()) {
      setError("Complaint category select karein.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const imageBase64 =
        await convertToBase64(file);

      const response = await fetch(
        "/api/ai/verify-complaint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            imageBase64,
            imageMimeType: file.type,
            category,
            title,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "AI verification failed."
        );
      }

      if (!data?.analysis) {
        throw new Error(
          "AI verification result nahi mila."
        );
      }

      setResult(data.analysis);
      onVerified?.(data.analysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "AI verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onImageChange?.(null);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-cyan-400" />

          <h3 className="font-semibold text-white">
            AI Evidence Verification
          </h3>
        </div>

        <p className="mt-1 text-xs text-gray-500">
          Complaint register karne se pehle Gemini
          uploaded photo ko analyze karega.
        </p>
      </div>

      {!preview ? (
        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="w-full rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5 p-8 text-center hover:bg-cyan-500/10 transition"
        >
          <Upload className="mx-auto h-8 w-8 text-cyan-400" />

          <p className="mt-3 text-sm font-medium text-white">
            Complaint photo upload karein
          </p>

          <p className="mt-1 text-xs text-gray-500">
            JPG, PNG, WEBP • Maximum 8MB
          </p>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          <img
            src={preview}
            alt="Complaint evidence"
            className="max-h-[360px] w-full object-cover"
          />

          <button
            type="button"
            onClick={reset}
            className="absolute right-3 top-3 rounded-xl bg-black/70 px-3 py-2 text-xs text-white backdrop-blur"
          >
            <RefreshCw className="mr-1 inline h-3 w-3" />
            Change
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) =>
          handleFile(
            event.target.files?.[0] || null
          )
        }
      />

      {preview && !result && (
        <button
          type="button"
          disabled={loading}
          onClick={verifyComplaint}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Gemini image analyze kar raha hai...
            </>
          ) : (
            <>
              <Camera className="mr-2 inline h-4 w-4" />
              Verify Complaint with AI
            </>
          )}
        </button>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div
          className={`rounded-2xl border p-4 ${
            result.decision === "ACCEPTED"
              ? "border-emerald-500/20 bg-emerald-500/10"
              : result.decision === "DECLINED"
                ? "border-red-500/20 bg-red-500/10"
                : "border-amber-500/20 bg-amber-500/10"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.decision ===
            "ACCEPTED" ? (
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-400" />
            ) : result.decision ===
              "DECLINED" ? (
              <XCircle className="mt-0.5 h-6 w-6 text-red-400" />
            ) : (
              <AlertTriangle className="mt-0.5 h-6 w-6 text-amber-400" />
            )}

            <div className="flex-1">
              <h4 className="font-semibold text-white">
                {result.decision ===
                "ACCEPTED"
                  ? "Complaint Evidence Accepted"
                  : result.decision ===
                      "DECLINED"
                    ? "Complaint Evidence Declined"
                    : "Manual Review Required"}
              </h4>

              <p className="mt-1 text-xs text-gray-400">
                Severity:{" "}
                <span className="font-semibold text-white">
                  {result.severity}
                </span>
              </p>

              <p className="mt-3 text-sm text-gray-300">
                {result.reason}
              </p>

              {result.detectedIssue && (
                <p className="mt-2 text-xs text-gray-400">
                  <strong className="text-gray-300">
                    Detected:
                  </strong>{" "}
                  {result.detectedIssue}
                </p>
              )}

              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                  <span>AI Confidence</span>
                  <span>
                    {Math.round(
                      result.score
                    )}
                    %
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          result.score
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                {result.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-black/20 p-3">
        <p className="text-[10px] font-semibold text-cyan-300">
          📸 Better evidence ke liye:
        </p>

        <ul className="mt-2 space-y-1 text-[10px] text-gray-500">
          <li>• Problem ko clearly frame mein rakhein.</li>
          <li>• Photo din ki roshni mein lein.</li>
          <li>• Bahut paas se photo na lein.</li>
          <li>• Problem ka surrounding area bhi dikhayein.</li>
          <li>• Blurry ya dark photo avoid karein.</li>
        </ul>
      </div>
    </div>
  );
}