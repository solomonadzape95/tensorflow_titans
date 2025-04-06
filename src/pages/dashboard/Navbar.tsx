import { motion, Variants } from "motion/react";
import "@/App.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";


// interface MotionVariants {
//   hidden: {
//     opacity: number;
//     y: number;
//   };
//   visible: {
//     opacity: number;
//     y: number;
//   };
// }

function Navbar() {
  const [isOpenUser, setIsOpenUser] = useState<boolean>(false);
  const [isOpenTheme, setIsOpenTheme] = useState<boolean>(false);
  // const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const slidevariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  return (
    <div className=" flex items-center   h-full  justify-between w-full">
      <div className="">
        <h2 className="text-xl hidden md:block  font-bold mb-6 text-white">
          SplitWise
        </h2>
      </div>
      <div className="flex gap-5">
       
          <DropdownMenu open={isOpenTheme} onOpenChange={setIsOpenTheme}>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="">
                <Sun className="" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" asChild className="">
              <motion.div
                variants={slidevariants}
                initial="hidden"
                animate={isOpenTheme ? "visible" : "hidden"}
                transition={{
                  duration: 0.5,
                }}
              >
                <DropdownMenuItem
                  // onClick={() => setTheme("light")}
                  className="hover:bg-accent/20 transition-colors duration-200"
                >
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  // onClick={() => setTheme("dark")}
                  className="hover:bg-accent/20 transition-colors duration-200"
                >
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  // onClick={() => setTheme("system")}
                  className="hover:bg-accent/20 transition-colors duration-200"
                >
                  System
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
       

        <DropdownMenu open={isOpenUser} onOpenChange={setIsOpenUser}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative bg-white h-8 w-8 rounded-full"
            >
              <User className="" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            asChild
            className="w-56   "
            align="end"
            forceMount
          >
            <motion.div
              variants={slidevariants}
              initial="hidden"
              animate={isOpenUser ? "visible" : "hidden"}
              transition={{
                duration: 0.5,
              }}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Demo User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    demo@splitwise.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup>
                <DropdownMenuItem
                  asChild
                  className="hover:bg-accent/20 transition-colors duration-200"
                >
                  <Link to="/dashboard/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="hover:bg-accent/20 transition-colors duration-200"
                >
                  <Link to="/dashboard/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="hover:bg-accent/20 transition-colors duration-200"
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
