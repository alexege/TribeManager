<script setup>
</script>

<template>
    <header class="app-header">
        <div class="brand">
            <span class="logo">🧭</span>
            <h1>Tribe Manager</h1>
        </div>

        <div class="header-actions">
            <button class="ghost">Help</button>
            <button class="primary">Profile</button>
        </div>
    </header>
</template>

<style scoped>
.app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    background: hsl(210, 70%, 96%);
    border-bottom: 1px solid hsl(210, 30%, 85%);
}

.brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.logo {
    font-size: 1.4rem;
}

h1 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

button {
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
}

button.ghost {
    background: transparent;
    border: 1px solid hsl(210, 30%, 80%);
}

button.primary {
    background: hsl(210, 70%, 85%);
    border: none;
}
</style>
