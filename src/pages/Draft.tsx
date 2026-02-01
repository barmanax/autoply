import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DEMO_FILLED_FIELDS } from "@/lib/demo-data";
import { 
  FileEdit, 
  Building2, 
  MapPin, 
  ExternalLink, 
  Check, 
  X, 
  Pencil,
  ArrowLeft,
  Loader2,
  User,
  CheckCircle2,
  Sparkles
} from "lucide-react";

type JobMatch = {
  id: string;
  fit_score: number | null;
  status: string | null;
  reasons: string[] | null;
  job_posts: {
    id: string;
    title: string | null;
    company: string | null;
    location: string | null;
    description: string | null;
    url: string | null;
  } | null;
};

type ApplicationDraft = {
  id: string;
  cover_letter: string | null;
  answers_json: Record<string, string> | null;
  tailoring_notes: Record<string, string> | null;
};

export default function Draft() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: match, isLoading: matchLoading, error: matchError } = useQuery({
    queryKey: ["job-match", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_matches")
        .select(`
          id,
          fit_score,
          status,
          reasons,
          job_posts (
            id,
            title,
            company,
            location,
            description,
            url
          )
        `)
        .eq("id", matchId!)
        .maybeSingle();

      if (error) throw error;
      return data as JobMatch | null;
    },
    enabled: !!matchId,
  });

  const { data: draft, isLoading: draftLoading } = useQuery({
    queryKey: ["application-draft", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_drafts")
        .select("id, cover_letter, answers_json, tailoring_notes")
        .eq("job_match_id", matchId!)
        .maybeSingle();

      if (error) throw error;
      return data as ApplicationDraft | null;
    },
    enabled: !!matchId,
  });

  useEffect(() => {
    if (draft) {
      setCoverLetter(draft.cover_letter || "");
      setAnswers(draft.answers_json || {});
    }
  }, [draft]);

  const updateDraftMutation = useMutation({
    mutationFn: async (data: { cover_letter: string; answers_json: Record<string, string> }) => {
      if (draft?.id) {
        const { error } = await supabase
          .from("application_drafts")
          .update({
            cover_letter: data.cover_letter,
            answers_json: data.answers_json,
          })
          .eq("id", draft.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("application_drafts")
          .insert({
            job_match_id: matchId,
            cover_letter: data.cover_letter,
            answers_json: data.answers_json,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application-draft", matchId] });
      setIsEditing(false);
      toast({ title: "Draft saved", description: "Your changes have been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from("job_matches")
        .update({ status })
        .eq("id", matchId!);
      if (error) throw error;
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["job-matches"] });
      queryClient.invalidateQueries({ queryKey: ["job-match", matchId] });
      toast({ 
        title: status === "APPLIED" ? "Approved!" : "Skipped", 
        description: status === "APPLIED" ? "Application marked as approved." : "Job skipped." 
      });
      navigate("/inbox");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateDraftMutation.mutate({ cover_letter: coverLetter, answers_json: answers });
  };

  const handleApprove = () => {
    updateStatusMutation.mutate("APPLIED");
  };

  const handleSkip = () => {
    updateStatusMutation.mutate("SKIPPED");
  };

  const isLoading = matchLoading || draftLoading;
  const isSaving = updateDraftMutation.isPending || updateStatusMutation.isPending;

  const getFitScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  if (matchError) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/inbox")} className="hover:bg-muted/50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load job match.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoading && !match) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/inbox")} className="hover:bg-muted/50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Job match not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/inbox")} className="hover:bg-muted/50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving} className="border-border/50">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-primary to-primary/90">
                {updateDraftMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleSkip} disabled={isSaving} className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                <X className="h-4 w-4 mr-2" />
                Skip
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isSaving} className="border-border/50">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleApprove} disabled={isSaving} className="bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success shadow-lg hover:shadow-success/25">
                {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Job Info Card */}
      <Card className="border-border/50 bg-card/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-7 w-64 mb-2" />
                  <Skeleton className="h-5 w-48" />
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl">
                    {match?.job_posts?.title || "Untitled Position"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {match?.job_posts?.company || "Unknown Company"}
                    </span>
                    {match?.job_posts?.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {match.job_posts.location}
                      </span>
                    )}
                  </CardDescription>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isLoading ? (
                <Skeleton className="h-12 w-24 rounded-xl" />
              ) : (
                <>
                  <Badge variant="secondary" className="h-7">
                    {match?.status || "DRAFTED"}
                  </Badge>
                  {match?.fit_score && (
                    <div className="text-center px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Fit</p>
                      <p className={`text-2xl font-bold ${getFitScoreColor(match.fit_score)}`}>
                        {match.fit_score}%
                      </p>
                    </div>
                  )}
                  {match?.job_posts?.url && (
                    <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10 hover:text-primary">
                      <a href={match.job_posts.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        {match?.job_posts?.description && (
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
              {match.job_posts.description}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Auto-Filled Fields Card */}
      <Card className="border-success/30 bg-success/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-transparent" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success/10 border border-success/20">
              <User className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-lg text-success">Auto-Filled Fields</CardTitle>
              <CardDescription>
                These fields were automatically filled from your profile
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_FILLED_FIELDS.map((field) => (
              <div key={field.label} className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/30">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">{field.label}</p>
                  <p className="text-sm font-medium truncate">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Application Draft Card */}
      <Card className="border-border/50 bg-card/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <FileEdit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Application Draft</CardTitle>
              <CardDescription>AI-generated application materials</CardDescription>
            </div>
            <div className="ml-auto">
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label htmlFor="cover-letter" className="text-sm font-semibold">Cover Letter</Label>
                {isEditing ? (
                  <Textarea
                    id="cover-letter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write your cover letter..."
                    className="min-h-[200px] bg-muted/30 border-border/50 focus:border-primary"
                  />
                ) : (
                  <div className="rounded-xl border border-border/50 p-4 min-h-[100px] bg-muted/20">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {coverLetter || "No cover letter yet."}
                    </p>
                  </div>
                )}
              </div>

              {Object.keys(answers).length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Application Answers</Label>
                  {Object.entries(answers).map(([question, answer]) => (
                    <div key={question} className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{question}</p>
                      {isEditing ? (
                        <Textarea
                          value={answer}
                          onChange={(e) => setAnswers({ ...answers, [question]: e.target.value })}
                          className="min-h-[80px] bg-muted/30 border-border/50 focus:border-primary"
                        />
                      ) : (
                        <div className="rounded-xl border border-border/50 p-3 bg-muted/20">
                          <p className="text-sm">{answer || "No answer provided."}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!draft && !isEditing && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No draft found. Click Edit to start writing your application.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
