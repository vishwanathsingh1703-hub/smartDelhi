"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Loader2,
  Camera,
  Video,
  X,
  ShieldCheck,
  Sparkles,
  Info,
  RefreshCw,
  Square,
} from "lucide-react";

const categories = [
  "Road Damage",
  "Garbage",
  "Street Light",
  "Water Supply",
  "Sewerage",
  "Drainage",
  "Traffic",
  "Other",
];

const DEFAULT_CENTER = {
  lat: 28.6139,
  lng: 77.209,
};

type VerificationResult = {
  verified?: boolean;
  decision?: "APPROVED" | "DECLINED" | "MANUAL_REVIEW" | string;
  score?: number;
  severity?: string;
  reason?: string;
  issueDetected?: string;
  detectedIssue?: string;
  estimatedQuantity?: string;
  citizenMessage?: string;
  analysis?: unknown;
};

type CameraMode = "idle" | "photo" | "video";

export default function NewComplaintPage() {
  const router = useRouter();

  /*
   * =====================================================
   * BASIC FORM STATE
   * =====================================================
   */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [ward, setWard] = useState("");
  const [priority, setPriority] = useState("Medium");

  /*
   * =====================================================
   * LOCATION
   * =====================================================
   */

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");

  /*
   * =====================================================
   * CAMERA MEDIA
   *
   * NO FILE UPLOAD.
   * Citizen captures evidence directly from live camera.
   * =====================================================
   */

  const [capturedPhoto, setCapturedPhoto] =
    useState<File | null>(null);

  const [capturedPhotoPreview, setCapturedPhotoPreview] =
    useState("");

  const [capturedVideo, setCapturedVideo] =
    useState<File | null>(null);

  const [capturedVideoPreview, setCapturedVideoPreview] =
    useState("");

  const [cameraActive, setCameraActive] =
    useState(false);

  const [cameraMode, setCameraMode] =
    useState<CameraMode>("idle");

  const [recording, setRecording] =
    useState(false);

  const [recordingSeconds, setRecordingSeconds] =
    useState(0);

  /*
   * =====================================================
   * SUBMISSION STATES
   * =====================================================
   */

  const [loading, setLoading] =
    useState(false);

  const [geocoding, setGeocoding] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  /*
   * =====================================================
   * AI VERIFICATION
   * =====================================================
   */

  const [verification, setVerification] =
    useState<VerificationResult | null>(null);

  /*
   * =====================================================
   * CAMERA REFS
   * =====================================================
   */

  const mapRef =
    useRef<HTMLDivElement | null>(null);

  const mapInstanceRef =
    useRef<google.maps.Map | null>(null);

  const markerRef =
    useRef<google.maps.Marker | null>(null);

  const videoElementRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const recordedChunksRef =
    useRef<Blob[]>([]);

  const recordingTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  /*
   * =====================================================
   * GOOGLE MAPS API
   * =====================================================
   */

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  /*
   * =====================================================
   * REVERSE GEOCODING
   * =====================================================
   */

  const reverseGeocode = async (
    lat: number,
    lng: number
  ) => {
    try {
      setGeocoding(true);

      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));

      if (!apiKey) {
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );

      const data = await response.json();

      if (
        data.status === "OK" &&
        data.results &&
        data.results.length > 0
      ) {
        const firstResult =
          data.results[0];

        setAddress(
          firstResult.formatted_address || ""
        );

        let detectedWard = "";

        firstResult.address_components?.forEach(
          (component: {
            long_name?: string;
            types?: string[];
          }) => {
            if (
              component.types?.includes(
                "sublocality"
              ) ||
              component.types?.includes(
                "sublocality_level_1"
              )
            ) {
              detectedWard =
                component.long_name || "";
            }

            if (
              component.long_name
                ?.toLowerCase()
                .includes("ward")
            ) {
              detectedWard =
                component.long_name;
            }
          }
        );

        if (
          detectedWard &&
          !ward
        ) {
          setWard(detectedWard);
        }
      }
    } catch (error) {
      console.error(
        "Reverse Geocoding Error:",
        error
      );
    } finally {
      setGeocoding(false);
    }
  };

  /*
   * =====================================================
   * GOOGLE MAP INITIALIZATION
   * =====================================================
   */

  useEffect(() => {
    if (
      !apiKey ||
      !mapRef.current ||
      mapInstanceRef.current ||
      !window.google?.maps
    ) {
      return;
    }

    const map =
      new window.google.maps.Map(
        mapRef.current,
        {
          center: DEFAULT_CENTER,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }
      );

    mapInstanceRef.current = map;

    const marker =
      new window.google.maps.Marker({
        position: DEFAULT_CENTER,
        map,
        draggable: true,
        title:
          "Drag me to set complaint location",
      });

    markerRef.current = marker;

    marker.addListener(
      "dragend",
      () => {
        const position =
          marker.getPosition();

        if (position) {
          reverseGeocode(
            position.lat(),
            position.lng()
          );
        }
      }
    );

    map.addListener(
      "click",
      (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return;

        const clickedLat =
          event.latLng.lat();

        const clickedLng =
          event.latLng.lng();

        marker.setPosition({
          lat: clickedLat,
          lng: clickedLng,
        });

        reverseGeocode(
          clickedLat,
          clickedLng
        );
      }
    );
  }, [apiKey]);

  /*
   * =====================================================
   * CURRENT GPS LOCATION
   * =====================================================
   */

  const handleUseCurrentLocation =
    () => {
      if (!navigator.geolocation) {
        setError(
          "Geolocation is not supported by your browser."
        );
        return;
      }

      setError("");
      setGeocoding(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPosition = {
            lat:
              position.coords.latitude,
            lng:
              position.coords.longitude,
          };

          if (
            mapInstanceRef.current
          ) {
            mapInstanceRef.current.panTo(
              currentPosition
            );

            mapInstanceRef.current.setZoom(
              16
            );
          }

          if (markerRef.current) {
            markerRef.current.setPosition(
              currentPosition
            );
          }

          reverseGeocode(
            currentPosition.lat,
            currentPosition.lng
          );
        },
        () => {
          setError(
            "Unable to fetch your current GPS location."
          );

          setGeocoding(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    };

  /*
   * =====================================================
   * START LIVE CAMERA
   * =====================================================
   */

  const startCamera = async () => {
    try {
      setError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Your browser does not support live camera access."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: {
                ideal: "environment",
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: true,
          }
        );

      streamRef.current = stream;

      setCameraActive(true);

      setCameraMode("photo");

      /*
       * Wait for video element to exist.
       */
      setTimeout(() => {
        if (
          videoElementRef.current
        ) {
          videoElementRef.current.srcObject =
            stream;

          videoElementRef.current
            .play()
            .catch(() => {});
        }
      }, 100);
    } catch (error) {
      console.error(
        "CAMERA_ACCESS_ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to access your camera. Please allow camera permission."
      );

      setCameraActive(false);
    }
  };

  /*
   * =====================================================
   * STOP CAMERA
   * =====================================================
   */

  const stopCamera = () => {
    if (recording) {
      stopVideoRecording();
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    if (
      videoElementRef.current
    ) {
      videoElementRef.current.srcObject =
        null;
    }

    setCameraActive(false);
    setCameraMode("idle");
  };

  /*
   * =====================================================
   * CAPTURE PHOTO FROM LIVE CAMERA
   * =====================================================
   */

  const capturePhoto = () => {
    const video =
      videoElementRef.current;

    if (!video) {
      setError(
        "Camera preview is not available."
      );
      return;
    }

    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setError(
        "Camera is still starting. Please wait a moment."
      );
      return;
    }

    const canvas =
      document.createElement("canvas");

    canvas.width =
      video.videoWidth || 1280;

    canvas.height =
      video.videoHeight || 720;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setError(
        "Unable to capture camera image."
      );
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError(
            "Unable to create complaint photograph."
          );
          return;
        }

        const file =
          new File(
            [blob],
            `smartdelhi-complaint-${Date.now()}.jpg`,
            {
              type: "image/jpeg",
            }
          );

        if (
          capturedPhotoPreview
        ) {
          URL.revokeObjectURL(
            capturedPhotoPreview
          );
        }

        const preview =
          URL.createObjectURL(blob);

        setCapturedPhoto(file);
        setCapturedPhotoPreview(
          preview
        );

        setError("");
      },
      "image/jpeg",
      0.92
    );
  };

  /*
   * =====================================================
   * MEDIA RECORDER MIME TYPE
   * =====================================================
   */

  const getSupportedVideoMimeType =
    () => {
      const types = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];

      for (const type of types) {
        if (
          typeof MediaRecorder !==
            "undefined" &&
          MediaRecorder.isTypeSupported(
            type
          )
        ) {
          return type;
        }
      }

      return "";
    };

  /*
   * =====================================================
   * START 10 SECOND VIDEO RECORDING
   * =====================================================
   */

  const startVideoRecording =
    () => {
      const stream =
        streamRef.current;

      if (!stream) {
        setError(
          "Please start the live camera first."
        );
        return;
      }

      if (
        typeof MediaRecorder ===
        "undefined"
      ) {
        setError(
          "Video recording is not supported by this browser."
        );
        return;
      }

      try {
        setError("");

        recordedChunksRef.current =
          [];

        const mimeType =
          getSupportedVideoMimeType();

        const recorder =
          mimeType
            ? new MediaRecorder(
                stream,
                { mimeType }
              )
            : new MediaRecorder(
                stream
              );

        mediaRecorderRef.current =
          recorder;

        recorder.ondataavailable =
          (event) => {
            if (
              event.data &&
              event.data.size > 0
            ) {
              recordedChunksRef.current.push(
                event.data
              );
            }
          };

        recorder.onstop = () => {
          const chunks =
            recordedChunksRef.current;

          if (!chunks.length) {
            setError(
              "No video data was captured. Please try again."
            );
            return;
          }

          const finalType =
            recorder.mimeType ||
            "video/webm";

          const blob =
            new Blob(chunks, {
              type: finalType,
            });

          const extension =
            finalType.includes(
              "webm"
            )
              ? "webm"
              : "mp4";

          const file =
            new File(
              [blob],
              `smartdelhi-complaint-${Date.now()}.${extension}`,
              {
                type: finalType,
              }
            );

          if (
            capturedVideoPreview
          ) {
            URL.revokeObjectURL(
              capturedVideoPreview
            );
          }

          const preview =
            URL.createObjectURL(blob);

          setCapturedVideo(file);
          setCapturedVideoPreview(
            preview
          );

          setRecording(false);
          setRecordingSeconds(10);

          if (
            recordingTimerRef.current
          ) {
            clearInterval(
              recordingTimerRef.current
            );

            recordingTimerRef.current =
              null;
          }
        };

        recorder.onerror = () => {
          setRecording(false);

          if (
            recordingTimerRef.current
          ) {
            clearInterval(
              recordingTimerRef.current
            );

            recordingTimerRef.current =
              null;
          }

          setError(
            "Video recording failed. Please try again."
          );
        };

        recorder.start();

        setRecording(true);
        setRecordingSeconds(0);

        recordingTimerRef.current =
          setInterval(() => {
            setRecordingSeconds(
              (previous) => {
                const next =
                  previous + 1;

                if (
                  next >= 10
                ) {
                  setTimeout(() => {
                    stopVideoRecording();
                  }, 0);
                }

                return Math.min(
                  next,
                  10
                );
              }
            );
          }, 1000);
      } catch (error) {
        console.error(
          "VIDEO_RECORDING_ERROR:",
          error
        );

        setRecording(false);

        setError(
          "Unable to start video recording."
        );
      }
    };

  /*
   * =====================================================
   * STOP VIDEO RECORDING
   * =====================================================
   */

  const stopVideoRecording =
    () => {
      if (
        recordingTimerRef.current
      ) {
        clearInterval(
          recordingTimerRef.current
        );

        recordingTimerRef.current =
          null;
      }

      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !==
          "inactive"
      ) {
        recorder.stop();
      }

      setRecording(false);
    };

  /*
   * =====================================================
   * REMOVE CAPTURED PHOTO
   * =====================================================
   */

  const removePhoto = () => {
    if (
      capturedPhotoPreview
    ) {
      URL.revokeObjectURL(
        capturedPhotoPreview
      );
    }

    setCapturedPhoto(null);
    setCapturedPhotoPreview("");
  };

  /*
   * =====================================================
   * REMOVE CAPTURED VIDEO
   * =====================================================
   */

  const removeVideo = () => {
    if (
      capturedVideoPreview
    ) {
      URL.revokeObjectURL(
        capturedVideoPreview
      );
    }

    setCapturedVideo(null);
    setCapturedVideoPreview("");
    setRecordingSeconds(0);
  };

  /*
   * =====================================================
   * UPLOAD CAPTURED MEDIA
   *
   * These are NOT uploaded by user manually.
   * They are the files captured from the live camera.
   * =====================================================
   */

  const uploadMedia = async () => {
    if (!capturedPhoto) {
      throw new Error(
        "Complaint photograph is missing."
      );
    }

    if (!capturedVideo) {
      throw new Error(
        "Complaint video is missing."
      );
    }

    const formData =
      new FormData();

    formData.append(
      "images",
      capturedPhoto
    );

    formData.append(
      "video",
      capturedVideo
    );

    const response =
      await fetch(
        "/api/uploads",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          "Failed to upload complaint evidence."
      );
    }

    return {
      imageUrls:
        Array.isArray(
          data?.imageUrls
        )
          ? data.imageUrls
          : [],

      videoUrl:
        typeof data?.videoUrl ===
        "string"
          ? data.videoUrl
          : null,
    };
  };

  /*
   * =====================================================
   * GEMINI AI VERIFICATION
   *
   * IMPORTANT:
   * API returns:
   * {
   *   success: true,
   *   verification: {...}
   * }
   *
   * Therefore we return data.verification,
   * NOT the complete API response.
   * =====================================================
   */

  const verifyComplaint =
    async () => {
      if (!capturedPhoto) {
        throw new Error(
          "Please capture a complaint photograph first."
        );
      }

      const formData =
        new FormData();

      formData.append(
        "category",
        category
      );

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "ward",
        ward.trim() ||
          "Not provided"
      );

      formData.append(
        "images",
        capturedPhoto
      );

      const response =
        await fetch(
          "/api/ai/verify-complaint",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Gemini verification failed."
        );
      }

      /*
       * FIX:
       * Gemini route returns data.verification
       */
      const result =
        data?.verification;

      if (!result) {
        throw new Error(
          "Gemini returned an invalid verification response."
        );
      }

      return result as VerificationResult;
    };

  /*
   * =====================================================
   * SUBMIT COMPLAINT
   * =====================================================
   */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess(false);
    setVerification(null);

    try {
      /*
       * BASIC VALIDATION
       */

      if (!title.trim()) {
        throw new Error(
          "Complaint title is required."
        );
      }

      if (
        title.trim().length < 5
      ) {
        throw new Error(
          "Complaint title must contain at least 5 characters."
        );
      }

      if (!category) {
        throw new Error(
          "Please select a complaint category."
        );
      }

      if (!description.trim()) {
        throw new Error(
          "Please describe the civic problem."
        );
      }

      if (
        description.trim().length <
        10
      ) {
        throw new Error(
          "Complaint description must contain at least 10 characters."
        );
      }

      /*
       * CAMERA PHOTO REQUIRED
       */

      if (!capturedPhoto) {
        throw new Error(
          "Please capture the complaint photograph using the live camera."
        );
      }

      /*
       * CAMERA VIDEO REQUIRED
       */

      if (!capturedVideo) {
        throw new Error(
          "Please record the required 10-second complaint video."
        );
      }

      /*
       * START PROCESS
       */

      setLoading(true);

      setVerifying(true);

      /*
       * GEMINI VERIFICATION
       */

      const aiResult =
        await verifyComplaint();

      setVerification(
        aiResult
      );

      setVerifying(false);

      const decision =
        String(
          aiResult?.decision ||
            ""
        )
          .trim()
          .toUpperCase();

      /*
       * =================================================
       * AI DECLINED
       * =================================================
       */

      if (
        decision === "DECLINED"
      ) {
        setError(
          aiResult?.citizenMessage ||
            aiResult?.reason ||
            "AI verification declined this complaint."
        );

        setLoading(false);

        return;
      }

      /*
       * =================================================
       * AI MANUAL REVIEW
       * =================================================
       */

      if (
        decision ===
        "MANUAL_REVIEW"
      ) {
        setError(
          aiResult?.citizenMessage ||
            aiResult?.reason ||
            "This complaint requires manual review."
        );

        setLoading(false);

        return;
      }

      /*
       * =================================================
       * ONLY APPROVED CONTINUES
       * =================================================
       */

      if (
        decision !==
        "APPROVED"
      ) {
        setError(
          "AI verification did not return a valid approval decision."
        );

        setLoading(false);

        return;
      }

      /*
       * =================================================
       * UPLOAD CAMERA EVIDENCE
       * =================================================
       */

      setUploading(true);

      const media =
        await uploadMedia();

      setUploading(false);

      if (
        !media.imageUrls.length
      ) {
        throw new Error(
          "Captured complaint photo upload failed."
        );
      }

      if (
        !media.videoUrl
      ) {
        throw new Error(
          "Captured complaint video upload failed."
        );
      }

      /*
       * =================================================
       * REGISTER COMPLAINT
       * =================================================
       */

      const response =
        await fetch(
          "/api/complaints/register",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials:
              "include",

            body: JSON.stringify(
              {
                title:
                  title.trim(),

                description:
                  description.trim(),

                category,

                ward:
                  ward.trim() ||
                  "Unknown",

                priority,

                latitude:
                  latitude.trim()
                    ? Number(
                        latitude
                      )
                    : null,

                longitude:
                  longitude.trim()
                    ? Number(
                        longitude
                      )
                    : null,

                address:
                  address.trim() ||
                  null,

                imageUrl:
                  media.imageUrls[0],

                imageUrls:
                  media.imageUrls,

                videoUrl:
                  media.videoUrl,

                /*
                 * AI VERIFICATION DATA
                 */

                aiVerified:
                  true,

                aiDecision:
                  decision,

                aiSeverity:
                  aiResult?.severity ||
                  null,

                aiScore:
                  typeof aiResult?.score ===
                  "number"
                    ? aiResult.score
                    : null,

                aiReason:
                  aiResult?.reason ||
                  null,

                aiDetectedIssue:
                  aiResult?.issueDetected ||
                  aiResult?.detectedIssue ||
                  null,

                aiAnalysis:
                  aiResult?.analysis ??
                  null,
              }
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to register complaint."
        );
      }

      /*
       * SUCCESS
       */

      setSuccess(true);
      setLoading(false);

      /*
       * Stop camera after successful
       * complaint registration.
       */

      stopCamera();

      setTimeout(() => {
        router.push(
          "/dashboard/citizen"
        );

        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(
        "COMPLAINT_SUBMISSION_ERROR:",
        error
      );

      setVerifying(false);
      setUploading(false);
      setLoading(false);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit complaint. Please try again."
      );
    }
  };

  /*
   * =====================================================
   * CLEANUP
   * =====================================================
   */

  useEffect(() => {
    return () => {
      if (
        recordingTimerRef.current
      ) {
        clearInterval(
          recordingTimerRef.current
        );
      }

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      if (
        capturedPhotoPreview
      ) {
        URL.revokeObjectURL(
          capturedPhotoPreview
        );
      }

      if (
        capturedVideoPreview
      ) {
        URL.revokeObjectURL(
          capturedVideoPreview
        );
      }
    };
  }, []);

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HEADER */}

      <header className="border-b border-white/10 bg-gray-950/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              SmartDELHI
            </h2>

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

      {/* MAIN */}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* HEADING */}

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            Civic Complaint
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Submit a Complaint
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Report a civic issue directly
            to the SmartDELHI municipal
            command center.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />

            <div>
              <p className="font-semibold">
                Submission failed
              </p>

              <p className="mt-1 text-red-300/80">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />

            Complaint verified and
            registered successfully.
            Redirecting...
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-5 sm:p-7 shadow-2xl"
        >
          <div className="space-y-6">
            {/* TITLE */}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Complaint Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Example: Garbage not collected near main road"
                required
                maxLength={150}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Category *
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition cursor-pointer"
              >
                <option
                  value=""
                  className="bg-gray-950"
                >
                  Select complaint category
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-gray-950"
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Description *
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe the problem in detail..."
                rows={5}
                maxLength={1000}
                required
                className="w-full resize-none bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />

              <p className="mt-1 text-[10px] text-gray-600 text-right">
                {description.length}/1000
              </p>
            </div>

            {/* WARD + PRIORITY */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Ward
                </label>

                <input
                  type="text"
                  value={ward}
                  onChange={(event) =>
                    setWard(
                      event.target.value
                    )
                  }
                  placeholder="Example: Ward 42"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                />

                <p className="mt-1.5 text-[10px] text-gray-500">
                  Ward can also be detected
                  from the selected location.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value
                    )
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition cursor-pointer"
                >
                  <option
                    value="Low"
                    className="bg-gray-950"
                  >
                    Low
                  </option>

                  <option
                    value="Medium"
                    className="bg-gray-950"
                  >
                    Medium
                  </option>

                  <option
                    value="High"
                    className="bg-gray-950"
                  >
                    High
                  </option>
                </select>
              </div>
            </div>

            {/* =================================================
                LIVE CAMERA EVIDENCE
            ================================================= */}

            <div className="border-t border-white/10 pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    Live Camera Evidence
                  </h3>

                  <p className="text-[11px] text-gray-500 mt-1">
                    Capture the complaint
                    directly using your
                    device camera. Manual
                    image/video upload is
                    disabled.
                  </p>
                </div>
              </div>

              {/* CAMERA INFO */}

              <div className="mb-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-cyan-400" />

                  <p className="text-xs font-semibold text-cyan-300">
                    Evidence requirements
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-400">
                  <p>
                    ✓ Capture the entire
                    problem clearly.
                  </p>

                  <p>
                    ✓ Keep the camera
                    steady.
                  </p>

                  <p>
                    ✓ Show the surrounding
                    area.
                  </p>

                  <p>
                    ✓ Avoid dark or blurry
                    evidence.
                  </p>

                  <p>
                    ✓ Photo is required.
                  </p>

                  <p>
                    ✓ 10-second video is
                    required.
                  </p>
                </div>
              </div>

              {/* CAMERA */}

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={
                      startCamera
                    }
                    disabled={loading}
                    className="w-full border border-dashed border-cyan-500/30 hover:border-cyan-400/60 bg-cyan-500/5 hover:bg-cyan-500/10 rounded-xl py-8 transition disabled:opacity-40"
                  >
                    <Camera className="w-8 h-8 text-cyan-400 mx-auto mb-3" />

                    <p className="text-sm font-semibold text-cyan-300">
                      Open Live Camera
                    </p>

                    <p className="text-[10px] text-gray-600 mt-1">
                      Camera permission will
                      be requested by your
                      browser
                    </p>
                  </button>
                ) : (
                  <>
                    {/* CAMERA PREVIEW */}

                    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-black">
                      <video
                        ref={
                          videoElementRef
                        }
                        muted
                        playsInline
                        autoPlay
                        className="w-full aspect-video object-cover"
                      />

                      {recording && (
                        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 text-white text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />

                          REC{" "}
                          {recordingSeconds}
                          /10
                        </div>
                      )}

                      {!recording &&
                        cameraMode ===
                          "photo" && (
                          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur text-cyan-300 text-[10px]">
                            LIVE CAMERA
                          </div>
                        )}

                      {recording && (
                        <div className="absolute inset-0 border-2 border-red-500/60 pointer-events-none" />
                      )}
                    </div>

                    {/* CAMERA CONTROLS */}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                      <button
                        type="button"
                        onClick={
                          capturePhoto
                        }
                        disabled={
                          recording ||
                          loading
                        }
                        className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition disabled:opacity-40"
                      >
                        <Camera className="w-4 h-4" />

                        Capture Photo
                      </button>

                      {!recording ? (
                        <button
                          type="button"
                          onClick={
                            startVideoRecording
                          }
                          disabled={
                            loading
                          }
                          className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition disabled:opacity-40"
                        >
                          <Video className="w-4 h-4" />

                          Record 10 Sec
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={
                            stopVideoRecording
                          }
                          className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-semibold transition"
                        >
                          <Square className="w-4 h-4 fill-current" />

                          Stop Recording
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={
                          stopCamera
                        }
                        disabled={
                          recording ||
                          loading
                        }
                        className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold transition disabled:opacity-40"
                      >
                        <X className="w-4 h-4" />

                        Close Camera
                      </button>
                    </div>

                    {/* RETAKE CAMERA */}

                    {(capturedPhoto ||
                      capturedVideo) && (
                      <button
                        type="button"
                        onClick={() => {
                          removePhoto();
                          removeVideo();
                          setVerification(
                            null
                          );
                          setError("");
                        }}
                        disabled={
                          loading ||
                          recording
                        }
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 text-xs transition disabled:opacity-40"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />

                        Retake Evidence
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* =================================================
                  CAPTURED PHOTO
              ================================================= */}

              {capturedPhotoPreview && (
                <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold text-emerald-300">
                        Complaint Photo Captured
                      </p>

                      <p className="text-[10px] text-gray-600 mt-1">
                        Live camera evidence
                        ready for AI verification.
                      </p>
                    </div>

                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={
                        capturedPhotoPreview
                      }
                      alt="Captured complaint evidence"
                      className="w-full max-h-80 object-contain bg-black"
                    />

                    <button
                      type="button"
                      onClick={
                        removePhoto
                      }
                      disabled={
                        loading
                      }
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-red-600 transition disabled:opacity-40"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  CAPTURED VIDEO
              ================================================= */}

              {capturedVideoPreview && (
                <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold text-emerald-300">
                        10-Second Video Captured
                      </p>

                      <p className="text-[10px] text-gray-600 mt-1">
                        Camera evidence ready
                        for registration.
                      </p>
                    </div>

                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <video
                      src={
                        capturedVideoPreview
                      }
                      controls
                      playsInline
                      className="w-full max-h-80 object-contain bg-black"
                    />

                    <button
                      type="button"
                      onClick={
                        removeVideo
                      }
                      disabled={
                        loading
                      }
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-red-600 transition disabled:opacity-40"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* EVIDENCE STATUS */}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`rounded-xl border p-3 ${
                    capturedPhoto
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {capturedPhoto ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Camera className="w-4 h-4 text-gray-500" />
                    )}

                    <span className="text-[11px] font-semibold">
                      Photo
                    </span>

                    <span className="ml-auto text-[10px] text-gray-500">
                      {capturedPhoto
                        ? "READY"
                        : "REQUIRED"}
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-xl border p-3 ${
                    capturedVideo
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {capturedVideo ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Video className="w-4 h-4 text-gray-500" />
                    )}

                    <span className="text-[11px] font-semibold">
                      10-sec Video
                    </span>

                    <span className="ml-auto text-[10px] text-gray-500">
                      {capturedVideo
                        ? "READY"
                        : "REQUIRED"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                AI RESULT
            ================================================= */}

            {verification && (
              <div
                className={`rounded-2xl border p-4 ${
                  String(
                    verification.decision
                  ).toUpperCase() ===
                  "DECLINED"
                    ? "border-red-500/30 bg-red-500/10"
                    : String(
                        verification.decision
                      ).toUpperCase() ===
                      "MANUAL_REVIEW"
                    ? "border-yellow-500/30 bg-yellow-500/10"
                    : "border-emerald-500/30 bg-emerald-500/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Sparkles
                    className={`w-5 h-5 mt-0.5 ${
                      String(
                        verification.decision
                      ).toUpperCase() ===
                      "DECLINED"
                        ? "text-red-400"
                        : String(
                            verification.decision
                          ).toUpperCase() ===
                          "MANUAL_REVIEW"
                        ? "text-yellow-400"
                        : "text-emerald-400"
                    }`}
                  />

                  <div>
                    <p className="text-xs font-bold">
                      Gemini AI Verification
                    </p>

                    {verification.decision && (
                      <p className="text-[11px] mt-1">
                        Decision:{" "}
                        <strong>
                          {
                            verification.decision
                          }
                        </strong>
                      </p>
                    )}

                    {verification.severity && (
                      <p className="text-[11px] mt-1 text-gray-400">
                        Severity:{" "}
                        {
                          verification.severity
                        }
                      </p>
                    )}

                    {typeof verification.score ===
                      "number" && (
                      <p className="text-[11px] mt-1 text-gray-400">
                        AI Score:{" "}
                        {
                          verification.score
                        }
                      </p>
                    )}

                    {(verification.issueDetected ||
                      verification.detectedIssue) && (
                      <p className="text-[11px] mt-1 text-gray-400">
                        Detected Issue:{" "}
                        {
                          verification.issueDetected ||
                          verification.detectedIssue
                        }
                      </p>
                    )}

                    {verification.estimatedQuantity && (
                      <p className="text-[11px] mt-1 text-gray-400">
                        Estimated Quantity:{" "}
                        {
                          verification.estimatedQuantity
                        }
                      </p>
                    )}

                    {verification.reason && (
                      <p className="text-[11px] mt-2 text-gray-400 leading-relaxed">
                        {
                          verification.reason
                        }
                      </p>
                    )}

                    {verification.citizenMessage && (
                      <p className="text-[11px] mt-2 text-cyan-300 leading-relaxed">
                        {
                          verification.citizenMessage
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                LOCATION
            ================================================= */}

            <div className="border-t border-white/10 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />

                  <div>
                    <p className="text-xs font-semibold text-gray-300">
                      Location & Interactive Pin Drop
                    </p>

                    <p className="text-[10px] text-gray-500">
                      Click or drag pin on
                      map to auto-fill address
                      and coordinates.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleUseCurrentLocation
                  }
                  disabled={
                    loading
                  }
                  className="inline-flex items-center gap-1 text-[11px] bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                >
                  <Navigation className="w-3 h-3" />
                  GPS Location
                </button>
              </div>

              {/* MAP */}

              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-black/60 shadow-inner">
                {geocoding && (
                  <div className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-cyan-300 flex items-center gap-2 border border-cyan-500/30">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Detecting Address...
                  </div>
                )}

                {!apiKey && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 text-xs text-red-300 p-4 text-center">
                    Google Maps API key
                    is not configured.
                  </div>
                )}

                <div
                  ref={mapRef}
                  className="w-full h-56"
                />
              </div>

              {/* ADDRESS */}

              {address && (
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200">
                  <span className="font-semibold">
                    Detected Address:{" "}
                  </span>

                  {address}
                </div>
              )}

              {/* LAT LNG */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(event) =>
                      setLatitude(
                        event.target.value
                      )
                    }
                    placeholder="28.6139"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(event) =>
                      setLongitude(
                        event.target.value
                      )
                    }
                    placeholder="77.2090"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  loading ||
                  success ||
                  !capturedPhoto ||
                  !capturedVideo
                }
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />

                    Gemini AI is
                    verifying...
                  </>
                ) : uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />

                    Uploading Camera
                    Evidence...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />

                    Registering
                    Complaint...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />

                    Verify & Register
                    Complaint
                  </>
                )}
              </button>

              {(!capturedPhoto ||
                !capturedVideo) && (
                <p className="mt-2 text-center text-[10px] text-gray-600">
                  Capture both a complaint
                  photo and 10-second video
                  before submitting.
                </p>
              )}
            </div>

            {/* FOOTER INFO */}

            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-[10px] text-gray-600 leading-relaxed">
              SmartDELHI uses live camera
              evidence for complaint
              verification. Gemini AI analyzes
              the captured photograph before
              the complaint is registered.
              Complaints that are declined or
              require manual review are not
              automatically registered.
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}