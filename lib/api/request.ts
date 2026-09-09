import { ApiErrorResponse } from '@/types/api';

export async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = await res.json();

  if (!res.ok) {
    const errorData = data as Partial<ApiErrorResponse>;
    const error = new Error(errorData.error || 'Unknown error') as Error & { status?: number; data?: unknown };
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}
