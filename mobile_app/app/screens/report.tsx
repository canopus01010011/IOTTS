import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { colors } from "@/constants/theme";

export default function ReportView() {
  const { missionId } = useLocalSearchParams();

  const report = {
    missionId: "M-001",
    text: "Installation completed successfully. All equipment tested and working correctly. No issues detected.",
    date: "2026-04-06 14:30",
    images: [
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
    ],
  };

  if (missionId !== report.missionId) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>No Report Found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mission Report</Text>

      <Text style={styles.meta}>
        Mission ID: {report.missionId}
      </Text>

      <Text style={styles.meta}>
        Submitted: {report.date}
      </Text>

      <View style={styles.card}>
        <Text style={styles.section}>Report Details</Text>
        <Text style={styles.text}>{report.text}</Text>
      </View>

      <Text style={styles.section}>Attached Images</Text>

      <View style={styles.images}>
        {report.images.map((img, i) => (
          <Image key={i} source={{ uri: img }} style={styles.image} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  error: {
    color: "red",
    fontSize: 18,
    fontWeight: "700",
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },

  meta: {
    color: "#9ca3af",
    marginBottom: 4,
  },

  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  section: {
    color: "white",
    fontWeight: "700",
    marginBottom: 8,
  },

  text: {
    color: "#d1d5db",
    lineHeight: 20,
  },

  images: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  image: {
    width: 110,
    height: 110,
    borderRadius: 12,
  },
});