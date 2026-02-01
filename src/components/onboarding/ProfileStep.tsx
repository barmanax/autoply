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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              This info helps auto-fill application questions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demo Button */}
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleLoadDemo}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Load Demo Profile
        </Button>
        {/* Graduation Date */}
        <div className="space-y-2">
          <Label htmlFor="graduationDate">Graduation Date</Label>
          <Input
            id="graduationDate"
            type="month"
            value={graduationDate}
            onChange={(e) => setGraduationDate(e.target.value)}
            placeholder="Select graduation month"
          />
          <p className="text-xs text-muted-foreground">
            Your expected or actual graduation date
          </p>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <Label>Race/Ethnicity</Label>
          <Select value={race} onValueChange={setRace}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <Label>Work Authorization</Label>
          <Select value={workAuthorization} onValueChange={setWorkAuthorization}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <Label htmlFor="otherInfo">Other Information</Label>
          <Textarea
            id="otherInfo"
            placeholder="Any additional info the LLM should know when auto-filling applications (e.g., preferred pronouns, disability status, veteran status, etc.)"
            value={otherInfo}
            onChange={(e) => setOtherInfo(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Optional context for uncommon application questions
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
