<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Periode Evaluasi</h1>
      <button 
        @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Buat Periode Baru
      </button>
    </div>

    <DataTable :columns="tableColumns" :data="periods" :loading="isLoading">
      
      <template #name="{ item }">
        <span class="font-bold text-gray-900">{{ item.name }}</span>
      </template>

      <template #start_date="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #end_date="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #is_active="{ value }">
        <span v-if="value" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
          SEDANG AKTIF
        </span>
        <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
          Tidak Aktif
        </span>
      </template>

      <template #actions="{ item }">
        
        <button 
          v-if="!item.is_active" 
          @click="activatePeriod(item.id)" 
          class="text-green-600 hover:text-green-900 font-bold transition-colors text-xs uppercase tracking-wide border border-green-200 px-2 py-1 rounded bg-green-50 hover:bg-green-100"
        >
          Set Aktif
        </button>

        <button @click="openModal(item)" class="text-indigo-600 hover:text-indigo-900 font-medium transition-colors">Edit</button>
        <button @click="deletePeriod(item.id)" class="text-red-600 hover:text-red-900 font-medium transition-colors">Hapus</button>
      </template>

    </DataTable>

    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white px-6 pt-6 pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6 border-b pb-4">
              {{ isEditing ? 'Edit Periode' : 'Buat Periode Baru' }}
            </h3>
            
            <form @submit.prevent="savePeriod">
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Periode</label>
                <input v-model="form.name" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Penilaian Q1 2025">
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                  <input v-model="form.start_date" type="date" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                  <input v-model="form.end_date" type="date" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
              </div>

              <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                <p class="text-xs text-blue-700">
                  <span class="font-bold">Catatan:</span> Periode baru secara default berstatus "Tidak Aktif". Anda dapat mengaktifkannya melalui tombol di tabel setelah disimpan.
                </p>
              </div>

              <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
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
import { periodService } from '../../services/api'
import DataTable from '../../components/ui/DataTable.vue'
import type { EvaluationPeriod } from '../../types'

// Setup Table
const tableColumns = [
  { key: 'name', label: 'Nama Periode' },
  { key: 'start_date', label: 'Mulai' },
  { key: 'end_date', label: 'Selesai' },
  { key: 'is_active', label: 'Status' },
]

const periods = ref<EvaluationPeriod[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const isProcessing = ref(false)

const form = reactive({
  id: 0,
  name: '',
  start_date: '',
  end_date: ''
})

onMounted(async () => {
  await fetchPeriods()
})

async function fetchPeriods() {
  isLoading.value = true
  try {
    periods.value = await periodService.getAll()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// Helper Format Tanggal (DD/MM/YYYY)
function formatDate(dateString: string) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date)
}

function openModal(item?: any) {
  if (item) {
    isEditing.value = true
    form.id = item.id
    form.name = item.name
    // Format tanggal agar masuk ke input type="date" (YYYY-MM-DD)
    form.start_date = item.start_date.split('T')[0]
    form.end_date = item.end_date.split('T')[0]
  } else {
    isEditing.value = false
    Object.assign(form, { id: 0, name: '', start_date: '', end_date: '' })
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function savePeriod() {
  try {
    isProcessing.value = true
    
    // Konversi ke ISO String (Backend butuh time.Time)
    const payload = {
      name: form.name,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString()
    }

    if (isEditing.value) {
      await periodService.update(form.id, payload)
    } else {
      await periodService.create(payload)
    }
    
    await fetchPeriods()
    closeModal()
  } catch (error: any) {
    alert(error.response?.data?.message || 'Gagal menyimpan periode')
  } finally {
    isProcessing.value = false
  }
}

async function activatePeriod(id: number) {
  if (confirm('Aktifkan periode ini? Periode lain yang sedang aktif akan otomatis dinonaktifkan.')) {
    try {
      await periodService.activate(id)
      await fetchPeriods() // Refresh untuk melihat perubahan status
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengaktifkan periode')
    }
  }
}

async function deletePeriod(id: number) {
  if (confirm('Hapus periode ini? Data penilaian di dalamnya mungkin akan hilang.')) {
    try {
      await periodService.delete(id)
      await fetchPeriods()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus periode')
    }
  }
}
</script>
