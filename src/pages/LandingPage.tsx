import { LuWallet } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, PieChart, Users } from "lucide-react";
const features = [
  {
    icon: <Users className="h-8 w-8 text-[#d84cd4]" />,
    title: "Create & Join Groups",
    description:
      "Easily create groups for trips, roommates, or events and invite friends to join.",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-[#d84cd4]" />,
    title: "Track Expenses",
    description:
      "Keep track of shared expenses and see who owes what in real-time.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-[#d84cd4]" />,
    title: "Simplify Settlements",
    description:
      "Settle up with friends easily using our hassle-free payment options.",
  },
];
export default function LandingPage() {
  return (
    <div className="font-second">
      <header className="sticky top-0 flex justify-between px-[10px] md:px-10 lg:px-10 py-4 bg-background/60 backdrop-blur-lg border-b-1 w-full">
        <div className="company'slogo flex items-center cursor-pointer">
          <LuWallet className="text-[#4a44ee] text-[25px] animation animate-bounce transition-all duration-700 ease-in-out" />
          <h2 className="text-2xl font-bold hover:text-[#9b48df]/90 transition-all duration-300 ease-in-out">
            SplitWise
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Link to={"/login"}>
            <Button
              className="bg-white text-black drop-shadow-md hover:drop-shadow-2xl
          py-3 px-4 rounded-lg font-semibold 
           transition-all duration-500 ease-in-out cursor-pointer"
            >
              Log in
            </Button>
          </Link>
          <Link to={"/signup"}>
            <Button
              className="bg-[#d84cd4] text-white drop-shadow-md hover:drop-shadow-2xl
          py-3 px-4 rounded-lg font-semibold 
           transition-all duration-500 ease-in-out cursor-pointer"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      <div className="content text-center pt-[140px] flex flex-col gap-5">
        <span>
          <h1 className="text-[40px] font-bold md:text-[50px] lg:text-[57px] lg:font-semibold md:font-semibold">
            Split bills with friends,{" "}
            <span className="bg-gradient-to-r from-[#9b48df] to-[#d84cd4] bg-clip-text text-transparent">
              hassle-free,
            </span>
          </h1>
          <p className="text-gray-500 px-10 text-[16px] md:px-70 lg:px-70 md:text-[22px] lg:text-[22px] font-normal pt-[10px]">
            The easiest way to share expenses with friends and family and stop
            stressing about "who owes who."
          </p>
        </span>

        <Link to={"/signup"} className="mx-auto">
          <Button
            className="flex items-center bg-linear-to-r from-[#9b48df] to-[#d84cd4]
           text-white font-semibold rounded-lg cursor-pointer transition-all duration-300 drop-shadow-md hover:drop-shadow-2xl py-6"
          >
            Get Started
            <FaArrowRight className="ml-1 transition-all ease-in-out group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <div className="card flex px-[10px] gap-0 lg:px-30 md:px-30 md:gap-5 lg:gap-5 lg:pt-50 md:pt-50 pt-20 md:flex-row lg:flex-row flex-col ">
        {features.map((feat, key) => (
          <Card
            key={key}
            className="transform transition-all duration-500 hover:scale-105 hover:drop-shadow-2xl animate-in shadow-lg"
          >
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <div className="rounded-full bg-primary/5 p-5 shadow-xl">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold">{feat.title}</h3>
              <p className="text-center text-muted-foreground">
                {feat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="foot bg-foreground w-full h-10 mt-10 flex justify-center text-center text-muted-foreground p-10">
        © 2025 SplitWise. All rights reserved.
      </div>
    </div>
  );
}
