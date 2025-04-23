import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { CalendarIcon, DollarSign, Loader, RepeatIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, useParams } from "react-router";
import { CreateExpenseFormData, createExpenseSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import useGetGroupMembers from "@/lib/services/groups/getGroupMembers";
import useGetGroups from "@/lib/services/groups/getGroupsForUser";
import { GroupData } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "@/lib/services/expenseService";
import { Switch } from "@/components/ui/switch";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const fromGroups = pathname.includes("/groups/");
  const [splitMethod, setSplitMethod] = useState("equal");
  const [splitData, setSplitData] = useState<SplitData>({});
  const [open, setOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      split_type: "equal",
      group_id: id || "",
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
          is_recurring: boolean;
          recurring_frequency?: string;
          recurring_end_date?: Date;
          recurring_count?: number;
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

        return !fromGroups
          ? navigate("/dashboard/expenses", {
              replace: true,
            })
          : navigate(pathname.split("expenses")[0], { replace: true });
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
      const splitAmount =
        Number.parseFloat(expenseAmount) / groupMembers.length;
      const splitPercentage = 100 / groupMembers.length;

      groupMembers.forEach((member: GroupMember) => {
        newSplitData[member.id] = {
          share_amount: Number.parseFloat(splitAmount.toFixed(2)),
          percentage: Number.parseFloat(splitPercentage.toFixed(2)),
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
          share_amount: Number.parseFloat(
            ((Number.parseFloat(expenseAmount) * percentage) / 100).toFixed(2)
          ),
          percentage: percentage,
        };
      });
    }
    setSplitData(newSplitData);
  };

  // Handle custom amount change
  const handleCustomAmountChange = (memberId: string, amount: string) => {
    const numAmount = Number.parseFloat(amount) || 0;

    setSplitData((prev) => {
      const newData = { ...prev };
      newData[memberId] = {
        share_amount: numAmount,
        percentage: expenseAmount
          ? (numAmount / Number.parseFloat(expenseAmount)) * 100
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
        share_amount: Number.parseFloat(
          (
            (Number.parseFloat(expenseAmount || "0") * newPercentage) /
            100
          ).toFixed(2)
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
            share_amount: Number.parseFloat(
              (
                (Number.parseFloat(expenseAmount || "0") * equalShare) /
                100
              ).toFixed(2)
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
      is_recurring: isRecurring,
      // Only include recurring fields if it's a recurring expense
      ...(isRecurring && {
        recurring_frequency: data.recurring_frequency,
        recurring_end_date: data.recurring_end_date,
        recurring_count: data.recurring_count,
      }),
    };
    createNewExpense(formData);
    console.log("Submitting expense data:", formData);
  };

  return (
    <div className="mx-auto space-y-6 flex-1 px-4 md:px-8 w-full h-full">
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
                          className="hover:drop-shadow-lg hover:brightness-95 transition-all duration-300"
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
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              <span>
                                {field.value.toLocaleDateString("en-CA")}
                              </span>
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </DialogTrigger>
                      <DialogContent
                        className="p-4 rounded-xl w-auto bg-white dark:bg-neutral-900 shadow-lg"
                        style={{
                          minWidth: "fit-content",
                          maxWidth: "fit-content",
                          margin: "auto",
                        }}
                      >
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold text-center w-full">
                            Pick a date
                          </DialogTitle>
                        </DialogHeader>
                        <div className="pt-2 flex justify-center">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setOpen(false);
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            className="rounded-md border p-4 bg-white dark:bg-neutral-800"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <FormDescription>
                      This is the date the expense was made
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Recurring Expense Toggle */}
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RepeatIcon className="h-4 w-4 text-primary" />
                    <Label htmlFor="recurring-toggle" className="font-medium">
                      Recurring Expense
                    </Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Set this as a recurring expense that happens regularly
                  </span>
                </div>
                <Switch
                  id="recurring-toggle"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>

              {/* Recurring Options (only displayed if recurring is toggled on) */}
              {isRecurring && (
                <div className="space-y-4 animate-in">
                  <FormField
                    control={form.control}
                    name="recurring_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often does this expense repeat?
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <Label>End Recurrence</Label>
                    <Tabs defaultValue="count" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 glass">
                        <TabsTrigger
                          value="count"
                          className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                        >
                          After occurrences
                        </TabsTrigger>
                        <TabsTrigger
                          value="date"
                          className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                        >
                          On date
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="count" className="mt-4 animate-in">
                        <FormField
                          control={form.control}
                          name="recurring_count"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="number"
                                    {...field}
                                    min={1}
                                    max={100}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    disabled={
                                      form.watch("recurring_frequency") === ""
                                        ? true
                                        : false
                                    }
                                    className="w-20 text-center"
                                  />
                                  <FormDescription>time(s)</FormDescription>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="date" className="mt-4 animate-in">
                        <FormField
                          control={form.control}
                          name="recurring_end_date"
                          render={({ field }) => (
                            <FormItem>
                              <Dialog open={endOpen} onOpenChange={setEndOpen}>
                                <DialogTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        <span>
                                          {field.value.toLocaleDateString(
                                            "en-CA"
                                          )}
                                        </span>
                                      ) : (
                                        <span>Select end date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </DialogTrigger>
                                <DialogContent
                                  className="p-4 rounded-xl w-auto bg-white dark:bg-neutral-900 shadow-lg"
                                  style={{
                                    minWidth: "fit-content",
                                    maxWidth: "fit-content",
                                    margin: "auto",
                                  }}
                                >
                                  <DialogHeader>
                                    <DialogTitle className="text-lg font-semibold text-center w-full">
                                      Select end date
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="pt-2 flex justify-center">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        setEndOpen(false);
                                      }}
                                      disabled={(date) =>
                                        date < new Date() ||
                                        date < new Date("1900-01-01")
                                      }
                                      className="rounded-md border p-4 bg-white dark:bg-neutral-800"
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <FormDescription>
                                The expense will repeat until this date
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!id}
                    >
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
                    {groupMembers && groupMembers.length < 2 && (
                      <p className="text-sm text-red-500">
                        The selected group must contain at least 2 members to
                        create an expense.
                      </p>
                    )}
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
                      disabled={
                        !groupMembers ||
                        isLoadingMembers ||
                        (groupMembers && groupMembers.length < 2)
                      }
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
                      {splitMethod === "custom" && expenseAmount && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                            <span>Total:</span>
                            <span className="font-bold">
                              $
                              {Object.values(splitData)
                                .reduce(
                                  (sum, data) => sum + (data.share_amount || 0),
                                  0
                                )
                                .toFixed(2)}
                              /{expenseAmount}
                            </span>
                          </div>
                          {Object.values(splitData).reduce(
                            (sum, data) => sum + (data.share_amount || 0),
                            0
                          ) !== parseFloat(expenseAmount) && (
                            <p className="text-sm text-red-500">
                              The total of custom splits must equal the expense
                              amount.
                            </p>
                          )}
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
                                onValueChange={(value: number[]) =>
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
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={
                  form.formState.isSubmitting ||
                  isCreatingExpense ||
                  !form.formState.isValid ||
                  (groupMembers && groupMembers.length < 2) ||
                  (splitMethod === "custom" &&
                    Object.values(splitData).reduce(
                      (sum, data) => sum + (data.share_amount || 0),
                      0
                    ) !== parseFloat(expenseAmount))
                }
                className="min-w-[120px] bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white"
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
                  <span>Create Expense</span>
                )}
              </Button>
              <ConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Confirm Expense Creation"
                description={
                  <span>
                    Please go through the details again because this expense{" "}
                    <strong className="text-red-500">CANNOT</strong> be edited.
                    <br />
                    Are you sure you want to create this expense?
                  </span>
                }
                confirmText="Yes, Create Expense"
                cancelText="No, Go back"
                destructive={false}
                onConfirm={async () => {
                  setConfirmOpen(false); // Close the dialog
                  await form.handleSubmit(onSubmit)(); // Submit the form
                }}
                loading={form.formState.isSubmitting || isCreatingExpense}
              />
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
