export interface User {
  id: string;
  email: string;
  subscription_status?: 'active' | 'inactive' | 'trial';
  charity_id?: string | null;
  last_login?: string;
  created_at?: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  date: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled';
  subscription_start: string;
  subscription_end: string;
  stripe_subscription_id: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  image_url?: string | null;
  total_contributions: number;
  created_at?: string;
}

export interface Draw {
  id: string;
  type: '5-match' | '4-match' | '3-match' | string;
  draw_date: string;
  status: 'published' | 'not-published' | string;
  result: {
    numbers: number[];
    winners_count: number;
  } | null;
  created_at?: string;
}