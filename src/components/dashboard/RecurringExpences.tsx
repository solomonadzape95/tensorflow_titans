import { Link } from "react-router";
import { Button } from "../ui/button";
import { Calendar, Home, Plus, RefreshCw, Utensils, Wifi } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Switch } from "../ui/switch";

const recurringExpenses = [
  {
    id: 1,
    description: "Monthly Rent",
    amount: "$1,200.00",
    frequency: "Monthly",
    nextDate: "Apr 1, 2025",
    category: "Housing",
    icon: Home,
    group: "Roommates",
    active: true,
  },
  {
    id: 2,
    description: "Internet Bill",
    amount: "$65.99",
    frequency: "Monthly",
    nextDate: "Apr 15, 2025",
    category: "Utilities",
    icon: Wifi,
    group: "Roommates",
    active: true,
  },
  {
    id: 3,
    description: "Weekly Dinner",
    amount: "$120.00",
    frequency: "Weekly",
    nextDate: "Mar 31, 2025",
    category: "Food & Drink",
    icon: Utensils,
    group: "Dinner Club",
    active: false,
  },
];

function RecurringExpences() {
  return (
    <div className="space-y-6 px-6 mb-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-transparent bg-clip-text">
            Recurring Expenses
          </h1>
          <p className="text-muted-foreground">
            Manage your recurring bills and expenses
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white "
        >
          <Link to="/dashboard/recurring/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Recurring
          </Link>
        </Button>
      </div>

      <Card className="bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Upcoming Schedule</CardTitle>
          <CardDescription>Your next recurring expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg border p-4">
            <Calendar className="h-6 w-6 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Calendar view coming soon
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {recurringExpenses.map((expense) => {
          const Icon = expense.icon;
          return (
            <Card
              key={expense.id}
              className={`bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md
                ${expense.active ? "" : "opacity-60"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between ">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{expense.description}</h3>
                        <div className="flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          <RefreshCw className="mr-1 h-3 w-3" />
                          {expense.frequency}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-medium">{expense.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          Next: {expense.nextDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Group: {expense.group}</span>
                        <span>•</span>
                        <span>Category: {expense.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch checked={expense.active} />
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/dashboard/recurring/${expense.id}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default RecurringExpences;
