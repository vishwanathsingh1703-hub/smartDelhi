import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
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

    const workers = await prisma.user.findMany({
      where: {
        role: "WORKER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ward: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            assignedComplaints: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (error) {
    console.error("ADMIN_WORKERS_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch workers",
      },
      { status: 500 }
    );
  }
}