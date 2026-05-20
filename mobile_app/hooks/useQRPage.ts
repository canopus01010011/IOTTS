import { scanDelivery } from "@/app/services/delivery.service";
import { useAuth } from "@/hooks/useAuth";
import { useQRScanner } from "@/hooks/useQRScanner";
import { PermissionResponse, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams } from "expo-router";
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
    const missionId = data?.missionId || routeMissionId;

    if (!missionId || !user) {
      Alert.alert("Error", "Scan a valid mission QR code first.");
      return;
    }

    try {
      setConfirming(true);
      const result = await scanDelivery(String(missionId));
      Alert.alert("Success", result.message);
      reset();
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Delivery confirmation failed",
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
