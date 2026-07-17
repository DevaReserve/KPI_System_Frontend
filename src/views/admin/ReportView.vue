<template>
  <div>
    <Toast />

    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Laporan & Rekapitulasi</h1>
      <p class="text-gray-600 text-sm mt-1">Analisis mendalam, export laporan, dan komparasi antar periode.</p>
    </div>

    <!-- Tab Navigation -->
    <div class="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
        :class="activeTab === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <i :class="tab.icon + ' mr-1'"></i>{{ tab.label }}
      </button>
    </div>

    <!-- ======================= TAB 1: LAPORAN PERIODE ======================= -->
    <template v-if="activeTab === 'report'">
      <!-- Filter Bar -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-4 flex flex-col gap-4">
        <div class="flex flex-col md:flex-row md:items-end gap-4">
          <div class="w-full md:max-w-xs">
            <label class="block text-sm font-medium text-gray-700 mb-1">Periode Evaluasi</label>
            <select v-model="selectedPeriodId" class="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none text-sm">
              <option value="" disabled>-- Pilih Periode --</option>
              <option v-for="p in periods" :key="p.id" :value="p.id">
                {{ p.name }} {{ p.is_active ? '(Aktif)' : '' }}
              </option>
            </select>
          </div>

          <div class="flex gap-2 flex-wrap">
            <button @click="fetchReport" :disabled="!selectedPeriodId || isLoading"
              class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2 shadow-sm transition">
              <i class="pi pi-sync" :class="{ 'pi-spin': isLoading }"></i>
              {{ isLoading ? 'Memuat...' : 'Tampilkan' }}
            </button>
            <button v-if="reportData.length > 0" @click="exportToPDF"
              class="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition">
              <i class="pi pi-file-pdf"></i> Export PDF
            </button>
            <button v-if="reportData.length > 0" @click="exportToExcel"
              class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition">
              <i class="pi pi-file-excel"></i> Export CSV
            </button>
          </div>
        </div>

        <!-- Advanced Filters (muncul jika ada data) -->
        <div v-if="reportData.length > 0" class="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
          <!-- Search -->
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input v-model="searchQuery" type="text" placeholder="Cari nama / NIP..."
              class="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none w-52" />
          </div>

          <!-- Filter Grade -->
          <div class="flex items-center gap-1">
            <span class="text-xs font-semibold text-gray-500 mr-1">Grade:</span>
            <button v-for="g in ['A','B','C','D','E']" :key="g"
              @click="toggleGradeFilter(g)"
              class="w-7 h-7 rounded-md text-xs font-extrabold border transition-all"
              :class="selectedGrades.includes(g) ? getGradeActiveClass(g) : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'"
            >{{ g }}</button>
            <button v-if="selectedGrades.length" @click="selectedGrades = []" class="text-xs text-gray-400 hover:text-gray-600 ml-1">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Filter Skor Range -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-gray-500">Skor:</span>
            <input v-model.number="minScore" type="number" min="0" max="100" placeholder="Min"
              class="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-400 outline-none text-center" />
            <span class="text-gray-400">–</span>
            <input v-model.number="maxScore" type="number" min="0" max="100" placeholder="Max"
              class="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-400 outline-none text-center" />
          </div>

          <!-- Result Count -->
          <div class="ml-auto text-sm text-gray-500 self-center">
            Menampilkan <span class="font-bold text-blue-600">{{ filteredReport.length }}</span> dari {{ reportData.length }}
          </div>
        </div>
      </div>

      <!-- Summary Stats (muncul jika ada data) -->
      <div v-if="reportData.length > 0" class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div v-for="grade in ['A','B','C','D','E']" :key="grade"
          class="bg-white rounded-xl p-3 border text-center cursor-pointer transition-all hover:shadow-md"
          :class="[getGradeBorderClass(grade), selectedGrades.includes(grade) ? 'ring-2 ' + getRingClass(grade) : '']"
          @click="toggleGradeFilter(grade)"
        >
          <div class="text-2xl font-extrabold" :class="getGradeTextClass(grade)">{{ gradeCount[grade] || 0 }}</div>
          <div class="text-xs font-bold mt-0.5" :class="getGradeTextClass(grade)">Grade {{ grade }}</div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" v-if="hasSearched || reportData.length > 0">
        <DataTable :value="filteredReport" :paginator="true" :rows="15" :rowsPerPageOptions="[10, 15, 25, 50]"
          :loading="isLoading" dataKey="nip" stripedRows responsiveLayout="scroll" removableSort>
          <template #empty>
            <div class="text-center p-8 text-gray-400">
              <i class="pi pi-folder-open text-4xl mb-2 block"></i>
              <p>Tidak ada data yang cocok dengan filter.</p>
            </div>
          </template>

          <Column field="nip" header="NIP" sortable style="width: 120px">
            <template #body="{ data }"><span class="font-mono text-sm text-gray-600">{{ data.nip }}</span></template>
          </Column>
          <Column field="employee_name" header="Nama Pegawai" sortable style="min-width: 180px">
            <template #body="{ data }"><span class="font-bold text-gray-900">{{ data.employee_name }}</span></template>
          </Column>
          <Column field="division" header="Divisi" sortable style="min-width: 130px">
            <template #body="{ data }"><span class="text-gray-700 text-sm">{{ data.division }}</span></template>
          </Column>
          <Column field="position" header="Jabatan" sortable style="min-width: 130px">
            <template #body="{ data }"><span class="text-gray-700 text-sm">{{ data.position }}</span></template>
          </Column>
          <Column field="total_score" header="Skor" sortable style="width: 100px">
            <template #body="{ data }">
              <span class="font-bold text-lg" :class="getScoreColor(data.total_score)">{{ data.total_score.toFixed(2) }}</span>
            </template>
          </Column>
          <Column field="grade" header="Grade" sortable style="width: 90px">
            <template #body="{ data }">
              <span class="px-2.5 py-1 rounded-full text-xs font-extrabold border" :class="getGradeBadge(data.grade)">{{ data.grade }}</span>
            </template>
          </Column>
        </DataTable>
      </div>

      <div v-else class="text-center py-14 bg-white rounded-xl border border-dashed border-gray-200">
        <i class="pi pi-chart-bar text-5xl text-gray-300 mb-3 block"></i>
        <p class="text-gray-500">Pilih periode dan klik "Tampilkan" untuk memuat data laporan.</p>
      </div>
    </template>

    <!-- ======================= TAB 2: KOMPARASI PERIODE ======================= -->
    <template v-if="activeTab === 'compare'">
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-4">
        <h2 class="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Pilih 2 Periode untuk Dibandingkan</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <span class="w-5 h-5 bg-blue-600 text-white rounded text-xs font-bold inline-flex items-center justify-center mr-1">A</span>
              Periode Acuan
            </label>
            <select v-model="comparePeriodA" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none">
              <option value="">-- Pilih Periode A --</option>
              <option v-for="p in periods" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <span class="w-5 h-5 bg-indigo-600 text-white rounded text-xs font-bold inline-flex items-center justify-center mr-1">B</span>
              Periode Pembanding
            </label>
            <select v-model="comparePeriodB" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none">
              <option value="">-- Pilih Periode B --</option>
              <option v-for="p in periods" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <button @click="fetchComparison" :disabled="!comparePeriodA || !comparePeriodB || isComparing"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2 shadow-sm transition">
            <i class="pi pi-spin pi-spinner" v-if="isComparing"></i>
            <i class="pi pi-chart-bar" v-else></i>
            {{ isComparing ? 'Memuat...' : 'Bandingkan' }}
          </button>
        </div>
        <div v-if="comparisonData.length > 0" class="flex justify-end mt-3">
          <button @click="exportComparisonPDF"
            class="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition">
            <i class="pi pi-file-pdf"></i> Export PDF
          </button>
        </div>
      </div>

      <!-- Comparison Summary Cards -->
      <div v-if="comparisonData.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div class="text-2xl font-extrabold text-green-700">{{ comparisonSummary.naik }}</div>
          <div class="text-xs font-bold text-green-600 mt-0.5 flex items-center justify-center gap-1">
            <i class="pi pi-arrow-up"></i> Meningkat
          </div>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div class="text-2xl font-extrabold text-red-700">{{ comparisonSummary.turun }}</div>
          <div class="text-xs font-bold text-red-600 mt-0.5 flex items-center justify-center gap-1">
            <i class="pi pi-arrow-down"></i> Menurun
          </div>
        </div>
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div class="text-2xl font-extrabold text-gray-700">{{ comparisonSummary.tetap }}</div>
          <div class="text-xs font-bold text-gray-500 mt-0.5">Tetap</div>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div class="text-2xl font-extrabold text-blue-700">{{ comparisonSummary.baru }}</div>
          <div class="text-xs font-bold text-blue-600 mt-0.5">Pegawai Baru</div>
        </div>
      </div>

      <!-- Comparison Table -->
      <div v-if="comparisonData.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Search bar untuk compare -->
        <div class="p-4 border-b border-gray-100 flex items-center gap-3">
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input v-model="compareSearch" type="text" placeholder="Cari nama..."
              class="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none w-52" />
          </div>
          <div class="flex gap-1 ml-2">
            <button v-for="trend in ['semua','naik','turun','tetap','baru']" :key="trend"
              @click="trendFilter = trend"
              class="px-3 py-1 rounded-full text-xs font-semibold transition-all border"
              :class="trendFilter === trend ? getTrendActiveClass(trend) : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'"
            >{{ trend.charAt(0).toUpperCase() + trend.slice(1) }}</button>
          </div>
        </div>

        <DataTable :value="filteredComparison" :paginator="true" :rows="15" :rowsPerPageOptions="[10,15,25,50]"
          stripedRows responsiveLayout="scroll" removableSort>
          <template #empty>
            <div class="text-center p-8 text-gray-400">Tidak ada data yang cocok.</div>
          </template>

          <Column field="employee_name" header="Nama Pegawai" sortable style="min-width: 180px">
            <template #body="{ data }">
              <div class="font-bold text-gray-900 text-sm">{{ data.employee_name }}</div>
              <div class="text-xs text-gray-400">{{ data.division }}</div>
            </template>
          </Column>

          <Column header="Periode Acuan" style="width: 200px">
            <template #body="{ data }">
              <span class="font-bold" :class="getScoreColor(data.score_a)">{{ data.score_a > 0 ? data.score_a.toFixed(2) : '-' }}</span>
              <span class="ml-1 text-xs px-1.5 rounded border" :class="getGradeBadge(data.grade_a)">{{ data.grade_a }}</span>
            </template>
          </Column>

          <Column header="Periode Pembanding" style="width: 200px">
            <template #body="{ data }">
              <span class="font-bold" :class="getScoreColor(data.score_b)">{{ data.score_b > 0 ? data.score_b.toFixed(2) : '-' }}</span>
              <span class="ml-1 text-xs px-1.5 rounded border" :class="getGradeBadge(data.grade_b)">{{ data.grade_b }}</span>
            </template>
          </Column>

          <Column field="delta" header="Selisih" sortable style="width: 100px">
            <template #body="{ data }">
              <span class="font-extrabold text-sm"
                :class="data.delta > 0.5 ? 'text-green-600' : data.delta < -0.5 ? 'text-red-600' : 'text-gray-400'">
                {{ data.delta > 0 ? '+' : '' }}{{ data.delta.toFixed(2) }}
              </span>
            </template>
          </Column>

          <Column field="trend" header="Tren" sortable style="width: 110px">
            <template #body="{ data }">
              <span class="px-2.5 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1 w-fit"
                :class="getTrendBadge(data.trend)">
                <i :class="getTrendIcon(data.trend)"></i>
                {{ data.trend.charAt(0).toUpperCase() + data.trend.slice(1) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>

      <div v-else-if="!isComparing" class="text-center py-14 bg-white rounded-xl border border-dashed border-gray-200">
        <i class="pi pi-arrow-right-arrow-left text-5xl text-gray-300 mb-3 block"></i>
        <p class="text-gray-500">Pilih dua periode dan klik "Bandingkan" untuk melihat perubahan kinerja.</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref } from 'vue'
import { periodService, reportService } from '../../services/api'

const toast = useToast()

// Tabs
const tabs = [
  { id: 'report', label: 'Laporan Periode', icon: 'pi pi-file' },
  { id: 'compare', label: 'Komparasi Periode', icon: 'pi pi-arrow-right-arrow-left' }
]
const activeTab = ref('report')

// Report Tab State
const periods = ref<any[]>([])
const selectedPeriodId = ref('')
const reportData = ref<any[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)
const searchQuery = ref('')
const selectedGrades = ref<string[]>([])
const minScore = ref<number | null>(null)
const maxScore = ref<number | null>(null)

// Comparison Tab State
const comparePeriodA = ref('')
const comparePeriodB = ref('')
const comparisonData = ref<any[]>([])
const isComparing = ref(false)
const trendFilter = ref('semua')
const compareSearch = ref('')

// ---- Computed ----
const filteredReport = computed(() => {
  let data = reportData.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    data = data.filter(r => r.employee_name?.toLowerCase().includes(q) || r.nip?.includes(q))
  }
  if (selectedGrades.value.length) {
    data = data.filter(r => selectedGrades.value.includes(r.grade))
  }
  if (minScore.value !== null) {
    data = data.filter(r => r.total_score >= (minScore.value ?? 0))
  }
  if (maxScore.value !== null) {
    data = data.filter(r => r.total_score <= (maxScore.value ?? 100))
  }
  return data
})

const gradeCount = computed(() => {
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 }
  reportData.value.forEach(r => { if (counts[r.grade] !== undefined) counts[r.grade]++ })
  return counts
})

const filteredComparison = computed(() => {
  let data = comparisonData.value
  if (trendFilter.value !== 'semua') data = data.filter(r => r.trend === trendFilter.value)
  if (compareSearch.value.trim()) {
    const q = compareSearch.value.toLowerCase()
    data = data.filter(r => r.employee_name?.toLowerCase().includes(q))
  }
  return data
})

const comparisonSummary = computed(() => ({
  naik: comparisonData.value.filter(r => r.trend === 'naik').length,
  turun: comparisonData.value.filter(r => r.trend === 'turun').length,
  tetap: comparisonData.value.filter(r => r.trend === 'tetap').length,
  baru: comparisonData.value.filter(r => r.trend === 'baru').length
}))

// ---- Lifecycle ----
onMounted(async () => {
  try {
    periods.value = await periodService.getAll()
    const active = periods.value.find((p: any) => p.is_active)
    if (active) selectedPeriodId.value = active.id
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat periode', life: 3000 })
  }
})

// ---- Actions ----
async function fetchReport() {
  if (!selectedPeriodId.value) return
  isLoading.value = true
  hasSearched.value = true
  selectedGrades.value = []
  searchQuery.value = ''
  minScore.value = null
  maxScore.value = null
  try {
    reportData.value = await reportService.getEvaluationReport(Number(selectedPeriodId.value)) || []
    if (reportData.value.length > 0) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: `${reportData.value.length} data dimuat`, life: 2000 })
    } else {
      toast.add({ severity: 'info', summary: 'Info', detail: 'Tidak ada data penilaian untuk periode ini', life: 3000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengambil laporan', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

async function fetchComparison() {
  if (!comparePeriodA.value || !comparePeriodB.value) return
  if (comparePeriodA.value === comparePeriodB.value) {
    toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Pilih dua periode yang berbeda', life: 3000 })
    return
  }
  isComparing.value = true
  try {
    comparisonData.value = await reportService.getPeriodComparison(Number(comparePeriodA.value), Number(comparePeriodB.value)) || []
    toast.add({ severity: 'success', summary: 'Berhasil', detail: `${comparisonData.value.length} pegawai dibandingkan`, life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat komparasi', life: 3000 })
  } finally {
    isComparing.value = false
  }
}

function toggleGradeFilter(grade: string) {
  if (selectedGrades.value.includes(grade)) {
    selectedGrades.value = selectedGrades.value.filter(g => g !== grade)
  } else {
    selectedGrades.value = [...selectedGrades.value, grade]
  }
}

// ---- Helpers ----
function getScoreColor(score: number) {
  if (score >= 86) return 'text-green-600'
  if (score >= 71) return 'text-blue-600'
  if (score >= 56) return 'text-yellow-600'
  return 'text-red-600'
}

function getGradeBadge(grade: string) {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800 border-green-200'
    case 'B': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'D': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'E': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getGradeActiveClass(g: string) {
  switch (g) {
    case 'A': return 'border-green-500 bg-green-500 text-white'
    case 'B': return 'border-blue-500 bg-blue-500 text-white'
    case 'C': return 'border-yellow-400 bg-yellow-400 text-white'
    case 'D': return 'border-orange-500 bg-orange-500 text-white'
    case 'E': return 'border-red-500 bg-red-500 text-white'
    default: return ''
  }
}

function getGradeBorderClass(g: string) {
  switch (g) {
    case 'A': return 'border-green-200'
    case 'B': return 'border-blue-200'
    case 'C': return 'border-yellow-200'
    case 'D': return 'border-orange-200'
    case 'E': return 'border-red-200'
    default: return 'border-gray-200'
  }
}

function getGradeTextClass(g: string) {
  switch (g) {
    case 'A': return 'text-green-600'
    case 'B': return 'text-blue-600'
    case 'C': return 'text-yellow-500'
    case 'D': return 'text-orange-600'
    case 'E': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

function getRingClass(g: string) {
  switch (g) {
    case 'A': return 'ring-green-400'
    case 'B': return 'ring-blue-400'
    case 'C': return 'ring-yellow-400'
    case 'D': return 'ring-orange-400'
    case 'E': return 'ring-red-400'
    default: return 'ring-gray-400'
  }
}

function getTrendBadge(trend: string) {
  switch (trend) {
    case 'naik': return 'bg-green-100 text-green-800 border-green-200'
    case 'turun': return 'bg-red-100 text-red-800 border-red-200'
    case 'tetap': return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'baru': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'naik': return 'pi pi-arrow-up'
    case 'turun': return 'pi pi-arrow-down'
    case 'baru': return 'pi pi-star'
    default: return 'pi pi-minus'
  }
}

function getTrendActiveClass(trend: string) {
  switch (trend) {
    case 'naik': return 'border-green-500 bg-green-100 text-green-700'
    case 'turun': return 'border-red-500 bg-red-100 text-red-700'
    case 'tetap': return 'border-gray-500 bg-gray-100 text-gray-700'
    case 'baru': return 'border-blue-500 bg-blue-100 text-blue-700'
    default: return 'border-blue-500 bg-blue-600 text-white'
  }
}

function exportToPDF() {
  if (filteredReport.value.length === 0) return
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('PT. CAKRA MEDIA DATA', pageWidth / 2, 15, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Jl. Raya Mambal Ubud - Br. Sigaran Desa Mekar Bhuana, Badung, Bali', pageWidth / 2, 21, { align: 'center' })
    doc.setLineWidth(0.5)
    doc.line(10, 30, pageWidth - 10, 30)
    const periodName = periods.value.find(p => p.id === Number(selectedPeriodId.value))?.name || '-'
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('LAPORAN REKAPITULASI PENILAIAN KINERJA', pageWidth / 2, 42, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Periode Evaluasi: ${periodName}`, pageWidth / 2, 49, { align: 'center' })
    const sortedData = [...filteredReport.value].sort((a, b) => b.total_score - a.total_score)
    const tableBody = sortedData.map((row, index) => [
      index + 1, row.nip, row.employee_name, row.division, row.position, row.evaluator, row.total_score.toFixed(2), row.grade
    ])
    autoTable(doc, {
      startY: 55,
      head: [['No', 'NIP', 'Nama Pegawai', 'Divisi', 'Jabatan', 'Penilai', 'Skor', 'Grade']],
      body: tableBody,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
      headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 1: { halign: 'center' }, 6: { halign: 'center', fontStyle: 'bold' }, 7: { halign: 'center', fontStyle: 'bold' } },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    })
    let finalY = (doc as any).lastAutoTable.finalY + 20
    if (finalY > pageHeight - 50) { doc.addPage(); finalY = 30 }
    const signX = pageWidth - 60
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Badung, ${today}`, signX, finalY, { align: 'center' })
    doc.text('Mengetahui,', signX, finalY + 6, { align: 'center' })
    doc.text('CEO PT. Cakra Media Data', signX, finalY + 11, { align: 'center' })
    doc.setFont('helvetica', 'bold')
    doc.text('Bapak Khalil', signX, finalY + 40, { align: 'center' })
    doc.setLineWidth(0.2)
    doc.line(signX - 25, finalY + 41, signX + 25, finalY + 41)
    doc.save(`Laporan_KPI_${periodName.replace(/\s+/g, '_')}.pdf`)
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Laporan PDF berhasil diunduh', life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal membuat PDF', life: 3000 })
  }
}

function exportComparisonPDF() {
  if (filteredComparison.value.length === 0) return
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('PT. CAKRA MEDIA DATA', pageWidth / 2, 15, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Jl. Raya Mambal Ubud - Br. Sigaran Desa Mekar Bhuana, Badung, Bali', pageWidth / 2, 21, { align: 'center' })
    doc.setLineWidth(0.5)
    doc.line(10, 30, pageWidth - 10, 30)
    const periodA = periods.value.find(p => p.id === Number(comparePeriodA.value))?.name || 'Periode A'
    const periodB = periods.value.find(p => p.id === Number(comparePeriodB.value))?.name || 'Periode B'
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('LAPORAN KOMPARASI KINERJA ANTAR PERIODE', pageWidth / 2, 42, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Periode A: ${periodA}`, pageWidth / 2, 49, { align: 'center' })
    doc.text(`Periode B: ${periodB}`, pageWidth / 2, 55, { align: 'center' })
    const tableBody = filteredComparison.value.map((row, index) => [
      index + 1,
      row.nip || '-',
      row.employee_name,
      row.division || '-',
      row.score_a > 0 ? row.score_a.toFixed(2) : '-',
      row.grade_a || '-',
      row.score_b > 0 ? row.score_b.toFixed(2) : '-',
      row.grade_b || '-',
      `${row.delta > 0 ? '+' : ''}${row.delta.toFixed(2)}`,
      row.trend.charAt(0).toUpperCase() + row.trend.slice(1)
    ])
    autoTable(doc, {
      startY: 62,
      head: [[
        'No', 'NIP', 'Nama Pegawai', 'Divisi', 'Skor Acuan', 'Mutu', 'Skor Pembanding', 'Mutu', 'Selisih', 'Tren'
      ]],
      body: tableBody,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
      headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'center' }
      },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    })
    let finalY = (doc as any).lastAutoTable.finalY + 20
    if (finalY > pageHeight - 50) { doc.addPage(); finalY = 30 }
    const signX = pageWidth - 60
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Badung, ${today}`, signX, finalY, { align: 'center' })
    doc.text('Mengetahui,', signX, finalY + 6, { align: 'center' })
    doc.text('CEO PT. Cakra Media Data', signX, finalY + 11, { align: 'center' })
    doc.setFont('helvetica', 'bold')
    doc.text('Bapak Khalil', signX, finalY + 40, { align: 'center' })
    doc.setLineWidth(0.2)
    doc.line(signX - 25, finalY + 41, signX + 25, finalY + 41)
    doc.save(`Komparasi_KPI_${periodA.replace(/\s+/g, '_')}_vs_${periodB.replace(/\s+/g, '_')}.pdf`)
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Laporan komparasi PDF berhasil diunduh', life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal membuat PDF komparasi', life: 3000 })
  }
}

function exportToExcel() {
  if (filteredReport.value.length === 0) return
  try {
    let csvContent = 'No,NIP,Nama Pegawai,Divisi,Jabatan,Skor Akhir,Grade\n'
    const sortedData = [...filteredReport.value].sort((a, b) => b.total_score - a.total_score)
    sortedData.forEach((row, index) => {
      csvContent += `${index+1},"${row.nip}","${row.employee_name}","${row.division}","${row.position}",${row.total_score.toFixed(2)},"${row.grade}"\n`
    })
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const periodName = periods.value.find(p => p.id === Number(selectedPeriodId.value))?.name || 'Laporan'
    link.setAttribute('href', url)
    link.setAttribute('download', `Rekap_KPI_${periodName.replace(/\s+/g, '_')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data CSV berhasil diunduh', life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal membuat CSV', life: 3000 })
  }
}
</script>
