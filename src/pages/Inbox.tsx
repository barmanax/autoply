import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox as InboxIcon } from "lucide-react";

export default function Inbox() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground mt-1">
          Your matched jobs and application status
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <InboxIcon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Job Matches</CardTitle>
              <CardDescription>
                View and manage your job matches here
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Job matches will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
