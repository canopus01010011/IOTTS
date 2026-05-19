const baseURL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.97:5000/api";

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
    const url = `${this.baseURL}${path}`;
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
        throw new Error(`HTTP ${response.status} ${text}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body: any) {
    return this.request<T>(path, {
      method: "POST",
      body,
    });
  }

  put<T>(path: string, body: any) {
    return this.request<T>(path, {
      method: "PUT",
      body,
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

const api = new APIClient(baseURL);
export default api;
