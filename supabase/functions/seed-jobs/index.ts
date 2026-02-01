import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const seedJobs = [
  {
    title: "Software Engineering Intern",
    company: "Google",
    location: "Mountain View, CA",
    description: "Join Google's engineering team for a 12-week summer internship. Work on large-scale distributed systems, contribute to products used by billions. Requirements: Currently pursuing BS/MS in CS, strong coding skills in Python/Java/C++, understanding of data structures and algorithms.",
    source: "linkedin",
    url: "https://careers.google.com/jobs/intern-swe-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "SWE Intern - Summer 2026",
    company: "Meta",
    location: "Menlo Park, CA",
    description: "Build products that connect billions of people. You'll work alongside experienced engineers on real projects. Looking for students with experience in mobile development, systems programming, or machine learning. Must be enrolled in a BS/MS/PhD program.",
    source: "linkedin",
    url: "https://metacareers.com/jobs/swe-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Software Development Engineer Intern",
    company: "Amazon",
    location: "Seattle, WA",
    description: "Design and build innovative technologies in a team environment. Work on real-world problems at massive scale. Requirements: Pursuing a degree in Computer Science or related field, proficiency in at least one programming language, strong problem-solving skills.",
    source: "indeed",
    url: "https://amazon.jobs/sde-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Software Engineering Intern",
    company: "Apple",
    location: "Cupertino, CA",
    description: "Create the next generation of Apple products. Join teams working on iOS, macOS, or hardware/software integration. Looking for passion for technology, strong programming fundamentals, and creative problem-solving abilities.",
    source: "glassdoor",
    url: "https://jobs.apple.com/swe-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Software Engineer Intern",
    company: "Microsoft",
    location: "Redmond, WA",
    description: "Work on products that empower every person and organization. Teams include Azure, Office, Windows, and Xbox. Requirements: Enrolled in BS/MS program, coding experience in C#, C++, Java, or Python, passion for technology.",
    source: "linkedin",
    url: "https://careers.microsoft.com/swe-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Backend Engineering Intern",
    company: "Stripe",
    location: "San Francisco, CA",
    description: "Build the economic infrastructure for the internet. Work on APIs that power millions of businesses. Looking for strong fundamentals in distributed systems, databases, and API design. Ruby, Go, or Java experience preferred.",
    source: "linkedin",
    url: "https://stripe.com/jobs/backend-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Software Engineering Intern",
    company: "Airbnb",
    location: "San Francisco, CA",
    description: "Help create a world where anyone can belong anywhere. Work on the platform powering millions of stays. Requirements: Strong CS fundamentals, experience with web technologies (React, Node.js), passion for travel and community.",
    source: "indeed",
    url: "https://careers.airbnb.com/swe-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Full Stack Engineering Intern",
    company: "Figma",
    location: "San Francisco, CA",
    description: "Build the future of design tools. Work on our web-based collaborative design platform using TypeScript, React, and WebGL. Looking for students passionate about design, performance optimization, and real-time collaboration.",
    source: "linkedin",
    url: "https://figma.com/careers/fullstack-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Software Engineering Intern",
    company: "Notion",
    location: "San Francisco, CA",
    description: "Help build the all-in-one workspace. Work on features used by millions of teams worldwide. Requirements: Strong programming skills, experience with React or similar frameworks, interest in productivity tools.",
    source: "glassdoor",
    url: "https://notion.so/careers/swe-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Platform Engineering Intern",
    company: "Databricks",
    location: "San Francisco, CA",
    description: "Work on the unified analytics platform. Build infrastructure that processes petabytes of data. Requirements: Experience with Scala, Python, or Java, understanding of distributed systems, interest in big data and ML.",
    source: "linkedin",
    url: "https://databricks.com/careers/platform-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Software Engineering Intern",
    company: "Coinbase",
    location: "Remote",
    description: "Build the future of finance. Work on the platform that makes crypto accessible to everyone. Requirements: Strong coding skills, interest in blockchain technology, experience with Go, Python, or TypeScript.",
    source: "indeed",
    url: "https://coinbase.com/careers/swe-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Frontend Engineering Intern",
    company: "Vercel",
    location: "Remote",
    description: "Build the frontend cloud. Work on Next.js and the Vercel platform used by millions of developers. Requirements: Strong React/Next.js skills, understanding of web performance, passion for developer experience.",
    source: "linkedin",
    url: "https://vercel.com/careers/frontend-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Software Engineering Intern",
    company: "Robinhood",
    location: "Menlo Park, CA",
    description: "Democratize finance for all. Build trading infrastructure and mobile apps used by millions. Requirements: Strong algorithms and data structures, experience with Python or Go, interest in fintech.",
    source: "glassdoor",
    url: "https://robinhood.com/careers/swe-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Machine Learning Engineering Intern",
    company: "OpenAI",
    location: "San Francisco, CA",
    description: "Work on the cutting edge of AI research and deployment. Help build safe and beneficial AI systems. Requirements: Strong ML fundamentals, experience with PyTorch or TensorFlow, research or project experience in AI.",
    source: "linkedin",
    url: "https://openai.com/careers/ml-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Software Engineering Intern",
    company: "Palantir",
    location: "New York, NY",
    description: "Build software that solves the world's hardest problems. Work on platforms used by governments and enterprises. Requirements: Strong problem-solving skills, experience with Java or Python, ability to work on complex systems.",
    source: "linkedin",
    url: "https://palantir.com/careers/swe-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Infrastructure Engineering Intern",
    company: "Cloudflare",
    location: "San Francisco, CA",
    description: "Help build a better internet. Work on the network that powers 25M+ websites. Requirements: Systems programming experience, understanding of networking, Go or Rust experience preferred.",
    source: "indeed",
    url: "https://cloudflare.com/careers/infra-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Software Engineering Intern",
    company: "Discord",
    location: "San Francisco, CA",
    description: "Build the platform where communities come alive. Work on real-time communication at scale. Requirements: Experience with Python, Rust, or Elixir, interest in gaming and community platforms.",
    source: "linkedin",
    url: "https://discord.com/careers/swe-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Mobile Engineering Intern",
    company: "Uber",
    location: "San Francisco, CA",
    description: "Build apps used by millions of riders and drivers worldwide. Work on iOS or Android development with cutting-edge technology. Requirements: Swift or Kotlin experience, mobile development portfolio.",
    source: "glassdoor",
    url: "https://uber.com/careers/mobile-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Software Engineering Intern",
    company: "Shopify",
    location: "Remote",
    description: "Help millions of entrepreneurs start and grow their businesses. Work on the commerce platform that powers 10% of US e-commerce. Requirements: Ruby, Python, or JavaScript experience, interest in entrepreneurship.",
    source: "linkedin",
    url: "https://shopify.com/careers/swe-intern-2026",
    date_posted: "2026-02-01"
  },
  {
    title: "Backend Engineering Intern",
    company: "Plaid",
    location: "San Francisco, CA",
    description: "Build the infrastructure that connects fintech apps to financial institutions. Work on APIs used by thousands of companies. Requirements: Strong backend skills, Python or Go experience, interest in fintech.",
    source: "indeed",
    url: "https://plaid.com/careers/backend-intern-2026",
    date_posted: "2026-02-01"
  }
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Inserting seed jobs...");

    const { data, error } = await supabase
      .from("job_posts")
      .insert(seedJobs)
      .select();

    if (error) {
      console.error("Error inserting jobs:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully inserted ${data?.length || 0} jobs`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: data?.length || 0,
        jobs: data?.map(j => ({ id: j.id, title: j.title, company: j.company }))
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Seed jobs error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
