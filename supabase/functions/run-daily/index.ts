import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.52.0";

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
    const keywordsApiKey = Deno.env.get("KEYWORDSAI_API_KEY");

    if (!keywordsApiKey) {
      throw new Error("KEYWORDSAI_API_KEY is not configured");
    }

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

    console.log(`Running daily pipeline for user: ${user.id}`);

    const openai = new OpenAI({
      baseURL: "https://api.keywordsai.co/api/",
      apiKey: keywordsApiKey,
    });

    const startTime = Date.now();

    // Get user's resume
    const { data: resume } = await supabase
      .from("resumes")
      .select("resume_text")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get user preferences
    const { data: preferences } = await supabase
      .from("preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Get unmatched job posts (jobs not already matched to this user)
    const { data: existingMatches } = await supabase
      .from("job_matches")
      .select("job_post_id")
      .eq("user_id", user.id);

    const matchedJobIds = existingMatches?.map(m => m.job_post_id) || [];

    const { data: jobPosts, error: jobsError } = await supabase
      .from("job_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      throw new Error("Failed to fetch job posts");
    }

    const unmatchedJobs = jobPosts?.filter(j => !matchedJobIds.includes(j.id)) || [];
    console.log(`Found ${unmatchedJobs.length} unmatched jobs to process`);

    const results = {
      jobsProcessed: 0,
      matchesCreated: 0,
      draftsCreated: 0,
      errors: [] as string[],
    };

    for (const job of unmatchedJobs) {
      try {
        results.jobsProcessed++;

        // Step 1: Score the job fit using Keywords AI
        console.log(`Scoring job: ${job.title} at ${job.company}`);
        
        const fitResponse = await openai.chat.completions.create({
          model: "fit_scorer_v1",
          messages: [
            {
              role: "user",
              content: JSON.stringify({
                resume: resume?.resume_text || "No resume provided",
                job: {
                  title: job.title,
                  company: job.company,
                  location: job.location,
                  description: job.description,
                },
                preferences: preferences || {},
              }),
            },
          ],
        });

        let fitScore = 70;
        let reasons = {};
        
        try {
          const fitContent = fitResponse.choices[0]?.message?.content || "{}";
          const parsed = JSON.parse(fitContent);
          fitScore = parsed.score || parsed.fit_score || 70;
          reasons = parsed.reasons || parsed;
        } catch (parseError) {
          console.log("Using default fit score, parse error:", parseError);
        }

        // Create the match
        const { data: match, error: matchError } = await supabase
          .from("job_matches")
          .insert({
            job_post_id: job.id,
            user_id: user.id,
            fit_score: Math.min(100, Math.max(0, fitScore)),
            status: "DRAFTED",
            reasons,
          })
          .select()
          .single();

        if (matchError) {
          console.error(`Error creating match for job ${job.id}:`, matchError);
          results.errors.push(`Match error for ${job.title}: ${matchError.message}`);
          continue;
        }

        results.matchesCreated++;

        // Step 2: Generate application draft using Keywords AI
        console.log(`Generating draft for: ${job.title}`);
        
        const draftResponse = await openai.chat.completions.create({
          model: "application_generator_v1",
          messages: [
            {
              role: "user",
              content: JSON.stringify({
                resume: resume?.resume_text || "No resume provided",
                job: {
                  title: job.title,
                  company: job.company,
                  location: job.location,
                  description: job.description,
                },
              }),
            },
          ],
        });

        let coverLetter = "";
        let answersJson = {};
        
        try {
          const draftContent = draftResponse.choices[0]?.message?.content || "";
          const parsed = JSON.parse(draftContent);
          coverLetter = parsed.cover_letter || parsed.coverLetter || draftContent;
          answersJson = parsed.answers || {};
        } catch {
          coverLetter = draftResponse.choices[0]?.message?.content || "";
        }

        // Create the draft
        const { error: draftError } = await supabase
          .from("application_drafts")
          .insert({
            job_match_id: match.id,
            cover_letter: coverLetter,
            answers_json: answersJson,
            tailoring_notes: { generated_at: new Date().toISOString() },
          });

        if (draftError) {
          console.error(`Error creating draft for match ${match.id}:`, draftError);
          results.errors.push(`Draft error for ${job.title}: ${draftError.message}`);
          continue;
        }

        results.draftsCreated++;
        console.log(`Successfully processed job: ${job.title}`);

      } catch (jobError) {
        console.error(`Error processing job ${job.id}:`, jobError);
        results.errors.push(`${job.title}: ${jobError instanceof Error ? jobError.message : "Unknown error"}`);
      }
    }

    const duration = Date.now() - startTime;

    console.log("Daily pipeline complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        duration,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Run daily error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
