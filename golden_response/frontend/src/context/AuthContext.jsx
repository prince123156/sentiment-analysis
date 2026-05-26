import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  function persist(auth) {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("user", JSON.stringify(auth.user));
    setToken(auth.token);
    setUser(auth.user);
  }

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    persist(res.data);
  }

  async function register(name, email, password) {
    const res = await api.post("/auth/register", { name, email, password });
    persist(res.data);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
