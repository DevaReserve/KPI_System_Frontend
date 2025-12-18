<template>
  <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
    
    <Toast group="navbar-toast" />
    
    <ConfirmDialog group="dialog-logout">
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm w-full">
                <div class="rounded-full bg-red-50 text-red-500 inline-flex justify-center items-center h-24 w-24 -mt-20 border-4 border-white shadow-sm">
                    <i :class="[message.icon, 'text-5xl']"></i>
                </div>
                <span class="font-bold text-2xl block mb-2 mt-6 text-gray-800">{{ message.header }}</span>
                <p class="mb-6 text-gray-500 text-center leading-relaxed">{{ message.message }}</p>
                <div class="flex items-center gap-3 w-full">
                    <button @click="rejectCallback" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">Batal</button>
                    <button @click="acceptCallback" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md">{{ message.acceptLabel }}</button>
                </div>
            </div>
        </template>
    </ConfirmDialog>

    <h2 class="text-xl font-bold text-gray-800 tracking-tight">{{ currentRouteName }}</h2>

    <div class="flex items-center space-x-4">
      <div class="text-right hidden sm:block">
        <router-link to="/profile" class="group hover:opacity-80 transition-opacity cursor-pointer block">
          <div class="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {{ authStore.user?.employee?.name || authStore.user?.username || 'User' }}
          </div>
          <div class="text-xs text-gray-500 uppercase font-semibold tracking-wider">{{ authStore.userRole }}</div>
        </router-link>
      </div>
      
      <button @click="$router.push('/profile')" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Profil Saya">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </button>

      <button @click="handleLogout" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Keluar">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useConfirm } from "primevue/useconfirm"
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'

const confirm = useConfirm()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentRouteName = computed(() => (route.meta.title as string) || 'KPI System')

function handleLogout() {
  confirm.require({
    group: 'dialog-logout',
    header: 'Konfirmasi Logout',
    message: 'Apakah Anda yakin ingin keluar dari aplikasi?',
    icon: 'pi pi-power-off',
    acceptLabel: 'Ya, Keluar',
    accept: () => {
      authStore.logout()
      router.push('/login')
    }
  })
}
</script>
