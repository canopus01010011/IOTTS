import { colors } from "@/constants/theme";
import {
  ChevronDown,
  HelpCircle,
  Mail,
  Phone,
  Send,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function HelpSupport() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const faqs = [
    {
      id: 1,
      question: "How to start a mission?",
      answer: "Go to Missions page and select an active mission.",
    },
    {
      id: 2,
      question: "How to scan equipment?",
      answer: "Use the QR Scanner tab and align the code inside the frame.",
    },
    {
      id: 3,
      question: "How to contact driver?",
      answer: "Open mission details and use the call button.",
    },
  ];

  const toggleFAQ = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please write your message");
      return;
    }

    console.log("Support Message:", message);
    Alert.alert("Sent", "Your request has been sent to support");

    setMessage("");
  };

  const callSupport = () => {
    Linking.openURL("tel:0550000000");
  };

  const emailSupport = () => {
    Linking.openURL("mailto:support@telcotrack.com");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <HelpCircle size={28} color={colors.primary} />
        <Text style={styles.title}>Help & Support</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Contact Support</Text>

        <Pressable style={styles.contactBtn} onPress={callSupport}>
          <Phone size={18} color="white" />
          <Text style={styles.contactText}>Call Support</Text>
        </Pressable>

        <Pressable style={styles.contactBtn} onPress={emailSupport}>
          <Mail size={18} color="white" />
          <Text style={styles.contactText}>Email Support</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>FAQ</Text>

        {faqs.map((item) => (
          <View key={item.id} style={styles.faqItem}>
            <Pressable
              style={styles.faqHeader}
              onPress={() => toggleFAQ(item.id)}
            >
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <ChevronDown size={18} color="#9ca3af" />
            </Pressable>

            {expanded === item.id && (
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Send a Request</Text>

        <TextInput
          style={styles.input}
          placeholder="Describe your issue..."
          placeholderTextColor="#6b7280"
          multiline
          value={message}
          onChangeText={setMessage}
        />

        <Pressable style={styles.sendBtn} onPress={handleSend}>
          <Send size={18} color="white" />
          <Text style={styles.sendText}>Send Message</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  section: {
    color: "white",
    fontWeight: "700",
    marginBottom: 10,
  },

  contactBtn: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },

  contactText: {
    color: "white",
    fontWeight: "600",
  },

  faqItem: {
    marginTop: 10,
  },

  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  faqQuestion: {
    color: "white",
    fontWeight: "600",
  },

  faqAnswer: {
    color: "#9ca3af",
    marginTop: 6,
    fontSize: 12,
  },

  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    color: "white",
    minHeight: 100,
    textAlignVertical: "top",
  },

  sendBtn: {
    marginTop: 12,
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,

    // glow
    shadowColor: "#3b82f6",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },

  sendText: {
    color: "white",
    fontWeight: "700",
  },
});
