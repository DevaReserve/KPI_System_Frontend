<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Target KPI Saya</h1>
        <p class="text-gray-500 text-sm mt-1">Daftar target yang harus dicapai pada periode evaluasi.</p>
      </div>

      <div class="w-full md:w-64">
        <label class="block text-xs font-medium text-gray-500 mb-1">Pilih Periode</label>
        <select v-model="selectedPeriodId" @change="loadMyTargets" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none">
          <option v-for="p in periods" :key="p.id" :value="p.id">
            {{ p.name }} {{ p.is_active ? '(Aktif)' : '' }}
          </option>
          <option value="" v-if="periods.length === 0">Tidak ada periode</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-20">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
      <p class="text-sm text-gray-500 mt-3">Memuat target KPI...</p>
    </div>

    <div v-else-if="targets.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 class="font-bold text-gray-700">Daftar Indikator & Target</h3>
        <span class="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
          Total: {{ targets.length }} Indikator
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-white">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">No</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Indikator</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Bobot</th>
              <th class="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-32">Target Skor</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Catatan Tambahan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(t, idx) in targets" :key="t.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm text-gray-500">{{ idx + 1 }}</td>
              <td class="px-6 py-4">
                <div class="font-bold text-gray-800">{{ t.indicator_name || 'Indikator Dihapus' }}</div>
              </td>
              <td class="px-6 py-4">
                <span :class="t.indicator_type === 'umum' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'" class="px-2 py-1 rounded text-xs font-semibold uppercase">
                  {{ t.indicator_type || '-' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 font-medium">
                {{ t.indicator_weight ? t.indicator_weight + '%' : '-' }}
              </td>
              <td class="px-6 py-4 text-center">
                <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-lg">
                  {{ t.target_score }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 italic">
                {{ t.notes || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-target text-3xl text-gray-400"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-800 mb-2">Belum Ada Target KPI</h3>
      <p class="text-gray-500 text-sm max-w-md mx-auto">
        Target Anda untuk periode ini belum ditetapkan oleh atasan. Anda akan menerima target jika atasan telah menyimpannya.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { periodService, kpiTargetService } from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const periods = ref<any[]>([])
const selectedPeriodId = ref<number | ''>('')
const targets = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const p = await periodService.getAll()
    periods.value = p
    const active = p.find((x: any) => x.is_active)
    if (active) {
      selectedPeriodId.value = active.id
    } else if (p.length > 0) {
      selectedPeriodId.value = p[0].id
    }
    
    if (selectedPeriodId.value) {
      await loadMyTargets()
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

async function loadMyTargets() {
  if (!selectedPeriodId.value) return
  isLoading.value = true
  try {
    const targetsData = await kpiTargetService.getMyTargets(Number(selectedPeriodId.value))
    targets.value = targetsData || []
  } catch (e) {
    console.error(e)
    targets.value = []
  } finally {
    isLoading.value = false
  }
}
</script>
