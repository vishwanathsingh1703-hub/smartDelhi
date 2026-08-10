import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    /*
     * =====================================================
     * AUTHENTICATION
     * =====================================================
     */

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    /*
     * =====================================================
     * CITIZEN ONLY
     * =====================================================
     */

    if (user.role !== "CITIZEN") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Citizen access required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      complaintId,
      reason,
      videoUrl,
      imageUrls,
    } = body;

    /*
     * =====================================================
     * VALIDATION
     * =====================================================
     */

    if (!complaintId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Complaint ID is required.",
        },
        { status: 400 }
      );
    }

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

    if (
      !videoUrl ||
      typeof videoUrl !== "string" ||
      !videoUrl.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A complaint evidence video is required for appeal.",
        },
        { status: 400 }
      );
    }

    /*
     * =====================================================
     * FIND COMPLAINT
     * =====================================================
     */

    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id: String(complaintId),
        },
      });

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Complaint not found.",
        },
        { status: 404 }
      );
    }

    /*
     * =====================================================
     * OWNERSHIP CHECK
     * =====================================================
     */

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

    /*
     * =====================================================
     * ONLY DECLINED / MANUAL_REVIEW
     * COMPLAINTS CAN BE APPEALED
     * =====================================================
     */

    const currentDecision =
      String(
        complaint.aiDecision || ""
      )
        .trim()
        .toUpperCase();

    if (
      currentDecision !== "DECLINED" &&
      currentDecision !== "MANUAL_REVIEW"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This complaint does not require an appeal.",
        },
        { status: 400 }
      );
    }

    /*
     * =====================================================
     * PREVENT DUPLICATE APPEALS
     * =====================================================
     */

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

    /*
     * =====================================================
     * NORMALIZE IMAGES
     * =====================================================
     */

    const normalizedImageUrls =
      Array.isArray(imageUrls)
        ? imageUrls
            .filter(
              (url: unknown) =>
                typeof url === "string" &&
                url.trim().length > 0
            )
            .map(
              (url: string) =>
                url.trim()
            )
        : complaint.imageUrls;

    /*
     * =====================================================
     * UPDATE COMPLAINT
     * =====================================================
     */

    const updatedComplaint =
      await prisma.complaint.update({
        where: {
          id: complaint.id,
        },

        data: {
          adminAppeal: true,

          adminAppealReason:
            normalizedReason,

          videoUrl:
            String(videoUrl).trim(),

          imageUrls:
            normalizedImageUrls,

          aiDecision:
            "MANUAL_REVIEW",

          status:
            "PENDING",

          /*
           * Keep the original AI analysis timestamp.
           */
          aiAnalyzedAt:
            complaint.aiAnalyzedAt,
        },
      });

    /*
     * =====================================================
     * FIND ACTIVE ADMINS
     * =====================================================
     */

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

    /*
     * =====================================================
     * ADMIN NOTIFICATIONS
     * =====================================================
     */

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(
          (admin) => ({
            userId: admin.id,

            title:
              "New Complaint Appeal",

            message:
              `Citizen ${user.name || "Citizen"} has appealed an AI-declined complaint.`,

            type:
              "COMPLAINT_APPEAL",
          })
        ),
      });
    }

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return NextResponse.json({
      success: true,

      message:
        "Your appeal has been sent to the administrator for manual review.",

      complaint:
        updatedComplaint,
    });
  } catch (error) {
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