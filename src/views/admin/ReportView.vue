<template>
  <div>
    <Toast />

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Laporan & Rekapitulasi</h1>
      <p class="text-gray-600 text-sm mt-1">Unduh data hasil penilaian kinerja pegawai untuk periode tertentu.</p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-end gap-4">
      <div class="w-full max-w-xs">
        <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Periode Evaluasi</label>
        <select v-model="selectedPeriodId" class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500">
          <option value="" disabled>-- Pilih Periode --</option>
          <option v-for="p in periods" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.is_active ? 'Aktif' : 'Selesai' }})
          </option>
        </select>
      </div>
      
      <button 
        @click="fetchReport" 
        :disabled="!selectedPeriodId || isLoading"
        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">Memuat...</span>
        <span v-else>Tampilkan Data</span>
      </button>

      <button 
        v-if="reportData.length > 0"
        @click="exportToCSV"
        class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Excel
      </button>
    </div>

    <div v-if="reportData.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 class="font-bold text-gray-700">Preview Data ({{ reportData.length }} Pegawai)</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">NIP</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Divisi</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Jabatan</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Penilai</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Skor</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Grade</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(row, idx) in reportData" :key="idx" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900">{{ row.nip }}</td>
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ row.employee_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ row.division }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ row.position }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ row.evaluator }}</td>
              <td class="px-6 py-4 text-sm font-bold text-blue-600">{{ row.total_score.toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm">
                <span class="px-2 py-1 rounded text-xs font-bold bg-gray-100 border border-gray-300">
                  {{ row.grade }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="hasSearched" class="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
      <p class="text-gray-500">Tidak ada data penilaian yang selesai (submitted) untuk periode ini.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { periodService, reportService } from '../../services/api'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'

const toast = useToast()
const periods = ref<any[]>([])
const selectedPeriodId = ref('')
const reportData = ref<any[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)

onMounted(async () => {
  try {
    periods.value = await periodService.getAll()
  } catch (e) { 
    console.error(e)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat daftar periode', life: 3000 })
  }
})

async function fetchReport() {
  if (!selectedPeriodId.value) return
  isLoading.value = true
  hasSearched.value = true
  try {
    reportData.value = await reportService.getEvaluationReport(Number(selectedPeriodId.value))
    if (reportData.value.length > 0) {
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data laporan berhasil dimuat', life: 3000 })
    } else {
        toast.add({ severity: 'info', summary: 'Info', detail: 'Tidak ada data untuk periode ini', life: 3000 })
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengambil data laporan', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

function exportToCSV() {
  if (reportData.value.length === 0) return

  try {
    const headers = ['NIP,Nama Pegawai,Divisi,Jabatan,Penilai,Total Skor,Grade,Feedback']
    const rows = reportData.value.map(row => {
        return [
        `"${row.nip}"`,
        `"${row.employee_name}"`,
        `"${row.division}"`,
        `"${row.position}"`,
        `"${row.evaluator}"`,
        row.total_score.toFixed(2),
        row.grade,
        `"${(row.feedback || '').replace(/"/g, '""')}"`
        ].join(',')
    })

    const csvContent = headers.concat(rows).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    
    const periodName = periods.value.find(p => p.id === Number(selectedPeriodId.value))?.name || 'Report'
    link.setAttribute('download', `Laporan_KPI_${periodName}.csv`)
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.add({ severity: 'success', summary: 'Terkirim', detail: 'File Excel berhasil diunduh', life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengunduh file', life: 3000 })
  }
}
</script>
