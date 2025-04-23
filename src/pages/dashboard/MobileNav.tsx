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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router"; // Ensure you're using react-router-dom
import { LuWallet } from "react-icons/lu";

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
  // console.log(pathname, location);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="flex flex-col p-0 bg-sidebar dark:bg-[#030712] text-sidebar-foreground dark:text-sidebar-foreground-dark"
      >
        <div className="flex items-center justify-between border-b dark:border-b-border-dark p-4">
          <div className="flex items-center gap-2">
            <LuWallet className="text-[#4a44ee] text-[25px] animation animate-bounce transition-all duration-700 ease-in-out" />
            <h2 className="text-xl md:text-2xl font-bold hover:text-[#9b48df]/90 transition-all duration-300 ease-in-out">
              SplitWise
            </h2>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <Button
            className="mb-4 w-full justify-start gap-2 group bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white cursor-pointer p-3"
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
              const isActive = pathname == list.path;
              return (
                <Link
                  key={list.name}
                  to={list.path}
                  onClick={() => setOpen(false)}
                >
                  <Button
                    className={cn(
                      "w-full justify-start text-sidebar-foreground dark:text-sidebar-foreground-dark animate-pulse-glow text-sm gap-2 group transition-all duration-300 ",
                      isActive &&
                        "dark:bg-[#141727]/90 bg-[#141727]/10 text-accent-foreground dark:text-accent-foreground-dark"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    size="lg"
                    variant={"ghost"}
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
    </Sheet>
  );
}
