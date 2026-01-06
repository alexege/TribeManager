import { defineStore } from "pinia";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const useMapStore = defineStore("map", {
  state: () => ({
    /* UI state */
    activeMapId: null,
    activeMapTab: "all",

    /* Static base maps (NOT persisted) */
    baseMaps: [
      { name: "The Island", img: "../../src/assets/images/maps/TheIsland.png" },
      { name: "The Center", img: "../../src/assets/images/maps/TheCenterMap.jpg" },
      { name: "Scorched Earth", img: "../../src/assets/images/maps/ScorchedEarth.png" },
      { name: "Astraeos", img: "../../src/assets/images/maps/Astraeos.png" },
      { name: "Extinction", img: "../../src/assets/images/maps/Extinction.png" },
      { name: "Aberration", img: "../../src/assets/images/maps/Aberration.png" },
      { name: "Ragnarok", img: "../../src/assets/images/maps/Ragnarok.png" },
      { name: "Valguero", img: "../../src/assets/images/maps/Valguero.png" },
      { name: "LostColony", img: "../../src/assets/images/maps/LostColony.png" },
    ],

    /* Normalized persisted data */
    mapsById: {},       // { [mapId]: MapInstance }
    mapIds: [],         // [mapId]

    pointsById: {},     // { [pointId]: Point }
    pointIdsByMap: {},  // { [mapId]: [pointId] }

    categories: [
      { name: "Raid-Target", icon: "colorize" },
      { name: "Turrets", icon: "warning" },
      { name: "Resource", icon: "target" },
      { name: "Obelisk", icon: "radio_button_checked" },
      { name: "Transmitter", icon: "cell_tower" },
      { name: "Death-Marker", icon: "skull" },
      { name: "Tame", icon: "pets" },
      { name: "Artifact", icon: "trophy" },
      { name: "Navigation", icon: "location_on" },
      { name: "Waypoint", icon: "home_pin" },
    ],
  }),

  /* ----------------------------------
     GETTERS
  ---------------------------------- */
  getters: {
    activeMap(state) {
      if (!state.activeMapId) return null;
      const map = state.mapsById[state.activeMapId];
      if (!map) return null;

      return {
        ...map,
        points: (state.pointIdsByMap[state.activeMapId] || []).map(
          (pid) => state.pointsById[pid]
        ),
      };
    },

    groupedMaps(state) {
      return state.mapIds.reduce((acc, id) => {
        const map = state.mapsById[id];
        let group = acc.find((g) => g.name === map.baseMapName);

        if (!group) {
          group = { name: map.baseMapName, img: map.img, maps: [] };
          acc.push(group);
        }

        group.maps.push({
          ...map,
          points: (state.pointIdsByMap[id] || []).map(
            (pid) => state.pointsById[pid]
          ),
        });

        return acc;
      }, []);
    },
  },

  hasLoadedPoints: (state) => {
    return (mapId) => Array.isArray(state.pointIdsByMap[mapId]);
  },

  /* ----------------------------------
     ACTIONS
  ---------------------------------- */
  actions: {
    /* ---------- UI ---------- */
    setActiveMap(id) {
      this.activeMapId = id;
      this.activeMapTab = "all";
    },

    setActiveMapTab(tabId) {
      this.activeMapTab = tabId;
    },

    /* ---------- MAPS ---------- */
    ensureMapInstance(baseMapName) {
      // Check if a map instance already exists for this base map
      const existingId = this.mapIds.find((id) => {
        return this.mapsById[id]?.baseMapName === baseMapName;
      });

      if (existingId) {
        this.activeMapId = existingId;
        this.activeMapTab = "all";
        return;
      }

      // Otherwise create a default instance
      const baseMap = this.baseMaps.find((b) => b.name === baseMapName);
      if (!baseMap) return;

      const id = Date.now();

      this.mapsById[id] = {
        id,
        baseMapName,
        title: `${baseMapName} Map`,
        img: baseMap.img,
      };

      this.mapIds.push(id);
      this.pointIdsByMap[id] = [];
      this.activeMapId = id;
      this.activeMapTab = "all";
    },

    async fetchMaps() {
      const res = await fetch("/api/maps", {
        headers: getAuthHeaders(),
        credentials: "include"
      });
      const maps = await res.json() || [];

      this.mapsById = {};
      this.mapIds = [];

      maps.forEach((map) => {
        this.mapsById[map._id] = map;
        this.mapIds.push(map._id);
        this.pointIdsByMap[map._id] = [];
      });

      if (!this.activeMapId && this.mapIds.length) {
        this.setActiveMap(this.mapIds[0]);
      }
    },

    async createMapInstance({ baseMapName, title }) {
      const baseMap = this.baseMaps.find((b) => b.name === baseMapName);
      if (!baseMap) return;

      const res = await fetch("/api/maps", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          baseMapName,
          title,
          img: baseMap.img,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create map instance");
      }

      const map = await res.json();

      this.mapsById[map._id] = map;
      this.mapIds.push(map._id);
      this.pointIdsByMap[map._id] = [];

      this.setActiveMap(map._id);
      return map._id;
    },

    async updateMapName(mapId, newTitle) {
      const res = await fetch(`/api/maps/${mapId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ title: newTitle }),
      });

      if (!res.ok) {
        throw new Error("Failed to update map name");
      }

      const updated = await res.json();
      this.mapsById[mapId] = updated;
    },

    async deleteMapInstance(mapId) {
      const res = await fetch(`/api/maps/${mapId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete map instance");
      }

      (this.pointIdsByMap[mapId] || []).forEach(
        (pid) => delete this.pointsById[pid]
      );

      delete this.mapsById[mapId];
      delete this.pointIdsByMap[mapId];
      this.mapIds = this.mapIds.filter((id) => id !== mapId);

      if (this.activeMapId === mapId) {
        this.activeMapId = this.mapIds[0] || null;
      }
    },

    /* ---------- POINTS ---------- */
    async fetchPoints(mapId) {
      const res = await fetch(`/api/points/map/${mapId}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch points");
      }
      const points = await res.json();

      this.pointIdsByMap[mapId] = [];
      points.forEach((p) => {
        this.pointsById[p._id] = p;
        this.pointIdsByMap[mapId].push(p._id);
      });
    },

    async createPoint(mapId, point) {
      const res = await fetch(`/api/points/map/${mapId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(point),
      });

      if (!res.ok) {
        throw new Error("Failed to create point");
      }

      const created = await res.json();

      this.pointsById[created._id] = created;
      this.pointIdsByMap[mapId].push(created._id);
    },

    async updatePoint(pointId, updates) {
      const res = await fetch(`/api/points/${pointId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error("Failed to update point");
      }

      const updated = await res.json();
      this.pointsById[pointId] = updated;
    },

    async deletePoint(mapId, pointId) {
      const res = await fetch(`/api/points/${pointId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete point");
      }

      delete this.pointsById[pointId];
      this.pointIdsByMap[mapId] = this.pointIdsByMap[mapId].filter(
        (id) => id !== pointId
      );
    },

    async addTheIslandMap() {
    // Prevent duplicates (optional but recommended)
    const existingId = this.mapIds.find(
      (id) => this.mapsById[id]?.baseMapName === "The Island"
    );

    if (existingId) {
      this.setActiveMap(existingId);
      return existingId;
    }

    const baseMap = this.baseMaps.find((b) => b.name === "The Island");

    if (!baseMap) {
      throw new Error("Base map 'The Island' not found");
    }

    const res = await fetch("/api/maps", {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        baseMapName: "The Island",
        title: "The Island Map",
        img: baseMap.img,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to create map");
    }

    const map = await res.json();

    this.mapsById[map._id] = map;
    this.mapIds.push(map._id);
    this.pointIdsByMap[map._id] = [];

    this.setActiveMap(map._id);

    return map._id;
  }

  },
});
