export async function fetchWithAuth(input: RequestInfo, init?: RequestInit, options?: { redirectOn401?: boolean }) {
  const res = await fetch(input, init);

  if (res.status === 401) {
    if (options?.redirectOn401) {
      window.location.href = '/';
    }

    return res;
  }

  return res;
}
