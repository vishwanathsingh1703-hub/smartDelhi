import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// =====================================================
// GET — SINGLE COMPLAINT
// =====================================================

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Complaint ID is required.",
        },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            ward: true,
          },
        },

        assignedWorker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            ward: true,
          },
        },

        feedback: true,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          error: "Complaint not found.",
        },
        { status: 404 }
      );
    }

    // =================================================
    // CITIZEN ACCESS
    // =================================================

    if (
      user.role === "CITIZEN" &&
      complaint.userId !== user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to view this complaint.",
        },
        { status: 403 }
      );
    }

    // =================================================
    // WORKER ACCESS
    // =================================================

    if (
      user.role === "WORKER" &&
      complaint.assignedWorkerId !== user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This complaint is not assigned to you.",
        },
        { status: 403 }
      );
    }

    // ADMIN can access all complaints.

    return NextResponse.json({
      success: true,

      complaint: {
        id: complaint.id,

        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        ward: complaint.ward,

        status: complaint.status,
        priority: complaint.priority,

        // =============================================
        // LOCATION
        // =============================================

        latitude: complaint.latitude,
        longitude: complaint.longitude,

        // =============================================
        // CITIZEN EVIDENCE
        // =============================================

        imageUrl: complaint.imageUrl,
        imageUrls: complaint.imageUrls,
        videoUrl: complaint.videoUrl,

        // =============================================
        // AI VERIFICATION
        // =============================================

        aiVerified: complaint.aiVerified,
        aiDecision: complaint.aiDecision,
        aiSeverity: complaint.aiSeverity,
        aiScore: complaint.aiScore,
        aiReason: complaint.aiReason,
        aiAnalysis: complaint.aiAnalysis,
        aiDetectedIssue: complaint.aiDetectedIssue,
        aiAnalyzedAt: complaint.aiAnalyzedAt,

        // =============================================
        // ADMIN REVIEW / ESCALATION
        // =============================================

        adminAppeal: complaint.adminAppeal,
        adminAppealReason: complaint.adminAppealReason,
        adminDecision: complaint.adminDecision,
        adminReviewedAt: complaint.adminReviewedAt,

        // =============================================
        // WORK STATUS
        // =============================================

        workCompletedAt: complaint.workCompletedAt,

        citizenVerified: complaint.citizenVerified,

        citizenVerifiedAt: complaint.citizenVerifiedAt,

        // =============================================
        // TIMESTAMPS
        // =============================================

        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,

        // =============================================
        // RELATIONS
        // =============================================

        user: complaint.user,

        assignedWorker: complaint.assignedWorker,

        feedback: complaint.feedback,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/complaints/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch complaint.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH — UPDATE COMPLAINT
// =====================================================

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Complaint ID is required.",
        },
        { status: 400 }
      );
    }

   const complaint = await prisma.complaint.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            ward: true,
          },
        },

        assignedWorker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            ward: true,
          },
        },

        feedback: true,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          error: "Complaint not found.",
        },
        { status: 404 }
      );
    }

    // =================================================
    // CITIZEN PERMISSION
    // =================================================

    if (
      user.role === "CITIZEN" &&
      complaint.userId !== user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to update this complaint.",
        },
        { status: 403 }
      );
    }

    // =================================================
    // ROLE CHECK
    // =================================================

    if (
      !["CITIZEN", "ADMIN", "WORKER"].includes(
        user.role
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied.",
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
      status,
      latitude,
      longitude,
      imageUrl,
      imageUrls,

      // New evidence fields
      videoUrl,

      // AI fields
      aiVerified,
      aiDecision,
      aiSeverity,
      aiScore,
      aiReason,
      aiAnalysis,
      aiDetectedIssue,
      aiAnalyzedAt,

      // Escalation fields
      adminAppeal,
      adminAppealReason,
      adminDecision,
      adminReviewedAt,
    } = body;

    // =================================================
    // CITIZEN CANNOT DIRECTLY CHANGE STATUS
    // =================================================

    if (
      user.role === "CITIZEN" &&
      status !== undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Citizens cannot change complaint status.",
        },
        { status: 403 }
      );
    }

    // =================================================
    // PRIORITY VALIDATION
    // =================================================

    const allowedPriorities = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ];

    if (
      priority !== undefined &&
      !allowedPriorities.includes(priority)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid priority.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // STATUS VALIDATION
    // =================================================

    const allowedStatuses = [
      "PENDING",
      "IN_PROGRESS",
      "RESOLVED",
      "REJECTED",
      "Pending Admin Review",
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid complaint status.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // AI DECISION VALIDATION
    // =================================================

    const allowedAIDecisions = [
      "APPROVED",
      "DECLINED",
      "MANUAL_REVIEW",
    ];

    if (
      aiDecision !== undefined &&
      !allowedAIDecisions.includes(aiDecision)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid AI decision.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // AI SCORE VALIDATION
    // =================================================

    if (aiScore !== undefined) {
      const score = Number(aiScore);

      if (
        !Number.isFinite(score) ||
        score < 0 ||
        score > 100
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "AI score must be between 0 and 100.",
          },
          { status: 400 }
        );
      }
    }

    // =================================================
    // COORDINATE VALIDATION
    // =================================================

    if (latitude !== undefined) {
      const lat = Number(latitude);

      if (
        !Number.isFinite(lat) ||
        lat < -90 ||
        lat > 90
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid latitude.",
          },
          { status: 400 }
        );
      }
    }

    if (longitude !== undefined) {
      const lng = Number(longitude);

      if (
        !Number.isFinite(lng) ||
        lng < -180 ||
        lng > 180
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid longitude.",
          },
          { status: 400 }
        );
      }
    }

    // =================================================
    // UPDATE DATA
    // =================================================

    const updateData: Record<string, unknown> = {};

    // -------------------------------------------------
    // BASIC FIELDS
    // -------------------------------------------------

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        title.trim().length < 5
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid complaint title.",
          },
          { status: 400 }
        );
      }

      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        description.trim().length < 10
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid complaint description.",
          },
          { status: 400 }
        );
      }

      updateData.description =
        description.trim();
    }

    if (category !== undefined) {
      updateData.category =
        String(category).trim();
    }

    if (ward !== undefined) {
      updateData.ward =
        String(ward).trim();
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    // -------------------------------------------------
    // LOCATION
    // -------------------------------------------------

    if (latitude !== undefined) {
      updateData.latitude =
        Number(latitude);
    }

    if (longitude !== undefined) {
      updateData.longitude =
        Number(longitude);
    }

    // -------------------------------------------------
    // PHOTO / MEDIA
    // -------------------------------------------------

    if (imageUrl !== undefined) {
      updateData.imageUrl =
        typeof imageUrl === "string"
          ? imageUrl.trim() || null
          : null;
    }

    if (imageUrls !== undefined && Array.isArray(imageUrls)) {
      updateData.imageUrls = imageUrls;
    }

    // -------------------------------------------------
    // VIDEO
    // -------------------------------------------------

    if (videoUrl !== undefined) {
      updateData.videoUrl =
        typeof videoUrl === "string"
          ? videoUrl.trim() || null
          : null;
    }

    // -------------------------------------------------
    // AI VERIFICATION
    // -------------------------------------------------

    if (aiVerified !== undefined) {
      updateData.aiVerified =
        Boolean(aiVerified);
    }

    if (aiDecision !== undefined) {
      updateData.aiDecision =
        aiDecision;
    }

    if (aiSeverity !== undefined) {
      updateData.aiSeverity =
        aiSeverity;
    }

    if (aiScore !== undefined) {
      updateData.aiScore =
        Number(aiScore);
    }

    if (aiReason !== undefined) {
      updateData.aiReason =
        typeof aiReason === "string"
          ? aiReason.trim() || null
          : null;
    }

    if (aiDetectedIssue !== undefined) {
      updateData.aiDetectedIssue =
        typeof aiDetectedIssue === "string"
          ? aiDetectedIssue.trim() || null
          : null;
    }

    if (aiAnalysis !== undefined) {
      updateData.aiAnalysis = aiAnalysis;
    }

    if (aiAnalyzedAt !== undefined) {
      updateData.aiAnalyzedAt =
        aiAnalyzedAt
          ? new Date(aiAnalyzedAt)
          : null;
    }

    // -------------------------------------------------
    // ESCALATION / APPEAL
    // -------------------------------------------------

    if (adminAppeal !== undefined) {
      updateData.adminAppeal =
        Boolean(adminAppeal);
    }

    if (adminAppealReason !== undefined) {
      updateData.adminAppealReason =
        typeof adminAppealReason === "string"
          ? adminAppealReason.trim() || null
          : null;
    }

    if (adminDecision !== undefined) {
      updateData.adminDecision =
        typeof adminDecision === "string"
          ? adminDecision.trim() || null
          : null;
    }

    if (adminReviewedAt !== undefined) {
      updateData.adminReviewedAt =
        adminReviewedAt
          ? new Date(adminReviewedAt)
          : null;
    }

    // =================================================
    // UPDATE DATABASE
    // =================================================

    const updatedComplaint =
      await prisma.complaint.update({
        where: {
          id,
        },
        data: updateData,
      });

    return NextResponse.json({
      success: true,
      message:
        "Complaint updated successfully.",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error(
      "PATCH /api/complaints/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to update complaint.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE — DELETE COMPLAINT
// =====================================================

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Complaint ID is required.",
        },
        { status: 400 }
      );
    }

    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id,
        },
      });

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          error: "Complaint not found.",
        },
        { status: 404 }
      );
    }

    // =================================================
    // ONLY OWNER OR ADMIN
    // =================================================

    if (
      user.role === "CITIZEN" &&
      complaint.userId !== user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to delete this complaint.",
        },
        { status: 403 }
      );
    }

    if (
      !["CITIZEN", "ADMIN"].includes(
        user.role
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only citizens and admins can delete complaints.",
        },
        { status: 403 }
      );
    }

    // =================================================
    // RESOLVED COMPLAINT PROTECTION
    // =================================================

    if (
      user.role === "CITIZEN" &&
      complaint.status === "RESOLVED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resolved complaints cannot be deleted.",
        },
        { status: 400 }
      );
    }

    await prisma.complaint.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Complaint deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/complaints/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to delete complaint.",
      },
      { status: 500 }
    );
  }
}