<script setup>
import { ref, computed, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/map.store'
import Map from '@/components/map/map.vue'
/* =====================
   Store
===================== */
const mapStore = useMapStore()
const { groupedMaps, baseMaps } = storeToRefs(mapStore)
/* =====================
   State
===================== */
const selectedMapName = ref('')
const newMapTitle = ref('')
/* =====================
   Auto-select first base map
===================== */
watchEffect(() => {
    if (!selectedMapName.value && baseMaps.value.length) {
        selectedMapName.value = baseMaps.value[0].name
    }
})
/* =====================
   Derived
===================== */
const renderedMaps = computed(() => {
    const group = groupedMaps.value.find(
        g => g.name === selectedMapName.value
    )
    return group?.maps ?? []
})
/* =====================
   Actions
===================== */
const addMapInstance = () => {
    if (!newMapTitle.value || !selectedMapName.value) return
    mapStore.addMapInstance({
        baseMapName: selectedMapName.value,
        title: newMapTitle.value
    })
    newMapTitle.value = ''
}
const deleteMapInstance = (mapId) => {
    const confirmed = confirm('Are you sure you want to delete this map?')
    if (!confirmed) return
    mapStore.deleteMapInstance(mapId)
}
/* =====================
   Points
===================== */
const addPoint = (mapId) => {
    const title = prompt('Point title:')
    if (!title) return
    const x = parseInt(prompt('X coordinate:'), 10) || 0
    const y = parseInt(prompt('Y coordinate:'), 10) || 0
    const category = prompt('Category:') || 'default'
    mapStore.createPoint(mapId, { title, x, y, category })
}
const deletePoint = (mapId, pointId) => {
    if (!confirm('Delete this point?')) return
    mapStore.deletePoint(mapId, pointId)
}
</script>
<template>
    <div class="container">
        <!-- Base Map Thumbnails -->
        <div class="thumbnail-list">
            <div v-for="base in baseMaps" :key="base.name" class="thumbnail"
                :class="{ active: base.name === selectedMapName }" @click="selectedMapName = base.name">
                <img :src="base.img" :alt="base.name" />
                <p>{{ base.name }}</p>
            </div>
        </div>
        <!-- Add Map Instance -->
        <div class="addMap">
            <h3>Add a New Map Instance</h3>
            <input type="text" placeholder="Map Instance Title" v-model="newMapTitle" />
            <select v-model="selectedMapName">
                <option v-for="base in baseMaps" :key="base.name" :value="base.name">
                    {{ base.name }}
                </option>
            </select>
            <button @click="addMapInstance">Add Map</button>
        </div>
        <!-- Render Map Instances -->
        <div v-for="map in renderedMaps" :key="map.id" class="map-wrapper">
            <button class="delete-map-btn" @click="deleteMapInstance(map.id)">
                ✕ Delete
            </button>
            <Map :map="map" />
        </div>
    </div>
</template>
<style scoped>
.container {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    background-color: black;
}

/* Thumbnails */
.thumbnail-list {
    display: flex;
    justify-content: center;
    gap: 1em;
    overflow-x: auto;
    padding: 1em 0;
    color: white;
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
    border-color: cyan;
    color: cyan;
    background-color: rgba(255, 255, 255, 0.25);
}

/* Add Map */
.addMap {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    width: 12em;
    margin: 1em auto;
    text-align: center;
}

.addMap input,
.addMap select,
.addMap button {
    width: 100%;
}

.map-wrapper {
    position: relative;
    margin-bottom: 1em;
}

.delete-map-btn {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    background: crimson;
    color: white;
    border: none;
    padding: 0.3em 0.6em;
    cursor: pointer;
    font-size: 0.8em;
    border-radius: 4px;
}

.delete-map-btn:hover {
    opacity: 0.85;
}
</style>
