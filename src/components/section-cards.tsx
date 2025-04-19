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
    <div className=" flex flex-col lg:flex-row w-full gap-4 px-4 *:data-[slot=card]:bg-gradi *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md rounded-xl shadow-xl @container/card flex-grow">
        <CardHeader className="">
          <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-xl">
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
        <Button className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white shadow-md font-semibold text-xs mt-4 hover:bg-transparent w-10/12 mx-auto">
          View Details
        </Button>
      </Card>

      <Card className="bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md rounded-xl shadow-xl @container/card flex-grow">
        <CardHeader className="">
          <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-xl">
            Active groups
          </CardTitle>
          <CardDescription className="text-[25px] font-semibold text-[#4F32FF]">
            4
          </CardDescription>
          <CardDescription className=" justify-center text-sm pt-0">
            <div className=" font-medium">Across 12 friends</div>
          </CardDescription>
        </CardHeader>
        <div className="mt-4 flex -space-x-2 w-10/12 mr-auto ml-4">
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

      <Card className="bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md rounded-xl shadow-2xl @container/card flex-grow">
        <CardHeader className="">
          <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-xl">
            Monthly Spending
          </CardTitle>
          <CardDescription className="text-[25px] font-semibold text-[#4F32FF]">
            $1254
          </CardDescription>
          <CardDescription className="w-10/12 justify-center text-sm pt-0">
            <div className=" font-medium">
              <span className="text-[var(--chart-2)]">12% </span>from last month
            </div>
          </CardDescription>
        </CardHeader>
        <div className="mt-4 w-10/12 ml-5 mr-auto">
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
