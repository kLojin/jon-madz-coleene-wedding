import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const body = await request.json();
    const fullName = String(body.full_name ?? "").trim();
    const attendance = String(body.attendance ?? "");
    const isAttending = attendance === "Yes, I will attend";
    const isDeclining = attendance === "Sorry, I cannot attend";
    const guestCount = isAttending ? Number(body.guest_count) : null;
    const contactNumber = isAttending
      ? String(body.contact_number ?? "").trim() || null
      : null;
    const message = String(body.message ?? "").trim() || null;

    if (fullName.length < 2 || fullName.length > 120) {
      return jsonResponse({ success: false, error: "Invalid full name" }, 400);
    }

    if (!isAttending && !isDeclining) {
      return jsonResponse({ success: false, error: "Invalid attendance value" }, 400);
    }

    if (isAttending && (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 5)) {
      return jsonResponse({ success: false, error: "Invalid guest count" }, 400);
    }

    if (contactNumber && contactNumber.length > 40) {
      return jsonResponse({ success: false, error: "Invalid contact number" }, 400);
    }

    if (message && message.length > 1000) {
      return jsonResponse({ success: false, error: "Message is too long" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      console.error("Missing required Edge Function secret");
      return jsonResponse({ success: false, error: "Server configuration error" }, 500);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const submission = {
      full_name: fullName,
      attendance,
      guest_count: guestCount,
      contact_number: contactNumber,
      message,
    };

    const { data: savedRsvp, error: insertError } = await adminClient
      .from("wedding_rsvps")
      .insert(submission)
      .select("id, submitted_at")
      .single();

    if (insertError) {
      console.error("RSVP database error:", insertError.message);
      return jsonResponse({ success: false, error: "Could not save RSVP" }, 500);
    }

    const submittedAt = new Date(savedRsvp.submitted_at).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      dateStyle: "long",
      timeStyle: "short",
    });

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Wedding RSVP <onboarding@resend.dev>",
        to: ["jonandmik@gmail.com"],
        subject: `${isAttending ? "Attending" : "Unable to Attend"}: ${fullName}`,
        html: `
          <div style="max-width:620px;margin:0 auto;padding:32px;font-family:Arial,sans-serif;color:#2f2521;background:#fbf8f2">
            <p style="margin:0 0 10px;color:#9b6f62;font-size:12px;letter-spacing:2px;text-transform:uppercase">New Wedding RSVP</p>
            <h1 style="margin:0 0 26px;font-family:Georgia,serif;font-weight:400">${escapeHtml(fullName)}</h1>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:12px 0;border-bottom:1px solid #e4d8ca;color:#756d64">Attendance</td><td style="padding:12px 0;border-bottom:1px solid #e4d8ca;text-align:right"><strong>${escapeHtml(attendance)}</strong></td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #e4d8ca;color:#756d64">Guests</td><td style="padding:12px 0;border-bottom:1px solid #e4d8ca;text-align:right">${isAttending ? guestCount : "—"}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #e4d8ca;color:#756d64">Contact</td><td style="padding:12px 0;border-bottom:1px solid #e4d8ca;text-align:right">${escapeHtml(contactNumber || "—")}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #e4d8ca;color:#756d64">Submitted</td><td style="padding:12px 0;border-bottom:1px solid #e4d8ca;text-align:right">${escapeHtml(submittedAt)}</td></tr>
            </table>
            ${message ? `<div style="margin-top:24px;padding:20px;background:#fff"><strong>Message</strong><p style="margin:10px 0 0;line-height:1.6">${escapeHtml(message)}</p></div>` : ""}
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Resend notification failed:", await emailResponse.text());
      return jsonResponse({
        success: true,
        notification_sent: false,
        rsvp_id: savedRsvp.id,
      });
    }

    return jsonResponse({
      success: true,
      notification_sent: true,
      rsvp_id: savedRsvp.id,
    });
  } catch (error) {
    console.error("Unexpected RSVP function error:", error);
    return jsonResponse({ success: false, error: "Invalid request" }, 400);
  }
});
