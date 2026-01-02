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
    const data = await reportService.getEvaluationReport(Number(selectedPeriodId.value))
    reportData.value = data || []
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
    // 1. Setup Dokumen (Landscape, A4)
    const doc = new jsPDF('l', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    
    // --- A. KOP SURAT (Header) ---
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('PT. CAKRA MEDIA DATA', pageWidth / 2, 15, { align: 'center' })
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Jl. Raya Mambal Ubud - Br. Sigaran Desa Mekar Bhuana – Abiansemal, Mekar Bhuwana, Kec. Abiansemal, Kabupaten Badung, Bali 80352', pageWidth / 2, 21, { align: 'center' })
    doc.text('Telp: 081241078377 | Email: info@cakrasoft.net', pageWidth / 2, 26, { align: 'center' })
    
    // Garis Pemisah Kop Surat
    doc.setLineWidth(0.5)
    doc.line(10, 30, pageWidth - 10, 30)

    // --- B. JUDUL LAPORAN ---
    const periodName = periods.value.find(p => p.id === Number(selectedPeriodId.value))?.name || '-'
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('LAPORAN REKAPITULASI PENILAIAN KINERJA', pageWidth / 2, 42, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Periode Evaluasi: ${periodName}`, pageWidth / 2, 49, { align: 'center' })

    // --- C. TABEL DATA ---
    const tableBody = reportData.value.map((row, index) => [
      index + 1, // No Urut
      row.nip,
      row.employee_name,
      row.division,
      row.position,
      row.evaluator,
      row.total_score.toFixed(2), // Format 2 desimal
      row.grade
    ])

    autoTable(doc, {
      startY: 55,
      head: [['No', 'NIP', 'Nama Pegawai', 'Divisi', 'Jabatan', 'Penilai', 'Skor', 'Grade']],
      body: tableBody,
      theme: 'grid', // Tema Grid agar tegas
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [44, 62, 80], // Warna Biru Tua Elegan (Midnight Blue)
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center' // Header rata tengah
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 }, // No
        1: { halign: 'center' }, // NIP
        6: { halign: 'center', fontStyle: 'bold' }, // Skor (Bold)
        7: { halign: 'center', fontStyle: 'bold' }  // Grade (Bold)
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245] // Warna selang-seling abu muda
      }
    })

    // --- D. TANDA TANGAN (Footer) ---
    // Mengambil posisi Y terakhir setelah tabel selesai
    let finalY = (doc as any).lastAutoTable.finalY + 20
    
    // Cek jika tidak cukup ruang di halaman ini, buat halaman baru
    if (finalY > pageHeight - 50) {
      doc.addPage()
      finalY = 30
    }

    // Posisi Tanda Tangan (Kanan Bawah)
    const signX = pageWidth - 60
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Denpasar, ${today}`, signX, finalY, { align: 'center' })
    doc.text('Mengetahui,', signX, finalY + 6, { align: 'center' })
    doc.text('CEO PT. Cakra Media Data', signX, finalY + 11, { align: 'center' })
    
    // Ruang Tanda Tangan
    doc.setFont('helvetica', 'bold')
    doc.text('Bapak Khalil', signX, finalY + 40, { align: 'center' }) // Nama CEO
    doc.setLineWidth(0.2)
    doc.line(signX - 25, finalY + 41, signX + 25, finalY + 41) // Garis bawah nama

    // --- E. SAVE FILE ---
    doc.save(`Laporan_KPI_${periodName.replace(/\s+/g, '_')}.pdf`)
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Laporan PDF berhasil diunduh', life: 3000 })

  } catch (e) {
    console.error(e)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal membuat PDF', life: 3000 })
  }
}
</script>
