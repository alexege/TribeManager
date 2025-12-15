<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
    localStorage.removeItem('token')
    router.push('/')
}
</script>

<template>
    <div>
        <h1>Dashboard</h1>
        <p>You are logged in 🎉</p>

        <button @click="logout">Logout</button>
    </div>
</template>
