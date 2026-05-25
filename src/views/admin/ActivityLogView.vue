<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Audit Trail</h1>
        <p class="text-sm text-gray-500">Rekam jejak aktivitas sistem.</p>
      </div>
       
      <button 
        @click="showFilterDrawer = true" 
        class="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2"
      >
        <i class="pi pi-filter"></i>
        <span>Filter Tanggal</span>
        <span v-if="filters.startDate || filters.endDate" class="flex h-2 w-2 rounded-full bg-blue-600"></span>
      </button>
    </div>

    <Sidebar v-model:visible="showFilterDrawer" position="right" class="w-full md:w-[400px]">
        <template #header>
            <div class="flex items-center gap-2 font-bold text-lg text-gray-800">
                <i class="pi pi-filter text-blue-600"></i>
                Filter Log Aktivitas
            </div>  
        </template>

        <div class="flex flex-col h-full py-4">
            <div class="space-y-6 flex-1">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
                    Pilih rentang tanggal untuk mempersempit hasil pencarian log.
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-gray-700 text-sm">Dari Tanggal</label>
                    <div class="relative">
                        <i class="pi pi-calendar absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input 
                            v-model="filters.startDate" 
                            type="date" 
                            class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-gray-700 text-sm">Sampai Tanggal</label>
                    <div class="relative">
                        <i class="pi pi-calendar absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input 
                            v-model="filters.endDate" 
                            type="date" 
                            class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                    </div>
                </div>
            </div>

            <div class="mt-auto border-t pt-6 flex flex-col gap-3">
                <button 
                    @click="applyFilter" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex justify-center items-center gap-2"
                >
                    <i class="pi pi-check"></i> Terapkan Filter
                </button>
                <button 
                    @click="resetFilter" 
                    class="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-all"
                >
                    Reset
                </button>
            </div>
        </div>
    </Sidebar>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable :value="logs" :paginator="true" :rows="15" :loading="isLoading" stripedRows responsiveLayout="scroll">
        
        <Column header="Tanggal" field="created_at" sortable style="width: 12%">
          <template #body="{ data }">
            <span class="text-sm font-bold text-gray-700">{{ getDateOnly(data.created_at) }}</span>
          </template>
        </Column>

        <Column header="Jam" field="created_at" style="width: 8%">
          <template #body="{ data }">
             <span class="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
               {{ getTimeOnly(data.created_at) }}
             </span>
          </template>
        </Column>

        <Column header="Pelaku" field="user.username" sortable style="width: 20%">
           <template #body="{ data }">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 uppercase overflow-hidden border border-gray-200"
                     :class="data.user?.employee?.profile_picture_url ? 'bg-white' : 'bg-blue-50'">
                    
                    <img 
                       v-if="data.user?.employee?.profile_picture_url" 
                       :src="getProfilePictureUrl(data.user.employee.profile_picture_url)" 
                       class="w-full h-full object-cover"
                    >
                    <span v-else>{{ data.user?.username?.charAt(0) || '?' }}</span>
                </div>
                <div>
                    <div class="text-sm font-bold text-gray-800">{{ data.user?.username }}</div>
                    <div class="text-xs text-gray-400 uppercase tracking-wide">{{ data.user?.role }}</div>
                </div>
            </div>
          </template>
        </Column>

        <Column header="Aksi" field="action" sortable style="width: 10%">
          <template #body="{ data }">
            <span :class="getActionBadge(data.action)">
              {{ data.action }}
            </span>
          </template>
        </Column>

        <Column header="Deskripsi" field="description" style="width: 40%">
             <template #body="{ data }">
                <span class="text-sm text-gray-600">{{ data.description }}</span>
             </template>
        </Column>

         <Column header="IP" field="ip_address" style="width: 10%">
             <template #body="{ data }">
                <span class="text-xs text-gray-400 font-mono">{{ data.ip_address }}</span>
             </template>
        </Column>

      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { adminService } from '../../services/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Sidebar from 'primevue/sidebar'

const logs = ref<any[]>([])
const isLoading = ref(true)
const showFilterDrawer = ref(false)

const filters = reactive({
  startDate: '',
  endDate: ''
})

onMounted(() => {
  fetchLogs()
})

async function fetchLogs() {
  isLoading.value = true
  try {
    logs.value = await adminService.getActivityLogs(filters.startDate, filters.endDate)
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function applyFilter() {
    fetchLogs()
    showFilterDrawer.value = false
}

function resetFilter() {
  filters.startDate = ''
  filters.endDate = ''
  fetchLogs()
  showFilterDrawer.value = false
}

function getDateOnly(dateString: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric'
  })
}

function getTimeOnly(dateString: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString('id-ID', { 
      hour: '2-digit', minute: '2-digit' 
  })
}

// Tambahkan Fungsi Helper Ini
function getProfilePictureUrl(url: string) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    
    // Sesuaikan URL Backend
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080' 
    return `${baseUrl.replace('/api', '')}${url}`
}

function getActionBadge(action: string) {
  const baseClass = "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider "
  if (action === 'LOGIN') return baseClass + "bg-green-100 text-green-700 border border-green-200"
  if (action === 'CREATE') return baseClass + "bg-blue-100 text-blue-700 border border-blue-200"
  if (action.includes('UPDATE')) return baseClass + "bg-orange-100 text-orange-700 border border-orange-200"
  if (action.includes('DELETE')) return baseClass + "bg-red-100 text-red-700 border border-red-200"
  return baseClass + "bg-gray-100 text-gray-700 border border-gray-200"
}
</script>
