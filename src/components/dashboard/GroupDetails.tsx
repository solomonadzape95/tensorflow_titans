import { Button } from "../ui/button";
import { Link, useParams } from "react-router";
import { ArrowLeft, Plus, Receipt, Settings, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback } from "../ui/avatar";
import NotFound from "@/pages/not-found";

type Group = {
  id: number;
  name: string;
  description: string;
  members: { id: number; name: string; initials: string }[];
  expenses: number;
  balance: number;
  youOwe: boolean;
  settled?: boolean;
};

const groups: Record<string, Group> = {
  "1": {
    id: 1,
    name: "Roommates",
    description: "Rent, utilities, and household expenses",
    members: [
      { id: 1, name: "You", initials: "You" },
      { id: 2, name: "Alex Johnson", initials: "AJ" },
      { id: 3, name: "Sarah Miller", initials: "SM" },
      { id: 4, name: "Mike Wilson", initials: "MW" },
    ],
    expenses: 12,
    balance: 195.0,
    youOwe: false,
  },
  "2": {
    id: 2,
    name: "Trip to Paris",
    description: "Travel expenses for our vacation",
    members: [
      { id: 1, name: "You", initials: "You" },
      { id: 2, name: "Alex Johnson", initials: "AJ" },
      { id: 3, name: "Sarah Miller", initials: "SM" },
    ],
    expenses: 8,
    balance: 74.61,
    youOwe: true,
  },
};

function GroupDetails() {
  const { id } = useParams<{ id: string }>();

  //   if (!id) return <div>Invalid group ID</div>;

  const group = groups[id!];

  if (!group) return <NotFound />;

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/dashboard/groups">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-display">
              <span className="text-gradient">{group.name}</span>
            </h1>
            <p className="text-muted-foreground">{group.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="glass" size="sm">
            <Link to={`/dashboard/groups/${group.id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button
            asChild
            variant="gradient"
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 group"
          >
            <Link to="/dashboard/expenses/new">
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          // variant="glass"
          className="hover:shadow-glow transition-all duration-300 "
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Group Balance</CardTitle>
          </CardHeader>
          <CardContent className="m-0">
            {group.settled ? (
              <div className="text-2xl font-bold text-green-500 font-display">
                All settled up
              </div>
            ) : group.youOwe ? (
              <div className="text-2xl font-bold text-red-500 font-display">
                You owe ${group.balance.toFixed(2)}
              </div>
            ) : (
              <div className="text-2xl font-bold text-green-500 font-display">
                You're owed ${group.balance.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card
          // variant="glass"
          className="hover:shadow-glow transition-all duration-300"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold font-display">
                {group.expenses}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          // variant="glass"
          className="hover:shadow-glow transition-all duration-300"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold font-display">
                {group.members.length}
              </div>
            </div>
            <div className="mt-2 flex -space-x-2">
              {group.members.slice(0, 5).map((member) => (
                <Avatar key={member.id} className="border-2 border-background">
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
              ))}
              {group.members.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{group.members.length - 5}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
          >
            Recent Activity
          </TabsTrigger>
          <TabsTrigger
            value="balances"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
          >
            Balances
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
          >
            Members
          </TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="space-y-4">
          <Card
          //   variant="glass"
          >
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Recent transactions in this group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                No recent activity in this group
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="balances" className="space-y-4">
          <Card
          //   variant="glass"
          >
            <CardHeader>
              <CardTitle>Group Balances</CardTitle>
              <CardDescription>Who owes who in this group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {group.members
                  .filter((m) => m.name !== "You")
                  .map((member, i) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                      <div
                        className={`font-medium ${
                          i % 2 === 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {i % 2 === 0
                          ? `owes you $${(25 + i * 15).toFixed(2)}`
                          : `you owe $${(15 + i * 10).toFixed(2)}`}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
          <Card
          //   variant="glass"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Group Members</CardTitle>
                <CardDescription>People in this group</CardDescription>
              </div>
              <Button variant="glass" size="sm" className="group">
                <Plus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{member.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                      </div>
                    </div>
                    {member.name === "You" && (
                      <div className="text-sm font-medium text-primary">
                        You (Admin)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GroupDetails;
