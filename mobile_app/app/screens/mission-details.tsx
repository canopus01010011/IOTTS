import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { Gear } from "@/components/UI/Gear";
import { FileText, QrCode, Truck } from "lucide-react-native";



const { width, height } = Dimensions.get("window");

export default function MissionDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const user = { role: "technician" };

  const data = {
    mission: {
      Mission_ID: "M-001",
      Mission_type: "Installation",
      schedule_start: "2026-04-06",
      schedule_end: "2026-04-06",
      start_date: "2026-04-06 09:15",
      end_date: "--",
    },
    site: {
      Site_ID: "S-11",
      Site_name: "Blida Telecom Tower",
      Site_address: "Blida, Algeria",
    },
    driver: {
      id: "D-01",
      firstName: "Putin",
      lastName: "Vladimir",
    },
    gps: {
      GPS_ID: "GPS-77",
      Device_serial_number: "DEV-9981",
      Battery_level: "78%",
      Device_status: "Active",
    },
    equipment: [
      {
        Eq_ID: "EQ-01",
        Eq_type: "Router",
        Eq_Serial_number: "SN12345",
        Eq_model: "Huawei AX3",
            Eq_quantity: "1",
      },
      {
        Eq_ID: "EQ-02",
        Eq_type: "Antenna",
        Eq_Serial_number: "SN67890",
        Eq_model: "Nokia AirScale",
        Eq_quantity: "2",
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Gear size={150} top={60} left={-20} duration={20000} opacity={0.12} />
      <Gear size={120} top={400} left={250} duration={18000} opacity={0.1} reverse />

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>{data.site.Site_name}</Text>
        <Text style={styles.subtitle}>{data.site.Site_address}</Text>

        <Section title="Mission">
          <Info label="ID" value={data.mission.Mission_ID} />
          <Info label="Type" value={data.mission.Mission_type} />
          <Info label="Schedule" value={`${data.mission.schedule_start} → ${data.mission.schedule_end}`} />
          <Info label="Start" value={data.mission.start_date} />
          <Info label="End" value={data.mission.end_date} />
        </Section>

        <Section title="Site">
          <Info label="ID" value={data.site.Site_ID} />
          <Info label="Name" value={data.site.Site_name} />
          <Info label="Address" value={data.site.Site_address} />
        </Section>

        {user.role === "technician" && (
          <Section title="Driver">
            <Info label="ID" value={data.driver.id} />
            <Info label="Name" value={`${data.driver.firstName} ${data.driver.lastName}`} />
          </Section>
        )}

        <Section title="GPS Device">
          {user.role === "technician" ? (
            <>
              <Info label="GPS ID" value={data.gps.GPS_ID} />
              <Info label="Serial" value={data.gps.Device_serial_number} />
              <Info label="Battery" value={data.gps.Battery_level} />
              <Info label="Status" value={data.gps.Device_status} />
            </>
          ) : (
            <Info label="Battery" value={data.gps.Battery_level} />
          )}
        </Section>

        {user.role === "technician" && (
          <>
            <Text style={styles.sectionTitle}>Equipment</Text>
            {data.equipment.map((eq) => (
              <View key={eq.Eq_ID} style={styles.card}>
                <Info label="ID" value={eq.Eq_ID} />
                <Info label="Type" value={eq.Eq_type} />
                <Info label="Model" value={eq.Eq_model} />
                <Info label="Serial" value={eq.Eq_Serial_number} />
                <Info label="Quantity" value={eq.Eq_quantity} />

              </View>
            ))}
          </>
        )}

        {user.role === "technician" && (
          <>
            <GlowButton
              icon={<FileText size={18} />}
              text="Create Report"
              onPress={() =>
                router.push({
                  pathname: "/screens/create-report",
                  params: { missionId: data.mission.Mission_ID },
                })
              }
            />
            <GlowButton icon={<QrCode size={18} />} text="Confirm Delivery" 
              onPress={() =>
                router.push({
                  pathname: "/(Tabs)/QR",
                  params: { missionId: data.mission.Mission_ID },
                })
              }/>
          </>
        )}

        {user.role === "driver" && (
          <GlowButton icon={<Truck size={18} />} text="Start Delivery" 
          onPress={() =>
                router.push({
                  pathname: "/(Tabs)/QR",
                  params: { missionId: data.mission.Mission_ID },
                })
              } />
        )}
      </ScrollView>
    </View>
  );
}


function Section({ title, children }: any) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </>
  );
}

function Info({ label, value }: any) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function GlowButton({ icon, text, onPress }: any) {
  return (
    <Pressable style={styles.glowBtn} onPress={onPress}>
      {icon}
      <Text style={styles.glowText}>{text}</Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  content: { padding: 20, paddingBottom: 120 },

  title: { fontSize: 22, fontWeight: "800", color: "white" },

  subtitle: { color: "#9ca3af", marginBottom: 20 },

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