<script setup>
import notificationService from '@/utils/notificationService'

const notifications = notificationService.state.notifications
</script>

<template>

  <TransitionGroup name="notification" tag="div" class="notification-container">
    <div
      v-for="n in notifications"
      :key="n.id"
      class="notification"
      :class="n.type"
      @click="notificationService.removeNotification(n.id)"
    >
      {{ n.message }}
    </div>
  </TransitionGroup>
</template>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column-reverse;
  gap: .5rem;
  z-index: 9999;
}

.notification {
  padding: .75rem 1rem;
  border-radius: 5px;
  background: #222;
  color: white;
  cursor: pointer;
  box-shadow: 0 0 10px black;
}

.notification.success { background: #2e7d32 }
.notification.error { background: #c62828 }
.notification.info { background: #1565c0 }
</style>
