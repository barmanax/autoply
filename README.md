# Autoply - AI-Powered Job Application Assistant

Autoply is a job application management platform that uses AI to match jobs to your profile, score fit, and generate personalized application drafts.

## Features

- **Resume Upload**: Upload your resume (PDF or paste text)
- **Profile Setup**: Set your preferences for job roles, locations, remote work, and salary
- **AI-Powered Matching**: Automatically matches jobs to your profile using AI
- **Fit Scoring**: Each job gets a fit score based on your resume and preferences
- **Draft Generation**: AI generates cover letters and application answers
- **Review & Approve**: Review drafts, edit if needed, then approve or skip

## Demo Flow

1. **Sign up/Login** at `/auth`
2. **Complete Onboarding** at `/onboarding`:
   - Upload/paste your resume
   - Fill in profile details (graduation, work authorization)
   - Set job preferences (roles, locations, remote, salary)
3. **Run the Pipeline** at `/admin/run`:
   - Click "Run Pipeline" to find and match jobs
   - Pipeline: Collect jobs → Score fit → Generate drafts
4. **Review Drafts** at `/inbox`:
   - See matched jobs sorted by fit score
   - Click a job to review the draft
5. **Approve/Skip** at `/draft/:matchId`:
   - Review cover letter and answers
   - Edit if needed
   - Approve to submit or Skip to dismiss

## Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd <project-folder>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Required Environment Variables

### Frontend (.env)

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Backend (Supabase Secrets)

These are set in the Supabase dashboard under Project Settings > Edge Functions > Secrets:

```
SUPABASE_SERVICE_ROLE_KEY    # Auto-provided by Supabase
KEYWORDSAI_API_KEY           # Your Keywords AI API key
```

## Keywords AI Integration

Autoply uses [Keywords AI](https://keywordsai.co) as the LLM gateway for all AI operations. The integration uses the OpenAI SDK routed through Keywords AI:

```typescript
const openai = new OpenAI({
  baseURL: "https://api.keywordsai.co/api/",
  apiKey: process.env.KEYWORDSAI_API_KEY,
});
```

### Prompt Names Used

1. **fit_scorer_v1**: Scores how well a job matches the user's resume and preferences
   - Input: Resume, job details, preferences
   - Output: Fit score (0-100), reasons, strengths, gaps

2. **application_generator_v1**: Generates cover letters and application answers
   - Input: Resume, job details, profile info
   - Output: Cover letter, answers JSON, confidence score

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions, Storage)
- **AI**: Keywords AI Gateway (OpenAI-compatible API)

## Database Tables

- `profiles` - User profile info (graduation, work auth, demographics)
- `resumes` - Stored resume text and file paths
- `preferences` - Job search preferences (roles, locations, salary)
- `job_posts` - Job listings (loaded from seed_jobs.json)
- `job_matches` - User-job matches with fit scores
- `application_drafts` - Generated cover letters and answers
- `submission_events` - Record of approved applications

## API Endpoints (Edge Functions)

- `POST /run-daily` - Run the full pipeline (collect, score, draft)
- `POST /approve` - Approve an application (set status to APPLIED)
- `POST /skip` - Skip a job (set status to SKIPPED)
- `POST /seed-jobs` - Seed database with demo jobs

## System Status

Visit `/status` to check system health:
- Supabase connection
- Environment variables
- AI gateway connectivity
- Authentication status
