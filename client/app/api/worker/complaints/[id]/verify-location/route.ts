import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

const MAX_DISTANCE_METERS = 100;

function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371000;

  const toRadians = (value: number) => (value * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieHeader = request.headers.get('cookie');

    const token = cookieHeader
      ?.split(';')
      .find((cookie) =>
        cookie.trim().startsWith('token=')
      )
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired session.' },
        { status: 401 }
      );
    }

    if (payload.role !== 'WORKER') {
      return NextResponse.json(
        { error: 'Only workers can verify complaint location.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const workerLatitude = Number(body.latitude);
    const workerLongitude = Number(body.longitude);

    if (
      !Number.isFinite(workerLatitude) ||
      !Number.isFinite(workerLongitude)
    ) {
      return NextResponse.json(
        { error: 'Valid worker location is required.' },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: {
        id,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found.' },
        { status: 404 }
      );
    }

    if (
      complaint.latitude === null ||
      complaint.longitude === null
    ) {
      return NextResponse.json(
        {
          error:
            'This complaint does not have a valid location.',
        },
        { status: 400 }
      );
    }

    if (
      complaint.assignedWorkerId &&
      complaint.assignedWorkerId !== payload.userId
    ) {
      return NextResponse.json(
        {
          error:
            'This complaint is assigned to another worker.',
        },
        { status: 403 }
      );
    }

    const distance = getDistanceInMeters(
      workerLatitude,
      workerLongitude,
      complaint.latitude,
      complaint.longitude
    );

    if (distance > MAX_DISTANCE_METERS) {
      return NextResponse.json(
        {
          verified: false,
          distance: Math.round(distance),
          maxDistance: MAX_DISTANCE_METERS,
          error:
            'You are too far from the complaint location. Please move within 100 meters.',
        },
        { status: 403 }
      );
    }

    const updatedComplaint =
      await prisma.complaint.update({
        where: {
          id,
        },
        data: {
          assignedWorkerId: payload.userId,
          status: 'IN_PROGRESS',
        },
      });

    return NextResponse.json({
      verified: true,
      distance: Math.round(distance),
      maxDistance: MAX_DISTANCE_METERS,
      message:
        'Location verified. Complaint is now assigned to you.',
      complaint: {
        id: updatedComplaint.id,
        status: updatedComplaint.status,
        assignedWorkerId:
          updatedComplaint.assignedWorkerId,
      },
    });
  } catch (error) {
    console.error(
      'Worker location verification error:',
      error
    );

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}