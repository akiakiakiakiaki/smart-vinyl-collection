import { ApiErrorResponse } from '@/types/api';

export async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = await res.json();

  if (!res.ok) {
    const errorData = data as Partial<ApiErrorResponse>;
    throw new Error(errorData.error || 'Unknown error');
  }

  return data as T;
}
