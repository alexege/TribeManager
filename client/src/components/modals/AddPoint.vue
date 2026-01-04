
<script setup>
import { defineProps, defineEmits, ref, onMounted, onBeforeUnmount, watch } from "vue";
import ColorDropdown from "@/components/inputs/ColorDropdown.vue";
import Slider from "@/components/inputs/Slider.vue";
const props = defineProps({
    point: Object,
    points: Object
});
const emit = defineEmits(["modal-close", "add-point"]);
const target = ref(null);
const categories = ref([{
    name: 'Raid-Target',
    icon: ''
}, {
    name: 'Turrets',
    icon: '',
}, {
    name: 'Resource',
    icon: '',
}, {
    name: 'Obelisk',
    icon: '',
}, {
    name: 'Transmitter',
    icon: '',
}, {
    name: 'Death-Marker',
    icon: '',
}, {
    name: 'Tame',
    icon: '',
}, {
    name: 'Artifact',
    icon: '',
}, {
    name: 'Navigation',
    icon: '',
}, {
    name: 'Waypoint',
    icon: ''
}]);
const handleClickOutside = (event) => {
    if (target.value && !target.value.contains(event.target)) {
        emit('modal-close');
    }
};
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
const pointDetails = ref({
    name: `Point ${props.points.length + 1}`,
    description: props.point.description,
    x: props.point.x,
    y: props.point.y,
    pX: props.point.pX,
    pY: props.point.pY,
    icon: 'Raid-Target',
    color: 'Red',
    size: 10
})
watch(() => props.point, (newPoint) => {
    if (newPoint) {
        pointDetails.value.x = newPoint.x || 0;
        pointDetails.value.y = newPoint.y || 0;
    }
});
const onSubmit = () => {
    console.log(`submitting: ${JSON.stringify(pointDetails.value)}`)
    emit('add-point', pointDetails.value)
    // emit('modal-close')
}
const onColorSelect = (value) => {
    pointDetails.value.color = value
}
const onPointSizeChange = (size) => {
    console.log("changing", size)
    pointDetails.value.size = size;
}
const updateX = () => {
    const map = document.querySelector('.map')
    const mapWidth = map.getBoundingClientRect().width
    pointDetails.value.x = Math.floor(pointDetails.value.pX / 100 * mapWidth);
};
const updateY = () => {
    const map = document.querySelector('.map')
    const mapHeight = map.getBoundingClientRect().height
    pointDetails.value.y = Math.floor(pointDetails.value.pY / 100 * mapHeight);
};

const addButton = ref(null)
onMounted(() => {
    addButton.value?.focus()
})
</script>
<template>
    <div class="modal-mask">
        <div class="modal-wrapper">
            <div class="modal-container" ref="target">
                <span class="material-symbols-outlined exit" @click="emit('modal-close')">close</span>
                <div class="container">
                    <h2>Add new point</h2>
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" class="input-field name" placeholder="Name"
                            v-model="pointDetails.name">
                    </div>
                    <div class="form-group">
                        <textarea name="" id="" rows="4" v-model="pointDetails.description"
                            placeholder="Description"></textarea>
                    </div>
                    <div class="form-group coordinates">
                        <label for="longitude">Coordinates:</label>
                        <input type="number" placeholder="longitude" max="100" id="longitude" v-model="pointDetails.pX"
                            @input="updateX">
                        <input type="number" placeholder="latitude" max="100" v-model="pointDetails.pY"
                            @input="updateY">
                    </div>
                    <div class="form-group">
                        <label for="">Icon</label>
                        <select name="" id="" class="input-field" v-model="pointDetails.icon">
                            <option v-for="category in categories" :value="category.name" :key="category">{{
                                category.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="color">Color:</label>
                        <color-dropdown @color="onColorSelect"></color-dropdown>
                    </div>
                    <div class="form-group">
                        <label for="size">Size:</label>
                        <slider @point-size="onPointSizeChange" :point="pointDetails" />
                    </div>
                    <div class="button-container">
                        <button class="cancel-btn button" @click.stop="emit('modal-close')">Cancel</button>
                        <button class="add-btn button" @click.stop="onSubmit" ref="addButton">Add</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
    margin: auto;
}
.form-group {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}
.modal-container {
    position: relative;
    width: 18.75em;
    margin: 150px auto;
    padding: 20px 30px;
    color: var(--primary-color);
    background-color: var(--void-black);
    /* background-color: white; */
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    position: fixed;
    /* or absolute */
    top: 50%;
    left: 50%;
    transform: translate(-50%, -90%);
    outline: 2px solid var(--primary-color);
}
.coordinates {
    display: flex;
}
.coordinates input[type="number"] {
    flex: 1;
    min-width: 0;
    padding: 5px;
}
label {
    flex: 0 0 140px;
    text-align: left;
}
.input-field {
    flex: 1;
    /* padding: 8px; */
}
.name {
    width: 100%;
    padding: 5px;
}
.button-container {
    display: flex;
    margin-top: 20px;
}
.button {
    flex: 1;
    padding: 3px 10px;
    margin-right: 10px;
}
.button:last-child {
    margin-right: 0;
}

.add-btn {
    color: var(--text-primary);
    background: var(--alternate-color);
    border: 1px solid var(--primary-color);
    cursor: pointer;
}

.add-btn:hover {
    background: var(--primary-color);
    color: var(--void-black);
    border: 1px solid transparent;
}

.cancel-btn {
    color: var(--void-black);
    background: var(--primary-color);
    border: 2px solid var(--primary-color);
}
.cancel-btn:hover {
    cursor: pointer;
    color: var(--primary-color);
    background: var(--void-black);
    border: 2px solid var(--primary-color);
}

.exit {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
}
textarea {
    width: 100%;
    padding: .25em;
}
</style>
