<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Manajemen Jabatan</h1>
      <button 
        @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Tambah Jabatan
      </button>
    </div>

    <DataTable :columns="columns" :data="positions" :loading="isLoading">
      <template #name="{ value }">
        <span class="font-bold text-gray-900">{{ value }}</span>
      </template>
      
      <template #division_name="{ item }">
        <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
          {{ item.division?.name || '-' }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center gap-4">
          <button @click="openModal(item)" class="text-indigo-600 hover:text-indigo-900 font-medium transition-colors">Edit</button>
          <button @click="deletePos(item.id)" class="text-red-600 hover:text-red-900 font-medium transition-colors">Hapus</button>
        </div>
      </template>
    </DataTable>

    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showModal = false"></div>

        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white px-6 pt-6 pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6 border-b pb-4">
              {{ isEditing ? 'Edit Jabatan' : 'Tambah Jabatan' }}
            </h3>
            
            <form @submit.prevent="savePos">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                <select v-model="form.division_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="" disabled>Pilih Divisi</option>
                  <option v-for="div in divisions" :key="div.id" :value="div.id">{{ div.name }}</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Jabatan</label>
                <input v-model="form.name" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Senior Developer">
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea v-model="form.description" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              <div class="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
                <button 
                  type="button" 
                  @click="showModal = false" 
                  class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  class="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors"
                >
                  Simpan
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
import { positionService, divisionService } from '../../services/api'
import DataTable from '../../components/ui/DataTable.vue'

// PERBAIKAN: Gunakan ref<any[]> agar TypeScript tidak menganggapnya array kosong permanen
const positions = ref<any[]>([])
const divisions = ref<any[]>([]) 
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)

// Form State
const form = reactive({ id: 0, name: '', description: '', division_id: '' as string | number })

// Columns Definition
const columns = [
  { key: 'name', label: 'Nama Jabatan' },
  { key: 'division_name', label: 'Divisi' },
  { key: 'description', label: 'Deskripsi' }
]

onMounted(fetchData)

async function fetchData() {
  isLoading.value = true
  try {
    const [posData, divData] = await Promise.all([
      positionService.getAll(),
      divisionService.getAll()
    ])
    positions.value = posData
    divisions.value = divData
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function openModal(item?: any) {
  isEditing.value = !!item
  showModal.value = true
  if (item) {
    form.id = item.id
    form.name = item.name
    form.description = item.description
    form.division_id = item.division_id
  } else {
    Object.assign(form, { id: 0, name: '', description: '', division_id: '' })
  }
}

async function savePos() {
  try {
    const payload = { ...form, division_id: Number(form.division_id) }
    
    if (isEditing.value) {
      await positionService.update(form.id, payload)
    } else {
      await positionService.create(payload)
    }
    
    await fetchData()
    showModal.value = false
  } catch (e) {
    alert('Gagal menyimpan data')
  }
}

async function deletePos(id: number) {
  if (confirm('Apakah Anda yakin ingin menghapus jabatan ini?')) {
    await positionService.delete(id)
    await fetchData()
  }
}
</script>
