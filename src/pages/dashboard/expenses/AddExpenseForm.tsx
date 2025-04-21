import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, DollarSign, Loader } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { CreateExpenseFormData, createExpenseSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import useGetGroupMembers from "@/lib/services/groups/getGroupMembers";
import useGetGroups from "@/lib/services/groups/getGroupsForUser";
import { GroupData } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "@/lib/services/expenseService";
type GroupMember = {
  id: string;
  name: string;
  avatar_url: string | null;
  email: string;
};

type SplitData = {
  [userId: string]: {
    share_amount: number;
    percentage?: number;
  };
};

export function AddExpenseForm() {
  const navigate = useNavigate();
  const [splitMethod, setSplitMethod] = useState("equal");
  const [splitData, setSplitData] = useState<SplitData>({});
  const queryClient = useQueryClient();
  const form = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      split_type: "equal",
    },
  });

  const groupID = form.watch("group_id");
  const expenseAmount = form.watch("amount");

  const { groupMembers, isLoading: isLoadingMembers } =
    useGetGroupMembers(groupID);
  const { groups, isLoading: isLoadingGroups } = useGetGroups();
  const { mutateAsync: createNewExpense, isPending: isCreatingExpense } =
    useMutation({
      mutationKey: ["createExpense"],
      mutationFn: async (
        data: CreateExpenseFormData & {
          splits: {
            [userId: string]: {
              share_amount: number;
              percentage?: number;
            };
          };
        }
      ) => {
        return await createExpense(data);
      },
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: ["expenses"],
        });

        // If you have specific expense queries by group
        if (form.watch("group_id")) {
          queryClient.invalidateQueries({
            queryKey: ["expenses", form.watch("group_id")],
          });
        }

        navigate("/dashboard/expenses", {
          replace: true,
        });
      },
    });
  // Update split data when members or expense amount changes
  useEffect(() => {
    if (groupMembers && expenseAmount) {
      updateSplitData();
    }
  }, [groupMembers, expenseAmount, splitMethod]);

  // Calculate and update split data based on selected method
  const updateSplitData = () => {
    if (!groupMembers || !expenseAmount) return;

    const newSplitData: SplitData = {};

    if (splitMethod === "equal") {
      const splitAmount = parseFloat(expenseAmount) / groupMembers.length;
      const splitPercentage = 100 / groupMembers.length;

      groupMembers.forEach((member: GroupMember) => {
        newSplitData[member.id] = {
          share_amount: parseFloat(splitAmount.toFixed(2)),
          percentage: parseFloat(splitPercentage.toFixed(2)),
        };
      });
    } else if (splitMethod === "custom") {
      // Maintain any existing custom amounts or initialize with 0
      groupMembers.forEach((member: GroupMember) => {
        newSplitData[member.id] = splitData[member.id] || {
          amount: 0,
          percentage: 0,
        };
      });
    } else if (splitMethod === "percentage") {
      // Initialize with equal percentages if not set
      const defaultPercentage = 100 / groupMembers.length;
      // Add validation check before updating split data for percentage method
      let totalPercentage = 0;
      groupMembers.forEach((member: GroupMember) => {
        const percentage =
          splitData[member.id]?.percentage || defaultPercentage;
        totalPercentage += percentage;
        if (totalPercentage > 100) return; // Skip if total exceeds 100%
      });
      groupMembers.forEach((member: GroupMember) => {
        const percentage =
          splitData[member.id]?.percentage || defaultPercentage;
        newSplitData[member.id] = {
          share_amount: parseFloat(
            ((parseFloat(expenseAmount) * percentage) / 100).toFixed(2)
          ),
          percentage: percentage,
        };
      });
    }
    setSplitData(newSplitData);
  };

  // Handle custom amount change
  const handleCustomAmountChange = (memberId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;

    setSplitData((prev) => {
      const newData = { ...prev };
      newData[memberId] = {
        share_amount: numAmount,
        percentage: expenseAmount
          ? (numAmount / parseFloat(expenseAmount)) * 100
          : 0,
      };
      return newData;
    });
  };

  // Handle percentage slider change
  const handlePercentageChange = (memberId: string, value: number[]) => {
    const newPercentage = value[0];

    setSplitData((prev) => {
      const newData = { ...prev };
      const otherMembers = Object.keys(prev).filter((id) => id !== memberId);

      // Update the current member's percentage and amount
      newData[memberId] = {
        percentage: newPercentage,
        share_amount: parseFloat(
          ((parseFloat(expenseAmount || "0") * newPercentage) / 100).toFixed(2)
        ),
      };

      // Calculate remaining percentage
      const remaining = Math.max(0, 100 - newPercentage);

      // Distribute remaining percentage equally among other members
      if (otherMembers.length > 0) {
        const equalShare = remaining / otherMembers.length;
        otherMembers.forEach((id) => {
          newData[id] = {
            percentage: equalShare,
            share_amount: parseFloat(
              ((parseFloat(expenseAmount || "0") * equalShare) / 100).toFixed(2)
            ),
          };
        });
      }

      return newData;
    });
  };

  const onSubmit = (data: CreateExpenseFormData) => {
    // Include the split data in your submission
    const formData = {
      ...data,
      split_type: splitMethod === "percentage" ? "custom" : splitMethod,
      splits: splitData,
    };
    createNewExpense(formData);
    console.log("Submitting expense data:", formData);
  };

  return (
    <div className="mx-auto space-y-6 flex-1 px-4 md:px-8 w-full h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight ">
          <span className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-transparent bg-clip-text">
            Create New Expense
          </span>
        </h1>
        <p className="text-muted-foreground">
          Create an expense in any one of your groups.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="animate-in">
          <Card className="hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-display">Expense Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Give this expense a name"
                          required
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="What is this expense about"
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            type="number"
                            placeholder="How much did it cost?"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              <span>
                                {field.value.toISOString().split("T")[0]}
                              </span>
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      This is the date the expense was made
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingGroups ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            <span>Loading groups...</span>
                          </div>
                        ) : groups && groups.length > 0 ? (
                          groups.map((group: GroupData, key: number) => (
                            <SelectItem
                              key={key}
                              value={group.id}
                              className="break-words"
                            >
                              {group.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-muted-foreground">
                            No groups found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Group where this expense will be shared
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payer_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Payer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!groupMembers || isLoadingMembers}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Payer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingMembers ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            <span>Loading members...</span>
                          </div>
                        ) : groupMembers && groupMembers.length > 0 ? (
                          groupMembers.map((user: GroupMember) => (
                            <SelectItem
                              key={user.id}
                              value={user.id}
                              className="break-words"
                            >
                              {user.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-muted-foreground">
                            No members found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Person who paid this for this expense
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("amount") && (
                <div className="space-y-4">
                  <Label>Split Method</Label>
                  <Tabs
                    value={splitMethod}
                    onValueChange={setSplitMethod}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 glass">
                      <TabsTrigger
                        value="equal"
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                      >
                        Equal
                      </TabsTrigger>
                      <TabsTrigger
                        value="custom"
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                      >
                        Custom
                      </TabsTrigger>
                      <TabsTrigger
                        value="percentage"
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                      >
                        Percentage
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="equal"
                      className="mt-4 space-y-4 animate-in"
                    >
                      <p className="text-sm text-muted-foreground">
                        Split equally among all members
                      </p>
                      <div className="space-y-2">
                        {isLoadingMembers ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                            <Loader className="size-4 animate-spin" />
                            <span>Loading Group Members</span>
                          </div>
                        ) : groupMembers && groupMembers.length > 0 ? (
                          groupMembers.map((member: GroupMember) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between rounded-lg glass p-3 hover:shadow-glow transition-all duration-300"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar
                                  className="animate-float"
                                  style={{
                                    animationDelay: `${0.1}s`,
                                  }}
                                >
                                  <AvatarImage
                                    src={member.avatar_url || ""}
                                    alt={member.name}
                                  />
                                  <AvatarFallback>
                                    {member.name
                                      .split(" ")
                                      .map((item) =>
                                        item.charAt(0).toUpperCase()
                                      )
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{member.name}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="font-medium text-gradient">
                                  {expenseAmount && splitData[member.id]
                                    ? `$${splitData[member.id].share_amount}`
                                    : "$0.00"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {expenseAmount && splitData[member.id]
                                    ? `${splitData[
                                        member.id
                                      ].percentage?.toFixed(2)}%`
                                    : "0%"}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No members available. Please select a group first.
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="custom"
                      className="mt-4 space-y-4 animate-in"
                    >
                      <p className="text-sm text-muted-foreground">
                        Enter custom amounts for each person
                      </p>
                      <div className="space-y-2">
                        {isLoadingMembers ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                            <Loader className="size-4 animate-spin" />
                            <span>Loading Group Members</span>
                          </div>
                        ) : groupMembers && groupMembers.length > 0 ? (
                          groupMembers.map((member: GroupMember) => (
                            <div
                              key={member.id}
                              className="space-y-2 rounded-lg glass p-3 hover:shadow-glow transition-all duration-300"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    className="animate-float"
                                    style={{
                                      animationDelay: `${0.1}s`,
                                    }}
                                  >
                                    <AvatarImage
                                      src={member.avatar_url || ""}
                                      alt={member.name}
                                    />
                                    <AvatarFallback>
                                      {member.name
                                        .split(" ")
                                        .map((item) =>
                                          item.charAt(0).toUpperCase()
                                        )
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{member.name}</span>
                                </div>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-30 pl-10"
                                    value={
                                      splitData[member.id]?.share_amount || ""
                                    }
                                    onChange={(e) =>
                                      handleCustomAmountChange(
                                        member.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              {expenseAmount && (
                                <div className="text-xs text-right text-muted-foreground">
                                  {splitData[member.id]?.percentage
                                    ? `${
                                        splitData[
                                          member.id
                                        ]?.percentage?.toFixed(2) || "0"
                                      }%`
                                    : "0%"}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No members available. Please select a group first.
                          </p>
                        )}
                      </div>
                      {expenseAmount && (
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                          <span>Total:</span>
                          <span className="font-bold">
                            $
                            {Object.values(splitData)
                              .reduce((sum, data) => sum + data.share_amount, 0)
                              .toFixed(2)}
                            /{expenseAmount}
                          </span>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent
                      value="percentage"
                      className="mt-4 space-y-4 animate-in"
                    >
                      <p className="text-sm text-muted-foreground">
                        Adjust percentages for each person
                      </p>
                      <div className="space-y-4">
                        {isLoadingMembers ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                            <Loader className="size-4 animate-spin" />
                            <span>Loading Group Members</span>
                          </div>
                        ) : groupMembers && groupMembers.length > 0 ? (
                          groupMembers.map((member: GroupMember) => (
                            <div
                              key={member.id}
                              className="space-y-2 rounded-lg glass p-3 hover:shadow-glow transition-all duration-300"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    className="animate-float"
                                    style={{
                                      animationDelay: `${0.1}s`,
                                    }}
                                  >
                                    <AvatarImage
                                      src={member.avatar_url || ""}
                                      alt={member.name}
                                    />
                                    <AvatarFallback>
                                      {member.name
                                        .split(" ")
                                        .map((item) =>
                                          item.charAt(0).toUpperCase()
                                        )
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{member.name}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="font-medium text-gradient">
                                    {splitData[member.id]?.percentage?.toFixed(
                                      2
                                    ) || 0}
                                    %
                                  </span>
                                  {expenseAmount && (
                                    <span className="text-xs text-muted-foreground">
                                      $
                                      {splitData[
                                        member.id
                                      ]?.share_amount.toFixed(2) || "0.00"}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Slider
                                value={[splitData[member.id]?.percentage || 0]}
                                max={100}
                                step={1}
                                onValueChange={(value) =>
                                  handlePercentageChange(member.id, value)
                                }
                                className="[&>.slider-track]:h-2 [&>.slider-track]:bg-secondary [&>.slider-range]:bg-gradient-to-r [&>.slider-range]:from-primary [&>.slider-range]:to-[#ff4ecd] [&>.slider-thumb]:h-5 [&>.slider-thumb]:w-5 [&>.slider-thumb]:bg-background [&>.slider-thumb]:border-2 [&>.slider-thumb]:border-primary [&>.slider-thumb]:shadow-glow"
                              />
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No members available. Please select a group first.
                          </p>
                        )}
                      </div>
                      {expenseAmount && (
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                          <span>Total:</span>
                          <span className="font-bold">
                            {Object.values(splitData)
                              .reduce(
                                (sum, data) => sum + (data.percentage || 0),
                                0
                              )
                              .toFixed(2)}
                            %
                          </span>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  isCreatingExpense ||
                  !form.formState.isValid
                }
                className="min-w-[120px]"
              >
                {form.formState.isSubmitting || isCreatingExpense ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Create Expense"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
