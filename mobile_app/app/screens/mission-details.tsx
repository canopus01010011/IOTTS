import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { Gear } from "@/components/UI/Gear";
import { FileText, QrCode, Truck } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { useMissionDetails } from "@/hooks/useMissionDetails";
import { formatDateTime } from "@/app/utils/missionMapper";

export default function MissionDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { mission, equipment, gps, loading, error } = useMissionDetails(id);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading mission...</Text>
      </View>
    );
  }

  if (error || !mission) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error || "Mission not found"}</Text>
      </View>
    );
  }

  const site = mission.Site ?? mission.site;
  const driver = mission.driver;
  const missionId = String(mission.id);
  const siteName = site?.name || "Unknown site";
  const siteAddress = site?.address || "—";

  return (
    <View style={styles.container}>
      <Gear size={150} top={60} left={-20} duration={20000} opacity={0.12} />
      <Gear size={120} top={400} left={250} duration={18000} opacity={0.1} reverse />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{siteName}</Text>
        <Text style={styles.subtitle}>{siteAddress}</Text>

        <Section title="Mission">
          <Info label="ID" value={missionId} />
          <Info label="Status" value={String(mission.status || "pending")} />
          <Info
            label="Schedule"
            value={`${formatDateTime(mission.scheduled_start_date)} → ${formatDateTime(mission.scheduled_end_date)}`}
          />
          <Info label="Start" value={formatDateTime(mission.start_date)} />
          <Info label="End" value={formatDateTime(mission.end_date)} />
        </Section>

        <Section title="Site">
          <Info label="ID" value={site?.id || mission.site_id || "—"} />
          <Info label="Name" value={siteName} />
          <Info label="Address" value={siteAddress} />
        </Section>

        {user?.role === "technician" && driver && (
          <Section title="Driver">
            <Info label="ID" value={driver.id} />
            <Info label="Name" value={driver.full_name || "—"} />
          </Section>
        )}

        {gps && (
          <Section title="GPS Device">
            {user?.role === "technician" ? (
              <>
                <Info label="GPS ID" value={gps.id} />
                <Info label="Serial" value={gps.device_serial_number} />
                <Info label="Battery" value={`${gps.battery_level}%`} />
                <Info label="Status" value={gps.device_status} />
              </>
            ) : (
              <Info label="Battery" value={`${gps.battery_level}%`} />
            )}
          </Section>
        )}

        {user?.role === "technician" && equipment.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Equipment</Text>
            {equipment.map((eq) => (
              <View key={eq.id} style={styles.card}>
                <Info label="ID" value={eq.id} />
                <Info label="Type" value={eq.type} />
                <Info label="Model" value={eq.model} />
                <Info label="Serial" value={eq.serial_number} />
                <Info label="Quantity" value={String(eq.quantity)} />
              </View>
            ))}
          </>
        )}

        {user?.role === "technician" && (
          <>
            <GlowButton
              icon={<FileText size={18} />}
              text="Create Report"
              onPress={() =>
                router.push({
                  pathname: "/screens/create-report",
                  params: { missionId, siteName },
                })
              }
            />
            <GlowButton
              icon={<FileText size={18} />}
              text="View Report"
              onPress={() =>
                router.push({
                  pathname: "/screens/report",
                  params: { missionId },
                })
              }
            />
            <GlowButton
              icon={<QrCode size={18} />}
              text="Confirm Delivery"
              onPress={() =>
                router.push({
                  pathname: "/(Tabs)/QR",
                  params: { missionId },
                })
              }
            />
          </>
        )}

        {user?.role === "driver" && (
          <GlowButton
            icon={<Truck size={18} />}
            text="Scanner mission (entrepôt Oued Smar)"
            onPress={() =>
              router.push({
                pathname: "/(Tabs)/QR",
                params: { missionId },
              })
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function GlowButton({
  icon,
  text,
  onPress,
}: {
  icon: React.ReactNode;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.glowBtn} onPress={onPress}>
      {icon}
      <Text style={styles.glowText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: "center", alignItems: "center" },
  content: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 22, fontWeight: "800", color: "white" },
  subtitle: { color: "#9ca3af", marginBottom: 20 },
  loadingText: { color: "#9ca3af", marginTop: 12 },
  errorText: { color: "#f87171", fontSize: 16, textAlign: "center", padding: 20 },
  sectionTitle: {
    color: "white",
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { color: "#9ca3af", fontSize: 12 },
  value: { color: "white", fontWeight: "600" },
  glowBtn: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  glowText: { color: "white", fontWeight: "700" },
});
