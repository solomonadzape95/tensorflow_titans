import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDarkMode } from "@/hooks/use-darkmode";
import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { Link } from "react-router";
import { useLogOutHandler } from "@/hooks/use-logout";
import { UserData } from "@/types";

function Navbar({ user }: { user: UserData }) {
  const [isOpenUser, setIsOpenUser] = useState<boolean>(false);
  const [isOpenTheme, setIsOpenTheme] = useState<boolean>(false);
  const [, toggleDarkMode] = useDarkMode();
  const { handleLogOut } = useLogOutHandler();

  return (
    <div className="flex items-center h-16 md:h-20 px-4 md:px-6 justify-between w-full z-50">
      <div className="w-full">
        <h2 className="font-bold">
          <Button className="" variant="ghost">
            <span className="text-2xl font-bold hover:text-[#9b48df]/90 transition-all duration-300 ease-in-out">
              SplitWise
            </span>
          </Button>
        </h2>
      </div>
      <div className="flex items-center gap-3 md:gap-5">
        {/* Theme Toggle Dropdown */}
        <DropdownMenu
          open={isOpenTheme}
          onOpenChange={(open) => setIsOpenTheme(open)} // Ensure state updates correctly
        >
          <DropdownMenuTrigger>
            <Button
              size="icon"
              variant="ghost"
              className="text-foreground dark:text-foreground-dark hover:bg-accent dark:hover:bg-accent-dark"
            >
              <Sun className="h-5 w-5 opacity-100 dark:opacity-0 transition-all duration-200" />
              <Moon className="absolute h-5 w-5 opacity-0 dark:opacity-100 transition-all duration-200" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-32 rounded-md border dark:border-border-dark bg-popover dark:bg-popover-dark text-popover-foreground dark:text-popover-foreground-dark shadow-md"
          >
            <DropdownMenuItem
              onClick={() => toggleDarkMode(false)}
              className="cursor-pointer hover:bg-accent dark:hover:bg-accent-dark transition-colors duration-200 focus:bg-accent dark:focus:bg-accent-dark"
            >
              Light
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toggleDarkMode(true)}
              className="cursor-pointer hover:bg-accent dark:hover:bg-accent-dark transition-colors duration-200 focus:bg-accent dark:focus:bg-accent-dark"
            >
              Dark
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu
          open={isOpenUser}
          onOpenChange={(open) => setIsOpenUser(open)} // Ensure state updates correctly
        >
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full text-foreground dark:text-foreground-dark hover:bg-accent dark:hover:bg-accent-dark"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-md border dark:border-border-dark bg-popover dark:bg-popover-dark text-popover-foreground dark:text-popover-foreground-dark shadow-md"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.profile.full_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground dark:text-muted-foreground-dark">
                  {user.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border dark:bg-border-dark" />
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-accent dark:hover:bg-accent-dark transition-colors duration-200 focus:bg-accent dark:focus:bg-accent-dark"
            >
              <Link to="/dashboard/settings" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-accent dark:hover:bg-accent-dark transition-colors duration-200 focus:bg-accent dark:focus:bg-accent-dark"
            >
              <Link to="/dashboard/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border dark:bg-border-dark" />
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-accent dark:hover:bg-accent-dark transition-colors duration-200 focus:bg-accent dark:focus:bg-accent-dark"
            >
              <button
                onClick={() => handleLogOut()}
                className="flex w-full items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default Navbar;
