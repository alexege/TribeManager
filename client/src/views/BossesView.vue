<script setup></script>
<template>
    <div class="container">
        <div class="links">
            <router-link to="/bosses/all" class="link">All Items</router-link>
            <router-link to="/bosses/broodmother" class="link">Broodmother</router-link>
            <router-link to="/bosses/megapithecus" class="link">Megapithecus</router-link>
            <router-link to="/bosses/dragon" class="link">Dragon</router-link>
        </div>
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">

                <component :is="Component" />

            </transition>
        </router-view>
    </div>
</template>
<style scoped>
.container {
    color: white;
    /* background-color: black; */
    /* background-color: white; */
    height: 100%;
    /* overflow: hidden; */
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
}

.links {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
}

.link {
    padding: 0.5em 1em;
    margin: 1em;
    outline: 1px solid white;
    text-decoration: none;
    color: white;
    text-align: center;
    min-width: 4em;
}

.link:hover {
    background: rgba(135, 207, 235, 0.205);
    outline: 1px solid white;
}

/* Transitions */
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease-out;
}
</style>