import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * API Route: Send Email via Resend
 * POST /api/send-email
 * 
 * Body: {
 *   to: string, // Admin email
 *   subject: string,
 *   html: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const { to, subject, html } = await request.json();

        // Validate input
        if (!to || !subject || !html) {
            return NextResponse.json(
                { error: "Missing required fields (to, subject, html)" },
                { status: 400 }
            );
        }

        // Check for Resend API key
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error("Resend API key not configured");
            return NextResponse.json(
                { error: "Email service not configured" },
                { status: 500 }
            );
        }

        // Initialize Resend
        const resend = new Resend(apiKey);

        // Send email
        const { data, error } = await resend.emails.send({
            from: "AIC Volunteer System <onboarding@resend.dev>", // Use your verified domain in production
            to,
            subject,
            html,
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json(
                { error: error.message || "Failed to send email" },
                { status: 500 }
            );
        }

        console.log(`Email sent to: ${to}`, data);

        return NextResponse.json({
            success: true,
            message: "Email sent successfully",
            emailId: data?.id,
        });
    } catch (error: any) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send email" },
            { status: 500 }
        );
    }
}
