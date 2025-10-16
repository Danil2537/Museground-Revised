"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../constants";
interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (res.status === 401) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Fetch user failed:", err);
      setError("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, refetchUser: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
