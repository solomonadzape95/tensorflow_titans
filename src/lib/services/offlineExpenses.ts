import { Group } from "@/types";
import { CreateExpenseFormData } from "../schema";
type ExpenseData = {
  id: number;
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
  participants: {
    expense_id: number;
    user_id: string;
    share_amount: number;
    is_settled: boolean;
    settled_at: string | null;
  }[];
};
export async function initializeDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("Splitwise Database", 1);

    request.onerror = (event: Event) => {
      const target = event.target as IDBOpenDBRequest;
      console.error("Please allow us to create our DB", target.error);
      reject(target.error);
    };

    request.onsuccess = (event: Event) => {
      const target = event.target as IDBOpenDBRequest;
      if (target) {
        const db = target.result;
        console.log("Database initialized:", db);
        resolve(db);
      }
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const target = event.target as IDBOpenDBRequest;
      if (target) {
        const db = target.result;
        console.log("Upgrading database...");

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains("expenses")) {
          db.createObjectStore("expenses", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
        if (!db.objectStoreNames.contains("groups")) {
          db.createObjectStore("groups", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
        if (!db.objectStoreNames.contains("group_members")) {
          db.createObjectStore("group_members", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
        if (!db.objectStoreNames.contains("expense_participants")) {
          db.createObjectStore("expense_participants", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      }
    };
  });
}

// Function to add group data and its members to the database
export async function addGroupData(
  group: Group & {
    group_members: {
      user_id: string;
      name: string;
      email: string;
      initials: string;
    }[];
  }
) {
  const db = await initializeDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["groups", "group_members"],
      "readwrite"
    );

    // Add the group to the "groups" object store
    const groupStore = transaction.objectStore("groups");
    const groupRequest = groupStore.add({
      id: group.id,
      name: group.name,
      description: group.description,
      expenses: group.expenses,
      balance: group.balance,
      youOwe: group.youOwe,
      settled: group.settled,
    });

    groupRequest.onsuccess = (event) => {
      const groupId = (event.target as IDBRequest).result;

      // Add members to the "group_members" object store, referencing the group ID
      const membersStore = transaction.objectStore("group_members");
      group.group_members.forEach((member) => {
        membersStore.add({ ...member, groupId });
      });

      console.log("Group and members added successfully:", group);
      resolve(groupId);
    };

    groupRequest.onerror = (event) => {
      console.error("Failed to add group data:", event);
      reject(event);
    };

    transaction.onerror = (event) => {
      console.error("Transaction failed:", event);
      reject(event);
    };
  });
}

// Function to retrieve all group data along with their members
export async function getAllGroupsWithMembers(): Promise<
  (Group & {
    group_members: {
      user_id: string;
      name: string;
      email: string;
      initials: string;
    }[];
  })[]
> {
  const db = await initializeDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["groups", "group_members"], "readonly");

    const groupStore = transaction.objectStore("groups");
    const groupRequest = groupStore.getAll();

    groupRequest.onsuccess = async () => {
      const groups = groupRequest.result;

      const membersStore = transaction.objectStore("group_members");
      const membersRequest = membersStore.getAll();

      membersRequest.onsuccess = () => {
        const members = membersRequest.result;

        // Map members to their respective groups
        const groupsWithMembers = groups.map(
          (
            group: Group & {
              group_members: {
                user_id: string;
                name: string;
                email: string;
                initials: string;
              }[];
            }
          ) => ({
            ...group,
            group_members: members.filter(
              (member: { groupId: string }) => member.groupId === group.id
            ),
          })
        );

        console.log("Retrieved groups with members:", groupsWithMembers);
        resolve(groupsWithMembers);
      };

      membersRequest.onerror = (event) => {
        console.error("Failed to retrieve group members:", event);
        reject(event);
      };
    };

    groupRequest.onerror = (event) => {
      console.error("Failed to retrieve groups:", event);
      reject(event);
    };
  });
}

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
    });

    expenseRequest.onsuccess = (event) => {
      const expenseId = (event.target as IDBRequest).result;

      // Prepare the expense participants data
      const participantsData = Object.entries(data.splits).map(
        ([userId, splitData]) => ({
          expense_id: expenseId,
          user_id: userId,
          share_amount: splitData.share_amount,
          is_settled: userId === data.payer_id,
          settled_at:
            userId === data.payer_id ? new Date().toISOString() : null,
        })
      );

      // Add participants to the "expense_participants" object store
      const participantsStore = transaction.objectStore("expense_participants");
      participantsData.forEach((participant) => {
        participantsStore.add(participant);
      });

      transaction.oncomplete = () => {
        console.log("Expense and participants added successfully to IndexedDB");
        resolve({ expenseId, participants: participantsData });
      };

      transaction.onerror = (event) => {
        console.error("Failed to add expense or participants:", event);
        reject(event);
      };
    };

    expenseRequest.onerror = (event) => {
      console.error("Failed to add expense:", event);
      reject(event);
    };
  });
}

export async function getExpensesFromIndexedDB(): Promise<ExpenseData[]> {
  const db = await initializeDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["expenses", "expense_participants"],
      "readonly"
    );

    const expenseStore = transaction.objectStore("expenses");
    const expenseRequest = expenseStore.getAll();

    expenseRequest.onsuccess = () => {
      const expenses = expenseRequest.result;

      const participantsStore = transaction.objectStore("expense_participants");
      const participantsRequest = participantsStore.getAll();

      participantsRequest.onsuccess = () => {
        const participants = participantsRequest.result;

        // Map participants to their respective expenses
        const expensesWithParticipants = expenses.map(
          (expense: ExpenseData) => ({
            ...expense,
            participants: participants.filter(
              (participant: {
                expense_id: number;
                user_id: string;
                share_amount: number;
                is_settled: boolean;
                settled_at: string | null;
              }) => participant.expense_id === expense.id
            ),
          })
        );

        console.log(
          "Retrieved expenses with participants from IndexedDB:",
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
