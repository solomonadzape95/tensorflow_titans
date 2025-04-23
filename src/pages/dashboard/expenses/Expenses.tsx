import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import useGetExpenses from "@/lib/services/expenses/useGetExpenses";
import { formatNaira } from "@/lib/utils";
import { Expense } from "@/types";
import NoExpenseUI from "@/components/dashboard/NoExpense";

const categoryIcons = {
  "Food & Drink": Utensils,
  "Housing": Home,
  "Groceries": ShoppingBag,
  "Transportation": Car,
  "Utilities": Wifi,
  "Entertainment": Receipt,
  "default": Receipt
} as const;

type CategoryIconsKey = keyof typeof categoryIcons;

const getCategoryIcon = (category: string | number) => {
  return categoryIcons[category as CategoryIconsKey] || categoryIcons["default"];
};

export default function ExpensesOverview() {
  const { expenses, isLoading } = useGetExpenses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const transformExpenses = () => {
    const owedExpenses = expenses?.owed?.map(exp => {
      const expense = exp.expense;
      return {
        id: exp.id,
        description: expense.name,
        amount: exp.share_amount,
        date: expense.expense_date,
        formattedDate: expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'No date',
        category: "Other",
        icon: getCategoryIcon("default"),
        group: expense.group_id || "Personal",
        youPaid: true,
        youOwe: false,
        settled: false,
        user: {
          name: "You",
          avatar: "/placeholder.svg?height=32&width=32&text=You",
          initials: "YOU",
        },
        participants: [],
        notes: expense.description || "",
        status: exp.status
      };
    }) || [];

    const owingExpenses = expenses?.owing?.map(exp => {
      const expense = exp.expense;
      return {
        id: exp.id,
        description: expense.name,
        amount: exp.share_amount,
        date: expense.expense_date,
        formattedDate: expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'No date',
        category: "Other",
        icon: getCategoryIcon("default"),
        group: expense.group_id || "Personal",
        youPaid: false,
        youOwe: true,
        settled: false,
        user: {
          name: expense.name || "Unknown",
          avatar: `/placeholder.svg?height=32&width=32&text=${(expense.name || "UN").substring(0, 2).toUpperCase()}`,
          initials: (expense.name || "UN").substring(0, 2).toUpperCase(),
        },
        participants: [],
        notes: expense.description || "",
        status: exp.status
      };
    }) || [];

    const settledExpenses = expenses?.settled?.map(exp => {
      const expense = exp.expense;
      return {
        id: exp.id,
        description: expense.name,
        amount: exp.share_amount,
        date: expense.expense_date,
        formattedDate: expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'No date',
        category: "Other",
        icon: getCategoryIcon("default"),
        group: expense.group_id || "Personal",
        youPaid: expense.payer_id === "",
        youOwe: expense.payer_id !== "",
        settled: true,
        user: {
          name: expense.name || "Unknown",
          avatar: `/placeholder.svg?height=32&width=32&text=${(expense.name || "UN").substring(0, 2).toUpperCase()}`,
          initials: (expense.name || "UN").substring(0, 2).toUpperCase(),
        },
        participants: [],
        notes: expense.description || "",
        status: exp.status
      };
    }) || [];

    // Combine all expenses
    return [...owedExpenses, ...owingExpenses, ...settledExpenses];
  };

  const allExpenses = transformExpenses();

  // Filter and sort expenses
  const filteredExpenses = allExpenses
    .filter((expense) => {
      const matchesSearch =
        expense?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup =
        selectedGroup === "all" || expense?.group === selectedGroup;
      const matchesCategory =
        selectedCategory === "all" || expense?.category === selectedCategory;

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "you-paid" && expense?.youPaid) ||
        (activeTab === "you-owe" && expense?.youOwe);

      return matchesSearch && matchesGroup && matchesCategory && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return sortOrder === "desc"
          ? dateB - dateA
          : dateA - dateB;
      } else if (sortBy === "amount") {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      } else {
        return sortOrder === "desc"
          ? (b.description || "").localeCompare(a.description || "")
          : (a.description || "").localeCompare(b.description || "");
      }
    });

  // Filter expenses for "You Paid" and "You Owe" tabs
  const youPaidExpenses = filteredExpenses.filter((expense) => expense?.youPaid);
  const youOweExpenses = filteredExpenses.filter((expense) => expense?.youOwe);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  // Get unique groups and categories for filters
  const groups = ["all", ...new Set(allExpenses.map((expense) => expense?.group).filter(Boolean))];
  const categories = [
    "all",
    ...new Set(allExpenses.map((expense) => expense?.category).filter(Boolean)),
  ];

  // Check if there are any active filters
  const hasActiveFilters: boolean = Boolean(searchQuery) || selectedGroup !== "all" || selectedCategory !== "all";

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

      <Tabs
        defaultValue="all"
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
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

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          <>
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
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <span>Group: {expense.group}</span>
                                    <span>•</span>
                                    <span>Category: {expense.category}</span>
                                  </div>
                                </div>
                                <p className="font-medium">
                                  {formatNaira(expense.amount)}
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
                                      You are owed
                                    </span>
                                  )}
                                  {expense.settled && (
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded-full">
                                      Settled
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
                <NoExpenseUI
                  hasFilters={hasActiveFilters}
                  message="Add your first expense to get started"
                  showAddButton={true}
                />
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
                        className="hover:shadow-glow transition-all duration-300 cursor-pointer bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md"
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
                                  {formatNaira(expense.amount)}
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
                                    You are owed
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
                <NoExpenseUI
                  hasFilters={hasActiveFilters}
                  message="You aren't owed money for any expenses yet"
                  showAddButton={true}
                />
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
                        className="hover:shadow-glow transition-all duration-300 cursor-pointer bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md"
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
                                  {formatNaira(expense.amount)}
                                </p>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
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
                <NoExpenseUI
                  hasFilters={hasActiveFilters}
                  message="You don't owe anyone money"
                  showAddButton={false}
                />
              )}
            </TabsContent>
          </>
        )}
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
                        alt={selectedExpense.user.name ?? 'User Avatar'}
                      />
                      <AvatarFallback>
                        {selectedExpense.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedExpense.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Paid {formatNaira(selectedExpense.amount)}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">
                    {formatNaira(selectedExpense.amount)}
                  </p>
                </div>
                <div className="border-t border-muted-foreground/20 pt-4">
                  <p className="font-medium">Participants</p>
                  <ul className="list-disc list-inside">
                    {selectedExpense.participants?.map((participant, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {participant.name}: {formatNaira(participant.amount)}
                      </li>
                    )) || <li className="text-sm text-muted-foreground">No participants</li>}
                  </ul>
                </div>
                <div className="border-t border-muted-foreground/20 pt-4">
                  <p className="font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedExpense.notes || "No notes provided"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setSelectedExpense(null)}
              >
                Close
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}