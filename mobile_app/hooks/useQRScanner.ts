import { useState } from "react";

export function useQRScanner() {
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleScan = ({ data }: { data: string }) => {
    try {
      const parsed = JSON.parse(data);

      if (!parsed.missionId) {
        throw new Error("Invalid QR");
      }

      setData(parsed);
      setScanned(true);
    } catch (err) {
      console.log("Invalid QR:", err);
      setScanned(false);
    }
  };

  const reset = () => {
    setScanned(false);
    setData(null);
  };

  return {
    scanned,
    data,
    handleScan,
    reset,
  };
}