<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { positionService, divisionService } from '../../services/api'
import DataTable from '../../components/ui/DataTable.vue'

// FIX: Gunakan any[]
const positions = ref<any[]>([]) 
const divisions = ref<any[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)

const form = reactive({ id: 0, name: '', description: '', division_id: '' as string | number })

const columns = [
  { key: 'name', label: 'Nama Jabatan' },
  { key: 'division_name', label: 'Divisi' },
  { key: 'description', label: 'Deskripsi' }
]

onMounted(async () => {
  isLoading.value = true
  try {
    const [posData, divData] = await Promise.all([
      positionService.getAll(),
      divisionService.getAll()
    ])
    positions.value = posData
    divisions.value = divData
  } catch (e) { console.error(e) } 
  finally { isLoading.value = false }
})

// Fungsi openModal dipanggil di template
function openModal(item?: any) {
  isEditing.value = !!item
  showModal.value = true
  if (item) {
    form.id = item.id
    form.name = item.name
    form.description = item.description
    // Handle division_id jika object atau id langsung
    form.division_id = item.division_id || (item.division ? item.division.id : '')
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
    // Refresh data
    const posData = await positionService.getAll()
    positions.value = posData
    showModal.value = false
  } catch (e) { alert('Gagal menyimpan') }
}

// Fungsi deletePos dipanggil di template
async function deletePos(id: number) {
  if (confirm('Hapus jabatan?')) { 
    await positionService.delete(id)
    const posData = await positionService.getAll()
    positions.value = posData
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Manajemen Jabatan</h1>
      <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
        Tambah Jabatan
      </button>
    </div>

    <DataTable :columns="columns" :data="positions" :loading="isLoading">
      <template #name="{ value }"><span class="font-bold text-gray-900">{{ value }}</span></template>
      <template #division_name="{ item }">
        <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{{ item.division?.name || '-' }}</span>
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
                    <h3 class="text-lg font-bold text-gray-900 mb-6">{{ isEditing ? 'Edit Jabatan' : 'Tambah Jabatan' }}</h3>
                    <form @submit.prevent="savePos">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                            <select v-model="form.division_id" required class="w-full border rounded-lg px-3 py-2">
                                <option value="" disabled>Pilih Divisi</option>
                                <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.name }}</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Jabatan</label>
                            <input v-model="form.name" required class="w-full border rounded-lg px-3 py-2">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                            <textarea v-model="form.description" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
                        </div>
                        <div class="flex justify-end gap-2">
                            <button type="button" @click="showModal=false" class="px-4 py-2 border rounded-lg">Batal</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
