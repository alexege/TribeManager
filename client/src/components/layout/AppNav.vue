<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

const isAuthed = computed(() => auth.isAuthenticated)
</script>

<template>
    <nav class="app-nav">
        <!-- Logged OUT -->
        <template v-if="!isAuthed">
            <RouterLink to="/login" class="nav-item">Login</RouterLink>
            <RouterLink to="/register" class="nav-item">Register</RouterLink>
        </template>

        <!-- Logged IN -->
        <template v-else>
            <RouterLink to="/dashboard" class="nav-item">Home</RouterLink>
            <RouterLink to="/todo" class="nav-item">Todo</RouterLink>
            <RouterLink to="/tracker" class="nav-item">Player Track</RouterLink>
            <RouterLink to="/maps" class="nav-item">Maps</RouterLink>
            <RouterLink to="/timers" class="nav-item">Timers</RouterLink>
            <RouterLink to="/bosses" class="nav-item">Bosses</RouterLink>
            <RouterLink to="/settings" class="nav-item">Settings</RouterLink>

            <span class="spacer" />

            <!-- <button class="nav-item ghost" @click="auth.logout">
                Logout
            </button> -->
        </template>
    </nav>
</template>

<style scoped>
.app-nav {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    margin-bottom: 0;
    background: rgba(255, 255, 255, 0.1);
}

.nav-item {
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
    font-size: 0.85rem;
    text-decoration: none;
    color: white;
    cursor: pointer;
    transition: background 0.15s ease;
}

.nav-item:hover {
    background: hsl(150, 60%, 90%);
}

.router-link-active {
    font-weight: 500;
    color: #ff4500;
}

.ghost {
    background: transparent;
    border: 1px solid hsl(150, 30%, 80%);
}

.spacer {
    flex: 1;
}
</style>
