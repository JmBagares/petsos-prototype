// app/community.tsx
import React, { useCallback, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { supabase } from "../lib/supabase";
import { useReports } from "../context/ReportsContext";

export default function Community() {
  const { reports, replaceReports } = useReports();
  const [refreshing, setRefreshing] = useState(false);

 
  const loadOnce = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("id, created_at, photo_url, description, address, lat, lng")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const remote = (data ?? []).map((r: any) => ({
        id: String(r.id),
        photoUri: r.photo_url,
        photo_url: r.photo_url,
        description: r.description ?? "",
        timestamp: r.created_at ?? new Date().toISOString(),
        coords: r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng } : null,
        address: r.address ?? null,
        status: "uploaded" as const,
      }));

      // Use the CURRENT reports value at render time (no dep array needed)
      const pendingLocal = reports.filter(
        (r) => r.status === "pending" || r.status === "failed"
      );

      // De-dupe (prefer pending items first)
      const seen = new Set<string>();
      const merged = [
        ...pendingLocal,
        ...remote.filter((r) => {
          const key = r.photo_url || r.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }),
      ];

      replaceReports(merged);
    } finally {
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- IMPORTANT: no `reports` here to avoid fetch loop

  // Run when screen is focused (once per focus)
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!mounted) return;
        await loadOnce();
      })();
      return () => {
        mounted = false;
      };
    }, [loadOnce])
  );

  const onRefresh = useCallback(() => {
    // manual pull-to-refresh uses the same loader without changing deps
    loadOnce();
  }, [loadOnce]);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Pet Community</Text>

      {reports.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: "white" }}>No reports yet.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(i) => i.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 16, gap: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.photo_url || item.photoUri }} style={styles.cardImage} />
              <View style={{ padding: 12, gap: 6 }}>
                <Text style={styles.cardTime}>{new Date(item.timestamp).toLocaleString()}</Text>
                <Text style={styles.cardLoc}>
                  {item.address
                    ? `📍 ${item.address}`
                    : item.coords
                    ? `📍 ${item.coords.lat.toFixed(5)}, ${item.coords.lng.toFixed(5)}`
                    : "📍 Location unavailable"}
                </Text>
                {!!item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
                {!!item.status && item.status !== "uploaded" && (
                  <Text style={{ color: item.status === "failed" ? "#dc2626" : "#334155", fontWeight: "700" }}>
                    {item.status === "pending" ? "Uploading…" : "Upload failed"}
                  </Text>
                )}
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
