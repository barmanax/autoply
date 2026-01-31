import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEdit } from "lucide-react";

export default function Draft() {
  const { matchId } = useParams<{ matchId: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Application Draft</h1>
        <p className="text-muted-foreground mt-1">
          Review and edit your application
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileEdit className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Draft Editor</CardTitle>
              <CardDescription>
                Match ID: {matchId}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Application draft editor will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
