import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (user.role !== "CITIZEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Citizen access required",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // REQUEST BODY
    // =====================================================

    const body = await request.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // GEMINI API KEY
    // =====================================================

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");

      return NextResponse.json(
        {
          success: false,
          message: "Gemini API key is not configured.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // FETCH CITIZEN COMPLAINTS
    // =====================================================

    const complaints = await prisma.complaint.findMany({
      where: {
        userId: user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 20,

      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        ward: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        workCompletedAt: true,
        citizenVerified: true,
        assignedWorker: {
          select: {
            name: true,
          },
        },
      },
    });

    // =====================================================
    // CREATE DATABASE CONTEXT
    // =====================================================

    const complaintContext =
      complaints.length > 0
        ? complaints
            .map(
              (complaint, index) => `
Complaint ${index + 1}:

ID: ${complaint.id}

Title:
${complaint.title}

Category:
${complaint.category}

Ward:
${complaint.ward}

Status:
${complaint.status}

Priority:
${complaint.priority}

Description:
${complaint.description || "Not provided"}

Submitted:
${complaint.createdAt.toISOString()}

Last Updated:
${complaint.updatedAt.toISOString()}

Assigned Worker:
${complaint.assignedWorker?.name || "Not assigned"}

Worker Completed:
${
  complaint.workCompletedAt
    ? complaint.workCompletedAt.toISOString()
    : "No"
}

Citizen Verified:
${complaint.citizenVerified ? "Yes" : "No"}
`
            )
            .join("\n--------------------\n")
        : "This citizen has no complaints.";

    // =====================================================
    // SYSTEM INSTRUCTION
    // =====================================================

    const systemInstruction = `
You are SmartDELHI AI, an official citizen assistance chatbot
for the SmartDELHI municipal complaint portal.

Your job is to help citizens understand:

- complaint status
- complaint progress
- worker assignment
- worker completion
- complaint verification
- complaint categories
- municipal complaint procedures
- what the citizen should do next

IMPORTANT RULES:

1. Respond in the same language style used by the citizen.

2. If the citizen uses Hindi, respond in Hindi.

3. If the citizen uses English, respond in English.

4. If the citizen uses Hinglish, respond naturally in Hinglish.

5. Keep answers concise, friendly and easy to understand.

6. Never invent complaint information.

7. Only use complaint information supplied in the database context.

8. If the requested complaint does not exist in the supplied
   database context, clearly say that you could not find it.

9. Never reveal another citizen's information.

10. Never reveal passwords, API keys or internal secrets.

11. If a complaint is pending, explain its current status.

12. If a worker is assigned, tell the citizen the worker's name
    only when that information exists in the database context.

13. If the worker has completed the work but the citizen has not
    verified it, explain that citizen verification is required.

14. If the citizen has verified the complaint, explain that the
    complaint has been successfully verified.

15. Do not claim that a complaint is resolved unless the supplied
    complaint data supports that conclusion.

16. If the user asks something unrelated to SmartDELHI, politely
    redirect them toward SmartDELHI civic assistance.

CURRENT CITIZEN COMPLAINT DATA:

${complaintContext}
`;

    // =====================================================
    // GEMINI API
    // =====================================================

    const geminiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },

      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: systemInstruction,
            },
          ],
        },

        contents: [
          {
            role: "user",
            parts: [
              {
                text: message,
              },
            ],
          },
        ],

        generationConfig: {
          maxOutputTokens: 700,
        },
      }),
    });

    // =====================================================
    // GEMINI ERROR HANDLING
    // =====================================================

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();

      console.error(
        "GEMINI_API_ERROR:",
        geminiResponse.status,
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gemini API request failed.",
          details: errorText,
        },
        {
          status: 502,
        }
      );
    }

    // =====================================================
    // PARSE GEMINI RESPONSE
    // =====================================================

    const geminiData = await geminiResponse.json();

    const reply =
      geminiData?.candidates?.[0]?.content?.parts
        ?.map(
          (part: { text?: string }) =>
            part.text || ""
        )
        .join("")
        .trim();

    // =====================================================
    // EMPTY RESPONSE
    // =====================================================

    if (!reply) {
      console.error(
        "GEMINI_EMPTY_RESPONSE:",
        JSON.stringify(geminiData)
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Gemini returned an empty response.",
        },
        {
          status: 502,
        }
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json({
      success: true,
      reply,
      answer: reply,
      complaintsCount: complaints.length,
    });
  } catch (error) {
    console.error(
      "AI_CHAT_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "AI Assistant temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}