<template>
  <aside 
    class="fixed inset-y-0 left-0 z-30 w-64 bg-gray-50 border-r border-gray-200 text-gray-800 flex flex-col shadow-xl transition-transform duration-300 ease-in-out 
    md:translate-x-0 md:static md:m-4 md:rounded-2xl md:border-0 md:h-[calc(100vh-2rem)]"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    
    <div class="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm shrink-0 md:rounded-t-2xl">
      <div class="flex items-center gap-3">
        <div class="bg-blue-600 p-1.5 rounded-lg shadow-sm">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span class="font-bold text-lg tracking-wide text-gray-900">KPI System</span>
      </div>
      
      <button @click="$emit('closeSidebar')" class="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
      <ul class="space-y-1">
        
        <li>
          <router-link to="/" class="nav-item" exact-active-class="active-link" @click="$emit('closeSidebar')">
            <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </router-link>
        </li>

        <template v-if="authStore.isExecutive">
          <div class="mt-4 mb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Eksekutif</div>
          <li>
            <router-link to="/executive/dashboard" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')">
              <svg class="w-5 h-5 mr-3 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
              Performa Perusahaan
            </router-link>
          </li>
        </template>

        <template v-if="authStore.userRole === 'admin'">
          <div class="mt-8 mb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Master Data</div>
          <li><router-link to="/admin/positions" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')"><svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>Jabatan</router-link></li>
          <li><router-link to="/admin/divisions" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')"><svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>Divisi</router-link></li>
          <li><router-link to="/admin/employees" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')"><svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>Pegawai</router-link></li>
          <li><router-link to="/admin/indicators" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')"><svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>Indikator KPI</router-link></li>
          <li><router-link to="/admin/periods" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')"><svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Periode Evaluasi</router-link></li>
          
          <div class="mt-8 mb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Laporan</div>
          <li><router-link to="/admin/reports" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')"><svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Rekapitulasi Nilai</router-link></li>

          <div class="mt-8 mb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Sistem & Keamanan</div>
          <li>
            <router-link to="/admin/logs" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Audit Trail
            </router-link>
          </li>
          <li>
            <router-link to="/admin/warnings" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Manajemen SP
            </router-link>
          </li>
        </template>

        <template v-if="authStore.userRole === 'manager' || authStore.userRole === 'admin'">
          <div class="mt-8 mb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Manajemen Tim</div>
          <li><router-link to="/manager/team" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')"><svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>Penilaian Kinerja</router-link></li>
          <li>
            <router-link to="/manager/kpi-targets" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Target KPI
            </router-link>
          </li>
        </template>

        <template v-if="authStore.userRole === 'employee' || authStore.userRole === 'manager'">
          <div class="mt-8 mb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Kinerja Saya</div>
          <li><router-link to="/employee/history" class="nav-item" active-class="active-link" @click="$emit('closeSidebar')"><svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>Raport & Tren Kinerja</router-link></li>
        </template>

      </ul>
    </nav>
    
    <div class="p-4 border-t border-gray-200 bg-white text-xs text-gray-500 text-center md:rounded-b-2xl">
      &copy; 2025 KPI System
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore()

defineProps({
  isOpen: Boolean
})

defineEmits(['closeSidebar'])
</script>

<style scoped>
/* Update warna untuk Nav Item (abu-abu tua saat tidak aktif, abu-abu muda saat hover) */
.nav-item { @apply flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 border-l-4 border-transparent mb-1; }

/* Update warna untuk Active Link (latar biru muda, teks biru tua) */
.active-link { @apply bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm font-bold; }

/* Update warna scrollbar agar serasi dengan tema terang */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; /* gray-50 */ }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; /* gray-300 */ border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; /* gray-400 */ }
</style>
