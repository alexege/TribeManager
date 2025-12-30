import { defineStore } from "pinia";
export const useMapStore = defineStore("map", {
  state: () => ({
    activeMapId: null,

    /* Hardcoded base maps (parent maps) */
    baseMaps: [
      { name: "The Island", img: "../../src/assets/images/maps/TheIsland.png" },
      {
        name: "The Center",
        img: "../../src/assets/images/maps/TheCenterMap.jpg",
      },
      {
        name: "Scorched Earth",
        img: "../../src/assets/images/maps/ScorchedEarth.png",
      },
      {
        name: "Extinction",
        img: "../../src/assets/images/maps/Extinction.png",
      },
      {
        name: "Aberration",
        img: "../../src/assets/images/maps/Aberration.png",
      },
      { name: "Ragnarok", img: "../../src/assets/images/maps/Ragnarok.png" },
      { name: "Valguero", img: "../../src/assets/images/maps/Valguero.png" },
    ],
    /* Map instances */
    mapsById: {}, // map instances keyed by ID
    mapIds: [], // list of instance IDs
    /* Points (normalized) */
    pointsById: {},
    pointIdsByMap: {},

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
    getMapById: (state) => {
      return (mapId) => {
        const map = state.mapsById[mapId];
        if (!map) return null;

        return {
          ...map,
          points: (state.pointIdsByMap[mapId] || []).map(
            (pid) => state.pointsById[pid]
          ),
        };
      };
    },
  },
  actions: {
    setActiveMap(id) {
      this.activeMapId = id;
    },

    addMapInstance({ baseMapName, title }) {
      const baseMap = this.baseMaps.find((b) => b.name === baseMapName);
      if (!baseMap) return;

      const id = Date.now();

      this.mapsById[id] = {
        id,
        baseMapName,
        title,
        img: baseMap.img,
      };

      this.mapIds.push(id);
      this.pointIdsByMap[id] = [];

      if (!this.activeMapId) {
        this.activeMapId = id;
      }
    },

    /* Add new map instance from a base map */
    addMapInstance({ baseMapName, title }) {
      const baseMap = this.baseMaps.find((b) => b.name === baseMapName);
      if (!baseMap) return;
      const id = Date.now(); // unique ID
      this.mapsById[id] = {
        id,
        baseMapName,
        title,
        img: baseMap.img,
      };
      this.mapIds.push(id);
      this.pointIdsByMap[id] = [];
    },
    deleteMapInstance(mapId) {
      const pointIds = this.pointIdsByMap[mapId] || [];
      pointIds.forEach((pid) => delete this.pointsById[pid]);
      delete this.mapsById[mapId];
      delete this.pointIdsByMap[mapId];
      this.mapIds = this.mapIds.filter((id) => id !== mapId);
    },
    /* Points */
    createPoint(mapId, point) {
      const pointId = Date.now();
      this.pointsById[pointId] = { id: pointId, ...point };
      if (!this.pointIdsByMap[mapId]) this.pointIdsByMap[mapId] = [];
      this.pointIdsByMap[mapId].push(pointId);
    },
    updatePoint(pointId, updates) {
      if (!this.pointsById[pointId]) return;
      this.pointsById[pointId] = { ...this.pointsById[pointId], ...updates };
    },
    deletePoint(mapId, pointId) {
      delete this.pointsById[pointId];
      this.pointIdsByMap[mapId] = this.pointIdsByMap[mapId].filter(
        (id) => id !== pointId
      );
    },
    updateMapName(mapId, newTitle) {
      if (!this.mapsById[mapId]) return;
      this.mapsById[mapId].title = newTitle;
    },
  },
});
