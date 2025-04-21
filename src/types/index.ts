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
