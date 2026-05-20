import { useState } from "react";

const MISSION_ID_PATTERN = /^[A-Z]{3,4}-[A-Z0-9]{6}$/;

export function useQRScanner() {
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState<{
    missionId: string;
    site?: string;
    location?: string;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = ({ data: raw }: { data: string }) => {
    try {
      setScanError(null);
      let parsed: { missionId?: string; site?: string; location?: string };

      try {
        parsed = JSON.parse(raw);
      } catch {
        const trimmed = raw.trim();
        if (MISSION_ID_PATTERN.test(trimmed)) {
          parsed = { missionId: trimmed };
        } else {
          throw new Error("Invalid QR code format");
        }
      }

      if (!parsed.missionId) {
        throw new Error("QR code does not contain a mission ID");
      }

      setData({
        missionId: parsed.missionId,
        site: parsed.site,
        location: parsed.location,
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
