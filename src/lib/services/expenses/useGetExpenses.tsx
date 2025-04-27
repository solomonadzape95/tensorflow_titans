import { useQuery } from "@tanstack/react-query";
import {
  getUserExpenses,
  getGroupDetails,
  getExpenseParticipants,
  getUserDetails,
} from "../expenseService";
import { protectPage } from "../authService";
import { useLoaderData } from "react-router";

export async function getAllUserExpenseData(userId: string) {
  try {
    const participatedExpenses = await getUserExpenses(userId);

    if (!participatedExpenses) {
      return {
        all: [],
        owed: [],
        owing: [],
        settled: [],
      };
    }

    const processedExpenses = await Promise.all(
      participatedExpenses.map(async (expenseParticipation) => {
        const expense = expenseParticipation.expense;

        // Fetch additional details
        const groupDetails = expense.group_id
          ? await getGroupDetails(expense.group_id)
          : null;
        const payerDetails = expense.payer_id
          ? await getUserDetails(expense.payer_id)
          : null;
        const participants = await getExpenseParticipants(expense.id);

        // Determine the expense status
        const isPayer = expense.payer_id === userId;
        const isSettled = expenseParticipation.is_settled;

        // Updated logic for expense status:
        // - You are owed: You are the payer and others haven't settled
        // - You owe: Someone else paid and you haven't settled
        // - Settled: Your participation is marked as settled
        const isOwed =
          isPayer && participants.some((p) => p.id !== userId && !p.is_settled);
        const youOwe = !isPayer && !isSettled;

        return {
          ...expenseParticipation,
          expense,
          isOwed,
          youOwe,
          status: isSettled ? "settled" : "pending",
          group: groupDetails,
          payer: payerDetails,
          participants,
        };
      })
    );

    // Updated categorization logic
    const settledExpenses = processedExpenses.filter((e) => e.is_settled);
    const owedExpenses = processedExpenses.filter(
      (e) => !e.is_settled && e.isOwed
    );
    const owingExpenses = processedExpenses.filter(
      (e) => !e.is_settled && e.youOwe
    );

    return {
      all: processedExpenses,
      owed: settledExpenses,
      owing: owingExpenses,
      settled: owedExpenses,
    };
  } catch (error) {
    console.error("Error fetching user expense data:", error);
    throw error;
  }
}
export default function useGetExpenses() {
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof protectPage>>;

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses", loaderData.user.id],
    queryFn: async () => {
      const expenseData = await getAllUserExpenseData(loaderData.user.id);
      return expenseData;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  return {
    expenses: expenses || { all: [], owed: [], owing: [], settled: [] },
    isLoading,
  };
}
