// stores/timer.store.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { nanoid } from 'nanoid'

const STORAGE_KEY = 'timer-widgets-state'

// Helper to load from localStorage
function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : null
    } catch (e) {
        console.error('Failed to load timer state:', e)
        return null
    }
}

// Helper to save to localStorage
function saveToStorage(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            numDropZones: state.numDropZones || 48,
            widgets: state.widgets,
            gridCols: state.gridCols,
            showGrid: state.showGrid
        }))
    } catch (e) {
        console.error('Failed to save timer state:', e)
    }
}

const presets = ref([
  { id: 'p5', label: '5 min', seconds: 300 },
  { id: 'p15', label: '15 min', seconds: 900 },
  { id: 'p25', label: 'Pomodoro', seconds: 1500 },
  { id: 'p60', label: '1 hour', seconds: 3600 }
])

// const applyPresetToWidget = (widgetId, seconds) => {
//   const widget = widgets.value.find(w => w.id === widgetId)
//   if (!widget || widget.type !== 'countdown') return

//   widget.timer.remaining = seconds
//   widget.timer.duration = seconds
//   widget.timer.isActive = false
// }

export const useTimerStore = defineStore('timer', {
    state: () => {
        // Try to restore from localStorage
        const saved = loadFromStorage()

        return {
            numDropZones: saved?.numDropZones || 48,
            widgets: saved?.widgets || [],
            gridCols: saved?.gridCols || 3,
            showGrid: saved?.showGrid ?? true,
            isDragging: false,
            draggedWidgetId: null,
            hoveredZoneId: null,
        }
    },

    getters: {
        dropzones(state) {
            const zones = []
            for (let row = 0; row < 24; row++) {
                for (let col = 0; col < state.gridCols; col++) {
                    zones.push({
                        id: `zone-${row}-${col}`,
                        row,
                        col,
                        occupied: state.widgets.some(w => w.zoneId === `zone-${row}-${col}`)
                    })
                }
            }
            return zones
        },

        firstEmptyZone() {
            return this.dropzones.find(zone => !zone.occupied)
        },

        getTimerById: (state) => (widgetId) => {
            const widget = state.widgets.find(w => w.id === widgetId)
            return widget?.timer || null
        },
    },

    actions: {
        addCountdown() {
            const widget = {
                id: nanoid(),
                type: 'countdown',
                name: 'Countdown Timer',
                zoneId: null,
                timer: {
                    id: nanoid(),
                    duration: 300000,
                    isActive: false,
                    endDateTime: null
                }
            }

            if (this.firstEmptyZone) {
                widget.zoneId = this.firstEmptyZone.id
            }

            this.widgets.push(widget)
            saveToStorage(this.$state)
        },

        addStopwatch() {
            const widget = {
                id: nanoid(),
                type: 'stopwatch',
                name: 'Stopwatch Timer',
                zoneId: null,
                timer: {
                    id: nanoid(),
                    isActive: false,
                    timeBegan: null,
                    timeStopped: null,
                    stoppedDuration: 0
                }
            }

            if (this.firstEmptyZone) {
                widget.zoneId = this.firstEmptyZone.id
            }

            this.widgets.push(widget)
            saveToStorage(this.$state)
        },

        removeWidget(id) {
            this.widgets = this.widgets.filter(w => w.id !== id)
            saveToStorage(this.$state)
        },

        updateTimer(widgetId, timerUpdates) {
            const widget = this.widgets.find(w => w.id === widgetId)
            if (widget && widget.timer) {
                Object.assign(widget.timer, timerUpdates)
                saveToStorage(this.$state)
            }
        },

        updateWidgetName(widgetId, newName) {
            const widget = this.widgets.find(w => w.id === widgetId)
            if (widget) {
                widget.name = newName
                saveToStorage(this.$state)
            }
        },


        /* ---------- Presets ---------- */
        applyPresetToWidget(widgetId, seconds){
            const widget = getWidgetById(widgetId)
            if (!widget || widget.type !== 'countdown') return

            widget.timer.duration = seconds
            widget.timer.remaining = seconds
            widget.timer.isActive = false
            widget.timer.startedAt = null
        },

        startDrag(widgetId) {
            this.isDragging = true
            this.draggedWidgetId = widgetId
        },

        setHoveredZone(zoneId) {
            this.hoveredZoneId = zoneId
        },

        endDrag() {
            if (this.hoveredZoneId && this.draggedWidgetId) {
                this.dropWidgetInZone(this.draggedWidgetId, this.hoveredZoneId)
            }

            this.isDragging = false
            this.draggedWidgetId = null
            this.hoveredZoneId = null
        },

        dropWidgetInZone(widgetId, targetZoneId) {
            const draggedWidget = this.widgets.find(w => w.id === widgetId)
            if (!draggedWidget) return

            if (draggedWidget.zoneId === targetZoneId) return

            const targetWidget = this.widgets.find(
                w => w.zoneId === targetZoneId && w.id !== widgetId
            )

            if (targetWidget) {
                const draggedZone = draggedWidget.zoneId
                targetWidget.zoneId = draggedZone
                draggedWidget.zoneId = targetZoneId
            } else {
                draggedWidget.zoneId = targetZoneId
            }

            saveToStorage(this.$state)
        },

        toggleTimerType(widgetId) {
            const widget = this.widgets.find(w => w.id === widgetId)
            if (!widget || widget.timer?.isActive) return

            if (widget.type === 'countdown') {
                widget.type = 'stopwatch'
                widget.timer = {
                    id: nanoid(),
                    isActive: false,
                    timeBegan: null,
                    timeStopped: null,
                    stoppedDuration: 0
                }
            } else {
                widget.type = 'countdown'
                widget.timer = {
                    id: nanoid(),
                    duration: 300000,
                    isActive: false,
                    endDateTime: null
                }
            }

            saveToStorage(this.$state)
        },

        increaseDropZones() {
            if (this.numDropZones < 100) {
                this.numDropZones++
                saveToStorage(this.$state)
            }
        },

        decreaseDropZones() {
            if (this.numDropZones > 1) {
                this.numDropZones--
                saveToStorage(this.$state)
            }
        },
        toggleGrid() {
            this.showGrid = !this.showGrid
            saveToStorage(this.$state)
        }
    }
})