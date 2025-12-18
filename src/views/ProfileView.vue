<template>
  <div>
    <Toast />

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Profil Saya</h1>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      <div class="flex border-b border-gray-200 overflow-x-auto">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap focus:outline-none"
          :class="activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="p-6">
        
        <div v-if="activeTab === 'biodata'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="col-span-1 text-center lg:border-r lg:border-gray-100 lg:pr-8">
            <div class="h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-4xl mx-auto mb-4 border-4 border-white shadow-md">
              {{ userProfile?.employee?.name?.charAt(0) || 'U' }}
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-1">{{ userProfile?.employee?.name }}</h2>
            <p class="text-sm text-gray-500 mb-3">{{ userProfile?.email }}</p>
            <span class="inline-block bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
              {{ userProfile?.role }}
            </span>
          </div>

          <div class="col-span-1 lg:col-span-2 space-y-6">
            
            <div>
              <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Data Diri</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <label class="text-xs text-gray-500 block mb-1">NIP</label>
                  <p class="font-medium text-gray-900">{{ userProfile?.employee?.nip || '-' }}</p>
                </div>
                <div>
                  <label class="text-xs text-gray-500 block mb-1">Status Akun</label>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Aktif
                  </span>
                </div>
                <div>
                  <label class="text-xs text-gray-500 block mb-1">No. HP</label>
                  <p class="font-medium text-gray-400 italic">(Belum tersedia)</p>
                </div>
                <div>
                  <label class="text-xs text-gray-500 block mb-1">Alamat Domisili</label>
                  <p class="font-medium text-gray-400 italic">(Belum tersedia)</p>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 mt-2">Informasi Pekerjaan</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <label class="text-xs text-gray-500 block mb-1">Divisi</label>
                  <p class="font-bold text-gray-800">{{ userProfile?.employee?.division?.name || '-' }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <label class="text-xs text-gray-500 block mb-1">Jabatan</label>
                  <p class="font-bold text-gray-800">{{ userProfile?.employee?.position || '-' }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <label class="text-xs text-gray-500 block mb-1">Atasan Langsung</label>
                  <p class="font-bold text-gray-800">
                     {{ userProfile?.employee?.direct_supervisor_id ? 'ID: ' + userProfile.employee.direct_supervisor_id : '-' }}
                  </p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <label class="text-xs text-gray-500 block mb-1">Tanggal Bergabung</label>
                  <p class="font-bold text-gray-800">{{ formatDate(userProfile?.employee?.join_date) }}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div v-if="activeTab === 'history'">
          <div v-if="chartSeries.length > 0 && chartSeries[0].data.length > 0">
            <div class="mb-8">
              <div class="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">Grafik Tren Kinerja</h3>
                <apexchart type="area" height="300" :options="chartOptions" :series="chartSeries"></apexchart>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-bold text-gray-800 mb-4">Riwayat Penilaian</h3>
              <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Periode</th>
                      <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                      <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Skor Akhir</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="h in historyData" :key="h.id" class="hover:bg-gray-50 transition">
                      <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ h.period_name || 'Periode #' + h.period_id }}</td>
                      <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(h.submitted_at) }}</td>
                      <td class="px-6 py-4 text-sm text-right font-bold text-blue-600">{{ h.total_score.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <p class="font-medium">Belum ada riwayat penilaian kinerja yang tersedia.</p>
          </div>
        </div>

        <div v-if="activeTab === 'security'">
          <div class="max-w-xl mx-auto">
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <i class="pi pi-info-circle text-yellow-500 text-xl"></i>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-yellow-700">
                    Gunakan password yang kuat (minimal 6 karakter) untuk menjaga keamanan akun Anda.
                  </p>
                </div>
              </div>
            </div>

            <form @submit.prevent="updatePassword" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                <input v-model="passForm.old_password" type="password" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Masukkan password saat ini">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input v-model="passForm.new_password" type="password" required minlength="6" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Minimal 6 karakter">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input v-model="passForm.confirm_password" type="password" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Ulangi password baru">
              </div>

              <div class="pt-4">
                <button 
                  type="submit" 
                  :disabled="isLoading"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  <i v-if="isLoading" class="pi pi-spin pi-spinner"></i>
                  {{ isLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { authService, myPerformanceService } from '../services/api'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'

const toast = useToast()

// UPDATE TABS: Gabungkan Umum & Pekerjaan jadi Biodata
const tabs = [
  { id: 'biodata', name: 'Biodata' },
  { id: 'history', name: 'Riwayat Kinerja' },
  { id: 'security', name: 'Keamanan' }
]

const activeTab = ref('biodata')
const userProfile = ref<any>(null)
const historyData = ref<any[]>([])
const isLoading = ref(false)

// Chart Config
const chartSeries = ref<any[]>([])
const chartOptions = reactive({
  chart: { id: 'history-chart', toolbar: { show: false }, fontFamily: 'inherit' },
  xaxis: { categories: [] as string[] },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#3b82f6'],
  dataLabels: { enabled: true },
  markers: { size: 6, hover: { size: 8 } },
  grid: { borderColor: '#f3f4f6' }
})

// Password Form
const passForm = reactive({ old_password: '', new_password: '', confirm_password: '' })

onMounted(async () => {
  try { 
    // Load Profile
    userProfile.value = await authService.getProfile() 
    
    // Load History untuk Grafik
    const history = await myPerformanceService.getHistory()
    if (history) {
      historyData.value = history
      
      const sortedHistory = [...history].reverse()
      
      chartOptions.xaxis = {
        categories: sortedHistory.map((h: any) => h.period_name || h.submitted_at.split('T')[0])
      }
      
      chartSeries.value = [{
        name: 'Total Skor',
        data: sortedHistory.map((h: any) => h.total_score)
      }]
    }
  } catch (e) { console.error(e) }
})

function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(dateString))
}

async function updatePassword() {
  if (passForm.new_password !== passForm.confirm_password) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Konfirmasi password tidak cocok', life: 3000 })
    return
  }

  try {
    isLoading.value = true
    await authService.changePassword({
      old_password: passForm.old_password,
      new_password: passForm.new_password
    })
    
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Password berhasil diubah. Silakan login ulang nanti.', life: 5000 })
    
    // Reset Form
    passForm.old_password = ''
    passForm.new_password = ''
    passForm.confirm_password = ''
    
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal mengubah password', life: 3000 })
  } finally {
    isLoading.value = false
  }
}
</script>
