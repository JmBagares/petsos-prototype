// components/AppHeader.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

type Props = {
  statusText?: string;          // e.g. "Active"
  unreadCount?: number;         // e.g. 3
  onMenuPress?: () => void;
  onBellPress?: () => void;
  onProfilePress?: () => void;
  // activeRescues is fixed to 0 per your request, but you can pass it later.
  activeRescues?: number;
};

export default function AppHeader({
  statusText = "Active",
  unreadCount = 0,
  onMenuPress,
  onBellPress,
  onProfilePress,
  activeRescues = 0
}: Props) {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [locGranted, setLocGranted] = useState<boolean | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [place, setPlace] = useState<string>("Locating…");
  const [tempC, setTempC] = useState<number | null>(null);
  const [condition, setCondition] = useState<string>("—");

  const weatherText = useMemo(() => {
    if (tempC == null) return "—";
    return `${Math.round(tempC)}°C • ${condition}`;
  }, [tempC, condition]);

  // Open-Meteo weather-code to human text
  const codeToText = (code: number): string => {
    if ([0].includes(code)) return "Clear sky";
    if ([1].includes(code)) return "Mainly clear";
    if ([2].includes(code)) return "Partly cloudy";
    if ([3].includes(code)) return "Overcast";
    if ([45, 48].includes(code)) return "Fog";
    if ([51, 53, 55].includes(code)) return "Drizzle";
    if ([56, 57].includes(code)) return "Freezing drizzle";
    if ([61, 63, 65].includes(code)) return "Rain";
    if ([66, 67].includes(code)) return "Freezing rain";
    if ([71, 73, 75].includes(code)) return "Snow";
    if ([77].includes(code)) return "Snow grains";
    if ([80, 81, 82].includes(code)) return "Rain showers";
    if ([85, 86].includes(code)) return "Snow showers";
    if ([95].includes(code)) return "Thunderstorm";
    if ([96, 99].includes(code)) return "Thunderstorm w/ hail";
    return "Weather";
  };

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      // 1) Perms
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      setLocGranted(granted);
      if (!granted) {
        setPlace("Location off");
        setTempC(null);
        setCondition("—");
        return;
      }

      // 2) Get position
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoords({ lat, lng });

      // 3) Reverse geocode
      const g = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (g && g.length > 0) {
        const p = g[0];
        const label = [p.city || p.name, p.subregion || p.region].filter(Boolean).join(", ");
        setPlace(label || "Your location");
      } else {
        setPlace("Your location");
      }

      // 4) Fetch weather from Open-Meteo (no API key)
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
        `&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`;
      const r = await fetch(url);
      const json = await r.json();
      const t = json?.current?.temperature_2m;
      const code = json?.current?.weather_code;
      if (typeof t === "number") setTempC(t);
      if (typeof code === "number") setCondition(codeToText(code));
    } catch (e) {
      console.warn("Header refresh failed:", e);
      setPlace("Unavailable");
      setTempC(null);
      setCondition("—");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <View style={styles.wrapper}>
      <StatusBar style="light" translucent />
      <LinearGradient
        colors={["#2563eb", "#1e40af"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerBg, { paddingTop: 12 + insets.top }]}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={onMenuPress} activeOpacity={0.7}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topRight}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{statusText}</Text>
            </View>

            {/* Refresh button */}
            <TouchableOpacity style={styles.iconBtn} onPress={refresh} activeOpacity={0.7}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="refresh" size={20} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.iconBtn, { position: "relative" }]} onPress={onBellPress} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatar} onPress={onProfilePress} activeOpacity={0.7}>
              <Image source={{ uri: "https://i.pravatar.cc/100?img=5" }} style={{ width: 36, height: 36, borderRadius: 18 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title + badge + subtitle */}
        <View style={{ marginTop: 8 }}>
          <View style={styles.titleRow}>
            <View style={styles.smallIconBox}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
            </View>
            <Text style={styles.title}>PetSOS</Text>
            <View style={styles.aiBadge}>
              <Ionicons name="flash" size={12} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.aiBadgeText}>AI-Powered</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Emergency Animal Rescue Network</Text>
        </View>

        {/* Live location + weather + fixed active rescues */}
        <View style={styles.infoCard}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="location" size={14} color="rgba(255,255,255,0.85)" style={{ marginRight: 6 }} />
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.infoTitle}>
                {place}
              </Text>
              <Text style={styles.infoSub}>
                {locGranted === false ? "Enable location to show weather" : weatherText}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.infoTitle}>{activeRescues}</Text>
            <Text style={styles.infoSub}>Active rescues</Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.bottomBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", overflow: "hidden" },
  headerBg: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBtn: { padding: 8 },
  topRight: { flexDirection: "row", alignItems: "center", gap: 6 },

  statusPill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ade80", marginRight: 6 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  badge: {
    position: "absolute", top: -2, right: -2, height: 18, minWidth: 18, borderRadius: 9,
    backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center", paddingHorizontal: 4
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  avatar: { marginLeft: 6, borderRadius: 18, overflow: "hidden", borderWidth: 2, borderColor: "rgba(255,255,255,0.25)" },

  titleRow: { flexDirection: "row", alignItems: "center" },
  smallIconBox: { backgroundColor: "rgba(255,255,255,0.18)", padding: 6, borderRadius: 10, marginRight: 8 },
  title: { color: "#fff", fontSize: 22, fontWeight: "800", marginRight: 8, letterSpacing: 0.3 },
  aiBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10
  },
  aiBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  subtitle: { color: "rgba(255,255,255,0.9)", marginTop: 4, fontSize: 13, fontWeight: "600" },

  infoCard: {
    marginTop: 12, backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  },
  infoTitle: { color: "#fff", fontWeight: "700" },
  infoSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  bottomBar: { height: 4, backgroundColor: "#60a5fa" }
});
