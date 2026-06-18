import { API_BASE_URL, EXPO_GO_CONNECTION_HINT } from "@/constants/apiConfig";

class APIClient {
  private baseURL: string;
  private timeout: number = 10000;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const pathPart = path.startsWith("/") ? path : `/${path}`;
    const url = `${this.baseURL}${pathPart}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {};
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !(options.body instanceof URLSearchParams)
    ) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        let message = text;
        let payload: Record<string, unknown> | undefined;
        try {
          const parsed = JSON.parse(text) as {
            error?: string;
            message?: string;
            validation?: unknown;
            rejected?: unknown;
          };
          payload = parsed as Record<string, unknown>;
          message = parsed.error ?? parsed.message ?? text;
        } catch {
          // keep raw text
        }
        const err = new Error(message || `Request failed (${response.status})`) as Error & {
          status?: number;
          data?: Record<string, unknown>;
        };
        err.status = response.status;
        err.data = payload;
        throw err;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(
            `Request timed out (${url}). Start the backend (npm run dev in backend/) and ensure the phone and PC are on the same Wi‑Fi.`,
          );
        }
        if (
          error.message.includes("Network request failed") ||
          error.message.includes("Failed to fetch")
        ) {
          throw new Error(
            `Cannot reach ${this.baseURL}. ` +
              EXPO_GO_CONNECTION_HINT +
              " Or run: cd mobile_app && npm run env:api",
          );
        }
      }

      throw error;
    }
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body:
        body instanceof FormData || body instanceof URLSearchParams
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    });
  }

  put<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

const api = new APIClient(API_BASE_URL);
export default api;
