import { syncPendingScans } from "@/app/utils/offlineSync";
import { getPendingScanCount } from "@/app/utils/scanQueue";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type OfflineContextValue = {
  isOnline: boolean;
  pendingScanCount: number;
  isSyncing: boolean;
  lastSyncMessage: string | null;
  refreshPendingCount: () => Promise<void>;
  syncNow: () => Promise<void>;
  registerOnReconnect: (fn: () => void) => () => void;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

function resolveOnline(state: NetInfoState): boolean {
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return state.isConnected === true;
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingScanCount, setPendingScanCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);
  const wasOffline = useRef(false);
  const reconnectListeners = useRef(new Set<() => void>());
  const syncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingScanCount();
    setPendingScanCount(count);
  }, []);

  const notifyReconnect = useCallback(() => {
    reconnectListeners.current.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn("reconnect listener error", e);
      }
    });
  }, []);

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);
    try {
      const result = await syncPendingScans();
      await refreshPendingCount();
      if (result.synced > 0) {
        setLastSyncMessage(
          `${result.synced} scan(s) synchronise(s)`,
        );
        notifyReconnect();
      } else if (result.failed > 0) {
        setLastSyncMessage(
          result.errors[0] ?? `${result.failed} echec(s) de sync`,
        );
      } else {
        setLastSyncMessage(null);
      }
    } catch (e) {
      console.warn("syncNow failed", e);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [notifyReconnect, refreshPendingCount]);

  const registerOnReconnect = useCallback((fn: () => void) => {
    reconnectListeners.current.add(fn);
    return () => {
      reconnectListeners.current.delete(fn);
    };
  }, []);

  useEffect(() => {
    refreshPendingCount();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = resolveOnline(state);
      setIsOnline(online);

      if (!online) {
        wasOffline.current = true;
        return;
      }

      if (wasOffline.current) {
        wasOffline.current = false;
        void (async () => {
          await syncNow();
          notifyReconnect();
        })();
      }
    });

    return () => unsubscribe();
  }, [notifyReconnect, refreshPendingCount, syncNow]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingScanCount,
        isSyncing,
        lastSyncMessage,
        refreshPendingCount,
        syncNow,
        registerOnReconnect,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) {
    throw new Error("useOffline must be used within OfflineProvider");
  }
  return ctx;
}
