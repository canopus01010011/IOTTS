import { notifyMissionRefresh } from "@/app/utils/missionRefresh";
import { scanDelivery } from "@/app/services/delivery.service";
import { isNetworkError } from "@/app/utils/networkError";
import { patchCachedMissionStatus } from "@/app/utils/missionsCache";
import { enqueueScan } from "@/app/utils/scanQueue";
import { useOffline } from "@/context/OfflineContext";
import { useAuth } from "@/hooks/useAuth";
import { useQRScanner } from "@/hooks/useQRScanner";
import { PermissionResponse, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useLanguage } from "@/context/LanguageContext";

type QRPageResult = {
  permission: PermissionResponse | null;
  requestPermission: () => Promise<PermissionResponse | null>;
  scanned: boolean;
  data: ReturnType<typeof useQRScanner>["data"];
  scanError: string | null;
  handleScan: ({ data }: { data: string }) => void;
  reset: () => void;
  handleAction: () => Promise<void>;
  confirming: boolean;
  role: "technician" | "driver";
  queuedOffline: boolean;
};

export function useQRPage(): QRPageResult {
  const [permission, requestPermission] = useCameraPermissions();
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const { scanned, data, scanError, handleScan, reset } = useQRScanner();
  const { missionId: routeMissionId } = useLocalSearchParams<{
    missionId?: string;
  }>();
  const [confirming, setConfirming] = useState(false);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const { isOnline, refreshPendingCount } = useOffline();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const buildPayload = () => {
    if (!user) return null;
    if (user.role === "driver") {
      if (data?.scanType === "mission") {
        return { missionId: data.missionId };
      }
      if (data?.scanType === "container") {
        return { qrCode: data.qrCode };
      }
      return { missionId: data?.missionId || String(routeMissionId || "") };
    }
    return { missionId: data?.missionId || String(routeMissionId || "") };
  };

  const handleAction = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    if (user.role === "driver" && !payload.qrCode && !payload.missionId) {
      Alert.alert(
        "Entrepôt Oued Smar",
        "Scannez le QR de votre mission (MIS-…) pour démarrer la simulation depuis le point de départ.",
      );
      return;
    }

    if (user.role === "technician" && !payload.missionId) {
      Alert.alert("Site", "Scannez le QR de la mission sur le site de livraison.");
      return;
    }

    try {
      setConfirming(true);
      setQueuedOffline(false);

      if (!isOnline) {
        await enqueueScan(payload, user.role);
        await refreshPendingCount();

        const missionId = payload.missionId;
        if (missionId) {
          if (user.role === "driver") {
            await patchCachedMissionStatus(missionId, "in-progress");
          } else {
            await patchCachedMissionStatus(missionId, "completed");
          }
        }

        setQueuedOffline(true);
        Alert.alert("Offline", t("qr.queued"), [
          { text: "OK", onPress: () => reset() },
        ]);
        return;
      }

      const result = await scanDelivery(payload);
      notifyMissionRefresh();
      Alert.alert("Success", result.message, [
        {
          text: "Voir la carte",
          onPress: () => {
            reset();
            if (result.missionId) {
              router.push({
                pathname: "/(Tabs)/Map",
                params: { missionId: result.missionId },
              });
            } else {
              router.push("/(Tabs)/Map");
            }
          },
        },
        { text: "OK", onPress: () => reset() },
      ]);
    } catch (err) {
      if (isNetworkError(err)) {
        try {
          const payload = buildPayload();
          if (payload && user) {
            await enqueueScan(payload, user.role);
            await refreshPendingCount();
            const missionId = payload.missionId;
            if (missionId && user.role === "driver") {
              await patchCachedMissionStatus(missionId, "in-progress");
            } else if (missionId && user.role === "technician") {
              await patchCachedMissionStatus(missionId, "completed");
            }
            setQueuedOffline(true);
            Alert.alert("Offline", t("qr.queued"), [
              { text: "OK", onPress: () => reset() },
            ]);
            return;
          }
        } catch (queueErr) {
          console.warn("queue scan failed", queueErr);
        }
      }

      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Scan failed",
      );
    } finally {
      setConfirming(false);
    }
  };

  return {
    permission,
    requestPermission,
    scanned,
    data,
    scanError,
    handleScan,
    reset,
    handleAction,
    confirming,
    role: user?.role || "technician",
    queuedOffline,
  };
}
