import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock,
  Search,
  Target,
  FileText,
  ArrowRight,
  AlertCircle
} from "lucide-react";

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
    jobsCollected: number;
    matchesScored: number;
    draftsCreated: number;
    duration: number;
  };
  message?: string;
}

const stepIcons: Record<string, typeof Search> = {
  collect: Search,
  score: Target,
  draft: FileText,
};

export default function AdminRun() {
  const navigate = useNavigate();
  const [result, setResult] = useState<PipelineResult | null>(null);

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

  const runPipeline = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("run-daily", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data as PipelineResult;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const getStepStatus = (step: PipelineStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getProgressValue = () => {
    if (!result?.steps) return runPipeline.isPending ? 33 : 0;
    const completed = result.steps.filter(s => s.status === "completed").length;
    return (completed / result.steps.length) * 100;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const canRun = onboardingStatus?.complete && !runPipeline.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Check Today's Open Roles</h1>
        <p className="text-muted-foreground mt-1">
          Find jobs, score fit, and generate application drafts
        </p>
      </div>

      {/* Onboarding Warning */}
      {onboardingStatus && !onboardingStatus.complete && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Complete your profile before running the pipeline
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Play className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Pipeline Controls</CardTitle>
                <CardDescription>
                  Collect jobs, score fit, and generate application drafts
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => {
                setResult(null);
                runPipeline.mutate();
              }}
              disabled={!canRun}
              size="lg"
            >
              {runPipeline.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Pipeline
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {(runPipeline.isPending || result) && (
          <CardContent className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(getProgressValue())}%</span>
              </div>
              <Progress value={getProgressValue()} className="h-2" />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {(result?.steps || [
                { id: "collect", name: "Collecting jobs", status: runPipeline.isPending ? "running" as const : "pending" as const },
                { id: "score", name: "Scoring fit", status: "pending" as const },
                { id: "draft", name: "Drafting applications", status: "pending" as const },
              ]).map((step) => {
                const Icon = stepIcons[step.id] || Search;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      step.status === "running" 
                        ? "border-primary bg-primary/5" 
                        : step.status === "completed"
                        ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                        : step.status === "failed"
                        ? "border-destructive/50 bg-destructive/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        step.status === "completed" 
                          ? "bg-green-100 dark:bg-green-900" 
                          : step.status === "running"
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          step.status === "completed" 
                            ? "text-green-600 dark:text-green-400" 
                            : step.status === "running"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{step.name}</p>
                        {step.message && (
                          <p className="text-sm text-muted-foreground">{step.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {step.count !== undefined && (
                        <span className="text-sm font-medium text-muted-foreground">
                          {step.count} items
                        </span>
                      )}
                      {getStepStatus(step)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summary Card */}
      {result?.summary && !runPipeline.isPending && (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <CardTitle className="text-green-800 dark:text-green-200">
                  Pipeline Complete
                </CardTitle>
                <CardDescription>
                  Finished in {formatDuration(result.summary.duration)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background rounded-lg border">
                <p className="text-3xl font-bold text-primary">
                  {result.summary.jobsCollected}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Jobs Collected</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border">
                <p className="text-3xl font-bold text-primary">
                  {result.summary.matchesScored}
                </p>
                <p className="text-sm text-muted-foreground mt-1">High Matches</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border">
                <p className="text-3xl font-bold text-primary">
                  {result.summary.draftsCreated}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Drafts Created</p>
              </div>
            </div>
            {result.message && (
              <p className="mt-4 text-sm text-muted-foreground text-center">
                {result.message}
              </p>
            )}
            <div className="mt-6 flex justify-center">
              <Button onClick={() => navigate("/inbox")} className="gap-2">
                Go to Inbox
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {runPipeline.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="h-5 w-5" />
              <p>
                {runPipeline.error instanceof Error 
                  ? runPipeline.error.message 
                  : "Failed to run pipeline"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
