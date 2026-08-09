import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "WORKER") {
      return NextResponse.json(
        { success: false, message: "Worker access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const assignedOnly = searchParams.get("assignedOnly");

    const where: any = {};

    // Assigned complaints
    if (assignedOnly === "true") {
      where.workerId = user.id;
    } else {
      // Worker can see complaints assigned to them
      // or complaints from their ward
      where.OR = [
        {
          workerId: user.id,
        },
        {
          wardId: user.wardId,
        },
      ];
    }

    // Optional status filter
    if (status) {
      where.status = status;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        citizen: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("WORKER_COMPLAINTS_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch worker complaints",
      },
      { status: 500 }
    );
  }
}