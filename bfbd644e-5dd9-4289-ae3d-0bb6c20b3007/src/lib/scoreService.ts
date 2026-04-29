import { supabase } from './supabase';
import { apiJson } from './apiClient';

export interface UserScore {
  id: string;
  user_id: string;
  score: number;
  date: string;
  created_at: string;
}

export async function fetchUserScores(userId: string): Promise<UserScore[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UserScore[];
}

export async function saveUserScore(
  userId: string,
  scoreValue: number,
  scoreDate: string,
  editingId?: string | null
): Promise<void> {
  async function ensureUserRow(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // First preference: backend service-role endpoint.
    try {
      await apiJson<{ ensured: boolean }>('/auth/ensure-user-record', {
        method: 'POST',
        body: JSON.stringify({ userId, email: user?.email ?? null }),
      });
      return;
    } catch {
      // fallback to direct DB attempts below
    }

    // Client-side fallback for local/dev environments where API server is unavailable.
    const rows = [
      { id: userId, email: user?.email ?? null, subscription_status: 'inactive' },
      {
        id: userId,
        email: user?.email ?? null,
        subscription_status: 'inactive',
        password_hash: 'SUPABASE_AUTH_MANAGED',
      },
      { id: userId, email: user?.email ?? null },
      { id: userId },
    ];

    for (const row of rows) {
      // eslint-disable-next-line no-await-in-loop
      const { error } = await supabase.from('users').upsert(row as never);
      if (!error) return;
    }
  }

  try {
    await ensureUserRow();
  } catch {
    // Keep going; insert path below still reports explicit errors.
  }

  if (editingId) {
    const { error } = await supabase
      .from('scores')
      .update({ score: scoreValue, date: scoreDate })
      .eq('id', editingId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const { data: sameDateRows, error: sameDateError } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', userId)
    .eq('date', scoreDate)
    .limit(1);

  if (sameDateError) {
    throw new Error(sameDateError.message);
  }
  if ((sameDateRows ?? []).length > 0) {
    throw new Error('A score already exists for this date');
  }

  let { error: insertError } = await supabase.from('scores').insert({
    user_id: userId,
    score: scoreValue,
    date: scoreDate,
  });

  if (insertError?.message?.includes('scores_user_id_fkey')) {
    await ensureUserRow().catch(() => null);
    const retry = await supabase.from('scores').insert({
      user_id: userId,
      score: scoreValue,
      date: scoreDate,
    });
    insertError = retry.error;
  }

  if (insertError) throw new Error(insertError.message);

  const scores = await fetchUserScores(userId);
  if (scores.length <= 5) {
    return;
  }

  const staleScoreIds = scores.slice(5).map((score) => score.id);
  if (staleScoreIds.length === 0) {
    return;
  }

  const { error: deleteError } = await supabase
    .from('scores')
    .delete()
    .eq('user_id', userId)
    .in('id', staleScoreIds);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}

export async function deleteUserScore(
  userId: string,
  scoreId: string
): Promise<void> {
  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', scoreId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
