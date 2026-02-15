import { create } from "zustand";
import {
  mockBoards,
  mockLists,
  mockUsers,
  mockActivities,
  mockLabels,
} from "../data/mockData";

const useBoardStore = create((set, get) => ({
  /* ── Data ─────────────────────────────────────────── */
  boards: [...mockBoards],
  lists: JSON.parse(JSON.stringify(mockLists)),
  users: [...mockUsers],
  activities: [...mockActivities],
  labels: [...mockLabels],

  activeBoard: null,
  selectedTask: null,
  isTaskModalOpen: false,

  /* ── Search & Pagination ──────────────────────────── */
  searchQuery: "",
  currentPage: 1,
  pageSize: 8,

  /* ── Board CRUD ───────────────────────────────────── */
  setActiveBoard: (boardId) => {
    const board = get().boards.find((b) => b.id === boardId) || null;
    set({ activeBoard: board });
  },

  createBoard: (title, description, color) => {
    const newBoard = {
      id: "b" + Date.now(),
      title,
      description,
      color: color || "#1a73e8",
      members: [get().users[0]?.id].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const defaultLists = [
      {
        id: "l" + Date.now() + "-1",
        boardId: newBoard.id,
        title: "To Do",
        position: 0,
        tasks: [],
      },
      {
        id: "l" + Date.now() + "-2",
        boardId: newBoard.id,
        title: "In Progress",
        position: 1,
        tasks: [],
      },
      {
        id: "l" + Date.now() + "-3",
        boardId: newBoard.id,
        title: "Done",
        position: 2,
        tasks: [],
      },
    ];

    set((state) => ({
      boards: [newBoard, ...state.boards],
      lists: { ...state.lists, [newBoard.id]: defaultLists },
    }));

    return newBoard;
  },

  deleteBoard: (boardId) => {
    set((state) => {
      const { [boardId]: _, ...remainingLists } = state.lists;
      return {
        boards: state.boards.filter((b) => b.id !== boardId),
        lists: remainingLists,
        activeBoard:
          state.activeBoard?.id === boardId ? null : state.activeBoard,
      };
    });
  },

  /* ── List CRUD ────────────────────────────────────── */
  createList: (boardId, title) => {
    const boardLists = get().lists[boardId] || [];
    const newList = {
      id: "l" + Date.now(),
      boardId,
      title,
      position: boardLists.length,
      tasks: [],
    };

    set((state) => ({
      lists: {
        ...state.lists,
        [boardId]: [...(state.lists[boardId] || []), newList],
      },
    }));
  },

  deleteList: (boardId, listId) => {
    set((state) => ({
      lists: {
        ...state.lists,
        [boardId]: (state.lists[boardId] || []).filter((l) => l.id !== listId),
      },
    }));
  },

  updateListTitle: (boardId, listId, title) => {
    set((state) => ({
      lists: {
        ...state.lists,
        [boardId]: (state.lists[boardId] || []).map((l) =>
          l.id === listId ? { ...l, title } : l,
        ),
      },
    }));
  },

  /* ── Task CRUD ────────────────────────────────────── */
  createTask: (boardId, listId, taskData) => {
    const newTask = {
      id: "t" + Date.now(),
      title: taskData.title,
      description: taskData.description || "",
      labels: taskData.labels || [],
      assignees: taskData.assignees || [],
      dueDate: taskData.dueDate || null,
      priority: taskData.priority || "medium",
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      lists: {
        ...state.lists,
        [boardId]: (state.lists[boardId] || []).map((l) =>
          l.id === listId ? { ...l, tasks: [...l.tasks, newTask] } : l,
        ),
      },
    }));

    get().addActivity(
      boardId,
      newTask.id,
      "created",
      `Created task "${newTask.title}"`,
    );
    return newTask;
  },

  updateTask: (boardId, listId, taskId, updates) => {
    set((state) => ({
      lists: {
        ...state.lists,
        [boardId]: (state.lists[boardId] || []).map((l) =>
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
    }));
  },

  deleteTask: (boardId, listId, taskId) => {
    set((state) => ({
      lists: {
        ...state.lists,
        [boardId]: (state.lists[boardId] || []).map((l) =>
          l.id === listId
            ? { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) }
            : l,
        ),
      },
    }));
  },

  /* ── Drag & Drop ──────────────────────────────────── */
  moveTask: (boardId, sourceListId, destListId, sourceIndex, destIndex) => {
    set((state) => {
      const boardLists = JSON.parse(JSON.stringify(state.lists[boardId] || []));
      const sourceList = boardLists.find((l) => l.id === sourceListId);
      const destList = boardLists.find((l) => l.id === destListId);

      if (!sourceList || !destList) return state;

      const [movedTask] = sourceList.tasks.splice(sourceIndex, 1);
      destList.tasks.splice(destIndex, 0, movedTask);

      if (sourceListId !== destListId) {
        get().addActivity(
          boardId,
          movedTask.id,
          "moved",
          `Moved "${movedTask.title}" from ${sourceList.title} to ${destList.title}`,
        );
      }

      return {
        lists: { ...state.lists, [boardId]: boardLists },
      };
    });
  },

  /* ── Task Modal ───────────────────────────────────── */
  openTaskModal: (task) => set({ selectedTask: task, isTaskModalOpen: true }),
  closeTaskModal: () => set({ selectedTask: null, isTaskModalOpen: false }),

  /* ── Activity Log ─────────────────────────────────── */
  addActivity: (boardId, taskId, action, detail) => {
    const user = JSON.parse(localStorage.getItem("taskflow_user") || "{}");
    const activity = {
      id: "a" + Date.now(),
      userId: user.id || "u1",
      boardId,
      taskId,
      action,
      detail,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      activities: [activity, ...state.activities],
    }));
  },

  /* ── Search & Pagination ──────────────────────────── */
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),

  getFilteredBoards: () => {
    const { boards, searchQuery } = get();
    if (!searchQuery.trim()) return boards;
    const q = searchQuery.toLowerCase();
    return boards.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q),
    );
  },

  /* ── Helpers ──────────────────────────────────────── */
  getUserById: (userId) => get().users.find((u) => u.id === userId),
  getLabelById: (labelId) => get().labels.find((l) => l.id === labelId),
  getBoardActivities: (boardId) =>
    get().activities.filter((a) => a.boardId === boardId),
}));

export default useBoardStore;
