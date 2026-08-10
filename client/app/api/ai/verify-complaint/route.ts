
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const GEMINI_MODEL = "gemini-2.5-flash";

type GeminiPart = {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type VerificationResult = {
  decision: "APPROVED" | "DECLINED" | "MANUAL_REVIEW";
  score: number;
  issueDetected: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  estimatedQuantity: string;
  reason: string;
  citizenMessage: string;
};

function extractBase64(dataUrl: string) {
  const match = dataUrl.match(
    /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i
  );

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    base64: match[2],
  };
}

function cleanJsonText(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function normalizeDecision(value: unknown) {
  const allowed = [
    "APPROVED",
    "DECLINED",
    "MANUAL_REVIEW",
  ] as const;

  return allowed.includes(value as (typeof allowed)[number])
    ? (value as (typeof allowed)[number])
    : "MANUAL_REVIEW";
}

function normalizeSeverity(value: unknown) {
  const allowed = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
  ] as const;

  return allowed.includes(value as (typeof allowed)[number])
    ? (value as (typeof allowed)[number])
    : "MEDIUM";
}

function normalizeScore(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, numericValue)
  );
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    if (user.role !== "CITIZEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Only citizens can verify complaints.",
        },
        { status: 403 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY is missing from environment variables."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Gemini API key is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const title =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : "";

    const category =
      typeof body?.category === "string"
        ? body.category.trim()
        : "";

    const ward =
      typeof body?.ward === "string"
        ? body.ward.trim()
        : "";

    const image =
      typeof body?.image === "string"
        ? body.image
        : "";

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint title is required.",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint category is required.",
        },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Complaint photograph is mandatory.",
        },
        { status: 400 }
      );
    }

    const imageData = extractBase64(image);

    if (!imageData) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid image format. Please upload JPG, PNG or WEBP.",
        },
        { status: 400 }
      );
    }

    /*
     * Prevent extremely large base64 payloads.
     * The frontend should compress images before sending.
     */
    if (imageData.base64.length > 12_000_000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image is too large. Please upload a compressed photograph.",
        },
        { status: 413 }
      );
    }

    const prompt = `
You are the SmartDELHI Civic Complaint Verification AI.

Your job is to analyze a citizen's civic complaint and its attached
photograph.

You MUST visually inspect the photograph.

Do NOT automatically approve complaints.

You must determine whether the visible problem is significant enough
to justify municipal intervention.

Supported complaint categories include:

- Garbage
- Road Damage
- Street Light
- Electricity
- Gas
- Drainage
- Water Supply
- Sewage
- Cleanliness
- Traffic
- Other civic infrastructure

GENERAL RULES:

1. Only consider problems that are actually visible in the image.
2. Never invent damage or objects that cannot be reasonably seen.
3. If the image is blurry, irrelevant, misleading, unrelated to the
   complaint, or insufficient to make a reliable decision:
   use MANUAL_REVIEW.
4. Minor cosmetic issues should generally NOT be approved.
5. Safety-critical infrastructure should receive MANUAL_REVIEW when
   visual evidence is insufficient.
6. The score represents confidence/severity evidence from the image,
   not a guarantee of physical conditions.
7. Never claim to physically smell gas, detect electricity, hear a leak,
   or verify conditions outside the photograph.

GARBAGE:

- Tiny amount of scattered garbage:
  DECLINED
- Minor household-level litter:
  DECLINED
- Large garbage accumulation:
  APPROVED
- Illegal dumping:
  APPROVED
- Major garbage pile causing obstruction or sanitation concern:
  APPROVED
- Unclear garbage situation:
  MANUAL_REVIEW

ROAD DAMAGE:

- Very small crack:
  DECLINED
- Minor surface wear:
  DECLINED
- Small pothole:
  DECLINED
- Large/deep pothole:
  APPROVED
- Major broken road surface:
  APPROVED
- Dangerous road damage:
  APPROVED
- Unclear road condition:
  MANUAL_REVIEW

STREET LIGHT:

- Clearly broken/non-functional-looking streetlight infrastructure:
  APPROVED
- Severely damaged pole/light fixture:
  APPROVED
- Minor cosmetic issue:
  DECLINED
- Image does not clearly show the problem:
  MANUAL_REVIEW

ELECTRICITY:

- Clearly broken electrical pole:
  APPROVED
- Clearly damaged/exposed electrical wire:
  APPROVED or MANUAL_REVIEW depending on visual certainty
- Dangerous electrical infrastructure:
  APPROVED or MANUAL_REVIEW
- Minor/unclear issue:
  DECLINED or MANUAL_REVIEW

GAS:

- Clearly visible damaged gas-related pipe/infrastructure:
  APPROVED
- Possible dangerous pipe damage but visual evidence is uncertain:
  MANUAL_REVIEW
- Never claim that gas leakage itself was physically detected from an image.

DRAINAGE / SEWAGE:

- Major blockage:
  APPROVED
- Significant overflow:
  APPROVED
- Clearly damaged drainage infrastructure:
  APPROVED
- Minor water accumulation:
  DECLINED
- Unclear drainage issue:
  MANUAL_REVIEW

WATER SUPPLY:

- Clearly visible damaged water infrastructure:
  APPROVED
- Major visible leakage from infrastructure:
  APPROVED
- Minor/unclear issue:
  MANUAL_REVIEW

CLEANLINESS:

- Minor litter:
  DECLINED
- Significant accumulation:
  APPROVED
- Large dumping or serious sanitation problem:
  APPROVED

IMPORTANT DECISION POLICY:

APPROVED means the photograph provides sufficient visual evidence
that the complaint deserves municipal registration.

DECLINED means the visible issue is minor, ordinary public litter,
insufficiently serious, or does not meet the SmartDELHI threshold.

MANUAL_REVIEW means a human/admin should inspect the evidence before
registration.

If the image does not match the claimed category, use MANUAL_REVIEW.

Return ONLY valid JSON.

Required JSON structure:

{
  "decision": "APPROVED",
  "score": 0,
  "issueDetected": "string",
  "severity": "LOW",
  "estimatedQuantity": "string",
  "reason": "string",
  "citizenMessage": "string"
}

Allowed decision values:

APPROVED
DECLINED
MANUAL_REVIEW

Allowed severity values:

LOW
MEDIUM
HIGH
CRITICAL

Complaint information:

Title: ${title}
Category: ${category}
Ward: ${ward || "Not provided"}
Description: ${description || "Not provided"}
`;

    const parts: GeminiPart[] = [
      {
        text: prompt,
      },
      {
        inline_data: {
          mime_type: imageData.mimeType,
          data: imageData.base64,
        },
      },
    ];

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts,
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText =
        await geminiResponse.text();

      console.error(
        "GEMINI_VERIFY_ERROR:",
        geminiResponse.status,
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Gemini verification failed. Please try again.",
        },
        { status: 502 }
      );
    }

    const geminiData =
      (await geminiResponse.json()) as GeminiResponse;

    const rawText =
      geminiData.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "";

    if (!rawText) {
      console.error(
        "Gemini returned no verification text.",
        geminiData
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Gemini returned an empty verification result.",
        },
        { status: 502 }
      );
    }

    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(
        cleanJsonText(rawText)
      );
    } catch (error) {
      console.error(
        "GEMINI_VERIFY_JSON_ERROR:",
        error,
        rawText
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned an invalid verification result.",
        },
        { status: 502 }
      );
    }

    const verification: VerificationResult = {
      decision: normalizeDecision(
        parsed.decision
      ),

      score: normalizeScore(
        parsed.score
      ),

      issueDetected:
        typeof parsed.issueDetected === "string"
          ? parsed.issueDetected.trim()
          : "Unable to determine",

      severity: normalizeSeverity(
        parsed.severity
      ),

      estimatedQuantity:
        typeof parsed.estimatedQuantity === "string"
          ? parsed.estimatedQuantity.trim()
          : "Unable to estimate",

      reason:
        typeof parsed.reason === "string"
          ? parsed.reason.trim()
          : "AI could not provide a detailed reason.",

      citizenMessage:
        typeof parsed.citizenMessage === "string"
          ? parsed.citizenMessage.trim()
          : "Verification completed.",
    };

    /*
     * IMPORTANT:
     *
     * This endpoint only performs AI verification.
     *
     * It does NOT create a complaint.
     *
     * The registration endpoint will decide whether the verified
     * complaint should actually be stored.
     */

    return NextResponse.json({
      success: true,
      verification,
      message:
        "Complaint photograph analyzed successfully.",
    });
  } catch (error) {
    console.error(
      "VERIFY_COMPLAINT_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Complaint verification service is temporarily unavailable.",
      },
      { status: 500 }
    );
  }
}

