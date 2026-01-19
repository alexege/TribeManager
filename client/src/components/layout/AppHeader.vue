<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

const isLoading = computed(() => auth.isLoading)
const isAuthed = computed(() => auth.isAuthenticated)
const activeUser = computed(() => auth.activeUser)

const initials = computed(() => {
    if (!activeUser.value?.username) return '?'
    return activeUser.value.username
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
})
</script>

<template>
    <header class="app-header">
        <!-- LEFT: Branding -->
        <div class="brand">
            <span class="logo">🧭</span>
            <h1>Tribe Manager</h1>
        </div>

        <!-- RIGHT: Auth-aware user area -->
        <div class="right">
            <!-- Loading (no flicker) -->
            <template v-if="isLoading">
                <div class="skeleton avatar"></div>
                <div class="skeleton name"></div>
            </template>

            <!-- Logged out -->
            <template v-else-if="!isAuthed">
                <RouterLink to="/login" class="link">Login</RouterLink>
                <RouterLink to="/register" class="primary">Register</RouterLink>
            </template>

            <!-- Logged in -->
            <template v-else>
                <RouterLink to="/dashboard" class="link ">
                    <div class="user-chip">
                        <img v-if="activeUser?.avatarUrl" :src="activeUser.avatarUrl" alt="avatar" class="avatar" loading="lazy" />
                        <div v-else class="avatar fallback">
                            {{ initials }}
                        </div>

                        <span class="username">
                            {{ activeUser?.name || activeUser?.username }}
                        </span>
                    </div>
                </RouterLink>

                    <button class="logout" @click="auth.logout()" :disabled="isLoading">
                        Logout
                    </button>
            </template>
        </div>
    </header>
</template>

<style scoped>
.app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.logo {
    font-size: 1.4rem;
}

h1 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
}

.right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* ---------------- USER CHIP ---------------- */

.user-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    /* padding: 0.3rem 0.6rem; */
    padding: 0.15rem 0.3rem;
    border-radius: 999px;
    background: hsl(210, 70%, 50%);
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.avatar.fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 600;
    background: hsl(210, 70%, 80%);
}

.username {
    font-size: 0.85rem;
    font-weight: 500;
}

/* ---------------- LINKS ---------------- */

.link {
    font-size: 0.85rem;
    text-decoration: none;
    color: #333;
}

.primary {
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    font-size: 0.85rem;
    background: hsl(210, 70%, 85%);
    text-decoration: none;
    color: #333;
}

/* ---------------- SKELETON ---------------- */

.skeleton {
    background: linear-gradient(90deg,
            hsl(210, 30%, 90%),
            hsl(210, 30%, 95%),
            hsl(210, 30%, 90%));
    animation: pulse 1.2s infinite;
}

.skeleton.avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
}

.skeleton.name {
    width: 80px;
    height: 12px;
    border-radius: 6px;
}

/* ---------------- LOGOUT BUTTON ---------------- */

.logout {
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    font-size: 0.8rem;
    cursor: pointer;
    background: transparent;
    border: 1px solid hsl(210, 30%, 80%);
    color: white;
    background: var(--orange);
    transition: background 0.15s ease, opacity 0.15s ease;
}

.logout:hover {
    background: hsl(210, 30%, 90%);
}

.logout:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


@keyframes pulse {
    0% {
        background-position: 0%
    }

    100% {
        background-position: 100%
    }
}
</style>
