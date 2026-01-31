import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Settings, ArrowRight, ArrowLeft, X } from "lucide-react";

const resumeSchema = z.object({
  resumeText: z.string().trim().min(50, "Resume must be at least 50 characters").max(50000, "Resume too long"),
});

const preferencesSchema = z.object({
  roles: z.array(z.string().trim().max(100)).min(1, "Add at least one role"),
  locations: z.array(z.string().trim().max(100)),
  remoteOk: z.boolean(),
  sponsorshipNeeded: z.boolean(),
  minSalary: z.number().min(0).max(10000000).nullable(),
});

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Step 1: Resume
  const [resumeText, setResumeText] = useState("");

  // Step 2: Preferences
  const [roles, setRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [remoteOk, setRemoteOk] = useState(true);
  const [sponsorshipNeeded, setSponsorshipNeeded] = useState(false);
  const [minSalary, setMinSalary] = useState("");

  const handleAddRole = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && roleInput.trim()) {
      e.preventDefault();
      if (!roles.includes(roleInput.trim())) {
        setRoles([...roles, roleInput.trim()]);
      }
      setRoleInput("");
    }
  };

  const handleRemoveRole = (role: string) => {
    setRoles(roles.filter((r) => r !== role));
  };

  const handleAddLocation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && locationInput.trim()) {
      e.preventDefault();
      if (!locations.includes(locationInput.trim())) {
        setLocations([...locations, locationInput.trim()]);
      }
      setLocationInput("");
    }
  };

  const handleRemoveLocation = (location: string) => {
    setLocations(locations.filter((l) => l !== location));
  };

  const handleStep1Next = () => {
    const result = resumeSchema.safeParse({ resumeText });
    if (!result.success) {
      toast({
        title: "Invalid resume",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to continue.",
        variant: "destructive",
      });
      return;
    }

    const salaryValue = minSalary ? parseInt(minSalary, 10) : null;
    
    const prefsResult = preferencesSchema.safeParse({
      roles,
      locations,
      remoteOk,
      sponsorshipNeeded,
      minSalary: salaryValue,
    });

    if (!prefsResult.success) {
      toast({
        title: "Invalid preferences",
        description: prefsResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Save resume
      const { error: resumeError } = await supabase.from("resumes").upsert(
        {
          user_id: user.id,
          resume_text: resumeText.trim(),
        },
        { onConflict: "user_id" }
      );

      if (resumeError) throw resumeError;

      // Save preferences
      const { error: prefsError } = await supabase.from("preferences").upsert(
        {
          user_id: user.id,
          roles,
          locations,
          remote_ok: remoteOk,
          sponsorship_needed: sponsorshipNeeded,
          min_salary: salaryValue,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (prefsError) throw prefsError;

      toast({
        title: "Onboarding complete!",
        description: "Your profile has been saved.",
      });

      navigate("/inbox");
    } catch (error: any) {
      toast({
        title: "Error saving",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Onboarding</h1>
        <p className="text-muted-foreground mt-1">
          Step {step} of 2
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2">
        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Your Resume</CardTitle>
                <CardDescription>
                  Paste your resume text below
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume">Resume Text</Label>
              <Textarea
                id="resume"
                placeholder="Paste your resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {resumeText.length} characters
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleStep1Next} disabled={!resumeText.trim()}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Job Preferences</CardTitle>
                <CardDescription>
                  Tell us what you're looking for
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Roles */}
            <div className="space-y-2">
              <Label htmlFor="roles">Target Roles</Label>
              <Input
                id="roles"
                placeholder="Type a role and press Enter"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={handleAddRole}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {roles.map((role) => (
                  <Badge key={role} variant="secondary" className="gap-1">
                    {role}
                    <button
                      onClick={() => handleRemoveRole(role)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <Label htmlFor="locations">Preferred Locations</Label>
              <Input
                id="locations"
                placeholder="Type a location and press Enter"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={handleAddLocation}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {locations.map((location) => (
                  <Badge key={location} variant="secondary" className="gap-1">
                    {location}
                    <button
                      onClick={() => handleRemoveLocation(location)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Remote */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Open to Remote</Label>
                <p className="text-sm text-muted-foreground">
                  Include remote job opportunities
                </p>
              </div>
              <Switch checked={remoteOk} onCheckedChange={setRemoteOk} />
            </div>

            {/* Sponsorship */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Visa Sponsorship Needed</Label>
                <p className="text-sm text-muted-foreground">
                  Filter for jobs offering sponsorship
                </p>
              </div>
              <Switch checked={sponsorshipNeeded} onCheckedChange={setSponsorshipNeeded} />
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <Label htmlFor="salary">Minimum Salary (USD)</Label>
              <Input
                id="salary"
                type="number"
                placeholder="e.g. 80000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading || roles.length === 0}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
