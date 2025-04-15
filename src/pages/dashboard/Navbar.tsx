import { motion, Variants } from "motion/react";
import "@/App.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Settings, Sun, User, Wallet } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { useDarkMode } from "@/hooks/use-darkmode";

function Navbar() {
  const [isOpenUser, setIsOpenUser] = useState<boolean>(false);
  const [isOpenTheme, setIsOpenTheme] = useState<boolean>(false);
  const [, toggleDarkMode] = useDarkMode();

  const slidevariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex items-center h-16 md:h-20 px-4 md:px-6 justify-between w-full ">
      <div className="w-full">
        <h2 className="text-xl font-bold">
          <Button className="text-xl" variant="ghost">
            <Wallet className="h-10 w-10 scale-125 " />
            <span className="text-xl font-bold font-second">SplitWise</span>
          </Button>
        </h2>
      </div>
      <div className="flex items-center gap-3 md:gap-5">
        <DropdownMenu open={isOpenTheme} onOpenChange={setIsOpenTheme}>
          <DropdownMenuTrigger asChild>
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
            <motion.div
              variants={slidevariants}
              initial="hidden"
              animate={isOpenTheme ? "visible" : "hidden"}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
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
              {/* You can add a "System" option if you implement it in your useDarkMode hook */}
              {/* <DropdownMenuItem
                className="cursor-pointer hover:bg-accent dark:hover:bg-accent-dark transition-colors duration-200 focus:bg-accent dark:focus:bg-accent-dark"
              >
                System
              </DropdownMenuItem> */}
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu open={isOpenUser} onOpenChange={setIsOpenUser}>
          <DropdownMenuTrigger asChild>
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
            <motion.div
              variants={slidevariants}
              initial="hidden"
              animate={isOpenUser ? "visible" : "hidden"}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Demo User</p>
                  <p className="text-xs leading-none text-muted-foreground dark:text-muted-foreground-dark">
                    demo@splitwise.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border dark:bg-border-dark" />
              <DropdownMenuItem
                asChild
                className="cursor-pointer hover:bg-accent dark:hover:bg-accent-dark transition-colors duration-200 focus:bg-accent dark:focus:bg-accent-dark"
              >
                <Link to="/dashboard/profile" className="flex items-center">
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
                <Link to="/auth/login" className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Link>
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default Navbar;
