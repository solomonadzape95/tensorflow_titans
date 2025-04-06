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
import { Link, useLocation } from "react-router";

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
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6 text-amber-50" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex text-white flex-col p-0 ">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary animate-pulse-glow" />
            <span className="text-xl font-bold font-display">SplitWise</span>
          </div>
          
        </div>
        <div className="flex-1 overflow-auto p-4">
          <Button
            className="mb-4 w-full justify-start gap-2 group bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white  cursor-pointer"
            variant="gradient"
            asChild
          >
            <Link to="/dashboard" onClick={() => setOpen(false)}>
              <PlusCircle className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
              New Expense
            </Link>
          </Button>
          <div className="space-y-1">
            {navLists.map((list, index) => {
              const Icon = list.icon;
              const path = pathname === list.path;
              return (
                <Link
                  key={list.name}
                  to={list.path}
                  onClick={() => setOpen(false)}
                >
                  <Button
                    variant={path ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start animate-pulse-glow text-sm gap-2 group transition-all duration-300 "
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    size="lg"
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-all duration-300 group-hover:scale-110"
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
