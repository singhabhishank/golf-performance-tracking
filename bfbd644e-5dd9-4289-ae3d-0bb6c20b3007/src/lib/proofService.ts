import { supabase } from './supabase';

export async function uploadWinnerProof(input: {
  userId: string;
  winnerId: string;
  file: File;
}): Promise<string> {
  const ext = input.file.name.split('.').pop() || 'png';
  const path = `${input.userId}/${input.winnerId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('winner-proofs')
    .upload(path, input.file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from('winner-proofs').getPublicUrl(path);
  const publicUrl = data.publicUrl;

  const { error: updateError } = await supabase
    .from('winners')
    .update({ proof_url: publicUrl })
    .eq('id', input.winnerId)
    .eq('user_id', input.userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return publicUrl;
}
