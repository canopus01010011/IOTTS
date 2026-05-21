import AsyncStorage from "@react-native-async-storage/async-storage";

export type CacheEnvelope<T> = {
  data: T;
  savedAt: string;
};

export async function readCache<T>(key: string): Promise<CacheEnvelope<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEnvelope<T>;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, data: T): Promise<void> {
  const envelope: CacheEnvelope<T> = {
    data,
    savedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(key, JSON.stringify(envelope));
}

export async function removeCache(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
