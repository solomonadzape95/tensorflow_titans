import { Expense, ExpenseParticipant, Settlement } from "@/types";
import supabase from "../supabase";
// Create an expense
export const createExpense = async (
  expenseData: Expense,
  participants: ExpenseParticipant[]
) => {
  // Start a transaction
  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert([expenseData])
    .select()
    .single();

  if (expenseError) return { error: expenseError };

  // Calculate equal split if no custom splits
  const hasCustomSplits = participants.some(
    (p) => p.share_percentage || p.share_amount
  );

  if (!hasCustomSplits) {
    const equalShare =
      expenseData?.amount && expenseData.amount / participants.length;
    participants = participants.map((p) => ({
      ...p,
      share_amount: equalShare,
      expense_id: expense.id,
    }));
  } else {
    participants = participants.map((p) => ({
      ...p,
      expense_id: expense.id,
    }));
  }

  // Add participants
  const { error: participantsError } = await supabase
    .from("expense_participants")
    .insert(participants);

  return {
    data: expense,
    error: participantsError,
  };
};

// Get expenses for a group
export const getGroupExpenses = async (
  groupId: string,
  topicId = null,
  limit = 50,
  offset = 0
) => {
  let query = supabase
    .from("expenses")
    .select(
      `
      *,
      payer:paid_by (
        id,
        username,
        avatar_url
      ),
      participants:expense_participants (
        user_id,
        share_percentage,
        share_amount,
        settled,
        settled_at,
        users:user_id (
          id,
          username,
          avatar_url
        )
      )
    `
    )
    .eq("group_id", groupId)
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (topicId) {
    query = query.eq("topic_id", topicId);
  }

  const { data, error } = await query;

  return { data, error };
};

// Get a single expense with details
export const getExpenseDetails = async (expenseId: string) => {
  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
      *,
      payer:paid_by (
        id,
        username,
        avatar_url
      ),
      participants:expense_participants (
        id,
        user_id,
        share_percentage,
        share_amount,
        settled,
        settled_at,
        users:user_id (
          id,
          username,
          avatar_url
        )
      )
    `
    )
    .eq("id", expenseId)
    .single();

  return { data, error };
};

// Update an expense
export const updateExpense = async (expenseId: string, updates: Expense) => {
  const { data, error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", expenseId)
    .select()
    .single();

  return { data, error };
};

// Delete an expense
export const deleteExpense = async (expenseId: string) => {
  // First delete participants
  await supabase
    .from("expense_participants")
    .delete()
    .eq("expense_id", expenseId);

  // Then delete the expense
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  return { error };
};

// Mark expense as settled for a user
export const settleExpense = async (
  expenseParticipantId: string,
  settled = true
) => {
  const { data, error } = await supabase
    .from("expense_participants")
    .update({
      settled,
      settled_at: settled ? new Date().toISOString() : null,
    })
    .eq("id", expenseParticipantId)
    .select()
    .single();

  return { data, error };
};

// Record a settlement between users
export const recordSettlement = async (settlementData: Settlement) => {
  const { data, error } = await supabase
    .from("settlements")
    .insert([settlementData])
    .select()
    .single();

  return { data, error };
};

// Get balances for a group
export const getGroupBalances = async (groupId: string) => {
  // The function exists in supabase
  const { data, error } = await supabase.rpc("calculate_group_balances", {
    p_group_id: groupId,
  });

  return { data, error };
};

// Get a user's expenses across all groups
export const getUserExpenses = async (
  userId: string,
  limit = 50,
  offset = 0
) => {
  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
      *,
      groups:group_id (
        name
      ),
      participants:expense_participants!inner (
        share_amount,
        settled
      )
    `
    )
    .eq("participants.user_id", userId)
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, error };
};
