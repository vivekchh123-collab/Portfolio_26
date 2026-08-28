import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const DUMMY_EMAILS = [
  "hello@reallygreatsite.com",
  "trackerrproo@gmail.com",
  "contact@example.com",
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  try {
    const { targetUserId, ownerEmail, visitorName, reason, contactNumber } =
      await req.json();

    if (!visitorName?.trim() || !reason?.trim() || !contactNumber?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Missing Gmail credentials in environment variables.");
      return NextResponse.json(
        { error: "Mail server configuration is missing." },
        { status: 500 },
      );
    }

    let recipientEmail: string | null = null;

    // 1. Fetch profile owner's email from Supabase
    if (targetUserId && targetUserId !== "default") {
      try {
        const { data: profile, error: dbError } = await supabase
          .from("profiles")
          .select("email, resume_data")
          .eq("user_id", targetUserId)
          .single();

        if (!dbError && profile) {
          const foundEmail = profile.resume_data?.email || profile.email;
          if (foundEmail && !DUMMY_EMAILS.includes(foundEmail.toLowerCase())) {
            recipientEmail = foundEmail;
          }
        }
      } catch (err) {
        console.warn("Supabase lookup error:", err);
      }
    }

    // 2. Second priority: Email passed from client
    if (
      !recipientEmail &&
      ownerEmail &&
      !DUMMY_EMAILS.includes(ownerEmail.toLowerCase())
    ) {
      recipientEmail = ownerEmail;
    }

    // 3. Reject if no valid recipient exists
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Could not find profile owner's email address." },
        { status: 404 },
      );
    }

    // 4. Sanitize user inputs
    const safeVisitorName = escapeHtml(visitorName.trim());
    const safeContact = escapeHtml(contactNumber.trim());
    const safeReason = escapeHtml(reason.trim());

    // 5. Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Access Request" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: `🔑 New Resume Access Request from ${safeVisitorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 16px;">
          <h2 style="color: #6366f1; margin-top: 0;">Resume Access Request</h2>
          <p style="color: #94a3b8; font-size: 14px;">
            A visitor requested access to your protected resume details on your portfolio.
          </p>
          
          <div style="background-color: #1e293b; padding: 16px; border-radius: 12px; border: 1px solid #334155; margin: 20px 0;">
            <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #cbd5e1;">Visitor Name:</strong> ${safeVisitorName}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #cbd5e1;">Contact Info:</strong> ${safeContact}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #cbd5e1;">Reason for Request:</strong> ${safeReason}</p>
          </div>

          <p style="color: #94a3b8; font-size: 13px;">
            You can reach out directly to <strong>${safeVisitorName}</strong> via 
            <span style="color: #38bdf8;">${safeContact}</span>.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Nodemailer dispatch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send email notification." },
      { status: 500 },
    );
  }
}
