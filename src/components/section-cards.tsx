import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "./ui/button";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card flex w-full gap-4 px-4 *:data-[slot=card]:bg-gradi *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card flex-grow  border-none px-6 bg-[var(--card)]">
        <CardHeader className="">
          <CardTitle className="text-[7px] font-semibold tabular-nums @[250px]/card:text-[12px]">
            Total Balance
          </CardTitle>
          <CardDescription className="text-[25px] font-semibold text-[#4F32FF]">
            $245.89
          </CardDescription>
          <CardDescription className=" justify-center text-sm pt-0">
            <div className=" font-medium">
              You are owed{" "}
              <span className="text-[var(--chart-2)] font-semibold">
                $234.56
              </span>{" "}
              and you owe{" "}
              <span className="text-[var(--destructive)]">$234.56</span>
            </div>
          </CardDescription>
        </CardHeader>
        <Button className="bg-white text-[var(--muted-foreground)] shadow-md font-semibold text-xs mt-4 hover:bg-transparent">
          View Details
        </Button>
      </Card>

      <Card className="@container/card flex-grow  border-none px-6 bg-[var(--card)]">
        <CardHeader className="">
          <CardTitle className="text-[7px] font-semibold tabular-nums @[250px]/card:text-[12px]">
            Active groups
          </CardTitle>
          <CardDescription className="text-[25px] font-semibold text-[#4F32FF]">
            4
          </CardDescription>
          <CardDescription className=" justify-center text-sm pt-0">
            <div className=" font-medium">Across 12 friends</div>
          </CardDescription>
        </CardHeader>
        <div className="mt-4 flex -space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Avatar
              key={i}
              className="border-2 border-background animate-float"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <AvatarImage
                src={`/placeholder.svg?height=32&width=32&text=${i}`}
              />
              <AvatarFallback>U{i}</AvatarFallback>
            </Avatar>
          ))}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium animate-float">
            +7
          </div>
        </div>
      </Card>

      <Card className="@container/card flex-grow  border-none px-6 bg-[var(--card)]">
        <CardHeader className="">
          <CardTitle className="text-[7px] font-semibold tabular-nums @[250px]/card:text-[12px]">
            Monthly Spending
          </CardTitle>
          <CardDescription className="text-[25px] font-semibold text-[#4F32FF]">
            $1254
          </CardDescription>
          <CardDescription className=" justify-center text-sm pt-0">
            <div className=" font-medium">
              <span className="text-[var(--chart-2)]">12% </span>from last month
            </div>
          </CardDescription>
        </CardHeader>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold text-muted-foreground">
              Budget: $2000
            </p>
            <p className="text-[12px] font-semibold text-muted-foreground">
              75%
            </p>
          </div>
          <Progress value={75} className="" />
        </div>
      </Card>
    </div>
  );
}
