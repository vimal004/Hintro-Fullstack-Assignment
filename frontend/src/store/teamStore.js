import { create } from "zustand";
import api from "../utils/api";

const useTeamStore = create((set, get) => ({
  teams: [],
  currentTeam: null,
  selectedTeamId: null, // null = all boards, "personal" = personal only, uuid = specific team
  teamMembers: [],
  isLoading: false,

  /* ── Actions ───────────────────────────── */
  fetchMyTeams: async () => {
    set({ isLoading: true });
    try {
      const data = await api.get("/teams");
      set({ teams: data.teams, isLoading: false });
    } catch (err) {
      console.error("fetchMyTeams:", err);
      set({ isLoading: false });
    }
  },

  createTeam: async (name) => {
    try {
      const data = await api.post("/teams", { name });
      set((state) => ({ teams: [data.team, ...state.teams] }));
      return data.team;
    } catch (err) {
      console.error("createTeam:", err);
      return null;
    }
  },

  fetchTeamMembers: async (teamId) => {
    try {
      const data = await api.get(`/teams/${teamId}/members`);
      set({ teamMembers: data.members });
    } catch (err) {
      console.error("fetchTeamMembers:", err);
    }
  },

  inviteMember: async (teamId, email) => {
    try {
      const res = await api.post(`/teams/${teamId}/invite`, { email });
      return { success: true, message: res.message };
    } catch (err) {
      console.error("inviteMember error:", err);
      return {
        success: false,
        error: {
          message: err.message || "Failed to invite member",
          data: err.data || {},
          status: err.status,
          code: err.data?.code,
        },
      };
    }
  },

  setCurrentTeam: (team) => set({ currentTeam: team }),
  setSelectedTeamId: (teamId) => set({ selectedTeamId: teamId }),
}));

export default useTeamStore;
