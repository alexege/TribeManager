<script setup>

import { ref } from 'vue'
const props = defineProps(['color'])
const emit = defineEmits(['color'])
const colors = ['Red', 'Orange', 'Yellow', 'Green', 'Lime', 'Blue', 'Cyan', 'Purple', 'White', 'Black']
const selectedColor = ref(props.color || 'Red')
const isDropdownOpen = ref(false)

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
}

const selectColor = (color, event) => {
    console.log("selecting color: ", color)
    event.stopPropagation()
    selectedColor.value = color
    isDropdownOpen.value = false

    emit('color', selectedColor.value)
}

</script>
<template>
    <div class="dropdown">
        <!-- <label for="color-select">Select a color:</label> -->
        <div @click="toggleDropdown" class="dropdown-toggle">
            <span class="color-box" :style="{ backgroundColor: selectedColor }"></span>
            <span class="color-text">{{ selectedColor }}</span>
        </div>
        <ul v-if="isDropdownOpen" class="dropdown-menu">
            <li v-for="color in colors" :key="color" @click="selectColor(color, $event)" class="dropdown-item">
                <span class="color-box" :style="{ backgroundColor: color }"></span>
                <span class="color-text">{{ color }}</span>
            </li>
        </ul>
    </div>
</template>
<style scoped>
.dropdown {
    flex: 1;
    position: relative;
    display: inline-block;
    background: white;
}

.dropdown-toggle {
    padding: 2px;
    border: 1px solid #ccc;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.color-box {
    width: 15px;
    height: 15px;
    /* margin-left: 10px; */
    margin: 4px;
    border: 1px solid #000;
}

.color-text {
    margin: 0 10px;
    color: black;
}

.dropdown-menu {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    list-style: none;
    padding: 0;
    margin: 0;
    /* width: 100%; */
    z-index: 1000;
    flex: 1;
}

.dropdown-item {
    padding: 2px;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.dropdown-item:hover {
    background-color: #f0f0f0;
}
</style>
