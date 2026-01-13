<script setup>
import { ref } from 'vue';
defineProps(['category', 'isEditable'])
const emit = defineEmits(['category', 'delete-category'])
const hoveredCategoryId = ref(null);

function handleMouseEnter(id) {
    hoveredCategoryId.value = id;
}

function handleMouseLeave() {
    hoveredCategoryId.value = null;
}

// Remove Category from Todo
function deleteCategory(category) {
    console.log("Deleting category:", category)
    emit('delete-category', category)
}

</script>
<template>
    <div @mouseenter="handleMouseEnter(category._id)" @mouseleave="handleMouseLeave" class="category">
        <a @click.prevent="$emit('category', category.name)">
            {{ category.name }}
        </a>
        <!-- v-if="hoveredCategoryId === category._id" -->
        <i class="bx bx-x" @click="deleteCategory(category._id)" v-if="isEditable" />
    </div>
</template>
<style scoped>
.category {
    display: flex;
    justify-content: center;
    align-items: center;
}

.bx-x {
    color: red;
    font-size: 1rem;
    margin-left: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.bx-x:hover {
    color: #2563eb !important;
}


/* .category-x {
    position: absolute;
    top: -5px;
    right: -5px;
    cursor: pointer;
    border-radius: 50%;
    background: white;
    border: 1px solid red;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
} */

.category .bx:hover {
    color: red;
    cursor: pointer;
}

.category {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    color: white;
    border: 1px solid white;
    /* background-color: #eef; */
    font-size: 0.8em;
    cursor: pointer;
    border-radius: 20px;
    padding: 1px 10px;
}

.category a {
    min-height: 20px;
    text-decoration: none;
    /* color: black; */
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
</style>