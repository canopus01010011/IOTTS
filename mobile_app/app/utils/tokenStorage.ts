import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "access_token";

export async function getStoredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.warn("Token read failed:", error);
    return null;
  }
}

export async function setStoredToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.warn("Token save failed:", error);
  }
}

export async function clearStoredToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.warn("Token clear failed:", error);
  }
}
