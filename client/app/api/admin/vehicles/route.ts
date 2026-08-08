import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error("ADMIN_VEHICLES_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch vehicles",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const vehicleNo = body.vehicleNo?.trim();

    if (!vehicleNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Vehicle number is required",
        },
        { status: 400 }
      );
    }

    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        vehicleNo,
      },
    });

    if (existingVehicle) {
      return NextResponse.json(
        {
          success: false,
          message: "Vehicle already exists",
        },
        { status: 409 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleNo,
        type: body.type?.trim() || "Garbage Truck",
        ward: body.ward?.trim() || null,
        status: body.status?.trim() || "AVAILABLE",
        driverName: body.driverName?.trim() || null,
        driverPhone: body.driverPhone?.trim() || null,
        latitude:
          typeof body.latitude === "number"
            ? body.latitude
            : null,
        longitude:
          typeof body.longitude === "number"
            ? body.longitude
            : null,
        isActive:
          typeof body.isActive === "boolean"
            ? body.isActive
            : true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Vehicle created successfully",
        vehicle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN_VEHICLE_CREATE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create vehicle",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vehicle ID is required",
        },
        { status: 400 }
      );
    }

    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        id: body.id,
      },
    });

    if (!existingVehicle) {
      return NextResponse.json(
        {
          success: false,
          message: "Vehicle not found",
        },
        { status: 404 }
      );
    }

    const updateData: {
      vehicleNo?: string;
      type?: string;
      ward?: string | null;
      status?: string;
      driverName?: string | null;
      driverPhone?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      isActive?: boolean;
    } = {};

    if (typeof body.vehicleNo === "string") {
      updateData.vehicleNo =
        body.vehicleNo.trim();
    }

    if (typeof body.type === "string") {
      updateData.type = body.type.trim();
    }

    if (typeof body.ward === "string") {
      updateData.ward =
        body.ward.trim() || null;
    }

    if (body.ward === null) {
      updateData.ward = null;
    }

    if (typeof body.status === "string") {
      updateData.status =
        body.status.trim();
    }

    if (typeof body.driverName === "string") {
      updateData.driverName =
        body.driverName.trim() || null;
    }

    if (body.driverName === null) {
      updateData.driverName = null;
    }

    if (typeof body.driverPhone === "string") {
      updateData.driverPhone =
        body.driverPhone.trim() || null;
    }

    if (body.driverPhone === null) {
      updateData.driverPhone = null;
    }

    if (typeof body.latitude === "number") {
      updateData.latitude = body.latitude;
    }

    if (typeof body.longitude === "number") {
      updateData.longitude = body.longitude;
    }

    if (body.latitude === null) {
      updateData.latitude = null;
    }

    if (body.longitude === null) {
      updateData.longitude = null;
    }

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    const vehicle = await prisma.vehicle.update({
      where: {
        id: body.id,
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    console.error("ADMIN_VEHICLE_UPDATE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update vehicle",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vehicle ID is required",
        },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: body.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        {
          success: false,
          message: "Vehicle not found",
        },
        { status: 404 }
      );
    }

    await prisma.vehicle.update({
      where: {
        id: body.id,
      },
      data: {
        isActive: false,
        status: "INACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Vehicle deactivated successfully",
    });
  } catch (error) {
    console.error("ADMIN_VEHICLE_DELETE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate vehicle",
      },
      { status: 500 }
    );
  }
}