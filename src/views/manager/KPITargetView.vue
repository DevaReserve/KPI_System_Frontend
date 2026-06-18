<template>
  <div>
    <Toast />

    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Penetapan Target KPI</h1>
      <p class="text-gray-500 text-sm mt-1">Tetapkan target KPI untuk anggota tim di awal periode evaluasi.</p>
    </div>

    <!-- Step 1: Pilih Periode & Pegawai -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 class="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Langkah 1 — Pilih Periode & Pegawai</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Periode Evaluasi <span class="text-red-500">*</span></label>
          <select v-model="selectedPeriodId" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="">-- Pilih Periode --</option>
            <option v-for="p in periods" :key="p.id" :value="p.id">
              {{ p.name }} {{ p.is_active ? '(Aktif)' : '' }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mode Penetapan</label>
          <select v-model="targetMode" @change="resetSelection" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="individual">Individu (Pilih Pegawai)</option>
            <option value="division">Massal (Pilih Divisi)</option>
          </select>
        </div>
        <div v-if="targetMode === 'individual'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Pegawai <span class="text-red-500">*</span></label>
          <select v-model="selectedEmployeeId" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="">-- Pilih Pegawai --</option>
            <option v-for="m in teamMembers" :key="m.id" :value="m.id">
              {{ m.name }}
            </option>
          </select>
        </div>
        <div v-if="targetMode === 'division'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Divisi <span class="text-red-500">*</span></label>
          <select v-model="selectedDivisionId" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="">-- Pilih Divisi --</option>
            <option v-for="d in managerDivisions" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
        </div>
      </div>
      <button
        @click="loadTargetForm"
        :disabled="!selectedPeriodId || (targetMode === 'individual' && !selectedEmployeeId) || (targetMode === 'division' && !selectedDivisionId) || isLoadingForm"
        class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition flex items-center gap-2"
      >
        <i class="pi pi-spin pi-spinner" v-if="isLoadingForm"></i>
        <i class="pi pi-arrow-right" v-else></i>
        Muat Indikator
      </button>
    </div>

    <!-- Step 2: Form Target -->
    <div v-if="indicators.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide">Langkah 2 — Tetapkan Target per Indikator</h2>
          <p class="text-xs text-gray-400 mt-0.5">Skala 1–5 (1=Sangat Buruk, 3=Cukup, 5=Sangat Baik)</p>
        </div>
        <div class="text-right text-xs text-gray-400">
          {{ indicators.length }} Indikator
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="ind in indicators" :key="ind.id" class="p-4 rounded-xl border border-gray-100 bg-gray-50">
          <div class="flex flex-col md:flex-row md:items-center gap-3">
            <!-- Indicator Info -->
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-gray-900 text-sm">{{ ind.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                  :class="ind.indicator_type === 'umum' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">
                  {{ ind.indicator_type === 'umum' ? 'Umum' : 'Spesifik' }}
                </span>
                <span class="text-xs text-gray-500">(Bobot: {{ ind.weight }}%)</span>
              </div>
              <p v-if="ind.description" class="text-xs text-gray-400 mt-0.5">{{ ind.description }}</p>
            </div>

            <!-- Target Score Selector -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 whitespace-nowrap">Target:</span>
              <div class="flex gap-1">
                <button
                  v-for="n in [1,2,3,4,5]"
                  :key="n"
                  @click="setTarget(ind.id, n)"
                  class="w-9 h-9 rounded-lg text-sm font-extrabold border-2 transition-all"
                  :class="targetMap[ind.id] === n
                    ? getScoreButtonActive(n)
                    : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white'"
                >{{ n }}</button>
              </div>
            </div>

            <!-- Notes -->
            <div class="w-full md:w-48">
              <input
                v-model="notesMap[ind.id]"
                type="text"
                placeholder="Catatan (opsional)..."
                class="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-400 outline-none bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Summary + Submit -->
      <div class="mt-6 pt-4 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="text-sm text-gray-500">
          <span class="font-bold text-blue-600">{{ Object.values(targetMap).filter(v => v > 0).length }}</span> dari 
          <span class="font-bold">{{ indicators.length }}</span> indikator sudah diset.
          <span v-if="Object.values(targetMap).filter(v => v > 0).length < indicators.length" class="text-orange-500 ml-1">
            (Lengkapi semua indikator)
          </span>
        </div>
        <div class="flex gap-3">
          <button @click="resetForm" class="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            Reset
          </button>
          <button
            @click="submitTargets"
            :disabled="isSubmitting || !allTargetsSet"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
          >
            <i class="pi pi-spin pi-spinner" v-if="isSubmitting"></i>
            <i class="pi pi-check" v-else></i>
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Semua Target' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Existing Targets Preview -->
    <div v-if="existingTargets.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
      <h2 class="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
        <i class="pi pi-history text-blue-500"></i>
        {{ targetMode === 'individual' ? 'Target yang Sudah Tersimpan' : 'Preview Indikator Divisi' }}
      </h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="pb-2 text-left text-xs font-bold text-gray-500 uppercase">Indikator</th>
              <th class="pb-2 text-center text-xs font-bold text-gray-500 uppercase">Target</th>
              <th class="pb-2 text-left text-xs font-bold text-gray-500 uppercase">Catatan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="t in existingTargets" :key="t.indicator_id" class="hover:bg-gray-50">
              <td class="py-2 text-sm font-semibold text-gray-800">{{ t.indicator_name }}</td>
              <td class="py-2 text-center">
                <span class="px-3 py-1 rounded-full text-xs font-extrabold" :class="getScoreLabel(t.target_score).class">
                  {{ t.target_score }} — {{ getScoreLabel(t.target_score).text }}
                </span>
              </td>
              <td class="py-2 text-xs text-gray-400">{{ t.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { kpiTargetService, managerService, periodService } from '../../services/api'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'

const toast = useToast()

const periods = ref<any[]>([])
const teamMembers = ref<any[]>([])
const indicators = ref<any[]>([])
const existingTargets = ref<any[]>([])

const selectedPeriodId = ref<any>('')
const selectedEmployeeId = ref<any>('')
const selectedDivisionId = ref<any>('')
const targetMode = ref<'individual' | 'division'>('individual')
const targetMap = ref<Record<number, number>>({})
const notesMap = ref<Record<number, string>>({})

const isLoadingForm = ref(false)
const isSubmitting = ref(false)

const managerDivisions = computed(() => {
  const divisions = new Map()
  teamMembers.value.forEach(m => {
    if (m.division_id && m.division_name) {
      divisions.set(m.division_id, m.division_name) 
    }
  })
  return Array.from(divisions.entries()).map(([id, name]) => ({ id, name }))
})

const allTargetsSet = computed(() =>
  indicators.value.length > 0 &&
  indicators.value.every(ind => (targetMap.value[ind.id] ?? 0) > 0)
)

onMounted(async () => {
  try {
    const [perds, team] = await Promise.all([
      periodService.getAll(),
      managerService.getMyTeam()
    ])
    periods.value = perds
    teamMembers.value = team

    // Set default ke periode aktif
    const active = perds.find((p: any) => p.is_active)
    if (active) selectedPeriodId.value = active.id
  } catch (e) {
    console.error(e)
  }
})

async function loadTargetForm() {
  if (!selectedPeriodId.value) return
  if (targetMode.value === 'individual' && !selectedEmployeeId.value) return
  if (targetMode.value === 'division' && !selectedDivisionId.value) return

  isLoadingForm.value = true
  try {
    targetMap.value = {}
    notesMap.value = {}
    existingTargets.value = []

    if (targetMode.value === 'individual') {
      const [inds, existing] = await Promise.all([
        kpiTargetService.getIndicatorsForTarget(selectedEmployeeId.value),
        kpiTargetService.getTargets(selectedEmployeeId.value, selectedPeriodId.value)
      ])
      indicators.value = inds
      existingTargets.value = existing

      existing.forEach((t: any) => {
        targetMap.value[t.indicator_id] = t.target_score
        notesMap.value[t.indicator_id] = t.notes || ''
      })
    } else {
      // Division mode
      const inds = await kpiTargetService.getIndicatorsForDivision(selectedDivisionId.value)
      indicators.value = inds
      // Biarkan existingTargets kosong, manager buat target baru massal
    }
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat indikator', life: 3000 })
  } finally {
    isLoadingForm.value = false
  }
}

function setTarget(indicatorId: number, score: number) {
  targetMap.value = { ...targetMap.value, [indicatorId]: score }
}

function resetForm() {
  targetMap.value = {}
  notesMap.value = {}
}

function resetSelection() {
  selectedEmployeeId.value = ''
  selectedDivisionId.value = ''
  indicators.value = []
  existingTargets.value = []
  resetForm()
}

async function submitTargets() {
  isSubmitting.value = true
  try {
    const targets = indicators.value.map(ind => ({
      indicator_id: ind.id,
      target_score: targetMap.value[ind.id] || 3,
      notes: notesMap.value[ind.id] || ''
    }))

    if (targetMode.value === 'individual') {
      await kpiTargetService.setTargetsBulk({
        employee_id: Number(selectedEmployeeId.value),
        period_id: Number(selectedPeriodId.value),
        targets
      })
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Target individu berhasil disimpan!', life: 3000 })
      existingTargets.value = await kpiTargetService.getTargets(selectedEmployeeId.value, selectedPeriodId.value)
    } else {
      await kpiTargetService.setTargetsDivision({
        division_id: Number(selectedDivisionId.value),
        period_id: Number(selectedPeriodId.value),
        targets
      })
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Target massal divisi berhasil disimpan!', life: 3000 })
      resetSelection()
    }
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: e.response?.data?.message || 'Gagal menyimpan target', life: 3000 })
  } finally {
    isSubmitting.value = false
  }
}

function getScoreButtonActive(n: number) {
  switch (n) {
    case 1: return 'border-red-500 bg-red-50 text-red-700'
    case 2: return 'border-orange-400 bg-orange-50 text-orange-700'
    case 3: return 'border-yellow-400 bg-yellow-50 text-yellow-700'
    case 4: return 'border-blue-500 bg-blue-50 text-blue-700'
    case 5: return 'border-green-500 bg-green-50 text-green-700'
    default: return ''
  }
}

function getScoreLabel(score: number) {
  switch (score) {
    case 1: return { text: 'Sangat Kurang', class: 'bg-red-100 text-red-700' }
    case 2: return { text: 'Kurang', class: 'bg-orange-100 text-orange-700' }
    case 3: return { text: 'Cukup', class: 'bg-yellow-100 text-yellow-700' }
    case 4: return { text: 'Baik', class: 'bg-blue-100 text-blue-700' }
    case 5: return { text: 'Sangat Baik', class: 'bg-green-100 text-green-700' }
    default: return { text: '-', class: 'bg-gray-100 text-gray-500' }
  }
}
</script>
