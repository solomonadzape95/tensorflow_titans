import Group from "./Group";
import { Users } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "@/components/ui/card";

function Groups() {
  return (
    <div>
      <Group />

      <Card className="flex  flex-col items-center justify-center p-6 max-w-sm mt-3">
        <div className="rounded-full bg-primary/10 p-4 mb-4 animate-pulse-glow">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-medium font-display">
          Create a new group
        </h3>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Start splitting expenses with friends, roommates, or travel buddies
        </p>
        <Button asChild className="group">
          New Group
        </Button>
      </Card>
    </div>
  );
}

export default Groups;
