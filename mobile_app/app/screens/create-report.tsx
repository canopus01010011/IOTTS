import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/constants/theme";
import { Camera, Send, Trash2 } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { useReport } from "@/hooks/useReport";
import api from "@/app/services/api";

export default function CreateReport() {
  const router = useRouter();
  const { user } = useAuth();
  const { sendReport } = useReport();

  const { missionId, siteName } = useLocalSearchParams();

  const [reportText, setReportText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (!missionId) {
      setChecking(false);
      return;
    }

    api
      .get<{ success: boolean; submitted: boolean }>(
        `/reports/submitted/${missionId}`,
      )
      .then((res) => setAlreadySubmitted(!!res.submitted))
      .catch(() => setAlreadySubmitted(false))
      .finally(() => setChecking(false));
  }, [missionId]);

  if (user?.role !== "technician") {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Access Denied</Text>
        <Text style={styles.sub}>Only technicians can create reports</Text>
      </View>
    );
  }

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (alreadySubmitted) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Report already submitted</Text>
        <Text style={styles.sub}>
          You can only send one report at the end of the mission.
        </Text>
        <Pressable
          style={styles.linkBtn}
          onPress={() =>
            router.push({
              pathname: "/screens/report",
              params: { missionId: String(missionId) },
            })
          }
        >
          <Text style={styles.linkText}>View submitted report</Text>
        </Pressable>
      </View>
    );
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img !== uri));
  };

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      Alert.alert("Error", "Please write your report");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Error", "Please attach at least one photo");
      return;
    }

    try {
      setLoading(true);

      await sendReport({
        missionId: String(missionId),
        text: reportText,
        images,
      });

      Alert.alert(
        "Success",
        "Report submitted. You cannot edit it after submission.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace({
                pathname: "/screens/report",
                params: { missionId: String(missionId) },
              }),
          },
        ],
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send report";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.title}>Submit Mission Report</Text>
        <Text style={styles.subtitle}>
          Send once at the end of the mission (after driver delivery confirmation)
        </Text>

        <Text style={styles.meta}>Mission ID: {missionId}</Text>
        <Text style={styles.meta}>Site: {siteName}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Describe the mission outcome…"
        placeholderTextColor="#6b7280"
        multiline
        value={reportText}
        onChangeText={setReportText}
      />

      <Pressable style={styles.uploadBtn} onPress={pickImage}>
        <Camera color="white" size={18} />
        <Text style={styles.uploadText}>Upload Images</Text>
      </Pressable>

      <View style={styles.imageContainer}>
        {images.map((img, i) => (
          <View key={i} style={styles.imageWrapper}>
            <Image source={{ uri: img }} style={styles.image} />
            <Pressable
              style={styles.deleteBtn}
              onPress={() => removeImage(img)}
            >
              <Trash2 size={14} color="white" />
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Send size={18} color="white" />
        <Text style={styles.submitText}>
          {loading ? "Submitting…" : "Submit report (final)"}
        </Text>
      </Pressable>
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
    padding: 20,
  },
  error: {
    color: "red",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  sub: {
    color: "#9ca3af",
    marginTop: 6,
    textAlign: "center",
  },
  linkBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  linkText: {
    color: "white",
    fontWeight: "700",
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#9ca3af",
    marginBottom: 10,
  },
  meta: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    color: "white",
    marginTop: 12,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  uploadBtn: {
    marginTop: 16,
    backgroundColor: "#374151",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  uploadText: {
    color: "white",
    fontWeight: "600",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 10,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  deleteBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 4,
  },
  submitBtn: {
    marginTop: 24,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  submitText: {
    color: "white",
    fontWeight: "700",
  },
});
