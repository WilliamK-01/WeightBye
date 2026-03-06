import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Preview = {
  title: string;
  current: number;
  target: number;
};

export function AchievementPreview({ next, recent }: { next: Preview | null; recent: string[] }) {
  const percent = next ? Math.min(100, Math.round((next.current / next.target) * 100)) : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {next ? (
          <div className="space-y-2">
            <p className="font-medium">Next: {next.title}</p>
            <Progress value={percent} />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {next.current}/{next.target}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">All achievements unlocked.</p>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Recently unlocked</p>
          <div className="flex flex-wrap gap-2">
            {recent.length ? recent.map((item) => <Badge key={item}>{item}</Badge>) : <Badge>None yet</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
