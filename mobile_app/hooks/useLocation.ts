import { useEffect, useState } from "react";
import * as Location from "expo-location";

type LocationType = {
  latitude: number;
  longitude: number;
};

export function useLocation() {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setEnabled(false);
        setLoading(false);
        return;
      }

      setEnabled(true);

      const pos = await Location.getCurrentPositionAsync({});

      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (err) {
      console.log("Location error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    loading,
    enabled,
    refresh: requestLocation,
  };
}