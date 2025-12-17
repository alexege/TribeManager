<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from './stores/auth.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const isLoggedIn = computed(() => auth.isAuthenticated)

// Optional: redirect on initial load
onMounted(() => {
  if (!auth.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<template>
  <div>
    <!-- Simple global nav -->
    <nav v-if="isLoggedIn">
      <RouterLink v-if="auth.user?.role == 'admin'" to="/admin">Admin</RouterLink>
      <RouterLink to="/">Home</RouterLink>
      <button @click="auth.logout()" class="logout-button">Logout</button>
    </nav>

    <!-- Route outlet -->
    <div v-if="!auth.authReady">Loading...</div>
    <RouterView v-else />
  </div>
</template>

<style>
nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.logout-button {
  margin-left: auto;
}
</style>
