<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const login = async () => {
    error.value = ''
    loading.value = true

    try {
        const res = await api.post('/auth/login', {
            email: email.value,
            password: password.value
        })

        // Save token
        localStorage.setItem('token', res.data.token)

        // Redirect to protected page (add later)
        router.push('/dashboard')
    } catch (err) {
        error.value = err.response?.data?.message || 'Login failed'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="auth">
        <h1>Login</h1>

        <form @submit.prevent="login">
            <input type="email" placeholder="Email" v-model="email" required />

            <input type="password" placeholder="Password" v-model="password" required />

            <button :disabled="loading">
                {{ loading ? 'Logging in...' : 'Login' }}
            </button>

            <p v-if="error" class="error">{{ error }}</p>
        </form>

        <p>
            No account?
            <RouterLink to="/register">Register</RouterLink>
        </p>
    </div>
</template>

<style scoped>
.auth {
    max-width: 400px;
    margin: 5rem auto;
    display: flex;
    flex-direction: column;
}

input {
    margin-bottom: 1rem;
    padding: 0.75rem;
}

button {
    padding: 0.75rem;
}

.error {
    color: red;
    margin-top: 1rem;
}
</style>
