import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { colors } from "@/constants/theme";
import { getDeliveryStatus } from "@/app/services/delivery.service";
import { formatDateTime } from "@/app/utils/missionMapper";

export default function ReportView() {
  const { missionId } = useLocalSearchParams<{ missionId?: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<{
    missionId: string;
    text: string;
    date: string;
    images: string[];
  } | null>(null);

  useEffect(() => {
    if (!missionId) {
      setError("Mission ID is missing");
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      try {
        const status = await getDeliveryStatus(String(missionId));
        if (!active) return;

        const reportData = status.report;
        if (!reportData) {
          setError("No report found for this mission yet.");
          return;
        }

        setReport({
          missionId: String(missionId),
          text: reportData.notes || reportData.description || "",
          date: formatDateTime(
            reportData.sent_at || reportData.created_at || reportData.report_date,
          ),
          images: reportData.delivery_photo_url ?? [],
        });
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load report",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [missionId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "No Report Found"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mission Report</Text>

      <Text style={styles.meta}>Mission ID: {report.missionId}</Text>
      <Text style={styles.meta}>Submitted: {report.date}</Text>

      <View style={styles.card}>
        <Text style={styles.section}>Report Details</Text>
        <Text style={styles.text}>
          {report.text || "No description provided."}
        </Text>
      </View>

      {report.images.length > 0 && (
        <>
          <Text style={styles.section}>Attached Images</Text>
          <View style={styles.images}>
            {report.images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.image} />
            ))}
          </View>
        </>
      )}
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
    color: "#f87171",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    padding: 20,
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
    marginTop: 16,
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
