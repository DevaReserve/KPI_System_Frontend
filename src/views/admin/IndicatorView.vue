<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Indikator Penilaian (KPI)</h1>
      <button 
        @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Tambah Indikator
      </button>
    </div>

    <DataTable :columns="tableColumns" :data="indicators" :loading="isLoading">
      
      <template #name="{ item }">
        <div>
          <div class="text-sm font-bold text-gray-900">{{ item.name }}</div>
          <div class="text-xs text-gray-500 max-w-xs truncate">{{ item.description }}</div>
        </div>
      </template>

      <template #indicator_type="{ value }">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase" 
          :class="value === 'umum' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'">
          {{ value }}
        </span>
      </template>

      <template #weight="{ value }">
        <span class="font-mono font-bold text-gray-700">{{ value }}%</span>
      </template>

      <template #division="{ item }">
        <span v-if="item.indicator_type === 'spesifik' && item.division" class="text-sm text-gray-700">
          {{ item.division.name }}
        </span>
        <span v-else class="text-xs text-gray-400 italic">Berlaku Semua</span>
      </template>

      <template #actions="{ item }">
        <button @click="openModal(item)" class="text-indigo-600 hover:text-indigo-900 font-medium transition-colors">Edit</button>
        <button @click="deleteIndicator(item.id)" class="text-red-600 hover:text-red-900 font-medium transition-colors">Hapus</button>
      </template>

    </DataTable>

    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white px-6 pt-6 pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6 border-b pb-4">
              {{ isEditing ? 'Edit Indikator' : 'Tambah Indikator Baru' }}
            </h3>
            
            <form @submit.prevent="saveIndicator">
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul Indikator</label>
                <input v-model="form.name" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Kedisiplinan">
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Penilaian</label>
                <textarea v-model="form.description" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jelaskan kriteria penilaian..."></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Indikator</label>
                  <select v-model="form.indicator_type" @change="handleTypeChange" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="umum">Umum (Semua)</option>
                    <option value="spesifik">Spesifik (Per Divisi)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Bobot (%)</label>
                  <div class="relative">
                    <input v-model.number="form.weight" type="number" min="1" max="100" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
                    <span class="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                  </div>
                </div>
              </div>

              <div v-if="form.indicator_type === 'spesifik'" class="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Divisi</label>
                <select v-model="form.division_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="" disabled>Pilih Divisi Target</option>
                  <option v-for="div in divisions" :key="div.id" :value="div.id">{{ div.name }}</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Indikator ini hanya akan muncul untuk pegawai di divisi ini.</p>
              </div>

              <div class="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" @click="closeModal" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm">
                  Batal
                </button>
                <button type="submit" class="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm">
                  {{ isProcessing ? 'Menyimpan...' : 'Simpan' }}
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
import { indicatorService, divisionService } from '../../services/api'
import DataTable from '../../components/ui/DataTable.vue'
import type { Division, PerformanceIndicator } from '../../types'

// Setup Table
const tableColumns = [
  { key: 'name', label: 'Indikator' },
  { key: 'indicator_type', label: 'Tipe' },
  { key: 'division', label: 'Target Divisi' }, // Menggunakan 'division' agar masuk ke slot
  { key: 'weight', label: 'Bobot' },
]

const indicators = ref<PerformanceIndicator[]>([])
const divisions = ref<Division[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const isProcessing = ref(false)

const form = reactive({
  id: 0,
  name: '',
  description: '',
  indicator_type: 'umum',
  weight: 0,
  division_id: '' as string | number
})

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  isLoading.value = true
  try {
    const [inds, divs] = await Promise.all([
      indicatorService.getAll(),
      divisionService.getAll()
    ])
    indicators.value = inds
    divisions.value = divs
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// Logic Ganti Tipe
function handleTypeChange() {
  if (form.indicator_type === 'umum') {
    form.division_id = '' // Reset divisi jika umum
  }
}

function openModal(item?: any) {
  if (item) {
    isEditing.value = true
    form.id = item.id
    form.name = item.name
    form.description = item.description
    form.indicator_type = item.indicator_type
    form.weight = item.weight
    // Backend mungkin kirim division_id null, handle agar select tidak error
    form.division_id = item.division_id || '' 
  } else {
    isEditing.value = false
    Object.assign(form, {
      id: 0, name: '', description: '', indicator_type: 'umum', weight: 0, division_id: ''
    })
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function saveIndicator() {
  try {
    isProcessing.value = true
    
    // Siapkan payload
    const payload: any = {
      name: form.name,
      description: form.description,
      indicator_type: form.indicator_type,
      weight: Number(form.weight)
    }

    // Hanya kirim division_id jika tipe spesifik
    if (form.indicator_type === 'spesifik') {
      payload.division_id = Number(form.division_id)
    } else {
      payload.division_id = null
    }

    if (isEditing.value) {
      await indicatorService.update(form.id, payload)
    } else {
      await indicatorService.create(payload)
    }
    
    await fetchData()
    closeModal()
  } catch (error: any) {
    // Backend mungkin menolak jika Total Bobot > 100%
    alert(error.response?.data?.message || 'Gagal menyimpan indikator')
  } finally {
    isProcessing.value = false
  }
}

async function deleteIndicator(id: number) {
  if (confirm('Hapus indikator ini?')) {
    try {
      await indicatorService.delete(id)
      await fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus data')
    }
  }
}
</script>
