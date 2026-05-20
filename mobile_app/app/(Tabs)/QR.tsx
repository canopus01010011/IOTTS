import { QRScannerView } from "@/components/UI/QRScannerView";
import { useQRPage } from "@/hooks/useQRPage";
import React from "react";

export default function QRScanScreen() {
  const {
    permission,
    requestPermission,
    scanned,
    data,
    scanError,
    handleScan,
    reset,
    handleAction,
    confirming,
    role,
  } = useQRPage();

  return (
    <QRScannerView
      permission={permission}
      requestPermission={requestPermission}
      scanned={scanned}
      data={data}
      scanError={scanError}
      handleScan={handleScan}
      reset={reset}
      handleAction={handleAction}
      confirming={confirming}
      role={role}
    />
  );
}
