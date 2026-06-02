<template>
  <div class="max-w-7xl mx-auto pb-12 pt-4">
    <Toast />

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <i class="pi pi-chart-pie text-blue-600"></i> Executive Dashboard
        </h1>
        <p class="text-gray-500 mt-1 text-sm">Ringkasan Kesehatan dan Performa SDM Perusahaan PT Cakra Media Data</p>
      </div>
      
      <div class="bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center">
        <span class="text-xs font-bold text-gray-500 uppercase px-3"><i class="pi pi-calendar mr-1"></i> Periode:</span>
        <select 
          v-model="selectedPeriod" 
          @change="fetchDashboardData"
          class="bg-gray-50 border-none text-sm font-semibold text-gray-800 rounded-md py-1.5 pl-3 pr-8 focus:ring-0 cursor-pointer"
        >
          <option value="">Semua Periode (Akumulasi)</option>
          <option v-for="p in periods" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
    </div>

    <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
                <div class="rounded-xl bg-blue-100 p-4 mr-5 shadow-inner">
                    <i class="pi pi-users text-2xl text-blue-600"></i>
                </div>
                <div>
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Karyawan</p>
                    <h3 class="text-3xl font-black text-gray-800">{{ metrics.total_employees }}</h3>
                </div>
            </div>

            <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
                <div class="rounded-xl bg-purple-100 p-4 mr-5 shadow-inner">
                    <i class="pi pi-sitemap text-2xl text-purple-600"></i>
                </div>
                <div>
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Divisi</p>
                    <h3 class="text-3xl font-black text-gray-800">{{ metrics.total_divisions }}</h3>
                </div>
            </div>

            <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
                <div class="rounded-xl bg-green-100 p-4 mr-5 shadow-inner">
                    <i class="pi pi-verified text-2xl text-green-600"></i>
                </div>
                <div>
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Evaluasi Selesai</p>
                    <h3 class="text-3xl font-black text-gray-800">{{ metrics.total_completed_evals }}</h3>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                
                <div class="mb-6">
                    <h2 class="text-lg font-extrabold text-gray-800">Rata-Rata Nilai KPI per Divisi</h2>
                    <p class="text-sm text-gray-500">Berdasarkan skala nilai 0-100.</p>
                </div>
                
                <div class="w-full h-[350px]">
                    <apexchart 
                        v-if="barSeries[0].data.length > 0"
                        type="bar" 
                        height="350" 
                        :options="barOptions" 
                        :series="barSeries">
                    </apexchart>
                    <div v-else class="flex flex-col items-center justify-center h-full text-gray-400">
                        <i class="pi pi-chart-bar text-5xl mb-3 opacity-50"></i>
                        <p>Belum ada data evaluasi di periode ini.</p>
                    </div>
                </div>
            </div>

            <div class="space-y-8">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 class="text-lg font-extrabold text-gray-800 mb-4">Status Penilaian</h2>
                    <apexchart 
                        v-if="donutSeries.length > 0"
                        type="donut" 
                        height="220" 
                        :options="donutOptions" 
                        :series="donutSeries">
                    </apexchart>
                    <div v-else class="text-center text-sm text-gray-500 py-10">Data tidak tersedia</div>
                </div>

                <div class="bg-gradient-to-b from-blue-600 to-blue-800 rounded-2xl shadow-lg border border-blue-700 p-6 text-white">
                    <h2 class="text-lg font-extrabold mb-4 flex items-center">
                        <i class="pi pi-star-fill text-yellow-400 mr-2"></i> Top 5 Pegawai Terbaik
                    </h2>
                    
                    <div v-if="topEmployees.length > 0" class="space-y-3">
                        <div v-for="(emp, idx) in topEmployees" :key="idx" class="flex justify-between items-center bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                            <div class="flex items-center gap-3">
                                <div class="w-6 h-6 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center text-xs font-bold">
                                    {{ idx + 1 }}
                                </div>
                                <div>
                                    <p class="text-sm font-bold leading-tight">{{ emp.name }}</p>
                                    <p class="text-[10px] text-blue-200 uppercase">{{ emp.division_name }}</p>
                                </div>
                            </div>
                            <div class="text-lg font-black text-white">{{ emp.total_score.toFixed(1) }}</div>
                        </div>
                    </div>
                    <div v-else class="text-center text-sm text-blue-200 py-6">
                        Belum ada evaluasi yang difinalisasi.
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

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
    total_employees: 0,
    total_divisions: 0,
    total_completed_evals: 0
})

const topEmployees = ref<any[]>([])

// --- KONFIGURASI BAR CHART (Sumbu Y sudah diperbaiki ke 100) ---
const barSeries = ref([{ name: 'Rata-rata Skor', data: [] as number[] }])
const barOptions = ref<ApexOptions>({
    chart: { type: 'bar', fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
    colors: ['#3b82f6'], // Biru modern
    plotOptions: {
        bar: { borderRadius: 8, columnWidth: '35%', dataLabels: { position: 'top' } }
    },
    dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toFixed(1),
        offsetY: -20,
        style: { fontSize: '12px', colors: ["#475569"] }
    },
    xaxis: {
        categories: [] as string[],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#64748b', fontWeight: 600 } }
    },
    yaxis: {
        max: 100, // <--- PERBAIKAN: Skala disesuaikan dengan data Anda
        tickAmount: 5,
        labels: { style: { colors: '#94a3b8' } }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    fill: {
        type: 'gradient',
        gradient: { type: 'vertical', shadeIntensity: 1, opacityFrom: 1, opacityTo: 0.7, stops: [0, 100] }
    }
})

// --- KONFIGURASI DONUT CHART ---
const donutSeries = ref<number[]>([])
const donutOptions = ref<ApexOptions>({
    chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
    labels: [],
    colors: ['#10b981', '#f59e0b', '#ef4444', '#64748b'], // Hijau (Selesai), Kuning (Draft), Merah (Sanggahan), Abu
    plotOptions: {
        pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '14px' } } } }
    },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', fontSize: '12px' }
})

onMounted(async () => {
    await fetchPeriods()
    await fetchDashboardData()
})

async function fetchPeriods() {
    try {
        const res = await periodService.getAll()
        periods.value = res
        // Opsional: Set default ke periode aktif
        const active = res.find((p: any) => p.is_active)
        if (active) selectedPeriod.value = active.id.toString()
    } catch (e) {
        console.error(e)
    }
}

async function fetchDashboardData() {
    isLoading.value = true
    try {
        const urlParams = new URLSearchParams()
        if (selectedPeriod.value) {
            urlParams.append('period_id', selectedPeriod.value)
        }
        
        // Memanggil API dengan query params (Butuh sedikit penyesuaian jika executiveService Anda belum support query, 
        // tapi kita bisa langsung pakai api.get jika perlu. Saya asumsikan Anda memodifikasinya, 
        // atau kita gunakan axios langsung di sini demi keamanan jika executiveService belum diupdate).
        // Untuk amannya, kita fetch manual menggunakan axios instance bawaan Anda:
        const { default: api } = await import('../services/api')
        const { data: response } = await api.get(`/executive/company-performance?${urlParams.toString()}`)
        const rawData = response.data

        if (rawData.metrics) {
            metrics.total_employees = rawData.metrics.total_employees
            metrics.total_divisions = rawData.metrics.total_divisions
            metrics.total_completed_evals = rawData.metrics.total_completed_evals
        }

        if (rawData.division_performance) {
            const categories = rawData.division_performance.map((d: any) => d.division_name)
            const scores = rawData.division_performance.map((d: any) => Number(d.average_score))
            barOptions.value = { ...barOptions.value, xaxis: { ...barOptions.value.xaxis, categories } }
            barSeries.value = [{ name: 'Rata-rata Skor', data: scores }]
        }

        if (rawData.status_distribution) {
            const labels = rawData.status_distribution.map((d: any) => d.status.toUpperCase())
            const counts = rawData.status_distribution.map((d: any) => d.count)
            donutOptions.value = { ...donutOptions.value, labels }
            donutSeries.value = counts
        }

        if (rawData.top_employees) {
            topEmployees.value = rawData.top_employees
        }

    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Tidak dapat memuat data dashboard', life: 3000 })
    } finally {
        isLoading.value = false
    }
}
</script>