<template>
  <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 sticky top-0">
    
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

    <div class="flex items-center">
      <button @click="$emit('toggleSidebar')" class="mr-4 md:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h2 class="text-lg md:text-xl font-bold text-gray-800 tracking-tight truncate max-w-[200px] md:max-w-none">
        {{ currentRouteName }}
      </h2>
    </div>

    <div class="flex items-center space-x-2 md:space-x-4">
      <div class="text-right hidden sm:block">
        <router-link to="/profile" class="group hover:opacity-80 transition-opacity cursor-pointer block">
          <div class="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {{ authStore.user?.employee?.name || authStore.user?.username || 'User' }}
          </div>
          <div class="text-xs text-gray-500 uppercase font-semibold tracking-wider">{{ authStore.userRole }}</div>
        </router-link>
      </div>

      <button 
        @click="toggleNotif" 
        class="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors focus:outline-none" 
        title="Notifikasi"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span v-if="unreadCount > 0" class="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <OverlayPanel ref="opNotif" class="w-80 shadow-2xl p-0">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 class="font-bold text-gray-800">Notifikasi</h3>
              <button v-if="unreadCount > 0" @click="markAllRead" class="text-xs text-blue-600 hover:underline">Tandai Semua Dibaca</button>
          </div>
          <div class="max-h-80 overflow-y-auto">
              <div v-if="notifications.length === 0" class="p-6 text-center text-gray-500 text-sm">
                  Belum ada notifikasi
              </div>
              <div v-else>
                  <div 
                      v-for="n in notifications" :key="n.id" 
                      @click="markAsRead(n)"
                      :class="['p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition flex items-start gap-3', !n.is_read ? 'bg-blue-50/50' : '']"
                  >
                      <div class="mt-1">
                          <div v-if="n.type === 'evaluation'" class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <i class="pi pi-check-circle"></i>
                          </div>
                          <div v-else-if="n.type === 'appeal'" class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                              <i class="pi pi-exclamation-circle"></i>
                          </div>
                          <div v-else class="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                              <i class="pi pi-bell"></i>
                          </div>
                      </div>
                      <div class="flex-1">
                          <p class="text-sm font-bold text-gray-800">{{ n.title }}</p>
                          <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ n.message }}</p>
                          <p class="text-[10px] text-gray-400 mt-2">{{ formatDate(n.created_at) }}</p>
                      </div>
                      <div v-if="!n.is_read" class="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  </div>
              </div>
          </div>
      </OverlayPanel>
      
      <button 
        @click="$router.push('/profile')" 
        class="relative p-0.5 rounded-full border-2 border-transparent hover:border-blue-100 transition-all focus:outline-none" 
        title="Profil"
      >
        <div 
            v-if="authStore.user?.employee?.profile_picture_url" 
            class="h-9 w-9 rounded-full overflow-hidden border border-gray-200 shadow-sm"
        >
            <img :src="authStore.user.employee.profile_picture_url" alt="Profile" class="w-full h-full object-cover">
        </div>
        
        <div v-else class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
      </button>

      <button @click="handleLogout" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Keluar">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { notificationService } from '../../services/api'
import { useConfirm } from "primevue/useconfirm"
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import OverlayPanel from 'primevue/overlaypanel'

const confirm = useConfirm()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentRouteName = computed(() => (route.meta.title as string) || 'KPI System')

// Define emits agar parent tau
const emit = defineEmits(['toggleSidebar'])

// --- NOTIFICATION LOGIC ---
const opNotif = ref()
const notifications = ref<any[]>([])
let notifInterval: any = null

const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.is_read).length
})

async function fetchNotifications() {
    try {
        if (authStore.isAuthenticated) {
            const data = await notificationService.getMyNotifications()
            notifications.value = data || []
        }
    } catch(e) {}
}

function toggleNotif(event: any) {
    opNotif.value.toggle(event)
}

async function markAsRead(notif: any) {
    if (!notif.is_read) {
        try {
            await notificationService.markAsRead(notif.id)
            notif.is_read = true
        } catch(e) {}
    }
}

async function markAllRead() {
    try {
        await notificationService.markAllAsRead()
        notifications.value.forEach(n => n.is_read = true)
    } catch(e) {}
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    })
}

onMounted(() => {
    fetchNotifications()
    notifInterval = setInterval(fetchNotifications, 60000) // fetch every 1 minute
})

onUnmounted(() => {
    if (notifInterval) clearInterval(notifInterval)
})
// --------------------------

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
