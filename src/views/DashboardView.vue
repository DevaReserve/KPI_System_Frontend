<template>
  <div class="min-h-screen bg-gray-100">
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center flex-col">
          <h1 class="text-2xl text-gray-400 font-bold mb-2">Dashboard Area</h1>
          <p class="text-gray-500">Selamat datang di Sistem KPI.</p>
          <p class="text-xs text-gray-400 mt-4">Token Anda tersimpan aman.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
