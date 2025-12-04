<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Tim Saya</h1>
      <p class="text-gray-600 text-sm mt-1">Daftar pegawai di bawah supervisi Anda. Silakan lakukan penilaian untuk periode aktif.</p>
    </div>

    <DataTable :columns="tableColumns" :data="teamMembers" :loading="isLoading">
      
      <template #employee_name="{ item }">
        <div class="flex items-center">
          <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm mr-3">
            {{ item.employee_name.charAt(0) }}
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
          Draft (Belum Submit)
        </span>
        <span v-else class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
          Belum Dinilai
        </span>
      </template>

      <template #actions="{ item }">
        
        <button 
          v-if="item.evaluation_status === 'submitted'"
          class="text-gray-400 cursor-not-allowed font-medium text-sm flex items-center"
          disabled
        >
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Selesai
        </button>

        <button 
          v-else
          @click="handleAssess(item)" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {{ item.evaluation_status === 'draft' ? 'Lanjutkan Penilaian' : 'Mulai Penilaian' }}
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

// 1. Definisikan Tipe Data untuk Anggota Tim (Biar TS tidak error)
interface TeamMember {
  employee_id: number
  employee_name: string
  evaluation_id?: number | null
  evaluation_status: string // "draft", "submitted", atau "not_started"
}

const router = useRouter()

// 2. Gunakan Generic Type pada ref
// Artinya: "Variabel ini adalah array yang berisi objek TeamMember"
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
    // 3. Sekarang TypeScript tahu bahwa data yang masuk sesuai dengan tipe TeamMember[]
    const response = await managerService.getTeamStatus()
    teamMembers.value = response
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
        alert("Peringatan: " + error.response.data.message)
    } else {
        console.error(error)
    }
  } finally {
    isLoading.value = false
  }
}

async function handleAssess(item: TeamMember) {
  try {
    if (item.evaluation_status !== 'draft' && item.evaluation_status !== 'submitted') {
        const res = await managerService.startEvaluation(item.employee_id)
        router.push(`/manager/assessment/${res.evaluation_id}`)
    } else {
        // Karena evaluation_id bisa null, kita pastikan ada nilainya sebelum push
        if (item.evaluation_id) {
            router.push(`/manager/assessment/${item.evaluation_id}`)
        } else {
            alert("Terjadi kesalahan data evaluasi")
        }
    }
  } catch (error: any) {
    alert(error.response?.data?.message || "Gagal memulai penilaian")
  }
}
</script>
