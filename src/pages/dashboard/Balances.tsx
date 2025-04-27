import { useMutation } from "@tanstack/react-query";
import { settleExpense } from "@/lib/services/expenseService"; // Import the settleExpense function
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { protectPage } from "@/lib/services/authService";
import { fetchBalances, fetchGroupBalances } from "@/lib/services/userService";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useLoaderData } from "react-router";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient";

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

  const [{ data: userBalances }] = useSuspenseQueries({
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

  // Mutation for settling expenses
  const { mutateAsync: settleExpenseMutation } = useMutation({
    mutationFn: async (expenseId: string) => {
      return await settleExpense(expenseId, loaderData.user.id);
    },
    onSuccess: () => {
      toast.success("Expense settled successfully!");
      // Optionally refetch balances after settling
      queryClient.invalidateQueries({ queryKey: ["user", "balances"] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to settle the expense. Please try again."
      );
    },
  });
  console.log(userBalances);
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
                        {netAmount > 0 && (
                          <Button
                            size="sm"
                            className="group bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white"
                            onClick={() =>
                              toast.promise(settleExpenseMutation("gsfsfsf"), {
                                loading: "Settling expense...",
                                success: "Expense settled successfully!",
                                error: "Failed to settle the expense.",
                              })
                            }
                            disabled={true}
                          >
                            Settle Up
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
      </Tabs>
    </div>
  );
};

export default Balances;
