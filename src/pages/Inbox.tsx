import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox as InboxIcon, Building2, MapPin, ExternalLink, Play, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type JobMatch = {
  id: string;
  fit_score: number | null;
  status: string | null;
  created_at: string | null;
  job_posts: {
    id: string;
    title: string | null;
    company: string | null;
    location: string | null;
  } | null;
};

// Get status badge styling
const getStatusVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toUpperCase()) {
    case "APPLIED":
    case "SUBMITTED":
      return "default";
    case "DRAFTED":
      return "secondary";
    case "NEEDS_REVIEW":
      return "outline";
    case "SKIPPED":
      return "destructive";
    default:
      return "secondary";
  }
};

// Get fit score color
const getFitScoreColor = (score: number | null) => {
  if (!score) return "text-muted-foreground";
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

export default function Inbox() {
  const navigate = useNavigate();

  // Fetch job matches with draft status only (actionable items)
  const { data: matches, isLoading, error } = useQuery({
    queryKey: ["job-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_matches")
        .select(`
          id,
          fit_score,
          status,
          created_at,
          job_posts (
            id,
            title,
            company,
            location
          )
        `)
        .in("status", ["DRAFTED", "NEEDS_REVIEW"])
        .order("fit_score", { ascending: false });

      if (error) throw error;
      return data as JobMatch[];
    },
  });

  // Get last pipeline run timestamp
  const { data: lastRun } = useQuery({
    queryKey: ["last-pipeline-run"],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_matches")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      return data?.created_at ? new Date(data.created_at) : null;
    },
  });

  // Check onboarding status
  const { data: onboardingStatus } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { complete: false, missing: ["auth"] };

      const [resumeResult, prefsResult] = await Promise.all([
        supabase.from("resumes").select("id").eq("user_id", user.id).limit(1),
        supabase.from("preferences").select("roles").eq("user_id", user.id).limit(1),
      ]);

      const hasResume = (resumeResult.data?.length ?? 0) > 0;
      const hasPreferences = (prefsResult.data?.length ?? 0) > 0 && 
        (prefsResult.data?.[0]?.roles?.length ?? 0) > 0;

      const missing: string[] = [];
      if (!hasResume) missing.push("resume");
      if (!hasPreferences) missing.push("preferences");

      return { complete: missing.length === 0, missing };
    },
  });

  const needsReviewCount = matches?.filter(m => m.status === "NEEDS_REVIEW").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-muted-foreground mt-1">
            Your matched jobs and application drafts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRun && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last run: {formatDistanceToNow(lastRun, { addSuffix: true })}
            </div>
          )}
          <Button onClick={() => navigate("/admin/run")} size="lg">
            <Play className="h-4 w-4 mr-2" />
            Check today's open roles
          </Button>
        </div>
      </div>

      {/* Onboarding Warning */}
      {onboardingStatus && !onboardingStatus.complete && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Complete your profile to start matching
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Missing: {onboardingStatus.missing.join(", ")}
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/onboarding")}>
                Complete Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Needs Review Alert */}
      {needsReviewCount > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <p className="text-orange-800 dark:text-orange-200">
                <strong>{needsReviewCount}</strong> application{needsReviewCount > 1 ? "s" : ""} need{needsReviewCount === 1 ? "s" : ""} your review before approval
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load job matches. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && matches?.length === 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <InboxIcon className="h-6 w-6 text-muted-foreground" />
              <div>
                <CardTitle>No pending applications</CardTitle>
                <CardDescription>
                  {onboardingStatus?.complete 
                    ? "Run the job matcher to find new opportunities"
                    : "Complete your profile setup first, then run the matcher"
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Job Matches List */}
      {!isLoading && !error && matches && matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((match) => (
            <Link key={match.id} to={`/draft/${match.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {match.job_posts?.title || "Untitled Position"}
                        </h3>
                        <Badge variant={getStatusVariant(match.status)}>
                          {match.status || "DRAFTED"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {match.job_posts?.company || "Unknown Company"}
                        </span>
                        {match.job_posts?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.job_posts.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Fit Score</p>
                        <p className={`text-lg font-bold ${getFitScoreColor(match.fit_score)}`}>
                          {match.fit_score ?? "—"}%
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
