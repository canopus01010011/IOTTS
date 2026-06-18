import { getMissionById } from "@/app/services/missions.service";
import { mapMissionForCard } from "@/app/utils/missionMapper";
import { notifyMissionRefresh } from "@/app/utils/missionRefresh";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { Phone, Truck } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Linking from "expo-linking";

import { GOOGLE_API_KEY } from "@/constants/config";
import { WAREHOUSE } from "@/constants/warehouse";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useLiveGps } from "@/hooks/useLiveGps";
import { useMissions } from "@/hooks/useMissions";

const { width, height } = Dimensions.get("window");

function resolveContainerId(raw: Record<string, unknown> | undefined): string | undefined {
  if (!raw) return undefined;
  const id = raw.container_id ?? raw.containerId;
  return id != null ? String(id) : undefined;
}

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
  const { missionId: routeMissionId } = useLocalSearchParams<{ missionId?: string }>();
  const { location, loading: locationLoading, enabled } = useLocation();
  const { activeMission, refetch } = useMissions();
  const { user } = useAuth();
  const [routeMission, setRouteMission] = useState<ReturnType<typeof mapMissionForCard> | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      void refetch();
      if (routeMissionId) {
        void getMissionById(String(routeMissionId))
          .then((m) => setRouteMission(mapMissionForCard(m as Record<string, unknown>)))
          .catch(() => setRouteMission(null));
      }
    }, [refetch, routeMissionId]),
  );

  const displayMission = useMemo(() => {
    if (routeMissionId && routeMission?.id === routeMissionId) return routeMission;
    if (routeMissionId) {
      const fromList = activeMission?.id === routeMissionId ? activeMission : null;
      return fromList ?? routeMission ?? activeMission;
    }
    return activeMission;
  }, [routeMissionId, routeMission, activeMission]);

  const containerId = resolveContainerId(
    displayMission?.raw as Record<string, unknown> | undefined,
  );

  const {
    latitude: iotLat,
    longitude: iotLng,
    hasPosition: hasIotPosition,
    battery: iotBattery,
    serial: iotSerial,
    trackPoints,
  } = useLiveGps(containerId);

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const site = displayMission?.raw
    ? ((displayMission.raw as Record<string, any>).Site ??
      (displayMission.raw as Record<string, any>).site)
    : null;

  const destination =
    site?.latitude != null && site?.longitude != null
      ? {
          latitude: Number(site.latitude),
          longitude: Number(site.longitude),
        }
      : null;

  const warehouse = {
    latitude: WAREHOUSE.latitude,
    longitude: WAREHOUSE.longitude,
  };

  const iotCoordinate =
    hasIotPosition && iotLat != null && iotLng != null
      ? { latitude: iotLat, longitude: iotLng }
      : null;

  const trailCoordinates = useMemo(
    () =>
      trackPoints
        .map((point) => ({
          latitude: Number(point.latitude),
          longitude: Number(point.longitude),
        }))
        .filter(
          (point) =>
            Number.isFinite(point.latitude) &&
            Number.isFinite(point.longitude) &&
            !(point.latitude === 0 && point.longitude === 0),
        ),
    [trackPoints],
  );

  const contactPhone =
    user?.role === "driver"
      ? (displayMission?.raw as Record<string, any>)?.technician?.phone
      : (displayMission?.raw as Record<string, any>)?.driver?.phone;

  const showDirections =
    !!destination &&
    !!location &&
    GOOGLE_API_KEY &&
    GOOGLE_API_KEY !== "YOUR_GOOGLE_API_KEY";

  useEffect(() => {
    if (!destination) return;

    const points = [
      warehouse,
      ...trailCoordinates,
      ...(iotCoordinate ? [iotCoordinate] : []),
      destination,
    ];

    if (points.length > 1) {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 90, right: 70, bottom: 260, left: 70 },
        animated: true,
      });
    }
  }, [
    destination?.latitude,
    destination?.longitude,
    iotCoordinate?.latitude,
    iotCoordinate?.longitude,
    trailCoordinates,
  ]);

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!displayMission || !destination) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>No active mission with site location</Text>
      </View>
    );
  }

  if (!containerId) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white", textAlign: "center", paddingHorizontal: 24 }}>
          Mission {displayMission.id} has no IoT container
        </Text>
        <Text style={{ color: "#9ca3af", marginTop: 8, textAlign: "center", paddingHorizontal: 24 }}>
          Import a mission JSON with container_id (CTR-IOT-001…) from web admin.
        </Text>
      </View>
    );
  }

  if (displayMission.statusRaw !== "in-progress") {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white", textAlign: "center", paddingHorizontal: 24 }}>
          Mission {displayMission.id} — en attente
        </Text>
        <Text style={{ color: "#9ca3af", marginTop: 8, textAlign: "center", paddingHorizontal: 24 }}>
          Le conducteur assigné doit scanner le QR de la mission (MIS-…) à l&apos;entrepôt Oued Smar.
        </Text>
        <Pressable
          style={[styles.callBtn, { marginTop: 16 }]}
          onPress={() => notifyMissionRefresh()}
        >
          <Text style={styles.callText}>Actualiser</Text>
        </Pressable>
      </View>
    );
  }

  const region: Region = {
    latitude: iotCoordinate?.latitude ?? location?.latitude ?? destination.latitude,
    longitude: iotCoordinate?.longitude ?? location?.longitude ?? destination.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={enabled}
      >
        {location && <Marker coordinate={location} title="You" pinColor="#3b82f6" />}

        <Marker coordinate={warehouse} title={WAREHOUSE.name} pinColor="#f59e0b" />

        <Marker coordinate={destination} title={displayMission.site} pinColor="#22c55e" />

        {iotCoordinate && (
          <Marker coordinate={iotCoordinate} title="Container (IoT)">
            <View style={styles.iotMarker}>
              <Truck color="#fff" size={18} />
            </View>
          </Marker>
        )}

        {trailCoordinates.length > 0 ? (
          <Polyline
            coordinates={[warehouse, ...trailCoordinates]}
            strokeColor="#2563eb"
            strokeWidth={5}
          />
        ) : (
          <Polyline
            coordinates={[warehouse, destination]}
            strokeColor="#6b7280"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}

        {iotCoordinate && (
          <Polyline
            coordinates={[iotCoordinate, destination]}
            strokeColor="#60a5fa"
            strokeWidth={3}
            lineDashPattern={[8, 6]}
          />
        )}

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
        <Text style={styles.title}>{displayMission.site}</Text>
        <Text style={styles.sub}>{displayMission.address || displayMission.company}</Text>

        <Text style={styles.info}>
          📦 {displayMission.items} items • {displayMission.status}
        </Text>

        {containerId ? (
          <Text style={styles.info}>
            {hasIotPosition
              ? `📡 IoT ${iotSerial || "GPS"} • ${iotLat?.toFixed(5)}, ${iotLng?.toFixed(5)}${iotBattery != null ? ` • 🔋 ${iotBattery}%` : ""}`
              : "⏳ Waiting for IoT GPS simulation…"}
          </Text>
        ) : null}

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
  iotMarker: {
    backgroundColor: "#1d4ed8",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#60a5fa",
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
