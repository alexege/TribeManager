<script setup>
import { ref, watch, computed } from "vue"

const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    placeholder: {
        type: String,
        default: "",
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    deletable: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(["save", "cancel", "delete"])

const isEditing = ref(false)
const draft = ref(props.modelValue)

watch(
    () => props.modelValue,
    (val) => {
        if (!isEditing.value) {
            draft.value = val
        }
    }
)

const isDirty = computed(() => draft.value !== props.modelValue)

function start() {
    if (props.disabled) return
    draft.value = props.modelValue
    isEditing.value = true
}

function save() {
    if (!isDirty.value || !draft.value.trim()) return
    emit("save", draft.value.trim())
    isEditing.value = false
}

function cancel() {
    draft.value = props.modelValue
    emit("cancel")
    isEditing.value = false
}

function requestDelete() {
    emit("delete")
}

</script>

<template>
    <div class="inline-edit">
        <!-- VIEW MODE -->
        <template v-if="!isEditing">
            <slot name="display">
                <span class="value">{{ modelValue }}</span>
            </slot>
            {{ placeholder }}
            <div class="controls">
                <button class="icon" @click="start" :disabled="disabled" title="Edit">
                    ✏️
                </button>

                <button v-if="deletable" class="icon danger" @click.stop="requestDelete" title="Delete">
                    🗑️
                </button>
            </div>
        </template>

        <!-- EDIT MODE -->
        <template v-else>
            <input v-model="draft" class="input" :placeholder="placeholder" autofocus @keyup.enter="save"
                @keyup.esc="cancel" />

            <button class="icon success" @click="save" :disabled="!isDirty" title="Save">
                💾
            </button>

            <button class="icon danger" @click="cancel" title="Cancel">
                ✖
            </button>
        </template>
    </div>
</template>

<style scoped>
.inline-edit {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.value {
    font-weight: 600;
}

.input {
    font-size: inherit;
    padding: 4px 6px;
    border-radius: 4px;
    border: 1px solid #ccc;
}

button.icon {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
}

button.icon:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

button.success {
    color: #2ecc71;
}

button.danger {
    color: #e74c3c;
}
</style>