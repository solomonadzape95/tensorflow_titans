import { CreateExpenseFormData } from "../schema";
import supabase from "../supabase";
import { initializeDatabase } from "./offlineExpenses"; // Make sure this is imported

// Define interfaces for better type safety
interface ExpenseParticipant {
  expense_id: string | number;
  user_id: string;
  share_amount: number;
  percentage?: number;
  is_settled: boolean;
  settled_at: string | null;
}

interface ExpenseData {
  id?: string | number;
  name: string;
  description: string;
  amount: number;
  group_id: string;
  payer_id: string;
  expense_date: string;
  split_type: string;
  is_recurring: boolean;
  recurring_frequency: string | null;
  recurring_end_date: string | null;
  recurring_count: number | null;
  created_at?: string;
  participants?: ExpenseParticipant[];
  is_synced?: boolean;
  synced_at?: string;
}

// New utility function to check network status
function isOnline(): boolean {
  return navigator.onLine;
}

// Create an expense - handles both online and offline scenarios
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
    if (isOnline()) {
      // Online - create in Supabase directly
      return await createExpenseOnline(data);
    } else {
      // Offline - store in IndexedDB
      console.log("Creating expense offline in IndexedDB");
      return await addExpenseToIndexedDB(data);
    }
  } catch (error) {
    console.error("Error creating expense:", error);
    // If online creation fails, fallback to IndexedDB
    if (isOnline()) {
      console.log("Online creation failed, falling back to IndexedDB");
      return await addExpenseToIndexedDB(data);
    }
    throw error;
  }
}

// Create expense online directly in Supabase
async function createExpenseOnline(
  data: CreateExpenseFormData & {
    splits: {
      [userId: string]: {
        share_amount: number;
        percentage?: number;
      };
    };
  }
) {
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
      percentage: splitData.percentage || null,
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
    await supabase.from("expenses").delete().eq("id", expenseId);
    throw participantsError;
  }

  // Return the combined data
  return {
    expense: expenseData[0],
    participants: participants,
  };
}

// Add expense to IndexedDB for offline storage
export async function addExpenseToIndexedDB(
  data: CreateExpenseFormData & {
    splits: {
      [userId: string]: {
        share_amount: number;
        percentage?: number;
      };
    };
  }
) {
  const db = await initializeDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["expenses", "expense_participants"],
      "readwrite"
    );

    // Add the expense to the "expenses" object store
    const expenseStore = transaction.objectStore("expenses");
    const expenseRequest = expenseStore.add({
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
      created_at: new Date().toISOString(),
      is_synced: false, // Flag to indicate if the expense has been synced to the server
    });

    expenseRequest.onsuccess = (event) => {
      const expenseId = (event.target as IDBRequest).result;

      // Prepare the expense participants data
      const participantsData = Object.entries(data.splits).map(
        ([userId, splitData]) => ({
          expense_id: expenseId,
          user_id: userId,
          share_amount: splitData.share_amount,
          percentage: splitData.percentage || null,
          is_settled: userId === data.payer_id,
          settled_at:
            userId === data.payer_id ? new Date().toISOString() : null,
        })
      );

      // Add participants to the "expense_participants" object store
      const participantsStore = transaction.objectStore("expense_participants");

      const participantPromises = participantsData.map((participant) => {
        return new Promise<void>((resolveParticipant) => {
          const addRequest = participantsStore.add(participant);
          addRequest.onsuccess = () => resolveParticipant();
        });
      });

      Promise.all(participantPromises).then(() => {
        console.log("Expense and participants added successfully to IndexedDB");

        // Update the group's expense count
        const groupStore = db
          .transaction("groups", "readwrite")
          .objectStore("groups");
        const getGroupRequest = groupStore.get(data.group_id);

        getGroupRequest.onsuccess = () => {
          const group = getGroupRequest.result;

          if (group) {
            group.expenses = (group.expenses || 0) + 1;
            groupStore.put(group);
          }
        };

        resolve({
          expense: {
            id: expenseId,
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
            created_at: new Date().toISOString(),
            is_synced: false,
          },
          participants: participantsData,
        });
      });
    };

    expenseRequest.onerror = (event) => {
      console.error("Failed to add expense:", event);
      reject(event);
    };

    transaction.onerror = (event) => {
      console.error("Failed to add expense or participants:", event);
      reject(event);
    };
  });
}

// Get a single expense with its participants
export async function getExpenseWithParticipants(expenseId: string | number) {
  try {
    if (isOnline()) {
      // Try online first
      return await getExpenseWithParticipantsOnline(expenseId.toString());
    } else {
      // Fallback to offline
      return await getExpenseWithParticipantsOffline(expenseId);
    }
  } catch (error) {
    console.error("Error fetching expense:", error);
    // If online fetch fails, try offline
    if (isOnline()) {
      return await getExpenseWithParticipantsOffline(expenseId);
    }
    throw error;
  }
}

// Get expense with participants from Supabase
async function getExpenseWithParticipantsOnline(expenseId: string) {
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

// Get expense with participants from IndexedDB
async function getExpenseWithParticipantsOffline(expenseId: string | number) {
  const db = await initializeDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["expenses", "expense_participants"],
      "readonly"
    );

    const expenseStore = transaction.objectStore("expenses");
    const expenseRequest = expenseStore.get(expenseId);

    expenseRequest.onsuccess = () => {
      const expense = expenseRequest.result;

      if (!expense) {
        reject(new Error(`Expense ${expenseId} not found`));
        return;
      }

      const participantsStore = transaction.objectStore("expense_participants");
      const participantsRequest = participantsStore.getAll();

      participantsRequest.onsuccess = () => {
        const allParticipants = participantsRequest.result;

        const participants = allParticipants.filter(
          (participant: ExpenseParticipant) =>
            participant.expense_id === expenseId
        );

        resolve({
          ...expense,
          participants,
        });
      };

      participantsRequest.onerror = (event) => {
        console.error("Failed to retrieve participants:", event);
        reject(event);
      };
    };

    expenseRequest.onerror = (event) => {
      console.error(`Failed to retrieve expense ${expenseId}:`, event);
      reject(event);
    };
  });
}

// Get user expenses
export async function getUserExpenses(userId: string) {
  try {
    if (isOnline()) {
      // Online - fetch from Supabase
      return await getUserExpensesOnline(userId);
    } else {
      // Offline - fetch from IndexedDB
      return await getUserExpensesOffline(userId);
    }
  } catch (error) {
    console.error("Error fetching user expenses:", error);
    // If online fetch fails, try offline
    if (isOnline()) {
      return await getUserExpensesOffline(userId);
    }
    throw error;
  }
}

// Get user expenses from Supabase
async function getUserExpensesOnline(userId: string) {
  const { data, error } = await supabase
    .from("expense_participants")
    .select(
      `
      *,
      expense:expense_id(*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Get user expenses from IndexedDB
async function getUserExpensesOffline(userId: string) {
  const db = await initializeDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["expenses", "expense_participants"],
      "readonly"
    );

    const participantsStore = transaction.objectStore("expense_participants");
    const participantsRequest = participantsStore.getAll();

    participantsRequest.onsuccess = () => {
      const allParticipants = participantsRequest.result;
      const userParticipants = allParticipants.filter(
        (participant: ExpenseParticipant) => participant.user_id === userId
      );

      if (userParticipants.length === 0) {
        resolve([]);
        return;
      }

      const expenseStore = transaction.objectStore("expenses");
      const expenseIds = userParticipants.map((p) => p.expense_id);
      const expenses: { expense: ExpenseData; share_amount: number; percentage?: number; is_settled: boolean; settled_at: string | null }[] = [];
      let processed = 0;

      expenseIds.forEach((expenseId) => {
        const expenseRequest = expenseStore.get(expenseId);

        expenseRequest.onsuccess = () => {
          const expense = expenseRequest.result;
          if (expense) {
            const participant = userParticipants.find(
              (p) => p.expense_id === expenseId
            );

            expenses.push({
              ...participant,
              expense: expense,
            });
          }

          processed++;
          if (processed === expenseIds.length) {
            // Sort by created_at in descending order
            expenses.sort((a, b) => {
              const dateA = new Date(a.expense.created_at || new Date());
              const dateB = new Date(b.expense.created_at || new Date());
              return dateB.getTime() - dateA.getTime();
            });
            resolve(expenses);
          }
        };

        expenseRequest.onerror = (event) => {
          console.error(`Failed to retrieve expense ${expenseId}:`, event);
          processed++;
          if (processed === expenseIds.length) {
            resolve(expenses);
          }
        };
      });
    };

    participantsRequest.onerror = (event) => {
      console.error("Failed to retrieve participants:", event);
      reject(event);
    };
  });
}

// Get group expenses
export async function getGroupExpenses(groupId: string) {
  try {
    if (isOnline()) {
      // Online - fetch from Supabase
      return await getGroupExpensesOnline(groupId);
    } else {
      // Offline - fetch from IndexedDB
      return await getGroupExpensesFromIndexedDB(groupId);
    }
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    // If online fetch fails, try offline
    if (isOnline()) {
      return await getGroupExpensesFromIndexedDB(groupId);
    }
    throw error;
  }
}

// Get group expenses from Supabase
async function getGroupExpensesOnline(groupId: string) {
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
}

// Get group expenses from IndexedDB
export async function getGroupExpensesFromIndexedDB(
  groupId: string
): Promise<ExpenseData[]> {
  const db = await initializeDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["expenses", "expense_participants"],
      "readonly"
    );

    const expenseStore = transaction.objectStore("expenses");
    const expenseRequest = expenseStore.getAll();

    expenseRequest.onsuccess = () => {
      const allExpenses = expenseRequest.result;
      const groupExpenses = allExpenses.filter(
        (expense: ExpenseData) => expense.group_id === groupId
      );

      if (groupExpenses.length === 0) {
        resolve([]);
        return;
      }

      const participantsStore = transaction.objectStore("expense_participants");
      const participantsRequest = participantsStore.getAll();

      participantsRequest.onsuccess = () => {
        const participants = participantsRequest.result;

        // Map participants to their respective expenses
        const expensesWithParticipants = groupExpenses.map(
          (expense: ExpenseData) => ({
            ...expense,
            participants: participants.filter(
              (participant: ExpenseParticipant) =>
                participant.expense_id === expense.id
            ),
          })
        );

        // Sort by expense_date in descending order
        expensesWithParticipants.sort((a, b) => {
          const dateA = new Date(a.expense_date);
          const dateB = new Date(b.expense_date);
          return dateB.getTime() - dateA.getTime();
        });

        console.log(
          `Retrieved expenses for group ${groupId} from IndexedDB:`,
          expensesWithParticipants
        );
        resolve(expensesWithParticipants);
      };

      participantsRequest.onerror = (event) => {
        console.error("Failed to retrieve participants:", event);
        reject(event);
      };
    };

    expenseRequest.onerror = (event) => {
      console.error("Failed to retrieve expenses:", event);
      reject(event);
    };
  });
}

// Function to get unsynchronized expenses for syncing to Supabase
export async function getUnsyncedExpenses(): Promise<ExpenseData[]> {
  const db = await initializeDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["expenses", "expense_participants"],
      "readonly"
    );

    const expenseStore = transaction.objectStore("expenses");
    const expenseRequest = expenseStore.getAll();

    expenseRequest.onsuccess = () => {
      const allExpenses = expenseRequest.result;
      const unsyncedExpenses = allExpenses.filter(
        (expense: ExpenseData & { is_synced: boolean }) =>
          expense.is_synced === false
      );

      if (unsyncedExpenses.length === 0) {
        resolve([]);
        return;
      }

      const participantsStore = transaction.objectStore("expense_participants");
      const participantsRequest = participantsStore.getAll();

      participantsRequest.onsuccess = () => {
        const participants = participantsRequest.result;

        // Map participants to their respective expenses
        const expensesWithParticipants = unsyncedExpenses.map(
          (expense: ExpenseData) => ({
            ...expense,
            participants: participants.filter(
              (participant: ExpenseParticipant) =>
                participant.expense_id === expense.id
            ),
          })
        );

        console.log(
          "Retrieved unsynced expenses from IndexedDB:",
          expensesWithParticipants
        );
        resolve(expensesWithParticipants);
      };

      participantsRequest.onerror = (event) => {
        console.error("Failed to retrieve participants:", event);
        reject(event);
      };
    };

    expenseRequest.onerror = (event) => {
      console.error("Failed to retrieve unsynced expenses:", event);
      reject(event);
    };
  });
}

// Function to mark an expense as synced after uploading to Supabase
export async function markExpenseAsSynced(
  localExpenseId: number,
  serverExpenseId?: string
): Promise<void> {
  const db = await initializeDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["expenses", "expense_participants"],
      "readwrite"
    );

    const expenseStore = transaction.objectStore("expenses");
    const getRequest = expenseStore.get(localExpenseId);

    getRequest.onsuccess = () => {
      const expense = getRequest.result;

      if (expense) {
        expense.is_synced = true;
        expense.synced_at = new Date().toISOString();

        // Update with server ID if provided
        if (serverExpenseId) {
          expense.server_id = serverExpenseId;
        }

        const updateRequest = expenseStore.put(expense);

        updateRequest.onsuccess = () => {
          // If we have a server ID, we also need to update all participants
          if (serverExpenseId) {
            const participantsStore = transaction.objectStore(
              "expense_participants"
            );
            const participantsRequest = participantsStore.getAll();

            participantsRequest.onsuccess = () => {
              const allParticipants = participantsRequest.result;
              const expenseParticipants = allParticipants.filter(
                (p: ExpenseParticipant) => p.expense_id === localExpenseId
              );

              // Update each participant with the server expense ID
              const updatePromises = expenseParticipants.map((participant) => {
                return new Promise<void>((resolveUpdate) => {
                  participant.server_expense_id = serverExpenseId;
                  const updateRequest = participantsStore.put(participant);
                  updateRequest.onsuccess = () => resolveUpdate();
                });
              });

              Promise.all(updatePromises).then(() => {
                console.log(
                  `Expense ${localExpenseId} marked as synced with server ID ${serverExpenseId}`
                );
                resolve();
              });
            };
          } else {
            console.log(`Expense ${localExpenseId} marked as synced`);
            resolve();
          }
        };

        updateRequest.onerror = (event) => {
          console.error(
            `Failed to mark expense ${localExpenseId} as synced:`,
            event
          );
          reject(event);
        };
      } else {
        console.error(`Expense ${localExpenseId} not found`);
        reject(new Error(`Expense ${localExpenseId} not found`));
      }
    };

    getRequest.onerror = (event) => {
      console.error(`Failed to retrieve expense ${localExpenseId}:`, event);
      reject(event);
    };
  });
}

// Function to sync all unsynced expenses to Supabase
export async function syncUnsyncedExpenses() {
  try {
    if (!isOnline()) {
      console.log("Cannot sync expenses while offline");
      return { synced: 0, failed: 0 };
    }

    const unsyncedExpenses = await getUnsyncedExpenses();

    if (unsyncedExpenses.length === 0) {
      console.log("No unsynced expenses to sync");
      return { synced: 0, failed: 0 };
    }

    console.log(`Syncing ${unsyncedExpenses.length} unsynced expenses`);

    let syncedCount = 0;
    let failedCount = 0;

    for (const expense of unsyncedExpenses) {
      try {
        // Format data for Supabase
        const expenseData = {
          name: expense.name,
          description: expense.description || "",
          amount: Number(expense.amount),
          group_id: expense.group_id,
          payer_id: expense.payer_id,
          expense_date: expense.expense_date,
          split_type: expense.split_type,
          is_recurring: expense.is_recurring || false,
          recurring_frequency: expense.recurring_frequency || null,
          recurring_end_date: expense.recurring_end_date || null,
          recurring_count: expense.recurring_count || null,
          created_at: expense.created_at || new Date().toISOString(),
        };

        // Insert expense into Supabase
        const { data: createdExpense, error: expenseError } = await supabase
          .from("expenses")
          .insert([expenseData])
          .select();

        if (expenseError) {
          console.error("Error syncing expense:", expenseError);
          failedCount++;
          continue;
        }

        if (!createdExpense || createdExpense.length === 0) {
          console.error("Failed to create expense: No data returned");
          failedCount++;
          continue;
        }

        const serverExpenseId = createdExpense[0].id;

        // Format and insert participants
        if (expense.participants && expense.participants.length > 0) {
          const participantsData = expense.participants.map((p) => ({
            expense_id: serverExpenseId,
            user_id: p.user_id,
            share_amount: p.share_amount,
            percentage: p.percentage || null,
            is_settled: p.is_settled,
            settled_at: p.settled_at,
          }));

          const { error: participantsError } = await supabase
            .from("expense_participants")
            .insert(participantsData);

          if (participantsError) {
            console.error("Error syncing participants:", participantsError);
            // Clean up the expense if participant sync fails
            await supabase.from("expenses").delete().eq("id", serverExpenseId);
            failedCount++;
            continue;
          }
        }

        // Mark expense as synced in IndexedDB
        await markExpenseAsSynced(expense.id as number, serverExpenseId);
        syncedCount++;
      } catch (error) {
        console.error(`Failed to sync expense ${expense.id}:`, error);
        failedCount++;
      }
    }

    console.log(`Synced ${syncedCount} expenses, ${failedCount} failed`);
    return { synced: syncedCount, failed: failedCount };
  } catch (error) {
    console.error("Error in syncUnsyncedExpenses:", error);
    throw error;
  }
}

// Event listener to trigger sync when back online
export function setupSyncEventListeners() {
  window.addEventListener("online", async () => {
    console.log("Back online, syncing expenses...");
    try {
      const result = await syncUnsyncedExpenses();
      console.log(
        `Sync complete: ${result.synced} synced, ${result.failed} failed`
      );
    } catch (error) {
      console.error("Error during automatic sync:", error);
    }
  });
}
