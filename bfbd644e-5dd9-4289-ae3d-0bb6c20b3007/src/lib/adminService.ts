import { apiJson } from './apiClient';

export interface AdminUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: Record<string, unknown>;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const data = await apiJson<{ users: AdminUser[] }>('/admin/users');
  return data.users;
}

export interface AdminWinner {
  id: string;
  draw_id: string;
  user_id: string;
  prize_amount: number;
  verified: boolean;
  proof_url: string | null;
  created_at: string;
  email: string | null;
  payment_status: 'Paid' | 'Pending' | 'Not Applicable';
  admin_notes: string;
}

export async function fetchAdminWinners(): Promise<AdminWinner[]> {
  const data = await apiJson<{ winners: AdminWinner[] }>('/admin/winners');
  return data.winners;
}

export async function updateAdminWinner(
  winnerId: string,
  input: {
    verified?: boolean;
    payment_status?: 'Paid' | 'Pending' | 'Not Applicable';
    admin_notes?: string;
  }
): Promise<void> {
  await apiJson<{ success: boolean }>(`/admin/winners/${winnerId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export interface AdminCharity {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  total_contributions: number | null;
}

export async function fetchAdminCharities(): Promise<AdminCharity[]> {
  const data = await apiJson<{ charities: AdminCharity[] }>('/admin/charities');
  return data.charities;
}

export async function createAdminCharity(input: {
  name: string;
  description: string;
  image_url?: string | null;
}): Promise<AdminCharity> {
  const data = await apiJson<{ charity: AdminCharity }>('/admin/charities', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.charity;
}

export async function updateAdminCharity(
  id: string,
  input: {
    name: string;
    description: string;
    image_url?: string | null;
    total_contributions?: number | null;
  }
): Promise<AdminCharity> {
  const data = await apiJson<{ charity: AdminCharity }>(`/admin/charities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return data.charity;
}

export async function deleteAdminCharity(id: string): Promise<void> {
  await apiJson<{ success: boolean }>(`/admin/charities/${id}`, {
    method: 'DELETE',
  });
}

export interface ReportsResponse {
  summary: {
    totalUsers: number;
    activeSubscriptions: number;
    totalPrizePool: number;
    totalPayout: number;
    totalCharity: number;
  };
  subscriptionBreakdown: {
    monthly: number;
    yearly: number;
    inactive: number;
  };
  drawStats: Array<{
    id: string;
    month: string;
    winners: number;
    prizePool: number;
    status: string;
  }>;
  charityStats: Array<{
    id: string;
    name: string;
    totalContributed: number;
  }>;
}

export async function fetchAdminReports(): Promise<ReportsResponse> {
  return apiJson<ReportsResponse>('/admin/reports');
}
