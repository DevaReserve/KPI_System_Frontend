<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Manajemen Divisi</h1>
      <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Tambah Divisi
      </button>
    </div>

    <DataTable :columns="tableColumns" :data="divisions" :loading="isLoading">
      
      <template #name="{ value }">
        <span class="font-bold text-gray-900">{{ value }}</span>
      </template>

      <template #manager_name="{ value }">
        <span v-if="value" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {{ value }}
        </span>
        <span v-else class="text-gray-400 italic text-xs">Belum ada</span>
      </template>

      <template #actions="{ item }">
        <button @click="openModal(item)" class="text-indigo-600 hover:text-indigo-900 font-medium transition-colors">Edit</button>
        <button @click="deleteDivision(item.id)" class="text-red-600 hover:text-red-900 font-medium transition-colors">Hapus</button>
      </template>

    </DataTable>

    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
       <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white px-6 pt-6 pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-5">{{ isEditing ? 'Edit Divisi' : 'Tambah Divisi Baru' }}</h3>
            <form @submit.prevent="saveDivision">
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Divisi</label>
                <input v-model="form.name" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea v-model="form.description" rows="3" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Kepala Divisi (Manager)</label>
                <select v-model="form.manager_id" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option :value="null">-- Belum Ada --</option>
                  <option v-for="emp in potentialManagers" :key="emp.id" :value="emp.id">
                    {{ emp.name }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Hanya pegawai dengan jabatan 'Manager' yang muncul disini.</p>
              </div>

              <div class="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" @click="closeModal" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">Batal</button>
                <button type="submit" class="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:text-sm">{{ isProcessing ? 'Menyimpan...' : 'Simpan' }}</button>
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
import { divisionService, employeeService } from '../../services/api' // Import employeeService juga
import DataTable from '../../components/ui/DataTable.vue'

const tableColumns = [
  { key: 'name', label: 'Nama Divisi' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'manager_name', label: 'Manager' },
]

const divisions = ref<any[]>([])
const allEmployees = ref<any[]>([]) // Simpan semua pegawai
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const isProcessing = ref(false)

const form = reactive({ id: 0, name: '', description: '', manager_id: null as number | null })

// Computed: Filter pegawai yang cocok jadi Manager
const potentialManagers = computed(() => {
  return allEmployees.value.filter(e => 
    // Filter berdasarkan role manager ATAU posisi yang mengandung kata "Manager"
    e.role === 'manager' || (e.position && e.position.toLowerCase().includes('manager'))
  )
})

onMounted(async () => { await fetchData() })

async function fetchData() {
  try {
    isLoading.value = true
    // Ambil data Divisi DAN Pegawai secara paralel
    const [divData, empData] = await Promise.all([
      divisionService.getAll(),
      employeeService.getAll()
    ])
    
    divisions.value = divData
    allEmployees.value = empData

    // Mapping nama manager ke data divisi (karena backend mungkin cuma kirim ID)
    divisions.value = divisions.value.map(div => {
      const mgr = allEmployees.value.find(e => e.id === div.manager_id)
      return {
        ...div,
        manager_name: mgr ? mgr.name : null
      }
    })

  } catch (error) { alert('Gagal mengambil data') } 
  finally { isLoading.value = false }
}

function openModal(division?: any) {
  if (division) {
    isEditing.value = true
    form.id = division.id
    form.name = division.name
    form.description = division.description
    form.manager_id = division.manager_id || null
  } else {
    isEditing.value = false
    Object.assign(form, { id: 0, name: '', description: '', manager_id: null })
  }
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function saveDivision() {
  try {
    isProcessing.value = true
    
    const payload = { 
      name: form.name, 
      description: form.description,
      manager_id: form.manager_id ? Number(form.manager_id) : undefined 
    }
    
    if (isEditing.value) {
      // Gunakan 'as any' jika TypeScript masih rewel soal tipe data Partial<Division>
      await divisionService.update(form.id, payload as any)
    } else {
      await divisionService.create(payload as any)
    }
    
    await fetchData() // Refresh data
    closeModal()
  } catch (error: any) { 
    console.error(error)
    alert(error.response?.data?.message || 'Gagal menyimpan data') 
  } finally { 
    isProcessing.value = false 
  }
}

async function deleteDivision(id: number) {
  if (confirm('Hapus divisi ini?')) {
    try { await divisionService.delete(id); await fetchData() } 
    catch (error: any) { alert('Gagal menghapus data') }
  }
}
</script>
