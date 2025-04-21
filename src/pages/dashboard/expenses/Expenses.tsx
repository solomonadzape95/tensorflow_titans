import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  ArrowUpDown,
  Calendar,
  Car,
  Filter,
  Home,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Utensils,
  Wifi,
} from "lucide-react";
import { Link } from "react-router";

const expenses = [
  {
    id: 1,
    description: "Dinner at Olive Garden",
    amount: 86.25,
    date: "2025-04-07",
    formattedDate: "Today at 8:30 PM",
    category: "Food & Drink",
    icon: Utensils,
    group: "Dinner Club",
    youPaid: true,
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=32&width=32&text=AJ",
      initials: "AJ",
    },
    participants: [
      { name: "You", amount: 21.56 },
      { name: "Alex Johnson", amount: 21.56 },
      { name: "Sarah Miller", amount: 21.56 },
      { name: "Mike Wilson", amount: 21.57 },
    ],
    notes: "Great dinner with friends. We should come back here again!",
  },
  {
    id: 2,
    description: "Monthly Rent",
    amount: 1200.0,
    date: "2025-04-06",
    formattedDate: "Yesterday at 9:00 AM",
    category: "Housing",
    icon: Home,
    group: "Roommates",
    youPaid: false,
    youOwe: true,
    user: {
      name: "Sarah Miller",
      avatar: "/placeholder.svg?height=32&width=32&text=SM",
      initials: "SM",
    },
    participants: [
      { name: "You", amount: 400.0 },
      { name: "Alex Johnson", amount: 400.0 },
      { name: "Sarah Miller", amount: 400.0 },
    ],
    notes: "April rent payment",
  },
  {
    id: 3,
    description: "Grocery Shopping",
    amount: 124.86,
    date: "2025-03-25",
    formattedDate: "Mar 25, 2025",
    category: "Groceries",
    icon: ShoppingBag,
    group: "Roommates",
    youPaid: true,
    user: {
      name: "Mike Wilson",
      avatar: "/placeholder.svg?height=32&width=32&text=MW",
      initials: "MW",
    },
    participants: [
      { name: "You", amount: 41.62 },
      { name: "Alex Johnson", amount: 41.62 },
      { name: "Sarah Miller", amount: 41.62 },
    ],
    notes: "Weekly groceries including snacks and drinks",
  },
  {
    id: 4,
    description: "Uber Ride",
    amount: 18.5,
    date: "2025-03-24",
    formattedDate: "Mar 24, 2025",
    category: "Transportation",
    icon: Car,
    group: "Trip to Paris",
    youPaid: false,
    youOwe: true,
    user: {
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=32&width=32&text=ED",
      initials: "ED",
    },
    participants: [
      { name: "You", amount: 9.25 },
      { name: "Emily Davis", amount: 9.25 },
    ],
    notes: "Ride to the airport",
  },
  {
    id: 5,
    description: "Internet Bill",
    amount: 65.99,
    date: "2025-03-15",
    formattedDate: "Mar 15, 2025",
    category: "Utilities",
    icon: Wifi,
    group: "Roommates",
    youPaid: false,
    youOwe: true,
    user: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=32&width=32&text=JS",
      initials: "JS",
    },
    participants: [
      { name: "You", amount: 22.0 },
      { name: "Alex Johnson", amount: 22.0 },
      { name: "Sarah Miller", amount: 21.99 },
    ],
    notes: "Monthly internet bill",
  },
  {
    id: 6,
    description: "Movie Tickets",
    amount: 32.0,
    date: "2025-03-22",
    formattedDate: "Mar 22, 2025",
    category: "Entertainment",
    icon: Receipt,
    group: "Dinner Club",
    youPaid: false,
    youOwe: true,
    user: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=32&width=32&text=JS",
      initials: "JS",
    },
    participants: [
      { name: "You", amount: 16.0 },
      { name: "John Smith", amount: 16.0 },
    ],
    notes: "Tickets for the new action movie",
  },
];

export default function ExpensesOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedExpense, setSelectedExpense] = useState<
    (typeof expenses)[0] | null
  >(null);

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup =
        selectedGroup === "all" || expense.group === selectedGroup;
      const matchesCategory =
        selectedCategory === "all" || expense.category === selectedCategory;
      return matchesSearch && matchesGroup && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "amount") {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      } else {
        return sortOrder === "desc"
          ? b.description.localeCompare(a.description)
          : a.description.localeCompare(b.description);
      }
    });

  // Filter expenses for "You Paid" and "You Owe" tabs
  const youPaidExpenses = filteredExpenses.filter((expense) => expense.youPaid);
  const youOweExpenses = filteredExpenses.filter((expense) => expense.youOwe);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  // Get unique groups and categories for filters
  const groups = ["all", ...new Set(expenses.map((expense) => expense.group))];
  const categories = [
    "all",
    ...new Set(expenses.map((expense) => expense.category)),
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">
            <span className="text-gradient">Expenses</span>
          </h1>
          <p className="text-muted-foreground">
            Manage and track your expenses
          </p>
        </div>
        <Button
          asChild
          variant="gradient"
          className="group bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white"
        >
          <Link to="/dashboard/expenses/new">
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
            Add Expense
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger
            value="all"
            className="data-[state=on]:bg-[#4F32FF]/20 data-[state=on]:text-[#4F32FF] hover:bg-transparent hover:text-muted-foreground  px-4 py-1 text-sm font-medium cursor-pointer rounded-sm transition-colors"
          >
            All Expenses
          </TabsTrigger>
          <TabsTrigger
            value="you-paid"
            className="data-[state=on]:bg-[#4F32FF]/20 data-[state=on]:text-[#4F32FF] hover:bg-transparent hover:text-muted-foreground  px-4 py-1 text-sm font-medium cursor-pointer rounded-sm transition-colors"
          >
            You Paid
          </TabsTrigger>
          <TabsTrigger
            value="you-owe"
            className="dark:data-[state=on]:bg-[#4F32FF] data-[state=on]:text-[#4F32FF]  hover:text-muted-foreground  px-4 py-1 text-sm font-medium cursor-pointer rounded-sm transition-colors"
          >
            You Owe
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              className="pl-10 glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-[150px] glass">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Group" />
                </div>
              </SelectTrigger>
              <SelectContent className="glass">
                {groups.map((group) => (
                  <SelectItem key={group} value={group} className="capitalize">
                    {group === "all" ? "All Groups" : group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-fit glass">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="glass">
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="capitalize"
                  >
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="h-10 w-10 bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass">
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("date");
                    toggleSortOrder();
                  }}
                  className={
                    sortBy === "date" ? "bg-primary/10 text-primary" : ""
                  }
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Date {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("amount");
                    toggleSortOrder();
                  }}
                  className={
                    sortBy === "amount" ? "bg-primary/10 text-primary" : ""
                  }
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Amount{" "}
                  {sortBy === "amount" && (sortOrder === "desc" ? "↓" : "↑")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("description");
                    toggleSortOrder();
                  }}
                  className={
                    sortBy === "description" ? "bg-primary/10 text-primary" : ""
                  }
                >
                  <Search className="mr-2 h-4 w-4" />
                  Description{" "}
                  {sortBy === "description" &&
                    (sortOrder === "desc" ? "↓" : "↑")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4 animate-in">
          {filteredExpenses.length > 0 ? (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => {
                const Icon = expense.icon;
                return (
                  <Card
                    key={expense.id}
                    className="py-1 hover:shadow-glow transition-all duration-300 cursor-pointer bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md"
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <CardContent className="px-4 py-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1 gap-3">
                          <div className="flex items-center justify-between text-sm gap-2">
                            <div>
                              <p className="font-medium text-xl">
                                {expense.description}
                              </p>
                              <div className="flex items-center gap-2  text-muted-foreground">
                                <span>Group: {expense.group}</span>
                                <span>•</span>
                                <span>Category: {expense.category}</span>
                              </div>
                            </div>
                            <p className="font-medium">
                              ${expense.amount.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-start md:items-center gap-2 flex-col md:flex-row">
                              <span className="flex items-center gap-3">
                                <Avatar className="h-6 w-6 text-xs">
                                  <AvatarImage
                                    src={expense.user.avatar}
                                    alt={expense.user.name}
                                  />
                                  <AvatarFallback>
                                    {expense.user.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{expense.user.name}</span>
                              </span>
                              {expense.youOwe && (
                                <span className="text-xs font-medium text-red-500 bg-red-100 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                                  You owe
                                </span>
                              )}
                              {expense.youPaid && (
                                <span className="text-xs font-medium text-green-500 bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                  You paid
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{expense.formattedDate}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 group"
                              >
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-muted p-4">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>No expenses found</CardTitle>
                <CardDescription>
                  {searchQuery ||
                  selectedGroup !== "all" ||
                  selectedCategory !== "all"
                    ? "Try adjusting your filters"
                    : "Add your first expense to get started"}
                </CardDescription>
                {!searchQuery &&
                  selectedGroup === "all" &&
                  selectedCategory === "all" && (
                    <Button asChild variant="gradient" className="mt-2 group">
                      <Link to="/dashboard/expenses/new">
                        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                        Add Expense
                      </Link>
                    </Button>
                  )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="you-paid" className="space-y-4 animate-in">
          {youPaidExpenses.length > 0 ? (
            <div className="space-y-4">
              {youPaidExpenses.map((expense) => {
                const Icon = expense.icon;
                return (
                  <Card
                    key={expense.id}
                    className="hover:shadow-glow transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {expense.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Group: {expense.group}</span>
                                <span>•</span>
                                <span>Category: {expense.category}</span>
                              </div>
                            </div>
                            <p className="font-medium">
                              ${expense.amount.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={expense.user.avatar}
                                  alt={expense.user.name}
                                />
                                <AvatarFallback>
                                  {expense.user.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span>{expense.user.name}</span>
                              <span className="text-xs font-medium text-green-500 bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                You paid
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{expense.formattedDate}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 group"
                              >
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-muted p-4">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>No expenses found</CardTitle>
                <CardDescription>
                  {searchQuery ||
                  selectedGroup !== "all" ||
                  selectedCategory !== "all"
                    ? "Try adjusting your filters"
                    : "You haven't paid for any expenses yet"}
                </CardDescription>
                <Button asChild variant="gradient" className="mt-2 group">
                  <Link to="/dashboard/expenses/new">
                    <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                    Add Expense
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="you-owe" className="space-y-4 animate-in">
          {youOweExpenses.length > 0 ? (
            <div className="space-y-4">
              {youOweExpenses.map((expense) => {
                const Icon = expense.icon;
                return (
                  <Card
                    key={expense.id}
                    className="hover:shadow-glow transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {expense.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Group: {expense.group}</span>
                                <span>•</span>
                                <span>Category: {expense.category}</span>
                              </div>
                            </div>
                            <p className="font-medium">
                              ${expense.amount.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={expense.user.avatar}
                                  alt={expense.user.name}
                                />
                                <AvatarFallback>
                                  {expense.user.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span>{expense.user.name}</span>
                              <span className="text-xs font-medium text-red-500 bg-red-100 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                                You owe
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{expense.formattedDate}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 group"
                              >
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-muted p-4">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>No expenses found</CardTitle>
                <CardDescription>
                  {searchQuery ||
                  selectedGroup !== "all" ||
                  selectedCategory !== "all"
                    ? "Try adjusting your filters"
                    : "You don't owe anyone money"}
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Expense Detail Modal */}
      <Dialog
        open={!!selectedExpense}
        onOpenChange={(open) => !open && setSelectedExpense(null)}
      >
        <DialogContent className="glass sm:max-w-md">
          {selectedExpense && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {selectedExpense.description}
                </DialogTitle>
                <DialogDescription>
                  {selectedExpense.formattedDate} • {selectedExpense.category}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedExpense.user.avatar}
                        alt={selectedExpense.user.name}
                      />
                      <AvatarFallback>
                        {selectedExpense.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedExpense.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Paid ${selectedExpense.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Group</p>
                    <p className="font-medium">{selectedExpense.group}</p>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="text-sm font-medium">Split Details</h4>
                  {selectedExpense.participants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span
                        className={
                          participant.name === "You" ? "font-medium" : ""
                        }
                      >
                        {participant.name}
                      </span>
                      <span
                        className={
                          participant.name === "You" ? "font-medium" : ""
                        }
                      >
                        ${participant.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedExpense.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedExpense.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button asChild>
                    <Link to={`/dashboard/expenses/${selectedExpense.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  {selectedExpense.youOwe && (
                    <Button variant="gradient" asChild>
                      <Link to={`/dashboard/settle/${selectedExpense.id}`}>
                        Settle Up
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
