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
    activeMapInstance: "The Island",

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
      this.fetchPoints(this.activeMapId);
      console.log("########## setting active map to########", id);
      this.activeMapId = id;
      this.activeMapTab = "all";
    },

    setActiveMapTab(tabId) {
      this.activeMapTab = tabId;
    },

    setActiveMapInstance(mapName) {
      this.activeMapInstance = mapName;
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
  try {
    // Find the base map to get the image
    const baseMap = this.baseMaps.find(m => m.name === baseMapName)
    if (!baseMap) {
      throw new Error(`Base map "${baseMapName}" not found`)
    }

    const payload = {
      baseMapName,
      title,
      img: baseMap.img
    }

    console.log('Creating map with payload:', payload)

    const response = await fetch('/api/maps', {
      method: 'POST',
      headers: getAuthHeaders(), // Make sure you have this helper
      credentials: 'include',
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    const newMap = await response.json()
    console.log('Map created:', newMap)

    // Add to store
    this.mapIds.push(newMap._id)
    this.mapsById[newMap._id] = {
      id: newMap._id,
      ...newMap
    }

    // Initialize empty points array for this map
    this.pointIdsByMap[newMap._id] = []

    // Return the created map
    return {
      id: newMap._id,
      ...newMap
    }
  } catch (err) {
    console.error('Failed to create map:', err)
    throw err
  }
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
    // async fetchPoints(mapId) {
    //   const res = await fetch(`/api/points/map/${mapId}`, {
    //     headers: getAuthHeaders(),
    //     credentials: "include",
    //   });

    //   if (!res.ok) {
    //     throw new Error("Failed to fetch points");
    //   }
    //   const points = await res.json();

    //   this.pointIdsByMap[mapId] = [];
    //   points.forEach((p) => {
    //     this.pointsById[p._id] = p;
    //     this.pointIdsByMap[mapId].push(p._id);
    //   });
    // },

    // Add these methods to your map.store.js

async createPoint(mapId, pointData) {
  try {
    const payload = {
      category: pointData.category || pointData.icon || 'default',
      x: pointData.x,
      y: pointData.y,
      pX: pointData.pX,
      pY: pointData.pY,
      name: pointData.name || '',
      description: pointData.description || '',
      color: pointData.color || '#ff0000',
      icon: pointData.icon || pointData.category || 'location_on',
      size: pointData.size || 10
    };

    console.log('Creating point with payload:', payload);

    const response = await fetch(`/api/points/map/${mapId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include', // Include cookies if you're using cookie-based auth
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const newPoint = await response.json();
    console.log('Point created:', newPoint);

    // Add to store
    if (!this.pointIdsByMap[mapId]) {
      this.pointIdsByMap[mapId] = [];
    }
    this.pointIdsByMap[mapId].push(newPoint._id);
    this.pointsById[newPoint._id] = {
      id: newPoint._id,
      ...newPoint
    };

    return newPoint;
  } catch (err) {
    console.error('Failed to create point -- map store:', err);
    throw err;
  }
},

// UPDATE POINT
async updatePoint(pointId, updates) {
  try {
    const payload = {};

    // Only send fields that are being updated
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.x !== undefined) payload.x = updates.x;
    if (updates.y !== undefined) payload.y = updates.y;
    if (updates.pX !== undefined) payload.pX = updates.pX;
    if (updates.pY !== undefined) payload.pY = updates.pY;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.size !== undefined) payload.size = updates.size;

    console.log('Updating point with payload:', payload);

    const response = await fetch(`/api/points/${pointId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const updatedPoint = await response.json();
    console.log('Point updated:', updatedPoint);

    // Update in store
    if (this.pointsById[pointId]) {
      this.pointsById[pointId] = {
        id: updatedPoint._id,
        ...updatedPoint
      };
    }

    return updatedPoint;
  } catch (err) {
    console.error('Failed to update point:', err);
    throw err;
  }
},

// DELETE POINT
async deletePoint(mapId, pointId) {
  try {
    console.log('Deleting point:', pointId);
    console.log('from map:', mapId);

    const response = await fetch(`/api/points/${pointId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    console.log('Point deleted successfully');

    // Remove from store
    if (this.pointIdsByMap[mapId]) {
      this.pointIdsByMap[mapId] = this.pointIdsByMap[mapId].filter(
        id => id !== pointId
      );
    }
    delete this.pointsById[pointId];

    return true;
  } catch (err) {
    console.error('Failed to delete point:', err);
    throw err;
  }
},

// FETCH POINTS
// Replace your fetchPoints method in map.store.js with this debug version

async fetchPoints(mapId) {
  try {
    console.log('========================================')
    console.log('📍 FETCH POINTS - START')
    console.log('Map ID:', mapId)
    console.log('Current pointIdsByMap:', JSON.parse(JSON.stringify(this.pointIdsByMap)))
    console.log('Current pointsById:', JSON.parse(JSON.stringify(this.pointsById)))

    const response = await fetch(`/api/points/map/${mapId}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      const error = await response.text()
      console.error('Response error:', error)
      throw new Error(error)
    }

    const points = await response.json()
    console.log('📍 Points received from API:', points)
    console.log('Number of points:', points.length)

    // Store points
    this.pointIdsByMap[mapId] = points.map(p => p._id)
    console.log('Stored point IDs for map:', this.pointIdsByMap[mapId])

    points.forEach(point => {
      const storedPoint = {
        id: point._id,
        ...point
      }
      this.pointsById[point._id] = storedPoint
      console.log('Stored point:', storedPoint)
    })

    console.log('📍 AFTER STORING:')
    console.log('pointIdsByMap[mapId]:', this.pointIdsByMap[mapId])
    console.log('pointsById:', JSON.parse(JSON.stringify(this.pointsById)))
    console.log('========================================')

    return points
  } catch (err) {
    console.error('❌ Failed to fetch points:', err)
    throw err
  }
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
