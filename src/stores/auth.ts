import { defineStore } from 'pinia'
import Swal from 'sweetalert2'
import { computed, ref } from 'vue'
import { authService } from '../services/api'
import type { LoginRequest, User } from '../types'

// Mengatur timeout sesi dalam milidetik
// 1 menit = 60.000 ms, 5 menit = 300.000 ms
const SESSION_TIMEOUT_MS = 5 * 60 * 1000
const SESSION_LAST_ACTIVITY_KEY = 'session_last_activity'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const activityListenersInitialized = ref(false)

  let inactivityTimer: number | null = null

  function clearInactivityTimer() {
    if (inactivityTimer !== null) {
      window.clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
  }

  function updateLastActivity() {
    localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, Date.now().toString())
  }

  function resetInactivityTimer() {
    if (!token.value) {
      clearInactivityTimer()
      localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY)
      return
    }

    updateLastActivity()
    clearInactivityTimer()

    inactivityTimer = window.setTimeout(() => {
      handleSessionExpired()
    }, SESSION_TIMEOUT_MS)
  }

  function handleSessionExpired() {
    if (!token.value) return

    clearInactivityTimer()
    error.value = 'Sesi Anda telah berakhir. Silakan login ulang.'
    logout()

    if (typeof window !== 'undefined') {
      Swal.fire({
        title: 'Sesi Berakhir',
        text: 'Silakan login ulang.',
        icon: 'warning',
        confirmButtonText: 'Login Ulang',
        allowOutsideClick: false,
        customClass: {
          popup: 'rounded-3xl',
          confirmButton: 'bg-blue-600 hover:bg-blue-700'
        }
      }).then(() => {
        window.location.replace('/login')
      })
    }
  }

  function attachActivityListeners() {
    if (typeof window === 'undefined' || activityListenersInitialized.value) return

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart', 'touchmove']
    events.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true })
    })

    activityListenersInitialized.value = true
  }

  function initializeSession() {
    if (!token.value) {
      clearInactivityTimer()
      localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY)
      return
    }

    attachActivityListeners()

    const lastActivity = Number(localStorage.getItem(SESSION_LAST_ACTIVITY_KEY) || '0')
    const elapsed = Date.now() - lastActivity

    if (lastActivity > 0 && elapsed >= SESSION_TIMEOUT_MS) {
      handleSessionExpired()
      return
    }

    resetInactivityTimer()
  }

  async function login(credentials: LoginRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login(credentials)

      token.value = response.token
      user.value = response.user

      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      attachActivityListeners()
      resetInactivityTimer()

      return response
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed'
      error.value = msg
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    if (token.value) {
      authService.logout()
    }
    token.value = null
    user.value = null
    error.value = null
    clearInactivityTimer()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY)
  }

  async function fetchProfile() {
    try {
      const userProfile = await authService.getProfile()
      user.value = userProfile
      localStorage.setItem('user', JSON.stringify(userProfile))
      return userProfile
    } catch (e) {
      console.error('Failed to fetch profile', e)
    }
  }

  initializeSession()

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: computed(() => !!token.value),
    userRole: computed(() => user.value?.role || null),
    isExecutive: computed(() => user.value?.is_executive === true),
    // True jika user (termasuk admin) memiliki atasan langsung (dinilai oleh seseorang)
    hasDirectSupervisor: computed(() => !!user.value?.employee?.direct_supervisor_id),
    login,
    logout,
    fetchProfile,
    initializeSession
  }
})
