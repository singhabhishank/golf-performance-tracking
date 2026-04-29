import { supabase } from './supabase';

export interface WinnerRow {
  id: string;
  draw_id: string;
  user_id: string;
  prize_amount: number;
  verified: boolean;
  proof_url: string | null;
  created_at: string;
}

export async function fetchUserWinners(userId: string): Promise<WinnerRow[]> {
  const { data, error } = await supabase
    .from('winners')
    .select('id,draw_id,user_id,prize_amount,verified,proof_url,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as WinnerRow[];
}

export function sumWinnings(winners: WinnerRow[]): number {
  return winners.reduce((acc, row) => acc + (Number(row.prize_amount) || 0), 0);
}
