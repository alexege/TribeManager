<script setup>
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/map.store'
import { ref, onMounted } from 'vue'
import Map from '@/components/maps/Map.vue'

/* ===== Store ===== */
const mapStore = useMapStore()
const { baseMaps, activeMap, activeMapId, activeBaseMapName } = storeToRefs(mapStore)

/* ===== State ===== */
const newMapTitle = ref('')
const isInitialized = ref(false)

/* ===== Actions ===== */
const selectBaseMap = (baseMap) => {
  mapStore.setActiveBaseMap(baseMap.name)
}

const addMapInstance = async () => {
  if (!newMapTitle.value || !activeBaseMapName.value) return

  try {
    const newMap = await mapStore.createMapInstance({
      baseMapName: activeBaseMapName.value,
      title: newMapTitle.value
    })

    newMapTitle.value = ''

    // Set as active map
    if (newMap?._id) {
      await mapStore.setActiveMap(newMap._id)
    }
  } catch (err) {
    console.error('Failed to create map:', err)
  }
}

/* ===== Lifecycle ===== */
onMounted(async () => {
  console.log('🗺️ MapsView mounted - initializing...')
  await mapStore.initialize()
  isInitialized.value = true
  console.log('✅ MapsView initialized')
})
</script>

<template>
  <div class="container">
    <h3 class="thumbnail-list-title">Maps</h3>

    <!-- Base Map Thumbnails -->
    <div class="thumbnail-list">
      <div
        v-for="base in baseMaps"
        :key="base.name"
        class="thumbnail"
        :class="{ active: base.name === activeBaseMapName }"
        @click="selectBaseMap(base)"
      >
        <img :src="base.img" :alt="base.name" />
        <p>{{ base.name }}</p>
      </div>
    </div>

    <!-- Map Component -->
    <div class="map-layout">
      <Map
        v-if="isInitialized && activeMap"
        :map="activeMap"
        :activeBaseMap="activeBaseMapName"
        :baseMaps="baseMaps"
        :newMapTitle="newMapTitle"
        @update:newMapTitle="newMapTitle = $event"
        @add-map-instance="addMapInstance"
      />
      <div v-else-if="isInitialized" class="no-map-message">
        <p>No map instance found for {{ activeBaseMapName }}</p>
        <p>Create one using the sidebar →</p>
      </div>
      <div v-else class="loading">
        Loading maps...
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-color: #161616;
}

.debug-info {
  display: flex;
  flex-direction: column;
  color: white;
  text-align: center;
  padding: 1em;
  gap: 0.25em;
  font-size: 0.85em;
  opacity: 0.7;
}

/* Thumbnails */
.thumbnail-list-title {
  color: white;
  text-align: center;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-size: 1.2em;
}

.thumbnail-list {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  color: white;
  padding: 0.5em;
  background: var(--glitch-grey);
  gap: 0.25em;
}

.thumbnail {
  cursor: pointer;
  text-align: center;
  border: 2px solid transparent;
  padding: 0.5em;
  border-radius: 6px;
  transition: border 0.2s, background-color 0.2s;
}

.thumbnail img {
  width: 100px;
  height: auto;
}

.thumbnail.active {
  border-color: var(--orange);
  color: var(--orange);
  background-color: var(--glitchy-grey);
}

.thumbnail:hover {
  border-color: var(--orange);
  opacity: 0.8;
}

/* Messages */
.no-map-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 2em;
  text-align: center;
  gap: 0.5em;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 2em;
}

.map-layout {
  min-height: 400px;
}
</style>