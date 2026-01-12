// stores/timer.store.js
import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'

const STORAGE_KEY = 'timer-kanban-state'

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
            categories: state.categories,
            widgets: state.widgets
        }))
    } catch (e) {
        console.error('Failed to save timer state:', e)
    }
}

export const useTimerStore = defineStore('timer', {
    state: () => {
        const saved = loadFromStorage()

        const PRESETS = [
            { id: 'p5', label: '5 min', seconds: 300 },
            { id: 'p15', label: '15 min', seconds: 900 },
            { id: 'p25', label: 'Pomodoro', seconds: 1500 },
            { id: 'p60', label: '1 hour', seconds: 3600 }
        ]

        return {
            presets: PRESETS,
            categories: saved?.categories || [],
            widgets: saved?.widgets || [],
            isDragging: false,
            draggedWidgetId: null,
            draggedFromCategoryId: null,
        }
    },

    getters: {
        // Get all widgets for a specific category
        getWidgetsByCategory: (state) => (categoryId) => {
            return state.widgets
                .filter(w => w.categoryId === categoryId)
                .sort((a, b) => a.order - b.order)
        },

        // Get a specific timer by widget ID
        getTimerById: (state) => (widgetId) => {
            const widget = state.widgets.find(w => w.id === widgetId)
            return widget || null
        },

        // Get category by ID
        getCategoryById: (state) => (categoryId) => {
            return state.categories.find(c => c.id === categoryId)
        },

        // Check if any timer is active (for UI feedback)
        hasActiveTimers: (state) => {
            return state.widgets.some(w => w.timer?.isActive)
        }
    },

    actions: {
        /* ========== CATEGORY ACTIONS ========== */

        addCategory(name = 'New Category') {
            const category = {
                id: nanoid(),
                name,
                order: this.categories.length,
                createdAt: Date.now()
            }

            this.categories.push(category)
            saveToStorage(this.$state)
            return category
        },

        updateCategory(categoryId, updates) {
            const category = this.categories.find(c => c.id === categoryId)
            if (category) {
                Object.assign(category, updates)
                saveToStorage(this.$state)
            }
        },

        deleteCategory(categoryId) {
            // Remove category
            this.categories = this.categories.filter(c => c.id !== categoryId)

            // Remove all widgets in this category
            this.widgets = this.widgets.filter(w => w.categoryId !== categoryId)

            saveToStorage(this.$state)
        },

        reorderCategories(newOrder) {
            // newOrder is an array of category IDs in the desired order
            newOrder.forEach((categoryId, index) => {
                const category = this.categories.find(c => c.id === categoryId)
                if (category) {
                    category.order = index
                }
            })

            this.categories.sort((a, b) => a.order - b.order)
            saveToStorage(this.$state)
        },

        /* ========== WIDGET ACTIONS ========== */

        addCountdownToCategory(categoryId) {
            const widget = {
                id: nanoid(),
                type: 'countdown',
                name: 'Countdown Timer',
                categoryId,
                order: this.getWidgetsByCategory(categoryId).length,
                image: '../../src/assets/timers/Stopwatch.png',
                timer: {
                    id: nanoid(),
                    duration: 300000, // 5 minutes default
                    isActive: false,
                    endDateTime: null
                },
                createdAt: Date.now()
            }

            this.widgets.push(widget)
            saveToStorage(this.$state)
            return widget
        },

        addStopwatchToCategory(categoryId) {
            const widget = {
                id: nanoid(),
                type: 'stopwatch',
                name: 'Stopwatch Timer',
                categoryId,
                order: this.getWidgetsByCategory(categoryId).length,
                image: '../../src/assets/timers/Stopwatch.png',
                timer: {
                    id: nanoid(),
                    isActive: false,
                    timeBegan: null,
                    timeStopped: null,
                    stoppedDuration: 0
                },
                createdAt: Date.now()
            }

            this.widgets.push(widget)
            saveToStorage(this.$state)
            return widget
        },

        removeWidget(widgetId) {
            const widget = this.widgets.find(w => w.id === widgetId)
            if (!widget) return

            const categoryId = widget.categoryId

            // Remove the widget
            this.widgets = this.widgets.filter(w => w.id !== widgetId)

            // Reorder remaining widgets in the category
            const remainingWidgets = this.getWidgetsByCategory(categoryId)
            remainingWidgets.forEach((w, index) => {
                w.order = index
            })

            saveToStorage(this.$state)
        },

        updateTimer(widgetId, timerUpdates) {
            console.log("timerUpdate: ", widgetId, timerUpdates);
            const widget = this.widgets.find(w => w.id === widgetId)
            console.log("widget: ", widget);
            if (widget && widget.timer) {
                console.log("widget.timer: ", widget.timer);
                console.log("widget.timer.name: ", widget.timer.name);
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

        /* ========== PRESET ACTIONS ========== */

        applyPresetToWidget(widgetId, seconds) {
            const widget = this.widgets.find(w => w.id === widgetId)
            if (!widget || widget.type !== 'countdown') return

            const ms = seconds * 1000

            widget.timer.duration = ms
            widget.timer.isActive = false
            widget.timer.endDateTime = null

            saveToStorage(this.$state)
        },

        /* ========== DRAG & DROP ACTIONS ========== */

        startDrag(widgetId) {
            const widget = this.widgets.find(w => w.id === widgetId)
            if (!widget) return

            this.isDragging = true
            this.draggedWidgetId = widgetId
            this.draggedFromCategoryId = widget.categoryId
        },

        endDrag() {
            this.isDragging = false
            this.draggedWidgetId = null
            this.draggedFromCategoryId = null
        },

        // Move widget to a new position
        moveWidget(widgetId, targetCategoryId, newOrder) {
            const widget = this.widgets.find(w => w.id === widgetId)
            if (!widget) return

            const oldCategoryId = widget.categoryId
            const oldOrder = widget.order

            // If moving to a different category
            if (oldCategoryId !== targetCategoryId) {
                widget.categoryId = targetCategoryId

                // Reorder widgets in old category
                const oldCategoryWidgets = this.getWidgetsByCategory(oldCategoryId)
                oldCategoryWidgets.forEach((w, index) => {
                    w.order = index
                })

                // Insert into new category at the specified position
                const newCategoryWidgets = this.getWidgetsByCategory(targetCategoryId)

                // Shift widgets down to make room
                newCategoryWidgets.forEach(w => {
                    if (w.order >= newOrder) {
                        w.order++
                    }
                })

                widget.order = newOrder
            } else {
                // Reordering within same category
                const categoryWidgets = this.getWidgetsByCategory(targetCategoryId)

                if (newOrder > oldOrder) {
                    // Moving down
                    categoryWidgets.forEach(w => {
                        if (w.id !== widgetId && w.order > oldOrder && w.order <= newOrder) {
                            w.order--
                        }
                    })
                } else if (newOrder < oldOrder) {
                    // Moving up
                    categoryWidgets.forEach(w => {
                        if (w.id !== widgetId && w.order >= newOrder && w.order < oldOrder) {
                            w.order++
                        }
                    })
                }

                widget.order = newOrder
            }

            saveToStorage(this.$state)
        },

        updateWidgetImage(widgetId, imagePath) {
            const widget = this.widgets.find(w => w.id === widgetId)
            if (widget) {
                widget.image = imagePath
                saveToStorage(this.$state)
            }
        },

        /* ========== SYNC WITH MONGODB ========== */

        async syncToDatabase() {
            try {
                const response = await fetch('/api/timer-state', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        categories: this.categories,
                        widgets: this.widgets
                    })
                })

                if (!response.ok) {
                    throw new Error('Failed to sync to database')
                }

                return await response.json()
            } catch (error) {
                console.error('Database sync error:', error)
                throw error
            }
        },

        async loadFromDatabase() {
            try {
                const response = await fetch('/api/timer-state')

                if (!response.ok) {
                    throw new Error('Failed to load from database')
                }

                const data = await response.json()

                this.categories = data.categories || []
                this.widgets = data.widgets || []

                // Also update localStorage
                saveToStorage(this.$state)

                return data
            } catch (error) {
                console.error('Database load error:', error)
                throw error
            }
        }
    }
})