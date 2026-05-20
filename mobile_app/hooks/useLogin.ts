import type { Role } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export function useLogin() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const [role, setRole] = useState<Role>("technician");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Login required", "Please enter your email and password.");
      return;
    }

    try {
      await authLogin(email.trim(), password.trim(), role);
      router.replace("./(Tabs)/Home");
    } catch (error: unknown) {
      let message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";

      if (message === "Invalid credentials") {
        message +=
          "\n\nIf you added the user directly in PostgreSQL, the password must be bcrypt-hashed. From the backend folder run:\nnpx tsx scripts/set-user-password.ts your@email.com YourPassword";
      }

      Alert.alert("Login failed", message);
    }
  }

  return {
    role,
    setRole,
    email,
    setEmail,
    password,
    setPassword,
    login,
  };
}
