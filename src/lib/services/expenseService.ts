import { CreateExpenseFormData } from "../schema";
import supabase from "../supabase";

export async function createExpense(
  data: CreateExpenseFormData & {
    splits: {
      [userId: string]: {
        share_amount: number;
        percentage?: number;
      };
    };
  }
) {
  try {
    // Start a Supabase transaction
    const { data: expenseData, error: expenseError } = await supabase
      .from("expenses")
      .insert([
        {
          name: data.name,
          description: data.description || "",
          amount: Number(data.amount),
          group_id: data.group_id,
          payer_id: data.payer_id,
          expense_date: data.expense_date.toISOString(),
          split_type: data.split_type,
          is_recurring: data.is_recurring || false,
          recurring_frequency: data.recurring_frequency || null,
          recurring_end_date: data.recurring_end_date
            ? data.recurring_end_date.toISOString()
            : null,
          recurring_count: data.recurring_count || null,
        },
      ])
      .select();

    if (expenseError) {
      throw expenseError;
    }

    if (!expenseData || expenseData.length === 0) {
      throw new Error("Failed to create expense: No data returned");
    }

    const expenseId = expenseData[0].id;

    // Prepare the expense participants data
    const participantsData = Object.entries(data.splits).map(
      ([userId, splitData]) => ({
        expense_id: expenseId,
        user_id: userId,
        share_amount: splitData.share_amount,
        is_settled: userId === data.payer_id,
        settled_at: userId === data.payer_id ? new Date().toISOString() : null,
      })
    );

    // Insert all participants
    const { data: participants, error: participantsError } = await supabase
      .from("expense_participants")
      .insert(participantsData)
      .select();

    if (participantsError) {
      // undo expense creation if participant insertion fails
      // Manual undo needed as Supabase lacks transaction support
      await supabase.from("expenses").delete().eq("id", expenseId);
      throw participantsError;
    }

    // Return the combined data
    return {
      expense: expenseData[0],
      participants: participants,
    };
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
}

// If you need to implement the function to get a single expense with its participants
export async function getExpenseWithParticipants(expenseId: string) {
  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .single();

  if (expenseError) {
    throw expenseError;
  }

  const { data: participants, error: participantsError } = await supabase
    .from("expense_participants")
    .select("*, user:user_id(*)")
    .eq("expense_id", expenseId);

  if (participantsError) {
    throw participantsError;
  }

  return {
    ...expense,
    participants: participants,
  };
}
export async function getUserExpenses(userId: string) {
  try {
    const { data, error } = await supabase
      .from("expense_participants")
      .select(
        `
        *,
        expense:expense_id(*)
      `
      )
      .eq("user_id", userId);

    if (error) throw error;
    console.log(data);
    return (
      data?.sort((a, b) => {
        const dateA = new Date(a.expense.expense_date || new Date());
        const dateB = new Date(b.expense.expense_date || new Date());
        return dateB.getTime() - dateA.getTime();
      }) || []
    );
  } catch (error) {
    console.error("Error fetching user expenses:", error);
    throw error;
  }
}

export async function getGroupExpenses(groupId: string) {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select(
        `
        *,
        participants:expense_participants(*, user:user_id(*))
      `
      )
      .eq("group_id", groupId)
      .order("expense_date", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    throw error;
  }
}
export async function settleExpense(
  expenseId: string,
  userId: string
): Promise<void> {
  try {
    // Update the expense participants to mark them as settled
    const { error } = await supabase
      .from("expense_participants")
      .update({
        is_settled: true,
        settled_at: new Date().toISOString(),
      })
      .eq("expense_id", expenseId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error settling expense:", error);
      throw new Error("Failed to settle the expense. Please try again.");
    }

    console.log(
      `Expense ${expenseId} settled successfully for user ${userId}.`
    );
  } catch (error) {
    console.error("Error in settleExpense function:", error);
    throw error;
  }
}
export async function getExpenseDetails(expenseId: string) {
  try {
    const { data, error } = await supabase.rpc("get_expense_display_data", {
      expense_id_param: expenseId,
    });

    if (error) {
      console.error("Error fetching expense details:", error);
      throw new Error("Failed to fetch expense details. Please try again.");
    }

    return data;
  } catch (error) {
    console.error("Error in getExpenseDetails function:", error);
    throw error;
  }
}
export async function getGroupDetails(groupId: string) {
  try {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (error) {
      console.error("Error fetching group details:", error);
      throw new Error("Failed to fetch group details.");
    }

    return data;
  } catch (error) {
    console.error("Error in getGroupDetails function:", error);
    throw error;
  }
}
export async function getUserDetails(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user details:", error);
      throw new Error("Failed to fetch user details.");
    }

    return data;
  } catch (error) {
    console.error("Error in getUserDetails function:", error);
    throw error;
  }
}
export async function getExpenseParticipants(expenseId: string) {
  try {
    const { data, error } = await supabase
      .from("expense_participants")
      .select("user_id, share_amount,is_settled, profiles(full_name, avatar_url)")
      .eq("expense_id", expenseId);

    if (error) {
      console.error("Error fetching expense participants:", error);
      throw new Error("Failed to fetch expense participants.");
    }

    // Map participants to include user details
    return data.map((participant) => ({
      id: participant.user_id,
      name: participant.profiles?.full_name || "Unknown",
      avatar: participant.profiles?.avatar_url || "/placeholder.svg",
      amount: participant.share_amount,
      is_settled: participant.is_settled || false,
    }));
  } catch (error) {
    console.error("Error in getExpenseParticipants function:", error);
    throw error;
  }
}
