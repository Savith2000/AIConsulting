import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

/**
 * API Route: Send SMS via Twilio
 * POST /api/send-sms
 * 
 * Body: {
 *   to: string[], // Array of phone numbers
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const { to, message } = await request.json();

        // Validate input
        if (!to || !Array.isArray(to) || to.length === 0) {
            return NextResponse.json(
                { error: "Invalid recipient list" },
                { status: 400 }
            );
        }

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Invalid message" },
                { status: 400 }
            );
        }

        // Check for Twilio credentials
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            console.error("Twilio credentials not configured");
            return NextResponse.json(
                { error: "SMS service not configured" },
                { status: 500 }
            );
        }

        // Initialize Twilio client
        const client = twilio(accountSid, authToken);

        // Send SMS to each recipient
        const results = await Promise.allSettled(
            to.map(async (phoneNumber) => {
                // Format phone number (ensure it starts with +1 for US numbers)
                const formattedNumber = phoneNumber.startsWith("+")
                    ? phoneNumber
                    : `+1${phoneNumber.replace(/\D/g, "")}`;

                return client.messages.create({
                    body: message,
                    from: fromNumber,
                    to: formattedNumber,
                });
            })
        );

        // Count successes and failures
        const successes = results.filter((r) => r.status === "fulfilled").length;
        const failures = results.filter((r) => r.status === "rejected").length;

        console.log(`SMS sent: ${successes} succeeded, ${failures} failed`);

        return NextResponse.json({
            success: true,
            sent: successes,
            failed: failures,
            total: to.length,
        });
    } catch (error: any) {
        console.error("Error sending SMS:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send SMS" },
            { status: 500 }
        );
    }
}
