import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/api'
import type { User, LoginRequest } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null) // State untuk error global

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)

  // Actions
  async function login(credentials: LoginRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login(credentials)
      
      token.value = response.token
      user.value = response.user
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return response // Return data agar bisa dipakai di view jika perlu
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed'
      error.value = msg
      throw err // Re-throw agar view tau ada error
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    error.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Router redirect sebaiknya di handle di component atau router guard, 
    // tapi window.location.reload() adalah cara brutal untuk reset state.
    // Kita biarkan view yang handle redirect.
  }

  // PENTING: Semua yang ingin diakses dari luar harus di-return di sini
  return {
    user,
    token,
    isLoading,
    error,   // <--- INI PERBAIKANNYA (Wajib di-return)
    isAuthenticated,
    userRole,
    login,
    logout
  }
})