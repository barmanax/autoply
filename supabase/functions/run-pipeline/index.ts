import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PipelineStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  message?: string;
  count?: number;
}

interface PipelineResult {
  steps: PipelineStep[];
  summary: {
    jobsScraped: number;
    matchesFound: number;
    draftsCreated: number;
    duration: number;
  };
}

// 15 real intern positions at well-known companies
const DEMO_JOBS = [
  {
    title: "Software Engineering Intern",
    company: "Google",
    location: "Mountain View, CA",
    description: "Join Google's engineering team for a 12-week summer internship. Work on large-scale distributed systems, contribute to products used by billions.",
    source: "linkedin",
    url: "https://careers.google.com/jobs/intern-swe-2026",
  },
  {
    title: "Software Development Engineer Intern",
    company: "Amazon",
    location: "Seattle, WA",
    description: "Design and build innovative technologies in a team environment. Work on real-world problems at massive scale.",
    source: "linkedin",
    url: "https://amazon.jobs/sde-intern-2026",
  },
  {
    title: "SWE Intern - Summer 2026",
    company: "Meta",
    location: "Menlo Park, CA",
    description: "Build products that connect billions of people. Work alongside experienced engineers on real projects.",
    source: "linkedin",
    url: "https://metacareers.com/jobs/swe-intern-2026",
  },
  {
    title: "Software Engineering Intern",
    company: "Apple",
    location: "Cupertino, CA",
    description: "Create the next generation of Apple products. Join teams working on iOS, macOS, or hardware/software integration.",
    source: "linkedin",
    url: "https://jobs.apple.com/swe-intern-2026",
  },
  {
    title: "Software Engineer Intern",
    company: "Microsoft",
    location: "Redmond, WA",
    description: "Work on products that empower every person and organization. Teams include Azure, Office, Windows, and Xbox.",
    source: "linkedin",
    url: "https://careers.microsoft.com/swe-intern-2026",
  },
  {
    title: "Software Engineering Intern",
    company: "Netflix",
    location: "Los Gatos, CA",
    description: "Build the streaming platform that entertains 250M+ members worldwide. Work on personalization and streaming infrastructure.",
    source: "linkedin",
    url: "https://jobs.netflix.com/swe-intern-2026",
  },
  {
    title: "Backend Engineering Intern",
    company: "Stripe",
    location: "San Francisco, CA",
    description: "Build the economic infrastructure for the internet. Work on APIs that power millions of businesses.",
    source: "linkedin",
    url: "https://stripe.com/jobs/backend-intern-2026",
  },
  {
    title: "Software Engineering Intern",
    company: "Nvidia",
    location: "Santa Clara, CA",
    description: "Work on GPU computing, AI infrastructure, and deep learning frameworks. Build technology powering the AI revolution.",
    source: "linkedin",
    url: "https://nvidia.com/careers/swe-intern-2026",
  },
  {
    title: "Machine Learning Engineering Intern",
    company: "OpenAI",
    location: "San Francisco, CA",
    description: "Work on the cutting edge of AI research and deployment. Help build safe and beneficial AI systems.",
    source: "linkedin",
    url: "https://openai.com/careers/ml-intern-2026",
  },
  {
    title: "Software Engineering Intern",
    company: "Databricks",
    location: "San Francisco, CA",
    description: "Build the unified analytics platform. Work on infrastructure that processes petabytes of data.",
    source: "linkedin",
    url: "https://databricks.com/careers/swe-intern-2026",
  },
  {
    title: "Software Engineer Intern",
    company: "Ramp",
    location: "New York, NY",
    description: "Build the future of corporate finance. Work on our spend management platform used by 25,000+ businesses.",
    source: "linkedin",
    url: "https://ramp.com/careers/swe-intern-2026",
  },
  {
    title: "Software Engineering Intern",
    company: "Uber",
    location: "San Francisco, CA",
    description: "Build apps used by millions of riders and drivers worldwide. Work on cutting-edge mobile and backend technology.",
    source: "linkedin",
    url: "https://uber.com/careers/swe-intern-2026",
  },
  {
    title: "Software Engineering Intern",
    company: "Airbnb",
    location: "San Francisco, CA",
    description: "Help create a world where anyone can belong anywhere. Work on the platform powering millions of stays.",
    source: "linkedin",
    url: "https://careers.airbnb.com/swe-intern-2026",
  },
  {
    title: "Software Engineering Intern",
    company: "Coinbase",
    location: "Remote",
    description: "Build the future of finance. Work on the platform that makes crypto accessible to everyone.",
    source: "linkedin",
    url: "https://coinbase.com/careers/swe-intern-2026",
  },
  {
    title: "Software Engineering Intern",
    company: "Palantir",
    location: "New York, NY",
    description: "Build software that solves the world's hardest problems. Work on platforms used by governments and enterprises.",
    source: "linkedin",
    url: "https://palantir.com/careers/swe-intern-2026",
  },
];

// Hardcoded match data based on Aditya Barman's resume
const DEMO_MATCHES: Record<string, { fitScore: number; reasons: string[]; coverLetter: string }> = {
  "Google": {
    fitScore: 94,
    reasons: ["Strong Python/Java experience from Motorola internship", "Distributed systems experience with RAG pipeline", "4.0 GPA at UIUC"],
    coverLetter: `Dear Google Hiring Team,

I am excited to apply for the Software Engineering Intern position at Google. As a Computer Science student at UIUC with a 4.0 GPA, I am eager to contribute to large-scale distributed systems.

At Motorola Solutions, I designed a full-stack RAG system using LangChain and ChromaDB that indexed 30,000+ documents, supporting 350 engineers. This experience prepared me for Google's scale.

My work at the Department of Defense's AI4Defense program developed my ability to build production-quality software, reducing manual effort by 90%.

I would welcome the opportunity to contribute to your engineering team.

Best regards,
Aditya Barman`
  },
  "Amazon": {
    fitScore: 91,
    reasons: ["Full-stack development across multiple internships", "Experience with AWS and cloud technologies", "Hackathon wins demonstrate problem-solving"],
    coverLetter: `Dear Amazon Hiring Team,

I am writing to express my interest in the SDE Intern position. As a CS student at UIUC with production deployment experience, I am excited about tackling problems at Amazon's scale.

At Motorola, I built systems used organization-wide, including a RAG system serving 350 engineers. My EchoBrief project was selected Top 10 out of 495 submissions.

I am proficient in Python, Java, TypeScript, and have hands-on experience with AWS and GCP.

Best regards,
Aditya Barman`
  },
  "Meta": {
    fitScore: 89,
    reasons: ["React and full-stack experience", "Machine learning background for AI initiatives", "Strong project portfolio"],
    coverLetter: `Dear Meta Recruiting Team,

I am thrilled to apply for the SWE Intern position. Building products that connect billions aligns with my passion for impactful technology.

My LearnLion project using React and Flask with Gemini API demonstrates my full-stack capabilities. At the Department of Defense, my work was recognized with a podium finish at the AI4Defense Showcase.

I am excited about Meta's AI mission and would be honored to contribute.

Sincerely,
Aditya Barman`
  },
  "Apple": {
    fitScore: 88,
    reasons: ["4.0 GPA demonstrates academic excellence", "ML experience with efficient model deployment", "Creative problem-solving across projects"],
    coverLetter: `Dear Apple Hiring Team,

I am excited to apply for the Software Engineering Intern position. Apple's dedication to seamless user experiences resonates with my development approach.

At Motorola, I extended a RAG system with multimodal capabilities using OpenAI CLIP embeddings—aligning with Apple's on-device performance focus.

I am passionate about building technology that delights users.

Best regards,
Aditya Barman`
  },
  "Microsoft": {
    fitScore: 90,
    reasons: ["Strong Python, C++, and Java experience", "Cloud experience with Azure-compatible tech", "Research on LLM evaluation"],
    coverLetter: `Dear Microsoft Hiring Team,

Microsoft's mission to empower every person and organization aligns with my passion for accessible technology.

At Motorola, I designed systems that empowered hundreds of engineers. My research at GMU comparing LLMs demonstrates my interest in AI technologies.

I am excited about the opportunity to work on products like Azure, Office, or Windows.

Best regards,
Aditya Barman`
  },
  "Netflix": {
    fitScore: 85,
    reasons: ["Strong Python and JavaScript experience", "ML background for personalization systems", "Data processing at scale"],
    coverLetter: `Dear Netflix Hiring Team,

I am excited about the opportunity to work on the streaming platform that entertains 250M+ members.

My experience processing 30,000+ documents with vector embeddings at Motorola prepared me for Netflix's data scale. I am eager to apply my ML skills to personalization systems.

Best regards,
Aditya Barman`
  },
  "Stripe": {
    fitScore: 92,
    reasons: ["Backend engineering with API development", "Distributed systems and database experience", "Security-conscious development at DoD"],
    coverLetter: `Dear Stripe Hiring Team,

Building the economic infrastructure for the internet is exactly the high-impact work I am passionate about.

At Motorola, I designed backend systems with ingestion pipelines and access controls. My DoD work involved careful attention to data integrity and security.

I am excited to contribute to APIs powering millions of businesses.

Best regards,
Aditya Barman`
  },
  "Nvidia": {
    fitScore: 93,
    reasons: ["Strong ML/AI experience with PyTorch and TensorFlow", "C++ experience for GPU computing", "Deep learning research at UIUC"],
    coverLetter: `Dear Nvidia Hiring Team,

The opportunity to work on GPU computing and AI infrastructure powering the AI revolution aligns with my experience.

I built multimodal ML systems using OpenAI CLIP and have strong PyTorch/TensorFlow experience from my UIUC research.

I would be honored to contribute to technology powering the AI revolution.

Best regards,
Aditya Barman`
  },
  "OpenAI": {
    fitScore: 96,
    reasons: ["Extensive LLM and AI API experience", "Published research on LLM evaluation at MIT URTC", "Production RAG systems with embeddings"],
    coverLetter: `Dear OpenAI Hiring Team,

Building safe and beneficial AI systems is the defining challenge of our generation, and I am eager to contribute.

My research at GMU evaluated LLM performance, published at MIT URTC 2024. At Motorola, I built production RAG systems serving 350 engineers.

My strong ML fundamentals and passion for AI safety make me an ideal candidate.

Best regards,
Aditya Barman`
  },
  "Databricks": {
    fitScore: 87,
    reasons: ["Big data processing and ML pipeline experience", "Python and distributed systems", "Interest in data infrastructure"],
    coverLetter: `Dear Databricks Hiring Team,

Building the unified analytics platform that processes petabytes is exactly the infrastructure work I am passionate about.

At Motorola, I built data pipelines processing 30,000+ documents. My ML background aligns with Databricks' mission.

Best regards,
Aditya Barman`
  },
  "Ramp": {
    fitScore: 96,
    reasons: ["Strong TypeScript and Python experience", "Production systems at Motorola", "Fintech interest and efficiency focus"],
    coverLetter: `Dear Ramp Hiring Team,

Building the future of corporate finance at a fast-growing startup is exactly the opportunity I am seeking.

At Motorola, I deployed systems used by 350 engineers. My EchoBrief project was Top 10 out of 495 submissions. At the DoD, I automated workflows reducing effort by 90%.

I am passionate about fintech and Ramp's mission.

Best regards,
Aditya Barman`
  },
  "Uber": {
    fitScore: 88,
    reasons: ["Mobile and backend development experience", "Python and TypeScript proficiency", "Experience with real-time systems"],
    coverLetter: `Dear Uber Hiring Team,

I am excited about the opportunity to build technology used by millions of riders and drivers.

My experience with full-stack development and real-time systems at Motorola has prepared me for Uber's scale.

Best regards,
Aditya Barman`
  },
  "Airbnb": {
    fitScore: 86,
    reasons: ["Full-stack development with React and Python", "Statistical modeling from USDA research", "Strong data analysis skills"],
    coverLetter: `Dear Airbnb Hiring Team,

Creating a world where anyone can belong anywhere is an inspiring mission.

My research at UIUC with statistical modeling and my full-stack experience prepared me for Airbnb's data-driven approach.

Best regards,
Aditya Barman`
  },
  "Coinbase": {
    fitScore: 84,
    reasons: ["Strong backend skills with Python and Go", "Security-conscious development from DoD", "Interest in financial technology"],
    coverLetter: `Dear Coinbase Hiring Team,

Building the future of finance on crypto infrastructure is an exciting opportunity.

My security-conscious development at the DoD and backend experience make me well-suited for Coinbase.

Best regards,
Aditya Barman`
  },
  "Palantir": {
    fitScore: 90,
    reasons: ["Complex systems development experience", "Government work at DoD demonstrates clearance potential", "Strong problem-solving skills"],
    coverLetter: `Dear Palantir Hiring Team,

Building software that solves the world's hardest problems resonates with my experience.

My work at the Department of Defense on the AI4Defense program demonstrates my ability to work on impactful government technology.

Best regards,
Aditya Barman`
  },
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

    console.log(`Running demo pipeline for user: ${user.id}`);
    
    const startTime = Date.now();
    const steps: PipelineStep[] = [
      { id: "scrape", name: "Scraping job boards", status: "pending" },
      { id: "match", name: "Matching jobs to profile", status: "pending" },
      { id: "draft", name: "Generating application drafts", status: "pending" },
    ];

    // Step 1: Insert demo jobs
    steps[0].status = "running";
    console.log("Step 1: Adding demo jobs...");
    
    const jobsWithDate = DEMO_JOBS.map(job => ({
      ...job,
      date_posted: new Date().toISOString().split('T')[0],
    }));

    const { data: insertedJobs, error: jobsError } = await supabase
      .from("job_posts")
      .insert(jobsWithDate)
      .select();

    if (jobsError) {
      console.error("Error inserting jobs:", jobsError);
      steps[0].status = "failed";
      steps[0].message = jobsError.message;
      return new Response(
        JSON.stringify({ steps, error: "Failed to add jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    steps[0].status = "completed";
    steps[0].count = insertedJobs?.length || 0;
    steps[0].message = `Found ${insertedJobs?.length || 0} new intern positions`;
    console.log(`Step 1 complete: ${insertedJobs?.length} jobs added`);

    // Step 2: Create matches with hardcoded scores
    steps[1].status = "running";
    console.log("Step 2: Matching jobs to profile...");

    const matches = (insertedJobs || []).map((job) => {
      const matchData = DEMO_MATCHES[job.company || ""] || {
        fitScore: 82,
        reasons: ["Strong CS fundamentals", "Multiple internship experiences", "Full-stack skills"],
      };

      return {
        job_post_id: job.id,
        user_id: user.id,
        fit_score: matchData.fitScore,
        status: "DRAFTED",
        reasons: matchData.reasons,
      };
    });

    const { data: insertedMatches, error: matchesError } = await supabase
      .from("job_matches")
      .insert(matches)
      .select();

    if (matchesError) {
      console.error("Error creating matches:", matchesError);
      steps[1].status = "failed";
      steps[1].message = matchesError.message;
      return new Response(
        JSON.stringify({ steps, error: "Failed to match jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    steps[1].status = "completed";
    steps[1].count = insertedMatches?.length || 0;
    steps[1].message = `Matched ${insertedMatches?.length || 0} jobs to your profile`;
    console.log(`Step 2 complete: ${insertedMatches?.length} matches created`);

    // Step 3: Generate drafts with hardcoded cover letters
    steps[2].status = "running";
    console.log("Step 3: Generating drafts...");

    const drafts = (insertedMatches || []).map((match, index) => {
      const job = insertedJobs?.[index];
      const matchData = DEMO_MATCHES[job?.company || ""] || {
        coverLetter: `Dear Hiring Team,

I am excited to apply for the ${job?.title || "position"} at ${job?.company || "your company"}.

As a CS student at UIUC with a 4.0 GPA and experience at Motorola Solutions and the Department of Defense, I bring strong full-stack and ML skills.

Best regards,
Aditya Barman`
      };

      return {
        job_match_id: match.id,
        cover_letter: matchData.coverLetter,
        answers_json: {
          "Why are you interested in this role?": `I am excited about ${job?.company}'s impact and how it aligns with my software engineering and machine learning experience.`,
          "Describe a challenging project.": "At Motorola, I built a RAG system indexing 30,000+ documents, improving retrieval precision by 40% for 350 engineers.",
          "What are your career goals?": "I aim to become a technical leader building products that impact millions, combining AI/ML with practical engineering."
        },
        tailoring_notes: {
          demo_mode: true,
          profile: "Aditya Barman - UIUC CS '28",
        },
      };
    });

    const { data: insertedDrafts, error: draftsError } = await supabase
      .from("application_drafts")
      .insert(drafts)
      .select();

    if (draftsError) {
      console.error("Error creating drafts:", draftsError);
      steps[2].status = "failed";
      steps[2].message = draftsError.message;
      return new Response(
        JSON.stringify({ steps, error: "Failed to generate drafts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    steps[2].status = "completed";
    steps[2].count = insertedDrafts?.length || 0;
    steps[2].message = `Generated ${insertedDrafts?.length || 0} application drafts`;
    console.log(`Step 3 complete: ${insertedDrafts?.length} drafts created`);

    const duration = Date.now() - startTime;

    const result: PipelineResult = {
      steps,
      summary: {
        jobsScraped: insertedJobs?.length || 0,
        matchesFound: insertedMatches?.length || 0,
        draftsCreated: insertedDrafts?.length || 0,
        duration,
      },
    };

    console.log("Demo pipeline completed:", result.summary);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
