import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const ward = searchParams.get("ward");
    const priority = searchParams.get("priority");

    const where: {
      status?: string;
      category?: string;
      ward?: string;
      priority?: string;
    } = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (ward) {
      where.ward = ward;
    }

    if (priority) {
      where.priority = priority;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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

    return NextResponse.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("ADMIN_COMPLAINTS_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch complaints",
      },
      { status: 500 }
    );
  }
}