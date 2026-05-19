import { useAuth } from "@/hooks/useAuth";
import { useQRScanner } from "@/hooks/useQRScanner";
import { PermissionResponse, useCameraPermissions } from "expo-camera";
import { useEffect } from "react";
import { Alert } from "react-native";

type QRPageResult = {
  permission: PermissionResponse | null;
  requestPermission: () => Promise<PermissionResponse | null>;
  scanned: boolean;
  data: any;
  scanError: string | null;
  handleScan: ({ data }: { data: string }) => void;
  reset: () => void;
  handleAction: () => void;
  role: "technician" | "driver";
};

export function useQRPage(): QRPageResult {
  const [permission, requestPermission] = useCameraPermissions();
  const { user } = useAuth();
  const { scanned, data, scanError, handleScan, reset } = useQRScanner();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleAction = () => {
    if (!data || !user) {
      return;
    }

    const message =
      user.role === "driver" ? "Delivery Started 🚚" : "Package Received 📦";

    Alert.alert("Success", message);
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
    role: user?.role || "technician",
  };
}
