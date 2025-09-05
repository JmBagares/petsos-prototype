// app/index.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "../components/AppHeader";

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header (from your Figma-inspired component) */}
      <AppHeader statusText="Active" unreadCount={0} activeRescues={0} />

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/report")}
        >
          <Text style={styles.primaryBtnText}>Report an Incident</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/community")}
        >
          <Text style={styles.secondaryBtnText}>Pet Community</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffffff" },

  body: {
    flex: 1,
    padding: 16,
    gap: 14,
  },

  sectionTitle: {
    color: "#4979b3ff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  primaryBtn: {
    backgroundColor: "#d43d17ff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#ffffffff", fontWeight: "800", fontSize: 16 },

  secondaryBtn: {
    backgroundColor: "#2dda66ff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryBtnText: { color: "black", fontWeight: "800", fontSize: 16 },
});
