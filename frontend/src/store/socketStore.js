import { create } from "zustand";
import { io } from "socket.io-client";
import useBoardStore from "./boardStore";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (token) => {
    // Prevent duplicate connections
    if (get().socket) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
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

    socket.on("list:created", (data) => {
      store.getState()._mergeListCreated(data.list);
    });
    socket.on("list:updated", (data) => {
      store.getState()._mergeListUpdated(data);
    });
    socket.on("list:deleted", (data) => {
      store.getState()._mergeListDeleted(data.listId);
    });
    socket.on("task:created", (data) => {
      store.getState()._mergeTaskCreated(data);
    });
    socket.on("task:updated", (data) => {
      store.getState()._mergeTaskUpdated(data);
    });
    socket.on("task:deleted", (data) => {
      store.getState()._mergeTaskDeleted(data);
    });
    socket.on("task:moved", (data) => {
      store.getState()._mergeTaskMoved(data);
    });
    socket.on("board:updated", (data) => {
      // Re-fetch board list and detail if currently viewing
      store.getState().fetchBoards();
      const bd = store.getState().boardDetail;
      if (bd && bd.id === data.boardId) {
        store.getState().fetchBoardDetail(bd.id);
      }
    });
    socket.on("activity:new", (data) => {
      store.getState()._mergeActivity(data.activity);
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, isConnected: false });
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
  },

  emitEvent: (event, data) => {
    const { socket } = get();
    if (socket) {
      socket.emit(event, data);
    }
  },
}));

export default useSocketStore;
