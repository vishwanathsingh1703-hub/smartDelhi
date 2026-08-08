import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

function getToken(request: Request) {
  const cookieHeader = request.headers.get('cookie');

  return cookieHeader
    ?.split(';')
    .find((cookie) => cookie.trim().startsWith('token='))
    ?.split('=')[1];
}

export async function GET(request: Request) {
  try {
    const token = getToken(request);

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

    const notifications = await prisma.notification.findMany({
      where: {
        userId: payload.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const token = getToken(request);

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

    const body = await request.json();
    const notificationId = body?.notificationId;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required.' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: payload.userId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found.' },
        { status: 404 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      message: 'Notification marked as read.',
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('Update notification error:', error);

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}