import { scanDelivery } from "@/app/services/delivery.service";
import { isNetworkError } from "@/app/utils/networkError";
import {
  getPendingScans,
  removeScan,
  type QueuedScan,
} from "@/app/utils/scanQueue";

export type SyncScanResult = {
  synced: number;
  failed: number;
  errors: string[];
};

function isAlreadyDoneError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("déjà") ||
    lower.includes("deja") ||
    lower.includes("already") ||
    lower.includes("impossible")
  );
}

async function replayScan(item: QueuedScan): Promise<void> {
  try {
    await scanDelivery(item.payload);
    await removeScan(item.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    if (isAlreadyDoneError(msg)) {
      await removeScan(item.id);
      return;
    }
    if (isNetworkError(err)) {
      throw err;
    }
    await removeScan(item.id);
    throw new Error(msg);
  }
}

export async function syncPendingScans(): Promise<SyncScanResult> {
  const pending = await getPendingScans();
  const result: SyncScanResult = { synced: 0, failed: 0, errors: [] };

  for (const item of pending) {
    try {
      await replayScan(item);
      result.synced += 1;
    } catch (err) {
      if (isNetworkError(err)) {
        break;
      }
      result.failed += 1;
      result.errors.push(
        err instanceof Error ? err.message : "Unknown sync error",
      );
    }
  }

  return result;
}
