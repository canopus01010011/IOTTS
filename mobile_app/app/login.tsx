import { ChevronRight, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Gear } from "@/components/UI/Gear";
import { ROLES } from "@/constants/roles";
import { colors } from "@/constants/theme";
import { useLogin } from "@/hooks/useLogin";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const { role, setRole, email, setEmail, password, setPassword, login } =
    useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const btnScale = useSharedValue(1);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  function handlePressIn() {
    btnScale.value = withTiming(0.97);
  }

  function handlePressOut() {
    btnScale.value = withSpring(1);
  }

  function handleLogin() {
    login();
  }

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
        size={110}
        top={height * 0.03}
        left={width * 0.7}
        duration={15000}
        opacity={0.12}
        reverse
      />

      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <Image
            source={require("@/assets/images/telcotrack-logo.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>
          <Text style={styles.titleWhite}>Erc</Text>
          <Text style={styles.titleAccent}>Track</Text>
        </Text>

        <View style={styles.roleRow}>
          {ROLES.map((r) => {
            const Icon = r.icon;
            const selected = role === r.id;

            return (
              <Pressable
                key={r.id}
                onPress={() => setRole(r.id)}
                style={[styles.roleCard, selected && styles.roleSelected]}
              >
                <Icon size={24} color={selected ? colors.primary : "#9ca3af"} />

                <Text
                  style={[styles.roleTitle, selected && { color: "white" }]}
                >
                  {r.label}
                </Text>

                <Text style={styles.roleDesc}>{r.desc}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#6b7280"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={styles.eye}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={18} color="#9ca3af" />
            ) : (
              <Eye size={18} color="#9ca3af" />
            )}
          </Pressable>
        </View>

        <Animated.View style={btnStyle}>
          <Pressable
            style={styles.button}
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.buttonText}>
              Sign in as {role === "technician" ? "Technician" : "Driver"}
            </Text>
            <ChevronRight size={18} color="white" />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 24,
    gap: 18,
  },

  logoWrapper: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.gearBody,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 55,
    height: 55,
  },

  title: {
    textAlign: "center",
    fontSize: 34,
    fontWeight: "800",
  },

  titleWhite: {
    color: colors.textPrimary,
  },

  titleAccent: {
    color: colors.primary,
  },

  roleRow: {
    flexDirection: "row",
    gap: 14,
  },

  roleCard: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  roleSelected: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },

  roleTitle: {
    textAlign: "center",
    marginTop: 6,
    fontWeight: "600",
    color: "#9ca3af",
  },

  roleDesc: {
    textAlign: "center",
    fontSize: 11,
    color: "#6b7280",
    marginTop: 3,
  },

  input: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 12,
    color: "white",
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  passwordWrapper: {
    position: "relative",
  },

  eye: {
    position: "absolute",
    right: 14,
    top: 16,
  },

  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});
