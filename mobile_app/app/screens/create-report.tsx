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
import { Camera, Send, Trash2, CheckCircle2, XCircle } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { useReport } from "@/hooks/useReport";
import api from "@/app/services/api";
import {
  formatValidationMessage,
  type PhotoValidation,
} from "@/app/services/report.service";

type ValidatedImage = {
  uri: string;
  validation: PhotoValidation;
};

export default function CreateReport() {
  const router = useRouter();
  const { user } = useAuth();
  const { sendReport, validatePhoto } = useReport();

  const { missionId, siteName } = useLocalSearchParams();

  const [reportText, setReportText] = useState("");
  const [images, setImages] = useState<ValidatedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
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

    if (result.canceled) return;

    setValidating(true);
    try {
      for (const asset of result.assets) {
        try {
          const validation = await validatePhoto(asset.uri);
          if (!validation.valid) {
            Alert.alert(
              "Photo rejected by AI",
              `${formatValidationMessage(validation)}\n\nPlease upload another picture.`,
            );
            continue;
          }
          setImages((prev) => {
            if (prev.some((p) => p.uri === asset.uri)) return prev;
            return [...prev, { uri: asset.uri, validation }];
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "AI validation failed";
          Alert.alert("Validation error", message);
        }
      }
    } finally {
      setValidating(false);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      Alert.alert("Error", "Please write your report");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Error", "Please attach at least one AI-validated photo");
      return;
    }

    try {
      setLoading(true);

      await sendReport({
        missionId: String(missionId),
        text: reportText,
        images: images.map((i) => i.uri),
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
      const e = err as Error & { data?: { validation?: PhotoValidation[]; rejected?: PhotoValidation[] } };
      let message = e.message || "Failed to send report";
      const rejected = e.data?.rejected as Array<{ score?: number; issues?: string[] }> | undefined;
      if (rejected?.length) {
        const first = rejected[0];
        message = `Photo rejected (score ${Math.round((first.score ?? 0) * 100)}%)\n${(first.issues || []).join("\n")}\n\nUpload another picture.`;
      }
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
          Photos are checked by AI before upload. Rejected images must be replaced.
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

      <Pressable
        style={[styles.uploadBtn, validating && { opacity: 0.6 }]}
        onPress={pickImage}
        disabled={validating}
      >
        {validating ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Camera color="white" size={18} />
        )}
        <Text style={styles.uploadText}>
          {validating ? "AI validation…" : "Upload Images (AI check)"}
        </Text>
      </Pressable>

      <View style={styles.imageContainer}>
        {images.map((item, i) => (
          <View key={i} style={styles.imageCard}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.uri }} style={styles.image} />
              <Pressable
                style={styles.deleteBtn}
                onPress={() => removeImage(item.uri)}
              >
                <Trash2 size={14} color="white" />
              </Pressable>
            </View>
            <View style={styles.validationBox}>
              <View style={styles.validationRow}>
                {item.validation.valid ? (
                  <CheckCircle2 size={14} color="#22c55e" />
                ) : (
                  <XCircle size={14} color="#ef4444" />
                )}
                <Text style={styles.validationTitle}>
                  IA {Math.round(item.validation.score * 100)}%
                </Text>
              </View>
              {item.validation.clip ? (
                <Text style={styles.validationMeta}>
                  {item.validation.clip.best_label} ·{" "}
                  {Math.round(item.validation.clip.best_score * 100)}%
                </Text>
              ) : null}
            </View>
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
    color: "#f87171",
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
    marginTop: 4,
    lineHeight: 20,
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
    alignItems: "center",
  },
  uploadText: {
    color: "white",
    fontWeight: "600",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 12,
  },
  imageCard: {
    width: 120,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 120,
    height: 120,
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
  validationBox: {
    marginTop: 6,
    backgroundColor: "rgba(30, 168, 212, 0.12)",
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: "rgba(30, 168, 212, 0.25)",
  },
  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  validationTitle: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "700",
  },
  validationMeta: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 2,
  },
  submitBtn: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  submitText: {
    color: "white",
    fontWeight: "700",
  },
});
