<template>
  <div class="max-w-4xl mx-auto pb-20">
    
    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p class="text-gray-500">Memuat formulir penilaian...</p>
    </div>

    <div v-else>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 sticky top-4 z-20">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div class="flex items-center">
            <div class="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl mr-4 shadow-md">
              {{ evaluationData.employee_detail.name.charAt(0) }}
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ evaluationData.employee_detail.name }}</h1>
              <p class="text-sm text-gray-500">
                {{ evaluationData.employee_detail.position }} &bull; {{ evaluationData.employee_detail.division_name }}
              </p>
              <div class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                Periode: {{ evaluationData.period_detail.name }}
              </div>
            </div>
          </div>

          <div class="bg-slate-900 text-white rounded-lg p-4 min-w-[180px] text-center shadow-lg">
            <p class="text-xs text-slate-400 uppercase tracking-wider mb-1">Prediksi Nilai Akhir</p>
            <div class="text-3xl font-mono font-bold">{{ calculatedTotal.toFixed(2) }}</div>
            <div class="text-xs font-bold mt-1" :class="getScoreColor(calculatedTotal)">
              Predikat: {{ getGrade(calculatedTotal) }}
            </div>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitAssessment">
        <div class="space-y-6">
          
          <div 
            v-for="(item, index) in form.scores" 
            :key="item.score_id"
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
          >
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 class="font-bold text-gray-800 text-lg">{{ item.indicator_name }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ item.indicator_desc }}</p>
              </div>
              <div class="shrink-0 ml-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  Bobot: {{ item.indicator_weight }}%
                </span>
              </div>
            </div>

            <div class="p-6">
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-3">Berikan Nilai (Skala 1 - 5)</label>
                <div class="flex gap-2 sm:gap-4">
                  <button 
                    v-for="score in 5" 
                    :key="score"
                    type="button"
                    @click="item.score = score"
                    class="flex-1 py-3 rounded-lg border-2 font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    :class="item.score === score 
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105' 
                      : 'border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 bg-white'"
                  >
                    {{ score }}
                  </button>
                </div>
                <div class="flex justify-between mt-2 text-xs text-gray-400 px-1">
                  <span>Sangat Kurang</span>
                  <span>Sangat Baik</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Catatan / Alasan (Opsional)</label>
                <textarea 
                  v-model="item.notes" 
                  rows="2"
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 border"
                  placeholder="Berikan alasan atau contoh perilaku..."
                ></textarea>
              </div>

            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label class="block text-lg font-bold text-gray-800 mb-2">Umpan Balik Keseluruhan (Feedback)</label>
            <p class="text-sm text-gray-500 mb-4">Berikan kesimpulan, apresiasi, atau saran pengembangan untuk pegawai ini.</p>
            <textarea 
              v-model="form.feedback" 
              rows="4"
              required
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3"
              placeholder="Tuliskan umpan balik Anda di sini..."
            ></textarea>
          </div>

        </div>

        <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-30">
          <div class="max-w-4xl mx-auto flex justify-between items-center">
            <button 
              type="button" 
              @click="$router.back()"
              class="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span v-if="isSubmitting">Mengirim...</span>
              <span v-else>Kirim Penilaian</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { managerService } from '../../services/api'

const route = useRoute()
const router = useRouter()
const evaluationId = Number(route.params.id)

const isLoading = ref(true)
const isSubmitting = ref(false)
const evaluationData = ref<any>(null)

// Struktur Form
const form = reactive({
  feedback: '',
  scores: [] as any[]
})

// Load Data
onMounted(async () => {
  try {
    const data = await managerService.getEvaluationDetail(evaluationId)
    evaluationData.value = data
    
    // Mapping data skor dari backend ke form state
    form.feedback = data.evaluation_header.feedback || ''
    form.scores = data.scores.map((s: any) => ({
      score_id: s.id,
      indicator_name: s.indicator.name,
      indicator_desc: s.indicator.description,
      indicator_weight: s.indicator.weight,
      score: s.score || 0, // Default 0 jika belum dinilai
      notes: s.notes || ''
    }))
  } catch (error) {
    alert('Gagal memuat data evaluasi')
    router.back()
  } finally {
    isLoading.value = false
  }
})

// --- Computed: Hitung Total Skor Real-time ---
const calculatedTotal = computed(() => {
  if (!form.scores.length) return 0
  
  return form.scores.reduce((total, item) => {
    // Rumus: (Skor 1-5 dikali 20 untuk jadi 100) * (Bobot / 100)
    const convertedScore = item.score * 20
    const weightedScore = convertedScore * (item.indicator_weight / 100)
    return total + weightedScore
  }, 0)
})

// Helper Predikat
function getGrade(score: number) {
  if (score >= 86) return 'A (Sangat Baik)'
  if (score >= 71) return 'B (Baik)'
  if (score >= 56) return 'C (Cukup)'
  if (score >= 41) return 'D (Kurang)'
  return 'E (Sangat Kurang)'
}

function getScoreColor(score: number) {
  if (score >= 86) return 'text-green-400'
  if (score >= 71) return 'text-blue-400'
  if (score >= 56) return 'text-yellow-400'
  return 'text-red-400'
}

// Submit Logic
async function submitAssessment() {
  // Validasi: Pastikan semua indikator sudah dinilai (score > 0)
  const unrated = form.scores.find(s => s.score === 0)
  if (unrated) {
    alert(`Mohon berikan nilai untuk indikator: "${unrated.indicator_name}"`)
    return
  }

  if (!confirm('Apakah Anda yakin ingin mengirim penilaian ini? Data tidak dapat diubah setelah dikirim.')) {
    return
  }

  try {
    isSubmitting.value = true
    
    // Siapkan payload sesuai format backend
    const payload = {
      feedback: form.feedback,
      scores: form.scores.map(s => ({
        score_id: s.score_id,
        score: s.score,
        notes: s.notes
      }))
    }

    await managerService.submitEvaluation(evaluationId, payload)
    alert('Penilaian berhasil dikirim!')
    router.push('/manager/team')
    
  } catch (error: any) {
    alert(error.response?.data?.message || 'Gagal mengirim penilaian')
  } finally {
    isSubmitting.value = false
  }
}
</script>
