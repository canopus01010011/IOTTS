import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/constants/theme";
import { Camera, Send, Trash2 } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { useReport } from "@/hooks/useReport";

export default function CreateReport() {
  const { user } = useAuth();
  const { sendReport } = useReport();

  const { missionId, siteName } = useLocalSearchParams();

  const [reportText, setReportText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (user?.role !== "technician") {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Access Denied</Text>
        <Text style={styles.sub}>Only technicians can create reports</Text>
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

    try {
      setLoading(true);

      await sendReport({
        missionId: String(missionId),
        text: reportText,
        images,
      });

      Alert.alert("Success", "Report sent");

      setReportText("");
      setImages([]);
    } catch (err) {
      Alert.alert("Error", "Failed to send report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.title}>Create Report</Text>
        <Text style={styles.subtitle}>
          Describe the mission outcome and attach images
        </Text>

        <Text style={styles.meta}>Mission ID: {missionId}</Text>
        <Text style={styles.meta}>Site: {siteName}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Write your report..."
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
          {loading ? "Sending..." : "Send Report"}
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
  },

  error: {
    color: "red",
    fontSize: 18,
    fontWeight: "700",
  },

  sub: {
    color: "#9ca3af",
    marginTop: 6,
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