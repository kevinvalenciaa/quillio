// Slack /capture command handler
// Deploy: supabase functions deploy slack-capture
// Configure in Slack: Slash Command -> Request URL: https://YOUR-PROJECT.supabase.co/functions/v1/slack-capture

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SLACK_SIGNING_SECRET = Deno.env.get("SLACK_SIGNING_SECRET");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    // Parse form data from Slack
    const formData = await req.formData();
    const text = formData.get("text") as string;
    const slackUserId = formData.get("user_id") as string;
    const userName = formData.get("user_name") as string;
    const channelId = formData.get("channel_id") as string;
    const responseUrl = formData.get("response_url") as string;

    // Validate we have the required fields
    if (!text || !slackUserId) {
      return new Response(
        JSON.stringify({
          response_type: "ephemeral",
          text: "❌ Please include your thought after /capture. Example: `/capture thinking about pricing models`",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Look up Quillio user by Slack ID in integrations table
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("user_id, settings")
      .eq("type", "slack")
      .eq("connected", true)
      .filter("settings->slack_user_id", "eq", slackUserId)
      .single();

    if (integrationError || !integration) {
      // Try to find by checking all slack integrations (backup method)
      const { data: allSlackIntegrations } = await supabase
        .from("integrations")
        .select("user_id, settings")
        .eq("type", "slack")
        .eq("connected", true);

      const matchingIntegration = allSlackIntegrations?.find(
        (i) => i.settings?.slack_user_id === slackUserId
      );

      if (!matchingIntegration) {
        return new Response(
          JSON.stringify({
            response_type: "ephemeral",
            text: "❌ Your Slack account is not connected to Quillio.\n\nTo connect:\n1. Open Quillio app\n2. Go to Settings → Integrations\n3. Click Connect on Slack\n4. Try this command again",
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const userId = integration?.user_id;

    // Create capture in database
    const { data: capture, error: captureError } = await supabase
      .from("captures")
      .insert({
        user_id: userId,
        content: text,
        source: "slack",
        category: "uncategorized",
        urgency: "normal",
        tags: [],
        processed: false,
      })
      .select()
      .single();

    if (captureError) {
      console.error("Error creating capture:", captureError);
      return new Response(
        JSON.stringify({
          response_type: "ephemeral",
          text: "❌ Failed to save your capture. Please try again.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Return success message to Slack
    return new Response(
      JSON.stringify({
        response_type: "ephemeral",
        text: `✅ Got it! Your thought has been captured.\n\n> "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"\n\nIt will be processed overnight and may inform your Monday ritual.`,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Slack capture error:", error);
    return new Response(
      JSON.stringify({
        response_type: "ephemeral",
        text: "❌ Something went wrong. Please try again later.",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
});

