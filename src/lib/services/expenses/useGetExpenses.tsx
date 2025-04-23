import type { protectPage } from "@/lib/services/authService";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";
import { getUserExpenses } from "../expenseService";

export async function getAllUserExpenseData(userId: string) {
    try {
        // Get all expenses where the user is a participant
        const participatedExpenses = await getUserExpenses(userId);

        if (!participatedExpenses) return {
            all: [],
            owed: [],
            owing: [],
            settled: []
        };
        const processedExpenses = participatedExpenses.map(expenseParticipation => {
            const expense = expenseParticipation.expense;
            const isOwed = expense.payer_id === userId && !expenseParticipation.is_settled;
            return {
                ...expenseParticipation,
                isOwed,
                status: expenseParticipation.is_settled ? "settled" : "pending"
            };
        });
        const owedExpenses = processedExpenses.filter(e => e.isOwed);
        const owingExpenses = processedExpenses.filter(e => !e.isOwed && !e.is_settled);
        const settledExpenses = processedExpenses.filter(e => e.is_settled);

        return {
            all: processedExpenses,
            owed: owedExpenses,
            owing: owingExpenses,
            settled: settledExpenses
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
        isLoading
    };
}