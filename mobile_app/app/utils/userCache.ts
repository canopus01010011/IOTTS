import { readCache, writeCache, removeCache } from "@/app/utils/storageCache";

const USER_KEY = "cache_user_v1";

export type CachedUser = {
  id: string;
  full_name: string;
  role: string;
  phone?: string;
  email?: string;
};

export async function getCachedUser(): Promise<CachedUser | null> {
  const envelope = await readCache<CachedUser>(USER_KEY);
  return envelope?.data ?? null;
}

export async function setCachedUser(user: CachedUser): Promise<void> {
  await writeCache(USER_KEY, user);
}

export async function clearCachedUser(): Promise<void> {
  await removeCache(USER_KEY);
}
