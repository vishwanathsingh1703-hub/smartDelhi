import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      credential,
      role,
      adminPassword,
    } = body;

    if (!credential) {
      return NextResponse.json(
        {
          error: "Google credential is missing.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VERIFY GOOGLE ID TOKEN
    ===================================================== */

    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        credential
      )}`,
      {
        cache: "no-store",
      }
    );

    if (!googleResponse.ok) {
      return NextResponse.json(
        {
          error:
            "Google verification failed.",
        },
        {
          status: 401,
        }
      );
    }

    const googleUser = await googleResponse.json();

    const googleClientId =
      process.env.GOOGLE_CLIENT_ID;

    if (
      !googleClientId ||
      googleUser.aud !== googleClientId
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid Google application.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      googleUser.email_verified !== "true"
    ) {
      return NextResponse.json(
        {
          error:
            "Your Google email is not verified.",
        },
        {
          status: 403,
        }
      );
    }

    const email =
      typeof googleUser.email === "string"
        ? googleUser.email.toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Google account email could not be read.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       EXISTING USER
    ===================================================== */

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "No SmartDELHI account exists with this Google email. Please register first.",
        },
        {
          status: 404,
        }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          error:
            "Account is deactivated. Please contact support.",
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       ROLE CHECK
    ===================================================== */

    if (
      role &&
      role !== user.role
    ) {
      return NextResponse.json(
        {
          error:
            "Selected access level does not match this account.",
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       ADMIN SECURITY
    ===================================================== */

    if (user.role === "ADMIN") {
      const configuredAdminPassword =
        process.env.ADMIN_LOGIN_PASSWORD;

      if (!configuredAdminPassword) {
        return NextResponse.json(
          {
            error:
              "Administrator authentication is not configured.",
          },
          {
            status: 500,
          }
        );
      }

      if (
        !adminPassword ||
        adminPassword !==
          configuredAdminPassword
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid administrator security password.",
          },
          {
            status: 403,
          }
        );
      }
    }

    /* =====================================================
       JWT
    ===================================================== */

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    /* =====================================================
       RESPONSE
    ===================================================== */

    const response = NextResponse.json(
      {
        message:
          "Google verification successful.",

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          ward: user.ward,
          phone: user.phone,
          isActive: user.isActive,
          createdAt:
            user.createdAt.toISOString(),
          updatedAt:
            user.updatedAt.toISOString(),
        },
      },
      {
        status: 200,
      }
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(
      "Google authentication error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Google authentication failed.",
      },
      {
        status: 500,
      }
    );
  }
}