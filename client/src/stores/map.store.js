
// stores/map.store.js
import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import api from "@/services/api"; // Use your centralized api service
export const useMapStore = defineStore("map", () => {

// ─────────────
// STATE
// ─────────────
const activeMapId = ref(null);
const activeMapTab = ref("all");
const activeBaseMapName = ref("The Island");
const mapsById = reactive({});
const mapIds = ref([]);
const pointsById = reactive({});
const pointIdsByMap = reactive({});
const loading = ref(false);
const error = ref(null);

// ─────────────
// STATIC BASE MAPS & CATEGORIES
// ─────────────
const baseMaps = ref([
    { name: "The Island", img: "../../src/assets/images/maps/TheIsland.png" },
    { name: "The Center", img: "../../src/assets/images/maps/TheCenterMap.jpg" },
    { name: "Scorched Earth", img: "../../src/assets/images/maps/ScorchedEarth.png" },
    { name: "Astraeos", img: "../../src/assets/images/maps/Astraeos.png" },
    { name: "Extinction", img: "../../src/assets/images/maps/Extinction.png" },
    { name: "Aberration", img: "../../src/assets/images/maps/Aberration.png" },
    { name: "Ragnarok", img: "../../src/assets/images/maps/Ragnarok.png" },
    { name: "Valguero", img: "../../src/assets/images/maps/Valguero.png" },
    { name: "LostColony", img: "../../src/assets/images/maps/LostColony.png" },
]);
const categories = [
    { name: "Raid-Target", icon: "colorize" },
    { name: "Base-Spot", icon: "colorize" },
    { name: "Turrets", icon: "warning" },
    { name: "Resource", icon: "target" },
    { name: "Obelisk", icon: "radio_button_checked" },
    { name: "Transmitter", icon: "cell_tower" },
    { name: "Death-Marker", icon: "skull" },
    { name: "Tame", icon: "pets" },
    { name: "Artifact", icon: "trophy" },
    { name: "Navigation", icon: "location_on" },
    { name: "Waypoint", icon: "home_pin" },
];
// ─────────────
// HELPERS
// ─────────────
const clearErrors = () => (error.value = null);
// ─────────────
// GETTERS
// ─────────────
const activeMap = computed(() => {
    if (!activeMapId.value) return null;
    const map = mapsById[activeMapId.value];
    if (!map) return null;
    return {
        ...map,
        points: (pointIdsByMap[activeMapId.value] || []).map(
            (pid) => pointsById[pid]
        ),
    };
});
const groupedMaps = computed(() =>
    mapIds.value.reduce((acc, id) => {
        const map = mapsById[id];
        let group = acc.find((g) => g.name === map.baseMapName);
        if (!group) {
            group = { name: map.baseMapName, img: map.img, maps: [] };
            acc.push(group);
        }
        group.maps.push({
            ...map,
            points: (pointIdsByMap[id] || []).map((pid) => pointsById[pid]),
        });
        return acc;
    }, [])
);
const currentBaseMapInstances = computed(() =>
    mapIds.value
        .filter((id) => mapsById[id]?.baseMapName === activeBaseMapName.value)
        .map((id) => mapsById[id])
);
// ─────────────
// ACTIONS
// ─────────────
const setActiveBaseMap = async (baseMapName) => {
    activeBaseMapName.value = baseMapName;
    // Set first map instance
    const firstInstance = mapIds.value.find(
        (id) => mapsById[id]?.baseMapName === baseMapName
    );
    if (firstInstance) await setActiveMap(firstInstance);
};
const setActiveMap = async (mapId) => {
    activeMapId.value = mapId;
    activeMapTab.value = "all";
    if (pointIdsByMap[mapId] === undefined) {
        await fetchPoints(mapId);
    }
};
const setActiveMapTab = (tabId) => {
    activeMapTab.value = tabId;
};
// ─────────────
// MAP CRUD
// ─────────────
const fetchMaps = async () => {
    clearErrors();
    loading.value = true;
    try {
        const { data: maps } = await api.get("/maps");
        mapsById.value = {};
        mapIds.value = [];
        maps.forEach((map) => {
            mapsById[map._id] = map;
            mapIds.value.push(map._id);
        });
    } catch (err) {
        error.value = err.response?.data?.message || err.message;
    } finally {
        loading.value = false;
    }
};
const createMapInstance = async ({ baseMapName, title }) => {
    clearErrors();
    loading.value = true;
    try {
        const baseMap = baseMaps.value.find((m) => m.name === baseMapName);
        if (!baseMap) throw new Error(`Base map "${baseMapName}" not found`);
        const { data: newMap } = await api.post("/maps", {
            baseMapName,
            title,
            img: baseMap.img,
        });
        mapIds.value.push(newMap._id);
        mapsById[newMap._id] = newMap;
        pointIdsByMap[newMap._id] = [];
        return newMap;
    } catch (err) {
        error.value = err.response?.data?.message || err.message;
        throw err;
    } finally {
        loading.value = false;
    }
};
const updateMapName = async (mapId, newTitle) => {
    clearErrors();
    loading.value = true;
    try {
        const { data: updated } = await api.put(`/maps/${mapId}`, { title: newTitle });
        mapsById[mapId] = updated;
    } catch (err) {
        error.value = err.response?.data?.message || err.message;
        throw err;
    } finally {
        loading.value = false;
    }
};
const deleteMapInstance = async (mapId) => {
    clearErrors();
    loading.value = true;
    try {
        await api.delete(`/maps/${mapId}`);
        // Clean up store
        (pointIdsByMap[mapId] || []).forEach((pid) => delete pointsById[pid]);
        delete mapsById[mapId];
        delete pointIdsByMap[mapId];
        mapIds.value = mapIds.value.filter((id) => id !== mapId);
        if (activeMapId.value === mapId) {
            if (mapIds.value.length > 0) await setActiveMap(mapIds.value[0]);
            else activeMapId.value = null;
        }
    } catch (err) {
        error.value = err.response?.data?.message || err.message;
        throw err;
    } finally {
        loading.value = false;
    }
};
// ─────────────
// POINT CRUD
// ─────────────
const fetchPoints = async (mapId) => {
    clearErrors();
    loading.value = true;
    try {
        const { data: points } = await api.get(`/points/map/${mapId}`);
        pointIdsByMap[mapId] = points.map((p) => p._id);
        points.forEach((p) => {
            pointsById[p._id] = { id: p._id, ...p };
        });
        return points;
    } catch (err) {
        error.value = err.response?.data?.message || err.message;
        throw err;
    } finally {
        loading.value = false;
    }
};
const createPoint = async (mapId, pointData) => {
    clearErrors();
    loading.value = true;
    try {
        const payload = {
            category: pointData.category || pointData.icon || "default",
            x: pointData.x,
            y: pointData.y,
            pX: pointData.pX,
            pY: pointData.pY,
            name: pointData.name || "",
            description: pointData.description || "",
            color: pointData.color || "#ff0000",
            icon: pointData.icon || pointData.category || "location_on",
            size: pointData.size || 10,
        };
        const { data: newPoint } = await api.post(`/points/map/${mapId}`, payload);
        if (!pointIdsByMap[mapId]) pointIdsByMap[mapId] = [];
        pointIdsByMap[mapId].push(newPoint._id);
        pointsById[newPoint._id] = { id: newPoint._id, ...newPoint };
        return newPoint;
    } catch (err) {
        error.value = err.response?.data?.message || err.message;
        throw err;
    } finally {
        loading.value = false;
    }
};
const updatePoint = async (pointId, updates) => {
    clearErrors();
    loading.value = true;
    try {
        const allowedFields = [
            "name", "description", "x", "y", "pX", "pY",
            "color", "icon", "category", "size"
        ];
        const payload = {};
        allowedFields.forEach((f) => {
            if (updates[f] !== undefined) payload[f] = updates[f];
        });
        const { data: updatedPoint } = await api.put(`/points/${pointId}`, payload);
        pointsById[pointId] = { id: updatedPoint._id, ...updatedPoint };
        return updatedPoint;
    } catch (err) {
        error.value = err.response?.data?.message || err.message;
        throw err;
    } finally {
        loading.value = false;
    }
};
const deletePoint = async (mapId, pointId) => {
    clearErrors();
    loading.value = true;
    try {
        await api.delete(`/points/${pointId}`);
        if (pointIdsByMap[mapId]) {
            pointIdsByMap[mapId] = pointIdsByMap[mapId].filter((id) => id !== pointId);
        }
        delete pointsById[pointId];
        return true;
    } catch (err) {
        error.value = err.response?.data?.message || err.message;
        throw err;
    } finally {
        loading.value = false;
    }
};

const initialize = async () => {
  clearErrors();
  loading.value = true;

  try {
    console.log("🚀 Initializing map store...");

    // 1️⃣ Fetch all maps
    await fetchMaps();

    // 2️⃣ If no maps exist, create default Island map
    if (mapIds.value.length === 0) {
      console.log("No maps found, creating default Island map");
      await createMapInstance({ baseMapName: "The Island", title: "The Island Map" });
    }

    // 3️⃣ Set active base map to first available or default
    if (mapIds.value.length > 0) {
      const firstMap = mapsById[mapIds.value[0]];
      activeBaseMapName.value = firstMap.baseMapName;
      await setActiveMap(firstMap._id); // ensures points are loaded
    }

    console.log("✅ Map store initialized");
  } catch (err) {
    error.value = err.response?.data?.message || err.message;
    console.error("Failed to initialize map store:", err);
  } finally {
    loading.value = false;
  }
};


// ─────────────
// RETURNED STORE
// ─────────────
return {
    activeMapId,
    activeMapTab,
    activeBaseMapName,
    baseMaps,
    categories,
    mapsById,
    mapIds,
    pointsById,
    pointIdsByMap,
    loading,
    error,
    clearErrors,
    activeMap,
    groupedMaps,
    currentBaseMapInstances,
    setActiveBaseMap,
    setActiveMap,
    setActiveMapTab,
    fetchMaps,
    createMapInstance,
    updateMapName,
    deleteMapInstance,
    fetchPoints,
    createPoint,
    updatePoint,
    deletePoint,
    initialize
  };
});


// import { defineStore } from "pinia";

// // Helper function to get auth headers
// const getAuthHeaders = () => {
//   const token = localStorage.getItem("token");
//   return {
//     "Content-Type": "application/json",
//     ...(token && { Authorization: `Bearer ${token}` }),
//   };
// };

// export const useMapStore = defineStore("map", {
//   state: () => ({
//     /* UI state */
//     activeMapId: null,
//     activeMapTab: "all",
//     activeBaseMapName: "The Island",

//     /* Static base maps (NOT persisted) */
//     baseMaps: [
//       { name: "The Island", img: "../../src/assets/images/maps/TheIsland.png" },
//       { name: "The Center", img: "../../src/assets/images/maps/TheCenterMap.jpg" },
//       { name: "Scorched Earth", img: "../../src/assets/images/maps/ScorchedEarth.png" },
//       { name: "Astraeos", img: "../../src/assets/images/maps/Astraeos.png" },
//       { name: "Extinction", img: "../../src/assets/images/maps/Extinction.png" },
//       { name: "Aberration", img: "../../src/assets/images/maps/Aberration.png" },
//       { name: "Ragnarok", img: "../../src/assets/images/maps/Ragnarok.png" },
//       { name: "Valguero", img: "../../src/assets/images/maps/Valguero.png" },
//       { name: "LostColony", img: "../../src/assets/images/maps/LostColony.png" },
//     ],

//     /* Normalized persisted data */
//     mapsById: {},       // { [mapId]: MapInstance }
//     mapIds: [],         // [mapId]

//     pointsById: {},     // { [pointId]: Point }
//     pointIdsByMap: {},  // { [mapId]: [pointId] }

//     categories: [
//       { name: "Raid-Target", icon: "colorize" },
//       { name: "Base-Spot", icon: "colorize" },
//       { name: "Turrets", icon: "warning" },
//       { name: "Resource", icon: "target" },
//       { name: "Obelisk", icon: "radio_button_checked" },
//       { name: "Transmitter", icon: "cell_tower" },
//       { name: "Death-Marker", icon: "skull" },
//       { name: "Tame", icon: "pets" },
//       { name: "Artifact", icon: "trophy" },
//       { name: "Navigation", icon: "location_on" },
//       { name: "Waypoint", icon: "home_pin" },
//     ],
//   }),

//   /* ----------------------------------
//      GETTERS
//   ---------------------------------- */
//   getters: {
//     activeMap(state) {
//       if (!state.activeMapId) return null;
//       const map = state.mapsById[state.activeMapId];
//       if (!map) return null;

//       return {
//         ...map,
//         points: (state.pointIdsByMap[state.activeMapId] || []).map(
//           (pid) => state.pointsById[pid]
//         ),
//       };
//     },

//     groupedMaps(state) {
//       return state.mapIds.reduce((acc, id) => {
//         const map = state.mapsById[id];
//         let group = acc.find((g) => g.name === map.baseMapName);

//         if (!group) {
//           group = { name: map.baseMapName, img: map.img, maps: [] };
//           acc.push(group);
//         }

//         group.maps.push({
//           ...map,
//           points: (state.pointIdsByMap[id] || []).map(
//             (pid) => state.pointsById[pid]
//           ),
//         });

//         return acc;
//       }, []);
//     },

//     // Get all map instances for the current base map
//     currentBaseMapInstances(state) {
//       return state.mapIds
//         .filter(id => state.mapsById[id]?.baseMapName === state.activeBaseMapName)
//         .map(id => state.mapsById[id]);
//     },
//   },

//   /* ----------------------------------
//      ACTIONS
//   ---------------------------------- */
//   actions: {
//     /* ---------- UI ---------- */
//     setActiveBaseMap(baseMapName) {
//       this.activeBaseMapName = baseMapName;

//       // Find first instance of this base map
//       const firstInstance = this.mapIds.find(id =>
//         this.mapsById[id]?.baseMapName === baseMapName
//       );

//       if (firstInstance) {
//         this.setActiveMap(firstInstance);
//       }
//     },

//     async setActiveMap(mapId) {
//       console.log("Setting active map to:", mapId);
//       this.activeMapId = mapId;
//       this.activeMapTab = "all";

//       // Load points if not already loaded (check if undefined, not just falsy)
//       if (this.pointIdsByMap[mapId] === undefined) {
//         console.log("📍 Points not loaded yet, fetching...");
//         await this.fetchPoints(mapId);
//       } else {
//         console.log("✅ Points already loaded:", this.pointIdsByMap[mapId].length);
//       }
//     },

//     setActiveMapTab(tabId) {
//       this.activeMapTab = tabId;
//     },

//     /* ---------- INITIALIZATION ---------- */
//     async initialize() {
//       console.log("🚀 Initializing map store...");

//       // Fetch all maps
//       await this.fetchMaps();

//       // If no maps exist, create default Island map
//       if (this.mapIds.length === 0) {
//         console.log("No maps found, creating default Island map");
//         await this.createDefaultMap();
//       }

//       // Set active base map to first available or "The Island"
//       if (this.mapIds.length > 0) {
//         const firstMap = this.mapsById[this.mapIds[0]];
//         this.activeBaseMapName = firstMap.baseMapName;
//         // Use setActiveMap to properly load points
//         await this.setActiveMap(firstMap._id);
//       }

//       console.log("✅ Map store initialized");
//     },

//     async createDefaultMap() {
//       const baseMap = this.baseMaps.find(b => b.name === "The Island");
//       if (!baseMap) return;

//       const map = await this.createMapInstance({
//         baseMapName: "The Island",
//         title: "The Island Map"
//       });

//       return map;
//     },

//     /* ---------- MAPS ---------- */
//     async fetchMaps() {
//       try {
//         const res = await fetch("/api/maps", {
//           headers: getAuthHeaders(),
//           credentials: "include"
//         });
//         const maps = await res.json() || [];

//         this.mapsById = {};
//         this.mapIds = [];

//         maps.forEach((map) => {
//           this.mapsById[map._id] = map;
//           this.mapIds.push(map._id);
//           // Don't initialize pointIdsByMap here - let it be undefined
//           // so we know when to fetch points
//         });

//         console.log("Fetched maps:", maps.length);
//       } catch (err) {
//         console.error("Failed to fetch maps:", err);
//       }
//     },

//     async createMapInstance({ baseMapName, title }) {
//       try {
//         const baseMap = this.baseMaps.find(m => m.name === baseMapName);
//         if (!baseMap) {
//           throw new Error(`Base map "${baseMapName}" not found`);
//         }

//         const payload = {
//           baseMapName,
//           title,
//           img: baseMap.img
//         };

//         const response = await fetch('/api/maps', {
//           method: 'POST',
//           headers: getAuthHeaders(),
//           credentials: 'include',
//           body: JSON.stringify(payload)
//         });

//         if (!response.ok) {
//           const error = await response.text();
//           throw new Error(error);
//         }

//         const newMap = await response.json();

//         // Add to store
//         this.mapIds.push(newMap._id);
//         this.mapsById[newMap._id] = newMap;
//         this.pointIdsByMap[newMap._id] = [];

//         return newMap;
//       } catch (err) {
//         console.error('Failed to create map:', err);
//         throw err;
//       }
//     },

//     async updateMapName(mapId, newTitle) {
//       try {
//         const res = await fetch(`/api/maps/${mapId}`, {
//           method: "PUT",
//           headers: getAuthHeaders(),
//           credentials: "include",
//           body: JSON.stringify({ title: newTitle }),
//         });

//         if (!res.ok) {
//           throw new Error("Failed to update map name");
//         }

//         const updated = await res.json();
//         this.mapsById[mapId] = updated;
//       } catch (err) {
//         console.error("Failed to update map name:", err);
//         throw err;
//       }
//     },

//     async deleteMapInstance(mapId) {
//       try {
//         const res = await fetch(`/api/maps/${mapId}`, {
//           method: "DELETE",
//           headers: getAuthHeaders(),
//           credentials: "include",
//         });

//         if (!res.ok) {
//           throw new Error("Failed to delete map instance");
//         }

//         // Clean up points
//         (this.pointIdsByMap[mapId] || []).forEach(
//           (pid) => delete this.pointsById[pid]
//         );

//         delete this.mapsById[mapId];
//         delete this.pointIdsByMap[mapId];
//         this.mapIds = this.mapIds.filter((id) => id !== mapId);

//         // If deleted map was active, switch to another
//         if (this.activeMapId === mapId) {
//           if (this.mapIds.length > 0) {
//             await this.setActiveMap(this.mapIds[0]);
//           } else {
//             this.activeMapId = null;
//           }
//         }
//       } catch (err) {
//         console.error("Failed to delete map:", err);
//         throw err;
//       }
//     },

//     /* ---------- POINTS ---------- */
//     async fetchPoints(mapId) {
//       try {
//         console.log('📍 Fetching points for map:', mapId);

//         const response = await fetch(`/api/points/map/${mapId}`, {
//           headers: getAuthHeaders(),
//           credentials: 'include'
//         });

//         if (!response.ok) {
//           const error = await response.text();
//           throw new Error(error);
//         }

//         const points = await response.json();
//         console.log('📍 Points received:', points.length);

//         // Store points
//         this.pointIdsByMap[mapId] = points.map(p => p._id);

//         points.forEach(point => {
//           this.pointsById[point._id] = {
//             id: point._id,
//             ...point
//           };
//         });

//         return points;
//       } catch (err) {
//         console.error('❌ Failed to fetch points:', err);
//         throw err;
//       }
//     },

//     async createPoint(mapId, pointData) {
//       try {
//         const payload = {
//           category: pointData.category || pointData.icon || 'default',
//           x: pointData.x,
//           y: pointData.y,
//           pX: pointData.pX,
//           pY: pointData.pY,
//           name: pointData.name || '',
//           description: pointData.description || '',
//           color: pointData.color || '#ff0000',
//           icon: pointData.icon || pointData.category || 'location_on',
//           size: pointData.size || 10
//         };

//         const response = await fetch(`/api/points/map/${mapId}`, {
//           method: 'POST',
//           headers: getAuthHeaders(),
//           credentials: 'include',
//           body: JSON.stringify(payload)
//         });

//         if (!response.ok) {
//           const error = await response.text();
//           throw new Error(error);
//         }

//         const newPoint = await response.json();

//         // Add to store
//         if (!this.pointIdsByMap[mapId]) {
//           this.pointIdsByMap[mapId] = [];
//         }
//         this.pointIdsByMap[mapId].push(newPoint._id);
//         this.pointsById[newPoint._id] = {
//           id: newPoint._id,
//           ...newPoint
//         };

//         return newPoint;
//       } catch (err) {
//         console.error('Failed to create point:', err);
//         throw err;
//       }
//     },

//     async updatePoint(pointId, updates) {
//       try {
//         const payload = {};

//         // Only send fields that are being updated
//         const allowedFields = ['name', 'description', 'x', 'y', 'pX', 'pY', 'color', 'icon', 'category', 'size'];
//         allowedFields.forEach(field => {
//           if (updates[field] !== undefined) {
//             payload[field] = updates[field];
//           }
//         });

//         const response = await fetch(`/api/points/${pointId}`, {
//           method: 'PUT',
//           headers: getAuthHeaders(),
//           credentials: 'include',
//           body: JSON.stringify(payload)
//         });

//         if (!response.ok) {
//           const error = await response.text();
//           throw new Error(error);
//         }

//         const updatedPoint = await response.json();

//         // Update in store
//         if (this.pointsById[pointId]) {
//           this.pointsById[pointId] = {
//             id: updatedPoint._id,
//             ...updatedPoint
//           };
//         }

//         return updatedPoint;
//       } catch (err) {
//         console.error('Failed to update point:', err);
//         throw err;
//       }
//     },

//     async deletePoint(mapId, pointId) {
//       try {
//         const response = await fetch(`/api/points/${pointId}`, {
//           method: 'DELETE',
//           headers: getAuthHeaders(),
//           credentials: 'include'
//         });

//         if (!response.ok) {
//           const error = await response.text();
//           throw new Error(error);
//         }

//         // Remove from store
//         if (this.pointIdsByMap[mapId]) {
//           this.pointIdsByMap[mapId] = this.pointIdsByMap[mapId].filter(
//             id => id !== pointId
//           );
//         }
//         delete this.pointsById[pointId];

//         return true;
//       } catch (err) {
//         console.error('Failed to delete point:', err);
//         throw err;
//       }
//     },
//   },
// });