import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (user.role !== "CITIZEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Citizen access required",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const complaintId =
      typeof body?.complaintId === "string"
        ? body.complaintId.trim()
        : "";

    const videoUrl =
      typeof body?.videoUrl === "string"
        ? body.videoUrl.trim()
        : "";

    const reason =
      typeof body?.reason === "string"
        ? body.reason.trim()
        : "";

    if (!complaintId) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint ID is required.",
        },
        { status: 400 }
      );
    }

    if (!videoUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "A 10-second video is required for admin escalation.",
        },
        { status: 400 }
      );
    }

   const complaint = await prisma.complaint.findUnique({
  where: {
    id: complaintId,
  },
  select: {
    id: true,
    title: true,
    userId: true,
    aiDecision: true,
    status: true,
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

    if (complaint.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only escalate your own complaint.",
        },
        { status: 403 }
      );
    }

    /*
     * Escalation is intended for AI-declined complaints.
     * We still allow MANUAL_REVIEW because the admin may need
     * to inspect the citizen's evidence.
     */
    if (
      complaint.aiDecision !== "DECLINED" &&
      complaint.aiDecision !== "MANUAL_REVIEW"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This complaint does not require citizen escalation.",
        },
        { status: 400 }
      );
    }

    /*
     * Basic video validation.
     */
    if (
      videoUrl.startsWith("data:video/") &&
      videoUrl.length > 30_000_000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Video is too large. Please compress the video.",
        },
        { status: 413 }
      );
    }

    const updatedComplaint = await prisma.complaint.update({
      where: {
        id: complaint.id,
      },
      data: {
        videoUrl,
        adminAppeal: true,
        adminAppealReason:
          reason || "Citizen disagrees with AI verification result.",
        status: "Pending Admin Review",
      },
      select: {
        id: true,
        title: true,
        category: true,
        ward: true,
        status: true,
        imageUrl: true,
        videoUrl: true,
        aiDecision: true,
        aiScore: true,
        aiAnalysis: true,
        adminAppeal: true,
        adminAppealReason: true,
        adminDecision: true,
        adminReviewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    /*
     * Notify all active admins.
     */
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "Complaint Escalated",
          message: `Citizen escalated complaint "${complaint.title}" for admin review.`,
          type: "COMPLAINT_ESCALATED",
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Complaint has been sent to admin for manual review.",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("COMPLAINT_ESCALATE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to escalate complaint.",
      },
      { status: 500 }
    );
  }
}