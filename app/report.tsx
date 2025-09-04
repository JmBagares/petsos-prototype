// app/report.tsx
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useReports } from "../context/ReportsContext";
import { supabase } from "../lib/supabase";

export default function Report() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [address, setAddress] = useState<string | null>(null); // <-- ADD THIS

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [locGranted, setLocGranted] = useState(false);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const { addReport } = useReports();

  useEffect(() => {
    (async () => {
      if (!camPerm?.granted) await requestCamPerm();
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocGranted(status === "granted");
    })();
  }, []);

  const takePhoto = async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      setHasPhoto(true);

      let pos = null;
      if (locGranted) {
        pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }
      if (pos) {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);

        // NEW: Reverse geocode to human-readable address
        try {
          const results = await Location.reverseGeocodeAsync({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          if (results && results.length > 0) {
            const p = results[0];
            // Build a concise label (adjust as you like)
            const label = [
              p.name || p.street || "",
              p.city || p.subregion || "",
              p.region || "",
              p.country || "",
            ]
              .filter(Boolean)
              .join(", ");
            setAddress(label || null);
          } else {
            setAddress(null);
          }
        } catch {
          setAddress(null);
        }
      } else {
        setCoords(null);
        setAddress(null);
      }
      setTimestamp(new Date().toISOString());
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "Could not take photo.");
    }
  };

  const retake = () => {
    setHasPhoto(false);
    setPhotoUri(null);
    setDescription("");
    setTimestamp(null);
    setCoords(null);
    setAddress(null); // <-- ADD THIS
  };

  // REPLACE your existing submit() with this:
  const submit = async () => {
    if (!photoUri) {
      Alert.alert("Missing photo", "Please take a picture first.");
      return;
    }

    try {
      // 1) Read local file as bytes (RN-friendly)
      const res = await fetch(photoUri);
      const arrayBuffer = await res.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);

      // 2) Upload to Supabase Storage
      const filename = `${Date.now()}-${Math.floor(Math.random() * 1e6)}.jpg`;
      const path = `images/${filename}`;
      console.log(
        "Uploading to bucket: reports, path:",
        path,
        "bytes:",
        fileBytes.length
      );

      const { error: uploadErr } = await supabase.storage
        .from("reports")
        .upload(path, fileBytes, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadErr) {
        console.log("Upload error:", uploadErr);
        throw uploadErr;
      }

      // 3) Public URL
      const { data: pub } = supabase.storage.from("reports").getPublicUrl(path);
      const photo_url = pub.publicUrl;

      const { data, error } = await supabase
        .from("reports")
        .insert({
          photo_url: "https://example.com/placeholder.jpg",
          description: "sanity check",
          address,
          lat: coords?.lat,
          lng: coords?.lng,
        })
        .select("*");
      console.log("db insert:", data, error);
      // 4) Insert DB row (and return it so we can see success in logs)
      const lat = coords?.lat ?? null;
      const lng = coords?.lng ?? null;

      const { data: inserted, error: insertErr } = await supabase
        .from("reports")
        .insert({
          photo_url,
          description: description.trim(),
          address,
          lat,
          lng,
        })
        .select("*");

      if (insertErr) {
        console.log("Insert error:", insertErr);
        throw insertErr;
      }
      console.log("Inserted rows:", inserted);

      // 5) Update local UI immediately
      addReport({
        id: `${Date.now()}`,
        photoUri, // local preview
        photo_url, // remote URL for future loads
        description: description.trim(),
        timestamp: timestamp ?? new Date().toISOString(),
        coords,
        address,
      });

      router.replace("/community");
    } catch (e: any) {
      console.warn("Submit failed:", e);
      Alert.alert("Upload failed", e?.message ?? "Please try again.");
    }
  };

  if (!camPerm) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: "white" }}>Loading camera permission…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!camPerm.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: "white", marginBottom: 12 }}>
            Camera access is required to report an incident.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestCamPerm}>
            <Text style={styles.primaryBtnText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPhoto && photoUri) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
          <Text style={styles.title}>Review your report</Text>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <View style={styles.metaBox}>
            <Text style={styles.metaText}>
              Date & Time:{" "}
              <Text style={styles.metaBold}>
                {new Date(timestamp!).toLocaleString()}
              </Text>
            </Text>
            <Text style={styles.metaText}>
              Location:{" "}
              <Text style={styles.metaBold}>
                {address
                  ? address
                  : coords
                  ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : "Unavailable"}
              </Text>
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Add a short description…"
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity style={styles.outlineBtn} onPress={retake}>
              <Text style={styles.outlineBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={submit}>
              <Text style={styles.primaryBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Report an Incident</Text>
      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      </View>
      <View style={{ padding: 16 }}>
        <TouchableOpacity style={styles.shutterBtn} onPress={takePhoto}>
          <Text style={styles.shutterBtnText}>Take Picture</Text>
        </TouchableOpacity>
        <Text style={styles.permHint}>
          {locGranted
            ? "Location will be tagged automatically."
            : "Tip: allow location so the report is geotagged."}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  title: { color: "white", fontSize: 22, fontWeight: "700", margin: 12 },
  cameraWrap: {
    height: 420,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  camera: { flex: 1 },
  preview: { width: "100%", height: 320, borderRadius: 12 },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  primaryBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#001b0a", fontWeight: "800" },
  outlineBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#22c55e",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  outlineBtnText: { color: "#22c55e", fontWeight: "800" },
  shutterBtn: {
    backgroundColor: "white",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  shutterBtnText: { fontWeight: "800", fontSize: 16 },
  permHint: { color: "#94a3b8", marginTop: 8, textAlign: "center" },
  metaBox: {
    backgroundColor: "#0b1224",
    borderWidth: 1,
    borderColor: "#1f2a44",
    padding: 10,
    borderRadius: 10,
  },
  metaText: { color: "#cbd5e1", fontSize: 13 },
  metaBold: { color: "white", fontWeight: "700" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
});
