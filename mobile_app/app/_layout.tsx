import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { OfflineProvider } from "@/context/OfflineContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <OfflineProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </OfflineProvider>
    </LanguageProvider>
  );
}
