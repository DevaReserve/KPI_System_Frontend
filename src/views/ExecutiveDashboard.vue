<template>
  <div class="max-w-7xl mx-auto pb-12 pt-4">
    <Toast />

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span class="bg-slate-900 text-white p-2 rounded-xl shadow-lg">
            <i class="pi pi-chart-line text-xl"></i>
          </span>
          Executive Command Center
        </h1>
        <p class="text-slate-500 mt-2 text-sm font-medium">Ringkasan Strategis & Performa SDM PT Cakra Media Data</p>
      </div>
      
      <div class="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center">
        <span class="text-xs font-bold text-slate-400 uppercase px-3"><i class="pi pi-calendar mr-1"></i> Periode:</span>
        <select 
          v-model="selectedPeriod" 
          @change="fetchDashboardData"
          class="bg-slate-50 border-none text-sm font-bold text-slate-800 rounded-lg py-2 pl-3 pr-8 focus:ring-0 cursor-pointer"
        >
          <option value="">Semua Periode (Akumulasi)</option>
          <option v-for="p in periods" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-slate-900"></div>
    </div>

    <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-slate-900 rounded-2xl shadow-xl p-6 relative overflow-hidden text-white transform transition duration-300 hover:scale-[1.02]">
                <div class="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
                <div class="relative z-10">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rata-Rata Kinerja Perusahaan</p>
                    <div class="flex items-end gap-3">
                        <h3 class="text-5xl font-black text-white">{{ metrics.company_average_score.toFixed(1) }}</h3>
                        <span class="text-slate-400 font-medium mb-1">/ 100</span>
                    </div>
                </div>
                <i class="pi pi-bolt absolute right-6 bottom-6 text-4xl text-slate-700 opacity-50"></i>
            </div>

            <div class="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-xl p-6 relative overflow-hidden text-white transform transition duration-300 hover:scale-[1.02]">
                <div class="relative z-10">
                    <p class="text-xs font-bold text-orange-100 uppercase tracking-wider mb-2">Divisi Performa Terbaik</p>
                    <h3 class="text-3xl font-black text-white leading-tight mt-2">{{ metrics.top_division }}</h3>
                </div>
                <i class="pi pi-star-fill absolute right-4 bottom-4 text-6xl text-white opacity-20"></i>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between transform transition duration-300 hover:shadow-md">
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Evaluasi Final</p>
                    <h3 class="text-4xl font-black text-slate-800">{{ metrics.total_completed_evals }}</h3>
                </div>
                <div class="rounded-full bg-emerald-50 p-4 border border-emerald-100">
                    <i class="pi pi-check-circle text-3xl text-emerald-500"></i>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 class="text-lg font-extrabold text-slate-800 mb-1">Tren Kinerja Perusahaan</h2>
                <p class="text-sm text-slate-500 mb-6">Pergerakan rata-rata nilai dari periode ke periode.</p>
                
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

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 class="text-lg font-extrabold text-slate-800 mb-4">Distribusi Status Penilaian</h2>
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

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 class="text-lg font-extrabold text-slate-800 mb-1">Komparasi Performa Divisi</h2>
                <p class="text-sm text-slate-500 mb-6">Analisis rata-rata nilai KPI antar departemen.</p>
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

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
                <h2 class="text-lg font-extrabold text-slate-800 mb-6 flex items-center">
                    <i class="pi pi-trophy text-amber-500 mr-2 text-xl"></i> Pegawai Bintang (Top 5)
                </h2>
                
                <div v-if="topEmployees.length > 0" class="flex-1 space-y-4">
                    <div v-for="(emp, idx) in topEmployees" :key="idx" class="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center font-black shadow-sm"
                                 :class="idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-white' : idx === 2 ? 'bg-orange-300 text-white' : 'bg-white text-slate-500 border border-slate-200'">
                                {{ idx + 1 }}
                            </div>
                            <div>
                                <p class="font-bold text-slate-800">{{ emp.name }}</p>
                                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ emp.division_name }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <!-- Tombol Download PDF -->
                            <button 
                            @click="printDashboard" 
                            class="no-print bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                            >
                            <i class="pi pi-file-pdf"></i> Eksport PDF
                            </button>

                            <!-- Filter Periode (Elegan) -->
                            <div class="no-print bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center">
                            <!-- ... (kode select periode Anda tetap di sini) ... -->
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xl font-black text-slate-800">{{ emp.total_score.toFixed(1) }}</span>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center text-sm text-slate-400 py-10 my-auto">
                    Belum ada data evaluasi.
                </div>
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
import { ref, onMounted, reactive } from 'vue'
import { periodService } from '../services/api'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

const toast = useToast()
const isLoading = ref(true)
const apexchart = VueApexCharts

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
    colors: ['#0f172a'], // Slate-900
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
