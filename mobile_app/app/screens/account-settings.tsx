import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { Save } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const Input = ({ label, value, onChange, secure = false }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={label}
      value={value}
      onChangeText={onChange}
      secureTextEntry={secure}
      placeholderTextColor="#999"
    />
  </View>
);

export default function AccountSettings() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.full_name);
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      await updateUser({
        name,
        email,
        phone,
        password: password || undefined,
      });

      Alert.alert("Success", "Account updated successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to update account");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>

      <Input label="Full Name" value={name} onChange={setName} />
      <Input label="Email" value={email} onChange={setEmail} />
      <Input label="Phone Number" value={phone} onChange={setPhone} />
      <Input
        label="New Password"
        value={password}
        onChange={setPassword}
        secure
      />

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Save size={18} color="white" />
        <Text style={styles.saveText}>Save Changes</Text>
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

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    color: "#9ca3af",
    marginBottom: 6,
    fontSize: 12,
  },

  input: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    color: "white",
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  saveBtn: {
    marginTop: 30,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,

    shadowColor: "#3b82f6",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },

  saveText: {
    color: "white",
    fontWeight: "700",
  },
});
