<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const register = async () => {
    error.value = ''

    if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        return
    }

    loading.value = true

    try {
        await api.post('/auth/register', {
            email: email.value,
            password: password.value
        })

        // After register, go to login
        router.push('/')
    } catch (err) {
        error.value = err.response?.data?.message || 'Registration failed'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="auth">
        <h1>Register</h1>

        <form @submit.prevent="register">
            <input type="email" placeholder="Email" v-model="email" required />

            <input type="password" placeholder="Password" v-model="password" required />

            <input type="password" placeholder="Confirm Password" v-model="confirmPassword" required />

            <button :disabled="loading">
                {{ loading ? 'Creating account...' : 'Register' }}
            </button>

            <p v-if="error" class="error">{{ error }}</p>
        </form>

        <p>
            Already have an account?
            <RouterLink to="/">Login</RouterLink>
        </p>
    </div>
</template>

<style scoped>
.auth {
    max-width: 400px;
    margin: 5rem auto;
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
}
</style>
