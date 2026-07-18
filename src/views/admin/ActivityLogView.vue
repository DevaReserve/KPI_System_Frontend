<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
      <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
        <i class="pi pi-history text-[200px]"></i>
      </div>
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-extrabold uppercase tracking-wider text-blue-200 border border-white/15 flex items-center gap-1.5">
              <i class="pi pi-shield text-xs"></i> Keamanan Sistem & Audit Trail
            </span>
            <span class="px-3 py-1 bg-blue-600/60 backdrop-blur rounded-full text-xs font-extrabold uppercase tracking-wider text-white border border-blue-400/25">
              Role: Admin
            </span>
          </div>
          <h1 class="text-2xl md:text-3xl font-black tracking-tight">Audit Trail Sistem</h1>
          <p class="text-blue-100 text-sm mt-1 max-w-2xl leading-relaxed">
            Pantau seluruh aktivitas pengguna dan perubahan sistem untuk menjaga keamanan data. Anda dapat beralih antara melihat seluruh riwayat sistem atau aktivitas pribadi Anda sendiri.
          </p>
        </div>
        
        <div class="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          <!-- View Mode Toggle -->
          <button 
            @click="viewMode = viewMode === 'timeline' ? 'table' : 'timeline'" 
            class="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-2 backdrop-blur shadow-sm"
          >
            <i :class="viewMode === 'timeline' ? 'pi pi-table' : 'pi pi-list'"></i>
            {{ viewMode === 'timeline' ? 'Tampilkan Tabel' : 'Tampilkan Linimasa' }}
          </button>
          <button 
            @click="loadLogs" 
            :disabled="isLoading"
            class="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition flex items-center justify-center backdrop-blur shadow-sm disabled:opacity-50"
            title="Segarkan Data"
          >
            <i class="pi pi-refresh" :class="{ 'pi-spin': isLoading }"></i>
          </button>
        </div>
      </div>

      <!-- Scope Selector (Semua Sistem vs Aktivitas Saya) -->
      <div class="flex items-center gap-2 mt-6 pt-5 border-t border-white/15 relative z-10">
        <button 
          @click="changeScope('all')"
          class="px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2"
          :class="scope === 'all' ? 'bg-white text-slate-900 shadow-md font-extrabold' : 'bg-white/10 hover:bg-white/15 text-white'"
        >
          <i class="pi pi-globe"></i> Semua Aktivitas Sistem
        </button>
        <button 
          @click="changeScope('my')"
          class="px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2"
          :class="scope === 'my' ? 'bg-white text-slate-900 shadow-md font-extrabold' : 'bg-white/10 hover:bg-white/15 text-white'"
        >
          <i class="pi pi-user"></i> Aktivitas Saya (Personal)
        </button>
      </div>
    </div>

    <!-- Statistik Ringkas -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Terfilter</p>
        <p class="text-2xl font-black text-gray-900 mt-0.5">{{ filteredLogs.length }} <span class="text-xs font-normal text-gray-500">log</span></p>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aktivitas Keamanan</p>
        <p class="text-2xl font-black text-emerald-600 mt-0.5">{{ countByCategory('security') }} <span class="text-xs font-normal text-gray-500">kali</span></p>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manajemen Pegawai & Profil</p>
        <p class="text-2xl font-black text-blue-600 mt-0.5">{{ countByCategory('profile') }} <span class="text-xs font-normal text-gray-500">kali</span></p>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target & Penilaian KPI</p>
        <p class="text-2xl font-black text-purple-600 mt-0.5">{{ countByCategory('performance') }} <span class="text-xs font-normal text-gray-500">kali</span></p>
      </div>
    </div>

    <!-- Filter & Toolbar Bar -->
    <div class="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      <!-- Chips Kategori -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          @click="selectedCategory = cat.id"
          class="px-3.5 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap flex items-center gap-1.5 shrink-0"
          :class="selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'"
        >
          <i :class="cat.icon"></i>
          {{ cat.label }}
        </button>
      </div>

      <!-- Search & Date Filter -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
        <div class="relative flex-1 sm:w-64">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari pelaku atau deskripsi..." 
            class="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>

        <button 
          @click="showFilterModal = true"
          class="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition flex items-center justify-center gap-1.5 shrink-0"
          :class="{ 'border-blue-500 bg-blue-50/50 text-blue-700': filterStartDate || filterEndDate }"
        >
          <i class="pi pi-calendar text-blue-600"></i>
          <span>{{ filterStartDate || filterEndDate ? 'Filter Aktif' : 'Rentang Tanggal' }}</span>
          <span v-if="filterStartDate || filterEndDate" class="w-2 h-2 rounded-full bg-blue-600"></span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white rounded-2xl p-12 border border-gray-100 flex flex-col items-center justify-center text-center">
      <div class="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4"></div>
      <p class="text-sm font-bold text-gray-700">Memuat Rekam Jejak Audit Trail...</p>
      <p class="text-xs text-gray-400 mt-1">Mengambil data log audit sistem dari server.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredLogs.length === 0" class="bg-white rounded-2xl p-16 border border-gray-100 flex flex-col items-center justify-center text-center">
      <div class="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4 text-2xl">
        <i class="pi pi-inbox"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-800">Belum Ada Aktivitas Terpilih</h3>
      <p class="text-sm text-gray-500 max-w-md mt-1">
        Tidak ditemukan log aktivitas yang cocok dengan filter atau kata kunci pencarian yang Anda tentukan.
      </p>
      <button v-if="selectedCategory !== 'all' || searchQuery || filterStartDate || filterEndDate" @click="resetAllFilters" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm">
        Reset Semua Filter
      </button>
    </div>

    <!-- MODE LINIMASA (TIMELINE) -->
    <div v-else-if="viewMode === 'timeline'" class="space-y-6">
      <div v-for="(groupLogs, dateLabel) in groupedLogs" :key="dateLabel" class="space-y-3">
        <!-- Tanggal Divider -->
        <div class="flex items-center gap-3">
          <span class="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <i class="pi pi-calendar"></i> {{ dateLabel }}
          </span>
          <div class="h-px bg-gray-200 flex-1"></div>
          <span class="text-xs font-bold text-gray-400">{{ groupLogs.length }} aktivitas</span>
        </div>

        <!-- Kartu Linimasa -->
        <div class="relative pl-6 sm:pl-8 border-l-2 border-blue-200 ml-3 sm:ml-4 space-y-3">
          <div 
            v-for="log in groupLogs" 
            :key="log.id"
            class="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition duration-200 relative"
          >
            <!-- Timeline Bullet -->
            <div class="absolute -left-[31px] sm:-left-[39px] top-5 w-7 h-7 rounded-full bg-white border-4 flex items-center justify-center shadow-sm transition group-hover:scale-110" :class="getActionTheme(log.action).borderColor">
              <div class="w-2 h-2 rounded-full" :class="getActionTheme(log.action).dotColor"></div>
            </div>

            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div class="flex items-start gap-3.5 flex-1 min-w-0">
                <!-- Icon Badge -->
                <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-0.5" :class="getActionTheme(log.action).bgClass">
                  <i :class="getActionTheme(log.action).icon" class="text-lg"></i>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="text-sm font-extrabold text-gray-900">{{ getActionFriendlyName(log.action) }}</span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider" :class="getActionTheme(log.action).badgeClass">
                      {{ log.action }}
                    </span>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium break-words mb-2">{{ log.description }}</p>

                  <!-- Pelaku Info -->
                  <div class="flex items-center gap-2 text-xs bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl w-fit">
                    <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600 bg-blue-100 uppercase overflow-hidden border border-gray-200">
                      <img 
                         v-if="log.user?.employee?.profile_picture_url" 
                         :src="getProfilePictureUrl(log.user.employee.profile_picture_url)" 
                         class="w-full h-full object-cover"
                      >
                      <span v-else>{{ (log.username || log.user?.username || '?').charAt(0) }}</span>
                    </div>
                    <span class="text-gray-500 font-semibold">Pelaku:</span>
                    <span class="text-gray-800 font-extrabold">{{ log.username || log.user?.username || 'System' }}</span>
                    <span v-if="log.user?.role" class="px-1.5 py-0.2 bg-gray-200 text-gray-700 rounded text-[9px] font-bold uppercase">{{ log.user.role }}</span>
                  </div>
                </div>
              </div>

              <!-- Meta Waktu & IP -->
              <div class="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0 text-right">
                <div class="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <i class="pi pi-clock text-blue-600 text-xs"></i>
                  <span>{{ formatTime(log.created_at) }} WIB</span>
                </div>
                <div class="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                  <i class="pi pi-desktop text-[10px]"></i>
                  <span>IP: {{ log.ip_address || 'Internal' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODE TABEL (TABLE) -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable :value="filteredLogs" :paginator="true" :rows="15" stripedRows responsiveLayout="scroll" class="text-sm">
        
        <Column header="No" style="width: 60px">
          <template #body="{ index }">
            <span class="text-gray-500 text-sm">{{ index + 1 }}.</span>
          </template>
        </Column>

        <Column header="Waktu" field="created_at" sortable style="width: 15%">
          <template #body="{ data }">
            <div>
              <div class="font-bold text-gray-800 text-xs">{{ formatDateOnly(data.created_at) }}</div>
              <div class="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                <i class="pi pi-clock text-[9px]"></i> {{ formatTime(data.created_at) }} WIB
              </div>
            </div>
          </template>
        </Column>

        <Column header="Pelaku" field="user.username" sortable style="width: 20%">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase overflow-hidden border border-gray-200"
                   :class="data.user?.employee?.profile_picture_url ? 'bg-white' : 'bg-blue-50'">
                  <img 
                     v-if="data.user?.employee?.profile_picture_url" 
                     :src="getProfilePictureUrl(data.user.employee.profile_picture_url)" 
                     class="w-full h-full object-cover"
                  >
                  <span v-else>{{ (data.username || data.user?.username || '?').charAt(0) }}</span>
              </div>
              <div>
                  <div class="text-xs font-bold text-gray-800">{{ data.username || data.user?.username || 'Unknown' }}</div>
                  <div class="text-[9px] text-gray-400 uppercase tracking-wide">{{ data.user?.role || (data.username ? 'Attempted Login' : 'N/A') }}</div>
              </div>
            </div>
          </template>
        </Column>

        <Column header="Kategori & Aksi" field="action" sortable style="width: 20%">
          <template #body="{ data }">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" :class="getActionTheme(data.action).bgClass">
                <i :class="getActionTheme(data.action).icon" class="text-xs"></i>
              </div>
              <div>
                <div class="font-bold text-gray-800 text-[11px]">{{ getActionFriendlyName(data.action) }}</div>
                <span class="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 font-mono">{{ data.action }}</span>
              </div>
            </div>
          </template>
        </Column>

        <Column header="Deskripsi Aktivitas" field="description" style="width: 33%">
          <template #body="{ data }">
            <p class="text-gray-700 font-medium text-xs leading-relaxed">{{ data.description }}</p>
          </template>
        </Column>

        <Column header="Alamat IP" field="ip_address" style="width: 12%">
          <template #body="{ data }">
            <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-mono text-[10px] font-semibold">
              {{ data.ip_address || 'N/A' }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- MODAL FILTER TANGGAL -->
    <div v-if="showFilterModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" @click="showFilterModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-gray-100">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <i class="pi pi-filter text-xl"></i> Filter Rentang Tanggal
              </h3>
              <button @click="showFilterModal = false" class="text-white/80 hover:text-white transition">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <p class="text-xs text-blue-100 mt-1">Saring log aktivitas berdasarkan batas awal dan akhir tanggal.</p>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Dari Tanggal (Mulai)</label>
              <input v-model="tempStartDate" type="date" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Sampai Tanggal (Akhir)</label>
              <input v-model="tempEndDate" type="date" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
            </div>

            <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button" 
                @click="resetDateFilters" 
                class="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-xs font-bold transition"
              >
                Reset Tanggal
              </button>
              <button 
                type="button" 
                @click="applyDateFilters" 
                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import { computed, onMounted, ref } from 'vue'
import { adminService, authService } from '../../services/api'

const logs = ref<any[]>([])
const isLoading = ref(true)
const viewMode = ref<'timeline' | 'table'>('table') // Defaults to table for admin as they want dense data
const searchQuery = ref('')
const selectedCategory = ref('all')
const showFilterModal = ref(false)
const scope = ref<'all' | 'my'>('all') // Admin options: 'all' (all users) or 'my' (only their own actions)

const filterStartDate = ref('')
const filterEndDate = ref('')
const tempStartDate = ref('')
const tempEndDate = ref('')

const categories = [
  { id: 'all', label: 'Semua Aktivitas', icon: 'pi pi-list' },
  { id: 'security', label: 'Sesi & Keamanan', icon: 'pi pi-lock' },
  { id: 'profile', label: 'Manajemen Pegawai', icon: 'pi pi-user' },
  { id: 'performance', label: 'Target & KPI', icon: 'pi pi-chart-line' },
  { id: 'achievement', label: 'Prestasi & Sanggahan', icon: 'pi pi-trophy' }
]

onMounted(async () => {
  await loadLogs()
})

async function loadLogs() {
  isLoading.value = true
  try {
    if (scope.value === 'my') {
      logs.value = await authService.getMyActivityLogs(filterStartDate.value, filterEndDate.value)
    } else {
      logs.value = await adminService.getActivityLogs(filterStartDate.value, filterEndDate.value)
    }
  } catch (err) {
    console.error('Failed to load audit logs', err)
    logs.value = []
  } finally {
    isLoading.value = false
  }
}

function changeScope(newScope: 'all' | 'my') {
  scope.value = newScope
  loadLogs()
}

function applyDateFilters() {
  filterStartDate.value = tempStartDate.value
  filterEndDate.value = tempEndDate.value
  showFilterModal.value = false
  loadLogs()
}

function resetDateFilters() {
  tempStartDate.value = ''
  tempEndDate.value = ''
  filterStartDate.value = ''
  filterEndDate.value = ''
  showFilterModal.value = false
  loadLogs()
}

function resetAllFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  resetDateFilters()
}

// Helper pengklasifikasian kategori untuk statistik dan filter
function getActionCategory(action: string): string {
  if (['LOGIN', 'LOGOUT', 'CHANGE_PASSWORD', 'LOGIN_BLOCKED', 'SEND_PHONE_OTP', 'VERIFY_PHONE_OTP', 'FORGOT_PASSWORD', 'RESET_PASSWORD'].includes(action)) {
    return 'security'
  }
  if (['UPDATE_BIODATA', 'UPDATE_PROFILE_PICTURE', 'UPDATE_EMPLOYEE', 'CREATE_EMPLOYEE', 'DELETE_EMPLOYEE', 'CREATE_POSITION', 'UPDATE_POSITION', 'DELETE_POSITION', 'CREATE_DIVISION', 'UPDATE_DIVISION', 'DELETE_DIVISION'].includes(action)) {
    return 'profile'
  }
  if (['CREATE_ACHIEVEMENT', 'UPDATE_ACHIEVEMENT', 'DELETE_ACHIEVEMENT', 'SUBMIT_APPEAL', 'RESOLVE_APPEAL'].includes(action)) {
    return 'achievement'
  }
  if (['SET_KPI_TARGET', 'SET_KPI_TARGET_BULK', 'SUBMIT_EVALUATION', 'ISSUE_WARNING', 'DELETE_WARNING', 'CREATE_PERIOD', 'UPDATE_PERIOD', 'DELETE_PERIOD', 'ACTIVATE_PERIOD'].includes(action)) {
    return 'performance'
  }
  return 'other'
}

function countByCategory(cat: string): number {
  return logs.value.filter(l => getActionCategory(l.action) === cat).length
}

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    // Filter Kategori
    if (selectedCategory.value !== 'all' && getActionCategory(log.action) !== selectedCategory.value) {
      return false
    }
    // Filter Pencarian
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const descMatch = log.description && log.description.toLowerCase().includes(q)
      const actionMatch = log.action && log.action.toLowerCase().includes(q)
      const friendlyMatch = getActionFriendlyName(log.action).toLowerCase().includes(q)
      const actorMatch = (log.username || log.user?.username || '').toLowerCase().includes(q)
      if (!descMatch && !actionMatch && !friendlyMatch && !actorMatch) return false
    }
    return true
  })
})

// Pengelompokan log berdasarkan label tanggal human-friendly (Hari Ini, Kemarin, dsb)
const groupedLogs = computed(() => {
  const groups: Record<string, any[]> = {}
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const yesterdayDate = new Date(now)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0]

  filteredLogs.value.forEach(log => {
    if (!log.created_at) return
    const logDateStr = new Date(log.created_at).toISOString().split('T')[0]
    let label = ''
    if (logDateStr === todayStr) {
      label = 'Hari Ini'
    } else if (logDateStr === yesterdayStr) {
      label = 'Kemarin'
    } else {
      label = formatDateOnly(log.created_at)
    }

    if (!groups[label]) groups[label] = []
    groups[label].push(log)
  })
  return groups
})

function getActionFriendlyName(action: string): string {
  switch (action) {
    case 'LOGIN': return 'Masuk ke Aplikasi (Login)'
    case 'LOGOUT': return 'Keluar dari Aplikasi (Logout)'
    case 'LOGIN_BLOCKED': return 'Percobaan Login Diblokir'
    case 'CHANGE_PASSWORD': return 'Mengubah Kata Sandi'
    case 'UPDATE_BIODATA': return 'Memperbarui Biodata & Kontak'
    case 'UPDATE_PROFILE_PICTURE': return 'Mengganti Foto Profil'
    case 'SEND_PHONE_OTP': return 'Mengirim Kode OTP WhatsApp'
    case 'VERIFY_PHONE_OTP': return 'Memverifikasi Nomor Telepon'
    case 'SET_KPI_TARGET': return 'Target KPI Ditetapkan'
    case 'SET_KPI_TARGET_BULK': return 'Target KPI Massal Divisi'
    case 'SUBMIT_EVALUATION': return 'Penilaian Kinerja Disubmit'
    case 'SUBMIT_APPEAL': return 'Mengajukan Sanggahan Nilai'
    case 'RESOLVE_APPEAL': return 'Sanggahan Ditinjau Atasan'
    case 'CREATE_ACHIEVEMENT': return 'Mengunggah Prestasi / Sertifikat'
    case 'UPDATE_ACHIEVEMENT': return 'Memperbarui Data Prestasi'
    case 'DELETE_ACHIEVEMENT': return 'Menghapus Data Prestasi'
    case 'ISSUE_WARNING': return 'Penerbitan Surat Peringatan (SP)'
    case 'DELETE_WARNING': return 'Penghapusan Surat Peringatan'
    case 'CREATE_EMPLOYEE': return 'Menambahkan Pegawai Baru'
    case 'UPDATE_EMPLOYEE': return 'Mengubah Data Pegawai'
    case 'DELETE_EMPLOYEE': return 'Menghapus Data Pegawai'
    case 'CREATE_POSITION': return 'Menambahkan Jabatan Baru'
    case 'UPDATE_POSITION': return 'Mengubah Jabatan'
    case 'DELETE_POSITION': return 'Menghapus Jabatan'
    case 'CREATE_DIVISION': return 'Menambahkan Divisi Baru'
    case 'UPDATE_DIVISION': return 'Mengubah Divisi'
    case 'DELETE_DIVISION': return 'Menghapus Divisi'
    case 'CREATE_PERIOD': return 'Membuat Periode Evaluasi'
    case 'UPDATE_PERIOD': return 'Mengubah Periode Evaluasi'
    case 'DELETE_PERIOD': return 'Menghapus Periode Evaluasi'
    case 'ACTIVATE_PERIOD': return 'Mengaktifkan Periode Evaluasi'
    default: return action || 'Aktivitas Sistem'
  }
}

function getActionTheme(action: string) {
  switch (action) {
    case 'LOGIN':
      return {
        bgClass: 'bg-emerald-100 text-emerald-700',
        badgeClass: 'bg-emerald-100 text-emerald-800',
        borderColor: 'border-emerald-500',
        dotColor: 'bg-emerald-600',
        icon: 'pi pi-sign-in'
      }
    case 'LOGOUT':
      return {
        bgClass: 'bg-gray-100 text-gray-700',
        badgeClass: 'bg-gray-100 text-gray-800',
        borderColor: 'border-gray-400',
        dotColor: 'bg-gray-600',
        icon: 'pi pi-sign-out'
      }
    case 'CHANGE_PASSWORD':
      return {
        bgClass: 'bg-amber-100 text-amber-700',
        badgeClass: 'bg-amber-100 text-amber-800',
        borderColor: 'border-amber-500',
        dotColor: 'bg-amber-600',
        icon: 'pi pi-key'
      }
    case 'UPDATE_BIODATA':
    case 'UPDATE_PROFILE_PICTURE':
      return {
        bgClass: 'bg-blue-100 text-blue-700',
        badgeClass: 'bg-blue-100 text-blue-800',
        borderColor: 'border-blue-500',
        dotColor: 'bg-blue-600',
        icon: action === 'UPDATE_PROFILE_PICTURE' ? 'pi pi-camera' : 'pi pi-user-edit'
      }
    case 'SEND_PHONE_OTP':
    case 'VERIFY_PHONE_OTP':
      return {
        bgClass: 'bg-indigo-100 text-indigo-700',
        badgeClass: 'bg-indigo-100 text-indigo-800',
        borderColor: 'border-indigo-500',
        dotColor: 'bg-indigo-600',
        icon: action === 'VERIFY_PHONE_OTP' ? 'pi pi-shield' : 'pi pi-envelope'
      }
    case 'CREATE_ACHIEVEMENT':
    case 'UPDATE_ACHIEVEMENT':
      return {
        bgClass: 'bg-yellow-100 text-yellow-700',
        badgeClass: 'bg-yellow-100 text-yellow-800',
        borderColor: 'border-yellow-500',
        dotColor: 'bg-yellow-600',
        icon: 'pi pi-trophy'
      }
    case 'SUBMIT_APPEAL':
    case 'RESOLVE_APPEAL':
      return {
        bgClass: 'bg-orange-100 text-orange-700',
        badgeClass: 'bg-orange-100 text-orange-800',
        borderColor: 'border-orange-500',
        dotColor: 'bg-orange-600',
        icon: 'pi pi-exclamation-circle'
      }
    case 'LOGIN_BLOCKED':
    case 'DELETE_ACHIEVEMENT':
    case 'ISSUE_WARNING':
    case 'DELETE_WARNING':
    case 'DELETE_EMPLOYEE':
    case 'DELETE_POSITION':
    case 'DELETE_DIVISION':
    case 'DELETE_PERIOD':
      return {
        bgClass: 'bg-red-100 text-red-700',
        badgeClass: 'bg-red-100 text-red-800',
        borderColor: 'border-red-500',
        dotColor: 'bg-red-600',
        icon: action.includes('WARNING') ? 'pi pi-exclamation-triangle' : 'pi pi-lock'
      }
    default:
      return {
        bgClass: 'bg-purple-100 text-purple-700',
        badgeClass: 'bg-purple-100 text-purple-800',
        borderColor: 'border-purple-500',
        dotColor: 'bg-purple-600',
        icon: 'pi pi-bolt'
      }
  }
}

function formatDateOnly(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getProfilePictureUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080' 
  return `${baseUrl.replace('/api', '')}${url}`
}
</script>
