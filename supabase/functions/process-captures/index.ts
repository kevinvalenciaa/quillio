// Batch process captures overnight using GPT-4o-mini
// Deploy: supabase functions deploy process-captures
// Trigger: Via pg_cron at 2 AM daily or manual invocation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CaptureAnalysis {
  category: "decision" | "concern" | "idea" | "progress";
  urgency: "time-sensitive" | "normal";
  tags: string[];
  potentialDecisionLoop: boolean;
  suggestedTitle: string | null;
  sentiment: "positive" | "negative" | "neutral";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all unprocessed captures
    const { data: captures, error: fetchError } = await supabase
      .from("captures")
      .select("*")
      .eq("processed", false)
      .order("created_at", { ascending: true })
      .limit(50); // Process in batches

    if (fetchError) {
      throw new Error(`Failed to fetch captures: ${fetchError.message}`);
    }

    if (!captures?.length) {
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          message: "No unprocessed captures found",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${captures.length} captures...`);

    let processedCount = 0;
    let errorCount = 0;

    for (const capture of captures) {
      try {
        // Use OpenAI to categorize and extract insights
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `You are an AI assistant helping founders organize their thoughts. Analyze the following capture from a startup founder and return a JSON object with:

- category: One of "decision" (requires a choice), "concern" (worry or risk), "idea" (new concept or opportunity), "progress" (update on work done)
- urgency: "time-sensitive" if it needs immediate attention (mentions deadlines, customer issues, runway concerns), otherwise "normal"
- tags: Array of 2-4 relevant lowercase tags (e.g., ["pricing", "growth", "hiring"])
- potentialDecisionLoop: true if this seems like a recurring decision the founder keeps revisiting without resolution
- suggestedTitle: If category is "decision" and potentialDecisionLoop is true, suggest a concise title for this decision (e.g., "Pricing Model: Usage vs Flat-fee"). Otherwise null.
- sentiment: "positive", "negative", or "neutral"

Be concise and accurate. Focus on startup-relevant categorization.`,
                },
                {
                  role: "user",
                  content: capture.content,
                },
              ],
              response_format: { type: "json_object" },
              temperature: 0.3,
              max_tokens: 500,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const aiResult = await response.json();
        const analysis: CaptureAnalysis = JSON.parse(
          aiResult.choices[0].message.content
        );

        // Update capture with analysis
        const { error: updateError } = await supabase
          .from("captures")
          .update({
            category: analysis.category,
            urgency: analysis.urgency,
            tags: analysis.tags,
            processed: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", capture.id);

        if (updateError) {
          throw new Error(`Failed to update capture: ${updateError.message}`);
        }

        // If it's a potential decision loop, create or update decision
        if (
          analysis.potentialDecisionLoop &&
          analysis.category === "decision" &&
          analysis.suggestedTitle
        ) {
          await handleDecisionLoop(
            supabase,
            capture,
            analysis.suggestedTitle
          );
        }

        processedCount++;
        console.log(`Processed capture ${capture.id}: ${analysis.category}`);
      } catch (captureError) {
        console.error(`Error processing capture ${capture.id}:`, captureError);
        errorCount++;
        // Continue processing other captures
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errorCount,
        total: captures.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Batch processing error:", error);
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

async function handleDecisionLoop(
  supabase: any,
  capture: any,
  suggestedTitle: string
) {
  // Check for existing decision with similar title
  const { data: existingDecisions } = await supabase
    .from("decisions")
    .select("*")
    .eq("user_id", capture.user_id)
    .eq("status", "active-loop");

  // Find a decision with similar keywords in title
  const titleKeywords = suggestedTitle.toLowerCase().split(/[\s:,-]+/);
  let matchingDecision = null;

  for (const decision of existingDecisions || []) {
    const decisionKeywords = decision.title.toLowerCase().split(/[\s:,-]+/);
    const overlap = titleKeywords.filter((k: string) =>
      decisionKeywords.some((dk: string) => dk.includes(k) || k.includes(dk))
    );
    if (overlap.length >= 2) {
      matchingDecision = decision;
      break;
    }
  }

  if (matchingDecision) {
    // Increment mention count on existing decision
    await supabase
      .from("decisions")
      .update({
        mention_count: matchingDecision.mention_count + 1,
        last_mentioned: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchingDecision.id);

    // Link capture to decision
    await supabase.from("decision_captures").insert({
      decision_id: matchingDecision.id,
      capture_id: capture.id,
    });

    // Update capture with linked decision
    await supabase
      .from("captures")
      .update({ linked_decision_id: matchingDecision.id })
      .eq("id", capture.id);

    console.log(
      `Linked capture to existing decision: ${matchingDecision.title}`
    );
  } else {
    // Create new decision
    const { data: newDecision, error } = await supabase
      .from("decisions")
      .insert({
        user_id: capture.user_id,
        title: suggestedTitle,
        status: "active-loop",
        mention_count: 1,
        first_mentioned: capture.created_at,
        last_mentioned: capture.created_at,
        options: [],
      })
      .select()
      .single();

    if (newDecision) {
      // Link capture to new decision
      await supabase.from("decision_captures").insert({
        decision_id: newDecision.id,
        capture_id: capture.id,
      });

      // Update capture with linked decision
      await supabase
        .from("captures")
        .update({ linked_decision_id: newDecision.id })
        .eq("id", capture.id);

      console.log(`Created new decision loop: ${suggestedTitle}`);
    }
  }
}

