import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // CITIZEN ONLY
    // =====================================================

    if (user.role !== "CITIZEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Citizen access required.",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // REQUEST BODY
    // =====================================================

    const body = await request.json();

    const {
      complaintId,
      reason,
      videoUrl,
      imageUrl,
      imageUrls,
    } = body;

    // =====================================================
    // COMPLAINT ID VALIDATION
    // =====================================================

    const normalizedComplaintId =
      typeof complaintId === "string"
        ? complaintId.trim()
        : "";

    if (!normalizedComplaintId) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint ID is required.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // APPEAL REASON VALIDATION
    // =====================================================

    const normalizedReason =
      typeof reason === "string"
        ? reason.trim()
        : "";

    if (normalizedReason.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please explain why you want to appeal in at least 10 characters.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VIDEO VALIDATION
    //
    // Appeal evidence video is mandatory.
    // =====================================================

    const normalizedVideoUrl =
      typeof videoUrl === "string"
        ? videoUrl.trim()
        : "";

    if (!normalizedVideoUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A complaint evidence video is required for appeal.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // FIND COMPLAINT
    // =====================================================

    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id: normalizedComplaintId,
        },
      });

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint not found.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // OWNERSHIP CHECK
    // =====================================================

    if (complaint.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot appeal this complaint.",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // CURRENT AI DECISION
    // =====================================================

    const currentDecision =
      String(
        complaint.aiDecision || ""
      )
        .trim()
        .toUpperCase();

    // Only AI-declined or manual-review complaints
    // can be appealed.

    if (
      currentDecision !== "DECLINED" &&
      currentDecision !== "MANUAL_REVIEW"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This complaint does not require an appeal.",
          aiDecision:
            currentDecision || null,
        },
        { status: 400 }
      );
    }

    // =====================================================
    // DUPLICATE APPEAL PREVENTION
    // =====================================================

    if (complaint.adminAppeal === true) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An appeal has already been submitted for this complaint.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // NORMALIZE IMAGE EVIDENCE
    //
    // Supports:
    // - imageUrls[]
    // - imageUrl
    // - existing complaint images
    //
    // This allows the frontend camera-capture system
    // to send multiple evidence photographs.
    // =====================================================

    let normalizedImageUrls: string[] = [];

    if (Array.isArray(imageUrls)) {
      normalizedImageUrls = imageUrls
        .filter(
          (url: unknown): url is string =>
            typeof url === "string" &&
            url.trim().length > 0
        )
        .map(
          (url: string) =>
            url.trim()
        );
    }

    // If no new images were supplied,
    // preserve the original complaint images.

    if (
      normalizedImageUrls.length === 0 &&
      Array.isArray(complaint.imageUrls)
    ) {
      normalizedImageUrls =
        complaint.imageUrls.filter(
          (url: unknown): url is string =>
            typeof url === "string" &&
            url.trim().length > 0
        );
    }

    // Backward compatibility with imageUrl.

    if (
      normalizedImageUrls.length === 0 &&
      typeof imageUrl === "string" &&
      imageUrl.trim().length > 0
    ) {
      normalizedImageUrls = [
        imageUrl.trim(),
      ];
    }

    // =====================================================
    // PHOTO EVIDENCE REQUIRED
    // =====================================================

    if (normalizedImageUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one complaint evidence photograph is required for appeal.",
        },
        { status: 400 }
      );
    }

    // Maximum five evidence photographs.

    if (normalizedImageUrls.length > 5) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A maximum of 5 evidence photographs are allowed.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // UPDATE COMPLAINT
    // =====================================================

    const updatedComplaint =
      await prisma.complaint.update({
        where: {
          id: complaint.id,
        },

        data: {
          // -------------------------------------------------
          // APPEAL INFORMATION
          // -------------------------------------------------

          adminAppeal: true,

          adminAppealReason:
            normalizedReason,

          // -------------------------------------------------
          // NEW EVIDENCE
          // -------------------------------------------------

          videoUrl:
            normalizedVideoUrl,

          imageUrls:
            normalizedImageUrls,

          // Keep first image synchronized
          // with imageUrl for compatibility.

          imageUrl:
            normalizedImageUrls[0] ||
            complaint.imageUrl,

          // -------------------------------------------------
          // MANUAL REVIEW
          // -------------------------------------------------

          aiDecision:
            "MANUAL_REVIEW",

          status:
            "PENDING",

          // -------------------------------------------------
          // PRESERVE ORIGINAL AI ANALYSIS
          // -------------------------------------------------

          aiAnalyzedAt:
            complaint.aiAnalyzedAt,
        },
      });

    // =====================================================
    // FIND ACTIVE ADMINS
    // =====================================================

    const admins =
      await prisma.user.findMany({
        where: {
          role: "ADMIN",
          isActive: true,
        },

        select: {
          id: true,
        },
      });

    // =====================================================
    // ADMIN NOTIFICATIONS
    // =====================================================

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(
          (admin) => ({
            userId: admin.id,

            title:
              "New Complaint Appeal",

            message:
              `Citizen ${
                user.name || "Citizen"
              } has appealed an AI-declined complaint and submitted new evidence for manual review.`,

            type:
              "COMPLAINT_APPEAL",
          })
        ),
      });
    }

    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Your appeal has been submitted to the administrator for manual review.",

        complaint: {
          id: updatedComplaint.id,

          title:
            updatedComplaint.title,

          category:
            updatedComplaint.category,

          ward:
            updatedComplaint.ward,

          status:
            updatedComplaint.status,

          aiDecision:
            updatedComplaint.aiDecision,

          adminAppeal:
            updatedComplaint.adminAppeal,

          adminAppealReason:
            updatedComplaint.adminAppealReason,

          imageUrls:
            updatedComplaint.imageUrls,

          videoUrl:
            updatedComplaint.videoUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // =====================================================
    // ERROR HANDLING
    // =====================================================

    console.error(
      "COMPLAINT_APPEAL_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to submit complaint appeal.",
      },
      { status: 500 }
    );
  }
}