import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
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

    const worker = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ward: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        assignedComplaints: {
          select: {
            id: true,
            title: true,
            category: true,
            ward: true,
            status: true,
            priority: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            assignedComplaints: true,
          },
        },
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
          message: "User is not a worker",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      worker,
    });
  } catch (error) {
    console.error("ADMIN_WORKER_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch worker",
      },
      { status: 500 }
    );
  }
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

    const worker = await prisma.user.findUnique({
      where: {
        id,
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
          message: "User is not a worker",
        },
        { status: 400 }
      );
    }

    const updateData: {
      isActive?: boolean;
      ward?: string | null;
      phone?: string | null;
      name?: string;
    } = {};

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (typeof body.ward === "string") {
      updateData.ward = body.ward.trim() || null;
    }

    if (body.ward === null) {
      updateData.ward = null;
    }

    if (typeof body.phone === "string") {
      updateData.phone = body.phone.trim() || null;
    }

    if (body.phone === null) {
      updateData.phone = null;
    }

    if (typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
    }

    const updatedWorker = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ward: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedComplaints: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Worker updated successfully",
      worker: updatedWorker,
    });
  } catch (error) {
    console.error("ADMIN_WORKER_UPDATE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update worker",
      },
      { status: 500 }
    );
  }
}