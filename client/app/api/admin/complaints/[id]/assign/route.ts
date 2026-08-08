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
    const admin = await getSessionUser();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const body = await request.json();

    const { workerId } = body;

    if (!workerId) {
      return NextResponse.json(
        {
          success: false,
          message: "workerId is required",
        },
        { status: 400 }
      );
    }

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

    const worker = await prisma.user.findUnique({
      where: {
        id: workerId,
      },
    });

    if (!worker) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker not found",
        },
        { status: 404 }
      );
    }

    if (worker.role !== "WORKER") {
      return NextResponse.json(
        {
          success: false,
          message: "Selected user is not a worker",
        },
        { status: 400 }
      );
    }

    if (!worker.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker account is inactive",
        },
        { status: 400 }
      );
    }

    const updatedComplaint = await prisma.complaint.update({
      where: {
        id,
      },
      data: {
        assignedWorkerId: worker.id,
        status: "Assigned",
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
            phone: true,
            ward: true,
          },
        },
      },
    });

    // Notify worker
    if (worker.id) {
      await prisma.notification.create({
        data: {
          userId: worker.id,
          title: "New Complaint Assigned",
          message: `Complaint "${complaint.title}" has been assigned to you.`,
          type: "COMPLAINT_ASSIGNED",
        },
      });
    }

    // Notify citizen
    if (complaint.userId) {
      await prisma.notification.create({
        data: {
          userId: complaint.userId,
          title: "Worker Assigned",
          message: `A worker has been assigned to your complaint "${complaint.title}".`,
          type: "COMPLAINT_ASSIGNED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Complaint assigned successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("ADMIN_ASSIGN_WORKER_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign worker",
      },
      { status: 500 }
    );
  }
}