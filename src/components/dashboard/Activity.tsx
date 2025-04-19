import { Utensils } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

function Activity() {
  const activity = {
    id: 1,
    description: "Dinner at Olive Garden",
    amount: "$86.25",
    date: "Today at 8:30 PM",
    category: "Food & Drink",
    icon: Utensils,
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=32&width=32&text=AJ",
      initials: "AJ",
    },
  };

  const Icon = activity.icon;

  return (
    <Card
      key={activity.id}
      className="p-4 bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">{activity.description}</p>
            <p className="font-medium">{activity.amount}</p>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={activity.user.avatar}
                  alt={activity.user.name}
                />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <span>{activity.user.name}</span>
            </div>
            <span>{activity.date}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default Activity;
