let audio = null
let unlocked = false

export default {
  init() {
    if (!audio) {
      audio = new Audio('/src/assets/sounds/time_up.mp3')
      audio.volume = 0.7
    }
  },

  unlock() {
    // Required for Chrome / Safari autoplay policies
    if (unlocked) return

    this.init()
    audio.play()
      .then(() => {
        audio.pause()
        audio.currentTime = 0
        unlocked = true
      })
      .catch(() => {
        // Will unlock on next user interaction
      })
  },

  play() {
    if (!unlocked) return

    this.init()
    audio.currentTime = 0
    audio.play()
  }
}
