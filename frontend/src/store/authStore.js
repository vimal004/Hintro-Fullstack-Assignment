import { create } from "zustand";

const API_URL = "http://localhost:5000/api/auth";

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.message || "Login failed", isLoading: false });
        return false;
      }

      localStorage.setItem("taskflow_token", data.token);
      localStorage.setItem("taskflow_user", JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err) {
      set({ error: "Network error. Is the server running?", isLoading: false });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.message || "Signup failed", isLoading: false });
        return false;
      }

      localStorage.setItem("taskflow_token", data.token);
      localStorage.setItem("taskflow_user", JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err) {
      set({ error: "Network error. Is the server running?", isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const token = localStorage.getItem("taskflow_token");
    const userStr = localStorage.getItem("taskflow_user");

    if (!token || !userStr) return;

    try {
      // Validate the token by calling /me
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, token, isAuthenticated: true });
      } else {
        // Token expired or invalid — clear stored data
        localStorage.removeItem("taskflow_token");
        localStorage.removeItem("taskflow_user");
      }
    } catch {
      // Server unreachable — fall back to cached user so the app still works offline
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem("taskflow_token");
        localStorage.removeItem("taskflow_user");
      }
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
