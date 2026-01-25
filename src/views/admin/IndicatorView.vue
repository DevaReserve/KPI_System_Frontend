<template>
  <div>
    <Toast />
    
    <ConfirmDialog group="headless">
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm">
                <div class="rounded-full inline-flex justify-center items-center h-20 w-20 -mt-16 border-4 border-white shadow-lg"
                    :class="message.acceptSeverity === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">
                    <i :class="[message.icon, 'text-4xl']"></i>
                </div>
                
                <span class="font-bold text-xl block mb-2 mt-6 text-gray-800">{{ message.header }}</span>
                <p class="mb-6 text-gray-500 text-center leading-relaxed" v-html="message.message"></p>
                
                <div class="flex items-center gap-3 w-full">
                    <button 
                        @click="rejectCallback"
                        class="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        @click="acceptCallback"
                        class="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors shadow-md"
                        :class="message.acceptSeverity === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
                    >
                        {{ message.acceptLabel || 'Ya, Lanjutkan' }}
                    </button>
                </div>
            </div>
        </template>
    </ConfirmDialog>

    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manajemen Indikator KPI</h1>
        <p class="text-gray-500 text-sm">Atur pertanyaan penilaian dan bobot KPI.</p>
      </div>

      <div class="flex gap-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-search text-gray-400"></i>
            </div>
            <input 
                v-model="filters['global'].value" 
                type="text"
                placeholder="Cari Indikator / Target..." 
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
        </div>

        <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shrink-0 whitespace-nowrap">
          <i class="pi pi-plus mr-2"></i>
          Tambah Indikator
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-bold text-gray-700 flex items-center">
            <span class="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            Bobot Indikator UMUM
          </span>
          <span class="text-lg font-extrabold" :class="weightSummary.general > 50 ? 'text-red-600' : 'text-blue-600'">
            {{ weightSummary.general }}%
          </span>
        </div>
        
        <div class="w-full bg-gray-100 rounded-full h-3 mb-2">
          <div class="h-3 rounded-full transition-all duration-500 shadow-sm" 
               :class="weightSummary.general > 50 ? 'bg-red-500' : 'bg-blue-500'" 
               :style="`width: ${Math.min(weightSummary.general, 100)}%`">
          </div>
        </div>
        
        <p class="text-xs text-gray-500 mt-2 flex justify-between">
          <span>Digunakan oleh semua pegawai.</span>
          <span v-if="weightSummary.general > 50" class="text-red-500 font-bold">Terlalu besar! (Saran: 20-30%)</span>
          <span v-else class="text-blue-600 font-medium">Target ideal: 20-30%</span>
        </p>
      </div>

      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 overflow-y-auto max-h-48 custom-scrollbar relative">
        <h4 class="text-sm font-bold text-gray-700 mb-4 sticky top-0 bg-white pb-2 border-b border-gray-50 z-10">
          Total Bobot Akhir (Umum + Spesifik)
        </h4>
        
        <div v-for="(val, divName) in weightSummary.divisions" :key="divName" class="mb-4 last:mb-0">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-semibold text-gray-600">{{ divName }}</span>
            <span class="text-xs font-bold" :class="getTotalColor(val + weightSummary.general)">
              {{ val + weightSummary.general }}%
            </span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="h-2 rounded-full transition-all duration-500" 
                 :class="getTotalBarColor(val + weightSummary.general)" 
                 :style="`width: ${Math.min(val + weightSummary.general, 100)}%`">
            </div>
          </div>
          <p v-if="(val + weightSummary.general) !== 100" class="text-[10px] mt-1 text-right" :class="getTotalColor(val + weightSummary.general)">
            {{ (val + weightSummary.general) < 100 ? 'Kurang ' + (100 - (val + weightSummary.general)) + '%' : 'Kelebihan ' + ((val + weightSummary.general) - 100) + '%' }}
          </p>
        </div>
        
        <div v-if="Object.keys(weightSummary.divisions).length === 0" class="text-center text-xs text-gray-400 py-4 italic">
          Belum ada indikator spesifik divisi.
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable 
        v-model:filters="filters"
        :value="indicators" 
        :paginator="true" 
        :rows="10" 
        :rowsPerPageOptions="[5, 10, 20, 50]" 
        :loading="isLoading"
        dataKey="id"
        :globalFilterFields="['name', 'description', 'division_name', 'indicator_type']"
        stripedRows 
        responsiveLayout="scroll"
        removableSort
        stateStorage="session" 
        stateKey="dt-indicators-state"
      >
        <template #empty>
            <div class="text-center p-8 text-gray-500">
                <i class="pi pi-list text-4xl mb-2"></i>
                <p>Belum ada indikator KPI.</p>
            </div>
        </template>

        <Column field="name" header="Nama Indikator" sortable style="width: 35%">
            <template #body="{ data }">
                <div class="font-bold text-gray-900">{{ data.name }}</div>
                <div class="text-xs text-gray-500 truncate max-w-xs" :title="data.description">
                    {{ data.description }}
                </div>
            </template>
        </Column>

        <Column field="indicator_type" header="Tipe & Target" sortable style="width: 25%">
            <template #body="{ data }">
                <div v-if="data.indicator_type === 'spesifik' && data.division" class="flex flex-col items-start gap-1">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-indigo-50 text-indigo-700 border-indigo-100">
                        {{ data.division.name }}
                    </span>
                </div>
                <div v-else>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-100">
                        UMUM (Semua Divisi)
                    </span>
                </div>
            </template>
        </Column>

        <Column field="weight" header="Bobot" sortable style="width: 15%">
            <template #body="{ data }">
                <span class="font-mono font-bold text-gray-800 text-lg">{{ data.weight }}%</span>
            </template>
        </Column>

        <Column header="Aksi" style="width: 15%">
            <template #body="{ data }">
                <div class="flex items-center gap-2">
                    <button @click="openModal(data)" class="p-1 text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">
                        <i class="pi pi-pencil"></i>
                    </button>
                    <button @click="confirmDelete(data)" class="p-1 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                        <i class="pi pi-trash"></i>
                    </button>
                </div>
            </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white px-6 pt-6 pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-5 border-b pb-3">{{ isEditing ? 'Edit Indikator' : 'Tambah Indikator' }}</h3>
            <form @submit.prevent="saveInd">
              
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Nama Indikator</label>
                <input v-model="form.name" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required placeholder="Contoh: Kedisiplinan">
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Deskripsi / Materi Penilaian</label>
                <textarea v-model="form.description" rows="3" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Jelaskan apa yang dinilai di sini..."></textarea>
                <p class="text-xs text-gray-400 mt-1 italic">Teks ini akan muncul sebagai panduan saat Manager melakukan penilaian.</p>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Tipe</label>
                  <select v-model="form.indicator_type" class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="umum">Umum</option>
                    <option value="spesifik">Spesifik Divisi</option>
                  </select>
                </div>
                
                <div>
                  <label class="text-sm font-medium mb-1 flex items-center group relative cursor-help w-fit">
                    Bobot (%) 
                    <svg class="w-4 h-4 ml-1 text-gray-400 hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                      Total bobot (Umum + Spesifik) harus 100% per divisi.
                    </span>
                  </label>
                  <input v-model.number="form.weight" type="number" min="1" max="100" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                </div>
              </div>

              <div v-if="form.indicator_type === 'spesifik'" class="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label class="block text-sm font-medium mb-1">Target Divisi</label>
                <select v-model="form.division_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option :value="null" disabled>Pilih Divisi</option>
                  <option v-for="div in divisions" :key="div.id" :value="div.id">{{ div.name }}</option>
                </select>
              </div>

              <div class="mt-6 flex justify-end gap-3 pt-3 border-t">
                <button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { indicatorService, divisionService } from '../../services/api'

// PrimeVue Imports
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const toast = useToast()
const confirm = useConfirm()

const indicators = ref<any[]>([])
const divisions = ref<any[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)

// Filter State
const filters = ref({
    global: { value: '', matchMode: 'contains' }, 
});

const form = reactive({
  id: 0, name: '', description: '', indicator_type: 'umum', weight: 0, division_id: null as number | null
})

// --- LOGIC CALCULATOR ---
const weightSummary = computed(() => {
  let general = 0
  const divs: Record<string, number> = {}

  divisions.value.forEach(d => {
    if (d.name !== 'Board of Directors') {
      divs[d.name] = 0
    }
  })

  indicators.value.forEach(ind => {
    if (ind.indicator_type === 'umum') {
      general += ind.weight
    } else if (ind.division && ind.division.name) {
      const dName = ind.division.name
      if (divs[dName] !== undefined) {
        divs[dName] += ind.weight
      }
    }
  })
  return { general, divisions: divs }
})

// Warna Text
function getTotalColor(val: number) {
  if (val === 100) return 'text-green-600'
  if (val > 100) return 'text-red-600'
  return 'text-orange-500'
}

// Warna Bar
function getTotalBarColor(val: number) {
  if (val === 100) return 'bg-green-500'
  if (val > 100) return 'bg-red-500'
  return 'bg-orange-400'
}
// ------------------------

onMounted(fetchData)

async function fetchData() {
  isLoading.value = true
  try {
    const [indData, divData] = await Promise.all([
      indicatorService.getAll(),
      divisionService.getAll()
    ])
    
    // Flatten Data agar Search Bar bisa baca 'division_name'
    indicators.value = indData.map((item: any) => ({
        ...item,
        division_name: item.division ? item.division.name : '-' 
    }))

    divisions.value = divData
  } catch (e) { 
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data', life: 3000 })
  } 
  finally { isLoading.value = false }
}

function openModal(item?: any) {
  isEditing.value = !!item
  showModal.value = true
  if (item) {
    Object.assign(form, {
      id: item.id, name: item.name, description: item.description,
      indicator_type: item.indicator_type, weight: item.weight,
      division_id: item.division_id || null
    })
  } else {
    Object.assign(form, { id: 0, name: '', description: '', indicator_type: 'umum', weight: 0, division_id: null })
  }
}

function closeModal() {
    showModal.value = false
}

async function saveInd() {
  try {
    const payload = { ...form }
    if (payload.indicator_type === 'umum') payload.division_id = null
    else payload.division_id = Number(payload.division_id)

    if (isEditing.value) {
      await indicatorService.update(form.id, payload)
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Indikator diperbarui', life: 3000 })
    } else {
      await indicatorService.create(payload)
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Indikator ditambahkan', life: 3000 })
    }
    fetchData()
    showModal.value = false
  } catch (e) { 
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menyimpan indikator', life: 3000 })
  }
}

function confirmDelete(item: any) {
  confirm.require({
    group: 'headless',
    header: 'Hapus Indikator?',
    message: `Hapus indikator <strong>${item.name}</strong>? Data tidak dapat dikembalikan.`,
    icon: 'pi pi-trash',
    acceptLabel: 'Hapus',
    acceptSeverity: 'danger',
    accept: async () => {
      try {
        await indicatorService.delete(item.id)
        await fetchData()
        toast.add({ severity: 'success', summary: 'Terhapus', detail: 'Indikator berhasil dihapus', life: 3000 })
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus indikator', life: 3000 })
      }
    }
  }as any)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
</style>
