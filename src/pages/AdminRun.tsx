import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  CalendarClock,
  Mail
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
    jobsScraped: number;
    matchesFound: number;
    draftsCreated: number;
    duration: number;
  };
}

const stepIcons: Record<string, typeof Search> = {
  scrape: Search,
  match: Target,
  draft: FileText,
};

const WEEKDAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago", 
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

export default function AdminRun() {
  const navigate = useNavigate();
  const [result, setResult] = useState<PipelineResult | null>(null);
  
  // Schedule state (dummy for MVP)
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleTimezone, setScheduleTimezone] = useState("America/New_York");
  const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const handleDayToggle = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSaveSchedule = () => {
    // Dummy save - just show success for MVP
    setScheduleSaved(true);
    setTimeout(() => setScheduleSaved(false), 3000);
  };

  const runPipeline = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("run-pipeline", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
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
    if (!result?.steps) return 0;
    const completed = result.steps.filter(s => s.status === "completed").length;
    return (completed / result.steps.length) * 100;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Run Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          Trigger and monitor the job matching pipeline
        </p>
      </div>

      <Tabs defaultValue="run" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="run" className="gap-2">
            <Play className="h-4 w-4" />
            Run Pipeline
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <CalendarClock className="h-4 w-4" />
            Schedule Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="run" className="mt-6 space-y-6">
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Play className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Pipeline Controls</CardTitle>
                <CardDescription>
                  Scrape jobs, match to your profile, and generate drafts
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => {
                setResult(null);
                runPipeline.mutate();
              }}
              disabled={runPipeline.isPending}
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
                { id: "scrape", name: "Scraping job boards", status: "pending" as const },
                { id: "match", name: "Matching jobs to profile", status: "pending" as const },
                { id: "draft", name: "Generating application drafts", status: "pending" as const },
              ]).map((step, index) => {
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
                  20
                </p>
                <p className="text-sm text-muted-foreground mt-1">Jobs Scraped</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border">
                <p className="text-3xl font-bold text-primary">
                  {result.summary.matchesFound}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Matches Found</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border">
                <p className="text-3xl font-bold text-primary">
                  {result.summary.draftsCreated}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Drafts Created</p>
              </div>
            </div>
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
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CalendarClock className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Schedule Daily Pipeline</CardTitle>
                  <CardDescription>
                    Set up automatic job matching to run at the same time every day
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Time Selection */}
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Time to run</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>

                {/* Timezone Selection */}
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={scheduleTimezone} onValueChange={setScheduleTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Weekday Selection */}
              <div className="space-y-3">
                <Label>Days to run</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <label
                      key={day.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedDays.includes(day.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={selectedDays.includes(day.id)}
                        onCheckedChange={() => handleDayToggle(day.id)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email Notification */}
              <div className="space-y-2">
                <Label htmlFor="notification-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notification email
                </Label>
                <Input
                  id="notification-email"
                  type="email"
                  placeholder="your@email.com"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Receive a daily summary of matched jobs at this email
                </p>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-4 pt-4">
                <Button onClick={handleSaveSchedule} className="gap-2">
                  {scheduleSaved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Schedule Saved!
                    </>
                  ) : (
                    <>
                      <CalendarClock className="h-4 w-4" />
                      Save Schedule
                    </>
                  )}
                </Button>
                {scheduleSaved && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your schedule has been saved (demo mode)
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div className="rounded-lg bg-muted/50 border p-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This is a preview feature. When enabled, Autoply will automatically 
                  scrape job boards, match new positions to your profile, and email you a summary of the 
                  best matches at your scheduled time.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
