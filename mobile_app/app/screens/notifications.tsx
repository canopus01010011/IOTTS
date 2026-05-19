import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Truck,
} from "lucide-react-native";

export default function NotificationsScreen() {
  const router = useRouter();

  const notifications = [
    {
      id: "1",
      type: "mission",
      title: "New Mission Assigned",
      message: "You have a new mission in Blida Telecom Tower",
      time: "5 min ago",
      read: false,
    },
    {
      id: "2",
      type: "delivery",
      title: "Driver Arrived",
      message: "Driver has reached the destination",
      time: "20 min ago",
      read: false,
    },
    {
      id: "3",
      type: "success",
      title: "Mission Completed",
      message: "Boufarik Node mission marked as completed",
      time: "1 hour ago",
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "mission":
        return <Bell color="#3b82f6" size={20} />;
      case "delivery":
        return <Truck color="#f59e0b" size={20} />;
      case "success":
        return <CheckCircle2 color="#22c55e" size={20} />;
      default:
        return <AlertTriangle color="gray" size={20} />;
    }
  };

  const renderItem = ({ item }) => (
    <Pressable style={[styles.card, !item.read && styles.unread]}>
      <View style={styles.icon}>{getIcon(item.type)}</View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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

  unread: {
    borderColor: "#3b82f6",
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
});