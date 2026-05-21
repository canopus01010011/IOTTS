import MissionCard from "@/components/UI/MissionCard";
import { colors } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { useMissions } from "@/hooks/useMissions";
import type { MissionCardData } from "@/app/utils/missionMapper";
import { Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function MissionsScreen() {
  const { missions, loading } = useMissions();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = missions.filter((m) => {
    const query = search.toLowerCase();
    const matchSearch =
      m.site.toLowerCase().includes(query) ||
      m.company.toLowerCase().includes(query) ||
      m.address.toLowerCase().includes(query);

    const matchFilter =
      filter === "All" ||
      (filter === "Today" && m.date === "today") ||
      (filter === "Completed" && m.statusRaw === "completed") ||
      (filter === "Pending" && m.statusRaw === "pending");

    return matchSearch && matchFilter;
  });

  const today = filtered.filter((m) => m.date === "today");
  const others = filtered.filter((m) => m.date !== "today");

  const renderSection = (title: string, items: MissionCardData[]) => {
    if (items.length === 0) return null;
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((m) => (
          <MissionCard key={m.id} mission={m} />
        ))}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            placeholder={t("missions.search")}
            placeholderTextColor="#6b7280"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filters}>
          {["All", "Today", "Completed", "Pending"].map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterBtn, filter === f && styles.activeFilter]}
            >
              <Text
                style={[styles.filterText, filter === f && { color: "white" }]}
              >
                {{
                  All: t("missions.all"),
                  Today: t("missions.today"),
                  Completed: t("missions.completed"),
                  Pending: t("missions.pending"),
                }[f]}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <Text style={styles.empty}>{t("missions.empty")}</Text>
        ) : (
          <>
            {renderSection(t("missions.today"), today)}
            {renderSection(t("missions.upcoming"), others)}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  center: {
    marginTop: 40,
    alignItems: "center",
  },
  empty: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 40,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 8,
  },
  input: {
    color: "white",
    flex: 1,
  },
  filters: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#1f2937",
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  sectionTitle: {
    color: "white",
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },
});
