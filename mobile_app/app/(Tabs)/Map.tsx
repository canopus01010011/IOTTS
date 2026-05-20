import { Phone } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Linking from "expo-linking";

import { GOOGLE_API_KEY } from "@/constants/config";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useMissions } from "@/hooks/useMissions";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const { location, loading: locationLoading, enabled } = useLocation();
  const { activeMission } = useMissions();
  const { user } = useAuth();

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const site = activeMission?.raw
    ? ((activeMission.raw as Record<string, any>).Site ??
      (activeMission.raw as Record<string, any>).site)
    : null;

  const destination =
    site?.latitude != null && site?.longitude != null
      ? {
          latitude: Number(site.latitude),
          longitude: Number(site.longitude),
        }
      : null;

  const contactPhone =
    user?.role === "driver"
      ? (activeMission?.raw as Record<string, any>)?.technician?.phone
      : (activeMission?.raw as Record<string, any>)?.driver?.phone;

  const showDirections =
    !!destination &&
    !!location &&
    GOOGLE_API_KEY &&
    GOOGLE_API_KEY !== "YOUR_GOOGLE_API_KEY";

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!activeMission || !destination) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>No active mission with site location</Text>
      </View>
    );
  }

  const region: Region = {
    latitude: location?.latitude ?? destination.latitude,
    longitude: location?.longitude ?? destination.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation={enabled}>
        {location && <Marker coordinate={location} title="You" />}

        <Marker coordinate={destination} title={activeMission.site} />

        {showDirections && (
          <MapViewDirections
            origin={location!}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            strokeWidth={4}
            strokeColor="#3b82f6"
            onReady={(result) => {
              setDistance(result.distance.toFixed(1) + " km");
              setDuration(Math.ceil(result.duration) + " min");
            }}
          />
        )}
      </MapView>

      <View style={styles.card}>
        <Text style={styles.title}>{activeMission.site}</Text>
        <Text style={styles.sub}>{activeMission.address || activeMission.company}</Text>

        <Text style={styles.info}>
          📦 {activeMission.items} items • {activeMission.status}
        </Text>

        {showDirections && (
          <Text style={styles.info}>
            📍 Distance: {distance || "..."} • ⏱ {duration || "..."}
          </Text>
        )}

        {contactPhone ? (
          <Pressable
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${contactPhone}`)}
          >
            <Phone color="white" size={18} />
            <Text style={styles.callText}>
              {user?.role === "driver" ? "Call Technician" : "Call Driver"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: width,
    height: height,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  loadingText: {
    marginTop: 10,
    color: "#9ca3af",
  },
  card: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    elevation: 8,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  sub: {
    color: "#9ca3af",
    marginTop: 2,
  },
  info: {
    color: "#9ca3af",
    marginTop: 6,
  },
  callBtn: {
    marginTop: 12,
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  callText: {
    color: "white",
    fontWeight: "600",
  },
});
