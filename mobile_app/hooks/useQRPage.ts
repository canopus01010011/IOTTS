import { scanDelivery } from "@/app/services/delivery.service";
import { useAuth } from "@/hooks/useAuth";
import { useQRScanner } from "@/hooks/useQRScanner";
import { PermissionResponse, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

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
};

export function useQRPage(): QRPageResult {
  const [permission, requestPermission] = useCameraPermissions();
  const { user } = useAuth();
  const router = useRouter();
  const { scanned, data, scanError, handleScan, reset } = useQRScanner();
  const { missionId: routeMissionId } = useLocalSearchParams<{
    missionId?: string;
  }>();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleAction = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    const payload =
      user.role === "driver"
        ? data?.scanType === "container"
          ? { qrCode: data.qrCode }
          : { missionId: data?.missionId || String(routeMissionId || "") }
        : { missionId: data?.missionId || String(routeMissionId || "") };

    if (user.role === "driver" && !payload.qrCode && !payload.missionId) {
      Alert.alert(
        "Entrepôt",
        "Scannez le QR du conteneur (ex. CTR-IOT-001) pour démarrer la livraison.",
      );
      return;
    }

    if (user.role === "technician" && !payload.missionId) {
      Alert.alert("Site", "Scannez le QR de la mission sur le site de livraison.");
      return;
    }

    try {
      setConfirming(true);
      const result = await scanDelivery(payload);
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
  };
}
