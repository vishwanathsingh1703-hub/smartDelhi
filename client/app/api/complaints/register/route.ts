import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/*
 * =====================================================
 * GEMINI MODEL
 * =====================================================
 *
 * Current stable Gemini Flash model.
 *
 * Gemini supports multimodal image input through
 * inline Base64 data.
 */
const GEMINI_MODEL = "gemini-3.6-flash";

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
 *
 * data:image/jpeg;base64,...
 * data:image/jpg;base64,...
 * data:image/png;base64,...
 * data:image/webp;base64,...
 */
function extractBase64(dataUrl: string) {
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
 * JSON CLEANER
 * =====================================================
 *
 * Gemini normally returns JSON because responseMimeType
 * is set to application/json.
 *
 * This is an additional safety layer in case the model
 * still wraps JSON inside markdown fences.
 */
function cleanJsonText(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/*
 * =====================================================
 * DECISION NORMALIZER
 * =====================================================
 */

function normalizeDecision(
  value: unknown
): VerificationDecision {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (normalized === "APPROVED") {
    return "APPROVED";
  }

  if (normalized === "DECLINED") {
    return "DECLINED";
  }

  if (
    normalized === "MANUAL_REVIEW" ||
    normalized === "MANUALREVIEW" ||
    normalized === "REVIEW"
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

function normalizeSeverity(
  value: unknown
): VerificationSeverity {
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

/*
 * =====================================================
 * FILE -> BASE64
 * =====================================================
 */

async function fileToBase64(file: File) {
  const arrayBuffer =
    await file.arrayBuffer();

  const buffer =
    Buffer.from(arrayBuffer);

  return buffer.toString("base64");
}

/*
 * =====================================================
 * POST
 * =====================================================
 */

export async function POST(
  request: NextRequest
) {
  try {
    /*
     * =================================================
     * AUTHENTICATION
     * =================================================
     */

    const user =
      await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Please login first.",
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
          message:
            "Only citizens can verify complaints.",
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

    const apiKey =
      process.env.GEMINI_API_KEY;

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
     * We support BOTH:
     *
     * 1. multipart/form-data
     *    -> camera captured File
     *    -> uploaded File
     *
     * 2. application/json
     *    -> Base64 image
     */

    let title = "";
    let description = "";
    let category = "";
    let ward = "";

    let base64Image = "";
    let mimeType = "image/jpeg";

    const contentType =
      request.headers.get(
        "content-type"
      ) || "";

    /*
     * =================================================
     * MULTIPART FORM DATA
     * =================================================
     */

    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {
      const formData =
        await request.formData();

      /*
       * TEXT FIELDS
       */

      const titleValue =
        formData.get("title");

      const descriptionValue =
        formData.get(
          "description"
        );

      const categoryValue =
        formData.get("category");

      const wardValue =
        formData.get("ward");

      title =
        typeof titleValue ===
        "string"
          ? titleValue.trim()
          : "";

      description =
        typeof descriptionValue ===
        "string"
          ? descriptionValue.trim()
          : "";

      category =
        typeof categoryValue ===
        "string"
          ? categoryValue.trim()
          : "";

      ward =
        typeof wardValue ===
        "string"
          ? wardValue.trim()
          : "";

      /*
       * =================================================
       * IMAGE FILE
       * =================================================
       *
       * Frontend currently uses:
       *
       * formData.append("images", photo)
       *
       * Therefore we check "images".
       *
       * We also support:
       *
       * image
       * photo
       *
       * so future camera implementation will work.
       */

      const possibleKeys = [
        "images",
        "image",
        "photo",
        "cameraImage",
      ];

      let imageFile: File | null =
        null;

      for (
        const key of possibleKeys
      ) {
        const value =
          formData.get(key);

        if (
          value &&
          typeof value !== "string" &&
          value instanceof File
        ) {
          if (
            value.type.startsWith(
              "image/"
            )
          ) {
            imageFile = value;
            break;
          }
        }
      }

      /*
       * If a File was found
       */

      if (imageFile) {
        /*
         * Validate MIME
         */

        const supportedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];

        if (
          !supportedTypes.includes(
            imageFile.type
              .toLowerCase()
          )
        ) {
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
         * Maximum original file size:
         * 10 MB
         */

        if (
          imageFile.size >
          10 * 1024 * 1024
        ) {
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

        base64Image =
          await fileToBase64(
            imageFile
          );

        mimeType =
          imageFile.type ||
          "image/jpeg";
      } else {
        /*
         * =================================================
         * BASE64 IMAGE INSIDE FORMDATA
         * =================================================
         */

        const rawImage =
          formData.get("imageData") ||
          formData.get("imageBase64");

        if (
          typeof rawImage ===
          "string"
        ) {
          const extracted =
            extractBase64(
              rawImage
            );

          if (extracted) {
            base64Image =
              extracted.base64;

            mimeType =
              extracted.mimeType;
          }
        }
      }
    } else {
      /*
       * =================================================
       * JSON BODY
       * =================================================
       */

      const body =
        await request.json();

      title =
        typeof body?.title ===
        "string"
          ? body.title.trim()
          : "";

      description =
        typeof body?.description ===
        "string"
          ? body.description.trim()
          : "";

      category =
        typeof body?.category ===
        "string"
          ? body.category.trim()
          : "";

      ward =
        typeof body?.ward ===
        "string"
          ? body.ward.trim()
          : "";

      /*
       * JSON may contain:
       *
       * image
       * imageData
       * imageBase64
       */

      const rawImage =
        typeof body?.image ===
        "string"
          ? body.image
          : typeof body?.imageData ===
              "string"
            ? body.imageData
            : typeof body?.imageBase64 ===
                "string"
              ? body.imageBase64
              : "";

      const extracted =
        extractBase64(
          rawImage
        );

      if (extracted) {
        base64Image =
          extracted.base64;

        mimeType =
          extracted.mimeType;
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
          message:
            "Complaint title is required.",
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
          message:
            "Complaint category is required.",
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
          message:
            "Valid complaint photograph is mandatory.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =================================================
     * GEMINI INLINE DATA LIMIT
     * =================================================
     *
     * Keep a conservative limit because Base64 is
     * larger than the original binary file.
     */

    if (
      base64Image.length >
      14_000_000
    ) {
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

You MUST visually inspect the photograph.

Do NOT automatically approve every complaint.

The photograph is the primary evidence.

Your decision must be based ONLY on what can reasonably be seen in the photograph together with the complaint information.

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

=====================================================
GENERAL RULES
=====================================================

1. Carefully inspect the entire photograph.

2. Identify the visible civic issue.

3. Compare the visible issue with the citizen's:
   - title
   - category
   - description

4. Never invent damage, objects, vehicles, wires, garbage,
   leakage or other conditions that are not visible.

5. If the photograph is:
   - blurry
   - extremely dark
   - obstructed
   - irrelevant
   - unrelated to the complaint
   - clearly artificial/misleading
   - insufficient to confidently judge the issue

   then use:

   MANUAL_REVIEW

6. Minor cosmetic problems should generally be:

   DECLINED

7. Significant civic problems that are clearly visible and
   justify municipal intervention should be:

   APPROVED

8. Safety-critical problems should NOT be treated as fully
   verified only from a photograph.

   If visual certainty is insufficient:

   MANUAL_REVIEW

9. Never claim that you can:
   - smell gas
   - detect electricity
   - hear a leak
   - measure pollution
   - verify something outside the photograph

10. Only report what is visually supported.

=====================================================
GARBAGE POLICY
=====================================================

Minor isolated litter:

DECLINED

Significant garbage accumulation:

APPROVED

Large dumping:

APPROVED

Garbage blocking a road/drain/public passage:

APPROVED

If the amount or seriousness cannot be reliably determined:

MANUAL_REVIEW

=====================================================
ROAD DAMAGE POLICY
=====================================================

Minor surface crack:

DECLINED

Small insignificant pothole:

DECLINED

Large pothole:

APPROVED

Major broken road:

APPROVED

Dangerous road damage:

APPROVED

If the image does not clearly show the road condition:

MANUAL_REVIEW

=====================================================
STREET LIGHT / ELECTRICITY POLICY
=====================================================

Clearly visible broken pole, exposed wire,
damaged electrical infrastructure or dangerous
street-light infrastructure:

APPROVED

If the claimed electrical problem cannot be visually
confirmed:

MANUAL_REVIEW

Never claim that electricity is actually flowing
or that a wire is electrically live.

=====================================================
GAS POLICY
=====================================================

Visible damaged pipe or clearly visible
dangerous gas infrastructure:

APPROVED or MANUAL_REVIEW

Use MANUAL_REVIEW if the photograph does not provide
enough visual evidence.

Never claim that you can smell or chemically detect gas.

=====================================================
DRAINAGE / SEWAGE POLICY
=====================================================

Significant blockage:

APPROVED

Visible sewage overflow:

APPROVED

Major drainage damage:

APPROVED

Minor or unclear condition:

DECLINED or MANUAL_REVIEW

=====================================================
WATER SUPPLY POLICY
=====================================================

Clearly visible major pipe damage, flooding or
water infrastructure failure:

APPROVED

If the claimed water problem cannot be visually verified:

MANUAL_REVIEW

=====================================================
DECISION DEFINITIONS
=====================================================

APPROVED:

The photograph provides sufficient visual evidence that
the civic problem is significant enough for municipal
registration.

DECLINED:

The visible problem is minor, ordinary litter,
cosmetic, insufficiently serious, or does not meet
the SmartDELHI complaint threshold.

MANUAL_REVIEW:

A human/admin should inspect the evidence because the
photograph is unclear, safety-critical, contradictory,
or insufficient for reliable automated approval.

=====================================================
SCORE
=====================================================

Return a score from 0 to 100.

The score represents confidence that the photograph
provides sufficient evidence for the decision.

IMPORTANT:

Do NOT interpret score as a legal certainty.

=====================================================
OUTPUT
=====================================================

Return ONLY valid JSON.

Do not return markdown.

Do not return code fences.

Do not return explanations outside JSON.

Required format:

{
  "decision": "APPROVED" | "DECLINED" | "MANUAL_REVIEW",
  "score": 0,
  "issueDetected": "string",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "estimatedQuantity": "string",
  "reason": "string",
  "citizenMessage": "string"
}

=====================================================
COMPLAINT INFORMATION
=====================================================

Title:
${title}

Category:
${category}

Ward:
${ward || "Not provided"}

Description:
${description || "Not provided"}

Now inspect the photograph carefully and return ONLY the required JSON.
`;

    /*
     * =================================================
     * GEMINI REQUEST
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

    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const geminiResponse =
      await fetch(
        geminiUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              apiKey,
          },

          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts,
              },
            ],

            generationConfig: {
              responseMimeType:
                "application/json",

              temperature: 0.1,

              maxOutputTokens: 800,
            },
          }),
        }
      );

    /*
     * =================================================
     * GEMINI ERROR
     * =================================================
     */

    if (
      !geminiResponse.ok
    ) {
      const errorText =
        await geminiResponse.text();

      console.error(
        "================================================="
      );

      console.error(
        "GEMINI_VERIFY_ERROR"
      );

      console.error(
        "Status:",
        geminiResponse.status
      );

      console.error(
        "Response:",
        errorText
      );

      console.error(
        "================================================="
      );

      let parsedGeminiError:
        GeminiResponse | null =
        null;

      try {
        parsedGeminiError =
          JSON.parse(
            errorText
          );
      } catch {
        parsedGeminiError =
          null;
      }

      return NextResponse.json(
        {
          success: false,

          message:
            "Gemini verification failed. Please try again.",

          /*
           * Development debugging information.
           * This is intentionally generic so API details
           * are not exposed to the citizen.
           */

          error:
            process.env.NODE_ENV ===
            "development"
              ? parsedGeminiError?.error
                  ?.message ||
                errorText
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

    const geminiData =
      (await geminiResponse.json()) as GeminiResponse;

    const rawText =
      geminiData
        .candidates?.[0]
        ?.content?.parts
        ?.map(
          (part) =>
            part.text || ""
        )
        .join("")
        .trim() || "";

    /*
     * =================================================
     * EMPTY RESPONSE
     * =================================================
     */

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
        {
          status: 502,
        }
      );
    }

    /*
     * =================================================
     * PARSE JSON
     * =================================================
     */

    let parsed:
      Record<
        string,
        unknown
      >;

    try {
      parsed =
        JSON.parse(
          cleanJsonText(
            rawText
          )
        );
    } catch (
      parseError
    ) {
      console.error(
        "GEMINI_VERIFY_JSON_ERROR:",
        parseError
      );

      console.error(
        "RAW GEMINI RESPONSE:",
        rawText
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned an invalid verification result.",
        },
        {
          status: 502,
        }
      );
    }

    /*
     * =================================================
     * NORMALIZE RESULT
     * =================================================
     */

    const verification: VerificationResult =
      {
        decision:
          normalizeDecision(
            parsed.decision
          ),

        score:
          normalizeScore(
            parsed.score
          ),

        issueDetected:
          typeof parsed.issueDetected ===
          "string"
            ? parsed.issueDetected.trim()
            : "Unable to determine",

        severity:
          normalizeSeverity(
            parsed.severity
          ),

        estimatedQuantity:
          typeof parsed.estimatedQuantity ===
          "string"
            ? parsed.estimatedQuantity.trim()
            : "Unable to estimate",

        reason:
          typeof parsed.reason ===
          "string"
            ? parsed.reason.trim()
            : "AI could not provide a detailed reason.",

        citizenMessage:
          typeof parsed.citizenMessage ===
          "string"
            ? parsed.citizenMessage.trim()
            : "Verification completed.",
      };

    /*
     * =================================================
     * FINAL RESPONSE
     * =================================================
     *
     * We return BOTH:
     *
     * verification.decision
     *
     * AND top-level decision fields.
     *
     * This keeps compatibility with your current
     * new/page.tsx code as well as future code.
     */

    return NextResponse.json(
      {
        success: true,

        verification,

        /*
         * Compatibility fields
         */

        verified:
          verification.decision ===
          "APPROVED",

        decision:
          verification.decision,

        score:
          verification.score,

        severity:
          verification.severity,

        reason:
          verification.reason,

        detectedIssue:
          verification.issueDetected,

        estimatedQuantity:
          verification.estimatedQuantity,

        citizenMessage:
          verification.citizenMessage,

        analysis:
          verification,

        message:
          "Complaint photograph analyzed successfully.",
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

    console.error(
      "================================================="
    );

    console.error(
      "VERIFY_COMPLAINT_ERROR:",
      error
    );

    console.error(
      "================================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Complaint verification service is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}