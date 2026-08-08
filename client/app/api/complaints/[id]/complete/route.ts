import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;

  const toRad = (deg: number) =>
    (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );

  return R * c;
}

function isValidCoordinate(
  latitude: unknown,
  longitude: unknown
): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized: Please login first.',
        },
        { status: 401 }
      );
    }

    if (user.role !== 'WORKER') {
      return NextResponse.json(
        {
          error: 'Forbidden: Only workers can complete complaints.',
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const body = await request.json();

    const { latitude, longitude } = body;

    if (!isValidCoordinate(latitude, longitude)) {
      return NextResponse.json(
        {
          error: 'Invalid GPS coordinates.',
        },
        { status: 400 }
      );
    }

    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id,
        },
      });

    if (!complaint) {
      return NextResponse.json(
        {
          error: 'Complaint not found.',
        },
        { status: 404 }
      );
    }

    if (
      complaint.assignedWorkerId !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            'Forbidden: This complaint is not assigned to you.',
        },
        { status: 403 }
      );
    }

    if (
      complaint.latitude === null ||
      complaint.longitude === null
    ) {
      return NextResponse.json(
        {
          error:
            'Complaint does not have a valid location.',
        },
        { status: 400 }
      );
    }

    if (complaint.workCompletedAt !== null) {
      return NextResponse.json(
        {
          error:
            'This complaint has already been marked as completed.',
        },
        { status: 400 }
      );
    }

    if (complaint.citizenVerified) {
      return NextResponse.json(
        {
          error:
            'This complaint has already been verified by the citizen.',
        },
        { status: 400 }
      );
    }

    const distance =
      calculateHaversineDistance(
        latitude,
        longitude,
        complaint.latitude,
        complaint.longitude
      );

    // Server-side security check: maximum 100 meters.
    if (distance > 100) {
      return NextResponse.json(
        {
          error: `You are ${Math.round(
            distance
          )}m away from the complaint location. Worker must be within 100 meters.`,
          distance: Math.round(distance),
        },
        { status: 400 }
      );
    }

    const updatedComplaint =
      await prisma.complaint.update({
        where: {
          id,
        },
        data: {
          status: 'PENDING_VERIFICATION',
          workCompletedAt: new Date(),
        },
      });

    // Notify citizen that verification is required.
    if (complaint.userId) {
      await prisma.notification.create({
        data: {
          userId: complaint.userId,
          title: 'Complaint Work Completed',
          message:
            'The assigned worker has marked your complaint as completed. Please verify whether the problem has actually been resolved and provide feedback.',
          type: 'COMPLAINT_COMPLETED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        'Work marked completed. Waiting for citizen verification.',
      distance: Math.round(distance),
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error(
      'Error completing complaint:',
      error
    );

    return NextResponse.json(
      {
        error: 'Internal server error.',
      },
      { status: 500 }
    );
  }
}