import { supabase } from './supabase';

export interface DrawRow {
  id: string;
  type: string;
  draw_date: string;
  status: string;
  result: { numbers: number[]; winners_count: number } | null;
  created_at?: string;
}

export async function fetchDraws(): Promise<DrawRow[]> {
  const { data, error } = await supabase
    .from('draws')
    .select('id,type,draw_date,status,result,created_at')
    .order('draw_date', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DrawRow[];
}

export async function fetchNextDraw(): Promise<DrawRow | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('draws')
    .select('id,type,draw_date,status,result,created_at')
    .gte('draw_date', now)
    .order('draw_date', { ascending: true })
    .limit(1);

  if (error) throw new Error(error.message);
  return (data ?? [])[0] ?? null;
}
