import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, ArrowLeft, X, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DEMO_PREFERENCES } from "@/lib/demo-data";

interface PreferencesStepProps {
  roles: string[];
  setRoles: (roles: string[]) => void;
  roleInput: string;
  setRoleInput: (input: string) => void;
  locations: string[];
  setLocations: (locations: string[]) => void;
  locationInput: string;
  setLocationInput: (input: string) => void;
  remoteOk: boolean;
  setRemoteOk: (ok: boolean) => void;
  sponsorshipNeeded: boolean;
  setSponsorshipNeeded: (needed: boolean) => void;
  minSalary: string;
  setMinSalary: (salary: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function PreferencesStep({
  roles,
  setRoles,
  roleInput,
  setRoleInput,
  locations,
  setLocations,
  locationInput,
  setLocationInput,
  remoteOk,
  setRemoteOk,
  sponsorshipNeeded,
  setSponsorshipNeeded,
  minSalary,
  setMinSalary,
  onBack,
  onSubmit,
  loading,
}: PreferencesStepProps) {
  const { toast } = useToast();

  const handleLoadDemo = () => {
    setRoles(DEMO_PREFERENCES.roles);
    setLocations(DEMO_PREFERENCES.locations);
    setRemoteOk(DEMO_PREFERENCES.remoteOk);
    setSponsorshipNeeded(DEMO_PREFERENCES.sponsorshipNeeded);
    setMinSalary("");
    toast({
      title: "Demo preferences loaded",
      description: "Preferences pre-filled with demo data.",
    });
  };

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

  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <CardHeader className="relative">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Job Preferences</CardTitle>
            <CardDescription>Tell us what you're looking for</CardDescription>
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
          Load Demo Preferences
        </Button>

        {/* Roles */}
        <div className="space-y-3">
          <Label htmlFor="roles" className="text-sm font-semibold">Target Roles</Label>
          <Input
            id="roles"
            placeholder="Type a role and press Enter"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            onKeyDown={handleAddRole}
            className="h-12 bg-muted/30 border-border/50 focus:border-primary"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {roles.map((role) => (
              <Badge 
                key={role} 
                variant="secondary" 
                className="gap-1 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 transition-colors"
              >
                {role}
                <button
                  onClick={() => handleRemoveRole(role)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-3">
          <Label htmlFor="locations" className="text-sm font-semibold">Preferred Locations</Label>
          <Input
            id="locations"
            placeholder="Type a location and press Enter"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={handleAddLocation}
            className="h-12 bg-muted/30 border-border/50 focus:border-primary"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {locations.map((location) => (
              <Badge 
                key={location} 
                variant="secondary" 
                className="gap-1 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent-foreground hover:bg-accent/15 transition-colors"
              >
                {location}
                <button
                  onClick={() => handleRemoveLocation(location)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Remote */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">Open to Remote</Label>
            <p className="text-sm text-muted-foreground">
              Include remote job opportunities
            </p>
          </div>
          <Switch 
            checked={remoteOk} 
            onCheckedChange={setRemoteOk}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Sponsorship */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">Visa Sponsorship Needed</Label>
            <p className="text-sm text-muted-foreground">
              Filter for jobs offering sponsorship
            </p>
          </div>
          <Switch 
            checked={sponsorshipNeeded} 
            onCheckedChange={setSponsorshipNeeded}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Salary */}
        <div className="space-y-3">
          <Label htmlFor="salary" className="text-sm font-semibold">Minimum Salary (USD)</Label>
          <Input
            id="salary"
            type="number"
            placeholder="e.g. 80000"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            className="h-12 bg-muted/30 border-border/50 focus:border-primary"
          />
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
            onClick={onSubmit} 
            disabled={loading || roles.length === 0}
            className="h-12 px-6 bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success shadow-lg hover:shadow-success/25 transition-all hover:-translate-y-0.5"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Complete Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
