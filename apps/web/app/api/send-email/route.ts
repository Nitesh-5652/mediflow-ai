import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { to, subject, message } = body;

    if (!to || !subject || !message) {
      return NextResponse.json({ success: false, error: "Missing fields" });
    }

    // FINAL FIX: ईमेल का स्ट्रक्चर और स्टाइल अपडेट किया गया है
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html: `
        <html>
          <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #0070f3;">Mediflow AI 🚀</h2>
              <hr style="border: 0; border-top: 1px solid #eee;" />
              <p style="font-size: 16px;">${message}</p>
              <footer style="margin-top: 20px; font-size: 12px; color: #888;">
                Sent via Mediflow AI Platform
              </footer>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("EMAIL ERROR:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}