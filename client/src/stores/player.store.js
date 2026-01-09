import { defineStore } from "pinia";
import api from "@/services/api";

export const usePlayerStore = defineStore("players", {
  state: () => ({
    players: [],
  }),

  actions: {
    async fetchPlayers() {
      const res = await api.get("/players");
      this.players = res.data;
    },

    async addPlayer(tribeId, playerData) {
      const res = await api.post("/players", {
        ...playerData,
        tribeId,
      });

      this.players.push(res.data);
    },

    async updatePlayer(id, updates) {
      const res = await api.put(`/players/${id}`, updates);
      const i = this.players.findIndex((p) => p._id === id);
      if (i !== -1) this.players[i] = res.data;
    },

    async deletePlayerFromStore(id) {
      await api.delete(`/players/${id}`);
      this.players = this.players.filter((p) => p._id !== id);
    },

    async removePlayersByTribe(tribeId) {
      await api.delete(`/players/tribe/${tribeId}`);
      this.players = this.players.filter((p) => p.tribeId !== tribeId);
    },

    playerCountByTribe(tribeId) {
      return this.players.filter((p) => p.tribeId === tribeId).length;
    },
  },
});
