import { create } from "zustand";

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: [],

  connect: (token) => {
    // Placeholder for real socket.io connection
    // In production: const socket = io(SOCKET_URL, { auth: { token } });
    console.log("[Socket] Connecting with token…");

    // Simulate connection
    setTimeout(() => {
      set({ isConnected: true });
      console.log("[Socket] Connected");
    }, 500);
  },

  disconnect: () => {
    set({ socket: null, isConnected: false, onlineUsers: [] });
    console.log("[Socket] Disconnected");
  },

  joinBoard: (boardId) => {
    console.log(`[Socket] Joined board room: ${boardId}`);
  },

  leaveBoard: (boardId) => {
    console.log(`[Socket] Left board room: ${boardId}`);
  },

  emitTaskUpdate: (event, data) => {
    console.log(`[Socket] Emitting ${event}:`, data);
  },
}));

export default useSocketStore;
