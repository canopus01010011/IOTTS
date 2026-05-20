import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { colors } from "@/constants/theme";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Truck,
} from "lucide-react-native";
import { useNotifications } from "@/hooks/useNotifications";

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function getIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("mission")) {
    return <Bell color="#3b82f6" size={20} />;
  }
  if (lower.includes("driver") || lower.includes("delivery")) {
    return <Truck color="#f59e0b" size={20} />;
  }
  if (lower.includes("complete")) {
    return <CheckCircle2 color="#22c55e" size={20} />;
  }
  return <AlertTriangle color="gray" size={20} />;
}

export default function NotificationsScreen() {
  const { notifications, loading } = useNotifications();

  const renderItem = ({
    item,
  }: {
    item: { id: string; title: string; body: string; sent_at: string };
  }) => (
    <View style={styles.card}>
      <View style={styles.icon}>{getIcon(item.title)}</View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.body}</Text>
        <Text style={styles.time}>{formatRelativeTime(item.sent_at)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontWeight: "700",
  },
  message: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 4,
  },
  empty: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 40,
  },
});
