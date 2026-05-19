import type { Role } from "@/constants/roles";
import api from "@/app/services/api";
import React, {
    createContext,
    useContext,
    useState,
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
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: Role) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      user: User;
      tokens: { accessToken: string; refreshToken: string };
    }>("/auth/login", {
      email,
      password,
    });

    api.setAuthToken(response.tokens.accessToken);
    setUser(response.user);
  };

  const logout = () => {
    api.setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
}
