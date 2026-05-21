import { useLanguage } from "@/context/LanguageContext";
import { CameraView, PermissionResponse } from "expo-camera";
import { RefreshCcw } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type QRScannerViewProps = {
  permission: PermissionResponse | null;
  requestPermission: () => Promise<PermissionResponse | null>;
  scanned: boolean;
  data: any;
  scanError: string | null;
  handleScan: ({ data }: { data: string }) => void;
  reset: () => void;
  handleAction: () => void;
  confirming?: boolean;
  role: "technician" | "driver";
};

export function QRScannerView({
  permission,
  requestPermission,
  scanned,
  data,
  scanError,
  handleScan,
  reset,
  handleAction,
  confirming = false,
  role,
}: QRScannerViewProps) {
  const { t, isRTL } = useLanguage();

  if (!permission) {
    return (
      <View style={styles.fullCenter}>
        <Text style={styles.statusText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.fullCenter}>
        <Text style={styles.statusText}>
          Camera access is required to scan QR codes.
        </Text>

        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Allow camera access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={
          scanned ? undefined : ({ data }) => handleScan({ data })
        }
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {scanned ? t("qr.scanned") : t("qr.scanning")}
          </Text>
          {scanError ? <Text style={styles.errorText}>{scanError}</Text> : null}
        </View>

        <View style={styles.overlayTop} />

        <View style={styles.overlayMiddle}>
          <View style={styles.sideOverlay} />

          <View style={styles.frame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <View style={styles.sideOverlay} />
        </View>

        <View style={styles.overlayBottom}>
          <Text style={styles.title}>{t("qr.scan")}</Text>
          <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
            {role === "driver" ? t("qr.driverHint") : t("qr.techHint")}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        {scanned && data ? (
          <>
            <Text style={styles.cardTitle}>
              {data.scanType === "container" ? "Conteneur" : "Mission"}
            </Text>
            {data.scanType === "container" ? (
              <Text style={styles.cardText}>QR conteneur: {data.qrCode}</Text>
            ) : (
              <>
                <Text style={styles.cardText}>Mission: {data.missionId}</Text>
                <Text style={styles.cardText}>Site: {data.site || "—"}</Text>
              </>
            )}

            <Pressable
              style={[
                styles.primaryButton,
                role === "driver"
                  ? styles.driverButton
                  : styles.technicianButton,
                confirming && { opacity: 0.6 },
              ]}
              onPress={handleAction}
              disabled={confirming}
            >
              <Text style={styles.primaryButtonText}>
                {confirming
                  ? t("qr.confirming")
                  : role === "driver"
                    ? t("qr.driverAction")
                    : t("qr.techAction")}
              </Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={reset}>
              <RefreshCcw color="white" size={18} />
              <Text style={styles.secondaryButtonText}>{t("qr.scanAnother")}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>{t("qr.ready")}</Text>
            <Text style={styles.cardText}>
              {t("qr.readyHint")}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  fullCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
    backgroundColor: "#020617",
  },

  statusBadge: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.35)",
    alignItems: "center",
  },

  statusText: {
    color: "#e2e8f0",
    fontSize: 14,
    textAlign: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },

  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.56)",
  },

  overlayMiddle: {
    flexDirection: "row",
    height: 260,
  },

  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.56)",
  },

  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.56)",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 28,
  },

  frame: {
    width: 260,
    height: 260,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#3b82f6",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
  },

  card: {
    position: "absolute",
    bottom: 30,
    left: 18,
    right: 18,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  cardTitle: {
    color: "#94a3b8",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  cardText: {
    color: "#f8fafc",
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22,
  },

  primaryButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  driverButton: {
    backgroundColor: "#22c55e",
  },

  technicianButton: {
    backgroundColor: "#3b82f6",
  },

  primaryButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  secondaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  secondaryButtonText: {
    color: "white",
    fontWeight: "700",
  },

  errorText: {
    color: "#fca5a5",
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
  },

  rtlText: {
    textAlign: "right",
  },
});
