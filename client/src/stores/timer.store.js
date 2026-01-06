// stores/timer.store.js
import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'

export const useTimerStore = defineStore('timer', {
    state: () => ({
        widgets: [],

        // Grid configuration
        gridCols: 4,
        gridRows: 3,

        // Drag state
        isDragging: false,
        draggedWidgetId: null,
        hoveredZoneId: null,
    }),

    getters: {
        // Generate dropzone grid IDs
        dropzones(state) {
            const zones = []
            for (let row = 0; row < state.gridRows; row++) {
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
        }
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
                    isActive: false
                }
            }

            if (this.firstEmptyZone) {
                widget.zoneId = this.firstEmptyZone.id
            }

            this.widgets.push(widget)
        },

        addStopwatch() {
            const widget = {
                id: nanoid(),
                type: 'stopwatch',
                name: 'Stopwatch Timer',
                zoneId: null,
                timer: {
                    id: nanoid(),
                    elapsed: 0,
                    isActive: false
                }
            }

            if (this.firstEmptyZone) {
                widget.zoneId = this.firstEmptyZone.id
            }

            this.widgets.push(widget)
        },

        removeWidget(id) {
            this.widgets = this.widgets.filter(w => w.id !== id)
        },

        startDrag(widgetId) {
            this.isDragging = true
            this.draggedWidgetId = widgetId
        },

        setHoveredZone(zoneId) {
            this.hoveredZoneId = zoneId
        },

        endDrag() {
            // If hovering over a zone, handle drop
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

            // If dropping in same zone, do nothing
            if (draggedWidget.zoneId === targetZoneId) return

            // Find widget currently in target zone
            const targetWidget = this.widgets.find(
                w => w.zoneId === targetZoneId && w.id !== widgetId
            )

            if (targetWidget) {
                // Swap zones with animation flag
                const draggedZone = draggedWidget.zoneId

                // Mark widgets as swapping for animation
                draggedWidget.isSwapping = true
                targetWidget.isSwapping = true

                targetWidget.zoneId = draggedZone
                draggedWidget.zoneId = targetZoneId

                // Clear swap flag after animation
                setTimeout(() => {
                    draggedWidget.isSwapping = false
                    targetWidget.isSwapping = false
                }, 400)
            } else {
                // Simply move to empty zone
                draggedWidget.zoneId = targetZoneId
            }
        },

        toggleTimerType(widgetId) {
            const widget = this.widgets.find(w => w.id === widgetId)
            if (!widget || widget.timer?.isActive) return

            if (widget.type === 'countdown') {
                widget.type = 'stopwatch'
                widget.timer = {
                    id: nanoid(),
                    elapsed: 0,
                    isActive: false
                }
            } else {
                widget.type = 'countdown'
                widget.timer = {
                    id: nanoid(),
                    duration: 300000,
                    isActive: false
                }
            }
        },

        increaseRows() {
            if (this.gridRows < 6) this.gridRows++
        },

        decreaseRows() {
            if (this.gridRows > 1) {
                // Check if reducing rows would orphan widgets
                const maxRow = this.gridRows - 1
                const hasWidgetsInLastRow = this.widgets.some(w => {
                    const match = w.zoneId?.match(/zone-(\d+)-(\d+)/)
                    return match && parseInt(match[1]) === maxRow
                })

                if (!hasWidgetsInLastRow) {
                    this.gridRows--
                }
            }
        },

        increaseCols() {
            if (this.gridCols < 8) this.gridCols++
        },

        decreaseCols() {
            if (this.gridCols > 1) {
                // Check if reducing cols would orphan widgets
                const maxCol = this.gridCols - 1
                const hasWidgetsInLastCol = this.widgets.some(w => {
                    const match = w.zoneId?.match(/zone-(\d+)-(\d+)/)
                    return match && parseInt(match[2]) === maxCol
                })

                if (!hasWidgetsInLastCol) {
                    this.gridCols--
                }
            }
        }
    }
})