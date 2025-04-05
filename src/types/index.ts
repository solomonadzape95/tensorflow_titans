export interface UserData {
  id?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  phone_number?: string;
  dark?: boolean;
  notifications?: boolean;
  sms_alerts?: boolean;
  email_alerts?: boolean;
}
export interface Group {
  id: string;
  name?: string;
  created_at?: string;
  created_by?: string;
}
export interface Topic {
  name?: string;
  id?: string;
  group_id?: string;
  created_at?: string;
  created_by?: string;
}
export interface Expense {
  id?: string;
  name?: string;
  amount?: number;
  currency?: string;
  paid_by?: string;
  created_at?: string;
  group_id?: string;
  topic_id?: string;
  notes?: string;
  recurring?: boolean;
  recurring_interval?: string;
  date: Date;
}
export interface ExpenseParticipant {
  id?: string;
  user_id?: string;
  expense_id?: string;
  share_percentage?: number;
  share_amount?: number;
  settled?: boolean;
  settled_at?: string;
}
export interface Settlement {
  id?: string;
  payer_id: string;
  receiver_id: string;
  amount: number;
  currency: string;
  created_at: string;
  group_id: string;
  expense_id: string;
}
