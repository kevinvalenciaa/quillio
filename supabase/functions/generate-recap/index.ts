// Generate weekly recap for a user
// Deploy: supabase functions deploy generate-recap
// Trigger: Via pg_cron every Friday at 4 PM or manual invocation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // Get optional userId from request (if not provided, process all users)
    let userIds: string[] = [];
    try {
      const body = await req.json();
      if (body.userId) {
        userIds = [body.userId];
      }
    } catch {
      // No body, process all users
    }

    // If no specific user, get all users who have captures this week
    if (userIds.length === 0) {
      const weekStart = getWeekStart(new Date());
      const { data: activeUsers } = await supabase
        .from("captures")
        .select("user_id")
        .gte("created_at", weekStart.toISOString())
        .order("user_id");

      userIds = [...new Set(activeUsers?.map((u) => u.user_id) || [])];
    }

    console.log(`Generating recaps for ${userIds.length} users...`);

    const results: { userId: string; success: boolean; error?: string }[] = [];

    for (const userId of userIds) {
      try {
        await generateUserRecap(supabase, OPENAI_API_KEY, userId);
        results.push({ userId, success: true });
      } catch (error) {
        console.error(`Error generating recap for ${userId}:`, error);
        results.push({ userId, success: false, error: error.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        processed: userIds.length,
        succeeded: successCount,
        failed: userIds.length - successCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate recap error:", error);
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

async function generateUserRecap(
  supabase: any,
  openaiKey: string,
  userId: string
) {
  const weekStart = getWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Get this week's data
  const [capturesResult, decisionsResult, prioritiesResult, contextResult] =
    await Promise.all([
      // Captures this week
      supabase
        .from("captures")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", weekStart.toISOString())
        .lt("created_at", weekEnd.toISOString()),

      // Decisions locked this week
      supabase
        .from("decisions")
        .select("*")
        .eq("user_id", userId)
        .gte("locked_at", weekStart.toISOString())
        .lt("locked_at", weekEnd.toISOString()),

      // Priorities this week
      supabase
        .from("priorities")
        .select("*")
        .eq("user_id", userId)
        .eq("week_of", weekStart.toISOString().split("T")[0]),

      // Founder context
      supabase
        .from("founder_context")
        .select("*")
        .eq("user_id", userId)
        .single(),
    ]);

  const captures = capturesResult.data || [];
  const decisions = decisionsResult.data || [];
  const priorities = prioritiesResult.data || [];
  const context = contextResult.data;

  // Calculate time allocation from capture categories
  const categoryCount: Record<string, number> = {};
  for (const capture of captures) {
    const cat = capture.category || "uncategorized";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  }

  const total = captures.length || 1;
  const timeAllocation = {
    operational: Math.round(
      ((categoryCount["concern"] || 0) / total) * 100
    ),
    strategic: Math.round(
      ((categoryCount["decision"] || 0) / total) * 100
    ),
    "sales-growth": Math.round(
      ((categoryCount["progress"] || 0) / total) * 100
    ),
    other: Math.round(
      ((categoryCount["idea"] || 0) + (categoryCount["uncategorized"] || 0)) /
        total *
        100
    ),
  };

  // Calculate priority gap
  let priorityGap = 0;
  for (const priority of priorities) {
    if (priority.actual_time !== null && priority.allocated_time) {
      priorityGap += Math.abs(priority.allocated_time - priority.actual_time);
    }
  }

  // Get runway info
  const runwayAtStart = context?.runway_days || 0;
  const runwayAtEnd = runwayAtStart - 7; // Simple approximation

  // Count active loops
  const { data: activeLoops } = await supabase
    .from("decisions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active-loop");

  // Generate insights using AI
  const insights = await generateInsights(openaiKey, {
    captures,
    decisions,
    priorities,
    context,
    timeAllocation,
  });

  // Create or update weekly recap
  const recapData = {
    user_id: userId,
    week_of: weekStart.toISOString().split("T")[0],
    time_allocation: timeAllocation,
    priority_gap: priorityGap,
    runway_at_start: runwayAtStart,
    runway_at_end: runwayAtEnd,
    decisions_locked: decisions.filter((d: any) => d.status === "locked").length,
    decisions_deferred: decisions.filter((d: any) => d.status === "deferred")
      .length,
    loops_remaining: activeLoops?.length || 0,
    insights,
  };

  const { error } = await supabase.from("weekly_recaps").upsert(recapData, {
    onConflict: "user_id,week_of",
  });

  if (error) {
    throw new Error(`Failed to save recap: ${error.message}`);
  }

  console.log(`Generated recap for user ${userId}`);
}

async function generateInsights(
  openaiKey: string,
  data: any
): Promise<string[]> {
  const prompt = `Based on this founder's weekly data, generate 3 actionable insights:

Captures this week: ${data.captures.length}
Decisions locked: ${data.decisions.length}
Time allocation: ${JSON.stringify(data.timeAllocation)}
Runway: ${data.context?.runway_days || "unknown"} days
Growth rate: ${data.context?.weekly_growth_rate || "unknown"}%
Growth target: ${data.context?.weekly_growth_target || 5}%

Priorities this week:
${data.priorities.map((p: any) => `- ${p.content}: allocated ${p.allocated_time}%, actual ${p.actual_time || "?"}%`).join("\n")}

Return exactly 3 insights as a JSON array of strings. Each insight should be:
1. Specific and actionable
2. Based on the data patterns
3. Focused on execution or decision-making

Example format: ["insight 1", "insight 2", "insight 3"]`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a startup advisor helping founders improve execution. Be direct and specific.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    return [
      "Review your time allocation against stated priorities",
      "Consider which active decision loops need resolution this week",
      "Focus on growth-driving activities to extend runway",
    ];
  }

  try {
    const result = await response.json();
    const parsed = JSON.parse(result.choices[0].message.content);
    return parsed.insights || parsed || [];
  } catch {
    return [
      "Review your time allocation against stated priorities",
      "Consider which active decision loops need resolution this week",
      "Focus on growth-driving activities to extend runway",
    ];
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

