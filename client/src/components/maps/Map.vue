<script setup>
// ===== Imports =====
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useMapStore } from '@/stores/map.store'

import Point from '@/components/maps/Point.vue'
import Tab from '@/components/tabs/Tab.vue'
import Tabs from '@/components/tabs/Tabs.vue'

import AddPoint from '@/components/modals/AddPoint.vue'
import EditPoint from '@/components/modals/EditPoint.vue'
import InlineEdit from '@/components/inputs/InlineEdit.vue'
import ToggleSwitch from '@/components/inputs/ToggleSwitch.vue'

// ===== Props & Emits =====
const props = defineProps({
  map: Object,
  activeBaseMap: String,
  baseMaps: Array,
  newMapTitle: String
})

const emit = defineEmits([
  'add-map-instance',
  'update:newMapTitle'
])

// ===== Store =====
const mapStore = useMapStore()
const {
  createPoint,
  deletePoint,
  updatePoint,
  categories,
  deleteMapInstance
} = mapStore

const activeMap = computed(() => mapStore.activeMap)
const activeMapId = computed(() => mapStore.activeMapId)

// ===== Constants =====
const MIN_SCALE = 0.5
const TRANSITION_MS = 300
const ZOOM_TO_POINT_SCALE = 2

// ===== Refs =====
const mapRef = ref(null)
const activeMapEl = ref(null)

// ===== Map Transform State =====
const scale = ref(1)
const translate = ref({ x: 0, y: 0 })
const resetting = ref(false)

// ===== Mouse State =====
const isDragging = ref(false)
const isHovering = ref(false)
const parentMousePosition = ref({ x: 0, y: 0 })
const picW = ref(0)
const picH = ref(0)

// ===== Point / Selection State =====
const selectedPoint = ref(null)
const hoverPoint = ref(null)
const point = ref({})
const collapsedCategories = ref({})

// ===== Modals =====
const isModalOpen = ref(false)
const showEditModal = ref(false)
const activeTabIndex = ref(0)

// ===== Computed =====
const transitionStyle = computed(() => resetting.value ? 'transform 0.3s ease' : 'none')
const imageSrc = computed(() => props.map.img ?? '')

const filteredMapIds = computed(() =>
  mapStore.mapIds.filter(id => {
    const map = mapStore.mapsById[id]
    return map?.baseMapName === props.activeBaseMap
  }).reverse()
)

const activeMapPoints = computed(() => {
  if (!activeMapId.value) return []
  if (!mapStore.pointIdsByMap[activeMapId.value]) return []

  const pointIds = mapStore.pointIdsByMap[activeMapId.value]
  const points = pointIds
    .map(id => mapStore.pointsById[id])
    .filter(Boolean)

  return points
})

const visiblePoints = computed(() => {
  return activeMapPoints.value.filter(point => {
    return categoryVisibility.value[point.icon] !== false
  })
})

const categoriesWithPoints = computed(() => {
  if (!activeMapPoints.value?.length) return []

  return categories.filter(category =>
    activeMapPoints.value.some(p => p.icon === category.name)
  )
})

// ===== Watchers =====
watch(filteredMapIds, async (newIds) => {
  console.log('Filtered map IDs changed:', newIds)
  activeTabIndex.value = 0

  if (newIds.length > 0 && newIds[0] !== activeMapId.value) {
    const firstMapId = newIds[0]
    await mapStore.setActiveMap(firstMapId)
  }

  resetMap()
}, { immediate: false })

// ===== Mouse / Map Events =====
const onMouseDown = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const onMouseMove = (event) => {
  const mapWidth = event.target.getBoundingClientRect().width
  const mapHeight = event.target.getBoundingClientRect().height

  picW.value = event.offsetX / mapWidth * 100 * scale.value
  picH.value = event.offsetY / mapHeight * 100 * scale.value

  if (isDragging.value) {
    translate.value.x += event.movementX
    translate.value.y += event.movementY
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
  const mapContainer = event.currentTarget
  const rect = mapContainer.getBoundingClientRect()

  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  const zoom = event.deltaY < 0 ? 1.1 : 0.9
  const newScale = scale.value * zoom

  if (newScale < MIN_SCALE) {
    resetMap()
    return
  }

  if (newScale >= MIN_SCALE) {
    const scaleFactor = newScale / scale.value
    translate.value.x = mouseX - (mouseX - translate.value.x) * scaleFactor
    translate.value.y = mouseY - (mouseY - translate.value.y) * scaleFactor
    scale.value = newScale
  }
}

const onContainerMouseMove = (event) => {
  const container = event.target.closest('.map')
  if (container) {
    const rect = container.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const offsetY = event.clientY - rect.top
    parentMousePosition.value = { x: offsetX, y: offsetY }
  }
}

const onDoubleClick = (event) => {
  event.preventDefault()
  const mapWidth = event.target.getBoundingClientRect().width
  const mapHeight = event.target.getBoundingClientRect().height

  point.value.x = Math.floor(event.offsetX)
  point.value.y = Math.floor(event.offsetY)
  point.value.pX = Math.floor(event.offsetX / mapWidth * 100 * scale.value)
  point.value.pY = Math.floor(event.offsetY / mapHeight * 100 * scale.value)

  activeMapEl.value = event.target
  isModalOpen.value = true
}

// ===== Reset Map =====
const resetMap = () => {
  resetting.value = true
  scale.value = 1
  translate.value = { x: 0, y: 0 }
  setTimeout(() => {
    resetting.value = false
  }, TRANSITION_MS)
}

// ===== Lifecycle =====
onMounted(() => {
  console.log('Map.vue mounted')
  document.addEventListener('mouseup', onMouseUp)
})

onBeforeUnmount(() => {
  document.removeEventListener('mouseup', onMouseUp)
})

// ===== Modal Handlers =====
const closeModal = () => {
  isModalOpen.value = false
}

const onAddPoint = (value) => {
  const map = activeMapEl.value
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
    category: value.icon,
    size: value.size
  }

  createPoint(mapStore.activeMapId, newPoint)
  closeModal()
  activeTabIndex.value = 1
}

// ===== Point Handlers =====
const selectPoint = (e, point) => {
  if (e) e.stopPropagation()
  selectedPoint.value = point
  activeTabIndex.value = 1
}

const editPoint = (point) => {
  selectedPoint.value = point
  showEditModal.value = true
}

const deletePointHandler = (pointData) => {
  deletePoint(props.map.id, pointData._id)
  if (selectedPoint.value?.id === pointData._id) selectedPoint.value = null
}

const zoomToPoint = (point) => {
  if (!mapRef.value) return

  const mapWidth = mapRef.value.clientWidth
  const mapHeight = mapRef.value.clientHeight
  const targetScale = ZOOM_TO_POINT_SCALE

  resetting.value = true
  translate.value = {
    x: mapWidth / 2 - point.x * targetScale,
    y: mapHeight / 2 - point.y * targetScale
  }
  scale.value = targetScale

  setTimeout(() => (resetting.value = false), TRANSITION_MS)
  selectedPoint.value = point
  activeTabIndex.value = 1
}

const onTabChange = (index) => {
  activeTabIndex.value = index
}

const onMouseOver = (point) => {
  hoverPoint.value = point
}

const onMouseHoverLeave = () => {
  hoverPoint.value = null
}

const matchCount = (category) => {
  return activeMapPoints.value?.filter(point => point.icon === category.name).length
}

const toggleCategory = (categoryName) => {
  collapsedCategories.value[categoryName] = !collapsedCategories.value[categoryName]
}

// ===== Category Visibility =====
const categoryVisibility = ref({})

onMounted(() => {
  categories.forEach(cat => {
    categoryVisibility.value[cat.name] = true
  })
})

const confirmDeleteMap = (mapId) => {
  const map = mapStore.mapsById[mapId]
  if (!map) return

  const confirmed = confirm(`Delete "${map.title}"?`)
  if (!confirmed) return

  mapStore.deleteMapInstance(mapId)
}
</script>

<template>
  <div class="map-container" @mousemove="onContainerMouseMove" v-if="activeMap">
    <EditPoint
      v-if="showEditModal"
      :point="selectedPoint"
      :mapId="props.map.id"
      @modal-close="showEditModal = false"
    />

    <AddPoint
      v-if="isModalOpen"
      :point="point"
      :points="activeMapPoints"
      @modal-close="isModalOpen = false"
      @add-point="onAddPoint"
    />

    <div class="map-main">
      <!-- Map Name -->
      <div class="map-name-wrapper" v-if="filteredMapIds.length > 0">
        <InlineEdit
          v-if="activeMap"
          class="map-name"
          :model-value="activeMap.title"
          placeholder="Map name"
          @save="(val) => mapStore.updateMapName(activeMap.id, val)"
        >
          <template #display>
            <h3>{{ activeMap.title }}</h3>
          </template>
        </InlineEdit>
        <span>({{ activeMap.baseMapName }})</span>
      </div>

      <div v-else class="map-name-wrapper placeholder">
        <h2 class="map-name placeholder-text">No map selected</h2>
        <span class="placeholder-subtext">Add or select a map to continue</span>
      </div>

      <div class="two-column">
        <div class="map-wrapper" v-if="filteredMapIds.length > 0">
          <div class="overlay">
            <span class="coord-x"><span class="label">Lat:</span> {{ Math.floor(picW) }}</span>
            <span class="coord-y"><span class="label">Lon:</span> {{ Math.floor(picH) }}</span>
            <span class="reset" @click="resetMap">reset zoom</span>
          </div>

          <div
            class="map"
            ref="mapRef"
            @mouseover="isHovering = true"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseleave="onMouseLeave"
            @wheel="onWheel"
            @dblclick="onDoubleClick"
            :style="{ cursor: isDragging ? 'grabbing' : 'crosshair' }"
          >
            <div
              class="image-container"
              :style="{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                transition: transitionStyle
              }"
            >
              <div class="points">
                <Point
                  v-for="p in visiblePoints"
                  :key="p._id"
                  :point="p"
                  :hoverPoint="hoverPoint?.name"
                  @click="selectPoint($event, p)"
                  @dblclick="editPoint(p)"
                  :style="{
                    left: p.x + 'px',
                    top: p.y + 'px',
                    position: 'absolute',
                    zIndex: 100
                  }"
                />
              </div>
              <img :src="imageSrc" class="map-image" />
            </div>

            <span
              class="vertical-line"
              v-if="isHovering"
              :style="{ left: parentMousePosition.x + 'px' }"
            >
              <div class="vertical-line-text">{{ Math.floor(picW) }}</div>
            </span>

            <span
              class="horizontal-line"
              v-if="isHovering"
              :style="{ top: parentMousePosition.y + 'px' }"
            >
              <div class="horizontal-line-text">{{ Math.floor(picH) }}</div>
            </span>
          </div>
        </div>

        <div v-else class="no-map">
          No map found. Please add one to continue... →
        </div>

        <Tabs @tabChanged="onTabChange" :activeTabIndex="activeTabIndex" class="tabs-container">
          <tab title="All Maps">
            <!-- Add Map Instance -->
            <div class="add-map">
              <input
                type="text"
                placeholder="Add Map"
                :value="newMapTitle"
                @keydown.enter="emit('add-map-instance')"
                @input="emit('update:newMapTitle', $event.target.value)"
              />
              <button @click="emit('add-map-instance')" class="add-map-btn">Add Map</button>
            </div>

            <!-- Map List -->
            <div class="map-list scrollable">
              <div
                v-for="id in filteredMapIds"
                :key="id"
                :class="{ active: id === activeMapId }"
                class="map-instance-name"
                @click="mapStore.setActiveMap(id)"
              >
                <InlineEdit
                  class="map-tab-name"
                  :model-value="mapStore.mapsById[id].title"
                  placeholder="Map name"
                  deletable
                  @save="(val) => mapStore.updateMapName(id, val)"
                  @delete="confirmDeleteMap(id)"
                >
                  {{ mapStore.mapsById[id].title }}
                </InlineEdit>
              </div>
            </div>
          </tab>

          <tab title="All Points">
            <div v-if="!activeMapPoints?.length">
              Double click anywhere on the map to create a point.
            </div>

            <div class="points-container scrollable">
              <template v-for="category in categoriesWithPoints" :key="category.name">
                <div v-if="matchCount(category)" class="category-wrapper">
                  <div
                    class="category-header"
                    :class="{ collapsed: collapsedCategories[category.name]}"
                    @click="toggleCategory(category.name)"
                  >
                    <span class="material-symbols-outlined">{{ category.icon }}</span> - {{ category.name }}
                  </div>

                  <div class="category-controls">
                    <span class="chevron" @click="toggleCategory(category.name)">
                      {{ collapsedCategories[category.name] ? '▾' : '▴' }}
                    </span>
                    <ToggleSwitch class="toggle" v-model="categoryVisibility[category.name]"/>
                  </div>
                </div>

                <transition name="collapse">
                  <div v-if="!collapsedCategories[category.name]" class="category-content">
                    <template v-for="p in activeMapPoints" :key="p._id">
                      <div
                        v-if="p.icon === category.name && categoryVisibility[category.name]"
                        class="point-display"
                        @mouseover="onMouseOver(p)"
                        @mouseleave="onMouseHoverLeave"
                        @click.prevent="zoomToPoint(p)"
                      >
                        <div class="front">
                          <div class="color">
                            <div class="circle" :style="{ background: p.color }"></div>
                          </div>
                          <div class="coords">[{{ p.pX }}, {{ p.pY }}]</div>
                        </div>
                        <div class="mid">
                          <div class="name">{{ p.name }}</div>
                        </div>
                        <div class="end">
                          <a @click.prevent="editPoint(p)">
                            <span class="material-symbols-outlined">edit</span>
                          </a>
                          <a @click.prevent="deletePointHandler(p)">
                            <span class="material-symbols-outlined">delete</span>
                          </a>
                        </div>
                      </div>
                    </template>
                  </div>
                </transition>
              </template>
            </div>
          </tab>

          <tab title="Point">
            <div v-if="selectedPoint" class="selected-point-wrapper">
              <div class="selected-point">
                <h3>{{ selectedPoint.name }}</h3>
                <button class="edit-btn" @click="editPoint(selectedPoint)" title="Edit point">
                  <span class="material-symbols-outlined">edit</span>
                </button>
              </div>

              <div class="coord-container">
                <div class="coord"><span class="label">X:</span> {{ selectedPoint.pX }}</div>
                <div class="coord"><span class="label">Y:</span> {{ selectedPoint.pY }}</div>
              </div>

              <div><span class="label">Color:</span> {{ selectedPoint.color }}</div>
              <div><span class="label">Category:</span> {{ selectedPoint.icon }}</div>
              <div><span class="label">Size:</span> {{ selectedPoint.size }}</div>
              <div><span class="label">Description:</span> {{ selectedPoint.description || '...' }}</div>
            </div>

            <div v-else>
              <template v-if="!activeMapPoints?.length">
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
/* Keep all your existing styles - they're fine! */
.label {
  color: var(--primary-color);
}

.no-map {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #121212;
  min-width: 25vw;
  min-height: 25vw;
  width: 50vw;
  height: 50vw;
  outline: 1px solid var(--orange);
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
  cursor: pointer;
  outline: 1px solid yellow;
  margin-left: 10px;
}

.point-display .color .circle {
  width: 1em;
  height: 1em;
  border-radius: 50%;
}

.category-wrapper {
  display: flex;
  padding: 0 5px;
  align-items: center;
  justify-content: space-between;
  outline: .5px solid var(--orange);
}

.category-wrapper:hover {
  background: var(--secondary-bg-color);
}

.category-controls {
  display: flex;
  flex-direction: row;
  gap: .5em;
}

.category-controls .chevron {
  font-size: 2em;
  cursor: pointer;
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
  gap: 1em;
}

.coord {
  display: flex;
  align-items: center;
  border-radius: 5px;
  min-width: 50px;
  gap: .25em;
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
  gap: .5em;
  height: 50vw;
}

.map-main {
  padding: 2em;
  padding-top: 0;
}

.map-container {
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background-color: #141414;
  width: 100%;
  height: 100%;
}

.map-container::before {
    content: '';
    position: absolute;
    inset: 20px 16px 16px 16px;
    pointer-events: none;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.3;
    z-index: 0;
}

.map-container::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at center, transparent 50%, rgba(0, 0, 0, 0.5));
    z-index: 0;
}

.map {
  position: relative;
  overflow: hidden;
  min-width: 25vw;
  min-height: 25vw;
  width: 50vw;
  height: 50vw;
  box-shadow: 0 0 15px black;
}

.map-name {
  font-size: 1.5em;
  /* padding: 1em; */
  text-align: center;
  display: flex;
  justify-content: center;
}

.map-name-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em;
}

.map-name-wrapper h3 {
  font-size: 1.5em;
  margin: 0;
}

.map-name-wrapper span {
  font-size: .75rem;
}

.map-tab-name {
  padding: .25em .5em;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.map-list {
  max-height: calc(100% - 50px);
  flex: 1;
  min-height: 0;
}

.map-list .active {
  color: var(--text-primary);
  outline: 1px solid var(--orange);
  background: var(--glitch-grey);
}

.map-instance-name {
  padding: .5em;
  margin: 0.25em;
  cursor: pointer;
  background: var(--glitch-grey);
}

.map-instance-name:hover {
  background: var(--border-subtle);
  color: var(--orange);
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
  gap: .25em;
  padding-top: 1px;
  padding-left: 1px;
  padding-right: 1px;
  gap: 8px;
}

.image-container {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  width: 100%;
  height: 100%;
}

.map-image {
  display: block;
  width: 100%;
  height: 100%;
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

.horizontal-line-text,
.vertical-line-text {
  color: white;
  text-shadow:
    -1px -1px 0 black,
    1px -1px 0 black,
    -1px 1px 0 black,
    1px 1px 0 black;
}

.vertical-line-text {
  margin-left: 10px;
}

.coord-x,
.coord-y {
  display: flex;
  align-items: center;
  padding: 0 1em;
  margin: .25em;
  gap: .25em;
  outline: 1px solid var(--primary-color);
}

.reset {
  display: flex;
  align-items: center;
  background: none;
  padding: 0 1em;
  margin: .25em;
  outline: 1px solid var(--primary-color);
  cursor: pointer;
}

.reset:hover {
  color: black;
  outline: 1px solid var(--border-subtle);
  background: var(--primary-color);
}

.overlay {
  z-index: 1;
  display: flex;
  width: 100%;
  justify-content: flex-end;
}

.tabs-container {
  width: 25vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--alternate-bg-color);
  backdrop-filter: blur(1px);
  /* outline: 1px solid var(--primary-color); */
  border: 1px solid var(--border-subtle)
}

.tabs-container .tab-panel input[type="text"]{
  color: var(--text-primary);
  background: var(--glitch-grey);
  border: 1px solid var(--primary-color);
}

.tabs-container .tab-panel input[type="text"]::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.add-map-btn {
    padding: .35em .5em;
    color: var(--text-primary);
    background: var(--alternate-color);
    border: 1px solid var(--primary-color);
    cursor: pointer;
}

.add-map-btn:hover {
    background: var(--primary-color);
    color: var(--void-black);
    border: 1px solid transparent;
}

/* Target the scrollable element */
.scrollable {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) transparent;
}

.scrollable::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  border-radius: 4px;
}

.add-map {
  display: flex;
  gap: .5em;
  margin: 1em 0;
  justify-content: center;
}

.collapse-enter-active,
.collapse-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}

.category-header {
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
}

.edit-btn {
  background: none;
  border: none;
  color: cyan;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
}

.edit-btn:hover {
  color: yellow;
}

.placeholder {
  opacity: 0.5;
  pointer-events: none;
}

.placeholder-text {
  font-size: 1.5em;
  /* padding: 1em; */
  text-align: center;
  font-style: italic;
}

.placeholder-subtext {
  font-size: .75rem;
}

.material-symbols-outlined {
  font-size: 1em;
}
</style>