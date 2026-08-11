import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      subject,
      message,
    } = body;

    // Required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and message are required.",
        },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing");

      return NextResponse.json(
        {
          success: false,
          message: "Email service is not configured.",
        },
        { status: 500 }
      );
    }

    if (!process.env.CONTACT_EMAIL) {
      console.error("CONTACT_EMAIL is missing");

      return NextResponse.json(
        {
          success: false,
          message: "Contact email is not configured.",
        },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "SmartDELHI <onboarding@resend.dev>",

      // IMPORTANT:
      // Resend testing mode only allows your own verified account email.
      to: [process.env.CONTACT_EMAIL],

      // User's email will appear as Reply-To
      replyTo: email,

      subject: `SmartDELHI Contact: ${
        subject?.trim() || "New Message"
      }`,

      html: `
        <!DOCTYPE html>
        <html>
          <body style="
            margin:0;
            padding:0;
            background:#f1f5f9;
            font-family:Arial,Helvetica,sans-serif;
          ">

            <div style="
              max-width:680px;
              margin:40px auto;
              padding:0 20px;
            ">

              <!-- Header -->
              <div style="
                background:#0f172a;
                color:#ffffff;
                padding:30px;
                border-radius:20px 20px 0 0;
              ">

                <h1 style="
                  margin:0;
                  font-size:28px;
                  letter-spacing:-0.5px;
                ">
                  SmartDELHI
                </h1>

                <p style="
                  margin:8px 0 0;
                  color:#67e8f9;
                  font-size:14px;
                ">
                  New Citizen Contact Message
                </p>

              </div>

              <!-- Content -->
              <div style="
                background:#ffffff;
                padding:30px;
                border-radius:0 0 20px 20px;
              ">

                <h2 style="
                  margin-top:0;
                  color:#0f172a;
                  font-size:20px;
                ">
                  Contact Details
                </h2>

                <div style="
                  background:#f8fafc;
                  border-radius:14px;
                  padding:20px;
                ">

                  <p style="margin:0 0 12px;">
                    <strong>Name:</strong>
                    ${escapeHtml(name)}
                  </p>

                  <p style="margin:0 0 12px;">
                    <strong>Email:</strong>
                    ${escapeHtml(email)}
                  </p>

                  ${
                    phone
                      ? `
                        <p style="margin:0 0 12px;">
                          <strong>Phone:</strong>
                          ${escapeHtml(phone)}
                        </p>
                      `
                      : ""
                  }

                  ${
                    subject
                      ? `
                        <p style="margin:0;">
                          <strong>Subject:</strong>
                          ${escapeHtml(subject)}
                        </p>
                      `
                      : ""
                  }

                </div>

                <hr style="
                  border:none;
                  border-top:1px solid #e5e7eb;
                  margin:28px 0;
                " />

                <h3 style="
                  color:#0f172a;
                  margin-bottom:12px;
                ">
                  Message
                </h3>

                <div style="
                  background:#f1f5f9;
                  padding:20px;
                  border-radius:14px;
                  color:#334155;
                  line-height:1.7;
                  white-space:pre-wrap;
                ">
                  ${escapeHtml(message)}
                </div>

                <p style="
                  margin-top:28px;
                  color:#64748b;
                  font-size:12px;
                  line-height:1.6;
                ">
                  This message was submitted through the
                  SmartDELHI Contact Us portal.
                </p>

              </div>

            </div>

          </body>
        </html>
      `,
    });

    // Resend returned an error
    if (error) {
      console.error("[Resend API Error]:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Email could not be sent.",
        },
        { status: 500 }
      );
    }

    console.log("SmartDELHI contact email sent:", data?.id);

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully.",
        id: data?.id,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[Contact API Error]:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while sending the message.",
      },
      { status: 500 }
    );
  }
}

/**
 * Prevent HTML injection inside email content.
 */
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}