import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { targetUserId, ownerEmail, visitorName, reason, contactNumber } =
      await req.json();

    if (!visitorName || !reason || !contactNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let recipientEmail: string | null = null;

    // 1. First priority: Fetch profile owner's email directly from Supabase using targetUserId
    if (targetUserId && targetUserId !== "default") {
      try {
        const { data: profile, error: dbError } = await supabase
          .from("profiles")
          .select("email, resume_data")
          .eq("user_id", targetUserId)
          .single();

        if (!dbError && profile) {
          // Check resume_data.email first, then profile.email
          const foundEmail = profile.resume_data?.email || profile.email;
          if (foundEmail && foundEmail !== "hello@reallygreatsite.com") {
            recipientEmail = foundEmail;
          }
        }
      } catch (err) {
        console.warn("Supabase lookup error:", err);
      }
    }

    // 2. Second priority: Email passed directly from frontend (if valid & not template dummy)
    if (
      !recipientEmail &&
      ownerEmail &&
      ownerEmail !== "hello@reallygreatsite.com"
    ) {
      recipientEmail = ownerEmail;
    }

    // 3. Reject request if no valid user email was found
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Could not find profile owner's email address." },
        { status: 404 },
      );
    }

    // 4. Send email using system Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Access Request" <${process.env.GMAIL_USER}>`,
      to: recipientEmail, // Sent directly to the signed-up user's email address
      subject: `🔑 New Resume Access Request from ${visitorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 16px;">
          <h2 style="color: #6366f1; margin-top: 0;">Resume Access Request</h2>
          <p style="color: #94a3b8; font-size: 14px;">
            A visitor requested access to your protected resume details on your portfolio.
          </p>
          
          <div style="background-color: #1e293b; padding: 16px; border-radius: 12px; border: 1px solid #334155; margin: 20px 0;">
            <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #cbd5e1;">Visitor Name:</strong> ${visitorName}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #cbd5e1;">Contact Number:</strong> ${contactNumber}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #cbd5e1;">Reason for Request:</strong> ${reason}</p>
          </div>

          <p style="color: #94a3b8; font-size: 13px;">
            You can reach out directly to <strong>${visitorName}</strong> at 
            <a href="tel:${contactNumber}" style="color: #38bdf8; text-decoration: none;">${contactNumber}</a>.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Nodemailer error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send email notification" },
      { status: 500 },
    );
  }
}
