<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Kinerja Saya</h1>
        <p class="text-gray-500 text-sm mt-1">Riwayat & tren penilaian kinerja individu Anda.</p>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="space-y-4 animate-pulse">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-24 bg-gray-200 rounded-xl"></div>
      </div>
      <div class="h-64 bg-gray-200 rounded-xl"></div>
    </div>

    <template v-else-if="history.length > 0">
      <!-- Summary Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 relative overflow-hidden transition hover:shadow-md">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Nilai Terakhir</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">
              {{ latestEval?.total_score?.toFixed(1) ?? '-' }}
            </p>
            <div class="mt-1 inline-block px-2 py-0.5 rounded text-xs font-bold" :class="getGradeColor(latestEval?.total_score)">
              Grade {{ getGrade(latestEval?.total_score) }}
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500 relative overflow-hidden transition hover:shadow-md">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Rata-rata Skor</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ avgScore.toFixed(1) }}</p>
            <p class="text-xs text-gray-400 mt-1">dari {{ history.length }} periode</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500 relative overflow-hidden transition hover:shadow-md">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Tren Terkini</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-3xl font-bold text-gray-800">{{ trendValue }}</span>
              <i class="text-xl" :class="[trendIcon, trendColor]"></i>
            </div>
            <p class="text-xs text-gray-400 mt-1">vs periode sebelumnya</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 relative overflow-hidden transition hover:shadow-md">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Nilai Tertinggi</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ bestScore.toFixed(1) }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ bestPeriod }}</p>
          </div>
        </div>
      </div>

      <!-- Area Chart Tren -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h2 class="text-lg font-bold text-gray-800">📈 Tren Kinerja Per-Periode</h2>
            <p class="text-sm text-gray-500 mt-0.5">Pergerakan nilai KPI Anda dari periode ke periode</p>
          </div>
          <!-- Legend Grade -->
          <div class="hidden md:flex items-center gap-3 text-xs font-semibold">
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-green-500 inline-block"></span>≥86 (A)</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>71-85 (B)</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>56-70 (C)</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span>&lt;56 (D/E)</span>
          </div>
        </div>
        <apexchart type="area" height="280" :options="trendChartOptions" :series="trendSeries"></apexchart>
      </div>

      <!-- Target KPI Section (jika ada) -->
      <div v-if="myTargets.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-flag-fill text-blue-600 text-lg"></i>
          <h2 class="text-lg font-bold text-gray-800">Target KPI Anda</h2>
          <span class="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-200">
            Periode Aktif
          </span>
        </div>

        <div class="space-y-3">
          <div v-for="t in myTargets" :key="t.indicator_id"
            class="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-800">{{ t.indicator_name }}</span>
                <span class="text-xs text-gray-400 font-medium">(Bobot: {{ t.weight }}%)</span>
              </div>
              <!-- Progress Bar Target vs Actual -->
              <div class="mt-2 flex items-center gap-3">
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-700"
                    :class="t.actual_score >= t.target_score ? 'bg-green-500' : 'bg-blue-500'"
                    :style="{ width: Math.min((t.actual_score / 5) * 100, 100) + '%' }"
                  ></div>
                </div>
                <div class="flex items-center gap-1 whitespace-nowrap text-xs font-semibold">
                  <span :class="t.actual_score >= t.target_score ? 'text-green-600' : 'text-blue-600'">
                    {{ t.actual_score > 0 ? t.actual_score : '-' }}
                  </span>
                  <span class="text-gray-400">/</span>
                  <span class="text-gray-600">{{ t.target_score }}</span>
                </div>
                <span v-if="t.actual_score > 0"
                  class="text-xs px-2 py-0.5 rounded-full font-bold"
                  :class="t.actual_score >= t.target_score ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ t.actual_score >= t.target_score ? '✓ Tercapai' : '✗ Belum' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Riwayat Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-800">Riwayat Semua Evaluasi</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Periode</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Dinilai</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Skor Akhir</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tren</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, idx) in history" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <span class="font-bold text-gray-900 text-sm">{{ item.period_name || '-' }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(item.submitted_at) }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="text-xl font-bold" :class="getScoreColor(item.total_score)">
                    {{ item.total_score.toFixed(2) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold border" :class="getGradeColor(item.total_score)">
                    {{ getGrade(item.total_score) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <template v-if="idx < history.length - 1">
                    <span v-if="item.total_score > history[idx+1].total_score" class="text-green-600 font-bold text-xs flex items-center justify-center gap-1">
                      <i class="pi pi-arrow-up text-xs"></i> +{{ (item.total_score - history[idx+1].total_score).toFixed(1) }}
                    </span>
                    <span v-else-if="item.total_score < history[idx+1].total_score" class="text-red-600 font-bold text-xs flex items-center justify-center gap-1">
                      <i class="pi pi-arrow-down text-xs"></i> {{ (item.total_score - history[idx+1].total_score).toFixed(1) }}
                    </span>
                    <span v-else class="text-gray-400 text-xs">—</span>
                  </template>
                  <span v-else class="text-gray-300 text-xs">Pertama</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <button
                    @click="$router.push(`/employee/evaluation/${item.id}`)"
                    class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline transition-colors"
                  >
                    <i class="pi pi-eye text-xs"></i> Detail
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
      <i class="pi pi-chart-line text-5xl text-gray-300 mb-4 block"></i>
      <h3 class="text-lg font-bold text-gray-700">Belum Ada Riwayat Penilaian</h3>
      <p class="text-gray-400 text-sm mt-2">Hasil penilaian Anda akan muncul di sini setelah manager menyelesaikan evaluasi.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { kpiTargetService, myPerformanceService, periodService } from '../../services/api'

const history = ref<any[]>([])
const myTargets = ref<any[]>([])
const isLoading = ref(true)

// ---- Computed Stats ----
const latestEval = computed(() => history.value[0])

const avgScore = computed(() => {
  if (!history.value.length) return 0
  return history.value.reduce((sum, h) => sum + h.total_score, 0) / history.value.length
})

const bestScore = computed(() => {
  if (!history.value.length) return 0
  return Math.max(...history.value.map(h => h.total_score))
})

const bestPeriod = computed(() => {
  if (!history.value.length) return '-'
  const best = history.value.reduce((prev, cur) => cur.total_score > prev.total_score ? cur : prev)
  return best.period_name || '-'
})

const trendValue = computed(() => {
  if (history.value.length < 2) return '-'
  const delta = history.value[0].total_score - history.value[1].total_score
  return (delta >= 0 ? '+' : '') + delta.toFixed(1)
})

const trendColor = computed(() => {
  if (history.value.length < 2) return 'text-gray-400'
  const delta = history.value[0].total_score - history.value[1].total_score
  if (delta > 0.5) return 'text-green-600'
  if (delta < -0.5) return 'text-red-600'
  return 'text-gray-500'
})

const trendIcon = computed(() => {
  if (history.value.length < 2) return 'pi pi-minus'
  const delta = history.value[0].total_score - history.value[1].total_score
  if (delta > 0.5) return 'pi pi-arrow-up'
  if (delta < -0.5) return 'pi pi-arrow-down'
  return 'pi pi-minus'
})

// ---- Chart Config ----
const trendSeries = computed(() => {
  const reversed = [...history.value].reverse()
  return [{ name: 'Skor KPI', data: reversed.map(h => parseFloat(h.total_score.toFixed(2))) }]
})

const trendChartOptions = computed(() => ({
  chart: {
    fontFamily: 'inherit',
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, speed: 800 }
  },
  colors: ['#3b82f6'],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.01, stops: [0, 90, 100] }
  },
  markers: {
    size: 6,
    colors: ['#fff'],
    strokeColors: ['#3b82f6'],
    strokeWidth: 3,
    hover: { size: 9 }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toFixed(1),
    offsetY: -8,
    style: { fontSize: '11px', fontWeight: 'bold', colors: ['#374151'] },
    background: { enabled: true, foreColor: '#374151', borderRadius: 4, padding: 3, borderColor: '#e5e7eb' }
  },
  xaxis: {
    categories: [...history.value].reverse().map(h => h.period_name || '-'),
    labels: { style: { fontSize: '12px', colors: '#6b7280' } }
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: { formatter: (val: number) => val.toFixed(0), style: { colors: '#6b7280' } }
  },
  // Zona grade berwarna di background
  annotations: {
    yaxis: [
      { y: 86, y2: 100, fillColor: '#10b981', opacity: 0.06, label: { text: 'A' } },
      { y: 71, y2: 86, fillColor: '#3b82f6', opacity: 0.06, label: { text: 'B' } },
      { y: 56, y2: 71, fillColor: '#f59e0b', opacity: 0.06, label: { text: 'C' } },
      { y: 41, y2: 56, fillColor: '#f97316', opacity: 0.06, label: { text: 'D' } },
      { y: 0,  y2: 41, fillColor: '#ef4444', opacity: 0.06, label: { text: 'E' } },
    ]
  },
  grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
  tooltip: { y: { formatter: (val: number) => val.toFixed(2) + ' pts' } }
}))

onMounted(async () => {
  isLoading.value = true
  try {
    const [hist, periods] = await Promise.all([
      myPerformanceService.getHistory(),
      periodService.getAll().catch(() => [])
    ])
    history.value = hist

    // Load target untuk periode aktif (jika ada)
    const activePeriod = periods.find((p: any) => p.is_active)
    if (activePeriod) {
      try {
        myTargets.value = await kpiTargetService.getMyTargets(activePeriod.id)
      } catch { myTargets.value = [] }
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})

function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString))
}

function getGrade(score: number) {
  if (!score) return '-'
  if (score >= 86) return 'A'
  if (score >= 71) return 'B'
  if (score >= 56) return 'C'
  if (score >= 41) return 'D'
  return 'E'
}

function getScoreColor(score: number) {
  if (!score) return 'text-gray-400'
  if (score >= 86) return 'text-green-600'
  if (score >= 71) return 'text-blue-600'
  if (score >= 56) return 'text-yellow-500'
  return 'text-red-500'
}

function getGradeColor(score: number) {
  if (!score) return 'bg-gray-100 text-gray-500 border-gray-200'
  if (score >= 86) return 'bg-green-100 text-green-800 border-green-200'
  if (score >= 71) return 'bg-blue-100 text-blue-800 border-blue-200'
  if (score >= 56) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-red-100 text-red-800 border-red-200'
}
</script>
