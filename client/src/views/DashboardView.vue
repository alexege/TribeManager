<script setup>
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()
</script>

<template>
    <div>
        <h1>Dashboard</h1>
        <p>Logged in ✅</p>
        <button v-if="auth.isAdmin">Admin Button</button>
        <button @click="auth.logout">Logout</button>
    </div>
</template>
