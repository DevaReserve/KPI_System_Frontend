<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="mb-6">
      <button @click="$router.push('/')" class="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium mb-4">
        <i class="pi pi-arrow-left"></i> Kembali ke Dashboard
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Catatan Pelanggaran & Peringatan</h1>
      <p class="text-gray-500 text-sm">Berikut adalah riwayat surat peringatan yang diterbitkan untuk Anda.</p>
    </div>

    <div v-if="isLoading" class="text-center py-20">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
    </div>

    <div v-else-if="warnings.length > 0" class="space-y-4">
        <div v-for="warn in warnings" :key="warn.id" class="bg-white border-l-4 border-red-500 rounded-r-xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
            <div class="flex flex-col items-center justify-center min-w-[100px]">
                <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl border-4 border-white shadow-md">
                    {{ warn.level }}
                </div>
                <span class="text-xs text-gray-400 mt-2 font-medium">{{ formatDate(warn.issued_at) }}</span>
            </div>

            <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ warn.reason }}</h3>
                <p class="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                    "{{ warn.description || 'Tidak ada deskripsi detail.' }}"
                </p>
                <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div class="flex items-center gap-2 text-xs text-gray-400">
                        <i class="pi pi-user-edit"></i>
                        <span>Diterbitkan oleh: <span class="font-bold text-gray-600">{{ warn.issuer?.name || 'Management' }}</span></span>
                    </div>
                    
                    <button 
                        @click="downloadSuratSP(warn)"
                        class="text-xs bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded transition-colors font-medium border border-red-200 hover:border-red-600 flex items-center gap-2"
                    >
                        <i class="pi pi-download"></i> Unduh PDF
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-check text-3xl text-green-600"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-800">Bersih!</h3>
        <p class="text-gray-500">Anda tidak memiliki catatan pelanggaran aktif.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { warningService } from '../../services/api'
import jsPDF from 'jspdf'

const warnings = ref<any[]>([])
const isLoading = ref(true)

// Karena ini halaman employee, kita bisa mengambil nama employee dari data yang login (disimpan di localStorage)
const employeeName = ref(localStorage.getItem('user_name') || 'Karyawan')

onMounted(async () => {
    try {
        warnings.value = await warningService.getMyWarnings()
    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
})

function formatDate(d: string) {
    if(!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function downloadSuratSP(warn: any) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.width
    
    // 1. KOP SURAT
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('PT. CAKRA MEDIA DATA', pageWidth / 2, 20, { align: 'center' })
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Jl. Raya Mambal Ubud - Br. Sigaran Desa Mekar Bhuana, Badung, Bali', pageWidth / 2, 26, { align: 'center' })
    doc.text('Email: hrd@cakramediadata.com | Telp: (0361) 123456', pageWidth / 2, 31, { align: 'center' })
    
    // Garis Kop Surat
    doc.setLineWidth(1)
    doc.line(15, 35, pageWidth - 15, 35)
    doc.setLineWidth(0.3)
    doc.line(15, 36, pageWidth - 15, 36)

    // 2. NOMOR & PERIHAL
    const today = new Date(warn.issued_at || new Date())
    const monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][today.getMonth()]
    const letterNumber = `0${warn.id}/HRD-CMD/SP-${warn.level.replace('SP', '')}/${monthRoman}/${today.getFullYear()}`

    doc.setFontSize(11)
    doc.text(`Nomor    : ${letterNumber}`, 15, 50)
    doc.text(`Lampiran : -`, 15, 56)
    
    doc.setFont('helvetica', 'bold')
    doc.text(`Perihal  : Surat Peringatan ${warn.level.replace('SP', '')} (${warn.level})`, 15, 62)

    // 3. TUJUAN SURAT
    doc.setFont('helvetica', 'normal')
    doc.text('Kepada Yth,', 15, 75)
    doc.setFont('helvetica', 'bold')
    doc.text(`Sdr/i. ${employeeName.value}`, 15, 81)
    doc.setFont('helvetica', 'normal')
    doc.text('di Tempat', 15, 87)

    // 4. ISI SURAT (Diambil dari database Golang)
    doc.text('Dengan hormat,', 15, 105)
    
    const p1 = `Melalui surat ini, Manajemen PT Cakra Media Data memberikan ${warn.level} kepada Saudara/i atas evaluasi kinerja dan kedisiplinan.`
    const splitP1 = doc.splitTextToSize(p1, pageWidth - 30)
    doc.text(splitP1, 15, 113)

    // Alasan Utama Pelanggaran
    doc.setFont('helvetica', 'bold')
    const splitP2 = doc.splitTextToSize(`Pelanggaran: ${warn.reason}`, pageWidth - 30)
    let currentY = 113 + (splitP1.length * 6) + 4
    doc.text(splitP2, 15, currentY)
    
    // Deskripsi Tambahan
    doc.setFont('helvetica', 'normal')
    const splitP3 = doc.splitTextToSize(`Catatan: ${warn.description || 'Tidak ada catatan tambahan.'}`, pageWidth - 30)
    currentY = currentY + (splitP2.length * 6) + 2
    doc.text(splitP3, 15, currentY)

    const p4 = `Kami sangat berharap Saudara/i dapat segera memperbaiki kinerja. Apabila di kemudian hari masih terjadi pelanggaran atau tidak ada peningkatan performa, perusahaan akan mengambil tindakan tegas sesuai dengan peraturan perusahaan yang berlaku.`
    const splitP4 = doc.splitTextToSize(p4, pageWidth - 30)
    currentY = currentY + (splitP3.length * 6) + 6
    doc.text(splitP4, 15, currentY)

    currentY = currentY + (splitP4.length * 6) + 8
    doc.text('Demikian Surat Peringatan ini dibuat agar menjadi perhatian.', 15, currentY)

    // 5. TANDA TANGAN
    currentY = currentY + 25
    const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    
    doc.text(`Badung, ${dateStr}`, pageWidth - 45, currentY, { align: 'center' })
    doc.text('PT. Cakra Media Data', pageWidth - 45, currentY + 6, { align: 'center' })
    
    // Tanda Tangan Manajer yang menerbitkan (Jika otomatis, maka HRD)
    doc.setFont('helvetica', 'bold')
    const issuerName = warn.issuer?.name || 'HRD Management'
    doc.text(issuerName, pageWidth - 45, currentY + 30, { align: 'center' })
    doc.setLineWidth(0.2)
    doc.line(pageWidth - 75, currentY + 31, pageWidth - 15, currentY + 31)

    // Penerima
    doc.text('Mengetahui / Menerima,', 45, currentY + 6, { align: 'center' })
    doc.text(employeeName.value, 45, currentY + 30, { align: 'center' })
    doc.setLineWidth(0.2)
    doc.line(15, currentY + 31, 75, currentY + 31)

    // 6. SAVE FILE
    doc.save(`Surat_${warn.level}_${employeeName.value.replace(/\s+/g, '_')}.pdf`)
    
  } catch (error) {
    console.error("Gagal cetak PDF:", error)
    alert("Gagal mengunduh PDF.")
  }
}
</script>
