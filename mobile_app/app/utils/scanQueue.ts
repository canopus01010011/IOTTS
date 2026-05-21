import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "offline_scan_queue_v1";

export type QueuedScan = {
  id: string;
  payload: { missionId?: string; qrCode?: string };
  role: "driver" | "technician";
  createdAt: string;
};

async function readQueue(): Promise<QueuedScan[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedScan[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: QueuedScan[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function getPendingScans(): Promise<QueuedScan[]> {
  return readQueue();
}

export async function getPendingScanCount(): Promise<number> {
  const q = await readQueue();
  return q.length;
}

export async function enqueueScan(
  payload: { missionId?: string; qrCode?: string },
  role: "driver" | "technician",
): Promise<QueuedScan> {
  const item: QueuedScan = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    payload,
    role,
    createdAt: new Date().toISOString(),
  };
  const queue = await readQueue();
  queue.push(item);
  await writeQueue(queue);
  return item;
}

export async function removeScan(id: string): Promise<void> {
  const queue = await readQueue();
  await writeQueue(queue.filter((s) => s.id !== id));
}

export async function clearScanQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
