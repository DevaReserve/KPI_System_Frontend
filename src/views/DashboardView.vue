<template>
  <div>
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p class="text-gray-600 mt-1">
          Ringkasan aktivitas dan performa di <span class="font-semibold text-blue-600">PT. Cakra Media Data</span>.
        </p>
      </div>
      <div class="text-right">
        <span class="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-sm">
          {{ currentDate }}
        </span>
      </div>
    </div>

    <div v-if="authStore.userRole === 'admin'" class="space-y-6">
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 relative overflow-hidden">
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase">Total Pegawai</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">{{ adminStats.totalEmployees }}</p>
          </div>
          <div class="absolute right-4 top-6 p-3 bg-blue-50 rounded-full text-blue-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 relative overflow-hidden">
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase">Total Divisi</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">{{ adminStats.totalDivisions }}</p>
          </div>
          <div class="absolute right-4 top-6 p-3 bg-purple-50 rounded-full text-purple-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 relative overflow-hidden">
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase">Periode Aktif</p>
            <p class="text-lg font-bold text-green-600 mt-2 truncate">{{ adminStats.activePeriod || 'Tidak Ada' }}</p>
          </div>
          <div class="absolute right-4 top-6 p-3 bg-green-50 rounded-full text-green-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Distribusi Pegawai per Divisi</h3>
          <div v-if="adminCharts.divisionSeries.length > 0">
            <apexchart type="bar" height="300" :options="adminCharts.divisionOptions" :series="adminCharts.divisionSeries"></apexchart>
          </div>
          <div v-else class="h-64 flex items-center justify-center text-gray-400">Memuat grafik...</div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Status Akun Pegawai</h3>
          <div v-if="adminCharts.statusSeries.length > 0">
            <apexchart type="pie" height="300" :options="adminCharts.statusOptions" :series="adminCharts.statusSeries"></apexchart>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 bg-green-50">
            <h3 class="font-bold text-green-800 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L18 21l-5.714-3.214L6.571 21l5.714-6.857L6.571 12l5.714-3.214L10 3h4z" /></svg>
              Top 5 Performers
            </h3>
          </div>
          <table class="min-w-full">
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(p, idx) in adminStats.topPerformers" :key="idx" class="hover:bg-gray-50 transition">
                <td class="px-6 py-3 text-sm text-gray-700 font-medium flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">{{ idx + 1 }}</span>
                  {{ p.employee_name }}
                </td>
                <td class="px-6 py-3 text-sm text-right font-bold text-green-600">{{ p.total_score.toFixed(2) }}</td>
              </tr>
              <tr v-if="adminStats.topPerformers.length === 0">
                <td colspan="2" class="px-6 py-8 text-center text-sm text-gray-400">Belum ada data penilaian.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 bg-red-50">
            <h3 class="font-bold text-red-800 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
              Perlu Pembinaan (Low 5)
            </h3>
          </div>
          <table class="min-w-full">
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(p, idx) in adminStats.lowPerformers" :key="idx" class="hover:bg-gray-50 transition">
                <td class="px-6 py-3 text-sm text-gray-700 font-medium flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">{{ idx + 1 }}</span>
                  {{ p.employee_name }}
                </td>
                <td class="px-6 py-3 text-sm text-right font-bold text-red-600">{{ p.total_score.toFixed(2) }}</td>
              </tr>
              <tr v-if="adminStats.lowPerformers.length === 0">
                <td colspan="2" class="px-6 py-8 text-center text-sm text-gray-400">Belum ada data penilaian.</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <div v-else-if="authStore.userRole === 'manager'" class="space-y-6">
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          
          <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div class="flex justify-between items-end mb-4">
              <div>
                <h2 class="text-xl font-bold text-gray-800">Progress Penilaian Tim</h2>
                <p class="text-sm text-gray-500 mt-1">Periode Aktif saat ini.</p>
              </div>
              <div class="text-right">
                <span class="text-4xl font-bold text-blue-600">{{ managerStats.done }}</span>
                <span class="text-gray-400 text-xl font-medium"> / {{ managerStats.total }}</span>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden">
              <div class="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out" :style="`width: ${managerStats.percentage}%`"></div>
            </div>
            <div class="text-right text-xs font-bold text-blue-600">{{ managerStats.percentage.toFixed(0) }}% Tuntas</div>
          </div>

          <div v-if="managerStats.pending > 0" class="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex justify-between items-center shadow-sm">
            <div>
              <p class="font-bold text-orange-800 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Tugas Menunggu!
              </p>
              <p class="text-sm text-orange-700 mt-1">Anda memiliki <span class="font-bold">{{ managerStats.pending }}</span> pegawai yang belum selesai dinilai.</p>
            </div>
            <button @click="$router.push('/manager/team')" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition transform hover:scale-105">
              Lanjut Menilai
            </button>
          </div>
          
          <div v-else class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm">
            <p class="font-bold text-green-800 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Semua Selesai!
            </p>
            <p class="text-sm text-green-700 mt-1">Terima kasih telah menyelesaikan penilaian periode ini.</p>
          </div>

        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Statistik Status Penilaian</h3>
          <div class="flex items-center justify-center">
            <apexchart type="donut" width="100%" :options="managerCharts.options" :series="managerCharts.series"></apexchart>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="authStore.userRole === 'employee'" class="space-y-6">
      
      <div v-if="employeeStats.hasData" class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden transition-all hover:shadow-2xl">
        <div class="absolute -right-10 -top-10 h-64 w-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div class="absolute left-10 bottom-10 h-32 w-32 bg-purple-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 class="text-lg font-medium opacity-90 mb-1 flex items-center">
              <svg class="w-5 h-5 mr-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Nilai Kinerja Terakhir
            </h2>
            <p class="text-sm opacity-75 mb-6 pl-7">{{ employeeStats.periodName }}</p>
            
            <div class="flex items-end gap-4 pl-2">
              <div class="text-7xl font-bold tracking-tighter">{{ employeeStats.score.toFixed(1) }}</div>
              <div class="mb-4 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-lg font-bold text-lg border border-white/30 shadow-lg">
                Grade {{ employeeStats.grade }}
              </div>
            </div>
            
            <div class="mt-8 pl-2">
              <button @click="$router.push('/employee/history')" class="bg-white text-indigo-700 px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-gray-50 transition transform hover:-translate-y-0.5">
                Lihat Rapor Lengkap
              </button>
            </div>
          </div>

          <div class="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20 shadow-inner">
            <h4 class="text-sm font-semibold mb-2 opacity-90">Tren Kinerja Saya</h4>
            <apexchart type="area" height="150" :options="employeeCharts.options" :series="employeeCharts.series"></apexchart>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <div class="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg class="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-800">Belum Ada Data Penilaian</h3>
        <p class="text-gray-500 mt-2 max-w-sm mx-auto">
          Hasil penilaian kinerja Anda untuk periode ini belum tersedia. Silakan cek kembali nanti atau hubungi atasan Anda.
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-xl">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
        <p class="text-gray-500 font-medium animate-pulse">Memuat Dashboard...</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  employeeService, 
  divisionService, 
  periodService, 
  managerService, 
  myPerformanceService,
  reportService
} from '../services/api'

const authStore = useAuthStore()
const isLoading = ref(true)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

// --- STATE ADMIN ---
const adminStats = reactive({ totalEmployees: 0, totalDivisions: 0, activePeriod: '', topPerformers: [] as any[], lowPerformers: [] as any[] })
const adminCharts = reactive({
  divisionSeries: [] as any[],
  divisionOptions: {
    chart: { id: 'division-bar', fontFamily: 'inherit' },
    xaxis: { categories: [] as string[] },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '50%' } },
    colors: ['#3b82f6'],
    grid: { borderColor: '#f3f4f6' }
  },
  statusSeries: [] as number[],
  statusOptions: {
    labels: ['Aktif', 'Non-Aktif'],
    colors: ['#10b981', '#ef4444'],
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '55%' } } }
  }
})

// --- STATE MANAGER ---
const managerStats = reactive({ total: 0, done: 0, pending: 0, percentage: 0 })
const managerCharts = reactive({
  series: [] as number[],
  options: {
    labels: ['Selesai', 'Draft', 'Belum Dinilai'],
    colors: ['#10b981', '#f59e0b', '#e5e7eb'],
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total Tim', color: '#374151' } } } } },
    dataLabels: { enabled: false }
  }
})

// --- STATE EMPLOYEE ---
const employeeStats = reactive({ hasData: false, score: 0, grade: '', periodName: '' })
const employeeCharts = reactive({
  series: [] as any[],
  options: {
    chart: { toolbar: { show: false }, sparkline: { enabled: true } }, 
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#ffffff'], 
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05, stops: [0, 90, 100] } },
    tooltip: { theme: 'dark', fixed: { enabled: false }, x: { show: false }, marker: { show: false } },
    markers: { size: 0 }
  }
})

onMounted(async () => {
  isLoading.value = true
  try {
    if (authStore.userRole === 'admin') await loadAdminData()
    else if (authStore.userRole === 'manager') await loadManagerData()
    else if (authStore.userRole === 'employee') await loadEmployeeData()
  } catch (error) { console.error(error) } 
  finally { isLoading.value = false }
})

// --- LOAD DATA ADMIN ---
async function loadAdminData() {
  const [emps, divs, periods] = await Promise.all([
    employeeService.getAll(),
    divisionService.getAll(),
    periodService.getAll()
  ])
  
  adminStats.totalEmployees = emps.length
  adminStats.totalDivisions = divs.length
  
  const active = periods.find((p: any) => p.is_active)
  adminStats.activePeriod = active ? active.name : 'Tidak Ada'

  // Chart 1: Distribusi Pegawai
  const divCounts = divs.map((d: any) => {
    return emps.filter((e: any) => e.division_id === d.id).length
  })
  
  adminCharts.divisionOptions = {
    ...adminCharts.divisionOptions,
    xaxis: { categories: divs.map((d: any) => d.name) }
  }
  adminCharts.divisionSeries = [{ name: 'Jumlah Pegawai', data: divCounts }]

  // 5. LOGIC TOP 5 & LOW 5
  if (active) {
    try {
      const reports = await reportService.getEvaluationReport(active.id)
      const sorted = [...reports].sort((a: any, b: any) => b.total_score - a.total_score)
      adminStats.topPerformers = sorted.slice(0, 5)
      adminStats.lowPerformers = [...sorted].reverse().slice(0, 5)
    } catch (e) {
      console.warn("Gagal load top performers", e)
    }
  } else {
    adminStats.topPerformers = []
    adminStats.lowPerformers = []
  }

  // Chart 2: Status Aktif
  const activeCount = emps.filter((e: any) => e.is_active).length
  const inactiveCount = emps.length - activeCount
  adminCharts.statusSeries = [activeCount, inactiveCount]
}

// --- LOAD DATA MANAGER ---
async function loadManagerData() {
  const team = await managerService.getTeamStatus()
  const total = team.length
  const done = team.filter((t: any) => t.evaluation_status === 'submitted').length
  const draft = team.filter((t: any) => t.evaluation_status === 'draft').length
  const pending = total - done - draft
  
  managerStats.total = total
  managerStats.done = done
  managerStats.pending = total - done
  managerStats.percentage = total > 0 ? (done / total) * 100 : 0

  managerCharts.series = [done, draft, pending]
}

// --- LOAD DATA EMPLOYEE ---
async function loadEmployeeData() {
  try {
    const history = await myPerformanceService.getHistory()
    
    if (history && history.length > 0) {
      // Data terbaru (index 0 karena sort desc di backend)
      const latest = history[0]
      
      employeeStats.hasData = true
      employeeStats.score = latest.total_score
      employeeStats.periodName = latest.period_name || 'Periode Terakhir'
      employeeStats.grade = getGrade(latest.total_score)

      // Grafik Tren (Reverse agar chronological order: lama -> baru)
      const trendData = [...history].reverse().map((h: any) => h.total_score)
      employeeCharts.series = [{ name: 'Skor Kinerja', data: trendData }]
    } else {
        employeeStats.hasData = false
    }
  } catch (e) {
      console.warn("Failed to load employee data", e)
      employeeStats.hasData = false
  }
}

function getGrade(score: number) {
  if (score >= 86) return 'A'; if (score >= 71) return 'B';
  if (score >= 56) return 'C'; if (score >= 41) return 'D'; return 'E';
}
</script>
