import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ResumeStep from "@/components/onboarding/ResumeStep";
import ProfileStep from "@/components/onboarding/ProfileStep";
import PreferencesStep from "@/components/onboarding/PreferencesStep";

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

  // Step 2: Profile
  const [graduationDate, setGraduationDate] = useState("");
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [workAuthorization, setWorkAuthorization] = useState("");
  const [otherInfo, setOtherInfo] = useState("");

  // Step 3: Preferences
  const [roles, setRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [remoteOk, setRemoteOk] = useState(true);
  const [sponsorshipNeeded, setSponsorshipNeeded] = useState(false);
  const [minSalary, setMinSalary] = useState("");

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

  const handleStep2Next = () => {
    setStep(3);
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
      const { error: resumeError } = await supabase.from("resumes").upsert(
        {
          user_id: user.id,
          resume_text: resumeText.trim(),
        },
        { onConflict: "user_id" }
      );

      if (resumeError) throw resumeError;

      const gradDateValue = graduationDate ? `${graduationDate}-01` : null;
      
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          graduation_date: gradDateValue,
          gender: gender || null,
          race: race || null,
          work_authorization: workAuthorization || null,
          other_info: otherInfo.trim() || null,
        },
        { onConflict: "id" }
      );

      if (profileError) throw profileError;

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
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
        <p className="text-muted-foreground">Step {step} of 3</p>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div 
            key={s}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              step >= s 
                ? "bg-gradient-to-r from-primary to-accent" 
                : "bg-muted"
            }`} 
          />
        ))}
      </div>

      <div className="animate-fade-in">
        {step === 1 && user && (
          <ResumeStep
            userId={user.id}
            resumeText={resumeText}
            setResumeText={setResumeText}
            onNext={handleStep1Next}
          />
        )}

        {step === 2 && (
          <ProfileStep
            graduationDate={graduationDate}
            setGraduationDate={setGraduationDate}
            gender={gender}
            setGender={setGender}
            race={race}
            setRace={setRace}
            workAuthorization={workAuthorization}
            setWorkAuthorization={setWorkAuthorization}
            otherInfo={otherInfo}
            setOtherInfo={setOtherInfo}
            onBack={() => setStep(1)}
            onNext={handleStep2Next}
          />
        )}

        {step === 3 && (
          <PreferencesStep
            roles={roles}
            setRoles={setRoles}
            roleInput={roleInput}
            setRoleInput={setRoleInput}
            locations={locations}
            setLocations={setLocations}
            locationInput={locationInput}
            setLocationInput={setLocationInput}
            remoteOk={remoteOk}
            setRemoteOk={setRemoteOk}
            sponsorshipNeeded={sponsorshipNeeded}
            setSponsorshipNeeded={setSponsorshipNeeded}
            minSalary={minSalary}
            setMinSalary={setMinSalary}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
