<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()

const email = ref('')
const password = ref('')

const submit = () => {
    auth.login({
        email: email.value,
        password: password.value
    })
}
</script>

<template>
    <div class="auth">
        <h1>Login</h1>

        <form @submit.prevent="submit">
            <input v-model="email" type="email" placeholder="Email" required />
            <input v-model="password" type="password" placeholder="Password" required />

            <button :disabled="auth.loading">
                {{ auth.loading ? 'Logging in...' : 'Login' }}
            </button>

            <p v-if="auth.error" class="error">{{ auth.error }}</p>
        </form>

        <RouterLink to="/register">Register</RouterLink>
    </div>
</template>
