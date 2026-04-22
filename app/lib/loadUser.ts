import { useUserStore } from '@/app/store/useUserStore';

export async function loadUser() {
  try {
    const res = await fetch('/api/discogs?identity=true');

    if (res.status === 401) {
      useUserStore.getState().setUser(null);
      return;
    }

    if (!res.ok) return;

    const data = await res.json();
    useUserStore.getState().setUser(data);
  } catch {
    useUserStore.getState().setUser(null);
  }
}
