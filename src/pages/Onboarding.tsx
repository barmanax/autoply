import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function Onboarding() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Onboarding</h1>
        <p className="text-muted-foreground mt-1">
          Set up your profile and job preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Complete your profile to start receiving job matches
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Onboarding flow will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
