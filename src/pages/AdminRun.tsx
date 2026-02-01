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
  Mail,
  Zap,
  Sparkles,
  Bell,
  Globe
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
  { id: "mon", label: "M", full: "Monday" },
  { id: "tue", label: "T", full: "Tuesday" },
  { id: "wed", label: "W", full: "Wednesday" },
  { id: "thu", label: "T", full: "Thursday" },
  { id: "fri", label: "F", full: "Friday" },
  { id: "sat", label: "S", full: "Saturday" },
  { id: "sun", label: "S", full: "Sunday" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8" },
  { value: "America/Phoenix", label: "Arizona Time", offset: "UTC-7" },
  { value: "Europe/London", label: "London (GMT)", offset: "UTC+0" },
  { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", offset: "UTC+8" },
  { value: "Australia/Sydney", label: "Sydney (AEST)", offset: "UTC+11" },
];

export default function AdminRun() {
  const navigate = useNavigate();
  const [result, setResult] = useState<PipelineResult | null>(null);
  
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
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground/40" />;
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

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-xl" />
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Pipeline Control</h1>
          </div>
          <p className="text-muted-foreground max-w-lg">
            Automate your job search with intelligent matching and personalized cover letters
          </p>
        </div>
      </div>

      <Tabs defaultValue="run" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 p-1.5 h-14 bg-muted/50 border border-border/50">
          <TabsTrigger value="run" className="gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg">
            <Play className="h-4 w-4" />
            Run Now
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg">
            <CalendarClock className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="run" className="mt-8 space-y-6 animate-fade-in">
          {/* Run Button Card */}
          <Card className="overflow-hidden border-border/50 bg-card/50 hover:border-primary/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Run Pipeline</CardTitle>
                    <CardDescription>
                      Scrape → Match → Draft in one click
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
                  className="h-12 px-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
                >
                  {runPipeline.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Pipeline
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            {(runPipeline.isPending || result) && (
              <CardContent className="relative pt-6 space-y-6">
                {/* Progress bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Pipeline Progress</span>
                    <span className="font-bold text-primary">{Math.round(getProgressValue())}%</span>
                  </div>
                  <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                      style={{ width: `${getProgressValue()}%` }}
                    />
                    <div 
                      className="absolute inset-y-0 left-0 bg-primary/30 rounded-full animate-pulse"
                      style={{ width: `${getProgressValue()}%` }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {(result?.steps || [
                    { id: "scrape", name: "Scraping job boards", status: "pending" as const },
                    { id: "match", name: "Matching jobs to profile", status: "pending" as const },
                    { id: "draft", name: "Generating application drafts", status: "pending" as const },
                  ]).map((step) => {
                    const Icon = stepIcons[step.id] || Search;
                    const isActive = step.status === "running";
                    const isComplete = step.status === "completed";
                    
                    return (
                      <div
                        key={step.id}
                        className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                          isActive
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                            : isComplete
                            ? "border-success/30 bg-success/5"
                            : step.status === "failed"
                            ? "border-destructive/30 bg-destructive/5"
                            : "border-border/30 bg-muted/20"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-xl bg-primary/5 animate-pulse" />
                        )}
                        <div className="relative flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl transition-all ${
                            isComplete 
                              ? "bg-success/10 border border-success/20" 
                              : isActive
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-muted/30"
                          }`}>
                            <Icon className={`h-5 w-5 transition-colors ${
                              isComplete 
                                ? "text-success" 
                                : isActive
                                ? "text-primary"
                                : "text-muted-foreground/50"
                            }`} />
                          </div>
                          <div>
                            <p className={`font-semibold ${isActive ? "text-primary" : ""}`}>
                              {step.name}
                            </p>
                            {step.message && (
                              <p className="text-sm text-muted-foreground">{step.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="relative flex items-center gap-3">
                          {step.count !== undefined && (
                            <span className="text-sm font-bold px-3 py-1 rounded-full bg-muted border border-border/50">
                              {step.count}
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
            <Card className="border-success/30 bg-success/5 overflow-hidden animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-transparent" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-success/10 rounded-full blur-3xl" />
              <CardHeader className="relative">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-success/10 border border-success/20">
                    <CheckCircle2 className="h-7 w-7 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-success">
                      Pipeline Complete! 🎉
                    </CardTitle>
                    <CardDescription>
                      Finished in {formatDuration(result.summary.duration)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 20, label: "Jobs Scraped", icon: Search },
                    { value: result.summary.matchesFound, label: "Matches", icon: Target },
                    { value: result.summary.draftsCreated, label: "Drafts", icon: FileText },
                  ].map((stat, i) => (
                    <div 
                      key={stat.label}
                      className="text-center p-5 bg-card/80 backdrop-blur rounded-xl border border-success/20 hover:scale-105 transition-transform"
                    >
                      <stat.icon className="h-5 w-5 text-success mx-auto mb-2" />
                      <p className="text-4xl font-bold text-success">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <Button 
                    onClick={() => navigate("/inbox")} 
                    size="lg"
                    className="gap-2 h-12 px-8 text-base font-semibold bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success shadow-lg hover:shadow-success/25 transition-all hover:-translate-y-0.5"
                  >
                    View Your Matches
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {runPipeline.isError && (
            <Card className="border-destructive/50 bg-destructive/5 animate-fade-in">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 text-destructive">
                  <div className="p-2 rounded-xl bg-destructive/10">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Pipeline Failed</p>
                    <p className="text-sm opacity-80">
                      {runPipeline.error instanceof Error 
                        ? runPipeline.error.message 
                        : "Failed to run pipeline"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="mt-8 animate-fade-in">
          <Card className="overflow-hidden border-border/50 bg-card/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <CardHeader className="relative pb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <CalendarClock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Schedule Daily Pipeline</CardTitle>
                  <CardDescription>
                    Automate your job search on your terms
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-8 pt-2">
              {/* Time Preview */}
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <div className="text-5xl font-bold tracking-tight gradient-text">
                    {formatTimeDisplay(scheduleTime)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {TIMEZONES.find(tz => tz.value === scheduleTimezone)?.label || scheduleTimezone}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Time Selection */}
                <div className="space-y-3">
                  <Label htmlFor="schedule-time" className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="h-4 w-4 text-primary" />
                    Run Time
                  </Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="h-12 text-lg font-mono bg-muted/30 border-border/50 focus:border-primary"
                  />
                </div>

                {/* Timezone Selection */}
                <div className="space-y-3">
                  <Label htmlFor="schedule-timezone" className="flex items-center gap-2 text-sm font-semibold">
                    <Globe className="h-4 w-4 text-primary" />
                    Timezone
                  </Label>
                  <Select value={scheduleTimezone} onValueChange={setScheduleTimezone}>
                    <SelectTrigger className="h-12 bg-muted/30 border-border/50 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>
                          <span className="flex items-center gap-2">
                            <span>{tz.label}</span>
                            <span className="text-xs text-muted-foreground">({tz.offset})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Day Selection */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Run on these days
                </Label>
                <div className="flex gap-2 justify-center">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => handleDayToggle(day.id)}
                      className={`w-12 h-12 rounded-xl font-semibold text-sm transition-all ${
                        selectedDays.includes(day.id)
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted border border-border/50"
                      }`}
                      title={day.full}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Email */}
              <div className="space-y-3">
                <Label htmlFor="notification-email" className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="h-4 w-4 text-primary" />
                  Notification Email (optional)
                </Label>
                <Input
                  id="notification-email"
                  type="email"
                  placeholder="you@example.com"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="h-12 bg-muted/30 border-border/50 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Get notified when new matches are found
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSaveSchedule}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
                  disabled={scheduleSaved}
                >
                  {scheduleSaved ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Schedule Saved!
                    </>
                  ) : (
                    <>
                      <Bell className="h-5 w-5 mr-2" />
                      Save Schedule
                    </>
                  )}
                </Button>
              </div>

              {/* Demo Notice */}
              <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-sm text-muted-foreground text-center">
                  <span className="font-semibold text-foreground">Demo Mode:</span> Scheduling is for demonstration only.
                  In production, this would configure a real cron job.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
