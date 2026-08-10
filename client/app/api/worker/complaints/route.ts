import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

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

    // =====================================================
    // WORKER ROLE CHECK
    // =====================================================

    if (user.role !== "WORKER") {
      return NextResponse.json(
        {
          success: false,
          message: "Worker access required",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // QUERY PARAMETERS
    // =====================================================

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");

    const assignedOnly =
      searchParams.get("assignedOnly") === "true";

    // =====================================================
    // WHERE CONDITION
    // =====================================================

    const where: {
      assignedWorkerId?: string;
      ward?: string;
      status?: string;
      OR?: Array<{
        assignedWorkerId?: string;
        ward?: string;
      }>;
    } = {};

    /*
     * =====================================================
     * ASSIGNED ONLY
     * =====================================================
     *
     * If assignedOnly=true:
     *
     * Worker sees ONLY complaints assigned to them.
     *
     */

    if (assignedOnly) {
      where.assignedWorkerId = user.id;
    } else {
      /*
       * ===================================================
       * NORMAL WORKER VIEW
       * ===================================================
       *
       * Worker can see:
       *
       * 1. Complaints directly assigned to them
       * 2. Complaints belonging to their ward
       *
       */

      where.OR = [
        {
          assignedWorkerId: user.id,
        },
        {
          ward: user.ward ?? undefined,
        },
      ];
    }

    // =====================================================
    // STATUS FILTER
    // =====================================================

    if (status) {
      where.status = status;
    }

    // =====================================================
    // FETCH COMPLAINTS
    // =====================================================

    const complaints = await prisma.complaint.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        // =================================================
        // CITIZEN
        // =================================================

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            ward: true,
          },
        },

        // =================================================
        // ASSIGNED WORKER
        // =================================================

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

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,
      count: complaints.length,
      assignedOnly,
      status: status || null,
      worker: {
        id: user.id,
        name: user.name,
        ward: user.ward,
      },
      complaints,
    });
  } catch (error) {
    console.error(
      "WORKER_COMPLAINTS_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch worker complaints",
      },
      { status: 500 }
    );
  }
}