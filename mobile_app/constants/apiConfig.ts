import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

const API_PORT = process.env.EXPO_PUBLIC_API_PORT ?? "5000";
const API_PATH = "/api";

/** Normalize base URL: no trailing slash, always ends with /api */
export function normalizeApiBaseUrl(raw: string): string {
  let url = raw.trim();
  if (!url) return "";

  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }

  url = url.replace(/\/+$/, "");

  if (!url.endsWith(API_PATH)) {
    url = `${url}${API_PATH}`;
  }

  return url;
}

function isPrivateLanHost(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  return false;
}

/** Expo tunnel cannot reach your PC's localhost:5000 backend. */
function isExpoTunnelHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h.includes("exp.direct") ||
    h.includes("expo.dev") ||
    h.includes("ngrok") ||
    h.includes("tunnel")
  );
}

/** Host from Metro bundle URL — reliable in Expo Go on a physical phone. */
function getHostFromMetroBundle(): string | null {
  try {
    const scriptURL: string | undefined =
      NativeModules.SourceCode?.scriptURL ??
      (Constants as { scriptURL?: string }).scriptURL;

    if (!scriptURL) return null;

    const match = scriptURL.match(/^https?:\/\/([^/:]+)/i);
    const host = match?.[1]?.trim();
    if (!host || isExpoTunnelHost(host)) return null;
    return host;
  } catch {
    return null;
  }
}

/** Host running Metro (Expo Go) — same machine as the backend in local dev. */
function getExpoDevServerHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost ??
    (
      Constants.manifest2 as
        | { extra?: { expoGo?: { debuggerHost?: string } } }
        | undefined
    )?.extra?.expoGo?.debuggerHost ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(":")[0]?.trim();
    if (host && !isExpoTunnelHost(host)) return host;
  }

  return getHostFromMetroBundle();
}

function buildUrlForHost(host: string): string {
  if (host === "localhost" || host === "127.0.0.1") {
    if (Platform.OS === "android") {
      return normalizeApiBaseUrl(`http://10.0.2.2:${API_PORT}`);
    }
    return normalizeApiBaseUrl(`http://127.0.0.1:${API_PORT}`);
  }
  return normalizeApiBaseUrl(`http://${host}:${API_PORT}`);
}

/**
 * Resolves backend base URL (includes /api).
 * Optimized for **Expo Go** on a phone: uses the same LAN IP as Metro when EXPO_PUBLIC_API_URL=auto.
 */
export function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv && fromEnv.toLowerCase() !== "auto") {
    return normalizeApiBaseUrl(fromEnv);
  }

  const devHost = getExpoDevServerHost();
  if (devHost && isPrivateLanHost(devHost)) {
    return buildUrlForHost(devHost);
  }

  if (Platform.OS === "android") {
    return normalizeApiBaseUrl(`http://10.0.2.2:${API_PORT}`);
  }

  return normalizeApiBaseUrl(`http://127.0.0.1:${API_PORT}`);
}

export const API_BASE_URL = resolveApiBaseUrl();

/** Hint when Expo Go is on tunnel mode (backend on PC won't be reachable). */
export const EXPO_GO_CONNECTION_HINT =
  "Expo Go: start with `npx expo start --lan`, open the QR on the same Wi‑Fi as your PC, and run the backend on port 5000.";

if (__DEV__) {
  const devHost = getExpoDevServerHost();
  console.log("[api] Expo Go / dev host:", devHost ?? "(none)");
  console.log("[api] base URL:", API_BASE_URL);
  if (devHost && isExpoTunnelHost(devHost)) {
    console.warn("[api] Tunnel mode detected — use LAN, not Tunnel, in Expo Go.");
  }
}
