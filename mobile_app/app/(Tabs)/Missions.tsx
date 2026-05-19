import MissionCard from "@/components/UI/MissionCard";
import { colors } from "@/constants/theme";
import { useMissions } from "@/hooks/useMissions";
import { Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function MissionsScreen() {
  const { missions } = useMissions();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = missions.filter((m) => {
    const matchSearch =
      m.site.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ||
      (filter === "Today" && m.date === "today") ||
      (filter === "Completed" && m.status === "Completed") ||
      (filter === "Pending" && m.status === "Pending");

    return matchSearch && matchFilter;
  });

  const today = filtered.filter((m) => m.date === "today");
  const completed = filtered.filter((m) => m.status === "Completed");

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            placeholder="Search missions..."
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
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {today.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today</Text>
            {today.map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </>
        )}

        {completed.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completed.map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
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

  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 12,
  },

  site: {
    color: "white",
    fontWeight: "700",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  text: {
    color: "#9ca3af",
    fontSize: 12,
  },

  bottom: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  status: {
    fontWeight: "700",
  },
});
