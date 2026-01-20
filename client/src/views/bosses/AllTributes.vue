<script setup>
import { ref, computed } from 'vue'
import { useItemStore } from '@/stores/item.store'

const itemStore = useItemStore()
const searchQuery = ref('')
const orientation = ref('square')

const filteredArtifacts = computed(() => {
  if (!searchQuery.value) return itemStore.allArtifacts

  const query = searchQuery.value.toLowerCase()
  return itemStore.allArtifacts.filter(item =>
    item.name.toLowerCase().includes(query)
  )
})

const filteredTrophies = computed(() => {
  if (!searchQuery.value) return itemStore.allTrophies

  const query = searchQuery.value.toLowerCase()
  return itemStore.allTrophies.filter(item =>
    item.name.toLowerCase().includes(query)
  )
})

const updateQuantity = (item, delta) => {
  const newQuantity = Math.max(0, item.quantity + delta)
  itemStore.updateItemQuantity(item.name, newQuantity)
}

const handleKeyDown = (event, item) => {
  if (event.key === 'ArrowUp') {
    updateQuantity(item, 1)
    event.preventDefault()
  } else if (event.key === 'ArrowDown') {
    updateQuantity(item, -1)
    event.preventDefault()
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}
</script>

<template>
  <div class="page">
    <div class="top">
      <label class="search" for="search">
        <div class="search-box">
          <i class="bx bx-search"></i>
          <input
            id="search"
            class="search-input"
            type="text"
            placeholder="Search..."
            v-model="searchQuery"
          />
          <i v-if="searchQuery" class="bx bx-x clear" @click="clearSearch"></i>
        </div>
      </label>
      <div class="orientation-container">
        <label for="orientation">Orientation:</label>
        <select id="orientation" v-model="orientation" class="orientation">
          <option value="square">Square</option>
          <option value="rectangle">Rectangle</option>
        </select>
      </div>
    </div>

    <div v-if="filteredArtifacts.length > 0" class="artifacts">
      <h2>Artifacts</h2>
      <div :class="`${orientation}-view`">
        <template v-if="orientation === 'square'">
          <div
            v-for="artifact in filteredArtifacts"
            :key="artifact.id"
            class="artifact-container"
          >
            <div class="artifact">
              <div class="details">
                <img :src="artifact.img" :alt="artifact.name" />
                <label>{{ artifact.name }}</label>
              </div>
            </div>
            <div class="controls">
              <span class="material-symbols-outlined" @click="updateQuantity(artifact, -1)">
                <i class="bx bx-minus-circle"></i>
              </span>
              <input
                type="number"
                :min="0"
                :value="artifact.quantity"
                @keydown="handleKeyDown($event, artifact)"
              />
              <span class="material-symbols-outlined" @click="updateQuantity(artifact, 1)">
                <i class="bx bx-plus-circle"></i>
              </span>
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="artifact in filteredArtifacts"
            :key="artifact.id"
            class="artifact-container-square"
          >
            <div class="artifact-square">
              <div class="details-square">
                <img :src="artifact.img" :alt="artifact.name" />
                <label>{{ artifact.name }}</label>
                <div class="controls-square">
                  <span class="material-symbols-outlined" @click="updateQuantity(artifact, 1)">
                    <i class='bx bxs-chevron-up'></i>
                  </span>
                  <input
                    type="number"
                    :min="0"
                    :value="artifact.quantity"
                    @keydown="handleKeyDown($event, artifact)"
                  />
                  <span class="material-symbols-outlined" @click="updateQuantity(artifact, -1)">
                    <i class='bx bxs-chevron-down'></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="filteredTrophies.length > 0" class="trophies">
      <h2>Trophies</h2>
      <div :class="`${orientation}-view`">
        <template v-if="orientation === 'square'">
          <div
            v-for="trophy in filteredTrophies"
            :key="trophy.id"
            class="trophy-container"
          >
            <div class="trophy">
              <div class="details">
                <img :src="trophy.img" :alt="trophy.name" />
                <label>{{ trophy.name }}</label>
              </div>
            </div>
            <div class="controls">
              <span class="material-symbols-outlined" @click="updateQuantity(trophy, -1)">
                <i class="bx bx-minus-circle"></i>
              </span>
              <input
                type="number"
                :min="0"
                :value="trophy.quantity"
                @keydown="handleKeyDown($event, trophy)"
              />
              <span class="material-symbols-outlined" @click="updateQuantity(trophy, 1)">
                <i class="bx bx-plus-circle"></i>
              </span>
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="trophy in filteredTrophies"
            :key="trophy.id"
            class="trophy-container-square"
          >
            <div class="trophy-square">
              <div class="details-square">
                <img :src="trophy.img" :alt="trophy.name" />
                <label>{{ trophy.name }}</label>
                <div class="controls-square">
                  <span class="material-symbols-outlined" @click="updateQuantity(trophy, 1)">
                    <i class='bx bxs-chevron-up'></i>
                  </span>
                  <input
                    type="number"
                    :min="0"
                    :value="trophy.quantity"
                    @keydown="handleKeyDown($event, trophy)"
                  />
                  <span class="material-symbols-outlined" @click="updateQuantity(trophy, -1)">
                    <i class='bx bxs-chevron-down'></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  font-size: 1.5em;
  padding: 1em;
  text-align: center;
}

.page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.rectangle-view {
  gap: 0.625em;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
}

.square-view {
  gap: 0.625em;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.square-view label {
  padding: .5em 0;
}

.artifact-container,
.trophy-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  border: 1px solid rgb(16, 15, 28);
  border-radius: 5px;
  padding: 0.25em;
  width: 8em;
}

.artifact-container:hover,
.trophy-container:hover {
  cursor: pointer;
  box-shadow:
    0 1px 2px 0 rgba(255, 255, 255, 0.5),
    0 2px 10px 0 rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

.artifacts,
.trophies {
  width: 100%;
}

.artifact,
.trophy {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 6em;
}

.artifact img,
.trophy img {
  width: 4em;
}

.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  margin: 0.25em 0;
}

.controls input {
  text-align: center;
  width: 2em;
}

input[type='number'] {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
}

.controls span {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.controls span:hover {
  color: gray;
  background-color: white;
}

.artifact-container-square,
.trophy-container-square {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  border: 1px solid rgb(16, 15, 28);
  padding: 0.25em;
  width: 30%;
}

.details-square {
  display: flex;
  align-items: center;
  gap: 1em;
}

.details-square label {
  flex: 1;
}

.details-square img {
  width: 3rem;
  margin: 0 0.5em;
}

.controls-square {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
}

.controls-square span {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.controls-square span:hover {
  color: gray;
  background-color: white;
}

.controls-square input {
  text-align: center;
  width: 2em;
}

.top {
  box-sizing: border-box;
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.orientation-container {
  width: 100%;
}

.orientation {
  align-self: flex-start;
}

.search {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: 1px solid white;
  border-radius: 5px;
  background: white;
  width: 100%;
  margin-bottom: 0.5em;
}

.search i {
  color: black;
  margin-right: 0.5em;
  font-size: 1.5em;
}

.clear {
  right: 0;
  position: absolute;
  z-index: 1;
  cursor: pointer;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5em;
}

.search-input {
  width: 100%;
  border: none;
  height: 2em;
  line-height: 2em;
  padding: 0 0.25em;
}
</style>