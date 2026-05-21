import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </LanguageProvider>
  );
}
