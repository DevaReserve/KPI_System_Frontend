<template>
  <div class="max-w-4xl mx-auto pb-10">
    <div class="mb-6">
      <button @click="$router.back()" class="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium transition-colors">
        Kembali
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="data">
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg text-white p-8 mb-8">
        <h1 class="text-3xl font-bold mb-1">{{ getGrade(data.evaluation_header.total_score) }}</h1>
        <p class="text-blue-100 text-lg">Skor Akhir: {{ data.evaluation_header.total_score.toFixed(2) }}</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 class="text-lg font-bold text-gray-800 mb-3">Umpan Balik</h3>
        <div class="bg-gray-50 p-4 rounded-lg text-gray-700 italic border-l-4 border-orange-400">
          "{{ data.evaluation_header.feedback || 'Tidak ada catatan.' }}"
        </div>
      </div>

      <h3 class="text-lg font-bold text-gray-800 mb-4">Rincian Penilaian</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="score in data.scores" :key="score.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-bold text-gray-900">{{ score.indicator.name }}</h4>
            <span class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{{ score.indicator.weight }}%</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-600">Nilai:</span>
            <span class="text-xl font-bold text-blue-600">{{ score.score }} <span class="text-xs text-gray-400">/ 5</span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { myPerformanceService } from '../../services/api'

const route = useRoute()
const data = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    data.value = await myPerformanceService.getDetail(id)
  } catch (error) {
    alert('Gagal memuat detail')
  } finally {
    isLoading.value = false
  }
})

function getGrade(score: number) {
  if (score >= 86) return 'A'
  if (score >= 71) return 'B'
  if (score >= 56) return 'C'
  if (score >= 41) return 'D'
  return 'E'
}
</script>
