<script setup>
const props = defineProps(['point', 'hoverPoint']);
import { ref, nextTick } from 'vue';
const isToolTipVisible = ref(false);
const tooltipPosition = ref({ top: 0, left: 0 });
const showToolTip = async () => {
    isToolTipVisible.value = true;
    await nextTick(); // Wait for the DOM to update
    const tooltip = document.querySelector('.tooltip');
    const container = document.querySelector('.tooltip-container');
    if (tooltip && container) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        let top = -tooltipRect.height - 5; // Position above the target
        let left = (containerRect.width - tooltipRect.width) / 2; // Center the tooltip
        // Adjust position if the tooltip goes off the screen
        if (left < 0) {
            left = 0; // Prevent overflow on the left
        } else if (left + tooltipRect.width > containerRect.width) {
            left = containerRect.width - tooltipRect.width; // Prevent overflow on the right
        }
        // Set final position
        tooltipPosition.value = { top, left };
    }
};
const hideToolTip = () => {
    isToolTipVisible.value = false;
};
</script>
<template>
    <div>
        <div class="tooltip-container" @mouseenter="showToolTip" @mouseleave="hideToolTip">
            <div class="tooltip-target">
                <div class="point" :class="{
                    isHovered: point.name === hoverPoint
                }"
                    :style="[{ 'backgroundColor': point.color }, { width: point.size + 'px' }, { height: point.size + 'px' }]">
                </div>
            </div>
            <div class="tooltip" v-if="isToolTipVisible"
                :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }">
                <span>{{ point.name }} - {{ point.icon }}</span>
                <div>Lon: {{ point.pX }}, Lat: {{ point.pY }}</div>
            </div>
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