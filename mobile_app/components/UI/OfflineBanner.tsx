import { useLanguage } from "@/context/LanguageContext";
import { useOffline } from "@/context/OfflineContext";
import { CloudOff, RefreshCw } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function OfflineBanner() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const {
    isOnline,
    pendingScanCount,
    isSyncing,
    lastSyncMessage,
    syncNow,
  } = useOffline();

  if (isOnline && pendingScanCount === 0 && !lastSyncMessage) {
    return null;
  }

  const showOffline = !isOnline;
  const showPending = pendingScanCount > 0;

  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: insets.top > 0 ? insets.top : 8 },
        showOffline ? styles.offline : styles.online,
      ]}
    >
      <View style={styles.row}>
        {showOffline ? (
          <CloudOff color="#fef3c7" size={16} />
        ) : (
          <RefreshCw color="#bbf7d0" size={16} />
        )}
        <Text style={styles.text} numberOfLines={2}>
          {showOffline
            ? t("offline.banner")
            : showPending
              ? `${pendingScanCount} ${t("offline.pending")}`
              : lastSyncMessage ?? t("offline.backOnline")}
        </Text>
        {(showPending || showOffline) && isOnline ? (
          <Pressable
            onPress={() => void syncNow()}
            disabled={isSyncing}
            style={styles.syncBtn}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.syncText}>{t("offline.sync")}</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    zIndex: 100,
  },
  offline: {
    backgroundColor: "#78350f",
  },
  online: {
    backgroundColor: "#14532d",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    flex: 1,
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  syncBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,.2)",
    minWidth: 56,
    alignItems: "center",
  },
  syncText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
