<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from './stores/auth.store'
import { useRouter } from 'vue-router'

import AppHeader from './components/layout/AppHeader.vue'
import AppNav from './components/layout/AppNav.vue'
import AppFooter from './components/layout/AppFooter.vue'

import soundService from './utils/soundService'
import NotificationContainer from '@/components/notifications/Notification.vue'

const auth = useAuthStore()
const router = useRouter()

const isLoggedIn = computed(() => auth.isAuthenticated)

// Optional: redirect on initial load
onMounted(() => {
  if (!auth.isAuthenticated) {
    router.push('/login')
  }

  const unlock = () => {
    soundService.unlock()
    window.removeEventListener('click', unlock)
  }

  window.addEventListener('click', unlock)
})
</script>

<template>
  <AppHeader />
  <AppNav v-if="!auth.isLoggedIn" />
  <main class="app-container">
    <div v-if="!auth.authReady">Loading...</div>
    <RouterView v-else />
  </main>
  <AppFooter />
  <NotificationContainer />
</template>


<style>
.app-container {
  width: 100%;
  /* height: 100%; */
  /* min-height: 100vh;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  padding: 2rem; */
  margin: 0 auto;
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

/* Global notification styles */
.notification-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  z-index: 1000;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.notification-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.notification-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>