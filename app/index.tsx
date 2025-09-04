// app/index.tsx
import { useRouter } from "expo-router";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>PetSOS</Text>
        <Text style={styles.subtitle}>Community-based animal rescue</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/report")}>
          <Text style={styles.primaryBtnText}>Report an Incident</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push("/community")}>
          <Text style={styles.secondaryBtnText}>Pet Community</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  title: { color: "white", fontSize: 40, fontWeight: "800" },
  subtitle: { color: "#cbd5e1", fontSize: 16, marginBottom: 32 },
  primaryBtn: { backgroundColor: "#22c55e", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14 },
  primaryBtnText: { color: "#001b0a", fontWeight: "800", fontSize: 16 },
  secondaryBtn: { borderWidth: 1, borderColor: "#64748b", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14 },
  secondaryBtnText: { color: "white", fontWeight: "700", fontSize: 16 }
});
