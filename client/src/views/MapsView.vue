<script setup>
import Map from '@/components/maps/Map.vue'
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/map.store'
import { ref, computed } from 'vue'

// Store and map data
const mapStore = useMapStore()
const { allMaps } = storeToRefs(mapStore)

// Carousel map options
const mapOptions = ref([
    { name: 'The Island', img: '../../public/assets/maps/TheIsland.png' },
    { name: 'Scorched Earth', img: '../../public/assets/maps/ScorchedEarth.png' },
    { name: 'The Center', img: '../../public/assets/maps/TheCenterMap.jpg' },
    { name: 'Aberration', img: '../../public/assets/maps/Aberration.png' },
    { name: 'Astraeos', img: '../../public/assets/maps/Astraeos.png' },
    { name: 'Extinction', img: '../../public/assets/maps/Extinction.png' },
])

// const allMapData = [
//     {
//         name: 'The Island',
//         img: '../../public/assets/maps/TheIsland.png',
//         maps: [
//             {
//                 mapName: 'My first Island',
//             },
//             {
//                 mapName: 'My second Island',
//             }
//         ]
//     },
//     {
//         name: 'Scorched Earth',
//         img: '../../public/assets/maps/ScorchedEarth.png',
//         maps: [
//             {
//                 mapName: 'My first Scorched Earth',
//             },
//             {
//                 mapName: 'My second Scorched Earth',
//             }
//         ]
//     },
//     {
//         name: 'The Center',
//         img: '../../public/assets/maps/TheCenterMap.jpg',
//         maps: [
//             {
//                 mapName: 'My first Center',
//             },
//             {
//                 mapName: 'My second Center',
//             }
//         ]
//     },
//     {
//         name: 'Aberration',
//         img: '../../public/assets/maps/Aberration.png',
//         maps: [
//             {
//                 mapName: 'My first Aberration',
//             },
//             {
//                 mapName: 'My second Aberration',
//             }
//         ]
//     },
//     {
//         name: 'Astraeos',
//         img: '../../public/assets/maps/Astraeos.png',
//         maps: [
//             {
//                 mapName: 'My first Astraeos',
//             },
//             {
//                 mapName: 'My second Astraeos',
//             }
//         ]
//     },
//     {
//         name: 'Extinction',
//         img: '../../public/assets/maps/Extinction.png',
//         maps: [
//             {
//                 mapName: 'My first Extinction',
//             },
//             {
//                 mapName: 'My second Extinction',
//             }
//         ]
//     }
// ]

// Selected map name
const selectedMapName = ref(mapOptions.value[0].name)

// Add map to store
// const newMapTitle = ref()
const newMapDetails = ref({
    title: null,
    name: selectedMapName.value,
    points: [],
    img: mapOptions.value.find(map => map.name === selectedMapName.value).img
})

const addMap = () => {
    // const map = mapOptions.value.find(map => map.name === selectedMapName.value);
    console.log("adding new map with details:", newMapDetails.value);
    mapStore.createMap(newMapDetails.value);
}

// Transforming into nested structure
const groupedMapData = mapStore.allMaps.reduce((acc, curr) => {
    let existing = acc.find(group => group.name === curr.name)
    if (!existing) {
        existing = {
            id: curr.id,
            name: curr.name,
            img: curr.img,
            maps: []
        }
        acc.push(existing)
    }
    existing.maps.push({
        id: curr.id,
        name: curr.title,
        img: curr.img,
        points: curr.points
    })
    return acc
}, []);
const allMapDataUpdated = ref(groupedMapData)
const renderedMaps = computed(() => {
    return allMapDataUpdated.value.filter(map => map.name == selectedMapName.value)[0].maps
})

</script>
<template>
    <div>

        <h2 class="title">Scout Maps</h2>

        <pre>{{ newMapDetails }}</pre>

        <div class="container">
            <!-- Map Thumbnails -->
            <div class="thumbnail-list">
                <div v-for="map in allMapDataUpdated" :key="map.name" class="thumbnail"
                    :class="{ active: map.name === selectedMapName }" @click="selectedMapName = map.name">
                    <img :src="map.img" :alt="map.name" />
                    <p>{{ map.name }}</p>

                </div>
            </div>

            <!-- Add Map -->
            <div class="addMap">
                Add a new Map
                <input type="text" placeholder="Map Name" v-model="newMapDetails.title">
                <select name="" id="" v-model="selectedMapName">
                    <option v-for="map in groupedMapData" :key="map" :value="map.name">{{ map.name }}</option>
                </select>
                <button @click="addMap">Add Map</button>
            </div>

            <!-- Maps -->
            <div v-for="map in renderedMaps" :key="map.name">
                <Map :map="map" />
            </div>
        </div>
    </div>
</template>
<style scoped>
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
</style>
