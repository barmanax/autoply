import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { matchId, coverLetter, answersJson } = await req.json();

    if (!matchId) {
      return new Response(
        JSON.stringify({ error: "matchId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Approving match ${matchId} for user ${user.id}`);

    // Verify the match belongs to this user
    const { data: match, error: matchError } = await supabase
      .from("job_matches")
      .select("id, user_id, job_post_id")
      .eq("id", matchId)
      .eq("user_id", user.id)
      .single();

    if (matchError || !match) {
      console.error("Match not found or unauthorized:", matchError);
      return new Response(
        JSON.stringify({ error: "Match not found or unauthorized" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the match status to APPLIED
    const { error: updateMatchError } = await supabase
      .from("job_matches")
      .update({ status: "APPLIED" })
      .eq("id", matchId);

    if (updateMatchError) {
      console.error("Error updating match:", updateMatchError);
      throw new Error("Failed to update match status");
    }

    // Update the draft if cover letter or answers provided
    if (coverLetter !== undefined || answersJson !== undefined) {
      const updateData: Record<string, unknown> = {};
      if (coverLetter !== undefined) updateData.cover_letter = coverLetter;
      if (answersJson !== undefined) updateData.answers_json = answersJson;

      const { error: updateDraftError } = await supabase
        .from("application_drafts")
        .update(updateData)
        .eq("job_match_id", matchId);

      if (updateDraftError) {
        console.error("Error updating draft:", updateDraftError);
        // Non-fatal, continue
      }
    }

    // Create a submission event
    const { error: eventError } = await supabase
      .from("submission_events")
      .insert({
        job_match_id: matchId,
        submitted_to: "manual_approval",
        payload: {
          approved_at: new Date().toISOString(),
          user_id: user.id,
        },
      });

    if (eventError) {
      console.error("Error creating submission event:", eventError);
      // Non-fatal, continue
    }

    console.log(`Match ${matchId} approved successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        matchId,
        status: "APPLIED",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Approve error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
