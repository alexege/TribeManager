import { reactive } from 'vue'

let id = 0

const state = reactive({
  notifications: []
})

export default {
  state,

  addNotification(message, type = 'info', duration = 3000, persistent = false) {
    const notification = {
      id: ++id,
      message,
      type,
      persistent
    }

    state.notifications.push(notification)

    if (!persistent) {
      setTimeout(() => {
        this.removeNotification(notification.id)
      }, duration)
    }
  },

  removeNotification(id) {
    const index = state.notifications.findIndex(n => n.id === id)
    console.log(`Removing notification ${id}`)
    if (index !== -1) {
        state.notifications.splice(index, 1)
    }
  }
}
