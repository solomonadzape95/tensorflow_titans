import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart,
  CreditCard,
  Home,
  Menu,
  PlusCircle,
  RefreshCw,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router"; // Ensure you're using react-router-dom

const navLists = [
  { path: "/dashboard", name: "Overview", icon: Home },
  { path: "/dashboard/groups", name: "My Groups", icon: Users },
  { path: "/dashboard/expenses", name: "Expenses", icon: CreditCard },
  { path: "/dashboard/balances", name: "Balances", icon: BarChart },
  { path: "/dashboard/recurring", name: "Recurring", icon: RefreshCw },
  { path: "/dashboard/settings", name: "Settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground dark:text-foreground-dark hover:bg-accent dark:hover:bg-accent-dark"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col p-0 bg-sidebar dark:bg-sidebar-dark text-sidebar-foreground dark:text-sidebar-foreground-dark"
      >
        <div className="flex items-center justify-between border-b dark:border-b-border-dark p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary-foreground dark:text-primary-foreground-dark animate-pulse-glow" />
            <span className="text-xl font-bold font-display">SplitWise</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <Button
            className="mb-4 w-full justify-start gap-2 group text-white cursor-pointer"
            variant="gradient"
            size="sm"
            asChild
          >
            <Link to="/dashboard/expenses/new" onClick={() => setOpen(false)}>
              <PlusCircle className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
              New Expense
            </Link>
          </Button>
          <div className="space-y-1">
            {navLists.map((list, index) => {
              const Icon = list.icon;
              const isActive = pathname.startsWith(list.path);
              return (
                <Link
                  key={list.name}
                  to={list.path}
                  onClick={() => setOpen(false)}
                >
                  <Button
                    variant={isActive ? "glass" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sidebar-foreground dark:text-sidebar-foreground-dark animate-pulse-glow text-sm gap-2 group transition-all duration-300",
                      isActive &&
                      "bg-accent dark:bg-accent-dark text-accent-foreground dark:text-accent-foreground-dark"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    size="lg"
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-all duration-300 group-hover:scale-110",
                        isActive &&
                        "text-accent-foreground dark:text-accent-foreground-dark"
                      )}
                    />
                    {list.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}