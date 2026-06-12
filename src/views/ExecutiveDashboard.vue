<template>
  <div>
    <Toast />

    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Executive Dashboard</h1>
        <p class="text-gray-600 mt-1">
          Selamat datang kembali, <span class="font-semibold text-blue-600">{{ authStore.user?.employee?.name || authStore.user?.username || 'Eksekutif' }}</span>.
        </p>
      </div>
      <div class="flex flex-col items-start md:items-end gap-3 no-print">
        
        <span class="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-sm inline-flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {{ currentDate }}
        </span>

        <div class="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex items-center">
          <span class="text-xs font-bold text-gray-400 uppercase px-2"><i class="pi pi-calendar mr-1"></i> Periode:</span>
          <select 
            v-model="selectedPeriod" 
            @change="fetchDashboardData"
            class="bg-gray-50 border-none text-xs sm:text-sm font-bold text-gray-800 rounded-md py-1 pl-2 pr-8 focus:ring-0 cursor-pointer"
          >
            <option value="">Semua Periode</option>
            <option v-for="p in periods" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Skeleton Loader State -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      <!-- 3 Metrics Card skeletons -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="h-32 bg-gray-200 rounded-xl"></div>
        <div class="h-32 bg-gray-200 rounded-xl"></div>
        <div class="h-32 bg-gray-200 rounded-xl"></div>
      </div>
      <!-- Charts skeletons -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 h-[380px] bg-gray-200 rounded-xl"></div>
        <div class="h-[380px] bg-gray-200 rounded-xl"></div>
      </div>
      <!-- Lower charts & tables skeletons -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="h-[430px] bg-gray-200 rounded-xl"></div>
        <div class="h-[430px] bg-gray-200 rounded-xl"></div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Row 1: Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 relative overflow-hidden transition hover:shadow-md">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Rata-Rata Kinerja Perusahaan</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">
              {{ metrics.company_average_score.toFixed(1) }} <span class="text-sm font-semibold text-gray-400">/ 100</span>
            </p>
          </div>
          <div class="absolute right-4 top-5 p-2.5 bg-blue-50 rounded-full text-blue-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 relative overflow-hidden transition hover:shadow-md">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Divisi Performa Terbaik</p>
            <p class="text-2xl font-bold text-gray-800 mt-1 truncate max-w-[85%]">{{ metrics.top_division }}</p>
          </div>
          <div class="absolute right-4 top-5 p-2.5 bg-green-50 rounded-full text-green-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" /></svg>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500 relative overflow-hidden transition hover:shadow-md">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Evaluasi Final</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ metrics.total_completed_evals }}</p>
          </div>
          <div class="absolute right-4 top-5 p-2.5 bg-purple-50 rounded-full text-purple-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      <!-- Row 2: Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-1">Tren Kinerja Perusahaan</h2>
          <p class="text-sm text-gray-500 mb-6">Pergerakan rata-rata nilai dari periode ke periode.</p>
          <div class="w-full h-[300px]">
            <apexchart 
              v-if="trendSeries[0].data.length > 0"
              type="area" 
              height="300" 
              :options="trendOptions" 
              :series="trendSeries">
            </apexchart>
            <div v-else class="flex flex-col items-center justify-center h-full text-slate-300">
              <i class="pi pi-chart-line text-4xl mb-3 opacity-50"></i>
              <p>Belum ada data tren yang cukup.</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Distribusi Status Penilaian</h2>
          <apexchart 
            v-if="donutSeries.length > 0"
            type="donut" 
            height="280" 
            :options="donutOptions" 
            :series="donutSeries">
          </apexchart>
          <div v-else class="text-center text-sm text-slate-400 py-10">Data tidak tersedia</div>
        </div>
      </div>

      <!-- Row 3: Charts Row 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-1">Komparasi Performa Divisi</h2>
          <p class="text-sm text-gray-500 mb-6">Analisis rata-rata nilai KPI antar departemen.</p>
          <div class="w-full h-[350px]">
            <apexchart 
              v-if="barSeries[0].data.length > 0"
              type="bar" 
              height="350" 
              :options="barOptions" 
              :series="barSeries">
            </apexchart>
            <div v-else class="flex justify-center items-center h-full text-slate-300">Kosong</div>
          </div>
        </div>

        <!-- Top Employees Table (matches DashboardView.vue performer layout) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 bg-blue-50 flex items-center">
            <i class="pi pi-star-fill text-blue-600 mr-2"></i>
            <h3 class="font-bold text-blue-800 text-sm">Pegawai Bintang (Top 5)</h3>
          </div>
          <table class="min-w-full">
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(emp, idx) in topEmployees" :key="idx" class="hover:bg-gray-50 transition">
                <td class="px-5 py-2.5 text-sm text-gray-700 font-medium flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-sans">{{ idx + 1 }}</span>
                  <div>
                    <span class="font-medium">{{ emp.name }}</span>
                    <span class="text-xs text-gray-400 block">{{ emp.division_name }}</span>
                  </div>
                </td>
                <td class="px-5 py-2.5 text-sm text-right font-bold text-blue-600">{{ emp.total_score.toFixed(2) }}</td>
              </tr>
              <tr v-if="topEmployees.length === 0">
                <td colspan="2" class="px-5 py-6 text-center text-sm text-gray-400">Belum ada data evaluasi.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
    /* 1. Sembunyikan elemen yang tidak perlu dicetak */
    .no-print, header, nav, aside {
        display: none !important;
    }

    /* 2. Pengaturan Kertas (Landscape) & Margin */
    @page {
        size: landscape;
        margin: 5mm; 
    }

    body {
        background-color: #f8fafc !important;
        /* Memperkecil sedikit skala agar semua muat dalam 1 halaman */
        zoom: 0.85; 
    }

    /* 3. Paksa Warna Background & Gradient Muncul */
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    /* 4. ====================================================
       OBAT ANTI-TAMPILAN-HP (MEMAKSA TAILWIND GRID AKTIF)
       ==================================================== */
    .grid {
        display: grid !important;
    }
    
    /* Memaksa Top Metrics (3 Kartu Atas) sejajar */
    .md\:grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }

    /* Memaksa layout Tengah & Bawah sejajar */
    .lg\:grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
    .lg\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    .lg\:col-span-2 {
        grid-column: span 2 / span 2 !important;
    }

    /* 5. Mencegah Kartu/Grafik Terbelah di tengah halaman */
    .bg-white, .bg-slate-900, .bg-gradient-to-br {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        margin-bottom: 15px !important;
    }

    /* 6. Memastikan Grafik ApexCharts Merender Penuh */
    .apexcharts-canvas {
        max-width: 100% !important;
    }
}
</style>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { periodService } from '../services/api'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '../stores/auth'
import Toast from 'primevue/toast'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

const authStore = useAuthStore()
const toast = useToast()
const isLoading = ref(true)
const apexchart = VueApexCharts

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const periods = ref<any[]>([])
const selectedPeriod = ref('')

const metrics = reactive({
    company_average_score: 0,
    top_division: 'Belum Ada',
    total_completed_evals: 0
})

const topEmployees = ref<any[]>([])

// --- 1. TREN KINERJA (AREA CHART) ---
const trendSeries = ref([{ name: 'Rata-rata Perusahaan', data: [] as number[] }])
const trendOptions = ref<ApexOptions>({
    chart: { type: 'area', fontFamily: 'Inter, sans-serif', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#3b82f6'], // Blue-500
    dataLabels: { enabled: true, formatter: (val) => Number(val).toFixed(1), offsetY: -5, background: { enabled: true, foreColor: '#fff', borderRadius: 4, padding: 4 } },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: [] as string[], tooltip: { enabled: false } },
    yaxis: { max: 100, 
    min: 0, 
    labels: { 
        style: { colors: '#94a3b8' },
        formatter: (val) => val.toFixed(0) // <--- TAMBAHKAN BARIS INI
    }},
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 90, 100] } }
})

// --- 2. KOMPARASI DIVISI (BAR CHART) ---
const barSeries = ref([{ name: 'Skor Divisi', data: [] as number[] }])
const barOptions = ref<ApexOptions>({
    chart: { type: 'bar', fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
    colors: ['#3b82f6'],
    plotOptions: { bar: { borderRadius: 6, horizontal: false, columnWidth: '40%', dataLabels: { position: 'top' } } },
    dataLabels: { enabled: true, formatter: (val) => Number(val).toFixed(1), offsetY: -20, style: { colors: ['#475569'] } },
    xaxis: { categories: [] as string[], labels: { style: { fontWeight: 600, colors: '#64748b' } } },
    yaxis: { max: 100, labels: { style: { colors: '#94a3b8' } } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})

// --- 3. STATUS (DONUT CHART) ---
const donutSeries = ref<number[]>([])
const donutOptions = ref<ApexOptions>({
    chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
    labels: [],
    colors: ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'],
    plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '14px', fontWeight: 'bold' } } } } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', fontSize: '13px', fontWeight: 500 }
})

onMounted(async () => {
    await fetchPeriods()
    await fetchDashboardData()
})

async function fetchPeriods() {
    try {
        const res = await periodService.getAll()
        periods.value = res
        const active = res.find((p: any) => p.is_active)
        if (active) selectedPeriod.value = active.id.toString()
    } catch (e) { console.error(e) }
}

async function fetchDashboardData() {
    isLoading.value = true
    try {
        const urlParams = new URLSearchParams()
        if (selectedPeriod.value) urlParams.append('period_id', selectedPeriod.value)
        
        const { default: api } = await import('../services/api')
        const { data: response } = await api.get(`/executive/company-performance?${urlParams.toString()}`)
        const rawData = response.data

        // Map Metrics Atas
        if (rawData.metrics) {
            metrics.company_average_score = rawData.metrics.company_average_score || 0
            metrics.top_division = rawData.metrics.top_division || 'Belum Ada'
            metrics.total_completed_evals = rawData.metrics.total_completed_evals || 0
        }

        // Map Tren (Area Chart)
        if (rawData.company_trends) {
            const periods = rawData.company_trends.map((d: any) => d.period_name)
            const trendScores = rawData.company_trends.map((d: any) => Number(d.average_score))
            trendOptions.value = { ...trendOptions.value, xaxis: { ...trendOptions.value.xaxis, categories: periods } }
            trendSeries.value = [{ name: 'Rata-rata Perusahaan', data: trendScores }]
        }

        // Map Divisi (Bar Chart)
        if (rawData.division_performance) {
            const categories = rawData.division_performance.map((d: any) => d.division_name)
            const scores = rawData.division_performance.map((d: any) => Number(d.average_score))
            barOptions.value = { ...barOptions.value, xaxis: { ...barOptions.value.xaxis, categories } }
            barSeries.value = [{ name: 'Skor Divisi', data: scores }]
        }

        // Map Status (Donut Chart)
        if (rawData.status_distribution) {
            const labels = rawData.status_distribution.map((d: any) => d.status.toUpperCase())
            const counts = rawData.status_distribution.map((d: any) => d.count)
            donutOptions.value = { ...donutOptions.value, labels }
            donutSeries.value = counts
        }

        // Map Top Karyawan
        if (rawData.top_employees) {
            topEmployees.value = rawData.top_employees
        }

    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Tidak dapat memuat data dashboard', life: 3000 })
    } finally {
        isLoading.value = false
    }
}

function printDashboard() {
    window.print()
}


</script>
