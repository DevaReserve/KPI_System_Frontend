<template>
  <div class="max-w-5xl mx-auto pb-20 print:pb-0 print:max-w-full">
    
    <div class="flex items-center justify-between mb-6 no-print">
      <div>
        <button @click="$router.back()" class="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium transition-colors mb-2">
          <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali
        </button>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isReadOnly ? 'Rincian Penilaian' : 'Form Penilaian Kinerja' }}
        </h1>
        <p class="text-gray-600 text-sm mt-1">
          Pegawai: <span class="font-semibold">{{ employeeName }}</span> | Periode: {{ periodName }}
        </p>
      </div>
      
      <div class="flex gap-3">
        <button v-if="isReadOnly" @click="printReport" class="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Cetak Laporan
        </button>

        <div v-if="evaluationStatus" :class="`px-3 py-2 rounded-full text-xs font-bold uppercase flex items-center ${statusColor}`">
          {{ evaluationStatus }}
        </div>
      </div>
    </div>

    <div class="hidden print-block mb-8 border-b-2 border-black pb-4">
      <div class="flex items-center justify-between">
        <div class="text-left">
          <h1 class="text-2xl font-bold uppercase">PT. Cakra Media Data</h1>
          <p class="text-sm">Jalan Teknologi No. 123, Denpasar, Bali</p>
          <p class="text-sm">Telp: (0361) 123456 | Email: hr@cakramedia.com</p>
        </div>
        <div class="text-right">
          <h2 class="text-xl font-bold text-gray-600">LAPORAN HASIL PENILAIAN</h2>
          <p class="text-sm">Periode: {{ periodName }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 print:border-black print:shadow-none">
      <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2 print:text-black">Data Pegawai</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div><span class="text-gray-500 print:text-black font-semibold w-24 inline-block">Nama:</span> {{ employeeName }}</div>
        <div><span class="text-gray-500 print:text-black font-semibold w-24 inline-block">Divisi:</span> {{ divisionName || '-' }}</div>
        <div><span class="text-gray-500 print:text-black font-semibold w-24 inline-block">Jabatan:</span> {{ positionName || '-' }}</div>
        <div><span class="text-gray-500 print:text-black font-semibold w-24 inline-block">Penilai:</span> {{ evaluatorName }}</div>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12 no-print">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <div v-else>
      <div v-if="isReadOnly" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 no-print">
        <div class="flex">
          <div class="flex-shrink-0"><svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg></div>
          <div class="ml-3"><p class="text-sm text-yellow-700">Penilaian ini sudah disubmit (Final). Anda hanya dapat melihat rinciannya.</p></div>
        </div>
      </div>

      <div class="space-y-6">
        <div v-for="(score, index) in form.scores" :key="score.score_id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:border-black print:shadow-none print:break-inside-avoid">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-lg font-bold text-gray-800 print:text-black">
                {{ index + 1 }}. {{ score.indicator_name }}
              </h3>
              <p class="text-sm text-gray-500 mt-1 italic no-print">{{ score.indicator_desc || 'Tidak ada deskripsi detail.' }}</p>
            </div>
            <div class="bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-bold print:bg-gray-100 print:text-black">
              Bobot: {{ score.weight }}%
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 no-print-flex">
            <div class="md:col-span-3">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Skor (1-5)</label>
              <select v-model="score.score" :disabled="isReadOnly" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-500">
                <option :value="0" disabled>Pilih Nilai</option>
                <option :value="1">1 - Sangat Kurang</option>
                <option :value="2">2 - Kurang</option>
                <option :value="3">3 - Cukup</option>
                <option :value="4">4 - Baik</option>
                <option :value="5">5 - Sangat Baik</option>
              </select>
            </div>
            <div class="md:col-span-9">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Catatan / Bukti Dukung</label>
              <textarea v-model="score.notes" :disabled="isReadOnly" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:text-gray-500" placeholder="Berikan alasan penilaian..."></textarea>
            </div>
          </div>

          <div class="hidden print-block mt-2 border-t border-gray-300 pt-2 text-sm">
            <div class="flex justify-between mb-1">
              <span><strong>Nilai:</strong> {{ score.score }} / 5</span>
              <span><strong>Nilai Terkonversi:</strong> {{ (score.score / 5 * 100).toFixed(0) }}</span>
            </div>
            <div><strong>Catatan:</strong> {{ score.notes || '-' }}</div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6 print:border-black print:shadow-none print:break-inside-avoid">
          <h3 class="text-lg font-bold text-gray-800 mb-4 print:text-black">Kesimpulan Akhir</h3>
          
          <div class="mb-4 p-4 bg-blue-50 rounded-lg print:bg-white print:border print:border-black">
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold text-blue-900 print:text-black">TOTAL SKOR AKHIR</span>
              <span class="text-3xl font-extrabold text-blue-600 print:text-black">{{ calculateTotalScore }}</span>
            </div>
          </div>

          <label class="block text-xs font-bold text-gray-500 uppercase mb-1 no-print">Umpan Balik</label>
          <textarea v-model="form.feedback" :disabled="isReadOnly" rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 print:border-none print:bg-transparent print:p-0 print:resize-none" placeholder="Tuliskan masukan untuk pengembangan pegawai ke depan..."></textarea>
        </div>
      </div>

      <div class="hidden print-flex mt-16 justify-between text-center px-10">
        <div>
          <p class="mb-16">Dinilai Oleh,</p>
          <p class="font-bold underline">{{ evaluatorName }}</p>
          <p class="text-sm">Evaluator</p>
        </div>
        <div>
          <p class="mb-16">Mengetahui,</p>
          <p class="font-bold underline">{{ employeeName }}</p>
          <p class="text-sm">Pegawai</p>
        </div>
      </div>

      <div v-if="!isReadOnly" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 no-print">
        <div class="max-w-5xl mx-auto flex justify-between items-center">
          <div class="text-sm text-gray-500">Pastikan semua indikator telah dinilai sebelum finalisasi.</div>
          <div class="flex gap-3">
            <button @click="saveDraft" :disabled="isProcessing" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50">
              {{ isProcessing ? 'Menyimpan...' : 'Simpan Draft' }}
            </button>
            <button @click="submitFinal" :disabled="isProcessing || !isFormComplete" class="px-6 py-2 bg-blue-600 rounded-lg text-white font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
              {{ isProcessing ? 'Memproses...' : 'Kirim Finalisasi' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { managerService } from '../../services/api'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const isProcessing = ref(false)

// State Data
const employeeName = ref('')
const divisionName = ref('') // Tambahan untuk print
const positionName = ref('') // Tambahan untuk print
const evaluatorName = ref('') // Tambahan untuk print
const periodName = ref('')
const evaluationStatus = ref('')

const form = reactive({
  evaluation_id: 0,
  feedback: '',
  scores: [] as any[]
})

const isReadOnly = computed(() => evaluationStatus.value === 'submitted')

const statusColor = computed(() => {
  if (evaluationStatus.value === 'submitted') return 'bg-green-100 text-green-800'
  return 'bg-yellow-100 text-yellow-800'
})

const isFormComplete = computed(() => {
  return form.scores.length > 0 && form.scores.every(s => s.score > 0)
})

const calculateTotalScore = computed(() => {
  let total = 0
  form.scores.forEach(s => {
    // Rumus: (Skor / 5) * Bobot
    total += (s.score / 5) * s.weight
  })
  return total.toFixed(2)
})

onMounted(async () => {
  try {
    const evalId = Number(route.params.id)
    if (isNaN(evalId)) throw new Error("ID Evaluasi tidak valid")

    const data = await managerService.getEvaluationDetail(evalId)
    
    if (!data || !data.evaluation_header) throw new Error("Data evaluasi kosong")

    form.evaluation_id = data.evaluation_header.id
    form.feedback = data.evaluation_header.feedback || ''
    evaluationStatus.value = data.evaluation_header.status
    
    // Mapping Data Detail (Pastikan backend kirim ini di field employee_detail)
    employeeName.value = data.employee_detail?.name || '-'
    divisionName.value = data.employee_detail?.division?.name || '-' 
    positionName.value = data.employee_detail?.position || '-'
    evaluatorName.value = data.evaluator_name || 'Admin/Manager'
    periodName.value = data.period_detail?.name || '-'

    if (data.scores && Array.isArray(data.scores)) {
      form.scores = data.scores.map((s: any) => {
        const ind = s.Indicator || s.indicator || {} 
        return {
          score_id: s.id,
          indicator_name: ind.name || 'Indikator', 
          indicator_desc: ind.description || '', 
          weight: ind.weight || 0,
          score: s.score || 0,
          notes: s.notes || ''
        }
      })
    }
  } catch (error: any) {
    alert('Gagal memuat data penilaian')
    router.push('/manager/team')
  } finally {
    isLoading.value = false
  }
})

async function saveDraft() {
  if (isReadOnly.value) return
  await sendData(false)
}

async function submitFinal() {
  if (isReadOnly.value) return
  if (confirm("Kirim nilai final? Data tidak bisa diubah lagi.")) {
    await sendData(true)
  }
}

async function sendData(isFinal: boolean) {
  try {
    isProcessing.value = true
    const payload = {
      feedback: form.feedback,
      scores: form.scores.map(s => ({
        score_id: s.score_id,
        score: Number(s.score),
        notes: s.notes
      }))
    }
    await managerService.submitEvaluation(form.evaluation_id, payload)
    
    if(isFinal) {
        alert('Penilaian berhasil dikirim!')
        router.push('/manager/team')
    } else {
        alert('Draft tersimpan (Simulasi)')
    }
  } catch (error: any) {
    alert(error.response?.data?.message || 'Gagal menyimpan')
  } finally {
    isProcessing.value = false
  }
}

function printReport() {
  window.print()
}
</script>

<style scoped>
/* CSS KHUSUS UNTUK CETAK/PRINT */
@media print {
  /* Sembunyikan elemen navigasi dan tombol */
  .no-print, nav, aside, .sidebar {
    display: none !important;
  }
  
  /* Tampilkan elemen khusus print */
  .print-block {
    display: block !important;
  }
  
  .print-flex {
    display: flex !important;
  }

  /* Reset layout agar full width kertas */
  .max-w-5xl {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Warna text hitam pekat agar jelas */
  body, p, h1, h2, h3, div, span {
    color: #000 !important;
  }

  /* Border tabel/kotak lebih tegas */
  .border {
    border-color: #000 !important;
  }
  
  /* Hilangkan background warna warni */
  .bg-blue-50, .bg-yellow-50, .bg-green-100 {
    background-color: transparent !important;
  }
  
  /* Hapus shadow */
  .shadow-sm, .shadow-lg {
    box-shadow: none !important;
  }
  
  /* Form input jadi text biasa */
  select, textarea {
    border: none !important;
    background: transparent !important;
    resize: none;
    padding: 0;
  }
  
  /* Sembunyikan dropdown arrow */
  select {
    appearance: none;
    -webkit-appearance: none;
  }
  
  /* Agar halaman tidak terpotong jelek */
  .break-inside-avoid {
    page-break-inside: avoid;
  }
}

/* Helper untuk menyembunyikan elemen print di layar biasa */
.hidden {
  display: none;
}
</style>
