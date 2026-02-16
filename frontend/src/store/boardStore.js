import { create } from "zustand";
import api from "../utils/api";

const useBoardStore = create((set, get) => ({
  /* ── Data ─────────────────────────────────────────── */
  boards: [],
  boardDetail: null, // full board with lists, tasks, members, labels
  activities: [],
  users: [], // all platform users (for assignment)

  activeBoard: null,
  selectedTask: null,
  isTaskModalOpen: false,
  isLoading: false,
  isBoardLoading: false,

  /* ── Search & Pagination ──────────────────────────── */
  searchQuery: "",
  currentPage: 1,
  pageSize: 8,
  totalPages: 1,
  totalBoards: 0,

  /* ── Fetch Boards (list) ──────────────────────────── */
  fetchBoards: async () => {
    const { searchQuery, currentPage, pageSize } = get();
    set({ isLoading: true });
    try {
      const data = await api.get(
        `/boards?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${pageSize}`,
      );
      set({
        boards: data.boards,
        totalPages: data.totalPages,
        totalBoards: data.total,
        isLoading: false,
      });
    } catch (err) {
      console.error("fetchBoards:", err);
      set({ isLoading: false });
    }
  },

  /* ── Fetch Full Board Detail ──────────────────────── */
  fetchBoardDetail: async (boardId) => {
    set({ isBoardLoading: true });
    try {
      const board = await api.get(`/boards/${boardId}`);
      set({ boardDetail: board, activeBoard: board, isBoardLoading: false });
      return board;
    } catch (err) {
      console.error("fetchBoardDetail:", err);
      set({ isBoardLoading: false });
      return null;
    }
  },

  /* ── Fetch Users ──────────────────────────────────── */
  fetchUsers: async () => {
    try {
      const users = await api.get("/users");
      set({ users });
    } catch (err) {
      console.error("fetchUsers:", err);
    }
  },

  /* ── Board CRUD ───────────────────────────────────── */
  setActiveBoard: (boardId) => {
    const board = get().boards.find((b) => b.id === boardId) || null;
    set({ activeBoard: board });
  },

  createBoard: async (title, description, color) => {
    try {
      const board = await api.post("/boards", { title, description, color });
      set((state) => ({ boards: [board, ...state.boards] }));
      return board;
    } catch (err) {
      console.error("createBoard:", err);
      return null;
    }
  },

  updateBoard: async (boardId, updates) => {
    try {
      const board = await api.put(`/boards/${boardId}`, updates);
      set((state) => ({
        boards: state.boards.map((b) =>
          b.id === boardId ? { ...b, ...board } : b,
        ),
        activeBoard:
          state.activeBoard?.id === boardId
            ? { ...state.activeBoard, ...board }
            : state.activeBoard,
      }));
      return board;
    } catch (err) {
      console.error("updateBoard:", err);
      return null;
    }
  },

  deleteBoard: async (boardId) => {
    try {
      await api.del(`/boards/${boardId}`);
      set((state) => ({
        boards: state.boards.filter((b) => b.id !== boardId),
        activeBoard:
          state.activeBoard?.id === boardId ? null : state.activeBoard,
        boardDetail:
          state.boardDetail?.id === boardId ? null : state.boardDetail,
      }));
    } catch (err) {
      console.error("deleteBoard:", err);
    }
  },

  /* ── List CRUD ────────────────────────────────────── */
  createList: async (boardId, title) => {
    try {
      const list = await api.post(`/boards/${boardId}/lists`, { title });
      set((state) => {
        if (!state.boardDetail || state.boardDetail.id !== boardId)
          return state;
        return {
          boardDetail: {
            ...state.boardDetail,
            lists: [...state.boardDetail.lists, list],
          },
        };
      });
      return list;
    } catch (err) {
      console.error("createList:", err);
      return null;
    }
  },

  updateListTitle: async (boardId, listId, title) => {
    try {
      await api.put(`/boards/${boardId}/lists/${listId}`, { title });
      set((state) => {
        if (!state.boardDetail) return state;
        return {
          boardDetail: {
            ...state.boardDetail,
            lists: state.boardDetail.lists.map((l) =>
              l.id === listId ? { ...l, title } : l,
            ),
          },
        };
      });
    } catch (err) {
      console.error("updateListTitle:", err);
    }
  },

  deleteList: async (boardId, listId) => {
    try {
      await api.del(`/boards/${boardId}/lists/${listId}`);
      set((state) => {
        if (!state.boardDetail) return state;
        return {
          boardDetail: {
            ...state.boardDetail,
            lists: state.boardDetail.lists.filter((l) => l.id !== listId),
          },
        };
      });
    } catch (err) {
      console.error("deleteList:", err);
    }
  },

  /* ── Task CRUD ────────────────────────────────────── */
  createTask: async (boardId, listId, taskData) => {
    try {
      const task = await api.post(
        `/boards/${boardId}/lists/${listId}/tasks`,
        taskData,
      );
      set((state) => {
        if (!state.boardDetail) return state;
        return {
          boardDetail: {
            ...state.boardDetail,
            lists: state.boardDetail.lists.map((l) =>
              l.id === listId ? { ...l, tasks: [...l.tasks, task] } : l,
            ),
          },
        };
      });
      return task;
    } catch (err) {
      console.error("createTask:", err);
      return null;
    }
  },

  updateTask: async (boardId, listId, taskId, updates) => {
    try {
      const task = await api.put(`/boards/${boardId}/tasks/${taskId}`, updates);
      set((state) => {
        if (!state.boardDetail) return state;
        return {
          boardDetail: {
            ...state.boardDetail,
            lists: state.boardDetail.lists.map((l) =>
              l.id === listId
                ? {
                    ...l,
                    tasks: l.tasks.map((t) =>
                      t.id === taskId ? { ...t, ...task } : t,
                    ),
                  }
                : l,
            ),
          },
        };
      });
      return task;
    } catch (err) {
      console.error("updateTask:", err);
      return null;
    }
  },

  deleteTask: async (boardId, listId, taskId) => {
    try {
      await api.del(`/boards/${boardId}/tasks/${taskId}`);
      set((state) => {
        if (!state.boardDetail) return state;
        return {
          boardDetail: {
            ...state.boardDetail,
            lists: state.boardDetail.lists.map((l) =>
              l.id === listId
                ? { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) }
                : l,
            ),
          },
        };
      });
    } catch (err) {
      console.error("deleteTask:", err);
    }
  },

  /* ── Drag & Drop (Move Task) ──────────────────────── */
  moveTask: async (
    boardId,
    sourceListId,
    destListId,
    sourceIndex,
    destIndex,
  ) => {
    // Optimistic update
    set((state) => {
      if (!state.boardDetail) return state;
      const lists = JSON.parse(JSON.stringify(state.boardDetail.lists));
      const sourceList = lists.find((l) => l.id === sourceListId);
      const destList = lists.find((l) => l.id === destListId);
      if (!sourceList || !destList) return state;

      const [movedTask] = sourceList.tasks.splice(sourceIndex, 1);
      destList.tasks.splice(destIndex, 0, movedTask);

      return {
        boardDetail: { ...state.boardDetail, lists },
      };
    });

    // Persist to backend
    try {
      const board = get().boardDetail;
      if (!board) return;
      const destList = board.lists.find((l) => l.id === destListId);
      if (!destList) return;
      const task = destList.tasks[destIndex];
      if (!task) return;

      await api.put(`/boards/${boardId}/tasks/${task.id}/move`, {
        destListId,
        destPosition: destIndex,
      });
    } catch (err) {
      console.error("moveTask:", err);
      // Revert on failure — re-fetch board
      get().fetchBoardDetail(boardId);
    }
  },

  /* ── Task Modal ───────────────────────────────────── */
  openTaskModal: (task) => set({ selectedTask: task, isTaskModalOpen: true }),
  closeTaskModal: () => set({ selectedTask: null, isTaskModalOpen: false }),

  /* ── Activity Log ─────────────────────────────────── */
  fetchActivities: async (boardId, page = 1) => {
    try {
      const data = await api.get(
        `/boards/${boardId}/activities?page=${page}&limit=30`,
      );
      set({ activities: data.activities });
      return data;
    } catch (err) {
      console.error("fetchActivities:", err);
      return { activities: [] };
    }
  },

  /* ── Labels ───────────────────────────────────────── */
  createLabel: async (boardId, { name, color }) => {
    try {
      const label = await api.post(`/boards/${boardId}/labels`, {
        name,
        color,
      });
      set((state) => {
        if (!state.boardDetail) return state;
        return {
          boardDetail: {
            ...state.boardDetail,
            labels: [...state.boardDetail.labels, label],
          },
        };
      });
      return label;
    } catch (err) {
      console.error("createLabel:", err);
      return null;
    }
  },

  /* ── Members ──────────────────────────────────────── */
  addBoardMember: async (boardId, userId) => {
    try {
      const members = await api.post(`/boards/${boardId}/members`, { userId });
      set((state) => {
        if (!state.boardDetail || state.boardDetail.id !== boardId)
          return state;
        return {
          boardDetail: { ...state.boardDetail, members },
        };
      });
      return members;
    } catch (err) {
      console.error("addBoardMember:", err);
    }
  },

  removeBoardMember: async (boardId, userId) => {
    try {
      await api.del(`/boards/${boardId}/members/${userId}`);
      set((state) => {
        if (!state.boardDetail) return state;
        return {
          boardDetail: {
            ...state.boardDetail,
            members: state.boardDetail.members.filter((m) => m.id !== userId),
          },
        };
      });
    } catch (err) {
      console.error("removeBoardMember:", err);
    }
  },

  /* ── Search & Pagination ──────────────────────────── */
  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    // Debounced fetch is handled at component level
  },
  setCurrentPage: (page) => {
    set({ currentPage: page });
    get().fetchBoards();
  },

  /* ── Helpers ──────────────────────────────────────── */
  getUserById: (userId) => {
    const bd = get().boardDetail;
    // Try board members first
    if (bd?.members) {
      const m = bd.members.find((u) => u.id === userId);
      if (m) return m;
    }
    // Then platform users
    return get().users.find((u) => u.id === userId);
  },

  getLabelById: (labelId) => {
    const bd = get().boardDetail;
    if (bd?.labels) {
      return bd.labels.find((l) => l.id === labelId);
    }
    return null;
  },

  getBoardActivities: (boardId) => {
    return get().activities.filter((a) => a.board_id === boardId);
  },

  /* ── Real-time merge helpers (called by socketStore) ── */
  _mergeListCreated: (list) => {
    set((state) => {
      if (!state.boardDetail) return state;
      // Avoid duplicates
      if (state.boardDetail.lists.some((l) => l.id === list.id)) return state;
      return {
        boardDetail: {
          ...state.boardDetail,
          lists: [...state.boardDetail.lists, list],
        },
      };
    });
  },

  _mergeListUpdated: (data) => {
    set((state) => {
      if (!state.boardDetail) return state;
      return {
        boardDetail: {
          ...state.boardDetail,
          lists: state.boardDetail.lists.map((l) =>
            l.id === data.id ? { ...l, ...data } : l,
          ),
        },
      };
    });
  },

  _mergeListDeleted: (listId) => {
    set((state) => {
      if (!state.boardDetail) return state;
      return {
        boardDetail: {
          ...state.boardDetail,
          lists: state.boardDetail.lists.filter((l) => l.id !== listId),
        },
      };
    });
  },

  _mergeTaskCreated: ({ listId, task }) => {
    set((state) => {
      if (!state.boardDetail) return state;
      return {
        boardDetail: {
          ...state.boardDetail,
          lists: state.boardDetail.lists.map((l) =>
            l.id === listId && !l.tasks.some((t) => t.id === task.id)
              ? { ...l, tasks: [...l.tasks, task] }
              : l,
          ),
        },
      };
    });
  },

  _mergeTaskUpdated: ({ listId, task }) => {
    set((state) => {
      if (!state.boardDetail) return state;
      return {
        boardDetail: {
          ...state.boardDetail,
          lists: state.boardDetail.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  tasks: l.tasks.map((t) =>
                    t.id === task.id ? { ...t, ...task } : t,
                  ),
                }
              : l,
          ),
        },
      };
    });
  },

  _mergeTaskDeleted: ({ listId, taskId }) => {
    set((state) => {
      if (!state.boardDetail) return state;
      return {
        boardDetail: {
          ...state.boardDetail,
          lists: state.boardDetail.lists.map((l) =>
            l.id === listId
              ? { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) }
              : l,
          ),
        },
      };
    });
  },

  _mergeTaskMoved: (data) => {
    // Full re-fetch for simplicity on remote moves
    const bd = get().boardDetail;
    if (bd) get().fetchBoardDetail(bd.id);
  },

  _mergeActivity: (activity) => {
    set((state) => ({
      activities: [activity, ...state.activities],
    }));
  },
}));

export default useBoardStore;
