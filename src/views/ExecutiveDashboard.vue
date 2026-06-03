<template>
  <div>
    <Toast />

    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Executive Dashboard</h1>
        <p class="text-gray-600 mt-1">
          Ringkasan Kesehatan dan Performa SDM Perusahaan PT Cakra Media Data
        </p>
      </div>
      
      <div class="text-right">
        <span class="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-sm inline-flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Periode:
          <select 
            v-model="selectedPeriod" 
            @change="fetchDashboardData"
            class="bg-transparent border-none text-sm font-semibold text-gray-800 py-0 pl-1 pr-6 focus:ring-0 cursor-pointer outline-none"
          >
            <option value="">Semua (Akumulasi)</option>
            <option v-for="p in periods" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </span>
      </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <div class="h-32 bg-gray-200 rounded-xl"></div>
        <div class="h-32 bg-gray-200 rounded-xl"></div>
        <div class="h-32 bg-gray-200 rounded-xl"></div>
    </div>

    <div v-else class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 relative overflow-hidden transition hover:shadow-md">
                <div>
                    <p class="text-sm font-medium text-gray-500 uppercase">Total Karyawan</p>
                    <p class="text-3xl font-bold text-gray-800 mt-2">{{ metrics.total_employees }}</p>
                </div>
                <div class="absolute right-4 top-6 p-3 bg-blue-50 rounded-full text-blue-600">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 relative overflow-hidden transition hover:shadow-md">
                <div>
                    <p class="text-sm font-medium text-gray-500 uppercase">Total Divisi</p>
                    <p class="text-3xl font-bold text-gray-800 mt-2">{{ metrics.total_divisions }}</p>
                </div>
                <div class="absolute right-4 top-6 p-3 bg-purple-50 rounded-full text-purple-600">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 relative overflow-hidden transition hover:shadow-md">
                <div>
                    <p class="text-sm font-medium text-gray-500 uppercase">Evaluasi Selesai</p>
                    <p class="text-3xl font-bold text-gray-800 mt-2">{{ metrics.total_completed_evals }}</p>
                </div>
                <div class="absolute right-4 top-6 p-3 bg-green-50 rounded-full text-green-600">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-1">Rata-Rata Nilai KPI per Divisi</h3>
                <p class="text-sm text-gray-500 mb-6">Berdasarkan skala nilai 0-100.</p>
                
                <div class="w-full h-[350px]">
                    <apexchart 
                        v-if="barSeries[0].data.length > 0"
                        type="bar" 
                        height="350" 
                        :options="barOptions" 
                        :series="barSeries">
                    </apexchart>
                    <div v-else class="flex flex-col items-center justify-center h-full text-gray-400">
                        <svg class="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <p>Belum ada data evaluasi di periode ini.</p>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Status Penilaian</h3>
                    <apexchart 
                        v-if="donutSeries.length > 0"
                        type="donut" 
                        height="220" 
                        :options="donutOptions" 
                        :series="donutSeries">
                    </apexchart>
                    <div v-else class="text-center text-sm text-gray-500 py-10">Data tidak tersedia</div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 h-fit">
                    <div 
                        @click="isTopEmployeesOpen = !isTopEmployeesOpen"
                        class="flex justify-between items-center cursor-pointer select-none group"
                        :class="{ 'mb-4 pb-4 border-b border-gray-100': isTopEmployeesOpen }"
                    >
                        <h3 class="text-lg font-bold text-gray-800 flex items-center group-hover:text-blue-600 transition-colors">
                            <svg class="w-5 h-5 mr-2 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L18 21l-5.714-3.214L6.571 21l5.714-6.857L6.571 12l5.714-3.214L10 3h4z" /></svg>
                            Top 5 Pegawai
                        </h3>
                        
                        <svg 
                            class="w-5 h-5 text-gray-400 transition-transform duration-300"
                            :class="isTopEmployeesOpen ? 'transform rotate-180' : ''"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    
                    <div v-show="isTopEmployeesOpen" class="space-y-3 animate-fade-in">
                        <template v-if="topEmployees.length > 0">
                            <div 
                                v-for="(emp, idx) in topEmployees" 
                                :key="idx"
                                class="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div class="flex items-center gap-4">
                                    <div class="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm">
                                        {{ idx + 1 }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-sm text-gray-700">{{ emp.name }}</p>
                                        <p class="text-xs text-gray-400">{{ emp.division_name }}</p>
                                    </div>
                                </div>
                                
                                <div class="text-right">
                                    <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                        {{ emp.total_score.toFixed(1) }}
                                    </span>
                                </div>
                            </div>
                        </template>
                        
                        <div v-else class="text-center py-8 text-gray-400 opacity-80">
                            <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            <p class="text-sm">Belum ada evaluasi.</p>
                        </div>
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

const isTopEmployeesOpen = ref(true)
const topEmployees = ref<any[]>([])

const barSeries = ref([{ name: 'Rata-rata Skor', data: [] as number[] }])
const barOptions = ref<ApexOptions>({
    chart: { type: 'bar', fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
    colors: ['#3b82f6'],
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
        max: 100,
        tickAmount: 5,
        labels: { style: { colors: '#94a3b8' } }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    fill: {
        type: 'gradient',
        gradient: { type: 'vertical', shadeIntensity: 1, opacityFrom: 1, opacityTo: 0.7, stops: [0, 100] }
    }
})

const donutSeries = ref<number[]>([])
const donutOptions = ref<ApexOptions>({
    chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
    labels: [],
    colors: ['#10b981', '#f59e0b', '#ef4444', '#64748b'],
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
