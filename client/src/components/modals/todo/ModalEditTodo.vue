<script setup>
import { reactive, watch, toRefs, ref } from 'vue';
import category from '../../../components/todo/Category.vue'

const props = defineProps({
    show: Boolean,
    todo: Object, // The original todo passed in
});

const emits = defineEmits(['close', 'update']);

const localTodo = reactive({
    title: null,
    priority: null,
    categories: null
});

// Keep local state in sync with incoming prop
watch(
    () => props.todo,
    (newTodo) => {
        if (newTodo) {
            localTodo.title = newTodo.title;
            localTodo.priority = newTodo.priority;
            localTodo.categories = newTodo.categories;
        }
    },
    { immediate: true }
);

function close() {
    emits('close');
}

function submitEdit() {
    emits('update', {
        ...props.todo,
        title: localTodo.title,
        priority: localTodo.priority
    }); // Merge the original todo with the updated title
    close();
}

const hoveredCategoryId = ref(null)

const handleMouseEnter = (id) => {
    hoveredCategoryId.value = id
}

const handleMouseLeave = () => {
    hoveredCategoryId.value = null
}

const deleteCategory = (category) => {
    console.log("Deleting category:", category)
}

</script>
<template>
    <div v-if="show" class="modal-overlay" @click="close">
        <div class="modal-content" @click.stop>
            <h2 class="modal-title">Edit Todo</h2>
            <form @submit.prevent="submitEdit">

                <div class="form-group inputs">
                    <input type="text" v-model="localTodo.title" class="form-input" required />
                    <select name="priority" id="priority" v-model="localTodo.priority">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    <!-- <select name="author" id="author">
                        <option value="">Author 1</option>
                        <option value="">Author 2</option>
                        <option value="">Author 3</option>
                    </select> -->

                    <!-- <select name="assignee" id="assignee">
                        <option value="">Assignee</option>
                    </select> -->
                </div>

                <div class="categories">
                    <div v-for="category in localTodo.categories" :key="category._id" class="category"
                        @mouseenter="handleMouseEnter(category._id)" @mouseleave="handleMouseLeave">

                        <category :category="category" :is-editable="true" @delete-category="deleteCategory" />
                        <!-- <a @click.prevent="$emit('category', category.name)">
                            {{ category.name }}
                        </a>
                        <i class="bx bx-x category-x" v-if="hoveredCategoryId === category._id"
                            @click="deleteCategory(category._id)" /> -->
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" @click="close" class="btn-cancel">
                        Cancel
                    </button>
                    <button type="submit" class="btn-save">
                        Update
                    </button>
                </div>
            </form>
            <i class="bx bx-x" @click.prevent="close" />
        </div>
    </div>
</template>
<style scoped>
.bx-x {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
}


.inputs {
    display: flex;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(2px);
}

.modal-content {
    position: relative;
    /* background-color: white; */
    background-color: #1d1b31;
    padding: 1.5rem 3.5rem;
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 28rem;
    border: 1px solid white;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.form-input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem 0 0 0.375rem;
    padding: 0.5rem 0.75rem;
    outline: none;
}

.form-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.form-actions {
    display: flex;
    /* justify-content: space-between; */
    /* gap: 0.5rem; */
    justify-content: center;
    gap: 2em;
}

.categories {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 2;
    flex-wrap: wrap;
    /* outline: 1px solid rgb(28, 197, 104); */
    gap: 5px;
    margin-bottom: 1rem;
}



.btn-cancel {
    padding: 0.5rem 1rem;
    color: #fff;
    background: #666;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.btn-cancel:hover {
    color: #1f2937;
}

.btn-save {
    padding: 0.5rem 1rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
}

.btn-save:hover {
    background-color: #1d4ed8;
}
</style>