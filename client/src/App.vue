<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from './stores/auth.store'
import { useRouter } from 'vue-router'

import AppHeader from './components/layout/AppHeader.vue'
import AppNav from './components/layout/AppNav.vue'
import AppFooter from './components/layout/AppFooter.vue'

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

  <AppHeader />
  <AppNav v-if="!router.meta?.hideNav && auth.isLoggedIn" />

  <main class="app-content">
    <div v-if="!auth.authReady">Loading...</div>
    <RouterView v-else />
  </main>

  <AppFooter />

</template>

<style>
.app-container {
  min-height: 100vh;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  padding: 2rem;
}

nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.logout-button {
  margin-left: auto;
}

.page {
  padding: 1rem;
  min-height: calc(100vh - 120px);
}
</style>
