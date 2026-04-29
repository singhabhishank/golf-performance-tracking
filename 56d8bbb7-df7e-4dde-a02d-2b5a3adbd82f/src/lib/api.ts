import type { Charity, Draw, Score, Subscription, User } from './types';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`);
  }

  return data as T;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const data = await requestJson<{ user: User | null }>('/api/auth/me');
  return data.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const data = await requestJson<{ user: User }>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return data.user;
}

export async function signUp(email: string, password: string, charityId?: string): Promise<User> {
  const data = await requestJson<{ user: User }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, charityId }),
  });

  return data.user;
}

export async function signOut(): Promise<void> {
  await requestJson<{ success: boolean }>('/api/auth/signout', {
    method: 'POST',
  });
}

export async function fetchScores(): Promise<Score[]> {
  return requestJson<Score[]>('/api/scores');
}

export async function addScore(score: number, date: string): Promise<Score> {
  return requestJson<Score>('/api/scores', {
    method: 'POST',
    body: JSON.stringify({ score, date }),
  });
}

export async function deleteScore(scoreId: string): Promise<void> {
  await requestJson<{ message: string }>('/api/scores', {
    method: 'DELETE',
    body: JSON.stringify({ scoreId }),
  });
}

export async function fetchCharities(): Promise<Charity[]> {
  return requestJson<Charity[]>('/api/charities');
}

export async function selectCharity(charityId: string): Promise<{ success: boolean }> {
  return requestJson<{ success: boolean }>('/api/charities/select', {
    method: 'POST',
    body: JSON.stringify({ charityId }),
  });
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  return requestJson<Subscription[]>('/api/subscriptions');
}

export async function createSubscription(planType: 'monthly' | 'yearly') {
  return requestJson('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ planType }),
  });
}

export async function fetchDraws(): Promise<Draw[]> {
  return requestJson<Draw[]>('/api/draws');
}