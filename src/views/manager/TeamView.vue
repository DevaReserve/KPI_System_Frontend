<template>
  <div>
    <Toast />

    <div class="mb-6 flex justify-between items-center no-print">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Tim Saya</h1>
        <p class="text-gray-600 text-sm mt-1">Daftar pegawai di bawah supervisi Anda.</p>
      </div>
      <button 
        @click="printTeamReport" 
        :disabled="!isAllEvaluated"
        class="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        :title="!isAllEvaluated ? 'Semua bawahan harus dinilai terlebih dahulu untuk mengaktifkan cetak rekap' : 'Cetak Rekap Tim (PDF)'"
      >
        <i class="pi pi-print mr-2"></i> Cetak Rekap Tim (PDF)
      </button>
    </div>

    <!-- CONTAINER CETAK RESMI REKAPITULASI TIM (PT. CAKRA MEDIA DATA) -->
    <div class="hidden print-block text-black bg-white w-full">
      <!-- Kop Surat Tengah -->
      <div class="text-center pb-4 border-b-2 border-black mb-6">
        <h1 class="text-2xl font-black uppercase tracking-wide">PT. CAKRA MEDIA DATA</h1>
        <p class="text-xs text-gray-700 mt-1">Jl. Raya Mambal Ubud - Br. Sigaran Desa Mekar Bhuana, Badung, Bali</p>
      </div>

      <!-- Judul Laporan -->
      <div class="text-center mb-6">
        <h2 class="text-lg font-bold uppercase tracking-wider">LAPORAN REKAPITULASI PENILAIAN KINERJA TIM</h2>
        <p class="text-sm font-semibold mt-1">Tanggal Cetak: {{ new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
      </div>

      <!-- TABEL CETAK KHUSUS -->
      <div class="mb-8">
        <table class="w-full border-collapse border border-black text-xs">
          <thead>
            <tr class="bg-gray-100 text-black print-table-header">
              <th class="border border-black p-2 text-center w-12">No</th>
              <th class="border border-black p-2 text-left">Nama Pegawai</th>
              <th class="border border-black p-2 text-center w-24">Skor Akhir</th>
              <th class="border border-black p-2 text-center w-16">Grade</th>
              <th class="border border-black p-2 text-left">Status Penilaian</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in evaluatedTeamMembers" :key="'print-'+item.employee_id">
              <td class="border border-black p-2 text-center">{{ idx + 1 }}</td>
              <td class="border border-black p-2 font-bold">{{ item.employee_name }}</td>
              <td class="border border-black p-2 text-center">{{ item.total_score !== undefined ? item.total_score.toFixed(2) : '0.00' }}</td>
              <td class="border border-black p-2 text-center font-bold">{{ item.total_score !== undefined ? getGrade(item.total_score) : '-' }}</td>
              <td class="border border-black p-2">
                <span v-if="item.evaluation_status === 'submitted'" class="text-green-800 font-bold">Selesai</span>
                <span v-else-if="item.evaluation_status === 'appealed'" class="text-orange-800 font-bold">Ada Sanggahan</span>
                <span v-else class="text-gray-600">-</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-end mt-12 pr-8 text-center text-xs">
          <div class="w-56">
            <p class="mb-1">Badung, {{ new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
            <p class="mb-16">Mengetahui,<br>CEO PT. Cakra Media Data</p>
            <p class="font-bold underline text-sm">Bapak Khalil</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col md:flex-row gap-3 items-center no-print">
      <!-- Search -->
      <div class="relative w-full md:flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="pi pi-search text-gray-400 text-sm"></i>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama anggota tim..."
          class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
          <i class="pi pi-times text-sm"></i>
        </button>
      </div>

      <!-- Filter Status -->
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm text-gray-500 font-medium whitespace-nowrap">Filter:</span>
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          @click="selectedStatus = opt.value"
          class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
          :class="selectedStatus === opt.value ? opt.activeClass : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- Badge Jumlah -->
      <div class="text-sm text-gray-500 whitespace-nowrap">
        Menampilkan <span class="font-bold text-blue-600">{{ filteredTeam.length }}</span> dari {{ teamMembers.length }}
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden no-print">
      <DataTable 
        :value="filteredTeam" 
        :paginator="true" 
        :rows="10" 
        :rowsPerPageOptions="[5, 10, 20]"
        :loading="isLoading"
        stripedRows 
        responsiveLayout="scroll"
        removableSort
      >
        <template #empty>
            <div class="text-center p-8 text-gray-500">
                <i class="pi pi-users text-4xl mb-2"></i>
                <p>{{ searchQuery || selectedStatus !== 'semua' ? 'Tidak ada data yang cocok dengan filter.' : 'Belum ada anggota tim.' }}</p>
            </div>
        </template>
        
        <Column header="No" style="width: 60px">
          <template #body="{ index }">
            <span class="text-gray-500 text-sm">{{ index + 1 }}.</span>
          </template>
        </Column>

        <Column field="employee_name" header="Nama Pegawai" sortable style="width: 40%">
            <template #body="{ data }">
                <div class="flex items-center cursor-pointer group" @click="$router.push(`/manager/employees/${data.employee_id}`)" title="Klik untuk lihat profil & biodata lengkap">
                    <div class="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 overflow-hidden border border-gray-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                        :class="data.profile_picture_url ? 'bg-white' : 'bg-indigo-100 text-indigo-600'">
                        
                        <img 
                            v-if="data.profile_picture_url" 
                            :src="getProfilePictureUrl(data.profile_picture_url)" 
                            class="w-full h-full object-cover"
                        >
                        <span v-else>{{ data.employee_name.charAt(0) }}</span>
                    </div>
                    <div>
                        <div class="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {{ data.employee_name }}
                            <i class="pi pi-external-link text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                        <div class="text-xs text-gray-500">ID: {{ data.employee_id }}</div>
                    </div>
                </div>
            </template>
        </Column>

        <Column field="evaluation_status" header="Status Penilaian" sortable style="width: 30%">
            <template #body="{ data }">
                <span v-if="data.evaluation_status === 'submitted'" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                    <i class="pi pi-check-circle mr-1 text-[10px]"></i> Selesai
                </span>
                <span v-else-if="data.evaluation_status === 'draft'" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <i class="pi pi-pencil mr-1 text-[10px]"></i> Draft
                </span>
                <span v-else-if="data.evaluation_status === 'appealed'" class="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-300">
                    <i class="pi pi-exclamation-circle mr-1 text-[10px]"></i> Ada Sanggahan
                </span>
                <span v-else class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                    <i class="pi pi-clock mr-1 text-[10px]"></i> Belum Dinilai
                </span>
            </template>
        </Column>

        <Column header="Aksi" style="width: 30%">
            <template #body="{ data }">
                <div class="flex items-center gap-2 flex-wrap">
                    <!-- Tombol Lihat Profil -->
                    <button 
                        @click="$router.push(`/manager/employees/${data.employee_id}`)" 
                        class="bg-gray-100 text-gray-700 hover:bg-gray-200 px-2.5 py-1.5 rounded text-xs font-bold border border-gray-300 transition-colors flex items-center shadow-sm"
                        title="Lihat Biodata, Kontak & Prestasi"
                    >
                        <i class="pi pi-user mr-1"></i> Profil
                    </button>

                    <!-- Jika statusnya Submitted ATAU Appealed, munculkan tombol Lihat Detail -->
                    <button 
                        v-if="data.evaluation_status === 'submitted' || data.evaluation_status === 'appealed'"
                        @click="viewDetail(data)" 
                        class="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded text-xs font-bold border border-green-200 transition-colors flex items-center shadow-sm"
                        :class="data.evaluation_status === 'appealed' ? 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100' : ''"
                    >
                        <i class="pi pi-eye mr-1"></i> {{ data.evaluation_status === 'appealed' ? 'Tinjau Sanggahan' : 'Lihat Rapor' }}
                    </button>

                    <!-- Selain status di atas (Draft / Belum Dibuat), munculkan tombol Mulai/Lanjut Menilai -->
                    <button 
                        v-else
                        @click="handleAssess(data)" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm"
                    >
                        {{ data.evaluation_status === 'draft' ? 'Lanjut Menilai' : 'Mulai Penilaian' }}
                    </button>
                </div>
            </template>
        </Column>

      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { managerService } from '../../services/api'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import { useAuthStore } from '../../stores/auth'
import { generateTeamReportPDF } from '../../utils/teamReportGenerator'

// PrimeVue Imports
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const toast = useToast()
const router = useRouter()
const authStore = useAuthStore()

// Interface TypeScript
interface TeamMember {
  employee_id: number
  employee_name: string
  profile_picture_url?: string 
  evaluation_id?: number | null
  evaluation_status: string 
  total_score?: number
}

const teamMembers = ref<TeamMember[]>([]) 
const isLoading = ref(true)
const searchQuery = ref('')
const selectedStatus = ref('semua')

const isAllEvaluated = computed(() => {
  if (teamMembers.value.length === 0) return false
  return teamMembers.value.every(m => m.evaluation_status === 'submitted' || m.evaluation_status === 'appealed')
})

const evaluatedTeamMembers = computed(() => {
  return teamMembers.value.filter(m => m.evaluation_status === 'submitted' || m.evaluation_status === 'appealed')
})

function getGrade(score: number) {
  if (score >= 86) return 'A'
  if (score >= 71) return 'B'
  if (score >= 56) return 'C'
  if (score >= 41) return 'D'
  return 'E'
}

// Opsi filter status
const filterOptions = [
  { value: 'semua', label: 'Semua', activeClass: 'bg-blue-600 text-white border-blue-600' },
  { value: 'Belum Dibuat', label: 'Belum Dinilai', activeClass: 'bg-gray-600 text-white border-gray-600' },
  { value: 'draft', label: 'Draft', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
  { value: 'submitted', label: 'Selesai', activeClass: 'bg-green-600 text-white border-green-600' },
  { value: 'appealed', label: 'Ada Sanggahan', activeClass: 'bg-orange-500 text-white border-orange-500' },
]

// Computed: hasil filter + search
const filteredTeam = computed(() => {
  let result = teamMembers.value

  // Filter by status
  if (selectedStatus.value !== 'semua') {
    result = result.filter(m => m.evaluation_status === selectedStatus.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(m => m.employee_name.toLowerCase().includes(q))
  }

  return result
})

onMounted(async () => {
  await fetchTeam()
})

async function fetchTeam() {
  isLoading.value = true
  try {
    const response = await managerService.getTeamStatus()
    teamMembers.value = response
  } catch (error: any) {
    console.error(error)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data tim', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

// Fungsi Helper untuk URL Gambar
function getProfilePictureUrl(url: string) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080' 
    return `${baseUrl.replace('/api', '')}${url}`
}

async function handleAssess(item: TeamMember) {
  try {
    if (item.evaluation_status === 'draft' && item.evaluation_id) {
       // Arahkan ke Form Penilaian (AssessmentForm.vue)
       router.push(`/manager/assessment/${item.evaluation_id}`)
    } else {
       // Buat draft baru dulu di backend
       const res = await managerService.startEvaluation({ employee_id: item.employee_id })
       
       const evalId = res.evaluation_id || res.data?.evaluation_id
       
       if (evalId) {
         router.push(`/manager/assessment/${evalId}`)
       } else {
         throw new Error("Gagal mendapatkan ID Evaluasi")
       }
    }
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || "Gagal memulai penilaian", life: 3000 })
  }
}

function viewDetail(item: TeamMember) {
  if (item.evaluation_id) {
    router.push(`/manager/assessment/${item.evaluation_id}`)
  }
}

function printTeamReport() {
  generateTeamReportPDF({
    teamMembers: evaluatedTeamMembers.value,
    managerName: authStore.user?.employee?.name || authStore.user?.username || 'Manajer Tim',
    divisionName: authStore.user?.employee?.position || 'Divisi Tim',
    periodName: 'Periode Penilaian Aktif'
  })
}
</script>

<style scoped>
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm;
  }
  body * {
    visibility: hidden;
  }
  .print-block, .print-block * {
    visibility: visible;
  }
  .print-block {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    display: block !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .no-print {
    display: none !important;
  }
  .shadow-sm {
    box-shadow: none !important;
  }
}
</style>
