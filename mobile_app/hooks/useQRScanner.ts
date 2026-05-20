import { useState } from "react";

const MISSION_ID_PATTERN = /^[A-Z]{3,4}-[A-Z0-9]{6}$/;
const CONTAINER_QR_PATTERN = /^CTR-[A-Z0-9-]+$/i;

export type ScanPayload = {
  missionId?: string;
  qrCode?: string;
  scanType: "container" | "mission";
  site?: string;
  location?: string;
  label?: string;
};

export function useQRScanner() {
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState<ScanPayload | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = ({ data: raw }: { data: string }) => {
    try {
      setScanError(null);
      const trimmed = raw.trim();
      let parsed: Record<string, unknown>;

      try {
        parsed = JSON.parse(trimmed) as Record<string, unknown>;
      } catch {
        if (MISSION_ID_PATTERN.test(trimmed)) {
          parsed = { missionId: trimmed, type: "mission" };
        } else if (CONTAINER_QR_PATTERN.test(trimmed)) {
          parsed = { type: "container", qrCode: trimmed };
        } else {
          parsed = { type: "container", qrCode: trimmed };
        }
      }

      if (parsed.type === "container" || parsed.qrCode) {
        const qrCode = String(parsed.qrCode || parsed.containerQr || trimmed);
        setData({
          qrCode,
          scanType: "container",
          label: qrCode,
        });
        setScanned(true);
        return;
      }

      const missionId = String(parsed.missionId || "");
      if (!missionId) {
        throw new Error("QR code does not contain a mission or container ID");
      }

      setData({
        missionId,
        scanType: "mission",
        site: parsed.site as string | undefined,
        location: parsed.location as string | undefined,
        label: missionId,
      });
      setScanned(true);
    } catch (err) {
      setScanned(false);
      setData(null);
      setScanError(
        err instanceof Error ? err.message : "Could not read QR code",
      );
    }
  };

  const reset = () => {
    setScanned(false);
    setData(null);
    setScanError(null);
  };

  return {
    scanned,
    data,
    scanError,
    handleScan,
    reset,
  };
}
