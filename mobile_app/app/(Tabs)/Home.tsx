import { Gear } from "@/components/UI/Gear";
import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useMissions } from "@/hooks/useMissions";
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    BellIcon,
    Building2,
    CheckCircle2,
    ClipboardList,
    ClockIcon,
    MapPin,
    PackageIcon,
} from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { missions, loading, activeMissions, completedMissions } = useMissions();

  const notifications = 3;
  const greeting = user?.full_name || user?.email || "User";

  return (
    <View style={styles.container}>
      <Gear
        size={160}
        top={height * 0.04}
        left={width * -0.04}
        duration={20000}
        opacity={0.15}
      />
      <Gear
        size={120}
        top={height * 0.5}
        left={width * 0.8}
        duration={18000}
        opacity={0.12}
        reverse
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>{greeting}</Text>
          </View>

          <Pressable
            style={styles.iconCircle}
            onPress={() => router.push("/screens/notifications")}
          >
            <BellIcon color={colors.primary} size={22} />

            {notifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="Active"
            value={String(activeMissions.length)}
            icon={<ClipboardList size={20} color={colors.primary} />}
          />
          <StatCard
            label="Completed"
            value={String(completedMissions.length)}
            icon={<CheckCircle2 size={20} color={colors.primary} />}
          />
        </View>

        <Text style={styles.sectionTitle}>Active Missions</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading missions...</Text>
        ) : missions.length === 0 ? (
          <Text style={styles.loadingText}>No missions available.</Text>
        ) : (
          missions.map((m) => {
            const siteName = m.site?.name || m.site?.Site_name || "Unknown site";
            const company =
              m.driver?.full_name || m.technician?.full_name || m.company || "Team";
            const address = m.site?.address || m.site?.Site_address || "";
            const time = m.scheduled_start_date
              ? new Date(m.scheduled_start_date).toLocaleDateString()
              : m.time || "";
            const items = Array.isArray(m.equipment_list)
              ? m.equipment_list.length
              : m.items ?? 0;
            const status = m.status || m.status_text || "Pending";

            return (
              <Pressable
                key={m.id ?? m.Mission_ID}
                style={styles.missionCard}
                onPress={() =>
                  router.push({
                    pathname: "/screens/mission-details",
                    params: { id: String(m.id ?? m.Mission_ID) },
                  })
                }
              >
                <Text style={styles.site}>{siteName}</Text>

                <View style={styles.missionRow}>
                  <Building2 size={16} color="#9ca3af" />
                  <Text style={styles.missionDetail}>{company}</Text>
                </View>

                <View style={styles.missionRow}>
                  <MapPin size={16} color="#9ca3af" />
                  <Text style={styles.missionDetail}>{address}</Text>
                </View>

                <View style={styles.missionRow}>
                  <ClockIcon size={16} color="#9ca3af" />
                  <Text style={styles.missionDetail}>{time}</Text>
                </View>

                <View style={styles.missionRow}>
                  <PackageIcon size={16} color="#9ca3af" />
                  <Text style={styles.missionDetail}>{items} Items</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    status.toLowerCase() === "completed"
                      ? styles.completed
                      : status.toLowerCase() === "pending"
                      ? styles.pending
                      : styles.inProgress,
                  ]}
                >
                  <Text style={styles.statusText}>{status}</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 100,
  },

  header: {
    marginTop: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subtitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  title: {
    color: colors.textMuted,
    marginTop: 4,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "red",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    gap: 5,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginTop: 6,
  },

  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginTop: 10,
  },

  missionCard: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginTop: 10,
  },

  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  missionDetail: {
    color: "#9ca3af",
    fontSize: 12,
  },

  site: {
    color: "white",
    fontWeight: "600",
  },

  statusBadge: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },

  pending: { backgroundColor: "#f97316" },
  inProgress: { backgroundColor: "#3b82f6" },
  completed: { backgroundColor: "#22c55e" },

  actionCard: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginTop: 10,
  },

  actionTitle: {
    color: "white",
    fontWeight: "700",
  },

  actionDesc: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
});
