import type { protectPage } from "@/lib/services/authService";

export type UserData = Awaited<ReturnType<typeof protectPage>>;
export type GroupData = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  expenseCount: number;
  balance: {
    amount: number;
    isOwed: boolean;
  };
};
export type Group = {
  id: string;
  name: string;
  description: string;
  members: { id: string ; name: string; initials: string }[];
  expenses: number;
  balance: number;
  youOwe: boolean;
  settled?: boolean;
 
};
