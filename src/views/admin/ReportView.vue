<template>
  <div>
    <Toast />

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Laporan & Rekapitulasi</h1>
      <p class="text-gray-600 text-sm mt-1">Unduh laporan hasil penilaian kinerja dalam format PDF.</p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
      <div class="w-full sm:max-w-xs">
        <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Periode Evaluasi</label>
        <select v-model="selectedPeriodId" class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500">
          <option value="" disabled>-- Pilih Periode --</option>
          <option v-for="p in periods" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.is_active ? 'Aktif' : 'Selesai' }})
          </option>
        </select>
      </div>
      
      <div class="flex gap-2">
        <button 
          @click="fetchReport" 
          :disabled="!selectedPeriodId || isLoading"
          class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 flex-1 sm:flex-none justify-center flex"
        >
          <span v-if="isLoading">Memuat...</span>
          <span v-else>Tampilkan</span>
        </button>

        <button 
          v-if="reportData.length > 0"
          @click="exportToPDF"
          class="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center flex-1 sm:flex-none"
        >
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Export PDF
        </button>
      </div>
    </div>

    <div v-if="reportData.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
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
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total Skor</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Grade</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(row, idx) in reportData" :key="idx" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900">{{ row.nip }}</td>
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ row.employee_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ row.division }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ row.position }}</td>
              <td class="px-6 py-4 text-sm font-bold text-blue-600">{{ row.total_score.toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm">
                <span class="px-2 py-1 rounded text-xs font-bold bg-gray-100 border border-gray-300">{{ row.grade }}</span>
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
// Import Library PDF
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat periode', life: 3000 })
  }
})

async function fetchReport() {
  if (!selectedPeriodId.value) return
  isLoading.value = true
  hasSearched.value = true
  try {
    reportData.value = await reportService.getEvaluationReport(Number(selectedPeriodId.value))
    if (reportData.value.length > 0) {
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data dimuat', life: 3000 })
    } else {
        toast.add({ severity: 'info', summary: 'Info', detail: 'Tidak ada data', life: 3000 })
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengambil laporan', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

function exportToPDF() {
  if (reportData.value.length === 0) return

  try {
    const doc = new jsPDF()
    const periodName = periods.value.find(p => p.id === Number(selectedPeriodId.value))?.name || '-'

    // 1. Header PDF
    doc.setFontSize(16)
    doc.text('LAPORAN REKAPITULASI PENILAIAN KINERJA', 14, 20)
    doc.setFontSize(11)
    doc.text(`Periode: ${periodName}`, 14, 28)
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 34)

    // 2. Persiapan Data Tabel
    const tableBody = reportData.value.map(row => [
      row.nip,
      row.employee_name,
      row.division,
      row.position,
      row.evaluator,
      row.total_score.toFixed(2),
      row.grade
    ])

    autoTable(doc, {
      startY: 40,
      head: [['NIP', 'Nama Pegawai', 'Divisi', 'Jabatan', 'Penilai', 'Skor', 'Grade']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' }, // Warna Header Biru
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    })

    doc.save(`Laporan_KPI_${periodName.replace(/\s+/g, '_')}.pdf`)
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Laporan PDF berhasil diunduh', life: 3000 })

  } catch (e) {
    console.error(e)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal membuat PDF', life: 3000 })
  }
}
</script>
