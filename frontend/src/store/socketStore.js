import { create } from "zustand";
import { io } from "socket.io-client";
import useBoardStore from "./boardStore";
import useAuthStore from "./authStore";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: [], // users currently viewing the same board
  typingUsers: {}, // { targetId: [{ userId, userName, field }] }
  toasts: [], // real-time change notifications

  connect: (token) => {
    // Prevent duplicate connections
    if (get().socket) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      set({ isConnected: true });
      console.log("[Socket] Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
      console.log("[Socket] Disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
      set({ isConnected: false });
    });

    // ── Real-time event listeners ──
    const store = useBoardStore;
    const getCurrentUserId = () => useAuthStore.getState().user?.id;

    // Server-side broadcasted events (include userId to skip self-updates)
    socket.on("list:created", (data) => {
      store.getState()._mergeListCreated(data.list);
      if (data.userId !== getCurrentUserId()) {
        get()._addToast(`New list "${data.list.title}" created`);
      }
    });
    socket.on("list:updated", (data) => {
      store.getState()._mergeListUpdated(data);
    });
    socket.on("list:deleted", (data) => {
      store.getState()._mergeListDeleted(data.listId);
      if (data.userId !== getCurrentUserId()) {
        get()._addToast("A list was deleted");
      }
    });
    socket.on("list:reordered", (data) => {
      // Re-fetch for simplicity on remote reorders
      const bd = store.getState().boardDetail;
      if (bd && bd.id === data.boardId) {
        store.getState().fetchBoardDetail(bd.id);
      }
    });
    socket.on("task:created", (data) => {
      store.getState()._mergeTaskCreated(data);
      if (data.userId !== getCurrentUserId()) {
        get()._addToast(`New task "${data.task.title}" created`);
      }
    });
    socket.on("task:updated", (data) => {
      store.getState()._mergeTaskUpdated(data);
    });
    socket.on("task:deleted", (data) => {
      store.getState()._mergeTaskDeleted(data);
      if (data.userId !== getCurrentUserId()) {
        get()._addToast("A task was deleted");
      }
    });
    socket.on("task:moved", (data) => {
      store.getState()._mergeTaskMoved(data);
    });
    socket.on("board:updated", (data) => {
      store.getState().fetchBoards();
      const bd = store.getState().boardDetail;
      if (bd && bd.id === data.boardId) {
        store.getState().fetchBoardDetail(bd.id);
      }
    });
    socket.on("board:deleted", (data) => {
      store.getState()._mergeBoardDeleted(data.boardId);
      get()._addToast("This board was deleted");
    });
    socket.on("activity:new", (data) => {
      store.getState()._mergeActivity(data.activity);
    });
    socket.on("member:added", (data) => {
      const bd = store.getState().boardDetail;
      if (bd && bd.id === data.boardId) {
        store.getState().fetchBoardDetail(bd.id);
      }
      get()._addToast("A new member was added");
    });
    socket.on("member:removed", (data) => {
      const bd = store.getState().boardDetail;
      if (bd && bd.id === data.boardId) {
        store.getState().fetchBoardDetail(bd.id);
      }
    });

    // ── Comment events ──
    socket.on("comment:created", (data) => {
      store.getState()._mergeCommentCreated(data);
      if (data.userId !== getCurrentUserId()) {
        get()._addToast("New comment added");
      }
    });
    socket.on("comment:deleted", (data) => {
      store.getState()._mergeCommentDeleted(data);
    });

    // ── Presence events ──
    socket.on("presence:list", (data) => {
      set({ onlineUsers: data.users || [] });
    });
    socket.on("presence:joined", (data) => {
      set((state) => {
        const exists = state.onlineUsers.some(
          (u) => u.userId === data.user.userId,
        );
        if (exists) return state;
        if (data.user.userId !== getCurrentUserId()) {
          get()._addToast(
            `${data.user.name || data.user.email} joined the board`,
          );
        }
        return {
          onlineUsers: [...state.onlineUsers, data.user],
        };
      });
    });
    socket.on("presence:left", (data) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((u) => u.userId !== data.userId),
      }));
    });

    // ── Typing indicators ──
    socket.on("typing:start", (data) => {
      set((state) => {
        const key = data.targetId || "global";
        const existing = state.typingUsers[key] || [];
        if (existing.some((t) => t.userId === data.userId)) return state;
        return {
          typingUsers: {
            ...state.typingUsers,
            [key]: [
              ...existing,
              {
                userId: data.userId,
                userName: data.userName,
                field: data.field,
              },
            ],
          },
        };
      });
    });
    socket.on("typing:stop", (data) => {
      set((state) => {
        const key = data.targetId || "global";
        const existing = state.typingUsers[key] || [];
        return {
          typingUsers: {
            ...state.typingUsers,
            [key]: existing.filter((t) => t.userId !== data.userId),
          },
        };
      });
    });

    // ── Notification events ──
    socket.on("notification:new", (data) => {
      // Dynamically import to avoid circular deps
      import("./notificationStore").then((mod) => {
        mod.default.getState().addNotification(data.notification);
      });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, isConnected: false, onlineUsers: [], typingUsers: {} });
  },

  joinBoard: (boardId) => {
    const { socket } = get();
    if (socket) {
      socket.emit("join-board", boardId);
    }
  },

  leaveBoard: (boardId) => {
    const { socket } = get();
    if (socket) {
      socket.emit("leave-board", boardId);
    }
    set({ onlineUsers: [], typingUsers: {} });
  },

  emitEvent: (event, data) => {
    const { socket } = get();
    if (socket) {
      socket.emit(event, data);
    }
  },

  // ── Typing helpers ──
  startTyping: (boardId, field, targetId) => {
    const { socket } = get();
    if (socket) {
      socket.emit("typing:start", { boardId, field, targetId });
    }
  },

  stopTyping: (boardId, field, targetId) => {
    const { socket } = get();
    if (socket) {
      socket.emit("typing:stop", { boardId, field, targetId });
    }
  },

  // ── Toast notifications ──
  _addToast: (message) => {
    const id = Date.now() + Math.random();
    set((state) => ({
      toasts: [...state.toasts, { id, message, createdAt: Date.now() }],
    }));
    // Auto-remove after 4s
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export default useSocketStore;
