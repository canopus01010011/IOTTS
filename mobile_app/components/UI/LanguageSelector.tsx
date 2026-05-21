import {
  LANGUAGES,
  type LanguageCode,
  useLanguage,
} from "@/context/LanguageContext";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function LanguageSelector() {
  const { language, setLanguage, t, isRTL } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isRTL && styles.rtlText]}>{t("common.language")}</Text>
      <View style={[styles.options, isRTL && styles.rtlRow]}>
        {LANGUAGES.map((item) => {
          const active = item.code === language;
          return (
            <Pressable
              key={item.code}
              style={[styles.option, active && styles.activeOption]}
              onPress={() => setLanguage(item.code as LanguageCode)}
            >
              <Text style={[styles.optionText, active && styles.activeText]}>
                {item.nativeLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 10,
  },
  label: {
    color: "white",
    fontWeight: "700",
    marginBottom: 10,
  },
  options: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  rtlRow: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "right",
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#1f2937",
  },
  activeOption: {
    backgroundColor: "#3b82f6",
  },
  optionText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "700",
  },
  activeText: {
    color: "white",
  },
});
