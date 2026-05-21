import api from "@/app/services/api";
import { isNetworkError } from "@/app/utils/networkError";
import {
  clearCachedUser,
  getCachedUser,
  setCachedUser,
  type CachedUser,
} from "@/app/utils/userCache";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/app/utils/tokenStorage";
import type { Role } from "@/constants/roles";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type User = {
  id: string;
  full_name: string;
  role: Role;
  phone?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  isRestoring: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await getStoredToken();

        if (!token) {
          return;
        }

        api.setAuthToken(token);
        const me = await api.get<{ success: boolean; user: User }>("/auth/me");
        setUser(me.user);
        await setCachedUser(me.user as CachedUser);
      } catch (err) {
        console.log("Failed to restore session", err);
        if (isNetworkError(err)) {
          const cached = await getCachedUser();
          if (cached) {
            setUser(cached as User);
            return;
          }
        }
        api.setAuthToken(null);
        await clearStoredToken();
        await clearCachedUser();
      } finally {
        setIsRestoring(false);
      }
    };

    loadToken();
  }, []);

  const login = async (email: string, password: string, role?: Role) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      user: User;
      tokens: { accessToken: string; refreshToken: string };
    }>("/auth/login", {
      email,
      password,
    });

    const user = response.user;

    if (user.role === "admin") {
      throw new Error("this application is only for thecnician and drivers");
    }

    if (role && user.role !== role) {
      throw new Error(
        `make sure you entered the correct role.`
      );
    }

    const token = response.tokens.accessToken;

    api.setAuthToken(token);
    await setStoredToken(token);

    setUser(user);
    await setCachedUser(user as CachedUser);
  };

  const logout = async () => {
    api.setAuthToken(null);
    await clearStoredToken();
    await clearCachedUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isRestoring, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
}