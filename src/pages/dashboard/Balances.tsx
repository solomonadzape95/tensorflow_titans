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
import type { protectPage } from "@/lib/services/authService";
import { fetchBalances, fetchGroupBalances } from "@/lib/services/userService";
import { useSuspenseQueries } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { Link, useLoaderData } from "react-router";

const getInitials = (name: string) => {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length === 1) return names[0][0].toUpperCase();
  return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
};

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};

interface GroupMemberDetails {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface GroupBalanceWithDetailedMembers {
  group_id: string;
  group_name: string | null;
  net_group_balance: number | null;
  members: GroupMemberDetails[];
}

const Balances = () => {
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof protectPage>>;

  const [{ data: userBalances }, { data: groupBalances }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["user", "balances", loaderData.user.id],
        queryFn: async () => fetchBalances(loaderData.user.id),
      },
      {
        queryKey: ["user", "groupBalances", loaderData.user.id],
        queryFn: async () =>
          fetchGroupBalances(loaderData.user.id) as unknown as Promise<
            GroupBalanceWithDetailedMembers[]
          >,
      },
    ],
  });

  const totalOwedToYou = userBalances
    .filter((b) => (b.net_amount ?? 0) > 0)
    .reduce((sum, b) => sum + (b.net_amount ?? 0), 0);
  const totalYouOwe = userBalances
    .filter((b) => (b.net_amount ?? 0) < 0)
    .reduce((sum, b) => sum + Math.abs(b.net_amount ?? 0), 0);
  const totalBalance = totalOwedToYou - totalYouOwe;

  return (
    <div className="space-y-8">
      <div className="animate-in">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-transparent bg-clip-text">
            Balances
          </span>
        </h1>
        <p className="text-muted-foreground">
          Track who owes you and who you owe
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="gap-3 py-4 bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md">
          <CardHeader className="pb-1">
            <CardTitle className="text-xl font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between w-full">
            <div className="text-2xl font-bold font-display bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-transparent bg-clip-text tabular-nums">
              {formatNaira(totalBalance)}
            </div>
          </CardContent>
        </Card>
        <Card className="gap-3 py-4 bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md">
          <CardHeader className="pb-1">
            <CardTitle className="text-xl font-medium">You are owed</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between w-full">
            <div className="text-2xl font-bold text-green-500 font-display tabular-nums">
              {formatNaira(totalOwedToYou)}
            </div>
          </CardContent>
        </Card>
        <Card className="gap-3 py-4 bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md">
          <CardHeader className="pb-1">
            <CardTitle className="text-xl font-medium">You owe</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between w-full">
            <div className="text-2xl font-bold text-red-500 font-display tabular-nums">
              {formatNaira(totalYouOwe)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <Card className="gap-3 py-4 bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md">
				<CardHeader>
					<CardTitle className="font-display text-2xl">
						Balance Overview
					</CardTitle>
					<CardDescription>Your current balances with friends</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-80" />
				</CardContent>
			</Card> */}

      <Tabs defaultValue="friends" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger
            value="friends"
            className="data-[state=active]:bg-[#4F32FF] data-[state=active]:text-white transition-all duration-300"
          >
            Friends
          </TabsTrigger>
          <TabsTrigger
            value="groups"
            className="data-[state=active]:bg-[#4F32FF] data-[state=active]:text-white transition-all duration-300"
          >
            Groups
          </TabsTrigger>
        </TabsList>
        <TabsContent value="friends" className="space-y-4 animate-in">
          <div className="space-y-4">
            {userBalances.map((balance, index) => {
              const netAmount = balance.net_amount ?? 0;
              const name = balance.other_user_name ?? "Unknown User";
              const initials = getInitials(name);
              const avatarUrl = balance.other_user_avatar_url;

              return (
                <Card
                  key={balance.other_user_id ?? index}
                  className="bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="size-10">
                          <AvatarImage
                            src={avatarUrl ?? undefined}
                            alt={name ?? ""}
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium capitalize">
                            {name.toLowerCase()}
                          </p>
                          {netAmount !== 0 && (
                            <p
                              className={`text-sm ${
                                netAmount > 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {netAmount > 0
                                ? `owes you ${formatNaira(netAmount)}`
                                : `you owe ${formatNaira(Math.abs(netAmount))}`}
                            </p>
                          )}
                          {netAmount === 0 && (
                            <p className="text-sm text-muted-foreground">
                              all settled up
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {netAmount !== 0 && (
                          <Button
                            size="sm"
                            className="group bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white"
                            asChild
                          >
                            {/* TODO: Update link to actual settle up page */}
                            <Link to="/">Settle Up</Link>
                          </Button>
                        )}
                        {netAmount === 0 && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white"
                            disabled
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Settled
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="groups" className="space-y-4 animate-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupBalances.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center">
                You are not part of any groups yet.
              </p>
            )}
            {groupBalances.map(
              (groupBalance: GroupBalanceWithDetailedMembers) => {
                const netBalance = groupBalance.net_group_balance ?? 0;
                const groupName = groupBalance.group_name ?? "Unnamed Group";
                const members = groupBalance.members || [];

                return (
                  <Card
                    key={groupBalance.group_id}
                    className="overflow-hidden bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md"
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg font-display">
                        {groupName}
                      </CardTitle>
                      <CardDescription>
                        {netBalance > 0 ? (
                          <span className="text-green-500">
                            You're owed {formatNaira(netBalance)}
                          </span>
                        ) : netBalance < 0 ? (
                          <span className="text-red-500">
                            You owe {formatNaira(Math.abs(netBalance))}
                          </span>
                        ) : (
                          "All settled up"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2 overflow-hidden">
                          {members.map((member) => (
                            <Avatar
                              key={member.id}
                              className="border-2 border-background size-8"
                            >
                              <AvatarImage
                                src={member.avatar_url ?? undefined}
                                alt={member.full_name ?? "Member"}
                              />

                              <AvatarFallback>
                                {getInitials(member.full_name ?? "")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white"
                          asChild
                        >
                          <Link
                            to={`/dashboard/groups/${groupBalance.group_id}`}
                          >
                            View
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Balances;
