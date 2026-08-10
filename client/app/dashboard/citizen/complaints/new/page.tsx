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
  Image as ImageIcon,
  Info,
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
  decision?: string;
  score?: number;
  issueDetected?: string;
  severity?: string;
  estimatedQuantity?: string;
  reason?: string;
  citizenMessage?: string;
  verified?: boolean;
  detectedIssue?: string;
  analysis?: any;
};

export default function NewComplaintPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [ward, setWard] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");

  // Media
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState("");

  // Submission states
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // AI verification
  const [verification, setVerification] =
    useState<VerificationResult | null>(null);

  // Refs
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const fileToDataUrl = (
    file: File
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          if (
            typeof reader.result ===
            "string"
          ) {
            resolve(reader.result);
          } else {
            reject(
              new Error(
                "Failed to read image file."
              )
            );
          }
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Failed to read image file."
            )
          );
        };

        reader.readAsDataURL(file);
      }
    );
  };

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
        const firstResult = data.results[0];

        setAddress(
          firstResult.formatted_address || ""
        );

        let detectedWard = "";

        firstResult.address_components?.forEach(
          (component: any) => {
            if (
              component.types?.includes(
                "sublocality"
              ) ||
              component.types?.includes(
                "sublocality_level_1"
              )
            ) {
              detectedWard = component.long_name;
            }

            if (
              component.long_name
                ?.toLowerCase()
                .includes("ward")
            ) {
              detectedWard = component.long_name;
            }
          }
        );

        if (detectedWard && !ward) {
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

    marker.addListener("dragend", () => {
      const position =
        marker.getPosition();

      if (position) {
        reverseGeocode(
          position.lat(),
          position.lng()
        );
      }
    });

    map.addListener(
      "click",
      (event: any) => {
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

  const handleUseCurrentLocation = () => {
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
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(
            currentPosition
          );

          mapInstanceRef.current.setZoom(16);
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
   * PHOTO SELECTION
   * =====================================================
   */

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    setError("");

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        return false;
      }

      return true;
    });

    if (!validFiles.length) {
      setError(
        "Please upload valid image files under 10 MB each."
      );
      return;
    }

    const combined = [
      ...photos,
      ...validFiles,
    ].slice(0, 5);

    setPhotos(combined);

    photoPreviews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setPhotoPreviews(
      combined.map((file) =>
        URL.createObjectURL(file)
      )
    );

    event.target.value = "";
  };

  /*
   * =====================================================
   * REMOVE PHOTO
   * =====================================================
   */

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter(
      (_, photoIndex) =>
        photoIndex !== index
    );

    setPhotos(newPhotos);

    photoPreviews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setPhotoPreviews(
      newPhotos.map((file) =>
        URL.createObjectURL(file)
      )
    );
  };

  /*
   * =====================================================
   * VIDEO SELECTION
   * =====================================================
   */

  const handleVideoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("video/")) {
      setError(
        "Please upload a valid video file."
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError(
        "Video size must be below 50 MB."
      );
      return;
    }

    setVideo(file);

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoPreview(
      URL.createObjectURL(file)
    );

    event.target.value = "";
  };

  /*
   * =====================================================
   * REMOVE VIDEO
   * =====================================================
   */

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideo(null);
    setVideoPreview("");
  };

  /*
   * =====================================================
   * UPLOAD MEDIA
   * =====================================================
   */

  const uploadMedia = async () => {
    const formData = new FormData();

    photos.forEach((photo) => {
      formData.append("images", photo);
    });

    if (video) {
      formData.append("video", video);
    }

    const response = await fetch(
      "/api/uploads",
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "Failed to upload complaint media."
      );
    }

    return {
      imageUrls:
        Array.isArray(data?.imageUrls)
          ? data.imageUrls
          : [],
      videoUrl:
        typeof data?.videoUrl === "string"
          ? data.videoUrl
          : null,
    };
  };

  /*
   * =====================================================
   * AI GEMINI VERIFICATION
   * =====================================================
   */

  const verifyComplaint = async () => {
    if (!photos.length) {
      throw new Error(
        "At least one complaint photo is required."
      );
    }

    const image =
      await fileToDataUrl(
        photos[0]
      );

    const response =
      await fetch(
        "/api/ai/verify-complaint",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            ward: ward.trim(),
            image,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
        "AI verification failed."
      );
    }

    // Support both 'verification' and 'analysis' response shapes safely
    const result = data?.verification || data?.analysis;

    if (!result) {
      throw new Error(
        "Invalid AI verification response."
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
      if (!title.trim()) {
        throw new Error(
          "Complaint title is required."
        );
      }

      if (title.trim().length < 5) {
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

      if (description.trim().length < 10) {
        throw new Error(
          "Complaint description must contain at least 10 characters."
        );
      }

      if (!photos.length) {
        throw new Error(
          "Complaint photo is mandatory. Please upload at least one photo."
        );
      }

      if (!video) {
        throw new Error(
          "A 10-second complaint video is mandatory before registration."
        );
      }

      setLoading(true);
      setVerifying(true);

      const aiResult =
        await verifyComplaint();

      setVerification(aiResult);
      setVerifying(false);

      const decision =
        String(
          aiResult?.decision || ""
        ).toUpperCase();

      if (
        decision === "DECLINED" ||
        decision === "REJECTED"
      ) {
        setError(
          aiResult?.reason ||
          "AI verification found that the reported issue does not meet the complaint threshold."
        );

        setLoading(false);
        return;
      }

      setUploading(true);

      const media =
        await uploadMedia();

      setUploading(false);

      if (
        !media.imageUrls.length
      ) {
        throw new Error(
          "Complaint photo upload failed."
        );
      }

      if (!media.videoUrl) {
        throw new Error(
          "Complaint video upload failed."
        );
      }

      const response =
        await fetch(
          "/api/complaints",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              title: title.trim(),
              description:
                description.trim(),
              category,
              ward:
                ward.trim() || "Unknown",
              priority,
              latitude:
                latitude.trim()
                  ? Number(latitude)
                  : null,
              longitude:
                longitude.trim()
                  ? Number(longitude)
                  : null,
              address:
                address.trim() || null,
              imageUrl:
                media.imageUrls[0],
              imageUrls:
                media.imageUrls,
              videoUrl:
                media.videoUrl,
              aiVerified:
                aiResult?.verified ??
                true,
              aiDecision:
                aiResult?.decision ||
                "APPROVED",
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
                aiResult?.detectedIssue ||
                null,
              aiAnalysis:
                aiResult?.analysis ||
                null,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          "Unable to register complaint."
        );
      }

      setSuccess(true);

      setTimeout(() => {
        router.push(
          "/dashboard/citizen"
        );
        router.refresh();
      }, 1500);
    } catch (error) {
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

  useEffect(() => {
    return () => {
      photoPreviews.forEach(
        (url) => URL.revokeObjectURL(url)
      );

      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
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
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            Civic Complaint
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Submit a Complaint
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Report a civic issue to the
            SmartDELHI municipal command
            center.
          </p>
        </div>

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

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
            Complaint verified and
            registered successfully.
            Redirecting...
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-5 sm:p-7 shadow-2xl"
        >
          <div className="space-y-6">
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
                  Leave blank to use your
                  registered ward.
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

            <div className="border-t border-white/10 pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    AI Complaint Verification
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Photo and 10-second video are
                    mandatory for complaint registration.
                  </p>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs font-semibold text-cyan-300">
                    How to capture a good complaint photo
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-400">
                  <p>✓ Capture the entire problem clearly.</p>
                  <p>✓ Keep the camera steady and focused.</p>
                  <p>✓ Take the photo from a reasonable distance.</p>
                  <p>✓ Avoid dark, blurry or obstructed photos.</p>
                  <p>✓ Show surrounding area for context.</p>
                  <p>✓ Do not cover the damaged object.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-300">
                      Complaint Photos *
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      Upload up to 5 photos • Max 10 MB each
                    </p>
                  </div>
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                </div>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    photoInputRef.current?.click()
                  }
                  disabled={photos.length >= 5}
                  className="w-full border border-dashed border-cyan-500/30 hover:border-cyan-400/60 bg-cyan-500/5 hover:bg-cyan-500/10 rounded-xl py-5 transition disabled:opacity-40"
                >
                  <Camera className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-cyan-300">
                    Add Complaint Photos
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {photos.length}/5 photos selected
                  </p>
                </button>

                {photoPreviews.length >
                  0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                      {photoPreviews.map(
                        (preview, index) => (
                          <div
                            key={`${preview}-${index}`}
                            className="relative group aspect-square rounded-xl overflow-hidden border border-white/10"
                          >
                            <img
                              src={preview}
                              alt={`Complaint photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removePhoto(
                                  index
                                )
                              }
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] text-white">
                              Photo {index + 1}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-300">
                      10-Second Complaint Video *
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      Required if AI declines the complaint and for admin escalation.
                    </p>
                  </div>
                  <Video className="w-5 h-5 text-cyan-400" />
                </div>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />

                {!video ? (
                  <button
                    type="button"
                    onClick={() =>
                      videoInputRef.current?.click()
                    }
                    className="w-full border border-dashed border-cyan-500/30 hover:border-cyan-400/60 bg-cyan-500/5 hover:bg-cyan-500/10 rounded-xl py-5 transition"
                  >
                    <Video className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-cyan-300">
                      Add 10-Second Video
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      Show the issue from multiple angles
                    </p>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-cyan-500/20">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-h-72 object-contain bg-black"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {verification && (
              <div
                className={`rounded-2xl border p-4 ${String(
                  verification.decision
                ).toUpperCase() ===
                    "DECLINED"
                    ? "border-red-500/30 bg-red-500/10"
                    : "border-emerald-500/30 bg-emerald-500/10"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <Sparkles
                    className={`w-5 h-5 mt-0.5 ${String(
                      verification.decision
                    ).toUpperCase() ===
                        "DECLINED"
                        ? "text-red-400"
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
                          {verification.decision}
                        </strong>
                      </p>
                    )}

                    {verification.severity && (
                      <p className="text-[11px] mt-1 text-gray-400">
                        Severity:{" "}
                        {verification.severity}
                      </p>
                    )}

                    {typeof verification.score ===
                      "number" && (
                        <p className="text-[11px] mt-1 text-gray-400">
                          AI Score:{" "}
                          {verification.score}
                        </p>
                      )}

                    {verification.detectedIssue && (
                      <p className="text-[11px] mt-1 text-gray-400">
                        Detected Issue:{" "}
                        {verification.detectedIssue}
                      </p>
                    )}

                    {verification.reason && (
                      <p className="text-[11px] mt-2 text-gray-400 leading-relaxed">
                        {verification.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                  onClick={
                    handleUseCurrentLocation
                  }
                  className="inline-flex items-center gap-1 text-[11px] bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg transition"
                >
                  <Navigation className="w-3 h-3" />
                  GPS Location
                </button>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-black/60 shadow-inner">
                {geocoding && (
                  <div className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-cyan-300 flex items-center gap-2 border border-cyan-500/30">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Detecting Address...
                  </div>
                )}

                {!apiKey && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 text-xs text-red-300 p-4 text-center">
                    Google Maps API key is not configured.
                  </div>
                )}

                <div
                  ref={mapRef}
                  className="w-full h-56"
                />
              </div>

              {address && (
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200">
                  <span className="font-semibold">
                    Detected Address:{" "}
                  </span>
                  {address}
                </div>
              )}

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

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  loading ||
                  success
                }
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gemini AI is verifying...
                  </>
                ) : uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading Evidence...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering Complaint...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Verify & Register Complaint
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-[10px] text-gray-600 leading-relaxed">
              Your uploaded evidence is used to
              verify the civic issue. Gemini AI
              analyzes the submitted photographs
              before the complaint is registered.
              If the issue does not meet the
              verification threshold, the complaint
              will not be automatically registered.
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}