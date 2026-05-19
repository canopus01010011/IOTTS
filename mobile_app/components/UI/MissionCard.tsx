import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Building2, Clock, Package } from "lucide-react-native";

type Mission = {
  id: number;
  site: string;
  company: string;
  status: string;
  time: string;
  items: number;
};

export default function MissionCard({ mission }: { mission: Mission }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/screens/mission-details",
          params: { id: mission.id },
        })
      }
    >
      <Text style={styles.site}>{mission.site}</Text>

      <View style={styles.row}>
        <Building2 size={14} color="#9ca3af" />
        <Text style={styles.text}>{mission.company}</Text>
      </View>

      <View style={styles.row}>
        <Clock size={14} color="#9ca3af" />
        <Text style={styles.text}>{mission.time}</Text>
      </View>

      <View style={styles.row}>
        <Package size={14} color="#9ca3af" />
        <Text style={styles.text}>{mission.items} items</Text>
      </View>

      <View style={styles.bottom}>
        <Text
          style={[
            styles.status,
            mission.status === "Completed"
              ? { color: "#22c55e" }
              : { color: "#f59e0b" },
          ]}
        >
          {mission.status}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 12,
  },

  site: {
    color: "white",
    fontWeight: "700",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  text: {
    color: "#9ca3af",
    fontSize: 12,
  },

  bottom: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  status: {
    fontWeight: "700",
  },
});