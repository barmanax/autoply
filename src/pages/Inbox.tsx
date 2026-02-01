import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox as InboxIcon, Settings, Building2, MapPin, ExternalLink, Trash2, Loader2, Sparkles } from "lucide-react";

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

export default function Inbox() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as JobMatch[];
    },
  });

  const clearInbox = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data: userMatches, error: matchError } = await supabase
        .from("job_matches")
        .select("id")
        .eq("user_id", user.id);

      if (matchError) throw matchError;

      const matchIds = userMatches?.map(m => m.id) || [];

      if (matchIds.length > 0) {
        const { error: draftsError } = await supabase
          .from("application_drafts")
          .delete()
          .in("job_match_id", matchIds);

        if (draftsError) throw draftsError;

        const { error: eventsError } = await supabase
          .from("submission_events")
          .delete()
          .in("job_match_id", matchIds);

        if (eventsError) throw eventsError;

        const { error: matchesDeleteError } = await supabase
          .from("job_matches")
          .delete()
          .eq("user_id", user.id);

        if (matchesDeleteError) throw matchesDeleteError;
      }

      return matchIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["job-matches"] });
      toast({
        title: "Inbox cleared",
        description: `Removed ${count} job matches and their drafts.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to clear inbox",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const getStatusVariant = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case "APPLIED":
        return "default";
      case "DRAFTED":
        return "secondary";
      case "REJECTED":
        return "destructive";
      case "INTERVIEWING":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getFitScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  const getFitScoreBg = (score: number | null) => {
    if (!score) return "bg-muted";
    if (score >= 80) return "bg-success/10 border-success/20";
    if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
    return "bg-destructive/10 border-destructive/20";
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground">
            Your matched jobs and application status
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => clearInbox.mutate()}
            disabled={clearInbox.isPending || !matches?.length}
            className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
          >
            {clearInbox.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Clear Inbox
          </Button>
          <Button asChild variant="outline" className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all">
            <Link to="/admin/run">
              <Settings className="h-4 w-4 mr-2" />
              Admin Run
            </Link>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load job matches. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && matches?.length === 0 && (
        <Card className="border-border/50 bg-card/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <CardHeader className="relative text-center py-12">
            <div className="mx-auto p-4 rounded-2xl bg-muted/50 border border-border/50 w-fit mb-4">
              <InboxIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">No matches yet</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              Run the job matcher to find opportunities that fit your profile
            </CardDescription>
            <Button asChild className="mt-6 mx-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all">
              <Link to="/admin/run">
                <Sparkles className="h-4 w-4 mr-2" />
                Run Pipeline
              </Link>
            </Button>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && matches && matches.length > 0 && (
        <div className="space-y-3 stagger-children">
          {matches.map((match) => (
            <Link key={match.id} to={`/draft/${match.id}`}>
              <Card className="border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {match.job_posts?.title || "Untitled Position"}
                        </h3>
                        <Badge 
                          variant={getStatusVariant(match.status)}
                          className="shrink-0"
                        >
                          {match.status || "DRAFTED"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {match.job_posts?.company || "Unknown Company"}
                        </span>
                        {match.job_posts?.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {match.job_posts.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-center px-4 py-2 rounded-xl border ${getFitScoreBg(match.fit_score)}`}>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Fit</p>
                        <p className={`text-xl font-bold ${getFitScoreColor(match.fit_score)}`}>
                          {match.fit_score ?? "—"}%
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
