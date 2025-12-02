<template>
  <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
    <h2 class="text-xl font-semibold text-gray-800">
      </h2>

    <div class="flex items-center space-x-4">
      <div class="text-right hidden sm:block">
        <div class="text-sm font-bold text-gray-900">{{ authStore.user?.username }}</div>
        <div class="text-xs text-gray-500 uppercase">{{ authStore.userRole }}</div>
      </div>
      
      <button 
        @click="handleLogout"
        class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
        title="Logout"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  const confirm = window.confirm("Apakah Anda yakin ingin keluar?")
  if (confirm) {
    authStore.logout()
    router.push('/login')
  }
}
</script>
