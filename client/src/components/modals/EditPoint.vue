<script setup>
import { ref, shallowRef, onMounted, onBeforeUnmount, watch } from 'vue'
import slider from '@/components/inputs/Slider.vue';
import ColorDropdown from '@/components/inputs/ColorDropdown.vue';
const emit = defineEmits(['update-point', 'modal-close'])
const props = defineProps(['point', 'mapId'])
const editPoint = shallowRef(props.point) //Made shallow so it doesn't live update
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
const onColorSelect = (color) => {
    editPoint.value.color = color
}
const updateX = () => {
    const map = document.querySelector('.map')
    const mapWidth = map.getBoundingClientRect().width
    editPoint.value.x = Math.floor(editPoint.value.pX / 100 * mapWidth);
};
const updateY = () => {
    const map = document.querySelector('.map')
    const mapHeight = map.getBoundingClientRect().height
    editPoint.value.y = Math.floor(editPoint.value.pY / 100 * mapHeight);
};
import { useMapStore } from '@/stores/map.store';
const mapStore = useMapStore()
const { updatePoint, deletePoint } = mapStore
const onSubmit = () => {
    // editPoint.value.x = editPoint.value.pX / 100 * 400
    // editPoint.value.y = editPoint.value.pY / 100 * 400
    console.log(`x: ${editPoint.value.x}`)
    console.log(`y: ${editPoint.value.y}`)
    console.log('editPoint:', editPoint.value)
    // emit('update-point', editPoint.value)
    updatePoint(editPoint.value._id, editPoint.value)
    emit('modal-close')
}
const onDelete = () => {
    deletePoint(props.mapId, editPoint.value._id)
    emit('modal-close')
}
const target = ref(null);
const handleClickOutside = (event) => {
    if (target.value && !target.value.contains(event.target)) {
        emit('modal-close');
    }
};
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    console.log(`initial point: ${props.point.x}`)
    console.log(`initial point: ${props.point.y}`)
});
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
const onPointSizeChange = (size) => {
    editPoint.value.size = size;
}
</script>
<template>
    <div class="modal-mask">
        <div class="modal-wrapper">
            <div class="modal-container">
                <span class="material-symbols-outlined exit" @click="emit('modal-close')">close</span>
                <div class="container">
                    <h2>Edit point: {{ point.name }}</h2>
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" class="input-field name" placeholder="Name"
                            v-model="editPoint.name">
                    </div>
                    <div class="form-group">
                        <textarea name="" id="" rows="4" v-model="editPoint.description"
                            placeholder="Description"></textarea>
                    </div>
                    <div class="form-group coordinates">
                        <label for="longitude">Coordinates:</label>
                        <input type="number" placeholder="longitude" max="100" id="longitude" v-model="editPoint.pX"
                            @input="updateX">
                        <input type="number" placeholder="latitude" max="100" v-model="editPoint.pY" @input="updateY">
                    </div>
                    <div class="form-group">
                        <label for="">Icon</label>
                        <select name="" id="" class="input-field" v-model="editPoint.icon">
                            <option v-for="category in categories" :value="category.name" :key="category">{{
                                category.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="color">Color:</label>
                        <color-dropdown :color="editPoint.color" @color="onColorSelect"></color-dropdown>
                    </div>
                    <div class="form-group">
                        <label for="size">Size:</label>
                        <slider @point-size="onPointSizeChange" :point="editPoint" />
                    </div>
                    <div class="button-container">
                        <button class="delete-btn button" @click.stop="onDelete">
                            <span class="material-symbols-outlined">
                                delete
                            </span>
                        </button>
                        <button class="cancel-btn button" @click.stop="emit('modal-close')">Cancel</button>
                        <button class="update-btn button" @click.stop="onSubmit">Update</button>
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
.container h2 {
    text-align: center;
    padding-bottom: 1.25em;
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
    background-color: var(--void-black);
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    color: var(--primary-color);
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
.button:hover {
    cursor: pointer;
}
.button:last-child {
    margin-right: 0;
}
.button:first-child {
    flex: 0.25;
}

.update-btn {
    color: var(--text-primary);
    background: var(--alternate-color);
    border: 1px solid var(--primary-color);
    cursor: pointer;
}

.update-btn:hover {
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

.delete-btn {
    color: var(--orange-muted);
    background: var(--glitchy-grey);
    border: 2px solid var(--secondary-bg-color);
}
.delete-btn:hover {
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
