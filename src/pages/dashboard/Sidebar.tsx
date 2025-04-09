import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart,
  CreditCard,
  Home,
  PlusCircle,
  RefreshCw,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

import { Link, useLocation } from "react-router";

const navLists = [
  { path: "/dashboard", name: "Overview", icon: Home },
  { path: "/dashboard/groups", name: "My Groups", icon: Users },
  { path: "/dashboard/expenses", name: "Expenses", icon: CreditCard },
  { path: "/dashboard/balances", name: "Balances", icon: BarChart },
  { path: "/dashboard/recurring", name: "Recurring", icon: RefreshCw },
  { path: "/dashboard/settings", name: "Settings", icon: Settings },
];

function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside className="w-64 bg-sidebar dark:bg-sidebar-dark border-r dark:border-r-border-dark text-sidebar-foreground dark:text-sidebar-foreground-dark p-4 h-screen md:block hidden">
      <h2 className="text-xl font-bold mb-6">
        <Button className="text-xl" variant="ghost">
          <Wallet className="h-10 w-10 scale-125 text-primary-foreground dark:text-primary-foreground-dark animate-pulse-glow drop-shadow-lg " />
          <span className="text-xl font-bold font-display">SplitWise</span>
        </Button>
      </h2>
      <nav className="flex flex-col space-y-2">
        <Button
          className="w-full justify-start gap-2 group text-white cursor-pointer"
          size="sm"
          variant="gradient"
          asChild
        >
          <Link to="/dashboard/expenses/new">
            <PlusCircle className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300 text-xl" />
            New Expense
          </Link>
        </Button>
        <div className="mt-4 space-y-2">
          {navLists.map((list, index) => {
            const Icon = list.icon;
            const isActive = pathname.startsWith(list.path);
            return (
              <Link
                key={list.name}
                to={list.path}
              // onClick={() => setOpen(false)} // Assuming setOpen is defined elsewhere for mobile nav
              >
                <Button
                  variant={isActive ? "glass" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sidebar-foreground dark:text-sidebar-foreground-dark cursor-pointer animate-pulse-glow text-sm gap-2 group transition-all duration-300",
                    isActive && "bg-accent dark:bg-accent-dark text-accent-foreground dark:text-accent-foreground-dark"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  size="lg"
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                      isActive && "text-accent-foreground dark:text-accent-foreground-dark"
                    )}
                  />
                  {list.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;