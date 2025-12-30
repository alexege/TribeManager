<script setup>
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/map.store'
import { ref, computed, watchEffect } from 'vue'
import Map from '@/components/maps/Map.vue'

/* Store */
const mapStore = useMapStore()
const { groupedMaps, baseMaps, activeMap, activeMapId } = storeToRefs(mapStore)

/* State */
const selectedMapName = ref('The Island')
const newMapTitle = ref('')

/* Auto-select first base map */
watchEffect(() => {
    if (!selectedMapName.value && baseMaps.value.length) {
        selectedMapName.value = baseMaps.value[0].name
    }
})

const filteredMapIds = computed(() => {
    return mapStore.mapIds.filter(id => {
        const map = mapStore.mapsById[id]
        return map?.baseMapName === selectedMapName.value
    })
})


/* Derived */
const renderedMaps = computed(() => {
    const group = groupedMaps.value.find(
        g => g.name === selectedMapName.value
    )
    return group?.maps ?? []
})

/* Actions */
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

/* Points */
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

        <!-- Map List -->
        <div class="map-layout">
            <Map v-if="activeMap" :map="activeMap" :activeBaseMap="selectedMapName" :baseMaps="baseMaps"
                :newMapTitle="newMapTitle" @update:newMapTitle="newMapTitle = $event"
                @add-map-instance="addMapInstance" />
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

<!-- <style scoped>
.title {
    text-align: center;
    padding: 1em;
    font-size: 2em;
}

/* .container {
    margin: 0 auto;
    margin-bottom: 1em;
    height: 100vh;
}
.addMap {
    display: flex;
    flex-direction: column;
    outline: 5px solid red;
} */
.container {
    margin: 0 auto;
    /* height: 100vh; */
    display: flex;
    flex-direction: column;
    /* gap: 1em; */
    background-color: black;
}

/* Thumbnail Styles */
.thumbnail-list {
    display: flex;
    justify-content: center;
    gap: 1em;
    overflow-x: auto;
    padding: 1em 0;
    color: white;
}

.thumbnail {
    text-align: center;
    cursor: pointer;
    border: 2px solid transparent;
    padding: 0.5em;
    border-radius: 6px;
    transition: border 0.3s;
}

.thumbnail img {
    width: 100px;
    height: auto;
    object-fit: cover;
}

.thumbnail.active {
    /* border-color: #007BFF; */
    /* color: black; */
    color: cyan;
    border-color: cyan;
    background-color: rgba(255, 255, 255, 0.35);
}

.addMap {
    display: flex;
    flex-direction: column;
    width: 10em;
    margin: 0 auto;
    text-align: center;
}

.addMap select,
.addMap button {
    width: 100%;
}
</style> -->
