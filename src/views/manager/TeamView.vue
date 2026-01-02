<template>
  <div>
    <Toast />

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Tim Saya</h1>
      <p class="text-gray-600 text-sm mt-1">Daftar pegawai di bawah supervisi Anda.</p>
    </div>

    <DataTable :columns="tableColumns" :data="teamMembers" :loading="isLoading">
      
      <template #employee_name="{ item }">
        <div class="flex items-center">
          
          <div class="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 overflow-hidden border border-gray-200"
               :class="item.profile_picture_url ? 'bg-white' : 'bg-indigo-100 text-indigo-600'">
            
            <img 
               v-if="item.profile_picture_url" 
               :src="getProfilePictureUrl(item.profile_picture_url)" 
               class="w-full h-full object-cover"
            >
            <span v-else>{{ item.employee_name.charAt(0) }}</span>
          
          </div>

          <div>
            <div class="text-sm font-bold text-gray-900">{{ item.employee_name }}</div>
            <div class="text-xs text-gray-500">ID: {{ item.employee_id }}</div>
          </div>
        </div>
      </template>

      <template #evaluation_status="{ value }">
        <span v-if="value === 'submitted'" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
          Selesai Dinilai
        </span>
        <span v-else-if="value === 'draft'" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
          Draft
        </span>
        <span v-else class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
          Belum Dinilai
        </span>
      </template>

      <template #actions="{ item }">
        <button 
          v-if="item.evaluation_status !== 'submitted'"
          @click="handleAssess(item)" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
        >
          {{ item.evaluation_status === 'draft' ? 'Lanjut Menilai' : 'Mulai Penilaian' }}
        </button>

        <button 
          v-else
          @click="viewDetail(item)" 
          class="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded text-xs font-bold border border-green-200 transition-colors flex items-center"
        >
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Lihat Detail
        </button>
      </template>

    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { managerService } from '../../services/api'
import DataTable from '../../components/ui/DataTable.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'

const toast = useToast()
const router = useRouter()

// Update Interface TypeScript
interface TeamMember {
  employee_id: number
  employee_name: string
  profile_picture_url?: string // <--- TAMBAHKAN INI
  evaluation_id?: number | null
  evaluation_status: string 
}

const teamMembers = ref<TeamMember[]>([]) 
const isLoading = ref(true)

const tableColumns = [
  { key: 'employee_name', label: 'Nama Pegawai' },
  { key: 'evaluation_status', label: 'Status Penilaian' },
]

onMounted(async () => {
  await fetchTeam()
})

async function fetchTeam() {
  isLoading.value = true
  try {
    const response = await managerService.getTeamStatus()
    teamMembers.value = response
  } catch (error: any) {
    console.error(error)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data tim', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

// Fungsi Helper untuk URL Gambar
function getProfilePictureUrl(url: string) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080' 
    return `${baseUrl.replace('/api', '')}${url}`
}

async function handleAssess(item: TeamMember) {
  try {
    if (item.evaluation_status === 'draft' && item.evaluation_id) {
       router.push(`/manager/assessment/${item.evaluation_id}`)
    } else {
       const res = await managerService.startEvaluation({ employee_id: item.employee_id })
       
       const evalId = res.evaluation_id || res.data?.evaluation_id
       
       if (evalId) {
         router.push(`/manager/assessment/${evalId}`)
       } else {
         throw new Error("Gagal mendapatkan ID Evaluasi")
       }
    }
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || "Gagal memulai penilaian", life: 3000 })
  }
}

function viewDetail(item: TeamMember) {
  if (item.evaluation_id) {
    router.push(`/manager/assessment/${item.evaluation_id}`)
  }
}
</script>