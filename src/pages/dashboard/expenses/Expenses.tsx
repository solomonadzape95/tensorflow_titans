import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus } from "lucide-react";
import { Link } from "react-router";
import useGetExpenses from "@/lib/services/expenses/useGetExpenses";
import { formatNaira } from "@/lib/utils";
import NoExpenseUI from "@/components/dashboard/NoExpense";
import ExpenseModal from "@/components/dashboard/ExpenseModal";
import { useState } from "react";
import { Expense } from "@/types";

export default function ExpensesOverview() {
  const { expenses, isLoading } = useGetExpenses();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  console.log(expenses);
  interface RawExpensePayer {
    id?: string;
    full_name: string;
    name?: string | null;
    avatar_url: string | null;
    initials?: string;
    email: string;
  }

  interface RawExpenseGroup {
    name: string;
  }

  interface RawExpenseDetails {
    name: string | null;
    expense_date: string | null;
    description?: string | null;
    amount: number;
  }

  interface ExpenseParticipant {
    id: string;
    name?: string;
    full_name?: string;
    avatar_url?: string;
    avatar?: string;
    // email: string;
    amount: number;
  }

  interface RawExpenseData {
    id: string;
    expense: RawExpenseDetails;
    share_amount: number;
    payer?: RawExpensePayer | null;
    group?: RawExpenseGroup | null;
    isOwed: boolean;
    youOwe: boolean;
    status: string;
    participants?: ExpenseParticipant[];
  }

  function transformExpenses(
    expenseList: RawExpenseData[] | undefined
  ): Expense[] {
    return (
      expenseList?.map((exp) => {
        const expense = exp.expense;
        const payer = exp.payer || {
          full_name: "Unknown",
          avatar_url: "",
          email: "",
        };

        return {
          id: exp.id,
          description: expense.name,
          amount: expense.amount, // Use the total expense amount
          date: expense.expense_date,
          formattedDate: expense.expense_date
            ? new Date(expense.expense_date).toLocaleDateString()
            : "No date",
          category: "Other",
          icon: DollarSign,
          group: exp?.group?.name || "Personal",
          youPaid: exp.isOwed,
          youOwe: exp.youOwe,
          settled: exp.status === "settled",
          user: {
            name: payer.name ?? payer.full_name ?? null,
            avatar_url: payer.avatar_url,
            initials: payer.initials ?? undefined,
          },
          payer: {
            name: payer.full_name ?? null,
            avatar_url: payer.avatar_url || "/placeholder.svg",
            initials: payer.initials || payer.full_name?.charAt(0) || "?",
          },
          participants: (exp.participants || []).map((p) => ({
            name: p.name || p.full_name || "Unknown",
            amount: p.amount,
          })),
          notes: expense.description || "",
          status: exp.status,
          userOwedAmount: exp.youOwe ? exp.share_amount : 0, // Add the amount the user owes
        };
      }) || []
    );
  }

  const allExpenses = transformExpenses(expenses?.all);
  const youreOwedExpenses = transformExpenses(expenses?.owed);
  const youOweExpenses = transformExpenses(expenses?.owing);
  const settledExpenses = transformExpenses(expenses?.settled);

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
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="youre-owed">You're Owed</TabsTrigger>
          <TabsTrigger value="you-owe">You Owe</TabsTrigger>
          <TabsTrigger value="settled">Settled</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          <>
            {/* All Expenses Tab */}
            <TabsContent value="all" className="space-y-4 animate-in">
              {allExpenses.length > 0 ? (
                allExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onClick={() => setSelectedExpense(expense)}
                  />
                ))
              ) : (
                <NoExpenseUI message="No expenses to display." />
              )}
            </TabsContent>

            {/* You're Owed Tab */}
            <TabsContent value="youre-owed" className="space-y-4 animate-in">
              {youreOwedExpenses.length > 0 ? (
                youreOwedExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onClick={() => setSelectedExpense(expense)}
                  />
                ))
              ) : (
                <NoExpenseUI message="No one owes you any expenses." />
              )}
            </TabsContent>

            {/* You Owe Tab */}
            <TabsContent value="you-owe" className="space-y-4 animate-in">
              {youOweExpenses.length > 0 ? (
                youOweExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onClick={() => setSelectedExpense(expense)}
                  />
                ))
              ) : (
                <NoExpenseUI message="You don't owe anyone any expenses." />
              )}
            </TabsContent>

            {/* Settled Tab */}
            <TabsContent value="settled" className="space-y-4 animate-in">
              {settledExpenses.length > 0 ? (
                settledExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onClick={() => setSelectedExpense(expense)}
                  />
                ))
              ) : (
                <NoExpenseUI message="No settled expenses to display." />
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Expense Modal */}
      <ExpenseModal
        expense={selectedExpense}
        open={!!selectedExpense}
        onOpenChange={(open) => !open && setSelectedExpense(null)}
      />
    </div>
  );
}

function ExpenseCard({
  expense,
  onClick,
}: {
  expense: Expense;
  onClick: () => void;
}) {
  const Icon = expense.icon;

  return (
    <Card
      key={expense.id}
      className="py-1 hover:shadow-glow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="px-4 py-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1 gap-3">
            <div className="flex items-center justify-between text-sm gap-2">
              <div>
                <p className="font-medium text-xl">{expense.description}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Group: {expense.group}</span>
                  <span>•</span>
                  <span>Payer: {expense?.payer?.name}</span>
                </div>
              </div>
              <p className="font-medium">{formatNaira(expense.amount)}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {/* Show status badges */}
                {expense?.is_settled ? (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    Settled
                  </span>
                ) : expense.youOwe ? (
                  <span className="text-xs font-medium text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                    You owe {formatNaira(expense?.userOwedAmount || 0)}
                  </span>
                ) : expense.youPaid ? (
                  <span className="text-xs font-medium text-green-500 bg-green-100 px-2 py-0.5 rounded-full">
                    Others owe you
                  </span>
                ) : null}
              </div>
              <span>{expense.formattedDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
