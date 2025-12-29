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
    background: hsl(30, 70%, 96%);
    border-top: 1px solid hsl(30, 30%, 85%);
    font-size: 0.75rem;
    margin-top: auto;
}
</style>
