import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  calculateWardAIScore,
  type WardScoreInput,
} from "@/lib/aiScore";

interface RouteContext {
  params: Promise<{
    wardId: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    /*
     * -----------------------------------------
     * AUTHENTICATION
     * -----------------------------------------
     */

    const user =
      await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message:
              "Authentication required.",
          },
        },
        { status: 401 },
      );
    }

    /*
     * -----------------------------------------
     * ADMIN AUTHORIZATION
     * -----------------------------------------
     */

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message:
              "Admin access required.",
          },
        },
        { status: 403 },
      );
    }

    /*
     * -----------------------------------------
     * GET WARD ID
     * -----------------------------------------
     */

    const { wardId } =
      await context.params;

    if (!wardId?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_WARD_ID",
            message:
              "Ward ID is required.",
          },
        },
        { status: 400 },
      );
    }

    /*
     * -----------------------------------------
     * FIND WARD
     * -----------------------------------------
     */

    const ward =
      await prisma.ward.findUnique({
        where: {
          id: wardId,
        },
      });

    if (!ward || !ward.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WARD_NOT_FOUND",
            message:
              "Ward not found.",
          },
        },
        { status: 404 },
      );
    }

    /*
     * -----------------------------------------
     * FETCH COMPLAINTS
     * -----------------------------------------
     */

    const complaints =
      await prisma.complaint.findMany({
        where: {
          OR: [
            {
              ward: ward.name,
            },
            {
              ward: String(
                ward.number,
              ),
            },
            {
              ward: `Ward ${ward.number}`,
            },
          ],
        },

        select: {
          id: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      });

    /*
     * -----------------------------------------
     * ACTIVE WORKERS
     * -----------------------------------------
     */

    const workers =
      await prisma.user.findMany({
        where: {
          role: "WORKER",
          isActive: true,

          OR: [
            {
              ward: ward.name,
            },
            {
              ward: String(
                ward.number,
              ),
            },
            {
              ward: `Ward ${ward.number}`,
            },
          ],
        },

        select: {
          id: true,
        },
      });

    /*
     * -----------------------------------------
     * COUNTS
     * -----------------------------------------
     */

    const totalComplaints =
      complaints.length;

    const pendingComplaints =
      complaints.filter(
        (complaint) => {
          const status =
            complaint.status
              ?.trim()
              .toLowerCase();

          return (
            status === "pending" ||
            status === "open" ||
            status === "assigned" ||
            status === "in progress" ||
            status === "in_progress"
          );
        },
      ).length;

    const resolvedComplaints =
      complaints.filter(
        (complaint) => {
          const status =
            complaint.status
              ?.trim()
              .toLowerCase();

          return (
            status === "resolved" ||
            status === "completed" ||
            status === "closed"
          );
        },
      ).length;

    const highPriorityComplaints =
      complaints.filter(
        (complaint) => {
          const priority =
            complaint.priority
              ?.trim()
              .toLowerCase();

          return (
            priority === "high" ||
            priority === "critical" ||
            priority === "urgent"
          );
        },
      ).length;

    const criticalComplaints =
      complaints.filter(
        (complaint) =>
          complaint.priority
            ?.trim()
            .toLowerCase() ===
          "critical",
      ).length;

    /*
     * -----------------------------------------
     * AVERAGE AGE
     * -----------------------------------------
     */

    const now = Date.now();

    const averageAgeDays =
      totalComplaints > 0
        ? complaints.reduce(
            (sum, complaint) => {
              const ageMs =
                now -
                complaint.createdAt.getTime();

              const ageDays =
                Math.max(
                  0,
                  ageMs /
                    (1000 *
                      60 *
                      60 *
                      24),
                );

              return sum + ageDays;
            },
            0,
          ) / totalComplaints
        : 0;

    /*
     * -----------------------------------------
     * SCORE
     * -----------------------------------------
     */

    const scoreInput: WardScoreInput = {
      ward: ward.name,

      population:
        ward.population ?? 0,

      households:
        ward.households ?? 0,

      importanceScore:
        ward.importanceScore,

      infrastructureScore:
        ward.infrastructureScore,

      totalComplaints,

      pendingComplaints,

      resolvedComplaints,

      highPriorityComplaints,

      criticalComplaints,

      activeWorkers:
        workers.length,

      averageAgeDays,
    };

    const score =
      calculateWardAIScore(
        scoreInput,
      );

    /*
     * -----------------------------------------
     * RESPONSE
     * -----------------------------------------
     */

    return NextResponse.json({
      success: true,

      timestamp:
        new Date().toISOString(),

      ward: score,
    });
  } catch (error) {
    console.error(
      "Ward AI Score API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "WARD_AI_SCORE_ERROR",
          message:
            "Unable to calculate ward AI score.",
        },
      },
      { status: 500 },
    );
  }
}