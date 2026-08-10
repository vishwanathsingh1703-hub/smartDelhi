import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// Distance Calculation Function (Haversine Formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    if (worker.role !== "WORKER") {
      return NextResponse.json(
        {
          success: false,
          message: "Worker access required.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const workerLatitude = Number(body.latitude);
    const workerLongitude = Number(body.longitude);

    // 1. Geolocation Input Validation
    if (
      !Number.isFinite(workerLatitude) ||
      !Number.isFinite(workerLongitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid worker GPS coordinates are required.",
        },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
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

    // 2. Ownership Check
    if (complaint.assignedWorkerId !== worker.id) {
      return NextResponse.json(
        {
          success: false,
          message: "This complaint is not assigned to you.",
        },
        { status: 403 }
      );
    }

    // 3. Complaint Location Availability Check
    if (complaint.latitude === null || complaint.longitude === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint location is not available for GPS verification.",
        },
        { status: 400 }
      );
    }

    // 4. GPS Distance Verification (100 Meters Radius Rule)
    const distance = calculateDistance(
      complaint.latitude,
      complaint.longitude,
      workerLatitude,
      workerLongitude
    );

    if (distance > 100) {
      return NextResponse.json(
        {
          success: false,
          message: `You must be within 100 meters of the complaint location to mark it as completed. Current distance: ${Math.round(distance)}m`,
          distance: Math.round(distance),
        },
        { status: 403 }
      );
    }

    if (complaint.citizenVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "This complaint has already been verified by the citizen.",
        },
        { status: 400 }
      );
    }

    const completedAt = new Date();

    // 5. Update Complaint Status & Details
    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        status: "Completed",
        workCompletedAt: completedAt,
        citizenVerified: false,
        citizenVerifiedAt: null,
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

    // 6. Notify Citizen
    if (complaint.userId) {
      await prisma.notification.create({
        data: {
          userId: complaint.userId,
          title: "Work Completed",
          message: `Worker has completed the work for "${complaint.title}". Please verify the work and submit your feedback.`,
          type: "WORK_COMPLETED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Work marked as completed. Waiting for citizen verification.",
      complaint: updatedComplaint,
      distance: Math.round(distance),
    });
  } catch (error) {
    console.error("WORKER_COMPLETE_COMPLAINT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to complete complaint due to internal server error.",
      },
      { status: 500 }
    );
  }
}