import { Gear } from "@/components/UI/Gear";
import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  LogOut,
  Mail,
  Phone,
  Settings,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const handleLogout = () => {
    logout();
    router.replace("/");
  };
  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>You are not signed in yet.</Text>
        <Pressable style={styles.button} onPress={() => router.push("/login")}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Gear
        size={160}
        top={height * 0.04}
        left={width * -0.04}
        duration={20000}
        opacity={0.15}
      />
      <Gear
        size={120}
        top={height * 0.5}
        left={width * 0.8}
        duration={18000}
        opacity={0.12}
        reverse
      />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <User size={40} color={colors.primary} />
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>


      </View>

      <View style={styles.card}>
        <InfoRow
          icon={<Mail size={18} color={colors.primary} />}
          text={user.email}
        />
        <InfoRow
          icon={<Phone size={18} color={colors.primary} />}
          text={user.phone}
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Missions" value="3" />
        <StatCard label="Completed" value="15" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <MenuItem
          icon={<Settings size={18} />}
          label="Account Settings"
          onPress={() => router.push("/screens/account-settings")}
        />

        <View style={styles.menuItem}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Bell size={18} />
            <Text style={styles.menuText}>Notifications</Text>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#374151", true: "#3b82f6" }}
            thumbColor="white"
          />
        </View>

        <MenuItem
          icon={<User size={18} />}
          label="Help & Support"
          onPress={() => router.push("/screens/help-support")}
        />
      </View>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={18} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

type InfoRowProps = {
  icon: React.ReactNode;
  text: string | undefined;
};

function InfoRow({ icon, text }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      {icon}
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {icon}
        <Text style={styles.menuText}>{label}</Text>
      </View>
      <ChevronRight size={18} color="#9ca3af" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    alignItems: "center",
    marginTop: 40,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#1f2937",
  },

  name: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },

  role: {
    color: "#9ca3af",
    marginTop: 4,
  },



  card: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  infoText: {
    color: "white",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },

  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  statLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },

  section: {
    marginTop: 25,
    marginHorizontal: 20,
  },

  sectionTitle: {
    color: "white",
    fontWeight: "700",
    marginBottom: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  text: {
    color: "white",
    fontSize: 16,
    marginBottom: 18,
    textAlign: "center",
  },

  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
  },

  menuItem: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  menuText: {
    color: "white",
  },

  logoutBtn: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  logoutText: {
    color: "white",
    fontWeight: "700",
  },
});
