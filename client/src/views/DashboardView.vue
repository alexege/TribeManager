<script setup>
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
</script>

<template>
    <div class="dashboard">
        <h1>Dashboard</h1>
        <h2>Welcome, {{ auth.user.name || auth.user.username }}</h2>
        <p>Your roles:
            <span v-for="role in auth.user.role" :key="role">
                {{ role }}
            </span>
        </p>
        <p>Logged in ✅</p>
        <button v-if="auth.isAdmin">Admin Button</button>
        <!-- <button @click="auth.logout">Logout</button> -->
    </div>
</template>
<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}
</style>