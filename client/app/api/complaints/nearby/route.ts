import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

const MAX_DISTANCE_METERS = 100;

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371000;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    if (user.role !== 'WORKER') {
      return NextResponse.json(
        { error: 'Only workers can access nearby complaints.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const latitude = Number(searchParams.get('latitude'));
    const longitude = Number(searchParams.get('longitude'));

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude are required.' },
        { status: 400 }
      );
    }

    const complaints = await prisma.complaint.findMany({
      where: {
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
        status: {
          in: ['Pending', 'PENDING'],
        },
        assignedWorkerId: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const nearbyComplaints = complaints
      .map((complaint) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          complaint.latitude!,
          complaint.longitude!
        );

        return {
          ...complaint,
          distance: Math.round(distance),
        };
      })
      .filter(
        (complaint) => complaint.distance <= MAX_DISTANCE_METERS
      )
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      radius: MAX_DISTANCE_METERS,
      count: nearbyComplaints.length,
      complaints: nearbyComplaints,
    });
  } catch (error) {
    console.error('Nearby complaints error:', error);

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}