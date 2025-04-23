import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { name: "Alex", owed: 125.5, owe: 0 },
  { name: "Sarah", owed: 0, owe: 74.61 },
  { name: "Mike", owed: 195, owe: 0 },
  { name: "Emily", owed: 0, owe: 0 },
];

export function BalanceChart() {
  return (
    <ChartContainer
      config={{
        owed: {
          label: "They Owe You",
          color: "hsl(var(--chart-1))",
        },
        owe: {
          label: "You Owe Them",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-full animate-in"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="owedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--chart-1)"
                stopOpacity={0.8}
              />
              <stop
                offset="100%"
                stopColor="var(--chart-1)"
                stopOpacity={0.4}
              />
            </linearGradient>
            <linearGradient id="oweGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--chart-2)"
                stopOpacity={0.8}
              />
              <stop
                offset="100%"
                stopColor="var(--chart-2)"
                stopOpacity={0.4}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <ChartTooltip
            content={<ChartTooltipContent className="glass" />}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar
            dataKey="owed"
            fill="url(#owedGradient)"
            radius={[4, 4, 0, 0]}
            className="animate-in"
            animationDuration={1000}
          />
          <Bar
            dataKey="owe"
            fill="url(#oweGradient)"
            radius={[4, 4, 0, 0]}
            className="animate-in animate-in-delay-1"
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
