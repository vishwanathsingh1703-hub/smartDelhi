import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const worker = await getSessionUser();

    if (!worker) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (worker.role !== "WORKER") {
      return NextResponse.json(
        {
          success: false,
          message: "Worker access required",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: {
        id,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint not found",
        },
        { status: 404 }
      );
    }

    if (complaint.assignedWorkerId !== worker.id) {
      return NextResponse.json(
        {
          success: false,
          message: "This complaint is not assigned to you",
        },
        { status: 403 }
      );
    }

    if (
      complaint.status !== "Assigned" &&
      complaint.status !== "PENDING" &&
      complaint.status !== "Pending"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Complaint cannot be accepted in ${complaint.status} status`,
        },
        { status: 400 }
      );
    }

    const updatedComplaint = await prisma.complaint.update({
      where: {
        id,
      },
      data: {
        status: "InProgress",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedWorker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (complaint.userId) {
      await prisma.notification.create({
        data: {
          userId: complaint.userId,
          title: "Complaint Accepted",
          message: `Worker has accepted your complaint "${complaint.title}" and work is now in progress.`,
          type: "COMPLAINT_ACCEPTED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Complaint accepted successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("WORKER_ACCEPT_COMPLAINT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to accept complaint",
      },
      { status: 500 }
    );
  }
}