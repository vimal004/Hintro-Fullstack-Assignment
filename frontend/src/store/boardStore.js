import { create } from "zustand";
import api from "../utils/api";
import useTeamStore from "./teamStore";

const useBoardStore = create((set, get) => ({
  /* ── Data ─────────────────────────────────────────── */
  boards: [],
  boardDetail: null, // full board with lists, tasks, members, labels
  activities: [],
  users: [], // all platform users (for assignment)
  favorites: [], // board IDs that are favorited
  taskComments: {}, // taskId -> comments[]

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
    const selectedTeamId = useTeamStore.getState().selectedTeamId;
    set({ isLoading: true });
    try {
      let url = `/boards?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${pageSize}`;
      if (selectedTeamId) {
        url += `&teamId=${encodeURIComponent(selectedTeamId)}`;
      }
      const data = await api.get(url);
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

  /* ── Fetch Favorites ─────────────────────────────── */
  fetchFavorites: async () => {
    try {
      const data = await api.get("/boards/favorites");
      set({ favorites: data.favorites || [] });
    } catch (err) {
      console.error("fetchFavorites:", err);
    }
  },

  /* ── Toggle Favorite ─────────────────────────────── */
  toggleFavorite: async (boardId) => {
    // Optimistic update
    set((state) => {
      const isFav = state.favorites.includes(boardId);
      return {
        favorites: isFav
          ? state.favorites.filter((id) => id !== boardId)
          : [...state.favorites, boardId],
      };
    });
    try {
      await api.post(`/boards/${boardId}/favorite`);
    } catch (err) {
      // Rollback
      set((state) => {
        const isFav = state.favorites.includes(boardId);
        return {
          favorites: isFav
            ? state.favorites.filter((id) => id !== boardId)
            : [...state.favorites, boardId],
        };
      });
      console.error("toggleFavorite:", err);
    }
  },

  /* ── Board CRUD ───────────────────────────────────── */
  setActiveBoard: (boardId) => {
    const board = get().boards.find((b) => b.id === boardId) || null;
    set({ activeBoard: board });
  },

  createBoard: async (title, description, color, teamId) => {
    try {
      const board = await api.post("/boards", {
        title,
        description,
        color,
        teamId,
      });
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

  /* ── Duplicate Board ─────────────────────────────── */
  duplicateBoard: async (boardId) => {
    try {
      const board = await api.post(`/boards/${boardId}/duplicate`);
      set((state) => ({ boards: [board, ...state.boards] }));
      return board;
    } catch (err) {
      console.error("duplicateBoard:", err);
      return null;
    }
  },

  /* ── List CRUD ────────────────────────────────────── */
  createList: async (boardId, title) => {
    try {
      const list = await api.post(`/boards/${boardId}/lists`, { title });
      // Don't merge here — server broadcasts the event back to us
      return list;
    } catch (err) {
      console.error("createList:", err);
      return null;
    }
  },

  updateListTitle: async (boardId, listId, title) => {
    // Optimistic update
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
    try {
      await api.put(`/boards/${boardId}/lists/${listId}`, { title });
    } catch (err) {
      console.error("updateListTitle:", err);
      // Rollback
      get().fetchBoardDetail(boardId);
    }
  },

  deleteList: async (boardId, listId) => {
    // Optimistic update
    const previousLists = get().boardDetail?.lists;
    set((state) => {
      if (!state.boardDetail) return state;
      return {
        boardDetail: {
          ...state.boardDetail,
          lists: state.boardDetail.lists.filter((l) => l.id !== listId),
        },
      };
    });
    try {
      await api.del(`/boards/${boardId}/lists/${listId}`);
    } catch (err) {
      console.error("deleteList:", err);
      // Rollback
      if (previousLists) {
        set((state) => ({
          boardDetail: state.boardDetail
            ? { ...state.boardDetail, lists: previousLists }
            : state.boardDetail,
        }));
      }
    }
  },

  /* ── Task CRUD ────────────────────────────────────── */
  createTask: async (boardId, listId, taskData) => {
    try {
      const task = await api.post(
        `/boards/${boardId}/lists/${listId}/tasks`,
        taskData,
      );
      // Server broadcasts — merge handled by socket listener
      return task;
    } catch (err) {
      console.error("createTask:", err);
      return null;
    }
  },

  updateTask: async (boardId, listId, taskId, updates) => {
    // Optimistic update
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
                    t.id === taskId ? { ...t, ...updates } : t,
                  ),
                }
              : l,
          ),
        },
      };
    });
    try {
      const task = await api.put(`/boards/${boardId}/tasks/${taskId}`, updates);
      return task;
    } catch (err) {
      console.error("updateTask:", err);
      // Rollback
      get().fetchBoardDetail(boardId);
      return null;
    }
  },

  deleteTask: async (boardId, listId, taskId) => {
    // Optimistic update
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
    try {
      await api.del(`/boards/${boardId}/tasks/${taskId}`);
    } catch (err) {
      console.error("deleteTask:", err);
      get().fetchBoardDetail(boardId);
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

  /* ── Comments ─────────────────────────────────────── */
  fetchComments: async (boardId, taskId) => {
    try {
      const data = await api.get(`/boards/${boardId}/tasks/${taskId}/comments`);
      set((state) => ({
        taskComments: {
          ...state.taskComments,
          [taskId]: data.comments || [],
        },
      }));
      return data.comments;
    } catch (err) {
      console.error("fetchComments:", err);
      return [];
    }
  },

  createComment: async (boardId, taskId, text) => {
    try {
      const comment = await api.post(
        `/boards/${boardId}/tasks/${taskId}/comments`,
        { text },
      );
      set((state) => ({
        taskComments: {
          ...state.taskComments,
          [taskId]: [...(state.taskComments[taskId] || []), comment],
        },
      }));
      return comment;
    } catch (err) {
      console.error("createComment:", err);
      return null;
    }
  },

  deleteComment: async (boardId, taskId, commentId) => {
    // Optimistic
    set((state) => ({
      taskComments: {
        ...state.taskComments,
        [taskId]: (state.taskComments[taskId] || []).filter(
          (c) => c.id !== commentId,
        ),
      },
    }));
    try {
      await api.del(`/boards/${boardId}/tasks/${taskId}/comments/${commentId}`);
    } catch (err) {
      console.error("deleteComment:", err);
    }
  },

  /* ── Search & Pagination ──────────────────────────── */
  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
  },
  setCurrentPage: (page) => {
    set({ currentPage: page });
    get().fetchBoards();
  },

  /* ── Helpers ──────────────────────────────────────── */
  getUserById: (userId) => {
    const bd = get().boardDetail;
    if (bd?.members) {
      const m = bd.members.find((u) => u.id === userId);
      if (m) return m;
    }
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

  isFavorited: (boardId) => {
    return get().favorites.includes(boardId);
  },

  /* ── Real-time merge helpers (called by socketStore) ── */
  _mergeListCreated: (list) => {
    set((state) => {
      if (!state.boardDetail) return state;
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

  _mergeBoardDeleted: (boardId) => {
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== boardId),
      boardDetail: state.boardDetail?.id === boardId ? null : state.boardDetail,
      activeBoard: state.activeBoard?.id === boardId ? null : state.activeBoard,
    }));
  },

  _mergeActivity: (activity) => {
    set((state) => ({
      activities: [activity, ...state.activities],
    }));
  },

  _mergeCommentCreated: ({ taskId, comment }) => {
    set((state) => {
      // 1. Update comments map
      const newComments = {
        ...state.taskComments,
        [taskId]: [...(state.taskComments[taskId] || []), comment],
      };

      // 2. Update task count in boardDetail
      let newBoardDetail = state.boardDetail;
      if (state.boardDetail) {
        newBoardDetail = {
          ...state.boardDetail,
          lists: state.boardDetail.lists.map((list) => ({
            ...list,
            tasks: list.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    comments_count: (
                      parseInt(task.comments_count || 0) + 1
                    ).toString(),
                  }
                : task,
            ),
          })),
        };
      }

      return {
        taskComments: newComments,
        boardDetail: newBoardDetail,
      };
    });
  },

  _mergeCommentDeleted: ({ taskId, commentId }) => {
    set((state) => {
      // 1. Update comments map
      const newComments = {
        ...state.taskComments,
        [taskId]: (state.taskComments[taskId] || []).filter(
          (c) => c.id !== commentId,
        ),
      };

      // 2. Update task count in boardDetail
      let newBoardDetail = state.boardDetail;
      if (state.boardDetail) {
        newBoardDetail = {
          ...state.boardDetail,
          lists: state.boardDetail.lists.map((list) => ({
            ...list,
            tasks: list.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    comments_count: Math.max(
                      0,
                      parseInt(task.comments_count || 0) - 1,
                    ).toString(),
                  }
                : task,
            ),
          })),
        };
      }

      return {
        taskComments: newComments,
        boardDetail: newBoardDetail,
      };
    });
  },
}));

export default useBoardStore;
