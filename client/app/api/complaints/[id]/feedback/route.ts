import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const citizen = await getSessionUser();

    // 1. Authentication Check
    if (!citizen) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Not logged in",
        },
        { status: 401 }
      );
    }

    // 2. Role Access Check
    if (citizen.role !== "CITIZEN") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Only citizens can submit feedback",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    // Support both feedbackType (GOOD/SATISFACTORY/BAD) and numeric rating (1 to 5)
    let rating = Number(body.rating);
    let feedbackType = String(body.feedbackType || "").toUpperCase();

    if (!rating && feedbackType) {
      const feedbackMap: Record<string, number> = {
        GOOD: 5,
        SATISFACTORY: 3,
        BAD: 1,
      };
      rating = feedbackMap[feedbackType] || 0;
    }

    if (!feedbackType && rating >= 1 && rating <= 5) {
      if (rating >= 4) feedbackType = "GOOD";
      else if (rating >= 3) feedbackType = "SATISFACTORY";
      else feedbackType = "BAD";
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid rating. Must be between 1-5 or GOOD/SATISFACTORY/BAD.",
        },
        { status: 400 }
      );
    }

    // 3. Find Complaint with Existing Feedback
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        feedback: true,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          error: "Complaint not found",
        },
        { status: 404 }
      );
    }

    // 4. Ownership Check
    if (complaint.userId !== citizen.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only give feedback on your own complaint",
        },
        { status: 403 }
      );
    }

    // 5. Work Completion Check
    if (!complaint.workCompletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot leave feedback before the worker completes the work",
        },
        { status: 400 }
      );
    }

    // 6. Duplicate Feedback Check
    if (complaint.feedback) {
      return NextResponse.json(
        {
          success: false,
          error: "Feedback has already been submitted for this complaint",
        },
        { status: 400 }
      );
    }

    const isPositive = rating >= 3;
    const isBad = rating < 3;

    // 7. Atomic DB Transaction (Create Feedback + Update Status)
    const result = await prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.create({
        data: {
          complaintId: complaint.id,
          citizenId: citizen.id,
          workerId: complaint.assignedWorkerId,
          rating,
          description: description || feedbackType,
          userId: citizen.id,
        },
      });

      const updatedComplaint = await tx.complaint.update({
        where: { id: complaint.id },
        data: isPositive
          ? {
              status: "Resolved",
              citizenVerified: true,
              citizenVerifiedAt: new Date(),
            }
          : {
              status: "Pending",
              citizenVerified: false,
              citizenVerifiedAt: null,
            },
      });

      return {
        feedback,
        complaint: updatedComplaint,
      };
    });

    // 8. Notifications Logic
    if (complaint.assignedWorkerId) {
      await prisma.notification.create({
        data: {
          userId: complaint.assignedWorkerId,
          title: isBad ? "Complaint Reopened" : "Complaint Resolved",
          message: isBad
            ? `Citizen reported that the work for "${complaint.title}" was not satisfactory. Admin review is pending.`
            : `Citizen marked "${complaint.title}" as resolved with rating ${rating}/5.`,
          type: isBad ? "COMPLAINT_REOPENED" : "COMPLAINT_RESOLVED",
        },
      });
    }

    if (isBad) {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", isActive: true },
        select: { id: true },
      });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: "Complaint Requires Attention",
            message: `Citizen reported BAD feedback for complaint "${complaint.title}". Admin review required.`,
            type: "BAD_COMPLAINT_FEEDBACK",
          })),
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: isPositive
          ? "Thank you! Complaint has been verified & automatically resolved."
          : "Feedback submitted. Complaint remains pending for admin review.",
        feedback: result.feedback,
        complaint: result.complaint,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("COMPLAINT_FEEDBACK_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit feedback due to internal server error.",
      },
      { status: 500 }
    );
  }
}