import type { protectPage } from "@/lib/services/authService";
import type { LucideIcon } from "lucide-react";

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
  creator_id: string;
  members: { id: string; name: string; initials: string }[];
  expenses: number;
  balance: number;
  youOwe: boolean;
  settled?: boolean;
  detailedBalances: {
    debtorId: string;
    debtorName: string;
    creditorId: string;
    creditorName: string;
    amount: number;
  }[];
  recentExpenses: {
    id: string;
    description: string | null;
    amount: number;
    created_at: string | null;
    payer: {
      id: string | null;
      name: string | null;
    };
  }[];
};

export type Expense = {
  id: string;
  description: string | null;
  amount: number;
  date: string | null;
  formattedDate: string;
  userOwedAmount?: number;
  category: string;
  icon: LucideIcon;
  group: string;
  youPaid: boolean;
  youOwe: boolean;
  isOwed?: boolean;
  is_settled?: boolean;
  user?: {
    name: string | null;
    avatar_url: string | null;
    initials: string | undefined;
  };
  payer?: {
    name: string | null;
    avatar_url: string;
    initials: string;
  };
  participants: Array<{
    name: string;
    amount: number;
  }>;
  notes: string | null;
  status: string;
};
