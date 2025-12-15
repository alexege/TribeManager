<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

const submit = () => {
    localError.value = ''

    if (password.value !== confirmPassword.value) {
        localError.value = 'Passwords do not match'
        return
    }

    auth.register({
        email: email.value,
        password: password.value
    })
}
</script>

<template>
    <div class="auth">
        <h1>Register</h1>

        <form @submit.prevent="submit">
            <input v-model="email" type="email" required />
            <input v-model="password" type="password" required />
            <input v-model="confirmPassword" type="password" required />

            <button :disabled="auth.loading">
                {{ auth.loading ? 'Creating account...' : 'Register' }}
            </button>

            <p v-if="localError" class="error">{{ localError }}</p>
            <p v-if="auth.error" class="error">{{ auth.error }}</p>
        </form>

        <RouterLink to="/">Back to login</RouterLink>
    </div>
</template>
