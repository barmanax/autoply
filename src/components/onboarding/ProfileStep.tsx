import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DEMO_PROFILE } from "@/lib/demo-data";

interface ProfileStepProps {
  graduationDate: string;
  setGraduationDate: (date: string) => void;
  gender: string;
  setGender: (gender: string) => void;
  race: string;
  setRace: (race: string) => void;
  workAuthorization: string;
  setWorkAuthorization: (auth: string) => void;
  otherInfo: string;
  setOtherInfo: (info: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
  { value: "other", label: "Other" },
];

const RACE_OPTIONS = [
  { value: "american-indian-alaska-native", label: "American Indian or Alaska Native" },
  { value: "asian", label: "Asian" },
  { value: "black-african-american", label: "Black or African American" },
  { value: "hispanic-latino", label: "Hispanic or Latino" },
  { value: "native-hawaiian-pacific-islander", label: "Native Hawaiian or Pacific Islander" },
  { value: "white", label: "White" },
  { value: "two-or-more", label: "Two or More Races" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const WORK_AUTH_OPTIONS = [
  { value: "us-citizen", label: "U.S. Citizen" },
  { value: "permanent-resident", label: "Permanent Resident (Green Card)" },
  { value: "h1b", label: "H-1B Visa" },
  { value: "opt", label: "OPT/CPT" },
  { value: "ead", label: "EAD (Employment Authorization)" },
  { value: "tn", label: "TN Visa" },
  { value: "require-sponsorship", label: "Require Sponsorship" },
  { value: "other", label: "Other" },
];

export default function ProfileStep({
  graduationDate,
  setGraduationDate,
  gender,
  setGender,
  race,
  setRace,
  workAuthorization,
  setWorkAuthorization,
  otherInfo,
  setOtherInfo,
  onBack,
  onNext,
}: ProfileStepProps) {
  const { toast } = useToast();

  const handleLoadDemo = () => {
    setGraduationDate(DEMO_PROFILE.graduationDate);
    setGender("male");
    setRace("asian");
    setWorkAuthorization("us-citizen");
    setOtherInfo("James Scholars Honors Program. Activities: Pulse Competitions Committee, CS Sail Logistics Staff, Simplify Campus Ambassador.");
    toast({
      title: "Demo profile loaded",
      description: "Profile pre-filled with demo data.",
    });
  };

  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <CardHeader className="relative">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Your Profile</CardTitle>
            <CardDescription>
              This info helps auto-fill application questions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Demo Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-accent/30 bg-accent/5 text-accent-foreground hover:bg-accent/10 hover:border-accent/50 transition-all"
          onClick={handleLoadDemo}
        >
          <Sparkles className="mr-2 h-4 w-4 text-accent" />
          Load Demo Profile
        </Button>

        {/* Graduation Date */}
        <div className="space-y-3">
          <Label htmlFor="graduationDate" className="text-sm font-semibold">Graduation Date</Label>
          <Input
            id="graduationDate"
            type="month"
            value={graduationDate}
            onChange={(e) => setGraduationDate(e.target.value)}
            placeholder="Select graduation month"
            className="h-12 bg-muted/30 border-border/50 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            Your expected or actual graduation date
          </p>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-12 bg-muted/30 border-border/50 focus:border-primary">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Used for EEO demographic questions
          </p>
        </div>

        {/* Race/Ethnicity */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Race/Ethnicity</Label>
          <Select value={race} onValueChange={setRace}>
            <SelectTrigger className="h-12 bg-muted/30 border-border/50 focus:border-primary">
              <SelectValue placeholder="Select race/ethnicity" />
            </SelectTrigger>
            <SelectContent>
              {RACE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Used for EEO demographic questions
          </p>
        </div>

        {/* Work Authorization */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Work Authorization</Label>
          <Select value={workAuthorization} onValueChange={setWorkAuthorization}>
            <SelectTrigger className="h-12 bg-muted/30 border-border/50 focus:border-primary">
              <SelectValue placeholder="Select work authorization" />
            </SelectTrigger>
            <SelectContent>
              {WORK_AUTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Your current work authorization status in the U.S.
          </p>
        </div>

        {/* Other Info */}
        <div className="space-y-3">
          <Label htmlFor="otherInfo" className="text-sm font-semibold">Other Information</Label>
          <Textarea
            id="otherInfo"
            placeholder="Any additional info the LLM should know when auto-filling applications (e.g., preferred pronouns, disability status, veteran status, etc.)"
            value={otherInfo}
            onChange={(e) => setOtherInfo(e.target.value)}
            className="min-h-[100px] bg-muted/30 border-border/50 focus:border-primary resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Optional context for uncommon application questions
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="h-12 px-6 border-border/50 hover:bg-muted/50 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={onNext}
            className="h-12 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
