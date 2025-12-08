<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Kinerja Saya</h1>
      <p class="text-gray-600 text-sm mt-1">Riwayat penilaian kinerja yang telah diselesaikan.</p>
    </div>

    <DataTable :columns="tableColumns" :data="history" :loading="isLoading">
      <template #period_name="{ item }">
        <span class="font-bold text-gray-900">{{ item.period_name || '-' }}</span>
      </template>
      <template #submitted_at="{ value }">
        {{ formatDate(value) }}
      </template>
      <template #total_score="{ value }">
        <span class="font-mono font-bold text-lg">{{ value.toFixed(2) }}</span>
      </template>
      <template #grade="{ item }">
        <span class="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full border"
          :class="getGradeColor(item.total_score)">
          {{ getGrade(item.total_score) }}
        </span>
      </template>
      <template #actions="{ item }">
        <button 
          @click="$router.push(`/employee/evaluation/${item.id}`)" 
          class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center transition-colors"
        >
          Lihat Detail
        </button>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { myPerformanceService } from '../../services/api'
import DataTable from '../../components/ui/DataTable.vue'

// FIX: Gunakan ref<any[]>
const history = ref<any[]>([]) 
const isLoading = ref(true)

const tableColumns = [
  { key: 'period_name', label: 'Periode Evaluasi' },
  { key: 'submitted_at', label: 'Tanggal Dinilai' },
  { key: 'total_score', label: 'Skor Akhir' },
  { key: 'grade', label: 'Predikat' },
]

onMounted(async () => {
  try {
    isLoading.value = true
    history.value = await myPerformanceService.getHistory()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(dateString))
}

function getGrade(score: number) {
  if (score >= 86) return 'A'
  if (score >= 71) return 'B'
  if (score >= 56) return 'C'
  if (score >= 41) return 'D'
  return 'E'
}

function getGradeColor(score: number) {
  if (score >= 86) return 'bg-green-100 text-green-800 border-green-200'
  if (score >= 71) return 'bg-blue-100 text-blue-800 border-blue-200'
  if (score >= 56) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-red-100 text-red-800 border-red-200'
}
</script>
