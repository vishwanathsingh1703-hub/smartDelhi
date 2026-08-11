import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/*
 * =====================================================
 * GEMINI MODEL
 * =====================================================
 *
 * Current active and stable Gemini Flash model for multimodal REST API.
 */
const GEMINI_MODEL = "gemini-1.5-flash";

/*
 * =====================================================
 * TYPES
 * =====================================================
 */

type VerificationDecision =
  | "APPROVED"
  | "DECLINED"
  | "MANUAL_REVIEW";

type VerificationSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

type VerificationResult = {
  decision: VerificationDecision;
  score: number;
  issueDetected: string;
  severity: VerificationSeverity;
  estimatedQuantity: string;
  reason: string;
  citizenMessage: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;

  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

/*
 * =====================================================
 * BASE64 DATA URL SUPPORT
 * =====================================================
 *
 * Supports:
 * - data:image/jpeg;base64,...
 * - data:image/jpg;base64,...
 * - data:image/png;base64,...
 * - data:image/webp;base64,...
 */

function extractBase64(dataUrl: string) {
  if (!dataUrl || typeof dataUrl !== "string") {
    return null;
  }

  const match = dataUrl.match(
    /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i
  );

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1].toLowerCase(),
    base64: match[2],
  };
}

/*
 * =====================================================
 * FILE -> BASE64
 * =====================================================
 */

async function fileToBase64(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return buffer.toString("base64");
}

/*
 * =====================================================
 * CLEAN GEMINI TEXT
 * =====================================================
 */

function cleanJsonText(text: string): string {
  let cleaned = String(text || "").trim();

  /*
   * Remove markdown code fences.
   */
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  /*
   * Remove accidental leading/trailing text around JSON.
   */
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
}

/*
 * =====================================================
 * DECISION NORMALIZER
 * =====================================================
 */

function normalizeDecision(value: unknown): VerificationDecision {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (normalized === "APPROVED") {
    return "APPROVED";
  }

  if (normalized === "DECLINED") {
    return "DECLINED";
  }

  if (
    normalized === "MANUAL_REVIEW" ||
    normalized === "MANUALREVIEW" ||
    normalized === "REVIEW" ||
    normalized === "MANUAL"
  ) {
    return "MANUAL_REVIEW";
  }

  return "MANUAL_REVIEW";
}

/*
 * =====================================================
 * SEVERITY NORMALIZER
 * =====================================================
 */

function normalizeSeverity(value: unknown): VerificationSeverity {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();

  if (normalized === "LOW") {
    return "LOW";
  }

  if (normalized === "MEDIUM") {
    return "MEDIUM";
  }

  if (normalized === "HIGH") {
    return "HIGH";
  }

  if (normalized === "CRITICAL") {
    return "CRITICAL";
  }

  return "MEDIUM";
}

/*
 * =====================================================
 * SCORE NORMALIZER
 * =====================================================
 */

function normalizeScore(value: unknown): number {
  const numericValue =
    typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numericValue));
}

/*
 * =====================================================
 * STRING NORMALIZER
 * =====================================================
 */

function normalizeString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const result = value.trim();

  return result || fallback;
}

/*
 * =====================================================
 * POST HANDLER
 * =====================================================
 */

export async function POST(request: NextRequest) {
  try {
    /*
     * =================================================
     * AUTHENTICATION
     * =================================================
     */

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * =================================================
     * ROLE CHECK
     * =================================================
     */

    if (user.role !== "CITIZEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Only citizens can verify complaints.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * =================================================
     * GEMINI API KEY
     * =================================================
     */

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY is missing from environment variables."
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gemini API key is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * =================================================
     * REQUEST DATA
     * =================================================
     *
     * Supported:
     * 1. multipart/form-data
     *    - camera File
     *    - uploaded File
     *
     * 2. application/json
     *    - Base64 image
     */

    let title = "";
    let description = "";
    let category = "";
    let ward = "";

    let base64Image = "";
    let mimeType = "image/jpeg";

    const contentType =
      request.headers.get("content-type") || "";

    /*
     * =================================================
     * MULTIPART FORM DATA
     * =================================================
     */

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      /*
       * TEXT FIELDS
       */

      const titleValue = formData.get("title");
      const descriptionValue = formData.get("description");
      const categoryValue = formData.get("category");
      const wardValue = formData.get("ward");

      title = typeof titleValue === "string" ? titleValue.trim() : "";
      description = typeof descriptionValue === "string" ? descriptionValue.trim() : "";
      category = typeof categoryValue === "string" ? categoryValue.trim() : "";
      ward = typeof wardValue === "string" ? wardValue.trim() : "";

      /*
       * =================================================
       * IMAGE FILE KEYS
       * =================================================
       */

      const possibleKeys = [
        "images",
        "image",
        "photo",
        "cameraImage",
      ];

      let imageFile: File | null = null;

      for (const key of possibleKeys) {
        const value = formData.get(key);

        if (
          value &&
          typeof value !== "string" &&
          value instanceof File
        ) {
          if (value.type && value.type.startsWith("image/")) {
            imageFile = value;
            break;
          }
        }
      }

      /*
       * =================================================
       * FILE PROCESSING
       * =================================================
       */

      if (imageFile) {
        const supportedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];

        const normalizedType = imageFile.type.toLowerCase();

        if (!supportedTypes.includes(normalizedType)) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Unsupported image format. Please use JPG, PNG or WEBP.",
            },
            {
              status: 400,
            }
          );
        }

        /*
         * Maximum original image size: 10 MB
         */
        if (imageFile.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Complaint photograph is too large. Maximum size is 10 MB.",
            },
            {
              status: 413,
            }
          );
        }

        base64Image = await fileToBase64(imageFile);
        mimeType = normalizedType || "image/jpeg";
      } else {
        /*
         * =================================================
         * BASE64 IMAGE INSIDE FORMDATA
         * =================================================
         */

        const rawImage =
          formData.get("imageData") ||
          formData.get("imageBase64");

        if (typeof rawImage === "string") {
          const extracted = extractBase64(rawImage);

          if (extracted) {
            base64Image = extracted.base64;
            mimeType = extracted.mimeType;
          }
        }
      }
    } else {
      /*
       * =================================================
       * JSON BODY
       * =================================================
       */

      const body = await request.json();

      title = typeof body?.title === "string" ? body.title.trim() : "";
      description = typeof body?.description === "string" ? body.description.trim() : "";
      category = typeof body?.category === "string" ? body.category.trim() : "";
      ward = typeof body?.ward === "string" ? body.ward.trim() : "";

      const rawImage =
        typeof body?.image === "string"
          ? body.image
          : typeof body?.imageData === "string"
          ? body.imageData
          : typeof body?.imageBase64 === "string"
          ? body.imageBase64
          : "";

      const extracted = extractBase64(rawImage);

      if (extracted) {
        base64Image = extracted.base64;
        mimeType = extracted.mimeType;
      }
    }

    /*
     * =================================================
     * BASIC VALIDATION
     * =================================================
     */

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint category is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!base64Image) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid complaint photograph is mandatory.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =================================================
     * BASE64 SIZE LIMIT
     * =================================================
     */

    if (base64Image.length > 14_000_000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image is too large for AI verification. Please capture a smaller/compressed photograph.",
        },
        {
          status: 413,
        }
      );
    }

    /*
     * =================================================
     * AI PROMPT
     * =================================================
     */

    const prompt = `
You are the SmartDELHI Civic Complaint Verification AI.

Your job is to analyze a citizen's civic complaint and the attached photograph.

The photograph is the PRIMARY EVIDENCE.

You MUST visually inspect the photograph before making a decision.

Do NOT automatically approve complaints.

Base your decision ONLY on what can reasonably be seen in the photograph together with the complaint information.

SUPPORTED CIVIC CATEGORIES:
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
1. Carefully inspect the entire photograph.
2. Identify the visible civic issue.
3. Compare the photograph with:
   - complaint title
   - category
   - description
4. Never invent objects, damage, garbage, vehicles, wires, leakage or other conditions that cannot reasonably be seen.
5. If the photograph is blurry, extremely dark, obstructed, irrelevant, unrelated, misleading, artificial-looking, or insufficient to make a reliable decision:
   use MANUAL_REVIEW.
6. Minor cosmetic problems should generally be DECLINED.
7. Significant civic problems that are clearly visible and justify municipal intervention should be APPROVED.
8. Safety-critical problems should receive MANUAL_REVIEW when the visual evidence is insufficient.
9. Never claim that you can:
   - smell gas
   - detect electricity
   - hear a leak
   - measure pollution
   - verify conditions outside the photograph
10. Only report visually supported information.

GARBAGE RULES:
- Minor isolated litter: DECLINED
- Significant garbage accumulation: APPROVED
- Large dumping: APPROVED
- Garbage blocking a road, drain or public passage: APPROVED
- If quantity or seriousness cannot be reliably determined: MANUAL_REVIEW

ROAD DAMAGE RULES:
- Minor surface crack: DECLINED
- Small insignificant pothole: DECLINED
- Large pothole: APPROVED
- Major broken road: APPROVED
- Dangerous road damage: APPROVED
- If road condition is not clearly visible: MANUAL_REVIEW

ELECTRICITY / STREET LIGHT RULES:
- Clearly visible broken pole: APPROVED
- Clearly visible exposed wire: APPROVED
- Clearly visible damaged electrical infrastructure: APPROVED
- Clearly visible dangerous street-light infrastructure: APPROVED
- If the claimed electrical problem cannot be visually confirmed: MANUAL_REVIEW
Never claim that electricity is actually flowing or that a wire is electrically live.

GAS RULES:
Visible damaged pipe or clearly visible dangerous gas infrastructure: APPROVED or MANUAL_REVIEW.
Use MANUAL_REVIEW if the photograph does not provide enough visual evidence.
Never claim that you can smell or chemically detect gas.

DRAINAGE / SEWAGE RULES:
- Significant blockage: APPROVED
- Visible sewage overflow: APPROVED
- Major drainage damage: APPROVED
- Minor or unclear condition: DECLINED or MANUAL_REVIEW

WATER SUPPLY RULES:
- Clearly visible major pipe damage: APPROVED
- Clearly visible flooding: APPROVED
- Clearly visible water infrastructure failure: APPROVED
- If the claimed water problem cannot be visually verified: MANUAL_REVIEW

IMPORTANT DECISION POLICY:
APPROVED: The photograph provides sufficient visual evidence that the civic problem is significant enough for municipal registration.
DECLINED: The visible problem is minor, ordinary litter, cosmetic, insufficiently serious, or does not meet the SmartDELHI complaint threshold.
MANUAL_REVIEW: A human/admin should inspect the evidence because the photograph is unclear, safety-critical, contradictory, or insufficient for reliable automated approval.

IMPORTANT:
If the photograph clearly shows something unrelated to the citizen's claimed civic issue, do NOT approve it.
If the photograph is clearly indoors and does not show any visible garbage, road damage, civic infrastructure problem, or other relevant civic issue, use MANUAL_REVIEW or DECLINED depending on whether the evidence is sufficient to determine that the complaint is unsupported.

Return a score from 0 to 100.
The score represents confidence that the photograph provides sufficient evidence for the decision.
Do NOT interpret the score as legal certainty.

Return ONLY valid JSON.
Do not return markdown.
Do not return code fences.
Do not return explanations outside JSON.

Required JSON format:
{
  "decision": "APPROVED",
  "score": 0,
  "issueDetected": "string",
  "severity": "LOW",
  "estimatedQuantity": "string",
  "reason": "string",
  "citizenMessage": "string"
}

The "decision" MUST be exactly one of: APPROVED, DECLINED, MANUAL_REVIEW
The "severity" MUST be exactly one of: LOW, MEDIUM, HIGH, CRITICAL

Complaint information:
Title: ${title}
Category: ${category}
Ward: ${ward || "Not provided"}
Description: ${description || "Not provided"}

Now inspect the photograph carefully and return ONLY the required JSON object.
`;

    /*
     * =================================================
     * GEMINI REQUEST PARTS
     * =================================================
     */

    const parts = [
      {
        text: prompt,
      },
      {
        inline_data: {
          mime_type: mimeType,
          data: base64Image,
        },
      },
    ];

    /*
     * =================================================
     * GEMINI URL
     * =================================================
     */

    const geminiUrl = `[https://generativelanguage.googleapis.com/v1beta/models/$](https://generativelanguage.googleapis.com/v1beta/models/$){GEMINI_MODEL}:generateContent`;

    /*
     * =================================================
     * GEMINI API REQUEST
     * =================================================
     */

    const geminiResponse = await fetch(geminiUrl, {
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
          responseSchema: {
            type: "OBJECT",
            properties: {
              decision: {
                type: "STRING",
                enum: ["APPROVED", "DECLINED", "MANUAL_REVIEW"],
              },
              score: {
                type: "NUMBER",
              },
              issueDetected: {
                type: "STRING",
              },
              severity: {
                type: "STRING",
                enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
              },
              estimatedQuantity: {
                type: "STRING",
              },
              reason: {
                type: "STRING",
              },
              citizenMessage: {
                type: "STRING",
              },
            },
            required: [
              "decision",
              "score",
              "issueDetected",
              "severity",
              "estimatedQuantity",
              "reason",
              "citizenMessage",
            ],
          },
          temperature: 0.1,
          maxOutputTokens: 800,
        },
      }),
    });

    /*
     * =================================================
     * GEMINI API ERROR
     * =================================================
     */

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();

      console.error("=================================================");
      console.error("GEMINI_VERIFY_ERROR");
      console.error("Status:", geminiResponse.status);
      console.error("Response:", errorText);
      console.error("=================================================");

      let parsedGeminiError: GeminiResponse | null = null;

      try {
        parsedGeminiError = JSON.parse(errorText);
      } catch {
        parsedGeminiError = null;
      }

      return NextResponse.json(
        {
          success: false,
          message: "Gemini verification failed. Please try again.",
          error:
            process.env.NODE_ENV === "development"
              ? parsedGeminiError?.error?.message || errorText
              : undefined,
        },
        {
          status: 502,
        }
      );
    }

    /*
     * =================================================
     * GEMINI RESPONSE
     * =================================================
     */

    const geminiData = (await geminiResponse.json()) as GeminiResponse;

    /*
     * =================================================
     * EXTRACT TEXT
     * =================================================
     */

    const rawText =
      geminiData.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "";

    /*
     * =================================================
     * EMPTY RESPONSE
     * =================================================
     */

    if (!rawText) {
      console.error("Gemini returned no verification text.", geminiData);

      return NextResponse.json(
        {
          success: false,
          message: "Gemini returned an empty verification result.",
        },
        {
          status: 502,
        }
      );
    }

    console.log("GEMINI_RAW_VERIFICATION:", rawText);

    /*
     * =================================================
     * PARSE JSON
     * =================================================
     */

    let parsed: Record<string, unknown>;

    try {
      const cleanedText = cleanJsonText(rawText);
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("=================================================");
      console.error("GEMINI_VERIFY_JSON_ERROR:", parseError);
      console.error("RAW GEMINI RESPONSE:", rawText);
      console.error("=================================================");

      /*
       * Do NOT silently approve an invalid AI result.
       * Returning MANUAL_REVIEW keeps the complaint
       * from being automatically registered.
       */

      const fallbackVerification: VerificationResult = {
        decision: "MANUAL_REVIEW",
        score: 0,
        issueDetected: "Unable to reliably parse AI verification.",
        severity: "MEDIUM",
        estimatedQuantity: "Unable to estimate.",
        reason:
          "The AI response could not be reliably interpreted. Manual review is required.",
        citizenMessage:
          "Your evidence could not be automatically verified. Please try again or submit it for manual review.",
      };

      return NextResponse.json(
        {
          success: true,
          verification: fallbackVerification,
          verified: false,
          decision: "MANUAL_REVIEW",
          score: 0,
          severity: "MEDIUM",
          reason: fallbackVerification.reason,
          detectedIssue: fallbackVerification.issueDetected,
          estimatedQuantity: fallbackVerification.estimatedQuantity,
          citizenMessage: fallbackVerification.citizenMessage,
          analysis: fallbackVerification,
          message: "AI verification requires manual review.",
        },
        {
          status: 200,
        }
      );
    }

    /*
     * =================================================
     * NORMALIZE RESULT
     * =================================================
     */

    const verification: VerificationResult = {
      decision: normalizeDecision(parsed.decision),
      score: normalizeScore(parsed.score),
      issueDetected: normalizeString(
        parsed.issueDetected,
        "Unable to determine"
      ),
      severity: normalizeSeverity(parsed.severity),
      estimatedQuantity: normalizeString(
        parsed.estimatedQuantity,
        "Unable to estimate"
      ),
      reason: normalizeString(
        parsed.reason,
        "AI could not provide a detailed reason."
      ),
      citizenMessage: normalizeString(
        parsed.citizenMessage,
        "Verification completed."
      ),
    };

    /*
     * =================================================
     * SAFETY CHECK
     * =================================================
     * Never allow a suspicious zero-score APPROVED
     * result to reach automatic registration.
     */

    if (verification.decision === "APPROVED" && verification.score < 40) {
      verification.decision = "MANUAL_REVIEW";
      verification.reason =
        "The AI confidence score is too low for automatic registration. Manual review is required.";
      verification.citizenMessage =
        "The evidence was detected, but the AI could not verify it with sufficient confidence. Manual review is required.";
    }

    /*
     * =================================================
     * FINAL RESPONSE
     * =================================================
     */

    return NextResponse.json(
      {
        success: true,
        verification,
        /* Compatibility fields */
        verified: verification.decision === "APPROVED",
        decision: verification.decision,
        score: verification.score,
        severity: verification.severity,
        reason: verification.reason,
        detectedIssue: verification.issueDetected,
        estimatedQuantity: verification.estimatedQuantity,
        citizenMessage: verification.citizenMessage,
        analysis: verification,
        message: "Complaint photograph analyzed successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    /*
     * =================================================
     * GLOBAL ERROR
     * =================================================
     */

    console.error("=================================================");
    console.error("VERIFY_COMPLAINT_ERROR:", error);
    console.error("=================================================");

    return NextResponse.json(
      {
        success: false,
        message: "Complaint verification service is temporarily unavailable.",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}