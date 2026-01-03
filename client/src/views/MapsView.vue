<script setup>
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/map.store'
import { ref, computed, watchEffect, onMounted } from 'vue'
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

const setActiveMap = (map) => {
    selectedMapName.value = map.name

    if (map.id) mapStore.setActiveMap(map.id)
}

/* Actions */
const addMapInstance = () => {
    if (!newMapTitle.value || !selectedMapName.value) return
    mapStore.addMapInstance({
        baseMapName: selectedMapName.value,
        title: newMapTitle.value
    })
    newMapTitle.value = ''
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

onMounted(() => {
    if (!mapStore.mapIds.length) {
        mapStore.ensureMapInstance('The Island')
    }
})

</script>
<template>
    <div class="container">

        <h3 class="thumbnail-list-title">Maps</h3>

        <!-- Base Map Thumbnails -->
        <div class="thumbnail-list">
            <div v-for="base in baseMaps" :key="base.name" class="thumbnail"
                :class="{ active: base.name === selectedMapName }"
                @click="setActiveMap(base)">
                <img :src="base.img" :alt="base.name" />
                <p>{{ base.name }}</p>
            </div>
        </div>

        <!-- Map List -->
        <div class="map-layout">
            <Map v-if="activeMap" :map="activeMap" :activeBaseMap="selectedMapName" :baseMaps="baseMaps" :newMapTitle="newMapTitle"
                @update:newMapTitle="newMapTitle = $event" @add-map-instance="addMapInstance" />
            <div v-else>
                No map found...
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