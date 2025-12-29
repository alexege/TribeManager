<script setup>
const year = new Date().getFullYear()
</script>

<template>
    <footer class="app-footer">
        <span>© {{ year }} Tribe Manager</span>
    </footer>
</template>

<style scoped>
.app-footer {
    display: flex;
    justify-content: center;
    padding: 0.6rem 1rem;
    color: white;
    background: rgba(255, 255, 255, 0.1);
    font-size: 0.75rem;
    margin-top: auto;
}
</style>
