// Sync calendar blocks to Google Calendar
// Deploy: supabase functions deploy sync-calendar

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CalendarBlock {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  priorityId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    const { userId, blocks } = (await req.json()) as {
      userId: string;
      blocks: CalendarBlock[];
    };

    if (!userId || !blocks?.length) {
      throw new Error("userId and blocks are required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's Google Calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "google-calendar")
      .eq("connected", true)
      .single();

    if (integrationError || !integration) {
      throw new Error(
        "Google Calendar not connected. Please connect in Settings."
      );
    }

    // Check if token needs refresh
    let accessToken = integration.access_token;
    const tokenExpiresAt = new Date(integration.token_expires_at || 0);

    if (tokenExpiresAt < new Date()) {
      // Token expired, need to refresh
      accessToken = await refreshGoogleToken(
        supabase,
        integration.refresh_token,
        userId
      );
    }

    const createdEvents: string[] = [];
    const errors: string[] = [];

    // Create calendar events for each block
    for (const block of blocks) {
      try {
        const event = {
          summary: `[Focus] ${block.title}`,
          description:
            "Protected focus time from Quillio. Auto-declining meetings during this block.",
          start: {
            dateTime: block.startTime,
            timeZone: "America/Los_Angeles", // TODO: Get from user settings
          },
          end: {
            dateTime: block.endTime,
            timeZone: "America/Los_Angeles",
          },
          colorId: "11", // Red/Tomato
          reminders: {
            useDefault: false,
            overrides: [{ method: "popup", minutes: 5 }],
          },
          // Mark as busy
          transparency: "opaque",
        };

        const response = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Google API error: ${response.status} - ${errorText}`);
        }

        const createdEvent = await response.json();

        // Save to our calendar_blocks table
        await supabase.from("calendar_blocks").insert({
          user_id: userId,
          priority_id: block.priorityId || null,
          external_event_id: createdEvent.id,
          title: block.title,
          start_time: block.startTime,
          end_time: block.endTime,
          protected: true,
        });

        createdEvents.push(createdEvent.id);
        console.log(`Created calendar event: ${block.title}`);
      } catch (blockError) {
        console.error(`Error creating block ${block.title}:`, blockError);
        errors.push(`${block.title}: ${blockError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: createdEvents.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Calendar sync error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function refreshGoogleToken(
  supabase: any,
  refreshToken: string,
  userId: string
): Promise<string> {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Google token");
  }

  const tokens = await response.json();

  // Update stored tokens
  await supabase
    .from("integrations")
    .update({
      access_token: tokens.access_token,
      token_expires_at: new Date(
        Date.now() + tokens.expires_in * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("type", "google-calendar");

  return tokens.access_token;
}

