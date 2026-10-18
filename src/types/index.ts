export type SubscriptionStatus = "free" | "active" | "canceled" | "past_due";
export type SubscriptionPlan = "monthly" | "yearly" | null;

export interface UserProfile {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan;
  current_period_end: string | null;
  created_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  notes: string | null;
  tags: string[];
  is_agent_config: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export const FREE_PROMPT_LIMIT = 25;
export const PRO_MONTHLY_PRICE = 7;
export const PRO_YEARLY_PRICE = 69;
