<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f9fafb; padding: 3rem 1rem;">
    <div style="max-width: 28rem; width: 100%;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="margin: 0 auto; height: 3rem; width: 3rem; background-color: #2563eb; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-weight: bold; font-size: 1.25rem;">KPI</span>
        </div>
        <h2 style="margin-top: 1.5rem; font-size: 1.875rem; font-weight: 800; color: #111827;">
          KPI System
        </h2>
        <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
          PT. Cakra Media Data
        </p>
      </div>
      <form @submit.prevent="handleLogin" style="margin-top: 2rem;">
        <div style="margin-bottom: 1.5rem;">
          <div>
            <input
              v-model="form.username"
              type="text"
              required
              placeholder="Username"
              style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-bottom: -1px;"
            >
          </div>
          <div>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="Password"
              style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
            >
          </div>
        </div>

        <div v-if="error" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #dc2626; font-size: 0.875rem;">{{ error }}</p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            style="width: 100%; background-color: #2563eb; color: white; padding: 0.75rem 1rem; border-radius: 0.375rem; font-weight: 600; cursor: pointer;"
            :style="{ opacity: isLoading ? 0.5 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }"
          >
            <span v-if="isLoading">Loading...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

async function handleLogin() {
  try {
    isLoading.value = true
    error.value = ''
    
    await authStore.login(form)
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    isLoading.value = false
  }
}
</script>