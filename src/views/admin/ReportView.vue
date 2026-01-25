<template>
  <div>
    <Toast />

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Laporan & Rekapitulasi</h1>
      <p class="text-gray-600 text-sm mt-1">Unduh laporan hasil penilaian kinerja dalam format PDF.</p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-end gap-4">
      
      <div class="w-full md:max-w-xs">
        <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Periode Evaluasi</label>
        <select v-model="selectedPeriodId" class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
          <option value="" disabled>-- Pilih Periode --</option>
          <option v-for="p in periods" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.is_active ? 'Aktif' : 'Selesai' }})
          </option>
        </select>
      </div>
      
      <div class="flex gap-2 flex-1">
        <button 
          @click="fetchReport" 
          :disabled="!selectedPeriodId || isLoading"
          class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
        >
          <i class="pi pi-sync mr-2" :class="{'pi-spin': isLoading}"></i>
          <span v-if="isLoading">Memuat...</span>
          <span v-else>Tampilkan Data</span>
        </button>

        <button 
          v-if="reportData.length > 0"
          @click="exportToPDF"
          class="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center"
        >
          <i class="pi pi-file-pdf mr-2"></i>
          Export PDF
        </button>
      </div>

      <div v-if="reportData.length > 0" class="w-full md:w-64">
         <label class="block text-sm font-medium text-gray-700 mb-1">Cari di Laporan</label>
         <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-search text-gray-400"></i>
            </div>
            <input 
                v-model="filters['global'].value" 
                type="text"
                placeholder="Nama / NIP / Divisi..." 
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" v-if="hasSearched || reportData.length > 0">
      <DataTable 
        v-model:filters="filters"
        :value="reportData" 
        :paginator="true" 
        :rows="10" 
        :rowsPerPageOptions="[10, 20, 50]"
        :loading="isLoading"
        dataKey="nip"
        :globalFilterFields="['nip', 'employee_name', 'division', 'position', 'grade']"
        stripedRows 
        responsiveLayout="scroll"
        removableSort
      >
        <template #empty>
            <div class="text-center p-8 text-gray-500">
                <i class="pi pi-folder-open text-4xl mb-2"></i>
                <p>Tidak ada data penilaian untuk periode ini.</p>
            </div>
        </template>

        <Column field="nip" header="NIP" sortable style="width: 15%">
            <template #body="{ data }">
                <span class="font-mono text-gray-600">{{ data.nip }}</span>
            </template>
        </Column>

        <Column field="employee_name" header="Nama Pegawai" sortable style="width: 25%">
            <template #body="{ data }">
                <span class="font-bold text-gray-900">{{ data.employee_name }}</span>
            </template>
        </Column>

        <Column field="division" header="Divisi" sortable style="width: 20%">
            <template #body="{ data }">
                <span class="text-gray-700">{{ data.division }}</span>
            </template>
        </Column>

        <Column field="position" header="Jabatan" sortable style="width: 20%">
            <template #body="{ data }">
                <span class="text-gray-700">{{ data.position }}</span>
            </template>
        </Column>

        <Column field="total_score" header="Total Skor" sortable style="width: 10%">
            <template #body="{ data }">
                <span class="font-bold text-lg" :class="getScoreColor(data.total_score)">
                    {{ data.total_score.toFixed(2) }}
                </span>
            </template>
        </Column>

        <Column field="grade" header="Grade" sortable style="width: 10%">
            <template #body="{ data }">
                <span class="px-2 py-1 rounded text-xs font-bold border" :class="getGradeBadge(data.grade)">
                    {{ data.grade }}
                </span>
            </template>
        </Column>

      </DataTable>
    </div>

    <div v-else class="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
      <i class="pi pi-chart-bar text-4xl text-gray-300 mb-3"></i>
      <p class="text-gray-500">Silakan pilih periode dan klik "Tampilkan Data".</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { periodService, reportService } from '../../services/api'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'

// PrimeVue Imports
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

// Library PDF
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const toast = useToast()
const periods = ref<any[]>([])
const selectedPeriodId = ref('')
const reportData = ref<any[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)

// Filter Search Table
const filters = ref({
    global: { value: '', matchMode: 'contains' }, 
});

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
    const data = await reportService.getEvaluationReport(Number(selectedPeriodId.value))
    reportData.value = data || []
    
    if (reportData.value.length > 0) {
        toast.add({ severity: 'success', summary: 'Berhasil', detail: `${reportData.value.length} data dimuat`, life: 3000 })
    } else {
        toast.add({ severity: 'info', summary: 'Info', detail: 'Tidak ada data penilaian untuk periode ini', life: 3000 })
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengambil laporan', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

// Helper untuk Warna Skor
function getScoreColor(score: number) {
    if (score >= 86) return 'text-green-600'
    if (score >= 71) return 'text-blue-600'
    if (score >= 56) return 'text-yellow-600'
    return 'text-red-600'
}

// Helper untuk Badge Grade
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

function exportToPDF() {
  if (reportData.value.length === 0) return

  try {
    const doc = new jsPDF('l', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    
    // --- Header ---
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('PT. CAKRA MEDIA DATA', pageWidth / 2, 15, { align: 'center' })
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Jl. Raya Mambal Ubud - Br. Sigaran Desa Mekar Bhuana, Badung, Bali', pageWidth / 2, 21, { align: 'center' })
    
    doc.setLineWidth(0.5)
    doc.line(10, 30, pageWidth - 10, 30)

    // --- Judul ---
    const periodName = periods.value.find(p => p.id === Number(selectedPeriodId.value))?.name || '-'
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('LAPORAN REKAPITULASI PENILAIAN KINERJA', pageWidth / 2, 42, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Periode Evaluasi: ${periodName}`, pageWidth / 2, 49, { align: 'center' })

    // --- Tabel (Sorted by Score Descending) ---
    const sortedData = [...reportData.value].sort((a, b) => b.total_score - a.total_score)

    const tableBody = sortedData.map((row, index) => [
      index + 1,
      row.nip,
      row.employee_name,
      row.division,
      row.position,
      row.evaluator,
      row.total_score.toFixed(2),
      row.grade
    ])

    autoTable(doc, {
      startY: 55,
      head: [['No', 'NIP', 'Nama Pegawai', 'Divisi', 'Jabatan', 'Penilai', 'Skor', 'Grade']],
      body: tableBody,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
      headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center' },
        6: { halign: 'center', fontStyle: 'bold' },
        7: { halign: 'center', fontStyle: 'bold' }
      },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    })

    // --- Footer Tanda Tangan ---
    let finalY = (doc as any).lastAutoTable.finalY + 20
    if (finalY > pageHeight - 50) {
      doc.addPage()
      finalY = 30
    }

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

    // Download
    doc.save(`Laporan_KPI_${periodName.replace(/\s+/g, '_')}.pdf`)
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Laporan PDF berhasil diunduh', life: 3000 })

  } catch (e) {
    console.error(e)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal membuat PDF', life: 3000 })
  }
}
</script>
