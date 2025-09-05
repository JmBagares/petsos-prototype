// app/register.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!username || !email || !password || !confirm) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Use at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } } // store username in user_metadata
      });
      if (error) throw error;

      // If email confirmations are OFF, user may already be signed in:
      if (data.session) router.replace("/");
      else {
        Alert.alert("Verify your email", "We sent a confirmation link to your inbox.");
        router.replace("/login");
      }
    } catch (e: any) {
      Alert.alert("Sign up failed", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="paw" size={40} color="#fff" />
          </View>
          <View style={styles.brandBox}>
            <Text style={styles.appTitle}>PetSOS</Text>
            <Text style={styles.appSubtitle}>Community Animal Rescue</Text>
          </View>
          <Text style={styles.tagline}>Connecting hearts to help our furry friends</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="shield-checkmark" size={18} color="#2563eb" />
            <Text style={styles.cardHeaderText}>Join PetSOS</Text>
          </View>

          {/* Username */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person" size={16} color="#64748b" style={styles.leftIcon} />
              <TextInput
                placeholder="Choose a username"
                placeholderTextColor="#94a3b8"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail" size={16} color="#64748b" style={styles.leftIcon} />
              <TextInput
                placeholder="your.email@example.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed" size={16} color="#64748b" style={styles.leftIcon} />
              <TextInput
                placeholder="Choose a secure password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { paddingRight: 44 }]}
              />
              <TouchableOpacity style={styles.rightIconBtn} onPress={() => setShowPass((s) => !s)}>
                <Ionicons name={showPass ? "eye-off" : "eye"} size={18} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed" size={16} color="#64748b" style={styles.leftIcon} />
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPass}
                value={confirm}
                onChangeText={setConfirm}
                style={styles.input}
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.primaryBtn} onPress={onCreate} disabled={loading}>
            <Ionicons name="paw" size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>{loading ? "Creating Account…" : "Create Account"}</Text>
          </TouchableOpacity>

          {/* Switch */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.switchLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>By continuing, you agree to help rescue animals in need</Text>
            <View style={styles.madeWithRow}>
              <Text style={styles.footerText}>Made with</Text>
              <Ionicons name="heart" size={12} color="#ef4444" style={{ marginHorizontal: 4 }} />
              <Text style={styles.footerText}>for our furry friends</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const bg = "#0f172a";
const primary = "#2563eb";
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: bg },
  container: { flex: 1, padding: 16, justifyContent: "space-between" },
  header: { alignItems: "center", paddingTop: 24 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 9999, backgroundColor: primary,
    alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 4, borderColor: "rgba(255,255,255,0.3)"
  },
  brandBox: {
    backgroundColor: "rgba(255,255,255,0.9)", paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 16, marginBottom: 8
  },
  appTitle: { color: primary, fontSize: 28, fontWeight: "800", textAlign: "center" },
  appSubtitle: { color: "#059669", fontSize: 14, fontWeight: "700", textAlign: "center" },
  tagline: {
    color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.7)", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 9999, overflow: "hidden", marginTop: 8
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.98)", borderRadius: 20, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, elevation: 3, marginBottom: 10
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 10, gap: 6 },
  cardHeaderText: { fontWeight: "700", color: "#0f172a", fontSize: 16 },

  fieldWrap: { marginVertical: 8 },
  label: { color: "#0f172a", fontWeight: "700", marginBottom: 6 },
  inputRow: { position: "relative", justifyContent: "center" },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0",
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40, color: "#0f172a"
  },
  leftIcon: { position: "absolute", left: 12, zIndex: 1 },
  rightIconBtn: { position: "absolute", right: 12, padding: 6 },

  primaryBtn: {
    backgroundColor: primary, borderRadius: 12, paddingVertical: 14,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 6
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10, gap: 6 },
  switchText: { color: "#475569" },
  switchLink: { color: primary, fontWeight: "800" },

  footer: { alignItems: "center", marginTop: 8 },
  footerText: { color: "#475569", fontSize: 12 },
  madeWithRow: { flexDirection: "row", alignItems: "center", marginTop: 4 }
});
