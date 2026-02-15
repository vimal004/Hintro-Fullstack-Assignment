import { create } from "zustand";
import { mockUsers } from "../data/mockData";

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));

    const user = mockUsers.find((u) => u.email === email);
    if (user && password.length >= 4) {
      const token = "mock-jwt-token-" + Date.now();
      localStorage.setItem("taskflow_token", token);
      localStorage.setItem("taskflow_user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    }

    set({ error: "Invalid email or password", isLoading: false });
    return false;
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });

    await new Promise((r) => setTimeout(r, 800));

    if (mockUsers.find((u) => u.email === email)) {
      set({ error: "Email already exists", isLoading: false });
      return false;
    }

    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const colors = ["#1a73e8", "#e8710a", "#1e8e3e", "#a142f4", "#d93025"];
    const newUser = {
      id: "u" + Date.now(),
      name,
      email,
      avatar: null,
      initials,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    const token = "mock-jwt-token-" + Date.now();
    localStorage.setItem("taskflow_token", token);
    localStorage.setItem("taskflow_user", JSON.stringify(newUser));
    set({ user: newUser, token, isAuthenticated: true, isLoading: false });
    return true;
  },

  logout: () => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem("taskflow_token");
    const userStr = localStorage.getItem("taskflow_user");
    if (token && userStr) {
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
