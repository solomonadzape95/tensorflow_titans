import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router";
import { BalanceChart } from "./chart";

const balances = [
  {
    id: 1,
    name: "mark john",
    avatar: "/placeholder.svg?height=40&width=40&text=AJ",
    initials: "MJ",
    owesYou: 10.5,
    youOwe: 0,
    net: 10.5,
  },
  {
    id: 4,
    name: "Chidimma Ruth",
    avatar: "/placeholder.svg?height=40&width=40&text=ED",
    initials: "CR",
    owesYou: 0,
    youOwe: 0,
    net: 0,
  },
];

function BalanceLoyout() {
  return (
    <section className="space-y-8">
      <div className="animate-in">
        <h1 className="text-3xl font-bold tracking-tight font-display">
          <span className="text-gradient">Balances</span>
        </h1>
        <p className="text-muted-foreground">
          Track who owes you and who you owe
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          // variant="glass"
          className="animate-in  relative overflow-hidden  animate-in-delay-1  hover:shadow-glow  transition-all duration-300"
        >
          <CardHeader className="">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="">
            <p className="text-2xl font-bold font-display text-gradient">
              $245.89
            </p>
          </CardContent>
        </Card>

        <Card
          // variant="glass"
          className="animate-in animate-in-delay-2 hover:shadow-glow transition-all duration-300"
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium">You are owed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 font-display">
              $320.50
            </div>
          </CardContent>
        </Card>
        <Card
          // variant="glass"
          className="animate-in animate-in-delay-3 hover:shadow-glow transition-all duration-300"
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium">You owe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500 font-display">
              $74.61
            </div>
          </CardContent>
        </Card>
      </div>

      {/* the balance chart container */}
      <Card className="animate-in animate-in-delay-3 hover:shadow-glow transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Balance Overview
          </CardTitle>
          <CardDescription className="font-medium">
            Your current balances with friends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <BalanceChart />
          </div>
        </CardContent>
      </Card>

      {/* tab sections */}
      <Tabs defaultValue="friends" className="space-y-4 ">
        {/* tab lists */}

        <TabsList className="glass">
          <TabsTrigger
            value="friends"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
          >
            Friends
          </TabsTrigger>
          <TabsTrigger
            value="groups"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
          >
            Groups
          </TabsTrigger>
        </TabsList>
        {/* tab contents for friends */}

        <TabsContent value="friends" className="space-y-4 animate-in">
          <div className="space-y-4">
            {balances.map((balance, index) => (
              <Card
                key={balance.id}
                // variant="glass"
                className="hover:shadow-glow py-3 transition-all duration-300 animate-in "
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar
                        className="animate-float size-10"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <AvatarImage src={balance.avatar} alt={balance.name} />
                        <AvatarFallback>{balance.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{balance.name}</p>
                        {balance.net !== 0 && (
                          <p
                            className={`text-sm ${
                              balance.net > 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {balance.net > 0
                              ? `owes you $${balance.net.toFixed(2)}`
                              : `you owe $${Math.abs(balance.net).toFixed(2)}`}
                          </p>
                        )}
                        {balance.net === 0 && (
                          <p className="text-sm text-muted-foreground">
                            all settled up
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {balance.net !== 0 && (
                        <Button
                          variant="glass"
                          size="sm"
                          className="group"
                          asChild
                        >
                          <Link to={`/dashboard/settle/${balance.id}`}>
                            Settle Up
                            <ArrowRight className="ml-2 h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      )}
                      {balance.net === 0 && (
                        <Button
                          variant="glass"
                          size="sm"
                          className="text-green-500"
                          disabled
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Settled
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group"
                        asChild
                      >
                        <Link to={`/dashboard/friends/${balance.id}`}>
                          <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
          {/* tab contents for groups */}
        <TabsContent value="groups" className="space-y-4 animate-in">
          <div className="grid gap-3  sm:grid-cols-2 lg:grid-cols-3">
            {[
              "GROUP 1",
              "GROUP 2",
              "GROUP 3",
              "GROUP 4",
              "GROUP 5",
              "GROUP 6",
            ].map((group, i) => (
              <Card
                key={i}
                // variant="glass"
                className="overflow-hidden  hover:shadow-glow transition-all duration-300 animate-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <CardHeader className="">
                  <CardTitle className="text-lg font-display">
                    {group}
                  </CardTitle>
                  <CardDescription>
                    {i === 0 ? (
                      <span className="text-green-500">
                        You're owed $195.00
                      </span>
                    ) : i === 1 ? (
                      <span className="text-red-500">You owe $74.61</span>
                    ) : (
                      "All settled up"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className=" pt-0 ">
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((j) => (
                        <Avatar
                          key={j}
                          className="border-2 size-9 border-background animate-float"
                          style={{ animationDelay: `${j * 0.1}s` }}
                        >
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32&text=${
                              i + j
                            }`}
                          />
                          <AvatarFallback>U{j}</AvatarFallback>
                        </Avatar>
                      ))}
                      {i > 0 && (
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium animate-float"
                          style={{ animationDelay: "0.4s" }}
                        >
                          +{i}
                        </div>
                      )}
                    </div>
                    <Button variant="glass" size="sm" className="group" asChild>
                      <Link to={`/dashboard/groups/${i}`}>
                        View
                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

export default BalanceLoyout;
