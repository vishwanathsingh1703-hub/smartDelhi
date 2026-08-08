import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET — single complaint
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Complaint ID is required.' },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found.' },
        { status: 404 }
      );
    }

    // Citizen can only view their own complaint.
    // Admin/worker can view complaints.
    if (
      user.role === 'CITIZEN' &&
      complaint.userId !== user.id
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to view this complaint.' },
        { status: 403 }
      );
    }

    if (!['CITIZEN', 'ADMIN', 'WORKER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error('GET /api/complaints/[id] error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch complaint.' },
      { status: 500 }
    );
  }
}

// PATCH — update complaint
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Complaint ID is required.' },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found.' },
        { status: 404 }
      );
    }

    // Citizen can only update their own complaint.
    if (
      user.role === 'CITIZEN' &&
      complaint.userId !== user.id
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to update this complaint.' },
        { status: 403 }
      );
    }

    // Only allowed roles can update complaints.
    if (!['CITIZEN', 'ADMIN', 'WORKER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      category,
      ward,
      priority,
      status,
      latitude,
      longitude,
      imageUrl,
    } = body;

    // Citizens should not change complaint status.
    if (
      user.role === 'CITIZEN' &&
      status !== undefined
    ) {
      return NextResponse.json(
        { error: 'Citizens cannot change complaint status.' },
        { status: 403 }
      );
    }

    // Validate priority
    const allowedPriorities = [
      'LOW',
      'MEDIUM',
      'HIGH',
      'URGENT',
    ];

    if (
      priority !== undefined &&
      !allowedPriorities.includes(priority)
    ) {
      return NextResponse.json(
        { error: 'Invalid priority.' },
        { status: 400 }
      );
    }

    // Validate status
    const allowedStatuses = [
      'PENDING',
      'IN_PROGRESS',
      'RESOLVED',
      'REJECTED',
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        { error: 'Invalid complaint status.' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude !== undefined) {
      const lat = Number(latitude);

      if (
        !Number.isFinite(lat) ||
        lat < -90 ||
        lat > 90
      ) {
        return NextResponse.json(
          { error: 'Invalid latitude.' },
          { status: 400 }
        );
      }
    }

    if (longitude !== undefined) {
      const lng = Number(longitude);

      if (
        !Number.isFinite(lng) ||
        lng < -180 ||
        lng > 180
      ) {
        return NextResponse.json(
          { error: 'Invalid longitude.' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      if (
        typeof title !== 'string' ||
        title.trim().length < 5
      ) {
        return NextResponse.json(
          { error: 'Invalid complaint title.' },
          { status: 400 }
        );
      }

      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (
        typeof description !== 'string' ||
        description.trim().length < 10
      ) {
        return NextResponse.json(
          { error: 'Invalid complaint description.' },
          { status: 400 }
        );
      }

      updateData.description = description.trim();
    }

    if (category !== undefined) {
      updateData.category = String(category).trim();
    }

    if (ward !== undefined) {
      updateData.ward = String(ward).trim();
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (latitude !== undefined) {
      updateData.latitude = Number(latitude);
    }

    if (longitude !== undefined) {
      updateData.longitude = Number(longitude);
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl =
        typeof imageUrl === 'string'
          ? imageUrl.trim() || null
          : null;
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error('PATCH /api/complaints/[id] error:', error);

    return NextResponse.json(
      { error: 'Failed to update complaint.' },
      { status: 500 }
    );
  }
}

// DELETE — delete complaint
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Complaint ID is required.' },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found.' },
        { status: 404 }
      );
    }

    // Only the complaint owner or admin can delete.
    if (
      user.role === 'CITIZEN' &&
      complaint.userId !== user.id
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this complaint.' },
        { status: 403 }
      );
    }

    if (!['CITIZEN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only citizens and admins can delete complaints.' },
        { status: 403 }
      );
    }

    // Prevent deleting already resolved complaints as a citizen.
    if (
      user.role === 'CITIZEN' &&
      complaint.status === 'RESOLVED'
    ) {
      return NextResponse.json(
        { error: 'Resolved complaints cannot be deleted.' },
        { status: 400 }
      );
    }

    await prisma.complaint.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Complaint deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE /api/complaints/[id] error:', error);

    return NextResponse.json(
      { error: 'Failed to delete complaint.' },
      { status: 500 }
    );
  }
}