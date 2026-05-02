import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  // Restore session on page refresh
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(({ data }) => {
        console.log("[Auth] Restored session:", data);
        setCurrentUser(data);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await authApi.login(email, password);
      console.log("[Auth] Login response:", data);

      // Handle both response shapes just in case
      const tokens = data.tokens || data;
      const access  = tokens.access  || data.access;
      const refresh = tokens.refresh || data.refresh;
      const user    = data.user || data;

      if (!access) {
        console.error("[Auth] No access token in response", data);
        return { success: false, error: "Login failed. No token received." };
      }

      localStorage.setItem("access_token",  access);
      localStorage.setItem("refresh_token", refresh);
      setCurrentUser(user);
      console.log("[Auth] User set:", user);
      return { success: true, user };
    } catch (err) {
      console.error("[Auth] Login error:", err.response?.data);
      const errData = err.response?.data || {};
      return {
        success: false,
        error:  errData.error || "Login failed. Please try again.",
        locked: errData.locked || false,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
