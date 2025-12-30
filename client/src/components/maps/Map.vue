<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import Point from '@/components/maps/Point.vue'
import Tabs from '@/components/tabs/Tabs.vue'
import AddPoint from '@/components/modals/AddPoint.vue'
import EditPoint from '@/components/modals/EditPoint.vue'

import { useMapStore } from '@/stores/map.store'

const mapStore = useMapStore()
const { createPoint, deletePoint, updatePoint } = mapStore
const categories = mapStore.categories
const props = defineProps(['map'])
const mousePosition = ref('Original X: 0, Y: 0')
const picW = ref(0)
const picH = ref(0)
const scale = ref(1) // Track the current scale
const minScale = 0.5 // Minimum scale (original size)
const isDragging = ref(false)
const dragStartPosition = ref({ x: 0, y: 0 })
const translate = ref({ x: 0, y: 0 }) // Track the translation
const imageSrc = props.map.img // Use the image source from props
// Crosshairs
const onMouseDown = (event) => {
    event.preventDefault()
    isDragging.value = true
    dragStartPosition.value = {
        x: event.offsetX - translate.value.x,
        y: event.offsetY - translate.value.y
    }
}
const parentMousePosition = ref({ x: 0, y: 0 })
const onContainerMouseMove = (event) => {
    const container = event.target.closest('.map')
    // const container = document.querySelector('.map')
    if (container) {
        const rect = container.getBoundingClientRect()
        const offsetX = event.clientX - rect.left
        const offsetY = event.clientY - rect.top
        parentMousePosition.value = { x: offsetX, y: offsetY }
    }
}
const onMouseMove = (event) => {
    // console.log(`offsetX: ${event.offsetX}, offsetY: ${event.offsetY}`)

    const mapWidth = event.target.getBoundingClientRect().width
    const mapHeight = event.target.getBoundingClientRect().height

    //Used for intersecting lines
    picW.value = event.offsetX / mapWidth * 100 * scale.value;
    picH.value = event.offsetY / mapHeight * 100 * scale.value;
    mousePosition.value = { x: event.offsetX, y: event.offsetY }
    if (isDragging.value) {
        const deltaX = event.movementX // Change in X since the last mouse event
        const deltaY = event.movementY // Change in Y since the last mouse event
        // Update translate values based on mouse movement
        translate.value.x += deltaX
        translate.value.y += deltaY
    }
}
const onMouseUp = () => {
    isDragging.value = false
    if (scale.value < 1) {
        resetMap()
    }
}
const onMouseLeave = () => {
    isDragging.value = false
    isHovering.value = false
}
const onWheel = (event) => {
    event.preventDefault()
    const mapContainer = event.currentTarget // Reference to the map container
    const rect = mapContainer.getBoundingClientRect() // Get the bounding rect
    // Get mouse position relative to the container
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    // Determine zoom direction
    const zoom = event.deltaY < 0 ? 1.1 : 0.9
    const newScale = scale.value * zoom
    if (newScale < minScale) {
        resetMap()
        return
    }
    if (newScale >= minScale) {
        // Calculate scale factor
        const scaleFactor = newScale / scale.value
        // Adjust the translation based on mouse position
        translate.value.x = mouseX - (mouseX - translate.value.x) * scaleFactor
        translate.value.y = mouseY - (mouseY - translate.value.y) * scaleFactor
        // Update scale
        scale.value = newScale
    }
}
// Reset Map
const resetting = ref(false);
const resetMap = () => {
    resetting.value = true;
    scale.value = 1;
    translate.value.x = 0;
    translate.value.y = 0;
    setTimeout(() => {
        resetting.value = false;
    }, 300); // Adjust this duration to match your CSS transition
};
const transitionStyle = computed(() => {
    return resetting.value ? 'transform 0.3s ease' : 'none';
});


// Point Logic
const point = ref({
    name: 'Point 1',
    description: '',
    icon: 'B',
    x: 0,
    y: 0,
    pX: 0,
    pY: 0,
    color: 'Red',
    size: 1
})
const activeMap = ref()
const onDoubleClick = (event, mapId) => {
    event.preventDefault()
    const mapWidth = event.target.getBoundingClientRect().width
    const mapHeight = event.target.getBoundingClientRect().height
    point.value.x = Math.floor(event.offsetX)
    point.value.y = Math.floor(event.offsetY)
    point.value.pX = Math.floor(event.offsetX / mapWidth * 100 * scale.value)
    point.value.pY = Math.floor(event.offsetY / mapHeight * 100 * scale.value)
    activeMap.value = event.target
    isModalOpen.value = true
}
onMounted(() => {
    document.addEventListener('mouseup', onMouseUp)
})
onBeforeUnmount(() => {
    document.removeEventListener('mouseup', onMouseUp)
})
const deleteAPoint = (mapId, point) => {
    deletePoint(mapId, point)
    //TODO: Fix this
    selectPoint.value = {}
}

// Modal Logic
const isModalOpen = ref(false);

const openModal = () => {
    isModalOpen.value = true;
}
const closeModal = () => {
    isModalOpen.value = false;
}
const closeEditModal = () => {
    showEditModal.value = false;
}
const onAddPoint = (value) => {
    const map = activeMap.value
    const mapWidth = map.getBoundingClientRect().width
    const mapHeight = map.getBoundingClientRect().height
    const percentX = Math.floor(value.x / mapWidth * 100 * scale.value)
    const percentY = Math.floor(value.y / mapHeight * 100 * scale.value)
    const newPoint = {
        name: value.name,
        description: value.description,
        x: value.x,
        y: value.y,
        pX: percentX,
        pY: percentY,
        color: value.color,
        icon: value.icon,
        size: value.size
    }
    createPoint(props.map.id, newPoint)
    closeModal()
}
const selectedPoint = ref()
const activeTabIndex = ref(0)
const selectPoint = (event, point) => {
    if (event) event.stopPropagation()
    selectedPoint.value = point
    // send prop to tabs component to update active tab
    activeTabIndex.value = 1
}
// Edit Logic
// import Item1View from '@/views/boss/Item1View.vue';
const showEditModal = ref(false)
const editPoint = (event, point) => {
    event.stopPropagation()
    selectedPoint.value = point
    showEditModal.value = true
}
const isHovering = ref(false)
const editAPoint = (mapId, point) => {
    console.log(`point name: ${JSON.stringify(point)}`)
    selectPoint(null, point)
    showEditModal.value = true
}
const onTabChange = (index) => {
    console.log(`index is: ${index}`)
    activeTabIndex.value = index;
}
//TODO: Add highlight on point hover. So it's easy to figure out which point you're looking at.
const hoverPoint = ref({})
const onMouseOver = (point) => {
    console.log(`point: ${point}`)
    hoverPoint.value = point.name
}
const onMouseHoverLeave = () => {
    hoverPoint.value = null
}
const activePoint = ref({})
const toggleActive = (name) => {
    activePoint.value = activePoint.value.name === name ? null : name;
}
//Check to see if the category has any matching points
const matchCount = (category) => {
    return props.map.points?.filter(point => point.icon == category.name).length;
}

// Edit Map Name
const editMapName = ref(props.map.name)
const editingMapName = ref(false)
const updateMapName = () => {
    console.log("Attempting to udpate map name");
    //TODO: Add updateMapName to map.store
    mapStore.updateMapName(props.map.id, editMapName.value)
    editingMapName.value = false
}

// Delete Map
const deleteMap = (mapId) => {
    const confirmed = window.confirm('Are you sure  you wish to delete this map?')
    if (confirmed) {
        //TODO: Access delete map store function
        console.log("Deleting map with id: ", mapId);
    }
}
</script>
<template>
    <div class="map-container" @mousemove="onContainerMouseMove">

        <!-- <pre>{{ map }}</pre> -->

        <i class="bx bx-x" @click="deleteMap(props.map.id)"></i>
        <EditPoint v-if="showEditModal" :point="selectedPoint" :mapId="props.map.id" @modal-close="closeEditModal" />
        <AddPoint v-if="isModalOpen" @modal-close="closeModal" @add-point="onAddPoint" :point="point"
            :points="props.map.points">
        </AddPoint>

        <template v-if="editingMapName">
            <input type="text" v-model="editMapName">
            <button @click="updateMapName()">Update</button>
        </template>
        <template v-else>
            <h2 class="map-name" @dblclick="editingMapName = true">{{ map.name }}</h2>
        </template>

        <div class="two-column">
            <div class="map-wrapper">
                <div class="overlay">
                    <span class="coord-x">Lat: {{ Math.floor(picW) }}</span>
                    <span class="coord-y">Lon: {{ Math.floor(picH) }}</span>
                    <span @click="resetMap" class="reset">
                        reset
                    </span>
                </div>
                <div class="map" @mouseover="isHovering = true" @mousedown="onMouseDown" @mousemove="onMouseMove"
                    @mouseleave="onMouseLeave" @wheel="onWheel" @dblclick="onDoubleClick($event, map.id)"
                    :style="{ cursor: isDragging ? 'grabbing' : 'crosshair' }">
                    <div class="image-container" :style="{
                        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                        transition: transitionStyle
                    }">
                        <div class="points">
                            <Point v-for="point in map.points" :key="point.name" :point="point" :style="{
                                position: 'absolute',
                                zIndex: '100',
                                left: point.x + 'px',
                                top: point.y + 'px',
                            }" :hoverPoint="hoverPoint" @click="selectPoint($event, point)"
                                @dblclick="editPoint($event, point)" />
                        </div>
                        <img :src="imageSrc" alt="Map Image" class="map-image" />
                    </div>
                    <span class="vertical-line" v-if="isHovering" :style="{ left: parentMousePosition.x + 'px' }">
                        <div class="vertical-line-text">{{ Math.floor(picW) }} </div>
                    </span>
                    <span class="horizontal-line" v-if="isHovering" :style="{ top: parentMousePosition.y + 'px' }">
                        <div class="horizontal-line-text">{{ Math.floor(picH) }} </div>
                    </span>
                </div>
            </div>
            <Tabs @tabChanged="onTabChange" :activeTabIndex="activeTabIndex" class="tabs-container">
                <tab title="All Points">
                    <div v-if="!map.points || map.points?.length == 0">
                        Double click anywhere on the map to create a point.
                    </div>
                    <div class="points-container">
                        <div v-for="category in categories" :key="category">
                            <h2 v-if="matchCount(category)">
                                <span class="material-symbols-outlined">
                                    {{ category.icon }}
                                </span>
                                - {{ category.name }}
                            </h2>
                            <div v-for="point in map.points" :key="point.name">
                                <div class="point-display" v-if="point.icon == category.name"
                                    @mouseover="onMouseOver(point)" @mouseleave="onMouseHoverLeave"
                                    @click="toggleActive(point.name)">
                                    <div class="front">
                                        <div class="color">
                                            <div class="circle" :style="{ background: point.color }"></div>
                                        </div>

                                        <div class="coords">
                                            [{{ point.pX }},
                                            {{ point.pY }}]
                                        </div>
                                    </div>
                                    <div class="mid">
                                        <div class="name">
                                            {{ point.name }}
                                        </div>
                                    </div>
                                    <div class="end">
                                        <a @click="editAPoint(map.id, point)">
                                            <span class="material-symbols-outlined"> edit </span>
                                        </a>
                                        <a @click="deleteAPoint(map.id, point)">
                                            <span class="material-symbols-outlined"> delete </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </tab>
                <tab title="Point">
                    <div v-if="selectedPoint">
                        <div class="selected-point">
                            <h3>Selected Point</h3>
                        </div>
                        <div>
                            <!-- <label for="name">Name:</label> -->
                            <label for="">{{ selectedPoint.name }}</label>

                            <div class="coord-container">
                                <div class="coord">
                                    <label for="">X:</label>
                                    <label for="">{{ selectedPoint.pX }}</label>
                                </div>

                                <div class="coord">
                                    <label for="">Y:</label>
                                    <label for="">{{ selectedPoint.pY }}</label>
                                </div>

                                <button @click="showEditModal = !showEditModal">
                                    <span class="material-symbols-outlined">edit</span>
                                </button>
                                <button @click="deleteAPoint(map.id, point)">
                                    <span class="material-symbols-outlined"> delete (needs fixing) </span>
                                </button>
                            </div>

                        </div>
                        <div>
                            <label for="">{{ selectedPoint.description }}</label>
                        </div>

                        <div>
                            <label for="color">color:</label>
                            <label for="">{{ selectedPoint.color }}</label>
                        </div>

                        <div>
                            <label for="Category">Category:</label>
                            <label for="">{{ selectedPoint.icon }}</label>
                        </div>
                        <div>
                            <label for="size">size:</label>
                            <label for="">{{ selectedPoint.size }}</label>
                        </div>
                    </div>
                    <div v-else>
                        <template v-if="map.points?.length < 1">
                            Double click anywhere on the map to create a point.
                        </template>
                        <template v-else>
                            Select a point on the map to see more details.
                        </template>
                    </div>
                </tab>
            </Tabs>

        </div>
    </div>
</template>
<style scoped>
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
    color: white;
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    align-items: center;
    position: relative;
    /* background-color: #fbe6a5; */
    background-color: black;
    width: 100%;
    /* Make it take full width */
    height: 100%;
    /* Make it take full height */
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
    font-size: 1.5em;
    padding: 1em;
}

.map-wrapper {
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
    transform-origin: top left;
    /* Set origin for scaling */
    width: 100%;
    /* height: auto; */
    height: 100%;
}

.map-image {
    display: block;
    /* Remove inline spacing */
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
        1px 1px 0 black;
    /* Adjust color and position for stroke */
}

.coord-x,
.coord-y {
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

.tabs-container {}
</style>
