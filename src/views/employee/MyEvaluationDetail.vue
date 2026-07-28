<template>
  <div class="max-w-4xl mx-auto pb-10">
    <Toast />
    <div class="mb-6 flex justify-between items-center no-print">
      <button @click="$router.back()" class="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium transition-colors">
        <i class="pi pi-arrow-left mr-2"></i> Kembali
      </button>

      <div class="flex items-center gap-3">
        <button 
          v-if="data"
          @click="printReport" 
          class="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors shadow-sm"
        >
          <i class="pi pi-print mr-2"></i> Cetak Rapor (PDF)
        </button>

        <span v-if="data?.evaluation_header?.status === 'appealed'" class="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200 flex items-center gap-2">
          <i class="pi pi-clock"></i> Sanggahan Sedang Ditinjau Manajer
        </span>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- BLOK CETAK PDF RESMI (KHUSUS MUNCUL SAAT DI-PRINT / SAVE AS PDF) -->
    <!-- ================================================================= -->
    <div v-if="data" class="hidden print-block text-black bg-white">
      <!-- Kop Surat PT. Cakra Media Data -->
      <div class="text-center pb-4 border-b-2 border-black mb-6">
        <h1 class="text-2xl font-black uppercase tracking-wide">PT. CAKRA MEDIA DATA</h1>
        <p class="text-xs text-gray-700 mt-1">Jl. Raya Mambal Ubud - Br. Sigaran Desa Mekar Bhuana, Badung, Bali</p>
      </div>

      <!-- Judul Dokumen -->
      <div class="text-center mb-6">
        <h2 class="text-lg font-bold uppercase tracking-wider">RAPOR HASIL EVALUASI KINERJA PEGAWAI</h2>
        <p class="text-sm font-semibold mt-1">Periode Evaluasi: {{ data.period_detail?.name || '-' }}</p>
      </div>

      <!-- Biodata & Predikat Grade Besar -->
      <div class="flex justify-between items-stretch border border-black mb-6">
        <!-- Kiri: Data Pegawai -->
        <div class="p-4 flex-1 space-y-1.5 text-xs border-r border-black">
          <div class="flex"><span class="font-bold w-32 inline-block">Nama Pegawai</span><span>: {{ data.employee_detail?.name || '-' }}</span></div>
          <div class="flex"><span class="font-bold w-32 inline-block">NIP / ID</span><span>: {{ data.employee_detail?.nip || '-' }}</span></div>
          <div class="flex"><span class="font-bold w-32 inline-block">Divisi</span><span>: {{ data.employee_detail?.division_name || '-' }}</span></div>
          <div class="flex"><span class="font-bold w-32 inline-block">Jabatan</span><span>: {{ data.employee_detail?.position || '-' }}</span></div>
          <div class="flex"><span class="font-bold w-32 inline-block">Evaluator Penilai</span><span>: {{ data.evaluator_name || '-' }}</span></div>
        </div>
        <!-- Kanan: Predikat Besar -->
        <div class="p-4 w-52 flex flex-col items-center justify-center text-center bg-gray-50">
          <p class="text-[10px] font-bold uppercase tracking-widest text-gray-600">PREDIKAT KINERJA</p>
          <p class="text-5xl font-black text-black my-1.5">{{ getGrade(data.evaluation_header.total_score) }}</p>
          <p class="text-xs font-bold text-black">Skor Akhir: {{ data.evaluation_header.total_score.toFixed(2) }}</p>
        </div>
      </div>

      <!-- Tabel Indikator KPI Lengkap -->
      <div class="mb-6">
        <h3 class="text-xs font-bold uppercase mb-2">A. Rincian Penilaian Target & Capaian Indikator</h3>
        <table class="w-full border-collapse border border-black text-xs">
          <thead>
            <tr class="bg-gray-800 text-white print-table-header">
              <th class="border border-black p-2 text-center w-10">No</th>
              <th class="border border-black p-2 text-left">Indikator Kinerja</th>
              <th class="border border-black p-2 text-center w-16">Bobot</th>
              <th class="border border-black p-2 text-center w-20">Skor (1-5)</th>
              <th class="border border-black p-2 text-center w-24">Konversi</th>
              <th class="border border-black p-2 text-center w-28">Status Target</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(score, idx) in data.scores" :key="'pdf-'+score.id">
              <td class="border border-black p-2 text-center font-semibold">{{ idx + 1 }}</td>
              <td class="border border-black p-2">
                <div class="font-bold text-black">{{ score.indicator.name }}</div>
                <div class="text-[10px] text-gray-600">{{ score.indicator.description || '-' }}</div>
              </td>
              <td class="border border-black p-2 text-center font-bold">{{ score.indicator.weight }}%</td>
              <td class="border border-black p-2 text-center font-bold">{{ score.score }} / 5</td>
              <td class="border border-black p-2 text-center font-bold">{{ ((score.score / 5) * 100).toFixed(1) }}</td>
              <td class="border border-black p-2 text-center font-bold">
                <span v-if="score.score >= 4">Terpenuhi (Sangat Baik)</span>
                <span v-else-if="score.score >= 3">Terpenuhi (Sesuai)</span>
                <span v-else>Perlu Peningkatan</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Catatan & Umpan Balik Manajer -->
      <div class="mb-8">
        <h3 class="text-xs font-bold uppercase mb-2">B. Umpan Balik Evaluator</h3>
        <div class="border border-black p-3 text-xs italic min-h-[45px] bg-gray-50">
          "{{ data.evaluation_header.feedback || 'Tidak ada catatan tambahan.' }}"
        </div>
      </div>

      <!-- Tanda Tangan Formal -->
      <div class="flex justify-between mt-12 text-xs px-4">
        <div class="text-center w-52">
          <p class="mb-1">Penerima Rapor,</p>
          <p class="mb-16">Pegawai yang Dinilai</p>
          <p class="font-bold underline">{{ data.employee_detail?.name || 'Pegawai' }}</p>
          <p class="text-gray-600">NIP: {{ data.employee_detail?.nip || '-' }}</p>
        </div>
        <div class="text-center w-56">
          <p class="mb-1">Badung, {{ new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
          <p class="mb-16">Mengetahui,<br>Evaluator / Manajer</p>
          <p class="font-bold underline">{{ data.evaluator_name || 'Manajer Penilai' }}</p>
          <p class="text-gray-600">PT. Cakra Media Data</p>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- TAMPILAN INTERAKTIF BROWSER (DISEMBUNYIKAN SAAT DI-PRINT / PDF) -->
    <!-- ================================================================= -->
    <div v-if="isLoading" class="flex justify-center py-20 no-print">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  
    <div v-else-if="data" class="no-print">
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg text-white p-8 mb-8 flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold mb-1">{{ getGrade(data.evaluation_header.total_score) }}</h1>
            <p class="text-blue-100 text-lg">Skor Akhir: {{ data.evaluation_header.total_score.toFixed(2) }}</p>
        </div>
        
        <button 
            v-if="data.evaluation_header.status === 'submitted'" 
            @click="showAppealModal = true"
            class="bg-white text-blue-700 hover:bg-gray-100 font-bold py-2 px-4 rounded-lg shadow transition-colors"
        >
            Ajukan Sanggahan
        </button>
      </div>
  
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 class="text-lg font-bold text-gray-800 mb-3">Umpan Balik Manajer</h3>
        <div class="bg-gray-50 p-4 rounded-lg text-gray-700 italic border-l-4 border-orange-400">
          "{{ data.evaluation_header.feedback || 'Tidak ada catatan.' }}"
        </div>
      </div>
  
      <h3 class="text-lg font-bold text-gray-800 mb-4">Rincian Penilaian</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="score in data.scores" :key="score.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-bold text-gray-900">{{ score.indicator.name }}</h4>
            <span class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{{ score.indicator.weight }}%</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-600">Nilai:</span>
            <span class="text-xl font-bold text-blue-600">{{ score.score }} <span class="text-xs text-gray-400">/ 5</span></span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAppealModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-2">Ajukan Sanggahan Nilai</h2>
        <p class="text-sm text-gray-500 mb-4">Silakan jelaskan alasan keberatan Anda dan lampirkan bukti fisik (opsional).</p>

        <!-- TAMBAHAN BARU: Pilihan Indikator -->
        <div class="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label class="block text-sm font-bold text-gray-800 mb-2">Pilih Indikator yang Disanggah <span class="text-red-500">*</span></label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="score in data.scores" :key="'chk-'+score.id" class="flex items-start">
                    <input 
                        type="checkbox" 
                        :id="'chk-'+score.id" 
                        :value="score.indicator.name" 
                        v-model="appealForm.selectedIndicators" 
                        class="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    >
                    <label :for="'chk-'+score.id" class="ml-2 text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
                        {{ score.indicator.name }}
                    </label>
                </div>
            </div>
        </div>
        
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alasan Detail</label>
                <textarea 
                    v-model="appealForm.reason" 
                    rows="4" 
                    class="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Jelaskan alasan keberatan Anda di sini..."
                ></textarea>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Lampiran Bukti (Gambar / Dokumen)</label>
                <input 
                    type="file" 
                    @change="handleFileUpload" 
                    class="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
            <button @click="showAppealModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Batal</button>
            <button 
                @click="submitAppeal" 
                :disabled="isSubmitting || !appealForm.reason"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
                <i v-if="isSubmitting" class="pi pi-spin pi-spinner mr-2"></i>
                {{ isSubmitting ? 'Mengirim...' : 'Kirim Sanggahan' }}
            </button>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script setup lang="ts">
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { myPerformanceService } from '../../services/api'
 
const route = useRoute()
const toast = useToast()
const data = ref<any>(null)
const isLoading = ref(true)

// State untuk Modal Sanggahan
const showAppealModal = ref(false)
const isSubmitting = ref(false)
const appealForm = reactive({
    selectedIndicators: [] as string[], // <-- BARIS BARU
    reason: '',
    file: null as File | null
})
 
onMounted(async () => {
    fetchData()
})

async function fetchData() {
    isLoading.value = true
    try {
        const id = Number(route.params.id)
        data.value = await myPerformanceService.getDetail(id)
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat detail', life: 3000 })
    } finally {
        isLoading.value = false
    }
}

// Menangkap file yang diupload user
function handleFileUpload(event: any) {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        appealForm.file = target.files[0]
    }
}

// Mengirim data ke Golang (multipart/form-data)
async function submitAppeal() {
    if (appealForm.selectedIndicators.length === 0) {
        toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Pilih minimal satu indikator yang ingin disanggah', life: 3000 })
        return
    }

    isSubmitting.value = true
    try {
        const formData = new FormData()
        const combinedReason = `[Indikator yang Disanggah: ${appealForm.selectedIndicators.join(', ')}]\n\nAlasan Detail:\n${appealForm.reason}`
        formData.append('appeal_reason', combinedReason)
        if (appealForm.file) {
            formData.append('evidence_file', appealForm.file)
        }

        // Pastikan Anda memanggil instance axios yang memiliki token (misal: apiClient)
        // Sesuaikan dengan konfigurasi axios di service Anda
        await myPerformanceService.submitAppeal(data.value.evaluation_header.id, formData)
        
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Sanggahan berhasil dikirim ke manajer', life: 3000 })
        showAppealModal.value = false
        fetchData() // Refresh data agar status berubah jadi 'appealed'

    } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengirim sanggahan', life: 3000 })
    } finally {
        isSubmitting.value = false
    }
}
 
function getGrade(score: number) {
  if (score >= 86) return 'A'
  if (score >= 71) return 'B'
  if (score >= 56) return 'C'
  if (score >= 41) return 'D'
  return 'E'
}

function printReport() {
  window.print()
}
</script>

<style scoped>
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm;
  }
  .no-print { display: none !important; }
  .print-block { display: block !important; }
  .print-flex { display: flex !important; }
  body, p, h1, h2, h3, h4, div, span { color: #000 !important; }
  .bg-gradient-to-r { background: none !important; border: 2px solid #000 !important; color: #000 !important; }
  .text-white, .text-blue-100 { color: #000 !important; }
  .shadow-sm, .shadow-lg { box-shadow: none !important; }
}
</style>
