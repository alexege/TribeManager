<script setup>
import { ref, nextTick, computed } from 'vue'

const props = defineProps(['point', 'hoverPoint'])

const isToolTipVisible = ref(false)
const tooltipPosition = ref({ top: 0, left: 0 })

/* -------------------------
   ICON REGISTRY
------------------------- */
const ICON_MAP = {
  transmitter: new URL('@/assets/images/icons/Transmitter.png', import.meta.url).href,
  // obelisk: new URL('@/assets/images/icons/Obelisk.png', import.meta.url).href,
  waypoint: new URL('@/assets/images/icons/Waypoint.png', import.meta.url).href,
  artifact: new URL('@/assets/images/icons/Artifact.png', import.meta.url).href,
  teleporter: new URL('@/assets/images/icons/Teleporter.png', import.meta.url).href,
  'artifact-of-the-brute': new URL('@/assets/images/artifacts/Artifact_of_the_Brute.png', import.meta.url).href,
  'artifact-of-the-devourer': new URL('@/assets/images/artifacts/Artifact_of_the_Devourer.png', import.meta.url).href,
  'artifact-of-the-scourge': new URL('@/assets/images/artifacts/Artifact_of_the_Scourge.png', import.meta.url).href,
  'artifact-of-the-swarm': new URL('@/assets/images/artifacts/Artifact_of_the_Swarm.png', import.meta.url).href,
  'artifact-of-the-void': new URL('@/assets/images/artifacts/Artifact_of_the_Void.png', import.meta.url).href,
}

/* -------------------------
   ICON RESOLUTION
------------------------- */
const categoryKey = computed(() =>
  props.point.icon?.toLowerCase()
  // ||
  // props.point.category?.toLowerCase()
)

const iconSrc = computed(() => ICON_MAP[categoryKey.value] || null)

/* -------------------------
   AUTO SCALE
------------------------- */
const iconSize = computed(() => {
  const base = props.point.size || 24
  const zoom = props.point.zoom || 1
  return Math.max(16, base * zoom)
})

/* -------------------------
   TOOLTIP
------------------------- */
const showToolTip = async () => {
  isToolTipVisible.value = true
  await nextTick()

  const tooltip = document.querySelector('.tooltip')
  const container = document.querySelector('.tooltip-container')

  if (!tooltip || !container) return

  const tooltipRect = tooltip.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  let top = -tooltipRect.height - 6
  let left = (containerRect.width - tooltipRect.width) / 2

  left = Math.max(0, Math.min(left, containerRect.width - tooltipRect.width))
  tooltipPosition.value = { top, left }
}

const hideToolTip = () => {
  isToolTipVisible.value = false
}
</script>

<template>
  <div class="tooltip-container"
       @mouseenter="showToolTip"
       @mouseleave="hideToolTip">

    <div class="tooltip-target">

      <!-- ICON MARKER -->
      <img
        v-if="iconSrc"
        :src="iconSrc"
        class="marker-icon"
        :class="{ isHovered: point.name === hoverPoint }"
        :style="{ width: iconSize + 'px', height: iconSize + 'px' }"
      />

      <!-- FALLBACK DOT -->
      <div
        v-else
        class="point"
        :class="{ isHovered: point.name === hoverPoint }"
        :style="{
          backgroundColor: point.color,
          width: point.size + 'px',
          height: point.size + 'px'
        }"
      ></div>

    </div>

    <div v-if="isToolTipVisible"
         class="tooltip"
         :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }">
      <strong>{{ point.name }}</strong>
      <div>{{ point.icon }}</div>
      <div>Lon: {{ point.pX }}, Lat: {{ point.pY }}</div>
    </div>
  </div>
</template>

<style scoped>
.isHovered {
    outline: 2px solid yellow !important;
    box-shadow: 0 0 50px rgba(255, 255, 0, 0.9),
        /* Outer glow */
        0 0 60px rgba(255, 255, 0, 0.8);
    /* More intense glow */
}

.point {
    transform: translate(-50%, -50%);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    outline: 1px solid black;
    /* background-color: red; */
    cursor: pointer;
}

.tooltip-container {
    position: relative;
    /* display: inline-block; */
}

.tooltip-target {
    cursor: pointer;
}

.tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.75);
    outline: 1px solid var(--primary-color);
    color: white;
    padding: 5px;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 1000;
    line-height: 10px;
    font-size: .5em;
}



.marker-icon {
  transform: translate(-50%, -50%);
  object-fit: contain;
  pointer-events: auto;
  cursor: pointer;
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.7));
  border-radius: 50%;
  /* box-shadow: 0 0 5px 5px white; */
}

.point {
  transform: translate(-50%, -50%);
  border-radius: 50%;
  outline: 1px solid black;
  cursor: pointer;
}

.isHovered {
  outline: 2px solid yellow !important;
  box-shadow:
    0 0 25px rgba(255, 255, 0, 0.9),
    0 0 40px rgba(255, 255, 0, 0.7);
}




</style>


<!-- <script setup>
const props = defineProps(['points'])
</script>
<template>
    <div>
        <label for="point">[{{ points.x }},{{ points.y }}]</label>
        <div class="point"></div>
    </div>
</template>
<style scoped>
.point {
    transform: translate(-50%, -50%);
    width: 5px;
    height: 5px;
    /* width: 10px;
    height: 10px; */
    border-radius: 50%;
    outline: 1px solid black;
    background-color: red;
}
</style> -->