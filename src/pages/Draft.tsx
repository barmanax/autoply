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
  AlertCircle,
  Lightbulb
} from "lucide-react";

type FitReasons = {
  skills_match?: number;
  location_match?: number;
  experience_match?: number;
  overall?: string;
  strengths?: string[];
  gaps?: string[];
  [key: string]: unknown;
};

type TailoringNotes = {
  generated_at?: string;
  confidence?: number;
  issues?: string[];
  prompt_name?: string;
  [key: string]: unknown;
};

type JobMatch = {
  id: string;
  fit_score: number | null;
  status: string | null;
  reasons: FitReasons | null;
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
  tailoring_notes: TailoringNotes | null;
};

export default function Draft() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Fetch job match with job post details
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

  // Fetch application draft
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

  // Initialize form when draft loads
  useEffect(() => {
    if (draft) {
      setCoverLetter(draft.cover_letter || "");
      setAnswers(draft.answers_json || {});
    }
  }, [draft]);

  // Update draft mutation (saves cover letter and answers)
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

  // Approve mutation - calls the approve edge function
  const approveMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("approve", {
        body: { 
          matchId, 
          coverLetter,
          answersJson: answers,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-matches"] });
      queryClient.invalidateQueries({ queryKey: ["job-match", matchId] });
      toast({ 
        title: "Application Approved!", 
        description: "Your application has been marked as submitted." 
      });
      navigate("/inbox");
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to approve application.", 
        variant: "destructive" 
      });
    },
  });

  // Skip mutation - calls the skip edge function
  const skipMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("skip", {
        body: { 
          matchId,
          reason: "User skipped from draft review",
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-matches"] });
      queryClient.invalidateQueries({ queryKey: ["job-match", matchId] });
      toast({ 
        title: "Job Skipped", 
        description: "This job has been removed from your inbox." 
      });
      navigate("/inbox");
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to skip job.", 
        variant: "destructive" 
      });
    },
  });

  const handleSave = () => {
    updateDraftMutation.mutate({ cover_letter: coverLetter, answers_json: answers });
  };

  const handleApprove = () => {
    approveMutation.mutate();
  };

  const handleSkip = () => {
    skipMutation.mutate();
  };

  const isLoading = matchLoading || draftLoading;
  const isSaving = updateDraftMutation.isPending || approveMutation.isPending || skipMutation.isPending;
  const needsReview = match?.status === "NEEDS_REVIEW";
  const tailoringNotes = draft?.tailoring_notes as TailoringNotes | null;
  const fitReasons = match?.reasons as FitReasons | null;

  if (matchError) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/inbox")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load job match.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoading && !match) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/inbox")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Job match not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/inbox")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {updateDraftMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleSkip} disabled={isSaving}>
                {skipMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Skip
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isSaving}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleApprove} disabled={isSaving}>
                {approveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Needs Review Warning */}
      {needsReview && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  This application needs your review
                </p>
                {tailoringNotes?.issues && tailoringNotes.issues.length > 0 && (
                  <ul className="text-sm text-orange-700 dark:text-orange-300 mt-1 list-disc list-inside">
                    {tailoringNotes.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-7 w-64 mb-2" />
                  <Skeleton className="h-5 w-48" />
                </>
              ) : (
                <>
                  <CardTitle className="text-xl">
                    {match?.job_posts?.title || "Untitled Position"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {match?.job_posts?.company || "Unknown Company"}
                    </span>
                    {match?.job_posts?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {match.job_posts.location}
                      </span>
                    )}
                  </CardDescription>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <>
                  <Badge variant={match?.status === "NEEDS_REVIEW" ? "outline" : "secondary"}>
                    {match?.status || "DRAFTED"}
                  </Badge>
                  {match?.fit_score && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Fit</p>
                      <p className={`font-bold text-lg ${
                        match.fit_score >= 80 ? "text-green-600 dark:text-green-400" :
                        match.fit_score >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                        "text-red-600 dark:text-red-400"
                      }`}>
                        {match.fit_score}%
                      </p>
                    </div>
                  )}
                  {match?.job_posts?.url && (
                    <Button variant="ghost" size="icon" asChild>
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
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
              {match.job_posts.description}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Fit Reasons Card */}
      {fitReasons && Object.keys(fitReasons).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Why This Job Matches</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Score breakdowns */}
              <div className="grid grid-cols-3 gap-4">
                {fitReasons.skills_match !== undefined && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{fitReasons.skills_match}%</p>
                    <p className="text-xs text-muted-foreground">Skills Match</p>
                  </div>
                )}
                {fitReasons.location_match !== undefined && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{fitReasons.location_match}%</p>
                    <p className="text-xs text-muted-foreground">Location Match</p>
                  </div>
                )}
                {fitReasons.experience_match !== undefined && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{fitReasons.experience_match}%</p>
                    <p className="text-xs text-muted-foreground">Experience Match</p>
                  </div>
                )}
              </div>

              {/* Strengths */}
              {fitReasons.strengths && fitReasons.strengths.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Strengths</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {fitReasons.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {fitReasons.gaps && fitReasons.gaps.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Potential Gaps</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {fitReasons.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overall summary */}
              {fitReasons.overall && (
                <p className="text-sm text-muted-foreground border-t pt-4">
                  {fitReasons.overall}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Draft Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileEdit className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Application Draft</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="cover-letter">Cover Letter</Label>
                {isEditing ? (
                  <Textarea
                    id="cover-letter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write your cover letter..."
                    className="min-h-[200px]"
                  />
                ) : (
                  <div className="rounded-md border p-4 min-h-[100px] bg-muted/30">
                    <p className="text-sm whitespace-pre-wrap">
                      {coverLetter || "No cover letter yet."}
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic answer fields */}
              {Object.keys(answers).length > 0 && (
                <div className="space-y-4">
                  <Label>Application Answers</Label>
                  {Object.entries(answers).map(([question, answer]) => (
                    <div key={question} className="space-y-2">
                      <p className="text-sm font-medium">{question}</p>
                      {isEditing ? (
                        <Textarea
                          value={answer}
                          onChange={(e) => setAnswers({ ...answers, [question]: e.target.value })}
                          className="min-h-[80px]"
                        />
                      ) : (
                        <div className="rounded-md border p-3 bg-muted/30">
                          <p className="text-sm">{answer || "No answer provided."}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!draft && !isEditing && (
                <p className="text-muted-foreground text-sm">
                  No draft found. Click Edit to start writing your application.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
