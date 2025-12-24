import { defineStore } from "pinia";
import axios from "axios";

export const usePlayerStore = defineStore("players", {
  state: () => ({
    players: [],
  }),

  actions: {
    async fetchPlayers() {
      const res = await axios.get("/api/players");
      this.players = res.data;
    },

    async addPlayer(tribeId, playerData) {
      const res = await axios.post("/api/players", {
        ...playerData,
        tribeId,
      });

      // Push DB-returned document (includes _id)
      this.players.push(res.data);
    },

    async updatePlayer(id, updates) {
      const res = await axios.put(`/api/players/${id}`, updates);
      const i = this.players.findIndex((p) => p._id === id);
      if (i !== -1) this.players[i] = res.data;
    },

    async deletePlayer(id) {
      await axios.delete(`/api/players/${id}`);
      this.players = this.players.filter((p) => p._id !== id);
    },

    async removePlayersByTribe(tribeId) {
      await axios.delete(`/api/players/tribe/${tribeId}`);
      this.players = this.players.filter((p) => p.tribeId !== tribeId);
    },

    playerCountByTribe(tribeId) {
      return this.players.filter((p) => p.tribeId === tribeId).length;
    },
  },
});
