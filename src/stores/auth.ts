import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, LoginResponse } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)

  async function login(credentials: LoginRequest) {
    try {
      isLoading.value = true
      
      // Mock response for development
      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          username: credentials.username,
          email: credentials.username + '@company.com',
          role: credentials.username.includes('admin') ? 'admin' : 
                credentials.username.includes('manager') ? 'manager' : 'employee',
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          employee: {
            id: 1,
            nip: 'EMP001',
            name: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1),
            email: credentials.username + '@company.com',
            division_id: 1,
            position: credentials.username.includes('admin') ? 'Administrator' : 
                      credentials.username.includes('manager') ? 'Manager' : 'Staff',
            is_active: true,
            join_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      }
      
      token.value = mockResponse.token
      user.value = mockResponse.user
      
      localStorage.setItem('token', mockResponse.token)
      
      return mockResponse
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    userRole,
    login,
    logout
  }
})