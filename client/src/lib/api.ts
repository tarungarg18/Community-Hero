import type { AICategorization, AIInsights } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
  retriesLeft = 1,
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const body = await response.json().catch(() => ({ error: 'Request failed' }));

    if (!response.ok) {
      throw new Error((body as { error?: string }).error ?? 'Request failed');
    }

    return body as T;
  } catch (err) {
    if (retriesLeft > 0) {
      return apiFetch<T>(path, token, options, retriesLeft - 1);
    }
    throw err;
  }
}

export async function analyzeWithAI(
  token: string,
  description: string,
  title?: string,
  imageBase64?: string,
  mimeType?: string,
): Promise<AICategorization> {
  return apiFetch<AICategorization>('/api/ai/categorize', token, {
    method: 'POST',
    body: JSON.stringify({ description, title, imageBase64, mimeType }),
  });
}

export async function fetchInsights(token: string): Promise<AIInsights> {
  return apiFetch<AIInsights>('/api/ai/insights', token, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
