import { Settlement } from "@/types";
import supabase from "../supabase";

// Create a settlement
export const createSettlement = async (settlementData: Settlement) => {
  const { data, error } = await supabase
    .from("settlements")
    .insert([settlementData])
    .select()
    .single();

  return { data, error };
};

// Get settlements for a group
export const getGroupSettlements = async (
  groupId: string,
  limit = 50,
  offset = 0
) => {
  const { data, error } = await supabase
    .from("settlements")
    .select(
      `
      *,
      payer:payer_id (
        id,
        username,
        avatar_url
      ),
      receiver:receiver_id (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, error };
};

// Get suggested settlements for a group
export const getSuggestedSettlements = async (groupId: string) => {
  // This function is created on supabase
  const { data, error } = await supabase.rpc("calculate_optimal_settlements", {
    p_group_id: groupId,
  });

  return { data, error };
};

// Mark multiple expense participants as settled in a batch
// (This would be used when a settlement covers multiple expenses)
export const batchSettleExpenses = async (expenseParticipantIds: string[]) => {
  const { data, error } = await supabase
    .from("expense_participants")
    .update({
      settled: true,
      settled_at: new Date().toISOString(),
    })
    .in("id", expenseParticipantIds);

  return { data, error };
};
