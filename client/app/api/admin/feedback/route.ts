import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  request: NextRequest
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

    const feedback = await prisma.feedback.findMany({
      where: {
        rating: 1,
        complaint: {
          status: {
            not: "Resolved",
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        complaint: {
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
        },

        user: {
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
      count: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error(
      "ADMIN_FEEDBACK_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch admin feedback",
      },
      { status: 500 }
    );
  }
}