<script setup>
import {
    ref,
    reactive,
    computed,
    onMounted,
    onBeforeUnmount,
    nextTick,
    watch
} from "vue";
import { storeToRefs } from "pinia";

import { useTribeStore } from "../stores/tribe.store";
import { usePlayerStore } from "../stores/player.store";

const tribeStore = useTribeStore();
const playerStore = usePlayerStore();

const { tribes } = storeToRefs(tribeStore);
const { players } = storeToRefs(playerStore);

const {
    addPlayer,
    updatePlayer,
    fetchPlayers,
    removePlayersByTribe,
    deletePlayerFromStore
} = playerStore;

const {
    addTribe,
    deleteTribe,
    updateTribe,
    fetchTribes
} = tribeStore;

const tribePlayerCount = playerStore.playerCountByTribe;

/* =========================
   FETCH
========================= */
onMounted(async () => {
    await Promise.all([fetchTribes(), fetchPlayers()]);
    document.addEventListener("click", closeAllMenus);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", closeAllMenus);
});

/* =========================
   STATE
========================= */
const globalSearch = ref("");
const globalPlayersOpen = ref(true);
const allTribesOpen = ref(false);
const newTribeName = ref("");

const openTribes = reactive({});
const menuOpen = reactive({});
const tribeSort = reactive({});
const newPlayer = reactive({});
const editingPlayer = reactive({ global: {}, tribe: {} });
const editingTribe = reactive({});
const tribeInputRefs = reactive({});
const newPlayerInputRefs = reactive({});

/* =========================
   HELPERS
========================= */
const todayDate = () => new Date().toISOString().split("T")[0];

const searchableText = u =>
    Object.values(u).filter(Boolean).join(" ").toLowerCase();

const ensureTribeState = id => {
    openTribes[id] ??= false;
    menuOpen[id] ??= false;
    tribeSort[id] ??= { key: "", dir: "asc" };
    newPlayer[id] ??= {
        inGameName: "",
        steamName: "",
        discordName: "",
        tribeId: id,
        dateSeen: todayDate(),
        notes: "",
        level: 1
    };
};


// Add this watcher after your state declarations
watch(globalSearch, (newVal) => {
    if (newVal.trim()) {
        // Close all tribes first
        tribes.value.forEach(t => {
            ensureTribeState(t._id);
            openTribes[t._id] = false;
        });

        // Open only tribes that have matching players
        const matchingPlayers = players.value.filter(
            u => searchableText(u).includes(newVal.toLowerCase())
        );

        const tribesToOpen = new Set(
            matchingPlayers.map(p => p.tribeId).filter(Boolean)
        );

        tribesToOpen.forEach(tribeId => {
            ensureTribeState(tribeId);
            openTribes[tribeId] = true;
        });
    } else {
        // When search is cleared, close all tribes
        tribes.value.forEach(t => {
            ensureTribeState(t._id);
            openTribes[t._id] = false;
        });
    }
});

/* =========================
   TRIBES
========================= */
const toggleTribe = id => {
    ensureTribeState(id);
    openTribes[id] = !openTribes[id];
};

const toggleAllTribes = () => {
    allTribesOpen.value = !allTribesOpen.value;
    tribes.value.forEach(t => (openTribes[t._id] = allTribesOpen.value));
};

const toggleGlobalPlayers = () => {
    globalPlayersOpen.value = !globalPlayersOpen.value;
};

const handleHeaderClick = id => toggleTribe(id);

const startEditTribe = id => {
    editingTribe[id] = true;
    nextTick(() => tribeInputRefs[id]?.focus());
};

const cancelEditTribe = id => delete editingTribe[id];

const saveTribeName = async id => {
    const tribe = tribes.value.find(t => t._id === id);
    if (!tribe) return;
    await updateTribe(id, { name: tribe.name });
    delete editingTribe[id];
};

const handleAddTribe = async () => {
    if (!newTribeName.value.trim()) return;
    await addTribe(newTribeName.value.trim());
    newTribeName.value = "";
};

const handleDeleteTribe = async (tribeId) => {
    if (confirm('Are you sure you want to delete this tribe and all its players?')) {
        await removePlayersByTribe(tribeId);
        await deleteTribe(tribeId);
        // Clean up state
        delete openTribes[tribeId];
        delete menuOpen[tribeId];
        delete tribeSort[tribeId];
        delete newPlayer[tribeId];
    }
};

/* =========================
   Players
========================= */
const handleAddPlayer = async tribeId => {
    ensureTribeState(tribeId);

    if (!newPlayer[tribeId].inGameName.trim() || !newPlayer[tribeId].tribeId || !newPlayer[tribeId].dateSeen) return;

    await addPlayer(tribeId, newPlayer[tribeId]);
    newPlayer[tribeId] = {
        inGameName: "",
        steamName: "",
        discordName: "",
        tribeId,
        dateSeen: todayDate(),
        notes: "",
        level: 1
    };
    await nextTick();
    newPlayerInputRefs[tribeId]?.focus();
};

const startEdit = (player, scope) => {
    editingPlayer[scope][player._id] = { ...player };
};

const cancelEdit = (id, scope) => {
    delete editingPlayer[scope][id];
};

const savePlayer = async (id, scope) => {
    await updatePlayer(id, editingPlayer[scope][id]);
    delete editingPlayer[scope][id];
};

const deletePlayer = async (playerId, scope) => {
    if (confirm('Are you sure you want to delete this player?')) {
        await deletePlayerFromStore(playerId);
        // Clean up any editing state
        if (editingPlayer[scope][playerId]) {
            delete editingPlayer[scope][playerId];
        }
    }
};

/* =========================
   SORTING
========================= */
const sortBy = (tribeId, key) => {
    const s = tribeSort[tribeId];
    s.dir = s.key === key && s.dir === "asc" ? "desc" : "asc";
    s.key = key;
};

const sortIndicator = (tribeId, key) => {
    ensureTribeState(tribeId);
    const s = tribeSort[tribeId];
    return s.key === key ? (s.dir === "asc" ? "▲" : "▼") : "";
};

const globalSortKey = ref("");
const globalSortDirection = ref("asc");

const globalSortBy = key => {
    globalSortDirection.value =
        globalSortKey.value === key && globalSortDirection.value === "asc"
            ? "desc"
            : "asc";
    globalSortKey.value = key;
};

const globalSortIndicator = key =>
    globalSortKey.value === key
        ? globalSortDirection.value === "asc"
            ? "▲"
            : "▼"
        : "";

/* =========================
   COMPUTEDS
========================= */
const globallySortedPlayers = computed(() => {
    let list = players.value.filter(
        u => !globalSearch.value || searchableText(u).includes(globalSearch.value.toLowerCase())
    );
    if (!globalSortKey.value) return list;
    return [...list].sort((a, b) =>
        (a[globalSortKey.value] > b[globalSortKey.value] ? 1 : -1) *
        (globalSortDirection.value === "asc" ? 1 : -1)
    );
});

const filteredAndSortedPlayersByTribe = tribeId => {
    ensureTribeState(tribeId);
    let list = players.value.filter(u => u.tribeId === tribeId);
    const { key, dir } = tribeSort[tribeId];
    if (!key) return list;
    return [...list].sort(
        (a, b) => (a[key] > b[key] ? 1 : -1) * (dir === "asc" ? 1 : -1)
    );
};

/* =========================
   UI
========================= */
const closeAllMenus = () =>
    Object.keys(menuOpen).forEach(k => (menuOpen[k] = false));
</script>
<template>
    <div class="tribes-container">
        <h2 class="page-title">Group Manager</h2>
        <!-- Global Player Search -->
        <div class="global-search">
            <input v-model="globalSearch" placeholder="Search all players..." />
            <button v-if="globalSearch" @click="globalSearch = ''" class="clear-global" title="Clear global search">
                X
            </button>
        </div>
        <!-- Add New Tribe -->
        <div class="add-tribe">
            <input v-model="newTribeName" placeholder="New tribe name..." @keydown.enter="handleAddTribe" />
            <button @click="handleAddTribe">Add Tribe</button>
        </div>
        <!-- GLOBAL USERS SECTION -->
        <div class="global-players-header" @click="toggleGlobalPlayers" v-if="globallySortedPlayers.length > 0">
            <strong>All Players</strong>
            <span class="arrow">{{ globalPlayersOpen ? "▲" : "▼" }}</span>
        </div>
        <transition name="collapse">
            <div v-if="globalPlayersOpen">
                <!-- All Players Table Grid -->
                <div class="all-players-table-grid" v-if="globallySortedPlayers.length > 0">
                    <div class="header" @click="globalSortBy('inGameName')">
                        In-Game Name {{ globalSortIndicator('inGameName') }}
                    </div>
                    <div class="header" @click="globalSortBy('steamName')">
                        Steam Name {{ globalSortIndicator('steamName') }}
                    </div>
                    <div class="header" @click="globalSortBy('discordName')">
                        Discord Name {{ globalSortIndicator('discordName') }}
                    </div>
                    <div class="header" @click="globalSortBy('tribeId')">
                        Tribe {{ globalSortIndicator('tribeId') }}
                    </div>
                    <div class="header" @click="globalSortBy('dateSeen')">
                        Date Seen {{ globalSortIndicator('dateSeen') }}
                    </div>
                    <div class="header" @click="globalSortBy('notes')">
                        Notes {{ globalSortIndicator('notes') }}
                    </div>
                    <div class="header" @click="globalSortBy('level')">
                        Level {{ globalSortIndicator('level') }}
                    </div>
                    <div class="header">Actions</div>

                    <template v-for="player in globallySortedPlayers" :key="player._id || player.steamName">
                        <div class="cell" data-label="In-Game Name">
                            <template v-if="editingPlayer.global[player._id]">
                                <input v-model="editingPlayer.global[player._id].inGameName" />
                            </template>
                            <template v-else>
                                {{ player.inGameName || '-' }}
                            </template>
                        </div>
                        <div class="cell" data-label="Steam Name">
                            <template v-if="editingPlayer.global[player._id]">
                                <input v-model="editingPlayer.global[player._id].steamName" />
                            </template>
                            <template v-else>
                                {{ player.steamName || '-' }}
                            </template>
                        </div>
                        <div class="cell" data-label="Discord Name">
                            <template v-if="editingPlayer.global[player._id]">
                                <input v-model="editingPlayer.global[player._id].discordName" />
                            </template>
                            <template v-else>
                                {{ player.discordName || '-' }}
                            </template>
                        </div>
                        <div class="cell" data-label="Tribe Name">
                            <template v-if="editingPlayer.global[player._id]">
                                <select v-model="editingPlayer.global[player._id].tribeId">
                                    <option :value="null">No Tribe</option>
                                    <option v-for="t in tribes" :key="t._id" :value="t._id">
                                        {{ t.name }}
                                    </option>
                                </select>
                            </template>
                            <template v-else>
                                {{tribes.find(t => t._id === player.tribeId)?.name || '-'}}
                            </template>
                        </div>
                        <div class="cell" data-label="Date Seen">
                            <template v-if="editingPlayer.global[player._id]">
                                <input type="date" v-model="editingPlayer.global[player._id].dateSeen" />
                            </template>
                            <template v-else>
                                {{ player.dateSeen }}
                            </template>
                        </div>
                        <div class="cell" data-label="Notes">
                            <template v-if="editingPlayer.global[player._id]">
                                <input v-model="editingPlayer.global[player._id].notes" />
                            </template>
                            <template v-else>
                                {{ player.notes }}
                            </template>
                        </div>
                        <div class="cell" data-label="Player Level">
                            <template v-if="editingPlayer.global[player._id]">
                                <input type="number" v-model.number="editingPlayer.global[player._id].level" min="1" />
                            </template>
                            <template v-else>
                                {{ player.level }}
                            </template>
                        </div>
                        <div class="cell actions">
                            <template v-if="editingPlayer.global[player._id]">
                                <button @click="savePlayer(player._id, 'global')">💾</button>
                                <button @click="cancelEdit(player._id, 'global')">✖</button>
                            </template>
                            <template v-else>
                                <button @click="startEdit(player, 'global')">✎</button>
                                <button @click="deletePlayer(player._id, 'global')">🗑️</button>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </transition>
        <!-- Loop Through Tribes -->
        <div v-for="(tribe, i) in tribes" :key="tribe._id" class="tribe-collapsible"
            :class="{ 'menu-active': menuOpen[tribe._id] }">
            <!-- Collapsible Header with Menu -->
            <div class="header" :class="{ 'header-open': openTribes[tribe._id] }">
                <!-- :style="{ backgroundColor: `hsl(${(i * 37) % 360}, 70%, 60%)` }" -->
                <!-- <div class="header"> -->
                <div class="header-title" @click="handleHeaderClick(tribe._id)">
                    <template v-if="editingTribe[tribe._id]">
                        <input :ref="el => tribeInputRefs[tribe._id] = el" v-model="tribe.name" @click.stop.prevent
                            @keyup.enter="saveTribeName(tribe._id)" @keyup.esc="cancelEditTribe(tribe._id)"
                            @blur="saveTribeName(tribe._id)" class="edit-tribe-input" />
                        <button class="cancel-edit" @click.prevent="cancelEditTribe(tribe._id)">✖</button>
                    </template>
                    <template v-else @click="toggleTribe(tribe._id)">
                        {{ tribe.name }} ({{ tribePlayerCount(tribe._id) }})
                    </template>
                </div>

                <div class="header-actions">
                    <!-- Collapse Arrow -->
                    <span class="arrow" @click.stop="toggleTribe(tribe._id)">
                        {{ openTribes[tribe._id] ? "▲" : "▼" }}
                    </span>
                    <!-- Dropdown Menu -->
                    <div class="menu-wrapper" @click.stop="menuOpen[tribe._id] = !menuOpen[tribe._id]">
                        ⋮
                    </div>
                    <div v-if="menuOpen[tribe._id]" class="dropdown-menu" @click.stop>
                        <button @click="startEditTribe(tribe._id); menuOpen[tribe._id] = false">Edit Tribe</button>
                        <button @click="handleDeleteTribe(tribe._id)">Delete Tribe</button>
                    </div>
                </div>
            </div>
            <transition name="collapse">
                <div v-if="openTribes[tribe._id]" class="content"
                    :style="{ backgroundColor: `hsla(${(i * 37) % 360}, 70%, 94%, 0.25)` }">
                    <!-- Search Players -->
                    <!-- <div class="search-bar">
            <input v-model="tribeSearch[tribe._id]" placeholder="Search players..." />
            <button
              v-if="tribeSearch[tribe._id]"
              class="clear-search"
              @click="tribeSearch[tribe._id] = ''"
              title="Clear"
            >
              X
            </button>
          </div> -->
                    <!-- Player Table Grid -->
                    <div class="player-table-grid">
                        <div class="header" @click="sortBy(tribe._id, 'inGameName')">
                            In-Game Name {{ sortIndicator(tribe._id, 'inGameName') }}
                        </div>
                        <div class="header" @click="sortBy(tribe._id, 'steamName')">
                            Steam Name {{ sortIndicator(tribe._id, 'steamName') }}
                        </div>
                        <div class="header" @click="sortBy(tribe._id, 'discordName')">
                            Discord Name {{ sortIndicator(tribe._id, 'discordName') }}
                        </div>
                        <div class="header" @click="sortBy(tribe._id, 'tribeId')">
                            Tribe {{ sortIndicator(tribe._id, 'tribeId') }}
                        </div>
                        <div class="header" @click="sortBy(tribe._id, 'dateSeen')">
                            Date Seen {{ sortIndicator(tribe._id, 'dateSeen') }}
                        </div>
                        <div class="header" @click="sortBy(tribe._id, 'notes')">
                            Notes {{ sortIndicator(tribe._id, 'notes') }}
                        </div>
                        <div class="header" @click="sortBy(tribe._id, 'level')">
                            Level {{ sortIndicator(tribe._id, 'level') }}
                        </div>
                        <div class="header">Actions</div>
                        <template v-for="player in filteredAndSortedPlayersByTribe(tribe._id)" :key="player._id">
                            <div class="cell" data-label="In-Game Name">
                                <template v-if="editingPlayer.tribe[player._id]">
                                    <input v-model="editingPlayer.tribe[player._id].inGameName" />
                                </template>
                                <template v-else>
                                    {{ player.inGameName || '-' }}
                                </template>
                            </div>
                            <div class="cell" data-label="Steam Name">
                                <template v-if="editingPlayer.tribe[player._id]">
                                    <input v-model="editingPlayer.tribe[player._id].steamName" />
                                </template>
                                <template v-else>
                                    {{ player.steamName || '-' }}
                                </template>
                            </div>
                            <div class="cell" data-label="Discord Name">
                                <template v-if="editingPlayer.tribe[player._id]">
                                    <input v-model="editingPlayer.tribe[player._id].discordName" />
                                </template>
                                <template v-else>
                                    {{ player.discordName || '-' }}
                                </template>
                            </div>
                            <div class="cell" data-label="Tribe Name">
                                <template v-if="editingPlayer.tribe[player._id]">
                                    <select v-model="editingPlayer.tribe[player._id].tribeId">
                                        <option :value="null">No Tribe</option>
                                        <option v-for="t in tribes" :key="t._id" :value="t._id">
                                            {{ t.name }}
                                        </option>
                                    </select>
                                </template>
                                <template v-else>
                                    {{tribes.find(t => t._id === player.tribeId)?.name || '-'}}
                                </template>
                            </div>
                            <div class="cell" data-label="Date Seen">
                                <template v-if="editingPlayer.tribe[player._id]">
                                    <input type="date" v-model="editingPlayer.tribe[player._id].dateSeen" />
                                </template>
                                <template v-else>
                                    {{ player.dateSeen }}
                                </template>
                            </div>
                            <div class="cell" data-label="Notes">
                                <template v-if="editingPlayer.tribe[player._id]">
                                    <input v-model="editingPlayer.tribe[player._id].notes" />
                                </template>
                                <template v-else>
                                    {{ player.notes }}
                                </template>
                            </div>
                            <div class="cell" data-label="">
                                <template v-if="editingPlayer.tribe[player._id]">
                                    <input type="number" v-model.number="editingPlayer.tribe[player._id].level"
                                        min="1" />
                                </template>
                                <template v-else>
                                    {{ player.level }}
                                </template>
                            </div>
                            <div class="cell actions">
                                <template v-if="editingPlayer.tribe[player._id]">
                                    <button @click="savePlayer(player._id, 'tribe')">💾</button>
                                    <button @click="cancelEdit(player._id, 'tribe')">✖</button>
                                </template>
                                <template v-else>
                                    <button @click="startEdit(player, 'tribe')">✎</button>
                                    <button @click="deletePlayer(player._id, 'tribe')">🗑️</button>
                                </template>
                            </div>
                        </template>
                    </div>
                    <!-- Add Player Form -->
                    <form class="add-player-form" @submit.prevent="handleAddPlayer(tribe._id)">
                        <input v-model="newPlayer[tribe._id].inGameName" placeholder="In-Game Name"
                            :ref="el => newPlayerInputRefs[tribe._id] = el" />
                        <input v-model="newPlayer[tribe._id].steamName" placeholder="Steam Name" />
                        <input v-model="newPlayer[tribe._id].discordName" placeholder="Discord Name" />
                        <select v-model="newPlayer[tribe._id].tribeId">
                            <option :value="null" disabled>Select Tribe</option>
                            <option v-for="t in tribes" :key="t._id" :value="t._id">
                                {{ t.name }}
                            </option>
                        </select>
                        <input type="date" v-model="newPlayer[tribe._id].dateSeen" />
                        <input v-model="newPlayer[tribe._id].notes" placeholder="Notes" />
                        <input type="number" v-model.number="newPlayer[tribe._id].level" placeholder="Level" min="1" />
                        <button type="submit" class="add-player-btn">Add Player</button>
                    </form>
                </div>
            </transition>
        </div>

        <div class="global-controls" v-if="tribes.length > 0">
            <button @click="toggleAllTribes">
                {{ allTribesOpen ? "Collapse All" : "Expand All" }}
            </button>
        </div>

    </div>
</template>

<style scoped>
.page-title {
    text-align: center;
}

.global-players-header {
    display: flex;
    justify-content: space-between;
    background: var(--orange);
    padding: 10px;
    cursor: pointer;
    margin-bottom: .5em;
    font-weight: bold;
}

input {
    width: 100%;
}

.dropdown-menu {
    position: absolute;
    top: 28px;
    right: 40px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    z-index: 20;
    min-width: 140px;
}

.dropdown-menu button {
    width: 100%;
    text-align: left;
    padding: 8px 12px;
    background: none;
    border: none;
    cursor: pointer;
}

.dropdown-menu button:hover {
    background: #f5f5f5;
    color: #d9534f;
}

.tribes-container {
    min-width: 80vw;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
}

.global-search,
.add-tribe {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.global-search input,
.add-tribe input {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.global-search .clear-global {
    background: #e74c3c;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0 8px;
    cursor: pointer;
}

.add-tribe button {
    background: var(--orange);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
}

.add-tribe button:hover {
    background: var(--orange-soft);
}

.tribe-collapsible {
    margin-bottom: .5em;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    overflow: visible;
    z-index: 1;
}

.tribe-collapsible.menu-active {
    z-index: 100;
}

.tribe-collapsible>.header {
    background: var(--orange);
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}

.tribe-collapsible>.content {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* padding: 10px 12px; */
    /* padding: 6px 8px; */
    padding: 2px 4px;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    /* background: rgba(0, 0, 0, 0.05); */
    background: rgba(0, 0, 0, 0.918);
}

.header.header-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.header:hover {
    filter: brightness(0.95);
}

.header-title {
    display: flex;
    flex-direction: row;
    flex: 1;
    margin-right: .5em;
}

.edit-tribe-input {
    width: 100%;
    box-sizing: border-box;
    /* padding: 4px 6px; */
    margin-right: .25em;
    font-size: inherit;
}

.cancel-edit {
    margin-left: 4px;
    padding: 0 6px;
    background: #e74c3c;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
}

.cancel-edit:hover {
    background: #c0392b;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
}

.arrow {
    font-size: 14px;
    cursor: pointer;
}

.menu-wrapper {
    font-size: 18px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: background 0.2s;
}

.menu-wrapper:hover {
    background: rgba(0, 0, 0, 0.1);
}

.dropdown-menu {
    position: absolute;
    right: 0;
    top: 28px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.dropdown-menu button {
    display: block;
    width: 100%;
    padding: 6px 12px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
}

.dropdown-menu button:hover {
    background: #f5f5f5;
}

.content {
    padding: 12px;
    background-color: var(--glass-dark);
}

.search-bar {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
}

.search-bar input {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.clear-search {
    background: #e74c3c;
    color: #fff;
    border: none;
    padding: 0 8px;
    border-radius: 4px;
    cursor: pointer;
}

.player-table-grid,
.all-players-table-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 2fr 80px 80px;
    /* gap: 4px; */
    margin-bottom: 12px;
}

.cell {
    padding: 6px 8px;
    border-bottom: 1px solid #eee;
    word-break: break-word;
    background-color: var(--void-black);
}

.cell.actions {
    display: flex;
    justify-content: center;
    gap: 4px;
}

.cell.actions button {
    background: #e74c3c;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
}

.cell.actions button:hover {
    background: #c0392b;
}

.add-player-form {
    margin-top: 1em;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 2fr 80px 80px;
    align-items: center;
    gap: 6px;
}

.add-player-form input {
    border: 1px solid #ccc;
    box-sizing: border-box;
    width: 100%;
    flex: 1 1 150px;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.add-player-form button {
    background: var(--orange);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
}

.add-player-form button:hover {
    background: var(--orange-soft);
}

.collapse-enter-active,
.collapse-leave-active {
    transition: all 0.3s ease;
}

.collapse-enter-from,
.collapse-leave-to {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
}

.collapse-enter-to,
.collapse-leave-from {
    max-height: 1000px;
    opacity: 1;
}

.global-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
    justify-content: center;
}

.global-controls button {
    padding: 6px 12px;
    border: none;
    background: var(--orange);
    color: white;
    border-radius: 4px;
    cursor: pointer;
}

.global-controls button:hover {
    background: var(--orange-soft);
}

select {
    width: 100%;
    padding: 4px 6px;
    border-radius: 4px;
    border: 1px solid #ccc;
}

@media (max-width: 768px) {

    .player-table-grid,
    .all-players-table-grid {
        display: block;
    }

    .player-table-grid .cell,
    .all-players-table-grid .cell {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        border-bottom: 1px solid #eee;
    }

    .player-table-grid .cell::before,
    .all-players-table-grid .cell::before {
        content: attr(data-label);
        font-weight: bold;
        margin-right: 12px;
        flex-shrink: 0;
    }

    button {
        min-width: 44px;
        min-height: 44px;
    }

    .cell.actions button {
        padding: 6px 10px;
    }

    .header {
        padding: 14px 16px;
        font-size: 1.05em;
    }

    .player-table-grid .cell:nth-child(3),
    .player-table-grid .cell:nth-child(4),
    .player-table-grid .cell:nth-child(5) {
        display: none;
    }

    .dropdown-menu {
        min-width: 200px;
        font-size: 1.1em;
    }

    .dropdown-menu button {
        padding: 12px 16px;
    }

    .content {
        padding: 16px;
    }

    .tribe-collapsible {
        margin-bottom: 16px;
    }

    .add-player-form {
        position: sticky;
        bottom: 0;
        background: white;
        padding: 12px;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    }
}
</style>
