<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useMapStore } from '@/stores/map.store'
import Point from '@/components/map/point.vue'
import Tabs from '@/components/tabs/tabs.vue'
import Tab from '@/components/tabs/tab.vue'
import ModalAddPoint from '@/components/modals2/ModalAddPoint.vue'
import ModalEditPoint from '@/components/modals2/ModalEditPoint.vue'
// ===== Props & Store =====
const props = defineProps({ map: Object })
const mapStore = useMapStore()
const { createPoint, deletePoint, updatePoint, categories } = mapStore
// ===== Mouse & Map State =====
const mousePosition = ref({ x: 0, y: 0 })
const picW = ref(0)
const picH = ref(0)
const scale = ref(1)
const minScale = 0.5
const isDragging = ref(false)
const dragStartPosition = ref({ x: 0, y: 0 })
const translate = ref({ x: 0, y: 0 })
const parentMousePosition = ref({ x: 0, y: 0 })
const resetting = ref(false)
const isHovering = ref(false)
// ===== Point State =====
const point = ref({})
const activePoint = ref(null)
const selectedPoint = ref(null)
const hoverPoint = ref(null)
const activeMap = ref(null)
const isModalOpen = ref(false)
const showEditModal = ref(false)
const activeTabIndex = ref(0)
// ===== Computed =====
const imageSrc = computed(() => props.map.img)
const transitionStyle = computed(() => resetting.value ? 'transform 0.3s ease' : 'none')
// ===== Map Events =====
const onMouseDown = e => {
    isDragging.value = true
    dragStartPosition.value = { x: e.offsetX - translate.value.x, y: e.offsetY - translate.value.y }
}
const onMouseMove = e => {
    const mapWidth = e.target.getBoundingClientRect().width
    const mapHeight = e.target.getBoundingClientRect().height
    picW.value = e.offsetX / mapWidth * 100 * scale.value
    picH.value = e.offsetY / mapHeight * 100 * scale.value
    mousePosition.value = { x: e.offsetX, y: e.offsetY }
    if (isDragging.value) {
        translate.value.x += e.movementX
        translate.value.y += e.movementY
    }
}
const onMouseUp = () => {
    isDragging.value = false
    if (scale.value < 1) resetMap()
}
const onMouseLeave = () => { isDragging.value = false; isHovering.value = false }
const onContainerMouseMove = e => {
    const container = e.target.closest('.map')
    if (!container) return
    const rect = container.getBoundingClientRect()
    parentMousePosition.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
}
const onWheel = e => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const zoom = e.deltaY < 0 ? 1.1 : 0.9
    const newScale = scale.value * zoom
    if (newScale < minScale) { resetMap(); return }
    const scaleFactor = newScale / scale.value
    translate.value.x = mouseX - (mouseX - translate.value.x) * scaleFactor
    translate.value.y = mouseY - (mouseY - translate.value.y) * scaleFactor
    scale.value = newScale
}
const resetMap = () => {
    resetting.value = true
    scale.value = 1
    translate.value = { x: 0, y: 0 }
    setTimeout(() => resetting.value = false, 300)
}
// ===== Point Handling =====
const onDoubleClick = e => {
    const mapWidth = e.target.getBoundingClientRect().width
    const mapHeight = e.target.getBoundingClientRect().height
    point.value = {
        name: '',
        description: '',
        icon: '',
        color: 'Red',
        size: 1,
        x: e.offsetX,
        y: e.offsetY,
        pX: Math.floor(e.offsetX / mapWidth * 100 * scale.value),
        pY: Math.floor(e.offsetY / mapHeight * 100 * scale.value)
    }
    activeMap.value = e.target
    isModalOpen.value = true
}
const onAddPoint = (data) => {
    const mapEl = activeMap.value
    const mapWidth = mapEl.getBoundingClientRect().width
    const mapHeight = mapEl.getBoundingClientRect().height
    const newPoint = {
        ...data,
        pX: Math.floor(data.x / mapWidth * 100 * scale.value),
        pY: Math.floor(data.y / mapHeight * 100 * scale.value)
    }
    console.log("on-add-point", props.map);

    createPoint(props.map.id, newPoint)
    isModalOpen.value = false
}
const editPoint = (pointData) => {
    selectedPoint.value = pointData
    showEditModal.value = true
}
const updatePointHandler = (data) => {
    updatePoint(data.id, data)
    showEditModal.value = false
}
const deletePointHandler = (pointData) => {
    deletePoint(props.map.id, pointData.id)
    if (selectedPoint.value?.id === pointData.id) selectedPoint.value = null
}
const selectPointHandler = (e, pointData) => {
    if (e) e.stopPropagation()
    selectedPoint.value = pointData
    activeTabIndex.value = 1
}
const zoomToPoint = (point) => {
    const mapEl = document.querySelector('.map'); // map container
    const imgEl = document.querySelector('.image-container'); // image container
    if (!mapEl || !imgEl) return;
    const mapWidth = mapEl.clientWidth;
    const mapHeight = mapEl.clientHeight;
    const pointX = point.x; // in pixels
    const pointY = point.y;
    const targetScale = 2; // how much to zoom in (adjust as needed)
    // Calculate new translate so that the point is roughly centered
    const translateX = mapWidth / 2 - pointX * targetScale;
    const translateY = mapHeight / 2 - pointY * targetScale;
    scale.value = targetScale;
    translate.value = { x: translateX, y: translateY };
    resetting.value = true;
    setTimeout(() => resetting.value = false, 300);
    // Also select the point
    selectedPoint.value = point;
    activeTabIndex.value = 1;
}

// Hover
const onMouseOver = (point) => hoverPoint.value = point.name
const onMouseLeavePoint = () => hoverPoint.value = null
const toggleActive = name => activePoint.value = activePoint.value?.name === name ? null : { name }
// Tabs
const onTabChange = index => activeTabIndex.value = index
// Lifecycle
onMounted(() => document.addEventListener('mouseup', onMouseUp))
onBeforeUnmount(() => document.removeEventListener('mouseup', onMouseUp))
// Map Name Edit
const editMapName = ref(props.map.name)
const editingMapName = ref(false)
const updateMapName = () => {
    mapStore.updateMapName(props.map.id, editMapName.value)
    editingMapName.value = false
}
// Delete Map
const deleteMapHandler = (mapId) => {
    if (confirm('Are you sure you want to delete this map?')) {
        mapStore.deleteMap(mapId)
    }
}
// Category Matching
const matchCount = category => props.map.points?.filter(p => p.icon === category.name).length
</script>
<template>
<div class="map-container" @mousemove="onContainerMouseMove">
    <i class="bx bx-x" @click="deleteMapHandler(props.map.id)"></i>
    <ModalEditPoint
        v-if="showEditModal"
        :point="selectedPoint"
        :mapId="props.map.id"
        @modal-close="showEditModal = false"
    />
    <ModalAddPoint
        v-if="isModalOpen"
        :point="point"
        :points="props.map.points"
        @modal-close="isModalOpen = false"
        @add-point="onAddPoint"
    />
    <div class="map-main">
        <!-- Map Name -->
        <template v-if="editingMapName">
            <input v-model="editMapName">
            <button @click="updateMapName">Update</button>
        </template>
        <template v-else>
            <h2 class="map-name" @dblclick="editingMapName = true">{{ props.map.title }}</h2>
        </template>

        <div class="two-column">
            <div class="map-wrapper">
                <div class="overlay">
                    <span class="coord-x">Lat: {{ Math.floor(picW) }}</span>
                    <span class="coord-y">Lon: {{ Math.floor(picH) }}</span>
                    <span class="reset" @click="resetMap">reset</span>
                </div>

                <div
                    class="map"
                    @mouseover="isHovering = true"
                    @mousedown="onMouseDown"
                    @mousemove="onMouseMove"
                    @mouseleave="onMouseLeave"
                    @wheel="onWheel"
                    @dblclick="onDoubleClick"
                    :style="{ cursor: isDragging ? 'grabbing' : 'crosshair' }"
                >
                    <div class="image-container"
                        :style="{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, transition: transitionStyle }">

                        <div class="points">
                            <Point v-for="p in props.map.points" :key="p.id"
                                :point="p"
                                :hoverPoint="hoverPoint"
                                @click="selectPointHandler($event, p)"
                                @dblclick="editPoint(p)"
                                :style="{ left: p.x + 'px', top: p.y + 'px', position: 'absolute', zIndex: 100 }"
                            />
                        </div>

                        <img :src="imageSrc" class="map-image" />
                    </div>

                    <span class="vertical-line" v-if="isHovering" :style="{ left: parentMousePosition.x + 'px' }">
                        <div class="vertical-line-text">{{ Math.floor(picW) }}</div>
                    </span>
                    <span class="horizontal-line" v-if="isHovering" :style="{ top: parentMousePosition.y + 'px' }">
                        <div class="horizontal-line-text">{{ Math.floor(picH) }}</div>
                    </span>
                </div>
            </div>

            <Tabs @tabChanged="onTabChange" :activeTabIndex="activeTabIndex" class="tabs-container">
                <tab title="All Points">
                    <div v-if="!props.map.points?.length">
                        Double click anywhere on the map to create a point.
                    </div>

                    <div class="points-container">
                        <div v-for="category in categories" :key="category.name">
                            <h2 v-if="matchCount(category)">
                                <span class="material-symbols-outlined">{{ category.icon }}</span> - {{ category.name }}
                            </h2>
                            <template v-for="p in props.map.points" :key="p.id">
                                <div v-if="p.icon === category.name" class="point-display"
                                    @mouseover="onMouseOver(p)"
                                    @mouseleave="onMouseLeavePoint"
                                    @dblclick="zoomToPoint(p)"
                                    >
                                    <!-- @click="toggleActive(p.name)" -->
                                    <div class="front">
                                        <div class="color"><div class="circle" :style="{ background: p.color }"></div></div>
                                        <div class="coords">[{{ p.pX }}, {{ p.pY }}]</div>
                                    </div>
                                    <div class="mid"><div class="name">{{ p.name }}</div></div>
                                    <div class="end">
                                        <a @click.prevent="editPoint(p)"><span class="material-symbols-outlined">edit</span></a>
                                        <a @click.prevent="deletePointHandler(p)"><span class="material-symbols-outlined">delete</span></a>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </tab>

                <tab title="Point">
                    <div v-if="selectedPoint">
                        <div class="selected-point">
                            <h3>{{ selectedPoint.name }}</h3>
                        </div>
                        <div class="coord-container">
                            <div class="coord">X: {{ selectedPoint.pX }}</div>
                            <div class="coord">Y: {{ selectedPoint.pY }}</div>
                        </div>
                        <div>Color: {{ selectedPoint.color }}</div>
                        <div>Category: {{ selectedPoint.icon }}</div>
                        <div>Size: {{ selectedPoint.size }}</div>
                        <div>Description: {{ selectedPoint.description }}</div>
                    </div>
                    <div v-else>
                        <template v-if="!props.map.points?.length">
                            Double click anywhere on the map to create a point.
                        </template>
                        <template v-else>
                            Select a point on the map to see details.
                        </template>
                    </div>
                </tab>
            </Tabs>
        </div>
    </div>
</div>
</template>

<style scoped>
.map-main {
    margin: 0 auto;
    text-align: center;
    width: 100%;
    background: rgba(10, 30, 40, 0.65);
}
/* .active {
    outline: 2px solid yellow;
} */
.bx-x {
    position: absolute;
    top: .5em;
    right: .5em;
    cursor: pointer;
}
.bx-x:hover {
    color: yellow;
}
.point-display {
    display: grid;
    align-items: center;
    grid-template-columns: 4fr 6fr 4fr;
    margin: .5em 2em;
    padding: 5px;
    border-radius: 5px;
    transition: margin-left 300ms ease;
}
.point-display:hover {
    /* box-shadow: 1px 1px 10px black; */
    cursor: pointer;
    /* background: rgba(255, 255, 255, 0.5); */
    /* outline: 2px solid yellow; */
    outline: 1px solid yellow;
    margin-left: 10px;
}
.point-display .point {
    display: flex;
    justify-content: space-between;
}
.point-display .color .circle {
    /* width: .75em; */
    /* height: .75em; */
    width: 1em;
    height: 1em;
    border-radius: 50%;
}
.selected-point {
    display: flex;
    align-items: center;
    gap: .5em;

}
.selected-point button {
    cursor: pointer;
}
.coord-container {
    display: flex;
    align-items: center;
    align-items: center;
}
.coord {
    display: flex;
    align-items: center;
    justify-content: center;
    /* border: 1px solid black; */
    border-radius: 5px;
    /* padding: .25em; */
    min-width: 50px;
    /* margin: 0 .25em; */
}
.front {
    display: flex;
    align-items: center;
    gap: 1em;
}
.mid {
    display: flex;
    align-items: center;
    gap: 5px;
}
.end {
    display: flex;
    justify-content: center;
    gap: 1em;
}
.two-column {
    display: flex;
    justify-content: center;
    width: 100%;
    /* height: 100vh; */
}
.map-container {
    /* color: white; */
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    align-items: center;
    position: relative;
    /* background-color: #fbe6a5; */
    background-color: black;
    width: 100%; /* Make it take full width */
    height: 100%; /* Make it take full height */
}
.map {
    position: relative;
    overflow: hidden;
    /* width: 100%; */
    /* height: 100%; */
    /* height: calc(max(80vh, 500px)); */
    /* width: 100%; */
    /* height: auto; */
    min-width: 25vw;
    min-height: 25vw;
    width: 50vw;
    height: 50vw;
    /* outline: 2px solid black; */
    box-shadow: 0 0 15px black;
}
.map-name {
    color: white;
    font-size: 1.5em;
    padding: 1em;
}
.map-wrapper {
    color: white;
    position: relative;
    display: flex;
    flex-direction: column;
}
.points-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    font-size: 0.75em;
}
.points-container li {
    margin-left: 3em;
}
.points-container li::marker {
    font-size: 2em;
}
.points-container span {
    font-size: 1em;
    cursor: pointer;
}
.points-container span:hover {
    color: yellow;
}
.image-container {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: top left; /* Set origin for scaling */
    width: 100%;
    /* height: auto; */
    height: 100%;
}
.map-image {
    display: block; /* Remove inline spacing */
    /* object-position: -1% -1%; */
    /* min-width: 400px; */
    /* min-height: 400px; */
    width: 100%;
    height: 100%;
    /* max-width: none; */
    /* aspect-ratio: 1 / 1; */
    /* object-fit: cover; */
}
.vertical-line,
.horizontal-line {
    position: absolute;
    pointer-events: none;
    background: white;
}
.vertical-line {
    width: 2px;
    height: 100%;
}
.horizontal-line {
    height: 2px;
    width: 100%;
}
.horizontal-line-text {
    color: white;
    text-shadow:
        -1px -1px 0 black,
        1px -1px 0 black,
        -1px 1px 0 black,
        1px 1px 0 black;
}
.vertical-line-text {
    margin-left: 10px;
    color: white;
    text-shadow:
        -1px -1px 0 black,
        1px -1px 0 black,
        -1px 1px 0 black,
        1px 1px 0 black; /* Adjust color and position for stroke */
}
.coord-x, .coord-y {
    display: flex;
    align-items: center;
    padding: 0 1em;
    margin: .25em;
    outline: 1px solid black;
    border-radius: 5px;
}
.reset {
    display: flex;
    align-items: center;
    background: none;
    padding: 0 1em;
    margin: .25em;
    outline: 1px solid black;
}
.reset:hover {
    cursor: pointer;
    color: white;
    /* outline: none; */
    outline: 1px solid white;
    background: black;
}
.overlay {
    /* position: absolute; */
    z-index: 1;
    display: flex;
    width: 100%;
    justify-content: flex-end;
    /* margin: .25em; */
}
.overlay-coords {
    padding: .25em;
    min-width: 7em;
}
.tabs-container {
    color: white;
}
</style>