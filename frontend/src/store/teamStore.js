import { create } from "zustand";
import api from "../utils/api";

const useTeamStore = create((set, get) => ({
  teams: [],
  currentTeam: null,
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
      // If successful member add
      if (res.member) {
        set((state) => ({
          teamMembers: [...state.teamMembers, res.member],
        }));
        return { success: true, message: res.message };
      }
      return { success: true, message: res.message };
    } catch (err) {
      // Return error to component to handle "User not found"
      return { success: false, error: err };
    }
  },

  sendAppInvite: async (teamId, email) => {
    try {
      await api.post("/teams/invite-app", { teamId, email });
      return true;
    } catch (err) {
      console.error("sendAppInvite:", err);
      return false;
    }
  },

  setCurrentTeam: (team) => set({ currentTeam: team }),
}));

export default useTeamStore;
