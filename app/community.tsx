// app/community.tsx
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import { useReports } from "../context/ReportsContext";

export default function Community() {
  const { reports } = useReports();

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Pet Community</Text>
      {reports.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: "white" }}>
            No reports yet. Create one from Home.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.photoUri }} style={styles.cardImage} />
              <View style={{ padding: 12, gap: 6 }}>
                <Text style={styles.cardTime}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.cardLoc}>
                  {item.address
                    ? `📍 ${item.address}`
                    : item.coords
                    ? `📍 ${item.coords.lat.toFixed(
                        5
                      )}, ${item.coords.lng.toFixed(5)}`
                    : "📍 Location unavailable"}
                </Text>
                {item.description ? (
                  <Text style={styles.cardDesc}>{item.description}</Text>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  title: { color: "white", fontSize: 22, fontWeight: "700", margin: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "white", borderRadius: 16, overflow: "hidden" },
  cardImage: { width: "100%", height: 220 },
  cardTime: { color: "#0f172a", fontWeight: "800" },
  cardLoc: { color: "#334155", fontWeight: "600" },
  cardDesc: { color: "#0f172a" },
});
