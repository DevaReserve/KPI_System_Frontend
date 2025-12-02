<template>
  <aside class="w-64 bg-slate-900 text-white min-h-screen flex flex-col transition-all duration-300 shadow-xl z-20">
    <div class="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
      <span class="font-bold text-lg tracking-wide text-white">KPI System</span>
    </div>

    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-1 px-3">
        
        <li>
          <router-link 
            to="/" 
            class="nav-item"
            :class="{ 'active-link': $route.path === '/' }" 
          >
            <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </router-link>
        </li>

        <template v-if="authStore.userRole === 'admin'">
          <div class="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Master Data
          </div>
          <li>
            <router-link to="/admin/divisions" class="nav-item" active-class="active-link">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Divisi
            </router-link>
          </li>
          <li>
            <router-link to="/admin/employees" class="nav-item" active-class="active-link">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pegawai
            </router-link>
          </li>
          <li>
            <router-link to="/admin/indicators" class="nav-item" active-class="active-link">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Indikator KPI
            </router-link>
          </li>
          <li>
            <router-link to="/admin/periods" class="nav-item" active-class="active-link">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Periode Evaluasi
            </router-link>
          </li>
        </template>

        <template v-if="authStore.userRole === 'manager'">
          <div class="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Manajemen Tim
          </div>
          <li>
            <router-link to="/manager/team" class="nav-item" active-class="active-link">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Anggota Tim
            </router-link>
          </li>
          <li>
            <router-link to="/manager/assessment" class="nav-item" active-class="active-link">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Input Penilaian
            </router-link>
          </li>
        </template>

        <template v-if="authStore.userRole === 'employee'">
          <div class="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Kinerja Saya
          </div>
          <li>
            <router-link to="/employee/history" class="nav-item" active-class="active-link">
              <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Raport Kinerja
            </router-link>
          </li>
        </template>

      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
</script>

<style scoped>
.nav-item {
  @apply flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-blue-500 hover:text-white transition-all duration-200 border border-transparent;
}

.active-link {
  @apply bg-blue-600 text-white shadow-lg;
}
</style>
