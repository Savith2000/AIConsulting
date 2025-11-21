import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Handle Cancellation SMS Notification Logic
 * POST /api/cancel-notification
 * 
 * Body: {
 *   assignmentId: string,
 *   weekId: string,
 *   dayOfWeek: string,
 *   routeId: string,
 *   slotDate: string (ISO format)
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const { assignmentId, weekId, dayOfWeek, routeId, slotDate } = await request.json();

        // Validate input
        if (!assignmentId || !weekId || !dayOfWeek || !routeId || !slotDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Calculate if cancellation is within 48 hours
        const slotDateTime = new Date(slotDate);
        const now = new Date();
        const hoursUntilSlot = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        const isWithin48Hours = hoursUntilSlot <= 48 && hoursUntilSlot > 0;

        console.log(`Cancellation timing: ${hoursUntilSlot.toFixed(1)} hours until slot`);

        // Get route information
        const { data: route } = await supabase
            .from("routes")
            .select("route_number")
            .eq("id", routeId)
            .single();

        const routeNumber = route?.route_number || "Unknown";

        // Get volunteers with availability for this day
        const { data: volunteers, error: volError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, phone_number")
            .contains("availability_days", [dayOfWeek]);

        if (volError) {
            console.error("Error fetching volunteers:", volError);
            return NextResponse.json(
                { error: "Failed to fetch volunteers" },
                { status: 500 }
            );
        }

        // Filter out volunteers without phone numbers
        const contactableVolunteers = volunteers?.filter((v: any) => v.phone_number) || [];

        if (contactableVolunteers.length === 0) {
            console.log("No volunteers with availability and phone numbers found");
            return NextResponse.json({
                success: true,
                message: "No volunteers to notify",
            });
        }

        let smsResponse;

        // TEMPORARILY DISABLED: Volunteer notifications
        // Always send to admin for now
        if (false && isWithin48Hours) {
            // Send SMS to volunteers
            const message = `🚨 AIC Alert: A ${dayOfWeek} Route ${routeNumber} slot has just opened up! If you're available, please sign up ASAP via the volunteer dashboard.`;

            const phoneNumbers = contactableVolunteers.map((v: any) => v.phone_number);

            console.log(`Sending SMS to ${phoneNumbers.length} volunteers`);

            smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-sms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: phoneNumbers,
                    message,
                }),
            });
        } else {
            // TEMPORARILY DISABLED: SMS to admin
            // Only sending email notifications for now
            /*
            const adminNumbers = process.env.ADMIN_PHONE_NUMBERS?.split(",") || [];

            if (adminNumbers.length === 0) {
                console.log("No admin phone numbers configured");
                return NextResponse.json({
                    success: true,
                    message: "No admin numbers configured",
                });
            }

            const volunteerList = contactableVolunteers
                .map((v: any) => `${v.first_name} ${v.last_name}`)
                .join(", ");

            const message = `AIC Admin Alert: ${dayOfWeek} Route ${routeNumber} was cancelled (${hoursUntilSlot.toFixed(0)}hrs notice).\n\nAvailable volunteers: ${volunteerList || "None"}`;

            console.log(`Sending SMS to ${adminNumbers.length} admins`);

            smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-sms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: adminNumbers,
                    message,
                }),
            });
            */

            // Also send email to admin
            const adminEmail = process.env.ADMIN_EMAIL;
            if (adminEmail) {
                const volunteerDetails = contactableVolunteers
                    .map((v: any) => `• ${v.first_name} ${v.last_name} - ${v.phone_number}`)
                    .join("\n");

                const emailSubject = `Route Cancellation: ${dayOfWeek} Route ${routeNumber}`;
                const emailText = `A volunteer has cancelled their route assignment:\n\nDetails:\n- Day: ${dayOfWeek}\n- Route: Route ${routeNumber}\n- Notice: ${hoursUntilSlot.toFixed(0)} hours before slot\n\nAvailable Volunteers with ${dayOfWeek} availability:\n${volunteerDetails || "None found"}\n\nPlease reassign this route in the admin dashboard.`;

                const emailHtml = `
          <h2>Route Cancellation Alert</h2>
          <p>A volunteer has cancelled their route assignment:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <strong>Details:</strong><br>
            • Day: ${dayOfWeek}<br>
            • Route: Route ${routeNumber}<br>
            • Notice: ${hoursUntilSlot.toFixed(0)} hours before slot
          </div>
          <h3>Available Volunteers with ${dayOfWeek} availability:</h3>
          <ul>
            ${contactableVolunteers.map((v: any) => `<li>${v.first_name} ${v.last_name} - ${v.phone_number}</li>`).join("")}
          </ul>
          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="background: #3BB4C1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Admin Dashboard</a>
          </p>
        `;

                fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: adminEmail,
                        subject: emailSubject,
                        html: emailHtml,
                    }),
                }).catch((error) => {
                    console.error("Failed to send email (non-blocking):", error);
                });
            }
        }

        // const smsResult = await smsResponse?.json(); // SMS disabled

        return NextResponse.json({
            success: true,
            notification: "email", // Only email now
            // smsResult, // SMS disabled
        });
    } catch (error: any) {
        console.error("Error in cancel notification:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process notification" },
            { status: 500 }
        );
    }
}
