import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, ArrowLeft, X, Loader2, Sparkles } from "lucide-react";
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Job Preferences</CardTitle>
            <CardDescription>Tell us what you're looking for</CardDescription>
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
          Load Demo Preferences
        </Button>
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
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onSubmit} disabled={loading || roles.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
