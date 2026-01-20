<script setup>
import { ref, computed } from 'vue'
import { useBossStore } from '@/stores/boss.store'
import { useItemStore } from '@/stores/item.store'
import Counter from '@/components/inputs/Counter.vue'

const props = defineProps({
  bossId: {
    type: String,
    required: true
  }
})

const bossStore = useBossStore()
const itemStore = useItemStore()

const boss = computed(() => bossStore.getBoss(props.bossId))
const activeTier = ref(null)

const tiers = {
  gamma: { name: 'gamma', activeClass: 'gamma_active' },
  beta: { name: 'beta', activeClass: 'beta_active' },
  alpha: { name: 'alpha', activeClass: 'alpha_active' }
}

// Enhance requirements with image paths and completion state
const requirements = computed(() => {
  return boss.value.requirements.map(req => {
    const item = itemStore.findItemByName(req.name)
    return {
      ...req,
      img: item?.img || '',
      amount: item?.quantity || 0,
      completed: false
    }
  })
})

// Enhance unlocks with image paths
const unlocks = computed(() => {
  return boss.value.unlocks.map(unlock => ({
    ...unlock,
    // img: `../src/assets/images/engrams/${unlock.name.trim().replace(/\s+/g, '_')}.png`
    img: `../src/assets/images/engrams/${unlock.fileName}.png`
  }))
})

const selectTier = (tier) => {
  activeTier.value = activeTier.value === tier ? null : tier
}

const handleCounterUpdate = (value, index) => {
  const itemName = requirements.value[index].name
  itemStore.updateItemQuantity(itemName, value)
}

const isCompleted = (item) => {
  if (!activeTier.value) {
    return item.completed || item.amount >= item.alpha
  }
  return item.completed || item.amount >= item[activeTier.value]
}

const isActiveTier = (tier) => {
  if (!activeTier.value) return ''
  return tier === activeTier.value ? `${tier}_active` : 'blur'
}

const isActiveTierUnlock = (tier, value) => {
  if (!activeTier.value) return ''
  if (tier === activeTier.value) {
    return value ? `${tier}_active` : 'blur'
  }
  return 'blur'
}

const showName = (gamma, beta, alpha) => {
  if (!activeTier.value) return ''

  if (activeTier.value === 'gamma' && gamma) return 'gamma_active'
  if (activeTier.value === 'beta' && beta) return 'beta_active'
  if (activeTier.value === 'alpha' && alpha) return 'alpha_active'
  if (!gamma || !beta || !alpha) return 'blur'

  return ''
}

const capitalize = (word) => {
  if (typeof word !== 'string') return ''
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

const clearAll = () => {
  requirements.value.forEach(item => {
    itemStore.updateItemQuantity(item.name, 0)
  })
  activeTier.value = null
}
</script>

<template>
  <div v-if="boss">
    <div class="header">
      <h2>{{ boss.name }}</h2>
      <img :src="boss.img" class="item-img" width="200px" alt="boss image" />
      <div class="difficulty">
        <button
          v-for="tier in Object.keys(tiers)"
          :key="tier"
          :class="[isActiveTier(tier), tier]"
          @click="selectTier(tier)"
        >
          {{ capitalize(tier) }}
        </button>
      </div>
    </div>

    <div class="grid">
      <div class="column-one">
        <div class="tributes">
          <h2>Tributes & Artifacts</h2>
          <div class="tributes-grid">
            <div class="grid-title" style="grid-row: 1/3; grid-column: 2/3">Item</div>
            <div class="grid-title" style="grid-column: 3/6">Quantity</div>
            <div class="grid-title" style="grid-row: 1/3; grid-column: 6/7">
              <div class="vertical">Amount</div>
            </div>
            <div class="grid-title" style="grid-row: 1/3">
              <div class="vertical">
                <span class="title">Completed</span>
              </div>
            </div>

            <template v-for="tier in Object.keys(tiers)" :key="`tier-${tier}`">
              <div class="grid-item tier" :class="[isActiveTier(tier), tier]" @click="selectTier(tier)">
                <div class="vertical">
                  <i class="bx bxs-objects-vertical-bottom"></i>
                  <span class="title">{{ capitalize(tier) }}</span>
                </div>
              </div>
            </template>

            <div class="grid-title spacer"></div>
            <div class="grid-title name" :class="[
              { gamma_active: activeTier === 'gamma' },
              { beta_active: activeTier === 'beta' },
              { alpha_active: activeTier === 'alpha' }
            ]">
              Player Level
            </div>
            <div class="grid-title" :class="isActiveTier('gamma')">{{ boss.playerLevels.gamma }}</div>
            <div class="grid-title" :class="isActiveTier('beta')">{{ boss.playerLevels.beta }}</div>
            <div class="grid-title" :class="isActiveTier('alpha')">{{ boss.playerLevels.alpha }}</div>
            <div class="grid-title"></div>

            <template v-for="(item, index) in requirements" :key="item.name">
              <div class="checkbox">
                <input type="checkbox" v-model="item.completed" />
              </div>
              <div class="grid-item name gamma beta alpha" :class="[
                { completed: isCompleted(item) },
                { gamma_active: activeTier === 'gamma' },
                { beta_active: activeTier === 'beta' },
                { alpha_active: activeTier === 'alpha' }
              ]">
                <div class="unlock">
                  <img :src="item.img" :alt="item.name" />
                  <p>{{ item.name }}</p>
                </div>
              </div>
              <div class="grid-item" :class="[{ completed: isCompleted(item) }, isActiveTier('gamma')]">
                {{ item.gamma === 0 ? '-' : item.gamma }}
              </div>
              <div class="grid-item" :class="[{ completed: isCompleted(item) }, isActiveTier('beta')]">
                {{ item.beta }}
              </div>
              <div class="grid-item" :class="[{ completed: isCompleted(item) }, isActiveTier('alpha')]">
                {{ item.alpha }}
              </div>
              <counter :min="0" :startCount="item.amount" :index="index" @update="handleCounterUpdate" />
            </template>
          </div>
        </div>

        <div class="rewards">
          <h2>Rewards</h2>
          <div class="rewards-grid">
            <template v-for="tier in Object.keys(tiers)" :key="`reward-tier-${tier}`">
              <div class="grid-item tier" :class="[isActiveTier(tier), tier]" @click="selectTier(tier)">
                {{ capitalize(tier) }}
              </div>
            </template>
            <template v-for="tier in Object.keys(tiers)" :key="`reward-amount-${tier}`">
              <div class="grid-item" :class="isActiveTier(tier)">
                {{ boss.rewards[tier] }}
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="column-two">
        <h2>Engram Unlocks</h2>
        <div class="unlocks-grid">
          <div class="grid-title">Item</div>
          <template v-for="tier in Object.keys(tiers)" :key="`unlock-tier-${tier}`">
            <div class="grid-item tier" :class="[isActiveTier(tier), tier]" @click="selectTier(tier)">
              <span class="vertical">
                <i class="bx bxs-objects-vertical-bottom"></i>
                <span class="title">{{ capitalize(tier) }}</span>
              </span>
            </div>
          </template>
          <template v-for="item in unlocks" :key="item.name">
            <div class="grid-item name" :class="showName(item.gamma, item.beta, item.alpha)">
              <div class="unlock">
                <img :src="item.img" :alt="item.name" />
                <p>{{ item.name }}</p>
              </div>
            </div>
            <div class="grid-item" :class="isActiveTierUnlock('gamma', item.gamma)">
              <i v-if="item.gamma" class="bx bx-check"></i>
              <i v-else class="bx bx-x"></i>
            </div>
            <div class="grid-item" :class="isActiveTierUnlock('beta', item.beta)">
              <i v-if="item.beta" class="bx bx-check"></i>
              <i v-else class="bx bx-x"></i>
            </div>
            <div class="grid-item" :class="isActiveTierUnlock('alpha', item.alpha)">
              <i v-if="item.alpha" class="bx bx-check"></i>
              <i v-else class="bx bx-x"></i>
            </div>
          </template>
        </div>
      </div>
    </div>

    <button class="clear-all" @click="clearAll">Clear All</button>
  </div>
</template>

<style scoped>
input[type='checkbox'] {
  height: 1.4em;
}

.checkbox {
  display: flex;
  justify-content: center;
  align-items: center;
}

.completed {
  text-decoration: line-through;
  opacity: 0.25;
  transition: opacity 0.25s ease;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

input[type='number'] {
  -moz-appearance: textfield;
}

.number-input {
    display: flex;
    justify-content: center;
}

.number-controls {
    display: flex;
    flex-direction: column;
}

.number-controls svg {
    fill: black;
}

.difficulty {
  display: flex;
  justify-content: center;
  gap: 0.5em;
}

.difficulty button {
  min-width: 5em;
  cursor: pointer;
  color: white;
  padding: 0.25em 0.5em;
  background: rgba(255, 255, 255, 0.095);
}

.grid {
  display: grid;
  gap: 10px;
  height: 100vh;
}

.grid-title {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 3.125em;
  min-height: 3.125em;
  margin: 2px;
  background-color: rgba(255, 255, 255, 0.05);
}

.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin: 2px;
  background-color: rgba(255, 255, 255, 0.05);
}

.grid-item img {
  width: 1.875em;
  height: 1.875em;
  padding: 5px;
}

.column-one,
.column-two {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  margin: 0 auto;
}

.header img {
    margin: 0 auto;
}

.tributes {
  text-align: center;
  padding-bottom: 2em;
}

.tributes-grid {
  display: grid;
  grid-template-columns: repeat(6, auto);
  text-align: center;
}

.tributes-grid .grid-item {
  cursor: pointer;
}

.rewards {
  text-align: center;
}

.rewards .tier {
  height: auto;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  text-align: center;
  margin-bottom: 2em;
}

.rewards-grid .tier {
  min-width: 80px;
}

.unlocks-grid {
  display: grid;
  grid-template-columns: repeat(4, auto);
}

.tier {
  cursor: pointer;
  background: rgba(255, 255, 255, 0.096);
  height: 120px;
  max-width: 3.125em;
}

.tier:hover {
  background: rgba(135, 207, 235, 0.205);
  outline: 1px solid white;
}

.tier.gamma,
.difficulty .gamma {
  border: 1px solid lime;
}

.tier.beta,
.difficulty .beta {
  border: 1px solid cyan;
}

.tier.alpha,
.difficulty .alpha {
  border: 1px solid red;
}

.vertical {
  height: 100%;
  justify-content: space-between;
  display: flex;
  align-items: center;
  transform: rotate(90deg);
  gap: 0.5em;
}

.vertical .title {
  min-width: 60px;
  text-align: left;
}

.name {
  min-width: 100%;
}

.unlock {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.bx-check {
  font-weight: bold;
  color: lime;
}

.bx-x {
  font-weight: bold;
  color: red;
}

.gamma_active {
  background-color: rgba(0, 255, 0, 0.205) !important;
}

.beta_active {
  background-color: rgba(135, 207, 235, 0.205) !important;
}

.alpha_active {
  background-color: rgba(255, 0, 0, 0.205) !important;
}

.blur {
  filter: blur(2px) grayscale(100%) opacity(0.5);
  transition: all 0.5s ease;
}

.clear-all {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  margin-inline: auto;
  width: fit-content;
  color: white;
  border: 1px solid white;
  background: transparent;
  padding: 0.5em 2em;
}

.clear-all:hover {
  cursor: pointer;
  background: white;
  color: black;
}

@media (max-width: 767px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .grid-item,
  .grid-title,
  .tier {
    min-width: 1em;
    min-height: 1em;
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
    padding: 1em;
  }

  .grid-item,
  .grid-title,
  .tier {
    min-width: 1em;
    min-height: 1em;
  }
}

@media (min-width: 992px) {
  .grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .grid-item,
  .grid-title,
  .tier {
    min-width: 3.125em;
    min-height: 3.125em;
  }
}
</style>