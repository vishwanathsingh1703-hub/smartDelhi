import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (user.role !== "CITIZEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Citizen access required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      category,
      ward,
      priority,
      imageUrl,
      imageUrls,
      videoUrl,
      latitude,
      longitude,
      address,

      aiVerified,
      aiDecision,
      aiSeverity,
      aiScore,
      aiReason,
      aiDetectedIssue,
      aiAnalysis,
    } = body;

    /*
     * =====================================================
     * BASIC VALIDATION
     * =====================================================
     */

    if (
      !title ||
      !description ||
      !category ||
      !ward
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, description, category and ward are required.",
        },
        { status: 400 }
      );
    }

    /*
     * =====================================================
     * IMAGE VALIDATION
     * =====================================================
     */

    const normalizedImageUrls = Array.isArray(imageUrls)
      ? imageUrls
          .filter(
            (url: unknown) =>
              typeof url === "string" &&
              url.trim().length > 0
          )
          .map((url: string) => url.trim())
      : [];

    const finalImageUrls =
      normalizedImageUrls.length > 0
        ? normalizedImageUrls
        : imageUrl
          ? [String(imageUrl).trim()]
          : [];

    if (finalImageUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one complaint photo is required.",
        },
        { status: 400 }
      );
    }

    /*
     * =====================================================
     * VIDEO VALIDATION
     * =====================================================
     */

    if (
      !videoUrl ||
      typeof videoUrl !== "string" ||
      !videoUrl.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Complaint video is required.",
        },
        { status: 400 }
      );
    }

    /*
     * =====================================================
     * AI DECISION VALIDATION
     *
     * Only APPROVED complaints can be automatically
     * registered.
     *
     * DECLINED / MANUAL_REVIEW are NOT registered here.
     * =====================================================
     */

    const normalizedAiDecision = String(
      aiDecision || ""
    )
      .trim()
      .toUpperCase();

    if (normalizedAiDecision !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          message:
            normalizedAiDecision === "MANUAL_REVIEW"
              ? "Complaint requires manual review before registration."
              : "Complaint cannot be registered because AI verification did not approve it.",
          aiDecision:
            normalizedAiDecision || "MANUAL_REVIEW",
        },
        { status: 400 }
      );
    }

    /*
     * =====================================================
     * AI SCORE
     * =====================================================
     */

    let normalizedAiScore: number | null = null;

    if (
      aiScore !== undefined &&
      aiScore !== null &&
      aiScore !== ""
    ) {
      const parsedScore = Number(aiScore);

      if (Number.isFinite(parsedScore)) {
        normalizedAiScore = Math.max(
          0,
          Math.min(100, parsedScore)
        );
      }
    }

    /*
     * =====================================================
     * LOCATION
     * =====================================================
     */

    let normalizedLatitude: number | null = null;
    let normalizedLongitude: number | null = null;

    if (
      latitude !== undefined &&
      latitude !== null &&
      latitude !== ""
    ) {
      const parsedLatitude = Number(latitude);

      if (Number.isFinite(parsedLatitude)) {
        normalizedLatitude = parsedLatitude;
      }
    }

    if (
      longitude !== undefined &&
      longitude !== null &&
      longitude !== ""
    ) {
      const parsedLongitude = Number(longitude);

      if (Number.isFinite(parsedLongitude)) {
        normalizedLongitude = parsedLongitude;
      }
    }

    /*
     * =====================================================
     * CREATE COMPLAINT
     * =====================================================
     */

    const complaint = await prisma.complaint.create({
      data: {
        title: String(title).trim(),

        description:
          String(description).trim(),

        category:
          String(category).trim(),

        ward:
          String(ward).trim(),

        status: "PENDING",

        priority: priority
          ? String(priority)
              .trim()
              .toUpperCase()
          : "MEDIUM",

        imageUrl:
          finalImageUrls[0] || null,

        imageUrls:
          finalImageUrls,

        videoUrl:
          String(videoUrl).trim(),

        latitude:
          normalizedLatitude,

        longitude:
          normalizedLongitude,

        userId:
          user.id,

        aiVerified:
          aiVerified !== false,

        aiDecision:
          "APPROVED",

        aiSeverity:
          aiSeverity
            ? String(aiSeverity).trim()
            : null,

        aiScore:
          normalizedAiScore,

        aiReason:
          aiReason
            ? String(aiReason).trim()
            : null,

        aiDetectedIssue:
          aiDetectedIssue
            ? String(aiDetectedIssue).trim()
            : null,

        aiAnalysis:
          aiAnalysis ?? undefined,

        aiAnalyzedAt:
          new Date(),

        /*
         * Address is included only if your Prisma
         * Complaint model contains an address field.
         *
         * If Prisma gives an "Unknown argument address"
         * error, remove the next property.
         */
        ...(address
          ? {
              address:
                String(address).trim(),
            }
          : {}),
      },
    });

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return NextResponse.json(
      {
        success: true,
        message:
          "Complaint registered successfully.",
        complaint,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "COMPLAINT_REGISTER_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to register complaint.",
      },
      { status: 500 }
    );
  }
}