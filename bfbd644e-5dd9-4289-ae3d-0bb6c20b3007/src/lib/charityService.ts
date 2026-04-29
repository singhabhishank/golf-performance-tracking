import { supabase } from './supabase';

export interface CharityRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  total_contributions: number | null;
  created_at?: string;
}

export async function fetchCharities(): Promise<CharityRow[]> {
  const { data, error } = await supabase
    .from('charities')
    .select('id,name,description,image_url,total_contributions,created_at')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CharityRow[];
}

export async function setUserCharitySelection(input: {
  charityId: string;
  contributionPercent: number;
}): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: {
      charity_id: input.charityId,
      charity_percent: input.contributionPercent,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}
