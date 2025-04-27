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
    // Get all expenses where the user is a participant
    const participatedExpenses = await getUserExpenses(userId);

    if (!participatedExpenses) {
      return {
        all: [],
        owed: [],
        owing: [],
        settled: [],
      };
    }

    // Fetch group, payer, and participant details for each expense
    const processedExpenses = await Promise.all(
      participatedExpenses.map(async (expenseParticipation) => {
        const expense = expenseParticipation.expense;

        // Fetch group details
        const groupDetails = expense.group_id
          ? await getGroupDetails(expense.group_id)
          : null;

        // Fetch payer details
        const payerDetails = expense.payer_id
          ? await getUserDetails(expense.payer_id)
          : null;

        // Fetch participants
        const participants = await getExpenseParticipants(expense.id);

        // Determine if the user owes or is owed
        const isOwed =
          expense.payer_id === userId && !expenseParticipation.is_settled;
        const youOwe =
          expense.payer_id !== userId && !expenseParticipation.is_settled;

        return {
          ...expenseParticipation,
          isOwed,
          youOwe,
          status: expenseParticipation.is_settled ? "settled" : "pending",
          group: groupDetails, // Include group details
          payer: payerDetails, // Include payer details
          participants, // Include participants
        };
      })
    );

    const owedExpenses = processedExpenses.filter((e) => e.isOwed);
    const owingExpenses = processedExpenses.filter((e) => e.youOwe);
    const settledExpenses = processedExpenses.filter(
      (e) => e.status === "settled"
    );

    return {
      all: processedExpenses,
      owed: owedExpenses,
      owing: owingExpenses,
      settled: settledExpenses,
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
