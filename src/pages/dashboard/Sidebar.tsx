import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart,
  CreditCard,
  Home,
  Plus,
  RefreshCw,
  Settings,
  Users,
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
    <aside
      className="w-64 bg-sidebar dark:bg-[radial-gradient(circle_at_top_right,#4f32ff26,transparent_90%),radial-gradient(circle_at_bottom_left,#f51d7826,transparent_50%)]
 border-r dark:border-r-border-dark text-sidebar-foreground dark:text-sidebar-foreground-dark p-4 h-screen md:block hidden space-y-6"
    >
      <div className="flex items-center space-x-2 mt-4">
        <Avatar>
          <AvatarImage
            src="https://avatar.iran.liara.run/public/4"
            alt={"Test User"}
          />
          <AvatarFallback className="bg-gray-300 dark:bg-gray-500">
            TE
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Test User
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            test@example.com
          </p>
        </div>
      </div>
      <nav className="flex flex-col space-y-2">
        <Button
          className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] w-full justify-start gap-2 group text-white cursor-pointer py-4 shadow-md hover:shadow-lg"
          size="sm"
          variant="gradient"
          asChild
        >
          <Link to="/dashboard/expenses/new">
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300 text-xl" />
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
                    isActive &&
                      "bg-accent dark:bg-accent-dark text-accent-foreground dark:text-accent-foreground-dark"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  size="lg"
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
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
      </nav>
    </aside>
  );
}

export default Sidebar;
