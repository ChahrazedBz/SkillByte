"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ← ADD THIS

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      api.get("/profile/")
        .then((res) => setUser(res.data))
        .catch(() => {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
        })
        .finally(() => setLoading(false)); // ← always stop loading
    } else {
      setLoading(false); // ← no token, stop loading immediately
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/token/", { email, password });
    Cookies.set("access_token", res.data.access, { expires: 1 });
    Cookies.set("refresh_token", res.data.refresh, { expires: 7 });
    const profile = await api.get("/profile/");
    setUser(profile.data);
  };

  const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};