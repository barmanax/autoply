import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

export default function AdminRun() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Run Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          Trigger and monitor the job matching pipeline
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Play className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Pipeline Controls</CardTitle>
              <CardDescription>
                Start and manage pipeline runs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Pipeline controls will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
