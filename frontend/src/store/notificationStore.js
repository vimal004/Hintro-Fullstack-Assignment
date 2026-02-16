import { create } from "zustand";
import api from "../utils/api";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  /* ── Fetch notifications ─────────────── */
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await api.get("/notifications");
      const notifications = data.notifications || [];
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (err) {
      console.error("fetchNotifications:", err);
      set({ isLoading: false });
    }
  },

  /* ── Fetch unread count only ─────────── */
  fetchUnreadCount: async () => {
    try {
      const data = await api.get("/notifications/unread-count");
      set({ unreadCount: data.count || 0 });
    } catch (err) {
      console.error("fetchUnreadCount:", err);
    }
  },

  /* ── Mark single as read ─────────────── */
  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error("markAsRead:", err);
    }
  },

  /* ── Mark all as read ────────────────── */
  markAllAsRead: async () => {
    try {
      await api.put("/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
        })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error("markAllAsRead:", err);
    }
  },

  /* ── Accept team invite ──────────────── */
  acceptInvite: async (notifId) => {
    try {
      const data = await api.post(`/notifications/${notifId}/accept`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notifId ? { ...n, status: "accepted", is_read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      return { success: true, message: data.message, teamId: data.teamId };
    } catch (err) {
      console.error("acceptInvite:", err);
      return {
        success: false,
        message: err.data?.message || err.message || "Failed to accept invite",
      };
    }
  },

  /* ── Decline team invite ─────────────── */
  declineInvite: async (notifId) => {
    try {
      const data = await api.post(`/notifications/${notifId}/decline`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notifId ? { ...n, status: "declined", is_read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      return { success: true, message: data.message };
    } catch (err) {
      console.error("declineInvite:", err);
      return {
        success: false,
        message: err.data?.message || err.message || "Failed to decline invite",
      };
    }
  },

  /* ── Add notification from socket ────── */
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));

export default useNotificationStore;
